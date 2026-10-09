<template>
  <v-card v-if="canView" color="light-blue-lighten-4" class="mb-4">
    <v-card-title><div class="font-bold">{{ title }}</div></v-card-title>
    <v-card-text>
      <v-table density="compact">
        <thead>
          <tr>
            <th class="text-left">Status</th>
            <th class="text-left">Request</th>
            <th class="text-left">Invoice folio</th>
            <th class="text-left">Line</th>
            <th class="text-left">Amount</th>
            <th class="text-left">Invoice date</th>
            <th class="text-left">Containers</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="invoices.length === 0">
            <td colspan="7" class="p-2 text-grey">No line invoices linked to this reference</td>
          </tr>
          <tr v-for="inv in invoices" :key="inv.key">
            <td class="p-2">
              <div class="flex flex-col items-start">
                <v-chip v-if="inv.is_paid" color="success" size="small">Paid @ {{ formatDateString(inv.paid_at) }}</v-chip>
                <v-chip v-else-if="inv.payment_notified" color="warning" size="small">Pending payment</v-chip>
                <v-chip v-else-if="inv.requested" color="orange" size="small">Requested</v-chip>
                <v-chip v-else color="indigo" size="small">Registered</v-chip>
              </div>
            </td>
            <td class="p-2">
              <div v-if="inv.request_id" class="cursor-pointer hover:underline" @click="goToRequest(inv.request_id)">
                {{ inv.request_folio || `#${inv.request_id}` }}
              </div>
              <span v-else class="text-grey">-</span>
              <div v-if="inv.requested_at" class="text-xs text-grey">
                Requested {{ formatDateOnlyString(inv.requested_at) }}
              </div>
            </td>
            <td class="p-2">
              <div class="cursor-pointer hover:underline" @click="goToSupplierCfdi(inv.supplier_cfdi_id)">
                {{ inv.serie_folio }}
              </div>
              <v-chip v-if="inv.tipo_comprobante === 'E'" size="x-small" color="red" variant="outlined">
                Credit note
              </v-chip>
            </td>
            <td class="p-2">{{ inv.line }}</td>
            <td class="p-2 whitespace-nowrap">
              <div>{{ formatToCurrency(inv.amount) }} {{ getCurrencyName(inv.currency_id) }}</div>
              <div class="text-xs text-grey">
                Invoice total: {{ formatToCurrency(inv.amount_cfdi) }} {{ getCurrencyName(inv.currency_id) }}
              </div>
            </td>
            <td class="p-2">{{ formatDateOnlyString(inv.invoice_date) }}</td>
            <td class="p-2">
              <div v-for="(c, index) in inv.containers" :key="`c-${inv.key}-${index}`">{{ c }}</div>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card-text>
  </v-card>
</template>
<script setup lang="ts">
import { permissions } from '@/utils/data/system'
import { useCheckUser } from '@/composables/useCheckUser'

const { $api } = useNuxtApp()
const router = useRouter()
const { hasPermission } = useCheckUser()
const canView = computed(() => hasPermission(permissions.LineDemDetPaymentsView))

const props = defineProps({
  referenceId: {
    type: [String, Number],
    required: true,
  },
  type: {
    type: String as PropType<'demurrages' | 'detentions'>,
    required: true,
  },
})

const isDetention = computed(() => props.type === 'detentions')
const title = computed(() => (isDetention.value ? 'Line detentions & payments' : 'Line demurrages & payments'))

const data = ref<any>({ requests: [], pre_assigned: [], pending: [] })

// Solo las facturas de la naviera ligadas a esta referencia (con o sin solicitud de pago)
const invoices = computed(() => {
  const registered = (data.value.pre_assigned || []).map((inv: any) => ({
    key: `pre-${inv.supplier_cfdi_id}`,
    supplier_cfdi_id: inv.supplier_cfdi_id,
    serie_folio: inv.serie_folio,
    line: inv.supplier,
    amount: inv.amount,
    amount_cfdi: inv.amount_cfdi,
    currency_id: inv.currency_id,
    invoice_date: inv.invoice_date,
    requested: false,
    payment_notified: false,
    is_paid: false,
    containers: (inv.containers || []).map((c: any) => c.container_number),
  }))

  const requested = (data.value.requests || []).flatMap((req: any) =>
    (req.invoices || []).map((inv: any) => ({
      key: `req-${req.id}-${inv.id}`,
      supplier_cfdi_id: inv.id,
      serie_folio: inv.serie_folio,
      tipo_comprobante: inv.tipo_comprobante,
      line: req.line,
      request_id: req.id,
      request_folio: req.folio,
      requested_at: req.created_at,
      amount: inv.amount,
      amount_cfdi: inv.amount_cfdi,
      currency_id: inv.currency_id,
      invoice_date: inv.invoice_date,
      requested: true,
      payment_notified: req.payment_notified,
      is_paid: req.is_paid,
      paid_at: req.paid_at,
      containers: inv.containers || [],
    })),
  )

  return [...registered, ...requested]
})

const goToSupplierCfdi = (id: number) => {
  router.push(`/invoices/suppliers/cfdis/view-${id}`)
}

const goToRequest = (id: number) => {
  const section = isDetention.value ? 'detentions' : 'demurrages'
  router.push(`/invoices/search/lines/${section}/req-pay-view-${id}`)
}

const getData = async () => {
  try {
    const id = props.referenceId.toString()
    const response = isDetention.value
      ? await $api.referencias.getSeaServiceLineDetentionPayments(id)
      : await $api.referencias.getSeaServiceLineDemurragePayments(id)
    data.value = response
  } catch (e) {
    console.error(e)
  }
}

onMounted(() => {
  if (canView.value) getData()
})
</script>
