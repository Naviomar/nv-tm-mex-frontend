<template>
  <div>
    <div class="flex flex-wrap items-center gap-2 mb-3">
      <v-chip
        v-for="s in statusChips"
        :key="s.value ?? 'all'"
        size="small"
        :variant="filters.status === s.value ? 'flat' : 'tonal'"
        :color="filters.status === s.value ? 'primary' : undefined"
        class="cursor-pointer"
        @click="applyStatus(s.value)"
      >
        {{ s.title }}
      </v-chip>
      <v-spacer />
      <v-text-field
        v-model="filters.search"
        density="compact"
        hide-details
        clearable
        label="Search event name / notes"
        prepend-inner-icon="mdi-magnify"
        style="max-width: 280px"
        @keyup.enter="onClickFilters"
        @click:clear="onClickFilters"
      />
      <v-btn size="small" variant="tonal" prepend-icon="mdi-filter-variant" @click="showFilters = !showFilters">
        Filters<v-badge v-if="advancedCount" :content="advancedCount" color="primary" inline />
      </v-btn>
    </div>

    <v-expand-transition>
      <v-card v-show="showFilters" elevation="0" class="mb-3 pa-3 port-logbook-box" @keyup.enter="onClickFilters">
        <div class="grid grid-cols-1 md:grid-cols-5 gap-2 items-start">
          <div class="md:col-span-2"><APortSearch v-model="filters.port_id" label="port" /></div>
          <v-autocomplete v-model="filters.event_type" :items="catalogs.event_types" label="Event type" density="compact" clearable hide-details />
          <v-autocomplete v-model="filters.operations_status" :items="catalogs.operations_statuses" label="Port operations" density="compact" clearable hide-details />
          <div class="grid grid-cols-2 gap-2">
            <v-text-field v-model="filters.date_from" type="date" label="From" density="compact" hide-details />
            <v-text-field v-model="filters.date_to" type="date" label="To" density="compact" hide-details />
          </div>
        </div>
        <div class="flex gap-2 mt-3">
          <v-btn color="secondary" size="small" @click="clearFilters">Clear</v-btn>
          <v-btn color="primary" size="small" @click="onClickFilters">Apply</v-btn>
        </div>
      </v-card>
    </v-expand-transition>

    <v-card elevation="0" class="port-logbook-box">
      <v-card-text>
        <div class="text-caption text-medium-emphasis mb-1">Showing {{ entries.from ?? 0 }} to {{ entries.to ?? 0 }} from {{ entries.total ?? 0 }} total records</div>
        <v-table density="comfortable" hover>
          <thead>
            <tr>
              <th class="text-left">Event</th>
              <th class="text-left">Port</th>
              <th class="text-left">Port operations</th>
              <th class="text-left">Period</th>
              <th class="text-left">Status</th>
              <th class="text-left" width="150">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="entry in entries.data" :key="entry.id" class="cursor-pointer" @click="emit('open', entry)">
              <td :style="{ borderLeft: `4px solid rgb(var(--v-theme-${stripeColor(entry)}))` }">
                <div class="flex items-center gap-3">
                  <v-avatar size="34" :color="stripeColor(entry)" variant="tonal"><v-icon size="20">{{ eventIcon(entry.event_type) }}</v-icon></v-avatar>
                  <div>
                    <div class="font-weight-medium">{{ entryTitle(entry) }}</div>
                    <div v-if="entry.event_name" class="text-caption text-medium-emphasis">{{ entry.event_type_label }}</div>
                    <div v-if="entry.description" class="text-caption text-medium-emphasis text-truncate" style="max-width: 320px">{{ entry.description }}</div>
                  </div>
                </div>
              </td>
              <td>
                <div>{{ entry.port?.name }}</div>
                <div class="text-caption text-medium-emphasis">{{ entry.port?.country?.name }}</div>
              </td>
              <td>
                <v-chip size="small" :color="operationsColor(entry.operations_status)" variant="tonal" :prepend-icon="operationsIcon(entry.operations_status)">
                  {{ entry.operations_status_label }}
                </v-chip>
              </td>
              <td>
                <div class="text-no-wrap">{{ formatDateString(entry.starts_at) }}</div>
                <div class="text-caption text-medium-emphasis text-no-wrap">
                  <v-icon size="12">mdi-arrow-right</v-icon> {{ entry.ends_at ? formatDateString(entry.ends_at) : 'Ongoing' }} · {{ duration(entry) }}
                </div>
              </td>
              <td>
                <v-chip size="small" variant="tonal" :color="statusMeta(entry.status).color" :prepend-icon="statusMeta(entry.status).icon">
                  {{ statusMeta(entry.status).label }}
                </v-chip>
              </td>
              <td @click.stop>
                <div class="flex gap-2">
                  <v-tooltip text="Details and arrivals">
                    <template #activator="{ props }">
                      <v-btn v-bind="props" color="info" size="x-small" icon="mdi-ferry" @click="emit('open', entry)" />
                    </template>
                  </v-tooltip>
                  <Can permission="port-logbook-edit">
                    <v-tooltip v-if="entry.status === 'active'" text="Close event (port resumes operations)">
                      <template #activator="{ props }">
                        <v-btn v-bind="props" color="success" size="x-small" icon="mdi-lock-open-check-outline" @click="emit('close-event', entry)" />
                      </template>
                    </v-tooltip>
                  </Can>
                  <EditButton :item="entry" permission="port-logbook-edit" @click="emit('edit', entry)" />
                  <TrashButton :item="entry" permission="port-logbook-delete" @click="emit('delete', entry)" />
                </div>
              </td>
            </tr>
          </tbody>
        </v-table>
        <div v-if="!entries.data.length" class="text-center text-medium-emphasis py-8">
          <v-icon size="40" class="mb-2">mdi-anchor</v-icon>
          <div>No events match the current filters.</div>
        </div>
        <v-pagination v-model="entries.current_page" :length="entries.last_page" rounded="circle" density="compact" class="mt-2" @update:model-value="onClickPagination" />
      </v-card-text>
    </v-card>
  </div>
</template>
<script setup lang="ts">
import type { IPortLogbookEntry } from '~/repository/modules/catalogs/portLogbook'

const props = defineProps<{ refreshKey?: number; status?: string | null }>()
const emit = defineEmits(['open', 'edit', 'close-event', 'delete'])

const { $api } = useNuxtApp()
const loadingStore = useLoadingStore()
const { eventIcon, operationsColor, operationsIcon, statusMeta, entryTitle, duration } = usePortLogbook()

const statusChips = [
  { title: 'All', value: null },
  { title: 'Active', value: 'active' },
  { title: 'Scheduled', value: 'scheduled' },
  { title: 'Resolved', value: 'resolved' },
]
const catalogs = ref<{ event_types: any[]; operations_statuses: any[] }>({ event_types: [], operations_statuses: [] })

const emptyFilters = () => ({
  port_id: null as any,
  event_type: null as string | null,
  operations_status: null as string | null,
  status: (props.status ?? null) as string | null,
  search: '',
  date_from: '',
  date_to: '',
})
const filters = ref(emptyFilters())
const showFilters = ref(false)
const entries = ref<any>({ data: [], current_page: 1, last_page: 1 })

const advancedCount = computed(
  () => ['port_id', 'event_type', 'operations_status', 'date_from', 'date_to'].filter((k) => !!(filters.value as any)[k]).length
)

const stripeColor = (entry: IPortLogbookEntry) => (entry.status === 'resolved' ? 'success' : operationsColor(entry.operations_status))

const getEntries = async () => {
  try {
    loadingStore.start()
    entries.value = await $api.portLogbook.getEntries({
      query: {
        page: entries.value.current_page,
        ...flattenArraysToCommaSeparatedString(filters.value),
      },
    })
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => loadingStore.stop(), 250)
  }
}

const onClickFilters = async () => {
  entries.value.current_page = 1
  await getEntries()
}
const applyStatus = async (value: string | null) => {
  filters.value.status = value
  await onClickFilters()
}
const onClickPagination = async (page: number) => {
  entries.value.current_page = page
  await getEntries()
}
const clearFilters = async () => {
  filters.value = emptyFilters()
  filters.value.status = null
  await onClickFilters()
}

// A summary card was clicked: jump to that status.
watch(
  () => props.status,
  (value) => {
    filters.value.status = value ?? null
    onClickFilters()
  }
)
watch(() => props.refreshKey, getEntries)

onMounted(async () => {
  try {
    catalogs.value = (await $api.portLogbook.getCatalogs()) as any
  } catch (e) {
    console.error(e)
  }
  await getEntries()
})
</script>
<style scoped>
.port-logbook-box {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
</style>
