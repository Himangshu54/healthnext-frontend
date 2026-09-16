# Database contract / domain model

This document defines the application domain model for the future Firebase + IndexedDB architecture.

## Core principles

- Patients, tests, results, and complete patient test/result history are globally shared across organisations.
- Super Admin manages organisations only.
- Employees manage globally shared patients, tests, results, and reports, plus their organisation's devices and calibrations.
- Patients do not have login accounts.
- The diagnostic platform supports four test types: HB, URINE, SPO2, TEMPERATURE.
- Patient identification will eventually use a webcam workflow, not ESP32-CAM.
- The frontend may use IndexedDB later for offline support, but Firebase remains the authoritative cloud store.

## Entity overview

### Organisation

- organisationId: string
- name: string
- email?: string
- phone?: string
- address?: string
- city?: string
- district?: string
- state?: string
- status: ACTIVE | SUSPENDED
- createdAt: string
- updatedAt: string

### User

- userId: string
- name: string
- email: string
- role: SUPER_ADMIN | EMPLOYEE
- organisationId?: string | null
- status: ACTIVE | SUSPENDED
- createdAt: string
- updatedAt: string

Notes:
- Super Admin records have no organisationId.
- Employee records must always have organisationId.
- Passwords are handled by Firebase Authentication, not in this domain model.

### Patient

- patientId: string
- name: string
- age?: number
- sex?: MALE | FEMALE | OTHER | PREFER_NOT_TO_SAY
- phone?: string
- village?: string
- createdAt: string
- updatedAt: string
- identification?: PatientIdentification

### PatientIdentification

- method: FACE_VERIFIED | MANUAL | NEW_ENROLLMENT
- recognitionEnabled: boolean
- recognitionReference?: string
- confidence?: number
- verificationStatus?: PENDING | VERIFIED | REJECTED | UNVERIFIED
- updatedAt?: string

Notes:
- Do not store raw webcam images by default.
- Do not implement biometric processing yet.

### Test

- testId: string
- organisationId: string
- patientId: string
- deviceId?: string
- testType: HB | URINE | SPO2 | TEMPERATURE
- startedAt?: string
- completedAt?: string
- status: STARTED | COMPLETED | FAILED | CANCELLED
- identificationMethod?: FACE_VERIFIED | MANUAL | NEW_ENROLLMENT
- createdBy: string
- createdAt: string
- updatedAt: string

Test records are globally shared. organisationId identifies the organisation that performed or created the test for audit/provenance and must not restrict visibility.

### Result

- resultId: string
- testId: string
- organisationId: string
- values: Record<string, string | number | boolean | null>
- quality?: GOOD | FAIR | POOR
- confidence?: number
- calibrationVersion?: string
- interpretation?: NORMAL | ATTENTION | CRITICAL | UNKNOWN
- createdAt: string

Notes:
- The values object is intentionally flexible because all four screens can map into a common shape.
- Result is linked through testId.
- organisationId records the organisation that produced the result for audit/provenance.
- organisationId must not be used as a tenant-visibility filter.

### Device

- deviceId: string
- organisationId: string
- firmwareVersion?: string
- status: ACTIVE | INACTIVE | MAINTENANCE | OFFLINE
- battery?: number
- lastSeen?: string
- createdAt: string
- updatedAt: string

### Calibration

- calibrationId: string
- organisationId: string
- testType: HB | URINE | SPO2 | TEMPERATURE
- sensorModel?: string
- calibrationVersion?: string
- configuration?: Record<string, string | number | boolean | null>
- createdAt: string
- updatedAt: string
- notes?: string

### SyncLog

- syncId: string
- organisationId: string
- entityType: PATIENT | TEST | RESULT | REPORT | DEVICE
- recordId: string
- operation: CREATE | UPDATE | DELETE
- status: PENDING | SYNCING | SUCCESS | FAILED
- attempts: number
- lastAttemptAt?: string
- syncedAt?: string
- error?: string
- createdAt: string

### Report

- reportId: string
- organisationId: string
- patientId: string
- generatedBy: string
- testIds: string[]
- generatedAt: string
- updatedAt: string
- reportStatus: DRAFT | GENERATED | SENT | ARCHIVED

Reports are globally viewable when they belong to a globally shared patient/test history. The organisationId field remains for audit and creator context, not tenant visibility filtering.

## Visibility and organisation scope

Globally shared data:

- Patients
- Tests
- Results
- Complete patient history

Organisation-scoped data and management:

- Users / Employees
- Devices
- Calibrations
- SyncLogs
- Organisation management

Employees belong to exactly one organisation and cannot manage organisations. Firebase security rules will eventually enforce organisation-scoped permissions.
