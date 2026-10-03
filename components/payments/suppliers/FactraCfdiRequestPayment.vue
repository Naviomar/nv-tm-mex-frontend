<template>
  <div>
    <v-card density="compact">
      <v-card-title class="flex items-center gap-2">
        <v-icon color="primary">mdi-cash-fast</v-icon>
        Request payment - Suppliers
      </v-card-title>
      <v-card-subtitle>Find the supplier invoice(s) to pay</v-card-subtitle>
      <v-card-text>
        <div class="rounded-lg tm-border p-4">
          <div class="flex flex-wrap items-center gap-3 mb-4">
            <v-btn-toggle v-model="searchMode" mandatory density="compact" color="primary" variant="outlined" divided @update:model-value="clearResults">
              <v-btn value="folios" prepend-icon="mdi-format-list-numbered">By invoice folio(s)</v-btn>
              <v-btn value="supplier" prepend-icon="mdi-account-search-outline">By supplier &amp; dates</v-btn>
            </v-btn-toggle>
            <v-btn-toggle v-model="filters.isFreeFormat" mandatory density="compact" color="deep-purple" variant="outlined" divided @update:model-value="clearResults">
              <v-btn :value="false" prepend-icon="mdi-link">Con referencias</v-btn>
              <v-btn :value="true" prepend-icon="mdi-tag-outline">Formato libre</v-btn>
            </v-btn-toggle>
          </div>

          <!-- Search by folios: supplier, currency and dates come from each invoice -->
          <div v-if="searchMode === 'folios'" class="grid grid-cols-12 gap-4">
            <div class="col-span-12 md:col-span-9">
              <v-textarea
                v-model="filters.inputNumbers"
                label="Invoice folio(s)"
                placeholder="MARC-38737, A-26222 26225  F1234 ..."
                density="compact"
                variant="outlined"
                rows="2"
                auto-grow
                max-rows="6"
                prepend-inner-icon="mdi-magnify"
                hint="Paste all the folios at once, separated by comma, space or new line. Accepts folio, serie+folio or CFDI ID. Ctrl+Enter to search."
                persistent-hint
                clearable
                @keydown.ctrl.enter.prevent="onClickSearch"
              />
              <div v-if="parsedFolios.length > 0" class="flex flex-wrap items-center gap-1 mt-2">
                <span class="text-xs text-medium-emphasis mr-1">{{ parsedFolios.length }} folio(s):</span>
                <v-chip
                  v-for="folio in parsedFolios"
                  :key="`folio-${folio}`"
                  size="small"
                  :color="folioStatus(folio).color"
                  :variant="folioStatus(folio).variant"
                  :prepend-icon="folioStatus(folio).icon"
                >
                  {{ folio }}
                </v-chip>
              </div>
            </div>
            <div class="col-span-12 md:col-span-3 flex flex-col gap-2">
              <v-btn color="primary" prepend-icon="mdi-magnify" :disabled="parsedFolios.length === 0" @click="onClickSearch">
                Search {{ parsedFolios.length || '' }} folio(s)
              </v-btn>
              <v-btn variant="text" color="red" prepend-icon="mdi-restore" @click="resetSearch">Reset</v-btn>
              <div class="text-xs text-medium-emphasis">
                <v-icon size="14">mdi-information-outline</v-icon>
                No need to select supplier, currency or dates: they come from each invoice.
              </div>
            </div>
          </div>

          <!-- Search by supplier -->
          <div v-else class="grid grid-cols-12 gap-4">
            <div class="col-span-12 md:col-span-5">
              <ASupplierSearch v-model="filters.supplierId" label="Supplier *" />
            </div>
            <div class="col-span-6 md:col-span-2">
              <v-autocomplete
                v-model="filters.currencyId"
                density="compact"
                label="Currency *"
                :items="currencies"
                item-title="name"
                item-value="id"
                hide-details
                @update:model-value="clearResults"
              />
            </div>
            <div class="col-span-6 md:col-span-2">
              <v-text-field v-model="filters.startDate" density="compact" label="Received from" type="date" hide-details />
            </div>
            <div class="col-span-6 md:col-span-2">
              <v-text-field v-model="filters.endDate" density="compact" label="Received to" type="date" hide-details />
            </div>
            <div class="col-span-6 md:col-span-1 flex items-center">
              <v-btn color="primary" icon="mdi-magnify" :disabled="!filters.supplierId || !filters.currencyId" @click="onClickSearch" />
            </div>
          </div>

          <div v-if="filters.isFreeFormat" class="text-sm text-purple-600 dark:text-purple-300 mt-3">
            <v-icon size="small">mdi-information</v-icon>
            Las facturas de formato libre no tienen desglose a referencias y se pagan directamente.
          </div>
        </div>

        <!-- Resultados de busqueda -->
        <div v-if="hasResults" class="py-4">
          <div class="flex flex-wrap items-center gap-2 mb-2">
            <div class="font-bold text-lg"><span class="text-lg">1️⃣</span> Search results</div>
            <v-chip size="small" variant="tonal">{{ supplierCfdis.length }} invoice(s)</v-chip>
            <v-chip v-if="resultSuppliersCount > 1" size="small" color="warning" variant="tonal" prepend-icon="mdi-alert-outline">
              {{ resultSuppliersCount }} suppliers / currencies — one request per supplier and currency
            </v-chip>
            <v-spacer />
            <v-btn color="purple" size="x-small" prepend-icon="mdi-checkbox-marked" @click="selectAllCfdis">Check all</v-btn>
            <v-btn color="secondary" size="x-small" prepend-icon="mdi-checkbox-blank-outline" @click="unselectAllCfdis">Uncheck all</v-btn>
          </div>
          <v-alert v-if="filters.isFreeFormat" type="info" variant="tonal" color="deep-purple" density="compact" class="mb-2">
            <v-icon>mdi-tag-outline</v-icon>
            Mostrando facturas de <strong>Formato Libre</strong> - Se pagarán directamente sin desglose a referencias.
          </v-alert>
          <v-table density="compact" class="rounded tm-border">
            <thead>
              <tr>
                <th class="w-12"></th>
                <th># Invoice</th>
                <th>Supplier</th>
                <th>Type</th>
                <th>Estatus SAT</th>
                <th>Invoice date</th>
                <th class="text-right">Amount</th>
                <th>Payment requested?</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="supCfdi in supplierCfdis"
                :key="supCfdi.id"
                :class="{
                  'tm-row-error': supCfdi.sat_status === 'Cancelado',
                  'tm-row-selected': supCfdi.selected,
                  'opacity-50': isSelectionBlocked(supCfdi),
                }"
              >
                <td>
                  <v-tooltip :disabled="!isSelectionBlocked(supCfdi)" location="top" text="Different supplier or currency than the invoices already selected">
                    <template #activator="{ props: tp }">
                      <div v-bind="tp">
                        <v-checkbox
                          v-model="supCfdi.selected"
                          density="compact"
                          hide-details
                          :disabled="supCfdi.sat_status === 'Cancelado' || supCfdi.legacy_payment_request || isSelectionBlocked(supCfdi)"
                          @update:model-value="onSelectionChange"
                        />
                      </div>
                    </template>
                  </v-tooltip>
                </td>
                <td>
                  <span class="font-medium">{{ supCfdi.serie_folio || `${supCfdi.serie || ''}${supCfdi.folio || ''}` }}</span>
                  <span class="text-xs text-medium-emphasis ml-1">#{{ supCfdi.id }}</span>
                  <v-chip v-if="supCfdi.is_free_format" color="deep-purple" size="x-small" class="ml-1">Libre</v-chip>
                  <v-chip v-if="supCfdi.legacy_payment_request" color="deep-orange" size="x-small" variant="tonal" class="ml-1">
                    <v-icon size="x-small" start>mdi-alert</v-icon>TM1 pay request
                  </v-chip>
                </td>
                <td>{{ supCfdi.supplier?.name }}</td>
                <td>
                  <v-chip size="x-small" :color="supCfdi.tipo_comprobante === 'E' ? 'red' : 'green'" variant="tonal">
                    {{ supCfdi.tipo_comprobante_name || supCfdi.tipo_comprobante }}
                  </v-chip>
                </td>
                <td>
                  <SatValidationStatus
                    :supplierCfdi="supCfdi"
                    :showValidateButton="true"
                    @validated="(response) => onCfdiSatValidated(supCfdi, response)"
                  />
                </td>
                <td>{{ formatDateOnlyString(supCfdi.invoice_date) }}</td>
                <td
                  class="text-right whitespace-nowrap font-medium"
                  :class="{
                    'text-error': supCfdi.tipo_comprobante === 'E',
                    'text-success': supCfdi.tipo_comprobante === 'I',
                  }"
                >
                  {{ formatToCurrency(getTotalAmount(supCfdi)) }} {{ getCurrencyName(supCfdi.currency_id) }}
                </td>
                <td>
                  <v-chip size="x-small" :color="supCfdi.requested_payment ? 'success' : 'grey'" variant="tonal">
                    {{ supCfdi.requested_payment ? 'Yes' : 'No' }}
                  </v-chip>
                </td>
              </tr>
            </tbody>
          </v-table>

          <!-- Si tiene anticipos se muestran aqui -->
          <v-alert v-if="advancePayments.length > 0" type="info" color="info" variant="tonal" density="compact">
            <div class="text-lg font-bold">Advance payments available:</div>
            <div>Select the advances to be added to the payment request.</div>
            <div class="grid grid-cols-3 gap-2">
              <v-card
                v-for="(advPayment, index) in advancePayments"
                :key="`adv-pay-${index}`"
                class="bg-blue-200! dark:bg-blue-900!"
                density="compact"
              >
                <v-card-title>
                  Advance payment {{ advPayment.folio || '#' + advPayment.id }}
                  <v-chip 
                    v-if="isAdvanceUnpaid(advPayment)" 
                    color="orange" 
                    size="x-small" 
                    class="ml-2"
                  >
                    Pending Payment
                  </v-chip>
                </v-card-title>
                <v-card-text>
                  <div class="flex items-center">
                    <v-checkbox 
                      v-model="advPayment.selected" 
                      :disabled="isDiffCurrency(advPayment) || isAdvanceUnpaid(advPayment)" 
                      hide-details 
                    />
                    <div class="flex flex-col gap-2">
                      <span class="font-bold text-base"
                        >{{ getCurrencyName(advPayment.currency_id) }} {{ formatToCurrency(advPayment.amount) }}
                      </span>
                      <span>@ {{ formatDateString(advPayment.created_at) }}</span>
                      <span>By {{ advPayment.creator?.name }}</span>
                      <span 
                        v-if="getAdvanceStatusMessage(advPayment)" 
                        class="italic text-xs"
                        :class="{
                          'text-orange-600': isAdvanceUnpaid(advPayment),
                          'text-grey-600': isDiffCurrency(advPayment) && !isAdvanceUnpaid(advPayment)
                        }"
                      >
                        {{ getAdvanceStatusMessage(advPayment) }}
                      </span>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </div>
          </v-alert>

          <v-alert
            v-if="hasSelectedCfdis"
            type="info"
            :color="grandTotalSelected > 0 ? 'blue' : 'orange'"
            variant="flat"
            density="compact"
          >
            <div class="text-lg font-bold">Supplier request payment for:</div>
            <div class="font-bold text-3xl">
              {{ getCurrencyName(reqCurrencyId) }} {{ formatToCurrency(grandTotalSelected) }}
            </div>
          </v-alert>

          <!-- CFDIs seleccionados -->
          <div v-if="hasSelectedCfdis">
            <div class="py-5">
              <div class="font-bold text-lg mt-1 py-2"><span class="text-lg">2️⃣</span> More information</div>
              <div class="grid grid-cols-1 gap-4">
                <v-textarea v-model="formReq.notes" density="compact" label="Notes" :rows="3" />
              </div>

              <div class="font-bold text-lg my-4"><span class="text-lg">3️⃣</span> Origin bank information</div>
              <SystemSelectBankAccount v-model="formReq.origin_bank" :currency-id="formReq.currency_id" />

              <div v-if="formReq.origin_bank" class="mb-4">
                <v-card>
                  <v-card-title>Originator bank account selected</v-card-title>
                  <v-card-text>
                    <div class="grid grid-cols-2 gap-4">
                      <div class="grid grid-cols-2 gap-0">
                        <div class="font-bold">Bank:</div>
                        <div>{{ formReq.origin_bank?.bank_account }}</div>

                        <div>Account number:</div>
                        <div>
                          {{ formReq.origin_bank?.account_number }} -
                          {{ getCurrencyName(formReq.origin_bank?.currency_id) }}
                        </div>

                        <div>Type:</div>
                        <div>{{ formReq.origin_bank?.type }}</div>

                        <div>Address:</div>
                        <div>{{ formReq.origin_bank?.address }}</div>
                      </div>
                    </div>
                  </v-card-text>
                </v-card>
              </div>

              <div class="font-bold text-lg mt-1 py-2">
                <span class="text-lg">4️⃣</span> Beneficiary: Supplier Bank details
              </div>
              <SupplierSelectBankAccount
                v-model="formReq.supplier_bank"
                :currency-id="reqCurrencyId"
                :id="reqSupplierId"
              />

              <div v-if="formReq.supplier_bank" class="mb-4 p-4">
                <v-card>
                  <v-card-title>Supplier bank account selected:</v-card-title>
                  <v-card-text>
                    <div class="grid grid-cols-2 gap-4">
                      <div class="grid grid-cols-2 gap-0">
                        <div class="font-bold">Bank:</div>
                        <div>
                          <v-chip color="yellow-darken-4" v-if="formReq.supplier_bank?.is_default" size="small"
                            ><v-icon>mdi-star</v-icon></v-chip
                          >
                          {{ formReq.supplier_bank?.bank?.name }} - alias ({{ formReq.supplier_bank?.name }})
                        </div>

                        <div>Account number:</div>
                        <div>
                          {{ formReq.supplier_bank?.account_number }} -
                          {{ getCurrencyName(formReq.supplier_bank?.currency_id) }}
                        </div>

                        <div>Beneficiary:</div>
                        <div>{{ formReq.supplier_bank?.beneficiary_name }}</div>

                        <div>Address:</div>
                        <div>{{ formReq.supplier_bank?.beneficiary_address }}</div>
                      </div>
                      <div class="grid grid-cols-2 gap-0">
                        <div>ABA:</div>
                        <div>{{ formReq.supplier_bank?.aba }}</div>

                        <div>SWIFT:</div>
                        <div>{{ formReq.supplier_bank?.swift }}</div>

                        <div>IBAN:</div>
                        <div>{{ formReq.supplier_bank?.iban }}</div>
                      </div>
                    </div>
                  </v-card-text>
                </v-card>
              </div>
            </div>

            <!-- Alerta si hay facturas canceladas seleccionadas -->
            <v-alert
              v-if="hasCancelledSelected"
              type="error"
              variant="flat"
              density="compact"
              class="mb-4"
            >
              <v-icon>mdi-alert-circle</v-icon>
              Hay facturas CANCELADAS en SAT seleccionadas. Deseleccione estas facturas antes de continuar.
            </v-alert>

            <!-- Alerta si hay facturas sin validar -->
            <v-alert
              v-if="hasUnvalidatedSelected && !hasCancelledSelected"
              type="warning"
              variant="tonal"
              density="compact"
              class="mb-4"
            >
              <div class="flex items-center justify-between">
                <div>
                  <v-icon>mdi-shield-alert</v-icon>
                  Hay {{ countUnvalidated }} factura(s) sin validar con SAT. Se recomienda validarlas antes de generar la solicitud.
                </div>
                <v-btn
                  color="warning"
                  size="small"
                  :loading="loadingValidateAll"
                  @click="validateAllSelectedWithSat"
                >
                  <v-icon left>mdi-shield-check</v-icon>
                  Validar todas con SAT
                </v-btn>
              </div>
            </v-alert>

            <div>
              <div class="flex gap-2">
                <v-btn
                  color="primary"
                  @click="onClickGenerateReq"
                  :disabled="hasCancelledSelected"
                >
                  Generate request payment
                </v-btn>
                <v-btn
                  v-if="hasSelectedCfdis"
                  color="teal"
                  variant="outlined"
                  :loading="loadingValidateAll"
                  @click="validateAllSelectedWithSat"
                >
                  <v-icon left>mdi-shield-check</v-icon>
                  Validar con SAT
                </v-btn>
              </div>
            </div>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>
<script setup lang="ts">
import { currencies } from '~/utils/data/systemData'

const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()
const router = useRouter()
const supplierCfdis = ref<any[]>([])

const searchMode = ref<'folios' | 'supplier'>('folios')
const searchedFolios = ref<string[]>([])

const filters = reactive<any>({
  inputNumbers: null,
  supplierId: null,
  currencyId: null,
  startDate: null,
  endDate: null,
  isFreeFormat: false,
})

const formReq = ref<any>({
  notes: null,
  origin_bank: null,
  supplier_bank: null,
})

const advancePayments = ref<any>([])
const loadingValidateAll = ref(false)

watch(
  () => filters.supplierId,
  () => {
    supplierCfdis.value = []
  }
)

const parsedFolios = computed<string[]>(() => [
  ...new Set(
    (filters.inputNumbers || '')
      .split(/[\s,;]+/)
      .map((folio: string) => folio.trim().toUpperCase())
      .filter(Boolean)
  ),
] as string[])

const folioKeys = (cfdi: any) =>
  [cfdi.folio, `${cfdi.serie || ''}${cfdi.folio || ''}`, `${cfdi.serie || ''}-${cfdi.folio || ''}`, cfdi.serie_folio, String(cfdi.id)]
    .filter(Boolean)
    .map((key: string) => key.toUpperCase())

const foundFolioKeys = computed(() => new Set(supplierCfdis.value.flatMap(folioKeys)))

const folioStatus = (folio: string) => {
  if (!searchedFolios.value.includes(folio)) return { color: 'primary', variant: 'tonal' as const, icon: 'mdi-file-document-outline' }
  return foundFolioKeys.value.has(folio)
    ? { color: 'success', variant: 'tonal' as const, icon: 'mdi-check-circle' }
    : { color: 'error', variant: 'outlined' as const, icon: 'mdi-close-circle-outline' }
}

const selectedCfdis = computed(() => supplierCfdis.value.filter((cfdi: any) => cfdi.selected))

// A request payment is for one supplier and one currency: in folio mode they are taken from the
// first selected invoice; in supplier mode from the filters.
const reqSupplierId = computed(() =>
  searchMode.value === 'supplier' ? filters.supplierId : selectedCfdis.value[0]?.supplier_id ?? null
)
const reqCurrencyId = computed(() =>
  searchMode.value === 'supplier' ? filters.currencyId : selectedCfdis.value[0]?.currency_id ?? null
)

const isSelectionBlocked = (cfdi: any) =>
  !cfdi.selected &&
  selectedCfdis.value.length > 0 &&
  (cfdi.supplier_id !== reqSupplierId.value || cfdi.currency_id !== reqCurrencyId.value)

const resultSuppliersCount = computed(
  () => new Set(supplierCfdis.value.map((cfdi: any) => `${cfdi.supplier_id}-${cfdi.currency_id}`)).size
)

// Computed: verifica si hay facturas canceladas seleccionadas
const hasCancelledSelected = computed(() => {
  return supplierCfdis.value.some((cfdi: any) => cfdi.selected && cfdi.sat_status === 'Cancelado')
})

// Computed: verifica si hay facturas sin validar seleccionadas
const hasUnvalidatedSelected = computed(() => {
  return supplierCfdis.value.some((cfdi: any) => cfdi.selected && !cfdi.sat_status && cfdi.uuid)
})

// Computed: cuenta facturas sin validar seleccionadas
const countUnvalidated = computed(() => {
  return supplierCfdis.value.filter((cfdi: any) => cfdi.selected && !cfdi.sat_status && cfdi.uuid).length
})

const hasResults = computed(() => {
  return supplierCfdis.value.length > 0
})

const hasSelectedCfdis = computed(() => selectedCfdis.value.length > 0)

const grandTotalSelected = computed(() => {
  if (!hasSelectedCfdis.value) return 0

  // Calculate the total of selected invoices
  const totalInvoices = selectedCfdis.value.reduce((acc, supCfdi) => acc + getTotalAmount(supCfdi), 0)

  // Calculate the total of selected advance payments (only paid advances)
  const totalAdvances = advancePayments.value
    .filter((advPayment: any) => advPayment.selected && !isDiffCurrency(advPayment) && !isAdvanceUnpaid(advPayment))
    .reduce((acc: any, advPayment: any) => acc + parseFloat(advPayment.amount_available), 0)

  // Return final total after subtracting advances
  return totalInvoices - totalAdvances
})

const clearResults = () => {
  supplierCfdis.value = []
  searchedFolios.value = []
  advancePayments.value = []
}

const resetSearch = () => {
  filters.inputNumbers = null
  clearResults()
}

const isDiffCurrency = (advPayment: any) => {
  return advPayment.currency_id !== reqCurrencyId.value
}

// Check if advance payment is unpaid (invoice exists but is not paid)
const isAdvanceUnpaid = (advPayment: any) => {
  return advPayment.invoice && !advPayment.invoice.is_paid
}

// Get status message for advance payment
const getAdvanceStatusMessage = (advPayment: any) => {
  if (isDiffCurrency(advPayment)) {
    return 'Note: Only advance payments with same currency can be used.'
  }
  if (isAdvanceUnpaid(advPayment)) {
    return 'Pending payment - This advance cannot be used until it is paid.'
  }
  return ''
}

// Selecciona todas las facturas (del mismo proveedor y moneda que la primera seleccionable)
const selectAllCfdis = () => {
  supplierCfdis.value.forEach((cfdi: any) => {
    if (cfdi.sat_status === 'Cancelado' || cfdi.legacy_payment_request || isSelectionBlocked(cfdi)) return
    cfdi.selected = true
  })
  onSelectionChange()
}

// Deselecciona todas las facturas
const unselectAllCfdis = () => {
  supplierCfdis.value.forEach((cfdi: any) => {
    cfdi.selected = false
  })
  onSelectionChange()
}

// Maneja la validación SAT de un CFDI individual
const onCfdiSatValidated = (supCfdi: any, response: any) => {
  supCfdi.sat_status = response.sat_status
  supCfdi.sat_status_label = response.sat_status_label
  supCfdi.sat_validated_at = response.sat_validated_at
  supCfdi.sat_validator = response.sat_validator
  supCfdi.is_sat_valid = response.is_sat_valid

  // Si el CFDI está cancelado, deseleccionarlo automáticamente
  if (response.sat_status === 'Cancelado') {
    supCfdi.selected = false
    snackbar.add({
      type: 'warning',
      text: `La factura ${supCfdi.serie}${supCfdi.folio} ha sido deseleccionada porque está cancelada en SAT`,
    })
  }
}

// Valida todas las facturas seleccionadas con SAT
const validateAllSelectedWithSat = async () => {
  try {
    loadingValidateAll.value = true

    const selectedCfdis = supplierCfdis.value.filter((cfdi: any) => cfdi.selected)
    if (selectedCfdis.length === 0) {
      snackbar.add({ type: 'warning', text: 'No hay facturas seleccionadas para validar' })
      return
    }

    const body = {
      supplierCfdis: selectedCfdis.map((cfdi: any) => ({ id: cfdi.id })),
    }

    const response = await $api.suppliers.validateMultipleCfdisSat(body)

    // Actualizar el estado de cada CFDI con los resultados
    if (response.valid) {
      response.valid.forEach((result: any) => {
        const cfdi = supplierCfdis.value.find((c: any) => c.id === result.id)
        if (cfdi) {
          cfdi.sat_status = result.status
          cfdi.sat_status_label = result.status === 'Vigente' ? 'Vigente en SAT' : result.status
        }
      })
    }

    if (response.cancelled) {
      response.cancelled.forEach((result: any) => {
        const cfdi = supplierCfdis.value.find((c: any) => c.id === result.id)
        if (cfdi) {
          cfdi.sat_status = result.status
          cfdi.sat_status_label = 'Cancelado en SAT'
          cfdi.selected = false // Deseleccionar automáticamente
        }
      })
    }

    if (response.not_found) {
      response.not_found.forEach((result: any) => {
        const cfdi = supplierCfdis.value.find((c: any) => c.id === result.id)
        if (cfdi) {
          cfdi.sat_status = result.status
          cfdi.sat_status_label = 'No encontrado en SAT'
        }
      })
    }

    // Mostrar mensaje resumen
    if (response.all_valid) {
      snackbar.add({ type: 'success', text: 'Todas las facturas están vigentes en SAT' })
    } else if (response.cancelled && response.cancelled.length > 0) {
      snackbar.add({
        type: 'error',
        text: `${response.cancelled.length} factura(s) cancelada(s) en SAT han sido deseleccionadas`,
      })
    } else {
      snackbar.add({ type: 'info', text: response.message })
    }
  } catch (error: any) {
    console.error(error)
    snackbar.add({
      type: 'error',
      text: error?.response?.data?.message || 'Error al validar con SAT',
    })
  } finally {
    loadingValidateAll.value = false
  }
}

const getTotalAmount = (supCfdi: any) => {
  let total = 0

  // Para formato libre, usar el monto total del CFDI directamente
  if (filters.isFreeFormat || supCfdi.is_free_format) {
    total = parseFloat(supCfdi.amount_cfdi) || 0
  } else {
    // Para facturas con referencias, calcular desde los invoices
    total = supCfdi.invoices?.reduce((acc: number, invoice: any) => {
      return (
        acc +
        parseFloat(invoice.amount) +
        parseFloat(invoice.amount_iva) -
        parseFloat(invoice.amount_ret_iva) -
        parseFloat(invoice.amount_ret_isr)
      )
    }, 0) || 0
  }

  // if supCfdi.tipoComprobante === 'E' return as negative
  if (supCfdi.tipo_comprobante === 'E') {
    total = total * -1
  }
  return total
}


const onClickSearch = async () => {
  try {
    const byFolios = searchMode.value === 'folios'
    if (byFolios && parsedFolios.value.length === 0) {
      snackbar.add({ type: 'error', text: 'Please add at least one invoice folio' })
      return
    }
    if (!byFolios && (!filters.supplierId || !filters.currencyId)) {
      snackbar.add({ type: 'error', text: 'Please select supplier and currency' })
      return
    }
    loadingStore.start()
    const body = byFolios
      ? { folios: parsedFolios.value, is_free_format: filters.isFreeFormat }
      : {
          supplier_id: filters.supplierId,
          startDate: filters.startDate,
          endDate: filters.endDate,
          currency_id: filters.currencyId,
          is_free_format: filters.isFreeFormat,
        }
    const response: any = await $api.suppliers.requestPaymentSearchInvoices(body)
    supplierCfdis.value = response
    searchedFolios.value = byFolios ? [...parsedFolios.value] : []
    advancePayments.value = []
    lastAdvanceKey = ''

    // With a single supplier/currency in the results, all invoices are preselected
    if (byFolios && resultSuppliersCount.value === 1) selectAllCfdis()
    else if (!byFolios) await getAdvancePaymentsAvailable()

    if (response.length === 0) {
      snackbar.add({ type: 'info', text: 'No data found' })
    } else if (byFolios) {
      const missing = parsedFolios.value.filter((folio) => !foundFolioKeys.value.has(folio))
      if (missing.length > 0) {
        snackbar.add({ type: 'warning', text: `Not found or already requested: ${missing.join(', ')}` })
      }
    }
  } catch (error) {
    console.error(error)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

let lastAdvanceKey = ''
const onSelectionChange = () => {
  if (searchMode.value !== 'folios') return
  const key = `${reqSupplierId.value}-${reqCurrencyId.value}`
  if (key === lastAdvanceKey) return
  lastAdvanceKey = key
  formReq.value.supplier_bank = null
  advancePayments.value = []
  if (reqSupplierId.value && reqCurrencyId.value) getAdvancePaymentsAvailable()
}

const getAdvancePaymentsAvailable = async () => {
  try {
    if (!reqSupplierId.value || !reqCurrencyId.value) return

    const body = {
      currency_id: reqCurrencyId.value,
    }
    const response = await $api.suppliers.getAvailableAdvancePayments(String(reqSupplierId.value), body)
    advancePayments.value = response
  } catch (error) {
    console.error(error)
  }
}

const onClickGenerateReq = async () => {
  try {
    if (!formReq.value.origin_bank) {
      snackbar.add({ type: 'error', text: 'Please select origin bank account' })
      return
    }
    if (!formReq.value.supplier_bank) {
      snackbar.add({ type: 'error', text: 'Please select supplier bank account' })
      return
    }
    if (!hasSelectedCfdis.value) {
      snackbar.add({ type: 'error', text: 'Please select at least one invoice' })
      return
    }
    loadingStore.start()
    const body = {
      supplier_id: reqSupplierId.value,
      currency_id: reqCurrencyId.value,
      notes: formReq.value.notes,
      origin_bank_id: formReq.value.origin_bank.id,
      supplier_bank_id: formReq.value.supplier_bank.id,
      is_free_format: filters.isFreeFormat,
      supplierCfdis: selectedCfdis.value.map((cfdi) => ({
        id: cfdi.id,
      })),
      advancePayments:
        advancePayments.value
          .filter((advPayment: any) => advPayment.selected && !isDiffCurrency(advPayment) && !isAdvanceUnpaid(advPayment))
          .map((advPayment: any) => ({
            id: advPayment.id,
          })) || [],
    }
    const response: any = await $api.suppliers.requestPaymentGetSelectionDetails(String(reqSupplierId.value), body)
    snackbar.add({ type: 'success', text: 'Request payment generated' })
    router.push(`/invoices/suppliers/cfdis/request-payment/view-${response.id}`)
  } catch (error) {
    console.error(error)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}
</script>
