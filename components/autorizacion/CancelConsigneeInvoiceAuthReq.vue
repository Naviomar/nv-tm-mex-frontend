<template>
  <div>
    <div class="grid grid-cols-12 gap-2">
      <div class="col-span-2">
        <h1 class="text-xl font-bold">Auth Request</h1>
        <v-btn to="/auth-requests" color="slate" size="small" variant="outlined">
          <v-icon>mdi-arrow-left</v-icon> Back
        </v-btn>
        <div class="py-4">
          <v-alert color="warning" density="compact" variant="outlined" class="mb-2">
            <span>Authorization Pending</span>
          </v-alert>
          <v-alert color="warning" density="compact" variant="outlined" class="mb-2">
            Modify reference charge(s) to proceed if necessary
          </v-alert>
          <v-alert color="warning" density="compact" variant="outlined" class="mb-2">
            <div>Requested by: {{ authRequest?.auth_request?.requested?.name }}</div>
            <div>Reason: {{ authRequest?.auth_request?.request_reason }}</div>
            <div>Response: {{ authRequest?.authorized_reason }}</div>
          </v-alert>
        </div>
      </div>
      <div class="col-span-10">
        <v-card>
          <v-card-title>
            <h1 class="text-xl font-bold">
              Cancelling Invoice {{ props.invoiceType.toUpperCase() }} #{{ authRequest?.auth_request?.resource_id }}
            </h1>
          </v-card-title>
          <v-card-text>
            <div
              v-for="(referencia, index) in invoiceInfo.referencias"
              class="flex justify-around"
              :key="`ref-${index}`"
            >
              <div>Service linked #{{ referencia?.reference_number }}</div>
              <div>
                <v-btn
                  v-if="false"
                  :to="`/maritime/import/service-details-${referencia?.id}`"
                  variant="outlined"
                  size="small"
                  class="mb-1"
                  ><v-icon>mdi-open-in-new</v-icon>View reference</v-btn
                >
              </div>
            </div>

            <v-divider class="my-4" />

            <v-alert color="red-lighten-4" border="start" density="compact" class="mb-4">
              Red one is going to be cancelled.
            </v-alert>
            <div class="text-base font-bold">Customer invoices in Reference</div>
            <v-table>
              <thead>
                <tr>
                  <th class="text-left">Inv. Type</th>
                  <th class="text-left">Invoice #</th>
                  <th class="text-left">Customer</th>
                  <th class="text-left">Proforma/Invoice</th>
                  <th class="text-left">Amount</th>
                  <th class="text-left">Amount paid</th>
                  <th class="text-left">Status</th>
                  <th class="text-left">Created at</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(invoiceTm, index) in invoiceTms" :key="`inv-tm-${index}`" :class="colorInvCss(invoiceTm)">
                  <td>TM</td>
                  <td>{{ invoiceTm.id }}</td>
                  <td>{{ invoiceTm.consignee?.name }}</td>
                  <td>
                    {{ invoiceTm.is_proforma == 0 ? 'Invoice' : 'Proforma' }}
                  </td>
                  <td>
                    <div class="flex items-center gap-1">
                      <v-btn
                        icon="mdi-eye-outline"
                        size="small"
                        variant="text"
                        color="blue-lighten-1"
                        @click="viewDesglose(invoiceTm)"
                      ></v-btn>
                      {{ getCurrencyName(invoiceTm.invoice?.currency_id) }}
                      {{ formatToCurrency(invoiceTm.invoice?.total) }}
                    </div>
                  </td>
                  <td>{{ formatToCurrency(getAmountPaidTotal(invoiceTm)) }}</td>
                  <td>
                    <v-chip size="small" v-if="invoiceTm.deleted_at" color="error">Cancelled</v-chip>
                    <v-chip size="small" v-if="!invoiceTm.deleted_at" color="success">Active</v-chip>
                  </td>
                  <td>{{ formatDateString(invoiceTm.created_at) }}</td>
                </tr>
                <tr v-for="(invoiceWm, index) in invoiceWms" :key="`inv-wm-${index}`" :class="colorInvCss(invoiceWm)">
                  <td>WM</td>
                  <td>{{ invoiceWm.id }}</td>
                  <td>{{ invoiceWm.consignee?.name }}</td>
                  <td>
                    {{ invoiceWm.is_proforma == 0 ? 'Invoice' : 'Proforma' }}
                  </td>
                  <td>
                    <div class="flex items-center gap-1">
                      <v-btn
                        icon="mdi-eye-outline"
                        size="small"
                        variant="text"
                        color="blue-lighten-1"
                        @click="viewDesglose(invoiceWm)"
                      ></v-btn>
                      {{ getCurrencyName(invoiceWm.invoice?.currency_id) }}
                      {{ formatToCurrency(invoiceWm.invoice?.total) }}
                    </div>
                  </td>
                  <td>{{ formatToCurrency(getAmountPaidTotal(invoiceWm)) }}</td>
                  <td>
                    <v-chip size="small" v-if="invoiceWm.deleted_at" color="error">Cancelled</v-chip>
                    <v-chip size="small" v-if="!invoiceWm.deleted_at" color="success">Active</v-chip>
                  </td>
                  <td>{{ formatDateString(invoiceWm.created_at) }}</td>
                </tr>
              </tbody>
            </v-table>

            <v-divider class="my-4" />

            <v-divider class="my-4" />
            <div class="text-base font-bold">Update / modify charges</div>
            <v-btn color="primary" size="small" variant="outlined" class="mb-4" @click="newCharge"
              >Add new charge to the list</v-btn
            >
            <div>
              The following charges will be updated to the service. And all the charges linked to the invoice will be
              deleted.
              <v-alert
                v-if="hasBuyConceptsFormCharges"
                border="start"
                type="warning"
                variant="tonal"
                color="amber"
                density="compact"
                class="mb-4"
              >
                <span
                  >Some charges are linked to buy concepts, please be careful. We do not recommend to cancel the
                  invoice.</span
                >
              </v-alert>
            </div>
            <div v-if="showForm" class="grid grid-cols-7 gap-1">
              <div class="col-span-1">
                <v-autocomplete
                  v-model="charge.servicio"
                  density="compact"
                  label="Service #"
                  :items="invoiceInfo.referencias"
                  item-title="reference_number"
                  item-value="id"
                  return-object
                  variant="solo-filled"
                />
              </div>
              <div v-if="isSeaExportService" class="col-span-1">
                <v-autocomplete
                  v-model="charge.charge_type"
                  density="compact"
                  label="Type *"
                  :items="chargeTypes"
                  item-title="name"
                  item-value="value"
                  variant="solo-filled"
                />
              </div>
              <div class="col-span-2">
                <v-autocomplete
                  v-model="charge.charge_id"
                  density="compact"
                  label="Charge"
                  :items="invoiceInfo.charges"
                  item-title="name"
                  item-value="id"
                  variant="solo-filled"
                />
              </div>
              <div class="">
                <v-text-field
                  v-model="charge.amount"
                  density="compact"
                  variant="solo-filled"
                  label="Amount"
                  prepend-inner-icon="mdi-currency-usd"
                />
              </div>
              <div>
                <v-autocomplete
                  v-model="charge.currency_id"
                  density="compact"
                  label="Currency"
                  :items="currencies"
                  item-title="name"
                  item-value="id"
                  variant="solo-filled"
                />
              </div>
              <div>
                <v-autocomplete
                  v-model="charge.fuera_dentro_bl"
                  density="compact"
                  label="FueraDentro BL"
                  :items="[{ name: 'Fuera BL' }, { name: 'Dentro BL' }]"
                  item-title="name"
                  variant="solo-filled"
                />
              </div>
              <div class="">
                <v-checkbox
                  v-model="charge.is_con_iva"
                  density="compact"
                  variant="solo-filled"
                  label="+ IVA"
                  @update:model-value="updateChargeIva"
                />
              </div>
              <div class="">
                <v-autocomplete
                  v-model="charge.tm_wm"
                  density="compact"
                  variant="solo-filled"
                  label="TM / WM"
                  :items="invoiceType"
                  item-title="name"
                  item-value="name"
                />
              </div>
              <div>
                <v-btn density="compact" variant="outlined" color="green" @click="toggleForm">OK</v-btn>
              </div>
            </div>

            <v-table density="compact">
              <thead>
                <tr>
                  <th class="text-left" width="20"></th>
                  <th class="text-left">Service #</th>
                  <th class="text-left">Charge</th>
                  <th class="text-left">Amount</th>
                  <th class="text-left">+ IVA</th>
                  <th class="text-left">Currency</th>
                  <th class="text-left">Fuera / Dentro BL/AWB</th>

                  <th class="text-left">TM / WM</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in form.charges" :key="`mbl-${index}`">
                  <td>
                    <div v-if="isDemurrageDetentionCharge(item)">
                      <v-tooltip location="top">
                        <template v-slot:activator="{ props }">
                          <v-avatar v-bind="props">
                            <v-icon color="red">mdi-alert-circle</v-icon>
                          </v-avatar>
                        </template>
                        <span>Demurrage & Detentions charges cannot be modified</span>
                      </v-tooltip>
                    </div>
                    <div v-if="!isDemurrageDetentionCharge(item)">
                      <div v-show="!showForm" class="flex">
                        <v-btn
                          size="small"
                          variant="text"
                          icon="mdi-pencil-outline"
                          color="blue-lighten-2"
                          @click="editCharge(item, index)"
                        ></v-btn>
                        <v-btn
                          size="small"
                          variant="text"
                          icon="mdi-delete-outline"
                          color="red-lighten-2"
                          @click="removeCharge(index)"
                        ></v-btn>
                      </div>
                    </div>
                  </td>
                  <td class="whitespace-nowrap">
                    <div v-if="item.servicio">
                      {{ item.servicio.reference_number }}
                    </div>
                    <div v-if="item.serviceable_id">
                      {{ getReferenceNumber(item.serviceable_id) }}
                    </div>
                  </td>
                  <td class="whitespace-nowrap">
                    {{ getChargeName(item.charge_id) }}
                    <div v-if="item.inv_charge?.charge_name">
                      {{ item.inv_charge.charge_name }}
                    </div>
                  </td>
                  <td class="text-right">{{ formatToCurrency(item.amount) }}</td>
                  <td>{{ formatToCurrency(item.amount_iva) }}</td>
                  <td>{{ getCurrencyName(item.currency_id) }}</td>
                  <td>{{ item.fuera_dentro_bl === 'F' ? 'Fuera BL' : 'Dentro BL' }}</td>

                  <td>
                    <div>{{ item.tm_wm }}</div>
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="3" class="text-right font-bold">Total</td>
                  <td colspan="5" class="text-left font-bold">
                    {{ formatToCurrency(newChargesTotal) }}
                  </td>
                </tr>
              </tfoot>
            </v-table>

            <v-divider class="my-4" />
            <v-alert v-if="hasPayments" border="start" variant="tonal" color="error" class="mb-4">
              <span>Invoice has payments!, if you cancel the invoice all related payment will be release.</span>
            </v-alert>

            <v-btn color="error" @click="confirmCancel">Cancel invoice & set charges</v-btn>
          </v-card-text>
        </v-card>
      </div>
    </div>
    <v-dialog v-model="dialogViewInvoice" max-width="600">
      <v-card>
        <v-card-title>
          <h1 class="text-xl font-bold">Invoice details #{{ invoiceDetail?.id }}</h1>
        </v-card-title>
        <v-card-text>
          <v-divider class="my-4" />
          <div class="text-base font-bold">Charges in invoice</div>
          <v-table>
            <thead>
              <tr>
                <th class="text-left">Charge</th>
                <th class="text-left">Amount</th>
                <th class="text-left">IVA</th>
                <th class="text-left">Amount paid</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(charge, index) in invoiceDetail?.invoice_charges" :key="`charge-${index}`">
                <td>{{ charge.charge?.name }}</td>
                <td>{{ formatToCurrency(charge.amount) }}</td>
                <td>{{ formatToCurrency(charge.amount_iva) }}</td>
                <td>{{ formatToCurrency(charge.amount_paid) }}</td>
              </tr>
            </tbody>
          </v-table>
        </v-card-text>
        <v-card-actions>
          <div class="grow"></div>
          <v-btn color="error" @click="dialogViewInvoice = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="formCancel.show" max-width="600">
      <v-card>
        <v-card-title>
          <h1 class="text-xl font-bold">One more thing before cancelling the invoice</h1>
        </v-card-title>
        <v-card-text>
          <v-alert color="orange-lighten-4" border="start" density="compact" class="mb-4">
            <span>Are you sure you want to cancel the invoice?</span>
          </v-alert>
          <v-checkbox
            v-model="formCancel.include_refacturacion"
            label="Add cost for rebilling?"
            color="red"
            density="compact"
          ></v-checkbox>
          <v-divider class="my-4" />
          <div class="flex justify-around">
            <v-btn color="secondary" @click="formCancel.show = false">Close</v-btn>
            <v-btn color="error" @click="cancelInvoice">Yes, cancel invoice</v-btn>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>
<script setup lang="ts">
import { authorizeResources } from '~/utils/data/system'
import { currencies } from '@/utils/data/systemData'
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const router = useRouter()

const authRequestStore = useAuthRequestStore()
const loadingStore = useLoadingStore()

const props = defineProps({
  invoiceType: {
    type: String,
    required: true,
  },
})

const invoiceInfo = ref<any>({
  invoice: null,
  referencias: [],
  charges: [],
})

const formCancel = ref<any>({
  show: false,
  include_refacturacion: false,
})

const form = ref<any>({
  charges: [],
})

const charge = ref<any>({
  charge_id: null,
  amount: null,
  currency_id: null,
  fuera_dentro_bl: null,
  exchange_rate: null,
  is_con_iva: false,
  tm_wm: null,
})

const chargeTypes = [
  { value: 'C', name: 'Per container' },
  { value: 'B', name: 'Per BL' },
]

const dialogViewInvoice = ref(false)
const invoiceDetail = ref<any>(null)

const authRequest = authRequestStore?.authRequest

if (!authRequest) {
  router.push('/auth-requests')
}

const showForm = ref(false)

const toggleForm = () => {
  if (showForm.value === true) {
    charge.value.amount_iva = charge.value.is_con_iva ? charge.value.amount * 0.16 : 0
    // if any form value is empty show alert
    if (
      !charge.value.servicio ||
      !charge.value.charge_id ||
      !charge.value.amount ||
      !charge.value.currency_id ||
      !charge.value.fuera_dentro_bl
    ) {
      snackbar.add({ type: 'error', text: 'Please fill all the fields' })
      return
    }
    if (isSeaExportService.value && !charge.value.charge_type) {
      snackbar.add({ type: 'error', text: 'Please select the charge type' })
      return
    }
    showForm.value = false
  } else {
    showForm.value = true
  }
}

const invoiceType = [{ name: 'TM' }, { name: 'WM' }]

const getInvoiceType = (invoice: any) => {
  const invoiceableType = invoice.invoiceable_type
  if (invoiceableType.includes('Tm')) {
    return 'tm'
  }
  if (invoiceableType.includes('Wm')) {
    return 'wm'
  }
  return 'Unknown'
}

const getReferenceNumber = (id: number) => {
  const referencia = invoiceInfo.value.referencias.find((r: any) => r.id == id)
  return referencia?.reference_number
}

const invoiceTms = computed(() => {
  return invoiceInfo.value?.referencias.flatMap((ref: any) => ref.invoice_tms_all)
})

const invoiceWms = computed(() => {
  return invoiceInfo.value?.referencias.flatMap((ref: any) => ref.invoice_wms_all)
})

const hasPayments = computed(() => {
  // loop invoiceInfo.value.invoice_charge.amount_paid if > 0 return true
  return invoiceInfo.value?.invoice?.invoice_charges.some((charge: any) => charge.amount_paid > 0)
})

const isInvoiceServiceSea = computed(() => {
  return invoiceInfo.value?.invoice?.class_name.includes('Sea')
})
const isInvoiceServiceAir = computed(() => {
  return invoiceInfo.value?.invoice?.class_name.includes('Air')
})

const isSeaExportService = computed(() => {
  return charge.value.servicio?.impoExpo === 'E' && charge.value.servicio?.class_name.includes('Referencia')
})

const viewDesglose = (invoice: any) => {
  dialogViewInvoice.value = true
  invoiceDetail.value = invoice
}

const getCurrenciesTotal = (invoice: any) => {
  if (!invoice.invoice_total) return []
  const totales = Object.keys(invoice.invoice_total).map((currency_id: any) => {
    console.log('currency_id', currency_id)
    console.log('total', invoice.invoice_total[currency_id])
    const currency = currencies.find((c) => c.id == currency_id)
    return `${currency?.name}: ${formatToCurrency(invoice.invoice_total[currency_id])}`
  })
  return totales
}

const getAmountPaidTotal = (invoice: any) => {
  return invoice.invoice_charges.reduce((acc: number, charge: any) => {
    return acc + parseFloat(charge.amount_paid)
  }, 0)
}

const colorInvCss = (invoiceService: any) => {
  const invoiceType = getInvoiceType(invoiceService.invoice)
  if (invoiceService.id === invoiceInfo.value?.invoice?.id && invoiceType === props.invoiceType) {
    return 'bg-red-200 dark:bg-red-800!'
  }
  return ''
}

const newChargesTotal = computed(() => {
  return form.value.charges.reduce((acc: number, charge: any) => {
    return acc + parseFloat(charge.amount) + parseFloat(charge.amount_iva)
  }, 0)
})

const hasBuyConceptsFormCharges = computed(() => {
  return form.value.charges.some((charge: any) => charge.inv_charge?.chargeable?.buy_amount != null)
})

const isDemurrageDetentionCharge = (charge: any) => {
  if (!charge.inv_charge) return false
  return (
    charge.inv_charge.chargeable_type.includes('DemurrageCharge') ||
    charge.inv_charge.chargeable_type.includes('ContainerDetention')
  )
}

const newCharge = () => {
  charge.value = {
    servicio: null,
    charge_id: null,
    amount: 0,
    amount_iva: 0,
    currency_id: null,
    fuera_dentro_bl: null,
    exchange_rate: null,
    is_con_iva: false,
    tm_wm: null,
  }
  // const nCharge = JSON.parse(JSON.stringify(charge.value))
  form.value.charges.push(charge.value)
  toggleForm()
}

const removeCharge = (index: number) => {
  form.value.charges.splice(index, 1)
}

const editCharge = (item: any, index: number) => {
  charge.value = item
  if (!charge.value.servicio) {
    charge.value.servicio = item.inv_charge?.serviceable
  }
  // if (
  //   charge.value.inv_charge?.serviceable?.impoExpo === 'E' &&
  //   charge.value.inv_charge?.serviceable?.class_name.includes('Referencia')
  // ) {
  //   charge.value.charge_type = 'C'
  // }
  toggleForm()
}

const getChargeName = (id: number) => {
  const charge = invoiceInfo.value.charges?.find((c: any) => c.id == id)
  return charge?.name
}

const getCurrencyName = (id: number) => {
  const currency = currencies.find((c: any) => c.id == id)
  return currency?.name
}

const updateChargeIva = (value: boolean) => {
  if (value) {
    charge.value.amount_iva = charge.value.amount * 0.16
  } else {
    charge.value.amount_iva = 0
  }
}

const getInvoiceByType = async () => {
  return await $api.authRequests.getCustomerInvoiceToCancel(authRequest.auth_request.id)
}

const getInvoiceDetails = async () => {
  try {
    loadingStore.start()
    invoiceInfo.value = await getInvoiceByType()

    const invoiceChargesModel: any = []
    const invoiceCharges = JSON.parse(JSON.stringify(invoiceInfo.value?.invoice?.invoice_charges))
    // mold invoiceCharges like charge
    invoiceCharges.forEach((charge: any) => {
      if (isInvoiceServiceSea.value) {
        const newCharge = {
          id: charge.id,
          serviceable_id: charge.serviceable_id,
          serviceable_type: charge.serviceable_type,
          charge_id: charge.charge_id,
          charge_type: charge.chargeable_type.includes('ReferenceExportCharge') ? charge.chargeable.charge_type : null,
          amount: charge.amount,
          amount_iva: charge.amount_iva,
          currency_id: charge.currency_id,
          fuera_dentro_bl: charge.chargeable.fuera_dentro_bl ?? 'F',
          exchange_rate: charge.chargeable.exchange_rate,
          is_con_iva: parseFloat(charge.amount_iva) > 0,
          tm_wm: charge.chargeable.inv_type?.toUpperCase(),
          inv_charge: charge,
        }
        invoiceChargesModel.push(newCharge)
      }
      if (isInvoiceServiceAir.value) {
        const newCharge = {
          id: charge.id,
          serviceable_id: charge.serviceable_id,
          serviceable_type: charge.serviceable_type,
          charge_id: charge.charge_id,
          amount: charge.amount,
          amount_iva: charge.amount_iva,
          currency_id: charge.currency_id,
          fuera_dentro_bl: charge.chargeable.fuera_dentro_awb ?? 'F',
          exchange_rate: charge.chargeable.exchange_rate,
          is_con_iva: parseFloat(charge.amount_iva) > 0,
          tm_wm: charge.chargeable.inv_type?.toUpperCase(),
          inv_charge: charge,
        }
        invoiceChargesModel.push(newCharge)
      }
    })

    form.value.charges = invoiceChargesModel
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const cancelInvoiceByType = async () => {
  // foreach form.value.charges if has serviceable object set serviceable_id and serviceable_type
  form.value.charges.forEach((charge: any) => {
    if (charge.servicio) {
      charge.serviceable_id = charge.servicio.id
      charge.serviceable_type = charge.servicio.class_name
    }
  })
  const body = {
    charges: form.value.charges,
    include_refacturacion: formCancel.value.include_refacturacion,
    invoice_class_name: invoiceInfo.value.invoice.class_name,
    auth_request: authRequest?.auth_request,
    authorized_reason: authRequest?.authorized_reason,
  }
  await $api.authRequests.cancelCustomerInvoice(authRequest?.auth_request?.id, body)
}

const confirmCancel = () => {
  // if some charges are not filled show alert
  if (form.value.charges.some((charge: any) => !charge.charge_id || !charge.amount || !charge.currency_id)) {
    snackbar.add({ type: 'error', text: 'Please fill all the charges' })
    return
  }
  formCancel.value.show = true
}

const cancelInvoice = async () => {
  try {
    loadingStore.start()
    await cancelInvoiceByType()
    snackbar.add({ type: 'success', text: 'Invoice cancelled successfully' })
    router.push('/auth-requests')
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

onMounted(async () => {
  await getInvoiceDetails()
})
</script>
