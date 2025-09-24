import { type FetchOptions, type $Fetch } from 'ofetch'

// locals
import FetchFactory from '../../factory'

class SystemAccountsModule extends FetchFactory<any> {
  private RESOURCE = '/admin/system-accounts'

  async getAll(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/all`, fetchOptions)
  }

  async getAllBankAccounts(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/all-bank-accounts`, fetchOptions)
  }

  async create(form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      method: 'POST',
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', this.RESOURCE, fetchOptions)
  }

  async addBankAccount(form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      method: 'POST',
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/add-bank-account`, fetchOptions)
  }

  async updateBankAccount(accountId: number, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/${accountId}/update-bank-account`, fetchOptions)
  }

  async deleteBankAccount(accountId: number, bankAccountId: number, fetchOptions?: FetchOptions) {
    return this.call('DELETE', `${this.RESOURCE}/${accountId}/delete-bank-account/${bankAccountId}`, fetchOptions)
  }

}

export default SystemAccountsModule
