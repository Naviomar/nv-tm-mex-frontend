<template>
  <v-dialog :model-value="modelValue" max-width="860" persistent scrollable @update:model-value="$emit('update:modelValue', $event)">
    <v-card class="sc-card" elevation="0">
      <v-card-title class="pa-5 pb-2 d-flex align-center">
        New special case
        <v-spacer />
        <v-btn icon="mdi-close" variant="text" size="small" :disabled="saving" @click="close" />
      </v-card-title>

      <v-card-text class="px-5">
        <div v-if="loading" class="d-flex justify-center pa-8"><v-progress-circular indeterminate color="primary" /></div>

        <template v-else-if="!template">
          <div class="sc-muted mb-3">Pick the kind of situation. The case is built from a few parameters and tracked from then on.</div>
          <v-row>
            <v-col v-for="item in templates" :key="item.key" cols="12" md="6">
              <v-card class="sc-card sc-case-card h-100" elevation="0" @click="choose(item)">
                <v-card-text>
                  <div class="sc-case-name mb-1">{{ item.name }}</div>
                  <div class="sc-muted mb-3">{{ item.summary }}</div>
                  <ol class="sc-steps">
                    <li v-for="step in item.steps" :key="step">{{ step }}</li>
                  </ol>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </template>

        <template v-else>
          <div class="sc-case-name mb-1">{{ template.name }}</div>
          <div class="sc-muted mb-4">{{ template.summary }}</div>
          <v-row dense>
            <v-col v-for="field in template.fields" :key="field.key" cols="12" :md="wide(field) ? 12 : 6">
              <SpecialCaseFieldInput v-model="values[field.key]" :field="field" :lookups="lookups" />
            </v-col>
          </v-row>
          <v-alert v-if="error" type="error" variant="tonal" density="comfortable" class="mt-4">{{ error }}</v-alert>
          <div class="sc-muted mt-4">Creating the case only registers the debt as it is today; nothing is applied until you review it.</div>
        </template>
      </v-card-text>

      <v-card-actions v-if="template" class="tm-dialog-actions pa-5 pt-0">
        <v-btn variant="text" :disabled="saving" @click="template = null">Back</v-btn>
        <v-spacer />
        <v-btn color="primary" variant="flat" :loading="saving" :disabled="!valid" @click="save">Create case</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ (e: 'update:modelValue', value: boolean): void; (e: 'created', id: number): void }>()

const { $api } = useNuxtApp()
const snackbar = useSnackbar()

const loading = ref(false)
const saving = ref(false)
const error = ref('')
const templates = ref<any[]>([])
const lookups = ref<{ tm1_groups: any[]; tm2_groups: any[] }>({ tm1_groups: [], tm2_groups: [] })
const template = ref<any | null>(null)
const values = reactive<Record<string, any>>({})

const wide = (field: any) => ['invoice_items', 'list'].includes(field.type)

const load = async () => {
  loading.value = true
  try {
    const response = await $api.specialCases.getTemplates()
    templates.value = response.data.templates
    lookups.value = response.data.lookups
  } catch {
    snackbar.add({ type: 'error', text: 'Could not load the case templates' })
  } finally {
    loading.value = false
  }
}

const choose = (item: any) => {
  Object.keys(values).forEach((key) => delete values[key])
  error.value = ''
  for (const field of item.fields) {
    values[field.key] = field.type === 'list' ? [] : field.type === 'invoice_items' ? [{ folio: '', concept: '', container: '' }] : (field.default ?? null)
  }
  template.value = item
}

const valid = computed(() => {
  if (!template.value) return false
  return template.value.fields.every((field: any) => {
    if (!field.required) return true
    const value = values[field.key]
    if (field.type === 'invoice_items') return value.length > 0 && value.every((row: any) => row.folio && row.concept)
    return Array.isArray(value) ? value.length > 0 : value !== null && value !== '' && value !== undefined
  })
})

const save = async () => {
  saving.value = true
  error.value = ''
  try {
    const payload: Record<string, any> = { ...values }
    if (Array.isArray(payload.invoices)) {
      payload.invoices = payload.invoices.map((row: any) => ({ folio: row.folio.trim(), concept: row.concept.trim(), container: (row.container ?? '').trim() || null }))
    }
    const response = await $api.specialCases.create(template.value.key, payload)
    snackbar.add({ type: 'success', text: 'Special case created' })
    emit('created', response.data.id)
    close()
  } catch (e: any) {
    error.value = e?.response?._data?.message ?? 'The case could not be created'
  } finally {
    saving.value = false
  }
}

const close = () => {
  template.value = null
  emit('update:modelValue', false)
}

watch(
  () => props.modelValue,
  (open) => {
    if (open && !templates.value.length) load()
  },
  { immediate: true },
)
</script>
