<template>
  <div v-if="hasPermission(permissions.SeaImportProfit)">
    <v-card color="light-green-lighten-5" class="mb-4">
      <v-card-title>
        <div class="flex items-center justify-between">
          <div class="font-bold"><span class="text-xl">💰</span>Sea Import Service - Totals</div>
          <v-btn icon size="x-small" variant="tonal" color="primary" @click="syncRef">
            <v-icon>mdi-sync</v-icon>
          </v-btn>
        </div>
      </v-card-title>
      <v-card-text>
        <div>
          <div class="mb-4">
            <div class="grid grid-cols-4 divide-x divide-y border divide-slate-400 border-slate-400">
              <div class="text-center text-base bg-slate-600 text-white font-bold">💰 - Demurrages</div>
              <div class="bg-slate-300 text-center font-bold">Buy (USD)</div>
              <div class="bg-slate-300 text-center font-bold">Sell (USD)</div>
              <div class="bg-slate-300 text-center font-bold">Profit</div>

              <div class="bg-slate-300 text-center font-bold">Amount</div>
              <div class="bg-slate-200 text-right">
                <TotalsInUsd :amounts="getDemurragesBuy" />
              </div>
              <div class="bg-slate-200 text-right">
                <TotalsInUsd :amounts="getDemurragesSell" />
              </div>
              <div class="bg-slate-300 text-right">
                <TotalsInUsd :amounts="getDemurragesProfitAmount" />
              </div>

              <div class="bg-slate-300 text-center font-bold">IVA</div>
              <div class="bg-slate-200 text-right">
                <TotalsInUsd :amounts="getDemurragesBuyIva" />
              </div>
              <div class="bg-slate-200 text-right">
                <TotalsInUsd :amounts="getDemurragesSellIva" />
              </div>
              <div class="bg-slate-300 text-right">
                <TotalsInUsd :amounts="getDemurragesProfitIva" />
              </div>

              <div class="bg-slate-300 text-center font-bold">Total</div>
              <div class="bg-slate-200 text-right font-bold">
                <TotalsInUsd :amounts="getDemurragesBuyTotal" />
              </div>
              <div class="bg-slate-200 text-right font-bold">
                <TotalsInUsd :amounts="getDemurragesSellTotal" />
              </div>
              <div class="bg-slate-300 text-right">
                <TotalsInUsd :amounts="getDemurragesProfitTotal" />
              </div>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div class="grid grid-cols-3 divide-x divide-y border divide-slate-400 border-sky-400">
              <div class="text-center text-base bg-sky-600 text-white font-bold">💰 - Sell</div>
              <div class="bg-sky-300 text-center font-bold">Prepaid (USD)</div>
              <div class="bg-sky-300 text-center font-bold">To collect (USD)</div>

              <div class="bg-sky-300 text-center font-bold">Within BL</div>
              <div class="bg-sky-200 text-right">
                <TotalsInUsd :amounts="getSellPrepaidConceptsWithinBl" />
              </div>
              <div class="bg-sky-200 text-right">
                <TotalsInUsd :amounts="getSellCollectConceptsWithinBl" />
              </div>

              <div class="bg-sky-300 text-center font-bold">Out BL</div>
              <div class="bg-sky-200 text-right">
                <TotalsInUsd :amounts="getSellPrepaidConceptsOutsideBl" />
              </div>
              <div class="bg-sky-200 text-right">
                <TotalsInUsd :amounts="getSellCollectConceptsOutsideBl" />
              </div>

              <div class="bg-sky-300 text-center font-bold">IVA</div>
              <div class="bg-sky-200 text-right">
                <TotalsInUsd :amounts="getSellIVAPrepaid" />
              </div>
              <div class="bg-sky-200 text-right">
                <TotalsInUsd :amounts="getSellIVACollect" />
              </div>

              <div class="bg-sky-300 text-center font-bold">Total</div>
              <div class="bg-sky-200 text-right font-bold">
                <TotalsInUsd :amounts="getSellTotalPrepaid" />
              </div>
              <div class="bg-sky-200 text-right font-bold">
                <TotalsInUsd :amounts="getSellTotalCollect" />
              </div>
            </div>
            <div class="grid grid-cols-3 divide-x divide-y border divide-slate-400 border-slate-400">
              <div class="text-center text-base bg-green-800 text-white font-bold">💸 - Buy</div>
              <div class="bg-green-200 text-center font-bold">Prepaid (USD)</div>
              <div class="bg-green-200 text-center font-bold">To collect (USD)</div>

              <div class="bg-green-100 text-center font-bold">Within BL</div>
              <div class="bg-green-50 text-right">
                <TotalsInUsd :amounts="getBuyPrepaidConceptsWithinBl" />
              </div>
              <div class="bg-green-50 text-right">
                <TotalsInUsd :amounts="getBuyCollectConceptsWithinBl" />
              </div>

              <div class="bg-green-100 text-center font-bold">IVA</div>
              <div class="bg-green-50 text-right">
                <TotalsInUsd :amounts="getBuyIVAPrepaid" />
              </div>
              <div class="bg-green-50 text-right">
                <TotalsInUsd :amounts="getBuyIVACollect" />
              </div>

              <div class="bg-green-100 text-center font-bold">Total</div>
              <div class="bg-green-50 text-right font-bold">
                <TotalsInUsd :amounts="getBuyTotalPrepaid" />
              </div>
              <div class="bg-green-50 text-right font-bold">
                <TotalsInUsd :amounts="getBuyTotalCollect" />
              </div>
            </div>
            <div class="grid grid-cols-3 divide-x divide-y border divide-slate-400 border-slate-400">
              <div class="bg-slate-300 text-center font-bold">
                <v-tooltip location="top" open-delay="300">
                  <template #activator="{ props }">
                    <span v-bind="props"
                      >Payments (USD)
                      <v-icon size="small" class="ml-1">mdi-information-outline</v-icon>
                    </span>
                  </template>
                  <span>
                    Sum of <b>payments made</b> (amount_paid) over the invoiced charges.<br />
                    <br />
                    <b>Formula:</b><br />
                    <code>amount_paid</code>
                  </span>
                </v-tooltip>
              </div>
              <div class="bg-slate-300 text-center font-bold">
                <v-tooltip location="top" open-delay="300">
                  <template #activator="{ props }">
                    <span v-bind="props"
                      >Pending payment (USD)
                      <v-icon size="small" class="ml-1">mdi-information-outline</v-icon>
                    </span>
                  </template>
                  <span>
                    Sum: <b>total charges</b> (amount_total)<br />
                    Minus: <b>payments made</b> (amount_paid) and <b>refunds</b> (refunds).<br />
                    <br />
                    <b>Formula:</b><br />
                    <code>(amount_total - amount_paid - refunds)</code>
                  </span>
                </v-tooltip>
              </div>
              <div class="bg-slate-300 text-center font-bold">Refunds (USD)</div>
              <div class="flex bg-slate-200 text-right items-center justify-end font-bold">
                <TotalsInUsd :amounts="getPaymentAmount" />
              </div>
              <div class="flex bg-slate-200 text-right items-center justify-end font-bold">
                <TotalsInUsd :amounts="getPendingPayment" />
              </div>
              <div class="flex bg-slate-200 text-right items-center justify-end font-bold">
                <div class="">
                  <span class="text-xs font-normal">Requested</span>
                  <div><TotalsInUsd :amounts="getTotalRefund" /></div>
                  <span class="text-xs font-normal">Amount Applied</span>
                  <div><TotalsInUsd :amounts="getTotalRefundApplied" /></div>
                </div>
              </div>
            </div>
            <div class="grid grid-cols-2 divide-x divide-y border divide-slate-400 border-slate-400">
              <div class="bg-slate-300 text-center font-bold">
                <v-tooltip location="top" open-delay="300">
                  <template #activator="{ props }">
                    <span v-bind="props"
                      >Freight Profit (USD)
                      <v-icon size="small" class="ml-1">mdi-information-outline</v-icon>
                    </span>
                  </template>
                  <span>
                    <b>Freight Profit</b> shows the profit generated only by freight concepts,
                    excluding demurrages and other charges.<br /><br />
                    <b>How is it calculated?</b><br />
                    <ul style="padding-left: 1em">
                      <li><b>+ Sell Prepaid Within BL</b></li>
                      <li><b>+ Sell Collect Within BL</b></li>
                      <li><b>- Buy Prepaid Within BL</b></li>
                      <li><b>- Buy Collect Within BL</b></li>
                    </ul>
                    <br />
                    <b>Formula:</b><br />
                    <code>
                      (Sell Prepaid Within BL + Sell Collect Within BL) - (Buy Prepaid Within BL + Buy Collect Within
                      BL)
                    </code>
                    <br /><br />
                    <b>Note:</b> Only freight concepts within the BL (Bill of Lading) are considered.
                  </span>
                </v-tooltip>
              </div>
              <div class="bg-slate-200 text-right">
                <TotalsInUsd :amounts="getTotalProfitFlete" />
              </div>

              <div class="bg-slate-300 text-center font-bold">Total sell</div>
              <div class="bg-slate-200 text-right">
                <TotalsInUsd :amounts="getProfitSell" />
              </div>
              <div class="bg-slate-300 text-center font-bold">Total buy</div>
              <div class="bg-slate-200 text-right">
                <TotalsInUsd :amounts="getTotalBuy" :is-negative="true" />
              </div>
              <div class="bg-slate-300 text-center font-bold">Credit notes</div>
              <div class="bg-slate-200 text-right">
                <TotalsInUsd :amounts="getCreditFfNotes" />
              </div>
              <div class="bg-slate-300 text-center font-bold">Debit notes</div>
              <div class="bg-slate-200 text-right">
                <TotalsInUsd :amounts="getDebitFfNotes" :is-negative="true" />
              </div>
              <div class="bg-slate-300 text-center font-bold">(-) Supplier invoice</div>
              <div class="bg-slate-200 text-right">
                <TotalsInUsd :amounts="getSupplierInvoices" />
              </div>
              <div class="bg-slate-300 text-center font-bold">
                <v-tooltip location="top" open-delay="300">
                  <template #activator="{ props }">
                    <span v-bind="props"
                      >(-) Pending buy
                      <v-icon size="small" class="ml-1">mdi-information-outline</v-icon>
                    </span>
                  </template>
                  <span>
                    Estimated cost of <b>buy concepts</b> not yet covered by a Supplier invoice for the same
                    charge.<br /><br />
                    <b>Formula (per charge):</b><br />
                    <code>Buy amount (+ IVA if applicable) - Supplier invoice amount for that charge</code><br />
                    <br />
                    Only the positive difference is counted (a charge fully or over-covered by its Supplier
                    invoice contributes $0).
                  </span>
                </v-tooltip>
              </div>
              <div class="bg-slate-200 text-right">
                <TotalsInUsd :amounts="getRemainingBuy" />
              </div>
              <div class="bg-slate-300 text-center font-bold">(-) Rebate</div>
              <div class="bg-slate-200 text-right">
                <TotalsInUsd :amounts="getRebate" :is-negative="true" />
              </div>

              <div class="bg-slate-300 text-center font-bold">
                <v-tooltip location="top" open-delay="300">
                  <template #activator="{ props }">
                    <span v-bind="props"
                      >Pending payment (USD)
                      <v-icon size="small" class="ml-1">mdi-information-outline</v-icon>
                    </span>
                  </template>
                  <span>
                    Sum: <b>total charges</b> (amount_total)<br />
                    Minus: <b>payments made</b> (amount_paid) and <b>refunds</b> (refunds).<br />
                    <br />
                    <b>Formula:</b><br />
                    <code>(amount_total - amount_paid - refunds)</code>
                  </span>
                </v-tooltip>
              </div>
              <div class="bg-slate-200 text-right">
                <TotalsInUsd :amounts="getPendingPayment" />
              </div>

              <div class="bg-slate-300 text-center font-bold">
                <v-tooltip location="top" open-delay="300">
                  <template #activator="{ props }">
                    <span v-bind="props"
                      >Operating Profit without Demurrages (USD)
                      <v-icon size="small" class="ml-1">mdi-information-outline</v-icon>
                    </span>
                  </template>
                  <span>
                    <b>Operational Profit</b> includes:<br />
                    <ul style="padding-left: 1em">
                      <li><b>+ Total sell</b></li>
                      <li><b>+ Credit notes</b></li>
                      <li><b>+ Debit notes</b></li>
                      <li><b>- Warranty deposit</b></li>
                      <li><b>- Supplier invoice</b> (Real costs)</li>
                      <li><b>- Pending buy</b> (Estimated remaining costs)</li>
                      <li><b>- Rebate</b></li>
                    </ul>
                    <br />
                    <b>Formula:</b><br />
                    <code
                      >(Total sell + Credit notes + Debit notes - Warranty deposit - Supplier invoice - Total buy -
                      Rebate)</code
                    >
                  </span>
                </v-tooltip>
              </div>
              <div class="bg-slate-200 text-right">
                <TotalsInUsd :amounts="getTotalProfit" />
              </div>

              <div class="bg-slate-300 text-center font-bold">
                <v-tooltip location="top" open-delay="300">
                  <template #activator="{ props }">
                    <span v-bind="props"
                      >Demurrages Profit (USD)
                      <v-icon size="small" class="ml-1">mdi-information-outline</v-icon>
                    </span>
                  </template>
                  <span>
                    <b>Demurrages Profit</b> shows the profit generated only by demurrage concepts<br />
                    (demurrages).<br /><br />
                    <b>Formula:</b><br />
                    <ul style="padding-left: 1em">
                      <li><b>Demurrages Profit = (Total Sell Demurrages + VAT) - (Total Buy Demurrages + VAT)</b></li>
                    </ul>
                    <br />
                    <b>Details:</b><br />
                    <ul style="padding-left: 1em">
                      <li>
                        <b>Total Sell Demurrages:</b> Sum of amounts invoiced to the customer for demurrages
                        (<code>amount</code>)
                      </li>
                      <li><b>VAT Sell:</b> Sum of VAT invoiced to the customer for demurrages (<code>amount_iva</code>)</li>
                      <li>
                        <b>Total Buy Demurrages:</b> Sum of costs paid to the supplier for demurrages
                        (<code>line_cost</code>)
                      </li>
                      <li><b>VAT Buy:</b> Sum of VAT paid to the supplier for demurrages (<code>line_iva</code>)</li>
                    </ul>
                    <br />
                    <b>Demurrages Profit</b> = (amount + amount_iva) - (line_cost + line_iva)
                  </span>
                </v-tooltip>
              </div>
              <div class="bg-slate-200 text-right">
                <TotalsInUsd :amounts="getDemurragesProfitTotal" />
              </div>

              <div class="bg-slate-300 text-center font-bold">
                <v-tooltip location="top" open-delay="300">
                  <template #activator="{ props }">
                    <span v-bind="props"
                      >Profit Total (USD)
                      <v-icon size="small" class="ml-1">mdi-information-outline</v-icon>
                    </span>
                  </template>
                  <span>
                    <b>Total Profit</b> represents the net profit of the reference, adding
                    <b>Operational Profit</b> and <b>Demurrages Profit</b>.<br /><br />
                    <b>General formula:</b><br />
                    <ul style="padding-left: 1em">
                      <li>
                        <b>Total Profit = Operational Profit + Demurrages Profit</b>
                      </li>
                    </ul>
                    <br />
                    <b>Operational Profit</b> includes:<br />
                    <ul style="padding-left: 1em">
                      <li><b>+ Total sell</b></li>
                      <li><b>+ Credit notes</b></li>
                      <li><b>+ Debit notes</b></li>
                      <li><b>- Warranty deposit</b></li>
                      <li><b>- Supplier invoice</b> (Real costs)</li>
                      <li><b>- Pending buy</b> (Estimated remaining costs)</li>
                      <li><b>- Rebate</b></li>
                    </ul>
                    <b>Demurrages Profit</b> includes:<br />
                    <ul style="padding-left: 1em">
                      <li>
                        <b>(Total Sell Demurrages + VAT) - (Total Buy Demurrages + VAT)</b>
                      </li>
                    </ul>
                    <br />
                    <b>Logic details:</b><br />
                    <ul style="padding-left: 1em">
                      <li>
                        Costs are calculated per concept. We use the <b>Supplier invoice</b> amount if it exists.
                      </li>
                      <li>
                        If the <b>Supplier invoice</b> amount is less than the <b>Estimated buy</b>, we also deduct the difference (Total buy) to account for expected costs.
                      </li>
                      <li>
                        If there is no <b>Supplier invoice</b> for a concept, the full <b>Estimated buy</b> is deducted.
                      </li>
                    </ul>
                    <br />
                    <b>Full formula:</b><br />
                    <code>
                      (Total sell + Credit notes + Debit notes - Warranty deposit - Supplier invoice - Total buy -
                      Rebate) + ((Total Sell Demurrages + IVA) - (Total Buy Demurrages + IVA))
                    </code>
                    <br />
                    <span>
                      Note: <b>Total buy</b> is adjusted to avoid double counting with <b>Supplier invoices</b>, while ensuring all estimated costs are considered per concept.
                    </span>
                  </span>
                </v-tooltip>
                <v-tooltip location="top" open-delay="300">
                  <template #activator="{ props }">
                    <v-icon
                      v-bind="props"
                      color="secondary"
                      size="small"
                      class="ml-1 cursor-pointer"
                      @click="profitBreakdownDialog = true"
                    >
                      mdi-calculator-variant
                    </v-icon>
                  </template>
                  <span>See step-by-step breakdown with real amounts</span>
                </v-tooltip>
              </div>
              <div class="bg-slate-200 text-right">
                <TotalsInUsd :amounts="getTotalProfitWithDemurrages" />
              </div>
            </div>
          </div>
        </div>

        <v-dialog v-model="profitBreakdownDialog" max-width="550px">
          <v-card>
            <v-card-title class="text-h6">Profit Total - Step by step</v-card-title>
            <v-card-text>
              <v-list density="compact">
                <v-list-subheader inset>Operating Profit</v-list-subheader>
                <v-list-item><v-list-item-title>+ Total sell: {{ formatToCurrency(profitBreakdown.totalSell) }}</v-list-item-title></v-list-item>
                <v-list-item><v-list-item-title>+ Credit notes: {{ formatToCurrency(profitBreakdown.creditNotes) }}</v-list-item-title></v-list-item>
                <v-list-item><v-list-item-title>+ Debit notes: {{ formatToCurrency(profitBreakdown.debitNotes) }}</v-list-item-title></v-list-item>
                <v-list-item><v-list-item-title>- Warranty deposit: {{ formatToCurrency(profitBreakdown.warrantyDeposit) }}</v-list-item-title></v-list-item>
                <v-list-item><v-list-item-title>- Supplier invoice: {{ formatToCurrency(profitBreakdown.supplierInvoices) }}</v-list-item-title></v-list-item>
                <v-list-item><v-list-item-title>- Pending buy: {{ formatToCurrency(profitBreakdown.remainingBuy) }}</v-list-item-title></v-list-item>
                <v-list-item><v-list-item-title>- Rebate: {{ formatToCurrency(profitBreakdown.rebate) }}</v-list-item-title></v-list-item>
                <v-list-item>
                  <v-list-item-title class="font-bold">= Operating Profit: {{ formatToCurrency(profitBreakdown.operatingProfit) }}</v-list-item-title>
                </v-list-item>
                <v-list-subheader inset>Demurrages</v-list-subheader>
                <v-list-item><v-list-item-title>+ Demurrages Profit: {{ formatToCurrency(profitBreakdown.demurragesProfit) }}</v-list-item-title></v-list-item>
                <v-list-item>
                  <v-list-item-title class="font-bold text-primary">= Profit Total: {{ formatToCurrency(profitBreakdown.profitTotal) }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-card-text>
            <v-card-actions>
              <v-btn @click="profitBreakdownDialog = false">Close</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-card-text>
    </v-card>
  </div>
</template>
<script setup lang="ts">
import { permissions } from '@/utils/data/system'
import { currencies } from '~/utils/data/systemData'
import { formatToCurrency } from '~/utils/formatters'
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()
const { hasPermission } = useCheckUser()
const exchangeRatesStore = useExchangeRatesStore()
const usdCurrencyId = 2

const props = defineProps({
  referenciaId: {
    type: [String, Number],
    required: true,
  },
})

const getDemurragesBuy = computed(() => {
  return (profitSeaImportRef.value.referencia?.demurrages || []).reduce((acc: any, demurrage: any) => {
    const amount = parseFloat(demurrage.line_cost || 0)
    acc[2] = (acc[2] || 0) + amount
    return acc
  }, { 2: 0 })
})

const getDemurragesBuyIva = computed(() => {
  return (profitSeaImportRef.value.referencia?.demurrages || []).reduce((acc: any, demurrage: any) => {
    const amount = parseFloat(demurrage.line_iva || 0)
    acc[2] = (acc[2] || 0) + amount
    return acc
  }, { 2: 0 })
})

const getDemurragesBuyTotal = computed(() => {
  const totals: Record<number, number> = {}
  addToTotals(totals, getDemurragesBuy.value)
  addToTotals(totals, getDemurragesBuyIva.value)
  return totals
})

const getDemurragesSell = computed(() => {
  return (profitSeaImportRef.value.referencia?.demurrages || []).reduce((acc: any, demurrage: any) => {
    const amount = parseFloat(demurrage.amount || 0)
    acc[2] = (acc[2] || 0) + amount
    return acc
  }, { 2: 0 })
})

const getDemurragesSellIva = computed(() => {
  return (profitSeaImportRef.value.referencia?.demurrages || []).reduce((acc: any, demurrage: any) => {
    const amount = parseFloat(demurrage.amount_iva || 0)
    acc[2] = (acc[2] || 0) + amount
    return acc
  }, { 2: 0 })
})

const getDemurragesSellTotal = computed(() => {
  const totals: Record<number, number> = {}
  addToTotals(totals, getDemurragesSell.value)
  addToTotals(totals, getDemurragesSellIva.value)
  return totals
})

const getDemurragesProfitAmount = computed(() => {
  const totals: Record<number, number> = {}
  addToTotals(totals, getDemurragesSell.value)
  addToTotals(totals, getDemurragesBuy.value, true)
  return totals
})

const getDemurragesProfitIva = computed(() => {
  const totals: Record<number, number> = {}
  addToTotals(totals, getDemurragesSellIva.value)
  addToTotals(totals, getDemurragesBuyIva.value, true)
  return totals
})

const getDemurragesProfitTotal = computed(() => {
  const totals: Record<number, number> = {}
  addToTotals(totals, getDemurragesProfitAmount.value)
  addToTotals(totals, getDemurragesProfitIva.value)
  return totals
})

const getCreditFfNotes = computed(() => {
  const ffNotes = profitSeaImportRef.value.referencia?.ff_notes || []
  const totals: Record<number, number> = {}
  
  ffNotes.forEach((ffNote: any) => {
    const currencyId = ffNote.currency_id
    if (!currencyId) return
    
    const amount = parseFloat(ffNote.signed_amount) || 0
    // Agente Credito y TM Debito (positivo)
    // inbound = 1 From Agent, if not From TM
    if ((ffNote.inbound === 1 && ffNote.type === 'C') || (ffNote.inbound === 0 && ffNote.type === 'D')) {
      totals[currencyId] = (totals[currencyId] || 0) + amount
    }
  })
  return totals
})

const getDebitFfNotes = computed(() => {
  const ffNotes = profitSeaImportRef.value.referencia?.ff_notes || []
  const totals: Record<number, number> = {}
  
  ffNotes.forEach((ffNote: any) => {
    const currencyId = ffNote.currency_id
    if (!currencyId) return
    
    const amount = parseFloat(ffNote.signed_amount) || 0
    // Credito TM y Agente Debito (negativo)
    // inbound = 1 From Agent, if not From TM
    if ((ffNote.inbound === 1 && ffNote.type === 'D') || (ffNote.inbound === 0 && ffNote.type === 'C')) {
      totals[currencyId] = (totals[currencyId] || 0) + amount
    }
  })
  return totals
})

const getRefMergedCharges = computed(() => {
  // concat charges and sell_rate_breakdown
  return (profitSeaImportRef.value.referencia?.charges || []).concat(
    profitSeaImportRef.value.referencia?.sell_rate_breakdown || []
  )
})

const getSellCollectConceptsWithinBl = computed(() => {
  if (profitSeaImportRef.value.referencia?.sell_rate_type !== 'Collect') {
    return {}
  }
  return (profitSeaImportRef.value.referencia?.sell_rate_breakdown || []).reduce((acc: any, charge: any) => {
    if (acc[charge.currency_id]) {
      acc[charge.currency_id] += parseFloat(charge.amount)
    } else {
      acc[charge.currency_id] = parseFloat(charge.amount)
    }
    return acc
  }, {})
})

const getSellCollectConceptsOutsideBl = computed(() => {
  if (profitSeaImportRef.value.referencia?.sell_rate_type !== 'Collect') {
    return {}
  }
  return (profitSeaImportRef.value.referencia?.charges || []).reduce((acc: any, charge: any) => {
    if (acc[charge.currency_id]) {
      acc[charge.currency_id] += parseFloat(charge.amount)
    } else {
      acc[charge.currency_id] = parseFloat(charge.amount)
    }
    return acc
  }, {})
})

const getSellPrepaidConceptsWithinBl = computed(() => {
  if (profitSeaImportRef.value.referencia?.sell_rate_type !== 'Prepaid') {
    return {}
  }
  return (profitSeaImportRef.value.referencia?.sell_rate_breakdown || []).reduce((acc: any, charge: any) => {
    if (acc[charge.currency_id]) {
      acc[charge.currency_id] += parseFloat(charge.amount)
    } else {
      acc[charge.currency_id] = parseFloat(charge.amount)
    }
    return acc
  }, {})
})

const getSellPrepaidConceptsOutsideBl = computed(() => {
  if (profitSeaImportRef.value.referencia?.sell_rate_type !== 'Prepaid') {
    return {}
  }
  return (profitSeaImportRef.value.referencia?.charges || []).reduce((acc: any, charge: any) => {
    if (acc[charge.currency_id]) {
      acc[charge.currency_id] += parseFloat(charge.amount)
    } else {
      acc[charge.currency_id] = parseFloat(charge.amount)
    }
    return acc
  }, {})
})

const getSellIVAPrepaid = computed(() => {
  if (profitSeaImportRef.value.referencia?.sell_rate_type !== 'Prepaid') {
    return {}
  }
  return getRefMergedCharges.value.reduce((acc: any, charge: any) => {
    if (charge.is_con_iva === 1) {
      if (acc[charge.currency_id]) {
        acc[charge.currency_id] += parseFloat(charge.amount) * 0.16
      } else {
        acc[charge.currency_id] = parseFloat(charge.amount) * 0.16
      }
    }
    return acc
  }, {})
})
const getSellIVACollect = computed(() => {
  if (profitSeaImportRef.value.referencia?.sell_rate_type !== 'Collect') {
    return {}
  }
  return (profitSeaImportRef.value.referencia?.charges || []).reduce((acc: any, charge: any) => {
    if (charge.is_con_iva === 1) {
      if (acc[charge.currency_id]) {
        acc[charge.currency_id] += parseFloat(charge.amount) * 0.16
      } else {
        acc[charge.currency_id] = parseFloat(charge.amount) * 0.16
      }
    }
    return acc
  }, {})
})

const getBuyPrepaidConceptsWithinBl = computed(() => {
  if (profitSeaImportRef.value.referencia?.buy_rate_type !== 'Prepaid') return {}
  return (profitSeaImportRef.value.referencia?.buy_rate_breakdown || []).reduce((acc: any, charge: any) => {
    if (acc[charge.currency_id]) {
      acc[charge.currency_id] += parseFloat(charge.amount)
    } else {
      acc[charge.currency_id] = parseFloat(charge.amount)
    }
    return acc
  }, {})
})

const getBuyCollectConceptsWithinBl = computed(() => {
  if (profitSeaImportRef.value.referencia?.buy_rate_type !== 'Collect') return {}
  return (profitSeaImportRef.value.referencia?.buy_rate_breakdown || []).reduce((acc: any, charge: any) => {
    if (acc[charge.currency_id]) {
      acc[charge.currency_id] += parseFloat(charge.amount)
    } else {
      acc[charge.currency_id] = parseFloat(charge.amount)
    }
    return acc
  }, {})
})

const getBuyIVAPrepaid = computed(() => {
  if (profitSeaImportRef.value.referencia?.buy_rate_type !== 'Prepaid') return {}
  return (profitSeaImportRef.value.referencia?.buy_rate_breakdown || []).reduce((acc: any, charge: any) => {
    if (charge.is_con_iva === 1) {
      const iva = parseFloat(charge.amount) * 0.16
      if (acc[charge.currency_id]) {
        acc[charge.currency_id] += iva
      } else {
        acc[charge.currency_id] = iva
      }
    }
    return acc
  }, {})
})

const getBuyIVACollect = computed(() => {
  if (profitSeaImportRef.value.referencia?.buy_rate_type !== 'Collect') return {}
  return (profitSeaImportRef.value.referencia?.buy_rate_breakdown || []).reduce((acc: any, charge: any) => {
    if (charge.is_con_iva === 1) {
      const iva = parseFloat(charge.amount) * 0.16
      if (acc[charge.currency_id]) {
        acc[charge.currency_id] += iva
      } else {
        acc[charge.currency_id] = iva
      }
    }
    return acc
  }, {})
})

const getBuyTotalPrepaid = computed(() => {
  const totals: Record<number, number> = {}
  addToTotals(totals, getBuyPrepaidConceptsWithinBl.value)
  addToTotals(totals, getBuyIVAPrepaid.value)
  return totals
})

const getBuyTotalCollect = computed(() => {
  const totals: Record<number, number> = {}
  addToTotals(totals, getBuyCollectConceptsWithinBl.value)
  addToTotals(totals, getBuyIVACollect.value)
  return totals
})

const addToTotals = (totals: Record<number, number>, source: Record<number, number> | null | undefined, isMinus = false) => {
  if (!source) return totals
  for (const [currencyId, amount] of Object.entries(source)) {
    const numericCurrencyId = Number(currencyId)
    if (isNaN(numericCurrencyId)) continue
    
    const numericAmount = parseFloat(amount as any) || 0
    if (totals[numericCurrencyId]) {
      totals[numericCurrencyId] += isMinus ? -numericAmount : numericAmount
    } else {
      totals[numericCurrencyId] = isMinus ? -numericAmount : numericAmount
    }
  }

  return totals
}

const getSellTotalPrepaid = computed(() => {
  const totals: Record<number, number> = {}

  // Add values from each computed property
  addToTotals(totals, getSellPrepaidConceptsWithinBl.value)
  addToTotals(totals, getSellPrepaidConceptsOutsideBl.value)
  addToTotals(totals, getSellIVAPrepaid.value)

  return totals
})

const getSellTotalCollect = computed(() => {
  const totals: Record<number, number> = {}

  // Add values from each computed property
  addToTotals(totals, getSellCollectConceptsWithinBl.value)
  addToTotals(totals, getSellCollectConceptsOutsideBl.value)
  addToTotals(totals, getSellIVACollect.value)

  return totals
})

const getWarrantyDepositConcepts = computed(() => {
  const allCharges = [
    ...(profitSeaImportRef.value.referencia?.sell_rate_breakdown || []),
    ...(profitSeaImportRef.value.referencia?.charges || []),
  ]
  return allCharges
    .filter((charge: any) => charge.is_warranty_deposit === 1)
    .reduce((acc: any, charge: any) => {
      if (acc[charge.currency_id]) {
        acc[charge.currency_id] += parseFloat(charge.amount_total || 0)
      } else {
        acc[charge.currency_id] = parseFloat(charge.amount_total || 0)
      }
      return acc
    }, {})
})
const getProfitSell = computed(() => {
  // merge getSellTotalCollect and getSellTotalPrepaid
  const totals: Record<number, number> = {}

  addToTotals(totals, getSellPrepaidConceptsWithinBl.value)
  addToTotals(totals, getSellPrepaidConceptsOutsideBl.value)

  addToTotals(totals, getSellCollectConceptsWithinBl.value)
  addToTotals(totals, getSellCollectConceptsOutsideBl.value)

  return totals
})

const getRemainingBuy = computed(() => {
  const totals: Record<number, number> = {}
  const buyBreakdown = profitSeaImportRef.value.referencia?.buy_rate_breakdown || []
  const supplierInvoices = profitSeaImportRef.value.supplierInvoices || []

  buyBreakdown.forEach((buyCharge: any) => {
    const baseAmount = parseFloat(buyCharge.amount || 0)
    const ivaAmount = buyCharge.is_con_iva === 1 ? baseAmount * 0.16 : 0
    const buyTotalAmount = baseAmount + ivaAmount

    // A Supplier invoice covers the same charge_id even when captured in a different
    // currency than the buy rate — convert it to the buy charge's currency (not a raw
    // sum) so only the equivalent amount is deducted, never the full foreign-currency figure.
    const invoicedAmount = supplierInvoices
      .filter((si: any) => si.charge_id === buyCharge.charge_id)
      .reduce((sum: number, si: any) => {
        const siAmount = parseFloat(si.amount_total || 0)
        const rate = exchangeRatesStore.getExchangeRate(si.currency_id, buyCharge.currency_id)
        return sum + siAmount * rate
      }, 0)

    if (buyTotalAmount > invoicedAmount) {
      const remaining = buyTotalAmount - invoicedAmount
      const currencyId = buyCharge.currency_id
      if (totals[currencyId]) {
        totals[currencyId] += remaining
      } else {
        totals[currencyId] = remaining
      }
    }
  })

  return totals
})

const getTotalBuy = computed(() => {
  // merge getBuyTotalCollect and getBuyTotalPrepaid (which already include IVA)
  const totals: Record<number, number> = {}

  addToTotals(totals, getBuyTotalPrepaid.value)
  addToTotals(totals, getBuyTotalCollect.value)

  return totals
})

const getTotalProfit = computed(() => {
  const totals: Record<number, number> = {}

  addToTotals(totals, getProfitSell.value)
  addToTotals(totals, getCreditFfNotes.value)
  addToTotals(totals, getDebitFfNotes.value)
  addToTotals(totals, getWarrantyDepositConcepts.value, true)
  addToTotals(totals, getSupplierInvoices.value, true)
  addToTotals(totals, getRemainingBuy.value, true)
  addToTotals(totals, getRebate.value, true)

  return totals
})

const getTotalProfitWithDemurrages = computed(() => {
  const totals: Record<number, number> = {}

  addToTotals(totals, getTotalProfit.value)
  addToTotals(totals, getDemurragesProfitTotal.value)

  return totals
})

const getTotalProfitFlete = computed(() => {
  const totals: Record<number, number> = {}

  addToTotals(totals, getSellPrepaidConceptsWithinBl.value)
  addToTotals(totals, getSellCollectConceptsWithinBl.value)

  addToTotals(totals, getBuyPrepaidConceptsWithinBl.value, true)
  addToTotals(totals, getBuyCollectConceptsWithinBl.value, true)

  return totals
})

const getPendingPayment = computed(() => {
  const charges = profitSeaImportRef.value.referencia?.charges || []
  const breakdown = profitSeaImportRef.value.referencia?.sell_rate_breakdown || []
  let pendingPayment = charges
    .concat(breakdown)
    .filter((charge: any) => charge.amount_total != null)
    .reduce((acc: any, charge: any) => {
      const pendingAmount = parseFloat(charge.amount_total) - parseFloat(charge.invoice_charge?.amount_paid || 0)
      if (acc[charge.currency_id]) {
        acc[charge.currency_id] += pendingAmount
      } else {
        acc[charge.currency_id] = pendingAmount
      }
      return acc
    }, {})
  // restar refund
  Object.keys(getTotalRefund.value).forEach((currencyId) => {
    if (pendingPayment[currencyId]) {
      pendingPayment[currencyId] -= getTotalRefund.value[currencyId]
    }
  })
  return pendingPayment
})

const getPaymentAmount = computed(() => {
  const charges = profitSeaImportRef.value.referencia?.charges || []
  const breakdown = profitSeaImportRef.value.referencia?.sell_rate_breakdown || []
  return charges
    .concat(breakdown)
    .filter((charge: any) => charge.amount_total != null)
    .reduce((acc: any, charge: any) => {
      if (acc[charge.currency_id]) {
        acc[charge.currency_id] += parseFloat(charge.invoice_charge?.amount_paid || 0)
      } else {
        acc[charge.currency_id] = parseFloat(charge.invoice_charge?.amount_paid || 0)
      }
      return acc
    }, {})
})

const getTotalRefund = computed(() => {
  return (profitSeaImportRef.value.refunds || []).reduce((acc: any, refund: any) => {
    if (acc[refund.currency_id]) {
      acc[refund.currency_id] += parseFloat(refund.total_amount)
    } else {
      acc[refund.currency_id] = parseFloat(refund.total_amount)
    }
    return acc
  }, {})
})

const getTotalRefundApplied = computed(() => {
  const refunds = profitSeaImportRef.value.refunds || []
  const totals: Record<number, number> = {}

  refunds.forEach((refund: any) => {
    const charges = refund.invoice?.charges || []
    charges.forEach((charge: any) => {
      const payments = charge.payments || []
      payments.forEach((payment: any) => {
        const currencyId = charge.currency_id
        const amountPaid = parseFloat(payment.amount || 0)
        if (totals[currencyId]) {
          totals[currencyId] += amountPaid
        } else {
          totals[currencyId] = amountPaid
        }
      })
    })
  })

  return totals
})

const getSupplierInvoices = computed(() => {
  const supplierInvoices = profitSeaImportRef.value.supplierInvoices || []
  return supplierInvoices.reduce((acc: any, charge: any) => {
    const currencyId = charge.currency_id
    if (!currencyId) return acc
    
    const amount = parseFloat(charge.amount_total) || 0
    if (acc[currencyId]) {
      acc[currencyId] += amount
    } else {
      acc[currencyId] = amount
    }
    return acc
  }, {})
})

const getRebate = computed(() => {
  // return from profitSeaImportRef.value.referencia.rebate if not null with 2 currency,
  return {
    2: parseFloat(profitSeaImportRef.value.referencia?.rebate_total_amount || 0),
  }
})

const profitSeaImportRef = ref<any>({
  referencia: {},
  supplierInvoices: [],
  refunds: [],
})
// const referencia = ref<any>({})

const profitBreakdownDialog = ref(false)
const profitBreakdown = ref<Record<string, number>>({
  totalSell: 0,
  creditNotes: 0,
  debitNotes: 0,
  warrantyDeposit: 0,
  supplierInvoices: 0,
  remainingBuy: 0,
  rebate: 0,
  operatingProfit: 0,
  demurragesProfit: 0,
  profitTotal: 0,
})

// Same currency-conversion logic as components/common/TotalsInUsd.vue, so the
// step-by-step breakdown matches exactly what each row on screen displays.
const convertToUsd = async (amounts: Record<number, number> | null | undefined) => {
  let total = 0
  for (const [currencyId, amount] of Object.entries(amounts || {})) {
    const originCurrencyId = Number(currencyId)
    if (originCurrencyId === usdCurrencyId) {
      total += amount
    } else {
      const exchangeRate = await exchangeRatesStore.getExchangeRate(originCurrencyId, usdCurrencyId)
      total += amount * exchangeRate
    }
  }
  return parseFloat(total.toFixed(2))
}

const computeProfitBreakdown = async () => {
  const totalSell = await convertToUsd(getProfitSell.value)
  const creditNotes = await convertToUsd(getCreditFfNotes.value)
  const debitNotes = await convertToUsd(getDebitFfNotes.value)
  const warrantyDeposit = await convertToUsd(getWarrantyDepositConcepts.value)
  const supplierInvoices = await convertToUsd(getSupplierInvoices.value)
  const remainingBuy = await convertToUsd(getRemainingBuy.value)
  const rebate = await convertToUsd(getRebate.value)
  const demurragesProfit = await convertToUsd(getDemurragesProfitTotal.value)

  const operatingProfit = parseFloat(
    (totalSell + creditNotes + debitNotes - warrantyDeposit - supplierInvoices - remainingBuy - rebate).toFixed(2)
  )
  const profitTotal = parseFloat((operatingProfit + demurragesProfit).toFixed(2))

  profitBreakdown.value = {
    totalSell,
    creditNotes,
    debitNotes,
    warrantyDeposit,
    supplierInvoices,
    remainingBuy,
    rebate,
    operatingProfit,
    demurragesProfit,
    profitTotal,
  }
}

watch(() => profitSeaImportRef.value, computeProfitBreakdown, { deep: true })

const syncRef = async () => {
  await getSeaImportProfit()
  snackbar.add({
    type: 'success',
    text: 'Data updated',
  })
}

const getSeaImportProfit = async () => {
  try {
    loadingStore.loading = true
    const response = (await $api.referencias.getSeaImportProfit(props.referenciaId.toString())) as any
    profitSeaImportRef.value = response
  } catch (error) {
    console.error(error)
  } finally {
    setTimeout(() => {
      loadingStore.loading = false
    }, 250)
  }
}

onMounted(async () => {
  if (hasPermission(permissions.SeaImportProfit)) {
    await getSeaImportProfit()
  }
})

defineExpose({
  getSeaImportProfit,
})
</script>
