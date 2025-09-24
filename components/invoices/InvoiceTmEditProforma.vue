<template>
  <div>
    <div v-if="!isProforma" class="mb-4">
      <v-alert type="warning" dense>
        <div class="font-bold">This is not a proforma invoice, you can not edit anymore.</div>
      </v-alert>
      <InvoiceTmDetail v-if="isSeaInvoice" :id="id.toString()" />
      <InvoiceAirTmDetail v-if="isAirInvoice" :id="id.toString()" />
    </div>
    <div v-if="isProforma" class="mb-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <v-card color="blue-lighten-4" class="mb-4">
            <v-card-title
              ><div class="font-bold">{{ invoiceType }} TM #{{ invoiceTm.invoice.invoice_number }}</div></v-card-title
            >
            <v-card-subtitle>
              <div class="font-bold">Invoice date {{ formatDateOnlyString(invoiceTm.created_at) }}</div>
            </v-card-subtitle>
            <v-card-text>
              <div class="grid grid-cols-3">
                <div class="font-bold">Reference(s)</div>
                <div class="col-span-2">
                  <div v-for="(service, index) in invoiceTm.services" :key="`service-${index}`" class="font-bold">
                    {{ service.referencia?.reference_number }}
                  </div>
                </div>

                <div>Customer linked</div>
                <div class="col-span-2">
                  <v-autocomplete
                    v-model="invoiceTm.consignee_id"
                    :items="catalogs.consignees"
                    density="compact"
                    item-title="name"
                    item-value="id"
                    @update:model-value="getConsigneeInfo"
                  />
                </div>
              </div>
              <div class="border-4 border-dotted p-2 border-blue-400">
                <div class="font-bold mb-2">Invoice info (read only)</div>
                <div class="">
                  <v-text-field
                    v-model="invoiceTm.razon_social"
                    density="compact"
                    label="Razón social"
                    variant="outlined"
                    readonly
                  />
                </div>
                <div class="">
                  <v-text-field v-model="invoiceTm.rfc" density="compact" label="RFC" variant="outlined" readonly />
                </div>
                <div class="">
                  <v-textarea
                    v-model="invoiceTm.address"
                    density="compact"
                    label="Address"
                    variant="outlined"
                    readonly
                    rows="3"
                  />
                </div>
                <div class="">
                  <v-text-field
                    v-model="invoiceTm.zip_code"
                    density="compact"
                    label="Zip code"
                    variant="outlined"
                    readonly
                  />
                </div>
              </div>
              <div class="grid grid-cols-1 py-2">
                <v-alert v-if="!currentConsignee.address" color="red" variant="tonal" density="compact">
                  <div class="font-bold">No address found for this customer</div>
                </v-alert>

                <v-alert v-if="!hasConsigneeAddresses" type="error" variant="tonal" density="compact" class="my-2">
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

              <div class="font-bold">Invoice date</div>
              <v-text-field
                v-model="invoiceTm.new_created_at"
                type="date"
                density="compact"
                label="Change Invoice date"
              />
              <div class="font-bold">Additional notes</div>
              <v-textarea v-model="invoiceTm.notes" density="compact" label="Additional notes" />
              <div class="font-bold">CFDI information</div>
              <v-autocomplete
                v-model="invoiceTm.regimen_fiscal"
                :items="cfdiCatalogs.regimenFiscales"
                density="compact"
                label="Régimen fiscal"
                item-title="name"
                item-value="name"
                readonly
              />
              <v-autocomplete
                v-model="invoiceTm.uso_cfdi"
                :items="cfdiCatalogs.usosCfdi"
                density="compact"
                label="Uso de CFDI"
                item-title="name"
                item-value="name"
              />
              <v-autocomplete
                v-model="invoiceTm.metodo_pago"
                :items="cfdiCatalogs.metodosPago"
                density="compact"
                label="Método de pago"
                item-title="name"
                item-value="name"
                @update:model-value="invoiceTm.forma_pago = null"
              />
              <v-autocomplete
                v-model="invoiceTm.forma_pago"
                :items="availableFormasPago"
                density="compact"
                label="Forma de pago"
                item-title="name"
                item-value="name"
              />

              <div class="flex justify-around gap-2 mt-4 mb-2">
                <v-btn size="small" color="primary" @click="onSaveChangesClick">Save changes</v-btn>
                <PreviewTmInvoice :service="invService" :invoice="invoiceTm" />
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
                <PomodoroTimer :start-date="invoiceTm.proforma_until" />
              </ClientOnly>
            </v-card-text>
          </v-card>

          <v-card v-if="false" color="blue-lighten-4" class="mb-4">
            <v-card-title
              ><div v-for="(service, index) in invoiceTm.services" :key="`service-${index}`" class="font-bold">
                Linked reference #{{ service.referencia?.reference_number }}
              </div></v-card-title
            >
            <v-card-text>
              <div class="font-bold mb-4">Sea Import reference detail. Reference charges as TM</div>
              <div class="font-bold">Sell charges</div>
              <v-table density="compact">
                <thead>
                  <tr>
                    <th class="font-bold!">Service</th>
                    <th class="font-bold!">Concept</th>
                    <th class="font-bold!">Amount</th>
                    <th class="font-bold!">+ iva</th>
                    <th class="font-bold!">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(charge, idx) in refSellChargesTm" :key="`ref-sell-charge-${idx}`">
                    <td>{{ getServiceRefNumber(charge) }}</td>
                    <td>{{ charge.charge?.name }}</td>
                    <td class="text-right">
                      {{ formatToCurrency(charge.amount) }} {{ getCurrencyName(charge.currency_id) }}
                    </td>
                    <td class="text-right">
                      {{ formatToCurrency(getTmConceptIva(charge)) }}
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
                    <th class="font-bold!">+ iva</th>
                    <th class="font-bold!">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(charge, idx) in refChargesTm" :key="`ref-charge-${idx}`">
                    <td>{{ getServiceRefNumber(charge) }}</td>
                    <td>{{ charge.charge?.name }}</td>
                    <td class="text-right">
                      {{ formatToCurrency(charge.amount) }} {{ getCurrencyName(charge.currency_id) }}
                    </td>
                    <td class="text-right">
                      {{ formatToCurrency(getTmConceptIva(charge)) }}
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
                      {{ formatToCurrency(invoiceTmTotal) }}
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
                  invoiceType="tm"
                  :services="invoiceTm.services"
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
                    <th class="font-bold!">+ iva</th>
                    <th class="font-bold! text-right">Subtotal</th>
                    <th class="font-bold!">Generated by</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="!invoiceTm.invoice?.charges.length">
                    <td colspan="8">
                      <v-alert type="warning" dense>
                        <div class="font-bold">No charges added, this proforma will be cancelled</div>
                      </v-alert>
                    </td>
                  </tr>
                  <tr v-for="(charge, idx) in invoiceTm.invoice?.charges" :key="`invoice-charge-${idx}`">
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
                    <td>{{ formatToCurrency(parseFloat(charge.amount)) }}</td>
                    <td>
                      {{ formatToCurrency(parseFloat(charge.amount_iva)) }}
                    </td>
                    <td class="text-right">
                      {{ formatToCurrency(invoiceChargeTotal(charge)) }}
                    </td>
                    <td>{{ charge.creator?.name }}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="6" class="text-right font-bold">Total</td>
                    <td class="font-bold text-right">
                      {{ formatToCurrency(invoiceTmTotal) }}
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
import { currencies, cfdiCatalogs } from '~/utils/data/systemData'
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

const showConceptForm = ref(false)
const showAddressDialog = ref(false)

const cancel = ref<any>({
  reason: '',
})

const removeConceptForm = ref<any>({
  show: false,
  charge: {},
})

const referencias = ref<any>([])
const invoiceTm = ref<any>({})
const chargeToEdit = ref<any>({})

const isTheLastInvoice = computed(() => {
  return invoiceTm.value.invoice?.charges.length === 1
})

const invoiceType = computed(() => {
  return invoiceTm.value?.is_proforma === 1 ? 'Proforma' : 'Invoice'
})

const isProforma = computed(() => {
  return invoiceTm.value?.is_proforma === 1
})

const hasConsigneeAddresses = computed(() => {
  return currentConsignee.value.addresses?.length > 0
})

const isCancelled = computed(() => {
  return invoiceTm.value?.cancelled_at != null
})

const isLinkedWithRefIcon = (concept: any) => {
  // if concept is linked with a reference, return a link icon
  const charges = refChargesTm.value.concat(refSellChargesTm.value)
  const chargeLinked = charges.find((charge: any) => charge.charge_id == concept.charge_id)
  return chargeLinked ? 'mdi-link' : 'mdi-link-off'
}

const availableFormasPago = computed(() => {
  if (!invoiceTm.value.metodo_pago) return []
  if (invoiceTm.value.metodo_pago.includes('PPD')) {
    return cfdiCatalogs.formasPago.filter((forma: any) => forma.name === '99 - Por definir')
  }

  return cfdiCatalogs.formasPago
})

const expirationDate = computed(() => {
  return formatDateString(invoiceTm.value?.proforma_until)
})

const getTmConceptIva = (concept: any) => {
  return concept.is_con_iva ? parseFloat(concept.amount) * 0.16 : 0
}

const getRefChargeTotal = (concept: any) => {
  return parseFloat(concept.amount) + getTmConceptIva(concept)
}

const invoiceChargeTotal = (charge: any) => {
  return parseFloat(charge.amount) + parseFloat(charge.amount_iva)
}

const invoiceTmTotal = computed(() => {
  return invoiceTm.value?.invoice?.charges
    .reduce((acc: number, charge: any) => {
      return acc + parseFloat(charge.amount) + parseFloat(charge.amount_iva)
    }, 0)
    .toFixed(2)
})

const referenciaTotal = computed(() => {
  const charges = refChargesTm.value?.reduce((acc: number, charge: any) => {
    return acc + parseFloat(charge.amount) + getTmConceptIva(charge)
  }, 0)
  const sellCharges = refSellChargesTm.value?.reduce((acc: number, charge: any) => {
    return acc + parseFloat(charge.amount) + getTmConceptIva(charge)
  }, 0)
  return (charges + sellCharges).toFixed(2)
})

const refChargesTm = computed(() => {
  if (!referencias.value) return []
  return referencias.value?.reduce((acc: any, ref: any) => {
    return acc.concat(ref?.charges?.filter((charge: any) => charge.inv_type === 'tm'))
  }, [])
})

const refSellChargesTm = computed(() => {
  if (!referencias.value) return []
  return referencias.value?.reduce((acc: any, ref: any) => {
    return acc.concat(ref?.sell_rate_breakdown?.filter((charge: any) => charge.inv_type === 'tm'))
  }, [])
})

const getServiceRefNumber = (charge: any) => {
  return referencias.value.find((ref: any) => ref.id === charge.referencia_id)?.reference_number
}

const isSeaInvoice = computed(() => {
  return props.invService === 'sea'
})

const isAirInvoice = computed(() => {
  return props.invService === 'air'
})

const colorRefTotal = computed(() => {
  // return {
  //   'bg-green-200': referenciaTotal.value === invoiceTmTotal.value,
  //   'bg-red-200': referenciaTotal.value !== invoiceTmTotal.value,
  // }
  return 'bg-gray-200'
})

const colorInvTotal = computed(() => {
  // return {
  //   'bg-green-200': referenciaTotal.value === invoiceTmTotal.value,
  //   'bg-red-200': referenciaTotal.value !== invoiceTmTotal.value,
  // }
  return 'bg-gray-200'
})

const chargeCanBeDeleted = (invCharge: any) => {
  console.log('invCharge', invCharge)
  return invCharge.charge?.can_be_deleted === 1
}

const toggleConceptForm = () => {
  showConceptForm.value = !showConceptForm.value
}

const addConcept = (concept: any) => {
  invoiceTm.value.invoice.charges.push(concept)
  showConceptForm.value = false
}

const updateConcept = (concept: any) => {
  const index = invoiceTm.value.invoice.charges.findIndex((c: any) => c.id === concept.id)
  invoiceTm.value.invoice.charges[index] = concept
  showConceptForm.value = false
  chargeToEdit.value = {}
}

const confirmRemoveProformaConcept = (charge: any) => {
  removeConceptForm.value.charge = charge
  removeConceptForm.value.show = true
  // invoiceTm.value.invoice.charges = invoiceTm.value?.invoice?.charges?.filter((concept: any) => concept.id !== id)
}

const cancelRemoveConcept = () => {
  removeConceptForm.value.show = false
  removeConceptForm.value.charge = {}
}

const onSaveChangesClick = async () => {
  try {
    loadingStore.start()
    const body = {
      ...invoiceTm.value,
      charges: invoiceTm.value.invoice.charges,
    }
    delete body.consignee
    delete body.referencia
    delete body.created_by
    console.log('body', body)
    await $api.tmInvoices.updateProforma(body)

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
    invoiceTm.value.rfc = response?.tax_number
    invoiceTm.value.razon_social = response?.name
    invoiceTm.value.regimen_fiscal = response?.regimen_fiscal
    invoiceTm.value.address = fullAddress(response?.address)
    invoiceTm.value.zip_code = response?.address?.zip_code
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

  invoiceTm.value.address = fullAddress(address)
  invoiceTm.value.zip_code = address.zip_code
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
    const response = (await $api.tmInvoices.getByService(body)) as any

    invoiceTm.value = response
    currentConsignee.value = response?.consignee

    if (invoiceTm.value.invoice?.charges.length === 0) {
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
    // foreach invoiceTm.services get the referencia_id
    invoiceTm.value.services.forEach(async (service: any) => {
      if (props.invService === 'sea') {
        const response = (await $api.referencias.getSeaImportFullDetails(service.referencia_id)) as any
        referencias.value.push(response)
      }
      if (props.invService === 'air') {
        const response = (await $api.airReferences.getAirRferenceById(service.air_reference_id)) as any
        referencias.value.push(response)
      }
    })
    // const response = (await $api.referencias.getSeaImportFullDetails(invoiceTm.value.referencia_id)) as any
    //referencia.value = response
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

const removeConcept = async () => {
  try {
    loadingStore.start()

    const body = {
      inv_type: 'tm',
      service_type: props.invService,
      invoice_id: invoiceTm.value.invoice.id,
      invoice_charge_id: removeConceptForm.value.charge.id,
    }
    await $api.invoices.removeProformaConcept(body)

    snackbar.add({ type: 'success', text: 'Charge removed from proforma.' })
    cancelRemoveConcept()

    // if is the last concept, cancel the proforma
    if (isTheLastInvoice.value) {
      const airRoute = props.invService === 'air' ? 'air-' : ''
      router.push(`/invoices/search/tm-${airRoute}view-${props.id}`)
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
