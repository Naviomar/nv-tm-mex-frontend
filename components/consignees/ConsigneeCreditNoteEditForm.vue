<template>
  <div>
    <div class="grid grid-cols-3 gap-4">
      <div class="col-span-2">
        <v-card>
          <v-card-title>
            <h3>{{ consigneeCreditNote?.type === 'party' ? 'Free Format' : 'Customer' }} Credit Note - Edit Form</h3>
          </v-card-title>
          <v-card-subtitle> Only credit notes not used can be edited. </v-card-subtitle>
          <v-card-text>
            <div class="py-4">
              <v-text-field v-model="consigneeCreditNote.external_folio" density="compact" label="External folio" class="mb-2" />
              <v-textarea v-model="consigneeCreditNote.description" density="compact" label="Comments *" class="mb-2" />

              <div class="text-subtitle-2 font-bold mb-2">Concepts</div>

              <div
                v-for="(charge, idx) in editableCharges"
                :key="`edit-charge-${idx}`"
                class="grid grid-cols-[2fr_1fr_1fr] gap-3 mb-2 items-center"
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
                    :disabled="hasPayments"
                    min="0"
                    :max="charge.cn_available_balance"
                    @update:model-value="validateChargeAmount(idx)"
                  />
                  <div class="text-xs" :class="charge.cn_available_balance > 0 ? 'text-green-600' : 'text-red-600'">
                    Max: {{ formatToCurrency(charge.cn_available_balance ?? charge.amount) }}
                  </div>
                </div>
                <div class="text-right text-sm font-medium">
                  {{ formatToCurrency(charge.amount || 0) }}
                </div>
              </div>

              <v-divider class="my-3" />

              <div class="flex justify-between items-center mb-3">
                <div class="text-lg font-bold">Total: {{ formatToCurrency(editTotal) }}</div>
              </div>

              <v-alert v-if="hasAmountExceeded" density="compact" type="error" variant="outlined" class="mb-2">
                One or more amounts exceed the maximum available.
              </v-alert>

              <div v-if="hasPayments">
                <v-alert icon="mdi-alert" color="amber" density="compact">
                  This credit note has payments, it can't be edited.
                </v-alert>
              </div>
              <div v-if="!hasPayments" class="mb-4">
                <v-alert icon="mdi-check" color="green-darken-4" density="compact">
                  This credit note has no payments, it can be edited.
                </v-alert>
              </div>
              <div v-if="!hasPayments" class="flex justify-end">
                <v-btn color="primary" :disabled="hasAmountExceeded || editTotal <= 0" @click="updateCreditNote">
                  Update credit note
                </v-btn>
              </div>
            </div>

            <v-card v-if="consigneeCreditNote?.type === 'customer'" class="mb-4">
              <v-card-title>
                <div class="flex justify-between">
                  <div class="flex items-center gap-2">
                    <v-icon size="x-small">mdi-receipt-text-outline</v-icon>
                    <div>Payments linked</div>
                  </div>
                  <div>
                    <v-btn icon size="x-small" @click="showPayments = !showPayments" color="blue-grey-darken-2">
                      <v-icon v-if="showPayments">mdi-eye-outline</v-icon>
                      <v-icon v-if="!showPayments">mdi-eye-closed</v-icon>
                    </v-btn>
                  </div>
                </div>
              </v-card-title>
              <v-card-text v-if="showPayments">
                <v-table density="compact" fixed-header>
                  <thead>
                    <tr>
                      <th class="w-10"></th>
                      <th class="font-bold!">Invoice #</th>
                      <th class="font-bold!">Concept</th>
                      <th class="font-bold!">Amount</th>
                      <th class="font-bold!">Paid</th>
                      <th class="font-bold!">Pending</th>
                      <th class="font-bold!">Status</th>
                      <th class="font-bold!">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(payment, index) in consigneeCreditNote.payments_all"
                      :key="`pay-${index}`"
                      :id="`payment-${payment.id}`"
                      :class="{
                        'dark:hover:bg-gray-700! hover:bg-slate-300!': true,
                        'bg-red-100! dark:bg-red-900!': payment.deleted_at,
                      }"
                    >
                      <td>
                        <TrashButton
                          :item="payment"
                          :can-restore="false"
                          @click="confirmDeleteCreditNotePayment(payment)"
                        />
                      </td>
                      <td>
                        <v-chip color="blue" text-color="white" size="small" @click="viewInvoice(payment)">
                          <v-icon>mdi-eye-outline</v-icon>{{ getInvoiceableType(payment) }} Invoice #{{
                            payment.chargeable?.invoice?.invoice_number
                          }}
                        </v-chip>
                      </td>
                      <td>{{ payment.chargeable?.charge?.name }}</td>
                      <td>{{ formatToCurrency(payment.chargeable?.amount + payment.chargeable?.amount_iva) }}</td>
                      <td>{{ formatToCurrency(payment.amount) }}</td>
                      <td>{{ formatToCurrency(payment.chargeable?.pending_balance) }}</td>
                      <td>
                        <v-chip
                          v-if="!payment.deleted_at"
                          :color="payment.chargeable?.pending_balance > 0 ? 'red' : 'green'"
                          text-color="white"
                          size="small"
                          class="capitalize"
                        >
                          {{ payment.chargeable?.pending_balance > 0 ? 'Pending' : 'Paid' }}
                        </v-chip>
                      </td>
                      <td class="whitespace-nowrap">
                        <UserInfoBadge :item="payment">
                          {{ formatDateString(payment.created_at) }}
                        </UserInfoBadge>
                      </td>
                    </tr>
                  </tbody>
                </v-table>
              </v-card-text>
            </v-card>
          </v-card-text>
        </v-card>
      </div>
      <div>
        <!-- Party type: show party invoice info -->
        <template v-if="consigneeCreditNote?.type === 'party'">
          <v-card v-for="(pi, piIdx) in allPartyInvoices" :key="`edit-pi-${piIdx}`" class="mb-3">
            <v-card-title>
              <h4>Invoice #{{ pi.invoice?.invoice_number }}</h4>
            </v-card-title>
            <v-card-text>
              <p>Party: {{ pi.partyable?.name }}</p>
              <p>Type: {{ consigneeCreditNote.inv_type?.toUpperCase() }}</p>
              <p>Date: {{ formatDateString(pi.created_at) }}</p>
            </v-card-text>
          </v-card>
        </template>
        <!-- Customer type: show service invoice info -->
        <template v-else>
          <v-card v-for="(inv, invIdx) in linkedInvoices" :key="`edit-inv-${invIdx}`" class="mb-3">
            <v-card-title>
              <h4>{{ getInvoiceTypeLabel(inv) }}</h4>
            </v-card-title>
            <v-card-text>
              <p>Customer: {{ consigneeCreditNote.consignee?.name }}</p>
              <p>Linked services: {{ getInvoiceServices(inv) }}</p>
              <p>
                Amount: {{ getCurrencyName(inv.currency_id) }}
                {{ formatToCurrency(inv.total) }}
              </p>
              <p>Date: {{ formatDateString(inv.created_at) }}</p>
            </v-card-text>
          </v-card>
        </template>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { formatToCurrency } from '@/utils/formatters'
const { $api, $notifications } = useNuxtApp()
const confirm = $notifications.useConfirm()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()
const router = useRouter()

const props = defineProps({
  id: {
    type: [String, Number],
    required: true,
  },
})

const showPayments = ref(true)
const consigneeCreditNote = ref<any>(null)

// Editable copy of charges built from the loaded credit note
const editableCharges = ref<any[]>([])

const buildEditableCharges = () => {
  if (!consigneeCreditNote.value?.charges) return
  editableCharges.value = consigneeCreditNote.value.charges.map((ch: any) => ({
    id: ch.id,
    charge_id: ch.charge_id,
    charge_name: ch.charge?.name || `Concept #${ch.charge_id}`,
    invoice_number: ch.invoice_charge?.invoice?.invoice_number ?? '-',
    amount: parseFloat(ch.amount) || 0,
    cn_available_balance: ch.cn_available_balance ?? null,
  }))
}

const hasPayments = computed(() => {
  if (!consigneeCreditNote.value?.payments) return false
  return consigneeCreditNote.value.payments.length > 0
})

const editTotal = computed(() => {
  return editableCharges.value.reduce((sum: number, c: any) => sum + (parseFloat(c.amount) || 0), 0)
})

const hasAmountExceeded = computed(() => {
  return editableCharges.value.some((c: any) => {
    if (c.cn_available_balance === null) return false
    return parseFloat(c.amount) > c.cn_available_balance
  })
})

const validateChargeAmount = (idx: number) => {
  const charge = editableCharges.value[idx]
  if (charge.amount < 0) charge.amount = 0
  if (charge.cn_available_balance !== null && parseFloat(charge.amount) > charge.cn_available_balance) {
    snackbar.add({ type: 'warning', text: `"${charge.charge_name}" exceeds max available (${charge.cn_available_balance})` })
  }
}

// Linked invoices - M2M invoices array
const linkedInvoices = computed(() => {
  if (consigneeCreditNote.value?.invoices?.length > 0) return consigneeCreditNote.value.invoices
  if (consigneeCreditNote.value?.invoice) return [consigneeCreditNote.value.invoice]
  return []
})

// All party invoices - M2M party_invoices array
const allPartyInvoices = computed(() => {
  const invoices = []
  if (consigneeCreditNote.value?.party_invoice) invoices.push(consigneeCreditNote.value.party_invoice)
  if (consigneeCreditNote.value?.party_invoices?.length > 0) invoices.push(...consigneeCreditNote.value.party_invoices)
  // Remove duplicates by invoice_id
  const seen = new Set()
  return invoices.filter(pi => {
    if (!pi?.invoice?.id) return false
    if (seen.has(pi.invoice.id)) return false
    seen.add(pi.invoice.id)
    return true
  })
})

const getInvoiceTypeLabel = (inv: any) => {
  if (!inv?.invoiceable_type) return `Invoice #${inv?.invoice_number ?? inv?.id}`
  if (inv.invoiceable_type.includes('InvoiceSeaTm')) return `TM Sea Invoice #${inv.invoice_number}`
  if (inv.invoiceable_type.includes('InvoiceSeaWm')) return `WM Sea Invoice #${inv.invoice_number}`
  if (inv.invoiceable_type.includes('InvoiceAirTm')) return `TM Air Invoice #${inv.invoice_number}`
  if (inv.invoiceable_type.includes('InvoiceAirWm')) return `WM Air Invoice #${inv.invoice_number}`
  return `Invoice #${inv.invoice_number}`
}

const getInvoiceServices = (inv: any) => {
  if (!inv?.invoiceable) return '-'
  if (inv.invoiceable.class_name?.includes('Air'))
    return (inv.invoiceable.services || []).map((s: any) => s.air_reference?.reference_number).join(', ') || '-'
  if (inv.invoiceable.class_name?.includes('Sea'))
    return (inv.invoiceable.services || []).map((s: any) => s.referencia?.reference_number).join(', ') || '-'
  return '-'
}

// Backward compat: used when invoices[] is empty
const getInvoiceType = computed(() => {
  const inv = consigneeCreditNote.value?.invoice
  if (!inv) return ''
  if (inv.invoiceable_type?.includes('InvoiceSeaTm')) return `TM Sea Invoice #${inv.invoiceable_id}`
  if (inv.invoiceable_type?.includes('InvoiceSeaWm')) return `WM Sea Invoice #${inv.invoiceable_id}`
  if (inv.invoiceable_type?.includes('InvoiceAirTm')) return `TM Air Invoice #${inv.invoiceable_id}`
  if (inv.invoiceable_type?.includes('InvoiceAirWm')) return `WM Air Invoice #${inv.invoiceable_id}`
  return ''
})

const getInvoiceableType = (payment: any) => {
  const t = payment.chargeable?.invoice?.invoiceable_type
  if (!t) return 'Unknown'
  if (t.includes('InvoiceSeaTm')) return 'Sea TM'
  if (t.includes('InvoiceSeaWm')) return 'Sea WM'
  if (t.includes('InvoiceAirTm')) return 'Air TM'
  if (t.includes('InvoiceAirWm')) return 'Air WM'
  return 'Unknown'
}

const viewInvoice = (payment: any) => {
  const t = payment.chargeable?.invoice?.invoiceable_type
  if (t?.includes('InvoiceSeaTm')) { router.push(`/invoices/search/tm-view-${payment.chargeable?.invoice?.invoiceable_id}`); return }
  if (t?.includes('InvoiceSeaWm')) { router.push(`/invoices/search/wm-view-${payment.chargeable?.invoice?.invoiceable_id}`); return }
  snackbar.add({ type: 'error', text: 'Unknown invoice type' })
}

const confirmDeleteCreditNotePayment = async (creditNotePayment: any) => {
  const result = await confirm({
    title: 'Are you sure?',
    confirmationText: 'Yes, delete',
    content: 'Please confirm this action.',
    dialogProps: { persistent: true, maxWidth: 500 },
    confirmationButtonProps: { color: 'primary' },
  })
  if (result) {
    try {
      loadingStore.start()
      await $api.consigneeCreditNotes.deletePayment(consigneeCreditNote.value.id, creditNotePayment)
      await getCustomerCreditNote()
    } catch (e) {
      console.error(e)
    } finally {
      setTimeout(() => loadingStore.stop(), 250)
    }
  }
}

const updateCreditNote = async () => {
  try {
    if (!consigneeCreditNote.value.description) {
      snackbar.add({ type: 'warning', text: 'Comments are required' })
      return
    }
    if (editTotal.value <= 0) {
      snackbar.add({ type: 'warning', text: 'Total must be greater than 0' })
      return
    }
    if (hasAmountExceeded.value) {
      snackbar.add({ type: 'error', text: 'One or more amounts exceed the maximum available' })
      return
    }
    loadingStore.loading = true
    const body = {
      external_folio: consigneeCreditNote.value.external_folio,
      description: consigneeCreditNote.value.description,
      charges: editableCharges.value.map((c: any) => ({ id: c.id, amount: parseFloat(c.amount) })),
    }
    await $api.consigneeCreditNotes.updateNote(consigneeCreditNote.value.id, body)
    snackbar.add({ type: 'success', text: 'Credit note updated' })
    router.push('/invoices/search/credit-notes')
  } catch (e: any) {
    console.error(e)
    if (e?.data?.message) snackbar.add({ type: 'error', text: e.data.message })
  } finally {
    setTimeout(() => loadingStore.stop(), 250)
  }
}

const getCustomerCreditNote = async () => {
  try {
    loadingStore.loading = true
    const response = await $api.consigneeCreditNotes.getCreditNoteById(props.id.toString())
    consigneeCreditNote.value = response
    buildEditableCharges()
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => loadingStore.stop(), 250)
  }
}

await getCustomerCreditNote()
</script>
