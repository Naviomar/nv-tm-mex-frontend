import type { IAlert } from '~/repository/modules/alerts'

export interface AlertFact {
  label: string
  value: string
  icon?: string
}

export type AlertVisual =
  | { kind: 'buy-sell'; buy: number; sell: number; difference: number; marginPct: number | null }
  | { kind: 'mail'; outcome: MailOutcome; notification: string }

export type MailOutcome = 'sent_via_cc_fallback' | 'not_sent' | 'no_recipient'

export interface AlertView {
  headline: string
  subject: string | null
  subjectIcon: string | null
  facts: AlertFact[]
  visual: AlertVisual | null
  /** Texto libre que no se pudo estructurar; se muestra completo (expandible). */
  body: string | null
  cta: { label: string; icon: string } | null
}

export const MAIL_OUTCOMES: Record<MailOutcome, { label: string; hint: string; color: string; icon: string }> = {
  sent_via_cc_fallback: {
    label: 'Enviado solo a usuarios internos',
    hint: 'El cliente no tiene correo TO para esta notificación: se usó el CC interno como destinatario.',
    color: 'warning',
    icon: 'mdi-email-alert-outline',
  },
  not_sent: {
    label: 'Correo NO enviado',
    hint: 'No hay ningún correo TO/CC ni en el catálogo del cliente ni en el de notificaciones.',
    color: 'error',
    icon: 'mdi-email-off-outline',
  },
  no_recipient: {
    label: 'Sin destinatario',
    hint: 'El correo se intentó enviar sin ningún destinatario TO.',
    color: 'error',
    icon: 'mdi-email-remove-outline',
  },
}

const PENDING_CUSTOMER_TYPES = [
  'reference_missing_consignee',
  'reference_missing_consignee_warning',
  'reference_missing_consignee_critical',
]

/** "App\\Mail\\Mexico\\SeaVoyageDestUpdatedEtaConsignee" → "Sea Voyage Dest Updated Eta Consignee" */
export const humanizeClass = (value: string | null | undefined): string => {
  if (!value) return 'Desconocida'
  const base = value.split('\\').pop() || value
  return base.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
}

const operationLabel = (impoExpo: string | null | undefined) =>
  impoExpo === 'E' ? 'Exportación marítima' : impoExpo === 'I' ? 'Importación marítima' : null

const toNumber = (value: unknown): number | null => {
  const n = typeof value === 'string' ? Number(value) : (value as number)
  return typeof n === 'number' && Number.isFinite(n) ? n : null
}

const presentBuySell = (alert: IAlert): AlertView | null => {
  const d = alert.data || {}
  const buy = toNumber(d.buy_rate)
  const sell = toNumber(d.sell_rate)
  if (buy === null || sell === null) return null

  const difference = toNumber(d.difference) ?? buy - sell
  const operation = operationLabel(d.impo_expo)

  return {
    headline: 'Compra mayor a venta',
    subject: d.reference_number || null,
    subjectIcon: 'mdi-file-document-outline',
    facts: operation ? [{ label: 'Operación', value: operation, icon: 'mdi-ferry' }] : [],
    visual: { kind: 'buy-sell', buy, sell, difference, marginPct: sell > 0 ? (-difference / sell) * 100 : null },
    body: null,
    cta: { label: 'Revisar rates', icon: 'mdi-cash-edit' },
  }
}

const presentMissingTo = (alert: IAlert): AlertView => {
  const d = alert.data || {}
  const mailClass = d.mail_notification_class || d.mailable_class || d.notification_class
  const outcome: MailOutcome = d.outcome === 'not_sent' || d.outcome === 'sent_via_cc_fallback'
    ? d.outcome
    : 'no_recipient'
  const hasCustomer = Boolean(d.consignee_name)
  const facts: AlertFact[] = []
  if (d.subject) facts.push({ label: 'Asunto', value: d.subject, icon: 'mdi-text-short' })

  return {
    headline: hasCustomer ? 'Cliente sin correo de destino' : 'Correo sin destinatario',
    subject: d.consignee_name || null,
    subjectIcon: hasCustomer ? 'mdi-domain' : null,
    facts,
    visual: { kind: 'mail', outcome, notification: humanizeClass(mailClass) },
    body: null,
    cta: hasCustomer ? { label: 'Configurar correos del cliente', icon: 'mdi-email-edit-outline' } : null,
  }
}

const presentPendingCustomer = (alert: IAlert): AlertView => {
  const d = alert.data || {}
  return {
    headline: 'Referencia sin cliente',
    subject: d.reference_number || null,
    subjectIcon: 'mdi-file-document-outline',
    facts: [
      { label: 'Bloqueado', value: 'Correos al cliente y facturación', icon: 'mdi-lock-outline' },
    ],
    visual: null,
    body: 'Solicita el registro del cliente con su información completa y asígnalo a la referencia.',
    cta: { label: 'Asignar cliente', icon: 'mdi-account-plus-outline' },
  }
}

const presentGeneric = (alert: IAlert): AlertView => ({
  headline: alert.title,
  subject: null,
  subjectIcon: null,
  facts: [],
  visual: null,
  body: alert.message,
  cta: alert.action_url ? { label: 'Abrir', icon: 'mdi-open-in-new' } : null,
})

export const presentAlert = (alert: IAlert): AlertView => {
  const code = alert.alert_type_code

  if (code === 'sea_buy_rate_greater_sell_rate') return presentBuySell(alert) ?? presentGeneric(alert)
  if (code === 'consignee_missing_to_email') return presentMissingTo(alert)
  if (code && PENDING_CUSTOMER_TYPES.includes(code)) return presentPendingCustomer(alert)

  return presentGeneric(alert)
}

export const SEVERITY_META: Record<string, { label: string; color: string; icon: string; order: number }> = {
  critical: { label: 'Crítica', color: 'error', icon: 'mdi-alert-octagon', order: 0 },
  error: { label: 'Error', color: 'error', icon: 'mdi-alert-circle', order: 1 },
  warning: { label: 'Advertencia', color: 'warning', icon: 'mdi-alert', order: 2 },
  info: { label: 'Info', color: 'info', icon: 'mdi-information', order: 3 },
}

export const severityMeta = (severity: string | null | undefined) =>
  SEVERITY_META[severity || ''] || { label: 'Aviso', color: 'grey', icon: 'mdi-bell', order: 4 }

/** Agrupa por día relativo para separar visualmente el listado. */
export const alertDayGroup = (dateString: string): string => {
  const date = new Date(dateString)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diffDays = Math.floor((today.getTime() - new Date(date).setHours(0, 0, 0, 0)) / 86400000)

  if (diffDays <= 0) return 'Hoy'
  if (diffDays === 1) return 'Ayer'
  if (diffDays < 7) return 'Esta semana'
  if (diffDays < 30) return 'Este mes'
  return 'Anteriores'
}
