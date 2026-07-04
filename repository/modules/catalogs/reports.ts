import { type FetchOptions, type $Fetch } from 'ofetch'
import FetchFactory from '../../factory'

class ReportsModule extends FetchFactory<any> {
  private RESOURCE = '/reports'

  async getCobranza(fetchOptions?: FetchOptions) {
    fetchOptions = {
      responseType: 'blob',
      ...fetchOptions,
    }
    return this.call('GET', `${this.RESOURCE}/cobranza`, fetchOptions)
  }

  async getCustomerInvoices(fetchOptions?: FetchOptions) {
    fetchOptions = {
      responseType: 'blob',
      ...fetchOptions,
    }
    return this.call('GET', `${this.RESOURCE}/customer-invoices`, fetchOptions)
  }

  async getMovementPayments(fetchOptions?: FetchOptions) {
    fetchOptions = {
      responseType: 'blob',
      ...fetchOptions,
    }
    return this.call('GET', `${this.RESOURCE}/movements-payments`, fetchOptions)
  }

  async getPaymentsHistory(fetchOptions?: FetchOptions) {
    fetchOptions = {
      responseType: 'blob',
      ...fetchOptions,
    }
    return this.call('GET', `${this.RESOURCE}/payments-history`, fetchOptions)
  }

  async getChargesPendingInvoice(fetchOptions?: FetchOptions) {
    fetchOptions = {
      responseType: 'blob',
      ...fetchOptions,
    }
    return this.call('GET', `${this.RESOURCE}/charges-pending-invoice`, fetchOptions)
  }

  async getComparativeChart(years: number[]) {
    return this.call('POST', `${this.RESOURCE}/comparative-chart`, {
      body: { years }
    })
  }

  async getYearlyComparative(params: { years: number[], refresh?: boolean, includeProfit?: boolean, includeWithoutEta?: boolean, ejecutivo_id?: number, useLegacy?: boolean, useNew?: boolean }) {
    return this.call('POST', `${this.RESOURCE}/comparative-chart`, {
      body: params
    })
  }

  async getEjecutivos() {
    return this.call('GET', `${this.RESOURCE}/ejecutivos`)
  }

  async getReferencesByClient(params: { years: number[], ejecutivo_id?: number, useNew?: boolean }) {
    return this.call('POST', `${this.RESOURCE}/references-by-client`, {
      body: params
    })
  }

  async getReferencesByLine(params: { years: number[], ejecutivo_id?: number, useNew?: boolean }) {
    return this.call('POST', `${this.RESOURCE}/references-by-line`, {
      body: params
    })
  }

  async getReferencesByLoadingPort(params: { years: number[], ejecutivo_id?: number, useNew?: boolean }) {
    return this.call('POST', `${this.RESOURCE}/references-by-loading-port`, {
      body: params
    })
  }

  async getReferencesByDischargePort(params: { years: number[], ejecutivo_id?: number, useNew?: boolean }) {
    return this.call('POST', `${this.RESOURCE}/references-by-discharge-port`, {
      body: params
    })
  }

  async getExecutivesReport(fetchOptions?: FetchOptions) {
    fetchOptions = {
      responseType: 'blob',
      ...fetchOptions,
    }
    return this.call('GET', `${this.RESOURCE}/executives-report`, fetchOptions)
  }
}

export default ReportsModule
