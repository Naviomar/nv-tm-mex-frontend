<template>
  <div>
    <v-card density="compact" class="mb-2">
      <v-card-title>
        <div class="flex justify-between">
          <div class="flex items-center">
            <v-icon size="x-small">mdi-abacus</v-icon>
            <div class="ml-2 font-bold">Charge(s)</div>
          </div>
          <div v-if="canManipulateCharges">
            <v-btn icon size="x-small" @click="addCharge" :color="showForm ? 'black' : 'success'">
              <v-icon v-if="showForm">mdi-close</v-icon>
              <v-icon v-if="!showForm">mdi-plus</v-icon>
            </v-btn>
          </div>
          <div v-if="hasAnyInvoice || !canEditCharges">
            <v-alert density="compact" size="small" variant="tonal">
              <div class="flex items-center gap-2">
                <v-tooltip location="bottom" max-width="320">
                  <template #activator="{ props }">
                    <v-icon v-bind="props" size="small" class="ml-2 text-gray-400 cursor-pointer"
                      >mdi-information-outline</v-icon
                    >
                  </template>
                  <div class="text-xs leading-relaxed">
                    <div class="font-semibold mb-1">¿Cuándo puedes editar conceptos?</div>
                    <ul class="list-disc pl-4">
                      <li>
                        <span class="font-medium">No puedes editar</span> si
                        <span class="font-mono">Vessel departure</span> <b>y </b>
                        <span class="font-mono">Voyage departure</span> están vacíos o nulos.
                      </li>
                      <li>
                        <span class="font-medium">No puedes editar</span> si el
                        <span class="font-mono">Voyage discharge</span> se encuentra bloqueado.
                      </li>
                      <li>
                        <span class="font-medium">No puedes editar</span> si existen facturas TM o WM generadas para la
                        referencia.
                      </li>
                      <li>
                        <span class="font-medium">Sí puedes editar</span> si el
                        <span class="font-mono">voyage discharge</span> no existe y los campos de salida están
                        presentes.
                      </li>
                    </ul>
                  </div>
                </v-tooltip>
                <div>
                  <div class="text-sm">
                    <template v-if="hasAnyInvoice && !canEditCharges">
                      There are invoices and the voyage is locked.
                    </template>
                    <template v-else-if="hasAnyInvoice"> There are invoices for this reference. </template>
                    <template v-else> The voyage is locked and charges cannot be edited. </template>
                  </div>
                  <v-btn
                    size="small"
                    color="primary"
                    :to="`/maritime/import/ref-${props.referencia?.id}-consignee-charges`"
                    >Go to customer charges configuration</v-btn
                  >
                </div>
              </div>
            </v-alert>
          </div>
        </div>
      </v-card-title>
      <v-card-subtitle>Local charges</v-card-subtitle>
      <v-card-text>
        <div v-if="showForm" class="grid grid-cols-8 gap-1">
          <div class="">
            <InputAutocomplete
              name="tm_wm"
              density="compact"
              variant="solo-filled"
              label="TM / WM"
              :items="invoiceTypeOptions"
              :disabled="editNotAllowInvoiceType"
              item-title="name"
              item-value="name"
              @update:model-value="onInvoiceTypeChange"
            />
          </div>
          <div class="col-span-2">
            <InputAutocomplete
              name="charge_id"
              density="compact"
              label="Charge"
              :items="filteredCharges"
              item-title="name"
              item-value="id"
              variant="solo-filled"
              :disabled="!values.tm_wm"
              :hint="chargeFilterHint"
              persistent-hint
            />
          </div>
          <div class="">
            <InputText
              name="amount"
              density="compact"
              variant="solo-filled"
              label="Amount"
              prepend-inner-icon="mdi-currency-usd"
            />
          </div>
          <div>
            <InputAutocomplete
              name="currency_id"
              density="compact"
              label="Currency"
              :items="currencies"
              item-title="name"
              item-value="id"
              variant="solo-filled"
            />
          </div>
          <div>
            <InputAutocomplete
              name="fuera_dentro_bl"
              density="compact"
              label="FueraDentro BL"
              :items="[{ name: 'Fuera BL' }, { name: 'Dentro BL' }]"
              item-title="name"
              variant="solo-filled"
            />
          </div>
          <div class="">
            <InputCheckbox
              name="is_con_iva"
              density="compact"
              variant="solo-filled"
              label="+ IVA"
              @update:model-value="clearInvoiceType"
            />
          </div>
          <div>
            <v-btn density="compact" variant="outlined" color="red" @click="cancel"><v-icon>mdi-close</v-icon></v-btn>
            <v-btn density="compact" variant="outlined" color="green" @click="save"><v-icon>mdi-plus</v-icon></v-btn>
          </div>
        </div>

        <v-table density="compact">
          <thead>
            <tr>
              <th v-if="canManipulateCharges" class="text-left w-28"></th>
              <th class="text-left">Charge</th>
              <th class="text-left">Amount</th>
              <th class="text-left">Currency</th>
              <th class="text-left">Fuera / Dentro BL</th>
              <th class="text-left">+ IVA</th>
              <th class="text-left">TM / WM</th>
              <th class="text-left">Created at</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in charges" :key="`mbl-${index}`">
              <td v-if="canManipulateCharges">
                <div v-show="!showForm" class="flex flex-wrap">
                  <div>
                    <v-btn
                      size="x-small"
                      variant="text"
                      icon="mdi-pencil-outline"
                      color="blue-lighten-2"
                      dense
                      @click="editCharge(item, index)"
                    ></v-btn>
                    <v-btn
                      size="x-small"
                      variant="text"
                      icon="mdi-delete-outline"
                      color="red-lighten-2"
                      dense
                      @click="removeCharge(index)"
                    ></v-btn>
                  </div>
                </div>
              </td>
              <td>
                <v-icon size="small">{{ linkedChargeToInvoice(item) }}</v-icon>
                {{ getChargeName(item.charge_id) }}
              </td>
              <td>{{ formatToCurrency(item.amount) }}</td>
              <td>{{ getCurrencyName(item.currency_id) }}</td>
              <td>{{ item.fuera_dentro_bl }}</td>
              <td>{{ item.is_con_iva == 1 ? 'Yes' : 'No' }}</td>
              <td>
                <div>{{ item.tm_wm ? item.tm_wm.toUpperCase() : '' }}</div>
              </td>
              <td class="whitespace-nowrap">
                <UserInfoBadge :item="item">
                  {{ formatDateString(item.created_at) }}
                </UserInfoBadge>
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card-text>
    </v-card>
  </div>
</template>
<script setup lang="ts">
import { schemaCharge } from '~~/forms/maritimeReferenceForm'
const { $api, $notifications } = useNuxtApp()
const confirm = $notifications.useConfirm()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()

const props = defineProps({
  referenciaId: {
    required: false,
  },
  referencia: {
    type: Object,
    required: true,
  },
  currentCharges: {
    type: Array,
    required: false,
  },
  currencies: {
    type: Array,
    required: true,
  },
  catalogs: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['update:charges', 'refresh'])

const { handleSubmit, values, errors, resetForm, setValues, handleReset } = useForm({
  validationSchema: schemaCharge,
})

const showForm = ref(false)
const editChargeIndex = ref(null)
const charges = ref<any[]>([])

const initValues = () => {
  setValues({
    id: undefined,
    charge_id: null,
    amount: null,
    currency_id: null,
    exchange_rate: null,
    fuera_dentro_bl: null,
    is_con_iva: null,
    tm_wm: null,
  })

  editChargeIndex.value = null
}

const toggleForm = () => {
  showForm.value = !showForm.value
  console.log('values', values)
  editChargeIndex.value = null
}

// watch
watch(
  () => props.currentCharges,
  (newVal) => {
    if (newVal) {
      // charges.value = [...newVal]
      const chargesValues = toRaw(newVal)
      chargesValues.forEach((charge: any) => {
        charge.tm_wm = charge.inv_type
        if (charge.fuera_dentro_bl === 'F') {
          // console.log('charge.F', charge.fuera_dentro_bl)
          charge.fuera_dentro_bl = 'Fuera BL'
        }
        if (charge.fuera_dentro_bl === 'D') {
          // console.log('charge.D', charge.fuera_dentro_bl)
          charge.fuera_dentro_bl = 'Dentro BL'
        }
      })
      charges.value = chargesValues
    }
  },
  { immediate: true }
)

// emit transhipments
watch(
  () => charges.value,
  (charges) => {
    emit('update:charges', charges)
  },
  { deep: true }
)

const invoiceType = [{ name: 'TM' }, { name: 'WM' }]

const invoiceTypeOptions = computed(() => {
  // if + IVA only TM
  if (values.is_con_iva) {
    return invoiceType.filter((item) => item.name == 'TM')
  }
  return invoiceType
})

const editNotAllowInvoiceType = computed(() => {
  return values.id != null
})

// Filtrar charges según el tipo de factura seleccionado (TM/WM)
// TM: solo charges con clave SAT (code no nulo)
// WM: todos los charges
const filteredCharges = computed(() => {
  if (!props.catalogs?.charges) return []
  
  if (values.tm_wm === 'TM') {
    // Solo charges con clave SAT (code no vacío)
    return props.catalogs.charges.filter((c: any) => c.code && c.code.trim() !== '')
  }
  
  // WM o sin selección: todos los charges
  return props.catalogs.charges
})

// Hint para mostrar al usuario el filtro aplicado
const chargeFilterHint = computed(() => {
  if (values.tm_wm === 'TM') {
    return `Only charges with SAT key (${filteredCharges.value.length} available)`
  }
  return ''
})

// Cuando cambia el tipo de factura, limpiar el charge seleccionado
const onInvoiceTypeChange = (value: any) => {
  // Si cambia el tipo y hay un charge seleccionado, verificar si sigue siendo válido
  if (values.charge_id) {
    const chargeStillValid = filteredCharges.value.some((c: any) => c.id === values.charge_id)
    if (!chargeStillValid) {
      setValues({ charge_id: null })
    }
  }
}

const getChargeName = (id: number) => {
  const charge = props.catalogs.charges.find((c: any) => c.id == id)
  return charge?.name
}

const getCurrencyName = (id: number) => {
  const currency = props.currencies.find((c: any) => c.id == id)
  return currency?.name
}

const clearInvoiceType = (value: any) => {
  if (!editNotAllowInvoiceType.value) {
    setValues({ tm_wm: null, charge_id: null })
  }
}

const cancel = () => {
  initValues()
  toggleForm()
}

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

const hasAnyInvoice = computed(() => {
  return props.referencia?.invoice_tms?.length > 0 || props.referencia?.invoice_wms?.length > 0
})

const linkedChargeToInvoice = (charge: any) => {
  if (charge.invoice_charge != null) {
    return 'mdi-link'
  }
  return 'mdi-link-off'
}

const onSuccess = async (values: any) => {
  try {
    loadingStore.start()
    const body = {
      ...values,
    }
    const response = (await $api.referencias.upsertSeaImportLocalCharges(props.referencia.id, body)) as any
    snackbar.add({ type: 'success', text: 'Charges saved successfully' })

    // Normaliza los campos tm_wm y fuera_dentro_bl antes de asignar a charges.value
    const normalized = Array.isArray(response)
      ? response.map((charge: any) => ({
          ...charge,
          tm_wm: charge.inv_type ?? charge.tm_wm,
          fuera_dentro_bl:
            charge.fuera_dentro_bl === 'F'
              ? 'Fuera BL'
              : charge.fuera_dentro_bl === 'D'
              ? 'Dentro BL'
              : charge.fuera_dentro_bl,
        }))
      : []

    charges.value = normalized

    editChargeIndex.value = null
    handleReset()
    initValues()

    emit('refresh')
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

function onInvalidSubmit({ values, errors, results }: any) {
  console.log(values) // current form values
  console.log(errors) // a map of field names and their first error message
  console.log(results) // a detailed map of field names and their validation results
  snackbar.add({ type: 'error', text: 'Validate form before submit' })
}

const save = handleSubmit(onSuccess, onInvalidSubmit)

const addCharge = () => {
  handleReset()
  initValues()
  toggleForm()
}
const editCharge = (charge: any, index: any) => {
  handleReset()
  initValues()
  toggleForm()
  setValues({
    id: charge.id,
    charge_id: charge.charge_id,
    amount: charge.amount,
    currency_id: parseInt(charge.currency_id),
    exchange_rate: charge.exchange_rate,
    fuera_dentro_bl: charge.fuera_dentro_bl,
    is_con_iva: charge.is_con_iva,
    tm_wm: charge.tm_wm,
  })
  editChargeIndex.value = index
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
      const body = charges.value[index]
      await $api.referencias.deleteSeaImportLocalCharge(props.referencia.id, body)
      charges.value.splice(index, 1)
      snackbar.add({ type: 'success', text: 'Local charge deleted successfully' })
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
</script>
