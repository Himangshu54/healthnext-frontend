import type { PatientIdentification } from './identification'

export type PatientSex = 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY'

export interface Patient {
  patientId: string
  name: string
  age?: number
  sex?: PatientSex
  phone?: string
  village?: string
  createdAt: string
  updatedAt: string
  identification?: PatientIdentification
}
