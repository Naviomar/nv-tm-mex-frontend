<template>
  <v-card variant="outlined" color="indigo" class="mt-2">
    <v-card-title class="flex items-center gap-2 text-base">
      <v-icon size="small">mdi-train-car-container</v-icon>
      Select containers with a pending balance to the line
    </v-card-title>
    <v-card-subtitle class="whitespace-normal">
      Only containers with a line cost registered in the {{ isDetention ? 'detentions' : 'demurrages' }} module are
      listed. This assignment is used to link the invoice to the line payment request; it is not a supplier cost.
    </v-card-subtitle>
    <v-card-text>
      <v-alert v-if="!loading && rows.length === 0" type="info" density="compact" variant="tonal">
        No containers with a pending balance to the line were found for the selected reference(s).
      </v-alert>

      <div v-for="group in groupedRows" :key="`ref-${group.referencia_id}`" class="mb-4">
        <div class="font-bold text-sm mb-1">
          <v-icon size="x-small">mdi-ferry</v-icon> {{ group.reference_number }}
        </div>
        <div class="rounded border border-slate-300 dark:border-slate-600 divide-y divide-slate-200 dark:divide-slate-700">
          <div
            v-for="row in group.rows"
            :key="`cont-${row.reference_container_id}`"
            class="grid grid-cols-12 items-center gap-2 px-3 py-2 transition-colors"
            :class="rowClass(row)"
          >
            <div class="col-span-4 flex items-center">
              <v-checkbox
                v-model="selected[row.reference_container_id]"
                :disabled="row.pending <= 0"
                density="compact"
                hide-details
                color="indigo"
              >
                <template #label>
                  <span class="font-mono font-bold">{{ row.container_number }}</span>
                </template>
              </v-checkbox>
            </div>
            <div class="col-span-5 text-xs leading-5">
              <div>Line amount: <b>{{ formatToCurrency(row.total) }} {{ getCurrencyName(row.currency_id) }}</b></div>
              <div v-if="row.requested > 0">Already requested: {{ formatToCurrency(row.requested) }}</div>
              <div v-if="row.assigned_other > 0" class="text-orange-700 dark:text-orange-300">
                Assigned to other invoice(s): {{ formatToCurrency(row.assigned_other) }}
                ({{ row.assigned_other_folios.join(', ') }})
              </div>
              <div v-if="row.assigned_this > 0" class="text-indigo-700 dark:text-indigo-300">
                Already assigned to this invoice: {{ formatToCurrency(row.assigned_this) }}
              </div>
              <div>
                Pending:
                <v-chip :color="row.pending > 0 ? 'green' : 'grey'" size="x-small" variant="flat">
                  {{ formatToCurrency(row.pending) }}
                </v-chip>
              </div>
            </div>
            <div class="col-span-3">
              <v-text-field
                v-model.number="amounts[row.reference_container_id]"
                :disabled="!selected[row.reference_container_id]"
                type="number"
                label="Amount"
                density="compact"
                hide-details
                min="0"
                :max="row.pending"
              />
            </div>
          </div>
        </div>
      </div>

      <div v-if="rows.length > 0" class="flex flex-wrap items-center justify-between gap-4 mt-4">
        <div class="text-sm">
          <div>
            Selected: <b>{{ selectedCount }}</b> container(s) —
            <b>{{ formatToCurrency(selectedTotal) }} {{ getCurrencyName(currencyId) }}</b>
          </div>
          <div :class="selectedTotal - availableBalance > 0.01 ? 'text-red' : ''">
            Available in invoice: {{ formatToCurrency(availableBalance) }} {{ getCurrencyName(currencyId) }}
          </div>
        </div>
        <v-btn
          color="indigo"
          prepend-icon="mdi-link-variant"
          :disabled="selectedCount === 0 || selectedTotal - availableBalance > 0.01"
          :loading="saving"
          @click="assign"
        >
          Assign containers
        </v-btn>
      </div>
    </v-card-text>
  </v-card>
</template>
<script setup lang="ts">
import { currencies } from '@/utils/data/systemData'

const { $api } = useNuxtApp()
const snackbar = useSnackbar()

const props = defineProps({
  supplierCfdiId: { type: [String, Number], required: true },
  chargeId: { type: Number, required: true },
  lineType: { type: String as PropType<'demurrage' | 'detention'>, required: true },
  referenciaIds: { type: Array as PropType<number[]>, required: true },
  availableBalance: { type: Number, required: true },
  currencyId: { type: Number, required: true },
})

const emit = defineEmits(['assigned'])

const rows = ref<any[]>([])
const selected = ref<Record<number, boolean>>({})
const amounts = ref<Record<number, number>>({})
const loading = ref(false)
const saving = ref(false)

const isDetention = computed(() => props.lineType === 'detention')

const groupedRows = computed(() => {
  const groups: Record<number, any> = {}
  rows.value.forEach((row) => {
    groups[row.referencia_id] ??= { referencia_id: row.referencia_id, reference_number: row.reference_number, rows: [] }
    groups[row.referencia_id].rows.push(row)
  })
  return Object.values(groups)
})

const selectedIds = computed(() =>
  Object.keys(selected.value)
    .filter((id) => selected.value[Number(id)])
    .map(Number),
)
const selectedCount = computed(() => selectedIds.value.length)
const selectedTotal = computed(() =>
  Math.round(selectedIds.value.reduce((acc, id) => acc + Number(amounts.value[id] || 0), 0) * 100) / 100,
)

const rowClass = (row: any) => {
  if (row.pending <= 0) return 'opacity-50'
  return selected.value[row.reference_container_id] ? 'bg-indigo-50 dark:bg-indigo-950' : ''
}

const getCurrencyName = (id: number) => currencies.find((c) => c.id === id)?.name

watch(selected, (value) => {
  Object.keys(value).forEach((key) => {
    const id = Number(key)
    const row = rows.value.find((r) => r.reference_container_id === id)
    if (value[id] && !amounts.value[id] && row) amounts.value[id] = row.pending
  })
}, { deep: true })

const load = async () => {
  if (!props.referenciaIds.length) {
    rows.value = []
    return
  }
  try {
    loading.value = true
    selected.value = {}
    amounts.value = {}
    rows.value = await $api.suppliers.getLineContainersAvailable(props.supplierCfdiId.toString(), {
      charge_id: props.chargeId,
      referencia_ids: props.referenciaIds,
    })
  } catch (e: any) {
    console.error(e)
    snackbar.add({ type: 'error', text: e?.data?.message || 'Error loading containers' })
  } finally {
    loading.value = false
  }
}

const assign = async () => {
  const invalid = selectedIds.value.find((id) => {
    const row = rows.value.find((r) => r.reference_container_id === id)
    const amount = Number(amounts.value[id] || 0)
    return amount <= 0 || amount - row.pending > 0.01
  })
  if (invalid) {
    snackbar.add({ type: 'warning', text: 'Each selected container needs an amount greater than 0 and within its pending balance.' })
    return
  }
  try {
    saving.value = true
    await $api.suppliers.assignLineContainers(props.supplierCfdiId.toString(), {
      charge_id: props.chargeId,
      items: selectedIds.value.map((id) => ({ reference_container_id: id, amount: amounts.value[id] })),
    })
    snackbar.add({ type: 'success', text: 'Containers assigned to the invoice' })
    emit('assigned')
  } catch (e: any) {
    console.error(e)
    snackbar.add({ type: 'error', text: e?.data?.message || 'Error assigning containers' })
  } finally {
    saving.value = false
  }
}

watch(() => [props.chargeId, props.referenciaIds.join(',')], load, { immediate: true })
</script>
