import type { IAirImportDuplicateReference } from "~/repository/modules/catalogs/airImportReferences"

export function useAirImportMawbHawbDuplicateCheck(
  getMasterAwb: () => string | null | undefined,
  getHouseAwb: () => string | null | undefined,
  excludeAirReferenceId?: () => string | undefined
) {
  const { $api } = useNuxtApp()

  const duplicateWarning = ref<string | null>(null)
  const hasDuplicate = ref(false)
  const checkingDuplicate = ref(false)
  const existingReference = ref<IAirImportDuplicateReference | null>(null)
  const duplicateModalReferences = computed(() =>
    existingReference.value ? [existingReference.value] : []
  )

  let debounceTimer: ReturnType<typeof setTimeout> | null = null
  let requestId = 0

  const clearDuplicateState = () => {
    duplicateWarning.value = null
    hasDuplicate.value = false
    existingReference.value = null
  }

  const checkDuplicate = () => {
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }

    debounceTimer = setTimeout(async () => {
      const masterAwb = getMasterAwb()?.trim() ?? ''
      const houseAwb = getHouseAwb()?.trim() ?? ''

      if (!masterAwb || !houseAwb) {
        clearDuplicateState()
        return
      }

      const currentRequestId = ++requestId
      checkingDuplicate.value = true

      try {
        const response = await $api.airImport.searchDuplicateMawbHawb(
          masterAwb,
          houseAwb,
          excludeAirReferenceId?.()
        )

        if (currentRequestId !== requestId) {
          return
        }

        if (response.exists && response.existing_reference) {
          hasDuplicate.value = true
          existingReference.value = response.existing_reference
          duplicateWarning.value = `This MAWB + HAWB pair is already registered as ${response.existing_reference.reference_number}.`
        } else {
          clearDuplicateState()
        }
      } catch {
        if (currentRequestId === requestId) {
          clearDuplicateState()
        }
      } finally {
        if (currentRequestId === requestId) {
          checkingDuplicate.value = false
        }
      }
    }, 400)
  }

  watch(
    () => [getMasterAwb(), getHouseAwb(), excludeAirReferenceId?.()],
    () => checkDuplicate()
  )

  onBeforeUnmount(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }
  })

  const duplicatePairLabel = computed(() => {
    const master = getMasterAwb()?.trim() ?? ''
    const house = getHouseAwb()?.trim() ?? ''
    if (!master && !house) return ''
    return `${master} / ${house}`
  })

  return {
    duplicateWarning,
    hasDuplicate,
    checkingDuplicate,
    existingReference,
    duplicateModalReferences,
    duplicatePairLabel,
    checkDuplicate,
  }
}
