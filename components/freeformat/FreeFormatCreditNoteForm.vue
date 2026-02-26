<template>
  <div class="">
    <v-btn color="orange" size="small" @click="showDialog">Add Credit Note</v-btn>
    <v-dialog v-model="dialog" max-width="900">
      <v-card>
        <v-card-title> Add credit note </v-card-title>
        <v-card-text>
          <v-text-field
            v-model="form.external_folio"
            density="compact"
            label="External folio"
            class="mb-2"
          />

          <div class="text-subtitle-2 font-bold mb-2">Linked Invoices</div>
          <div class="flex flex-wrap gap-1 mb-3">
            <v-chip
              v-for="(pi, piIdx) in selectedPartyInvoices"
              :key="`pi-${piIdx}`"
              :closable="piIdx > 0"
              size="small"
              @click:close="removePartyInvoice(piIdx)"
            >
              #{{ pi.invoice?.invoice_number }}
            </v-chip>
          </div>

          <div class="grid grid-cols-[1fr_auto] gap-2 mb-4">
            <v-text-field
              v-model="searchInvoiceNumber"
              density="compact"
              label="Search additional invoice by number"
              hide-details
              @keyup.enter="searchPartyInvoice"
            />
            <v-btn color="primary" size="small" :loading="searching" @click="searchPartyInvoice">Add invoice</v-btn>
          </div>

          <div class="text-subtitle-2 font-bold mb-2">Concepts</div>
          <div
            v-for="(concept, index) in allCharges"
            class="grid grid-cols-[2fr_1fr_auto] gap-3 mb-1"
            :key="`ff-concept-${index}`"
          >
            <div>
              <div class="text-sm font-medium">{{ concept.charge_name }}</div>
              <div class="text-xs text-gray-500">Invoice #{{ concept.invoice_number }}</div>
            </div>
            <div>
              <v-text-field v-model.number="concept.amount" type="number" density="compact" label="Amount" hide-details min="0" />
              <div class="text-xs" :class="concept.max_amount > 0 ? 'text-green-600' : 'text-red-600'">
                Max: {{ formatToCurrency(concept.max_amount) }}
              </div>
            </div>
            <div class="flex items-center">
              <v-checkbox v-model="concept.is_con_iva" density="compact" label="+ IVA" hide-details />
            </div>
          </div>

          <v-divider class="my-3" />

          <div class="flex justify-between items-center mb-2">
            <div class="text-lg font-bold">Total: {{ formatToCurrency(totalAmount) }}</div>
          </div>

          <v-alert v-if="hasAmountExceeded" density="compact" type="error" variant="outlined" class="mb-2">
            One or more amounts exceed the maximum available.
          </v-alert>

          <div class="flex justify-end gap-2">
            <v-btn color="red" @click="closeDialog" class="mb-4">Cancel</v-btn>
            <v-btn
              color="green-darken-4"
              :disabled="hasAmountExceeded || totalAmount <= 0"
              @click="createFreeFormatCreditNote"
              class="mb-4"
            >Add Credit Note</v-btn>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>
<script setup lang="ts">
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()

const props = defineProps({
  partyInvoice: {
    type: Object,
    required: true,
  },
  charge: {
    type: Object,
    required: false,
    default: null,
  },
})

const emits = defineEmits(['cancel', 'refresh'])

const dialog = ref(false)
const searchInvoiceNumber = ref('')
const searching = ref(false)

const selectedPartyInvoices = ref<any[]>([])
const allCharges = ref<any[]>([])

const form = ref<any>({
  external_folio: null,
})

const showDialog = async () => {
  dialog.value = true
  // Enrich primary invoice charges with cn_available_balance
  try {
    const result = await $api.freeFormatInvoices.searchPartyInvoiceForCn({
      invoice_number: props.partyInvoice.invoice?.invoice_number,
      partyable_id: props.partyInvoice.partyable_id,
      partyable_type: props.partyInvoice.partyable_type,
    }) as any
    if (result && !result.message) {
      selectedPartyInvoices.value = [result]
      rebuildCharges()
    }
  } catch (e) {
    // Fallback: use prop data without enrichment
  }
}

const closeDialog = () => {
  dialog.value = false
}

const totalAmount = computed(() => {
  return allCharges.value.reduce((sum: number, c: any) => {
    const amt = parseFloat(c.amount) || 0
    const iva = c.is_con_iva ? round2(amt * 0.16) : 0
    return sum + amt + iva
  }, 0)
})

const hasAmountExceeded = computed(() => {
  return allCharges.value.some((c: any) => parseFloat(c.amount) > c.max_amount)
})

const round2 = (v: number) => Math.round(v * 100) / 100

const rebuildCharges = () => {
  allCharges.value = []
  for (const pi of selectedPartyInvoices.value) {
    const invoiceCharges = pi.invoice?.charges || []
    for (const ic of invoiceCharges) {
      allCharges.value.push({
        invoice_charge_id: ic.id,
        charge_id: ic.charge_id,
        charge_name: ic.charge?.name || ic.final_name || `Charge #${ic.charge_id}`,
        invoice_number: pi.invoice?.invoice_number,
        party_invoice_id: pi.id,
        max_amount: parseFloat(ic.cn_available_balance ?? ic.pending_balance) || 0,
        amount: 0,
        is_con_iva: false,
      })
    }
  }
}

const searchPartyInvoice = async () => {
  if (!searchInvoiceNumber.value) return
  // Don't add duplicates
  if (selectedPartyInvoices.value.some((pi: any) => pi.invoice?.invoice_number === searchInvoiceNumber.value)) {
    snackbar.add({ type: 'warning', text: 'This invoice is already added' })
    return
  }
  try {
    searching.value = true
    const result = await $api.freeFormatInvoices.searchPartyInvoiceForCn({
      invoice_number: searchInvoiceNumber.value,
      partyable_id: props.partyInvoice.partyable_id,
      partyable_type: props.partyInvoice.partyable_type,
    }) as any

    if (!result || result.message) {
      snackbar.add({ type: 'error', text: result?.message || 'Invoice not found' })
      return
    }

    selectedPartyInvoices.value.push(result)
    rebuildCharges()
    searchInvoiceNumber.value = ''
    snackbar.add({ type: 'success', text: `Invoice #${result.invoice?.invoice_number} added` })
  } catch (e: any) {
    snackbar.add({ type: 'error', text: e?.data?.message || 'Invoice not found' })
  } finally {
    searching.value = false
  }
}

const removePartyInvoice = (idx: number) => {
  if (idx === 0) return // can't remove primary
  selectedPartyInvoices.value.splice(idx, 1)
  rebuildCharges()
}

const createFreeFormatCreditNote = async () => {
  try {
    const activeCharges = allCharges.value.filter((c: any) => parseFloat(c.amount) > 0)
    if (!activeCharges.length) {
      snackbar.add({ type: 'error', text: 'You must add at least one concept with amount > 0' })
      return
    }
    if (allCharges.value.some((c: any) => parseFloat(c.amount) < 0)) {
      snackbar.add({ type: 'error', text: 'Amount can not be negative' })
      return
    }
    if (hasAmountExceeded.value) {
      snackbar.add({ type: 'error', text: 'One or more amounts exceed the maximum available' })
      return
    }

    const additionalIds = selectedPartyInvoices.value
      .slice(1)
      .map((pi: any) => pi.id)

    const body = {
      external_folio: form.value.external_folio,
      charges: activeCharges.map((c: any) => ({
        invoice_charge_id: c.invoice_charge_id,
        charge_id: c.charge_id,
        amount: parseFloat(c.amount),
        is_con_iva: c.is_con_iva,
      })),
      additional_party_invoice_ids: additionalIds,
    }

    loadingStore.loading = true
    await $api.freeFormatInvoices.createCreditNote(props.partyInvoice.id, body)
    snackbar.add({ type: 'success', text: 'Credit note created successfully' })
    emits('refresh')
    closeDialog()
  } catch (e: any) {
    console.error(e)
    if (e?.data?.message) snackbar.add({ type: 'error', text: e.data.message })
  } finally {
    setTimeout(() => loadingStore.stop(), 250)
  }
}

watch(
  () => props.partyInvoice,
  () => {
    selectedPartyInvoices.value = [props.partyInvoice]
    rebuildCharges()
  },
  { immediate: true }
)
</script>
