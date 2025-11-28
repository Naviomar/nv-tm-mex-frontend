import { type FetchOptions, type $Fetch } from 'ofetch'
import objectToFormData from '~/utils/toFormData'
import FetchFactory from '../../factory'

class TestServicesModule extends FetchFactory<any> {
  private RESOURCE = '/referencias/sea-import'

  async processPdf(id: string, files: any, fetchOptions?: FetchOptions) {
    const body = objectToFormData(files)
    fetchOptions = {
      method: 'POST',
      body: body,
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/${id}/revalidation/add-original-pdf`, fetchOptions)
  }

  async previewPdfToSeal(referenciaId: string, fetchOptions?: FetchOptions) {
    // response type: Blob
    fetchOptions = {
      method: 'GET',
      responseType: 'json',
      ...fetchOptions,
    }
    return this.call('GET', `${this.RESOURCE}/${referenciaId}/revalidation/preview-pdf-to-seal`, fetchOptions)
  }

  async addSeal(id: string, formdata: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      method: 'POST',
      body: formdata,
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/${id}/revalidation/save-pdf-sellos`, fetchOptions)
  }
}

export default TestServicesModule
