<template>
  <div>
    <v-table density="compact" class="rounded tm-border">
      <thead>
        <tr>
          <th v-if="deletable" class="w-12"></th>
          <th>Service Ref#</th>
          <th>Concept</th>
          <th class="text-right">Amount</th>
          <th class="text-right">IVA</th>
          <th class="text-right">Ret. IVA</th>
          <th class="text-right">Ret. ISR</th>
          <th class="text-right">Total</th>
          <th v-if="!isUsd" class="text-right">≈ USD</th>
          <th>Linked to sell</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="!invoices?.length">
          <td :colspan="columns" class="text-center text-medium-emphasis py-4">
            <v-icon size="small" class="mr-1">mdi-tray-remove</v-icon>No concepts registered yet
          </td>
        </tr>
        <tr v-for="invoice in invoices" :key="`concept-${invoice.id}`">
          <td v-if="deletable">
            <TrashButton :item="invoice" @click="emit('delete', invoice)" />
          </td>
          <td class="whitespace-nowrap font-medium">{{ invoice.referenceable?.reference_number }}</td>
          <td>
            <div>{{ invoice.chargeable?.name }}</div>
            <div v-if="invoice.notes" class="text-xs italic text-medium-emphasis">{{ invoice.notes }}</div>
          </td>
          <td class="text-right whitespace-nowrap">{{ formatToCurrency(invoice.amount) }}</td>
          <td class="text-right text-green">{{ formatToCurrency(invoice.amount_iva) }}</td>
          <td class="text-right text-red">-{{ formatToCurrency(invoice.amount_ret_iva) }}</td>
          <td class="text-right text-red">-{{ formatToCurrency(invoice.amount_ret_isr) }}</td>
          <td class="text-right font-bold whitespace-nowrap">
            {{ formatToCurrency(invoice.amount_total) }} <small>{{ getCurrencyName(invoice.currency_id) }}</small>
          </td>
          <td v-if="!isUsd" class="text-right text-medium-emphasis whitespace-nowrap">
            {{ formatToCurrency(toUsd(invoice.amount_total, invoice.currency_id)) }}
          </td>
          <td>
            <div class="flex flex-wrap gap-1 py-1">
              <SupplierInvoiceLinkChip v-for="link in invoice.links" :key="`link-${link.id}`" :link="link" />
              <v-chip v-if="!invoice.links?.length" size="x-small" color="grey" variant="outlined">Not linked</v-chip>
            </div>
          </td>
        </tr>
      </tbody>
      <tfoot v-if="invoices?.length">
        <tr class="font-bold tm-row-muted">
          <td :colspan="deletable ? 7 : 6" class="text-right">Total</td>
          <td class="text-right whitespace-nowrap">{{ formatToCurrency(total) }} <small>{{ getCurrencyName(currencyId) }}</small></td>
          <td v-if="!isUsd" class="text-right whitespace-nowrap">{{ formatToCurrency(toUsd(total, currencyId)) }}</td>
          <td></td>
        </tr>
      </tfoot>
    </v-table>
  </div>
</template>
<script setup lang="ts">
const props = defineProps({
  invoices: { type: Array as PropType<any[]>, default: () => [] },
  currencyId: { type: Number, default: null },
  usdRates: { type: Object, default: null },
  deletable: { type: Boolean, default: false },
})

const emit = defineEmits(['delete'])

const { toUsd } = useCfdiUsdRates(() => props.usdRates as any)

const isUsd = computed(() => Number(props.currencyId) === 2)
const columns = computed(() => 8 + (props.deletable ? 1 : 0) + (isUsd.value ? 0 : 1))
const total = computed(() => props.invoices.reduce((acc: number, i: any) => acc + (parseFloat(i.amount_total) || 0), 0))
</script>
