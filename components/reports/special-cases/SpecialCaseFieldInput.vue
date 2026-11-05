<template>
  <v-text-field v-if="field.type === 'text'" v-model="model" :label="label" :hint="field.hint" persistent-hint density="comfortable" variant="outlined" hide-details="auto" />

  <v-text-field v-else-if="field.type === 'number'" v-model.number="model" type="number" :label="label" :hint="field.hint" persistent-hint density="comfortable" variant="outlined" hide-details="auto" />

  <v-text-field v-else-if="field.type === 'date'" v-model="model" type="date" :label="label" :hint="field.hint" persistent-hint density="comfortable" variant="outlined" hide-details="auto" />

  <v-switch v-else-if="field.type === 'boolean'" v-model="model" :label="label" :hint="field.hint" persistent-hint color="primary" density="comfortable" hide-details="auto" />

  <v-select
    v-else-if="field.type === 'select'"
    v-model="model"
    :items="field.options"
    item-title="title"
    item-value="value"
    :label="label"
    density="comfortable"
    variant="outlined"
    hide-details="auto"
  />

  <v-combobox
    v-else-if="field.type === 'list'"
    v-model="model"
    multiple
    chips
    closable-chips
    :label="label"
    :hint="field.hint ?? 'Type a value and press Enter'"
    persistent-hint
    density="comfortable"
    variant="outlined"
    hide-details="auto"
  />

  <v-autocomplete
    v-else-if="field.type === 'tm1_group'"
    v-model="model"
    :items="lookups.tm1_groups"
    item-title="name"
    item-value="id"
    :label="label"
    :hint="field.hint"
    persistent-hint
    clearable
    density="comfortable"
    variant="outlined"
    hide-details="auto"
  />

  <v-autocomplete
    v-else-if="field.type === 'tm2_group'"
    v-model="model"
    :items="lookups.tm2_groups"
    item-title="name"
    item-value="id"
    :label="label"
    :hint="field.hint"
    persistent-hint
    clearable
    density="comfortable"
    variant="outlined"
    hide-details="auto"
  />

  <v-autocomplete
    v-else-if="field.type === 'tm2_consignee'"
    v-model="model"
    v-model:search="search"
    :items="consignees"
    item-title="name"
    item-value="id"
    :label="label"
    :hint="field.hint ?? 'Type to search'"
    persistent-hint
    no-filter
    :loading="searching"
    density="comfortable"
    variant="outlined"
    hide-details="auto"
  />

  <div v-else-if="field.type === 'invoice_items'">
    <div class="text-body-2 mb-2">{{ label }}</div>
    <div v-for="(item, index) in model" :key="index" class="d-flex ga-2 mb-2 align-start">
      <v-text-field v-model="item.folio" label="Invoice folio" placeholder="WM1202626010802" density="comfortable" variant="outlined" hide-details />
      <v-text-field v-model="item.concept" label="Concept" placeholder="DEMORAS" density="comfortable" variant="outlined" hide-details />
      <v-text-field v-model="item.container" label="Container (optional)" density="comfortable" variant="outlined" hide-details />
      <v-btn icon="mdi-close" size="small" variant="text" :disabled="model.length === 1" @click="model.splice(index, 1)" />
    </div>
    <v-btn size="small" variant="tonal" prepend-icon="mdi-plus" @click="model.push({ folio: '', concept: '', container: '' })">Add invoice</v-btn>
    <div v-if="field.hint" class="sc-muted mt-1">{{ field.hint }}</div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ field: any; modelValue: any; lookups: { tm1_groups: any[]; tm2_groups: any[] } }>()
const emit = defineEmits<{ (e: 'update:modelValue', value: any): void }>()

const { $api } = useNuxtApp()

const model = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})
const label = computed(() => props.field.label + (props.field.required ? ' *' : ''))

const search = ref('')
const consignees = ref<any[]>(props.field.default_item ? [props.field.default_item] : [])
const searching = ref(false)
let timer: ReturnType<typeof setTimeout> | null = null

watch(search, (term) => {
  if (props.field.type !== 'tm2_consignee') return
  if (timer) clearTimeout(timer)
  if (!term || term.length < 2) return
  timer = setTimeout(async () => {
    searching.value = true
    try {
      consignees.value = (await $api.specialCases.searchConsignees(term)).data ?? []
    } finally {
      searching.value = false
    }
  }, 300)
})
</script>
