export type UserRole = 'SUPER_ADMIN' | 'EMPLOYEE'
export type UserStatus = 'ACTIVE' | 'SUSPENDED'

export interface User {
  userId: string
  name: string
  email: string
  role: UserRole
  organisationId?: string | null
  status: UserStatus
  createdAt: string
  updatedAt: string
}
