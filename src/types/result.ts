export type ResultQuality = 'GOOD' | 'FAIR' | 'POOR'
export type ResultInterpretation = 'NORMAL' | 'ATTENTION' | 'CRITICAL' | 'UNKNOWN'

export interface Result {
  resultId: string
  testId: string
  organisationId: string
  values: Record<string, string | number | boolean | null>
  quality?: ResultQuality
  confidence?: number
  calibrationVersion?: string
  interpretation?: ResultInterpretation
  createdAt: string
}
