<template>
  <div>
    <v-autocomplete
      v-model="selectedBeneficiary"
      v-model:search="searchQuery"
      :items="beneficiaries"
      :label="`Search ${label}`"
      item-title="name"
      item-value="id"
      hide-no-data
      density="compact"
      :readonly="readonly"
      :clearable="!readonly"
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
    default: 'Beneficiary',
  },
  readonly: {
    type: Boolean,
    required: false,
    default: false,
  },
})

const emits = defineEmits(['update:modelValue'])

const beneficiaries = ref<any[]>([])
const selectedBeneficiary = ref<any>(null)
const searchQuery = ref('')

watch(searchQuery, (newSearch) => {
  if (props.readonly) return
  if (!newSearch || newSearch.length < 3 || hasData.value) return
  onSearch(newSearch)
})

watch(
  () => props.modelValue,
  (newValue) => {
    if (!newValue) {
      selectedBeneficiary.value = null
    }
  }
)

const hasData = computed(() => !!selectedBeneficiary.value)

const clearData = () => {
  selectedBeneficiary.value = null
  beneficiaries.value = []
  searchQuery.value = ''
  onSelect(null)
}

const onSearch = _Debounce(async (search: string) => {
  loadingStore.start()
  try {
    const response = await $api.beneficiaries.searchBeneficiaries({
      query: {
        ...flattenArraysToCommaSeparatedString({ name: search }),
      },
    })
    beneficiaries.value = Array.isArray(response) ? response : []
    if (beneficiaries.value.length === 0) {
      snackbar.add({
        type: 'info',
        text: 'No beneficiary found',
      })
    }
    if (beneficiaries.value.length === 1) {
      selectedBeneficiary.value = beneficiaries.value[0]?.id
      onSelect(beneficiaries.value[0]?.id)
    }
  } catch (error) {
    snackbar.add({
      type: 'error',
      text: 'Error fetching beneficiary',
    })
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}, 500)

const onSelect = (beneficiary: any) => {
  emits('update:modelValue', beneficiary)
}
</script>
