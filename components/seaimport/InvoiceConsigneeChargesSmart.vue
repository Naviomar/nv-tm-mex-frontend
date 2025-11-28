<template>
  <div>
    <v-card class="mb-4 dark:bg-neutral-700! bg-neutral-200!">
      <v-card-title>
        {{ props.invoiceType?.toUpperCase() }} - {{ invoiceTypeLabel }} #{{ invoice.invoice.invoice_number }}
      </v-card-title>
      <v-card-text>
        <v-btn v-if="isProfroma" color="primary" size="small" @click="showAvailableCharges"
          >Add charge to {{ invoiceTypeLabel }}</v-btn
        >
        <div v-if="chargeForm.show" class="py-4">
          <div v-if="availableCharges.length === 0">
            <v-alert density="compact" type="warning" variant="outlined">
              There are no available charges for this service.<v-btn
                density="compact"
                color="amber"
                @click="closeChargeAddForm"
                >Close</v-btn
              >
            </v-alert>
          </div>
          <div v-if="availableCharges.length > 0" class="grid grid-cols-2 gap-1">
            <div class="">
              <v-autocomplete
                v-model="chargeForm.chargeable"
                density="compact"
                label="Select available charge"
                :items="availableCharges"
                item-title="charge_name"
                item-value="id"
                return-object
                variant="solo-filled"
              />
            </div>
            <div class="flex flex-col justify-center items-center gap-2">
              <v-btn density="compact" variant="outlined" color="red" @click="closeChargeAddForm">Cancel</v-btn>
              <v-btn density="compact" variant="outlined" color="green" @click="addCharge">Add charge</v-btn>
            </div>
          </div>
        </div>
        <div v-for="(charge, index) in invoice.invoice_charges" :key="`inv-${props.invoiceType}-${index}`">
          <div class="grid grid-cols-6 gap-1 dark:hover:bg-gray-700 hover:bg-slate-300">
            <div class="col-span-2">
              <v-autocomplete
                v-model="charge.charge_id"
                density="compact"
                label="Charge"
                :items="charges"
                item-title="name"
                item-value="id"
                variant="solo-filled"
                :readonly="!isProfroma"
                @update:model-value="charge.unsaved = true"
              />
            </div>
            <div class="">
              <v-text-field
                v-model="charge.amount"
                density="compact"
                variant="solo-filled"
                label="Amount"
                prepend-inner-icon="mdi-currency-usd"
                :readonly="!isProfroma"
                @update:model-value="charge.unsaved = true"
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
                :readonly="true"
                @update:model-value="charge.unsaved = true"
              />
            </div>
            <div class="">
              <v-checkbox
                v-model="charge.is_con_iva"
                density="compact"
                variant="solo-filled"
                label="+ IVA"
                :readonly="!isProfroma"
                @update:model-value="charge.unsaved = true"
              />
            </div>
            <div class="flex flex-col justify-center items-center gap-2">
              <div v-if="isProfroma">
                <v-btn density="compact" variant="outlined" color="red" @click="deleteCharge(charge)">Delete</v-btn>
                <v-btn
                  v-if="unsavedChanged(charge)"
                  density="compact"
                  variant="outlined"
                  color="green"
                  @click="updateCharge(charge)"
                  >Save changes</v-btn
                >
              </div>
            </div>
          </div>
        </div>
      </v-card-text>
    </v-card>
    <v-dialog v-model="removeConceptForm.show" max-width="500">
      <v-card>
        <v-card-title>Please confirm this action.</v-card-title>
        <v-card-text>
          <div class="font-bold">Are you sure you want to remove this concept?</div>
          <div v-if="isTheLastInvoice">
            <div class="font-bold">This is the last concept in the proforma, the proforma will be cancelled.</div>
          </div>
          <div class="text-red-500">This action can not be undone.</div>
          {{ removeConceptForm.charge?.charge?.name }}
        </v-card-text>
        <v-card-actions>
          <v-btn color="error" @click="cancelRemoveConcept">Cancel</v-btn>
          <v-btn color="primary" @click="removeConcept">Confirm</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script setup lang="ts">
import { currencies } from '@/utils/data/systemData'
const { $api } = useNuxtApp()
const loadingStore = useLoadingStore()
const snackbar = useSnackbar()

const props = defineProps({
  referenciaId: {
    type: String,
    required: true,
  },
  referencia: {
    type: Object,
    required: true,
  },
  invoice: {
    type: Object,
    required: true,
  },
  charges: {
    type: Array,
    required: true,
  },
  invoiceType: {
    type: String,
    required: true,
  },
  serviceType: {
    type: String,
    required: true,
  },
  isAssisted: {
    type: Boolean,
    default: false,
  },
})

const emits = defineEmits(['refresh'])

const removeConceptForm = ref<any>({
  show: false,
  charge: null,
})

const availableCharges = ref<any>([])

const isTheLastInvoice = computed(() => {
  if (props.invoice.is_proforma != 1) return false

  return props.invoice.invoice_charges.length === 1
})

const invoiceTypeLabel = computed(() => {
  return props.invoice.is_proforma == 1 ? 'Proforma' : 'Invoice'
})

const isProfroma = computed(() => {
  return props.invoice.is_proforma == 1
})

const invoice = ref<any>({
  invoice_charges: [],
})

const chargeForm = ref<any>({
  show: false,
  chargeable: null,
})

const closeChargeAddForm = () => {
  chargeForm.value = {
    show: !chargeForm.value.show,
    chargeable: null,
  }
}

const showAvailableCharges = async () => {
  await getAvailableCharges()
  chargeForm.value.show = true
}

const validateChargeForm = computed(() => {
  if (!chargeForm.value.chargeable) {
    snackbar.add({ type: 'error', text: 'Please select an available charge' })
    return false
  }

  return true
})

const validateCharge = (charge: any) => {
  if (!charge.charge_id) {
    snackbar.add({ type: 'error', text: 'Please select a charge' })
    return false
  }
  if (!charge.amount) {
    snackbar.add({ type: 'error', text: 'Please enter an amount' })
    return false
  }
  if (!charge.currency_id) {
    snackbar.add({ type: 'error', text: 'Please select a currency' })
    return false
  }
  return true
}

const getAvailableCharges = async () => {
  try {
    loadingStore.start()
    const response = await $api.invoices.getServiceAvailableCharges({
      class_name: props.referencia.class_name,
      service_id: props.referencia.id,
      currency_id: props.invoice?.invoice?.currency_id,
    })
    availableCharges.value = response
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const addCharge = async () => {
  if (!validateChargeForm.value) return
  try {
    loadingStore.start()
    const body = {
      service_type: props.serviceType,
      referencia_id: props.referenciaId,
      chargeable: chargeForm.value.chargeable,
      invoice_id: props.invoice.id,
      invoice_type: props.invoiceType,
    }
    const response = await $api.invoices.addChargeToProforma(body, props.isAssisted)
    chargeForm.value = {
      show: false,
      chargeable: null,
    }

    response.is_con_iva = response.amount_iva > 0

    invoice.value.invoice_charges.push(response)

    snackbar.add({ type: 'success', text: 'Charge added successfully' })
    emits('refresh')
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

watch(
  () => props.invoice,
  (value) => {
    invoice.value = JSON.parse(JSON.stringify(value))
    // for each invoice charge add is_con_iva if amount_iva is greater than 0
    invoice.value.invoice_charges.forEach((charge: any) => {
      charge.is_con_iva = charge.amount_iva > 0
    })
  },
  { immediate: true }
)

const cancelRemoveConcept = () => {
  removeConceptForm.value = {
    show: false,
    charge: null,
  }
}

const removeConcept = () => {
  deleteChargeApi(removeConceptForm.value.charge)
}

const deleteChargeApi = async (charge: any) => {
  try {
    loadingStore.start()
    const body = {
      charge: charge,
      invoice_id: props.invoice.id,
      invoice_type: props.invoiceType,
      service_type: props.serviceType,
    }
    await $api.invoices.deleteChargeProforma(body, props.isAssisted)
    invoice.value.invoice_charges = invoice.value.invoice_charges.filter((c: any) => c.id !== charge.id)

    snackbar.add({ type: 'success', text: 'Charge deleted successfully' })

    removeConceptForm.value = {
      show: false,
      charge: null,
    }

    emits('refresh')
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const deleteCharge = (charge: any) => {
  removeConceptForm.value = {
    show: true,
    charge: charge,
  }
}

const updateCharge = async (charge: any) => {
  if (!validateCharge(charge)) return
  try {
    loadingStore.start()
    const body = {
      charge: charge,
      invoice_id: props.invoice.id,
      invoice_type: props.invoiceType,
    }
    await $api.invoices.updateChargeProforma(body, props.isAssisted)
    chargeForm.value = {
      show: false,
      charge: {
        charge_id: null,
        amount: 0,
        currency_id: null,
        is_con_iva: false,
      },
    }
    charge.unsaved = false

    snackbar.add({ type: 'success', text: 'Charge updated successfully' })
    emits('refresh')
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const unsavedChanged = (charge: any) => {
  return charge.unsaved === true
}
</script>
