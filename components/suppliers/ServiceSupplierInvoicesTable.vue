<template>
  <div>
    <div class="font-bold mb-1">Supplier invoices</div>
    <v-table density="compact">
      <thead>
        <tr>
          <th class="text-left">Payment</th>
          <th class="text-left">Request</th>
          <th class="text-left">Serie-Folio</th>
          <th class="text-left">Supplier</th>
          <th class="text-left">Amount</th>
          <th class="text-left">Invoice date</th>
          <th class="text-left">Charges</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="!invoiceCfdis.length">
          <td colspan="7" class="p-2 text-grey">No supplier invoices</td>
        </tr>
        <tr v-for="cfdi in invoiceCfdis" :key="`cfdi-${cfdi.id}`">
          <td class="p-2">
            <SupplierPaymentStatusChip :status="paymentStatus(cfdi)" :paid-at="paidAt(cfdi)" :requested-at="requestedAt(cfdi)" />
          </td>
          <td class="p-2">
            <div class="flex flex-wrap gap-1">
              <v-chip
                v-for="req in requests(cfdi)"
                :key="`req-${cfdi.id}-${req.id}`"
                size="small"
                color="primary"
                variant="outlined"
                prepend-icon="mdi-open-in-new"
                @click="goToRequest(req.id)"
              >
                {{ req.folio || `#${req.id}` }}
              </v-chip>
              <span v-if="requests(cfdi).length === 0" class="text-grey">-</span>
            </div>
          </td>
          <td class="p-2">
            <div class="cursor-pointer hover:underline font-medium" @click="goToCfdi(cfdi)">
              {{ serieFolio(cfdi) }}
            </div>
            <v-chip v-if="cfdi.tipo_comprobante === 'E'" size="x-small" color="red" variant="outlined">Credit note</v-chip>
          </td>
          <td class="p-2">{{ cfdi.supplier?.name }}</td>
          <td class="p-2 whitespace-nowrap">
            <v-tooltip location="top">
              <template #activator="{ props: tooltipProps }">
                <span v-bind="tooltipProps" class="cursor-help">
                  {{ formatToCurrency(sum(cfdi, 'amount_total')) }} {{ getCurrencyName(cfdi.currency_id) }}
                  <v-icon size="14" color="green">mdi-information-outline</v-icon>
                </span>
              </template>
              <div class="flex flex-col min-w-40">
                <div class="flex justify-between gap-4"><span>Amount:</span><span>{{ formatToCurrency(sum(cfdi, 'amount')) }}</span></div>
                <div class="flex justify-between gap-4"><span>IVA:</span><span>{{ formatToCurrency(sum(cfdi, 'amount_iva')) }}</span></div>
                <div class="flex justify-between gap-4"><span>ISR:</span><span>-{{ formatToCurrency(sum(cfdi, 'amount_ret_isr')) }}</span></div>
                <div class="flex justify-between gap-4"><span>IVA Ret:</span><span>-{{ formatToCurrency(sum(cfdi, 'amount_ret_iva')) }}</span></div>
              </div>
            </v-tooltip>
          </td>
          <td class="p-2">
            <div>{{ formatDateOnlyString(cfdi.invoice_date || cfdi.created_at) }}</div>
          </td>
          <td class="p-2">
            <v-btn size="small" color="secondary" variant="outlined" prepend-icon="mdi-format-list-bulleted" @click="openChargesDialog(cfdi)">
              View charges ({{ cfdi.invoices?.length || 0 }})
            </v-btn>
          </td>
        </tr>
      </tbody>
    </v-table>

    <v-dialog v-model="chargesDialog" max-width="1000px" scrollable>
      <v-card v-if="selectedCfdi" rounded="lg">
        <v-card-title class="flex items-center gap-2 bg-primary text-white py-3">
          <v-icon>mdi-receipt-text-outline</v-icon>
          <div class="flex-1 min-w-0">
            <div class="text-subtitle-1 font-bold">Charges · {{ serieFolio(selectedCfdi) }}</div>
            <div class="text-caption opacity-90">{{ selectedCfdi.supplier?.name }}</div>
          </div>
          <v-btn icon="mdi-close" variant="text" density="comfortable" @click="chargesDialog = false" />
        </v-card-title>
        <v-card-text class="pa-4">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div class="tile">
              <div class="tile__label">Payment</div>
              <SupplierPaymentStatusChip
                :status="paymentStatus(selectedCfdi)"
                :paid-at="paidAt(selectedCfdi)"
                :requested-at="requestedAt(selectedCfdi)"
              />
            </div>
            <div class="tile">
              <div class="tile__label">Request(s)</div>
              <div class="flex flex-wrap gap-1">
                <v-chip
                  v-for="req in requests(selectedCfdi)"
                  :key="`dlg-req-${req.id}`"
                  size="small"
                  color="primary"
                  variant="outlined"
                  @click="goToRequest(req.id)"
                >
                  {{ req.folio || `#${req.id}` }}
                </v-chip>
                <span v-if="requests(selectedCfdi).length === 0" class="text-grey">Not requested</span>
              </div>
            </div>
            <div class="tile">
              <div class="tile__label">Invoice date</div>
              <div class="font-medium">{{ formatDateOnlyString(selectedCfdi.invoice_date || selectedCfdi.created_at) }}</div>
            </div>
            <div class="tile">
              <div class="tile__label">Total for this reference</div>
              <div class="font-bold">
                {{ formatToCurrency(sum(selectedCfdi, 'amount_total')) }} {{ getCurrencyName(selectedCfdi.currency_id) }}
              </div>
            </div>
          </div>

          <v-table density="compact" class="rounded tm-border">
            <thead>
              <tr>
                <th class="text-left">Charge</th>
                <th class="text-right">Amount</th>
                <th class="text-left">Taxes</th>
                <th class="text-right">Total</th>
                <th class="text-left">Request</th>
                <th class="text-left">Linked to</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="invoice in selectedCfdi.invoices" :key="invoice.id">
                <td class="p-2">
                  <div class="font-medium">{{ invoice.charge?.name || invoice.chargeable?.name || `Charge #${invoice.charge_id}` }}</div>
                  <div v-if="invoice.notes" class="text-xs italic text-grey">{{ invoice.notes }}</div>
                </td>
                <td class="p-2 text-right whitespace-nowrap">{{ formatToCurrency(invoice.amount) }} {{ getCurrencyName(invoice.currency_id) }}</td>
                <td class="p-2">
                  <div class="flex flex-wrap gap-1">
                    <v-chip v-if="Number(invoice.amount_iva)" size="x-small" color="green" variant="tonal">+IVA {{ formatToCurrency(invoice.amount_iva) }}</v-chip>
                    <v-chip v-if="Number(invoice.amount_ret_iva)" size="x-small" color="red" variant="tonal">-Ret IVA {{ formatToCurrency(invoice.amount_ret_iva) }}</v-chip>
                    <v-chip v-if="Number(invoice.amount_ret_isr)" size="x-small" color="red" variant="tonal">-Ret ISR {{ formatToCurrency(invoice.amount_ret_isr) }}</v-chip>
                    <span v-if="!Number(invoice.amount_iva) && !Number(invoice.amount_ret_iva) && !Number(invoice.amount_ret_isr)" class="text-xs text-grey">-</span>
                  </div>
                </td>
                <td class="p-2 text-right font-bold whitespace-nowrap">{{ formatToCurrency(invoice.amount_total) }}</td>
                <td class="p-2">
                  <v-chip
                    v-if="invoice.req_pay_invoice?.supplier_req_pay"
                    size="x-small"
                    color="primary"
                    variant="outlined"
                    @click="goToRequest(invoice.req_pay_invoice.supplier_req_pay_id)"
                  >
                    {{ invoice.req_pay_invoice.supplier_req_pay.folio || `#${invoice.req_pay_invoice.supplier_req_pay_id}` }}
                  </v-chip>
                  <span v-else class="text-xs text-grey">Pending request</span>
                </td>
                <td class="p-2">
                  <div class="flex flex-wrap gap-1 items-center">
                    <template v-for="link in invoice.links || []" :key="`link-${link.id}`">
                      <SupplierInvoiceLinkChip :link="link" />
                      <span class="text-xs text-grey whitespace-nowrap">
                        {{ formatToCurrency(link.amount) }} {{ getCurrencyName(link.currency_id) }}
                      </span>
                    </template>
                    <v-chip v-if="!invoice.links?.length" color="warning" size="x-small" variant="tonal">Not linked to a captured charge</v-chip>
                  </div>
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="font-bold tm-row-muted">
                <td colspan="3" class="text-right p-2">Total</td>
                <td class="text-right p-2 whitespace-nowrap">
                  {{ formatToCurrency(sum(selectedCfdi, 'amount_total')) }} {{ getCurrencyName(selectedCfdi.currency_id) }}
                </td>
                <td colspan="2"></td>
              </tr>
            </tfoot>
          </v-table>
        </v-card-text>
        <v-divider />
        <v-card-actions class="px-4">
          <v-btn variant="text" prepend-icon="mdi-open-in-new" @click="goToCfdi(selectedCfdi)">Open CFDI</v-btn>
          <v-spacer />
          <v-btn variant="text" @click="chargesDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script setup lang="ts">
const router = useRouter()

defineProps({
  invoiceCfdis: { type: Array as PropType<any[]>, default: () => [] },
})

const chargesDialog = ref(false)
const selectedCfdi = ref<any>(null)

const openChargesDialog = (cfdi: any) => {
  selectedCfdi.value = cfdi
  chargesDialog.value = true
}

const serieFolio = (cfdi: any) => cfdi.serie_folio || [cfdi.serie, cfdi.folio].filter(Boolean).join('-') || `#${cfdi.id}`

const sum = (cfdi: any, field: string) =>
  (cfdi.invoices || []).reduce((acc: number, invoice: any) => acc + (parseFloat(invoice[field]) || 0), 0)

const requests = (cfdi: any) => {
  const byId = new Map<number, any>()
  ;(cfdi.invoices || []).forEach((invoice: any) => {
    const req = invoice.req_pay_invoice?.supplier_req_pay
    if (req) byId.set(req.id, req)
  })
  return [...byId.values()]
}

const paymentStatus = (cfdi: any) => {
  const invoices = cfdi.invoices || []
  const requested = invoices.filter((invoice: any) => invoice.req_pay_invoice)
  if (requested.length === 0) return 'pending_request'
  if (requested.length < invoices.length) return 'partially_requested'
  const reqs = requests(cfdi)
  if (reqs.length > 0 && reqs.every((req: any) => req.invoice?.is_paid === 1)) return 'paid'
  if (reqs.some((req: any) => req.invoice?.is_paid === 1 || parseFloat(req.invoice?.amount_paid) > 0)) return 'partially_paid'
  return 'requested'
}

const paidAt = (cfdi: any) => {
  const dates = requests(cfdi)
    .map((req: any) => req.invoice?.paid_at)
    .filter(Boolean)
    .sort()
  return dates.length ? dates[dates.length - 1] : null
}

const requestedAt = (cfdi: any) => (cfdi.invoices || []).find((invoice: any) => invoice.req_pay_invoice)?.req_pay_invoice?.created_at ?? null

const goToRequest = (id: number) => router.push(`/invoices/suppliers/cfdis/request-payment/view-${id}`)

const goToCfdi = (cfdi: any) => router.push(`/invoices/suppliers/cfdis/view-${cfdi.id}`)
</script>
<style scoped>
.tile {
  border-radius: 10px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  padding: 8px 12px;
}
.tile__label {
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: rgba(var(--v-theme-on-surface), 0.6);
  margin-bottom: 2px;
}
</style>
