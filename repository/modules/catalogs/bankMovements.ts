import { type FetchOptions } from "ofetch";

import objectToFormData from "~/utils/toFormData";

// locals
import FetchFactory from "../../factory";

class BankMovementsModule extends FetchFactory<any> {
  private RESOURCE = "/bank-movements";

  /**
   * Return the banks as array
   * @param fetchOptions options for `useFetch`
   * @returns
   */
  async getMovements(fetchOptions?: FetchOptions) {
    return this.call("GET", `${this.RESOURCE}`, fetchOptions);
  }

  async getMovement(id: string, fetchOptions?: FetchOptions) {
    return this.call("GET", `${this.RESOURCE}/${id}/details`, fetchOptions);
  }

  async searchBankMovement(form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    };
    return this.call("POST", `${this.RESOURCE}/search`, fetchOptions);
  }

  async addCustomerPaymentsToBankMovement(form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    };
    return this.call("POST", `${this.RESOURCE}/add-customer-payments`, fetchOptions);
  }

  async getMovementPayables(id: string, fetchOptions?: FetchOptions) {
    return this.call("GET", `${this.RESOURCE}/${id}/payables`, fetchOptions);
  }

  async searchInvoices(id: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    };
    return this.call(
      "POST",
      `${this.RESOURCE}/${id}/search-invoices`,
      fetchOptions
    );
  }

  async searchBLScheduleInvoices(id: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    };
    return this.call(
      "POST",
      `${this.RESOURCE}/${id}/search-bl-schedule-invoices`,
      fetchOptions
    );
  }

  async payInvoices(id: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    };
    return this.call(
      "POST",
      `${this.RESOURCE}/${id}/pay-invoices`,
      fetchOptions
    );
  }

  async payBlSchedules(id: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    };
    return this.call(
      "POST",
      `${this.RESOURCE}/${id}/pay-bl-schedules`,
      fetchOptions
    );
  }

  async deletePayment(id: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    };
    return this.call("POST", `${this.RESOURCE}/${id}/payments/${form.id}/delete`, fetchOptions);
  }

  async getBankMovementFilters(fetchOptions?: FetchOptions) {
    return this.call("GET", `${this.RESOURCE}/filters`, fetchOptions);
  }

  async exportDataXlsx(fetchOptions?: FetchOptions) {
    return this.call("GET", `${this.RESOURCE}/export-xlsx`, fetchOptions);
  }

  async exportByPaymentsDataXlsx(fetchOptions?: FetchOptions) {
    return this.call("GET", `${this.RESOURCE}/export-by-payment-xlsx`, fetchOptions);
  }

  async getBankAccountLatestMovements(id: string, fetchOptions?: FetchOptions) {
    return this.call(
      "GET",
      `${this.RESOURCE}/bank-account/${id}/latest-movements`,
      fetchOptions
    );
  }

  async testPayables(fetchOptions?: FetchOptions) {
    return this.call("GET", `${this.RESOURCE}/test-payable`, fetchOptions);
  }

  async setBankMovementNota(
    id: string,
    form: any,
    fetchOptions?: FetchOptions
  ) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    };
    return this.call("POST", `${this.RESOURCE}/${id}/set-nota`, fetchOptions);
  }

  async uploadBankMovements(form: any, fetchOptions?: FetchOptions) {
    const body = objectToFormData(form);
    fetchOptions = {
      body: body,
      ...fetchOptions,
    };
    return this.call("POST", `${this.RESOURCE}/upload`, fetchOptions);
  }

  async create(form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    };
    return this.call("POST", this.RESOURCE, fetchOptions);
  }

  async addBankAccount(form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    };
    return this.call("POST", `${this.RESOURCE}/add-bank-account`, fetchOptions);
  }

  async updateChequeStatus(id: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    };
    return this.call("POST", `${this.RESOURCE}/${id}/update-cheque-status`, fetchOptions);
  }
}

export default BankMovementsModule;
