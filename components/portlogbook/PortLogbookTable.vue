<template>
  <div>
    <div class="flex items-center justify-between mb-2">
      <div class="text-xs">Showing {{ entries.from ?? 0 }} to {{ entries.to ?? 0 }} from {{ entries.total ?? 0 }} total records</div>
      <Can permission="port-logbook-create">
        <v-btn color="primary" size="small" @click="openCreate"><v-icon>mdi-plus</v-icon> Add event</v-btn>
      </Can>
    </div>

    <div class="mb-4" @keyup.enter="onClickFilters">
      <div class="grid grid-cols-1 md:grid-cols-6 gap-2">
        <div v-if="!portId" class="md:col-span-2">
          <APortSearch v-model="filters.port_id" label="port" />
        </div>
        <v-autocomplete v-model="filters.event_type" :items="catalogs.event_types" label="Event type" density="compact" clearable hide-details />
        <v-autocomplete v-model="filters.operations_status" :items="catalogs.operations_statuses" label="Port operations" density="compact" clearable hide-details />
        <v-autocomplete v-model="filters.status" :items="statusItems" label="Status" density="compact" clearable hide-details />
        <v-text-field v-model="filters.search" label="Event name / notes" density="compact" hide-details />
        <v-text-field v-model="filters.date_from" type="date" label="Overlaps from" density="compact" hide-details />
        <v-text-field v-model="filters.date_to" type="date" label="Overlaps to" density="compact" hide-details />
      </div>
      <div class="flex gap-2 mt-2">
        <v-btn color="secondary" @click="clearFilters">Clear</v-btn>
        <v-btn color="primary" @click="onClickFilters">Search</v-btn>
      </div>
    </div>

    <v-card>
      <v-card-text>
        <v-pagination v-model="entries.current_page" :length="entries.last_page" rounded="circle" density="compact" @update:model-value="onClickPagination" />
        <v-table density="compact">
          <thead>
            <tr>
              <th class="text-left" width="170">Actions</th>
              <th v-if="!portId" class="text-left">Port</th>
              <th class="text-left">Event</th>
              <th class="text-left">Port operations</th>
              <th class="text-left">Starts</th>
              <th class="text-left">Ends</th>
              <th class="text-left">Duration</th>
              <th class="text-left">Status</th>
              <th class="text-left">Registered by</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="entry in entries.data" :key="entry.id">
              <td>
                <div class="flex gap-2">
                  <v-tooltip text="Affected arrivals">
                    <template #activator="{ props }">
                      <v-btn v-bind="props" color="info" size="x-small" icon="mdi-ferry" @click="openImpact(entry)" />
                    </template>
                  </v-tooltip>
                  <Can permission="port-logbook-edit">
                    <v-tooltip v-if="entry.is_active" text="Close event (port resumes operations)">
                      <template #activator="{ props }">
                        <v-btn v-bind="props" color="success" size="x-small" icon="mdi-lock-open-check-outline" @click="closeEntry(entry)" />
                      </template>
                    </v-tooltip>
                  </Can>
                  <EditButton :item="entry" permission="port-logbook-edit" @click="openEdit" />
                  <TrashButton :item="entry" permission="port-logbook-delete" @click="deleteEntry" />
                </div>
              </td>
              <td v-if="!portId">
                {{ entry.port?.name }}
                <span class="text-medium-emphasis">{{ entry.port?.country?.name }}</span>
              </td>
              <td>
                <div class="font-weight-medium">{{ entry.event_name || entry.event_type_label }}</div>
                <div v-if="entry.event_name" class="text-caption text-medium-emphasis">{{ entry.event_type_label }}</div>
                <div v-if="entry.description" class="text-caption text-medium-emphasis">{{ entry.description }}</div>
              </td>
              <td>
                <v-chip size="small" :color="operationsColor(entry.operations_status)" variant="tonal">{{ entry.operations_status_label }}</v-chip>
              </td>
              <td>{{ formatDateString(entry.starts_at) }}</td>
              <td>{{ entry.ends_at ? formatDateString(entry.ends_at) : '-' }}</td>
              <td>{{ duration(entry) }}</td>
              <td>
                <v-chip size="small" :color="entry.is_active ? 'error' : 'success'" variant="tonal">
                  {{ entry.is_active ? 'Active' : 'Resolved' }}
                </v-chip>
              </td>
              <td>
                <UserInfoBadge :item="entry">{{ entry.creator?.name }}</UserInfoBadge>
              </td>
            </tr>
            <tr v-if="!entries.data.length">
              <td :colspan="portId ? 8 : 9" class="text-center text-medium-emphasis py-4">No events registered.</td>
            </tr>
          </tbody>
        </v-table>
        <v-pagination v-model="entries.current_page" :length="entries.last_page" rounded="circle" density="compact" @update:model-value="onClickPagination" />
      </v-card-text>
    </v-card>

    <PortLogbookEntryDialog v-model="entryDialog" :entry="selected" :fixed-port-id="portId" @saved="getEntries" />
    <PortLogbookImpactDialog v-model="impactDialog" :entry="selected" />
  </div>
</template>
<script setup lang="ts">
import moment from 'moment-timezone'
import type { IPortLogbookEntry } from '~/repository/modules/catalogs/portLogbook'

const props = defineProps<{ portId?: number | string | null }>()

const { $api, $notifications } = useNuxtApp()
const confirm = $notifications.useConfirm()
const loadingStore = useLoadingStore()
const snackbar = useSnackbar()

const statusItems = [
  { title: 'Active', value: 'active' },
  { title: 'Resolved', value: 'resolved' },
]
const catalogs = ref<{ event_types: any[]; operations_statuses: any[] }>({ event_types: [], operations_statuses: [] })

const emptyFilters = () => ({
  port_id: null as any,
  event_type: null as string | null,
  operations_status: null as string | null,
  status: null as string | null,
  search: '',
  date_from: '',
  date_to: '',
})
const filters = ref(emptyFilters())

const entries = ref<any>({ data: [], current_page: 1, last_page: 1 })
const selected = ref<IPortLogbookEntry | null>(null)
const entryDialog = ref(false)
const impactDialog = ref(false)

const operationsColor = (status: string) => ({ closed: 'error', restricted: 'warning', delayed: 'info' })[status] ?? 'secondary'

// Start/end are Mexico City wall-clock strings; an open event runs until now.
const duration = (entry: IPortLogbookEntry) => {
  const start = moment.tz(entry.starts_at, 'America/Mexico_City')
  const end = entry.ends_at ? moment.tz(entry.ends_at, 'America/Mexico_City') : moment.tz('America/Mexico_City')
  const hours = Math.max(0, Math.round(end.diff(start, 'hours', true)))
  if (hours < 48) return `${hours} h${entry.ends_at ? '' : ' (ongoing)'}`
  return `${Math.round(hours / 24)} d${entry.ends_at ? '' : ' (ongoing)'}`
}

const getEntries = async () => {
  try {
    loadingStore.start()
    entries.value = await $api.portLogbook.getEntries({
      query: {
        page: entries.value.current_page,
        ...flattenArraysToCommaSeparatedString({ ...filters.value, port_id: props.portId ?? filters.value.port_id }),
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
const onClickPagination = async (page: number) => {
  entries.value.current_page = page
  await getEntries()
}
const clearFilters = async () => {
  filters.value = emptyFilters()
  await onClickFilters()
}

const openCreate = () => {
  selected.value = null
  entryDialog.value = true
}
const openEdit = (entry: IPortLogbookEntry) => {
  selected.value = entry
  entryDialog.value = true
}
const openImpact = (entry: IPortLogbookEntry) => {
  selected.value = entry
  impactDialog.value = true
}

const closeEntry = async (entry: IPortLogbookEntry) => {
  const result = await confirm({
    title: 'Close event',
    confirmationText: 'Close event',
    content: `Mark "${entry.event_name || entry.event_type_label}" at ${entry.port?.name} as resolved now (the port resumes operations)?`,
    dialogProps: { persistent: true, maxWidth: 500 },
    confirmationButtonProps: { color: 'primary' },
  })
  if (!result) return
  try {
    loadingStore.start()
    await $api.portLogbook.close(entry.id)
    snackbar.add({ type: 'success', text: 'Event closed' })
    await getEntries()
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => loadingStore.stop(), 250)
  }
}

const deleteEntry = async (entry: IPortLogbookEntry) => {
  const result = await confirm({
    title: 'Are you sure?',
    confirmationText: 'Delete',
    content: 'Please confirm you want to delete this port event.',
    dialogProps: { persistent: true, maxWidth: 500 },
    confirmationButtonProps: { color: 'primary' },
  })
  if (!result) return
  try {
    loadingStore.start()
    await $api.portLogbook.delete(entry.id)
    snackbar.add({ type: 'success', text: 'Port event deleted' })
    await getEntries()
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => loadingStore.stop(), 250)
  }
}

onMounted(async () => {
  try {
    catalogs.value = (await $api.portLogbook.getCatalogs()) as any
  } catch (e) {
    console.error(e)
  }
  await getEntries()
})
</script>
