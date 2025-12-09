<template>
  <div>
    <v-card density="compact">
      <v-card-title>Request payment - Suppliers</v-card-title>
      <v-card-subtitle>Search supplier invoice(s)</v-card-subtitle>
      <v-card-text>
        <v-row>
          <v-col cols="12" md="6">
            <ASupplierSearch v-model="filters.supplierId" label="Supplier" />
          </v-col>
          <v-col cols="12" md="6">
            <div class="font-bold text-base">Add invoice numbers</div>
            <v-textarea
              v-model="filters.inputNumbers"
              density="compact"
              label="Multiline invoice numbers"
              placeholder="Enter number by line"
              rows="5"
              hide-details
            />
            <v-btn @click="addInvoiceToSearch" size="small" color="primary">
              <div class="flex gap-2">
                <v-icon>mdi-plus</v-icon>
                <div>Add</div>
              </div>
            </v-btn>

            <div v-if="filters.folios.length > 0">
              <div class="mb-2">
                Search by
                <v-btn size="x-small" class="ml-2" color="red" variant="outlined" @click="filters.folios = []">
                  <v-icon>mdi-close</v-icon>
                  <div>Clear all</div>
                </v-btn>
              </div>
              <div>
                <v-chip
                  v-for="(folio, index) in filters.folios"
                  :key="`service-folio-${folio}`"
                  closable
                  class="mr-2 mb-2"
                  @click:close="removeFolioToSearch(index)"
                >
                  {{ folio }}
                </v-chip>
              </div>
            </div>
          </v-col>
          <v-col cols="12" md="4">
            <v-autocomplete
              v-model="filters.currencyId"
              density="compact"
              label="Currency"
              :items="currencies"
              item-title="name"
              item-value="id"
              hide-details
              @update:model-value="clearResults"
            />
          </v-col>
          <v-col cols="12" md="4">
            <v-text-field v-model="filters.startDate" density="compact" label="Start date" type="date" />
          </v-col>
          <v-col cols="12" md="4">
            <v-text-field v-model="filters.endDate" density="compact" label="End date" type="date" />
          </v-col>

          <v-col cols="12">
            <v-btn-toggle v-model="filters.isFreeFormat" mandatory color="deep-purple" class="mb-2">
              <v-btn :value="false">
                <v-icon left>mdi-link</v-icon>
                Facturas con Referencias
              </v-btn>
              <v-btn :value="true">
                <v-icon left>mdi-tag-outline</v-icon>
                Formato Libre
              </v-btn>
            </v-btn-toggle>
            <div v-if="filters.isFreeFormat" class="text-sm text-purple-600 dark:text-purple-300">
              <v-icon size="small">mdi-information</v-icon>
              Las facturas de formato libre no tienen desglose a referencias y se pagan directamente.
            </div>
          </v-col>

          <v-col cols="12" md="4">
            <v-btn color="primary" size="small" @click="onClickSearch">Search</v-btn>
          </v-col>
        </v-row>

        <!-- Resultados de busqueda -->
        <div v-if="hasResults" class="py-4">
          <!-- Botones para seleccionar/deseleccionar todas las facturas -->
          <div class="mb-2 flex gap-2">
            <v-btn color="purple" size="x-small" @click="selectAllCfdis">
              <v-icon>mdi-checkbox-marked</v-icon>
              <span class="ml-1">Check all</span>
            </v-btn>
            <v-btn color="secondary" size="x-small" @click="unselectAllCfdis">
              <v-icon>mdi-checkbox-blank-outline</v-icon>
              <span class="ml-1">Uncheck all</span>
            </v-btn>
          </div>

          <div class="font-bold text-lg"><span class="text-lg">1️⃣</span> Search results:</div>
          <v-alert v-if="filters.isFreeFormat" type="info" variant="tonal" color="deep-purple" density="compact" class="mb-2">
            <v-icon>mdi-tag-outline</v-icon>
            Mostrando facturas de <strong>Formato Libre</strong> - Se pagarán directamente sin desglose a referencias.
          </v-alert>
          <v-table density="compact">
            <thead>
              <tr>
                <th>Actions</th>
                <th>Payment requested?</th>
                <th># Invoice</th>
                <th>Supplier</th>
                <th>Tipo comprobante</th>
                <th>Estatus SAT</th>
                <th>Invoice date</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="supCfdi in supplierCfdis"
                :key="supCfdi.id"
                :class="{ 'bg-red-100 dark:bg-red-900': supCfdi.sat_status === 'Cancelado' }"
              >
                <td>
                  <v-checkbox
                    v-model="supCfdi.selected"
                    density="compact"
                    label="Select to pay"
                    hide-details
                    :disabled="supCfdi.sat_status === 'Cancelado'"
                  />
                </td>
                <td>
                  {{ supCfdi.requested_payment ? 'Yes' : 'No' }}
                </td>
                <td>
                  {{ supCfdi.serie }}{{ supCfdi.folio }}
                  <v-chip v-if="supCfdi.is_free_format" color="deep-purple" size="x-small" class="ml-1">Libre</v-chip>
                </td>
                <td>{{ supCfdi.supplier?.name }}</td>
                <td>{{ supCfdi.tipo_comprobante }}</td>
                <td>
                  <SatValidationStatus
                    :supplierCfdi="supCfdi"
                    :showValidateButton="true"
                    @validated="(response) => onCfdiSatValidated(supCfdi, response)"
                  />
                </td>
                <td>{{ formatDateOnlyString(supCfdi.invoice_date) }}</td>
                <td
                  :class="{
                    'text-red-500': supCfdi.tipo_comprobante === 'E',
                    'text-green-500': supCfdi.tipo_comprobante === 'I',
                  }"
                >
                  {{ formatToCurrency(getTotalAmount(supCfdi)) }} {{ getCurrencyName(supCfdi.currency_id) }}
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
                <v-card-title>Advance payment #{{ advPayment.id }}</v-card-title>
                <v-card-text>
                  <div class="flex items-center">
                    <v-checkbox v-model="advPayment.selected" :disabled="isDiffCurrency(advPayment)" hide-details />
                    <div class="flex flex-col gap-2">
                      <span class="font-bold text-base"
                        >{{ getCurrencyName(advPayment.currency_id) }} {{ formatToCurrency(advPayment.amount) }}
                      </span>
                      <span>@ {{ formatDateString(advPayment.created_at) }}</span>
                      <span>By {{ advPayment.creator?.name }}</span>
                      <span v-if="isDiffCurrency(advPayment)" class="italic text-xs"
                        >Note: Only advance payments with same currency can be used.</span
                      >
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
              {{ getCurrencyName(filters.currencyId) }} {{ formatToCurrency(grandTotalSelected) }}
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
                :currency-id="filters.currencyId"
                :id="filters.supplierId"
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

const filters = reactive<any>({
  inputNumbers: null,
  supplierId: null,
  invoiceNumber: null,
  currencyId: null,
  startDate: null,
  endDate: null,
  folios: [],
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
  (newValue) => {
    supplierCfdis.value = []
  }
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

const hasSelectedCfdis = computed(() => {
  if (supplierCfdis.value == null) return false
  return supplierCfdis.value.some((supCfdi) => supCfdi.selected)
})

const grandTotalSelected = computed(() => {
  if (!hasSelectedCfdis.value) return 0

  // Calculate the total of selected invoices
  const totalInvoices = supplierCfdis.value
    .filter((supCfdi) => supCfdi.selected)
    .reduce((acc, supCfdi) => acc + getTotalAmount(supCfdi), 0)

  // Calculate the total of selected advance payments
  const totalAdvances = advancePayments.value
    .filter((advPayment: any) => advPayment.selected && !isDiffCurrency(advPayment))
    .reduce((acc: any, advPayment: any) => acc + parseFloat(advPayment.amount_available), 0)

  // Return final total after subtracting advances
  return totalInvoices - totalAdvances
})

const clearResults = () => {
  supplierCfdis.value = []
}

const isDiffCurrency = (advPayment: any) => {
  return advPayment.currency_id !== filters.currencyId
}

// Selecciona todas las facturas
const selectAllCfdis = () => {
  supplierCfdis.value.forEach((cfdi: any) => {
    cfdi.selected = true
  })
}

// Deselecciona todas las facturas
const unselectAllCfdis = () => {
  supplierCfdis.value.forEach((cfdi: any) => {
    cfdi.selected = false
  })
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
    if (!filters.supplierId) {
      snackbar.add({
        type: 'error',
        text: 'Please select a supplier',
      })
      return
    }
    if (!filters.currencyId) {
      snackbar.add({
        type: 'error',
        text: 'Please select a currency',
      })
      return
    }
    // if empty folios or start date or end date
    // if (!filters.folios.length && !filters.startDate && !filters.endDate) {
    //   snackbar.add({
    //     type: 'error',
    //     text: 'Please add folios or start date and end date',
    //   })
    //   return
    // }
    loadingStore.start()
    const body = {
      supplier_id: filters.supplierId,
      folios: filters.folios,
      startDate: filters.startDate,
      endDate: filters.endDate,
      currency_id: filters.currencyId,
      is_free_format: filters.isFreeFormat,
    }
    const response = await $api.suppliers.requestPaymentSearchInvoices(body)
    supplierCfdis.value = response

    await getAdvancePaymentsAvailable()

    if (response.length === 0) {
      snackbar.add({
        type: 'info',
        text: 'No data found',
      })
    }
  } catch (error) {
    console.error(error)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const getAdvancePaymentsAvailable = async () => {
  try {
    if (!filters.currencyId) {
      snackbar.add({
        type: 'error',
        text: 'Please select a currency',
      })
      return
    }

    const body = {
      currency_id: filters.currencyId,
    }
    const response = await $api.suppliers.getAvailableAdvancePayments(filters.supplierId, body)
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
      supplier_id: filters.supplierId,
      currency_id: filters.currencyId,
      notes: formReq.value.notes,
      origin_bank_id: formReq.value.origin_bank.id,
      supplier_bank_id: formReq.value.supplier_bank.id,
      is_free_format: filters.isFreeFormat,
      supplierCfdis: supplierCfdis.value
        .filter((supCfdi) => supCfdi.selected)
        .map((cfdi) => ({
          id: cfdi.id,
        })),
      advancePayments:
        advancePayments.value
          .filter((advPayment: any) => advPayment.selected && !isDiffCurrency(advPayment))
          .map((advPayment: any) => ({
            id: advPayment.id,
          })) || [],
    }
    // const response = await $api.suppliers.requestPaymentGenerateRequest(body)
    const response = await $api.suppliers.requestPaymentGetSelectionDetails(filters.supplierId, body)
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

const addInvoiceToSearch = () => {
  let folios = filters.inputNumbers.split('\n').map((bl: string) => bl.trim())
  // remove empty
  folios = folios.filter((bl: string) => bl.length > 0)
  filters.folios = [...filters.folios, ...folios]
  // unique
  filters.folios = Array.from(new Set(filters.folios))
  filters.inputNumbers = ''
}

const removeFolioToSearch = (index: number) => {
  filters.folios?.splice(index, 1)
}
</script>
