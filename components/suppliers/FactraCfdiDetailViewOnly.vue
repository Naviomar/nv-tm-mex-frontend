<template>
  <div>
    <v-card :color="darkMode.isDark ? 'cardBackground' : ''">
      <v-card-title>
        <h3>Factra - Supplier CFDI</h3>
      </v-card-title>
      <v-card-text>
        <v-card class="mb-4" :class="isDeleted ? 'bg-red-200! dark:bg-red-900!' : ''">
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
                  <v-chip v-if="supplierCfdi.has_cap_limit === 0" color="primary" size="small"
                    >Cap limit by supplier type</v-chip
                  >
                </div>
                <div>
                  <h3 class="font-bold">CFDI Type</h3>
                  <div>
                    {{ supplierCfdi.tipo_comprobante_name }}
                  </div>
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

            <div v-if="hasLinkReqDemurrages">
              <v-table density="compact">
                <thead>
                  <tr>
                    <th>Req Demurrage #</th>
                    <th>Amount</th>
                    <th>Inv. Type</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(reqDemurrage, index) in supplierCfdi.req_demurrages" :key="`req-demurrage-link-${index}`">
                    <td>
                      <v-chip :to="`/invoices/search/lines/demurrages/req-pay-view-${reqDemurrage.id}`" color="primary">
                        <v-icon>mdi-open-in-new</v-icon>
                        Req. Demurrage #{{ reqDemurrage.id }}
                      </v-chip>
                    </td>
                    <td>{{ formatToCurrency(reqDemurrage.amount) }}</td>
                    <td>{{ reqDemurrage.inv_type }}</td>
                  </tr>
                </tbody>
              </v-table>
            </div>

            <div v-if="hasLinkReqDetentions">
              <v-table density="compact">
                <thead>
                  <tr>
                    <th>Req Demurrage #</th>
                    <th>Amount</th>
                    <th>Inv. Type</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(reqDetention, index) in supplierCfdi.req_detentions" :key="`req-detention-link-${index}`">
                    <td>
                      <v-chip :to="`/invoices/search/lines/detentions/req-pay-view-${reqDetention.id}`" color="primary">
                        <v-icon>mdi-open-in-new</v-icon>
                        Req. Detention #{{ reqDetention.id }}
                      </v-chip>
                    </td>
                    <td>{{ formatToCurrency(reqDetention.amount) }}</td>
                    <td>{{ reqDetention.inv_type }}</td>
                  </tr>
                </tbody>
              </v-table>
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

const isDeleted = computed(() => {
  return !!supplierCfdi.value.deleted_at
})

const hasParent = computed(() => {
  return !!supplierCfdi.value.parent_deleted
})

const hasLinkReqDemurrages = computed(() => {
  return supplierCfdi.value.req_demurrages?.length > 0
})

const hasLinkReqDetentions = computed(() => {
  return supplierCfdi.value.req_detentions?.length > 0
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
    return `${link.chargeable?.charge?.name} - F.F. Note #${link.chargeable_id} From TM Debit`
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
  return availableBalance.value > 0 && supplierCfdi.value.tipo_comprobante === 'I'
})

const getChargeName = (id: number) => {
  return catalogs.value.charges.find((charge: any) => charge.id === id)?.name
}

const getCurrencyName = (id: number) => {
  return currencies.find((currency) => currency.id === id)?.name
}

const setMaxAmountAvailable = () => {
  newConcept.value.amount = availableBalance.value
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
  return roundToTwo(total)
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
