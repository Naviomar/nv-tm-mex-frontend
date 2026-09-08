<template>
  <div>
    <v-dialog v-model="supplierConcept.show" max-width="1000">
      <v-card>
        <v-card-title> Validate Profit: Select sell concepts - Services #{{ refNumber }} </v-card-title>
        <v-card-text>
          <div>
            <div class="grid grid-cols-2 gap-4">
              <div class="border border-gray-100 p-4">
                <div class="font-bold">Concept to pay</div>
                <div class="">{{ getChargeName(props.supplierConcept.concept.charge_id) }}</div>
                <div class="">
                  {{ getCurrencyName(props.supplierConcept.concept?.currency_id) }}
                  {{ formatToCurrency(supplierConceptTotalWithTaxes) }}
                  / {{ totalServices }} services
                </div>
                <div class="flex gap-2">
                  <v-chip v-if="props.supplierConcept.concept.is_con_iva" color="primary" size="x-small">+ IVA </v-chip>
                  <v-chip v-if="props.supplierConcept.concept.ret_iva_perc" color="primary" size="x-small">
                    - Ret IVA {{ props.supplierConcept.concept.ret_iva_perc }}%
                  </v-chip>
                  <v-chip v-if="props.supplierConcept.concept.is_ret_isr" color="primary" size="x-small">
                    - Ret ISR
                  </v-chip>
                </div>
              </div>
              <div class="border border-gray-100 p-4">
                <div class="font-bold flex items-center">
                  <div>Amount selected</div>
                  <v-tooltip location="top">
                    <template v-slot:activator="{ props }">
                      <v-icon v-bind="props" class="ml-1 cursor-pointer">mdi-information</v-icon>
                    </template>
                    <span>
                      The selected amount is the sum of the selected sell concepts. The amount is converted to the
                      supplier concept currency.
                    </span>
                  </v-tooltip>
                </div>
                <div class="">
                  {{ getCurrencyName(props.supplierConcept.concept?.currency_id) }}
                  {{ formatToCurrency(selectedSellAmount) }}
                </div>
                <div class="">{{ selectedSellConceptsCount }} concepts selected</div>
              </div>
            </div>
            <v-alert
              v-if="!isSelectedGreatherThanSupplierConcept && !isSkipLinkConcepts && selectedSellConceptsCount > 0"
              type="warning"
              density="compact"
              variant="tonal"
              class="mt-2"
            >
              The selected amount is less than the supplier concept amount, so this concept will generate negative
              profit. You can still continue if this is intentional.
            </v-alert>
            <v-alert
              v-if="isSelectedGreatherThanSupplierConcept"
              type="success"
              density="compact"
              variant="tonal"
              class="mt-2"
            >
              Good job! The selected amount is greater than the supplier concept amount. You are generating profit.
            </v-alert>

            <v-alert v-if="hasMismatchSelectedSellCharges" color="error" density="compact">
              <div class="font-bold">Mismatch selected sell charges</div>
              <div>Please make sure that the selected sell charges are the same for TM or WM services only.</div>
            </v-alert>

            <v-alert v-if="hasInvalidLinkAmounts" color="error" density="compact" class="mt-2">
              <div class="font-bold">Invalid amount to link</div>
              <div>
                The amount to link for a selected concept must be greater than 0 and cannot exceed the amount
                available for that concept.
              </div>
            </v-alert>
          </div>
          <div>
            <div class="font-bold pt-4">Select available sell concepts to continue...</div>
            <v-checkbox
              v-model="form.skip_link_concepts"
              label="Continue without linking concepts"
              color="purple"
              hide-details
            />
            <v-table v-if="!isSkipLinkConcepts" density="compact">
              <thead>
                <tr>
                  <th class="w-10">Actions</th>
                  <th>Link</th>
                  <th>Concept</th>
                  <th>Amount</th>
                  <th>IVA</th>
                  <th>Total</th>
                  <th>Available</th>
                  <th>Amount to link</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="sellConcepts.length === 0">
                  <td colspan="8" class="text-center">No sell concepts found</td>
                </tr>
                <tr v-for="(concept, index) in sellConcepts" :key="`sell-concept-${index}`">
                  <td>
                    <v-checkbox
                      v-model="concept.selected"
                      color="primary"
                      :disabled="!concept.selected && isConceptFullyLinked(concept)"
                      hide-details
                      @update:model-value="(val) => onSelectConcept(concept, val)"
                    />
                  </td>
                  <td>{{ getLinkLabel(concept) }}</td>
                  <td>
                    <div class="flex flex-col gap-1">
                      <div>
                        <v-chip size="small" color="lime">{{ concept.inv_type }}</v-chip>
                        {{ concept.charge?.name }}
                      </div>
                      <div class="text-xs">Service #{{ getServiceRefNum(concept) }}</div>
                    </div>
                  </td>
                  <td>{{ getCurrencyName(concept.currency_id) }} {{ formatToCurrency(concept.amount) }}</td>
                  <td>{{ concept.is_con_iva === 1 ? 'Yes' : 'No' }}</td>
                  <td>{{ getCurrencyName(concept.currency_id) }} {{ formatToCurrency(getTotalConcept(concept)) }}</td>
                  <td>
                    {{ getCurrencyName(concept.currency_id) }} {{ formatToCurrency(getAvailableAmountWithTaxes(concept)) }}
                  </td>
                  <td>
                    <v-text-field
                      v-if="concept.selected"
                      v-model.number="concept.link_amount"
                      type="number"
                      density="compact"
                      hide-details
                      :error="!isLinkAmountValid(concept)"
                      style="max-width: 130px"
                    />
                    <span v-else>-</span>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </div>
          <DivisaWidget />
        </v-card-text>
        <v-card-actions>
          <v-btn color="secondary" @click="cancel"> Close </v-btn>
          <v-btn
            color="primary"
            :disabled="!isSkipLinkConcepts && (selectedSellConceptsCount === 0 || hasInvalidLinkAmounts)"
            @click="addConceptToSupplierInvoice"
          >
            Add concept to supplier invoice
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script setup lang="ts">
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()
const exchangeRatesStore = useExchangeRatesStore()
const supplierProvision = useSupplierProvisionStore()

const props = defineProps({
  supplierConcept: {
    type: Object,
    required: true,
  },
  charges: {
    type: Array<any>,
    required: true,
  },
})

const emits = defineEmits(['add-concept'])

const serviceReferences = ref<any>([])
const sellConcepts = ref<any>([])
const form = reactive({
  skip_link_concepts: false,
})

const isSeaImport = computed(() => {
  return props.supplierConcept.concept.service_type === 'IM'
})

const isSeaExport = computed(() => {
  return props.supplierConcept.concept.service_type === 'EM'
})

const usdToMxnRate = computed(() => {
  return (
    exchangeRatesStore.rates.find(
      (rate: any) => rate.origin_currency?.code === 'USD' && rate.destination_currency?.code === 'MXN'
    )?.rate || 0
  )
})

const refNumber = computed(() => {
  // now are an array of services, return by comma
  return serviceReferences.value?.map((service: any) => service.reference_number).join(', ') || ''
  // return serviceReference.value?.reference_number || ''
  //return serviceReferences.value?.reference_number || ''
})

const getChargeName = (chargeId: number) => {
  const charge = props.charges.find((charge: any) => charge.id === chargeId) || {}
  return charge?.name || ''
}

const isSkipLinkConcepts = computed(() => {
  return form.skip_link_concepts
})

const supplierConceptTotalWithTaxes = computed(() => {
  if (!props.supplierConcept.concept) {
    return 0
  }
  const roundUp = (value: number) => Math.round(value * 100) / 100
  const amount = parseFloat(props.supplierConcept.concept.amount)

  let total = amount
  let iva = 0
  let retIva = 0
  let retIsr = 0
  if (props.supplierConcept.concept.is_con_iva) {
    iva = roundUp(amount * 0.16)
  }
  if (props.supplierConcept.concept.ret_iva_perc) {
    retIva = roundUp(amount * (props.supplierConcept.concept.ret_iva_perc / 100))
  }
  if (props.supplierConcept.concept.is_ret_isr) {
    retIsr = roundUp(amount * 0.1)
  }

  total = total + iva - retIva - retIsr

  // multiply by services count
  total = total * totalServices.value

  return roundUp(total)
})

const totalServices = computed(() => {
  return serviceReferences.value.length
})

const selectedSellAmount = computed(() => {
  return sellConcepts.value.reduce((acc: number, concept: any) => {
    if (concept.selected) {
      let amount = parseFloat(concept.link_amount ?? concept.amount)
      if (concept.is_con_iva === 1) {
        amount *= 1.16
      }
      const exRate = exchangeRatesStore.getExchangeRate(concept.currency_id, props.supplierConcept.concept.currency_id)
      return acc + amount * exRate
    }
    return acc
  }, 0)
})

const selectedSellConceptsCount = computed(() => {
  return sellConcepts.value.filter((concept: any) => concept.selected).length
})

const isSelectedGreatherThanSupplierConcept = computed(() => {
  const totalAmount = parseFloat(props.supplierConcept.concept.amount) * totalServices.value
  return selectedSellAmount.value > totalAmount
})

const getTotalConcept = (concept: any) => {
  // if is_con_iva multiply by 1.16
  if (concept.is_con_iva === 1) {
    return parseFloat(concept.amount) * 1.16
  }
  return parseFloat(concept.amount)
}

const transformSellConcept = (sellConcept: any, response: any, serviceType: any) => {
  const baseConcept = {
    ...sellConcept,
    service_id: response.id,
    service_class_name: response.class_name,
    selected: false, // Default selected to false
  }

  if (serviceType === 'EM') {
    return {
      ...baseConcept,
      amount: sellConcept.sell_amount,
      currency_id: sellConcept.sell_currency_id,
      is_con_iva: parseFloat(sellConcept.sell_iva) > 0 ? 1 : 0,
    }
  }

  if (serviceType === 'IA' || serviceType === 'EA') {
    return {
      ...baseConcept,
      amount: sellConcept.sell_amount,
      currency_id: sellConcept.sell_currency_id,
      is_con_iva: parseFloat(sellConcept.sell_iva) > 0 ? 1 : 0,
    }
  }

  return baseConcept // Default case
}

const transformSellConcepts = (sellConcepts: any, response: any, serviceType: any) =>
  (sellConcepts || []).map((sellConcept: any) => transformSellConcept(sellConcept, response, serviceType))

const transformFFNotes = (notes: any, response: any) =>
  (notes || []).flatMap((note: any) =>
    (note.concepts || []).map((concept: any) => ({
      ...note,
      class_name: concept.class_name,
      service_id: response.id,
      service_class_name: response.class_name,
      inv_type: 'N/A',
      ff_note_concept_id: concept.id, // Include concept details if needed
      amount: concept.amount,
      supplier_invoice_links: concept.supplier_invoice_links,
      charge: {
        id: concept.id,
        name: `${concept.charge?.name} - FF Note #${note.service_folio} - From TM Debit`,
      },
    }))
  )

const getServiceSellConcepts = _Debounce(async () => {
  try {
    loadingStore.start()
    serviceReferences.value = []
    sellConcepts.value = []
    let sellConceptsFound = [] as any

    for (const service of props.supplierConcept.concept.service) {
      const body = { service }
      const serviceKey = `${service.impoExpo}${props.supplierConcept.concept.service_type}`
      let response

      if (serviceKey === 'IM') {
        response = await $api.supplierInvoices.getSeaImportSellProfit(body)
        serviceReferences.value.push(response)

        sellConceptsFound = sellConceptsFound.concat(
          transformSellConcepts(response.charges, response, serviceKey),
          transformSellConcepts(response.sell_rate_breakdown, response, serviceKey),
          transformFFNotes(response.ff_notes, response)
        )
      }

      if (serviceKey === 'EM') {
        response = await $api.supplierInvoices.getSeaExportSellProfit(body)
        serviceReferences.value.push(response)

        sellConceptsFound = sellConceptsFound.concat(
          transformSellConcepts(
            (response.export_charges || []).filter((c: any) => c.is_sell === 1),
            response,
            serviceKey
          ),
          transformFFNotes(response.ff_notes, response)
        )
      }

      if (serviceKey === 'IA' || serviceKey === 'EA') {
        response = await $api.supplierInvoices.getAirSellProfit(body)
        serviceReferences.value.push(response)

        sellConceptsFound = sellConceptsFound.concat(
          transformSellConcepts(
            (response.charges || []).filter((c: any) => c.sell_amount != null),
            response,
            serviceKey
          ),
          transformFFNotes(response.ff_notes, response)
        )
      }
    }

    sellConcepts.value = sellConceptsFound
    console.log('sellConcepts', sellConcepts.value)
  } catch (error) {
    console.error(error)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
})

const getServiceRefNum = (concept: any) => {
  const service = serviceReferences.value.find(
    (service: any) => service.id === concept.service_id && service.class_name === concept.service_class_name
  )
  return service?.reference_number || ''
}

// Amount (with taxes, same currency as the sell concept) already linked to
// supplier invoices persisted in the backend for this sell concept.
const getPersistedLinkedAmount = (concept: any) => {
  const links = concept.supplier_invoice_links || (concept.supplier_invoice_link ? [concept.supplier_invoice_link] : [])
  return links.reduce((acc: number, link: any) => acc + parseFloat(link.amount || 0), 0)
}

// Amount (with taxes) already committed to this same sell concept by other
// supplier concepts added in the current, not-yet-saved capture session.
const getDraftLinkedAmount = (concept: any) => {
  const serviceSellConcepts = supplierProvision.getConcepts()
  const allDraftSellConcepts = serviceSellConcepts.map((item: any) => item.sell_concepts).flat()

  return allDraftSellConcepts
    .filter(
      (draftConcept: any) =>
        draftConcept.id === concept.id &&
        draftConcept.class_name === concept.class_name &&
        draftConcept.ff_note_concept_id === concept.ff_note_concept_id
    )
    .reduce((acc: number, draftConcept: any) => {
      const amount = parseFloat(draftConcept.amount || 0)
      return acc + (draftConcept.is_con_iva ? amount * 1.16 : amount)
    }, 0)
}

// Remaining amount (with taxes) that can still be linked for this sell concept.
const getAvailableAmountWithTaxes = (concept: any) => {
  const total = getTotalConcept(concept)
  const used = getPersistedLinkedAmount(concept) + getDraftLinkedAmount(concept)
  return Math.round(Math.max(0, total - used) * 100) / 100
}

// Same as above, but expressed in the "base" amount (pre-IVA) shape that
// concept.amount/link_amount use, since that's what gets sent to the backend.
const getAvailableBaseAmount = (concept: any) => {
  const availableWithTaxes = getAvailableAmountWithTaxes(concept)
  const base = concept.is_con_iva === 1 ? availableWithTaxes / 1.16 : availableWithTaxes
  return Math.round(base * 100) / 100
}

const isConceptFullyLinked = (concept: any) => {
  return getAvailableAmountWithTaxes(concept) <= 0.01
}

const onSelectConcept = (concept: any, selected: boolean) => {
  if (selected) {
    concept.link_amount = getAvailableBaseAmount(concept)
  }
}

const isLinkAmountValid = (concept: any) => {
  if (!concept.selected) {
    return true
  }
  const amount = parseFloat(concept.link_amount)
  const available = getAvailableBaseAmount(concept)
  return amount > 0 && amount <= available + 0.01
}

const hasInvalidLinkAmounts = computed(() => {
  return sellConcepts.value.some((concept: any) => concept.selected && !isLinkAmountValid(concept))
})

const getLinkLabel = (concept: any) => {
  const links = concept.supplier_invoice_links || (concept.supplier_invoice_link ? [concept.supplier_invoice_link] : [])
  const draftAmount = getDraftLinkedAmount(concept)

  if (links.length === 0 && draftAmount === 0) {
    return 'Available'
  }

  const parts = links.map((link: any) => {
    const cfdi = link.supplier_invoice?.cfdi
    const reqPay = link.supplier_invoice?.supplier_req_payment

    const cfdiRef = cfdi
      ? `CFDI ${[cfdi.serie, cfdi.folio].filter(Boolean).join('-')}`
      : `Supplier invoice #${link.supplier_invoice_id}`
    const reqPayRef = reqPay ? `Request #${reqPay.id}` : 'not yet assigned to a request payment'

    return `${formatToCurrency(link.amount)} → ${cfdiRef} (${reqPayRef})`
  })

  if (draftAmount > 0) {
    parts.push(`${formatToCurrency(draftAmount)} → Linked in this capture`)
  }

  return parts.join(' | ')
}

const hasMismatchSelectedSellCharges = computed(() => {
  let hasTm = false
  let hasWm = false
  sellConcepts.value.forEach((sellConcept: any) => {
    // check selected sellConcept has tm or wm
    if (sellConcept.selected) {
      if (sellConcept.inv_type === 'tm') {
        hasTm = true
      }
      if (sellConcept.inv_type === 'wm') {
        hasWm = true
      }
    }
  })

  if (hasTm && hasWm) {
    return true
  }
  return false
})

watch(
  () => props.supplierConcept,
  (newVal) => {
    console.log('watch', newVal)
    if (newVal) {
      if (newVal.show) {
        getServiceSellConcepts()
      }
    }
  },
  { immediate: true, deep: true }
)

const cancel = () => {
  props.supplierConcept.show = false
}

const addConceptToSupplierInvoice = () => {
  let body = {
    ...props.supplierConcept.concept,
    sell_concepts: sellConcepts.value.filter((concept: any) => concept.selected) || [],
  }

  // body.sell_concepts map only id, class_name, amount, currency_id, is_con_iva, supplier_invoice_links, inv_type, charge.name
  // `amount` is the (possibly partial) amount being linked now, not necessarily the full concept amount.
  body.sell_concepts = body.sell_concepts.map((concept: any) => {
    return {
      id: concept.id,
      ff_note_concept_id: concept.ff_note_concept_id,
      class_name: concept.class_name,
      service_id: concept.service_id,
      service_class_name: concept.service_class_name,
      amount: concept.link_amount ?? concept.amount,
      currency_id: concept.currency_id,
      is_con_iva: concept.is_con_iva,
      supplier_invoice_links: concept.supplier_invoice_links,
      inv_type: concept.inv_type,
      charge: {
        id: concept.charge?.id,
        name: concept.charge?.name,
      },
    }
  })

  //

  body = JSON.parse(JSON.stringify(body))
  emits('add-concept', body)
  cancel()
}
</script>
