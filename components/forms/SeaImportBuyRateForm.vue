<template>
  <div>
    <v-card density="compact">
      <v-card-title>Buy Rate (USD)</v-card-title>
      <v-card-text>
        <div class="grid grid-cols-2 gap-2">
          <div>
            <InputText
              name="buy_rate"
              density="compact"
              variant="solo-filled"
              label="Buy rate amount"
              readonly
              prepend-inner-icon="mdi-currency-usd"
            />
          </div>
          <div class="">
            <InputAutocomplete
              name="buy_rate_type"
              density="compact"
              label="PPCC"
              :items="[{ name: 'Prepaid' }, { name: 'Collect' }]"
              item-title="name"
              variant="solo-filled"
              @update:model-value="save"
            />
          </div>
        </div>
        <div v-if="values.buy_rate_type">
          <v-btn color="primary" size="small" @click="toggleBreakdown">
            <v-icon>mdi-calculator</v-icon> View breakdown
          </v-btn>
        </div>
        <v-dialog v-model="showBreakdown" fullscreen>
          <v-card>
            <v-toolbar color="primary">
              <v-btn icon @click="toggleBreakdown">
                <v-icon>mdi-close</v-icon>
              </v-btn>
              <v-toolbar-title>Buy rate detail</v-toolbar-title>
              <v-spacer></v-spacer>
              <v-toolbar-items>
                <v-btn variant="text" @click="save"> Save changes </v-btn>
              </v-toolbar-items>
            </v-toolbar>
            <v-card-title>
              <div class="mb-4">
                <div class="flex justify-center">
                  <v-card dense color="primary" width="300">
                    <v-card-title>Buy rate</v-card-title>
                    <v-card-text>
                      <div class="text-4xl font-bold">{{ values.buy_rate }}</div>
                      <div>{{ values.buy_rate_type }}</div>
                      <div v-if="isPrepaid" class="whitespace-break-spaces">
                        Nota: No hay flete, los cargos que agregue son cargos locales.
                      </div>
                      <div v-if="isCollect" class="whitespace-break-spaces">
                        Nota: Si hay cargos de flete y pueden existir cargos locales.
                      </div>
                    </v-card-text>
                  </v-card>
                </div>
              </div>
              <div class="flex justify-between">
                <div>Buy rate charge(s)</div>
                <div v-if="canManipulateCharges">
                  <v-btn icon size="x-small" @click="toggleChargeForm" :color="showChargeForm ? 'black' : 'success'">
                    <v-icon v-if="showChargeForm">mdi-close</v-icon>
                    <v-icon v-if="!showChargeForm">mdi-plus</v-icon>
                  </v-btn>
                </div>
              </div>
            </v-card-title>
            <v-card-text>
              <div v-if="buyRateCharges.length <= 0">
                <div class="text-center">No buy rate charges added</div>
              </div>
              <div v-if="showChargeForm">
                <div class="font-bold mb-2">
                  <span v-if="isNewCharge">Add new buy charge to the reference</span>
                  <span v-if="!isNewCharge">Edit buy charge</span>
                </div>
                <div :class="{ 'grid grid-cols-5 gap-4': isCollect, 'grid grid-cols-4 gap-4': isPrepaid }">
                  <div v-if="isCollect">
                    <v-autocomplete
                      v-model="form.type"
                      density="compact"
                      label="Flete / Local charge *"
                      :items="[
                        { value: 'flete', name: 'Flete' },
                        { value: 'local', name: 'Local charge' },
                      ]"
                      item-title="name"
                      item-value="value"
                    />
                  </div>
                  <div>
                    <v-autocomplete
                      v-model="form.master_bl"
                      :items="masterBls"
                      density="compact"
                      item-title="name"
                      item-value="name"
                      label="Master BL"
                    />
                  </div>
                  <div>
                    <v-autocomplete
                      v-model="form.charge_id"
                      :items="props.charges"
                      density="compact"
                      item-title="name"
                      item-value="id"
                      label="Buy charge"
                    />
                  </div>
                  <div>
                    <v-text-field v-model="form.amount" type="number" density="compact" label="Amount $" />
                  </div>

                  <div>
                    <v-autocomplete
                      v-model="form.currency_id"
                      :items="currencies"
                      density="compact"
                      item-title="name"
                      item-value="id"
                      label="Currency"
                    />
                  </div>
                </div>
                <div class="flex justify-end">
                  <v-btn color="primary" @click="addCharge">
                    <span v-if="isNewCharge">Add buy charge </span>
                    <span v-if="!isNewCharge">Update buy charge </span>
                  </v-btn>
                </div>
              </div>
              <v-table density="compact">
                <thead>
                  <tr>
                    <th class="w-10"></th>
                    <th>Type</th>
                    <th>Charge</th>
                    <th>Amount</th>
                    <th>Master BL</th>
                    <th>Currency</th>

                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(charge, index) in buyRateCharges" :key="index">
                    <td>
                      <div v-if="canManipulateCharges" class="flex gap-2">
                        <TrashButton item="charge" @click="removeCharge(index)" />
                        <EditButton item="charge" @click="editBuyCharge(charge, index)" />
                      </div>
                    </td>
                    <td>{{ charge.type }}</td>
                    <td>{{ getChargeName(charge.charge_id) }}</td>
                    <td>{{ formatToCurrency(charge.amount) }}</td>
                    <td>{{ charge.master_bl }}</td>
                    <td>{{ currencyName(charge.currency_id) }}</td>

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
import { permissions } from '@/utils/data/system'
import { schemaBuyRate } from '~~/forms/maritimeReferenceForm'

const { $api, $notifications } = useNuxtApp()
const loadingStore = useLoadingStore()
const snackbar = useSnackbar()
const confirm = $notifications.useConfirm()

const { hasPermission } = useCheckUser()

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
  masterBls: {
    type: Array as PropType<any[]>,
    required: false,
  },
  initData: {
    type: Object,
    required: false,
  },
})

const emit = defineEmits(['update:rate', 'add', 'refresh'])

const { handleSubmit, values, errors, meta, handleReset, validate, setValues } = useForm({
  validationSchema: schemaBuyRate,
})

const form = reactive<any>({
  id: null,
  type: null,
  charge_id: null,
  amount: null,
  master_bl: null,
  currency_id: null,
  exchange_rate: 0,
})
const showChargeForm = ref(false)
const buyRateCharges = ref<any>([])
const showBreakdown = ref(false)

const toggleChargeForm = () => {
  showChargeForm.value = !showChargeForm.value

  clearForm()
  // set first master_bl in the list
  if (showChargeForm.value) {
    if (props.masterBls && props.masterBls.length > 0 && props.masterBls[0].name) {
      form.master_bl = props.masterBls[0].name
    }
  }
}

const clearForm = () => {
  form.id = null
  form.type = null
  form.charge_id = null
  form.amount = null
  form.master_bl = null
  form.currency_id = null
  form.exchange_rate = 0
}

const toggleBreakdown = () => {
  showBreakdown.value = !showBreakdown.value
}

const getChargeName = (id: any) => {
  const chargeName = props.charges!.find((item: any) => item.id == id) as any
  return chargeName ? chargeName.name : '-'
}

const currencyName = (id: any) => {
  const currency = props.currencies!.find((item: any) => item.id == id) as any
  return currency ? currency.name : '-'
}

const isPrepaid = computed(() => {
  return values.buy_rate_type === 'Prepaid'
})

const isCollect = computed(() => {
  return values.buy_rate_type === 'Collect'
})

const isNewCharge = computed(() => {
  return !form.id
})

const canManipulateCharges = computed(() => {
  // Si el viaje no está bloqueado, permitir manipular cargos
  if (!props.referencia.voyage_discharge || props.referencia.voyage_discharge.locked_at == null) {
    return true
  }

  // Si el viaje está bloqueado, verificar si el usuario tiene el permiso
  return hasPermission(permissions.SupportRequestAssit) // Cambia el nombre del permiso según tu lógica
})

const saveSeaImportBuyCharges = async () => {
  try {
    loadingStore.start()
    const body = {
      buy_rate_type: values.buy_rate_type,
      charges: buyRateCharges.value,
    }
    const response = await $api.referencias.upsertSeaImportBuyCharges(props.referencia.id, body)
    snackbar.add({ type: 'success', text: 'Charges saved successfully' })
    buyRateCharges.value = response
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
  saveSeaImportBuyCharges()
}

const prepareBody = () => {
  const body = {
    ...values,
    buy_rate_charges: buyRateCharges.value,
  }
  return body
}

const isValidForm = () => {
  if (!form.charge_id || !form.amount || !form.master_bl || !form.currency_id) {
    snackbar.add({ type: 'warning', text: 'Please fill all fields' })
    return false
  }
  return true
}

const addCharge = () => {
  if (!isValidForm()) {
    return
  }
  if (isPrepaid.value) {
    // type is local charge
    form.type = 'local'
  }
  if (isNewCharge.value) {
    buyRateCharges.value.push({ ...form })
  }

  if (!isNewCharge.value) {
    const index = buyRateCharges.value.findIndex((charge: any) => charge.id == form.id)
    buyRateCharges.value[index] = { ...form }
  }

  form.id = null
  form.type = null
  form.charge_id = null
  form.amount = null
  form.master_bl = null
  form.currency_id = null
  form.exchange_rate = 0

  updateBuyRate()
}

function roundToTwoDecimals(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100
}

const updateBuyRate = () => {
  const total = roundToTwoDecimals(
    buyRateCharges.value.reduce((acc: any, charge: any) => {
      return acc + parseFloat(charge.amount)
    }, 0)
  )
  setValues({ buy_rate: total })

  const body = prepareBody()
  emit('update:rate', body)
}

const editBuyCharge = (charge: any, index: any) => {
  form.id = charge.id
  form.type = charge.type
  form.charge_id = charge.charge_id
  form.amount = charge.amount
  form.master_bl = charge.master_bl
  form.currency_id = charge.currency_id
  form.exchange_rate = charge.exchange_rate

  if (!charge.id) {
    // remove charge from the list
    buyRateCharges.value.splice(index, 1)
  }

  showChargeForm.value = true
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
      const body = buyRateCharges.value[index]
      await $api.referencias.deleteSeaImportBuyCharge(props.referencia.id, body)
      buyRateCharges.value.splice(index, 1)
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

const setMasterBls = () => {
  // find masterBl name by id in the list of masterBls
  buyRateCharges.value.forEach((charge: any) => {
    const masterBl = props.masterBls!.find((item: any) => item.id == charge.reference_master_bl_id) as any
    charge.master_bl = masterBl ? masterBl.name : null
  })
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
      buyRateCharges.value = value.charges
      updateBuyRate()
      setMasterBls()
    }
  },
  { immediate: true }
)
</script>
