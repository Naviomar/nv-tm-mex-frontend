<template>
  <div>
    <div class="flex items-center justify-between">
      <div class="font-bold"><span class="text-xl">💰</span>Customer invoices</div>
      <v-btn icon size="x-small" variant="tonal" color="primary" @click="getSeaServiceCustomerInvoices">
        <v-icon>mdi-sync</v-icon>
      </v-btn>
    </div>

    <v-table density="compact">
      <thead>
        <tr>
          <th class="text-left">Pay status</th>
          <th class="text-left">Invoice #</th>
          <th class="text-left">Credit notes</th>
          <th class="text-left">Customer</th>
          <th class="text-left">Amount</th>
          <th class="text-left">Invoice date</th>
        </tr>
      </thead>
      <tbody>
        <template v-for="(seaInvoice, key) in customerSeaInfo.invoices" :key="key">
          <tr :class="{ 'bg-red-50/50 dark:bg-red-900/20': seaInvoice.deleted_at != null }">
          <td class="p-2">
            <div class="flex flex-col items-center gap-1 mb-2">
              <v-chip v-if="seaInvoice.deleted_at != null" color="red" size="small"> Cancelada </v-chip>
              <v-chip v-else-if="seaInvoice.invoice?.is_paid === 0" color="warning" size="small"> Pending </v-chip>
              <v-chip v-else color="success" size="small"> Paid </v-chip>

              <InvoiceChargePaymentsView size="x-small" :invoice="seaInvoice.invoice" />
            </div>
          </td>
          <td class="p-2">
            <div class="flex flex-col items-center gap-0 mb-2">
              {{ seaInvoice.invoice.invoice_number }} <br />
              <div v-if="isInvoiceTm(seaInvoice.invoice)">
                <PreviewTmInvoice service="sea" :invoice="seaInvoice" size="small" />
              </div>
              <div v-if="isInvoiceWm(seaInvoice.invoice)">
                <PreviewWmInvoice service="sea" :invoice="seaInvoice" size="small" />
              </div>
            </div>
          </td>
          <td class="p-2">
            <div v-if="seaInvoice.credit_notes.length <= 0">
              <v-chip color="grey-lighten-3" size="x-small" variant="flat">None</v-chip>
            </div>
            <div v-else class="flex flex-wrap gap-1">
              <v-btn
                v-for="(creditNote, cnIdx) in seaInvoice.credit_notes"
                :key="`cn-chip-${cnIdx}`"
                color="error"
                size="x-small"
                variant="flat"
                class="rounded-pill px-2"
                @click="toggleExpand(key)"
              >
                <v-icon start size="12">mdi-chevron-down</v-icon>
                CN #{{ creditNote.id }}
              </v-btn>
            </div>
          </td>
          <td class="p-2">{{ seaInvoice.consignee_name }}</td>
          <td class="p-2">
            <div class="flex flex-col items-end gap-1 mb-2">
              {{ formatToCurrency(getTotalInvoice(seaInvoice.invoice)) }}
              {{ getCurrencyName(seaInvoice.invoice.currency_id) }}
              <UserInfoBadge :item="seaInvoice.invoice" />
            </div>
          </td>
          <td class="p-2">
            <UserInfoBadge :item="seaInvoice">
              {{ formatDateOnlyString(seaInvoice.created_at) }}
            </UserInfoBadge>
          </td>
        </tr>
        <!-- Expanded Row for Credit Note Details -->
        <tr v-if="expandedRows.includes(key)" :key="`expanded-${key}`">
          <td colspan="6" class="bg-gray-50 dark:bg-gray-900 px-8 py-4">
            <div class="mb-2 font-bold text-xs">
              <v-icon size="small" class="mr-1">mdi-credit-card-outline</v-icon>
              Credit Note Details
            </div>
            <v-table density="compact" class="border rounded">
              <thead>
                <tr>
                  <th class="text-left text-[10px]">Folio</th>
                  <th class="text-left text-[10px]">Ext. Folio</th>
                  <th class="text-left text-[10px]">Customer</th>
                  <th class="text-left text-[10px]">Amount</th>
                  <th class="text-left text-[10px]">Date</th>
                  <th class="text-center text-[10px]">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(cn, cnKey) in seaInvoice.credit_notes" :key="`cn-table-${cnKey}`">
                  <td class="text-xs font-bold">#{{ cn.id }}</td>
                  <td class="text-xs">{{ cn.external_folio || '-' }}</td>
                  <td class="text-xs">{{ cn.consignee?.name || seaInvoice.consignee_name }}</td>
                  <td class="text-xs">
                    {{ formatToCurrency(cn.amount) }}
                  </td>
                  <td class="text-xs">
                    {{ formatDateOnlyString(cn.created_at) }}
                  </td>
                  <td class="text-center">
                    <div class="flex items-center justify-center gap-4">
                      <UserInfoBadge :item="cn" />
                      <PreviewCustomerCreditNote :id="cn.id" size="small" />
                    </div>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </td>
        </tr>
      </template>
      </tbody>
    </v-table>

    <div class="flex items-center justify-between">
      <div class="font-bold"><span class="text-xl">🤑</span>Customer payments</div>
      <v-btn icon size="x-small" variant="tonal" color="primary" @click="getSeaServiceCustomerInvoices">
        <v-icon>mdi-sync</v-icon>
      </v-btn>
    </div>

    <v-table density="compact">
      <thead>
        <tr>
          <th class="text-left">Payment</th>
          <th class="text-left">Amount</th>
          <th class="text-left w-64">Created at</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(servicePayment, key) in customerSeaInfo.service_payments" :key="`serv-pay-${key}`">
          <td class="p-2">{{ servicePayment.charge?.name }}</td>
          <td class="p-2">
            {{ formatToCurrency(servicePayment.amount) }} {{ getCurrencyName(servicePayment.currency_id) }}
          </td>
          <td class="p-2">
            <UserInfoBadge :item="servicePayment">
              {{ formatDateString(servicePayment.created_at) }}
            </UserInfoBadge>
          </td>
        </tr>
      </tbody>
    </v-table>
  </div>
</template>
<script setup lang="ts">
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()

const props = defineProps({
  referenceId: {
    type: [String, Number],
    required: true,
  },
})

const customerSeaInfo = ref<any>({
  invoices: [],
  service_payments: [],
})

const expandedRows = ref<number[]>([])

const toggleExpand = (key: number) => {
  if (expandedRows.value.includes(key)) {
    expandedRows.value = expandedRows.value.filter((i) => i !== key)
  } else {
    expandedRows.value.push(key)
  }
}

const isInvoiceTm = (invoice: any) => {
  return invoice.invoiceable_type.includes('InvoiceSeaTm')
}

const isInvoiceWm = (invoice: any) => {
  return invoice.invoiceable_type.includes('InvoiceSeaWm')
}

const getTotalInvoice = (invoice: any) => {
  if (invoice.deleted_at !== null) {
    return (invoice.charges_cancelled || []).reduce((acc: number, curr: any) => {
      return acc + (parseFloat(curr.amount) + parseFloat(curr.amount_iva))
    }, 0)
  }
  return invoice.charges.reduce((acc: number, curr: any) => {
    return acc + (parseFloat(curr.amount) + parseFloat(curr.amount_iva))
  }, 0)
}

const getSeaServiceCustomerInvoices = async () => {
  try {
    loadingStore.start()
    const response = await $api.referencias.getSeaServiceCustomerInvoices(props.referenceId.toString())
    customerSeaInfo.value = response
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

onMounted(async () => {
  await getSeaServiceCustomerInvoices()
})
</script>
