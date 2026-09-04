<template>
  <div>
    <div v-if="!lastCalc">
      <div class="text-base font-bold">No calculation yet</div>
    </div>
    <v-card v-if="lastCalc" variant="tonal" color="blue-grey" class="pa-2">
      <div class="text-caption font-bold text-uppercase mb-1 opacity-70">Last calculation</div>
      <v-table density="compact" class="bg-transparent">
        <thead>
          <tr>
            <th>Start date</th>
            <th>End date</th>
            <th>Free days</th>
            <th class="text-right">Subtotal</th>
            <th class="text-right">IVA</th>
            <th class="text-right">Total calculated</th>
            <th class="text-center">Paid</th>
            <th>Invoice</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{{ formatDateOnlyString(lastCalc.start_date) }}</td>
            <td>{{ formatDateOnlyString(lastCalc.end_date) }}</td>
            <td>{{ lastCalc.free_days }}</td>
            <td class="text-right">
              <div class="flex flex-col items-end gap-0">
                {{ formatToCurrency(lastCalc.amount) }}
                <v-chip v-if="lastCalc.discount > 0" color="red" class="text-xs" size="small" variant="outlined">
                  <v-icon>mdi-sale-outline</v-icon>-{{ formatToCurrency(lastCalc.discount) }}
                </v-chip>
              </div>
            </td>
            <td class="text-right">{{ formatToCurrency(lastCalc.amount_iva) }}</td>
            <td class="text-right font-bold">
              {{ formatToCurrency(parseFloat(lastCalc.amount) + parseFloat(lastCalc.amount_iva)) }}
            </td>
            <td class="text-center">
              <v-chip v-if="containerInvoices.length" :color="isPaid ? 'success' : 'warning'" size="small">
                {{ isPaid ? 'Paid' : 'Pending' }}
              </v-chip>
              <span v-else class="text-caption opacity-60">—</span>
            </td>
            <td>
              <div v-if="containerInvoices.length" class="flex flex-col gap-1">
                <v-btn
                  v-for="invoice in containerInvoices"
                  :key="`cont-invoice-${invoice.id}`"
                  size="x-small"
                  variant="tonal"
                  color="blue-lighten-2"
                  @click="viewInvoice(invoice)"
                >
                  <v-icon size="small" class="mr-1">mdi-open-in-new</v-icon>
                  {{ invoice.invoice_number }}
                </v-btn>
              </div>
              <span v-else class="text-caption opacity-60">—</span>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>
  </div>
</template>
<script setup lang="ts">
const router = useRouter()

const props = defineProps({
  container: {
    type: Object as PropType<any>,
    required: true,
  },
})

const lastCalc = computed(() => {
  // return first calculation
  return props.container.demurrage?.calculations?.[0] || null
  // return props.container.demurrage?.calculations?.[props.container.demurrage?.calculations?.length - 1] || null
})

const containerInvoices = computed(() => {
  return props.container?.demurrage_invoices || []
})

const isPaid = computed(() => {
  return containerInvoices.value.length > 0 && containerInvoices.value.every((invoice: any) => invoice.is_paid)
})

const isInvoiceTm = (invoice: any) => {
  return invoice.invoiceable_type?.includes('InvoiceSeaTm') ?? false
}

const viewInvoice = (invoice: any) => {
  router.push(`/invoices/search/${isInvoiceTm(invoice) ? 'tm' : 'wm'}-view-${invoice.invoiceable_id}`)
}
</script>
