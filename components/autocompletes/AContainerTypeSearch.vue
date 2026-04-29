<template>
  <v-autocomplete
    v-model="selectedItem"
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
        <v-list-item-title>No container types found</v-list-item-title>
      </v-list-item>
    </template>
  </v-autocomplete>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const { $api } = useNuxtApp()

const props = defineProps({
  modelValue: {
    type: [Number, String],
    default: null
  },
  label: {
    type: String,
    default: 'Container Type'
  }
})

const emits = defineEmits(['update:modelValue'])

const items = ref([])
const loading = ref(false)
const selectedItem = ref(props.modelValue)

async function fetchTypes() {
  loading.value = true
  try {
    const data: any = await $api.containers.getAllTypes()
    items.value = data
  } catch (e) {
    console.error('Failed to load container types', e)
  } finally {
    loading.value = false
  }
}

function onSelect(val: any) {
  emits('update:modelValue', val)
}

watch(() => props.modelValue, (newVal) => {
  selectedItem.value = newVal
})

onMounted(() => {
  fetchTypes()
})
</script>
