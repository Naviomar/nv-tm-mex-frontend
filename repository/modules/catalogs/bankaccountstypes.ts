import { type FetchOptions, type $Fetch } from 'ofetch'

// locals
import FetchFactory from '../../factory'

type IPagination = {
  page: string
  limit: string
}
type IBankAccountTypePagination = {
  data: IBankAccountType[]
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
type IBankAccountType = {
  id: number
  name: string
  curren_id: number
}

class BankAccountsTypesModule extends FetchFactory<IBankAccountTypePagination> {
  private RESOURCE = '/admin/banks-accounts-types'
  /**
   * Return the bank-accounts-types as array
   * @param fetchOptions options for `useFetch`
   * @returns
   */
  async getBankAccountsTypes(fetchOptions?: FetchOptions) {
    return this.call('GET', this.RESOURCE, fetchOptions)
  }

  /**
   * Return a bank-accounts-types
   * @param fetchOptions options for `useFetch`
   * @returns
   */
  async create(form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      method: 'POST',
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}`, fetchOptions)
  }

  /**
   * Delete a notification-type by id
   * @param notificatiotype
   * @returns
   */
  async delete(id: string, fetchOptions?: FetchOptions) {
    fetchOptions = {
      method: 'DELETE',
      ...fetchOptions,
    }
    return this.call('DELETE', `${this.RESOURCE}/${id}`, fetchOptions)
  }
}

export default BankAccountsTypesModule
