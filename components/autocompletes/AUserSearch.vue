<template>
  <div>
    <v-autocomplete
      v-model="selectedUser"
      v-model:search="searchQuery"
      :items="users"
      :label="`Search ${label}`"
      item-title="name"
      item-value="id"
      hide-no-data
      density="compact"
      clearable
      hide-details
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
    default: 'users',
  },
  setId: {
    type: [String, Number],
    required: false,
    default: null,
  },
})

const emits = defineEmits(['update:modelValue'])

const users = ref<any>([])
const selectedUser = ref<any>(null)
const searchQuery = ref('')

watch(searchQuery, (newSearch) => {
  if (newSearch.length < 3 || hasData.value) return
  onSearch(newSearch)
})

watch(
  () => props.modelValue,
  (newValue, oldValue) => {
    if (!newValue) {
      selectedUser.value = null
    }
  }
)

const hasData = computed(() => !!selectedUser.value)

const clearData = () => {
  selectedUser.value = null
  users.value = []
  onSelect(null)
}

const onSearch = _Debounce(async (search: string, id?: string) => {
  loadingStore.start()
  try {
    users.value = []
    const response = await $api.users.searchUsers({
      query: {
        ...flattenArraysToCommaSeparatedString({ name: search, ...(id && { id }) }),
      },
    })

    if (response.length === 0) {
      snackbar.add({
        type: 'info',
        text: 'No users found',
      })
      return
    }
    // concat name and email
    response.forEach((user: any) => {
      user.name = `${user.name} - ${user.email}`
    })
    users.value = response

    if (response.length === 1) {
      selectedUser.value = response[0]?.id
      onSelect(response[0]?.id)
    }
  } catch (error) {
    snackbar.add({
      type: 'error',
      text: 'Error fetching users',
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

onMounted(() => {
  if (props.setId) {
    console.log('props.setId', props.setId)
    onSearch('', props.setId.toString())
  }
})
</script>
