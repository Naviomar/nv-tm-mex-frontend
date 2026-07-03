export type LockedChargeKind = 'local' | 'reference' | 'sellrate'

interface AddLockedChargeParams {
  referenciaId: number
  chargeKind: LockedChargeKind
  chargeName: string
  reason: string
  chargeData: Record<string, any>
}

/**
 * Submits a process request to add a charge to a locked sea import reference.
 * On approval, the backend auto-creates the charge (sea-import.add-charge-locked).
 */
export function useSeaImportLockedChargeActions() {
  const { $api } = useNuxtApp()

  async function submitAddChargeRequest(params: AddLockedChargeParams) {
    const kindLabel = { local: 'Local charge', reference: 'Reference charge', sellrate: 'Sell rate charge' }[params.chargeKind]
    const displayName = `${kindLabel}: "${params.chargeName}" — Ref. #${params.referenciaId}`

    return ($api as any).authProcessRequests.requestAuthorization({
      process_name: 'sea-import.add-charge-locked',
      request_key: String(params.referenciaId),
      display_name: displayName,
      reason: params.reason,
      process_data: {
        charge_kind: params.chargeKind,
        referencia_id: params.referenciaId,
        charge_name: params.chargeName,
        charge_data: params.chargeData,
      },
    })
  }

  async function loadPendingRequests(referenciaId: number) {
    return ($api as any).authProcessRequests.getRequestsByResource({
      process_name: 'sea-import.add-charge-locked',
      request_key: String(referenciaId),
    })
  }

  return { submitAddChargeRequest, loadPendingRequests }
}
