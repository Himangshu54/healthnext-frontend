export interface Calibration {
  calibrationId: string
  organisationId: string
  testType: 'HB' | 'URINE' | 'SPO2' | 'TEMPERATURE'
  sensorModel?: string
  calibrationVersion?: string
  configuration?: Record<string, string | number | boolean | null>
  createdAt: string
  updatedAt: string
  notes?: string
}
