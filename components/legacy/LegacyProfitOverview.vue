<template>
  <div v-intersect="{ handler: onIntersect, options: { rootMargin: '300px' } }">
    <v-card class="mb-4 tm-tint-green">
      <v-card-title>
        <div class="font-bold"><span class="text-xl">💰</span>Sea Import Service - Totals <span class="text-sm font-normal">(TM1)</span></div>
      </v-card-title>
      <v-card-text>
        <v-skeleton-loader v-if="!requested || loading" type="table-row-divider@3" />
        <v-alert v-else-if="error" type="warning" variant="tonal" density="compact">{{ error }}</v-alert>
        <div v-else-if="o">
          <div class="mb-4">
            <div class="grid grid-cols-4 divide-x divide-y border divide-slate-400 dark:divide-slate-600 border-slate-400 dark:border-slate-600">
              <div class="text-center text-base bg-slate-600 text-white font-bold">💰 - Demurrages</div>
              <div class="bg-slate-300 dark:bg-slate-700 text-center font-bold">Buy (USD)</div>
              <div class="bg-slate-300 dark:bg-slate-700 text-center font-bold">Sell (USD)</div>
              <div class="bg-slate-300 dark:bg-slate-700 text-center font-bold">Profit</div>

              <div class="bg-slate-300 dark:bg-slate-700 text-center font-bold">Amount</div>
              <div class="bg-slate-200 dark:bg-slate-800 text-right"></div>
              <div class="bg-slate-200 dark:bg-slate-800 text-right"><TotalsInUsd :amounts="usd(o.demurrages.sell.amount)" /></div>
              <div class="bg-slate-300 dark:bg-slate-700 text-right"></div>

              <div class="bg-slate-300 dark:bg-slate-700 text-center font-bold">IVA</div>
              <div class="bg-slate-200 dark:bg-slate-800 text-right"></div>
              <div class="bg-slate-200 dark:bg-slate-800 text-right"><TotalsInUsd :amounts="usd(o.demurrages.sell.iva)" /></div>
              <div class="bg-slate-300 dark:bg-slate-700 text-right"></div>

              <div class="bg-slate-300 dark:bg-slate-700 text-center font-bold">Total</div>
              <div class="bg-slate-200 dark:bg-slate-800 text-right font-bold"><TotalsInUsd :amounts="usd(o.demurrages.buy.total)" /></div>
              <div class="bg-slate-200 dark:bg-slate-800 text-right font-bold"><TotalsInUsd :amounts="usd(o.demurrages.sell.total)" /></div>
              <div class="bg-slate-300 dark:bg-slate-700 text-right"><TotalsInUsd :amounts="usd(o.demurrages.profit)" /></div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-2">
            <div class="grid grid-cols-3 divide-x divide-y border divide-slate-400 dark:divide-slate-600 border-sky-400 dark:border-sky-700">
              <div class="text-center text-base bg-sky-600 text-white font-bold">💰 - Sell</div>
              <div class="bg-sky-300 text-center font-bold">Prepaid (USD)</div>
              <div class="bg-sky-300 text-center font-bold">To collect (USD)</div>

              <div class="bg-sky-300 text-center font-bold">Within BL</div>
              <div class="bg-sky-200 text-right"><TotalsInUsd :amounts="usd(o.sell.prepaid.within)" /></div>
              <div class="bg-sky-200 text-right"><TotalsInUsd :amounts="usd(o.sell.collect.within)" /></div>

              <div class="bg-sky-300 text-center font-bold">Out BL</div>
              <div class="bg-sky-200 text-right"><TotalsInUsd :amounts="usd(o.sell.prepaid.out)" /></div>
              <div class="bg-sky-200 text-right"><TotalsInUsd :amounts="usd(o.sell.collect.out)" /></div>

              <div class="bg-sky-300 text-center font-bold">IVA</div>
              <div class="bg-sky-200 text-right"><TotalsInUsd :amounts="usd(o.sell.iva.prepaid)" /></div>
              <div class="bg-sky-200 text-right"><TotalsInUsd :amounts="usd(o.sell.iva.collect)" /></div>

              <div class="bg-sky-300 text-center font-bold">Total</div>
              <div class="bg-sky-200 text-right font-bold"><TotalsInUsd :amounts="usd(o.sell.total.prepaid)" /></div>
              <div class="bg-sky-200 text-right font-bold"><TotalsInUsd :amounts="usd(o.sell.total.collect)" /></div>
            </div>

            <div class="grid grid-cols-3 divide-x divide-y border divide-slate-400 dark:divide-slate-600 border-slate-400 dark:border-slate-600">
              <div class="text-center text-base bg-green-800 text-white font-bold">💸 - Buy</div>
              <div class="bg-green-200 dark:bg-green-800 text-center font-bold">Prepaid (USD)</div>
              <div class="bg-green-200 dark:bg-green-800 text-center font-bold">To collect (USD)</div>

              <div class="bg-green-100 dark:bg-green-900 text-center font-bold">Within BL</div>
              <div class="bg-green-50 dark:bg-green-950 text-right"><TotalsInUsd :amounts="usd(o.buy.prepaid)" /></div>
              <div class="bg-green-50 dark:bg-green-950 text-right"><TotalsInUsd :amounts="usd(o.buy.collect)" /></div>

              <div class="bg-green-100 dark:bg-green-900 text-center font-bold">IVA</div>
              <div class="bg-green-50 dark:bg-green-950 text-right"><TotalsInUsd :amounts="usd(0)" /></div>
              <div class="bg-green-50 dark:bg-green-950 text-right"><TotalsInUsd :amounts="usd(0)" /></div>

              <div class="bg-green-100 dark:bg-green-900 text-center font-bold">Total</div>
              <div class="bg-green-50 dark:bg-green-950 text-right font-bold"><TotalsInUsd :amounts="usd(o.buy.prepaid)" /></div>
              <div class="bg-green-50 dark:bg-green-950 text-right font-bold"><TotalsInUsd :amounts="usd(o.buy.collect)" /></div>
            </div>

            <div class="grid grid-cols-3 divide-x divide-y border divide-slate-400 dark:divide-slate-600 border-slate-400 dark:border-slate-600">
              <div class="bg-slate-300 dark:bg-slate-700 text-center font-bold">
                <v-tooltip location="top" open-delay="300">
                  <template #activator="{ props }">
                    <span v-bind="props">Payments (USD) <v-icon size="small" class="ml-1">mdi-information-outline</v-icon></span>
                  </template>
                  <span>Customer payments recorded in TM1 (<code>CARGO</code>), without demurrages and warranty deposit.</span>
                </v-tooltip>
              </div>
              <div class="bg-slate-300 dark:bg-slate-700 text-center font-bold">
                <v-tooltip location="top" open-delay="300">
                  <template #activator="{ props }">
                    <span v-bind="props">Pending payment (USD) <v-icon size="small" class="ml-1">mdi-information-outline</v-icon></span>
                  </template>
                  <span>
                    <b>Sell rate + other charges</b> minus <b>payments</b> and freight covered with other references. Negative when the
                    customer has a credit.
                  </span>
                </v-tooltip>
              </div>
              <div class="bg-slate-300 dark:bg-slate-700 text-center font-bold">Refunds (USD)</div>
              <div class="flex bg-slate-200 dark:bg-slate-800 text-right items-center justify-end font-bold">
                <TotalsInUsd :amounts="usd(o.payments.paid)" />
              </div>
              <div class="flex bg-slate-200 dark:bg-slate-800 text-right items-center justify-end font-bold">
                <TotalsInUsd :amounts="usd(o.payments.pending)" />
              </div>
              <div class="flex bg-slate-200 dark:bg-slate-800 text-right items-center justify-end font-bold">
                <div>
                  <span class="text-xs font-normal">Requested</span>
                  <div><TotalsInUsd :amounts="usd(o.payments.refund_requested)" /></div>
                  <span class="text-xs font-normal">Amount Applied</span>
                  <div><TotalsInUsd :amounts="usd(o.payments.refund_applied)" /></div>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-2 divide-x divide-y border divide-slate-400 dark:divide-slate-600 border-slate-400 dark:border-slate-600">
              <div class="bg-slate-300 dark:bg-slate-700 text-center font-bold">
                <v-tooltip location="top" open-delay="300">
                  <template #activator="{ props }">
                    <span v-bind="props">Freight Profit (USD) <v-icon size="small" class="ml-1">mdi-information-outline</v-icon></span>
                  </template>
                  <span><b>Sell rate - Buy rate</b> of the freight, as captured in TM1.</span>
                </v-tooltip>
              </div>
              <div class="bg-slate-200 dark:bg-slate-800 text-right"><TotalsInUsd :amounts="usd(t.freight_profit)" /></div>

              <div class="bg-slate-300 dark:bg-slate-700 text-center font-bold">Total sell</div>
              <div class="bg-slate-200 dark:bg-slate-800 text-right"><TotalsInUsd :amounts="usd(t.total_sell)" /></div>
              <div class="bg-slate-300 dark:bg-slate-700 text-center font-bold">Total buy</div>
              <div class="bg-slate-200 dark:bg-slate-800 text-right"><TotalsInUsd :amounts="usd(t.total_buy)" :is-negative="true" /></div>
              <div class="bg-slate-300 dark:bg-slate-700 text-center font-bold">Credit notes</div>
              <div class="bg-slate-200 dark:bg-slate-800 text-right"><TotalsInUsd :amounts="usd(t.credit_notes)" /></div>
              <div class="bg-slate-300 dark:bg-slate-700 text-center font-bold">Debit notes</div>
              <div class="bg-slate-200 dark:bg-slate-800 text-right"><TotalsInUsd :amounts="usd(t.debit_notes)" :is-negative="true" /></div>
              <template v-if="t.customer_notes">
                <div class="bg-slate-300 dark:bg-slate-700 text-center font-bold">Customer notes (TM)</div>
                <div class="bg-slate-200 dark:bg-slate-800 text-right"><TotalsInUsd :amounts="usd(t.customer_notes)" /></div>
              </template>
              <div class="bg-slate-300 dark:bg-slate-700 text-center font-bold">(-) Supplier invoice</div>
              <div class="bg-slate-200 dark:bg-slate-800 text-right"><TotalsInUsd :amounts="usd(t.supplier_invoices)" /></div>
              <div class="bg-slate-300 dark:bg-slate-700 text-center font-bold">
                <v-tooltip location="top" open-delay="300">
                  <template #activator="{ props }">
                    <span v-bind="props">(-) Pending buy <v-icon size="small" class="ml-1">mdi-information-outline</v-icon></span>
                  </template>
                  <span>TM1 does not estimate the cost of buy concepts without a supplier invoice, so it is always zero here.</span>
                </v-tooltip>
              </div>
              <div class="bg-slate-200 dark:bg-slate-800 text-right"><TotalsInUsd :amounts="usd(t.pending_buy)" /></div>
              <div class="bg-slate-300 dark:bg-slate-700 text-center font-bold">(-) Rebate</div>
              <div class="bg-slate-200 dark:bg-slate-800 text-right"><TotalsInUsd :amounts="usd(t.rebate)" :is-negative="true" /></div>
              <template v-if="Math.abs(t.adjustment) >= 0.01">
                <div class="bg-slate-300 dark:bg-slate-700 text-center font-bold">
                  <v-tooltip location="top" open-delay="300">
                    <template #activator="{ props }">
                      <span v-bind="props">Adjustment <v-icon size="small" class="ml-1">mdi-information-outline</v-icon></span>
                    </template>
                    <span>The profit captured in TM1 differs from sell - buy; this is the difference.</span>
                  </v-tooltip>
                </div>
                <div class="bg-slate-200 dark:bg-slate-800 text-right"><TotalsInUsd :amounts="usd(t.adjustment)" /></div>
              </template>

              <div class="bg-slate-300 dark:bg-slate-700 text-center font-bold">Pending payment (USD)</div>
              <div class="bg-slate-200 dark:bg-slate-800 text-right"><TotalsInUsd :amounts="usd(t.pending_payment)" /></div>

              <div class="bg-slate-300 dark:bg-slate-700 text-center font-bold">
                <v-tooltip location="top" open-delay="300">
                  <template #activator="{ props }">
                    <span v-bind="props">Operating Profit without Demurrages (USD) <v-icon size="small" class="ml-1">mdi-information-outline</v-icon></span>
                  </template>
                  <span>
                    <b>Formula (TM1):</b><br />
                    <code>Total sell - Total buy + Credit notes - Debit notes + Customer notes - Supplier invoice - Rebate</code>
                  </span>
                </v-tooltip>
              </div>
              <div class="bg-slate-200 dark:bg-slate-800 text-right"><TotalsInUsd :amounts="usd(t.operating_profit)" /></div>

              <div class="bg-slate-300 dark:bg-slate-700 text-center font-bold">
                <v-tooltip location="top" open-delay="300">
                  <template #activator="{ props }">
                    <span v-bind="props">Demurrages Profit (USD) <v-icon size="small" class="ml-1">mdi-information-outline</v-icon></span>
                  </template>
                  <span><b>Demurrages billed to the customer</b> (with IVA) minus the <b>supplier invoices</b> for demurrages.</span>
                </v-tooltip>
              </div>
              <div class="bg-slate-200 dark:bg-slate-800 text-right"><TotalsInUsd :amounts="usd(t.demurrages_profit)" /></div>

              <div class="bg-slate-300 dark:bg-slate-700 text-center font-bold">
                <v-tooltip location="top" open-delay="300">
                  <template #activator="{ props }">
                    <span v-bind="props">Profit Total (USD) <v-icon size="small" class="ml-1">mdi-information-outline</v-icon></span>
                  </template>
                  <span><b>Operating Profit + Demurrages Profit</b></span>
                </v-tooltip>
                <v-tooltip location="top" open-delay="300">
                  <template #activator="{ props }">
                    <v-icon v-bind="props" color="secondary" size="small" class="ml-1 cursor-pointer" @click="breakdownDialog = true">
                      mdi-calculator-variant
                    </v-icon>
                  </template>
                  <span>See step-by-step breakdown with real amounts</span>
                </v-tooltip>
              </div>
              <div class="bg-slate-200 dark:bg-slate-800 text-right"><TotalsInUsd :amounts="usd(t.profit_total)" /></div>
            </div>
          </div>
        </div>

        <v-dialog v-model="breakdownDialog" max-width="550px">
          <v-card>
            <v-card-title class="text-h6">Profit Total - Step by step</v-card-title>
            <v-card-text>
              <v-list density="compact">
                <v-list-subheader inset>Operating Profit</v-list-subheader>
                <v-list-item><v-list-item-title>+ Total sell: {{ formatToCurrency(t.total_sell) }}</v-list-item-title></v-list-item>
                <v-list-item><v-list-item-title>- Total buy: {{ formatToCurrency(t.total_buy) }}</v-list-item-title></v-list-item>
                <v-list-item><v-list-item-title>+ Credit notes: {{ formatToCurrency(t.credit_notes) }}</v-list-item-title></v-list-item>
                <v-list-item><v-list-item-title>- Debit notes: {{ formatToCurrency(t.debit_notes) }}</v-list-item-title></v-list-item>
                <v-list-item v-if="t.customer_notes">
                  <v-list-item-title>+ Customer notes (TM): {{ formatToCurrency(t.customer_notes) }}</v-list-item-title>
                </v-list-item>
                <v-list-item><v-list-item-title>- Supplier invoice: {{ formatToCurrency(t.supplier_invoices) }}</v-list-item-title></v-list-item>
                <v-list-item><v-list-item-title>- Rebate: {{ formatToCurrency(t.rebate) }}</v-list-item-title></v-list-item>
                <v-list-item v-if="Math.abs(t.adjustment) >= 0.01">
                  <v-list-item-title>± Adjustment: {{ formatToCurrency(t.adjustment) }}</v-list-item-title>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title class="font-bold">= Operating Profit: {{ formatToCurrency(t.operating_profit) }}</v-list-item-title>
                </v-list-item>
                <v-list-subheader inset>Demurrages</v-list-subheader>
                <v-list-item><v-list-item-title>+ Demurrages Profit: {{ formatToCurrency(t.demurrages_profit) }}</v-list-item-title></v-list-item>
                <v-list-item>
                  <v-list-item-title class="font-bold text-primary">= Profit Total: {{ formatToCurrency(t.profit_total) }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-card-text>
            <v-card-actions>
              <v-btn @click="breakdownDialog = false">Close</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
// Same layout as components/seaimport/SeaImportProfitOverview.vue (TM2), fed with the TM1 totals
// of the legacy reference view. Requested the first time it is about to be seen.
const props = defineProps<{ service: string; id: string | number }>()

const { $api } = useNuxtApp()

const o = ref<any>(null)
const loading = ref(false)
const requested = ref(false)
const error = ref('')
const breakdownDialog = ref(false)

const t = computed(() => o.value?.totals ?? {})
// TotalsInUsd takes amounts by currency id; TM1 totals are already in USD (id 2)
const usd = (amount: number) => ({ 2: amount ?? 0 })

const onIntersect = async (isIntersecting: boolean) => {
  if (!isIntersecting || requested.value) return
  requested.value = true
  loading.value = true
  try {
    const block = (await $api.legacy.getReferenceBlock(props.service, props.id, 'profit')) as any
    o.value = block.overview
  } catch (e: any) {
    error.value = e?.response?.status === 403 ? 'You do not have permission to see the profit.' : 'TM1 information is not available right now.'
  } finally {
    loading.value = false
  }
}
</script>
