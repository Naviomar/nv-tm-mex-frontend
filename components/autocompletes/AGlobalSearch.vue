<template>
  <div>
    <v-autocomplete
      v-model="value"
      v-model:search="searchQuery"
      :items="items"
      :label="`Search ${label}`"
      :item-title="getItemTitle"
      item-value="id"
      hide-no-data
      density="compact"
      :clearable="canClear"
      :bg-color="bgColor"
      :readonly="readonly"
      :return-object="returnObject"
      :append-inner-icon="appendInnerIcon"
      :prepend-inner-icon="prependInnerIcon"
      :error-messages="errorMessage"
      @update:model-value="onSelect"
      @click:clear="clearData"
      hint="Type at least 3 characters to search"
      :hide-details="hideDetails"
    >
      <template v-slot:item="{ item, props }">
        <v-list-item
          v-bind="props"
          :title="`${item.title} ${item.raw.deleted_at ? '(Eliminado)' : ''}`"
          :disabled="item.raw.deleted_at != null"
        ></v-list-item>
      </template>
    </v-autocomplete>
    <div v-if="canClear">
      <v-btn size="small" variant="tonal" @click="clearData"> Clear </v-btn>
    </div>
  </div>
</template>
<script setup lang="ts">
const loadingStore = useLoadingStore()
const snackbar = useSnackbar()

interface Item {
  [key: string]: any // Define item as any type or adjust based on your use case
}

const props = defineProps({
  modelValue: {
    type: [String, Number, Object],
    required: false,
    default: null,
  },
  validateKey: {
    type: String,
    required: false,
    default: 'adtv',
  },
  label: {
    type: String,
    required: false,
    default: 'items',
  },
  itemTitle: {
    type: [String, Function],
    required: false,
    default: 'name',
  },
  onSearch: {
    type: Function,
    required: true,
    default: () => {},
  },
  appendInnerIcon: {
    type: String,
    required: false,
    default: '',
  },
  prependInnerIcon: {
    type: String,
    required: false,
    default: 'mdi-magnify',
  },
  setId: {
    type: [String, Number],
    required: false,
    default: null,
  },
  returnObject: {
    type: Boolean,
    required: false,
    default: false,
  },
  hideDetails: {
    type: Boolean,
    required: false,
    default: false,
  },
  bgColor: {
    type: String,
    required: false,
    default: '',
  },
  readonly: {
    type: Boolean,
    required: false,
    default: false,
  },
})

const emits = defineEmits(['update:modelValue'])

const items = ref<Item[]>([])
const searchQuery = ref('')

const hasData = computed(() => !!value.value)

const canClear = computed(() => {
  return props.readonly === false && hasData.value
})

const getItemTitle = (item: any) => {
  if (typeof props.itemTitle === 'function') {
    return props.itemTitle(item) // Call function with item
  } else if (typeof props.itemTitle === 'string') {
    return item[props.itemTitle] // Use string as key
  }
  return ''
}

const clearData = () => {
  value.value = null
  items.value = []
  onSelect(null)
}

const searchData = _Debounce(async (search: string, id?: string) => {
  try {
    loadingStore.start()
    // create object with values to search discard id if null
    const body = {
      name: search,
      ...(id && { id }),
    }
    const response = await props.onSearch(body)
    items.value = response
    if (response.length === 0) {
      snackbar.add({
        type: 'info',
        text: `No ${props.label} found`,
      })
    }

    if (response.length === 1) {
      const item = response[0]
      if (item.deleted_at) {
        snackbar.add({
          type: 'warning',
          text: `${props.label} is deleted`,
        })
        return
      }

      if (props.returnObject) {
        value.value = response[0]
        onSelect(response[0])
      } else {
        value.value = response[0]?.id
        onSelect(response[0]?.id)
      }
      // clear search query
      searchQuery.value = ''
    }
  } catch (error) {
    console.error(error)
    snackbar.add({
      type: 'error',
      text: `Error fetching ${props.label}`,
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

const { value, errorMessage } = useField(() => props.validateKey)

onMounted(() => {
  if (props.setId) {
    searchData('', props.setId.toString())
  }
})

const setItems = (newItems: Item[]) => {
  console.log('newItems', newItems)
  items.value = newItems
}

const setItem = (item: Item) => {
  value.value = item
}

defineExpose({
  setItems,
  setItem,
})

watch(searchQuery, (input) => {
  if (!input || input.length < 3 || hasData.value) return
  console.log('searchQuery changed:', input)
  searchData(input)
})

watch(
  () => props.modelValue,
  (newValue, oldValue) => {
    if (!newValue) {
      value.value = null
    }
  }
)

watch(
  () => props.setId,
  (newId) => {
    if (!newId) {
      clearData()
      return
    }

    // Normaliza ID a string o número
    const newIdStr = String(newId)

    const found = items.value.some((item) => String(item.id) === newIdStr)

    if (!found) {
      searchData('', newIdStr)
    }
  }
)
</script>
