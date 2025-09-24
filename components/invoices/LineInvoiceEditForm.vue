<template>
  <div>
    <v-card>
      <v-card-title>
        <h1 class="text-xl font-bold">Edit freight line invoice</h1>
      </v-card-title>
      <v-card-text>
        <div class="grid grid-cols-4 gap-2">
          <div class="col-span-4">
            <AGlobalSearch
              :onSearch="searchLines"
              v-model="form.line_id"
              label="Freight line *"
              :set-id="form.line_id"
              hide-details
            />
            <div class="grid grid-cols-2 gap-2 pt-4">
              <v-text-field v-model="form.serie" density="compact" label="Serie" />
              <v-text-field v-model="form.folio" density="compact" label="Folio *" />
            </div>
            <v-text-field v-model="form.invoice_date" density="compact" type="date" label="Invoice date *" />
            <div class="mb-4">
              <div class="font-bold">Actual Attachment</div>
              <ButtonDownloadS3Object :s3Path="lineInvoice.attachment" />
            </div>
            <v-file-input v-model="form.file" density="compact" label="Change attachment" />

            <v-card class="mb-4">
              <v-card-title>
                <div class="font-bold">Linked services</div>
              </v-card-title>
              <v-card-text>
                <v-table density="compact">
                  <thead>
                    <tr>
                      <th class="w-10">Actions</th>
                      <th class="font-bold">ID</th>
                      <th class="font-bold">Reference #</th>
                      <th class="font-bold">Master BL</th>
                      <th class="font-bold">Type</th>
                      <th class="font-bold">Amount</th>
                      <th class="font-bold">Payment(s)</th>
                      <th class="font-bold">Payment status</th>
                      <th class="font-bold">Created at</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(lineInvRef, index) in lineInvoice.refs" :key="`line-inv-ref-${index}`">
                      <td>
                        <TrashButton :item="lineInvRef" @click="confirmDeleteLineInvoiceRef(lineInvRef)" />
                      </td>
                      <td>{{ lineInvRef.id }}</td>
                      <td class="whitespace-nowrap">{{ lineInvRef.referencia?.reference_number }}</td>
                      <td>{{ lineInvRef.master_bl?.name }}</td>
                      <td>{{ lineInvRef.tm_wm }}</td>
                      <td>{{ formatToCurrency(lineInvRef.amount) }}</td>
                      <td>
                        <div
                          v-for="(charge, idx) in lineInvRef.invoice?.charges"
                          :key="`line-inv-ref-${index}-charge-${idx}`"
                        >
                          <div v-for="(payment, idx2) in charge.payments" :key="`payment-${index}`">
                            <v-chip color="blue" text-color="white" small @click="viewPayment(payment)" class="mb-1"
                              ><v-icon>mdi-eye-outline</v-icon>Payment #{{ payment.id }}
                              {{ formatToCurrency(payment.amount) }}</v-chip
                            >
                          </div>
                        </div>
                      </td>
                      <td>
                        <v-chip color="green" text-color="white" v-if="isPaid(lineInvRef)">Paid</v-chip>
                        <v-chip color="red" text-color="white" v-else>Pending</v-chip>
                      </td>
                      <td class="whitespace-nowrap">
                        <UserInfoBadge :item="lineInvRef">
                          {{ formatDateString(lineInvRef.created_at) }}
                        </UserInfoBadge>
                      </td>
                    </tr>
                  </tbody>
                </v-table>
              </v-card-text>
            </v-card>

            <v-card class="mb-4">
              <v-card-title>
                <div class="flex justify-between">
                  <div class="flex items-center gap-2">
                    <v-icon size="x-small">mdi-ship-wheel</v-icon>
                    <div>Search maritime services to add more in invoice (optional)</div>
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
                  <div class="font-bold text-xl">Sea Reference(s) added to line invoice</div>
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
                </div>

                <v-btn color="primary" class="mt-4" @click="updateLineInvoice">Save changes</v-btn>
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
const { $api, $notifications } = useNuxtApp()
const confirm = $notifications.useConfirm()
const snackbar = useSnackbar()
const router = useRouter()
const loadingStore = useLoadingStore()

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
})

const filters = ref<any>({
  masterBl: '',
  masterbls: [],
})

const lineInvoice = ref<any>(null)

const referenciasFound = ref<any>([])
const referenciasFoundSelected = ref<any>([])

const form = ref<any>({
  id: null,
  line_id: null,
  folio: null,
  serie: null,
  invoice_date: null,
  file: null,
})

const isPaid = (lineInvRef: any) => {
  return lineInvRef.invoice?.is_paid === 1
}

const viewPayment = (payment: any) => {
  console.log('payment', payment)
  if (payment.paymentable_type.includes('BankMovement')) {
    router.push(`/transfers/global/view-${payment.paymentable_id}?focusPayable=${payment.id}`)
    return
  }

  snackbar.add({ type: 'error', text: 'Unknown payment type' })
}

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

const confirmDeleteLineInvoiceRef = async (lineInvRef: any) => {
  const result = await confirm({
    title: 'Are you sure?',
    confirmationText: 'Yes, I confirm',
    content: 'Please confirm this action.',
    dialogProps: {
      persistent: true,
      maxWidth: 500,
    },
    confirmationButtonProps: {
      color: 'primary',
    },
  })

  if (result) {
    await deleteLineInvoiceRef(lineInvRef)
  }
}

const deleteLineInvoiceRef = async (lineInvRef: any) => {
  try {
    loadingStore.loading = true
    const body = {
      ...lineInvRef,
    }
    await $api.linePayments.removeLineInvoiceRef(body)
    snackbar.add({ type: 'success', text: 'Service removed from line invoice.' })
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

const updateLineInvoice = async () => {
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
    if (referenciasFoundSelected.value.length > 0 && totalAmount.value == 0) {
      snackbar.add({ type: 'error', text: 'Total amount cannot be zero' })
      return
    }
    // only send form values for referenciasFoundSelected

    loadingStore.loading = true
    const body = {
      ...form.value,
      references:
        referenciasFoundSelected.value.map((ref: any) => ({
          id: ref.id,
          master_bls: ref.master_bls,
          amount_invoice: ref.amount_invoice,
          currency_id: ref.currency_id,
          type: ref.type,
        })) ?? [],
    }
    await $api.linePayments.updateLineInvoice(body)
    snackbar.add({ type: 'success', text: 'Freight line invoice updated.' })
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

const checkMaxAmount = (value: any, referencia: any) => {
  if (value > getBuyTotalRate(referencia)) {
    snackbar.add({ type: 'error', text: 'Amount cannot be greater than buy amount' })
    referencia.amount_invoice = getBuyTotalRate(referencia)
  }
}

const getData = async () => {
  try {
    loadingStore.loading = true
    const response = (await $api.linePayments.getLineInvoiceById(props.id)) as any

    lineInvoice.value = response
    form.value = {
      id: response.id,
      line_id: response.line_id,
      folio: response.folio,
      serie: response.serie,
      invoice_date: response.invoice_date,
      amount: response.amount,
      file: response.file,
    }
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

await getData()
</script>
