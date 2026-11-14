param(
  [Parameter(Mandatory = $true)]
  [ValidatePattern('^qlhv-training-program-test-[0-9a-f]{8}$')]
  [string]$ContainerName,
  [Parameter(Mandatory = $true)]
  [ValidatePattern('^qlhv_scope_test_[0-9a-f]{8}$')]
  [string]$DatabaseName
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
$databasePassword = docker exec $ContainerName printenv POSTGRES_PASSWORD
if ($LASTEXITCODE -ne 0 -or -not $databasePassword) { throw 'Could not read test database credentials.' }
$databaseExists = docker exec $ContainerName psql --username qlhv_test --dbname postgres `
  --tuples-only --no-align --command "SELECT 1 FROM pg_database WHERE datname = '$DatabaseName'"
if ($LASTEXITCODE -ne 0 -or $databaseExists -ne '1') { throw 'The named isolated test database does not exist.' }

$previousDatabaseUrl = [Environment]::GetEnvironmentVariable('DATABASE_URL', 'Process')
$previousDbSsl = [Environment]::GetEnvironmentVariable('DB_SSL', 'Process')
$previousDbHost = [Environment]::GetEnvironmentVariable('DB_HOST', 'Process')
$previousDbPort = [Environment]::GetEnvironmentVariable('DB_PORT', 'Process')
$previousDbUser = [Environment]::GetEnvironmentVariable('DB_USER', 'Process')
$previousDbPassword = [Environment]::GetEnvironmentVariable('DB_PASSWORD', 'Process')
$previousDbName = [Environment]::GetEnvironmentVariable('DB_NAME', 'Process')
$previousTestDb = [Environment]::GetEnvironmentVariable('QLHV_TEST_DB', 'Process')
$previousLocation = Get-Location
try {
  [Environment]::SetEnvironmentVariable('DATABASE_URL', '', 'Process')
  [Environment]::SetEnvironmentVariable('DB_SSL', 'false', 'Process')
  [Environment]::SetEnvironmentVariable('DB_HOST', '127.0.0.1', 'Process')
  [Environment]::SetEnvironmentVariable('DB_PORT', [string]$testPort, 'Process')
  [Environment]::SetEnvironmentVariable('DB_USER', 'qlhv_test', 'Process')
  [Environment]::SetEnvironmentVariable('DB_PASSWORD', $databasePassword, 'Process')
  [Environment]::SetEnvironmentVariable('DB_NAME', $DatabaseName, 'Process')
  [Environment]::SetEnvironmentVariable('QLHV_TEST_DB', $DatabaseName, 'Process')
  Set-Location (Join-Path $PSScriptRoot '..')

  Write-Host "Running HTTP scope checks on isolated database $DatabaseName..."
  node test/scopeApiIntegration.js
  if ($LASTEXITCODE -ne 0) { throw 'The HTTP scope checks failed.' }
} finally {
  Set-Location $previousLocation
  [Environment]::SetEnvironmentVariable('DATABASE_URL', $previousDatabaseUrl, 'Process')
  [Environment]::SetEnvironmentVariable('DB_SSL', $previousDbSsl, 'Process')
  [Environment]::SetEnvironmentVariable('DB_HOST', $previousDbHost, 'Process')
  [Environment]::SetEnvironmentVariable('DB_PORT', $previousDbPort, 'Process')
  [Environment]::SetEnvironmentVariable('DB_USER', $previousDbUser, 'Process')
  [Environment]::SetEnvironmentVariable('DB_PASSWORD', $previousDbPassword, 'Process')
  [Environment]::SetEnvironmentVariable('DB_NAME', $previousDbName, 'Process')
  [Environment]::SetEnvironmentVariable('QLHV_TEST_DB', $previousTestDb, 'Process')
}

Write-Host "Completed HTTP scope checks on isolated database $DatabaseName."
