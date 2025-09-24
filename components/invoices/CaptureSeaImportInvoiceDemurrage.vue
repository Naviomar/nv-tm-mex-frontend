<template>
  <div>
    <div class="">
      <div>
        <v-card class="mb-4">
          <v-card-title><div class="font-bold">New demurrage invoice for consignee</div></v-card-title>
          <v-card-text>
            <div>
              <div class="grid grid-cols-12 gap-4">
                <div class="col-span-1 md:col-span-3">
                  <h1 class="px-2 font-bold text-lg">Select invoice type</h1>
                  <div>
                    <v-autocomplete
                      v-model="form.invoice_type"
                      density="compact"
                      variant="solo-filled"
                      label="Invoice type"
                      :items="invoiceTypes"
                      item-title="name"
                      item-value="name"
                    />
                  </div>
                  <div v-if="isTm" class="col-span-2 font-bold mb-2">
                    <div>CFDI information</div>
                    <v-autocomplete
                      v-model="form.regimen_fiscal"
                      :items="cfdiCatalogs.regimenFiscales"
                      density="compact"
                      label="Régimen fiscal"
                      item-title="name"
                      item-value="name"
                    />
                    <v-autocomplete
                      v-model="form.uso_cfdi"
                      :items="cfdiCatalogs.usosCfdi"
                      density="compact"
                      label="Uso de CFDI"
                      item-title="name"
                      item-value="name"
                    />
                    <v-autocomplete
                      v-model="form.metodo_pago"
                      :items="cfdiCatalogs.metodosPago"
                      density="compact"
                      label="Método de pago"
                      item-title="name"
                      item-value="name"
                      @update:model-value="form.forma_pago = null"
                    />
                    <v-autocomplete
                      v-model="form.forma_pago"
                      :items="availableFormasPago"
                      density="compact"
                      label="Forma de pago"
                      item-title="name"
                      item-value="name"
                    />
                  </div>
                </div>
                <div class="col-span-1 md:col-span-9">
                  <v-alert v-if="!form.invoice_type" type="warning" density="compact" class="mt-7">
                    <div class="font-bold">Select an invoice type to continue</div>
                  </v-alert>
                  <div v-if="form.invoice_type" class="mt-7">
                    <div>
                      <v-autocomplete
                        v-model="form.consignee_id"
                        :items="catalogs.consignees"
                        density="compact"
                        label="Consignee"
                        item-title="name"
                        item-value="id"
                        @update:model-value="getConsigneeInfo"
                      />
                    </div>
                    <div class="col-span-2 font-bold mb-2">Invoice info (read only)</div>
                    <div>Razón social</div>
                    <div>
                      <v-text-field
                        v-model="form.razon_social"
                        density="compact"
                        label="Razón social"
                        variant="outlined"
                        readonly
                      />
                    </div>
                    <div>RFC</div>
                    <div>
                      <v-text-field v-model="form.rfc" density="compact" label="RFC" variant="outlined" readonly />
                    </div>
                    <div>Address</div>
                    <div>
                      <v-textarea
                        v-model="form.address"
                        density="compact"
                        label="Address"
                        variant="outlined"
                        readonly
                        rows="3"
                      />
                    </div>
                    <div>Zip code</div>
                    <div>
                      <v-text-field
                        v-model="form.zip_code"
                        density="compact"
                        label="Zip code"
                        variant="outlined"
                        readonly
                      />
                    </div>

                    <div class="grid grid-cols-1 py-2">
                      <v-alert v-if="!currentConsignee.address" type="warning" variant="outlined" density="compact">
                        <div class="font-bold">No address found for this customer</div>
                      </v-alert>

                      <v-alert
                        v-if="!hasConsigneeAddresses"
                        type="error"
                        variant="outlined"
                        density="compact"
                        class="my-2"
                      >
                        <div class="font-bold">
                          No more addresses found for this customer, add at least one address to the consignee.
                        </div>
                      </v-alert>

                      <div v-if="hasConsigneeAddresses" class="text-right">
                        <v-btn color="blue-lighten-1" size="small" @click="showAddressDialog = true">
                          <v-icon>mdi-map-marker</v-icon>
                          Change address
                        </v-btn>
                      </div>
                      <ConsigneeChooseAddressSmart
                        v-if="showAddressDialog"
                        :consignee="currentConsignee"
                        @close="showAddressDialog = false"
                        @selected:address="setAddress"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="form.invoice_type">
              <v-btn color="primary" size="small" @click="toggleConceptForm">Add available concepts</v-btn>
              <v-dialog v-model="showConceptForm" max-width="600" persistent>
                <v-card>
                  <v-card-title>Available charges</v-card-title>
                  <v-card-text>
                    <v-autocomplete
                      v-model="form.selectedCharges"
                      :items="availableCharges"
                      density="compact"
                      item-title="name"
                      item-value="id"
                      return-object
                      label="Select charge(s) to add to the invoice"
                      multiple
                    />
                  </v-card-text>
                  <v-card-actions>
                    <v-btn color="secondary" @click="showConceptForm = false">Close</v-btn>
                    <v-btn color="blue" @click="addCharges">Add charges</v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
              <v-table density="compact">
                <thead>
                  <tr>
                    <th class="font-bold! w-5"></th>
                    <th class="font-bold!">Concept</th>
                    <th class="font-bold!">Amount</th>
                    <th class="font-bold!">+ iva</th>
                    <th class="font-bold! text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(charge, idx) in form.charges" :key="`invoice-charge-${idx}`">
                    <td>
                      <div class="flex flex-col items-center">
                        <v-icon @click="removeConcept(idx)" class="cursor-pointer" color="error">mdi-delete</v-icon>
                      </div>
                    </td>
                    <td>{{ charge.name }}</td>
                    <td>{{ formatToCurrency(parseFloat(charge.amount)) }}</td>
                    <td>{{ formatToCurrency(charge.amount_iva) }}</td>
                    <td class="text-right">{{ formatToCurrency(getChargeTotal(charge)) }}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="4" class="text-right font-bold">Total</td>
                    <td class="font-bold text-right">{{ formatToCurrency(invoiceTotal) }}</td>
                  </tr>
                </tfoot>
              </v-table>
            </div>
          </v-card-text>
          <v-card-actions class="px-4">
            <v-btn v-if="form.invoice_type" color="blue" variant="flat" @click="createInvoice"
              >Create demurrage invoice</v-btn
            >
          </v-card-actions>
        </v-card>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { currencies, cfdiCatalogs } from '~/utils/data/systemData'
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()
const router = useRouter()

const props = defineProps({
  referencia: {
    type: Object,
    required: true,
  },
})

const showAddressDialog = ref(false)

const form = ref<any>({
  invoice_type: null,
  consignee_id: null,
  razon_social: null,
  rfc: null,
  uso_cfdi: null,
  metodo_pago: null,
  forma_pago: null,
  address: null,
  zip_code: null,
  charges: [],
  selectedCharges: [],
})

const catalogs = ref<any>({
  consigness: [],
  charges: [],
})

const currentConsignee = ref<any>({
  address: null,
  addresses: [],
})

const invoiceTypes = [{ name: 'TM' }, { name: 'WM' }]

const hasConsigneeAddresses = computed(() => {
  return currentConsignee.value.addresses?.length > 0
})

const getChargeTotal = (concept: any) => {
  return parseFloat(concept.amount) + parseFloat(concept.amount_iva)
}

onMounted(() => {
  // add charges and sell charges to invoiceTm
  // invoiceTm.value.concepts = refChargesTm.value.concat(refSellChargesTm.value)
})

const getCatalogs = async () => {
  try {
    loadingStore.loading = true
    const response = (await $api.tmInvoices.getCatalogs()) as any

    catalogs.value = response
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

await getCatalogs()

const showConceptForm = ref(false)

const toggleConceptForm = () => {
  showConceptForm.value = !showConceptForm.value
}

const addCharges = () => {
  form.value.charges = form.value.charges.concat(form.value.selectedCharges)
  form.value.selectedCharges = []
  showConceptForm.value = false
}

const removeConcept = (index: number) => {
  form.value.charges.splice(index, 1)
}

const isTm = computed(() => {
  return form.value.invoice_type === 'TM'
})

const availableCharges = computed(() => {
  //if (!props.referencia) return []
  return props.referencia?.demurrage_charges.filter(
    (charge: any) => !charge.invoice_charge && !form.value.charges.includes(charge)
  )
})

const availableFormasPago = computed(() => {
  if (!form.value.metodo_pago) return []
  if (form.value.metodo_pago.includes('PPD')) {
    return cfdiCatalogs.formasPago.filter((forma: any) => forma.name === '99 - Por definir')
  }

  return cfdiCatalogs.formasPago
})

const invoiceTotal = computed(() => {
  return form.value?.charges.reduce((acc: number, concept: any) => {
    return acc + parseFloat(concept.amount) + parseFloat(concept.amount_iva)
  }, 0)
})

const useIsFormValid = () => {
  if (!form.value.invoice_type) {
    snackbar.add({ type: 'error', text: 'Select an invoice type' })
    return false
  }
  if (!form.value.consignee_id) {
    snackbar.add({ type: 'error', text: 'Select a consignee' })
    return false
  }
  if (form.value.charges.length === 0) {
    snackbar.add({ type: 'error', text: 'Add at least one charge to the invoice' })
    return false
  }
  return true
}

const createInvoice = async () => {
  try {
    if (!useIsFormValid()) {
      return
    }
    loadingStore.loading = true
    const body = {
      referencia_id: props.referencia.id,
      ...form.value,
    }
    const response = (await $api.invoices.createDemurrageInvoice(body)) as any

    snackbar.add({ type: 'success', text: 'Demurrage invoice created successfully' })
    router.push('/invoices/search')
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const getConsigneeInfo = async (id: string) => {
  try {
    loadingStore.loading = true
    const response: any = await $api.consignees.getDetailsForInvoice(id)

    currentConsignee.value = response
    form.value.rfc = response?.tax_number
    form.value.address = fullAddress(response?.address)
    form.value.zip_code = response?.address?.zip_code
    form.value.razon_social = response?.name
    form.value.regimen_fiscal = response?.regimen_fiscal
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const setAddress = (address: any) => {
  console.log('set Address', address)
  form.value.address = fullAddress(address)
  form.value.zip_code = address.zip_code
  showAddressDialog.value = false
}

const fullAddress = (address: any) => {
  if (!address) return ''
  return `${address.street} ${address.number} - ${address.neighborhood} ${address.city} ${address.state} ${address.country?.name}, ${address.zip_code}`
}
</script>
