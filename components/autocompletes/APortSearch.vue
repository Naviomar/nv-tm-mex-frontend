<template>
  <div>
    <v-autocomplete
      v-model="selectedPort"
      v-model:search="searchQuery"
      :items="ports"
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
    default: 'ports',
  },
})

const emits = defineEmits(['update:modelValue'])

const ports = ref<any>([])
const selectedPort = ref<any>(null)
const searchQuery = ref('')

watch(searchQuery, (newSearch) => {
  if (newSearch.length < 3 || hasData.value) return
  onSearch(newSearch)
})

watch(
  () => props.modelValue,
  (newValue, oldValue) => {
    if (!newValue) {
      selectedPort.value = null
    }
  }
)

const hasData = computed(() => !!selectedPort.value)

const clearData = () => {
  selectedPort.value = null
  ports.value = []
  onSelect(null)
}

const onSearch = _Debounce(async (search: string) => {
  loadingStore.start()
  try {
    const response = await $api.ports.searchPorts({
      query: {
        ...flattenArraysToCommaSeparatedString({ name: search }),
      },
    })
    ports.value = response
    if (response.length === 0) {
      snackbar.add({
        type: 'info',
        text: 'No ports found',
      })
    }
    if (response.length === 1) {
      selectedPort.value = response[0]?.id
      onSelect(response[0]?.id)
    }
  } catch (error) {
    snackbar.add({
      type: 'error',
      text: 'Error fetching ports',
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
