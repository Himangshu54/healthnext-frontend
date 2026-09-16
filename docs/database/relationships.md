# Relationship model

## High-level relationships

Organisation
    ↓
Users / Employees

Patients
    ↓
Tests
    ↓
Results

Patients, Tests, Results, and complete patient history are globally shared across organisations.
Test and Result organisationId values record audit/provenance and do not restrict visibility.

Organisation
    ↓
Devices

Organisation
    ↓
Calibrations

Organisation
    ↓
SyncLogs

Organisation
    ↓
Reports

## Identifier map

- organisationId
- userId
- patientId
- testId
- deviceId
- calibrationId
- syncId
- reportId

## Relationship notes

### Organisation → Users / Employees

A user belongs to a single organisation unless the user is a Super Admin.

### Global Patients

Patients are globally shared. A patient does not belong to a single organisation, and Patient has no organisationId field.

### Patient → Tests

A patient can have many globally visible tests. Each test references patientId and retains organisationId to record the organisation that performed or created the test, not to restrict visibility.

### Test → Results

A test can have one or more result records depending on implementation, but the app should treat result as the outcome of a single test. The canonical reference is testId.

### Organisation → Devices

Each device belongs to an organisation and is managed by that organisation's staff.

### Organisation → Calibrations

Calibration records are organisation-scoped and tied to a testType.

### Organisation → SyncLogs

Sync logs record cloud/offline queue events for organisation-owned data.

### Reports

Reports are globally viewable when they belong to a globally shared patient/test history. Their organisationId is retained for audit and creator context, and reports may reference multiple testIds.

## Organisation-scoped relationships

Organisation-scoped records are:

- Users / Employees
- Devices
- Calibrations
- SyncLogs
- Organisation management

Employees belong to exactly one organisation and cannot manage organisations. Firebase security rules will eventually enforce organisation-scoped permissions.