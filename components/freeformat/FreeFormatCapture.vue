<template>
  <div>
    <div class="">
      <v-card class="mb-4">
        <v-card-title><div class="font-bold">Capture - Free format invoice</div></v-card-title>
        <v-card-text>
          <div>
            <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div class="col-span-1 md:col-span-3">
                <h1 class="px-2 font-bold text-base">Select invoice type</h1>
                <div>
                  <v-autocomplete
                    v-model="form.invoice_type"
                    density="compact"
                    variant="solo-filled"
                    label="Invoice type"
                    :items="invoiceTypes"
                    item-title="name"
                    item-value="name"
                    @update:model-value="clearSelectedCharges"
                  />
                  <v-autocomplete
                    v-model="form.currency_id"
                    density="compact"
                    variant="solo-filled"
                    :label="`Invoice currency`"
                    hint="Only charges with the same currency will be added"
                    :items="currencies"
                    item-title="name"
                    item-value="id"
                    @update:model-value="clearSelectedCharges"
                  />
                  <v-autocomplete
                    v-model="form.inv_serie"
                    density="compact"
                    variant="solo-filled"
                    label="Serie"
                    :items="series"
                  />
                  <v-autocomplete
                    v-model="form.partyable_type"
                    density="compact"
                    variant="solo-filled"
                    :label="`Party`"
                    :items="partyables"
                    item-title="name"
                    item-value="value"
                    @update:model-value="clearSelectedCharges"
                  />
                  <PartyableSearch v-model="form.partyable_id" :partyableType="form.partyable_type" />
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
                <v-alert v-if="!hasInvoiceInitData" type="warning" variant="tonal" density="compact" class="mt-7">
                  <div class="font-bold">Select the invoice type and currency to continue</div>
                </v-alert>
                <div v-if="hasInvoiceInitData" class="mt-7">
                  <div class="col-span-2 font-bold mb-2">Party invoice details (Read only)</div>
                  <div>Razón social</div>
                  <div>
                    <v-text-field v-model="form.razon_social" density="compact" label="Razón social *" readonly />
                  </div>
                  <div>RFC/VAT</div>
                  <div>
                    <v-text-field v-model="form.rfc" density="compact" label="RFC/VAT *" readonly />
                  </div>
                  <div>Zip code</div>
                  <div>
                    <v-text-field v-model="form.zip_code" density="compact" label="Zip code *" readonly />
                  </div>

                  <div v-if="false" class="grid grid-cols-1 py-2">
                    <v-alert v-if="hasConsignee && !currentConsignee.address" type="warning" density="compact">
                      <div class="font-bold">No address found for this customer</div>
                    </v-alert>

                    <v-alert v-if="hasConsignee && !hasConsigneeAddresses" type="error" density="compact" class="my-2">
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

          <div v-if="hasInvoiceInitData">
            <v-btn color="primary" size="small" @click="toggleConceptForm">Add concepts</v-btn>
            <v-dialog v-model="showConceptForm" max-width="600" persistent>
              <v-card>
                <v-card-title>Available charges</v-card-title>
                <v-card-text>
                  <div class="grid grid-cols-1">
                    <v-autocomplete
                      v-model="form.selectedCharges"
                      :items="catalogs.charges"
                      density="compact"
                      item-title="name"
                      item-value="id"
                      return-object
                      label="Select charge(s) to add"
                      multiple
                    />
                  </div>
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
                  <th class="font-bold! w-96">Notes</th>
                  <th class="font-bold! w-40">Amount</th>
                  <th class="font-bold!">+ iva</th>
                  <th class="font-bold!">Moneda</th>
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
                  <td>
                    <v-text-field v-model="charge.notes" density="compact" maxlength="150" />
                  </td>
                  <td>
                    <v-text-field v-model="charge.amount" type="number" density="compact" />
                  </td>
                  <td>
                    <v-checkbox v-model="charge.is_con_iva" density="compact" readonly />
                  </td>
                  <td>
                    <v-autocomplete
                      v-model="charge.currency_id"
                      :items="catalogs.currencies"
                      density="compact"
                      item-title="name"
                      item-value="id"
                      readonly
                    />
                  </td>
                  <td class="text-right">
                    {{ formatToCurrency(getChargeTotal(charge)) }}
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="6" class="text-right font-bold">Total</td>
                  <td class="font-bold text-right">
                    {{ formatToCurrency(invoiceTotal) }}
                  </td>
                </tr>
              </tfoot>
            </v-table>
            <v-textarea v-model="form.emails" label="Emails" density="compact" rows="3" />
          </div>
        </v-card-text>
        <v-card-actions class="px-4">
          <v-btn v-if="form.invoice_type" color="blue" variant="flat" @click="createFreeFormat"
            >Create free format {{ form.invoice_type }}</v-btn
          >
        </v-card-actions>
      </v-card>
    </div>
  </div>
</template>
<script setup lang="ts">
import { partyables } from '@/utils/data/systemData'
import { currencies, cfdiCatalogs } from '~/utils/data/systemData'
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()
const router = useRouter()

const showAddressDialog = ref(false)

const form = ref<any>({
  type: null,
  invoice_type: null,
  inv_serie: null,
  currency_id: null,
  partyable_id: null,
  partyable_type: null,
  regimen_fiscal: null,
  razon_social: null,
  uso_cfdi: null,
  metodo_pago: null,
  forma_pago: null,
  moneda: null,
  rfc: null,
  zip_code: null,
  charges: [],
  selectedCharges: [],
  emails: null,
})

const catalogs = ref<any>({
  consigness: [],
  charges: [],
  currencies: [],
})

const currentConsignee = ref<any>({
  address: null,
  addresses: [],
})

// series array of strings from A to Z
const series = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i))

const invoiceTypes = [{ name: 'TM' }, { name: 'WM' }]

const hasInvoiceInitData = computed(
  () => !!form.value.invoice_type && !!form.value.currency_id && !!form.value.partyable_id
)

const hasConsignee = computed(() => {
  return form.value.consignee_id !== null
})

const hasConsigneeAddresses = computed(() => {
  return currentConsignee.value.addresses?.length > 0
})

const isTm = computed(() => {
  return form.value.invoice_type === 'TM'
})

const getChargeTotal = (charge: any) => {
  return parseFloat(charge.amount) + (charge.is_con_iva ? charge.amount * 0.16 : 0)
}

onMounted(() => {
  // add charges and sell charges to invoiceTm
  // invoiceTm.value.concepts = refChargesTm.value.concat(refSellChargesTm.value)
})

const getCatalogs = async () => {
  try {
    loadingStore.start()
    const response = (await $api.freeFormatInvoices.getCatalogs()) as any

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
  // foreach selectedCharges init amount to 0 and is_con_iva to false
  form.value.selectedCharges.forEach((charge: any) => {
    charge.amount = 0
    // check in services array if in pivot.free_iva is 1
    charge.is_con_iva = charge.services.some((service: any) => service.pivot.free_iva === 1)
    charge.currency_id = form.value.currency_id
  })
  const newCharges = JSON.parse(JSON.stringify(form.value.selectedCharges))
  form.value.charges = form.value.charges.concat(newCharges)
  form.value.selectedCharges = []
  showConceptForm.value = false
}

const removeConcept = (index: number) => {
  form.value.charges.splice(index, 1)
}

const getChargeIva = (charge: any) => {
  return charge.is_con_iva ? parseFloat(charge.amount) * 0.16 : 0
}

const availableFormasPago = computed(() => {
  if (!form.value.metodo_pago) return []
  if (form.value.metodo_pago.includes('PPD')) {
    return cfdiCatalogs.formasPago.filter((forma: any) => forma.name === '99 - Por definir')
  }

  return cfdiCatalogs.formasPago
})

const invoiceTotal = computed(() => {
  const totalCharges = form.value?.charges.reduce((acc: number, concept: any) => {
    return acc + parseFloat(concept.amount) + getChargeIva(concept)
  }, 0)

  return totalCharges
})

const useIsFormValid = () => {
  if (!form.value.invoice_type) {
    snackbar.add({ type: 'error', text: 'Select an invoice type' })
    return false
  }
  if (!form.value.razon_social || !form.value.rfc || !form.value.zip_code) {
    snackbar.add({ type: 'error', text: 'Complete the party invoice details' })
    return false
  }
  if (form.value.charges.length === 0) {
    snackbar.add({ type: 'error', text: 'Add at least one charge to the free format invoice' })
    return false
  }
  // all charges must have an amount greater than 0
  if (form.value.charges.some((charge: any) => parseFloat(charge.amount) <= 0)) {
    snackbar.add({ type: 'error', text: 'All charges must have an amount greater than 0' })
    return false
  }
  return true
}

const clearSelectedCharges = () => {
  form.value.charges = []
  form.value = {
    ...form.value,
    uso_cfdi: null,
    metodo_pago: null,
    forma_pago: null,
    moneda: null,
  }
}

const createFreeFormat = async () => {
  try {
    if (!useIsFormValid()) {
      return
    }
    loadingStore.start()
    const body = {
      ...form.value,
    }
    const response = await $api.freeFormatInvoices.createPartyInvoice(body)
    snackbar.add({ type: 'success', text: 'Free format invoice created successfully' })

    router.push(`/invoices/search/free-format/view-${response.id}?preview=true`)
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
    loadingStore.start()
    const response: any = await $api.consignees.getDetailsForInvoice(id)

    currentConsignee.value = response
    form.value.rfc = response?.tax_number
    form.value.address = fullAddress(response?.address)
    form.value.zip_code = response?.address?.zip_code
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const getPartyInfoInvoice = async (body: any) => {
  try {
    loadingStore.start()
    const response: any = await $api.freeFormatInvoices.getPartyInfoInvoice(body)

    form.value.razon_social = response.razon_social
    form.value.rfc = response.rfc
    form.value.zip_code = response.zip_code
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const setAddress = (address: any) => {
  form.value.address = fullAddress(address)
  form.value.zip_code = address.zip_code
  showAddressDialog.value = false
}

const fullAddress = (address: any) => {
  if (!address) return ''
  return `${address.street} ${address.number} - ${address.neighborhood} ${address.city} ${address.state} ${address.country?.name}, ${address.zip_code}`
}

// watch partyable_id to get consignee info
watch(
  () => form.value.partyable_id,
  async (newValue) => {
    // clear form values
    form.value = {
      ...form.value,
      razon_social: null,
      rfc: null,
      zip_code: null,
    }
    if (newValue) {
      const body = {
        partyable_id: newValue,
        partyable_type: form.value.partyable_type,
      }
      await getPartyInfoInvoice(body)
    }
  }
)
</script>
