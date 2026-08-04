<template>
  <div>
    <v-autocomplete
      v-model="selectedCustomer"
      v-model:search="searchQuery"
      :items="customers"
      :label="`Search ${label}`"
      item-title="name"
      item-value="id"
      hide-no-data
      density="compact"
      :hide-details="hideDetails"
      :readonly="readonly"
      :clearable="!readonly"
      :loading="isSearching"
      prepend-inner-icon="mdi-magnify"
      @update:model-value="onSelect"
      @click:clear="clearData"
      hint="Type at least 3 characters to search"
    >
      <template v-slot:item="{ item, props }">
        <v-list-item
          v-bind="props"
          :title="`${item.title} ${(item as any).raw.deleted_at ? '(Eliminado)' : ''}`"
          :disabled="!allowDeleted && (item as any).raw.deleted_at != null"
        ></v-list-item>
      </template>
    </v-autocomplete>
    <div v-if="hasData">
      <v-btn color="secondary" size="small" variant="tonal" @click="clearData"> Clear </v-btn>
    </div>
  </div>
</template>
<script setup lang="ts">
const { $api } = useNuxtApp()
const snackbar = useSnackbar()

const props = defineProps({
  modelValue: {
    type: [String, Number],
    required: false,
    default: null,
  },
  label: {
    type: String,
    required: false,
    default: 'customers',
  },
  hideDetails: {
    type: Boolean,
    required: false,
    default: false,
  },
  allowDeleted: {
    type: Boolean,
    required: false,
    default: false,
  },
  readonly: {
    type: Boolean,
    required: false,
    default: false,
  },
})

const emits = defineEmits(['update:modelValue', 'update:searchText'])

const customers = ref<any>([])
const selectedCustomer = ref<any>(null)
const searchQuery = ref('')
const lastSelectedTitle = ref('')
// Local, field-scoped loading flag: the catalog lookup that backs this
// autocomplete shouldn't block the whole page with the global overlay.
const isSearching = ref(false)

watch(searchQuery, (newSearch) => {
  if (props.readonly) return

  // This change just mirrors the title of the item we (or the user) already
  // selected, not new user input: skip re-searching, otherwise we'd search
  // by the full resolved name (which the backend may not match) and clobber
  // a valid selection with a "not found" state.
  if (lastSelectedTitle.value && newSearch === lastSelectedTitle.value) return

  // User is typing something different from the currently selected item's
  // title: the old selection no longer applies, so clear it and let a new
  // search happen instead of silently freezing on the previous customer.
  if (selectedCustomer.value && newSearch !== lastSelectedTitle.value) {
    selectedCustomer.value = null
    onSelect(null)
  }

  emits('update:searchText', newSearch || '')

  if (!newSearch || newSearch.length < 3) return
  onSearch(newSearch)
})

watch(
  () => props.modelValue,
  (newValue, oldValue) => {
    if (!newValue) {
      selectedCustomer.value = null
      // Only wipe the visible text if the user hasn't typed something new
      // since the last selection (e.g. a "Clear" button reset the parent
      // filter). If they're mid-edit, our own searchQuery watch already
      // handles clearing the stale id without touching what they're typing.
      if (searchQuery.value === lastSelectedTitle.value) {
        searchQuery.value = ''
      }
      lastSelectedTitle.value = ''
    }
  }
)

const hasData = computed(() => !!selectedCustomer.value)

const clearData = () => {
  selectedCustomer.value = null
  customers.value = []
  searchQuery.value = ''
  lastSelectedTitle.value = ''
  emits('update:searchText', '')
  onSelect(null)
}

const onSearch = _Debounce(async (search: string) => {
  isSearching.value = true
  try {
    const response = await $api.consignees.searchConsignees({
      query: {
        ...flattenArraysToCommaSeparatedString({ name: search }),
      },
    })
    customers.value = response
    if (response.length === 0) {
      snackbar.add({
        type: 'info',
        text: 'No customers found',
      })
    }
    // Do NOT auto-select on a single match: this runs while the user may
    // still be typing (debounce just paused), and silently replacing their
    // in-progress text with a premature match feels like the field is
    // erasing what they wrote. Let them pick from the dropdown themselves.
  } catch (error) {
    snackbar.add({
      type: 'error',
      text: 'Error fetching customers',
    })
  } finally {
    isSearching.value = false
  }
}, 500)

const onSelect = (customerId: any) => {
  if (customerId) {
    const selected = customers.value.find((c: any) => c.id === customerId)
    lastSelectedTitle.value = selected?.name || ''
  }
  emits('update:modelValue', customerId)
}
</script>
