import { currencies } from '@/utils/data/systemData'
import moment from 'moment-timezone'
interface MyObject {
  [key: string]: any // This allows any string key with any value type
}

const formatDateString = (dateString: string) => {
  if (dateString == null) {
    return ''
  }
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  const date = moment.tz(dateString, 'America/Mexico_City');

  const day = date.date()
  const month = months[date.month()]
  const year = date.year()

  let hours = date.hour()
  const minutes = date.minute()
  const ampm = hours >= 12 ? 'PM' : 'AM'

  hours = hours % 12
  hours = hours ? hours : 12 // the hour '0' should be '12'
  const minutesStr = minutes < 10 ? '0' + minutes : minutes

  return `${day} ${month} ${year} ${hours}:${minutesStr} ${ampm}`
}

const formatDateOnlyString = (dateString: any) => {
  if (dateString == null) {
    return ''
  }
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  const date = moment.tz(dateString, 'YYYY-MM-DD HH:mm:ss', 'America/Mexico_City');

  const day = date.date()
  const month = months[date.month()]
  const year = date.year()

  return `${day} ${month} ${year}`
}

const setNullForUndefined = (obj: MyObject) => {
  if (typeof obj === 'object' && obj !== null) {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        obj[key] = setNullForUndefined(obj[key])
      }
    }
  } else if (obj === undefined) {
    return null
  }

  return obj
}

const formatToCurrency = (value: number | null | undefined) => {
  if (value === null || value === undefined) return '$0.00'
  const valueNumber = parseFloat(value.toString())
  if (isNaN(valueNumber)) return `$${value}`
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(valueNumber)
}

const objectToQueryString = (obj: any, prefix = ''): string => {
  const pairs = []

  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) {
      continue // Skip null or undefined values
    }

    const prefixedKey = prefix ? `${prefix}[${encodeURIComponent(key)}]` : encodeURIComponent(key)

    if (typeof value === 'object') {
      pairs.push(...objectToQueryString(value, prefixedKey))
    } else {
      pairs.push(`${prefixedKey}=${encodeURIComponent(value as string)}`)
    }
  }

  return pairs.join('&')
}

const flattenArraysToCommaSeparatedString = (obj: any) => {
  return Object.keys(obj).reduce((acc: any, key) => {
    if (Array.isArray(obj[key])) {
      // Convert array to comma-separated string and add to accumulator
      acc[key] = obj[key].join(',')
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      // Recursively process nested objects
      acc[key] = flattenArraysToCommaSeparatedString(obj[key])
    } else {
      // Copy over primitive values as is
      acc[key] = obj[key]
    }
    return acc
  }, {})
}

const getInvoiceCurrenciesTotal = (invoice: any) => {
  if (!invoice.invoice_total) return []
  const totales = Object.keys(invoice.invoice_total).map((currency_id: any) => {
    // console.log('currency_id', currency_id)
    // console.log('total', invoice.invoice_total[currency_id])
    const currency = currencies.find((c) => c.id == currency_id)
    return `${currency?.name}: ${formatToCurrency(invoice.invoice_total[currency_id])}`
  })
  return totales
}

const getCurrencyName = (currency_id: any) => {
  const currency = currencies.find((c) => c.id == currency_id)
  return currency?.name
}

const getInvoiceableGlobalNumberId = (invoice: any) => {
  if (!invoice) return 'Unknown'
  const invoiceableType = invoice.invoiceable_type || ''
  if (invoiceableType.includes('InvoiceSeaTm')) {
    return invoice.invoice_number
  }
  if (invoiceableType.includes('InvoiceSeaWm')) {
    return invoice.invoice_number
  }
  if (invoiceableType.includes('InvoiceAirTm')) {
    return invoice.invoice_number
  }
  if (invoiceableType.includes('InvoiceAirWm')) {
    return invoice.invoice_number
  }
  if (invoiceableType.includes('FfPayment')) {
    return invoice.invoiceable_id
  }
  if (invoiceableType.includes('LineInvoiceRef')) {
    return invoice.invoiceable_id
  }
  if (invoiceableType.includes('SupplierReqPayment')) {
    return invoice.invoiceable_id
  }
  if (invoiceableType.includes('ReqAdvancePayment')) {
    return invoice.invoiceable_id
  }
  if (invoiceableType.includes('ReqRefund')) {
    return invoice.invoiceable_id
  }
  if (invoiceableType.includes('PartyInvoice')) {
    return invoice.invoice_number
  }

  return invoice.invoiceable_id
}


const getInvoiceableName = (invoice: any) => {
  if (!invoice) return 'Unknown'
  const invoiceableType = invoice.invoiceable_type || ''
  if (invoiceableType.includes('InvoiceSeaTm')) {
    return 'Sea TM invoice'
  }
  if (invoiceableType.includes('InvoiceSeaWm')) {
    return 'Sea WM invoice'
  }
  if (invoiceableType.includes('InvoiceAirTm')) {
    return 'Air TM invoice'
  }
  if (invoiceableType.includes('InvoiceAirWm')) {
    return 'Air WM invoice'
  }
  if (invoiceableType.includes('FfPayment')) {
    return 'F.F. Payment invoice'
  }
  if (invoiceableType.includes('LineInvoiceRef')) {
    return 'Freight invoice'
  }
  if (invoiceableType.includes('SupplierReqPayment')) {
    return 'Supplier Req. Payment'
  }
  if (invoiceableType.includes('ReqAdvancePayment')) {
    return 'Supplier Req. Advance Payment'
  }
  if (invoiceableType.includes('ReqRefund')) {
    return 'Refund'
  }
  if (invoiceableType.includes('PartyInvoice')) {
    return 'Party invoice'
  }
  if (invoiceableType.includes('ReqDemurrage')) {
    return 'Req. Demurrages'
  }
  if (invoiceableType.includes('ReqDetention')) {
    return 'Req. Detentions'
  }

  return 'Unknown'
}

const getInvoiceableLink = (invoice: any) => {
  const invoiceableName = getInvoiceableName(invoice)
  if (invoiceableName === 'Sea TM invoice') {
    return `/invoices/search/tm-view-${invoice.invoiceable_id}`
  }
  if (invoiceableName === 'Sea WM invoice') {
    return `/invoices/search/wm-view-${invoice.invoiceable_id}`
  }
  if (invoiceableName === 'Air TM invoice') {
    return `/invoices/search/tm-air-view-${invoice.invoiceable_id}`
  }
  if (invoiceableName === 'Air WM invoice') {
    return `/invoices/search/wm-air-view-${invoice.invoiceable_id}`
  }
  if (invoiceableName === 'F.F. Payment invoice') {
    return `/payments/agents/payments/view-${invoice.invoiceable_id}`
  }
  if (invoiceableName === 'Freight invoice') {
    return `/invoices/lines/notes/view-${invoice.invoiceable_id}`
  }
  if (invoiceableName === 'Supplier Req. Payment') {
    return `/invoices/suppliers/cfdis/request-payment/view-${invoice.invoiceable_id}`
  }
  if (invoiceableName === 'Supplier Req. Advance Payment') {
    // TODO estos no se pagan, mas bien se usan cuando se genera la solicitud de pago a proveedores.
    return `/advance-payments/view-${invoice.invoiceable_id}`
  }
  if (invoiceableName === 'Refund') {
    return `/refunds/view-${invoice.invoiceable_id}`
  }
  if (invoiceableName === 'Party invoice') {
    return `/invoices/search/free-format/view-${invoice.invoiceable_id}`
  }

  if (invoiceableName === 'Req. Demurrages') {
    return `/invoices/search/lines/demurrages/req-pay-view-${invoice.invoiceable_id}`
  }
  if (invoiceableName === 'Req. Detentions') {
    return `/invoices/search/lines/detentions/req-pay-view-${invoice.invoiceable_id}`
  }

  return null
}

const getPaymentableLink = (payment: any) => {
  if (payment.paymentable_type?.includes('BankMovement')) {
    return `/transfers/global/view-${payment.paymentable_id}?focusPayable=${payment.id}`
  }
  if (payment.paymentable_type?.includes('ConsigneeCreditNote') ||
      (payment.paymentable_type?.includes('CreditNote') && !payment.paymentable_type?.includes('LineCreditNote'))) {
    return `/invoices/search/credit-notes/view-${payment.paymentable_id}`
  }
  if (payment.paymentable_type?.includes('ReqAdvancePayment')) {
    return `/advance-payments/view-${payment.paymentable_id}`
  }
}

const getPaymentChargeableName = (payment: any) => {
  if (!payment.chargeable) {
    return 'Unknown'
  }

  if (payment.chargeable_type.includes('InvoiceCharge')) {
    return payment.chargeable?.charge?.name || 'Unknown'
  }

  if (payment.chargeable_type.includes('ServicePayment')) {
    let text = ''
    text += `${payment.chargeable?.charge?.name || 'Unknown'}`
    if (payment.chargeable.container) {
      text += ` Cont. (${payment.chargeable.container.container_number})`
    }
    return text
  }

  return 'Unknown'
}

export {
  formatToCurrency,
  formatDateString,
  formatDateOnlyString,
  setNullForUndefined,
  objectToQueryString,
  flattenArraysToCommaSeparatedString,
  getInvoiceCurrenciesTotal,
  getInvoiceableGlobalNumberId,
  getCurrencyName,
  getInvoiceableName,
  getInvoiceableLink,
  getPaymentableLink,
  getPaymentChargeableName,
}
