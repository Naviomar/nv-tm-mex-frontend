<template>
  <v-dialog :model-value="modelValue" max-width="1000" @update:model-value="$emit('update:modelValue', $event)">
    <v-card>
      <v-card-title class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <v-icon size="small">mdi-file-clock-outline</v-icon>
          <span class="text-lg font-bold">Pending references (payment request without line invoice)</span>
        </div>
        <v-btn icon variant="text" @click="close">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text>
        <v-alert type="info" variant="tonal" density="compact" class="mb-3 text-caption">
          References/Master BL(s) with an active payment request (Payment Release) that still don't have a
          freight line invoice loaded. Click a row to add its Master BL to the search.
        </v-alert>

        <div v-if="loading" class="flex justify-center py-6">
          <v-progress-circular indeterminate color="primary" />
        </div>

        <v-table v-else density="compact" fixed-header height="450">
          <thead>
            <tr>
              <th class="text-left">Reference #</th>
              <th class="text-left">Master BL</th>
              <th class="text-left">Freight line</th>
              <th class="text-left">Payment Release</th>
              <th class="text-left">Amount</th>
              <th class="text-left">Created at</th>
              <th class="text-left" width="20"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in items" :key="`pending-ref-${index}`">
              <td>{{ item.referencia?.reference_number }}</td>
              <td>{{ item.ref_master_bl?.name }}</td>
              <td>{{ item.schedule?.line?.name }}</td>
              <td>{{ item.schedule?.folio || '#' + item.schedule?.id }}</td>
              <td class="whitespace-nowrap">
                {{ getCurrencyName(item.currency_id) }} {{ formatToCurrency(item.amount) }}
              </td>
              <td class="whitespace-nowrap">{{ formatDateString(item.created_at) }}</td>
              <td>
                <v-btn
                  size="x-small"
                  color="primary"
                  variant="tonal"
                  :disabled="!item.ref_master_bl?.name"
                  @click="selectItem(item)"
                >
                  <v-icon start size="small">mdi-plus</v-icon> Use
                </v-btn>
              </td>
            </tr>
            <tr v-if="items.length === 0">
              <td colspan="7" class="text-center text-grey-darken-1 py-4">
                No pending references found{{ lineId ? ' for this freight line' : '' }}.
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="secondary" @click="close">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script setup lang="ts">
const { $api } = useNuxtApp()
const snackbar = useSnackbar()

const props = defineProps<{
  modelValue: boolean
  lineId?: string | number | null
}>()

const emit = defineEmits(['update:modelValue', 'select'])

const loading = ref(false)
const items = ref<any[]>([])

const close = () => {
  emit('update:modelValue', false)
}

const selectItem = (item: any) => {
  emit('select', item)
}

const load = async () => {
  try {
    loading.value = true
    const response: any = await ($api as any).linePayments.getPendingScheduleRefsWithoutInvoice(props.lineId)
    items.value = response || []
  } catch (e) {
    console.error(e)
    snackbar.add({ type: 'error', text: 'Error fetching pending references' })
  } finally {
    loading.value = false
  }
}

watch(
  () => props.modelValue,
  (show) => {
    if (show) load()
  }
)
</script>
