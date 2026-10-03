<template>
  <div>
    <v-dialog v-model="supplierConcept.show" max-width="1200" scrollable>
      <v-card rounded="lg">
        <v-card-title class="flex items-center gap-2 bg-primary text-white py-3">
          <v-icon>mdi-link-variant</v-icon>
          <div class="flex-1 min-w-0">
            <div class="text-subtitle-1 font-bold">Link to sell concepts</div>
            <div class="text-caption opacity-90 truncate">
              {{ getChargeName(supplierConcept.concept?.charge_id) }} · {{ refNumber || 'Loading references…' }}
            </div>
          </div>
          <v-btn icon="mdi-close" variant="text" density="comfortable" @click="cancel" />
        </v-card-title>

        <v-card-text class="pa-4" style="max-height: 78vh">
          <!-- Summary tiles -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <div class="tile">
              <div class="tile__label">Cost to pay</div>
              <div class="tile__value">{{ formatToCurrency(supplierConceptTotalWithTaxes) }} <small>{{ costCurrencyName }}</small></div>
              <div class="tile__hint">
                {{ formatToCurrency(costAmount) }} {{ costCurrencyName }} × {{ totalServices }} ref.
                <span v-if="!isCostUsd"> · ≈ {{ formatToCurrency(toUsd(costBaseTotal, costCurrencyId)) }} USD</span>
              </div>
              <div class="flex flex-wrap gap-1 mt-1">
                <v-chip v-if="supplierConcept.concept?.is_con_iva" color="green" size="x-small" variant="tonal">+ IVA</v-chip>
                <v-chip v-if="Number(supplierConcept.concept?.ret_iva_perc)" color="red" size="x-small" variant="tonal">
                  - Ret IVA {{ supplierConcept.concept?.ret_iva_perc }}%
                </v-chip>
                <v-chip v-if="supplierConcept.concept?.is_ret_isr" color="red" size="x-small" variant="tonal">- Ret ISR</v-chip>
              </div>
            </div>
            <div class="tile">
              <div class="tile__label">Sell linked ({{ selectedSellConceptsCount }})</div>
              <div class="tile__value">{{ formatToCurrency(selectedSellBase) }} <small>{{ costCurrencyName }}</small></div>
              <div class="tile__hint">
                Before taxes, converted to the invoice currency
                <span v-if="!isCostUsd"> · ≈ {{ formatToCurrency(toUsd(selectedSellBase, costCurrencyId)) }} USD</span>
              </div>
            </div>
            <div class="tile" :class="isSkipLinkConcepts || selectedSellConceptsCount === 0 ? '' : profit >= 0 ? 'tile--success' : 'tile--error'">
              <div class="tile__label">Estimated profit (before taxes)</div>
              <div class="tile__value">
                {{ selectedSellConceptsCount === 0 || isSkipLinkConcepts ? '-' : formatToCurrency(profit) }}
                <small v-if="selectedSellConceptsCount > 0 && !isSkipLinkConcepts">{{ costCurrencyName }}</small>
              </div>
              <div v-if="selectedSellConceptsCount > 0 && !isSkipLinkConcepts && !isCostUsd" class="tile__hint">
                ≈ {{ formatToCurrency(toUsd(profit, costCurrencyId)) }} USD
              </div>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-2 mb-3">
            <v-chip v-if="hasForeignCurrencies" size="small" color="blue-grey" variant="tonal" prepend-icon="mdi-swap-horizontal">
              {{ rateInfo }}
            </v-chip>
            <v-tooltip location="top" max-width="380">
              <template #activator="{ props: tp }">
                <v-icon v-bind="tp" size="small" color="medium-emphasis">mdi-information-outline</v-icon>
              </template>
              Amounts in another currency are converted with the exchange rate of the CFDI date, the same one the
              reference profit uses for this supplier invoice.
            </v-tooltip>
            <v-spacer />
            <v-switch
              v-model="form.skip_link_concepts"
              label="Continue without linking"
              color="purple"
              density="compact"
              hide-details
              inset
            />
          </div>

          <v-alert v-if="hasMismatchSelectedSellCharges" type="error" density="compact" class="mb-2">
            <div class="font-bold">Mismatch selected sell charges</div>
            <div>Please make sure that the selected sell charges are the same for TM or WM services only.</div>
          </v-alert>
          <v-alert v-if="hasInvalidLinkAmounts" type="error" density="compact" class="mb-2">
            The amount to link must be greater than 0 and cannot exceed the amount available for that concept.
          </v-alert>
          <v-alert
            v-if="!isSkipLinkConcepts && selectedSellConceptsCount > 0 && profit < 0"
            type="warning"
            density="compact"
            variant="tonal"
            class="mb-2"
          >
            The linked sell amount is lower than the cost: this concept generates negative profit. You can still
            continue if this is intentional.
          </v-alert>

          <template v-if="!isSkipLinkConcepts">
            <!-- Toolbar -->
            <div class="flex flex-wrap items-center gap-3 mb-2">
              <v-text-field
                v-model="filterText"
                prepend-inner-icon="mdi-magnify"
                placeholder="Filter concepts"
                density="compact"
                variant="outlined"
                hide-details
                clearable
                style="max-width: 260px"
              />
              <v-switch
                v-model="hideFullyLinked"
                :label="`Hide fully linked (${fullyLinkedCount})`"
                density="compact"
                hide-details
                inset
                color="primary"
              />
              <v-spacer />
              <div v-if="selectedSellConceptsCount > 0" class="flex flex-wrap items-center gap-2 rounded-lg px-3 py-1 tm-muted">
                <span class="text-xs font-medium">Selected amount to link:</span>
                <v-btn size="x-small" variant="tonal" @click="applyToSelected('full')">Full available</v-btn>
                <v-btn size="x-small" variant="tonal" color="indigo" prepend-icon="mdi-train-car-container" @click="applyToSelected('containers')">
                  Per container
                </v-btn>
                <v-text-field
                  v-model.number="containersCovered"
                  type="number"
                  min="1"
                  density="compact"
                  variant="outlined"
                  hide-details
                  style="width: 70px"
                  label="Cont."
                />
              </div>
            </div>

            <v-table density="compact" class="rounded tm-border">
              <thead>
                <tr>
                  <th class="w-10"></th>
                  <th>Concept</th>
                  <th class="text-right">Total</th>
                  <th class="text-right">Available</th>
                  <th style="min-width: 230px">Amount to link</th>
                  <th v-if="hasForeignCurrencies" class="text-right">In {{ costCurrencyName }}</th>
                  <th>Linked to</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="sellConcepts.length === 0">
                  <td :colspan="columnsCount" class="text-center py-4 text-medium-emphasis">No sell concepts found</td>
                </tr>
                <template v-for="group in groupedConcepts" :key="`group-${group.key}`">
                  <tr v-if="groupedConcepts.length > 1 || group.containers.length > 0" class="tm-row-muted">
                    <td :colspan="columnsCount" class="py-1">
                      <div class="flex flex-wrap items-center gap-2 text-xs">
                        <v-icon size="14">mdi-file-document-outline</v-icon>
                        <b>{{ group.referenceNumber }}</b>
                        <span v-if="group.containers.length" class="text-medium-emphasis">
                          · {{ group.containers.length }} container(s):
                        </span>
                        <v-chip v-for="c in group.containers" :key="`c-${c.id}`" size="x-small" variant="outlined" class="font-mono">
                          {{ c.container_number }}
                        </v-chip>
                      </div>
                    </td>
                  </tr>
                  <tr
                    v-for="concept in group.items"
                    :key="`sell-${concept._key}`"
                    :class="concept.selected ? 'tm-row-selected' : isConceptFullyLinked(concept) ? 'opacity-60' : ''"
                  >
                    <td>
                      <v-checkbox
                        v-model="concept.selected"
                        color="primary"
                        :disabled="!concept.selected && isConceptFullyLinked(concept)"
                        hide-details
                        density="compact"
                        @update:model-value="(val: any) => onSelectConcept(concept, val)"
                      />
                    </td>
                    <td>
                      <div class="flex items-center gap-1 flex-wrap">
                        <v-chip size="x-small" :color="originMeta(concept).color" variant="flat">{{ originMeta(concept).label }}</v-chip>
                        <span class="font-medium">{{ concept.short_name || concept.charge?.name }}</span>
                      </div>
                      <div v-if="concept.ff_note_folio" class="text-xs text-medium-emphasis">FF Note #{{ concept.ff_note_folio }} · from TM debit</div>
                    </td>
                    <td class="text-right whitespace-nowrap">
                      {{ getCurrencyName(concept.currency_id) }} {{ formatToCurrency(getTotalConcept(concept)) }}
                      <div class="text-xs text-medium-emphasis">{{ concept.is_con_iva === 1 ? 'IVA incl.' : 'No IVA' }}</div>
                    </td>
                    <td class="text-right whitespace-nowrap">
                      <span :class="isConceptFullyLinked(concept) ? 'text-medium-emphasis' : 'font-bold text-success'">
                        {{ getCurrencyName(concept.currency_id) }} {{ formatToCurrency(getAvailableAmountWithTaxes(concept)) }}
                      </span>
                    </td>
                    <td>
                      <div v-if="concept.selected" class="flex items-center gap-1">
                        <v-text-field
                          v-model.number="concept.link_amount"
                          type="number"
                          density="compact"
                          variant="outlined"
                          hide-details
                          :prefix="getCurrencyName(concept.currency_id)"
                          :error="!isLinkAmountValid(concept)"
                          style="max-width: 150px"
                        />
                        <v-menu :close-on-content-click="false" location="bottom end">
                          <template #activator="{ props: mp }">
                            <v-btn v-bind="mp" icon="mdi-call-split" size="x-small" variant="tonal" color="indigo" />
                          </template>
                          <v-card min-width="260" class="pa-3">
                            <div class="text-xs font-bold mb-2">Split amount</div>
                            <div class="flex flex-col gap-1">
                              <v-btn size="small" variant="tonal" block @click="setFull(concept)">Full available</v-btn>
                              <v-btn
                                v-if="containersFor(concept) > 1"
                                size="small"
                                variant="tonal"
                                color="indigo"
                                block
                                @click="setSplit(concept, 1, containersFor(concept))"
                              >
                                1 of {{ containersFor(concept) }} containers ·
                                {{ formatToCurrency(splitAmount(concept, 1, containersFor(concept))) }}
                              </v-btn>
                              <div class="flex items-center gap-1 mt-1">
                                <v-text-field v-model.number="concept.split_parts" type="number" min="1" density="compact" variant="outlined" hide-details label="Take" />
                                <span class="text-xs">of</span>
                                <v-text-field v-model.number="concept.split_total" type="number" min="1" density="compact" variant="outlined" hide-details label="Parts" />
                                <v-btn size="small" color="primary" @click="setSplit(concept, concept.split_parts, concept.split_total)">OK</v-btn>
                              </div>
                            </div>
                          </v-card>
                        </v-menu>
                      </div>
                      <span v-else class="text-medium-emphasis">-</span>
                    </td>
                    <td v-if="hasForeignCurrencies" class="text-right whitespace-nowrap text-medium-emphasis">
                      <template v-if="concept.selected">{{ formatToCurrency(linkAmountInCostCurrency(concept)) }}</template>
                      <template v-else>-</template>
                    </td>
                    <td>
                      <v-chip v-if="linkParts(concept).length === 0" size="x-small" color="success" variant="tonal">Available</v-chip>
                      <v-tooltip v-else location="top" max-width="420">
                        <template #activator="{ props: tp }">
                          <v-chip v-bind="tp" size="x-small" :color="isConceptFullyLinked(concept) ? 'grey' : 'orange'" variant="tonal">
                            {{ isConceptFullyLinked(concept) ? 'Fully linked' : 'Partially linked' }} ({{ linkParts(concept).length }})
                          </v-chip>
                        </template>
                        <div v-for="(part, i) in linkParts(concept)" :key="`part-${i}`" class="text-xs">{{ part }}</div>
                      </v-tooltip>
                    </td>
                  </tr>
                </template>
              </tbody>
            </v-table>
          </template>
        </v-card-text>

        <v-divider />
        <v-card-actions class="px-4">
          <div class="text-xs text-medium-emphasis">
            {{ selectedSellConceptsCount }} concept(s) selected
          </div>
          <v-spacer />
          <v-btn variant="text" @click="cancel">Close</v-btn>
          <v-btn
            color="primary"
            variant="flat"
            prepend-icon="mdi-plus"
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
  // supplier_cfdi.usd_rates: exchange rates at the CFDI date
  usdRates: {
    type: Object,
    default: null,
  },
})

const emits = defineEmits(['add-concept'])

const { convert, toUsd, rateLabel, rateDate } = useCfdiUsdRates(() => props.usdRates as any)

const serviceReferences = ref<any>([])
const sellConcepts = ref<any>([])
const filterText = ref<string | null>(null)
const hideFullyLinked = ref(true)
const containersCovered = ref(1)
const form = reactive({
  skip_link_concepts: false,
})

const costCurrencyId = computed(() => props.supplierConcept.concept?.currency_id)
const costCurrencyName = computed(() => getCurrencyName(costCurrencyId.value) || '')
const isCostUsd = computed(() => Number(costCurrencyId.value) === 2)
const costAmount = computed(() => parseFloat(props.supplierConcept.concept?.amount) || 0)
const costBaseTotal = computed(() => costAmount.value * totalServices.value)

const refNumber = computed(() => serviceReferences.value?.map((service: any) => service.reference_number).join(', ') || '')

const getChargeName = (chargeId: number) => {
  const charge = props.charges.find((charge: any) => charge.id === chargeId) || {}
  return charge?.name || ''
}

const isSkipLinkConcepts = computed(() => form.skip_link_concepts)

const supplierConceptTotalWithTaxes = computed(() => {
  if (!props.supplierConcept.concept) {
    return 0
  }
  const roundUp = (value: number) => Math.round(value * 100) / 100
  const amount = costAmount.value
  const iva = props.supplierConcept.concept.is_con_iva ? roundUp(amount * 0.16) : 0
  const retIva = Number(props.supplierConcept.concept.ret_iva_perc)
    ? roundUp(amount * (Number(props.supplierConcept.concept.ret_iva_perc) / 100))
    : 0
  const retIsr = props.supplierConcept.concept.is_ret_isr ? roundUp(amount * 0.1) : 0

  return roundUp((amount + iva - retIva - retIsr) * totalServices.value)
})

const totalServices = computed(() => serviceReferences.value.length || props.supplierConcept.concept?.service?.length || 0)

const hasForeignCurrencies = computed(() =>
  sellConcepts.value.some((concept: any) => Number(concept.currency_id) !== Number(costCurrencyId.value)),
)

const rateInfo = computed(() => {
  const currencyIds = new Set<number>([Number(costCurrencyId.value)])
  sellConcepts.value.forEach((concept: any) => currencyIds.add(Number(concept.currency_id)))
  const labels = [...currencyIds].map((id) => rateLabel(id)).filter(Boolean)
  const date = rateDate.value ? formatDateOnlyString(rateDate.value) : 'today'
  return `${labels.join(' · ') || 'Same currency'} (CFDI date ${date})`
})

// Base amount (before IVA) being linked, in the supplier concept currency
const linkBaseInCostCurrency = (concept: any) =>
  convert(parseFloat(concept.link_amount ?? concept.amount) || 0, concept.currency_id, costCurrencyId.value)

const linkAmountInCostCurrency = (concept: any) =>
  linkBaseInCostCurrency(concept) * (concept.is_con_iva === 1 ? 1.16 : 1)

const selectedSellBase = computed(() =>
  sellConcepts.value
    .filter((concept: any) => concept.selected)
    .reduce((acc: number, concept: any) => acc + linkBaseInCostCurrency(concept), 0),
)

const profit = computed(() => Math.round((selectedSellBase.value - costBaseTotal.value) * 100) / 100)

const selectedSellConceptsCount = computed(() => sellConcepts.value.filter((concept: any) => concept.selected).length)

const getTotalConcept = (concept: any) => {
  if (concept.is_con_iva === 1) {
    return parseFloat(concept.amount) * 1.16
  }
  return parseFloat(concept.amount)
}

const FF_NOTE_CLASS = 'FfNoteConcept'

const originMeta = (concept: any) => {
  if ((concept.class_name || '').includes(FF_NOTE_CLASS)) return { label: 'FF Note', color: 'orange-darken-2' }
  if (concept.inv_type === 'tm') return { label: 'Sell · TM', color: 'primary' }
  if (concept.inv_type === 'wm') return { label: 'Sell · WM', color: 'teal' }
  return { label: 'Sell', color: 'primary' }
}

const transformSellConcept = (sellConcept: any, response: any, serviceType: any) => {
  const baseConcept = {
    ...sellConcept,
    service_id: response.id,
    service_class_name: response.class_name,
    selected: false,
    short_name: sellConcept.charge?.name,
  }

  if (serviceType === 'EM' || serviceType === 'IA' || serviceType === 'EA') {
    return {
      ...baseConcept,
      amount: sellConcept.sell_amount,
      currency_id: sellConcept.sell_currency_id,
      is_con_iva: parseFloat(sellConcept.sell_iva) > 0 ? 1 : 0,
    }
  }

  return baseConcept
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
      ff_note_concept_id: concept.id,
      ff_note_folio: note.service_folio,
      amount: concept.amount,
      supplier_invoice_links: concept.supplier_invoice_links,
      short_name: concept.charge?.name,
      selected: false,
      charge: {
        id: concept.id,
        name: `${concept.charge?.name} - FF Note #${note.service_folio} - From TM Debit`,
      },
    })),
  )

const getServiceSellConcepts = _Debounce(async () => {
  try {
    loadingStore.start()
    serviceReferences.value = []
    sellConcepts.value = []
    form.skip_link_concepts = false
    filterText.value = null
    let sellConceptsFound = [] as any

    if (exchangeRatesStore.emptyRates) await exchangeRatesStore.fetchExchangeRates($api)

    for (const service of props.supplierConcept.concept.service) {
      const body = { service }
      const serviceKey = `${service.impoExpo}${props.supplierConcept.concept.service_type}`
      let response: any

      if (serviceKey === 'IM') {
        response = await $api.supplierInvoices.getSeaImportSellProfit(body)
        serviceReferences.value.push(response)
        sellConceptsFound = sellConceptsFound.concat(
          transformSellConcepts(response.charges, response, serviceKey),
          transformSellConcepts(response.sell_rate_breakdown, response, serviceKey),
          transformFFNotes(response.ff_notes, response),
        )
      }

      if (serviceKey === 'EM') {
        response = await $api.supplierInvoices.getSeaExportSellProfit(body)
        serviceReferences.value.push(response)
        sellConceptsFound = sellConceptsFound.concat(
          transformSellConcepts(
            (response.export_charges || []).filter((c: any) => c.is_sell === 1),
            response,
            serviceKey,
          ),
          transformFFNotes(response.ff_notes, response),
        )
      }

      if (serviceKey === 'IA' || serviceKey === 'EA') {
        response = await $api.supplierInvoices.getAirSellProfit(body)
        serviceReferences.value.push(response)
        sellConceptsFound = sellConceptsFound.concat(
          transformSellConcepts(
            (response.charges || []).filter((c: any) => c.sell_amount != null),
            response,
            serviceKey,
          ),
          transformFFNotes(response.ff_notes, response),
        )
      }
    }

    sellConcepts.value = sellConceptsFound.map((concept: any, index: number) => ({
      ...concept,
      _key: `${concept.class_name}-${concept.ff_note_concept_id ?? concept.id}-${index}`,
      split_parts: 1,
      split_total: 2,
    }))
  } catch (error) {
    console.error(error)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
})

const getService = (concept: any) =>
  serviceReferences.value.find(
    (service: any) => service.id === concept.service_id && service.class_name === concept.service_class_name,
  )

const containersFor = (concept: any) => getService(concept)?.containers?.length || 0

const matchesFilter = (concept: any) => {
  const text = (filterText.value || '').trim().toLowerCase()
  return !text || (concept.charge?.name || '').toLowerCase().includes(text)
}

const visibleConcepts = computed(() =>
  sellConcepts.value.filter(
    (concept: any) => concept.selected || (matchesFilter(concept) && !(hideFullyLinked.value && isConceptFullyLinked(concept))),
  ),
)

const fullyLinkedCount = computed(() => sellConcepts.value.filter((concept: any) => isConceptFullyLinked(concept)).length)

const groupedConcepts = computed(() =>
  serviceReferences.value
    .map((service: any) => ({
      key: `${service.class_name}-${service.id}`,
      referenceNumber: service.reference_number,
      containers: service.containers || [],
      items: visibleConcepts.value.filter(
        (concept: any) => concept.service_id === service.id && concept.service_class_name === service.class_name,
      ),
    }))
    .filter((group: any) => group.items.length > 0),
)

const columnsCount = computed(() => (hasForeignCurrencies.value ? 7 : 6))

// Amount (with taxes, same currency as the sell concept) already linked to
// supplier invoices persisted in the backend for this sell concept.
const getPersistedLinks = (concept: any) =>
  concept.supplier_invoice_links || (concept.supplier_invoice_link ? [concept.supplier_invoice_link] : [])

const getPersistedLinkedAmount = (concept: any) =>
  getPersistedLinks(concept).reduce((acc: number, link: any) => acc + parseFloat(link.amount || 0), 0)

// Amount (with taxes) already committed to this same sell concept by other
// supplier concepts added in the current, not-yet-saved capture session.
const getDraftLinkedAmount = (concept: any) => {
  const allDraftSellConcepts = supplierProvision
    .getConcepts()
    .map((item: any) => item.sell_concepts)
    .flat()

  return allDraftSellConcepts
    .filter(
      (draftConcept: any) =>
        draftConcept.id === concept.id &&
        draftConcept.class_name === concept.class_name &&
        draftConcept.ff_note_concept_id === concept.ff_note_concept_id,
    )
    .reduce((acc: number, draftConcept: any) => {
      const amount = parseFloat(draftConcept.amount || 0)
      return acc + (draftConcept.is_con_iva ? amount * 1.16 : amount)
    }, 0)
}

// Remaining amount (with taxes) that can still be linked for this sell concept.
const getAvailableAmountWithTaxes = (concept: any) => {
  const used = getPersistedLinkedAmount(concept) + getDraftLinkedAmount(concept)
  return Math.round(Math.max(0, getTotalConcept(concept) - used) * 100) / 100
}

// Same as above, but expressed in the "base" amount (pre-IVA) shape that
// concept.amount/link_amount use, since that's what gets sent to the backend.
const getAvailableBaseAmount = (concept: any) => {
  const availableWithTaxes = getAvailableAmountWithTaxes(concept)
  const base = concept.is_con_iva === 1 ? availableWithTaxes / 1.16 : availableWithTaxes
  return Math.round(base * 100) / 100
}

const isConceptFullyLinked = (concept: any) => getAvailableAmountWithTaxes(concept) <= 0.01

const onSelectConcept = (concept: any, selected: boolean) => {
  if (selected) {
    concept.link_amount = getAvailableBaseAmount(concept)
  }
}

// Part of the concept (base amount) for "take k of n" — e.g. 1 of 2 containers of USD 3,800 = USD 1,900.
const splitAmount = (concept: any, parts: number, total: number) => {
  const base = parseFloat(concept.amount) || 0
  const n = Math.max(1, Number(total) || 1)
  const k = Math.min(n, Math.max(1, Number(parts) || 1))
  return Math.min(getAvailableBaseAmount(concept), Math.round(((base * k) / n) * 100) / 100)
}

const setFull = (concept: any) => {
  concept.link_amount = getAvailableBaseAmount(concept)
}

const setSplit = (concept: any, parts: number, total: number) => {
  concept.link_amount = splitAmount(concept, parts, total)
}

const applyToSelected = (mode: 'full' | 'containers') => {
  sellConcepts.value
    .filter((concept: any) => concept.selected)
    .forEach((concept: any) => {
      const containers = containersFor(concept)
      if (mode === 'containers' && containers > 0) setSplit(concept, containersCovered.value, containers)
      else setFull(concept)
    })
}

const isLinkAmountValid = (concept: any) => {
  if (!concept.selected) {
    return true
  }
  const amount = parseFloat(concept.link_amount)
  return amount > 0 && amount <= getAvailableBaseAmount(concept) + 0.01
}

const hasInvalidLinkAmounts = computed(() =>
  sellConcepts.value.some((concept: any) => concept.selected && !isLinkAmountValid(concept)),
)

const linkParts = (concept: any) => {
  const parts = getPersistedLinks(concept).map((link: any) => {
    const cfdi = link.supplier_invoice?.cfdi
    const reqPay = link.supplier_invoice?.supplier_req_payment
    const cfdiRef = cfdi
      ? `CFDI ${[cfdi.serie, cfdi.folio].filter(Boolean).join('-')}`
      : `Supplier invoice #${link.supplier_invoice_id}`
    const reqPayRef = reqPay ? `Request ${reqPay.folio || '#' + reqPay.id}` : 'not yet in a request payment'
    return `${formatToCurrency(link.amount)} → ${cfdiRef} (${reqPayRef})`
  })

  const draftAmount = getDraftLinkedAmount(concept)
  if (draftAmount > 0) {
    parts.push(`${formatToCurrency(draftAmount)} → linked in this capture`)
  }
  return parts
}

const hasMismatchSelectedSellCharges = computed(() => {
  const selected = sellConcepts.value.filter((sellConcept: any) => sellConcept.selected)
  return selected.some((c: any) => c.inv_type === 'tm') && selected.some((c: any) => c.inv_type === 'wm')
})

watch(
  () => props.supplierConcept,
  (newVal) => {
    if (newVal?.show) {
      getServiceSellConcepts()
    }
  },
  { immediate: true, deep: true },
)

const cancel = () => {
  props.supplierConcept.show = false
}

const addConceptToSupplierInvoice = () => {
  const selected = isSkipLinkConcepts.value ? [] : sellConcepts.value.filter((concept: any) => concept.selected)

  // `amount` is the (possibly partial) amount being linked now, not necessarily the full concept amount.
  const body = {
    ...props.supplierConcept.concept,
    sell_concepts: selected.map((concept: any) => ({
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
    })),
  }

  emits('add-concept', JSON.parse(JSON.stringify(body)))
  cancel()
}
</script>
<style scoped>
.tile {
  border-radius: 10px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  padding: 10px 14px;
}
.tile--success {
  border-color: rgba(var(--v-theme-success), 0.6);
  background: rgba(var(--v-theme-success), 0.08);
}
.tile--error {
  border-color: rgba(var(--v-theme-error), 0.6);
  background: rgba(var(--v-theme-error), 0.08);
}
.tile__label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: rgba(var(--v-theme-on-surface), 0.6);
}
.tile__value {
  font-size: 1.2rem;
  font-weight: 700;
}
.tile__value small {
  font-size: 0.7rem;
  font-weight: 500;
}
.tile__hint {
  font-size: 0.72rem;
  color: rgba(var(--v-theme-on-surface), 0.6);
}
</style>
