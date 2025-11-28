<template>
  <div>
    <v-card density="compact">
      <v-card-title>Sell Rate (USD)</v-card-title>
      <v-card-text>
        <div class="grid grid-cols-2 gap-2">
          <div>
            <InputText
              name="sell_rate"
              density="compact"
              variant="solo-filled"
              label="Sell rate amount"
              readonly
              prepend-inner-icon="mdi-currency-usd"
            />
          </div>
          <div class="">
            <InputAutocomplete
              name="sell_rate_type"
              density="compact"
              label="PPCC"
              :items="[{ name: 'Prepaid' }, { name: 'Collect' }]"
              item-title="name"
              variant="solo-filled"
              @update:model-value="save"
            />
          </div>
        </div>
        <div v-if="values.sell_rate_type">
          <v-btn color="primary" size="small" @click="toggleBreakdown">
            <v-icon>mdi-calculator</v-icon> View breakdown
          </v-btn>
        </div>
        <v-dialog v-model="showBreakdown" fullscreen>
          <v-card>
            <v-toolbar color="green">
              <v-btn icon @click="toggleBreakdown">
                <v-icon>mdi-close</v-icon>
              </v-btn>
              <v-toolbar-title>Sell rate detail</v-toolbar-title>
              <v-spacer></v-spacer>
              <v-toolbar-items>
                <v-btn variant="text" @click="save"> Save changes </v-btn>
              </v-toolbar-items>
            </v-toolbar>
            <v-card-title>
              <div class="mb-4">
                <div class="flex justify-center">
                  <v-card dense color="green" width="300">
                    <v-card-title>Sell rate</v-card-title>
                    <v-card-text>
                      <div class="text-4xl font-bold">
                        {{ values.sell_rate }}
                      </div>
                      <div>{{ values.sell_rate_type }}</div>
                    </v-card-text>
                  </v-card>
                </div>
              </div>
              <div class="flex justify-between">
                <div>Sell rate charge(s)</div>
                <div v-if="canManipulateCharges">
                  <v-btn icon size="x-small" @click="toggleChargeForm" :color="showChargeForm ? 'black' : 'success'">
                    <v-icon v-if="showChargeForm">mdi-close</v-icon>
                    <v-icon v-if="!showChargeForm">mdi-plus</v-icon>
                  </v-btn>
                </div>
              </div>
            </v-card-title>
            <v-card-text>
              <div v-if="sellRateCharges.length <= 0">
                <div class="text-center">No sell rate charges added</div>
              </div>
              <div v-if="showChargeForm">
                <div>
                  <span v-if="isNewCharge">Add new sell charge</span>
                  <span v-if="!isNewCharge">Edit sell charge</span>
                </div>
                <div class="grid grid-cols-6 gap-4">
                  <div>
                    <v-autocomplete
                      v-model="form.charge_id"
                      :items="props.charges"
                      item-title="name"
                      item-value="id"
                      label="Sell charge"
                      density="compact"
                    />
                  </div>

                  <div>
                    <v-text-field v-model="form.amount" type="number" label="Amount $" density="compact" />
                  </div>

                  <div>
                    <v-autocomplete
                      v-model="form.currency_id"
                      :items="currencies"
                      item-title="name"
                      item-value="id"
                      label="Currency"
                      density="compact"
                    />
                  </div>
                  <div class="">
                    <v-checkbox
                      v-model="form.is_con_iva"
                      density="compact"
                      variant="solo-filled"
                      label="+ IVA"
                      :false-value="0"
                      :true-value="1"
                      @update:model-value="clearInvoiceType"
                    />
                  </div>
                  <div class="">
                    <v-autocomplete
                      v-model="form.tm_wm"
                      density="compact"
                      variant="solo-filled"
                      label="TM / WM"
                      :items="invoiceTypeOptions"
                      item-title="name"
                      item-value="name"
                    />
                  </div>
                  <div>
                    <v-autocomplete
                      v-model="form.has_desglose"
                      :items="[
                        { value: 1, name: 'Yes' },
                        { value: 0, name: 'No' },
                      ]"
                      item-title="name"
                      item-value="value"
                      label="Breakdown in invoice"
                      density="compact"
                    />
                  </div>
                  <div class="">
                    <v-btn color="primary" @click="addCharge">
                      <span v-if="isNewCharge">Add sell charge </span>
                      <span v-if="!isNewCharge">Update sell charge </span>
                    </v-btn>
                  </div>
                </div>
              </div>
              <v-table density="compact">
                <thead>
                  <tr>
                    <th class="w-10"></th>
                    <th>Charge</th>
                    <th>Amount</th>
                    <th>Currency</th>
                    <th>+ iva</th>
                    <th>TM / WM</th>
                    <th>Breakdown?</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(charge, index) in sellRateCharges" :key="index">
                    <td>
                      <div v-if="canManipulateCharges" class="flex gap-2">
                        <TrashButton item="charge" @click="removeCharge(index)" />
                        <EditButton item="charge" @click="editSellCharge(charge, index)" />
                      </div>
                    </td>
                    <td>
                      <v-icon size="small">{{ linkedChargeToInvoice(charge) }}</v-icon>
                      {{ getChargeName(charge.charge_id) }}
                    </td>
                    <td>{{ formatToCurrency(charge.amount) }}</td>
                    <td>{{ currencyName(charge.currency_id) }}</td>
                    <td>{{ charge.is_con_iva ? 'Yes' : 'No' }}</td>
                    <td>{{ charge.tm_wm }}</td>
                    <td>{{ charge.has_desglose ? 'Yes' : 'No' }}</td>
                    <td>
                      <UserInfoBadge :item="charge"></UserInfoBadge>
                    </td>
                  </tr>
                </tbody>
              </v-table>
            </v-card-text>
          </v-card>
        </v-dialog>
      </v-card-text>
    </v-card>
  </div>
</template>
<script setup lang="ts">
import { schemaSellRate } from '~~/forms/maritimeReferenceForm'

const { $api, $notifications } = useNuxtApp()
const loadingStore = useLoadingStore()
const snackbar = useSnackbar()
const confirm = $notifications.useConfirm()

const props = defineProps({
  referencia: {
    type: Object,
    required: true,
  },
  charges: {
    type: Array,
    required: false,
  },
  currencies: {
    type: Array,
    required: false,
  },
  initData: {
    type: Object,
    required: false,
  },
})
const emit = defineEmits(['update:rate', 'add', 'refresh'])

const { handleSubmit, values, errors, meta, handleReset, validate, setValues } = useForm({
  validationSchema: schemaSellRate,
})

const form = reactive({
  id: null,
  charge_id: null,
  amount: null,
  currency_id: null,
  exchange_rate: 0,
  has_desglose: 0,
  is_con_iva: 0,
  tm_wm: null,
})
const showChargeForm = ref(false)
const sellRateCharges = ref<any>([])
const showBreakdown = ref(false)
const invoiceType = [{ name: 'TM' }, { name: 'WM' }]

const invoiceTypeOptions = computed(() => {
  // if + IVA only TM
  if (form.is_con_iva) {
    return invoiceType.filter((item) => item.name == 'TM')
  }
  return invoiceType
})

const canManipulateCharges = computed(() => {
  return !hasAnyInvoice.value && canEditCharges.value
})

const canEditCharges = computed(() => {
  if (!props.referencia.vessel_departure_id || !props.referencia.voyage_departure) {
    return false
  }
  if (!props.referencia.voyage_discharge) {
    return true
  }
  return props.referencia.voyage_discharge.locked_at == null
})

const canUpdateCharges = computed(() => {
  const hasTmInvoices = props.referencia?.invoice_tms?.some((i: any) => i.is_proforma == 0)
  const hasWmInvoices = props.referencia?.invoice_wms?.some((i: any) => i.is_proforma == 0)

  return !hasTmInvoices && !hasWmInvoices
})

const hasAnyInvoice = computed(() => {
  return props.referencia?.invoice_tms?.length > 0 || props.referencia?.invoice_wms?.length > 0
})

const linkedChargeToInvoice = (charge: any) => {
  if (charge.invoice_charge != null) {
    return 'mdi-link'
  }
  return 'mdi-link-off'
}

const clearForm = () => {
  form.id = null
  form.charge_id = null
  form.amount = null
  form.currency_id = null
  form.exchange_rate = 0
  form.has_desglose = 0
  form.is_con_iva = 0
  form.tm_wm = null
}

const toggleChargeForm = () => {
  showChargeForm.value = !showChargeForm.value

  clearForm()
}
const toggleBreakdown = () => {
  showBreakdown.value = !showBreakdown.value
}

const getChargeName = (id: any) => {
  const chargeName = props.charges?.find((item: any) => item.id == id) as any
  return chargeName ? chargeName.name : '-'
}

const currencyName = (id: any) => {
  const currency = props.currencies?.find((item: any) => item.id == id) as any
  return currency ? currency.name : '-'
}

const isNewCharge = computed(() => {
  return !form.id
})

const saveSeaImportSellCharges = async () => {
  try {
    loadingStore.start()
    const body = {
      sell_rate_type: values.sell_rate_type,
      charges: sellRateCharges.value,
    }
    const response = await $api.referencias.upsertSeaImportSellCharges(props.referencia.id, body)
    snackbar.add({ type: 'success', text: 'Charges saved successfully' })
    sellRateCharges.value = response
    emit('refresh')
    toggleBreakdown()
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const onSuccess = async (values: any) => {
  saveSeaImportSellCharges()
}

const prepareBody = () => {
  const body = {
    ...values,
    sell_rate_charges: sellRateCharges.value,
  }
  return body
}

const addCharge = () => {
  if (!form.charge_id || !form.amount || !form.currency_id || !form.tm_wm) {
    snackbar.add({ type: 'warning', text: 'Please fill all fields' })
    return
  }

  if (isNewCharge.value) {
    sellRateCharges.value.push({ ...form })
  } else {
    const index = sellRateCharges.value.findIndex((charge: any) => charge.id == form.id)
    sellRateCharges.value[index] = { ...form }
  }

  form.id = null
  form.charge_id = null
  form.amount = null
  form.currency_id = null
  form.exchange_rate = 0
  form.has_desglose = 0
  form.is_con_iva = 0
  form.tm_wm = null

  updateSellRate()
  toggleChargeForm()
}

const editSellCharge = (charge: any, index: any) => {
  form.id = charge.id
  form.charge_id = charge.charge_id
  form.amount = charge.amount
  form.is_con_iva = charge.is_con_iva
  form.tm_wm = charge.tm_wm
  form.has_desglose = charge.has_desglose
  form.currency_id = charge.currency_id
  form.exchange_rate = charge.exchange_rate

  if (!charge.id) {
    // remove charge from the list
    sellRateCharges.value.splice(index, 1)
  }

  showChargeForm.value = true
}

const clearInvoiceType = (value: any) => {
  form.tm_wm = null
}

function roundToTwoDecimals(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100
}

const updateSellRate = () => {
  const total = roundToTwoDecimals(
    sellRateCharges.value.reduce((acc: any, charge: any) => {
      return acc + parseFloat(charge.amount)
    }, 0)
  )
  setValues({ sell_rate: total })

  const body = prepareBody()
  emit('update:rate', body)
}

const removeCharge = async (index: number) => {
  const result = await confirm({
    title: 'Please confirm',
    confirmationText: 'Yes, delete',
    content: 'Delete cannot be undone. Are you sure you want to delete this charge?',
    dialogProps: {
      persistent: true,
      maxWidth: 500,
    },
    confirmationButtonProps: {
      color: 'primary',
    },
  })

  if (result) {
    try {
      loadingStore.start()
      const body = {
        charge: sellRateCharges.value[index],
      }
      await $api.referencias.deleteSeaImportSellCharge(props.referencia.id, body)
      sellRateCharges.value.splice(index, 1)
      snackbar.add({ type: 'success', text: 'Charge deleted successfully' })
      emit('refresh')
    } catch (e) {
      console.error(e)
    } finally {
      setTimeout(() => {
        loadingStore.stop()
      }, 250)
    }
  }
}

function onInvalidSubmit({ values, errors, results }: any) {
  snackbar.add({ type: 'warning', text: 'Validate form before submit' })
}
const save = handleSubmit(onSuccess, onInvalidSubmit)

// watch initData
watch(
  () => props.initData,
  (value) => {
    if (value) {
      setValues(value)
      sellRateCharges.value = value.charges
      // foreach charges set tm_wm value
      sellRateCharges.value.forEach((charge: any) => {
        charge.tm_wm = charge.inv_type?.toUpperCase()
      })
      updateSellRate()
    }
  },
  { immediate: true }
)
</script>
