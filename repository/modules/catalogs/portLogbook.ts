import { type FetchOptions } from 'ofetch'
import FetchFactory from '../../factory'

export interface IPortLogbookEntry {
  id: number
  port_id: number
  port?: { id: number; name: string; code: string; country?: { name: string } | null } | null
  event_type: string
  event_type_label: string
  event_name: string | null
  operations_status: string
  operations_status_label: string
  starts_at: string
  ends_at: string | null
  description: string | null
  status: 'scheduled' | 'active' | 'resolved'
  is_active: boolean
  created_at: string
  deleted_at: string | null
  creator?: { id: number; name: string } | null
}

class PortLogbookModule extends FetchFactory<any> {
  private RESOURCE = '/admin/port-logbook'

  async getEntries(fetchOptions?: FetchOptions) {
    return this.call('GET', this.RESOURCE, fetchOptions)
  }

  async getActive(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/active`, fetchOptions)
  }

  async getById(id: number | string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/${id}`, fetchOptions)
  }

  async getCalendar(from: string, to: string, filters: Record<string, any> = {}, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/calendar`, { query: { ...filters, from, to }, ...fetchOptions })
  }

  async getSummary(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/summary`, fetchOptions)
  }

  async getCatalogs(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/catalogs`, fetchOptions)
  }

  async getImpact(id: number | string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/${id}/impact`, fetchOptions)
  }

  async create(form: any, fetchOptions?: FetchOptions) {
    return this.call('POST', this.RESOURCE, { body: JSON.stringify(form), ...fetchOptions })
  }

  async update(id: number | string, form: any, fetchOptions?: FetchOptions) {
    return this.call('POST', `${this.RESOURCE}/${id}/update`, { body: JSON.stringify(form), ...fetchOptions })
  }

  /** Cierra el evento: el puerto reanuda operaciones (ends_at opcional, por defecto ahora). */
  async close(id: number | string, endsAt?: string | null, fetchOptions?: FetchOptions) {
    return this.call('POST', `${this.RESOURCE}/${id}/close`, {
      body: JSON.stringify({ ends_at: endsAt ?? null }),
      ...fetchOptions,
    })
  }

  async delete(id: number | string, fetchOptions?: FetchOptions) {
    return this.call('DELETE', `${this.RESOURCE}/${id}`, fetchOptions)
  }
}

export default PortLogbookModule
