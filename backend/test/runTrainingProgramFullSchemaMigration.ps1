param(
  [Parameter(Mandatory = $true)]
  [ValidatePattern('^qlhv-training-program-test-[0-9a-f]{8}$')]
  [string]$ContainerName,
  [Parameter(Mandatory = $true)]
  [ValidatePattern('^qlhv_scope_test_[0-9a-f]{8}$')]
  [string]$SourceDatabase
)

$ErrorActionPreference = 'Stop'
$PSNativeCommandUseErrorActionPreference = $false

$image = docker inspect --format '{{.Config.Image}}' $ContainerName
if ($LASTEXITCODE -ne 0 -or $image -ne 'postgres:16') {
  throw 'The named container is not the expected PostgreSQL test container.'
}
$publishedPort = @(docker port $ContainerName '5432/tcp')
if ($LASTEXITCODE -ne 0 -or $publishedPort.Count -ne 1 -or $publishedPort[0] -notmatch '^127\.0\.0\.1:(\d+)$') {
  throw 'The test container must expose PostgreSQL on one localhost port.'
}
$testPort = [int]$Matches[1]
$sourceExists = docker exec $ContainerName psql --username qlhv_test --dbname postgres `
  --tuples-only --no-align --command "SELECT 1 FROM pg_database WHERE datname = '$SourceDatabase'"
if ($LASTEXITCODE -ne 0 -or $sourceExists -ne '1') {
  throw 'The isolated source database does not exist.'
}

$databaseName = 'qlhv_training_full_' + [guid]::NewGuid().ToString('N').Substring(0, 8)
$archivePath = "/tmp/$databaseName.dump"
$databasePassword = docker exec $ContainerName printenv POSTGRES_PASSWORD
if ($LASTEXITCODE -ne 0 -or -not $databasePassword) {
  throw 'Could not read test database credentials.'
}

docker exec $ContainerName pg_dump --username qlhv_test --dbname $SourceDatabase `
  --format custom --no-owner --no-privileges `
  --exclude-table public.training_programs `
  --exclude-table public.curriculum_versions `
  --file $archivePath
if ($LASTEXITCODE -ne 0) { throw 'Could not archive the isolated source database.' }

docker exec $ContainerName createdb --username qlhv_test $databaseName
if ($LASTEXITCODE -ne 0) { throw 'Could not create the isolated full-schema test database.' }

docker exec $ContainerName pg_restore --username qlhv_test --dbname $databaseName `
  --no-owner --no-privileges --exit-on-error $archivePath
if ($LASTEXITCODE -ne 0) {
  throw "Could not restore the isolated full-schema test database $databaseName. It was left in place for inspection."
}

$tableCountBefore = docker exec $ContainerName psql --username qlhv_test --dbname $databaseName `
  --tuples-only --no-align --command "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'"
if ($LASTEXITCODE -ne 0 -or [int]$tableCountBefore -lt 10) {
  throw 'The restored database does not contain the expected application schema.'
}
$newTableCountBefore = docker exec $ContainerName psql --username qlhv_test --dbname $databaseName `
  --tuples-only --no-align --command "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('training_programs', 'curriculum_versions')"
if ($LASTEXITCODE -ne 0 -or $newTableCountBefore -ne '0') {
  throw 'The migration target tables already exist in the isolated copy.'
}
$dataCountsBefore = docker exec $ContainerName psql --username qlhv_test --dbname $databaseName `
  --tuples-only --no-align --command 'SELECT (SELECT COUNT(*) FROM users), (SELECT COUNT(*) FROM profiles), (SELECT COUNT(*) FROM subject_results)'
if ($LASTEXITCODE -ne 0) { throw 'Could not read baseline counts in the isolated copy.' }

$previousDatabaseUrl = [Environment]::GetEnvironmentVariable('DATABASE_URL', 'Process')
$previousDbSsl = [Environment]::GetEnvironmentVariable('DB_SSL', 'Process')
$previousDbHost = [Environment]::GetEnvironmentVariable('DB_HOST', 'Process')
$previousDbPort = [Environment]::GetEnvironmentVariable('DB_PORT', 'Process')
$previousDbUser = [Environment]::GetEnvironmentVariable('DB_USER', 'Process')
$previousDbPassword = [Environment]::GetEnvironmentVariable('DB_PASSWORD', 'Process')
$previousDbName = [Environment]::GetEnvironmentVariable('DB_NAME', 'Process')
$previousExpectedDatabase = [Environment]::GetEnvironmentVariable('QLHV_EXPECT_DATABASE', 'Process')
$previousLocation = Get-Location

try {
  $encodedPassword = [Uri]::EscapeDataString($databasePassword)
  $testDatabaseUrl = "postgresql://qlhv_test:${encodedPassword}@127.0.0.1:$testPort/$databaseName"
  [Environment]::SetEnvironmentVariable('DATABASE_URL', $testDatabaseUrl, 'Process')
  [Environment]::SetEnvironmentVariable('DB_SSL', 'false', 'Process')
  [Environment]::SetEnvironmentVariable('DB_HOST', '127.0.0.1', 'Process')
  [Environment]::SetEnvironmentVariable('DB_PORT', [string]$testPort, 'Process')
  [Environment]::SetEnvironmentVariable('DB_USER', 'qlhv_test', 'Process')
  [Environment]::SetEnvironmentVariable('DB_PASSWORD', $databasePassword, 'Process')
  [Environment]::SetEnvironmentVariable('DB_NAME', $databaseName, 'Process')
  [Environment]::SetEnvironmentVariable('QLHV_EXPECT_DATABASE', $databaseName, 'Process')
  Set-Location (Join-Path $PSScriptRoot '..')

  Write-Host "Before migration (isolated full-schema database $databaseName):"
  node src/utils/migrateTrainingPrograms.js --report
  if ($LASTEXITCODE -ne 0) { throw 'Pre-migration report failed.' }

  Write-Host 'Applying migration to the isolated full-schema database:'
  node src/utils/migrateTrainingPrograms.js --apply
  if ($LASTEXITCODE -ne 0) { throw 'Migration failed on the isolated full-schema database.' }

  Write-Host 'Applying migration a second time:'
  node src/utils/migrateTrainingPrograms.js --apply
  if ($LASTEXITCODE -ne 0) { throw 'Repeated migration failed on the isolated full-schema database.' }

  Write-Host 'After migration (isolated full-schema database):'
  node src/utils/migrateTrainingPrograms.js --report
  if ($LASTEXITCODE -ne 0) { throw 'Post-migration report failed.' }
} finally {
  Set-Location $previousLocation
  [Environment]::SetEnvironmentVariable('DATABASE_URL', $previousDatabaseUrl, 'Process')
  [Environment]::SetEnvironmentVariable('DB_SSL', $previousDbSsl, 'Process')
  [Environment]::SetEnvironmentVariable('DB_HOST', $previousDbHost, 'Process')
  [Environment]::SetEnvironmentVariable('DB_PORT', $previousDbPort, 'Process')
  [Environment]::SetEnvironmentVariable('DB_USER', $previousDbUser, 'Process')
  [Environment]::SetEnvironmentVariable('DB_PASSWORD', $previousDbPassword, 'Process')
  [Environment]::SetEnvironmentVariable('DB_NAME', $previousDbName, 'Process')
  [Environment]::SetEnvironmentVariable('QLHV_EXPECT_DATABASE', $previousExpectedDatabase, 'Process')
}

$newTableCountAfter = docker exec $ContainerName psql --username qlhv_test --dbname $databaseName `
  --tuples-only --no-align --command "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('training_programs', 'curriculum_versions')"
if ($LASTEXITCODE -ne 0) { throw 'Could not verify migration target tables in the isolated copy.' }
$dataCountsAfter = docker exec $ContainerName psql --username qlhv_test --dbname $databaseName `
  --tuples-only --no-align --command 'SELECT (SELECT COUNT(*) FROM users), (SELECT COUNT(*) FROM profiles), (SELECT COUNT(*) FROM subject_results)'
if ($LASTEXITCODE -ne 0) { throw 'Could not verify existing data counts in the isolated copy.' }
$targetTableCount = ([string]($newTableCountAfter -join "`n")).Trim()
$baselineCounts = ([string]($dataCountsBefore -join "`n")).Trim()
$finalCounts = ([string]($dataCountsAfter -join "`n")).Trim()
if ($targetTableCount -ne '2' -or $finalCounts -ne $baselineCounts) {
  throw "Migration post-check failed on isolated database ${databaseName}: target tables=$targetTableCount (expected 2); users|profiles|subject_results before=$baselineCounts, after=$finalCounts."
}

Write-Host "PASS: full-schema migration and idempotence on isolated database $databaseName; existing data counts unchanged."
Write-Host "The active database was not used. Source database $SourceDatabase was not modified."
