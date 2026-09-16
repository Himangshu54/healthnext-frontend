export type ReportStatus = 'DRAFT' | 'GENERATED' | 'SENT' | 'ARCHIVED'

export interface Report {
  reportId: string
  organisationId: string
  patientId: string
  generatedBy: string
  testIds: string[]
  generatedAt: string
  updatedAt: string
  reportStatus: ReportStatus
}
