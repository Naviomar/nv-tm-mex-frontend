<template>
  <v-card v-if="canView" color="light-blue-lighten-4" class="mb-4">
    <v-card-title><div class="font-bold">{{ title }}</div></v-card-title>
    <v-card-text>
      <div class="font-bold">Payment requests</div>
      <v-table density="compact">
        <thead>
          <tr>
            <th class="text-left">Payment</th>
            <th class="text-left">Request</th>
            <th class="text-left">Invoice folio</th>
            <th class="text-left">Line</th>
            <th class="text-left">Amount</th>
            <th class="text-left">Invoice date</th>
            <th class="text-left">Containers</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="data.requests.length === 0 && data.pre_assigned.length === 0">
            <td colspan="7" class="p-2 text-grey">No payment requests</td>
          </tr>
          <tr v-for="inv in data.pre_assigned" :key="`pre-${inv.supplier_cfdi_id}`">
            <td class="p-2">
              <div class="flex flex-col items-center">
                <v-chip color="indigo" size="small">Invoice registered – pending request</v-chip>
              </div>
            </td>
            <td class="p-2 text-grey">-</td>
            <td class="p-2">
              <div class="cursor-pointer hover:underline" @click="goToSupplierCfdi(inv)">{{ inv.serie_folio }}</div>
            </td>
            <td class="p-2">{{ inv.supplier }}</td>
            <td class="p-2 whitespace-nowrap">
              <div>{{ formatToCurrency(inv.amount) }} {{ getCurrencyName(inv.currency_id) }}</div>
              <div class="text-xs text-grey">
                Invoice total: {{ formatToCurrency(inv.amount_cfdi) }} {{ getCurrencyName(inv.currency_id) }}
              </div>
            </td>
            <td class="p-2">{{ formatDateOnlyString(inv.invoice_date) }}</td>
            <td class="p-2">
              <v-btn size="small" color="secondary" variant="outlined" @click="openPreAssignedDialog(inv)">
                <v-icon start>mdi-format-list-bulleted</v-icon>
                View containers
              </v-btn>
            </td>
          </tr>
          <tr v-for="req in data.requests" :key="`req-${req.id}`">
            <td class="p-2">
              <div class="flex flex-col items-center">
                <v-chip v-if="req.is_paid" color="success" size="small">
                  Paid @ {{ formatDateString(req.paid_at) }}
                </v-chip>
                <v-chip v-else-if="req.payment_notified" color="warning" size="small">Pending payment</v-chip>
                <v-chip v-else color="orange" size="small">Requested</v-chip>
                <div class="text-xs">@ Requested at {{ formatDateOnlyString(req.created_at) }}</div>
              </div>
            </td>
            <td class="p-2">
              <div class="cursor-pointer hover:underline" @click="goToRequest(req)">
                {{ req.folio || `#${req.id}` }}
              </div>
            </td>
            <td class="p-2">
              <div v-for="inv in req.invoices" :key="`inv-${inv.id}`">
                {{ inv.serie_folio }}
                <v-chip v-if="inv.tipo_comprobante === 'E'" size="x-small" color="red" variant="outlined">
                  Credit note
                </v-chip>
              </div>
              <v-chip v-if="req.invoices.length === 0" color="warning" size="small">Invoice pending</v-chip>
            </td>
            <td class="p-2">{{ req.line }}</td>
            <td class="p-2 whitespace-nowrap">
              <div>{{ formatToCurrency(req.amount) }} {{ getCurrencyName(req.currency_id) }}</div>
              <div v-for="inv in req.invoices" :key="`inv-amt-${inv.id}`" class="text-xs text-grey">
                Invoice total {{ inv.serie_folio }}: {{ formatToCurrency(inv.amount_cfdi) }}
                {{ getCurrencyName(inv.currency_id) }}
              </div>
            </td>
            <td class="p-2">
              <div v-for="inv in req.invoices" :key="`inv-date-${inv.id}`">
                {{ formatDateOnlyString(inv.invoice_date) }}
              </div>
            </td>
            <td class="p-2">
              <v-btn size="small" color="secondary" variant="outlined" @click="openContainersDialog(req)">
                <v-icon start>mdi-format-list-bulleted</v-icon>
                View containers
              </v-btn>
            </td>
          </tr>
        </tbody>
      </v-table>

      <template v-if="data.pending.length > 0">
        <div class="font-bold mt-4">Pending to request</div>
        <v-table density="compact">
          <thead>
            <tr>
              <th class="text-left">Status</th>
              <th class="text-left">Container</th>
              <th class="text-left">Line amount</th>
              <th class="text-left">Requested</th>
              <th class="text-left">Pending</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(p, index) in data.pending" :key="`pending-${index}`">
              <td class="p-2"><v-chip color="grey" size="small">Pending request</v-chip></td>
              <td class="p-2">{{ p.container_number }}</td>
              <td class="p-2">{{ formatToCurrency(p.total) }} {{ getCurrencyName(p.currency_id) }}</td>
              <td class="p-2">{{ formatToCurrency(p.requested) }} {{ getCurrencyName(p.currency_id) }}</td>
              <td class="p-2 font-bold">{{ formatToCurrency(p.pending) }} {{ getCurrencyName(p.currency_id) }}</td>
            </tr>
          </tbody>
        </v-table>
      </template>

      <v-dialog v-model="containersDialog" max-width="800px">
        <v-card v-if="selectedRequest">
          <v-card-title class="text-h6">
            Containers - Request {{ selectedRequest.folio || `#${selectedRequest.id}` }} ({{ selectedRequest.line }})
          </v-card-title>
          <v-card-text>
            <v-table density="compact">
              <thead>
                <tr>
                  <th class="text-left">Container</th>
                  <th class="text-left">Line amount</th>
                  <th class="text-left">Customer amount</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(c, index) in selectedRequest.containers" :key="`c-${index}`">
                  <td class="p-2">{{ c.container_number }}</td>
                  <td class="p-2">
                    {{ formatToCurrency(Number(c.amount) + Number(c.amount_iva)) }} {{ getCurrencyName(c.currency_id) }}
                  </td>
                  <td class="p-2">
                    <template v-if="c.sell_amount != null">
                      {{ formatToCurrency(Number(c.sell_amount) + Number(c.sell_amount_iva)) }}
                      {{ getCurrencyName(c.currency_id) }}
                    </template>
                    <template v-else>-</template>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>
          <v-card-actions>
            <v-btn @click="containersDialog = false">Close</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
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
const containersDialog = ref(false)
const selectedRequest = ref<any>(null)

const openContainersDialog = (req: any) => {
  selectedRequest.value = req
  containersDialog.value = true
}

const openPreAssignedDialog = (inv: any) => {
  selectedRequest.value = {
    folio: `Invoice ${inv.serie_folio}`,
    line: inv.supplier,
    containers: inv.containers.map((c: any) => ({ ...c, amount_iva: 0, sell_amount: null })),
  }
  containersDialog.value = true
}

const goToSupplierCfdi = (inv: any) => {
  router.push(`/invoices/suppliers/cfdis/view-${inv.supplier_cfdi_id}`)
}

const goToRequest = (req: any) => {
  const section = isDetention.value ? 'detentions' : 'demurrages'
  router.push(`/invoices/search/lines/${section}/req-pay-view-${req.id}`)
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
