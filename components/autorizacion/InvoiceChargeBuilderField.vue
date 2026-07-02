<template>
  <div>
    <!-- Charges already added to this request -->
    <div v-if="localCharges.length > 0" class="mb-3">
      <ChargeLineList :charges="localCharges" removable @remove="removeCharge($event)" />
    </div>

    <!-- Invoice search -->
    <div class="d-flex gap-2 align-start mb-2">
      <v-text-field
        v-model="invoiceSearch"
        density="compact"
        label="Invoice number"
        hide-details
        class="flex-1"
        append-inner-icon="mdi-magnify"
        @click:append-inner="searchInvoice"
        @keyup.enter="searchInvoice"
      />
      <v-btn
        v-if="invoiceCharges.length > 0"
        icon
        size="small"
        variant="text"
        color="grey"
        title="Search different invoice"
        @click="clearSearch"
      >
        <v-icon size="small">mdi-close</v-icon>
      </v-btn>
    </div>

    <!-- Charge + amount selector -->
    <div v-if="invoiceCharges.length > 0" class="d-flex gap-2 align-start mb-1">
      <v-select
        v-model="selectedCharge"
        :items="invoiceCharges"
        item-title="label"
        item-value="id"
        return-object
        density="compact"
        label="Select charge"
        hide-details
        class="flex-1"
      />
      <v-text-field
        v-model.number="selectedAmount"
        type="number"
        density="compact"
        label="Amount"
        style="max-width:150px"
        :hint="selectedCharge ? `Max: ${formatToCurrency(remainingBalance)}` : ''"
        persistent-hint
        :disabled="!selectedCharge"
        min="0"
        :max="remainingBalance"
      />
      <v-btn
        color="blue"
        size="small"
        class="mt-1"
        :disabled="!selectedCharge || !selectedAmount || selectedAmount > remainingBalance"
        @click="addToList"
      >
        <v-icon>mdi-plus</v-icon>
      </v-btn>
    </div>

    <div v-if="invoiceCharges.length > 0" class="text-caption text-medium-emphasis mb-1">
      To add charges from a different invoice, click <v-icon size="x-small">mdi-close</v-icon> to clear and search again.
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatToCurrency } from '@/utils/formatters'

const props = defineProps<{
  modelValue: any[]
  creditNoteId: number | string | null | undefined
}>()

const emit = defineEmits<{ 'update:modelValue': [value: any[]] }>()

const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()

const localCharges = ref<any[]>([...props.modelValue])

watch(() => props.modelValue, (v) => { localCharges.value = [...v] })

const invoiceSearch = ref('')
const invoiceCharges = ref<any[]>([])
const selectedCharge = ref<any>(null)
const selectedAmount = ref<number | null>(null)

const remainingBalance = computed(() => {
  const sel = selectedCharge.value
  if (!sel) return 0
  const alreadyAdded = localCharges.value
    .filter((c: any) => c.invoice_charge_id === sel.id)
    .reduce((sum: number, c: any) => sum + (parseFloat(c.amount) || 0), 0)
  return Math.max(0, (sel.cn_available_balance ?? 0) - alreadyAdded)
})

async function searchInvoice() {
  if (!invoiceSearch.value || !props.creditNoteId) return
  try {
    loadingStore.loading = true
    const result = await ($api as any).consigneeCreditNotes.getAvailableCharges(props.creditNoteId, invoiceSearch.value)
    const charges = result?.invoice?.charges ?? []
    invoiceCharges.value = charges
      .filter((c: any) => (c.cn_available_balance ?? 0) > 0)
      .map((c: any) => ({
        ...c,
        label: `${c.charge?.name ?? 'Concept'} — available: ${formatToCurrency(c.cn_available_balance)}`,
      }))
    if (invoiceCharges.value.length === 0) {
      snackbar.add({ type: 'warning', text: 'No available charges on this invoice' })
    }
  } catch (e: any) {
    if (e?.data?.message) snackbar.add({ type: 'error', text: e.data.message })
  } finally {
    setTimeout(() => loadingStore.stop(), 250)
  }
}

function clearSearch() {
  invoiceCharges.value = []
  invoiceSearch.value = ''
  selectedCharge.value = null
  selectedAmount.value = null
}

function addToList() {
  const ic = selectedCharge.value
  if (!ic || !selectedAmount.value) return
  if (selectedAmount.value > remainingBalance.value) {
    snackbar.add({ type: 'error', text: `Amount exceeds available balance (${formatToCurrency(remainingBalance.value)})` })
    return
  }
  const updated = [
    ...localCharges.value,
    {
      invoice_charge_id: ic.id,
      charge_id: ic.charge_id,
      charge_name: ic.charge?.name ?? 'Concept',
      invoice_number: invoiceSearch.value,
      amount: selectedAmount.value,
    },
  ]
  localCharges.value = updated
  emit('update:modelValue', updated)
  selectedCharge.value = null
  selectedAmount.value = null
}

function removeCharge(idx: number) {
  const updated = localCharges.value.filter((_: any, i: number) => i !== idx)
  localCharges.value = updated
  emit('update:modelValue', updated)
}
</script>
