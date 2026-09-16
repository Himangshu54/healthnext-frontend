# Mock data to domain model mapping

This document maps the current mock application state to the future domain model without deleting or changing the current implementation.

## Current mock objects to new models

| Current mock object | Future model | Notes |
|---|---|---|
| demoUsers | User | Current demo employees map to User records. Missing: organisationId, status, createdAt, updatedAt for production-ready usage. |
| demoEmployee / demoAdmin | User | Current auth objects are user-like. Missing: organisationId for employee, and a proper role contract for Super Admin. |
| demoPatients | Patient | Each seeded patient is already close to Patient data. Missing: identification, createdAt/updatedAt structure, village/location. Patients are globally shared; no organisationId is required. |
| patient.testHistory | Test + Result | Current session objects are effectively test records with result values embedded. Missing: testId, organisationId as audit/provenance, testType, deviceId, startedAt/completedAt, resultId, typing. |
| saveReport / reports array | Report + Result | Current generated report objects are conceptually Reports but generated from mock logic. Missing: organisationId, patientId, generatedBy, testIds, reportStatus. |
| device placeholders | Device | Current Bluetooth device IDs and connection state align with Device concept but are not formalised. Missing: organisationId, firmwareVersion, status, battery, lastSeen. |
| createMockReport | Result | Current generator creates a result-like payload. Missing: testId and formal result structure for the real model. |
| mock report download | Report export | Current HTML export is UI-level and can remain, but the payload contract must move to Report/Result. |

## Mapping examples

### demoUsers -> User

Current mock shape:

```js
{ id: 'WORKER001', name: 'Sunita Kumari', email: 'sunita.kumari@healthnext.org', role: 'Field Health Worker', district: 'Gaya', status: 'Active', joinedAt: '2026-01-12' }
```

Future model shape:

```ts
{
  userId: 'WORKER001',
  name: 'Sunita Kumari',
  email: 'sunita.kumari@healthnext.org',
  role: 'EMPLOYEE',
  organisationId: 'NEEDS MIGRATION / SEED VALUE',
  status: 'ACTIVE',
  createdAt: 'NEEDS MIGRATION / SEED VALUE',
  updatedAt: 'NEEDS MIGRATION / SEED VALUE'
}
```

### demoPatients -> Patient

Current mock shape:

```js
{
  id: 'P001',
  name: 'Asha Devi',
  phone: '9876501001',
  age: 29,
  gender: 'Female',
  email: '',
  address: '',
  medicalHistory: '',
  testHistory: [...] 
}
```

Future model shape:

```ts
{
  patientId: 'P001',
  name: 'Asha Devi',
  age: 29,
  sex: 'FEMALE',
  phone: '9876501001',
  village: 'NEEDS MIGRATION / SEED VALUE',
  createdAt: 'NEEDS MIGRATION / SEED VALUE',
  updatedAt: 'NEEDS MIGRATION / SEED VALUE',
  identification: {
    method: 'MANUAL',
    recognitionEnabled: false,
    verificationStatus: 'UNVERIFIED'
  }
}
```

### patient.testHistory -> Test + Result

Current mock shape:

```js
{
  sessionId: 'DEMO-001-01',
  date: '2026-...Z',
  workerId: 'WORKER002',
  workerName: 'Ravi Kumar',
  deviceId: 'HN-BLE-002',
  hemoglobin: 11.8,
  glucose: 96,
  ph: 6.4,
  protein: 'Negative',
  bloodPressure: '118/76',
  spo2: 98
}
```

Future model mapping:

```ts
// Test
{
  testId: 'DEMO-001-01',
  organisationId: 'NEEDS MIGRATION / SEED VALUE',
  patientId: 'P001',
  deviceId: 'HN-BLE-002',
  testType: 'HB',
  status: 'COMPLETED',
  identificationMethod: 'MANUAL',
  createdBy: 'WORKER002',
  createdAt: 'NEEDS MIGRATION / SEED VALUE',
  updatedAt: 'NEEDS MIGRATION / SEED VALUE'
}
```

```ts
// Result
{
  testId: 'DEMO-001-01',
  organisationId: 'NEEDS MIGRATION / SEED VALUE',
  values: {
    hemoglobin: 11.8,
    glucose: 96,
    ph: 6.4,
    protein: 'Negative',
    bloodPressure: '118/76',
    spo2: 98
  },
  createdAt: 'NEEDS MIGRATION / SEED VALUE'
}
```

## Missing fields that need migration or seed values

These are currently absent from mock structures and must be filled during migration:

- createdAt
- updatedAt
- deviceId in some records
- testId
- resultId
- reportId
- testType
- identificationMethod
- recognitionReference
- confidence
- calibrationVersion
- reportStatus
- user organisation linkage
- patient village/location
- patient identification data
- device status metadata
- sync queue metadata

For globally shared Patients, organisationId must not be added during migration. For Tests, Results, and Reports, organisationId is retained as audit/provenance or creator context and must not be used to restrict visibility.

## Notable conversion issues

- Current mock data uses id for many records, while future domain model uses patientId, userId, testId, reportId, deviceId, etc.
- Current mock objects do not consistently distinguish patient demographics from test payloads.
- Current patient records embed historical test results directly under patient.testHistory, which is a mock structure rather than a normalized relational model.
- Current result/report generation logic is tied to UI behavior rather than database contracts.

## Migration guidance

- Keep current mock data as a source for seed/demo records in staging.
- Do not treat current localStorage values as final Firebase records.
- Do not invent production data; mark missing values as NEEDS MIGRATION / SEED VALUE.
