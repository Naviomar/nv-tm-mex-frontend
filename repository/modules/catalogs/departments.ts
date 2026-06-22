import { type FetchOptions, type $Fetch } from 'ofetch'

// locals
import FetchFactory from '../../factory'


class DepartmentsModule extends FetchFactory<any> {
  private RESOURCE = '/admin/departments'

  /**
   * Return the sea regions as array
   * @param fetchOptions options for `useFetch`
   * @returns
   */
  async getDepartments(fetchOptions?: FetchOptions) {
    // const queryParams = '?' + new URLSearchParams(pagination).toString()
    return this.call('GET', this.RESOURCE, fetchOptions)
  }

  async getAllDepartments(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/all`, fetchOptions)
  }

  async getById(id: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/${id}/details`, fetchOptions)
  }

  async linkUser(id: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/${id}/link-user`, fetchOptions)
  }

  async unlinkUser(id: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/${id}/unlink-user`, fetchOptions)
  }

  async updateUserType(id: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/${id}/update-user-type`, fetchOptions)
  }

  async importRolePermissions(id: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/${id}/import-role-permissions`, fetchOptions)
  }

  async linkPermission(id: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/${id}/link-permission`, fetchOptions)
  }

  async unlinkPermission(id: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/${id}/unlink-permission`, fetchOptions)
  }


  async getFormCatalogs(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/form-catalogs`, fetchOptions)
  }

  async getFilters(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/filters`, fetchOptions)
  }

  async create(form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}`, fetchOptions)
  }

  async update(id: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/${id}/update`, fetchOptions)
  }

  async delete(id: string, fetchOptions?: FetchOptions) {
    fetchOptions = {
      ...fetchOptions,
    }
    return this.call('DELETE', `${this.RESOURCE}/${id}`, fetchOptions)
  }

  async getMyManagedDepartments(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/my-managed`, fetchOptions)
  }

  async getDepartmentRoles(id: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/${id}/roles`, fetchOptions)
  }

  async getAdminScopePermissions(id: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/${id}/admin-scope-permissions`, fetchOptions)
  }

  async linkRole(id: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = { body: JSON.stringify(form), ...fetchOptions }
    return this.call('POST', `${this.RESOURCE}/${id}/link-role`, fetchOptions)
  }

  async unlinkRole(id: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = { body: JSON.stringify(form), ...fetchOptions }
    return this.call('POST', `${this.RESOURCE}/${id}/unlink-role`, fetchOptions)
  }

  async createMemberRole(id: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = { body: JSON.stringify(form), ...fetchOptions }
    return this.call('POST', `${this.RESOURCE}/${id}/create-member-role`, fetchOptions)
  }

  async assignRoleToUser(id: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = { body: JSON.stringify(form), ...fetchOptions }
    return this.call('POST', `${this.RESOURCE}/${id}/assign-role-to-user`, fetchOptions)
  }

  async revokeRoleFromUser(id: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = { body: JSON.stringify(form), ...fetchOptions }
    return this.call('POST', `${this.RESOURCE}/${id}/revoke-role-from-user`, fetchOptions)
  }

  async syncRolePermissions(id: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = { body: JSON.stringify(form), ...fetchOptions }
    return this.call('POST', `${this.RESOURCE}/${id}/sync-role-permissions`, fetchOptions)
  }
}

export default DepartmentsModule
