<template>
  <div>
    <v-card color="light-green-lighten-5" class="mb-4">
      <v-card-title>
        <div class="flex items-center justify-between">
          <div class="font-bold"><span class="text-xl">💰</span>Sea Export - Totals</div>
          <v-btn icon size="x-small" variant="tonal" color="primary" @click="syncRef">
            <v-icon>mdi-sync</v-icon>
          </v-btn>
        </div>
      </v-card-title>
      <v-card-text>
        <div v-if="!hasPermission(permissions.SeaExportProfit)">
          <v-alert density="compact" type="warning" icon="mdi-alert">
            You lack permission to see this module ({{ permissions.SeaExportProfit }})
          </v-alert>
        </div>
        <div v-if="hasPermission(permissions.SeaExportProfit)">
          <div class="grid grid-cols-2 gap-2">
            <div class="grid grid-cols-3 divide-x divide-y border divide-slate-400 border-slate-400">
              <div class="text-center text-base bg-slate-600 text-white font-bold">💰 - Sell</div>
              <div class="bg-slate-300 text-center font-bold">Prepaid (USD)</div>
              <div class="bg-slate-300 text-center font-bold">To collect (USD)</div>

              <div class="bg-slate-300 text-center font-bold">Within BL</div>
              <div class="bg-slate-200 text-right">
                <TotalsInUsd :amounts="getSellPrepaidConceptsWithinBl" />
              </div>
              <div class="bg-slate-200 text-right">
                <TotalsInUsd :amounts="getSellCollectConceptsWithinBl" />
              </div>

              <div class="bg-slate-300 text-center font-bold">Out BL</div>
              <div class="bg-slate-200 text-right">
                <TotalsInUsd :amounts="getSellPrepaidConceptsOutsideBl" />
              </div>
              <div class="bg-slate-200 text-right">
                <TotalsInUsd :amounts="getSellCollectConceptsOutsideBl" />
              </div>

              <div class="bg-slate-300 text-center font-bold">IVA</div>
              <div class="bg-slate-200 text-right">
                <TotalsInUsd :amounts="getSellIVAPrepaid" />
              </div>
              <div class="bg-slate-200 text-right">
                <TotalsInUsd :amounts="getSellIVACollect" />
              </div>

              <div class="bg-slate-300 text-center font-bold">Total</div>
              <div class="bg-slate-200 text-right font-bold">
                <TotalsInUsd :amounts="getSellTotalPrepaid" />
              </div>
              <div class="bg-slate-200 text-right font-bold">
                <TotalsInUsd :amounts="getSellTotalCollect" />
              </div>
            </div>

            <div class="grid grid-cols-3 divide-x divide-y border divide-slate-400 border-slate-400">
              <div class="text-center text-base bg-green-700 text-white font-bold">💸 - Buy</div>
              <div class="bg-green-200 text-center font-bold">Prepaid (USD)</div>
              <div class="bg-green-200 text-center font-bold">To collect (USD)</div>

              <div class="bg-green-100 text-center font-bold">Within BL</div>
              <div class="bg-green-50 text-right">
                <TotalsInUsd :amounts="getBuyPrepaidConceptsWithinBl" />
              </div>
              <div class="bg-green-50 text-right">
                <TotalsInUsd :amounts="getBuyCollectConceptsWithinBl" />
              </div>

              <div class="bg-green-100 text-center font-bold">Out BL</div>
              <div class="bg-green-50 text-right">
                <TotalsInUsd :amounts="getBuyPrepaidConceptsOutsideBl" />
              </div>
              <div class="bg-green-50 text-right">
                <TotalsInUsd :amounts="getBuyCollectConceptsOutsideBl" />
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
              <div class="bg-slate-300 text-center font-bold">Payments (USD)</div>
              <div class="bg-slate-300 text-center font-bold">Pending payment (USD)</div>
              <div class="bg-slate-300 text-center font-bold">Refunds (USD)</div>
              <div class="flex bg-slate-200 text-right items-center justify-end font-bold">
                <TotalsInUsd :amounts="getPaymentAmount" />
              </div>
              <div class="flex bg-slate-200 text-right items-center justify-end font-bold">
                <TotalsInUsd :amounts="getPendingPayment" />
              </div>
              <div class="flex bg-slate-200 text-right items-center justify-end font-bold">
                <TotalsInUsd :amounts="getTotalRefund" />
              </div>
            </div>

            <div class="grid grid-cols-2 divide-x divide-y border divide-slate-400 border-slate-400">
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
                      >Profit (USD)
                      <v-icon size="small" class="ml-1">mdi-information-outline</v-icon>
                    </span>
                  </template>
                  <span>
                    <b>Profit</b> representa la utilidad neta de la referencia, considerando todos los ingresos y
                    egresos principales.<br /><br />
                    <b>¿Cómo se calcula?</b><br />
                    <ul style="padding-left: 1em">
                      <li>
                        <b>+ Total sell</b> (suma de todos los cargos de venta, incluyendo solamente Prepaid + IVA)
                      </li>
                      <li><b>+ Credit notes</b> (notas de crédito a favor)</li>
                      <li><b>+ Debit notes</b> (notas de débito a favor)</li>
                      <li><b>- Supplier invoice</b> (facturas de proveedores)</li>
                      <li>
                        <b>- Total buy</b> (suma de todos los cargos de compra, incluyendo solamente Prepaid + IVA,
                        solo si <b>no</b> hay Supplier invoice)
                      </li>
                      <li><b>- Rebate</b> (rebates aplicados)</li>
                    </ul>
                    <br />
                    <b>Fórmula:</b><br />
                    <ul style="padding-left: 1em">
                      <li>
                        <b>Con Supplier invoice:</b>
                        <code>Profit = (Total sell + Credit notes + Debit notes) - (Supplier invoice + Rebate)</code>
                      </li>
                      <li>
                        <b>Sin Supplier invoice:</b>
                        <code>Profit = (Total sell + Credit notes + Debit notes) - (Total buy + Rebate)</code>
                      </li>
                    </ul>
                    <br />
                    <b>Notas:</b>
                    <ul style="padding-left: 1em">
                      <li>Todos los montos se agrupan por moneda.</li>
                    </ul>
                  </span>
                </v-tooltip>
              </div>
              <div class="bg-slate-200 text-right">
                <TotalsInUsd :amounts="getTotalProfit" />
              </div>
              <div class="bg-slate-300 text-center font-bold">(-) Pending payment</div>
              <div class="bg-slate-200 text-right">
                <TotalsInUsd :amounts="getPendingPayment" />
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

const getCreditFfNotes = computed(() => {
  return (profitSeaExportRef.value.referencia?.ff_notes || []).reduce((acc: any, ffNote: any) => {
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
  return (profitSeaExportRef.value.referencia?.ff_notes || []).reduce((acc: any, ffNote: any) => {
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

const getSellCollectConceptsWithinBl = computed(() => {
  return (profitSeaExportRef.value.referencia?.export_charges || []).reduce((acc: any, charge: any) => {
    if (charge.sell_type === 'C' && charge.fuera_dentro_bl === 'D') {
      if (acc[charge.sell_currency_id]) {
        acc[charge.sell_currency_id] += parseFloat(charge.sell_total_no_iva)
      } else {
        acc[charge.sell_currency_id] = parseFloat(charge.sell_total_no_iva)
      }
    }
    return acc
  }, {})
})

const getSellCollectConceptsOutsideBl = computed(() => {
  return (profitSeaExportRef.value.referencia?.export_charges || []).reduce((acc: any, charge: any) => {
    if (charge.sell_type === 'C' && charge.fuera_dentro_bl === 'F') {
      if (acc[charge.sell_currency_id]) {
        acc[charge.sell_currency_id] += parseFloat(charge.sell_total_no_iva)
      } else {
        acc[charge.sell_currency_id] = parseFloat(charge.sell_total_no_iva)
      }
    }
    return acc
  }, {})
})

const getSellPrepaidConceptsWithinBl = computed(() => {
  return (profitSeaExportRef.value.referencia?.export_charges || []).reduce((acc: any, charge: any) => {
    if (charge.sell_type === 'P' && charge.fuera_dentro_bl === 'D') {
      if (acc[charge.sell_currency_id]) {
        acc[charge.sell_currency_id] += parseFloat(charge.sell_total_no_iva)
      } else {
        acc[charge.sell_currency_id] = parseFloat(charge.sell_total_no_iva)
      }
    }
    return acc
  }, {})
})

const getSellPrepaidConceptsOutsideBl = computed(() => {
  return (profitSeaExportRef.value.referencia?.export_charges || []).reduce((acc: any, charge: any) => {
    if (charge.sell_type === 'P' && charge.fuera_dentro_bl === 'F') {
      if (acc[charge.sell_currency_id]) {
        acc[charge.sell_currency_id] += parseFloat(charge.sell_total_no_iva)
      } else {
        acc[charge.sell_currency_id] = parseFloat(charge.sell_total_no_iva)
      }
    }
    return acc
  }, {})
})

const getSellIVAPrepaid = computed(() => {
  return (profitSeaExportRef.value.referencia?.export_charges || []).reduce((acc: any, charge: any) => {
    if (charge.sell_type === 'P') {
      if (acc[charge.sell_currency_id]) {
        acc[charge.sell_currency_id] += parseFloat(charge.sell_total_only_iva)
      } else {
        acc[charge.sell_currency_id] = parseFloat(charge.sell_total_only_iva)
      }
    }
    return acc
  }, {})
})

const getSellIVACollect = computed(() => {
  return (profitSeaExportRef.value.referencia?.export_charges || []).reduce((acc: any, charge: any) => {
    if (charge.sell_type === 'C') {
      if (acc[charge.sell_currency_id]) {
        acc[charge.sell_currency_id] += parseFloat(charge.sell_total_only_iva)
      } else {
        acc[charge.sell_currency_id] = parseFloat(charge.sell_total_only_iva)
      }
    }
    return acc
  }, {})
})

const getBuyPrepaidConceptsWithinBl = computed(() => {
  return (profitSeaExportRef.value.referencia?.export_charges || []).reduce((acc: any, charge: any) => {
    if (charge.buy_type === 'P' && charge.fuera_dentro_bl === 'D') {
      acc[charge.buy_currency_id] = (acc[charge.buy_currency_id] || 0) + parseFloat(charge.buy_total_no_iva)
    }
    return acc
  }, {})
})

const getBuyPrepaidConceptsOutsideBl = computed(() => {
  return (profitSeaExportRef.value.referencia?.export_charges || []).reduce((acc: any, charge: any) => {
    if (charge.buy_type === 'P' && charge.fuera_dentro_bl === 'F') {
      acc[charge.buy_currency_id] = (acc[charge.buy_currency_id] || 0) + parseFloat(charge.buy_total_no_iva)
    }
    return acc
  }, {})
})

const getBuyCollectConceptsWithinBl = computed(() => {
  return (profitSeaExportRef.value.referencia?.export_charges || []).reduce((acc: any, charge: any) => {
    if (charge.buy_type === 'C' && charge.fuera_dentro_bl === 'D') {
      acc[charge.buy_currency_id] = (acc[charge.buy_currency_id] || 0) + parseFloat(charge.buy_total_no_iva)
    }
    return acc
  }, {})
})

const getBuyCollectConceptsOutsideBl = computed(() => {
  return (profitSeaExportRef.value.referencia?.export_charges || []).reduce((acc: any, charge: any) => {
    if (charge.buy_type === 'C' && charge.fuera_dentro_bl === 'F') {
      acc[charge.buy_currency_id] = (acc[charge.buy_currency_id] || 0) + parseFloat(charge.buy_total_no_iva)
    }
    return acc
  }, {})
})

const getBuyIVAPrepaid = computed(() => {
  return (profitSeaExportRef.value.referencia?.export_charges || []).reduce((acc: any, charge: any) => {
    if (charge.buy_type === 'P') {
      acc[charge.buy_currency_id] = (acc[charge.buy_currency_id] || 0) + parseFloat(charge.buy_total_only_iva)
    }
    return acc
  }, {})
})

const getBuyIVACollect = computed(() => {
  return (profitSeaExportRef.value.referencia?.export_charges || []).reduce((acc: any, charge: any) => {
    if (charge.buy_type === 'C') {
      acc[charge.buy_currency_id] = (acc[charge.buy_currency_id] || 0) + parseFloat(charge.buy_total_only_iva)
    }
    return acc
  }, {})
})

const getBuyTotalPrepaid = computed(() => {
  const totals: Record<number, number> = {}
  addToTotals(totals, getBuyPrepaidConceptsWithinBl.value)
  addToTotals(totals, getBuyPrepaidConceptsOutsideBl.value)
  addToTotals(totals, getBuyIVAPrepaid.value)
  return totals
})

const getBuyTotalCollect = computed(() => {
  const totals: Record<number, number> = {}
  addToTotals(totals, getBuyCollectConceptsWithinBl.value)
  addToTotals(totals, getBuyCollectConceptsOutsideBl.value)
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

const getProfitSell = computed(() => {
  // merge getSellTotalCollect and getSellTotalPrepaid
  const totals: Record<number, number> = {}

  addToTotals(totals, getSellTotalCollect.value)
  addToTotals(totals, getSellTotalPrepaid.value)

  return totals
})

const getTotalBuy = computed(() => {
  // merge getBuyTotalCollect and getBuyTotalPrepaid
  const totals: Record<number, number> = {}

  addToTotals(totals, getBuyTotalCollect.value)
  addToTotals(totals, getBuyTotalPrepaid.value)

  return totals
})

const getTotalProfit = computed(() => {
  const totals: Record<number, number> = {}

  const hasSupplierInvoices = (profitSeaExportRef.value.supplierInvoices || []).length > 0

  addToTotals(totals, getSellTotalPrepaid.value)
  addToTotals(totals, getCreditFfNotes.value)
  addToTotals(totals, getDebitFfNotes.value)
  addToTotals(totals, getSupplierInvoices.value, true)
  if (!hasSupplierInvoices) {
    addToTotals(totals, getBuyTotalPrepaid.value, true)
  }
  addToTotals(totals, getRebate.value, true)

  return totals
})

const getPendingPayment = computed(() => {
  return (profitSeaExportRef.value.referencia?.export_charges || [])
    .filter((charge: any) => charge.sell_amount != null)
    .reduce((acc: any, charge: any) => {
      const pendingAmount = parseFloat(charge.sell_total) - parseFloat(charge.invoice_charge?.amount_paid || 0)
      if (acc[charge.sell_currency_id]) {
        acc[charge.sell_currency_id] += pendingAmount
      } else {
        acc[charge.sell_currency_id] = pendingAmount
      }
      return acc
    }, {})
})

const getPaymentAmount = computed(() => {
  return (profitSeaExportRef.value.referencia?.export_charges || [])
    .filter((charge: any) => charge.sell_amount != null)
    .reduce((acc: any, charge: any) => {
      if (acc[charge.sell_currency_id]) {
        acc[charge.sell_currency_id] += parseFloat(charge.invoice_charge?.amount_paid || 0)
      } else {
        acc[charge.sell_currency_id] = parseFloat(charge.invoice_charge?.amount_paid || 0)
      }
      return acc
    }, {})
})

const getTotalRefund = computed(() => {
  return (profitSeaExportRef.value.refunds || []).reduce((acc: any, refund: any) => {
    if (acc[refund.currency_id]) {
      acc[refund.currency_id] += parseFloat(refund.total_amount)
    } else {
      acc[refund.currency_id] = parseFloat(refund.total_amount)
    }
    return acc
  }, {})
})

const useTotals = () => {
  // const get

  const getSellCollectConcepts = computed(() => {
    let sellConcepts =
      profitSeaExportRef.value.referencia?.export_charges.filter((x: any) => x.sell_amount != null) || []
    if (profitSeaExportRef.value.referencia?.sell_type && profitSeaExportRef.value.referencia?.sell_type !== 'C') {
      sellConcepts = []
    }

    return sellConcepts.concat(profitSeaExportRef.value.referencia?.export_charges || [])
  })

  const getSellLocalCharges = computed(() => {
    return profitSeaExportRef.value.referencia?.export_charges || []
  })

  const getCurrencyTotalsLocalCharges = computed(() => {
    // return an array with the total of each currency
    return getSellLocalCharges.value.reduce((acc: any, charge: any) => {
      if (acc[charge.currency_id]) {
        acc[charge.currency_id] += charge.is_con_iva ? parseFloat(charge.amount) * 1.16 : parseFloat(charge.amount)
      } else {
        acc[charge.currency_id] = charge.is_con_iva ? parseFloat(charge.amount) * 1.16 : parseFloat(charge.amount)
      }
      return acc
    }, {})
  })

  const getSellCollectConceptsOutBl = computed(() => {
    let sellConcepts = profitSeaExportRef.value.referencia?.export_charges
    if (profitSeaExportRef.value.referencia?.sell_type !== 'Collect') {
      sellConcepts = []
    }

    return sellConcepts.concat(
      profitSeaExportRef.value.referencia?.export_charges?.filter((c: any) => c.fuera_dentro_bl === 'F') || []
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

  const totalCollectUsd = computed(() => {
    return getSellCollectUsdOutBl.value + getSellCollectUsdIVA.value
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

    getCurrencyTotalsLocalCharges,
  }
}

const totals = useTotals()

const getSupplierInvoices = computed(() => {
  const supplierInvoices = profitSeaExportRef.value.supplierInvoices
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
  return {
    2: parseFloat(profitSeaExportRef.value.referencia?.rebate_total_amount || 0),
  }
})

const profitSeaExportRef = ref<any>({
  referencia: {},
  supplierInvoices: [],
  refunds: [],
})
// const referencia = ref<any>({})

const syncRef = async () => {
  await getSeaExportProfit()
  snackbar.add({
    type: 'success',
    text: 'Data updated',
  })
}

const getSeaExportProfit = async () => {
  try {
    loadingStore.loading = true
    const response = await $api.referencias.getSeaExportProfit(props.referenciaId.toString())
    profitSeaExportRef.value = response
  } catch (error) {
    console.error(error)
  } finally {
    setTimeout(() => {
      loadingStore.loading = false
    }, 250)
  }
}

onMounted(async () => {
  if (hasPermission(permissions.SeaExportProfit)) {
    await getSeaExportProfit()
  }
})
</script>
