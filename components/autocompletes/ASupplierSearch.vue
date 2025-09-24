<template>
  <div>
    <v-autocomplete
      v-model="selectedSupplier"
      v-model:search="searchQuery"
      :items="suppliers"
      :label="`Search ${label}`"
      item-title="name"
      item-value="id"
      hide-no-data
      hide-details
      density="compact"
      clearable
      prepend-inner-icon="mdi-magnify"
      @update:model-value="onSelect"
      @click:clear="clearData"
      hint="Type at least 3 characters to search"
    />
    <div v-if="hasData">
      <v-btn size="small" variant="tonal" @click="clearData"> Clear </v-btn>
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
    default: 'suppliers',
  },
})

const emits = defineEmits(['update:modelValue'])

const suppliers = ref<any>([])
const selectedSupplier = ref<any>(null)
const searchQuery = ref('')

watch(searchQuery, (newSearch) => {
  if (newSearch.length < 3 || hasData.value) return
  onSearch(newSearch)
})

watch(
  () => props.modelValue,
  (newValue, oldValue) => {
    if (!newValue) {
      selectedSupplier.value = null
    }
  }
)

const hasData = computed(() => !!selectedSupplier.value)

const clearData = () => {
  selectedSupplier.value = null
  suppliers.value = []
  onSelect(null)
}

const onSearch = _Debounce(async (search: string) => {
  loadingStore.start()
  try {
    const response = await $api.suppliers.searchSuppliers({
      query: {
        ...flattenArraysToCommaSeparatedString({ name: search }),
      },
    })
    suppliers.value = response
    if (response.length === 0) {
      snackbar.add({
        type: 'info',
        text: 'No suppliers found',
      })
    }
    if (response.length === 1) {
      selectedSupplier.value = response[0]?.id
      onSelect(response[0]?.id)
    }
  } catch (error) {
    snackbar.add({
      type: 'error',
      text: 'Error fetching suppliers',
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
