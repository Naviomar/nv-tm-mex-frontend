<template>
  <div>
    <div v-if="!partyableType">
      <div>Note: Please select a party type to search for party</div>
    </div>
    <div v-if="partyableType">
      Find a {{ partyName }}
      <v-autocomplete
        v-model="form.search"
        v-model:search="searchQuery"
        :items="partyables"
        item-title="name"
        item-value="id"
        label="Search party"
        @update:model-value="onSelect"
        @click:clear="clearData"
        clearable
        density="compact"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
const { $api } = useNuxtApp()
const loadingStore = useLoadingStore()
const snackbar = useSnackbar()

const props = defineProps({
  partyableType: {
    type: [String, null],
    required: false,
    default: null,
  },
  modelValue: {
    type: [String, Number],
    required: false,
    default: null,
  },
})

const emits = defineEmits(['update:modelValue'])

const hasData = computed(() => partyables.value.length > 0)
const partyName = computed(() => {
  if (!props.partyableType) return '-'
  const parts = props.partyableType.split('\\')
  const name = parts[parts.length - 1]
  if (name === 'Consignee') return 'Customer'
  return name
})

const searchQuery = ref('')
const partyables = ref<any>([])
const form = reactive({
  search: '',
})

const clearData = () => {
  partyables.value = []
  onSelect(null)
}

const onSelect = (partyable: any) => {
  emits('update:modelValue', partyable)
}

watch(
  () => props.partyableType,
  () => {
    clearData()
  }
)

watch(searchQuery, (input) => {
  if (input.length < 3 || hasData.value) return
  searchParty(input)
})

const searchParty = _Debounce(async (search: string, id?: string) => {
  try {
    loadingStore.start()
    // create object with values to search discard id if null
    const body = {
      partyableType: props.partyableType,
      name: search,
      ...(id && { id }),
    }
    const response = await $api.freeFormatInvoices.searchPartyables(body)
    partyables.value = response || []
    if (response.length === 0) {
      snackbar.add({
        type: 'info',
        text: `No ${partyName} found`,
      })
    }

    if (response.length === 1) {
      const item = response[0]
      if (item.deleted_at) {
        snackbar.add({
          type: 'warning',
          text: `${partyName} is deleted`,
        })
        return
      }

      onSelect(response[0]?.id)
    }
  } catch (error) {
    console.error(error)
    snackbar.add({
      type: 'error',
      text: `Error fetching ${partyName}`,
    })
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}, 500)
</script>
