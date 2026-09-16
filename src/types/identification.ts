export type PatientIdentificationMethod = 'FACE_VERIFIED' | 'MANUAL' | 'NEW_ENROLLMENT'
export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED' | 'UNVERIFIED'

export interface PatientIdentification {
  method: PatientIdentificationMethod
  recognitionEnabled: boolean
  recognitionReference?: string
  confidence?: number
  verificationStatus?: VerificationStatus
  updatedAt?: string
}
