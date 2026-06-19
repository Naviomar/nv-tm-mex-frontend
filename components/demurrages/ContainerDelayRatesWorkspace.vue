<template>
  <div class="space-y-4">
    <v-card rounded="xl" variant="flat">
      <v-card-text class="space-y-4">
        <div class="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <div class="text-2xl font-semibold">Container DnD Rates</div>
            <div class="text-sm opacity-70">
              Review active rate coverage by line and container, then edit each rate directly from the catalog.
            </div>
          </div>

          <div class="flex flex-wrap gap-2">
            <v-btn color="primary" prepend-icon="mdi-plus" @click="router.push('/configuration/container-delay-rates/add')">
              New configuration
            </v-btn>
            <v-btn color="secondary" variant="outlined" prepend-icon="mdi-compare" @click="compareDialog.show = true">
              Compare lines
            </v-btn>
            <v-btn color="slate" variant="outlined" prepend-icon="mdi-refresh" :loading="loading" @click="loadRates">
              Refresh
            </v-btn>
          </div>
        </div>

        <v-alert
          type="info"
          variant="tonal"
          density="compact"
          text="End date is optional. Leave it empty to keep a rate open-ended. Click any rate button or rate chip to edit it."
        />

        <div class="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          <v-card rounded="lg" variant="tonal" color="primary">
            <v-card-text>
              <div class="text-caption opacity-80">Lines visible</div>
              <div class="text-2xl font-semibold">{{ metrics.lines }}</div>
            </v-card-text>
          </v-card>

          <v-card rounded="lg" variant="tonal" color="success">
            <v-card-text>
              <div class="text-caption opacity-80">Active ranges</div>
              <div class="text-2xl font-semibold">{{ metrics.activePeriods }}</div>
            </v-card-text>
          </v-card>

          <v-card rounded="lg" variant="tonal" color="warning">
            <v-card-text>
              <div class="text-caption opacity-80">Incomplete rows</div>
              <div class="text-2xl font-semibold">{{ metrics.incompleteRows }}</div>
            </v-card-text>
          </v-card>

          <v-card rounded="lg" variant="tonal" color="error">
            <v-card-text>
              <div class="text-caption opacity-80">Conflicts detected</div>
              <div class="text-2xl font-semibold">{{ metrics.conflictRows }}</div>
            </v-card-text>
          </v-card>
        </div>

        <div class="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-5">
          <v-text-field
            v-model="filters.search"
            label="Search"
            density="compact"
            variant="outlined"
            clearable
            prepend-inner-icon="mdi-magnify"
            @keyup.enter="loadRates"
          />

          <v-autocomplete
            v-model="filters.line_id"
            :items="lines"
            item-title="name"
            item-value="id"
            label="Line"
            density="compact"
            variant="outlined"
            clearable
          />

          <v-autocomplete
            v-model="filters.container_type_id"
            :items="containerTypes"
            item-title="name"
            item-value="id"
            label="Container type"
            density="compact"
            variant="outlined"
            clearable
          />

          <v-text-field
            v-model="filters.active_on"
            label="Reference date"
            density="compact"
            variant="outlined"
            type="date"
          />

          <v-select
            v-model="viewMode"
            :items="viewOptions"
            item-title="label"
            item-value="value"
            label="View"
            density="compact"
            variant="outlined"
          />
        </div>

        <div class="flex flex-wrap justify-end gap-2">
          <v-btn color="secondary" variant="outlined" prepend-icon="mdi-filter-off" @click="clearFilters">Clear</v-btn>
          <v-btn color="primary" prepend-icon="mdi-magnify" :loading="loading" @click="loadRates">Search</v-btn>
        </div>

        <div class="flex flex-wrap gap-3">
          <v-switch v-model="filters.active_only" label="Show active rates only" hide-details color="success" inset />
          <v-switch v-model="filters.conflicts_only" label="Show conflicts / incomplete only" hide-details color="warning" inset />
          <v-switch v-model="filters.show_deleted" label="Include inactive rows" hide-details color="error" inset />
        </div>
      </v-card-text>
    </v-card>

    <div v-if="loading" class="space-y-3">
      <v-skeleton-loader v-for="index in 3" :key="`cdr-skeleton-${index}`" type="article" />
    </div>

    <template v-else>
      <div v-if="viewMode === 'matrix'" class="space-y-4">
        <v-alert
          v-if="!lineGroups.length"
          type="info"
          variant="tonal"
          title="No rates found"
          text="Adjust your filters or create a new configuration for a line."
        />

        <v-card v-for="line in lineGroups" :key="`line-${line.line_id}`" rounded="xl" variant="flat" class="overflow-hidden">
          <div class="border-b px-6 py-4">
            <div class="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <div class="flex flex-wrap items-center gap-2">
                  <div class="text-xl font-semibold">{{ line.line_name }}</div>
                  <v-chip size="small" color="primary" label>{{ line.periods.length }} {{ line.periods.length === 1 ? 'group' : 'groups' }}</v-chip>
                  <v-chip v-if="line.incompleteCount" size="small" color="warning" label>
                    {{ line.incompleteCount }} incomplete
                  </v-chip>
                  <v-chip v-if="line.conflictsCount" size="small" color="error" label>
                    {{ line.conflictsCount }} conflicts
                  </v-chip>
                </div>
                <div class="mt-1 text-sm opacity-70">
                  {{ filters.active_only ? 'Showing the current active configuration. Active rates cannot overlap.' : getSelectedPeriod(line)?.label ?? 'No validity range selected' }}
                </div>
              </div>

              <div class="flex flex-wrap gap-2">
                <v-tooltip text="Clona la configuración de esta línea hacia otra línea" location="bottom">
                  <template #activator="{ props: tooltipProps }">
                    <v-btn size="small" variant="outlined" prepend-icon="mdi-content-copy" v-bind="tooltipProps" @click="duplicateConfiguration(line)">
                      Clone
                    </v-btn>
                  </template>
                </v-tooltip>
                <v-tooltip text="Abre el administrador de esta línea: todos los periodos, crear nuevos, editar, historial" location="bottom">
                  <template #activator="{ props: tooltipProps }">
                    <v-btn
                      size="small"
                      color="primary"
                      prepend-icon="mdi-cog-outline"
                      :disabled="!getSelectedPeriod(line)?.rawRows[0]?.id"
                      v-bind="tooltipProps"
                      @click="openConfiguration(line)"
                    >
                      Manage line
                    </v-btn>
                  </template>
                </v-tooltip>
              </div>
            </div>
          </div>

          <v-card-text class="space-y-4">
            <v-tabs
              v-if="!filters.active_only && line.periods.length > 1"
              v-model="selectedPeriodKeys[line.line_id]"
              color="primary"
              density="comfortable"
              class="border rounded-lg"
            >
              <v-tab v-for="period in line.periods" :key="period.key" :value="period.key">
                <span class="mr-2">{{ period.label }}</span>
                <v-chip :color="getPeriodChipColor(period.status)" size="x-small" label>{{ period.status }}</v-chip>
              </v-tab>
            </v-tabs>

            <div v-if="getDisplayRows(line).length" class="space-y-3">
              <div class="flex flex-wrap items-center gap-2">
                <v-chip :color="getPeriodChipColor(filters.active_only ? 'active' : getSelectedPeriod(line)!.status)" label>
                  {{ filters.active_only ? 'active view' : getSelectedPeriod(line)!.status }}
                </v-chip>
                <v-chip v-if="!filters.active_only && getSelectedPeriod(line)" size="small" variant="outlined" label>
                  Validity: {{ getSelectedPeriod(line)!.label }}
                </v-chip>
                <v-chip v-if="line.incompleteCount" size="small" color="warning" label>
                  {{ line.incompleteCount }} missing cells
                </v-chip>
                <v-chip v-if="line.conflictsCount" size="small" color="error" label>
                  {{ line.conflictsCount }} conflicts
                </v-chip>
              </div>

              <v-alert
                v-if="line.conflictsCount"
                type="error"
                variant="tonal"
                density="compact"
                title="Conflicting rates detected"
                :text="filters.active_only ? 'At least one container has overlapping active rates for this line.' : 'At least one container has overlapping rates within the selected validity range.'"
              />

              <v-alert
                v-else-if="line.incompleteCount"
                type="warning"
                variant="tonal"
                density="compact"
                title="Rate coverage is incomplete"
                :text="filters.active_only ? 'Some containers are missing an active Rate 1 or Rate 2 and should be reviewed.' : 'Some containers are missing Rate 1 or Rate 2 in the selected validity range.'"
              />

              <div class="hidden md:block overflow-x-auto rounded-xl border">
                <v-table density="comfortable" class="min-w-full">
                  <thead>
                    <tr>
                      <th class="text-left">Container</th>
                      <th class="text-left">Start date</th>
                      <th class="text-left">End date</th>
                      <th class="text-left">Rate 1</th>
                      <th class="text-left">Rate 2</th>
                      <th class="text-left">Status</th>
                      <th class="text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="displayRow in getDisplayRows(line)"
                      :key="displayRow.key"
                      :class="{
                        'bg-red-50 dark:bg-red-950': displayRow.row.status === 'conflict',
                        'bg-amber-50 dark:bg-amber-950': displayRow.row.status === 'incomplete',
                      }"
                    >
                      <td class="whitespace-nowrap font-medium">{{ displayRow.row.container_name }}</td>
                      <td class="whitespace-nowrap">{{ formatDateLabel(displayRow.startDate) }}</td>
                      <td class="whitespace-nowrap">{{ displayRow.endDate ? formatDateLabel(displayRow.endDate) : 'Open ended' }}</td>
                      <td>
                        <v-btn
                          variant="tonal"
                          :color="getCellColor(displayRow.row.rate1, displayRow.row.status)"
                          size="small"
                          @click="openCellDialog(line, displayRow.period, displayRow.row, 1)"
                        >
                          {{ displayRow.row.rate1 ? formatCurrencyAmount(displayRow.row.rate1.amount) : 'Add Rate 1' }}
                        </v-btn>
                      </td>
                      <td>
                        <v-btn
                          variant="tonal"
                          :color="getCellColor(displayRow.row.rate2, displayRow.row.status)"
                          size="small"
                          @click="openCellDialog(line, displayRow.period, displayRow.row, 2)"
                        >
                          {{ displayRow.row.rate2 ? formatCurrencyAmount(displayRow.row.rate2.amount) : 'Add Rate 2' }}
                        </v-btn>
                      </td>
                      <td>
                        <v-chip :color="getRowStatusColor(displayRow.row.status)" size="small" label>
                          {{ displayRow.row.status }}
                        </v-chip>
                      </td>
                      <td>
                        <div class="flex flex-wrap gap-2 items-center">
                          <v-chip size="x-small" variant="outlined" label>{{ displayRow.periodLabel }}</v-chip>
                          <v-btn size="x-small" variant="text" prepend-icon="mdi-history" @click="openHistory(line, displayRow.row)">
                            History
                          </v-btn>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </v-table>
              </div>

              <div class="grid gap-3 md:hidden">
                <v-card v-for="displayRow in getDisplayRows(line)" :key="`card-${displayRow.key}`" rounded="lg" variant="outlined">
                  <v-card-text class="space-y-3">
                    <div class="flex items-start justify-between gap-3">
                      <div>
                        <div class="font-semibold">{{ displayRow.row.container_name }}</div>
                        <div class="text-xs opacity-70">{{ displayRow.periodLabel }}</div>
                      </div>
                      <v-chip :color="getRowStatusColor(displayRow.row.status)" size="small" label>
                        {{ displayRow.row.status }}
                      </v-chip>
                    </div>

                    <div class="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <div class="text-xs opacity-60">Start date</div>
                        <div>{{ formatDateLabel(displayRow.startDate) }}</div>
                      </div>
                      <div>
                        <div class="text-xs opacity-60">End date</div>
                        <div>{{ displayRow.endDate ? formatDateLabel(displayRow.endDate) : 'Open ended' }}</div>
                      </div>
                    </div>

                    <div class="grid grid-cols-1 gap-2">
                      <v-btn
                        block
                        variant="tonal"
                        :color="getCellColor(displayRow.row.rate1, displayRow.row.status)"
                        @click="openCellDialog(line, displayRow.period, displayRow.row, 1)"
                      >
                        {{ displayRow.row.rate1 ? `Rate 1 · ${formatCurrencyAmount(displayRow.row.rate1.amount)}` : 'Add Rate 1' }}
                      </v-btn>
                      <v-btn
                        block
                        variant="tonal"
                        :color="getCellColor(displayRow.row.rate2, displayRow.row.status)"
                        @click="openCellDialog(line, displayRow.period, displayRow.row, 2)"
                      >
                        {{ displayRow.row.rate2 ? `Rate 2 · ${formatCurrencyAmount(displayRow.row.rate2.amount)}` : 'Add Rate 2' }}
                      </v-btn>
                    </div>

                    <div class="flex justify-end">
                      <v-btn size="small" variant="text" prepend-icon="mdi-history" @click="openHistory(line, displayRow.row)">
                        History
                      </v-btn>
                    </div>
                  </v-card-text>
                </v-card>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </div>

      <v-card v-else rounded="xl" variant="flat">
        <v-card-text class="space-y-4">
          <div class="hidden md:block overflow-x-auto rounded-xl border">
            <v-table density="comfortable" class="min-w-full">
            <thead>
              <tr>
                <th class="text-left">Line</th>
                <th class="text-left">Container</th>
                <th class="text-left">Rate</th>
                <th class="text-left">Amount</th>
                <th class="text-left">Start</th>
                <th class="text-left">End</th>
                <th class="text-left">Status</th>
                <th class="text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in flatRows" :key="`flat-${row.id}`">
                <td>{{ row.line?.name }}</td>
                <td>{{ row.container_type?.name }}</td>
                <td>
                  <v-chip size="small" :color="row.rate_type === 1 ? 'primary' : 'secondary'" label class="cursor-pointer" @click="openRateRow(row)">
                    Rate {{ row.rate_type }}
                  </v-chip>
                </td>
                <td>{{ formatCurrencyAmount(row.amount) }}</td>
                <td>{{ formatDateLabel(row.start_date) }}</td>
                <td>{{ row.end_date ? formatDateLabel(row.end_date) : 'Open ended' }}</td>
                <td>
                  <v-chip size="small" :color="row.deleted_at ? 'error' : rowConflictIds.has(row.id) ? 'warning' : 'success'" label>
                    {{ row.deleted_at ? 'inactive' : rowConflictIds.has(row.id) ? 'conflict' : 'active' }}
                  </v-chip>
                </td>
                <td>
                  <div class="flex gap-2">
                    <v-btn size="x-small" variant="text" prepend-icon="mdi-history" @click="openHistoryByRow(row)">
                      History
                    </v-btn>
                  </div>
                </td>
              </tr>
            </tbody>
            </v-table>
          </div>

          <div class="grid gap-3 md:hidden">
            <v-card v-for="row in flatRows" :key="`flat-card-${row.id}`" rounded="lg" variant="outlined">
              <v-card-text class="space-y-3">
                <div class="flex items-start justify-between gap-3">
                  <div>
                    <div class="font-semibold">{{ row.container_type?.name }}</div>
                    <div class="text-xs opacity-70">{{ row.line?.name }}</div>
                  </div>
                  <v-chip size="small" :color="row.deleted_at ? 'error' : rowConflictIds.has(row.id) ? 'warning' : 'success'" label>
                    {{ row.deleted_at ? 'inactive' : rowConflictIds.has(row.id) ? 'conflict' : 'active' }}
                  </v-chip>
                </div>

                <div class="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div class="text-xs opacity-60">Start date</div>
                    <div>{{ formatDateLabel(row.start_date) }}</div>
                  </div>
                  <div>
                    <div class="text-xs opacity-60">End date</div>
                    <div>{{ row.end_date ? formatDateLabel(row.end_date) : 'Open ended' }}</div>
                  </div>
                </div>

                <div class="flex items-center justify-between gap-3">
                  <v-chip size="small" :color="row.rate_type === 1 ? 'primary' : 'secondary'" label class="cursor-pointer" @click="openRateRow(row)">
                    Rate {{ row.rate_type }}
                  </v-chip>
                  <div class="font-medium">{{ formatCurrencyAmount(row.amount) }}</div>
                </div>

                <div class="flex justify-end">
                  <v-btn size="small" variant="text" prepend-icon="mdi-history" @click="openHistoryByRow(row)">
                    History
                  </v-btn>
                </div>
              </v-card-text>
            </v-card>
          </div>
        </v-card-text>
      </v-card>
    </template>

    <v-dialog v-model="compareDialog.show" max-width="1200" scrollable>
      <v-card rounded="xl">
        <v-toolbar color="primary" density="comfortable">
          <v-toolbar-title>Compare lines</v-toolbar-title>
          <v-spacer />
          <v-btn icon="mdi-close" variant="text" @click="compareDialog.show = false" />
        </v-toolbar>
        <v-card-text class="space-y-4 pt-4">
          <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
            <v-autocomplete
              v-model="compareDialog.leftLineId"
              :items="lines"
              item-title="name"
              item-value="id"
              label="Line A"
              density="compact"
              variant="outlined"
              clearable
            />
            <v-autocomplete
              v-model="compareDialog.rightLineId"
              :items="lines"
              item-title="name"
              item-value="id"
              label="Line B"
              density="compact"
              variant="outlined"
              clearable
            />
          </div>

          <v-alert
            v-if="!compareRows.length"
            type="info"
            variant="tonal"
            text="Select two lines with an active period on the selected reference date to compare them."
          />

          <div v-else class="overflow-x-auto">
            <v-table density="comfortable">
              <thead>
                <tr>
                  <th class="text-left">Container</th>
                  <th class="text-left">{{ compareLeft?.line_name }} Rate 1</th>
                  <th class="text-left">{{ compareLeft?.line_name }} Rate 2</th>
                  <th class="text-left">{{ compareRight?.line_name }} Rate 1</th>
                  <th class="text-left">{{ compareRight?.line_name }} Rate 2</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in compareRows" :key="`compare-${row.container_type_id}`">
                  <td class="font-medium">{{ row.container_name }}</td>
                  <td>{{ row.leftRate1 === null ? '—' : formatCurrencyAmount(row.leftRate1) }}</td>
                  <td>{{ row.leftRate2 === null ? '—' : formatCurrencyAmount(row.leftRate2) }}</td>
                  <td>{{ row.rightRate1 === null ? '—' : formatCurrencyAmount(row.rightRate1) }}</td>
                  <td>{{ row.rightRate2 === null ? '—' : formatCurrencyAmount(row.rightRate2) }}</td>
                </tr>
              </tbody>
            </v-table>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="cellDialog.show" max-width="520" persistent>
      <v-card rounded="xl">
        <v-toolbar color="primary" density="comfortable">
          <v-toolbar-title>
            {{ cellDialog.rowId ? 'Edit rate' : 'Add rate' }} · Rate {{ cellDialog.rateType }}
          </v-toolbar-title>
          <v-spacer />
          <v-btn icon="mdi-close" variant="text" @click="closeCellDialog" />
        </v-toolbar>
        <v-card-text class="space-y-4 pt-4">
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <v-text-field :model-value="cellDialog.lineName" label="Line" variant="outlined" density="compact" readonly />
            <v-text-field :model-value="cellDialog.containerName" label="Container" variant="outlined" density="compact" readonly />
            <v-text-field v-model="cellDialog.amount" label="Amount" variant="outlined" density="compact" type="number" prefix="$" step="0.01" />
            <div class="hidden sm:block" />
            <v-text-field v-model="cellDialog.startDate" label="Start date" variant="outlined" density="compact" type="date" />
            <v-text-field v-model="cellDialog.endDate" label="End date (optional)" variant="outlined" density="compact" type="date" placeholder="Open ended" />
          </div>
          <div class="text-sm opacity-70">
            Leave end date empty to keep this rate open-ended. Clearing the amount removes this rate. If a previous
            open-ended rate exists, it is closed automatically.
          </div>
        </v-card-text>
        <v-card-actions class="px-6 pb-6">
          <v-btn v-if="cellDialog.rowId" color="error" variant="text" prepend-icon="mdi-delete" @click="deleteCellRow">
            Delete
          </v-btn>
          <v-spacer />
          <v-btn variant="text" @click="closeCellDialog">Cancel</v-btn>
          <v-btn color="primary" :loading="cellDialog.saving" @click="saveCellDialog">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <RequestRateChangesDialog
      v-model="requestDialog.show"
      :line-id="requestDialog.lineId"
      :line-name="requestDialog.lineName"
      :ops="requestDialog.ops"
      @submitted="onRequestSubmitted"
    />

    <v-dialog v-model="historyDialog.show" max-width="880" scrollable>
      <v-card rounded="xl">
        <v-toolbar color="info" density="comfortable">
          <v-toolbar-title>
            History · {{ historyDialog.lineName }} / {{ historyDialog.containerName }}
          </v-toolbar-title>
          <v-spacer />
          <v-btn icon="mdi-close" variant="text" @click="historyDialog.show = false" />
        </v-toolbar>
        <v-card-text class="pt-4">
          <RateHistoryTimeline :rows="historyDialog.rows" :on-date="filters.active_on || todayKey()" />
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
 </template>
 
 <script setup lang="ts">
 import {
  buildLineGroups,
  buildRateOperations,
  cleanContainerDelayQuery,
  fetchAllContainerDelayRates,
  formatDateLabel,
  getConflictRateIds,
  getPeriodLabel,
  toDateOnly,
  todayKey,
  type DraftCell,
  type DraftRow,
  type LineGroup,
  type MatrixRow,
  type NamedCatalog,
  type PeriodGroup,
  type RateOp,
  type RateRow,
  type RateType,
} from '~/composables/useContainerDelayRates'
 import { useContainerDelayRateActions } from '~/composables/useContainerDelayRateActions'

 const { $api, $notifications } = useNuxtApp()
 const snackbar = useSnackbar()
 const router = useRouter()
 const loadingStore = useLoadingStore()
 const confirm = $notifications.useConfirm()
 const { canExecuteDirect, executeDirect, maybeConfirm } = useContainerDelayRateActions()

 const lines = ref<NamedCatalog[]>([])
 const containerTypes = ref<NamedCatalog[]>([])
 const allRows = ref<RateRow[]>([])
 const loading = ref(false)
 const viewMode = ref<'matrix' | 'list'>('matrix')
 
 const viewOptions = [
   { label: 'Matrix', value: 'matrix' },
   { label: 'List', value: 'list' },
 ]
 
 const filters = reactive({
   search: '',
   line_id: null as number | null,
   container_type_id: null as number | null,
   active_on: todayKey(),
   active_only: true,
   conflicts_only: false,
   show_deleted: false,
 })
 
 const selectedPeriodKeys = reactive<Record<number, string | null>>({})
 
 const compareDialog = reactive({
   show: false,
   leftLineId: null as number | null,
   rightLineId: null as number | null,
 })
 
 const historyDialog = reactive({
   show: false,
   lineId: null as number | null,
   lineName: '',
   containerTypeId: null as number | null,
   containerName: '',
   rows: [] as RateRow[],
 })

 const cellDialog = reactive({
   show: false,
   saving: false,
   rowId: null as number | null,
   lineId: null as number | null,
   lineName: '',
   containerTypeId: null as number | null,
   containerName: '',
   rateType: 1 as RateType,
   amount: null as number | null,
   originalAmount: null as number | null,
   startDate: todayKey(),
   endDate: null as string | null,
   originalStartDate: null as string | null,
   originalEndDate: null as string | null,
 })

 const requestDialog = reactive({
   show: false,
   lineId: 0,
   lineName: '' as string | null,
   ops: [] as RateOp[],
 })

 const rowConflictIds = computed(() => getConflictRateIds(allRows.value))
 
 const lineGroups = computed(() =>
   buildLineGroups(allRows.value, containerTypes.value, {
     includeEmptyContainers: true,
     lineId: filters.line_id,
     containerTypeId: filters.container_type_id,
     search: filters.search,
     activeOnly: filters.active_only,
     conflictsOnly: filters.conflicts_only,
     hideDeleted: !filters.show_deleted,
     onDate: filters.active_on || todayKey(),
   })
 )
 
 const metrics = computed(() => ({
   lines: lineGroups.value.length,
   activePeriods: lineGroups.value.reduce((acc, line) => acc + line.periods.filter((period) => period.is_active).length, 0),
   incompleteRows: lineGroups.value.reduce((acc, line) => acc + line.incompleteCount, 0),
   conflictRows: lineGroups.value.reduce((acc, line) => acc + line.conflictsCount, 0),
 }))
 
 const flatRows = computed(() => {
   const selectedDate = filters.active_on || todayKey()
   return allRows.value
     .filter((row) => {
       if (filters.line_id && row.line_id !== filters.line_id) return false
       if (filters.container_type_id && row.container_type_id !== filters.container_type_id) return false
       if (!filters.show_deleted && row.deleted_at) return false
       if (filters.active_only) {
         const start = toDateOnly(row.start_date)
         const end = toDateOnly(row.end_date)
         if (start && start > selectedDate) return false
         if (end && end < selectedDate) return false
       }
       if (!filters.search) return true
       const haystack = [row.line?.name, row.container_type?.name, row.amount, row.start_date, row.end_date]
         .filter(Boolean)
         .join(' ')
         .toLowerCase()
       return haystack.includes(filters.search.toLowerCase())
     })
     .filter((row) => !filters.conflicts_only || rowConflictIds.value.has(row.id))
     .sort((left, right) => {
       const lineCompare = `${left.line?.name ?? ''}`.localeCompare(`${right.line?.name ?? ''}`)
       if (lineCompare !== 0) return lineCompare
       const containerCompare = `${left.container_type?.name ?? ''}`.localeCompare(`${right.container_type?.name ?? ''}`)
       if (containerCompare !== 0) return containerCompare
       return `${left.start_date ?? ''}`.localeCompare(`${right.start_date ?? ''}`)
     })
 })
 
 const compareSourceGroups = computed(() =>
   buildLineGroups(allRows.value, containerTypes.value, {
     includeEmptyContainers: true,
     activeOnly: true,
     hideDeleted: !filters.show_deleted,
     onDate: filters.active_on || todayKey(),
   })
 )
 
 const compareLeft = computed(() => compareSourceGroups.value.find((line) => line.line_id === compareDialog.leftLineId) ?? null)
 const compareRight = computed(() => compareSourceGroups.value.find((line) => line.line_id === compareDialog.rightLineId) ?? null)
 
 const compareRows = computed(() => {
   const leftPeriod = compareLeft.value ? getSelectedPeriod(compareLeft.value) : null
   const rightPeriod = compareRight.value ? getSelectedPeriod(compareRight.value) : null
   if (!leftPeriod || !rightPeriod) return []
 
   const containers = new Map<number, string>()
   leftPeriod.rows.forEach((row) => containers.set(row.container_type_id, row.container_name))
   rightPeriod.rows.forEach((row) => containers.set(row.container_type_id, row.container_name))
 
   return [...containers.entries()]
     .map(([containerTypeId, containerName]) => {
       const leftRow = leftPeriod.rows.find((row) => row.container_type_id === containerTypeId)
       const rightRow = rightPeriod.rows.find((row) => row.container_type_id === containerTypeId)
 
       return {
         container_type_id: containerTypeId,
         container_name: containerName,
         leftRate1: leftRow?.rate1?.amount ?? null,
         leftRate2: leftRow?.rate2?.amount ?? null,
         rightRate1: rightRow?.rate1?.amount ?? null,
         rightRate2: rightRow?.rate2?.amount ?? null,
       }
     })
     .sort((left, right) => left.container_name.localeCompare(right.container_name))
 })
 
 watch(
   lineGroups,
   (groups) => {
     groups.forEach((line) => {
       const selected = selectedPeriodKeys[line.line_id]
       if (!selected || !line.periods.some((period) => period.key === selected)) {
         selectedPeriodKeys[line.line_id] = line.activePeriodKey ?? line.periods[0]?.key ?? null
       }
     })
   },
   { immediate: true }
 )
 
 async function loadCatalogs() {
   const [ls, cts] = await Promise.all([
     $api.lines.getLines({ query: { perPage: 1000 } }),
     $api.containers.getAllTypes({ query: { perPage: 1000 } }),
   ])
 
   lines.value = (ls?.data ?? ls ?? []) as NamedCatalog[]
   containerTypes.value = (cts?.data ?? cts ?? []) as NamedCatalog[]
 }
 
 async function loadRates() {
   try {
     loading.value = true
     loadingStore.start()
 
     const baseQuery = cleanContainerDelayQuery({
       line_id: filters.line_id,
       container_type_id: filters.container_type_id,
     })
 
     const [activeRows, deletedRows] = await Promise.all([
       fetchAllContainerDelayRates($api, baseQuery),
       fetchAllContainerDelayRates($api, { ...baseQuery, deleted_status: 'deleted' }),
     ])
 
     const merged = [...activeRows, ...deletedRows].reduce((acc, row) => {
       if (!acc.some((item) => item.id === row.id)) acc.push(row)
       return acc
     }, [] as RateRow[])
 
     allRows.value = merged
   } catch (error) {
     console.error(error)
     snackbar.add({ type: 'error', text: 'Failed to load Container DnD Rates' })
   } finally {
     loading.value = false
     setTimeout(() => loadingStore.stop(), 250)
   }
 }
 
 function getSelectedPeriod(line: LineGroup) {
   const selectedKey = selectedPeriodKeys[line.line_id] ?? line.activePeriodKey
   return line.periods.find((period) => period.key === selectedKey) ?? line.periods[0] ?? null
 }

 function getDisplayRows(line: LineGroup) {
  const selectedPeriod = getSelectedPeriod(line)
  if (!selectedPeriod) return []

  return selectedPeriod.rows.map((row) => ({
    key: `${line.line_id}-${selectedPeriod.key}-${row.container_type_id}`,
    row,
    period: selectedPeriod,
    periodLabel: selectedPeriod.label,
    startDate: row.rate1?.startDate ?? row.rate2?.startDate ?? selectedPeriod.start_date,
    endDate: row.rate1?.endDate ?? row.rate2?.endDate ?? selectedPeriod.end_date,
  }))
}
 
 
 function getPeriodChipColor(status: PeriodGroup['status']) {
   if (status === 'active') return 'success'
   if (status === 'upcoming') return 'info'
   return 'default'
 }
 
 function getRowStatusColor(status: MatrixRow['status']) {
   if (status === 'conflict') return 'error'
   if (status === 'incomplete') return 'warning'
   if (status === 'inactive') return 'secondary'
   return 'success'
 }
 
 function getCellColor(cell: any, status: MatrixRow['status']) {
   if (!cell) return 'grey'
   if (cell.deletedAt) return 'secondary'
   if (cell.hasConflict || status === 'conflict') return 'error'
   return cell.rateType === 1 ? 'primary' : 'secondary'
 }
 
 async function clearFilters() {
   filters.search = ''
   filters.line_id = null
   filters.container_type_id = null
   filters.active_on = todayKey()
   filters.active_only = true
   filters.conflicts_only = false
   filters.show_deleted = false
 
   await loadRates()
 }
 
 function duplicateConfiguration(line: LineGroup) {
  const period = getSelectedPeriod(line)
  router.push({
    path: '/configuration/container-delay-rates/add',
    query: {
      duplicate_period_key: period?.key ?? '',
      duplicate_line_id: `${line.line_id}`,
      reference_date: filters.active_on || todayKey(),
      duplicate_start_date: period?.start_date ?? '',
      duplicate_end_date: period?.end_date ?? '',
    },
  })
}

function openConfiguration(line: LineGroup) {
  const period = getSelectedPeriod(line)
  const rowId = period?.rawRows[0]?.id
  if (!rowId) return

  router.push({
    path: `/configuration/container-delay-rates/edit-${rowId}`,
    query: {
      period_key: period?.key ?? '',
      reference_date: filters.active_on || todayKey(),
      start_date: period?.start_date ?? '',
      end_date: period?.end_date ?? '',
    },
  })
}

 function openRateRow(row: RateRow) {
   router.push({
     path: `/configuration/container-delay-rates/edit-${row.id}`,
     query: {
       start_date: toDateOnly(row.start_date) ?? '',
       end_date: toDateOnly(row.end_date) ?? '',
     },
   })
 }
 
 function openCellDialog(line: LineGroup, period: PeriodGroup, row: MatrixRow, rateType: RateType) {
   const cell = rateType === 1 ? row.rate1 : row.rate2
   cellDialog.show = true
   cellDialog.saving = false
   cellDialog.rowId = cell?.rowId ?? null
   cellDialog.lineId = line.line_id
   cellDialog.lineName = line.line_name
   cellDialog.containerTypeId = row.container_type_id
   cellDialog.containerName = row.container_name
   cellDialog.rateType = rateType
   cellDialog.amount = cell?.amount ?? null
   cellDialog.originalAmount = cell?.amount ?? null
   cellDialog.startDate = cell?.startDate ?? period.start_date ?? todayKey()
   cellDialog.endDate = cell?.endDate ?? period.end_date ?? null
   cellDialog.originalStartDate = cell?.startDate ?? null
   cellDialog.originalEndDate = cell?.endDate ?? null
 }

 function closeCellDialog() {
   cellDialog.show = false
   cellDialog.saving = false
   cellDialog.rowId = null
   cellDialog.amount = null
 }

 function emptyDraftCell(): DraftCell {
   return {
     rowId: null,
     amount: null,
     originalAmount: null,
     suggestedAmount: null,
     startDate: null,
     endDate: null,
     originalStartDate: null,
     originalEndDate: null,
     suggested: false,
     deletedAt: null,
   }
 }

 // Builds a single-container draft and routes it through the shared operation
 // pipeline (auto-close + permission/request) so a single-cell edit is as safe
 // as a full period save and never disturbs the other rate of the container.
 function buildCellOps() {
   const amount = cellDialog.amount === ('' as any) ? null : cellDialog.amount
   const targetCell: DraftCell = {
     rowId: cellDialog.rowId,
     amount,
     originalAmount: cellDialog.originalAmount,
     suggestedAmount: null,
     startDate: cellDialog.startDate,
     endDate: cellDialog.endDate || null,
     originalStartDate: cellDialog.originalStartDate,
     originalEndDate: cellDialog.originalEndDate,
     suggested: false,
     deletedAt: null,
   }

   const draftRow: DraftRow = {
     container_type_id: cellDialog.containerTypeId as number,
     container_name: cellDialog.containerName,
     startDate: cellDialog.startDate,
     endDate: cellDialog.endDate || null,
     originalStartDate: cellDialog.originalStartDate,
     originalEndDate: cellDialog.originalEndDate,
     suggestedDates: false,
     rate1: cellDialog.rateType === 1 ? targetCell : emptyDraftCell(),
     rate2: cellDialog.rateType === 2 ? targetCell : emptyDraftCell(),
   }

   const lineRows = allRows.value.filter((row) => row.line_id === cellDialog.lineId)
   return buildRateOperations([draftRow], lineRows)
 }

 async function applyCellOps() {
   const { ops, autoCloseCount, realConflictNames } = buildCellOps()

   if (!ops.length) {
     snackbar.add({ type: 'info', text: 'No changes to apply.' })
     return
   }

   if (!canExecuteDirect(ops)) {
     requestDialog.lineId = cellDialog.lineId as number
     requestDialog.lineName = cellDialog.lineName
     requestDialog.ops = ops
     requestDialog.show = true
     cellDialog.show = false
     return
   }

   if (!(await maybeConfirm(autoCloseCount, realConflictNames))) return

   try {
     cellDialog.saving = true
     loadingStore.start()
     await executeDirect(ops, cellDialog.lineId as number)
     snackbar.add({ type: 'success', text: 'Rate saved' })
     closeCellDialog()
     await loadRates()
   } catch (error: any) {
     console.error(error)
     snackbar.add({ type: 'error', text: error?.data?.message || 'Failed to save rate' })
   } finally {
     cellDialog.saving = false
     setTimeout(() => loadingStore.stop(), 250)
   }
 }

 async function saveCellDialog() {
   if (!cellDialog.lineId || !cellDialog.containerTypeId) return
   const amount = cellDialog.amount === ('' as any) ? null : cellDialog.amount
   if (amount !== null && !cellDialog.startDate) {
     snackbar.add({ type: 'error', text: 'Set a start date.' })
     return
   }
   if (amount !== null && cellDialog.endDate && cellDialog.endDate < cellDialog.startDate) {
     snackbar.add({ type: 'error', text: 'End date must be on or after the start date.' })
     return
   }
   await applyCellOps()
 }

 async function deleteCellRow() {
   if (!cellDialog.rowId) return
   const ok = await confirm({
     title: 'Delete rate?',
     content: 'This will deactivate the selected rate row.',
     confirmationText: 'Delete',
     dialogProps: { persistent: true, maxWidth: 500 },
     confirmationButtonProps: { color: 'error' },
   })
   if (!ok) return
   cellDialog.amount = null
   await applyCellOps()
 }

 async function onRequestSubmitted() {
   requestDialog.show = false
   await loadRates()
 }

 function openHistory(line: LineGroup, row: MatrixRow) {
   historyDialog.show = true
   historyDialog.lineId = line.line_id
   historyDialog.lineName = line.line_name
   historyDialog.containerTypeId = row.container_type_id
   historyDialog.containerName = row.container_name
   historyDialog.rows = getHistoryRows(allRows.value, line.line_id, row.container_type_id)
 }
 
 function openHistoryByRow(row: RateRow) {
   const lineName = row.line?.name ?? `Line ${row.line_id}`
   const containerName = row.container_type?.name ?? `Container ${row.container_type_id}`
   historyDialog.show = true
   historyDialog.lineId = row.line_id
   historyDialog.lineName = lineName
   historyDialog.containerTypeId = row.container_type_id
   historyDialog.containerName = containerName
   historyDialog.rows = getHistoryRows(allRows.value, row.line_id, row.container_type_id)
 }
 
 onMounted(async () => {
   try {
     loadingStore.start()
     await loadCatalogs()
     await loadRates()
   } finally {
     setTimeout(() => loadingStore.stop(), 250)
   }
 })
 </script>
