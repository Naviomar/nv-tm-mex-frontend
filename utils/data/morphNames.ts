const paymentableName = (payment: any) => {
  if (payment === null) {
    return 'Unknown'
  }
  if (payment.paymentable_type?.includes('BankMovement')) {
    return 'Bank movement'
  }
  if (payment.paymentable_type?.includes('ConsigneeCreditNote')) {
    return 'Consignee credit note'
  }
  if (payment.paymentable_type?.includes('ReqAdvancePayment')) {
    return 'Supplier advance payment'
  }
  if (payment.paymentable_type?.includes('PartyCreditNote')) {
    return 'Free format credit note'
  }
  // Unified CreditNote model
  if (payment.paymentable_type?.includes('CreditNote') && !payment.paymentable_type?.includes('LineCreditNote')) {
    if (payment.paymentable?.type === 'party') {
      return 'Free format credit note'
    }
    return 'Credit note'
  }

  if (payment.paymentable_type?.includes('LineCreditNote')) {
    return 'Freight line credit note'
  }

  if (payment.paymentable_type?.includes('Payable')) {
    // TODO if has payable object get the type
    if (payment.paymentable?.payable_option_id === 1) {
      return 'Bank commission'
    }
    if (payment.paymentable?.payable_option_id === 2) {
      return 'Advance payment'
    }
    return 'Payable option'
  }
  return 'Unknown'
}

const paymentChargeableName = (payment: any) => {
  if (!payment.chargeable_type) {
    return 'Unknown'
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

const invoiceableName = (invoice: any) => {
  if (invoice == null) {
    return 'Unknown'
  }

  if (invoice.invoiceable_type?.includes('ReqAdvancePayment')) {
    return `Advance payment request #${invoice.invoiceable_id}`
  }
  return 'Unknown'
}

export { paymentableName, paymentChargeableName, invoiceableName }
