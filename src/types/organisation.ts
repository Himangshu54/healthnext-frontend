export type OrganisationStatus = 'ACTIVE' | 'SUSPENDED'

export interface Organisation {
  organisationId: string
  name: string
  email?: string
  phone?: string
  address?: string
  city?: string
  district?: string
  state?: string
  status: OrganisationStatus
  createdAt: string
  updatedAt: string
}
