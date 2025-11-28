<template>
  <div>
    <v-card class="mb-4">
      <v-card-title>
        <h1 class="font-bold">Report for release payment BLs</h1>
      </v-card-title>
      <v-card-text>
        <div class="grid grid-cols-3 justify-center gap-4 py-4">
          <div class="col-span-1">
            <div class="font-bold text-base">Start adding BLs</div>
            <v-textarea
              v-model="form.inputBls"
              density="compact"
              label="Multiline BLs"
              placeholder="Enter BL by line"
              rows="5"
              hide-details
            />
            <v-btn @click="addBls" size="small" color="primary">
              <div class="flex gap-2">
                <v-icon>mdi-plus</v-icon>
                <div>Add BLs</div>
              </div>
            </v-btn>
          </div>
          <div class="col-span-2">
            <div class="font-bold text-base">{{ countBls }} BLs to search for report:</div>
            <v-list density="compact" max-width="400" class="p-0!">
              <v-list-item
                v-for="(bl, index) in form.bls"
                :key="`bl-${index}`"
                :title="`BL: ${bl}`"
                density="compact"
                class="p-0!"
              >
                <template v-slot:prepend>
                  <v-icon variant="text" size="small">mdi-file-document-outline</v-icon>
                </template>
                <template v-slot:append>
                  <v-btn
                    color="red-lighten-1"
                    icon="mdi-close"
                    variant="text"
                    size="small"
                    @click="removeBl(bl)"
                  ></v-btn>
                </template>
              </v-list-item>
            </v-list>
            <div class="py-4">
              <v-btn @click="searchBlsForReport" color="primary">Search BLs</v-btn>
            </div>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <v-card>
      <v-card-title>
        <h1 class="font-bold">BL results</h1>
      </v-card-title>
      <v-card-text>
        <v-btn color="primary" size="small" @click="exportToExcel">Export to Excel</v-btn>

        <div>
          <v-alert v-if="areDifferentLines" type="warning" density="compact" variant="outlined" class="my-4">
            <div class="font-bold">
              Different shipping lines were found with the BLs to search for. This file cannot be used to schedule BL
              payment.
            </div>
          </v-alert>
        </div>
        <v-table>
          <thead>
            <tr>
              <th>BL</th>
              <th>Freight line</th>
              <th>Buque</th>
              <th>Puerto origen</th>
              <th>Puerto destino</th>
              <th>20DC</th>
              <th>40DC</th>
              <th>Other containers</th>
              <th>ETA</th>
              <th>ETD</th>
              <th class="bg-orange-500!">WM USD</th>
              <th class="bg-orange-500!">TM USD</th>
              <th>Compra $ Flete</th>
              <th>Compra $ Locales</th>
              <th>+ Locales</th>
              <th>Compra $ Total</th>
              <th>FF Credits</th>
              <th>FF Debits</th>
              <th>Supplier Invoices</th>
              <th>Venta BL</th>
              <th>Profit BL</th>
              <th>Venta total</th>
              <th>Profit total</th>
              <th>Profit per container</th>
              <th>Ref #</th>
              <th>Customer</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(referencia, index) in referencias" :key="`result-bl-${index}`">
              <td>{{ refMasterBl(referencia) }}</td>
              <td>{{ referencia.line?.name }}</td>
              <td class="whitespace-nowrap">{{ referencia.voyage_discharge?.print_bl_name }}</td>
              <td>{{ referencia.pol?.name }}</td>
              <td>{{ referencia.pod?.name }}</td>
              <td>{{ countContainer20(referencia) }}</td>
              <td>{{ countContainer40(referencia) }}</td>
              <td>{{ countContainerOthers(referencia) }}</td>
              <td class="whitespace-nowrap">{{ referencia.eta_date }}</td>
              <td class="whitespace-nowrap">{{ referencia.etd_date }}</td>
              <td class="bg-orange-500">{{ formatToCurrency(getTotalSellByInvType(referencia, 'wm')) }}</td>
              <td class="bg-orange-500">{{ formatToCurrency(getTotalSellByInvType(referencia, 'tm')) }}</td>
              <td>{{ formatToCurrency(getTotalBuyFlete(referencia)) }}</td>
              <td>{{ formatToCurrency(getTotalBuyLocal(referencia)) }}</td>
              <td class="min-w-48">
                <v-checkbox v-model="referencia.add_locales" label="Add Locales" color="primary" class="" hide-details>
                  <template #label>
                    <div>Add Locales</div>
                  </template>
                </v-checkbox>
              </td>
              <td>{{ formatToCurrency(getTotalBuyFleteAndLocal(referencia)) }}</td>
              <td>{{ formatToCurrency(getTotalFfCreditNote(referencia)) }}</td>
              <td>{{ formatToCurrency(getTotalFfDebitNote(referencia)) }}</td>
              <td>
                {{ formatToCurrency(getTotalSupplierInvoices(referencia)) }}
              </td>
              <td>{{ formatToCurrency(getTotalBlSell(referencia)) }}</td>
              <td>{{ formatToCurrency(getProfitBl(referencia)) }}</td>
              <td>{{ formatToCurrency(getFullTotalSell(referencia)) }}</td>
              <td>{{ formatToCurrency(getProfitTotal(referencia)) }}</td>
              <td>{{ formatToCurrency(getProfitByContainer(referencia)) }}</td>
              <td class="whitespace-nowrap">{{ referencia.reference_number }}</td>
              <td class="whitespace-nowrap">{{ referencia.consignee?.name }}</td>
              <td class="whitespace-nowrap">
                <v-table density="compact">
                  <thead>
                    <tr>
                      <th class="text-left">F.F. Note #</th>
                      <th class="text-left">Type note</th>
                      <th class="text-left">Amount Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-if="referencia.ff_notes.length === 0">
                      <td colspan="3" class="text-center">No F.F. Notes</td>
                    </tr>
                    <tr v-for="(note, index) in referencia.ff_notes" :key="`ff-note-${index}`">
                      <td>{{ note.service_folio }}</td>
                      <td>
                        {{ note.inbound === 1 ? 'From Agent' : 'From TM' }} -
                        {{ note.type === 'C' ? 'Credit' : 'Debit' }}
                      </td>
                      <td>{{ getCurrencyName(note.currency_id) }} {{ formatToCurrency(note.amount_total) }}</td>
                    </tr>
                  </tbody>
                </v-table>
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card-text>
    </v-card>
  </div>
</template>
<script setup lang="ts">
import { systemLayouts } from '~/utils/data/system'
import { currencies } from '~/utils/data/systemData'
const { $api } = useNuxtApp()
const loadingStore = useLoadingStore()
const snackbar = useSnackbar()
const exchangeRatesStore = useExchangeRatesStore()

const form = ref<any>({
  inputBls: '',
  bls: [],
})

const referencias = ref<any>([])

const countBls = computed(() => form.value.bls.length)
const areDifferentLines = computed(() => {
  const lines = referencias.value.map((r: any) => r.line?.id)
  return new Set(lines).size > 1
})

const addBls = () => {
  let bls = form.value.inputBls.split('\n').map((bl: string) => bl.trim())
  // remove empty
  bls = bls.filter((bl: string) => bl.length > 0)
  form.value.bls = [...form.value.bls, ...bls]
  // unique
  form.value.bls = Array.from(new Set(form.value.bls))
  form.value.inputBls = ''
}

const removeBl = (bl: string) => {
  form.value.bls = form.value.bls.filter((b: string) => b !== bl)
}

const refMasterBl = (referencia: any) => {
  return referencia.master_bls.map((bl: any) => bl.name).join(', ')
}
const countContainer20 = (referencia: any) => {
  return referencia.containers.filter((c: any) => c.container_type?.name?.includes('20')).length
}

const countContainer40 = (referencia: any) => {
  return referencia.containers.filter((c: any) => c.container_type?.name?.includes('40')).length
}

const countContainerOthers = (referencia: any) => {
  return referencia.containers.filter(
    (c: any) => !c.container_type?.name?.includes('20') && !c.container_type?.name?.includes('40')
  ).length
}

// Van sin IVA los montos de WM y TM
const getTotalSellByInvType = (referencia: any, invType: string) => {
  if (referencia.impoExpo === 'I') {
    // localCharges
    const localCharges = referencia.charges
      .filter((x: any) => x.inv_type === invType)
      .reduce((sum: any, c: any) => sum + parseFloat(c.amount), 0)

    // sell_rate_breakdown
    const sellAmount = referencia.sell_rate_breakdown
      .filter((x: any) => x.inv_type === invType)
      .reduce((sum: any, c: any) => sum + parseFloat(c.amount), 0)

    console.log('localCharges', localCharges)
    console.log('sellAmount', sellAmount)
    return localCharges + sellAmount
  }

  if (referencia.impoExpo === 'E') {
    return referencia.export_charges
      .filter((x: any) => x.is_sell === 1 && x.inv_type === invType)
      .reduce((sum: any, c: any) => sum + c.sell_amount * c.base_quantity, 0)
  }

  return 0
}

const getTotalBuyWm = (referencia: any) => {
  if (referencia.impoExpo === 'I') {
    return referencia.buy_rate_breakdown.reduce((acc: number, c: any) => acc + parseFloat(c.amount), 0)
  }
  if (referencia.impoExpo === 'E') {
    // TODO CC o PP
    return referencia.export_charges
      .filter((x: any) => x.buy_owner === 'F')
      .reduce((acc: number, c: any) => {
        const amount = parseFloat(c.buy_amount) || 0 // Ensure amount is a valid number
        const baseQuantity = parseFloat(c.base_quantity) || 1 // Ensure base_quantity is valid, default to 1
        return acc + amount * baseQuantity
      }, 0)
  }
  return 0
}

const getTotalBuyFlete = (referencia: any) => {
  if (referencia.impoExpo === 'I') {
    return referencia.buy_rate_breakdown
      .filter((b: any) => b.type === 'flete')
      .reduce((sum: any, c: any) => sum + parseFloat(c.amount), 0)
  }

  if (referencia.impoExpo === 'E') {
    return referencia.export_charges
      .filter((x: any) => x.buy_owner === 'F' && x.fuera_dentro_bl === 'D')
      .reduce((sum: any, c: any) => sum + parseFloat(c.buy_total), 0)
  }

  return 0
}

const getTotalBuyLocal = (referencia: any) => {
  if (referencia.impoExpo === 'I') {
    return referencia.buy_rate_breakdown
      .filter((b: any) => b.type === 'local')
      .reduce((sum: any, c: any) => sum + parseFloat(c.amount), 0)
  }

  if (referencia.impoExpo === 'E') {
    return referencia.export_charges
      .filter((x: any) => x.buy_owner === 'F' && x.fuera_dentro_bl === 'F')
      .reduce((sum: any, c: any) => sum + parseFloat(c.buy_total), 0)
  }

  return 0
}

const getTotalBuyFleteAndLocal = (referencia: any) => {
  if (referencia.add_locales) {
    return getTotalBuyFlete(referencia) + getTotalBuyLocal(referencia)
  }
  return getTotalBuyFlete(referencia)
}

const getTotalFfCreditNote = (referencia: any) => {
  if (!referencia.ff_notes || referencia.ff_notes.length === 0) {
    return 0
  }

  // Sum all credits where inbound = 1 and type = 'C'
  const creditInbound = referencia.ff_notes
    .filter((n: any) => n.inbound === 1 && n.type === 'C')
    .reduce((sum: any, n: any) => sum + parseFloat(n.amount), 0)

  // Sum all credits where inbound = 0 and type = 'D'
  const creditOutbound = referencia.ff_notes
    .filter((n: any) => n.inbound === 0 && n.type === 'D')
    .reduce((sum: any, n: any) => sum + parseFloat(n.amount), 0)

  // Return the total credit sum
  return creditInbound + creditOutbound
}

const getTotalFfDebitNote = (referencia: any) => {
  if (!referencia.ff_notes || referencia.ff_notes.length === 0) {
    return 0
  }

  // Sum all debits where inbound = 1 and type = 'D'
  const debitInbound = referencia.ff_notes
    .filter((n: any) => n.inbound === 1 && n.type === 'D')
    .reduce((sum: any, n: any) => sum + parseFloat(n.amount), 0)

  // Sum all debits where inbound = 0 and type = 'C'
  const debitOutbound = referencia.ff_notes
    .filter((n: any) => n.inbound === 0 && n.type === 'C')
    .reduce((sum: any, n: any) => sum + parseFloat(n.amount), 0)

  // Return the total debit sum
  return debitInbound + debitOutbound
}

const getTotalSupplierInvoices = (referencia: any) => {
  return referencia.supplier_invoices.reduce((acc: number, c: any) => {
    const exRate = exchangeRatesStore.getExchangeRate(c.currency_id, 2) // to USD
    return acc + parseFloat(c.amount) * exRate
  }, 0)
}

const getTotalBlSell = (referencia: any) => {
  if (referencia.impoExpo === 'I') {
    return getImportTotalBlSell(referencia)
  }
  if (referencia.impoExpo === 'E') {
    return getExportTotalBlSell(referencia)
  }
  return 0
}
const getImportTotalBlSell = (referencia: any) => {
  return referencia.sell_rate_breakdown.reduce(
    (acc: number, c: any) => acc + parseFloat(c.is_con_iva === 1 ? c.amount * 1 : c.amount),
    0
  )
}
const getExportTotalBlSell = (referencia: any) => {
  return referencia.export_charges
    .filter((x: any) => x.is_sell === 1)
    .reduce((acc: number, c: any) => acc + parseFloat(c.sell_amount), 0)
}
const getProfitBl = (referencia: any) => {
  return getTotalBlSell(referencia) - getTotalBuyWm(referencia)
}
const getFullTotalSell = (referencia: any) => {
  let sellAmount = getTotalBlSell(referencia)
  let fueraBl = 0
  if (referencia.impoExpo === 'I') {
    fueraBl = referencia.charges.reduce(
      (acc: number, c: any) => acc + parseFloat(c.is_con_iva === 1 ? c.amount * 1 : c.amount),
      0
    )
  }
  if (referencia.impoExpo === 'E') {
    fueraBl = referencia.export_charges
      .filter((x: any) => x.is_sell === 1 && x.fuera_dentro_bl === 'F')
      .reduce((acc: number, c: any) => acc + parseFloat(c.sell_amount), 0)
  }
  return sellAmount + fueraBl
}
const getProfitTotal = (referencia: any) => {
  return (
    getFullTotalSell(referencia) -
    getTotalBuyFleteAndLocal(referencia) -
    getTotalSupplierInvoices(referencia) +
    getTotalFfCreditNote(referencia) -
    getTotalFfDebitNote(referencia)
  )
}
const getProfitByContainer = (referencia: any) => {
  const totalContainers = countContainer20(referencia) + countContainer40(referencia) + countContainerOthers(referencia)
  return getProfitTotal(referencia) / totalContainers
}

const searchBlsForReport = async () => {
  try {
    // if empty show warning
    if (form.value.bls.length === 0) {
      snackbar.add({ type: 'warning', text: 'Please add BLs to search for report' })
      return
    }
    loadingStore.start()
    const body = {
      bls: form.value.bls,
    }
    const response = (await $api.linePayments.searchBlsForRealeasePayment(body)) as any
    referencias.value = response
    // for reach referencias add add_locales = false
    referencias.value.forEach((r: any) => {
      r.add_locales = false
    })
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const exportToExcel = async () => {
  try {
    loadingStore.start()
    const body = {
      bls: form.value.bls,
    }
    const response = (await $api.linePayments.exportBlsForRealeasePayment(body)) as any

    const blob = new Blob([response], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    const link = document.createElement('a')
    link.href = window.URL.createObjectURL(blob)
    link.download = 'reporte-release-payment-bls.xlsx'
    link.click()
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}
</script>
