<template>
  <v-dialog :model-value="modelValue" max-width="720" scrollable @update:model-value="emit('update:modelValue', $event)">
    <v-card>
      <v-card-title class="d-flex align-center ga-2">
        <v-icon color="warning">mdi-cash-remove</v-icon>
        What the customer owes
        <v-spacer />
        <v-btn icon="mdi-close" variant="text" size="small" @click="emit('update:modelValue', false)" />
      </v-card-title>

      <v-card-text>
        <div v-if="loading" class="d-flex justify-center pa-8"><v-progress-circular indeterminate color="primary" /></div>
        <v-alert v-else-if="error" type="error" variant="tonal" density="compact">{{ error }}</v-alert>

        <template v-else-if="data">
          <div class="mb-3">
            <div class="font-bold">{{ data.customer }}</div>
            <div class="text-body-2 text-medium-emphasis">Rebate of {{ data.reference }}</div>
          </div>

          <div class="grid grid-cols-2 gap-3 mb-3">
            <div class="debt-box">
              <div class="text-xs text-medium-emphasis">Holding this rebate</div>
              <div class="text-lg font-bold text-warning">{{ formatToCurrency(data.holding) }}</div>
            </div>
            <div class="debt-box">
              <div class="text-xs text-medium-emphasis">Total pending of the customer</div>
              <div class="text-lg font-bold">{{ formatToCurrency(data.total) }}</div>
            </div>
          </div>

          <div class="text-body-2 text-medium-emphasis mb-3">
            <template v-if="data.mode === 'reference'">The rebate of a reference is released when that reference has no pending balance.</template>
            <template v-else-if="data.mode === 'chronological'">The rebate is released when the customer has no pending balance in older references; newer ones do not count.</template>
            <template v-else>The rebate is released when the customer has no pending balance in its other references.</template>
          </div>

          <v-table density="compact">
            <thead>
              <tr>
                <th class="text-left">Reference</th>
                <th class="text-left">System</th>
                <th class="text-left">Date</th>
                <th class="text-right">Pending</th>
                <th class="text-left">Effect</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in data.references" :key="row.system + row.reference">
                <td class="font-medium whitespace-nowrap">
                  {{ row.reference }}
                  <v-chip v-if="row.current" size="x-small" variant="tonal" class="ml-1">This container</v-chip>
                </td>
                <td>{{ row.system }}</td>
                <td class="whitespace-nowrap">{{ row.date }}</td>
                <td class="text-right whitespace-nowrap">{{ formatToCurrency(row.pending) }}</td>
                <td>
                  <v-chip size="x-small" label :color="row.holds ? 'warning' : undefined" :variant="row.holds ? 'flat' : 'outlined'">
                    {{ row.holds ? 'Holds the rebate' : row.newer ? 'Newer: does not hold it' : 'Does not hold it' }}
                  </v-chip>
                </td>
              </tr>
              <tr v-if="!data.references.length">
                <td colspan="5" class="text-center py-4 text-medium-emphasis">Nothing pending.</td>
              </tr>
            </tbody>
          </v-table>

        </template>
      </v-card-text>

      <v-card-actions class="px-5 pb-4">
        <v-spacer />
        <v-btn variant="text" @click="emit('update:modelValue', false)">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
const props = defineProps<{ modelValue: boolean; containerId: number | null }>()
const emit = defineEmits<{ (e: 'update:modelValue', value: boolean): void }>()

const { $api } = useNuxtApp()
const loading = ref(false)
const error = ref('')
const data = ref<any>(null)

async function load() {
  if (!props.containerId) return
  loading.value = true
  error.value = ''
  data.value = null
  try {
    data.value = (await $api.rebate.getDebt(props.containerId)).data
  } catch (e: any) {
    error.value = e?.data?.message ?? 'Could not load the balance'
  } finally {
    loading.value = false
  }
}

watch(
  () => [props.modelValue, props.containerId],
  ([open]) => {
    if (open) load()
  },
)
</script>

<style scoped>
.debt-box {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.1);
  border-radius: 10px;
  padding: 10px 12px;
}
</style>
