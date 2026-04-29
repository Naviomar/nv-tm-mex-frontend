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
    persistent-hint
    @update:model-value="onSelect"
  >
    <template v-slot:item="{ props, item }">
      <v-list-item v-bind="props" :title="item.raw.name" :subtitle="item.raw.code">
        <template v-slot:append>
          <v-chip
            size="x-small"
            :color="item.raw.modality_type === 'Air' ? 'purple' : 'cyan'"
            variant="flat"
            class="font-weight-bold"
          >
            {{ item.raw.modality_type }}
          </v-chip>
        </template>
      </v-list-item>
    </template>
    <template v-slot:no-data>
      <v-list-item v-if="search && search.length >= 3">
        <v-list-item-title>No se encontraron conceptos para "{{ search }}"</v-list-item-title>
      </v-list-item>
      <v-list-item v-else>
        <v-list-item-title>Escriba 3+ caracteres para buscar conceptos</v-list-item-title>
      </v-list-item>
    </template>
  </v-autocomplete>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const { $api } = useNuxtApp()

const props = defineProps({
  modelValue: {
    type: [Number, String],
    default: null
  },
  label: {
    type: String,
    default: 'Buscar Concepto / Cargo'
  }
})

const emits = defineEmits(['update:modelValue'])

const items = ref([])
const loading = ref(false)
const search = ref('')
const selectedItem = ref(props.modelValue)

watch(search, async (val) => {
  if (!val || val.length < 3) {
    if (!selectedItem.value) items.value = []
    return
  }
  
  loading.value = true
  try {
    const data: any = await $api.charges.searchByName({ name: val })
    items.value = data
  } catch (e) {
    console.error('Failed to search charges', e)
  } finally {
    loading.value = false
  }
})

function onSelect(val: any) {
  emits('update:modelValue', val)
}

watch(() => props.modelValue, (newVal) => {
  selectedItem.value = newVal
})
</script>
