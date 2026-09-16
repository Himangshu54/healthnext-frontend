export type SyncEntityType = 'PATIENT' | 'TEST' | 'RESULT' | 'REPORT' | 'DEVICE'
export type SyncOperation = 'CREATE' | 'UPDATE' | 'DELETE'
export type SyncStatus = 'PENDING' | 'SYNCING' | 'SUCCESS' | 'FAILED'

export interface SyncLog {
  syncId: string
  organisationId: string
  entityType: SyncEntityType
  recordId: string
  operation: SyncOperation
  status: SyncStatus
  attempts: number
  lastAttemptAt?: string
  syncedAt?: string
  error?: string
  createdAt: string
}
