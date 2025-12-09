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
      clearable
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
})

const emits = defineEmits(['update:modelValue'])

const customers = ref<any>([])
const selectedCustomer = ref<any>(null)
const searchQuery = ref('')

watch(searchQuery, (newSearch) => {
  if (newSearch.length < 3 || hasData.value) return
  onSearch(newSearch)
})

watch(
  () => props.modelValue,
  (newValue, oldValue) => {
    if (!newValue) {
      selectedCustomer.value = null
    }
  }
)

const hasData = computed(() => !!selectedCustomer.value)

const clearData = () => {
  selectedCustomer.value = null
  customers.value = []
  onSelect(null)
}

const onSearch = _Debounce(async (search: string) => {
  loadingStore.start()
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
    if (response.length === 1) {
      selectedCustomer.value = response[0]?.id
      onSelect(response[0]?.id)
    }
  } catch (error) {
    snackbar.add({
      type: 'error',
      text: 'Error fetching customers',
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
