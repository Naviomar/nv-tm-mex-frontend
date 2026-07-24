<template>
  <div>
    <v-autocomplete
      v-model="selectedItem"
      v-model:search="searchQuery"
      :items="items"
      :label="`Search ${label}`"
      item-title="name"
      item-value="id"
      hide-no-data
      density="compact"
      clearable
      prepend-inner-icon="mdi-magnify"
      @update:model-value="onSelect"
      @click:clear="clearData"
      hint="Type at least 3 characters to search"
    />
    <div v-if="hasData">
      <v-btn color="secondary" size="small" variant="tonal" @click="clearData"> Clear </v-btn>
    </div>
  </div>
</template>
<script setup lang="ts">
const { $api } = useNuxtApp()
const loadingStore = useLoadingStore()
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
    default: 'freight forwarders',
  },
})

const emits = defineEmits(['update:modelValue'])

const items = ref<any>([])
const selectedItem = ref<any>(null)
const searchQuery = ref('')
const lastSelectedTitle = ref('')

watch(searchQuery, (newSearch) => {
  // User is typing something different from the currently selected item's
  // title: the old selection no longer applies, so clear it and let a new
  // search happen instead of silently freezing on the previous value.
  if (selectedItem.value && newSearch !== lastSelectedTitle.value) {
    selectedItem.value = null
    onSelect(null)
  }

  if (!newSearch || newSearch.length < 3) return
  onSearch(newSearch)
})

watch(
  () => props.modelValue,
  (newValue, oldValue) => {
    if (!newValue) {
      selectedItem.value = null
      if (searchQuery.value === lastSelectedTitle.value) {
        searchQuery.value = ''
      }
      lastSelectedTitle.value = ''
    }
  }
)

const hasData = computed(() => !!selectedItem.value)

const clearData = () => {
  selectedItem.value = null
  items.value = []
  searchQuery.value = ''
  lastSelectedTitle.value = ''
  onSelect(null)
}

const onSearch = _Debounce(async (search: string) => {
  loadingStore.start()
  try {
    const response = await $api.freightForwarders.searchFfs({
      query: {
        ...flattenArraysToCommaSeparatedString({ name: search }),
      },
    })
    items.value = response
  } catch (error) {
    snackbar.add({
      type: 'error',
      text: 'Error fetching data',
    })
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}, 500)

const onSelect = (itemId: any) => {
  if (itemId) {
    const selected = items.value.find((i: any) => i.id === itemId)
    lastSelectedTitle.value = selected?.name || ''
  }
  emits('update:modelValue', itemId)
}
</script>
