<template>
  <div>
    <div class="grid grid-cols-2 gap-4">
      <!-- Left column: Search & Form -->
      <div>
        <!-- Mode selector -->
        <v-card class="mb-4">
          <v-card-text>
            <div class="font-bold mb-2">Credit Note Type</div>
            <v-btn-toggle v-model="cnMode" mandatory color="primary" density="compact" class="mb-2">
              <v-btn value="customer">Customer Invoice</v-btn>
              <v-btn value="party">Free Format Invoice</v-btn>
            </v-btn-toggle>
          </v-card-text>
        </v-card>

        <!-- Search: Customer service invoice -->
        <v-card v-if="cnMode === 'customer'" class="mb-4">
          <v-card-title>
            <h3>Search customer service invoice (Sea/Air - Import/Export)</h3>
          </v-card-title>
          <v-card-subtitle> Search invoices to create a credit note. You can add multiple invoices from the same customer. </v-card-subtitle>
          <v-card-text>
            <div>
              <div class="grid grid-cols-2 gap-4">
                <v-autocomplete
                  v-model="filters.inv_type"
                  density="compact"
                  :items="['wm', 'tm']"
                  label="Invoice type"
                />
                <v-autocomplete
                  v-model="filters.inv_service"
                  density="compact"
                  :items="['sea', 'air']"
                  label="Service type"
                />
                <v-text-field v-model="filters.invoiceId" density="compact" type="text" label="Invoice #" />
              </div>
              <div class="flex">
                <v-btn color="primary" size="small" @click="searchAndAddInvoice"> Search & add invoice </v-btn>
              </div>
            </div>
          </v-card-text>
        </v-card>

        <!-- Search: Free format invoice -->
        <v-card v-if="cnMode === 'party'" class="mb-4">
          <v-card-title>
            <h3>Search free format invoice</h3>
          </v-card-title>
          <v-card-subtitle> Search free format invoices by invoice number to create a credit note. </v-card-subtitle>
          <v-card-text>
            <div class="grid grid-cols-2 gap-4">
              <v-text-field v-model="partyFilters.invoiceNumber" density="compact" type="text" label="Invoice #" @keyup.enter="searchAndAddPartyInvoice" />
            </div>
            <div class="flex">
              <v-btn color="primary" size="small" @click="searchAndAddPartyInvoice"> Search & add invoice </v-btn>
            </div>
          </v-card-text>
        </v-card>

        <!-- Selected invoices list: Customer mode -->
        <v-card v-if="cnMode === 'customer' && selectedInvoices.length > 0" class="mb-4">
          <v-card-title>
            <h3>Selected invoices ({{ selectedInvoices.length }})</h3>
          </v-card-title>
          <v-card-text>
            <div v-for="(inv, invIdx) in selectedInvoices" :key="`sel-inv-${invIdx}`" class="mb-3">
              <div class="flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded px-3 py-2">
                <div>
                  <span class="font-bold">{{ inv.inv_type.toUpperCase() }} #{{ inv.serviceInvoice.invoice?.invoice_number }}</span>
                  <span class="text-sm ml-2">{{ inv.serviceInvoice.consignee?.name }}</span>
                  <span class="text-sm ml-2">- {{ formatToCurrency(inv.serviceInvoice.invoice?.total) }}</span>
                </div>
                <v-btn icon size="x-small" color="red" variant="text" @click="removeInvoice(invIdx)">
                  <v-icon size="16">mdi-close</v-icon>
                </v-btn>
              </div>
            </div>
          </v-card-text>
        </v-card>

        <!-- Selected invoices list: Party mode -->
        <v-card v-if="cnMode === 'party' && selectedPartyInvoices.length > 0" class="mb-4">
          <v-card-title>
            <h3>Selected free format invoices ({{ selectedPartyInvoices.length }})</h3>
          </v-card-title>
          <v-card-text>
            <div v-for="(pi, piIdx) in selectedPartyInvoices" :key="`sel-pi-${piIdx}`" class="mb-3">
              <div class="flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded px-3 py-2">
                <div>
                  <span class="font-bold">Invoice #{{ pi.invoice?.invoice_number }}</span>
                  <span class="text-sm ml-2">{{ pi.partyable?.name }}</span>
                </div>
                <v-btn icon size="x-small" color="red" variant="text" @click="removePartyInvoice(piIdx)">
                  <v-icon size="16">mdi-close</v-icon>
                </v-btn>
              </div>
            </div>
          </v-card-text>
        </v-card>

        <!-- Credit Note Form -->
        <v-card v-if="hasInvoicesSelected">
          <v-card-title>
            <h3>Credit Note for - {{ entityName }}</h3>
          </v-card-title>
          <v-card-text>
            <v-text-field v-model="form.external_folio" density="compact" label="External folio" />

            <div class="text-subtitle-2 font-bold mb-2">Concepts</div>
            <v-alert v-if="allCharges.length === 0" density="compact" type="info" variant="outlined" class="mb-2">
              No concepts found in the selected invoices.
            </v-alert>

            <div
              v-for="(charge, index) in allCharges"
              :key="`charge-${index}`"
              class="grid gap-3 mb-1 items-center"
              :class="cnMode === 'party' ? 'grid-cols-[2fr_1fr_auto_1fr]' : 'grid-cols-[2fr_1fr_1fr]'"
            >
              <div>
                <div class="text-sm font-medium">{{ charge.charge_name }}</div>
                <div class="text-xs text-gray-500">Invoice #{{ charge.invoice_number }}</div>
              </div>
              <div>
                <v-text-field
                  v-model.number="charge.amount"
                  type="number"
                  density="compact"
                  label="Amount"
                  hide-details
                  :max="charge.max_available"
                  min="0"
                  @update:model-value="validateChargeAmount(index)"
                />
                <div class="text-xs" :class="charge.max_available > 0 ? 'text-green-600' : 'text-red-600'">
                  Max: {{ formatToCurrency(charge.max_available) }}
                </div>
              </div>
              <div v-if="cnMode === 'party'" class="flex items-center">
                <v-checkbox v-model="charge.is_con_iva" label="IVA" density="compact" hide-details />
              </div>
              <div class="text-right text-sm">
                {{ formatToCurrency(charge.amount || 0) }}
                <div v-if="cnMode === 'party' && charge.is_con_iva" class="text-xs text-gray-500">
                  + IVA {{ formatToCurrency((charge.amount || 0) * 0.16) }}
                </div>
              </div>
            </div>

            <v-divider class="my-3" />

            <div class="flex justify-between items-center mb-3">
              <div class="text-lg font-bold">Total: {{ formatToCurrency(totalCreditNoteAmount) }}</div>
              <div>
                <v-autocomplete
                  v-model="form.currency_id"
                  :items="currencies"
                  item-value="id"
                  item-title="name"
                  density="compact"
                  label="Currency *"
                  readonly
                  style="width: 150px"
                />
              </div>
            </div>

            <v-alert
              v-if="hasAmountExceeded"
              density="compact"
              type="error"
              variant="outlined"
              class="mb-2"
            >
              One or more concept amounts exceed the maximum available.
            </v-alert>

            <v-textarea v-model="form.description" density="compact" label="Comments *" />
            <div class="flex justify-end">
              <v-btn color="primary" :disabled="!canSubmit" @click="saveCreditNote"> Create credit note </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </div>

      <!-- Right column: Invoice details & history -->
      <div v-if="hasInvoicesSelected">
        <!-- Customer mode: service invoice details -->
        <template v-if="cnMode === 'customer'">
          <v-card v-for="(inv, invIdx) in selectedInvoices" :key="`detail-${invIdx}`" class="mb-4">
            <v-card-title>
              <h4>
                Invoice {{ inv.inv_type.toUpperCase() }} #{{ inv.serviceInvoice.invoice?.invoice_number }}
                <v-btn color="primary" size="small" variant="outlined" class="ml-2" @click="viewServiceInvoice(inv)">
                  View invoice
                </v-btn>
              </h4>
            </v-card-title>
            <v-card-text>
              <div>
                <p>Customer: {{ inv.serviceInvoice.consignee?.name }}</p>
                <p>Linked services # {{ getInvoiceServices(inv.serviceInvoice) }}</p>
                <p>
                  Amount: {{ getCurrencyName(inv.serviceInvoice.invoice?.currency_id) }}
                  {{ formatToCurrency(inv.serviceInvoice.invoice?.total) }}
                </p>
                <p>Date: {{ formatDateString(inv.serviceInvoice.created_at) }}</p>
              </div>
            </v-card-text>
          </v-card>
        </template>

        <!-- Party mode: party invoice details -->
        <template v-if="cnMode === 'party'">
          <v-card v-for="(pi, piIdx) in selectedPartyInvoices" :key="`pi-detail-${piIdx}`" class="mb-4">
            <v-card-title>
              <h4>Free Format Invoice #{{ pi.invoice?.invoice_number }}</h4>
            </v-card-title>
            <v-card-text>
              <p>Party: {{ pi.partyable?.name }}</p>
              <p>Type: {{ pi.inv_type?.toUpperCase() }}</p>
              <p>Date: {{ formatDateString(pi.created_at) }}</p>
            </v-card-text>
          </v-card>
        </template>

        <v-card v-if="lastCreditNotes.length > 0">
          <v-card-title>
            <h4>Last credit notes for {{ entityName }}</h4>
          </v-card-title>
          <v-card-text>
            <div v-for="(cn, index) in lastCreditNotes" :key="`last-cn-${index}`">
              <v-divider />
              <div class="flex justify-between mb-4">
                <div>
                  <p>Credit note #{{ cn.id }}</p>
                  <p>Amount: {{ formatToCurrency(cn.amount) }}</p>
                  <p>Date: {{ formatDateString(cn.created_at) }}</p>
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { currencies } from '@/utils/data/systemData'
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()
const router = useRouter()

const cnMode = ref<'customer' | 'party'>('customer')

const filters = reactive({
  inv_type: null as string | null,
  inv_service: null as string | null,
  invoiceId: null as string | null,
})

const partyFilters = reactive({
  invoiceNumber: null as string | null,
})

// Multiple invoices support
const selectedInvoices = ref<any[]>([])
const selectedPartyInvoices = ref<any[]>([])
const lastCreditNotes = ref<any[]>([])

const form = reactive({
  external_folio: null as string | null,
  currency_id: null as number | null,
  description: '',
})

// All charges from all selected invoices, each with amount input
const allCharges = ref<any[]>([])

const entityName = computed(() => {
  if (cnMode.value === 'party') {
    if (selectedPartyInvoices.value.length === 0) return ''
    return selectedPartyInvoices.value[0].partyable?.name ?? ''
  }
  if (selectedInvoices.value.length === 0) return ''
  return selectedInvoices.value[0].serviceInvoice.consignee?.name ?? ''
})

const hasInvoicesSelected = computed(() => {
  if (cnMode.value === 'party') return selectedPartyInvoices.value.length > 0
  return selectedInvoices.value.length > 0
})

const totalCreditNoteAmount = computed(() => {
  return allCharges.value.reduce((sum: number, c: any) => {
    const amt = parseFloat(c.amount) || 0
    const iva = (cnMode.value === 'party' && c.is_con_iva) ? round2(amt * 0.16) : 0
    return sum + amt + iva
  }, 0)
})

const round2 = (v: number) => Math.round(v * 100) / 100

const hasAmountExceeded = computed(() => {
  return allCharges.value.some((c: any) => parseFloat(c.amount) > c.max_available)
})

const canSubmit = computed(() => {
  if (!form.currency_id || !form.description) return false
  if (totalCreditNoteAmount.value <= 0) return false
  if (hasAmountExceeded.value) return false
  // at least one charge with amount > 0
  if (!allCharges.value.some((c: any) => parseFloat(c.amount) > 0)) return false
  return true
})

const getInvoiceServices = (serviceInvoice: any) => {
  if (!serviceInvoice) return '-'
  if (serviceInvoice.class_name?.includes('Air')) {
    return serviceInvoice.services?.map((s: any) => s.air_reference?.reference_number).join(', ') || '-'
  }
  if (serviceInvoice.class_name?.includes('Sea')) {
    return serviceInvoice.services?.map((s: any) => s.referencia?.reference_number).join(', ') || '-'
  }
  return '-'
}

const viewServiceInvoice = (inv: any) => {
  const className = inv.serviceInvoice.class_name
  const invId = inv.serviceInvoice.id
  const invType = inv.inv_type

  if (className.includes('Sea')) {
    if (invType === 'tm') { router.push(`/invoices/search/tm-view-${invId}`); return }
    if (invType === 'wm') { router.push(`/invoices/search/wm-view-${invId}`); return }
  }
  if (className.includes('Air')) {
    if (invType === 'tm') { router.push(`/invoices/search/tm-air-view-${invId}`); return }
    if (invType === 'wm') { router.push(`/invoices/search/wm-air-view-${invId}`); return }
  }
}

const validateChargeAmount = (index: number) => {
  const charge = allCharges.value[index]
  if (charge.amount < 0) charge.amount = 0
  if (parseFloat(charge.amount) > charge.max_available) {
    snackbar.add({ type: 'warning', text: `Amount for "${charge.charge_name}" exceeds maximum available (${charge.max_available})` })
  }
}

const rebuildCharges = () => {
  allCharges.value = []
  for (const inv of selectedInvoices.value) {
    const invoiceCharges = inv.serviceInvoice.invoice?.charges || []
    for (const ic of invoiceCharges) {
      allCharges.value.push({
        invoice_charge_id: ic.id,
        charge_id: ic.charge_id,
        charge_name: ic.charge?.name || ic.final_name || `Charge #${ic.charge_id}`,
        invoice_number: inv.serviceInvoice.invoice?.invoice_number,
        invoice_id: inv.serviceInvoice.invoice?.id,
        service_invoice_id: inv.serviceInvoice.id,
        invoice_class_name: inv.serviceInvoice.class_name,
        max_available: parseFloat(ic.cn_available_balance ?? ic.pending_balance) || 0,
        amount: 0,
      })
    }
  }
}

const searchAndAddInvoice = async () => {
  try {
    if (!filters.inv_type || !filters.invoiceId || !filters.inv_service) {
      snackbar.add({ type: 'warning', text: 'Please fill all fields' })
      return
    }

    // Check if already added
    const alreadyAdded = selectedInvoices.value.some(
      (inv: any) => inv.serviceInvoice.invoice?.invoice_number == filters.invoiceId && inv.inv_type == filters.inv_type
    )
    if (alreadyAdded) {
      snackbar.add({ type: 'warning', text: 'This invoice is already added' })
      return
    }

    loadingStore.loading = true
    const body = {
      inv_type: filters.inv_type,
      inv_service: filters.inv_service,
      invoiceId: filters.invoiceId,
    }
    const response: any = await $api.consigneeCreditNotes.searchInvoice(body)

    if (!response.invoice) {
      snackbar.add({ type: 'warning', text: 'Invoice not found' })
      return
    }

    // Validate same consignee
    if (selectedInvoices.value.length > 0) {
      const existingConsigneeId = selectedInvoices.value[0].serviceInvoice.consignee?.id
      if (response.invoice.consignee?.id !== existingConsigneeId) {
        snackbar.add({ type: 'error', text: 'All invoices must belong to the same customer' })
        return
      }
    }

    selectedInvoices.value.push({
      inv_type: filters.inv_type,
      inv_service: filters.inv_service,
      serviceInvoice: response.invoice,
    })

    lastCreditNotes.value = response.lastCreditNotes || []
    form.currency_id = response.invoice?.invoice?.currency_id

    // Rebuild charges list
    rebuildCharges()

    // Clear search field for next search
    filters.invoiceId = null
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const removeInvoice = (index: number) => {
  selectedInvoices.value.splice(index, 1)
  rebuildCharges()
  if (selectedInvoices.value.length === 0) {
    form.currency_id = null
    lastCreditNotes.value = []
  }
}

// ─── Party invoice methods ─────────────────────────────────
const searchAndAddPartyInvoice = async () => {
  try {
    if (!partyFilters.invoiceNumber) {
      snackbar.add({ type: 'warning', text: 'Please enter an invoice number' })
      return
    }

    const alreadyAdded = selectedPartyInvoices.value.some(
      (pi: any) => pi.invoice?.invoice_number == partyFilters.invoiceNumber
    )
    if (alreadyAdded) {
      snackbar.add({ type: 'warning', text: 'This invoice is already added' })
      return
    }

    loadingStore.loading = true
    const body = { invoice_number: partyFilters.invoiceNumber }
    const response: any = await $api.consigneeCreditNotes.searchPartyInvoice(body)

    if (!response.partyInvoice) {
      snackbar.add({ type: 'warning', text: 'Free format invoice not found' })
      return
    }

    selectedPartyInvoices.value.push(response.partyInvoice)
    form.currency_id = response.partyInvoice.currency_id

    rebuildPartyCharges()
    partyFilters.invoiceNumber = null
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => loadingStore.stop(), 250)
  }
}

const removePartyInvoice = (index: number) => {
  selectedPartyInvoices.value.splice(index, 1)
  rebuildPartyCharges()
  if (selectedPartyInvoices.value.length === 0) {
    form.currency_id = null
  }
}

const rebuildPartyCharges = () => {
  allCharges.value = []
  for (const pi of selectedPartyInvoices.value) {
    const invoiceCharges = pi.invoice?.charges || []
    for (const ic of invoiceCharges) {
      allCharges.value.push({
        invoice_charge_id: ic.id,
        charge_id: ic.charge_id,
        charge_name: ic.charge?.name || ic.final_name || `Charge #${ic.charge_id}`,
        invoice_number: pi.invoice?.invoice_number,
        max_available: parseFloat(ic.cn_available_balance ?? ic.pending_balance) || 0,
        amount: 0,
        is_con_iva: false,
      })
    }
  }
}

const saveCreditNote = async () => {
  try {
    const activeCharges = allCharges.value.filter((c: any) => parseFloat(c.amount) > 0)
    if (activeCharges.length === 0) {
      snackbar.add({ type: 'warning', text: 'You must set an amount for at least one concept' })
      return
    }
    if (!form.currency_id || !form.description) {
      snackbar.add({ type: 'warning', text: 'Please fill all required fields (currency, comments)' })
      return
    }
    if (hasAmountExceeded.value) {
      snackbar.add({ type: 'error', text: 'One or more amounts exceed the maximum available' })
      return
    }

    loadingStore.loading = true

    let body: any

    if (cnMode.value === 'party') {
      // Free format mode
      body = {
        type: 'party',
        party_invoice_ids: selectedPartyInvoices.value.map((pi: any) => pi.id),
        external_folio: form.external_folio,
        charges: activeCharges.map((c: any) => ({
          invoice_charge_id: c.invoice_charge_id,
          charge_id: c.charge_id,
          amount: parseFloat(c.amount),
          is_con_iva: c.is_con_iva || false,
        })),
        currency_id: form.currency_id,
        description: form.description,
      }
    } else {
      // Customer mode
      const serviceInvoicesMap = new Map<string, any>()
      for (const inv of selectedInvoices.value) {
        const key = `${inv.serviceInvoice.class_name}-${inv.serviceInvoice.id}`
        if (!serviceInvoicesMap.has(key)) {
          serviceInvoicesMap.set(key, {
            invoice_class_name: inv.serviceInvoice.class_name,
            service_invoice_id: inv.serviceInvoice.id,
          })
        }
      }

      body = {
        service_invoices: Array.from(serviceInvoicesMap.values()),
        external_folio: form.external_folio,
        charges: activeCharges.map((c: any) => ({
          invoice_charge_id: c.invoice_charge_id,
          charge_id: c.charge_id,
          amount: parseFloat(c.amount),
        })),
        currency_id: form.currency_id,
        description: form.description,
        inv_type: selectedInvoices.value[0]?.inv_type,
      }
    }

    await $api.consigneeCreditNotes.createNote(body)
    snackbar.add({ type: 'success', text: 'Credit note created' })
    router.push('/invoices/search/credit-notes')
  } catch (e: any) {
    console.error(e)
    if (e?.data?.message) {
      snackbar.add({ type: 'error', text: e.data.message })
    }
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}
</script>
