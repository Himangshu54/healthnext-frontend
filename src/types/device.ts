export type DeviceStatus = 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'OFFLINE'

export interface Device {
  deviceId: string
  organisationId: string
  firmwareVersion?: string
  status: DeviceStatus
  battery?: number
  lastSeen?: string
  createdAt: string
  updatedAt: string
}
