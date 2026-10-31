<template>
  <v-dialog :model-value="modelValue" max-width="760" persistent>
    <v-card>
      <v-card-title class="flex items-center gap-2">
        <v-icon>mdi-sync</v-icon>
        <span>{{ title }}</span>
      </v-card-title>

      <v-card-text>
        <div v-if="loading" class="flex justify-center py-6">
          <v-progress-circular indeterminate />
        </div>

        <template v-else>
          <p class="mb-3">
            {{ description }}
          </p>

          <v-table v-if="rows.length" density="compact" fixed-header height="320">
            <thead>
              <tr>
                <th style="width: 48px">
                  <v-checkbox-btn
                    :model-value="allSelected"
                    :indeterminate="selected.length > 0 && !allSelected"
                    :disabled="selectableRows.length === 0"
                    @update:model-value="toggleAll"
                  />
                </th>
                <th>Reference</th>
                <th>ETA</th>
                <th class="text-right">Current</th>
                <th class="text-right">New</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in rows" :key="row.id" :class="{ 'tm-row-muted': row.locked }">
                <td>
                  <v-tooltip v-if="row.locked" location="right" :text="row.locked_reason">
                    <template #activator="{ props: tip }">
                      <v-icon v-bind="tip" size="small" color="warning">mdi-lock-outline</v-icon>
                    </template>
                  </v-tooltip>
                  <v-checkbox-btn v-else v-model="selected" :value="row.id" />
                </td>
                <td class="whitespace-nowrap">{{ row.reference_number }}</td>
                <td>{{ row.eta_date ?? '—' }}</td>
                <td class="text-right">{{ row.current }}</td>
                <td class="text-right font-bold">{{ row.expected }}</td>
              </tr>
            </tbody>
          </v-table>
          <v-alert v-else type="info" variant="tonal" density="compact">
            No references to update.
          </v-alert>

          <v-expansion-panels v-model="advancedOpen" variant="accordion" class="mt-3">
            <v-expansion-panel elevation="0">
              <v-expansion-panel-title class="text-medium-emphasis">Advanced options</v-expansion-panel-title>
              <v-expansion-panel-text>
                <v-checkbox
                  v-model="updateAll"
                  density="compact"
                  hide-details
                  label="Also list references that already have a different value and overwrite them"
                  @update:model-value="loadCurrent"
                />
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </template>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" :disabled="saving" @click="skip">Not now</v-btn>
        <v-btn color="primary" variant="elevated" :loading="saving" :disabled="selected.length === 0" @click="apply">
          Update {{ selected.length }} reference{{ selected.length === 1 ? '' : 's' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
/**
 * Asks the user whether to propagate the credit days / free days just saved in the customer
 * catalog to the customer's existing references. Fields are processed one after the other
 * ('credit_days' | 'free_days'); a field with nothing to update is skipped silently.
 * By default only references without a value are listed; overwriting the rest is hidden
 * behind "Advanced options".
 */
const props = defineProps<{
  modelValue: boolean
  consigneeId: string
  fields: string[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'done'): void
}>()

const { $api } = useNuxtApp()
const snackbar = useSnackbar()

const index = ref(0)
const loading = ref(false)
const saving = ref(false)
const rows = ref<any[]>([])
const selected = ref<number[]>([])
const updateAll = ref(false)
const advancedOpen = ref<number | undefined>(undefined)

const field = computed(() => props.fields[index.value])
const label = computed(() => (field.value === 'credit_days' ? 'credit days' : 'demurrage free days'))
const title = computed(() => `Update ${label.value} on existing references`)
const description = computed(() =>
  updateAll.value
    ? `These references have a different ${label.value} value than the customer catalog.`
    : `These references have no ${label.value} registered, but the customer catalog now defines them.`
)

const selectableRows = computed(() => rows.value.filter((row) => !row.locked))
const allSelected = computed(
  () => selectableRows.value.length > 0 && selected.value.length === selectableRows.value.length
)

const toggleAll = (value: boolean | null) => {
  selected.value = value ? selectableRows.value.map((row) => row.id) : []
}

const finish = () => {
  emit('update:modelValue', false)
  emit('done')
}

const next = async () => {
  index.value++
  if (index.value >= props.fields.length) {
    finish()
    return
  }
  await loadCurrent()
}

const loadCurrent = async () => {
  try {
    loading.value = true
    const response: any = await $api.consignees.getReferenceSyncPreview(
      props.consigneeId,
      field.value,
      updateAll.value ? 'all' : 'missing'
    )
    rows.value = response.references ?? []
    selected.value = selectableRows.value.map((row) => row.id)

    // Nothing to propose in the default view: move on without bothering the user
    if (!rows.value.length && !updateAll.value) {
      await next()
    }
  } catch (e: any) {
    console.error(e)
    snackbar.add({ type: 'error', text: e.message || 'Error loading references' })
    finish()
  } finally {
    loading.value = false
  }
}

const apply = async () => {
  try {
    saving.value = true
    const response: any = await $api.consignees.applyReferenceSync(props.consigneeId, {
      field: field.value,
      mode: updateAll.value ? 'all' : 'missing',
      reference_ids: selected.value,
    })
    snackbar.add({
      type: 'success',
      text: `${response.updated} reference(s) updated${response.skipped ? `, ${response.skipped} skipped` : ''}`,
    })
    await next()
  } catch (e: any) {
    console.error(e)
    snackbar.add({ type: 'error', text: e.message || 'Error updating references' })
  } finally {
    saving.value = false
  }
}

const skip = async () => {
  await next()
}

watch(
  () => props.modelValue,
  async (open) => {
    if (!open) return
    index.value = 0
    updateAll.value = false
    advancedOpen.value = undefined
    await loadCurrent()
  },
  { immediate: true }
)
</script>
