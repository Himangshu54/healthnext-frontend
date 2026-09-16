import type { PatientIdentificationMethod } from './identification'

export type TestType = 'HB' | 'URINE' | 'SPO2' | 'TEMPERATURE'
export type TestStatus = 'STARTED' | 'COMPLETED' | 'FAILED' | 'CANCELLED'

export interface Test {
  testId: string
  organisationId: string
  patientId: string
  deviceId?: string
  testType: TestType
  startedAt?: string
  completedAt?: string
  status: TestStatus
  identificationMethod?: PatientIdentificationMethod
  createdBy: string
  createdAt: string
  updatedAt: string
}
