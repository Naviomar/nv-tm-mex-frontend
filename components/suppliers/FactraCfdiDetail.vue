<template>
  <div>
    <v-card :color="darkMode.isDark ? 'cardBackground' : ''">
      <v-card-title>
        <h3>Configure supplier CFDI</h3>
      </v-card-title>
      <v-card-text>
        <v-card class="mb-4">
          <v-card-title>
            <div class="flex justify-between">
              <div class="flex items-center gap-2">
                <v-icon size="x-small">mdi-invoice-outline</v-icon>
                <div>Supplier CFDI #{{ props.id }}</div>
              </div>
            </div>
          </v-card-title>
          <v-card-text>
            <div class="grid grid-cols-2 mb-4">
              <div>
                <div>
                  <h3 class="font-bold">Supplier</h3>
                  <div>{{ supplierCfdi.supplier?.name || 'Pending supplier' }} ➡️ {{ supplierCfdi.rfc_emisor }}</div>
                </div>
                <div>
                  <h3 class="font-bold">CFDI date</h3>
                  <div>{{ formatDateOnlyString(supplierCfdi.invoice_date) }}</div>
                </div>
                <div>
                  <h3 class="font-bold">Serie/Folio</h3>
                  <div>{{ supplierCfdi.serie_folio }}</div>
                </div>
                <div>
                  <h3 class="font-bold">Received at</h3>
                  <div>{{ formatDateString(supplierCfdi.created_at) }}</div>
                </div>
                <div>
                  <h3 class="font-bold">Status</h3>
                  <div>Pending payment</div>
                </div>
              </div>
              <div>
                <div>
                  <h3 class="font-bold">Total in CFDI</h3>
                  <div>{{ formatToCurrency(supplierCfdi.amount_cfdi) }} {{ supplierCfdi.currency?.name }}</div>
                </div>
                <div>
                  <h3 class="font-bold">Available balance</h3>
                  <div>{{ formatToCurrency(availableBalance) }} {{ supplierCfdi.currency?.name }}</div>
                  <div v-if="supplierCfdi.has_cap_limit === 0" class="flex gap-2">
                    <v-chip color="primary" size="small">Cap limit by supplier type</v-chip>
                    <v-btn icon="mdi-sync" size="x-small" color="purple" @click="reSyncSupplierCapLimit"></v-btn>
                  </div>
                </div>
                <div>
                  <h3 class="font-bold">CFDI Type</h3>
                  <div>
                    {{ supplierCfdi.tipo_comprobante_name }}
                  </div>
                </div>
                <div v-if="supplierCfdi.is_manual">
                  <v-chip color="purple" size="small">Manual CFDI</v-chip>
                </div>
              </div>
            </div>
            <div class="grid grid-cols-2">
              <ButtonDownloadS3Object2 :s3Path="supplierCfdi.xml_attachment" label="Download XML" />

              <ButtonDownloadS3Object2 :s3Path="supplierCfdi.pdf_attachment" label="Download Zip" />
            </div>

            <div v-if="hasParent">
              <v-alert type="info" title="Reissued invoice" variant="tonal" density="compact">
                This invoice is linked / reissued from
                <NuxtLink
                  :to="`/invoices/suppliers/cfdis/view-${supplierCfdi.parent_deleted?.id}`"
                  target="_blank"
                  class="underline"
                  ><v-icon>mdi-open-in-new</v-icon> {{ supplierCfdi.parent_deleted?.serie_folio }}
                </NuxtLink>
              </v-alert>
            </div>

            <div v-if="isDeleted">
              <v-alert type="error" title="Invoice is cancelled" density="compact">
                This invoice is cancelled and linked to
                <NuxtLink
                  v-for="(children, index) in supplierCfdi.children_deleted"
                  :to="`/invoices/suppliers/cfdis/view-${children.id}`"
                  target="_blank"
                  class="underline"
                  :key="`children-${index}`"
                  ><v-icon>mdi-open-in-new</v-icon> {{ children.serie_folio }}
                </NuxtLink>
              </v-alert>
            </div>

            <div class="mb-4">
              <SupplierCfdiNotesForm :supplierCfdi="supplierCfdi" />
            </div>

            <div>
              <div class="font-bold py-4">Current concepts in invoice</div>
              <v-table density="compact">
                <thead>
                  <tr>
                    <th class="w-14">Actions</th>
                    <th>Service Ref#</th>
                    <th>Concept</th>
                    <th>Amount</th>
                    <th>IVA</th>
                    <th>Ret. IVA</th>
                    <th>Ret. ISR</th>
                    <th>Subtotal</th>
                    <th>Sell links.</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="supplierCfdi.invoices?.length === 0">
                    <td colspan="9" class="text-center">No concepts found</td>
                  </tr>
                  <tr v-for="(invoice, index) in supplierCfdi.invoices" :key="`current-invoice-${index}`">
                    <td>
                      <TrashButton :item="invoice" @click="confirmDeleteSupInvoice" />
                    </td>
                    <td>{{ invoice.referenceable?.reference_number }}</td>
                    <td>{{ invoice.chargeable?.name }}</td>
                    <td>{{ getCurrencyName(invoice.currency_id) }} {{ formatToCurrency(invoice.amount) }}</td>
                    <td class="text-green">{{ formatToCurrency(invoice.amount_iva) }}</td>
                    <td class="text-red">-{{ formatToCurrency(invoice.amount_ret_iva) }}</td>
                    <td class="text-red">-{{ formatToCurrency(invoice.amount_ret_isr) }}</td>
                    <td class="font-bold">{{ formatToCurrency(invoice.amount_total) }}</td>
                    <td>
                      <div v-for="(link, index) in invoice.links" :key="`invoice-link-${index}`">
                        <v-chip color="primary" size="small" class="mr-2">
                          {{ getLinkName(link) }}
                        </v-chip>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </v-table>
            </div>

            <!-- Add more concepts to invoice -->
            <div>
              <div v-if="!canAddMoreSupplierPayConcepts">
                <v-alert type="warning" density="compact">
                  La factura no se puede modificar, ya que el monto total ya se desglosó o no es un CFDI de tipo
                  ingreso.
                </v-alert>
              </div>

              <v-alert
                v-if="hasLinkWithDemurrageAndDetentions"
                type="warning"
                density="compact"
                color="amber"
                class="py-2"
              >
                This invoice has links with a request payment for demurrage / detentions. Please remove them before
                adding more concepts.
              </v-alert>

              <div v-if="canAddMoreSupplierPayConcepts && !hasLinkWithDemurrageAndDetentions">
                <div class="font-bold py-4">Find services to attach concepts</div>
                <SearchGlobalServicesGrouped @update="setServicios" />
              </div>

              <div v-if="hasServiciosFound" class="py-6">
                <div class="font-bold text-lg">Add concepts to supplier invoice</div>
                <div class="mb-4">Service: {{ getServiciosTypeName }} - {{ countServiciosFound }} found.</div>

                <div class="grid grid-cols-8 gap-3">
                  <div class="col-span-2">
                    <v-autocomplete
                      v-model="newConcept.service"
                      :items="serviciosFound.services"
                      item-title="reference_number"
                      return-object
                      label="Service Ref#"
                      density="compact"
                      multiple
                    />
                    <v-btn color="primary" size="small" @click="selectAllServices">Select all</v-btn>
                  </div>
                  <div class="col-span-2">
                    <v-autocomplete
                      v-model="newConcept.charge_id"
                      :items="catalogs.charges"
                      item-title="name"
                      item-value="id"
                      label="Concept"
                      density="compact"
                    />
                  </div>
                  <div class="col-span-2">
                    <v-text-field
                      v-model="newConcept.amount"
                      type="number"
                      label="Amount"
                      density="compact"
                      hide-details
                    />
                    <v-btn color="primary" variant="tonal" size="small" @click="setMaxAmountAvailable"
                      >Set max amount</v-btn
                    >
                  </div>
                  <div>
                    <v-autocomplete
                      v-model="newConcept.currency_id"
                      :items="currencies"
                      item-title="name"
                      item-value="id"
                      label="Currency"
                      density="compact"
                      readonly
                    />
                  </div>
                  <div>
                    <v-checkbox v-model="newConcept.is_con_iva" density="compact" label="IVA" />
                  </div>
                  <div>
                    <v-text-field v-model="newConcept.ret_iva_perc" label="Ret. IVA %" density="compact" />
                  </div>
                  <div>
                    <v-checkbox v-model="newConcept.is_ret_isr" density="compact" label="Ret. ISR" />
                  </div>
                  <div class="col-span-2">
                    <div class="flex gap-2">
                      <div class="">
                        <v-btn color="primary" @click="addConcept">Add concept</v-btn>
                        <div>
                          -> Amount available: {{ formatToCurrency(availableBalance) }}
                          {{ supplierCfdi.currency?.name }}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="col-span-2">
                    <v-card color="amber">
                      <v-card-title> Total amount </v-card-title>
                      <v-card-text>
                        {{ formatToCurrency(newConceptTotalAmount) }}
                      </v-card-text>
                    </v-card>
                  </div>
                  <div class="col-span-2">
                    <v-card color="primary" density="compact" variant="outlined">
                      <v-card-title>
                        <div class="flex items-center justify-between">
                          <div>Calculator</div>
                          <div>
                            <v-btn icon size="x-small" @click="showCalc = !showCalc" color="blue-grey-darken-2">
                              <v-icon v-if="showCalc">mdi-eye-outline</v-icon>
                              <v-icon v-if="!showCalc">mdi-eye-closed</v-icon>
                            </v-btn>
                          </div>
                        </div>
                      </v-card-title>
                      <v-card-text v-if="showCalc">
                        <v-row>
                          <v-col cols="12">
                            <v-radio-group v-model="calcIvaMode" row>
                              <v-radio label="Calcular monto + IVA" value="masIva" />
                              <v-radio label="Calcular monto sin IVA (precio ya incluye IVA)" value="sinIva" />
                            </v-radio-group>
                          </v-col>
                          <v-col cols="12">
                            <v-text-field
                              v-model.number="calcMonto"
                              prepend-inner-icon="mdi-currency-usd"
                              label="Cantidad"
                              type="number"
                              density="compact"
                              min="0"
                              variant="outlined"
                            />
                          </v-col>
                          <v-col cols="12">
                            <v-table density="compact">
                              <tbody>
                                <tr>
                                  <td class="font-bold">Monto sin IVA</td>
                                  <td>
                                    {{ formatToCurrency(calcMontoSinIva) }}
                                  </td>
                                </tr>
                                <tr>
                                  <td class="font-bold">IVA (16%)</td>
                                  <td>
                                    {{ formatToCurrency(calcIva) }}
                                  </td>
                                </tr>
                                <tr>
                                  <td class="font-bold">Total con IVA</td>
                                  <td>
                                    {{ formatToCurrency(calcTotalConIva) }}
                                  </td>
                                </tr>
                              </tbody>
                            </v-table>
                          </v-col>
                        </v-row>
                      </v-card-text>
                    </v-card>
                  </div>
                </div>
              </div>

              <div v-if="form.concepts.length > 0">
                <v-table density="compact">
                  <thead>
                    <tr>
                      <th>Actions</th>
                      <th>Service Ref#</th>
                      <th>Concept</th>
                      <th>Amount</th>
                      <th>Currency</th>
                      <th>IVA</th>
                      <th>Ret. IVA %</th>
                      <th>Ret. ISR</th>
                      <th>Subtotal</th>
                      <th>Sell links</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(concept, index) in form.concepts" :key="`concept-${index}`">
                      <td>
                        <v-btn
                          color="error"
                          icon="mdi-delete"
                          size="x-small"
                          variant="tonal"
                          @click="removeConcept(concept, index)"
                        >
                        </v-btn>
                      </td>
                      <td>
                        <div class="text-xs">
                          {{ getEachServiceRefNumber(concept.service) }}
                        </div>
                      </td>
                      <td>{{ getChargeName(concept.charge_id) }}</td>
                      <td>{{ formatToCurrency(concept.amount) }}</td>
                      <td>{{ getCurrencyName(concept.currency_id) }}</td>
                      <td>{{ concept.is_con_iva ? 'Yes' : 'No' }}</td>
                      <td>{{ concept.ret_iva_perc }}%</td>
                      <td>{{ concept.is_ret_isr ? 'Yes' : 'No' }}</td>
                      <td>{{ formatToCurrency(calcTotalWithTaxes(concept)) }}</td>
                      <td>
                        <div v-for="(sellConcept, index) in concept.sell_concepts" :key="`sell-concept-${index}`">
                          <v-chip color="primary" size="small" class="mr-2">
                            {{ sellConcept.charge?.name }}
                          </v-chip>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </v-table>

                <v-btn color="primary" @click="saveCfdiChanges">Save changes</v-btn>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-card-text>
    </v-card>
    <SupplierConceptVsSellProfitDialog
      :supplierConcept="dialogVsSellProfit"
      :charges="catalogs.charges"
      @add-concept="addValidatedConcept"
    />
  </div>
</template>
<script setup lang="ts">
import { currencies } from '~/utils/data/systemData'
const { $api, $notifications } = useNuxtApp()
const confirm = $notifications.useConfirm()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()
const router = useRouter()
const darkMode = useDarkMode()
const supplierProvision = useSupplierProvisionStore()

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
})

const supplierCfdi = ref<any>({})
const serviciosFound = ref<any>({ serviceType: null, services: [] })

const catalogs = ref<any>({
  charges: [],
  suppliers: [],
})

const newConcept = ref<any>({
  service_type: null,
  service: null,
  amount: 0,
  currency_id: null,
  is_con_iva: false,
  ret_iva_perc: 0,
  is_ret_isr: false,
})

const form = ref<any>({
  supplier_id: null,
  concepts: [],
})

const dialogVsSellProfit = ref<any>({
  show: false,
  concept: null,
})

const calcIvaMode = ref<'masIva' | 'sinIva'>('masIva')
const calcMonto = ref<number>(0)
const showCalc = ref<boolean>(true)

const calcMontoSinIva = computed(() => {
  if (calcIvaMode.value === 'masIva') {
    return calcMonto.value
  }
  // si ya incluye IVA, monto / 1.16
  return Math.round((calcMonto.value / 1.16) * 100) / 100
})

const calcIva = computed(() => {
  if (calcIvaMode.value === 'masIva') {
    return Math.round(calcMonto.value * 0.16 * 100) / 100
  }
  // si ya incluye IVA, monto - montoSinIva
  return Math.round((calcMonto.value - calcMontoSinIva.value) * 100) / 100
})

const calcTotalConIva = computed(() => {
  if (calcIvaMode.value === 'masIva') {
    return Math.round(calcMonto.value * 1.16 * 100) / 100
  }
  // si ya incluye IVA, es el monto original
  return calcMonto.value
})

const isDeleted = computed(() => {
  return !!supplierCfdi.value.deleted_at
})

const hasParent = computed(() => {
  return !!supplierCfdi.value.parent_deleted
})

const getServiciosTypeName = computed(() => {
  if (serviciosFound.value.serviceType) {
    if (serviciosFound.value.serviceType === 'M') {
      return 'Maritime'
    }
    if (serviciosFound.value.serviceType === 'A') {
      return 'Air'
    }
  }
  return 'Unkown service'
})

const hasServiciosFound = computed(() => {
  return serviciosFound.value.services.length > 0
})

const countServiciosFound = computed(() => {
  return serviciosFound.value.services.length || 0
})

const serviceTypes = computed(() => {
  return [
    { name: 'Import maritime', value: 'IM' },
    { name: 'Export maritime', value: 'EM' },
    { name: 'Import air', value: 'IA' },
    { name: 'Export air', value: 'EA' },
  ]
})

const amountProvisioned = computed(() => {
  if (supplierCfdi.value.has_cap_limit === 0) {
    return parseFloat(supplierCfdi.value.cap_limit)
  }
  return parseFloat(supplierCfdi.value.amount_provisioned)
})

const isAmountGreaterThanProvisioned = computed(() => {
  return (
    form.value.concepts.reduce((acc: number, concept: any) => acc + parseFloat(concept.amount || 0), 0) >
    amountProvisioned.value
  )
})

const getLinkName = (link: any) => {
  if (link.chargeable_type.includes('Charge')) {
    return link.chargeable?.charge?.name
  }
  if (link.chargeable_type.includes('FfNote')) {
    return `F.F. Note #${link.chargeable_id} From TM Debit`
  }
  return 'Unknown link name'
}

const availableBalance = computed(() => {
  if (supplierCfdi.value.has_cap_limit === 0) {
    return parseFloat(supplierCfdi.value.cap_limit)
  }
  const total =
    amountProvisioned.value -
    form.value.concepts.reduce((acc: number, concept: any) => acc + calcTotalWithTaxes(concept), 0)
  // return rounded to 2 decimals
  return Math.round((total + Number.EPSILON) * 100) / 100
})

const canAddMoreSupplierPayConcepts = computed(() => {
  return (
    availableBalance.value > 0 &&
    (supplierCfdi.value.tipo_comprobante === 'I' || supplierCfdi.value.tipo_comprobante === 'E')
  )
})

const hasLinkWithDemurrageAndDetentions = computed(() => {
  // if in supplierCfdi has length > 0 in reqDemurrages or reqDetentions
  return supplierCfdi.value.req_demurrages?.length > 0 || supplierCfdi.value.req_detentions?.length > 0
})

const getChargeName = (id: number) => {
  return catalogs.value.charges.find((charge: any) => charge.id === id)?.name
}

const getCurrencyName = (id: number) => {
  return currencies.find((currency) => currency.id === id)?.name
}

const setMaxAmountAvailable = () => {
  newConcept.value.amount = availableBalance.value
  // set to calculator
  calcMonto.value = availableBalance.value
}

const addConcept = () => {
  if (newConcept.value.amount <= 0) {
    snackbar.add({ type: 'warning', text: 'Amount must be greater than 0' })
    return
  }
  if (!newConcept.value.service || !newConcept.value.charge_id) {
    snackbar.add({ type: 'warning', text: 'Please select a service and concept' })
    return
  }

  const currentConceptTotal = calcTotalWithTaxes(newConcept.value)
  console.log('currentConceptTotal', currentConceptTotal)

  let grandTotal =
    form.value.concepts.reduce((acc: number, concept: any) => acc + calcTotalWithTaxes(concept), 0) +
    currentConceptTotal

  // multiply by number of services selected
  grandTotal = grandTotal * (newConcept.value.service ? newConcept.value.service.length : 1)
  console.log('grandTotal', grandTotal)
  console.log('amountProvisioned', amountProvisioned.value)

  if (grandTotal > amountProvisioned.value) {
    snackbar.add({ type: 'warning', text: 'Amount is greater than provisioned' })
    return
  }

  let concept = JSON.parse(JSON.stringify(newConcept.value))
  concept.service_type = serviciosFound.value.serviceType

  dialogVsSellProfit.value.show = true
  dialogVsSellProfit.value.concept = concept

  // form.value.concepts.push(concept)
  newConcept.value = {
    service_type: null,
    service_id: null,
    amount: 0,
    currency_id: supplierCfdi.value.currency_id,
    is_con_iva: false,
    ret_iva_perc: 0,
    is_ret_isr: 0,
  }
}

const newConceptTotalAmount = computed(() => {
  const roundToTwo = (value: number) => Math.round(value * 100) / 100

  // newConcept if IVA multiply by 1.16
  // newConcept if Ret. IVA multiply by 0.84
  // newConcept if Ret. ISR multiply by 0.10
  let total = parseFloat(newConcept.value.amount)
  let iva = 0
  let retIva = 0
  let retIsr = 0

  if (newConcept.value.is_con_iva) {
    iva = roundToTwo(newConcept.value.amount * 0.16)
  }
  if (newConcept.value.ret_iva_perc) {
    retIva = roundToTwo(newConcept.value.amount * (newConcept.value.ret_iva_perc / 100))
  }
  if (newConcept.value.is_ret_isr) {
    retIsr = roundToTwo(newConcept.value.amount * 0.1)
  }

  // Perform addition and subtraction without rounding
  total = total + iva - retIva - retIsr

  // multiply by number of services selected
  total = total * (newConcept.value.service ? newConcept.value.service.length : 1)

  // Round the final total to two decimal places
  return roundToTwo(total) || 0
})

const calcTotalWithTaxes = (concept: any) => {
  const roundUp = (value: number) => Math.round(value * 100) / 100

  let total = parseFloat(concept.amount)
  let iva = 0
  let retIva = 0
  let retIsr = 0
  if (concept.is_con_iva) {
    iva = roundUp(concept.amount * 0.16)
  }
  if (concept.ret_iva_perc) {
    retIva = roundUp(concept.amount * (concept.ret_iva_perc / 100))
  }
  if (concept.is_ret_isr) {
    retIsr = roundUp(concept.amount * 0.1)
  }

  total = total + iva - retIva - retIsr
  console.log('Tax total', total)

  return roundUp(total)
}

const confirmDeleteSupInvoice = async (supplierInvoice: any) => {
  const result = await confirm({
    title: 'Are you sure?',
    confirmationText: 'Yes, I confirm',
    content: 'Please confirm this action.',
    dialogProps: {
      persistent: true,
      maxWidth: 500,
    },
    confirmationButtonProps: {
      color: 'primary',
    },
  })

  if (result) {
    await deleteSupplierInvoiceInCfdi(supplierInvoice)
  }
}

const reSyncSupplierCapLimit = async () => {
  try {
    loadingStore.start()
    await $api.suppliers.reSyncSupplierCapLimit(supplierCfdi.value.id)
    snackbar.add({ type: 'success', text: 'Cap limit re-synced' })

    await getData()
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const deleteSupplierInvoiceInCfdi = async (supplierInvoice: any) => {
  try {
    loadingStore.start()
    const body = {
      supplier_cfdi_id: supplierCfdi.value.id,
      supplier_invoice_id: supplierInvoice.id,
    }
    await $api.suppliers.deleteSupplierInvoiceInCfdi(supplierCfdi.value.id, body)
    snackbar.add({ type: 'success', text: 'Supplier invoice removed' })

    await getData()
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const selectAllServices = () => {
  newConcept.value.service = serviciosFound.value.services
}

const getEachServiceRefNumber = (service: any) => {
  if (service && service.length > 1) {
    return service.map((s: any) => s.reference_number).join(', ')
  }
  return ''
}

const cancelAddConcept = () => {
  newConcept.value = {
    service_type: null,
    service_id: null,
    amount: 0,
    currency_id: supplierCfdi.value.currency_id,
    is_con_iva: false,
    ret_iva_perc: 0,
    is_ret_isr: 0,
  }
}

const addValidatedConcept = (supplierConcept: any) => {
  console.log('addValidatedConcept')
  // foreach
  supplierProvision.addConcept(supplierConcept)
  console.log(supplierConcept)

  form.value.concepts.push(supplierConcept)
}

const removeConcept = (concept: any, index: number) => {
  supplierProvision.removeConcept(concept)
  form.value.concepts.splice(index, 1)
}

const setServicios = (servicios: any) => {
  console.log('set Servicios')
  console.log(servicios)
  supplierProvision.clearConcepts
  serviciosFound.value = servicios
}

const updateSupplierOnCfdi = async () => {
  try {
    loadingStore.start()
    const body = {
      supplier_cfdi_id: supplierCfdi.value.id,
      supplier_id: form.value.supplier_id,
    }
    await $api.suppliers.updateSupplierOnCfdi(body)
    snackbar.add({ type: 'success', text: 'Supplier updated' })

    await getData()
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const saveCfdiChanges = async () => {
  try {
    if (isAmountGreaterThanProvisioned.value) {
      snackbar.add({ type: 'warning', text: 'Amount is greater than provisioned' })
      return
    }
    loadingStore.start()
    const body = {
      ...form.value,
      supplier_cfdi_id: supplierCfdi.value.id,
    }
    const response = await $api.suppliers.saveCfdiChanges(body)
    snackbar.add({ type: 'success', text: 'Supplier invoice updated' })

    router.push('/invoices/suppliers/cfdis')
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
    const response = await $api.suppliers.getSupplierCfdiCatalogs()

    catalogs.value = response
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
    const response = await $api.suppliers.getSupplierCfdiById(props.id)

    supplierCfdi.value = response
    form.value.supplier_id = response.supplier_id
    newConcept.value.currency_id = response.currency_id
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

  supplierProvision.clearConcepts()

  if (supplierCfdi.value.supplier_id == null) {
    snackbar.add({ type: 'warning', text: 'CFDI not linked to a supplier.' })
    navigateTo('/invoices/suppliers/cfdis')
  }
})
</script>
