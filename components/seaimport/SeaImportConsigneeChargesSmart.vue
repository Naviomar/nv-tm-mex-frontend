<template>
  <div>
    <v-card class="mb-4">
      <v-card-title>
        <div class="flex justify-between">
          <div class="flex items-center gap-2">
            <v-icon size="x-small">mdi-ship-wheel</v-icon>
            <div>Sea Import Ref #{{ referencia.reference_number }}</div>
          </div>
        </div>
      </v-card-title>
      <v-card-text>
        <div class="grid grid-cols-2 gap-2">
          <div>
            <div class="grid grid-cols-2 gap-1">
              <div>Line</div>
              <div>{{ referencia.line?.commercial_name }}</div>
              <div>Vessel departure</div>
              <div>{{ referencia.vessel_departure?.name }}</div>
              <div>Departure voyage</div>
              <div>{{ referencia.voyage_departure }}</div>
              <div>ETD</div>
              <div>{{ referencia.etd_date }}</div>
              <div>ETA</div>
              <div>{{ referencia.eta_date }}</div>
              <div>Freight forwarder</div>
              <div>{{ referencia.freight_forwarder?.name }}</div>
              <div>Booking Number</div>
              <div>{{ referencia.booking_number }}</div>
              <div>Service contract</div>
              <div>{{ referencia.service_contract?.name }}</div>
            </div>
          </div>
          <div>
            <div class="grid grid-cols-2 gap-1">
              <div>Region</div>
              <div>{{ referencia.sea_region?.name }}</div>
              <div>Voyage discharge</div>
              <div>{{ referencia.voyage_discharge?.name }}</div>
              <div>Origin</div>
              <div>{{ referencia.origin_port?.name }}</div>
              <div>POL</div>
              <div>{{ referencia.pol?.name }}</div>
              <div>POD</div>
              <div>{{ referencia.pod?.name }}</div>
              <div>Destination</div>
              <div>{{ referencia.destination?.name }}</div>
            </div>
          </div>
        </div>

        <div class="p-2 bg-slate-300 dark:bg-neutral-700">
          <div class="font-bold mb-4">Current charge(s) in sea reference.</div>
          <v-alert
            v-if="!canEditCharges"
            size="small"
            color="orange"
            type="warning"
            density="compact"
            variant="outlined"
            class="mb-4"
          >
            Voyage locked. It is not possible to modify charges.
          </v-alert>

          <div class="font-bold text-base">Reference sell rate charge(s)</div>
          <div v-for="(charge, index) in referencia.sell_rate_breakdown" :key="`sell-charge-${index}`">
            <div class="grid grid-cols-9 gap-1">
              <div class="col-span-1">
                <div class="flex items-center">
                  <div class="-mt-4 px-1">
                    <v-icon>{{ linkedChargeIcon(charge) }}</v-icon>
                  </div>
                  <v-autocomplete
                    v-model="charge.inv_type"
                    density="compact"
                    label="TM / WM"
                    :items="['tm', 'wm']"
                    variant="solo-filled"
                    :readonly="isChargeReadOnly(charge)"
                    @update:model-value="charge.unsaved = true"
                  />
                </div>
              </div>
              <div class="col-span-2">
                <v-autocomplete
                  v-model="charge.charge_id"
                  density="compact"
                  label="Concept"
                  :items="catalogs.charges"
                  item-title="name"
                  item-value="id"
                  variant="solo-filled"
                  :readonly="isChargeReadOnly(charge)"
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
                  :readonly="isChargeReadOnly(charge)"
                  @update:model-value="charge.unsaved = true"
                />
              </div>
              <div class="">
                <v-autocomplete
                  v-model="charge.currency_id"
                  density="compact"
                  label="Currency"
                  :items="currencies"
                  item-title="name"
                  item-value="id"
                  variant="solo-filled"
                  :readonly="isChargeReadOnly(charge)"
                  @update:model-value="charge.unsaved = true"
                />
              </div>
              <div class="flex flex-col gap-1 items-center">
                <v-checkbox
                  v-model="charge.is_con_iva"
                  density="compact"
                  variant="solo-filled"
                  label="+ IVA"
                  :value="1"
                  :readonly="isChargeReadOnly(charge)"
                  @update:model-value="charge.unsaved = true"
                  hide-details
                />
                
              </div>
              <div class="flex flex-col gap-1 items-center">
                <v-checkbox
                  v-model="charge.has_desglose"
                  density="compact"
                  variant="solo-filled"
                  label="Breakdown?"
                  :value="1"
                  :readonly="isChargeReadOnly(charge)"
                  @update:model-value="charge.unsaved = true"
                  hide-details
                />
                <v-chip v-if="isChargeLinkedToInvoice(charge)" size="small" color="primary">Read only</v-chip>
              </div>
              <div v-if="!isChargeLinkedToInvoice(charge)" class="flex flex-col justify-center items-center gap-2">
                <v-btn density="compact" variant="outlined" color="red" @click="deleteRefSellCharge(charge)"
                  >Delete</v-btn
                >
                <v-btn
                  v-if="unsavedChanged(charge)"
                  density="compact"
                  variant="outlined"
                  color="green"
                  @click="updateRefSellCharge(charge)"
                  >Save changes</v-btn
                >
              </div>
            </div>
          </div>
          <div class="font-bold text-base">Reference charge(s)</div>
          <div v-for="(charge, index) in referencia.charges" :key="`charge-${index}`">
            <div class="grid grid-cols-8 gap-1">
              <div class="col-span-1">
                <div class="flex items-center">
                  <div class="-mt-4 px-1">
                    <v-icon>{{ linkedChargeIcon(charge) }}</v-icon>
                  </div>
                  <v-autocomplete
                    v-model="charge.inv_type"
                    density="compact"
                    label="TM / WM"
                    :items="['tm', 'wm']"
                    variant="solo-filled"
                    :readonly="isChargeReadOnly(charge)"
                    @update:model-value="charge.unsaved = true"
                  />
                </div>
              </div>
              <div class="col-span-1">
                <v-autocomplete
                  v-model="charge.fuera_dentro_bl"
                  density="compact"
                  label="Charge type"
                  :items="[
                    { value: 'F', name: 'Fuera BL' },
                    { value: 'D', name: 'Dentro BL' },
                  ]"
                  item-title="name"
                  item-value="value"
                  variant="solo-filled"
                  :readonly="isChargeReadOnly(charge)"
                  @update:model-value="charge.unsaved = true"
                />
              </div>
              <div class="col-span-2">
                <v-autocomplete
                  v-model="charge.charge_id"
                  density="compact"
                  label="Local charge"
                  :items="catalogs.charges"
                  item-title="name"
                  item-value="id"
                  variant="solo-filled"
                  :readonly="isChargeReadOnly(charge)"
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
                  :readonly="isChargeReadOnly(charge)"
                  @update:model-value="charge.unsaved = true"
                />
              </div>
              <div class="">
                <v-autocomplete
                  v-model="charge.currency_id"
                  density="compact"
                  label="Currency"
                  :items="currencies"
                  item-title="name"
                  item-value="id"
                  variant="solo-filled"
                  :readonly="isChargeReadOnly(charge)"
                  @update:model-value="charge.unsaved = true"
                />
              </div>
              <div class="flex flex-col gap-1 items-center">
                <v-checkbox
                  v-model="charge.is_con_iva"
                  density="compact"
                  variant="solo-filled"
                  label="+ IVA"
                  :value="1"
                  :readonly="isChargeReadOnly(charge)"
                  @update:model-value="charge.unsaved = true"
                  hide-details
                />
                <v-chip v-if="isChargeLinkedToInvoice(charge)" size="small" color="primary">Read only</v-chip>
              </div>
              <div v-if="!isChargeLinkedToInvoice(charge)" class="flex flex-col justify-center items-center gap-2">
                <v-btn density="compact" variant="outlined" color="red" @click="deleteRefCharge(charge)">Delete</v-btn>
                <v-btn
                  v-if="unsavedChanged(charge)"
                  density="compact"
                  variant="outlined"
                  color="green"
                  @click="updateRefCharge(charge)"
                  >Save changes</v-btn
                >
              </div>
            </div>
          </div>
        </div>

        <div class="py-4">
          <div class="py-2">
            <v-btn color="primary" size="small" @click="toggleChargeAddForm">Add charge to reference</v-btn>
          </div>
          <div v-if="chargeForm.show">
            <div class="grid grid-cols-9 gap-1">
              <div class="col-span-1">
                <v-autocomplete
                  v-model="chargeForm.inv_type"
                  density="compact"
                  label="TM / WM"
                  :items="['tm', 'wm']"
                  variant="solo-filled"
                />
              </div>
              <div class="col-span-1">
                <v-autocomplete
                  v-model="chargeForm.charge.charge_type"
                  density="compact"
                  label="Charge type"
                  :items="['Dentro BL', 'Fuera BL']"
                  variant="solo-filled"
                />
              </div>
              <div class="col-span-2">
                <v-autocomplete
                  v-model="chargeForm.charge.charge_id"
                  density="compact"
                  label="New charge to add"
                  :items="catalogs.charges"
                  item-title="name"
                  item-value="id"
                  variant="solo-filled"
                />
              </div>
              <div class="">
                <v-text-field
                  v-model="chargeForm.charge.amount"
                  density="compact"
                  variant="solo-filled"
                  label="Amount"
                  prepend-inner-icon="mdi-currency-usd"
                />
              </div>
              <div class="">
                <v-autocomplete
                  v-model="chargeForm.charge.currency_id"
                  density="compact"
                  label="Currency"
                  :items="currencies"
                  item-title="name"
                  item-value="id"
                  variant="solo-filled"
                />
              </div>
              <div class="">
                <v-checkbox
                  v-model="chargeForm.charge.is_con_iva"
                  density="compact"
                  variant="solo-filled"
                  label="+ IVA"
                  :value="1"
                />
                </div>
                <div class="">
                <v-checkbox
                  v-model="chargeForm.charge.has_desglose"
                  density="compact"
                  variant="solo-filled"
                  label="Breakdown?"
                  :value="1"
                />
              </div>
              
              <div class="flex flex-col justify-center items-center gap-2">
                <v-btn density="compact" variant="outlined" color="red" @click="toggleChargeAddForm">Cancel</v-btn>
                <v-btn density="compact" variant="outlined" color="green" @click="addCharge">Add charge</v-btn>
              </div>
            </div>
          </div>
        </div>

        <div class="py-4">
          <div v-for="(invoice, index) in tm_invoices" :key="`tm-inv-${index}`">
            <InvoiceConsigneeChargesSmart
              :referenciaId="props.id"
              :referencia="referencia"
              :invoice="invoice"
              invoiceType="tm"
              serviceType="sea"
              :charges="catalogs.charges"
              :isAssisted="!canEditCharges"
              @refresh="getData"
            />
          </div>

          <div v-for="(invoice, index) in wm_invoices" :key="`wm-inv-${index}`">
            <InvoiceConsigneeChargesSmart
              :referenciaId="props.id"
              :referencia="referencia"
              :invoice="invoice"
              invoiceType="wm"
              serviceType="sea"
              :charges="catalogs.charges"
              :isAssisted="!canEditCharges"
              @refresh="getData"
            />
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
const loadingStore = useLoadingStore()

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
})

const catalogs = ref({
  lines: [] as any,
  sea_regions: [] as any,
  consignees: [] as any,
  consignee_mbls: [] as any,
  freights: [] as any,
  vessels: [] as any,
  voyage_destinations: [] as any,
  ports: [] as any,
  shippers: [] as any,
  container_types: [] as any,
  transportation_modes: [] as any,
  charges: [] as any,
  service_contracts: [] as any,
  destinations: [] as any,
  embalajes: [] as any,
})

const referencia = ref<any>({})

const chargeForm = ref<any>({
  show: false,
  invoice_sea: null,
  charge: {
    charge_id: null,
    amount: 0,
    currency_id: null,
    is_con_iva: false,
    has_desglose: 0,
  },
})

const toggleChargeAddForm = () => {
  chargeForm.value = {
    show: !chargeForm.value.show,
    invoice_sea: null,
    inv_type: null,
    charge: {
      amount: 0,
      currency_id: null,
      is_con_iva: false,
      has_desglose: 0,
    },
  }
}

const canEditCharges = computed(() => {
  // Si no cuenta con viaje de descarga, no se pueden editar cargas
  if (!referencia.value.voyage_discharge) {
    return false
  }

  // Si el viaje de descarga está cerrado, no se pueden editar cargas
  return referencia.value.voyage_discharge.locked_at == null
})

const tm_invoices = computed(() => {
  if (!referencia.value) return []
  return referencia.value.invoice_tms
})

const wm_invoices = computed(() => {
  if (!referencia.value) return []
  return referencia.value.invoice_wms
})

const isChargeLinkedToInvoice = (charge: any) => {
  return charge.invoice_charge != null
}

const isChargeReadOnly = (charge: any) => {
  return isChargeLinkedToInvoice(charge)
}

const linkedChargeIcon = (charge: any) => {
  if (charge.invoice_charge != null) {
    return 'mdi-link'
  }
  return 'mdi-link-off'
}

const validateChargeForm = computed(() => {
  if (!chargeForm.value.inv_type) {
    snackbar.add({ type: 'error', text: 'Please select a TM / WM' })
    return false
  }
  if (!chargeForm.value.charge.charge_type) {
    snackbar.add({ type: 'error', text: 'Please select a charge type' })
    return false
  }
  if (!chargeForm.value.charge.charge_id) {
    snackbar.add({ type: 'error', text: 'Please select a charge' })
    return false
  }
  if (!chargeForm.value.charge.amount) {
    snackbar.add({ type: 'error', text: 'Please enter an amount' })
    return false
  }
  if (!chargeForm.value.charge.currency_id) {
    snackbar.add({ type: 'error', text: 'Please select a currency' })
    return false
  }
  return true
})

const addCharge = () => {
  if (!validateChargeForm.value) return
  if (chargeForm.value.invoice_sea != null) {
    addChargeToProforma()
  }
  if (chargeForm.value.invoice_sea == null) {
    addChargeToReferencia()
  }
}

const addChargeToProforma = async () => {
  if (!validateChargeForm.value) return
  try {
    loadingStore.start()
    const body = {
      referencia_id: props.id,
      invoice_id: chargeForm.value.invoice_sea.id,
      invoice_type: chargeForm.value.invoice_sea.inv_type,
      charge: chargeForm.value.charge,
      has_desglose: 0,
    }
    console.log('addChargeToProforma', body)
    const response = await $api.invoices.addChargeToProforma(body, !canEditCharges.value)
    chargeForm.value = {
      show: false,
      invoice_sea: null,
      inv_type: null,
      charge: {
        charge_type: null,
        charge_id: null,
        amount: 0,
        currency_id: null,
        is_con_iva: false,
        has_desglose: 0,
      },
    }

    await getData()
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const deleteRefCharge = async (charge: any) => {
  try {
    loadingStore.start()
    const body = {
      charge: charge,
    }
    const response = await $api.referencias.deleteChargeFromReferencia(referencia.value.id, body, !canEditCharges.value)
    await getData()
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const updateRefCharge = async (charge: any) => {
  try {
    if (!charge.inv_type || !charge.charge_id || !charge.amount || !charge.currency_id) {
      snackbar.add({ type: 'warning', text: 'Please fill all required fields' })
      return
    }
    loadingStore.start()
    const body = {
      charge: charge,
    }
    const response = await $api.referencias.updateChargeFromReferencia(referencia.value.id, body, !canEditCharges.value)
    snackbar.add({ type: 'success', text: 'Charge updated' })
    await getData()
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const deleteRefSellCharge = async (charge: any) => {
  try {
    loadingStore.start()
    const body = {
      charge: charge,
    }
    const response = await $api.referencias.deleteSellChargeFromReferencia(
      referencia.value.id,
      body,
      !canEditCharges.value
    )
    snackbar.add({ type: 'success', text: 'Charge deleted' })
    await getData()
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const updateRefSellCharge = async (charge: any) => {
  try {
    // if any of the fields are empty, return
    if (!charge.inv_type || !charge.charge_id || !charge.amount || !charge.currency_id) {
      snackbar.add({ type: 'warning', text: 'Please fill all required fields' })
      return
    }
    loadingStore.start()
    const body = {
      charge: charge,
    }
    const response = await $api.referencias.updateSellChargeFromReferencia(
      referencia.value.id,
      body,
      !canEditCharges.value
    )
    snackbar.add({ type: 'success', text: 'Charge updated' })
    await getData()
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const addChargeToReferencia = async () => {
  if (!validateChargeForm.value) return
  try {
    loadingStore.start()
    const body = {
      referencia_id: props.id,
      inv_type: chargeForm.value.inv_type,
      charge: chargeForm.value.charge,
    }
    const response = await $api.invoices.addChargeToReferencia(body, !canEditCharges.value)
    snackbar.add({ type: 'success', text: 'Charge added' })
    chargeForm.value = {
      show: false,
      invoice_sea: null,
      inv_type: null,
      charge: {
        charge_type: null,
        charge_id: null,
        amount: 0,
        currency_id: null,
        is_con_iva: false,
        has_desglose: 0,
      },
    }

    await getData()
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const getData = async () => {
  try {
    loadingStore.start()
    const response = (await $api.referencias.getSeaImportById(props.id)) as any
    referencia.value = response
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const getSeaImportCatalogs = async () => {
  const response = await $api.referencias.getSeaImportFormCatalogs()
  catalogs.value = response as any
}

const unsavedChanged = (charge: any) => {
  return charge.unsaved === true
}

onMounted(async () => {
  await getSeaImportCatalogs()
  await getData()
})
</script>
