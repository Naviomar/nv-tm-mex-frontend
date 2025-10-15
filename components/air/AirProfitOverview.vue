<template>
  <div>
    <v-card color="light-green-lighten-5" class="mb-4">
      <v-card-title>
        <div class="flex items-center justify-between">
          <div class="font-bold"><span class="text-xl">💰</span>Air Service - Totals</div>
          <v-btn icon size="x-small" variant="tonal" color="primary" @click="syncRef">
            <v-icon>mdi-sync</v-icon>
          </v-btn>
        </div>
      </v-card-title>
      <v-card-text>
        <div v-if="!hasPermission(permissions.AirProfitTotals)">
          <v-alert density="compact" type="warning" icon="mdi-alert">
            You lack permission to see this module ({{ permissions.AirProfitTotals }}).
          </v-alert>
        </div>
        <div v-if="hasPermission(permissions.AirProfitTotals)">
          <div class="grid grid-cols-2 gap-2">
            <div class="grid grid-cols-3 divide-x divide-y border divide-slate-400 border-slate-400">
              <div class="text-center text-base bg-slate-600 text-white font-bold">💰 - Sell</div>
              <div class="bg-slate-300 text-center font-bold">Prepaid (USD)</div>
              <div class="bg-slate-300 text-center font-bold">To collect (USD)</div>

              <div class="bg-slate-300 text-center font-bold">Within AWB</div>
              <div class="bg-slate-200 text-right">
                <TotalsInUsd :amounts="getSellPrepaidConceptsWithinAWB" />
              </div>
              <div class="bg-slate-200 text-right">
                <TotalsInUsd :amounts="getSellCollectConceptsWithinAWB" />
              </div>

              <div class="bg-slate-300 text-center font-bold">Out AWB</div>
              <div class="bg-slate-200 text-right">
                <TotalsInUsd :amounts="getSellPrepaidConceptsOutsideAWB" />
              </div>
              <div class="bg-slate-200 text-right">
                <TotalsInUsd :amounts="getSellCollectConceptsOutsideAWB" />
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

              <div class="bg-green-100 text-center font-bold">Within AWB</div>
              <div class="bg-green-50 text-right">
                <TotalsInUsd :amounts="getBuyPrepaidConceptsWithinAWB" />
              </div>
              <div class="bg-green-50 text-right">
                <TotalsInUsd :amounts="getBuyCollectConceptsWithinAWB" />
              </div>

              <div class="bg-green-100 text-center font-bold">Out AWB</div>
              <div class="bg-green-50 text-right">
                <TotalsInUsd :amounts="getBuyPrepaidConceptsOutsideAWB" />
              </div>
              <div class="bg-green-50 text-right">
                <TotalsInUsd :amounts="getBuyCollectConceptsOutsideAWB" />
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
              <div class="bg-slate-300 text-center font-bold">Profit (USD)</div>
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
  airReferenceId: {
    type: [String, Number],
    required: true,
  },
})

const getCreditFfNotes = computed(() => {
  return (profitAirReference.value.airReference?.ff_notes || []).reduce((acc: any, ffNote: any) => {
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
  return (profitAirReference.value.airReference?.ff_notes || []).reduce((acc: any, ffNote: any) => {
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

const getSellCollectConceptsWithinAWB = computed(() => {
  return (profitAirReference.value.airReference?.charges || []).reduce((acc: any, charge: any) => {
    if (charge.sell_ppcc === 'C' && charge.fuera_dentro_awb === 'D') {
      if (acc[charge.sell_currency_id]) {
        acc[charge.sell_currency_id] += parseFloat(charge.sell_amount)
      } else {
        acc[charge.sell_currency_id] = parseFloat(charge.sell_amount)
      }
    }
    return acc
  }, {})
})

const getSellCollectConceptsOutsideAWB = computed(() => {
  return (profitAirReference.value.airReference?.charges || []).reduce((acc: any, charge: any) => {
    if (charge.sell_ppcc === 'C' && charge.fuera_dentro_awb === 'F') {
      if (acc[charge.sell_currency_id]) {
        acc[charge.sell_currency_id] += parseFloat(charge.sell_amount)
      } else {
        acc[charge.sell_currency_id] = parseFloat(charge.sell_amount)
      }
    }
    return acc
  }, {})
})

const getSellPrepaidConceptsWithinAWB = computed(() => {
  return (profitAirReference.value.airReference?.charges || []).reduce((acc: any, charge: any) => {
    if (charge.sell_ppcc === 'P' && charge.fuera_dentro_awb === 'D') {
      if (acc[charge.sell_currency_id]) {
        acc[charge.sell_currency_id] += parseFloat(charge.sell_amount)
      } else {
        acc[charge.sell_currency_id] = parseFloat(charge.sell_amount)
      }
    }
    return acc
  }, {})
})

const getSellPrepaidConceptsOutsideAWB = computed(() => {
  return (profitAirReference.value.airReference?.charges || []).reduce((acc: any, charge: any) => {
    if (charge.sell_ppcc === 'P' && charge.fuera_dentro_awb === 'F') {
      if (acc[charge.sell_currency_id]) {
        acc[charge.sell_currency_id] += parseFloat(charge.sell_amount)
      } else {
        acc[charge.sell_currency_id] = parseFloat(charge.sell_amount)
      }
    }
    return acc
  }, {})
})

const getSellIVAPrepaid = computed(() => {
  return (profitAirReference.value.airReference?.charges || []).reduce((acc: any, charge: any) => {
    if (charge.sell_ppcc === 'P') {
      if (acc[charge.sell_currency_id]) {
        acc[charge.sell_currency_id] += parseFloat(charge.sell_iva)
      } else {
        acc[charge.sell_currency_id] = parseFloat(charge.sell_iva)
      }
    }
    return acc
  }, {})
})

const getSellIVACollect = computed(() => {
  return (profitAirReference.value.airReference?.charges || []).reduce((acc: any, charge: any) => {
    if (charge.sell_ppcc === 'C') {
      if (acc[charge.sell_currency_id]) {
        acc[charge.sell_currency_id] += parseFloat(charge.sell_iva)
      } else {
        acc[charge.sell_currency_id] = parseFloat(charge.sell_iva)
      }
    }
    return acc
  }, {})
})

const getBuyPrepaidConceptsWithinAWB = computed(() => {
  return (profitAirReference.value.airReference?.charges || []).reduce((acc: any, charge: any) => {
    if (charge.buy_amount != null && charge.buy_ppcc === 'P' && charge.fuera_dentro_awb === 'D') {
      acc[charge.buy_currency_id] = (acc[charge.buy_currency_id] || 0) + parseFloat(charge.buy_amount)
    }
    return acc
  }, {})
})

const getBuyPrepaidConceptsOutsideAWB = computed(() => {
  return (profitAirReference.value.airReference?.charges || []).reduce((acc: any, charge: any) => {
    if (charge.buy_amount != null && charge.buy_ppcc === 'P' && charge.fuera_dentro_awb === 'F') {
      acc[charge.buy_currency_id] = (acc[charge.buy_currency_id] || 0) + parseFloat(charge.buy_amount)
    }
    return acc
  }, {})
})

const getBuyCollectConceptsWithinAWB = computed(() => {
  return (profitAirReference.value.airReference?.charges || []).reduce((acc: any, charge: any) => {
    if (charge.buy_amount != null && charge.buy_ppcc === 'C' && charge.fuera_dentro_awb === 'D') {
      acc[charge.buy_currency_id] = (acc[charge.buy_currency_id] || 0) + parseFloat(charge.buy_amount)
    }
    return acc
  }, {})
})

const getBuyCollectConceptsOutsideAWB = computed(() => {
  return (profitAirReference.value.airReference?.charges || []).reduce((acc: any, charge: any) => {
    if (charge.buy_amount != null && charge.buy_ppcc === 'C' && charge.fuera_dentro_awb === 'F') {
      acc[charge.buy_currency_id] = (acc[charge.buy_currency_id] || 0) + parseFloat(charge.buy_amount)
    }
    return acc
  }, {})
})

const getBuyIVAPrepaid = computed(() => {
  return (profitAirReference.value.airReference?.charges || []).reduce((acc: any, charge: any) => {
    if (charge.buy_amount != null && charge.buy_ppcc === 'P') {
      acc[charge.buy_currency_id] = (acc[charge.buy_currency_id] || 0) + parseFloat(charge.buy_iva)
    }
    return acc
  }, {})
})

const getBuyIVACollect = computed(() => {
  return (profitAirReference.value.airReference?.charges || []).reduce((acc: any, charge: any) => {
    if (charge.buy_amount != null && charge.buy_ppcc === 'C') {
      acc[charge.buy_currency_id] = (acc[charge.buy_currency_id] || 0) + parseFloat(charge.buy_iva)
    }
    return acc
  }, {})
})

const getBuyTotalPrepaid = computed(() => {
  const totals: Record<number, number> = {}
  addToTotals(totals, getBuyPrepaidConceptsWithinAWB.value)
  addToTotals(totals, getBuyPrepaidConceptsOutsideAWB.value)
  addToTotals(totals, getBuyIVAPrepaid.value)
  return totals
})

const getBuyTotalCollect = computed(() => {
  const totals: Record<number, number> = {}
  addToTotals(totals, getBuyCollectConceptsWithinAWB.value)
  addToTotals(totals, getBuyCollectConceptsOutsideAWB.value)
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
  addToTotals(totals, getSellPrepaidConceptsWithinAWB.value)
  addToTotals(totals, getSellPrepaidConceptsOutsideAWB.value)
  addToTotals(totals, getSellIVAPrepaid.value)

  return totals
})

const getSellTotalCollect = computed(() => {
  const totals: Record<number, number> = {}

  // Add values from each computed property
  addToTotals(totals, getSellCollectConceptsWithinAWB.value)
  addToTotals(totals, getSellCollectConceptsOutsideAWB.value)
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

  addToTotals(totals, getProfitSell.value)
  addToTotals(totals, getCreditFfNotes.value)
  addToTotals(totals, getDebitFfNotes.value)
  addToTotals(totals, getSupplierInvoices.value, true)
  addToTotals(totals, getTotalBuy.value, true)

  return totals
})

const getPendingPayment = computed(() => {
  return (profitAirReference.value.airReference?.charges || [])
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
  return (profitAirReference.value.airReference?.charges || [])
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
  return (profitAirReference.value.refunds || []).reduce((acc: any, refund: any) => {
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
    let sellConcepts = profitAirReference.value.airReference?.charges.filter((x: any) => x.sell_amount != null) || []
    if (profitAirReference.value.airReference?.sell_ppcc && profitAirReference.value.airReference?.sell_ppcc !== 'C') {
      sellConcepts = []
    }

    return sellConcepts.concat(profitAirReference.value.airReference?.charges || [])
  })

  const getSellLocalCharges = computed(() => {
    return profitAirReference.value.airReference?.charges || []
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
    let sellConcepts = profitAirReference.value.airReference?.charges
    if (profitAirReference.value.airReference?.sell_ppcc !== 'Collect') {
      sellConcepts = []
    }

    return sellConcepts.concat(
      profitAirReference.value.airReference?.charges?.filter((c: any) => c.fuera_dentro_bl === 'F') || []
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
      profitAirReference.value.airReference?.demurrage_charges?.reduce((acc: any, demurrage: any) => {
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

    getCurrencyTotalsLocalCharges,
  }
}

const totals = useTotals()

const getSupplierInvoices = computed(() => {
  const supplierInvoices = profitAirReference.value.supplierInvoices
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

const profitAirReference = ref<any>({
  airReference: {},
  supplierInvoices: [],
  refunds: [],
})
// const referencia = ref<any>({})

const syncRef = async () => {
  await getAirReference()
  snackbar.add({
    type: 'success',
    text: 'Data updated',
  })
}

const getAirReference = async () => {
  try {
    loadingStore.loading = true
    const response = await $api.airReferences.getAirRferenceProfitById(props.airReferenceId.toString())
    profitAirReference.value = response
  } catch (error) {
    console.error(error)
  } finally {
    setTimeout(() => {
      loadingStore.loading = false
    }, 250)
  }
}

onMounted(async () => {
  if (hasPermission(permissions.AirProfitTotals)) {
    await getAirReference()
  }
})
</script>
