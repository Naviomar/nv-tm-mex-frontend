<template>
  <v-card class="p-4 rounded-2xl shadow-sm">
    <v-card-title class="text-xl font-semibold">
      {{ isEdit ? 'Edit Container Delay Rate' : 'Add Container Delay Rate' }}
    </v-card-title>
    <v-card-subtitle class="opacity-70"> Rate 1 / Rate 2 by Line & Container Type </v-card-subtitle>

    <v-divider class="my-3" />

    <v-form ref="formRef" v-model="isValid" @submit.prevent="onSubmit">
      <div class="grid grid-cols-6 gap-4">
        <!-- Line -->
        <div class="col-span-2">
          <v-autocomplete
            v-model="form.line_id"
            :items="lines"
            item-title="name"
            item-value="id"
            density="compact"
            variant="outlined"
            label="Line"
            :rules="[rules.required]"
            :loading="loading.lines"
            clearable
          />
        </div>

        <!-- Rate type -->
        <div class="col-span-1">
          <v-autocomplete
            v-model="form.rate_type"
            :items="rateTypes"
            item-title="text"
            item-value="value"
            density="compact"
            variant="outlined"
            label="Rate"
            :rules="[rules.required]"
            clearable
          />
        </div>

        <!-- Amount -->
        <div class="col-span-1">
          <v-text-field
            v-model="form.amount"
            label="Amount"
            prefix="$"
            type="number"
            step="0.01"
            density="compact"
            variant="outlined"
            :rules="[rules.required, rules.positive]"
          />
        </div>

        <!-- Start / End -->
        <div class="col-span-1">
          <v-text-field
            v-model="form.start_date"
            label="Start date"
            type="date"
            density="compact"
            variant="outlined"
            :rules="[rules.required]"
          />
        </div>

        <div class="col-span-1">
          <v-text-field
            v-model="form.end_date"
            label="End date (optional)"
            type="date"
            density="compact"
            variant="outlined"
            :rules="[rules.endGteStart]"
          />
        </div>

        <!-- Containers -->
        <div class="col-span-4">
          <div class="flex items-center justify-between gap-4">
            <!-- CREATE: multi-select -->
            <v-autocomplete
              v-if="!isEdit"
              v-model="form.container_type_ids"
              :items="containerTypes"
              item-title="name"
              item-value="id"
              density="compact"
              variant="outlined"
              label="Container types"
              multiple
              chips
              closable-chips
              clearable
              :loading="loading.containerTypes"
              :disabled="form.all_containers"
              :rules="[!form.all_containers ? rules.arrayMin1 : () => true]"
              hide-details
            />
            <!-- EDIT: single-select -->
            <v-autocomplete
              v-else
              v-model="form.container_type_id"
              :items="containerTypes"
              item-title="name"
              item-value="id"
              density="compact"
              variant="outlined"
              label="Container type"
              clearable
              :loading="loading.containerTypes"
              :rules="[rules.required]"
              hide-details
            />

            <!-- ALL switch only in CREATE -->
            <v-switch v-if="!isEdit" v-model="form.all_containers" label="ALL containers" inset hide-details />
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-2 mt-4">
        <v-btn variant="text" @click="onCancel" :disabled="submitting">
          {{ isEdit ? 'Cancel' : 'Reset' }}
        </v-btn>
        <v-btn color="primary" :loading="submitting" :disabled="!isValid || submitting" type="submit">
          {{ isEdit ? 'Update' : 'Save' }}
        </v-btn>
      </div>

      <!-- Server-side validation / errors -->
      <v-alert v-if="errorState.show" type="error" class="mt-4" density="compact" variant="tonal">
        <div class="font-semibold mb-1">{{ errorState.message }}</div>
        <ul class="list-disc ml-5 space-y-1">
          <li v-for="(msg, i) in errorState.details" :key="i">{{ msg }}</li>
        </ul>
      </v-alert>
    </v-form>
  </v-card>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch, computed } from 'vue'

const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const router = useRouter()
const loadingStore = useLoadingStore()

/** Props */
type Mode = 'create' | 'edit'
const props = defineProps<{
  mode?: Mode
  rateId?: number | null // pass when mode==='edit'
  redirectOnSave?: boolean // default true
  returnTo?: string // optional redirect path
}>()

const isEdit = computed(() => (props.mode ?? 'create') === 'edit')

type Line = { id: number; name: string }
type ContainerType = { id: number; name: string }

/** Form model */
const formRef = ref()
const isValid = ref(false)
const submitting = ref(false)
const form = reactive({
  line_id: null as number | null,
  // create mode
  container_type_ids: [] as number[],
  all_containers: false,
  // edit mode
  container_type_id: null as number | null,
  // shared
  rate_type: 1 as 1 | 2,
  amount: null as number | null,
  start_date: '',
  end_date: null as string | null,
})

/** Catalogs */
const lines = ref<Line[]>([])
const containerTypes = ref<ContainerType[]>([])
const loading = reactive({ lines: false, containerTypes: false })

/** Error state */
const errorState = reactive<{ show: boolean; message: string; details: string[] }>({
  show: false,
  message: '',
  details: [],
})

/** Static items */
const rateTypes = [
  { text: 'Rate 1', value: 1 },
  { text: 'Rate 2', value: 2 },
]

/** Rules */
const rules = {
  required: (v: any) => (v !== null && v !== undefined && v !== '' ? true : 'Required'),
  positive: (v: any) => (v === null || v === '' || Number(v) >= 0 ? true : 'Must be ≥ 0'),
  arrayMin1: (v: any[]) => (Array.isArray(v) && v.length > 0 ? true : 'Select at least one'),
  endGteStart: () => {
    if (!form.end_date) return true
    if (!form.start_date) return 'Pick start date first'
    return form.end_date >= form.start_date || 'End date must be ≥ start date'
  },
}

/** Load catalogs */
async function loadCatalogs() {
  try {
    loadingStore.start()
    loading.lines = true
    loading.containerTypes = true
    const [ls, cts] = await Promise.all([
      $api.lines.getLines({ query: { perPage: 1000 } }),
      $api.containers.getAllTypes({ query: { perPage: 1000 } }),
    ])
    lines.value = (ls?.data ?? ls ?? []) as any
    containerTypes.value = (cts?.data ?? cts ?? []) as any
  } catch (e) {
    console.error(e)
  } finally {
    loading.lines = false
    loading.containerTypes = false
    setTimeout(() => loadingStore.stop(), 250)
  }
}

/** If editing, load existing row */
type RateRow = {
  id: number
  line_id: number
  container_type_id: number
  rate_type: 1 | 2
  amount: number
  start_date: string
  end_date: string | null
}
async function loadForEdit() {
  if (!isEdit.value || !props.rateId) return
  try {
    loadingStore.start()
    const r: RateRow = await $api.containerDelayRates.getRate(props.rateId!.toString())
    // hydrate form
    form.line_id = r.line_id
    form.container_type_id = r.container_type_id
    form.rate_type = r.rate_type
    form.amount = r.amount as any
    // Ensure only date part is used (YYYY-MM-DD)
    form.start_date = r.start_date ? r.start_date.substring(0, 10) : ''
    form.end_date = r.end_date ? r.end_date.substring(0, 10) : null
    // force create-only fields off
    form.all_containers = false
    form.container_type_ids = []
  } catch (e) {
    console.error(e)
    snackbar.add({ type: 'error', text: 'Failed to load rate' })
  } finally {
    setTimeout(() => loadingStore.stop(), 250)
  }
}

/** Submit */
const emit = defineEmits<{
  (e: 'created', created: any[]): void
  (e: 'updated', updated: any): void
  (e: 'cancel'): void
}>()

async function onSubmit() {
  errorState.show = false
  errorState.message = ''
  errorState.details = []

  const valid = await formRef.value?.validate()
  if (!valid) return

  submitting.value = true
  try {
    loadingStore.start()
    if (isEdit.value && props.rateId) {
      // UPDATE one row
      const payload = {
        line_id: form.line_id,
        container_type_id: form.container_type_id,
        rate_type: form.rate_type,
        amount: Number(form.amount),
        start_date: form.start_date,
        end_date: form.end_date || null,
      }
      const res = await $api.containerDelayRates.updateRate(props.rateId!.toString(), payload)
      snackbar.add({ type: 'success', text: 'Rate updated' })
      router.push('/configuration/container-delay-rates')
    } else {
      // CREATE many
      const payload = {
        line_id: form.line_id,
        container_type_ids: form.all_containers ? [] : form.container_type_ids,
        all_containers: form.all_containers,
        rate_type: form.rate_type,
        amount: Number(form.amount),
        start_date: form.start_date,
        end_date: form.end_date || null,
      }
      const res = await $api.containerDelayRates.createRates(payload)
      snackbar.add({ type: 'success', text: 'Rate(s) created' })
      router.push('/configuration/container-delay-rates')
    }
  } catch (e: any) {
    const msg = e?.data?.message || e?.message || (isEdit.value ? 'Failed to update rate' : 'Failed to create rate(s)')
    const details = toErrorArray(e?.data?.errors)
    errorState.show = true
    errorState.message = msg
    errorState.details = details.length ? details : []
    snackbar.add({ type: 'error', text: isEdit.value ? 'Error updating rate' : 'Error creating rate(s)' })
    console.error(e)
  } finally {
    submitting.value = false
    setTimeout(() => loadingStore.stop(), 250)
  }
}

/** Cancel / Reset */
function onCancel() {
  if (isEdit.value) {
    emit('cancel')
    router.push('/configuration/container-delay-rates')
  } else {
    reset()
  }
}

function reset() {
  form.line_id = null
  form.container_type_ids = []
  form.container_type_id = null
  form.all_containers = false
  form.rate_type = 1
  form.amount = null
  form.start_date = ''
  form.end_date = null
  formRef.value?.resetValidation?.()
  errorState.show = false
  errorState.message = ''
  errorState.details = []
}

function toErrorArray(errorsObj: any): string[] {
  if (!errorsObj || typeof errorsObj !== 'object') return []
  const arr: string[] = []
  Object.keys(errorsObj).forEach((k) => {
    const val = errorsObj[k]
    if (Array.isArray(val)) arr.push(...val.map(String))
    else if (val) arr.push(String(val))
  })
  return arr
}

/** UX: when toggling ALL, clear container list (create mode only) */
watch(
  () => form.all_containers,
  (val) => {
    if (val && !isEdit.value) form.container_type_ids = []
  }
)

onMounted(async () => {
  await loadCatalogs()
  await loadForEdit()
})
</script>
