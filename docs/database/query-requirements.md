# Future database query requirements

These are the important queries the future database must support.

## Organisations

- Get all organisations
- Get active organisations
- Get organisation by organisationId
- Get organisation by email

## Users / Employees

- Get employees for organisation
- Get user by userId
- Get user by email
- Get active employees for organisation
- Get super admin users

## Patients

- Get all globally shared patients
- Find patient by patientId
- Search patients by name
- Search patients by phone
- Get patient by identification reference
- Get patient test history

## Tests

- Get tests for patient
- Get all globally shared tests
- Get tests by performing organisation for audit/provenance
- Get tests by date range
- Get tests by testType
- Get active or pending tests
- Get failed tests

## Results

- Get result for testId
- Get globally shared results for patient
- Get results by producing organisation for audit/provenance
- Get results by interpretation state
- Get latest result for a patient

## Devices

- Get devices for organisation
- Get active devices
- Get device by deviceId
- Get device status history

## Reports

- Get reports for patient
- Get globally viewable reports
- Get reports by organisation for audit/provenance
- Get latest report for patient
- Get reports by generatedBy
- Get reports by status

## Sync queue

- Get pending sync records
- Get failed sync records for organisation
- Get sync logs by entityType
- Get sync logs by recordId
- Get records pending retry

## Multi-tenant and security constraints

- Patients, tests, results, reports, and complete patient history must not be filtered by the current organisation for visibility.
- Test and Result organisationId filters may be used for audit/provenance queries, not tenant visibility.
- Organisation-scoped queries must include organisationId filters for employees/users, devices, calibrations, and sync logs.
- Super admin queries should be isolated to organisation management operations only.
- Firebase security rules will eventually enforce tenant isolation.
