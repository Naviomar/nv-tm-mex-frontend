<template>
  <v-dialog :model-value="modelValue" max-width="720px" persistent scrollable @update:model-value="emit('update:modelValue', $event)">
    <v-card>
      <v-card-title class="bg-primary text-white">
        <div class="flex items-center gap-2">
          <v-icon>mdi-anchor</v-icon>
          <span>{{ entry ? 'Edit port event' : 'New port event' }}</span>
        </div>
      </v-card-title>
      <v-card-text class="pt-4">
        <v-autocomplete
          v-model="form.port_id"
          v-model:search="portSearch"
          :items="portItems"
          :error-messages="errors.port_id"
          item-title="name"
          item-value="id"
          label="Port *"
          density="compact"
          prepend-inner-icon="mdi-anchor"
          hide-no-data
          no-filter
          hint="Type at least 3 characters to search"
        />

        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-4">
          <v-select v-model="form.event_type" :items="catalogs.event_types" :error-messages="errors.event_type" label="Event type *" density="compact">
            <template #selection="{ item }">
              <v-icon size="small" class="mr-2">{{ eventIcon(item.raw.value) }}</v-icon>{{ item.title }}
            </template>
            <template #item="{ item, props: itemProps }">
              <v-list-item v-bind="itemProps" :prepend-icon="eventIcon(item.raw.value)" />
            </template>
          </v-select>
          <v-text-field v-model="form.event_name" :error-messages="errors.event_name" label="Event name" placeholder="e.g. Hurricane Otis" density="compact" />
        </div>

        <div class="text-caption text-medium-emphasis mb-1">Port operations *</div>
        <v-btn-toggle v-model="form.operations_status" mandatory divided density="comfortable" variant="outlined" class="mb-1 flex-wrap h-auto">
          <v-btn v-for="item in catalogs.operations_statuses" :key="item.value" :value="item.value" size="small" :color="operationsColor(item.value)">
            <v-icon start>{{ operationsIcon(item.value) }}</v-icon>{{ item.title }}
          </v-btn>
        </v-btn-toggle>
        <div v-if="errors.operations_status" class="text-error text-caption">{{ errors.operations_status[0] }}</div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-4 mt-4">
          <v-text-field
            v-model="form.starts_at"
            type="datetime-local"
            :error-messages="errors.starts_at"
            label="Starts at *"
            density="compact"
          >
            <template #append-inner>
              <v-btn size="x-small" variant="tonal" @click="form.starts_at = nowInput()">Now</v-btn>
            </template>
          </v-text-field>
          <div>
            <v-switch v-model="ongoing" color="error" density="compact" hide-details label="Still ongoing (no end date yet)" />
            <v-text-field
              v-if="!ongoing"
              v-model="form.ends_at"
              type="datetime-local"
              :error-messages="errors.ends_at"
              :min="form.starts_at || undefined"
              label="Ends at"
              density="compact"
              class="mt-2"
            >
              <template #append-inner>
                <v-btn size="x-small" variant="tonal" @click="form.ends_at = nowInput()">Now</v-btn>
              </template>
            </v-text-field>
          </div>
        </div>

        <v-textarea v-model="form.description" :error-messages="errors.description" label="Notes" rows="3" density="compact" auto-grow />
        <div class="text-caption text-medium-emphasis">Dates are Mexico City time. A future start date registers a scheduled event (e.g. a forecast).</div>
      </v-card-text>
      <v-card-actions class="justify-end">
        <v-btn color="secondary" @click="emit('update:modelValue', false)">Cancel</v-btn>
        <v-btn color="primary" variant="flat" :loading="saving" :disabled="saving" @click="save">Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script setup lang="ts">
import type { IPortLogbookEntry } from '~/repository/modules/catalogs/portLogbook'

const props = defineProps<{
  modelValue: boolean
  entry?: IPortLogbookEntry | null
  /** Pre-fills the start of a new event (Y-m-d), e.g. the day clicked in the calendar. */
  startDate?: string | null
}>()
const emit = defineEmits(['update:modelValue', 'saved'])

const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const { eventIcon, operationsColor, operationsIcon, nowInput } = usePortLogbook()

const catalogs = ref<{ event_types: any[]; operations_statuses: any[] }>({ event_types: [], operations_statuses: [] })
const saving = ref(false)
const errors = ref<Record<string, string[]>>({})
const portItems = ref<any[]>([])
const portSearch = ref('')
const ongoing = ref(true)

const emptyForm = () => ({
  port_id: null as number | null,
  event_type: null as string | null,
  event_name: '' as string | null,
  operations_status: 'closed' as string,
  starts_at: '' as string | null,
  ends_at: '' as string | null,
  description: '' as string | null,
})
const form = ref(emptyForm())

// API wall-clock "YYYY-MM-DD HH:mm:ss" <-> <input type="datetime-local"> "YYYY-MM-DDTHH:mm"
const toInput = (value?: string | null) => (value ? value.replace(' ', 'T').slice(0, 16) : '')
const toApi = (value?: string | null) => (value ? `${value.replace('T', ' ').slice(0, 16)}:00` : null)

watch(
  () => props.modelValue,
  async (open) => {
    if (!open) return
    errors.value = {}
    form.value = emptyForm()
    portItems.value = []
    portSearch.value = ''
    if (props.entry) {
      form.value = {
        port_id: props.entry.port_id,
        event_type: props.entry.event_type,
        event_name: props.entry.event_name ?? '',
        operations_status: props.entry.operations_status,
        starts_at: toInput(props.entry.starts_at),
        ends_at: toInput(props.entry.ends_at),
        description: props.entry.description ?? '',
      }
      ongoing.value = !props.entry.ends_at
      if (props.entry.port) portItems.value = [props.entry.port]
    } else {
      form.value.starts_at = props.startDate ? `${props.startDate}T00:00` : nowInput()
      ongoing.value = true
    }
    if (!catalogs.value.event_types.length) {
      try {
        catalogs.value = (await $api.portLogbook.getCatalogs()) as any
      } catch (e) {
        console.error(e)
      }
    }
  }
)

const searchPorts = _Debounce(async (search: string) => {
  try {
    const response = await $api.ports.searchPorts({ query: { name: search } })
    // keep the selected port in the list so its label doesn't disappear
    const selected = portItems.value.find((p) => p.id === form.value.port_id)
    portItems.value = selected ? [selected, ...response.filter((p: any) => p.id !== selected.id)] : response
  } catch (e) {
    console.error(e)
  }
}, 400)

watch(portSearch, (value) => {
  if (!value || value.length < 3) return
  // selecting an item sets the search text to its title: don't search again
  if (portItems.value.some((p) => p.name === value)) return
  searchPorts(value)
})

const save = async () => {
  errors.value = {}
  if (!ongoing.value && form.value.ends_at && form.value.starts_at && form.value.ends_at < form.value.starts_at) {
    errors.value = { ends_at: ['The end can not be before the start'] }
    return
  }
  saving.value = true
  const payload = {
    ...form.value,
    event_name: form.value.event_name || null,
    description: form.value.description || null,
    starts_at: toApi(form.value.starts_at),
    ends_at: ongoing.value ? null : toApi(form.value.ends_at),
  }
  try {
    if (props.entry) {
      await $api.portLogbook.update(props.entry.id, payload)
    } else {
      await $api.portLogbook.create(payload)
    }
    snackbar.add({ type: 'success', text: 'Port event saved' })
    emit('saved')
    emit('update:modelValue', false)
  } catch (e: any) {
    // 422: show the messages next to each field (the global handler already reports the request error)
    errors.value = e?.data?.errors ?? e?.response?._data?.errors ?? {}
  } finally {
    saving.value = false
  }
}
</script>
