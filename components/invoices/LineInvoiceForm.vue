<template>
  <div>
    <v-card>
      <v-card-title>
        <h1 class="text-xl font-bold">Capture freight line invoice</h1>
      </v-card-title>
      <v-card-text>
        <div class="grid grid-cols-4 gap-2">
          <div class="col-span-4">
            <AGlobalSearch
              :onSearch="searchLines"
              v-model="form.line_id"
              itemTitle="name_type"
              label="Freight line *"
            />
            <div class="grid grid-cols-2 gap-2">
              <v-text-field v-model="form.serie" density="compact" label="Serie" />
              <v-text-field v-model="form.folio" density="compact" label="Folio *" />
            </div>
            <v-text-field v-model="form.invoice_date" density="compact" type="date" label="Invoice date *" />
            <div class="p-4">
              <v-alert type="info" variant="outlined" density="compact"> Total amount ${{ totalAmount }} </v-alert>
            </div>
            <v-file-input v-model="form.file" density="compact" label="Attachment" />

            <v-card class="mb-4">
              <v-card-title>
                <div class="flex justify-between">
                  <div class="flex items-center gap-2">
                    <v-icon size="x-small">mdi-ship-wheel</v-icon>
                    <div>Search maritime services</div>
                  </div>
                </div>
              </v-card-title>
              <v-card-text>
                <!-- // Posiblemente se necesite un componente para buscar y pagar facturas -->
                <div class="mb-4">
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <span class="text-sm">Press ENTER to add Master BL numbers to search</span>
                      <v-text-field
                        v-model="filters.masterBl"
                        density="compact"
                        label="Add master bl numbers to search"
                        @keyup.enter="addMasterblToSearch"
                      />
                    </div>
                  </div>
                  <div v-if="filters.masterbls.length > 0">
                    <div>Search by</div>
                    <div>
                      <v-chip
                        v-for="(invoiceNum, index) in filters.masterbls"
                        :key="`inv-${invoiceNum}`"
                        closable
                        class="mr-2 mb-2"
                        @click:close="removeMasterblToSearch(index)"
                      >
                        {{ invoiceNum }}
                      </v-chip>
                    </div>
                    <v-btn color="primary" :loading="loadingStore.loading" class="mt-4" @click="searchReferences"
                      >Search sea reference(s)</v-btn
                    >
                  </div>
                </div>

                <v-alert
                  v-if="referenciasFound.length > 0 && referenciasFoundSelected.length <= 0"
                  density="compact"
                  variant="outlined"
                  type="info"
                  dense
                >
                  Add reference(s) to invoice
                </v-alert>
                <div v-if="referenciasFound.length > 0" class="py-4">
                  <div>Found invoice(s)</div>
                  <v-chip
                    v-for="(referencia, index) in referenciasFound"
                    :key="`inv-found-${index}`"
                    color="green-darken-4"
                    class="mr-2 mb-2"
                    append-icon="mdi-plus"
                    @click="addReferenciaToInvoice(referencia)"
                  >
                    Ref #{{ referencia.reference_number }}
                  </v-chip>
                </div>
                <div v-if="referenciasFoundSelected.length > 0" class="py-4">
                  <div class="font-bold text-xl">Sea Reference(s) added to invoice</div>
                  <div>
                    <v-alert type="info" variant="outlined" density="compact">
                      <v-switch
                        v-model="form.withCreditNote"
                        color="green"
                        density="compact"
                        label="Activate the credit note to exceed the buy amount. "
                        class="px-4"
                        hide-details
                      />
                    </v-alert>
                  </div>
                  <div v-for="(referencia, index) in referenciasFoundSelected" :key="`inv-selected-${index}`">
                    <v-table density="compact" fixed-header>
                      <thead>
                        <tr>
                          <th class="font-bold! w-4">Actions</th>
                          <th class="font-bold!">Sea Reference #</th>
                          <th class="font-bold!">Buy amount</th>
                          <th class="font-bold!">Amount *</th>
                          <th class="font-bold!">Currency</th>
                          <th class="font-bold!">Type (TM / WM) *</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>
                            <v-btn color="red" size="x-small" icon @click="removeReferenciaFromInvoice(index)">
                              <v-icon>mdi-close</v-icon>
                            </v-btn>
                          </td>
                          <td>Ref #{{ referencia.reference_number }}</td>
                          <td>
                            <div>{{ formatToCurrency(getBuyTotalRate(referencia)) }}</div>
                            <v-chip>{{ referencia.buy_rate_type }}</v-chip>
                          </td>
                          <td>
                            <v-text-field
                              v-model="referencia.amount_invoice"
                              type="number"
                              density="compact"
                              :rules="[(v) => !!v || 'Amount is required']"
                              @update:model-value="checkMaxAmount($event, referencia)"
                            />
                          </td>
                          <td>
                            <v-autocomplete
                              v-model="referencia.currency_id"
                              density="compact"
                              label="Currency"
                              :items="currencies"
                              item-title="name"
                              item-value="id"
                              readonly
                              variant="solo-filled"
                            />
                          </td>

                          <td>
                            <v-autocomplete
                              v-model="referencia.type"
                              :items="['TM', 'WM']"
                              density="compact"
                              label="Type *"
                            />
                          </td>
                        </tr>
                      </tbody>
                    </v-table>
                  </div>

                  <div v-if="isGreaterAmount">
                    <v-alert type="warning" variant="outlined" density="compact">
                      A credit note will be generated for the surplus:
                      {{ formatToCurrency(getSurplusAmount) }}
                    </v-alert>
                  </div>

                  <v-btn color="primary" class="mt-4" @click="saveLineInvoice">Create line invoice</v-btn>
                </div>
              </v-card-text>
            </v-card>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>
<script setup lang="ts">
import { currencies } from '@/utils/data/systemData'
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const router = useRouter()
const loadingStore = useLoadingStore()

const filters = ref<any>({
  masterBl: '',
  masterbls: [],
})

const referenciasFound = ref<any>([])
const referenciasFoundSelected = ref<any>([])

const form = ref<any>({
  line_id: null,
  folio: null,
  serie: null,
  invoice_date: null,
  amount: null,
  file: null,
  withCreditNote: false,
})

const getBuyTotalRate = (referencia: any) => {
  let buyConcepts = []
  // Ensure buy_rate_breakdown is an array
  buyConcepts = referencia.buy_rate_breakdown ?? []

  // Filter and map export_charges, then concatenate with buyConcepts
  const exportCharges = (referencia.export_charges ?? [])
    .filter((charge: any) => charge.buy_owner === 'F')
    .map((charge: any) => ({
      amount: charge.buy_total,
      currency_id: charge.buy_currency_id,
    }))

  buyConcepts = buyConcepts.concat(exportCharges)
  // if currency_id is not USD get exchange rate by now

  console.log('buyConcepts', buyConcepts)

  // Calculate the total rate
  return buyConcepts.reduce((acc: any, rate: any) => {
    return acc + parseFloat(rate.amount)
  }, 0)
}

const totalAmount = computed(() => {
  return (
    referenciasFoundSelected.value.reduce((acc: any, referencia: any) => {
      return acc + parseFloat(referencia.amount_invoice)
    }, 0) || 0
  )
})

const addMasterblToSearch = () => {
  if (filters.value.masterBl) {
    // split by comma and remove empty spaces
    filters.value.masterBl = filters.value.masterBl.replace(/\s/g, '')
    const refs = Array.from(new Set(filters.value.masterBl.split(',')))
    // remove duplicates in refs array using set

    refs.forEach((ref) => {
      filters.value.masterbls.push(ref)
    })
    filters.value.masterbls = [...new Set(filters.value.masterbls)]
    filters.value.masterBl = ''
  }
}

const removeMasterblToSearch = (index: number) => {
  filters.value.masterbls?.splice(index, 1)
}

const addReferenciaToInvoice = (referencia: any) => {
  // if referencia is already in the list, do not add it
  if (referenciasFoundSelected.value.find((inv: any) => inv.id === referencia.id)) {
    return
  }
  const refData = JSON.parse(JSON.stringify(referencia))
  // por el momento comentan que USD es la moneda por default
  refData.currency_id = currencies.find((c) => c.id === 2)!.id
  referenciasFoundSelected.value.push(refData)
}

const removeReferenciaFromInvoice = (index: number) => {
  referenciasFoundSelected.value.splice(index, 1)
}

const searchLines = async (search: any) => {
  try {
    const response = await $api.lines.searchLines({
      query: search,
    })
    return response
  } catch (error) {
    snackbar.add({
      type: 'error',
      text: 'Error fetching freight lines',
    })
  }
}

const searchReferences = async () => {
  try {
    referenciasFound.value = []
    referenciasFoundSelected.value = []
    loadingStore.loading = true
    const response: any = await $api.linePayments.searchSeaReferences(filters.value)

    if (response.length <= 0) {
      snackbar.add({ type: 'warning', text: 'No maritime services found' })
    }

    referenciasFound.value = response
  } catch (error) {
    console.error(error)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const saveLineInvoice = async () => {
  try {
    if (!form.value.line_id) {
      snackbar.add({ type: 'error', text: 'Freight line is required' })
      return
    }
    if (!form.value.folio) {
      snackbar.add({ type: 'error', text: 'Folio is required' })
      return
    }
    if (!form.value.invoice_date) {
      snackbar.add({ type: 'error', text: 'Invoice date is required' })
      return
    }

    // referenciasFoundSelected if in array amount is empty or zero, do not save
    if (referenciasFoundSelected.value.some((ref: any) => !ref.amount_invoice || ref.amount_invoice == 0)) {
      snackbar.add({ type: 'error', text: 'Amount for every service selected is required' })
      return
    }

    // if total amount is zero, do not save
    if (totalAmount.value == 0) {
      snackbar.add({ type: 'error', text: 'Total amount cannot be zero' })
      return
    }

    // if surplus amount is 0 or less, do not save
    if (form.value.withCreditNote && getSurplusAmount.value <= 0) {
      snackbar.add({ type: 'error', text: 'Surplus amount cannot be zero or less' })
      return
    }

    // only send form values for referenciasFoundSelected

    loadingStore.loading = true
    const body = {
      ...form.value,
      references: referenciasFoundSelected.value.map((ref: any) => ({
        id: ref.id,
        master_bls: ref.master_bls,
        amount_invoice: ref.amount_invoice,
        currency_id: ref.currency_id,
        type: ref.type,
      })),
    }
    const response = await $api.linePayments.addLineInvoice(body)
    snackbar.add({ type: 'success', text: 'Freight line invoice created' })
    loadingStore.loading = false
    router.push('/invoices/lines/notes')
  } catch (error) {
    console.error(error)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const isGreaterAmount = computed(() => {
  return referenciasFoundSelected.value.some((ref: any) => ref.amount_invoice > getBuyTotalRate(ref))
})

const getSurplusAmount = computed(() => {
  return referenciasFoundSelected.value.reduce((acc: any, ref: any) => {
    return acc + ((ref.amount_invoice || 0) - getBuyTotalRate(ref))
  }, 0)
})

// const isGreaterAmount = (referencia: any) => {
//   return referencia.amount_invoice > getBuyTotalRate(referencia)
// }

// const getSurplusAmount = (referencia: any) => {
//   return referencia.amount_invoice - getBuyTotalRate(referencia)
// }

const checkMaxAmount = (value: any, referencia: any) => {
  if (form.value.withCreditNote) {
    return
  }
  if (value > getBuyTotalRate(referencia)) {
    snackbar.add({ type: 'error', text: 'Amount cannot be greater than buy amount' })
    referencia.amount_invoice = getBuyTotalRate(referencia)
  }
}
</script>
