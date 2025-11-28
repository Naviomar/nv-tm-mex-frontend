<template>
  <div>
    <div v-if="!isProforma" class="mb-4">
      <v-alert type="warning" dense>
        <div class="font-bold">This is not a proforma invoice, you can not edit anymore.</div>
      </v-alert>

      <InvoiceWmDetail v-if="isSeaInvoice" :id="id.toString()" />
      <InvoiceAirWmDetail v-if="isAirInvoice" :id="id.toString()" />
    </div>
    <div v-if="isProforma" class="mb-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <v-card color="blue-lighten-4" class="mb-4">
            <v-card-title
              ><div class="font-bold">{{ invoiceType }} WM #{{ invoiceWm.invoice.invoice_number }}</div></v-card-title
            >
            <v-card-text>
              <div class="grid grid-cols-3">
                <div class="font-bold">Reference(s)</div>
                <div class="col-span-2">
                  <div v-for="(service, index) in invoiceWm.services" :key="`service-${index}`" class="font-bold">
                    {{ service.referencia?.reference_number }}
                  </div>
                </div>

                <div>Customer linked</div>
                <div class="col-span-2">
                  <v-autocomplete
                    v-model="invoiceWm.consignee_id"
                    :items="catalogs.consignees"
                    density="compact"
                    item-title="name"
                    item-value="id"
                    @update:model-value="getConsigneeInfo"
                  />
                </div>
              </div>
              <div class="border-4 border-dotted p-2 border-blue-400">
                <div class="col-span-2 font-bold mb-2">Invoice info (read only)</div>
                <div>
                  <v-text-field
                    v-model="invoiceWm.razon_social"
                    density="compact"
                    label="Razón social"
                    variant="outlined"
                    readonly
                  />
                </div>
                <div>
                  <v-text-field v-model="invoiceWm.rfc" density="compact" label="RFC" variant="outlined" readonly />
                </div>
                <div>
                  <v-textarea
                    v-model="invoiceWm.address"
                    density="compact"
                    label="Address"
                    variant="outlined"
                    readonly
                    rows="3"
                  />
                </div>
                <div>
                  <v-text-field
                    v-model="invoiceWm.zip_code"
                    density="compact"
                    label="Zip code"
                    variant="outlined"
                    readonly
                  />
                </div>
              </div>
              <v-textarea v-model="invoiceWm.notes" density="compact" label="Additional notes" />

              <div class="grid grid-cols-1 py-2">
                <v-alert v-if="!currentConsignee.address" type="warning" variant="outlined" density="compact">
                  <div class="font-bold">No address found for this customer</div>
                </v-alert>

                <v-alert v-if="!hasConsigneeAddresses" type="error" variant="outlined" density="compact" class="my-2">
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
              <div class="flex justify-around gap-2 mt-4 mb-2">
                <v-btn size="small" color="primary" @click="onSaveChangesClick">Save changes</v-btn>
                <PreviewWmInvoice :service="invService" :invoice="invoiceWm" />
              </div>
            </v-card-text>
          </v-card>
        </div>
        <div>
          <v-card v-if="isProforma" density="compact" class="mb-2">
            <v-card-title
              ><div class="text-base">Updates available until: {{ expirationDate }}</div>
            </v-card-title>
            <v-card-text>
              <ClientOnly>
                <PomodoroTimer :start-date="invoiceWm.proforma_until" />
              </ClientOnly>
            </v-card-text>
          </v-card>

          <v-card v-if="false" color="blue-lighten-4" class="mb-4">
            <v-card-title
              ><div v-for="(service, index) in invoiceWm.services" :key="`service-${index}`" class="font-bold">
                Linked reference #{{ service.referencia?.reference_number }}
              </div></v-card-title
            >
            <v-card-text>
              <div class="font-bold mb-4">Sea Import reference detail. Reference charges as WM</div>
              <div class="font-bold">Sell charges</div>
              <v-table density="compact">
                <thead>
                  <tr>
                    <th class="font-bold!">Service</th>
                    <th class="font-bold!">Concept</th>
                    <th class="font-bold!">Amount</th>
                    <th class="font-bold!">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(charge, idx) in refSellChargesWm" :key="`ref-sell-charge-${idx}`">
                    <td>{{ getServiceRefNumber(charge) }}</td>
                    <td>{{ charge.charge?.name }}</td>
                    <td class="text-right">
                      {{ formatToCurrency(charge.amount) }} {{ getCurrencyName(charge.currency_id) }}
                    </td>
                    <td class="text-right">
                      {{ formatToCurrency(getRefChargeTotal(charge)) }} {{ getCurrencyName(charge.currency_id) }}
                    </td>
                  </tr>
                </tbody>
              </v-table>
              <div class="font-bold">Charges</div>
              <v-table density="compact">
                <thead>
                  <tr>
                    <th class="font-bold!">Service</th>
                    <th class="font-bold!">Concept</th>
                    <th class="font-bold!">Amount</th>
                    <th class="font-bold!">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(charge, idx) in refChargesWm" :key="`ref-charge-${idx}`">
                    <td>{{ getServiceRefNumber(charge) }}</td>
                    <td>{{ charge.charge?.name }}</td>
                    <td class="text-right">
                      {{ formatToCurrency(charge.amount) }} {{ getCurrencyName(charge.currency_id) }}
                    </td>
                    <td class="text-right">
                      {{ formatToCurrency(getRefChargeTotal(charge)) }} {{ getCurrencyName(charge.currency_id) }}
                    </td>
                  </tr>
                </tbody>
              </v-table>
              <div class="grid grid-cols-2">
                <div :class="colorRefTotal">
                  <div class="flex flex-col justify-center items-center">
                    <div class="text-xl">Total reference</div>
                    <div class="font-bold text-xl">
                      {{ formatToCurrency(referenciaTotal) }}
                    </div>
                  </div>
                </div>
                <div :class="colorInvTotal">
                  <div class="flex flex-col justify-center items-center">
                    <div class="text-xl">Total invoice</div>
                    <div class="font-bold text-xl">
                      {{ formatToCurrency(invoiceWmTotal) }}
                    </div>
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </div>
        <div class="col-span-2">
          <v-card color="blue-lighten-4" class="mb-4">
            <v-card-title><div class="font-bold">Invoice detail</div></v-card-title>
            <v-card-text>
              <v-btn v-if="false" color="primary" size="small" @click="toggleConceptForm">New concept</v-btn>
              <div v-if="showConceptForm" class="py-2">
                <SeaImportChargeProformaForm
                  :catalogs="catalogs"
                  :edit-charge="chargeToEdit"
                  :services="invoiceWm.services"
                  invoiceType="wm"
                  @add="addConcept"
                  @update="updateConcept"
                  @cancel="toggleConceptForm"
                />
              </div>
              <v-table density="compact">
                <thead>
                  <tr>
                    <th class="font-bold! w-5"></th>
                    <th class="font-bold! w-5">#</th>
                    <th class="font-bold!">Linked Ref</th>
                    <th class="font-bold!">Concept</th>
                    <th class="font-bold!">Amount</th>
                    <th class="font-bold! text-right">Subtotal</th>
                    <th class="font-bold!">Generated by</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="!invoiceWm.invoice?.charges.length">
                    <td colspan="7">
                      <v-alert type="warning" dense>
                        <div class="font-bold">No charges added, this proforma will be cancelled</div>
                      </v-alert>
                    </td>
                  </tr>
                  <tr v-for="(charge, idx) in invoiceWm.invoice?.charges" :key="`invoice-charge-${idx}`">
                    <td>
                      <div class="flex items-center">
                        <v-btn
                          v-if="false"
                          size="small"
                          variant="text"
                          icon="mdi-pencil-outline"
                          color="blue-lighten-2"
                          dense
                          @click="editCharge(charge, idx)"
                        ></v-btn>
                        <v-icon
                          v-if="chargeCanBeDeleted(charge)"
                          @click="confirmRemoveProformaConcept(charge)"
                          class="cursor-pointer"
                          color="error"
                          >mdi-delete</v-icon
                        >
                      </div>
                    </td>
                    <td>{{ charge.id }}</td>
                    <td>
                      {{ charge.serviceable?.reference_number }}
                    </td>
                    <td>
                      <div class="flex items-center gap-2">
                        <div class="pt-1">{{ charge.charge?.name }}</div>
                        <div v-if="!chargeCanBeDeleted(charge)">
                          <v-tooltip location="top">
                            <template v-slot:activator="{ props }">
                              <v-icon v-bind="props" color="amber" class="cursor-pointer">mdi-alert-outline</v-icon>
                            </template>
                            <span> Concept can't be deleted. </span>
                          </v-tooltip>
                        </div>
                      </div>
                    </td>
                    <td>{{ getCurrencyName(charge.currency_id) }} {{ formatToCurrency(parseFloat(charge.amount)) }}</td>
                    <td class="text-right">
                      {{ formatToCurrency(invoiceChargeTotal(charge)) }}
                    </td>
                    <td>{{ charge.creator?.name }}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="5" class="text-right font-bold">Total</td>
                    <td class="font-bold text-right">
                      {{ formatToCurrency(invoiceWmTotal) }}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </v-table>

              <div class="flex justify-center py-4">
                <v-btn color="primary" size="small" @click="onSaveChangesClick">Save changes</v-btn>
              </div>
            </v-card-text>
          </v-card>
        </div>
      </div>
    </div>
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
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()
const router = useRouter()

const props = defineProps({
  id: {
    type: [String, Number],
    required: true,
  },
  invService: {
    type: String,
    required: true,
  },
})

const currentConsignee = ref<any>({
  address: null,
  addresses: [],
})

const catalogs = ref<any>({
  consigness: [],
  charges: [],
  currencies: [],
})

const removeConceptForm = ref<any>({
  show: false,
  charge: {},
})

const showConceptForm = ref(false)
const showAddressDialog = ref(false)

const cancel = ref<any>({
  reason: '',
})

const referencias = ref<any>([])
const invoiceWm = ref<any>({})
const showCancelDialog = ref(false)
const chargeToEdit = ref<any>({})

const invoiceType = computed(() => {
  return invoiceWm.value?.is_proforma === 1 ? 'Proforma' : 'Invoice'
})

const isProforma = computed(() => {
  return invoiceWm.value?.is_proforma === 1
})

const hasConsigneeAddresses = computed(() => {
  return currentConsignee.value.addresses?.length > 0
})

const isCancelled = computed(() => {
  return invoiceWm.value?.cancelled_at != null
})

const isSeaInvoice = computed(() => {
  return props.invService === 'sea'
})

const isAirInvoice = computed(() => {
  return props.invService === 'air'
})

const isLinkedWithRefIcon = (concept: any) => {
  // if concept is linked with a reference, return a link icon
  const charges = refChargesWm.value.concat(refSellChargesWm.value)
  const chargeLinked = charges.find((charge: any) => charge.charge_id == concept.charge_id)
  return chargeLinked ? 'mdi-link' : 'mdi-link-off'
}

const expirationDate = computed(() => {
  return formatDateString(invoiceWm.value?.proforma_until)
})

const getRefChargeTotal = (concept: any) => {
  return parseFloat(concept.amount)
}

const invoiceChargeTotal = (charge: any) => {
  return parseFloat(charge.amount)
}

const invoiceWmTotal = computed(() => {
  return invoiceWm.value?.invoice.charges
    .reduce((acc: number, charge: any) => {
      return acc + parseFloat(charge.amount)
    }, 0)
    .toFixed(2)
})

const isTheLastInvoice = computed(() => {
  return invoiceWm.value.invoice?.charges.length === 1
})

const referenciaTotal = computed(() => {
  const charges = refChargesWm.value?.reduce((acc: number, charge: any) => {
    return acc + parseFloat(charge.amount)
  }, 0)
  const sellCharges = refSellChargesWm.value?.reduce((acc: number, charge: any) => {
    return acc + parseFloat(charge.amount)
  }, 0)
  return (charges + sellCharges).toFixed(2)
})

const refChargesWm = computed(() => {
  if (!referencias.value) return []
  return referencias.value?.reduce((acc: any, ref: any) => {
    return acc.concat(ref?.charges?.filter((charge: any) => charge.inv_type === 'wm'))
  }, [])
})

const refSellChargesWm = computed(() => {
  if (!referencias.value) return []
  return referencias.value?.reduce((acc: any, ref: any) => {
    return acc.concat(ref?.sell_rate_breakdown?.filter((charge: any) => charge.inv_type === 'wm'))
  }, [])
})

const getServiceRefNumber = (charge: any) => {
  return referencias.value.find((ref: any) => ref.id === charge.referencia_id)?.reference_number
}

const colorRefTotal = computed(() => {
  // return {
  //   'bg-green-200': referenciaTotal.value === invoiceWmTotal.value,
  //   'bg-red-200': referenciaTotal.value !== invoiceWmTotal.value,
  // }
  return 'bg-gray-200'
})

const colorInvTotal = computed(() => {
  // return {
  //   'bg-green-200': referenciaTotal.value === invoiceWmTotal.value,
  //   'bg-red-200': referenciaTotal.value !== invoiceWmTotal.value,
  // }
  return 'bg-gray-200'
})

const chargeCanBeDeleted = (invCharge: any) => {
  return invCharge.charge?.can_be_deleted === 1
}

const toggleConceptForm = () => {
  showConceptForm.value = !showConceptForm.value
}

const addConcept = (concept: any) => {
  invoiceWm.value.invoice.charges.push(concept)
  showConceptForm.value = false
}

const updateConcept = (concept: any) => {
  const index = invoiceWm.value.invoice.charges.findIndex((c: any) => c.id === concept.id)
  invoiceWm.value.invoice.charges[index] = concept
  showConceptForm.value = false
  chargeToEdit.value = {}
}

const confirmRemoveProformaConcept = (charge: any) => {
  removeConceptForm.value.charge = charge
  removeConceptForm.value.show = true
}

const cancelRemoveConcept = () => {
  removeConceptForm.value.show = false
  removeConceptForm.value.charge = {}
}

const onSaveChangesClick = async () => {
  try {
    loadingStore.start()
    const body = {
      ...invoiceWm.value,
      charges: invoiceWm.value.invoice.charges,
    }
    delete body.consignee
    delete body.referencia
    delete body.created_by
    await $api.wmInvoices.updateProforma(body)

    snackbar.add({ type: 'success', text: 'Changes saved' })

    router.back()
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

    console.log('result', response)
    currentConsignee.value = response
    invoiceWm.value.razon_social = response?.name
    invoiceWm.value.rfc = response?.tax_number
    invoiceWm.value.address = fullAddress(response?.address)
    invoiceWm.value.zip_code = response?.address?.zip_code
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

  invoiceWm.value.address = fullAddress(address)
  invoiceWm.value.zip_code = address.zip_code
  showAddressDialog.value = false
}

const fullAddress = (address: any) => {
  if (!address) return ''
  return `${address.street} ${address.number} - ${address.neighborhood} ${address.city} ${address.state} ${address.country?.name}, ${address.zip_code}`
}

const editCharge = (charge: any, index: any) => {
  console.log('edit charge', chargeToEdit)
  chargeToEdit.value = { ...charge }
  showConceptForm.value = true
}

const getData = async () => {
  try {
    loadingStore.start()
    const body = {
      id: props.id.toString(),
      inv_service: props.invService,
    }
    const response = (await $api.wmInvoices.getByService(body)) as any

    invoiceWm.value = response
    currentConsignee.value = response?.consignee

    if (invoiceWm.value.invoice?.charges.length === 0) {
      snackbar.add({ type: 'warning', text: 'No charges added, this proforma has been cancelled' })
      router.back()
    }
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const getReferenciaFullDetail = async () => {
  try {
    loadingStore.start()
    invoiceWm.value.services.forEach(async (service: any) => {
      if (props.invService === 'sea') {
        const response = (await $api.referencias.getSeaImportFullDetails(service.referencia_id)) as any
        referencias.value.push(response)
      }
      if (props.invService === 'air') {
        const response = (await $api.airReferences.getAirRferenceById(service.air_reference_id)) as any
        referencias.value.push(response)
      }
    })
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
    loadingStore.start()
    const response = (await $api.wmInvoices.getCatalogs()) as any

    catalogs.value = response
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const removeConcept = async () => {
  try {
    loadingStore.start()

    const body = {
      inv_type: 'tm',
      service_type: props.invService,
      invoice_id: invoiceWm.value.invoice.id,
      invoice_charge_id: removeConceptForm.value.charge.id,
    }
    await $api.invoices.removeProformaConcept(body)

    snackbar.add({ type: 'success', text: 'Charge removed from proforma.' })
    cancelRemoveConcept()

    // if is the last concept, cancel the proforma
    if (isTheLastInvoice.value) {
      const airRoute = props.invService === 'air' ? 'air-' : ''
      router.push(`/invoices/search/wm-${airRoute}view-${props.id}`)
      return
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

onMounted(async () => {
  await getCatalogs()
  await getData()
  await getReferenciaFullDetail()
})
</script>
