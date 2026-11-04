// Shared labels, colors and file helpers of the Rebate module (containers, payment requests and detail).
export const REBATE_PAYMENT_STATUS: Record<string, { label: string; color: string; icon: string }> = {
  requested: { label: 'Requested', color: 'warning', icon: 'mdi-email-fast-outline' },
  authorized: { label: 'Authorized', color: 'info', icon: 'mdi-check-decagram' },
  in_process: { label: 'In process', color: 'primary', icon: 'mdi-progress-clock' },
  paid: { label: 'Paid', color: 'success', icon: 'mdi-cash-check' },
  cancelled: { label: 'Cancelled', color: 'grey', icon: 'mdi-close-octagon-outline' },
}

// Why a container is held (codes come from the backend checks).
export const REBATE_HOLD_REASONS: Record<string, { label: string; text: string; icon: string }> = {
  debt: { label: 'Owes', text: 'The customer has a pending balance (click to see it)', icon: 'mdi-cash-remove' },
  no_empty_date: { label: 'No empty date', text: 'A container has no empty-return date', icon: 'mdi-calendar-remove-outline' },
  pending_invoice: { label: 'To invoice', text: 'There are charges pending to invoice', icon: 'mdi-receipt-text-clock-outline' },
  demurrage: { label: 'Demurrage', text: 'Demurrage is not invoiced or not paid', icon: 'mdi-timer-sand' },
  special_case: { label: 'Special case', text: 'Its demurrage is still being covered by a special case with the freight of new references (click to see the progress)', icon: 'mdi-folder-star-outline' },
  check_failed: { label: 'Check failed', text: 'The checks could not run; they will be retried', icon: 'mdi-alert-circle-outline' },
}

export function useRebate() {
  const paymentStatus = (status: string) => REBATE_PAYMENT_STATUS[status] ?? { label: status, color: 'grey', icon: 'mdi-help-circle-outline' }
  const holdReasons = (codes?: string | null) =>
    (codes ?? '')
      .split(',')
      .filter(Boolean)
      .map((code) => ({ code, ...(REBATE_HOLD_REASONS[code] ?? { label: code, text: code, icon: 'mdi-help-circle-outline' }) }))

  function saveBlob(blob: Blob, name: string) {
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${name}-${new Date().toISOString().slice(0, 10)}.xlsx`
    link.click()
    window.URL.revokeObjectURL(url)
  }

  return { paymentStatus, holdReasons, saveBlob }
}
