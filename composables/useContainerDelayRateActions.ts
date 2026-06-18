import type { RateOp } from './useContainerDelayRates'

export const CONTAINER_DELAY_RATES_PROCESS = 'container-delay-rates.apply-changes'

/**
 * Centralizes every write to container delay rates.
 * A write is modeled as a batch of operations (RateOp[]). If the user has the
 * required permissions the batch runs directly; otherwise it is packaged into a
 * process authorization request that carries the data and is applied on approval.
 */
export function useContainerDelayRateActions() {
  const { $api } = useNuxtApp()
  const { hasPermission } = useCheckUser()

  const canCreate = computed(() => hasPermission('container-delay-rates-create'))
  const canEdit = computed(() => hasPermission('container-delay-rates-edit'))
  const canDelete = computed(() => hasPermission('container-delay-rates-delete'))

  function requiredPermissions(ops: RateOp[]) {
    return {
      create: ops.some((op) => op.action === 'create'),
      edit: ops.some((op) => op.action === 'update'),
      delete: ops.some((op) => op.action === 'delete'),
    }
  }

  function canExecuteDirect(ops: RateOp[]) {
    const req = requiredPermissions(ops)
    if (req.create && !canCreate.value) return false
    if (req.edit && !canEdit.value) return false
    if (req.delete && !canDelete.value) return false
    return true
  }

  /**
   * Runs the batch against the row-based API.
   * Updates run first (auto-close of open-ended periods must land before new
   * rates are created), then deletes, then creates.
   */
  async function executeDirect(ops: RateOp[], lineId: number) {
    const updates = ops.filter((op): op is Extract<RateOp, { action: 'update' }> => op.action === 'update')
    const deletes = ops.filter((op): op is Extract<RateOp, { action: 'delete' }> => op.action === 'delete')
    const creates = ops.filter((op): op is Extract<RateOp, { action: 'create' }> => op.action === 'create')

    for (const op of updates) {
      await $api.containerDelayRates.updateRate(`${op.rate_id}`, {
        line_id: lineId,
        container_type_id: op.container_type_id,
        rate_type: op.rate_type,
        amount: op.amount,
        start_date: op.start_date,
        end_date: op.end_date,
      })
    }

    for (const op of deletes) {
      await $api.containerDelayRates.deleteRate(`${op.rate_id}`)
    }

    for (const op of creates) {
      await $api.containerDelayRates.createRates({
        line_id: lineId,
        container_type_ids: [op.container_type_id],
        all_containers: false,
        rate_type: op.rate_type,
        amount: op.amount,
        start_date: op.start_date,
        end_date: op.end_date,
      })
    }
  }

  /**
   * Packages the batch into a process authorization request. The backend applies
   * `process_data.operations` once the request is approved. Users may submit as
   * many requests as needed; nothing is blocked.
   */
  async function submitAsRequest(params: {
    lineId: number
    lineName?: string | null
    ops: RateOp[]
    reason: string
    displayName: string
  }) {
    return $api.authProcessRequests.requestAuthorization({
      process_name: CONTAINER_DELAY_RATES_PROCESS,
      request_key: String(params.lineId),
      display_name: params.displayName,
      reason: params.reason,
      process_data: {
        line_id: params.lineId,
        line_name: params.lineName ?? null,
        operations: params.ops,
      },
    })
  }

  async function loadLineRequests(lineId: number) {
    return $api.authProcessRequests.getRequestsByResource({
      process_name: CONTAINER_DELAY_RATES_PROCESS,
      request_key: String(lineId),
    })
  }

  return {
    canCreate,
    canEdit,
    canDelete,
    requiredPermissions,
    canExecuteDirect,
    executeDirect,
    submitAsRequest,
    loadLineRequests,
  }
}
