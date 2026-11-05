<template>
  <v-dialog :model-value="modelValue" max-width="760" persistent @update:model-value="$emit('update:modelValue', $event)">
    <v-card class="sc-card" elevation="0">
      <v-card-title class="pa-5 pb-2">Review &amp; apply</v-card-title>
      <v-card-text class="px-5">
        <template v-if="ready.items.length">
          <div class="sc-muted mb-3">
            {{ ready.items.length }} movements for {{ formatCurrency(ready.amount) }}. <span v-if="hasNotes">The amount is taken off the paying references with debit notes.</span>
            Every movement can be reversed afterwards.
          </div>

          <v-table density="compact" class="sc-nested">
            <thead>
              <tr>
                <th>{{ ready.items[0].kind === 'advance' ? 'Item' : 'Money from' }}</th>
                <th v-if="ready.items[0].kind !== 'advance'">Covers</th>
                <th class="text-end">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in ready.items" :key="index">
                <td>
                  <template v-if="item.kind === 'advance'"><strong>{{ item.debt_reference }}</strong> <span class="sc-muted">{{ item.debt_label }}</span></template>
                  <template v-else><strong>{{ item.source_reference }}</strong> <span class="sc-muted">{{ item.source_system }}</span></template>
                </td>
                <td v-if="item.kind !== 'advance'"><strong>{{ item.debt_reference }}</strong> <span class="sc-muted">{{ item.debt_label }}</span></td>
                <td class="text-end">{{ formatCurrency(item.amount) }}</td>
              </tr>
            </tbody>
          </v-table>
        </template>
        <v-alert v-else type="info" variant="tonal" density="comfortable">
          Nothing to apply right now: there is no collected money waiting for the debt.
        </v-alert>
      </v-card-text>
      <v-card-actions class="tm-dialog-actions pa-5 pt-0">
        <v-spacer />
        <v-btn variant="text" :disabled="loading" @click="$emit('update:modelValue', false)">Cancel</v-btn>
        <v-btn color="primary" variant="flat" :loading="loading" @click="$emit('confirm')">Apply</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
defineProps<{ modelValue: boolean; ready: any; loading: boolean; hasNotes: boolean }>()
defineEmits<{ (e: 'update:modelValue', value: boolean): void; (e: 'confirm'): void }>()
const { formatCurrency } = useReportFormatters()
</script>
