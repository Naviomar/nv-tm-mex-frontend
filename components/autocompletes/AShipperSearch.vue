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
    default: 'shippers',
  },
})

const emits = defineEmits(['update:modelValue'])

const items = ref<any>([])
const selectedItem = ref<any>(null)
const searchQuery = ref('')

watch(searchQuery, (newSearch) => {
  if (newSearch.length < 3 || hasData.value) return
  onSearch(newSearch)
})

watch(
  () => props.modelValue,
  (newValue, oldValue) => {
    if (!newValue) {
      selectedItem.value = null
    }
  }
)

const hasData = computed(() => !!selectedItem.value)

const clearData = () => {
  selectedItem.value = null
  items.value = []
  onSelect(null)
}

const onSearch = _Debounce(async (search: string) => {
  loadingStore.start()
  try {
    const response = await $api.shippers.searchShippers({
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

const onSelect = (customer: any) => {
  emits('update:modelValue', customer)
}
</script>
