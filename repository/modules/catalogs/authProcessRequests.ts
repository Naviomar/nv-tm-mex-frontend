import { type FetchOptions, type $Fetch } from 'ofetch'
import objectToFormData from '~/utils/toFormData'

// locals
import FetchFactory from '../../factory'

export interface IRequestBatchResult {
  batch_id: string
  created: { id: number; request_key: string; label: string | null }[]
  skipped: { request_key: string; label: string | null; reason: string; message: string }[]
}

class AuthProcessRequestsModule extends FetchFactory<any> {
  private RESOURCE = '/auth-process-requests'

  async getUserRequests(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/user`, fetchOptions)
  }

  async getCatalogs(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/catalogs`, fetchOptions)
  }

  async getRequests(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}`, fetchOptions)
  }

  async getRequestsByResource(params = { process_name: '', request_key: '' }) {
    return this.call('GET', `${this.RESOURCE}/by-process?process_name=${params.process_name}&request_key=${params.request_key}`)
  }

  /** Same decision the server applies in the `approval:` middleware: act directly or request? */
  async getEligibility(params: { process_name: string; request_key: string }) {
    return this.call(
      'GET',
      `${this.RESOURCE}/eligibility?process_name=${encodeURIComponent(params.process_name)}&request_key=${encodeURIComponent(params.request_key)}`
    )
  }

  async respondRequest(id: string, data: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(data),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/${id}/respond`, fetchOptions)
  }

  async requestAuthorization(data: any, fetchOptions?: FetchOptions) {
    // Use multipart when files are attached; JSON otherwise
    let body: any
    if (data.files?.length > 0) {
      const { files, process_data, ...rest } = data
      const formData = objectToFormData(rest)
      // Nested objects survive better as a JSON string field (backend json_decodes)
      if (process_data) formData.append('process_data', JSON.stringify(process_data))
      for (const file of files) formData.append('files[]', file)
      body = formData
    } else {
      const { files, ...rest } = data
      body = JSON.stringify(rest)
    }
    fetchOptions = {
      body,
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/request`, fetchOptions)
  }

  /**
   * Same authorization for several records at once: the server creates one request per record
   * (request_key) grouped under a batch_id, so approvers can answer them together.
   */
  async requestBatch(data: {
    process_name: string
    request_keys: (string | number)[]
    reason: string
    department_id?: number | null
    executor_user_ids?: number[]
    files?: File[]
  }, fetchOptions?: FetchOptions): Promise<IRequestBatchResult> {
    const { files, ...rest } = data
    let body: any
    if (files && files.length > 0) {
      body = objectToFormData(rest)
      for (const file of files) body.append('files[]', file)
    } else {
      body = JSON.stringify(rest)
    }
    return this.call('POST', `${this.RESOURCE}/request-batch`, { body, ...fetchOptions })
  }

  async cancelRequest(id: string, data: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(data),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/${id}/delete`, fetchOptions)
  }

  async cancelAuth(id: string, data: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(data),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/${id}/cancel-auth`, fetchOptions)
  }

}

export default AuthProcessRequestsModule
