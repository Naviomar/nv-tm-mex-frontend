namespace models {
  interface IPagedModel<T> {
    data: T[]
    current_page: number
    last_page: number
  }

  interface IUser {
    id: number
    name: string
    email: string
    email_verified_at: string
    created_at: string
    updated_at: string
    deleted_at: string
    created_by: number
    updated_by: number
    deleted_by: number
    is_active: number
    roles: Array<any>
    departments: Array<any>
  }
}
