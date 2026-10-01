<template>
  <div>
    <v-autocomplete
      v-model="value"
      v-model:search="searchQuery"
      :items="items"
      :label="label"
      item-title="name"
      item-value="id"
      density="compact"
      no-filter
      :clearable="!readonly"
      :readonly="readonly"
      :loading="isSearching || isCreating"
      :error-messages="errorMessage"
      :append-inner-icon="appendInnerIcon"
      :hint="canQuickCreate ? 'Type to search or register a new vessel' : 'Type at least 2 characters to search'"
      @update:model-value="onSelect"
    >
      <template v-slot:item="{ item, props: itemProps }">
        <v-list-item v-bind="itemProps" :title="`${item.raw.name}${item.raw.deleted_at ? ' (Eliminado)' : ''}`" />
      </template>
      <template v-if="showCreateOption && items.length" v-slot:append-item>
        <v-divider class="my-1" />
        <v-list-item
          prepend-icon="mdi-plus-circle-outline"
          base-color="primary"
          :title="`Register &quot;${normalizedQuery}&quot;`"
          subtitle="Add this vessel to the catalog"
          :disabled="isCreating"
          @click="registerVessel(false)"
        />
      </template>
      <template v-slot:no-data>
        <v-list-item v-if="!showCreateOption" :title="noDataText" />
        <v-list-item
          v-else
          prepend-icon="mdi-plus-circle-outline"
          base-color="primary"
          :title="`Register &quot;${normalizedQuery}&quot;`"
          subtitle="No vessel found with this name"
          :disabled="isCreating"
          @click="registerVessel(false)"
        />
      </template>
    </v-autocomplete>

    <v-dialog v-model="similarDialog" max-width="480">
      <v-card>
        <v-card-title class="text-base">Similar vessels found</v-card-title>
        <v-card-text>
          <div class="mb-3">
            <span class="font-bold">{{ pendingName }}</span> looks like an existing vessel. Select it if it is the same
            ship to avoid duplicates.
          </div>
          <v-list density="compact" class="border rounded">
            <v-list-item
              v-for="vessel in similarVessels"
              :key="vessel.id"
              prepend-icon="mdi-ferry"
              :title="vessel.name"
              @click="pickSimilar(vessel)"
            />
          </v-list>
        </v-card-text>
        <v-card-actions>
          <v-btn variant="text" @click="similarDialog = false">Cancel</v-btn>
          <v-spacer />
          <v-btn color="primary" variant="tonal" :loading="isCreating" @click="registerVessel(true)">
            Register "{{ pendingName }}" anyway
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script setup lang="ts">
interface VesselNameItem {
  id: number
  name: string
  deleted_at?: string | null
}

const props = defineProps({
  name: {
    type: String,
    required: false,
    default: 'vessel_departure_name_id',
  },
  label: {
    type: String,
    required: false,
    default: 'Departure vessel',
  },
  setId: {
    type: [String, Number],
    required: false,
    default: null,
  },
  readonly: {
    type: Boolean,
    required: false,
    default: false,
  },
  appendInnerIcon: {
    type: String,
    required: false,
    default: '',
  },
})

const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const { hasPermission } = useCheckUser()

const { value, errorMessage } = useField<number | string | null>(() => props.name)

const items = ref<VesselNameItem[]>([])
const searchQuery = ref('')
const isSearching = ref(false)
const isCreating = ref(false)
const similarDialog = ref(false)
const similarVessels = ref<VesselNameItem[]>([])
const pendingName = ref('')

const canQuickCreate = computed(() => hasPermission('vessel-names-quick-create'))

// Mirrors the backend identity rule (VesselNameResolver::compact) so the
// "Register" option is hidden when the typed text already matches a result.
const compact = (text: string) =>
  (text || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')

const normalizedQuery = computed(() => (searchQuery.value || '').replace(/\s+/g, ' ').trim().toUpperCase())

const selectedTitle = computed(() => items.value.find((i) => String(i.id) === String(value.value))?.name ?? '')

const showCreateOption = computed(() => {
  if (!canQuickCreate.value || props.readonly || isSearching.value) return false
  const typed = compact(normalizedQuery.value)
  if (typed.length < 2) return false
  if (selectedTitle.value && compact(selectedTitle.value) === typed) return false
  return !items.value.some((i) => compact(i.name) === typed)
})

const noDataText = computed(() => {
  if (compact(searchQuery.value).length < 2) return 'Type at least 2 characters to search'
  return isSearching.value ? 'Searching...' : 'No vessels found'
})

const mergeItems = (incoming: VesselNameItem[]) => {
  // Keep the selected vessel in the list so its title stays visible.
  const selected = items.value.find((i) => String(i.id) === String(value.value))
  const merged = [...incoming]
  if (selected && !merged.some((i) => i.id === selected.id)) merged.unshift(selected)
  items.value = merged
}

const searchByName = _Debounce(async (text: string) => {
  try {
    isSearching.value = true
    const response = (await $api.vessels.searchVesselNames({ query: { name: text } })) as VesselNameItem[]
    mergeItems(response ?? [])
  } catch (error) {
    console.error(error)
    snackbar.add({ type: 'error', text: 'Error fetching vessels' })
  } finally {
    isSearching.value = false
  }
}, 400)

const loadById = async (id: string | number) => {
  if (items.value.some((i) => String(i.id) === String(id))) return
  try {
    isSearching.value = true
    const response = (await $api.vessels.searchVesselNames({ query: { id } })) as VesselNameItem[]
    mergeItems(response ?? [])
  } catch (error) {
    console.error(error)
  } finally {
    isSearching.value = false
  }
}

const selectVessel = (vessel: VesselNameItem) => {
  mergeItems([vessel])
  value.value = vessel.id
  searchQuery.value = vessel.name
}

const onSelect = (selected: any) => {
  if (!selected) value.value = null
}

const registerVessel = async (force: boolean) => {
  const name = force ? pendingName.value : normalizedQuery.value
  if (!name) return
  try {
    isCreating.value = true
    const response: any = await $api.vessels.quickCreateVesselName({ name, force })

    if (response.status === 'similar') {
      pendingName.value = response.name
      similarVessels.value = response.similar ?? []
      similarDialog.value = true
      return
    }

    similarDialog.value = false
    selectVessel(response.vessel)
    snackbar.add(
      response.status === 'existing'
        ? { type: 'info', text: `Vessel already registered as "${response.vessel.name}", it was selected` }
        : { type: 'success', text: `Vessel "${response.vessel.name}" registered` },
    )
  } catch (error: any) {
    console.error(error)
    const message = error?.data?.errors?.name?.[0] ?? error?.data?.message ?? 'Error registering vessel'
    snackbar.add({ type: 'error', text: message })
  } finally {
    isCreating.value = false
  }
}

const pickSimilar = (vessel: VesselNameItem) => {
  similarDialog.value = false
  selectVessel(vessel)
}

watch(searchQuery, (text) => {
  // Mirroring the selected item's title is not user input.
  if (selectedTitle.value && text === selectedTitle.value) return
  if (compact(text).length < 2) return
  searchByName(text)
})

watch(
  () => props.setId,
  (id) => {
    if (id) loadById(id)
  },
)

watch(value, (id) => {
  if (id) loadById(id)
})

onMounted(() => {
  const id = props.setId ?? value.value
  if (id) loadById(id)
})
</script>
