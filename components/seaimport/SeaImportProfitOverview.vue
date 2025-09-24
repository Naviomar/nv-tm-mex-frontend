<template>
  <div>
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
        <div v-if="!hasPermission(permissions.SeaImportProfit)">
          <v-alert density="compact" type="warning" icon="mdi-alert">
            You lack permission to see this module ({{ permissions.SeaImportProfit }})
          </v-alert>
        </div>
        <div v-if="hasPermission(permissions.SeaImportProfit)">
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
                    Suma de <b>pagos realizados</b> (amount_paid) sobre los cargos facturados.<br />
                    <br />
                    <b>Fórmula:</b><br />
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
                    Suma: <b>total de cargos</b> (amount_total)<br />
                    Resta: <b>pagos realizados</b> (amount_paid) y <b>reembolsos</b> (refunds).<br />
                    <br />
                    <b>Fórmula:</b><br />
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
                      >Profit Flete (USD)
                      <v-icon size="small" class="ml-1">mdi-information-outline</v-icon>
                    </span>
                  </template>
                  <span>
                    <b>Profit Flete</b> muestra la utilidad generada únicamente por los conceptos de flete (freight),
                    excluyendo demoras y otros cargos.<br /><br />
                    <b>¿Cómo se calcula?</b><br />
                    <ul style="padding-left: 1em">
                      <li><b>+ Sell Prepaid Within BL</b></li>
                      <li><b>+ Sell Collect Within BL</b></li>
                      <li><b>- Buy Prepaid Within BL</b></li>
                      <li><b>- Buy Collect Within BL</b></li>
                    </ul>
                    <br />
                    <b>Fórmula:</b><br />
                    <code>
                      (Sell Prepaid Within BL + Sell Collect Within BL) - (Buy Prepaid Within BL + Buy Collect Within
                      BL)
                    </code>
                    <br /><br />
                    <b>Nota:</b> Solo se consideran los conceptos de flete dentro del BL (Bill of Lading).
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
                    Suma: <b>total de cargos</b> (amount_total)<br />
                    Resta: <b>pagos realizados</b> (amount_paid) y <b>reembolsos</b> (refunds).<br />
                    <br />
                    <b>Fórmula:</b><br />
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
                      >Profit Operativo sin Demoras (USD)
                      <v-icon size="small" class="ml-1">mdi-information-outline</v-icon>
                    </span>
                  </template>
                  <span>
                    <b>Profit</b> se calcula sumando y restando los siguientes conceptos:<br />
                    <ul style="padding-left: 1em">
                      <li><b>+ Total sell</b></li>
                      <li><b>+ Credit notes</b></li>
                      <li><b>+ Debit notes</b></li>
                      <li><b>- Warranty deposit</b></li>
                      <li><b>- Supplier invoice</b></li>
                      <li><b>- Total buy</b></li>
                      <li><b>- Rebate</b></li>
                    </ul>
                    <br />
                    <b>Fórmula:</b><br />
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
                      >Profit demoras (USD)
                      <v-icon size="small" class="ml-1">mdi-information-outline</v-icon>
                    </span>
                  </template>
                  <span>
                    <b>Profit demoras</b> muestra la utilidad generada únicamente por los conceptos de demoras
                    (demurrages).<br /><br />
                    <b>Fórmula:</b><br />
                    <ul style="padding-left: 1em">
                      <li><b>Profit demoras = (Total Sell Demurrages + IVA) - (Total Buy Demurrages + IVA)</b></li>
                    </ul>
                    <br />
                    <b>Detalle:</b><br />
                    <ul style="padding-left: 1em">
                      <li>
                        <b>Total Sell Demurrages:</b> Suma de los montos facturados al cliente por demoras
                        (<code>amount</code>)
                      </li>
                      <li><b>IVA Sell:</b> Suma de IVA facturado al cliente por demoras (<code>amount_iva</code>)</li>
                      <li>
                        <b>Total Buy Demurrages:</b> Suma de los costos pagados al proveedor por demoras
                        (<code>line_cost</code>)
                      </li>
                      <li><b>IVA Buy:</b> Suma de IVA pagado al proveedor por demoras (<code>line_iva</code>)</li>
                    </ul>
                    <br />
                    <b>Profit demoras</b> = (amount + amount_iva) - (line_cost + line_iva)
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
                    <b>Profit Total</b> representa la utilidad neta de la referencia, sumando el
                    <b>Profit Operativo</b> y el <b>Profit de Demoras</b>.<br /><br />
                    <b>Fórmula:</b><br />
                    <ul style="padding-left: 1em">
                      <li>
                        <b>Profit Total = Profit Operativo + Profit Demoras</b>
                      </li>
                    </ul>
                    <br />
                    <b>Profit Operativo</b> incluye:<br />
                    <ul style="padding-left: 1em">
                      <li><b>+ Total sell</b></li>
                      <li><b>+ Credit notes</b></li>
                      <li><b>+ Debit notes</b></li>
                      <li><b>- Warranty deposit</b></li>
                      <li><b>- Supplier invoice</b></li>
                      <li><b>- Total buy</b></li>
                      <li><b>- Rebate</b></li>
                    </ul>
                    <b>Profit Demoras</b> incluye:<br />
                    <ul style="padding-left: 1em">
                      <li>
                        <b>(Total Sell Demurrages + IVA) - (Total Buy Demurrages + IVA)</b>
                      </li>
                    </ul>
                    <br />
                    <b>Fórmula completa:</b><br />
                    <code>
                      (Total sell + Credit notes + Debit notes - Warranty deposit - Supplier invoice - Total buy -
                      Rebate) + ((Total Sell Demurrages + IVA) - (Total Buy Demurrages + IVA))
                    </code>
                  </span>
                </v-tooltip>
              </div>
              <div class="bg-slate-200 text-right">
                <TotalsInUsd :amounts="getTotalProfitWithDemurrages" />
              </div>
            </div>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>
<script setup lang="ts">
import { permissions } from '@/utils/data/system'
import { currencies } from '~/utils/data/systemData'
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()
const { hasPermission } = useCheckUser()

const props = defineProps({
  referenciaId: {
    type: [String, Number],
    required: true,
  },
})

const getDemurragesBuy = computed(() => {
  return (profitSeaImportRef.value.referencia?.demurrages || []).reduce((acc: any, demurrage: any) => {
    if (acc[2]) {
      acc[2] += parseFloat(demurrage.line_cost || 0)
    } else {
      acc[2] = parseFloat(demurrage.line_cost || 0)
    }
    return acc
  }, {})
})

const getDemurragesBuyIva = computed(() => {
  return (profitSeaImportRef.value.referencia?.demurrages || []).reduce((acc: any, demurrage: any) => {
    if (acc[2]) {
      acc[2] += parseFloat(demurrage.line_iva || 0)
    } else {
      acc[2] = parseFloat(demurrage.line_iva || 0)
    }
    return acc
  }, {})
})

const getDemurragesBuyTotal = computed(() => {
  const totals: Record<number, number> = {}
  addToTotals(totals, getDemurragesBuy.value)
  addToTotals(totals, getDemurragesBuyIva.value)
  return totals
})

const getDemurragesSell = computed(() => {
  return (profitSeaImportRef.value.referencia?.demurrages || []).reduce((acc: any, demurrage: any) => {
    if (acc[2]) {
      acc[2] += parseFloat(demurrage.amount || 0)
    } else {
      acc[2] = parseFloat(demurrage.amount || 0)
    }
    return acc
  }, {})
})

const getDemurragesSellIva = computed(() => {
  return (profitSeaImportRef.value.referencia?.demurrages || []).reduce((acc: any, demurrage: any) => {
    if (acc[2]) {
      acc[2] += parseFloat(demurrage.amount_iva || 0)
    } else {
      acc[2] = parseFloat(demurrage.amount_iva || 0)
    }
    return acc
  }, {})
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
  return (profitSeaImportRef.value.referencia?.ff_notes || []).reduce((acc: any, ffNote: any) => {
    // Agente Credito y TM Debito (positivo)
    // inbound = 1 From Agent, if not From TM
    if (ffNote.inbound === 1 && ffNote.type === 'C') {
      if (acc[ffNote.currency_id]) {
        acc[ffNote.currency_id] += parseFloat(ffNote.signed_amount)
      } else {
        acc[ffNote.currency_id] = parseFloat(ffNote.signed_amount)
      }
    }
    if (ffNote.inbound === 0 && ffNote.type === 'D') {
      if (acc[ffNote.currency_id]) {
        acc[ffNote.currency_id] += parseFloat(ffNote.signed_amount)
      } else {
        acc[ffNote.currency_id] = parseFloat(ffNote.signed_amount)
      }
    }
    return acc
  }, {})
})

const getDebitFfNotes = computed(() => {
  return (profitSeaImportRef.value.referencia?.ff_notes || []).reduce((acc: any, ffNote: any) => {
    // Credito TM y Agente Debito (negativo)
    // inbound = 1 From Agent, if not From TM
    if (ffNote.inbound === 1 && ffNote.type === 'D') {
      if (acc[ffNote.currency_id]) {
        acc[ffNote.currency_id] += parseFloat(ffNote.signed_amount)
      } else {
        acc[ffNote.currency_id] = parseFloat(ffNote.signed_amount)
      }
    }

    if (ffNote.inbound === 0 && ffNote.type === 'C') {
      if (acc[ffNote.currency_id]) {
        acc[ffNote.currency_id] += parseFloat(ffNote.signed_amount)
      } else {
        acc[ffNote.currency_id] = parseFloat(ffNote.signed_amount)
      }
    }
    return acc
  }, {})
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

const addToTotals = (totals: Record<number, number>, source: Record<number, number>, isMinus = false) => {
  for (const [currencyId, amount] of Object.entries(source)) {
    const numericCurrencyId = Number(currencyId)
    if (totals[numericCurrencyId]) {
      totals[numericCurrencyId] += isMinus ? -amount : amount
    } else {
      totals[numericCurrencyId] = isMinus ? -amount : amount
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

const getTotalBuy = computed(() => {
  // merge getBuyTotalCollect and getBuyTotalPrepaid
  const totals: Record<number, number> = {}

  addToTotals(totals, getBuyPrepaidConceptsWithinBl.value)
  addToTotals(totals, getBuyCollectConceptsWithinBl.value)

  return totals
})

const getTotalProfit = computed(() => {
  const totals: Record<number, number> = {}

  addToTotals(totals, getProfitSell.value)
  addToTotals(totals, getCreditFfNotes.value)
  addToTotals(totals, getDebitFfNotes.value)
  addToTotals(totals, getWarrantyDepositConcepts.value, true)
  addToTotals(totals, getSupplierInvoices.value, true)
  addToTotals(totals, getTotalBuy.value, true)
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

const useTotals = () => {
  // const get

  const getSellCollectConcepts = computed(() => {
    let sellConcepts = profitSeaImportRef.value.referencia?.charges.filter((x: any) => x.sell_amount != null) || []
    if (profitSeaImportRef.value.referencia?.sell_ppcc && profitSeaImportRef.value.referencia?.sell_ppcc !== 'C') {
      sellConcepts = []
    }

    return sellConcepts.concat(profitSeaImportRef.value.referencia?.charges || [])
  })

  const getSellLocalCharges = computed(() => {
    return profitSeaImportRef.value.referencia?.charges || []
  })

  const getSellCollectConceptsOutBl = computed(() => {
    let sellConcepts = profitSeaImportRef.value.referencia?.charges
    if (profitSeaImportRef.value.referencia?.sell_ppcc !== 'Collect') {
      sellConcepts = []
    }

    return sellConcepts.concat(
      profitSeaImportRef.value.referencia?.charges?.filter((c: any) => c.fuera_dentro_bl === 'F') || []
    )
  })

  const getSellCollectMxn = computed(() => {
    // loop sellCollectConcepts but only with currency_id === 1
    return getSellCollectConcepts.value.reduce((acc: any, concept: any) => {
      if (concept.currency_id === currencies.find((c: any) => c.name === 'MXN')!.id) {
        return acc + parseFloat(concept.amount)
      }
      return acc
    }, 0)
  })

  const getSellCollectUsd = computed(() => {
    // loop sellCollectConcepts but only with currency_id === 2
    return getSellCollectConcepts.value.reduce((acc: any, concept: any) => {
      if (concept.currency_id === currencies.find((c: any) => c.name === 'USD')!.id) {
        return acc + parseFloat(concept.amount)
      }
      return acc
    }, 0)
  })

  const getSellCollectUsdIVA = computed(() => {
    // loop sellCollectConcepts but only with currency_id === 2
    return getSellCollectConcepts.value.reduce((acc: any, concept: any) => {
      if (concept.currency_id === currencies.find((c: any) => c.name === 'USD')!.id) {
        if (concept.is_con_iva) {
          return acc + parseFloat(concept.amount) * 0.16
        }
      }
      return acc
    }, 0)
  })

  const getSellCollectUsdOutBl = computed(() => {
    // loop sellCollectConcepts but only with currency_id === 2
    return getSellCollectConceptsOutBl.value.reduce((acc: any, concept: any) => {
      if (concept.currency_id === currencies.find((c: any) => c.name === 'USD')!.id) {
        return acc + parseFloat(concept.amount)
      }
      return acc
    }, 0)
  })

  const getSellCollectMxnIVA = computed(() => {
    // loop sellCollectConcepts but only with currency_id === 2
    return getSellCollectConcepts.value.reduce((acc: any, concept: any) => {
      if (concept.currency_id === currencies.find((c: any) => c.name === 'MXN')!.id) {
        if (concept.is_con_iva) {
          return acc + parseFloat(concept.amount) * 0.16
        }
      }
      return acc
    }, 0)
  })

  const getSellCollectMxnOutnBl = computed(() => {
    // loop sellCollectConcepts but only with currency_id === 1
    return getSellCollectConceptsOutBl.value.reduce((acc: any, concept: any) => {
      if (concept.currency_id === currencies.find((c: any) => c.name === 'MXN')!.id) {
        return acc + parseFloat(concept.amount)
      }
      return acc
    }, 0)
  })

  const getDemurragesAmount = computed(() => {
    return (
      profitSeaImportRef.value.referencia?.demurrage_charges?.reduce((acc: any, demurrage: any) => {
        if (demurrage.is_con_iva) {
          return acc + parseFloat(demurrage.amount) * 1.16
        }
      }, 0) || 0
    )
  })

  const totalCollectUsd = computed(() => {
    return getSellCollectUsdOutBl.value + getSellCollectUsdIVA.value + getDemurragesAmount.value
  })

  const totalCollectMxn = computed(() => {
    return getSellCollectMxnOutnBl.value + getSellCollectMxnIVA.value
  })

  return {
    getSellCollectMxn,
    getSellCollectUsd,

    getSellCollectUsdOutBl,
    getSellCollectUsdIVA,
    totalCollectUsd,

    getSellCollectMxnOutnBl,
    getSellCollectMxnIVA,
    totalCollectMxn,

    getDemurragesAmount,
  }
}

const totals = useTotals()

const getSupplierInvoices = computed(() => {
  const supplierInvoices = profitSeaImportRef.value.supplierInvoices
  console.log(supplierInvoices)
  return supplierInvoices.reduce((acc: any, charge: any) => {
    if (acc[charge.currency_id]) {
      acc[charge.currency_id] += parseFloat(charge.amount_total)
    } else {
      acc[charge.currency_id] = parseFloat(charge.amount_total)
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
