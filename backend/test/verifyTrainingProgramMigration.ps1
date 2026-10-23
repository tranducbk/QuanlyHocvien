param(
  [Parameter(Mandatory = $true)]
  [ValidatePattern('^qlhv-training-program-test-[0-9a-f]{8}$')]
  [string]$ContainerName
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

$previousDatabaseUrl = [Environment]::GetEnvironmentVariable('DATABASE_URL', 'Process')
$previousDbSsl = [Environment]::GetEnvironmentVariable('DB_SSL', 'Process')
$previousLocation = Get-Location
try {
  [Environment]::SetEnvironmentVariable('DATABASE_URL', "postgresql://qlhv_test:${databasePassword}@127.0.0.1:$testPort/qlhv_training_test", 'Process')
  [Environment]::SetEnvironmentVariable('DB_SSL', 'false', 'Process')
  Set-Location (Join-Path $PSScriptRoot '..')

  Write-Host 'Applying migration a second time to the isolated test database:'
  node src/utils/migrateTrainingPrograms.js --apply
  if ($LASTEXITCODE -ne 0) { throw 'The second migration attempt failed.' }
} finally {
  Set-Location $previousLocation
  [Environment]::SetEnvironmentVariable('DATABASE_URL', $previousDatabaseUrl, 'Process')
  [Environment]::SetEnvironmentVariable('DB_SSL', $previousDbSsl, 'Process')
}

$constraintSql = @'
BEGIN;
DO $$
DECLARE
  first_system UUID := gen_random_uuid();
  second_system UUID := gen_random_uuid();
  first_program UUID := gen_random_uuid();
  second_program UUID := gen_random_uuid();
BEGIN
  INSERT INTO training_systems (id) VALUES (first_system), (second_system);
  INSERT INTO training_programs (id, training_system_id, code, name)
    VALUES (first_program, first_system, 'CHECK', 'Check program');
  INSERT INTO training_programs (id, training_system_id, code, name)
    VALUES (second_program, second_system, 'CHECK', 'Check program');

  BEGIN
    INSERT INTO training_programs (training_system_id, code, name)
      VALUES (first_system, 'CHECK', 'Duplicate program');
    RAISE EXCEPTION 'Duplicate program code in one system was accepted';
  EXCEPTION WHEN unique_violation THEN NULL;
  END;

  BEGIN
    INSERT INTO training_programs (training_system_id, code, name)
      VALUES (gen_random_uuid(), 'MISSING', 'Invalid system');
    RAISE EXCEPTION 'Unknown training system was accepted';
  EXCEPTION WHEN foreign_key_violation THEN NULL;
  END;

  INSERT INTO curriculum_versions (training_program_id, version_code, name)
    VALUES (first_program, 'V1', 'Version one');
  INSERT INTO curriculum_versions (training_program_id, version_code, name)
    VALUES (second_program, 'V1', 'Version one');

  BEGIN
    INSERT INTO curriculum_versions (training_program_id, version_code, name)
      VALUES (first_program, 'V1', 'Duplicate version');
    RAISE EXCEPTION 'Duplicate version code in one program was accepted';
  EXCEPTION WHEN unique_violation THEN NULL;
  END;

  BEGIN
    INSERT INTO curriculum_versions (training_program_id, version_code, name)
      VALUES (gen_random_uuid(), 'V2', 'Invalid program');
    RAISE EXCEPTION 'Unknown training program was accepted';
  EXCEPTION WHEN foreign_key_violation THEN NULL;
  END;

  BEGIN
    INSERT INTO curriculum_versions (training_program_id, version_code, name, effective_from, effective_to)
      VALUES (first_program, 'V2', 'Invalid dates', DATE '2025-02-01', DATE '2025-01-01');
    RAISE EXCEPTION 'End date before start date was accepted';
  EXCEPTION WHEN check_violation THEN NULL;
  END;
END $$;
ROLLBACK;
DO $$
BEGIN
  IF (SELECT COUNT(*) FROM training_programs) <> 0 OR
     (SELECT COUNT(*) FROM curriculum_versions) <> 0 THEN
    RAISE EXCEPTION 'Test data remained after rollback';
  END IF;
END $$;
'@

$constraintSql | docker exec --interactive $ContainerName psql `
  --username qlhv_test --dbname qlhv_training_test --set ON_ERROR_STOP=1
if ($LASTEXITCODE -ne 0) { throw 'A migration constraint check failed.' }

Write-Host 'Migration idempotence and database constraints passed in the isolated test database.'
