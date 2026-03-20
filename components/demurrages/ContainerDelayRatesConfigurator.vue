<template>
  <v-card rounded="xl" variant="flat">
    <v-card-text class="space-y-6">
      <div class="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <div class="text-2xl font-semibold">
            {{ isEdit ? 'Edit line configuration' : 'Create line configuration' }}
          </div>
          <div class="text-sm opacity-70">
            Configure Rate 1 and Rate 2 by container. Each row can use its own start date and optional open-ended end date.
          </div>
        </div>

        <div class="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <v-btn variant="outlined" prepend-icon="mdi-arrow-left" class="w-full sm:w-auto" @click="goBack">Back</v-btn>
          <v-btn variant="outlined" prepend-icon="mdi-content-copy" class="w-full sm:w-auto" :disabled="!canCopyRate1ToRate2" @click="copyRate1ToRate2">
            Copy Rate 1 → Rate 2
          </v-btn>
          <v-btn variant="outlined" prepend-icon="mdi-refresh" class="w-full sm:w-auto" :disabled="!canSuggestFromExisting" @click="fillFromSuggested">
            Load suggested values
          </v-btn>
        </div>
      </div>

      <v-alert
        v-if="suggestionSummary"
        type="info"
        variant="tonal"
        density="compact"
        :text="suggestionSummary"
      />

      <v-alert
        v-if="errorState.show"
        type="error"
        variant="tonal"
        class="mt-2"
      >
        <div class="font-semibold mb-1">{{ errorState.message }}</div>
        <ul class="list-disc ml-5 space-y-1">
          <li v-for="(msg, index) in errorState.details" :key="`err-${index}`">{{ msg }}</li>
        </ul>
      </v-alert>

      <div class="grid grid-cols-1 gap-4 xl:grid-cols-[2fr_1fr]">
        <div class="space-y-4 min-w-0">
          <div class="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            <v-autocomplete
              v-model="form.line_id"
              :items="lines"
              item-title="name"
              item-value="id"
              label="Line"
              density="compact"
              variant="outlined"
              :readonly="isEdit"
              :disabled="isEdit || loading"
            />

            <v-text-field
              v-model="containerSearch"
              label="Filter containers"
              density="compact"
              variant="outlined"
              clearable
              prepend-inner-icon="mdi-magnify"
            />
          </div>

          <v-alert
            type="info"
            variant="tonal"
            density="compact"
            text="Set dates per container row. End date is optional: leave it empty to keep that row open-ended. Save creates or updates each rate row individually using the current API."
          />

          <div class="flex flex-wrap gap-3">
            <v-switch v-model="showOnlyChanged" label="Only changed / filled rows" hide-details color="primary" inset />
            <v-switch v-model="showOnlySuggested" label="Only suggested rows" hide-details color="warning" inset />
          </div>

          <v-card rounded="lg" variant="outlined">
            <v-card-text class="space-y-3">
              <div class="text-sm font-medium">Bulk actions</div>
              <div class="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto_auto]">
                <v-text-field
                  v-model="bulk.rate1"
                  label="Bulk Rate 1"
                  density="compact"
                  variant="outlined"
                  type="number"
                  prefix="$"
                  step="0.01"
                />
                <v-text-field
                  v-model="bulk.rate2"
                  label="Bulk Rate 2"
                  density="compact"
                  variant="outlined"
                  type="number"
                  prefix="$"
                  step="0.01"
                />
                <v-btn color="secondary" variant="outlined" class="w-full lg:min-w-[180px]" @click="applyBulkRate(1)">Apply Rate 1</v-btn>
                <v-btn color="secondary" variant="outlined" class="w-full lg:min-w-[180px]" @click="applyBulkRate(2)">Apply Rate 2</v-btn>
              </div>
            </v-card-text>
          </v-card>

          <div class="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            <v-card variant="tonal" color="primary" rounded="lg">
              <v-card-text>
                <div class="text-caption opacity-80">Rows to render</div>
                <div class="text-2xl font-semibold">{{ draftRows.length }}</div>
              </v-card-text>
            </v-card>

            <v-card variant="tonal" color="success" rounded="lg">
              <v-card-text>
                <div class="text-caption opacity-80">Rows with values</div>
                <div class="text-2xl font-semibold">{{ summary.withValues }}</div>
              </v-card-text>
            </v-card>

            <v-card variant="tonal" color="warning" rounded="lg">
              <v-card-text>
                <div class="text-caption opacity-80">Suggested cells</div>
                <div class="text-2xl font-semibold">{{ summary.suggestedCells }}</div>
              </v-card-text>
            </v-card>

            <v-card variant="tonal" color="info" rounded="lg">
              <v-card-text>
                <div class="text-caption opacity-80">Changed cells</div>
                <div class="text-2xl font-semibold">{{ summary.changedCells }}</div>
              </v-card-text>
            </v-card>
          </div>

          <div class="hidden md:block overflow-x-auto rounded-xl border">
            <v-table density="comfortable" class="min-w-full">
              <thead>
                <tr>
                  <th class="text-left">Container</th>
                  <th class="text-left">Start date</th>
                  <th class="text-left">End date (optional)</th>
                  <th class="text-left">Rate 1</th>
                  <th class="text-left">Rate 2</th>
                  <th class="text-left">State</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="row in visibleRows"
                  :key="`draft-${row.container_type_id}`"
                  :class="{
                    'bg-amber-50 dark:bg-amber-950': row.rate1.suggested || row.rate2.suggested,
                  }"
                >
                  <td class="font-medium whitespace-nowrap">{{ row.container_name }}</td>
                  <td class="min-w-[180px]">
                    <v-text-field
                      v-model="row.startDate"
                      density="compact"
                      variant="outlined"
                      type="date"
                      hide-details
                    />
                  </td>
                  <td class="min-w-[180px]">
                    <v-text-field
                      v-model="row.endDate"
                      density="compact"
                      variant="outlined"
                      type="date"
                      placeholder="Open ended"
                      hide-details
                    >
                      <template #append-inner>
                        <v-chip v-if="row.suggestedDates" color="warning" size="x-small" label>Suggested</v-chip>
                      </template>
                    </v-text-field>
                  </td>
                  <td>
                    <v-text-field
                      v-model="row.rate1.amount"
                      density="compact"
                      variant="outlined"
                      type="number"
                      prefix="$"
                      step="0.01"
                      hide-details
                    >
                      <template #append-inner>
                        <v-chip v-if="row.rate1.suggested" color="warning" size="x-small" label>Suggested</v-chip>
                      </template>
                    </v-text-field>
                  </td>
                  <td>
                    <v-text-field
                      v-model="row.rate2.amount"
                      density="compact"
                      variant="outlined"
                      type="number"
                      prefix="$"
                      step="0.01"
                      hide-details
                    >
                      <template #append-inner>
                        <v-chip v-if="row.rate2.suggested" color="warning" size="x-small" label>Suggested</v-chip>
                      </template>
                    </v-text-field>
                  </td>
                  <td>
                    <div class="flex flex-wrap gap-2">
                      <v-chip v-if="row.rate1.rowId || row.rate2.rowId" color="primary" size="small" label>Existing</v-chip>
                      <v-chip v-if="isRowChanged(row)" color="success" size="small" label>Changed</v-chip>
                      <v-chip v-if="areDatesChanged(row)" color="info" size="small" label>Dates changed</v-chip>
                      <v-chip v-if="!row.rate1.amount && !row.rate2.amount" color="default" size="small" label>Empty</v-chip>
                    </div>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </div>

          <div class="grid gap-3 md:hidden">
            <v-card v-for="row in visibleRows" :key="`draft-card-${row.container_type_id}`" rounded="lg" variant="outlined">
              <v-card-text class="space-y-3">
                <div class="flex items-start justify-between gap-3">
                  <div>
                    <div class="font-semibold">{{ row.container_name }}</div>
                    <div class="text-xs opacity-70">Set row-specific rates and dates</div>
                  </div>
                  <div class="flex flex-wrap justify-end gap-2">
                    <v-chip v-if="row.rate1.rowId || row.rate2.rowId" color="primary" size="small" label>Existing</v-chip>
                    <v-chip v-if="isRowChanged(row)" color="success" size="small" label>Changed</v-chip>
                    <v-chip v-if="areDatesChanged(row)" color="info" size="small" label>Dates changed</v-chip>
                    <v-chip v-if="!row.rate1.amount && !row.rate2.amount" color="default" size="small" label>Empty</v-chip>
                  </div>
                </div>

                <div class="grid grid-cols-1 gap-3">
                  <v-text-field
                    v-model="row.startDate"
                    label="Start date"
                    density="compact"
                    variant="outlined"
                    type="date"
                    hide-details
                  />
                  <div class="space-y-2">
                    <v-text-field
                      v-model="row.endDate"
                      label="End date (optional)"
                      density="compact"
                      variant="outlined"
                      type="date"
                      placeholder="Open ended"
                      hide-details
                    >
                      <template #append-inner>
                        <v-chip v-if="row.suggestedDates" color="warning" size="x-small" label>Suggested</v-chip>
                      </template>
                    </v-text-field>
                    <div class="text-xs opacity-60">Leave empty to keep this row open-ended.</div>
                  </div>
                  <v-text-field
                    v-model="row.rate1.amount"
                    label="Rate 1"
                    density="compact"
                    variant="outlined"
                    type="number"
                    prefix="$"
                    step="0.01"
                    hide-details
                  >
                    <template #append-inner>
                      <v-chip v-if="row.rate1.suggested" color="warning" size="x-small" label>Suggested</v-chip>
                    </template>
                  </v-text-field>
                  <v-text-field
                    v-model="row.rate2.amount"
                    label="Rate 2"
                    density="compact"
                    variant="outlined"
                    type="number"
                    prefix="$"
                    step="0.01"
                    hide-details
                  >
                    <template #append-inner>
                      <v-chip v-if="row.rate2.suggested" color="warning" size="x-small" label>Suggested</v-chip>
                    </template>
                  </v-text-field>
                </div>
              </v-card-text>
            </v-card>
          </div>
        </div>

        <div class="space-y-4 xl:sticky xl:top-4 self-start">
          <v-alert
            type="warning"
            variant="tonal"
            density="compact"
            title="Save behavior"
            text="Filled cells are created or updated individually against the current row-based API. Clearing an existing cell will deactivate that row."
          />

          <v-alert
            type="info"
            variant="tonal"
            density="compact"
            text="End date can be blank. A blank end date means the row stays open-ended until a later rate replaces it."
          />

          <div class="flex flex-col gap-2">
            <v-btn color="primary" size="large" :loading="submitting" @click="submitConfiguration">
              {{ isEdit ? 'Save configuration' : 'Create configuration' }}
            </v-btn>
            <v-btn variant="text" :disabled="submitting" @click="resetDraft">Reset</v-btn>
          </div>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import {
  asAmount,
  buildDraftRows,
  buildLineGroups,
  buildPeriodKey,
  cloneDraftRows,
  fetchAllContainerDelayRates,
  getPeriodLabel,
  toDateOnly,
  todayKey,
  type DraftRow,
  type NamedCatalog,
  type RateRow,
  type RateType,
} from '~/composables/useContainerDelayRates'

const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const router = useRouter()
const route = useRoute()
const loadingStore = useLoadingStore()

const props = defineProps<{
  mode?: 'create' | 'edit'
  rateId?: number | null
}>()

const isEdit = computed(() => (props.mode ?? 'create') === 'edit')

const lines = ref<NamedCatalog[]>([])
const containerTypes = ref<NamedCatalog[]>([])
const lineRows = ref<RateRow[]>([])
const periodRows = ref<RateRow[]>([])
const suggestedRows = ref<RateRow[]>([])
const initialDraftRows = ref<DraftRow[]>([])
const draftRows = ref<DraftRow[]>([])
const loading = ref(false)
const submitting = ref(false)
const containerSearch = ref('')
const showOnlyChanged = ref(false)
const showOnlySuggested = ref(false)
const anchorRate = ref<RateRow | null>(null)
const isHydrating = ref(true)

const bulk = reactive({
  rate1: null as number | null,
  rate2: null as number | null,
})

const form = reactive({
  line_id: null as number | null,
})

const errorState = reactive({
  show: false,
  message: '',
  details: [] as string[],
})

const sourceDuplicateLineId = computed(() => Number(route.query.duplicate_line_id || 0) || null)
const sourceDuplicateStart = computed(() => toDateOnly(`${route.query.duplicate_start_date || ''}`) || null)
const sourceDuplicateEnd = computed(() => toDateOnly(`${route.query.duplicate_end_date || ''}`) || null)
const selectedEditStart = computed(() => toDateOnly(`${route.query.start_date || ''}`) || null)
const selectedEditEnd = computed(() => toDateOnly(`${route.query.end_date || ''}`) || null)

const visibleRows = computed(() => {
  const query = containerSearch.value.trim().toLowerCase()
  return draftRows.value.filter((row) => {
    if (query && !row.container_name.toLowerCase().includes(query)) return false
    if (showOnlySuggested.value && !row.rate1.suggested && !row.rate2.suggested) return false
    if (showOnlyChanged.value && !isRowChanged(row) && !hasAnyAmount(row)) return false
    return true
  })
})

const canSuggestFromExisting = computed(() => suggestedRows.value.length > 0)
const canCopyRate1ToRate2 = computed(() => draftRows.value.some((row) => row.rate1.amount !== null && row.rate1.amount !== undefined))

const suggestionSummary = computed(() => {
  if (!canSuggestFromExisting.value) return ''
  return `Suggested values loaded from ${suggestedLabel.value}. Suggested cells are highlighted in amber.`
})

const suggestedLabel = computed(() => {
  if (sourceDuplicateLineId.value) {
    const lineName = lines.value.find((line) => line.id === sourceDuplicateLineId.value)?.name ?? `Line ${sourceDuplicateLineId.value}`
    return `${lineName} · ${getPeriodLabel(sourceDuplicateStart.value, sourceDuplicateEnd.value)}`
  }

  if (anchorRate.value) {
    return `the current active configuration for ${anchorRate.value.line?.name ?? `Line ${anchorRate.value.line_id}`}`
  }

  return 'the current line configuration'
})

const summary = computed(() => ({
  withValues: draftRows.value.filter((row) => hasAnyAmount(row)).length,
  suggestedCells: draftRows.value.reduce((acc, row) => acc + Number(row.rate1.suggested) + Number(row.rate2.suggested), 0),
  changedCells: draftRows.value.reduce((acc, row) => {
    return acc + Number(isCellChanged(row.rate1)) + Number(isCellChanged(row.rate2))
  }, 0),
}))

async function loadCatalogs() {
  const [ls, cts] = await Promise.all([
    $api.lines.getLines({ query: { perPage: 1000 } }),
    $api.containers.getAllTypes({ query: { perPage: 1000 } }),
  ])

  lines.value = (ls?.data ?? ls ?? []) as NamedCatalog[]
  containerTypes.value = (cts?.data ?? cts ?? []) as NamedCatalog[]
}

async function loadEditSource() {
  if (!isEdit.value || !props.rateId) return

  const rate = (await $api.containerDelayRates.getRate(`${props.rateId}`)) as RateRow
  anchorRate.value = rate
  form.line_id = rate.line_id

  const rows = await fetchAllContainerDelayRates($api, { line_id: rate.line_id })
  lineRows.value = rows
  const selectedPeriodKey = buildPeriodKey(
    selectedEditStart.value ?? rate.start_date,
    selectedEditEnd.value ?? rate.end_date
  )
  periodRows.value = rows.filter((row) => buildPeriodKey(row.start_date, row.end_date) === selectedPeriodKey)

  const activeGroups = buildLineGroups(rows, containerTypes.value, {
    includeEmptyContainers: true,
    lineId: rate.line_id,
    activeOnly: true,
    hideDeleted: true,
    onDate: todayKey(),
  })
  suggestedRows.value = activeGroups[0]?.periods[0]?.rawRows ?? []
}

async function loadDuplicateSource() {
  if (!sourceDuplicateLineId.value) return

  form.line_id = sourceDuplicateLineId.value
  await loadLineContext(sourceDuplicateLineId.value, {
    sourceStartDate: sourceDuplicateStart.value,
    sourceEndDate: sourceDuplicateEnd.value,
  })
}

function rebuildDraft() {
  const rows = buildDraftRows(containerTypes.value, periodRows.value, suggestedRows.value)

  if (!isEdit.value && sourceDuplicateEnd.value) {
    const nextDate = new Date(`${sourceDuplicateEnd.value}T00:00:00`)
    nextDate.setDate(nextDate.getDate() + 1)
    const nextStartDate = nextDate.toISOString().slice(0, 10)

    rows.forEach((row) => {
      row.startDate = nextStartDate
      row.endDate = null
    })
  }

  draftRows.value = cloneDraftRows(rows)
  initialDraftRows.value = cloneDraftRows(rows)
}

async function loadLineContext(
  lineId: number,
  options: {
    sourceStartDate?: string | null
    sourceEndDate?: string | null
  } = {}
) {
  const rows = await fetchAllContainerDelayRates($api, { line_id: lineId })
  lineRows.value = rows

  if (isEdit.value && anchorRate.value) {
    const periodKey = buildPeriodKey(anchorRate.value.start_date, anchorRate.value.end_date)
    periodRows.value = rows.filter((row) => buildPeriodKey(row.start_date, row.end_date) === periodKey)
  } else {
    periodRows.value = []
  }

  if (options.sourceStartDate || options.sourceEndDate) {
    const periodKey = buildPeriodKey(options.sourceStartDate, options.sourceEndDate)
    suggestedRows.value = rows.filter((row) => buildPeriodKey(row.start_date, row.end_date) === periodKey)
    return
  }

  const activeGroups = buildLineGroups(rows, containerTypes.value, {
    includeEmptyContainers: true,
    lineId,
    activeOnly: true,
    hideDeleted: true,
    onDate: todayKey(),
  })
  suggestedRows.value = activeGroups[0]?.periods[0]?.rawRows ?? []
}

function fillFromSuggested() {
  draftRows.value.forEach((row) => {
    if (row.suggestedDates) {
      row.startDate = row.startDate ?? todayKey()
    }

    if (row.rate1.suggested && row.rate1.amount !== null) {
      row.rate1.amount = asAmount(row.rate1.amount)
    }
    if (row.rate2.suggested && row.rate2.amount !== null) {
      row.rate2.amount = asAmount(row.rate2.amount)
    }
  })
}

function applyBulkRate(rateType: RateType) {
  const value = rateType === 1 ? bulk.rate1 : bulk.rate2
  if (value === null || value === undefined || value === ('' as any)) {
    snackbar.add({ type: 'error', text: `Enter a value for Bulk Rate ${rateType}.` })
    return
  }

  draftRows.value.forEach((row) => {
    if (rateType === 1) row.rate1.amount = Number(value)
    else row.rate2.amount = Number(value)
  })
}

function copyRate1ToRate2() {
  draftRows.value.forEach((row) => {
    row.rate2.amount = row.rate1.amount
  })
}

function resetDraft() {
  draftRows.value = cloneDraftRows(initialDraftRows.value)
  bulk.rate1 = null
  bulk.rate2 = null
  errorState.show = false
  errorState.message = ''
  errorState.details = []
}

function goBack() {
  router.push('/configuration/container-delay-rates')
}

function hasAnyAmount(row: DraftRow) {
  return row.rate1.amount !== null || row.rate2.amount !== null
}

function areDatesChanged(row: DraftRow) {
  return row.startDate !== row.originalStartDate || (row.endDate || null) !== (row.originalEndDate || null)
}

function isCellChanged(cell: DraftRow['rate1']) {
  return asAmount(cell.amount) !== asAmount(cell.originalAmount)
}

function isRowChanged(row: DraftRow) {
  return isCellChanged(row.rate1) || isCellChanged(row.rate2) || areDatesChanged(row)
}

async function submitConfiguration() {
  errorState.show = false
  errorState.message = ''
  errorState.details = []

  if (!form.line_id) {
    snackbar.add({ type: 'error', text: 'Select a line before saving.' })
    return
  }

  const invalidDateRow = draftRows.value.find((row) => {
    if (!hasAnyAmount(row)) return false
    if (!row.startDate) return true
    if (row.endDate && row.endDate < row.startDate) return true
    return false
  })

  if (invalidDateRow) {
    snackbar.add({ type: 'error', text: `Review dates for ${invalidDateRow.container_name}.` })
    return
  }

  try {
    submitting.value = true
    loadingStore.start()

    const tasks: Array<() => Promise<any>> = []

    draftRows.value.forEach((row) => {
      const cells = [
        { rateType: 1 as RateType, cell: row.rate1 },
        { rateType: 2 as RateType, cell: row.rate2 },
      ]

      cells.forEach(({ rateType, cell }) => {
        const amount = asAmount(cell.amount)
        const originalAmount = asAmount(cell.originalAmount)
        const startDate = row.startDate
        const endDate = row.endDate || null

        if (cell.rowId && amount === null) {
          tasks.push(() => $api.containerDelayRates.deleteRate(`${cell.rowId}`))
          return
        }

        if (amount === null) {
          return
        }

        if (cell.rowId) {
          const shouldUpdate =
            amount !== originalAmount ||
            startDate !== (cell.originalStartDate || null) ||
            endDate !== (cell.originalEndDate || null)

          if (shouldUpdate) {
            tasks.push(() =>
              $api.containerDelayRates.updateRate(`${cell.rowId}`, {
                line_id: form.line_id,
                container_type_id: row.container_type_id,
                rate_type: rateType,
                amount,
                start_date: startDate,
                end_date: endDate,
              })
            )
          }
          return
        }

        tasks.push(() =>
          $api.containerDelayRates.createRates({
            line_id: form.line_id,
            container_type_ids: [row.container_type_id],
            all_containers: false,
            rate_type: rateType,
            amount,
            start_date: startDate,
            end_date: endDate,
          })
        )
      })
    })

    for (const task of tasks) {
      await task()
    }

    snackbar.add({ type: 'success', text: isEdit.value ? 'Configuration updated' : 'Configuration created' })
    router.push('/configuration/container-delay-rates')
  } catch (error: any) {
    console.error(error)
    errorState.show = true
    errorState.message = error?.data?.message || 'Failed to save configuration'
    errorState.details = toErrorArray(error?.data?.errors)
    snackbar.add({ type: 'error', text: isEdit.value ? 'Error updating configuration' : 'Error creating configuration' })
  } finally {
    submitting.value = false
    setTimeout(() => loadingStore.stop(), 250)
  }
}

function toErrorArray(errorsObj: any): string[] {
  if (!errorsObj || typeof errorsObj !== 'object') return []
  const arr: string[] = []
  Object.keys(errorsObj).forEach((key) => {
    const value = errorsObj[key]
    if (Array.isArray(value)) arr.push(...value.map(String))
    else if (value) arr.push(String(value))
  })
  return arr
}

watch(
  () => form.line_id,
  async (lineId, previousLineId) => {
    if (isHydrating.value || isEdit.value || lineId === previousLineId) return

    if (!lineId) {
      lineRows.value = []
      periodRows.value = []
      suggestedRows.value = []
      rebuildDraft()
      return
    }

    await loadLineContext(lineId)
    rebuildDraft()
  }
)

onMounted(async () => {
  try {
    loading.value = true
    loadingStore.start()
    await loadCatalogs()
    await loadEditSource()
    await loadDuplicateSource()
    rebuildDraft()
  } finally {
    isHydrating.value = false
    loading.value = false
    setTimeout(() => loadingStore.stop(), 250)
  }
})
</script>
