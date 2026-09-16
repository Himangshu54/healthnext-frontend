# Firebase vs IndexedDB responsibilities

## A) Firebase (authoritative cloud data)

The future Firebase database should store the canonical system records, including:

- organisations
- users / employees
- patients
- tests
- results
- reports
- devices
- calibrations
- sync logs (for operational visibility)

Firebase responsibilities:

- long-term authoritative storage
- cross-device synchronization
- organisation-scoped access control for users, devices, calibrations, sync logs, and organisation management through security rules
- global querying and reporting
- shared data access across the normal frontend and super admin repository

Visibility model:

- Patients, tests, results, and complete patient history are globally shared across organisations.
- Test and Result organisationId values are audit/provenance fields, not tenant-visibility filters.
- Reports are globally viewable when they belong to globally shared patient/test history; Report organisationId remains for audit and creator context.
- Organisations remain private to Super Admin management.
- Employees are associated with exactly one organisation and cannot manage organisations.

## B) IndexedDB (local offline operational copy)

IndexedDB should store a working local copy for the normal frontend, including:

- cached patient records
- cached test records
- cached result records
- cached globally shared patient history
- local sync queue
- unsynced creates/updates/deletes
- local device metadata and pending operations

IndexedDB responsibilities:

- offline read/write capability
- temporary local working state
- queued sync operations
- resilience when network access is unavailable

## Boundary principles

- Firebase is authoritative.
- IndexedDB is operational and local.
- SyncLog records the status of outbound changes.
- The frontend should not treat localStorage as the final local database implementation.

## Current state of the repo

The current repository uses localStorage only for mock persistence. This is not the final intended architecture and must be replaced later with IndexedDB-based state when the migration begins.