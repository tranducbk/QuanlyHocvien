$ErrorActionPreference = 'Stop'
$PSNativeCommandUseErrorActionPreference = $false

$containerName = 'qlhv-training-program-test-' + [guid]::NewGuid().ToString('N').Substring(0, 8)
$databaseName = 'qlhv_training_test'
$databaseUser = 'qlhv_test'
$databasePassword = [guid]::NewGuid().ToString('N')

docker run --detach --name $containerName `
  --publish '127.0.0.1::5432' `
  --env "POSTGRES_DB=$databaseName" `
  --env "POSTGRES_USER=$databaseUser" `
  --env "POSTGRES_PASSWORD=$databasePassword" `
  postgres:16 | Out-Null
if ($LASTEXITCODE -ne 0) { throw 'Could not start the isolated PostgreSQL test container.' }

$publishedPort = @(docker port $containerName '5432/tcp')
if ($LASTEXITCODE -ne 0 -or $publishedPort.Count -ne 1 -or $publishedPort[0] -notmatch '^127\.0\.0\.1:(\d+)$') {
  throw 'Could not determine the isolated PostgreSQL test port.'
}
$testPort = [int]$Matches[1]

$ready = $false
for ($attempt = 0; $attempt -lt 30; $attempt++) {
  docker exec $containerName pg_isready --username $databaseUser --dbname $databaseName *> $null
  if ($LASTEXITCODE -eq 0) {
    $ready = $true
    break
  }
  Start-Sleep -Seconds 1
}
if (-not $ready) { throw 'The test database did not become ready. The test container was left in place for inspection.' }

docker exec $containerName psql --username $databaseUser --dbname $databaseName `
  --set ON_ERROR_STOP=1 --command 'CREATE TABLE training_systems (id UUID PRIMARY KEY DEFAULT gen_random_uuid())' | Out-Null
if ($LASTEXITCODE -ne 0) { throw 'Could not create the minimal prerequisite table in the test database.' }

$previousDatabaseUrl = [Environment]::GetEnvironmentVariable('DATABASE_URL', 'Process')
$previousDbSsl = [Environment]::GetEnvironmentVariable('DB_SSL', 'Process')
$previousLocation = Get-Location
try {
  [Environment]::SetEnvironmentVariable('DATABASE_URL', "postgresql://${databaseUser}:${databasePassword}@127.0.0.1:$testPort/$databaseName", 'Process')
  [Environment]::SetEnvironmentVariable('DB_SSL', 'false', 'Process')
  Set-Location (Join-Path $PSScriptRoot '..')

  Write-Host 'Before migration (isolated test database):'
  node src/utils/migrateTrainingPrograms.js --report
  if ($LASTEXITCODE -ne 0) { throw 'The pre-migration report failed.' }

  Write-Host 'Applying migration to the isolated test database:'
  node src/utils/migrateTrainingPrograms.js --apply
  if ($LASTEXITCODE -ne 0) { throw 'The test migration failed.' }

  Write-Host 'After migration (isolated test database):'
  node src/utils/migrateTrainingPrograms.js --report
  if ($LASTEXITCODE -ne 0) { throw 'The post-migration report failed.' }
} finally {
  Set-Location $previousLocation
  [Environment]::SetEnvironmentVariable('DATABASE_URL', $previousDatabaseUrl, 'Process')
  [Environment]::SetEnvironmentVariable('DB_SSL', $previousDbSsl, 'Process')
}

Write-Host "Test completed. Isolated container: $containerName. The active database was not used."
