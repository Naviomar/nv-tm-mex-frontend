<template>
  <div class="rebate-containers">
    <v-card>
      <v-card-title class="tm-btn-group">
        <h3>Rebate - Containers</h3>
        <v-chip v-if="options.restricted" size="small" color="info" variant="tonal" prepend-icon="mdi-account-multiple-outline">
          Your executives
        </v-chip>
        <v-spacer />
        <v-btn variant="tonal" color="primary" prepend-icon="mdi-book-open-page-variant-outline" @click="docs.open('rebate')">How it works</v-btn>
        <v-btn variant="tonal" color="secondary" prepend-icon="mdi-history" @click="oldDebtsOpen = true">Old balances</v-btn>
        <v-tooltip :disabled="!!selectedCount" text="Select the containers to download" location="bottom">
          <template #activator="{ props: tip }">
            <span v-bind="tip">
              <v-btn variant="tonal" color="success" prepend-icon="mdi-file-excel-outline" :disabled="!selectedCount" :loading="busy === 'full'" @click="download">
                Excel ({{ selectedCount }})
              </v-btn>
            </span>
          </template>
        </v-tooltip>
        <Can permission="rebate-payments-request">
          <v-btn
            color="cyan"
            variant="flat"
            prepend-icon="mdi-file-send-outline"
            :disabled="!selectedCount"
            @click="confirmOpen = true"
          >
            Request payment ({{ selectedCount }})
          </v-btn>
        </Can>
      </v-card-title>

      <v-card-text>
        <Can permission="rebate-summary-view">
          <!-- Summary: each block is also a quick filter -->
          <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-4">
            <button
              v-for="card in cards"
              :key="card.key"
              type="button"
              class="summary-card text-left rounded-lg p-3"
              :class="{ 'summary-card--active': card.active }"
              @click="applyCard(card)"
            >
              <div class="flex items-center gap-2 text-xs text-medium-emphasis">
                <v-icon size="16" :color="card.color">{{ card.icon }}</v-icon>{{ card.label }}
              </div>
              <div class="text-lg font-bold mt-1" :class="`text-${card.color}`">
                {{ card.amount === null ? card.containers.toLocaleString() : formatToCurrency(card.amount) }}
              </div>
              <div class="text-xs text-medium-emphasis">
                {{ card.containers.toLocaleString() }} containers<template v-if="card.key === 'repeated' && summary?.repeat_window_days !== undefined"> · within {{ summary.repeat_window_days }} days</template>
              </div>
            </button>
          </div>
        </Can>

        <!-- Filters -->
        <div class="mb-4" @keyup.enter="onClickFilters">
          <div class="flex items-center justify-between mb-2">
            <v-btn size="small" variant="text" :prepend-icon="showFilters ? 'mdi-chevron-up' : 'mdi-chevron-down'" @click="showFilters = !showFilters">
              {{ showFilters ? 'Hide filters' : 'Show filters' }}
            </v-btn>
          </div>
          <v-expand-transition>
            <div v-show="showFilters">
              <FilterLayoutGrid :filters="filterLayoutDefs" storage-key="filter-layout:rebate-containers" @hide="onLayoutFilterHidden">
                <template #search>
                  <v-text-field v-model="filters.search" density="compact" label="Reference, container or customer" clearable />
                </template>
                <template #executive>
                  <v-autocomplete v-model="filters.executive_id" :items="options.executives" item-title="name" item-value="id" density="compact" label="Executive" clearable />
                </template>
                <template #customer>
                  <v-autocomplete v-model="filters.consignee_id" :items="options.customers" item-title="name" item-value="id" density="compact" label="Customer" clearable />
                </template>
                <template #system>
                  <v-select v-model="filters.system" :items="systemItems" density="compact" label="System" clearable />
                </template>
                <template #status>
                  <v-select v-model="filters.status" :items="statusItems" density="compact" label="Status" clearable />
                </template>
                <template #payment>
                  <v-select v-model="filters.payment" :items="paymentItems" density="compact" label="Payment" clearable />
                </template>
                <template #historical>
                  <v-select v-model="filters.historical" :items="historicalItems" density="compact" label="History" clearable />
                </template>
                <template #repeated>
                  <v-select v-model="filters.repeated" :items="repeatedItems" density="compact" label="Repeated container" clearable />
                </template>
                <template #specialCase>
                  <v-select v-model="filters.special_case" :items="specialCaseItems" density="compact" label="Special case" clearable />
                </template>
                <template #dateFrom>
                  <v-text-field v-model="filters.date_from" type="date" density="compact" label="Date from" />
                </template>
                <template #dateTo>
                  <v-text-field v-model="filters.date_to" type="date" density="compact" label="Date to" />
                </template>
                <template #includeFuture>
                  <v-switch
                    v-model="filters.include_future"
                    :true-value="1"
                    :false-value="null"
                    color="primary"
                    density="compact"
                    hide-details
                    label="Include not arrived (future ETA)"
                  />
                </template>
                <template #availableFirst>
                  <v-switch
                    v-model="filters.available_first"
                    :true-value="1"
                    :false-value="null"
                    color="primary"
                    density="compact"
                    hide-details
                    label="Available to request first"
                  />
                </template>
              </FilterLayoutGrid>
              <div class="tm-btn-group">
                <v-btn size="small" color="secondary" @click="clearFilters">Clear</v-btn>
                <v-btn size="small" color="primary" @click="onClickFilters">Search</v-btn>
              </div>
            </div>
          </v-expand-transition>
        </div>

        <!-- Advances of special cases that the next payment request withholds -->
        <v-alert v-for="advance in advances" :key="advance.case" type="info" color="deep-purple" variant="tonal" density="compact" icon="mdi-cash-minus" class="mb-2">
          <strong>{{ formatToCurrency(advance.pending) }}</strong> will be withheld for «{{ advance.case }}» from the next payment request with rebate of
          {{ advance.customer }}<template v-if="advance.consignee_ids.length > 1"> or its group</template>.
        </v-alert>

        <!-- Special cases that hold the rebate until they cover the demurrage of their references -->
        <v-alert v-for="item in cases" :key="item.case" type="warning" variant="tonal" density="compact" icon="mdi-folder-star-outline" class="mb-2">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div>
              <strong>«{{ item.case }}»</strong>
              <template v-if="item.held_containers">
                · <strong>{{ item.held_containers }}</strong> containers of {{ item.held_refs }} references ({{ formatToCurrency(item.held_amount) }}) are held until the case covers their demurrage
                (<strong>{{ formatToCurrency(item.pending) }}</strong> still pending, covered with the freight of new references)</template
              ><template v-if="item.released_containers">
                · <strong>{{ item.released_containers }}</strong> containers of {{ item.released_refs }} references ({{ formatToCurrency(item.released_amount) }}) were released: the case already covered their demurrage</template
              >.
            </div>
            <div class="tm-btn-group">
              <v-btn v-if="item.held_containers" size="x-small" variant="text" color="warning" :active="applied.special_case === 'held'" @click="filterCase('held')">Show held</v-btn>
              <v-btn v-if="item.released_containers" size="x-small" variant="text" color="success" :active="applied.special_case === 'released'" @click="filterCase('released')">Show released</v-btn>
            </div>
          </div>
        </v-alert>

        <!-- Selection: choose exactly what goes in the Excel or in the payment request -->
        <v-alert v-if="selectedCount || availableOnPage" type="info" variant="tonal" density="compact" class="mb-2">
          <div class="tm-btn-group">
            <template v-if="allMode">
              <span>All <strong>{{ (summary?.new_for_export.containers ?? 0).toLocaleString() }}</strong> available containers matching the filters are selected<template v-if="excluded.size"> ({{ excluded.size }} left out)</template>.</span>
              <v-btn size="x-small" variant="text" @click="clearSelection">Clear selection</v-btn>
            </template>
            <template v-else-if="selected.size">
              <span>
                <strong>{{ selected.size }}</strong> selected · {{ formatToCurrency(selectedAmount) }}<template v-if="withheldPreview > 0"> · withheld <strong class="text-deep-purple">−{{ formatToCurrency(withheldPreview) }}</strong> · net <strong>{{ formatToCurrency(selectedAmount - withheldPreview) }}</strong></template>.
              </span>
              <v-btn v-if="(summary?.new_for_export.containers ?? 0) > selected.size" size="x-small" variant="tonal" color="primary" @click="selectAllMatching">
                Select all {{ (summary?.new_for_export.containers ?? 0).toLocaleString() }} available matching the filters
              </v-btn>
              <v-btn size="x-small" variant="text" @click="clearSelection">Clear selection</v-btn>
            </template>
            <template v-else>
              <span>Tick the available references to download or request (payment is per whole reference), or</span>
              <v-btn size="x-small" variant="tonal" color="primary" @click="selectAllMatching">select all {{ (summary?.new_for_export.containers ?? 0).toLocaleString() }} available matching the filters</v-btn>
            </template>
          </div>
        </v-alert>

        <v-pagination v-model="page" :length="lastPage" rounded="circle" density="compact" :total-visible="7" @update:model-value="load" />
        <div class="flex items-center justify-between mb-1">
          <div class="text-sm text-medium-emphasis">{{ total.toLocaleString() }} containers</div>
          <TableColumnsMenu :state="columnsLayout" />
        </div>

        <v-table density="compact" fixed-header height="65vh">
          <thead>
            <tr>
              <template v-for="col in visibleColumns" :key="col.key">
                <th v-if="col.key === 'select'" width="40">
                  <v-checkbox-btn
                    v-if="availableOnPage"
                    :model-value="pageAllSelected"
                    :indeterminate="pageSomeSelected && !pageAllSelected"
                    density="compact"
                    title="Select the available containers of this page"
                    @update:model-value="togglePage"
                  />
                </th>
                <th v-else-if="col.key === 'actions'" class="text-left" width="50">Actions</th>
                <th v-else :class="col.align === 'end' ? 'text-right' : 'text-left'">
                  <span v-if="SORTABLE[col.key]" class="sortable" @click="toggleSort(SORTABLE[col.key])">
                    {{ col.label }}
                    <v-icon size="14">{{ sortIcon(SORTABLE[col.key]) }}</v-icon>
                  </span>
                  <span v-else>{{ col.label }}</span>
                  <v-icon v-if="col.key === 'etd'" size="14" class="ml-1 text-medium-emphasis">
                    mdi-information-outline
                    <v-tooltip activator="parent" location="top">Reference date: the ETA; if the ETA is empty or invalid, the ETD; if neither, the date the reference was created.</v-tooltip>
                  </v-icon>
                </th>
              </template>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in rows" :key="item.id" class="dark:hover:bg-gray-700 hover:bg-slate-300" :class="{ 'row-held': item.status === 'held' && !item.historical }">
              <template v-for="col in visibleColumns" :key="col.key">
                <td v-if="col.key === 'select'">
                  <v-checkbox-btn
                    v-if="selectable(item)"
                    :model-value="isSelected(item)"
                    density="compact"
                    @update:model-value="toggle(item)"
                  />
                  <v-icon v-else-if="item.status === 'held'" size="16" color="warning" title="Held: not payable yet">mdi-lock-outline</v-icon>
                </td>
                <td v-else-if="col.key === 'actions'">
                  <ViewButton v-if="item.batch && item.batch_label !== 'historical'" :item="item" @click="navigateTo(`/rebate/payments/${item.batch}`)" />
                </td>
                <td v-else-if="col.key === 'system'">
                  <v-chip size="x-small" label variant="tonal" :color="item.system === 'TM1' ? 'deep-purple' : 'primary'">{{ item.system }}</v-chip>
                </td>
                <td v-else-if="col.key === 'customer'" class="max-w-64 truncate" :title="item.customer">{{ item.customer }}</td>
                <td v-else-if="col.key === 'executive'">{{ item.executive }}</td>
                <td v-else-if="col.key === 'reference'" class="whitespace-nowrap font-medium">{{ item.reference }}</td>
                <td v-else-if="col.key === 'etd'" class="whitespace-nowrap">
                  {{ item.etd }}
                  <v-chip v-if="item.date_source" size="x-small" variant="tonal" class="ml-1" :color="item.date_source === 'eta' ? undefined : 'warning'">
                    {{ DATE_SOURCES[item.date_source]?.label ?? item.date_source }}
                    <v-tooltip activator="parent" location="top">{{ DATE_SOURCES[item.date_source]?.text }}</v-tooltip>
                  </v-chip>
                </td>
                <td v-else-if="col.key === 'container'" class="whitespace-nowrap">
                  {{ item.container }}
                  <v-chip v-if="item.duplicate" size="x-small" label color="error" variant="tonal" class="ml-1" prepend-icon="mdi-content-duplicate">
                    Repeated
                    <v-tooltip activator="parent" location="top">Same container in: {{ item.duplicate_in.join(', ') }}</v-tooltip>
                  </v-chip>
                </td>
                <td v-else-if="col.key === 'amount'" class="text-right whitespace-nowrap font-medium">
                  {{ formatToCurrency(item.amount) }}
                  <div v-if="advanceOf(item)" class="mt-1">
                    <v-chip size="x-small" color="deep-purple" variant="tonal" prepend-icon="mdi-cash-minus">
                      −{{ formatToCurrency(advanceOf(item)!.pending) }}
                      <v-tooltip activator="parent" location="top">{{ advanceOf(item)!.case }}: withheld once from the payment request that includes rebate of this customer (or of its group).</v-tooltip>
                    </v-chip>
                  </div>
                </td>
                <td v-else-if="col.key === 'status'">
                  <v-chip size="small" :color="item.status === 'available' ? 'success' : 'warning'">{{ item.status === 'available' ? 'Available' : 'Held' }}</v-chip>
                  <v-chip v-if="item.historical" size="small" variant="outlined" class="ml-1">Historical</v-chip>
                </td>
                <td v-else-if="col.key === 'reason'">
                  <div class="flex flex-wrap gap-1">
                    <v-chip
                      v-for="reason in holdReasons(item.hold_reason)"
                      :key="reason.code"
                      size="x-small"
                      label
                      variant="outlined"
                      color="warning"
                      :prepend-icon="reason.icon"
                      :class="{ 'cursor-pointer': reason.code === 'debt' || reason.code === 'special_case' }"
                      @click.stop="onReason(reason.code, item)"
                    >
                      {{ reason.label }}<template v-if="reason.code === 'special_case' && item.special_case"> · {{ formatToCurrency(item.special_case.pending) }} pending</template>
                      <v-tooltip activator="parent" location="top">{{ reason.text }}</v-tooltip>
                    </v-chip>
                    <v-chip
                      v-if="item.special_case && item.special_case.pending <= 0"
                      size="x-small"
                      label
                      variant="outlined"
                      color="success"
                      prepend-icon="mdi-folder-check-outline"
                      class="cursor-pointer"
                      @click.stop="openCase(item)"
                    >
                      Covered by case
                      <v-tooltip activator="parent" location="top">«{{ item.special_case.case }}» covered the demurrage of this reference, so its rebate can be paid</v-tooltip>
                    </v-chip>
                  </div>
                </td>
                <td v-else-if="col.key === 'payment'" class="whitespace-nowrap">
                  <span v-if="item.batch_label === 'historical'" class="text-medium-emphasis">Delivered</span>
                  <template v-else-if="item.batch">
                    <a class="text-primary cursor-pointer font-medium" @click.stop="navigateTo(`/rebate/payments/${item.batch}`)">{{ item.batch_folio || `#${item.batch}` }}</a>
                    <v-chip size="x-small" class="ml-1" :color="paymentStatus(item.batch_status).color">{{ paymentStatus(item.batch_status).label }}</v-chip>
                  </template>
                  <span v-else class="text-medium-emphasis">—</span>
                </td>
              </template>
            </tr>
            <tr v-if="!rows.length && !loading">
              <td :colspan="visibleColumns.length" class="text-center py-8 text-medium-emphasis">No rebate for these filters.</td>
            </tr>
          </tbody>
        </v-table>
        <v-pagination v-model="page" :length="lastPage" rounded="circle" density="compact" :total-visible="7" @update:model-value="load" />
      </v-card-text>
    </v-card>

    <RebateDebtDialog v-model="debtOpen" :container-id="debtContainerId" />

    <v-dialog v-model="caseOpen" max-width="480">
      <v-card v-if="caseRow">
        <v-card-title class="text-subtitle-1 font-medium">
          <v-icon icon="mdi-folder-star-outline" class="mr-1" />{{ caseRow.special_case.case }}
        </v-card-title>
        <v-card-text>
          <div class="mb-3">
            <strong>{{ caseRow.reference }}</strong> · {{ caseRow.customer }}
          </div>
          <v-table density="compact" class="mb-3">
            <tbody>
              <tr><td>Demurrage handled by the case</td><td class="text-right">{{ formatToCurrency(caseRow.special_case.original) }}</td></tr>
              <tr><td>Covered</td><td class="text-right text-success">{{ formatToCurrency(caseRow.special_case.covered) }}</td></tr>
              <tr><td class="font-medium">Pending</td><td class="text-right font-medium" :class="caseRow.special_case.pending > 0 ? 'text-warning' : 'text-success'">{{ formatToCurrency(caseRow.special_case.pending) }}</td></tr>
            </tbody>
          </v-table>
          <v-progress-linear :model-value="caseProgress" :color="caseRow.special_case.pending > 0 ? 'warning' : 'success'" height="8" rounded class="mb-3" />
          <p v-if="caseRow.special_case.pending > 0" class="text-body-2 text-medium-emphasis">
            The rebate of this reference is released automatically when the case covers the rest of its demurrage with the freight of new references.
          </p>
          <p v-else class="text-body-2 text-medium-emphasis">The case covered all the demurrage of this reference: its rebate can be requested.</p>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="caseOpen = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <RebateOldDebtsDialog v-model="oldDebtsOpen" />

    <v-dialog v-model="confirmOpen" max-width="520">
      <v-card>
        <v-card-title>Request the payment</v-card-title>
        <v-card-text>
          <div class="mb-3">
            <strong>{{ selectedCount }}</strong> selected containers ·
            <strong>{{ formatToCurrency(selectedAmountTotal) }}</strong>
            <span v-if="allMode" class="text-medium-emphasis"> (all available matching the filters)</span>
          </div>
          <v-alert v-if="withheldPreview > 0 || (allMode && advances.length)" type="info" color="deep-purple" variant="tonal" density="compact" icon="mdi-cash-minus" class="mb-3">
            <template v-if="!allMode">
              Withheld for {{ advances.map((a) => a.case).join(', ') }}: <strong>−{{ formatToCurrency(withheldPreview) }}</strong>. Net to pay: <strong>{{ formatToCurrency(selectedAmountTotal - withheldPreview) }}</strong>.
            </template>
            <template v-else>Up to <strong>{{ formatToCurrency(advances.reduce((s, a) => s + a.pending, 0)) }}</strong> is withheld for {{ advances.map((a) => a.case).join(', ') }} if the selection includes rebate of those customers.</template>
          </v-alert>
          <ul class="grid gap-2 text-sm">
            <li class="flex gap-2"><v-icon size="18">mdi-file-tree-outline</v-icon>Rebate is paid per whole reference: all the containers of each selected reference are included, and a reference with any held container is left out.</li>
            <li class="flex gap-2"><v-icon size="18">mdi-cash-minus</v-icon>Any customer debt handled by a special case is deducted from the payment.</li>
            <li class="flex gap-2"><v-icon size="18">mdi-cash-check</v-icon>Accounting marks it as paid once the payment is made.</li>
          </ul>
        </v-card-text>
        <v-card-actions class="tm-dialog-actions">
          <v-btn color="red" @click="confirmOpen = false">Close</v-btn>
          <v-spacer />
          <v-btn color="primary" :loading="busy === 'batch'" @click="requestPayment">Request payment</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import type { TableColumnDef } from '~/composables/useTableColumns'

const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const { paymentStatus, holdReasons, saveBlob } = useRebate()
const docs = usePageDocs()

// The "Owes" chip opens the summary of what the customer has pending.
const debtOpen = ref(false)
const oldDebtsOpen = ref(false)

// Which date of the reference the Date column shows.
const DATE_SOURCES: Record<string, { label: string; text: string }> = {
  eta: { label: 'ETA', text: 'Estimated time of arrival of the reference' },
  etd: { label: 'ETD', text: 'The ETA is empty or invalid, so the ETD is used' },
  created: { label: 'Created', text: 'The reference has no valid ETA or ETD, so the date it was created is used' },
}
const debtContainerId = ref<number | null>(null)
function openDebt(id: number) {
  debtContainerId.value = id
  debtOpen.value = true
}

// The "Special case" and "Covered by case" chips open the progress of the case on that reference.
const caseOpen = ref(false)
const caseRow = ref<any>(null)
const caseProgress = computed(() => {
  const detail = caseRow.value?.special_case
  return detail?.original > 0 ? Math.min((detail.covered / detail.original) * 100, 100) : 0
})
function openCase(item: any) {
  caseRow.value = item
  caseOpen.value = true
}
function onReason(code: string, item: any) {
  if (code === 'debt') openDebt(item.id)
  if (code === 'special_case' && item.special_case) openCase(item)
}

const PER_PAGE = 50
const loading = ref(false)
const busy = ref<'' | 'full' | 'batch'>('')
const rows = ref<any[]>([])
const total = ref(0)
const summary = ref<any>(null)
const confirmOpen = ref(false)
const showFilters = ref(true)
const page = ref(1)
const sort = ref<{ key: string; order: 'asc' | 'desc' }>({ key: 'etd', order: 'desc' })
const options = reactive<{ executives: any[]; customers: any[]; restricted: boolean }>({ executives: [], customers: [], restricted: false })

const blankFilters = () => ({
  search: null as string | null,
  executive_id: null as number | null,
  consignee_id: null as number | null,
  system: null as string | null,
  status: null as string | null,
  payment: null as string | null,
  historical: null as string | null,
  repeated: null as string | null,
  date_from: null as string | null,
  date_to: null as string | null,
  special_case: null as string | null,
  available_first: null as number | null,
  include_future: null as number | null,
})
// `filters` is what the form edits; `applied` is what the table uses (changes with Search, like the other modules).
const filters = ref<Record<string, any>>(blankFilters())
const applied = ref<Record<string, any>>(blankFilters())

const systemItems = [{ title: 'TM1', value: 'tm1' }, { title: 'TM2', value: 'tm2' }]
const statusItems = [{ title: 'Available', value: 'available' }, { title: 'Held', value: 'held' }]
const paymentItems = [
  { title: 'Not requested', value: 'none' },
  { title: 'In payment process', value: 'in_payment' },
  { title: 'Paid', value: 'paid' },
]
const historicalItems = [{ title: 'Current only', value: 'no' }, { title: 'Historical only', value: 'yes' }]
const repeatedItems = [{ title: 'Only repeated', value: 'yes' }, { title: 'Not repeated', value: 'no' }]
const specialCaseItems = [{ title: 'Held by a case', value: 'held' }, { title: 'Released by a case', value: 'released' }]

const filterLayoutDefs = [
  { key: 'search', label: 'Search', span: 4 },
  { key: 'executive', label: 'Executive', span: 3 },
  { key: 'customer', label: 'Customer', span: 3 },
  { key: 'system', label: 'System', span: 2 },
  { key: 'status', label: 'Status', span: 2 },
  { key: 'payment', label: 'Payment', span: 2 },
  { key: 'historical', label: 'History', span: 2 },
  { key: 'repeated', label: 'Repeated container', span: 2 },
  { key: 'specialCase', label: 'Special case', span: 2 },
  { key: 'dateFrom', label: 'Date from', span: 2 },
  { key: 'dateTo', label: 'Date to', span: 2 },
  { key: 'availableFirst', label: 'Available first', span: 3 },
  { key: 'includeFuture', label: 'Future ETA', span: 3 },
]
const filterModelKeys: Record<string, string[]> = {
  search: ['search'], executive: ['executive_id'], customer: ['consignee_id'], system: ['system'], status: ['status'],
  payment: ['payment'], historical: ['historical'], repeated: ['repeated'], specialCase: ['special_case'], dateFrom: ['date_from'], dateTo: ['date_to'], availableFirst: ['available_first'], includeFuture: ['include_future'],
}
const onLayoutFilterHidden = (key: string) => {
  ;(filterModelKeys[key] ?? []).forEach((modelKey) => (filters.value[modelKey] = null))
}

const tableColumnDefs = [
  { key: 'select', label: 'Select', locked: true },
  { key: 'actions', label: 'Actions', locked: true },
  { key: 'system', label: 'System' },
  { key: 'customer', label: 'Customer' },
  { key: 'executive', label: 'Executive' },
  { key: 'reference', label: 'Reference', locked: true },
  { key: 'etd', label: 'Date' },
  { key: 'container', label: 'Container' },
  { key: 'amount', label: 'Rebate', align: 'end' },
  { key: 'status', label: 'Status' },
  { key: 'reason', label: 'Held because' },
  { key: 'payment', label: 'Payment' },
] as (TableColumnDef & { align?: string })[]
const columnsLayout = useTableColumns('table-columns:rebate-containers', tableColumnDefs)
const visibleColumns = computed(() => columnsLayout.visibleColumns.value as (TableColumnDef & { align?: string })[])

const SORTABLE: Record<string, string> = { customer: 'customer', executive: 'executive', reference: 'reference', etd: 'etd', container: 'container', amount: 'amount', status: 'status', payment: 'batch', system: 'system' }
const sortIcon = (key: string) => (sort.value.key === key ? (sort.value.order === 'asc' ? 'mdi-arrow-up' : 'mdi-arrow-down') : 'mdi-unfold-more-horizontal')
function toggleSort(key: string) {
  sort.value = { key, order: sort.value.key === key && sort.value.order === 'desc' ? 'asc' : 'desc' }
  page.value = 1
  load()
}

// ---- Selection. Explicit ids (any page) or "all available matching the filters" minus the ones left out; held rows can't be selected.
const selected = ref(new Map<number, number>()) // id -> amount
const selectedCustomer = new Map<number, number | null>() // id -> consignee_id (for the withholding preview)
const advances = ref<{ case: string; customer: string; customer_id: number; consignee_ids: number[]; pending: number }[]>([])
const cases = ref<{ case: string; held_refs: number; held_containers: number; held_amount: number; pending: number; released_refs: number; released_containers: number; released_amount: number }[]>([])
// The advance shows on the rows of the case's own customer; the group pays it only if that customer is not in the request.
// Shown once per customer (on its first payable row), because the amount is withheld once per request, not per container.
const advanceOf = (item: any) => {
  if (!selectable(item)) return undefined
  const advance = advances.value.find((a) => a.customer_id === item.consignee_id)
  if (!advance) return undefined
  return rows.value.find((row) => selectable(row) && row.consignee_id === item.consignee_id)?.id === item.id ? advance : undefined
}
// What the request would withhold: per case, up to what is pending and up to the rebate selected from its customers.
const withheldPreview = computed(() => {
  if (allMode.value) return 0
  return advances.value.reduce((sum, advance) => {
    let base = 0
    for (const [id, amount] of selected.value) {
      if (advance.consignee_ids.includes(Number(selectedCustomer.get(id)))) base += amount
    }
    return sum + Math.min(advance.pending, base)
  }, 0)
})
const allMode = ref(false)
const excluded = ref(new Map<number, number>())
const selectable = (item: any) => item.status === 'available' && !item.batch
const availableOnPage = computed(() => rows.value.filter(selectable).length)
const isSelected = (item: any) => (allMode.value ? !excluded.value.has(item.id) : selected.value.has(item.id))
const pageAllSelected = computed(() => availableOnPage.value > 0 && rows.value.filter(selectable).every(isSelected))
const pageSomeSelected = computed(() => rows.value.filter(selectable).some(isSelected))
const selectedAmount = computed(() => [...selected.value.values()].reduce((sum, amount) => sum + amount, 0))
const selectedCount = computed(() =>
  allMode.value ? Math.max((summary.value?.new_for_export.containers ?? 0) - excluded.value.size, 0) : selected.value.size,
)
const selectedAmountTotal = computed(() =>
  allMode.value
    ? Math.max((summary.value?.new_for_export.amount ?? 0) - [...excluded.value.values()].reduce((sum, amount) => sum + amount, 0), 0)
    : selectedAmount.value,
)

// Rebate is paid per whole reference: ticking a container ticks every container of its reference on the page
// (the request adds the ones on other pages; a reference with any held container can't be requested).
function toggle(item: any) {
  // ids mode tracks the ones picked; all mode tracks the ones left out
  const target = allMode.value ? excluded.value : selected.value
  const on = !target.has(item.id)
  for (const row of rows.value.filter((r) => r.ref_key === item.ref_key && selectable(r))) {
    on ? target.set(row.id, Number(row.amount)) : target.delete(row.id)
    selectedCustomer.set(row.id, row.consignee_id ?? null)
  }
}
function togglePage(on: boolean | null) {
  for (const item of rows.value.filter(selectable)) {
    if (!!on !== isSelected(item)) toggle(item)
  }
}
function selectAllMatching() {
  allMode.value = true
  excluded.value = new Map()
  selected.value = new Map()
}
function clearSelection() {
  allMode.value = false
  excluded.value = new Map()
  selected.value = new Map()
}

const lastPage = computed(() => Math.max(Math.ceil(total.value / PER_PAGE), 1))

// Summary blocks double as quick filters.
const empty = { amount: 0, containers: 0 }
const cards = computed(() => {
  const s = summary.value
  const only = (patch: Record<string, string>) => patch
  return [
    { key: 'available', label: 'Available to pay', icon: 'mdi-check-circle-outline', color: 'success', ...(s?.available ?? empty), apply: only({ status: 'available', payment: 'none', historical: 'no' }) },
    { key: 'held', label: 'Held', icon: 'mdi-pause-circle-outline', color: 'warning', ...(s?.held ?? empty), apply: only({ status: 'held' }) },
    { key: 'in_payment', label: 'In payment process', icon: 'mdi-progress-clock', color: 'info', ...(s?.in_payment ?? empty), apply: only({ payment: 'in_payment' }) },
    { key: 'paid', label: 'Paid', icon: 'mdi-cash-check', color: 'primary', ...(s?.paid ?? empty), apply: only({ payment: 'paid' }) },
    { key: 'historical', label: 'Historical (delivered)', icon: 'mdi-history', color: 'secondary', ...(s?.historical ?? empty), apply: only({ historical: 'yes' }) },
    { key: 'repeated', label: 'Repeated containers', icon: 'mdi-content-duplicate', color: 'error', amount: null as number | null, containers: s?.repeated ?? 0, apply: only({ repeated: 'yes' }) },
  ].map((card) => ({ ...card, active: Object.entries(card.apply).every(([key, value]) => applied.value[key] === value) }))
})

function applyCard(card: { active: boolean; apply: Record<string, string> }) {
  const next = { ...blankFilters(), search: applied.value.search, executive_id: applied.value.executive_id, consignee_id: applied.value.consignee_id, available_first: applied.value.available_first }
  if (!card.active) Object.assign(next, card.apply)
  clearSelection()
  filters.value = { ...next }
  applied.value = { ...next }
  page.value = 1
  load()
}

const query = () => ({
  ...Object.fromEntries(Object.entries(applied.value).filter(([, value]) => value !== null && value !== '' && value !== undefined)),
  sort_by: sort.value.key,
  sort_dir: sort.value.order,
})

function onClickFilters() {
  clearSelection()
  applied.value = { ...filters.value }
  page.value = 1
  load()
}

function filterCase(value: 'held' | 'released') {
  const next = applied.value.special_case === value ? null : value
  filters.value = { ...filters.value, special_case: next }
  onClickFilters()
}

function clearFilters() {
  filters.value = blankFilters()
  onClickFilters()
}

async function load() {
  loading.value = true
  try {
    const { data } = await $api.rebate.getContainers({ ...query(), page: page.value, per_page: PER_PAGE })
    rows.value = data.rows
    total.value = data.total
    summary.value = data.summary
    advances.value = data.advances ?? []
    cases.value = data.cases ?? []
  } catch {
    snackbar.add({ type: 'error', text: 'Could not load the rebate containers' })
  } finally {
    loading.value = false
  }
}

async function loadOptions() {
  try {
    Object.assign(options, (await $api.rebate.getFilters()).data)
  } catch {
    snackbar.add({ type: 'error', text: 'Could not load the filters' })
  }
}

async function download() {
  busy.value = 'full'
  try {
    saveBlob(
      await $api.rebate.downloadContainers(
        allMode.value ? query() : {},
        allMode.value ? { all: true, exclude_ids: [...excluded.value.keys()] } : { ids: [...selected.value.keys()] },
      ),
      'rebate',
    )
  } catch {
    snackbar.add({ type: 'error', text: 'Could not download the Excel' })
  } finally {
    busy.value = ''
  }
}

async function requestPayment() {
  busy.value = 'batch'
  try {
    saveBlob(
      await $api.rebate.requestPayment(
        allMode.value ? query() : {},
        allMode.value ? { all: true, exclude_ids: [...excluded.value.keys()] } : { ids: [...selected.value.keys()] },
      ),
      'rebate-payment',
    )
    clearSelection()
    confirmOpen.value = false
    snackbar.add({ type: 'success', text: 'Payment request created' })
    await load()
  } catch (error: any) {
    snackbar.add({ type: 'error', text: error?.status === 422 ? 'There is no available rebate to request' : 'Could not request the payment' })
  } finally {
    busy.value = ''
  }
}

onMounted(() => {
  loadOptions()
  load()
})
</script>

<style scoped>
.summary-card {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  background: rgb(var(--v-theme-surface));
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.summary-card:hover,
.summary-card--active {
  border-color: rgb(var(--v-theme-primary));
}
.summary-card--active {
  box-shadow: 0 0 0 1px rgb(var(--v-theme-primary));
}
.sortable {
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
}
.row-held > td:first-child {
  box-shadow: inset 3px 0 0 rgb(var(--v-theme-warning));
}
</style>
