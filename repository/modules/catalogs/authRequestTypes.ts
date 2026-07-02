import { type FetchOptions } from 'ofetch'
import FetchFactory from '../../factory'

export interface IDefaultCcUser {
  id: number
  name: string
  email: string
}

export interface IFormFieldOption {
  label: string
  value: string | number
}

export interface IFormField {
  type: 'text' | 'textarea' | 'radio' | 'select' | 'checkbox' | 'number' | 'autocomplete'
  name: string
  label: string
  required?: boolean
  required_when?: { field: string; equals: any }
  show_when?: { field: string; equals: any }
  options?: IFormFieldOption[]
  /** Key into fieldCatalogs provided by the parent component */
  catalog?: string
  hint?: string
  prepend_inner_icon?: string
}

// ── Template interfaces ────────────────────────────────────────────────────

export type ITemplateElementType = 'form_field' | 'section' | 'text_block' | 'alert_block' | 'charge_builder' | 'invoice_charge_builder'
export type IAlertBlockType = 'info' | 'warning' | 'error' | 'success'

export interface ITemplateElementBase {
  id: string
  type: ITemplateElementType
}

export interface ITemplateElementFormField extends ITemplateElementBase {
  type: 'form_field'
  field: IFormField
}

export interface ITemplateElementSection extends ITemplateElementBase {
  type: 'section'
  title: string
}

export interface ITemplateElementTextBlock extends ITemplateElementBase {
  type: 'text_block'
  text: string
}

export interface ITemplateElementAlertBlock extends ITemplateElementBase {
  type: 'alert_block'
  alert_text: string
  alert_type: IAlertBlockType
}

/**
 * Code-driven element: renders the multi-charge builder (Compra/Venta).
 * Not editable via the template editor — only add/remove.
 * charges_catalog_key: key into fieldCatalogs that provides the charges list.
 */
export interface ITemplateElementChargeBuilder extends ITemplateElementBase {
  type: 'charge_builder'
  charges_catalog_key: string
}

/**
 * Code-driven element: renders invoice search + charge picker for credit notes.
 * credit_note_id_key: key in processData that holds the credit note ID.
 */
export interface ITemplateElementInvoiceChargeBuilder extends ITemplateElementBase {
  type: 'invoice_charge_builder'
  credit_note_id_key: string
}

export type ITemplateElement =
  | ITemplateElementFormField
  | ITemplateElementSection
  | ITemplateElementTextBlock
  | ITemplateElementAlertBlock
  | ITemplateElementChargeBuilder
  | ITemplateElementInvoiceChargeBuilder

export interface ITemplateReasonField {
  show: boolean
  label: string
  required: boolean
  rows?: number
}

export interface ITemplateButtonLabels {
  submit: string
  cancel: string
}

export interface IRequestTemplate {
  title: string | null
  subtitle: string | null
  reason: ITemplateReasonField
  buttons: ITemplateButtonLabels
  elements: ITemplateElement[]
}

// ── Model ──────────────────────────────────────────────────────────────────

export interface IAuthRequestType {
  id: number
  kind: 'authorization' | 'process' | 'support'
  code: string
  description: string
  redirect: string | null
  key_label: string | null
  icon: string | null
  color: string | null
  is_active: boolean
  sort_order: number
  form_fields?: IFormField[] | null
  template?: IRequestTemplate | null
  default_cc_users?: IDefaultCcUser[]
  approvers?: IDefaultCcUser[]
  created_at: string
  updated_at: string
}

class AuthRequestTypesModule extends FetchFactory<IAuthRequestType[]> {
  private RESOURCE = '/auth-request-types'

  async getTypes(params?: { kind?: string; active?: boolean }, fetchOptions?: FetchOptions) {
    const query = params ? '?' + new URLSearchParams(params as any).toString() : ''
    return this.call('GET', `${this.RESOURCE}${query}`, fetchOptions)
  }

  async getTypeById(id: number, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/${id}`, fetchOptions)
  }

  async createType(form: Partial<IAuthRequestType>, fetchOptions?: FetchOptions) {
    return this.call('POST', this.RESOURCE, {
      body: form,
      ...fetchOptions,
    })
  }

  async updateType(id: number, form: Partial<IAuthRequestType>, fetchOptions?: FetchOptions) {
    return this.call('PUT', `${this.RESOURCE}/${id}`, {
      body: form,
      ...fetchOptions,
    })
  }

  async deleteType(id: number, fetchOptions?: FetchOptions) {
    return this.call('DELETE', `${this.RESOURCE}/${id}`, fetchOptions)
  }

  async getDefaultCcUsers(id: number): Promise<IDefaultCcUser[]> {
    return this.call('GET', `${this.RESOURCE}/${id}/default-cc-users`)
  }

  async addDefaultCcUser(id: number, userId: number): Promise<IDefaultCcUser[]> {
    return this.call('POST', `${this.RESOURCE}/${id}/default-cc-users`, { body: { user_id: userId } })
  }

  async removeDefaultCcUser(id: number, userId: number): Promise<IDefaultCcUser[]> {
    return this.call('DELETE', `${this.RESOURCE}/${id}/default-cc-users/${userId}`)
  }

  async getApprovers(id: number): Promise<IDefaultCcUser[]> {
    return this.call('GET', `${this.RESOURCE}/${id}/approvers`)
  }

  async addApprover(id: number, userId: number): Promise<IDefaultCcUser[]> {
    return this.call('POST', `${this.RESOURCE}/${id}/approvers`, { body: { user_id: userId } })
  }

  async removeApprover(id: number, userId: number): Promise<IDefaultCcUser[]> {
    return this.call('DELETE', `${this.RESOURCE}/${id}/approvers/${userId}`)
  }
}

export default AuthRequestTypesModule
