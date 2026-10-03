<template>
  <div class="flex flex-col gap-3 reference-calendar">
    <!-- Toolbar: navigation + summary -->
    <div class="flex flex-wrap items-center gap-2">
      <v-btn size="small" variant="tonal" prepend-icon="mdi-format-list-bulleted" :to="config.listPath" class="cursor-pointer">
        List view
      </v-btn>
      <v-divider vertical class="mx-2" />
      <v-btn-toggle v-model="view" mandatory density="comfortable" variant="outlined" divided color="primary">
        <v-btn value="month" size="small" class="cursor-pointer">Month</v-btn>
        <v-btn value="week" size="small" class="cursor-pointer">Week</v-btn>
      </v-btn-toggle>
      <v-btn icon="mdi-chevron-left" size="small" variant="tonal" density="comfortable" :title="`Previous ${view}`" @click="shift(-1)" />
      <v-btn icon="mdi-chevron-right" size="small" variant="tonal" density="comfortable" :title="`Next ${view}`" @click="shift(1)" />
      <v-menu v-model="monthMenu" :close-on-content-click="false" location="bottom start">
        <template #activator="{ props: menuProps }">
          <v-btn v-bind="menuProps" variant="text" class="text-lg font-bold cursor-pointer" append-icon="mdi-menu-down">
            {{ rangeLabel }}
          </v-btn>
        </template>
        <v-card class="pa-3" width="280">
          <div class="flex items-center justify-between mb-2">
            <v-btn icon="mdi-chevron-left" size="small" variant="text" @click="pickerYear--" />
            <span class="font-bold">{{ pickerYear }}</span>
            <v-btn icon="mdi-chevron-right" size="small" variant="text" @click="pickerYear++" />
          </div>
          <div class="grid grid-cols-3 gap-1">
            <v-btn
              v-for="(m, i) in monthNames"
              :key="m"
              size="small"
              :variant="isAnchorMonth(i) ? 'flat' : 'text'"
              :color="isAnchorMonth(i) ? 'primary' : undefined"
              @click="pickMonth(i)"
            >
              {{ m }}
            </v-btn>
          </div>
        </v-card>
      </v-menu>
      <v-btn size="small" variant="tonal" color="primary" class="cursor-pointer" @click="goToday">Today</v-btn>

      <v-spacer />

      <v-chip size="small" variant="tonal" prepend-icon="mdi-file-document-multiple-outline">
        {{ shownItems.length }} reference{{ shownItems.length === 1 ? '' : 's' }} · {{ groupCount }} {{ config.groupLabel }}{{ groupCount === 1 ? '' : 's' }}
      </v-chip>
      <v-chip
        size="small"
        :variant="onlyNoDate ? 'flat' : 'tonal'"
        color="orange"
        prepend-icon="mdi-calendar-alert"
        class="cursor-pointer"
        @click="onlyNoDate = !onlyNoDate"
      >
        {{ noDateCount }} without {{ config.dateLabel }}
      </v-chip>
      <v-chip v-if="cancelledCount" size="small" variant="tonal" color="red" prepend-icon="mdi-cancel">
        {{ cancelledCount }} cancelled
      </v-chip>
      <v-chip
        size="small"
        :variant="showLegacy ? 'flat' : 'tonal'"
        color="grey"
        prepend-icon="mdi-history"
        class="cursor-pointer"
        title="Show references from the legacy system (TM1)"
        @click="toggleLegacy"
      >
        TM1{{ showLegacy ? ` · ${legacyCount}` : '' }}
      </v-chip>
    </div>

    <!-- Filters -->
    <v-card elevation="0" class="calendar-filters px-3 py-3" @keyup.enter="load">
      <div class="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        <div class="md:col-span-2">
          <v-text-field
            v-model="filters.referencia"
            density="compact"
            label="Reference #"
            prepend-inner-icon="mdi-pound"
            hide-details
            clearable
            @click:clear="onClear"
          />
        </div>
        <div class="md:col-span-3">
          <ACustomerSearch v-model="filters.consignee_id" @update:model-value="load" />
        </div>
        <div class="md:col-span-2">
          <v-select
            v-model="filters.deleted_status"
            density="compact"
            label="Status"
            :items="statusItems"
            item-title="name"
            item-value="value"
            hide-details
            @update:model-value="load"
          />
        </div>
        <div class="md:col-span-3">
          <v-autocomplete
            v-model="carrierFilter"
            :items="carrierOptions"
            density="compact"
            :label="config.carrierLabel"
            prepend-inner-icon="mdi-domain"
            multiple
            chips
            closable-chips
            clearable
            hide-details
          />
        </div>
        <div class="md:col-span-2 flex justify-end gap-2">
          <v-btn size="small" variant="tonal" class="cursor-pointer" @click="clearFilters">Clear</v-btn>
          <v-btn size="small" color="primary" prepend-icon="mdi-magnify" class="cursor-pointer" @click="load">Search</v-btn>
        </div>
        <div class="md:col-span-3">
          <v-autocomplete
            v-model="portFilter"
            :items="portOptions"
            density="compact"
            :label="config.portLabel"
            prepend-inner-icon="mdi-map-marker-outline"
            multiple
            chips
            closable-chips
            clearable
            hide-details
          />
        </div>
        <div class="md:col-span-4">
          <v-text-field
            v-model="quick"
            density="compact"
            label="Quick filter: consignee, vessel, AWB…"
            prepend-inner-icon="mdi-filter-outline"
            hide-details
            clearable
          />
        </div>
      </div>
    </v-card>

    <div class="flex flex-wrap items-center gap-4 text-xs">
      <span class="flex items-center gap-1"><span class="legend-dot bg-blue-600"></span> With {{ config.dateLabel }}</span>
      <span class="flex items-center gap-1">
        <span class="legend-dot bg-orange-500"></span> No {{ config.dateLabel }} — placed by capture date
      </span>
      <span class="flex items-center gap-1"><span class="legend-dot bg-red-600"></span> Cancelled</span>
      <span class="flex items-center gap-1"><span class="legend-dot bg-gray-400"></span> TM1 (legacy, read-only)</span>
    </div>

    <!-- Calendar -->
    <div class="calendar-shell border rounded-lg overflow-hidden">
      <div class="grid grid-cols-7 text-center text-xs font-semibold calendar-head">
        <div v-for="(d, i) in weekdays" :key="d" class="py-2">
          {{ d }}<template v-if="view === 'week'"> {{ days[i]?.day }}</template>
        </div>
      </div>

      <!-- Month grid -->
      <div
        v-if="view === 'month'"
        ref="gridEl"
        class="grid grid-cols-7 calendar-grid"
        :style="{ gridTemplateRows: `repeat(${weeks}, minmax(0, 1fr))` }"
      >
        <div
          v-for="day in days"
          :key="day.iso"
          class="calendar-cell border-t border-l p-1 flex flex-col gap-0.5 overflow-hidden"
          :class="{
            'calendar-cell--other': !day.inMonth,
            'calendar-cell--today': day.isToday,
            'calendar-cell--weekend': day.weekend,
            'cursor-pointer': dayItems(day.iso).length,
          }"
          @click="dayItems(day.iso).length && openDay(day.iso)"
        >
          <div class="flex items-center justify-between shrink-0">
            <span class="day-number" :class="{ 'day-number--today': day.isToday }">{{ day.day }}</span>
            <span v-if="dayItems(day.iso).length" class="day-count">{{ dayItems(day.iso).length }}</span>
          </div>
          <template v-for="group in visibleGroups(day.iso)" :key="group.key">
            <v-tooltip location="top" open-delay="250">
              <template #activator="{ props: tipProps }">
                <div v-bind="tipProps" class="ref-chip shrink-0" :class="groupChipClass(group)" @click.stop="openGroup(day.iso, group)">
                  <v-icon size="12" class="shrink-0">{{ group.none ? 'mdi-help-circle-outline' : config.groupIcon }}</v-icon>
                  <span class="truncate font-semibold">{{ group.none ? config.groupNone : group.name }}</span>
                  <span class="ml-auto shrink-0 ref-chip__count">{{ group.items.length }}</span>
                </div>
              </template>
              <div class="text-xs flex flex-col gap-0.5">
                <div class="font-bold">{{ group.none ? config.groupNone : group.name }}<span v-if="group.legacy"> · TM1</span></div>
                <div v-if="group.detail">{{ group.detail }}</div>
                <div>{{ group.items.length }} reference{{ group.items.length === 1 ? '' : 's' }}</div>
                <div v-if="group.noDate && !group.legacy" class="text-orange-300">{{ group.noDate }} without {{ config.dateLabel }}</div>
              </div>
            </v-tooltip>
          </template>
          <div v-if="dayGroups(day.iso).length > visibleCount" class="more-pill shrink-0">
            +{{ dayGroups(day.iso).length - visibleCount }} more
          </div>
        </div>
      </div>

      <!-- Week columns -->
      <div v-else class="grid grid-cols-7 calendar-grid" style="grid-template-rows: minmax(0, 1fr)">
        <div
          v-for="day in days"
          :key="day.iso"
          class="calendar-cell week-col border-t border-l flex flex-col"
          :class="{ 'calendar-cell--today': day.isToday, 'calendar-cell--weekend': day.weekend }"
        >
          <div class="flex items-center justify-between px-2 py-1 shrink-0">
            <span class="day-number" :class="{ 'day-number--today': day.isToday }">{{ day.day }}</span>
            <span v-if="dayItems(day.iso).length" class="day-count">{{ dayItems(day.iso).length }}</span>
          </div>
          <div class="week-col__body flex-1 overflow-y-auto px-1 pb-2">
            <div v-if="!dayGroups(day.iso).length" class="text-center text-xs opacity-40 pt-4">—</div>
            <ReferenceCalendarGroupRow
              v-for="group in dayGroups(day.iso)"
              :key="group.key"
              compact
              :group="group"
              :icon="config.groupIcon"
              :none-label="config.groupNone"
              :date-label="config.dateLabel"
              @open="openGroup(day.iso, $event)"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Day detail: every vessel/flight of the day -->
    <v-dialog v-model="dayDialog" max-width="680" scrollable>
      <v-card>
        <v-card-title class="flex items-start justify-between gap-2 pt-4">
          <div>
            <div class="text-base font-bold">{{ dayDialogLabel }}</div>
            <div class="text-xs font-normal opacity-70">
              {{ dayGroups(dayDialogIso).length }} {{ config.groupLabel }}{{ dayGroups(dayDialogIso).length === 1 ? '' : 's' }}
              · {{ dayItems(dayDialogIso).length }} reference{{ dayItems(dayDialogIso).length === 1 ? '' : 's' }}
            </div>
          </div>
          <v-btn icon="mdi-close" variant="text" size="small" class="cursor-pointer" @click="dayDialog = false" />
        </v-card-title>
        <v-divider />
        <v-card-text class="pa-0" style="max-height: 65vh">
          <ReferenceCalendarGroupRow
            v-for="group in dayGroups(dayDialogIso)"
            :key="group.key"
            :group="group"
            :icon="config.groupIcon"
            :none-label="config.groupNone"
            :date-label="config.dateLabel"
            @open="openGroup(dayDialogIso, $event)"
          />
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- References of one vessel/flight -->
    <ReferenceCalendarGroupDialog
      v-model="groupDialog"
      :group="activeGroup"
      :icon="config.groupIcon"
      :none-label="config.groupNone"
      :date-label="config.dateLabel"
      :day-label="groupDayLabel"
      :can-view="canView"
      :can-edit="canEdit"
      @view="viewItem"
      @edit="editItem"
      @legacy="openLegacy"
    />

    <LegacyReferenceModal v-model="legacyDialog" :kind="props.kind" :reference="legacyItem" />
  </div>
</template>

<script setup lang="ts">
type CalendarKind = 'sea-import' | 'sea-export' | 'air-import' | 'air-export'
type CalendarView = 'month' | 'week'

interface CalendarItem {
  id: number
  legacy?: boolean
  reference_number: string
  date: string
  has_date: boolean
  cancelled: boolean
  consignee_id: number | null
  consignee?: string | null
  carrier?: string | null
  vessel_voyage?: string | null
  port?: string | null
  master_awb?: string | null
  group?: { key: string; name: string; detail?: string | null } | null
}

const props = defineProps<{ kind: CalendarKind }>()

const { $api } = useNuxtApp()
const route = useRoute()
const router = useRouter()
const loadingStore = useLoadingStore()
const snackbar = useSnackbar()
const { hasPermission, fetchIsRestricted, canViewReference } = useCheckUser()
fetchIsRestricted()

// Export references reuse the ETA columns but the business calls it ETD.
const CONFIGS: Record<CalendarKind, any> = {
  'sea-import': {
    listPath: '/maritime/import',
    detailsPath: (id: number) => `/maritime/import/view-details-${id}`,
    editPath: (id: number) => `/maritime/import/${id}`,
    permissionPrefix: 'sea-import',
    groupLabel: 'vessel',
    groupNone: 'Without vessel',
    groupIcon: 'mdi-ferry',
    dateLabel: 'ETA',
    carrierLabel: 'Freight line',
    voyageLabel: 'Vessel - voyage',
    portLabel: 'POD',
    fetch: (query: any) => $api.referencias.getSeaImportCalendar({ query }),
  },
  'sea-export': {
    listPath: '/maritime/export',
    detailsPath: (id: number) => `/maritime/export/view-details-${id}`,
    editPath: (id: number) => `/maritime/export/${id}`,
    permissionPrefix: 'sea-export',
    groupLabel: 'vessel',
    groupNone: 'Without vessel',
    groupIcon: 'mdi-ferry',
    dateLabel: 'ETD',
    carrierLabel: 'Freight line',
    voyageLabel: 'Vessel - voyage',
    portLabel: 'POD',
    fetch: (query: any) => $api.referenciasExport.getSeaExportCalendar({ query }),
  },
  'air-import': {
    listPath: '/air/import',
    detailsPath: (id: number) => `/air/import/view-details-${id}`,
    editPath: (id: number) => `/air/import/operations-${id}`,
    permissionPrefix: 'air-import',
    groupLabel: 'flight',
    groupNone: 'Without flight',
    groupIcon: 'mdi-airplane',
    dateLabel: 'departure date',
    carrierLabel: 'Airline',
    voyageLabel: 'Flight',
    portLabel: 'Departure airport',
    fetch: (query: any) => $api.airImport.getCalendar({ query }),
  },
  'air-export': {
    listPath: '/air/export',
    detailsPath: (id: number) => `/air/export/view-details-${id}`,
    editPath: (id: number) => `/air/export/operations-${id}`,
    permissionPrefix: 'air-export',
    groupLabel: 'flight',
    groupNone: 'Without flight',
    groupIcon: 'mdi-airplane',
    dateLabel: 'ETD',
    carrierLabel: 'Airline',
    voyageLabel: 'Flight',
    portLabel: 'Departure airport',
    fetch: (query: any) => $api.airExport.getCalendar({ query }),
  },
}
const config = computed(() => CONFIGS[props.kind])

const statusItems = [
  { name: 'Active', value: 'active' },
  { name: 'Cancelled', value: 'deleted' },
]
const defaultFilters = () => ({ referencia: '' as string | null, consignee_id: '' as string | number, deleted_status: 'active' })
const filters = ref(defaultFilters())

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const pad = (n: number) => String(n).padStart(2, '0')
const toIso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const parseIso = (value: unknown): Date | null => {
  const m = typeof value === 'string' ? /^(\d{4})-(\d{2})-(\d{2})$/.exec(value) : null
  return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : null
}

// --- View state (persisted in the URL so back-navigation keeps it) ---------
const view = ref<CalendarView>(route.query.view === 'week' ? 'week' : 'month')
const anchor = ref<Date>(parseIso(route.query.date) ?? new Date())

const days = computed(() => {
  const todayIso = toIso(new Date())
  const build = (d: Date, inMonth = true) => ({
    iso: toIso(d),
    day: d.getDate(),
    inMonth,
    isToday: toIso(d) === todayIso,
    weekend: d.getDay() === 0 || d.getDay() === 6,
  })

  if (view.value === 'week') {
    const start = new Date(anchor.value)
    start.setDate(start.getDate() - start.getDay())
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      return build(d)
    })
  }

  const first = new Date(anchor.value.getFullYear(), anchor.value.getMonth(), 1)
  const start = new Date(first)
  start.setDate(1 - first.getDay())
  const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate()
  const total = Math.ceil((first.getDay() + daysInMonth) / 7) * 7
  return Array.from({ length: total }, (_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    return build(d, d.getMonth() === first.getMonth())
  })
})
const weeks = computed(() => Math.max(1, days.value.length / 7))

const rangeLabel = computed(() => {
  if (view.value === 'month') return anchor.value.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const first = parseIso(days.value[0].iso)!
  const last = parseIso(days.value[6].iso)!
  const f = first.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const l = last.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  return `${f} – ${l}`
})

const shift = (delta: number) => {
  const d = new Date(anchor.value)
  if (view.value === 'week') d.setDate(d.getDate() + delta * 7)
  else d.setMonth(d.getMonth() + delta, 1)
  anchor.value = d
}
const goToday = () => {
  anchor.value = new Date()
}

const monthMenu = ref(false)
const pickerYear = ref(anchor.value.getFullYear())
watch(monthMenu, (open) => open && (pickerYear.value = anchor.value.getFullYear()))
const isAnchorMonth = (i: number) => anchor.value.getFullYear() === pickerYear.value && anchor.value.getMonth() === i
const pickMonth = (i: number) => {
  anchor.value = new Date(pickerYear.value, i, 1)
  monthMenu.value = false
}

// --- Data ------------------------------------------------------------------
const items = ref<CalendarItem[]>([])

const LEGACY_KEY = 'reference-calendar:show-tm1'
const showLegacy = ref(true)
try {
  showLegacy.value = localStorage.getItem(LEGACY_KEY) !== 'false'
} catch {
  /* storage unavailable: keep default */
}
const toggleLegacy = () => {
  showLegacy.value = !showLegacy.value
  try {
    localStorage.setItem(LEGACY_KEY, String(showLegacy.value))
  } catch {
    /* ignore */
  }
  load()
}

let requestSeq = 0
const load = async () => {
  const seq = ++requestSeq
  try {
    loadingStore.start()
    const grid = days.value
    const query: Record<string, any> = { from: grid[0].iso, to: grid[grid.length - 1].iso }
    if (filters.value.referencia) query.referencia = filters.value.referencia.replace(/\s/g, '')
    if (filters.value.consignee_id) query.consignee_id = filters.value.consignee_id
    if (filters.value.deleted_status) query.deleted_status = filters.value.deleted_status
    if (showLegacy.value) query.legacy = 1

    const response = (await config.value.fetch(query)) as CalendarItem[]
    // Ignore stale responses when the user navigates quickly
    if (seq === requestSeq) items.value = response
  } catch (e) {
    console.error(e)
    snackbar.add({ type: 'error', text: 'Error loading the calendar' })
  } finally {
    setTimeout(() => loadingStore.stop(), 250)
  }
}

const onClear = () => {
  filters.value.referencia = ''
  load()
}
const clearFilters = () => {
  filters.value = defaultFilters()
  quick.value = ''
  carrierFilter.value = []
  portFilter.value = []
  onlyNoDate.value = false
  load()
}

// --- Client-side refinements on top of what the server returned -------------
const quick = ref<string | null>('')
const onlyNoDate = ref(false)
const carrierFilter = ref<string[]>([])
const portFilter = ref<string[]>([])

const distinct = (pick: (i: CalendarItem) => string | null | undefined) =>
  [...new Set(items.value.map(pick).filter((v): v is string => !!v))].sort((a, b) => a.localeCompare(b))
const carrierOptions = computed(() => distinct((i) => i.carrier))
const portOptions = computed(() => distinct((i) => i.port))

const matchesQuick = (item: CalendarItem, q: string) =>
  [item.reference_number, item.consignee, item.carrier, item.vessel_voyage, item.port, item.master_awb, item.group?.name].some(
    (v) => v && String(v).toLowerCase().includes(q),
  )

const shownItems = computed(() => {
  const q = (quick.value || '').trim().toLowerCase()
  return items.value.filter(
    (i) =>
      (showLegacy.value || !i.legacy) &&
      (!onlyNoDate.value || !i.has_date) &&
      (!carrierFilter.value.length || (i.carrier && carrierFilter.value.includes(i.carrier))) &&
      (!portFilter.value.length || (i.port && portFilter.value.includes(i.port))) &&
      (!q || matchesQuick(i, q)),
  )
})
const noDateCount = computed(() => items.value.filter((i) => !i.has_date && !i.legacy).length)
const cancelledCount = computed(() => items.value.filter((i) => i.cancelled && !i.legacy).length)
const legacyCount = computed(() => items.value.filter((i) => i.legacy).length)

const byDay = computed(() => {
  const map: Record<string, CalendarItem[]> = {}
  for (const item of shownItems.value) (map[item.date] ||= []).push(item)
  return map
})
const dayItems = (iso: string) => byDay.value[iso] || []

interface CalendarGroup {
  key: string
  name: string
  detail: string | null
  none: boolean
  legacy: boolean
  noDate: number
  allNoDate: boolean
  allCancelled: boolean
  items: CalendarItem[]
}

// Each day lists vessels (sea) or flights (air); references without one fall into a single "Without ..." entry.
// TM1 and TM2 vessels stay separate even when the name matches: they are different records.
const groupsByDay = computed(() => {
  const result: Record<string, CalendarGroup[]> = {}
  for (const [iso, list] of Object.entries(byDay.value)) {
    const map = new Map<string, CalendarGroup>()
    for (const item of list) {
      const raw = item.group
      const key = raw ? `${item.legacy ? 'tm1' : 'tm2'}-${raw.key}` : 'none'
      let g = map.get(key)
      if (!g) {
        g = { key, name: raw?.name ?? '', detail: raw?.detail ?? null, none: !raw, legacy: true, noDate: 0, allNoDate: true, allCancelled: true, items: [] }
        map.set(key, g)
      }
      g.items.push(item)
      g.legacy &&= !!item.legacy
      if (!item.has_date) g.noDate++
      g.allNoDate &&= !item.has_date
      g.allCancelled &&= item.cancelled
    }
    result[iso] = [...map.values()].sort(
      (a, b) => Number(a.none) - Number(b.none) || a.name.localeCompare(b.name),
    )
  }
  return result
})
const dayGroups = (iso: string) => groupsByDay.value[iso] || []
const groupCount = computed(() => Object.values(groupsByDay.value).reduce((n, g) => n + g.filter((x) => !x.none).length, 0))
const itemKey = (item: CalendarItem) => `${item.legacy ? 'tm1' : 'tm2'}-${item.id}`

// Fit as many chips as the cell allows (header 26px, chip 20px, "+N more" pill 20px)
const gridEl = ref<HTMLElement | null>(null)
const visibleCount = ref(4)
const CHIP_H = 20
const CELL_HEADER_H = 26
const recomputeVisible = () => {
  const el = gridEl.value
  if (!el) return
  const cellH = el.clientHeight / weeks.value
  visibleCount.value = Math.max(1, Math.floor((cellH - CELL_HEADER_H - CHIP_H) / CHIP_H))
}
const visibleGroups = (iso: string) => {
  const list = dayGroups(iso)
  // Avoid a "+1 more" pill that would take the room of the chip it hides
  return list.length === visibleCount.value + 1 ? list : list.slice(0, visibleCount.value)
}

const groupChipClass = (g: CalendarGroup) => ({
  'ref-chip--legacy': g.legacy,
  'ref-chip--legacy-no-date': g.legacy && g.allNoDate,
  'ref-chip--none': g.none && !g.legacy,
  'ref-chip--cancelled': !g.legacy && !g.none && g.allCancelled,
  'ref-chip--no-date': !g.legacy && !g.none && g.allNoDate && !g.allCancelled,
  'ref-chip--ok': !g.legacy && !g.none && !g.allNoDate && !g.allCancelled,
})

const chipClass = (item: CalendarItem) => ({
  'ref-chip--legacy': item.legacy,
  'ref-chip--legacy-no-date': item.legacy && !item.has_date,
  'ref-chip--cancelled': item.cancelled,
  'ref-chip--ok': !item.legacy && item.has_date && !item.cancelled,
  'ref-chip--no-date': !item.legacy && !item.has_date && !item.cancelled,
})

// --- Actions ---------------------------------------------------------------
const canView = (item: CalendarItem) =>
  !item.legacy && hasPermission(`${config.value.permissionPrefix}-references-view`) && canViewReference(item)
const canEdit = (item: CalendarItem) =>
  !item.legacy && !item.cancelled && hasPermission(`${config.value.permissionPrefix}-references-edit`)

const viewItem = (item: CalendarItem) => {
  if (!canView(item)) {
    snackbar.add({ type: 'info', text: 'You do not have access to the details of this reference' })
    return
  }
  router.push(config.value.detailsPath(item.id))
}
const editItem = (item: CalendarItem) => router.push(config.value.editPath(item.id))

const legacyDialog = ref(false)
const legacyItem = ref<CalendarItem | null>(null)
const openLegacy = (item: CalendarItem) => {
  legacyItem.value = item
  legacyDialog.value = true
}


// --- Day dialog ------------------------------------------------------------
const dayDialog = ref(false)
const dayDialogIso = ref('')
const dayDialogLabel = computed(() =>
  dayDialogIso.value ? new Date(`${dayDialogIso.value}T00:00:00`).toLocaleDateString('en-US', { dateStyle: 'full' }) : '',
)
const openDay = (iso: string) => {
  dayDialogIso.value = iso
  dayDialog.value = true
}

// Resolved from the live groups so filters/reloads keep an open modal consistent
const groupDialog = ref(false)
const activeGroupRef = ref<{ iso: string; key: string } | null>(null)
const activeGroup = computed(() =>
  activeGroupRef.value ? (dayGroups(activeGroupRef.value.iso).find((g) => g.key === activeGroupRef.value!.key) ?? null) : null,
)
const groupDayLabel = computed(() =>
  activeGroupRef.value
    ? new Date(`${activeGroupRef.value.iso}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '',
)
const openGroup = (iso: string, group: CalendarGroup) => {
  activeGroupRef.value = { iso, key: group.key }
  groupDialog.value = true
}

// --- Lifecycle -------------------------------------------------------------
const syncToUrl = () => router.replace({ query: { ...route.query, view: view.value, date: toIso(anchor.value) } })

// Reload only when the visible range changes (not on every day navigation inside it)
watch(
  () => `${days.value[0].iso}|${days.value[days.value.length - 1].iso}`,
  () => {
    syncToUrl()
    load()
  },
)
watch(view, () => nextTick(recomputeVisible))

let resizeObserver: ResizeObserver | null = null
watch(gridEl, (el) => {
  resizeObserver?.disconnect()
  if (el) {
    resizeObserver = new ResizeObserver(recomputeVisible)
    resizeObserver.observe(el)
    recomputeVisible()
  }
})
onMounted(load)
onBeforeUnmount(() => resizeObserver?.disconnect())
</script>

<style scoped>
.calendar-shell {
  /* Fixed height (not flex-grown) so month rows and week columns have a bounded box to fill/scroll in */
  flex: none;
  height: max(560px, calc(100vh - 340px));
  display: flex;
  flex-direction: column;
  border-color: rgba(var(--v-border-color), var(--v-border-opacity));
}
.calendar-head {
  background: rgba(var(--v-theme-on-surface), 0.05);
}
.calendar-grid {
  flex: 1 1 0;
  min-height: 0;
}
.calendar-cell {
  min-height: 0;
  border-color: rgba(var(--v-border-color), var(--v-border-opacity));
}
.calendar-cell--other {
  background: rgba(var(--v-theme-on-surface), 0.04);
  opacity: 0.65;
}
.calendar-cell--weekend {
  background: rgba(var(--v-theme-on-surface), 0.025);
}
.calendar-cell:hover.cursor-pointer {
  background: rgba(var(--v-theme-primary), 0.06);
}
.calendar-cell--today {
  background: rgba(var(--v-theme-primary), 0.08);
}
.week-col__body {
  min-height: 0;
}
.calendar-filters {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
.day-number {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0 6px;
}
.day-number--today {
  background: rgb(var(--v-theme-primary));
  color: rgb(var(--v-theme-on-primary));
  border-radius: 9999px;
}
.day-count {
  font-size: 0.65rem;
  font-weight: 600;
  padding: 0 6px;
  border-radius: 9999px;
  background: rgba(var(--v-theme-on-surface), 0.1);
}
.more-pill {
  font-size: 0.68rem;
  font-weight: 600;
  line-height: 1.1rem;
  padding: 0 6px;
  border-radius: 4px;
  color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.1);
}
.ref-chip {
  display: flex;
  gap: 4px;
  align-items: center;
  font-size: 0.7rem;
  line-height: 1.1rem;
  padding: 0 6px;
  border-radius: 4px;
  color: #fff;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
}
.ref-chip--ok {
  background: #2563eb;
}
.ref-chip--no-date {
  background: #f97316;
}
.ref-chip--cancelled {
  background: #dc2626;
  text-decoration: line-through;
}
/* Declared after --cancelled so a cancelled TM1 stays grey (only struck through) */
.ref-chip--legacy {
  background: #9ca3af;
}
/* TM1 without ETA keeps the grey identity, with an orange edge as the missing-date hint */
.ref-chip--legacy-no-date {
  box-shadow: inset 3px 0 0 #f97316;
}
.ref-chip--none {
  background: rgba(var(--v-theme-on-surface), 0.08);
  color: rgb(var(--v-theme-on-surface));
  border: 1px dashed rgba(var(--v-theme-on-surface), 0.45);
}
.ref-chip__count {
  font-weight: 700;
  padding: 0 5px;
  border-radius: 9999px;
  background: rgba(0, 0, 0, 0.22);
}
.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 9999px;
  display: inline-block;
}
</style>
