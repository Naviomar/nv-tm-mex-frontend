import { type FetchOptions } from 'ofetch'
import FetchFactory from '../../factory'

class EmailTemplatesModule extends FetchFactory<any> {
  private RESOURCE = '/admin/email-templates'

  async list(fetchOptions?: FetchOptions) {
    return this.call('GET', this.RESOURCE, fetchOptions)
  }

  async components(module?: string, fetchOptions?: FetchOptions) {
    const query = module ? `?module=${encodeURIComponent(module)}` : ''
    return this.call('GET', `${this.RESOURCE}/components${query}`, fetchOptions)
  }

  async show(id: number, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/${id}`, fetchOptions)
  }

  async variables(id: number, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/${id}/variables`, fetchOptions)
  }

  async createVersion(id: number, body: any, fetchOptions?: FetchOptions) {
    return this.call('POST', `${this.RESOURCE}/${id}/versions`, { body, ...fetchOptions })
  }

  async updateVersion(versionId: number, body: any, fetchOptions?: FetchOptions) {
    return this.call('POST', `${this.RESOURCE}/versions/${versionId}`, { body, ...fetchOptions })
  }

  async duplicateVersion(versionId: number, fetchOptions?: FetchOptions) {
    return this.call('POST', `${this.RESOURCE}/versions/${versionId}/duplicate`, fetchOptions)
  }

  async archiveVersion(versionId: number, fetchOptions?: FetchOptions) {
    return this.call('POST', `${this.RESOURCE}/versions/${versionId}/archive`, fetchOptions)
  }

  async publishVersion(versionId: number, fetchOptions?: FetchOptions) {
    return this.call('POST', `${this.RESOURCE}/versions/${versionId}/publish`, fetchOptions)
  }

  async validateVersion(versionId: number, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/versions/${versionId}/validate`, fetchOptions)
  }

  async diffVersion(versionId: number, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/versions/${versionId}/diff`, fetchOptions)
  }

  async preview(id: number, body: any, fetchOptions?: FetchOptions) {
    return this.call('POST', `${this.RESOURCE}/${id}/preview`, { body, ...fetchOptions })
  }

  async testSend(id: number, body: any, fetchOptions?: FetchOptions) {
    return this.call('POST', `${this.RESOURCE}/${id}/test-send`, { body, ...fetchOptions })
  }

  async resolveReference(q: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/resolve-reference?q=${encodeURIComponent(q)}`, fetchOptions)
  }

  async componentPreview(key: string, referenceId?: number, fetchOptions?: FetchOptions) {
    const params = referenceId ? `?key=${encodeURIComponent(key)}&reference_id=${referenceId}` : `?key=${encodeURIComponent(key)}`
    return this.call('GET', `${this.RESOURCE}/component-preview${params}`, fetchOptions)
  }
}

export default EmailTemplatesModule
