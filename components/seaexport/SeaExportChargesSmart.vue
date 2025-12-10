<template>
  <div>
    <v-card>
      <v-card-title>Export charges</v-card-title>
      <v-card-text>
        <div v-if="!props.canEdit">
          <v-alert color="orange" type="error" variant="outlined" density="compact">
            <div class="text-sm">You can not edit charges, voyage is locked.</div>
          </v-alert>
        </div>
        <!-- Tabla de cargos -->
        <div class="py-4">
          <div class="font-bold">Charge details</div>
          <v-table density="compact">
            <thead>
              <tr>
                <th class="font-bold! w-32">Actions</th>
                <th class="font-bold!"></th>
                <th class="font-bold!">Charge</th>
                <th class="font-bold!">F/D BL</th>
                <th class="font-bold!">Type</th>
                <th class="font-bold!">Base</th>
                <th class="font-bold! bg-slate-100">Buy amount</th>
                <th class="font-bold! bg-slate-100">Sell amout</th>
                <th class="font-bold!">Buy owner</th>
                <th class="font-bold!">Created at</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!hasCharges">
                <td colspan="10" class="text-center">No charges found</td>
              </tr>
              <tr v-if="hasCharges">
                <td colspan="6"></td>
                <td class="font-bold!">BUY</td>
                <td class="font-bold!">SELL</td>
                <td colspan="2"></td>
              </tr>

              <tr v-if="hasCharges" v-for="(exportCharge, index) in charges" :key="`sea-export-charge-${index}`">
                <td>
                  <div v-if="!hasLinkInvoice(exportCharge)" class="flex items-center">
                    <v-btn
                      color="primary"
                      icon="mdi-pencil-outline"
                      size="x-small"
                      variant="outlined"
                      class="mr-2"
                      @click="editCharge(exportCharge)"
                    >
                    </v-btn>
                    <v-btn
                      color="error"
                      icon="mdi-delete-outline"
                      size="x-small"
                      variant="outlined"
                      @click="deleteCharge(exportCharge)"
                    >
                    </v-btn>
                  </div>
                </td>
                <td>
                  <div class="flex items-center gap-2">
                    <v-icon size="small">{{ linkedChargeToInvoice(exportCharge) }}</v-icon>
                    <div :class="boxColorBuyOwner(exportCharge)"></div>
                    <v-chip size="small" color="primary">{{ exportCharge.inv_type }}</v-chip>
                  </div>
                </td>
                <td class="whitespace-nowrap">{{ exportCharge.charge?.name }}</td>
                <td class="whitespace-nowrap">{{ exportCharge.fuera_dentro_bl_value }}</td>
                <td class="whitespace-nowrap">{{ exportCharge.charge_type_value }}</td>
                <td class="whitespace-nowrap">
                  <v-tooltip
                    :text="`${exportCharge.base_quantity} * S${formatToCurrency(
                      exportCharge.sell_amount
                    )} B${formatToCurrency(exportCharge.buy_amount)}`"
                  >
                    <template v-slot:activator="{ props }">
                      <div class="flex items-center gap-1">
                        {{ exportCharge.base_quantity }}
                        <v-icon v-bind="props" size="small">mdi-information-outline</v-icon>
                      </div>
                    </template>
                  </v-tooltip>
                </td>
                <td class="whitespace-nowrap">
                  <div v-if="exportCharge.buy_owner">
                    <div class="flex flex-col gap-0">
                      {{ formatToCurrency(exportCharge.buy_total) }} {{ exportCharge.buy_currency?.code }}
                      {{ exportCharge.buy_iva > 0 ? 'has IVA' : '' }}
                      <v-chip size="small">{{ exportCharge.buy_type_value }}</v-chip>
                    </div>
                  </div>
                </td>
                <td class="whitespace-nowrap">
                  <div v-if="exportCharge.is_sell" class="flex flex-col gap-0">
                    {{ formatToCurrency(exportCharge.sell_total) }} {{ exportCharge.sell_currency?.code }}
                    {{ exportCharge.sell_iva > 0 ? 'has IVA' : '' }}
                    <v-chip size="small">{{ exportCharge.sell_type_value }}</v-chip>
                  </div>
                </td>

                <td>{{ exportCharge.buy_owner_value }}</td>
                <td class="whitespace-nowrap">
                  <UserInfoBadge :item="exportCharge">
                    {{ formatDateString(exportCharge.created_at) }}
                  </UserInfoBadge>
                </td>
              </tr>
            </tbody>
          </v-table>
        </div>

        <!-- Formulario para cargo -->
        <div class="py-4">
          <div class="flex flex-wrap gap-2">
            <v-btn
              :color="formCharge.show ? 'red' : 'primary'"
              class="cursor-pointer"
              size="small"
              @click="toggleChargeForm"
              >{{ labelNewCharge }}</v-btn
            >

            <v-btn
              v-if="props.showProformaBtn"
              color="purple"
              size="small"
              class="cursor-pointer"
              @click="goToSeaExportProformas"
              >View proformas</v-btn
            >
          </div>
          <div v-if="formCharge.show" class="py-4 px-2">
            <div class="font-bold text-lg">Charge form</div>
            <div class="grid grid-cols-9 gap-2">
              <div class="col-span-2">
                <v-autocomplete
                  v-model="formCharge.charge.inv_type"
                  density="compact"
                  :items="customerInvTypes"
                  item-title="name"
                  item-value="value"
                  label="Invoice type *"
                  @update:model-value="onInvoiceTypeChange"
                />
              </div>
              <div class="col-span-3">
                <v-autocomplete
                  v-model="formCharge.charge.charge_id"
                  density="compact"
                  :items="filteredCharges"
                  item-title="name"
                  item-value="id"
                  label="Charge *"
                  :disabled="!formCharge.charge.inv_type"
                  :hint="chargeFilterHint"
                  persistent-hint
                />
              </div>
              <div class="col-span-2">
                <v-autocomplete
                  v-model="formCharge.charge.fuera_dentro_bl"
                  density="compact"
                  :items="fueraDentroBls"
                  item-title="name"
                  item-value="value"
                  label="F/D BL *"
                />
              </div>
              <div class="col-span-2">
                <v-autocomplete
                  v-model="formCharge.charge.charge_type"
                  density="compact"
                  label="Type *"
                  :items="chargeTypes"
                  item-title="name"
                  item-value="value"
                  @update:model-value="updateBaseQuantity"
                />
              </div>
            </div>
            <div class="">Select if has sell and buy rates</div>
            <div class="grid grid-cols-2 gap-4">
              <v-checkbox v-model="formCharge.charge.has_sell" density="compact" label="has sell" />
              <v-checkbox v-model="formCharge.charge.has_buy" density="compact" label="has buy" />
            </div>
            <div v-if="formCharge.charge.has_sell" class="grid grid-cols-3 gap-2">
              <div class="col-span-3 font-bold">Sell details</div>
              <v-text-field v-model="formCharge.charge.sell_amount" density="compact" label="Sell amount" />
              <div class="flex gap-2">
                <v-autocomplete
                  v-model="formCharge.charge.sell_currency_id"
                  density="compact"
                  :items="currencies"
                  item-title="name"
                  item-value="id"
                  label="Currency *"
                />
                <v-checkbox v-model="formCharge.charge.is_sell_con_iva" density="compact" label="+ IVA" />
              </div>
              <v-autocomplete
                v-model="formCharge.charge.sell_type"
                density="compact"
                :items="ppccs"
                item-title="name"
                item-value="value"
                label="PP/CC *"
              />
            </div>
            <div v-if="formCharge.charge.has_buy" class="grid grid-cols-4 gap-2">
              <div class="col-span-4 font-bold">Buy details</div>
              <v-autocomplete
                v-model="formCharge.charge.buy_owner"
                density="compact"
                :items="buyOwners"
                item-title="name"
                item-value="value"
                label="Buy owner *"
              />
              <v-text-field v-model="formCharge.charge.buy_amount" density="compact" label="Buy amount" />
              <div class="flex gap-2">
                <v-autocomplete
                  v-model="formCharge.charge.buy_currency_id"
                  density="compact"
                  :items="currencies"
                  item-title="name"
                  item-value="id"
                  label="Currency *"
                />
                <v-checkbox v-model="formCharge.charge.is_buy_con_iva" density="compact" label="+ IVA" />
              </div>
              <v-autocomplete
                v-model="formCharge.charge.buy_type"
                density="compact"
                :items="ppccs"
                item-title="name"
                item-value="value"
                label="PP/CC *"
              />
            </div>

            <v-btn color="primary" @click="saveCharge">{{ labelSaveCharge }}</v-btn>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>
<script setup lang="ts">
import { currencies, customerInvTypes } from '@/utils/data/systemData'

const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()
const router = useRouter()

const props = defineProps({
  referenciaId: {
    type: [String, Number],
    required: true,
  },
  showProformaBtn: {
    type: Boolean,
    default: true,
  },
  canEdit: {
    type: Boolean,
    default: false,
  },
})

const formCharge = ref<any>({
  show: false,
  charge: {
    id: null,
    has_sell: false,
    has_buy: false,
    charge_id: null,
    fuera_dentro_bl: null,
    inv_type: null,
    charge_type: 'B',
    base_quantity: 1,
    buy_amount: null,
    is_buy_con_iva: false,
    buy_currency_id: null,
    buy_type: null,
    sell_amount: null,
    is_sell_con_iva: false,
    sell_currency_id: null,
    sell_type: null,
    buy_owner: null,
  },
})

const catalogs = ref<any>({
  charges: [],
})

const buyOwners = [
  { value: 'F', name: 'Freight line' },
  { value: 'S', name: 'Supplier' },
]

const fueraDentroBls = [
  { value: 'F', name: 'Fuera de BL' },
  { value: 'D', name: 'Dentro de BL' },
]

const chargeTypes = [
  { value: 'C', name: 'Per container' },
  { value: 'B', name: 'Per BL' },
]

const ppccs = [
  { value: 'P', name: 'Prepaid' },
  { value: 'C', name: 'Collect' },
]

const referencia = ref<any>(null)
const charges = ref<any[]>([])

const goToSeaExportProformas = () => {
  router.push(`/maritime/export/operations-${props.referenciaId}-proformas`)
}

const linkedChargeToInvoice = (charge: any) => {
  if (charge.invoice_charge != null) {
    return 'mdi-link'
  }
  return 'mdi-link-off'
}
const hasLinkInvoice = (charge: any) => {
  return charge.invoice_charge != null
}

const hasCharges = computed(() => charges.value.length > 0)

// Filtrar charges según el tipo de factura seleccionado (TM/WM)
// TM: solo charges con clave SAT (code no nulo)
// WM: todos los charges
const filteredCharges = computed(() => {
  if (!catalogs.value?.charges) return []
  
  if (formCharge.value.charge.inv_type === 'tm') {
    // Solo charges con clave SAT (code no vacío)
    return catalogs.value.charges.filter((c: any) => c.code && c.code.trim() !== '')
  }
  
  // WM o sin selección: todos los charges
  return catalogs.value.charges
})

// Hint para mostrar al usuario el filtro aplicado
const chargeFilterHint = computed(() => {
  if (formCharge.value.charge.inv_type === 'tm') {
    return `Only charges with SAT key (${filteredCharges.value.length} available)`
  }
  return ''
})

// Cuando cambia el tipo de factura, limpiar el charge si ya no es válido
const onInvoiceTypeChange = (value: any) => {
  if (formCharge.value.charge.charge_id) {
    const chargeStillValid = filteredCharges.value.some((c: any) => c.id === formCharge.value.charge.charge_id)
    if (!chargeStillValid) {
      formCharge.value.charge.charge_id = null
    }
  }
}

const labelSaveCharge = computed(() => (formCharge.value.charge.id ? 'Update charge' : 'Save charge'))

const labelNewCharge = computed(() => (formCharge.value.show ? 'Close form' : 'New charge'))

const updateBaseQuantity = (value: any) => {
  if (value === 'C') {
    formCharge.value.charge.base_quantity = 1
  }
}

const isValidForm = computed(() => {
  const { charge } = formCharge.value
  // if has not sell and but is invalid
  if (!charge.has_sell && !charge.has_buy) {
    return false
  }
  console.log(charge)
  const isValid =
    charge.charge_id &&
    charge.fuera_dentro_bl &&
    charge.inv_type &&
    charge.charge_type &&
    (charge.has_sell ? charge.sell_amount && charge.sell_currency_id && charge.sell_type : true) &&
    (charge.has_buy ? charge.buy_amount && charge.buy_currency_id && charge.buy_owner && charge.buy_type : true)

  return isValid
})

const boxColorBuyOwner = (charge: any) => {
  return {
    'w-5 h-5 bg-yellow-300': charge.buy_owner_value === 'Freight line',
    'w-5 h-5 bg-red-200': charge.buy_owner_value === 'Supplier',
  }
}

const closeChargeForm = () => {
  formCharge.value.show = false
  formCharge.value.charge = {
    id: null,
    has_sell: false,
    has_buy: false,
    charge_id: null,
    fuera_dentro_bl: null,
    inv_type: null,
    charge_type: 'B',
    base_quantity: 1,
    buy_amount: null,
    is_buy_con_iva: false,
    buy_currency_id: null,
    buy_type: null,
    sell_amount: null,
    is_sell_con_iva: false,
    sell_currency_id: null,
    sell_type: null,
    buy_owner: null,
  }
}

const toggleChargeForm = () => {
  formCharge.value.show = !formCharge.value.show
  formCharge.value.charge = {
    id: null,
    has_sell: false,
    has_buy: false,
    charge_id: null,
    fuera_dentro_bl: null,
    inv_type: null,
    charge_type: 'B',
    base_quantity: 1,
    buy_amount: null,
    is_buy_con_iva: false,
    buy_currency_id: null,
    buy_type: null,
    sell_amount: null,
    is_sell_con_iva: false,
    sell_currency_id: null,
    sell_type: null,
    buy_owner: null,
  }
}

const editCharge = (charge: any) => {
  formCharge.value.show = true
  formCharge.value.charge = {
    id: charge.id,
    has_sell: charge.sell_amount ? true : false,
    has_buy: charge.buy_amount ? true : false,
    charge_id: charge.charge_id,
    inv_type: charge.inv_type,
    fuera_dentro_bl: charge.fuera_dentro_bl,
    charge_type: charge.charge_type,
    base_quantity: charge.base_quantity,
    buy_amount: charge.buy_amount,
    is_buy_con_iva: charge.buy_iva > 0,
    buy_currency_id: charge.buy_currency_id,
    buy_type: charge.buy_type,
    sell_amount: charge.sell_amount,
    is_sell_con_iva: charge.sell_iva > 0,
    sell_currency_id: charge.sell_currency_id,
    sell_type: charge.sell_type,
    buy_owner: charge.buy_owner,
  }
}

const saveCharge = async () => {
  try {
    if (!isValidForm.value) {
      snackbar.add({ type: 'warning', text: 'Please fill all required fields' })
      return
    }
    loadingStore.loading = true
    const response = await $api.referenciasExport.saveSeaExportCharge(
      props.referenciaId.toString(),
      formCharge.value.charge,
      !props.canEdit // withPermission
    )
    snackbar.add({ type: 'success', text: 'Maritime export charge saved' })
    await getExportCharges()
    toggleChargeForm()
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const deleteCharge = async (charge: any) => {
  try {
    loadingStore.loading = true
    const response = await $api.referenciasExport.deleteSeaExportCharge(
      props.referenciaId.toString(),
      charge.id,
      !props.canEdit
    )
    closeChargeForm()
    snackbar.add({ type: 'success', text: 'Maritime export charge deleted' })
    await getExportCharges()
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const mapExportCharges = (charges: any[]) => {
  return charges.map((charge) => {
    const buyOwnerValue = buyOwners.find((item) => item.value === charge.buy_owner)
    return {
      ...charge,
      fuera_dentro_bl_value: charge.fuera_dentro_bl === 'F' ? 'Fuera de BL' : 'Dentro de BL',
      charge_type_value: charge.charge_type === 'C' ? 'Per container' : 'Per BL',
      buy_owner_value: buyOwnerValue?.name,
      sell_type_value: charge.sell_type === 'P' ? 'Prepaid' : 'Collect',
      buy_type_value: charge.buy_type === 'P' ? 'Prepaid' : 'Collect',
    }
  })
}

const getExportCharges = async () => {
  try {
    loadingStore.loading = true
    const response = (await $api.referenciasExport.getSeaExportCharges(props.referenciaId.toString())) as any
    referencia.value = response
    charges.value = mapExportCharges(response.export_charges || [])
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const getCatalogs = async () => {
  try {
    loadingStore.loading = true
    const response = await $api.referenciasExport.getChargeCatalogs()
    catalogs.value = response
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

onMounted(async () => {
  await getCatalogs()
  await getExportCharges()
})

defineExpose({
  getExportCharges,
})
</script>
