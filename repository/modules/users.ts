import { type FetchOptions, type $Fetch } from 'ofetch'
import objectToFormData from '~/utils/toFormData'

// locals
import FetchFactory from '../factory'

type IPagination = {
  page: string
  limit: string
}
type IUserPagination = {
  data: IUser[]
  total: number
  last_page: number
  per_page: number
  current_page: number
  page: number
  total_pages: number
  links: {
    previous: string
    next: string
  }
}
type IUser = {
  id: number
  name: string
  email: string
  email_verified_at: string
  deleted_at: string
  password: string
  created_at: string
  roles: IRole
  permissions: IPermission
}

type IRole = {
  id: number
  name: string
  guard_name: string
  created_at: string
  permissions: IPermission
}

type IPermission = {
  id: number
  name: string
  guard_name: string
  created_at: string
}

class UsersModule extends FetchFactory<any> {
  private RESOURCE = '/admin/users'
  private RESOURCE2 = '/users'

  async debugAuth(fetchOptions?: any) {
    return this.call('GET', '/debug-auth', fetchOptions)
  }

  /**
   * Return the users as array
   * @param fetchOptions options for `useFetch`
   * @returns
   */
  async getUsers(fetchOptions?: any) {
    return this.call('GET', this.RESOURCE, fetchOptions)
  }

  async getAllUsers(fetchOptions?: any) {
    return this.call('GET', `${this.RESOURCE}/all`, fetchOptions)
  }

  async getAllUsersInfo(fetchOptions?: any) {
    return this.call('GET', `${this.RESOURCE}/all-info`, fetchOptions)
  }

  /**
   * Return user as array
   * @param fetchOptions options for `useFetch`
   * @returns
   */
  async getUserById(id: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/${id}`, fetchOptions)
  }

  async searchUsers(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE2}/search`, fetchOptions)
  }

  async updateUserPassword(form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/update-user-password`, fetchOptions)
  }

  async checkUserExists(form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/check-user-exists`, fetchOptions)
  }

  async forgotPassword(form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE2}/forgot-password`, fetchOptions)
  }

  async resetPassword(form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE2}/reset-password`, fetchOptions)
  }

  /**
   * Return roles as array
   * @param fetchOptions options for `useFetch`
   * @returns
   */
  async getRoles(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/roles`, fetchOptions)
  }

  async getRoleUsers(roleId: string | number, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/roles/${roleId}/users`, fetchOptions)
  }

  async syncRolePermissions(roleId: string | number, permissionIds: number[], fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify({ permission_ids: permissionIds }),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/roles/${roleId}/sync-permissions`, fetchOptions)
  }

  async createRole(form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/create-role`, fetchOptions)
  }

  async addRolePermissions(id: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      method: 'POST',
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/add-role-permissions/${id}`, fetchOptions)
  }

  async updateRole(id: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      method: 'POST',
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/update-role/${id}`, fetchOptions)
  }

  async createPermission(form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      method: 'POST',
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/create-permission`, fetchOptions)
  }

  async updatePermission(id: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      method: 'POST',
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/update-permission/${id}`, fetchOptions)
  }

  async deleteRole(id: string, fetchOptions?: FetchOptions) {
    fetchOptions = {
      method: 'DELETE',
      ...fetchOptions,
    }
    return this.call('DELETE', `${this.RESOURCE}/delete-role/${id}`, fetchOptions)
  }

  async deletePermission(id: string, fetchOptions?: FetchOptions) {
    fetchOptions = {
      method: 'DELETE',
      ...fetchOptions,
    }
    return this.call('DELETE', `${this.RESOURCE}/delete-permission/${id}`, fetchOptions)
  }

  async deleteRolePermission(role_id: string, id: string, fetchOptions?: FetchOptions) {
    fetchOptions = {
      method: 'DELETE',
      ...fetchOptions,
    }
    return this.call('DELETE', `${this.RESOURCE}/delete-role/${role_id}/permission/${id}`, fetchOptions)
  }

  /**
   * Return roles as array
   * @param fetchOptions options for `useFetch`
   * @returns
   */
  async getPermissions(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/permissions`, fetchOptions)
  }

  /**
   * Return a user
   * @param fetchOptions options for `useFetch`
   * @returns
   */
  async createUser(form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      method: 'POST',
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/create-user`, fetchOptions)
  }

  async updateUser(id: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      method: 'POST',
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/update-user/${id}`, fetchOptions)
  }

  /**
   * Delete a user by id
   * @param user
   * @returns
   */
  async deleteUser(id: string, fetchOptions?: FetchOptions) {
    fetchOptions = {
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/${id}/delete-user`, fetchOptions)
  }

  async getMyProfile(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE2}/my-profile`, fetchOptions)
  }

  async getMyAuthRequests(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE2}/my-auth-requests`, fetchOptions)
  }

  async getMyRequestAssistances(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE2}/my-request-assistances`, fetchOptions)
  }

  async updateUserAvatar(form: any, fetchOptions?: FetchOptions) {
    const body = objectToFormData(form)
    fetchOptions = {
      body: body,
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE2}/update-user-avatar`, fetchOptions)
  }

  async updateAvatarConfig(form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE2}/update-avatar-config`, fetchOptions)
  }

  async sendMessage(form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE2}/send-chat-message`, fetchOptions)
  }

  async getDepartmentsCoordinator(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/departments-coordinator`, fetchOptions)
  }

  async updateUserPermissions(userId: number, body: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      method: 'POST',
      body: JSON.stringify(body),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/update-user-permissions/${userId}/department-coordinator`, fetchOptions)
  }
}

export default UsersModule
