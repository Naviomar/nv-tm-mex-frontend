<template>
  <v-card rounded="xl" variant="flat">
    <v-card-text class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <div class="text-2xl font-semibold">Line rate configuration</div>
          <div class="text-sm opacity-70">
            Manage every rate period for a line. Create new periods (the previous open-ended period is closed
            automatically), edit existing ones, and review each container's history.
          </div>
        </div>
        <v-btn variant="outlined" prepend-icon="mdi-arrow-left" class="w-full sm:w-auto" @click="goBack">Back</v-btn>
      </div>

      <!-- Line selector -->
      <div class="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        <v-autocomplete
          v-model="lineId"
          :items="availableLines"
          item-title="name"
          item-value="id"
          label="Line"
          density="compact"
          variant="outlined"
          :readonly="isEdit"
          :disabled="isEdit || loading"
          @update:model-value="onLineChange"
        />
      </div>

      <v-alert v-if="pendingClone" type="info" variant="tonal" density="compact">
        Cloning rates from <strong>{{ cloneSourceName }}</strong>. Select a destination line — a new period will open
        pre-filled with those amounts.
      </v-alert>

      <!-- Permission / request banner -->
      <v-alert v-if="lineId && !canCreate && !canEdit && !canDelete" type="info" variant="tonal" density="compact">
        You have read-only access. Changes you make here are submitted for approval and applied automatically once granted.
      </v-alert>

      <v-alert v-if="pendingRequests.length" type="warning" variant="tonal" density="compact">
        {{ pendingRequests.length }} change request(s) pending approval for this line.
      </v-alert>

      <template v-if="lineId">
        <!-- Periods list -->
        <div class="flex items-center justify-between">
          <div class="text-lg font-semibold">Periods</div>
          <v-btn color="primary" size="small" prepend-icon="mdi-plus" @click="openNewPeriod">New period</v-btn>
        </div>

        <div v-if="!periods.length" class="text-sm opacity-60">No rate periods configured for this line yet.</div>

        <v-expansion-panels v-else variant="accordion">
          <v-expansion-panel v-for="period in periods" :key="period.key">
            <v-expansion-panel-title>
              <div class="flex flex-wrap items-center gap-2">
                <v-chip size="small" :color="periodStatusColor(period.status)" label>{{ period.status }}</v-chip>
                <span class="font-medium">{{ period.label }}</span>
                <v-chip size="x-small" variant="tonal" label>{{ period.rows.length }} containers</v-chip>
                <v-chip v-if="period.conflictsCount" size="x-small" color="warning" label>
                  {{ period.conflictsCount }} conflict(s)
                </v-chip>
                <v-chip v-if="period.incompleteCount" size="x-small" color="info" label>
                  {{ period.incompleteCount }} incomplete
                </v-chip>
              </div>
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <div class="flex flex-wrap gap-2 mb-3">
                <v-btn size="small" variant="outlined" prepend-icon="mdi-pencil" @click="openEditPeriod(period)">
                  Edit period
                </v-btn>
                <v-btn size="small" variant="outlined" prepend-icon="mdi-content-copy" @click="cloneToOtherLine(period)">
                  Clone to another line
                </v-btn>
              </div>
              <v-table density="compact">
                <thead>
                  <tr>
                    <th class="text-left">Container</th>
                    <th class="text-left">Rate 1</th>
                    <th class="text-left">Rate 2</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in period.rows" :key="`${period.key}-${row.container_type_id}`">
                    <td class="font-medium">{{ row.container_name }}</td>
                    <td>{{ row.rate1 ? formatCurrencyAmount(row.rate1.amount) : '—' }}</td>
                    <td>{{ row.rate2 ? formatCurrencyAmount(row.rate2.amount) : '—' }}</td>
                  </tr>
                </tbody>
              </v-table>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>

        <!-- Container history -->
        <v-divider />
        <div class="space-y-3">
          <div class="text-lg font-semibold">Container history</div>
          <v-autocomplete
            v-model="historyContainerId"
            :items="historyContainerOptions"
            item-title="name"
            item-value="id"
            label="Select container"
            density="compact"
            variant="outlined"
            clearable
            class="max-w-md"
          />
          <RateHistoryTimeline v-if="historyContainerId" :rows="historyRows" :on-date="referenceDate" />
          <div v-else class="text-sm opacity-60">Choose a container to see its Rate 1 / Rate 2 timeline.</div>
        </div>
      </template>
    </v-card-text>

    <!-- Period editor dialog -->
    <v-dialog v-model="editor.show" fullscreen scrollable transition="dialog-bottom-transition">
      <v-card>
        <v-toolbar color="primary" density="comfortable">
          <v-btn icon="mdi-close" variant="text" @click="closeEditor" />
          <v-toolbar-title>{{ editor.title }}</v-toolbar-title>
          <v-spacer />
          <v-btn variant="text" :disabled="saving" @click="resetEditor">Reset</v-btn>
          <v-btn variant="flat" :loading="saving" @click="save">{{ canExecuteAll ? 'Save' : 'Request approval' }}</v-btn>
        </v-toolbar>

        <v-card-text class="space-y-4 pt-4">
          <v-alert type="info" variant="tonal" density="compact">
            Set Rate 1 / Rate 2 and dates per container. Leave an end date empty to keep a rate open-ended. Clearing an
            existing amount removes that rate.
          </v-alert>

          <div class="flex flex-wrap items-end gap-3">
            <v-text-field v-model="containerSearch" label="Filter containers" density="compact" variant="outlined"
              clearable prepend-inner-icon="mdi-magnify" class="max-w-xs" hide-details />
            <v-text-field v-model.number="bulk.rate1" label="Bulk Rate 1" density="compact" variant="outlined"
              type="number" prefix="$" hide-details style="max-width: 160px" />
            <v-btn variant="outlined" @click="applyBulk(1)">Apply R1</v-btn>
            <v-text-field v-model.number="bulk.rate2" label="Bulk Rate 2" density="compact" variant="outlined"
              type="number" prefix="$" hide-details style="max-width: 160px" />
            <v-btn variant="outlined" @click="applyBulk(2)">Apply R2</v-btn>
            <v-tooltip v-if="hasSuggestions" text="Llena todas las tarifas con los valores del periodo activo" location="bottom">
              <template #activator="{ props: tp }">
                <v-btn variant="tonal" color="warning" prepend-icon="mdi-arrow-right-bold" v-bind="tp" @click="carryForwardAll">
                  Carry forward all
                </v-btn>
              </template>
            </v-tooltip>
          </div>

          <v-alert v-if="hasSuggestions" type="info" variant="tonal" density="compact">
            Los valores sugeridos (del periodo activo) se muestran como pista. Solo se guardará lo que captures o lo que
            traigas con "Carry forward all".
          </v-alert>

          <div class="overflow-x-auto rounded-xl border">
            <v-table density="comfortable" class="min-w-full">
              <thead>
                <tr>
                  <th class="text-left">Container</th>
                  <th class="text-left">Start date</th>
                  <th class="text-left">End date (optional)</th>
                  <th class="text-left">Rate 1</th>
                  <th class="text-left">Rate 2</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in visibleRows" :key="`draft-${row.container_type_id}`">
                  <td class="font-medium whitespace-nowrap">{{ row.container_name }}</td>
                  <td class="min-w-[170px]">
                    <v-text-field v-model="row.startDate" density="compact" variant="outlined" type="date" hide-details />
                  </td>
                  <td class="min-w-[170px]">
                    <v-text-field v-model="row.endDate" density="compact" variant="outlined" type="date"
                      placeholder="Open ended" hide-details />
                  </td>
                  <td>
                    <v-text-field v-model="row.rate1.amount" density="compact" variant="outlined" type="number"
                      prefix="$" step="0.01" hide-details
                      :placeholder="row.rate1.suggestedAmount !== null ? `prev ${formatCurrencyAmount(row.rate1.suggestedAmount)}` : ''">
                      <template #append-inner>
                        <v-chip
                          v-if="row.rate1.suggested && row.rate1.suggestedAmount !== null && row.rate1.amount === null"
                          color="warning" size="x-small" label class="cursor-pointer"
                          @click="fillSuggested(row.rate1)"
                        >
                          {{ formatCurrencyAmount(row.rate1.suggestedAmount) }}
                        </v-chip>
                      </template>
                    </v-text-field>
                  </td>
                  <td>
                    <v-text-field v-model="row.rate2.amount" density="compact" variant="outlined" type="number"
                      prefix="$" step="0.01" hide-details
                      :placeholder="row.rate2.suggestedAmount !== null ? `prev ${formatCurrencyAmount(row.rate2.suggestedAmount)}` : ''">
                      <template #append-inner>
                        <v-chip
                          v-if="row.rate2.suggested && row.rate2.suggestedAmount !== null && row.rate2.amount === null"
                          color="warning" size="x-small" label class="cursor-pointer"
                          @click="fillSuggested(row.rate2)"
                        >
                          {{ formatCurrencyAmount(row.rate2.suggestedAmount) }}
                        </v-chip>
                      </template>
                    </v-text-field>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <RequestRateChangesDialog
      v-model="requestDialog.show"
      :line-id="lineId ?? 0"
      :line-name="lineName"
      :ops="requestDialog.ops"
      @submitted="onRequestSubmitted"
    />
  </v-card>
</template>

<script setup lang="ts">
import {
  asAmount,
  buildDraftRows,
  buildLineGroups,
  buildRateOperations,
  cloneDraftRows,
  fetchAllContainerDelayRates,
  formatCurrencyAmount,
  formatDateLabel,
  getHistoryRows,
  getPeriodLabel,
  toDateOnly,
  todayKey,
  type DraftRow,
  type NamedCatalog,
  type PeriodGroup,
  type RateOp,
  type RateRow,
  type RateType,
} from '~/composables/useContainerDelayRates'
import { useContainerDelayRateActions } from '~/composables/useContainerDelayRateActions'

const props = defineProps<{
  mode?: 'create' | 'edit'
  rateId?: number | null
}>()

const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const router = useRouter()
const route = useRoute()
const loadingStore = useLoadingStore()
const { canCreate, canEdit, canDelete, canExecuteDirect, executeDirect, loadLineRequests, maybeConfirm } =
  useContainerDelayRateActions()

const isEdit = computed(() => (props.mode ?? 'create') === 'edit')

const lines = ref<NamedCatalog[]>([])
const containerTypes = ref<NamedCatalog[]>([])
const lineRows = ref<RateRow[]>([])
const lineId = ref<number | null>(null)
const loading = ref(false)
const saving = ref(false)
const lineRequests = ref<any[]>([])
const historyContainerId = ref<number | null>(null)
const containerSearch = ref('')

const referenceDate = computed(() => toDateOnly(`${route.query.reference_date || ''}`) || todayKey())
const lineName = computed(() => lines.value.find((line) => line.id === lineId.value)?.name ?? null)

const editor = reactive({
  show: false,
  title: '',
  mode: 'new' as 'new' | 'period',
  draftRows: [] as DraftRow[],
  initialDraftRows: [] as DraftRow[],
})

const bulk = reactive({ rate1: null as number | null, rate2: null as number | null })
const requestDialog = reactive({ show: false, ops: [] as RateOp[] })

const pendingClone = ref(false)
const cloneSourceRows = ref<RateRow[]>([])
const cloneSourceLineId = ref<number | null>(null)
const cloneSourceName = ref('')

const availableLines = computed(() => {
  if (pendingClone.value && cloneSourceLineId.value) {
    return lines.value.filter((line) => line.id !== cloneSourceLineId.value)
  }
  return lines.value
})

const pendingRequests = computed(() => lineRequests.value.filter((req: any) => req.status === 'pending'))

const periods = computed<PeriodGroup[]>(() => {
  if (!lineId.value) return []
  const groups = buildLineGroups(lineRows.value, containerTypes.value, {
    includeEmptyContainers: true,
    lineId: lineId.value,
    hideDeleted: true,
    onDate: referenceDate.value,
  })
  return groups[0]?.periods ?? []
})

const historyContainerOptions = computed(() =>
  [...containerTypes.value].sort((a, b) => a.name.localeCompare(b.name))
)

const historyRows = computed(() => {
  if (!lineId.value || !historyContainerId.value) return []
  return getHistoryRows(lineRows.value, lineId.value, historyContainerId.value)
})

const visibleRows = computed(() => {
  const query = containerSearch.value.trim().toLowerCase()
  if (!query) return editor.draftRows
  return editor.draftRows.filter((row) => row.container_name.toLowerCase().includes(query))
})

const hasSuggestions = computed(() =>
  editor.draftRows.some((row) => row.rate1.suggested || row.rate2.suggested)
)

const canExecuteAll = computed(() => {
  // Best-effort hint for the button label; the real decision is per-batch on save.
  return canCreate.value && canEdit.value && canDelete.value
})

async function loadCatalogs() {
  const [ls, cts] = await Promise.all([
    $api.lines.getLines({ query: { perPage: 1000 } }),
    $api.containers.getAllTypes({ query: { perPage: 1000 } }),
  ])
  lines.value = (ls?.data ?? ls ?? []) as NamedCatalog[]
  containerTypes.value = ((cts?.data ?? cts ?? []) as NamedCatalog[])
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
}

async function resolveEditLine() {
  if (!isEdit.value || !props.rateId) return
  const rate = (await $api.containerDelayRates.getRate(`${props.rateId}`)) as RateRow
  lineId.value = rate.line_id
}

async function loadLine(id: number) {
  lineRows.value = await fetchAllContainerDelayRates($api, { line_id: id })
  lineRequests.value = (await loadLineRequests(id)) ?? []
}

async function onLineChange(id: number | null) {
  if (!id) {
    lineRows.value = []
    lineRequests.value = []
    return
  }
  loading.value = true
  try {
    await loadLine(id)
    if (pendingClone.value) openClonedPeriod()
  } finally {
    loading.value = false
  }
}

function openClonedPeriod() {
  const rows = buildDraftRows(containerTypes.value, [], cloneSourceRows.value)
  rows.forEach((row) => {
    row.startDate = todayKey()
    row.endDate = null
  })
  editor.mode = 'new'
  editor.title = `New period (cloned from ${cloneSourceName.value})`
  editor.draftRows = cloneDraftRows(rows)
  editor.initialDraftRows = cloneDraftRows(rows)
  editor.show = true
  pendingClone.value = false
}

function openNewPeriod() {
  const activeGroups = buildLineGroups(lineRows.value, containerTypes.value, {
    includeEmptyContainers: true,
    lineId: lineId.value,
    activeOnly: true,
    hideDeleted: true,
    onDate: referenceDate.value,
  })
  const suggested = activeGroups[0]?.periods[0]?.rawRows ?? []
  const rows = buildDraftRows(containerTypes.value, [], suggested)
  rows.forEach((row) => {
    row.startDate = todayKey()
    row.endDate = null
    // Show prior values as hints only; do not pre-fill so save persists only
    // what the user actually enters (or carries forward explicitly).
    if (row.rate1.suggested) row.rate1.amount = null
    if (row.rate2.suggested) row.rate2.amount = null
  })
  editor.mode = 'new'
  editor.title = 'New rate period'
  editor.draftRows = cloneDraftRows(rows)
  editor.initialDraftRows = cloneDraftRows(rows)
  editor.show = true
}

function carryForwardAll() {
  editor.draftRows.forEach((row) => {
    if (row.rate1.suggested && row.rate1.suggestedAmount !== null && row.rate1.amount === null) {
      row.rate1.amount = row.rate1.suggestedAmount
    }
    if (row.rate2.suggested && row.rate2.suggestedAmount !== null && row.rate2.amount === null) {
      row.rate2.amount = row.rate2.suggestedAmount
    }
  })
}

function fillSuggested(cell: { suggested: boolean; suggestedAmount: number | null; amount: number | null }) {
  if (cell.suggestedAmount !== null) cell.amount = cell.suggestedAmount
}

function openEditPeriod(period: PeriodGroup) {
  const rows = buildDraftRows(containerTypes.value, period.rawRows, [])
  editor.mode = 'period'
  editor.title = `Edit period · ${period.label}`
  editor.draftRows = cloneDraftRows(rows)
  editor.initialDraftRows = cloneDraftRows(rows)
  editor.show = true
}

function resetEditor() {
  editor.draftRows = cloneDraftRows(editor.initialDraftRows)
  bulk.rate1 = null
  bulk.rate2 = null
}

function closeEditor() {
  editor.show = false
  bulk.rate1 = null
  bulk.rate2 = null
}

function applyBulk(rateType: RateType) {
  const value = rateType === 1 ? bulk.rate1 : bulk.rate2
  if (value === null || value === undefined || (value as any) === '') {
    snackbar.add({ type: 'error', text: `Enter a value for Bulk Rate ${rateType}.` })
    return
  }
  editor.draftRows.forEach((row) => {
    if (rateType === 1) row.rate1.amount = Number(value)
    else row.rate2.amount = Number(value)
  })
}

function cloneToOtherLine(period: PeriodGroup) {
  router.push({
    path: '/configuration/container-delay-rates/add',
    query: {
      duplicate_period_key: period.key,
      duplicate_line_id: `${lineId.value}`,
      reference_date: referenceDate.value,
      duplicate_start_date: period.start_date ?? '',
      duplicate_end_date: period.end_date ?? '',
    },
  })
}

function periodStatusColor(status: PeriodGroup['status']) {
  if (status === 'active') return 'success'
  if (status === 'upcoming') return 'info'
  return 'grey'
}

function validateDraft() {
  const invalid = editor.draftRows.find((row) => {
    const hasAmount = asAmount(row.rate1.amount) !== null || asAmount(row.rate2.amount) !== null
    if (!hasAmount) return false
    if (!row.startDate) return true
    if (row.endDate && row.endDate < row.startDate) return true
    return false
  })
  if (invalid) {
    snackbar.add({ type: 'error', text: `Review dates for ${invalid.container_name}.` })
    return false
  }
  return true
}

async function save() {
  if (!lineId.value) {
    snackbar.add({ type: 'error', text: 'Select a line first.' })
    return
  }
  if (!validateDraft()) return

  const { ops, autoCloseCount, realConflictNames } = buildRateOperations(editor.draftRows, lineRows.value)

  if (!ops.length) {
    snackbar.add({ type: 'info', text: 'No changes to save.' })
    return
  }

  // No permission for the batch → route as a request (carries the data).
  if (!canExecuteDirect(ops)) {
    requestDialog.ops = ops
    requestDialog.show = true
    return
  }

  if (!(await maybeConfirm(autoCloseCount, realConflictNames))) return

  try {
    saving.value = true
    loadingStore.start()
    await executeDirect(ops, lineId.value)
    snackbar.add({ type: 'success', text: 'Configuration saved.' })
    closeEditor()
    await loadLine(lineId.value)
  } catch (error: any) {
    console.error(error)
    snackbar.add({ type: 'error', text: error?.data?.message || 'Failed to save configuration.' })
  } finally {
    saving.value = false
    setTimeout(() => loadingStore.stop(), 250)
  }
}

async function onRequestSubmitted() {
  closeEditor()
  if (lineId.value) {
    lineRequests.value = (await loadLineRequests(lineId.value)) ?? []
  }
}

function goBack() {
  router.push('/configuration/container-delay-rates')
}

onMounted(async () => {
  try {
    loading.value = true
    loadingStore.start()
    await loadCatalogs()
    await resolveEditLine()

    // Support arriving from a clone action: load the source period rows as the
    // clone payload but leave the destination line empty for the user to pick.
    const duplicateLineId = Number(route.query.duplicate_line_id || 0) || null
    if (!isEdit.value && duplicateLineId) {
      const sourceRows = await fetchAllContainerDelayRates($api, { line_id: duplicateLineId })
      const groups = buildLineGroups(sourceRows, containerTypes.value, {
        includeEmptyContainers: true,
        lineId: duplicateLineId,
        hideDeleted: true,
        onDate: referenceDate.value,
      })
      const periodKey = `${route.query.duplicate_period_key || ''}`
      const sourcePeriod = groups[0]?.periods.find((period) => period.key === periodKey)
      cloneSourceRows.value = sourcePeriod?.rawRows ?? []
      cloneSourceLineId.value = duplicateLineId
      cloneSourceName.value = lines.value.find((line) => line.id === duplicateLineId)?.name ?? `Line ${duplicateLineId}`
      pendingClone.value = cloneSourceRows.value.length > 0
    }

    if (lineId.value) await loadLine(lineId.value)
  } finally {
    loading.value = false
    setTimeout(() => loadingStore.stop(), 250)
  }
})
</script>
