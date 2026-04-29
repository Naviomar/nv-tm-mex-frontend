<template>
  <v-autocomplete
    v-model="selectedItem"
    v-model:search="search"
    :items="items"
    :loading="loading"
    :label="label"
    item-title="name"
    item-value="id"
    variant="outlined"
    density="comfortable"
    hide-details
    clearable
    @update:model-value="onSelect"
  >
    <template v-slot:no-data>
      <v-list-item>
        <v-list-item-title>No shipping lines found</v-list-item-title>
      </v-list-item>
    </template>
  </v-autocomplete>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'

const { $api } = useNuxtApp()

const props = defineProps({
  modelValue: {
    type: [Number, String],
    default: null
  },
  label: {
    type: String,
    default: 'Shipping Line'
  }
})

const emits = defineEmits(['update:modelValue'])

const items = ref([])
const loading = ref(false)
const search = ref('')
const selectedItem = ref(props.modelValue)

async function fetchLines() {
  loading.value = true
  try {
    const data: any = await $api.lines.searchLines({ query: { name: search.value } })
    items.value = data.data || data
  } catch (e) {
    console.error('Failed to load lines', e)
  } finally {
    loading.value = false
  }
}

watch(search, (val) => {
  if (val && val.length >= 3) {
    fetchLines()
  }
})

function onSelect(val: any) {
  emits('update:modelValue', val)
}

watch(() => props.modelValue, (newVal) => {
  selectedItem.value = newVal
})

onMounted(() => {
  fetchLines()
})
</script>
