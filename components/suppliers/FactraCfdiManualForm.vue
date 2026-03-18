<template>
  <div>
    <div class="grid grid-cols-12 gap-4">
      <div class="col-span-12 xl:col-span-10">
        <v-card>
          <v-card-title>
            <h3>Add Manual CFDI</h3>
          </v-card-title>
          <v-card-text>
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
              <div>
                <ASupplierSearch v-model="form.supplierId" label="Search Supplier *" />
              </div>
              <div>
                <v-text-field v-model="form.rfc_receptor" label="RFC Receptor *" density="compact" hide-details="auto" />
              </div>
              <div>
                <v-text-field
                  v-model="form.name_receptor"
                  label="Nombre Receptor *"
                  density="compact"
                  hide-details="auto"
                />
              </div>
            </div>

            <v-alert v-if="fixedErrors.length > 0" type="error" variant="tonal" density="compact" class="mb-4">
              <div v-for="(error, index) in fixedErrors" :key="`fixed-error-${index}`">{{ error }}</div>
            </v-alert>

            <v-card variant="outlined" class="mb-6">
              <v-card-title class="flex flex-wrap items-center justify-between gap-2">
                <div class="flex items-center gap-2">
                  <span>Import from Excel template</span>
                  <v-btn
                    icon="mdi-help-circle-outline"
                    size="small"
                    color="info"
                    variant="text"
                    @click="showHelpDialog = true"
                  />
                </div>
                <v-btn size="small" color="secondary" variant="tonal" @click="downloadTemplate">Download template</v-btn>
              </v-card-title>
              <v-card-text>
                <div class="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-3 items-end">
                  <v-file-input
                    v-model="form.templateFile"
                    accept=".xlsx,.xls"
                    label="Excel template"
                    density="compact"
                    prepend-icon="mdi-file-excel"
                    hide-details="auto"
                  />
                  <v-btn color="primary" @click="loadTemplateRows">Load file into forms</v-btn>
                </div>
                <div class="text-sm text-grey-darken-1 mt-2">
                  Upload the template to convert all rows into editable forms before registering them in one iteration.
                </div>
              </v-card-text>
            </v-card>

            <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div class="flex items-center gap-2">
                <div class="text-lg font-bold">CFDI rows</div>
                <v-chip size="small" color="primary" variant="tonal">{{ items.length }} pending</v-chip>
                <v-chip v-if="hasRowsWithErrors" size="small" color="error" variant="tonal">Rows with errors</v-chip>
              </div>
              <v-btn color="primary" variant="outlined" @click="addRow">Add row</v-btn>
            </div>

            <div class="flex flex-col gap-4">
              <v-card v-for="(item, index) in items" :key="item.key" variant="outlined">
                <v-card-title class="flex flex-wrap items-center justify-between gap-2">
                  <div class="flex items-center gap-2">
                    <span>CFDI #{{ index + 1 }}</span>
                    <v-chip size="x-small" :color="item.source === 'excel' ? 'green' : 'blue'" variant="tonal">
                      {{ item.source === 'excel' ? 'Excel' : 'Manual' }}
                    </v-chip>
                    <v-chip v-if="item.row_number" size="x-small" color="grey" variant="tonal">
                      Row {{ item.row_number }}
                    </v-chip>
                  </div>
                  <v-btn icon="mdi-delete-outline" color="error" variant="text" @click="removeRow(index)" />
                </v-card-title>
                <v-card-text>
                  <v-alert v-if="item.errors.length > 0" type="error" variant="tonal" density="compact" class="mb-4">
                    <div v-for="(error, errorIndex) in item.errors" :key="`${item.key}-error-${errorIndex}`">{{ error }}</div>
                  </v-alert>

                  <div class="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    <v-text-field
                      v-model="item.serie"
                      label="Serie"
                      density="compact"
                      hide-details="auto"
                      @update:model-value="clearRowErrors(item)"
                    />
                    <v-text-field
                      v-model="item.folio"
                      label="Folio *"
                      density="compact"
                      hide-details="auto"
                      @update:model-value="clearRowErrors(item)"
                    />
                    <v-autocomplete
                      v-model="item.tipo_comprobante"
                      :items="tipoComprobanteItems"
                      item-title="name"
                      item-value="value"
                      label="Tipo de comprobante *"
                      density="compact"
                      hide-details="auto"
                      @update:model-value="clearRowErrors(item)"
                    />
                    <v-text-field
                      v-model="item.invoice_date"
                      type="date"
                      label="Invoice date *"
                      density="compact"
                      hide-details="auto"
                      @update:model-value="clearRowErrors(item)"
                    />
                    <v-text-field
                      v-model="item.amount_cfdi"
                      type="number"
                      label="Amount *"
                      density="compact"
                      hide-details="auto"
                      @update:model-value="clearRowErrors(item)"
                    />
                    <v-autocomplete
                      v-model="item.currency_id"
                      :items="currencies"
                      item-title="name"
                      item-value="id"
                      label="Currency *"
                      density="compact"
                      hide-details="auto"
                      @update:model-value="clearRowErrors(item)"
                    />
                    <div class="lg:col-span-2">
                      <v-textarea
                        v-model="item.notes"
                        label="Notes"
                        rows="2"
                        density="compact"
                        hide-details="auto"
                        @update:model-value="clearRowErrors(item)"
                      />
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </div>

            <div class="flex justify-end items-center gap-4 mt-6">
              <v-btn color="secondary" to="/invoices/suppliers/cfdis">Cancel</v-btn>
              <v-btn color="primary" @click="saveSupplierCfdis">Register CFDIs</v-btn>
            </div>
          </v-card-text>
        </v-card>
      </div>

      <!-- Help Dialog -->
      <v-dialog v-model="showHelpDialog" max-width="600px">
        <v-card>
          <v-card-title class="text-h6">How to fill the Excel template</v-card-title>
          <v-card-text>
            <v-alert type="info" variant="tonal" density="compact" class="mb-4">
              Fill one row per CFDI. Fixed fields (Supplier, RFC Receptor, Nombre Receptor) are taken from the form, not from the Excel.
            </v-alert>
            
            <v-list density="compact">
              <v-list-subheader inset>Excel columns (one per row)</v-list-subheader>
              <v-list-item>
                <v-list-item-title><strong>serie</strong></v-list-item-title>
                <v-list-item-subtitle>Optional. CFDI series (e.g., A, B, etc.)</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title><strong>folio</strong></v-list-item-title>
                <v-list-item-subtitle><strong>Required.</strong> CFDI folio number</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title><strong>invoice_date</strong></v-list-item-title>
                <v-list-item-subtitle><strong>Required.</strong> Invoice date in YYYY-MM-DD format</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title><strong>tipo_comprobante</strong></v-list-item-title>
                <v-list-item-subtitle>Required. I=Ingreso, E=Egreso, T=Traslado, N=Nomina, P=Pago</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title><strong>amount_cfdi</strong></v-list-item-title>
                <v-list-item-subtitle><strong>Required.</strong> Amount (numeric, greater than 0)</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title><strong>currency_id</strong></v-list-item-title>
                <v-list-item-subtitle><strong>Required.</strong> Currency code (e.g., USD, MXN, EUR, etc.)</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title><strong>notes</strong></v-list-item-title>
                <v-list-item-subtitle>Optional. Additional notes or comments</v-list-item-subtitle>
              </v-list-item>
            </v-list>

            <v-divider class="my-4" />

            <div class="text-sm text-grey-darken-1">
              <p class="mb-2"><strong>Important:</strong></p>
              <ul class="list-disc list-inside space-y-1">
                <li>Do not include headers in the Excel file, only data rows</li>
                <li>Each row represents one CFDI to be registered</li>
                <li>After uploading, you can review and edit all fields before final registration</li>
                <li>Fields marked as Required must be filled; optional fields can be left empty</li>
              </ul>
            </div>
          </v-card-text>
          <v-card-actions>
            <v-btn @click="showHelpDialog = false">Close</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </div>
</template>
<script setup lang="ts">
import { currencies } from '@/utils/data/systemData'

const router = useRouter()
const { $api } = useNuxtApp()
const loadingStore = useLoadingStore()
const snackbar = useSnackbar()

const showHelpDialog = ref(false)

type ManualCfdiItem = {
  key: string
  source: 'manual' | 'excel'
  row_number: number | null
  serie: string | null
  folio: string | null
  invoice_date: string | null
  tipo_comprobante: string | null
  amount_cfdi: string | number | null
  currency_id: string | number | null
  notes: string | null
  errors: string[]
  has_errors: boolean
}

const tipoComprobanteItems = [
  { value: 'I', name: 'Ingreso' },
  { value: 'E', name: 'Egreso' },
  { value: 'T', name: 'Traslado' },
  { value: 'N', name: 'Nomina' },
  { value: 'P', name: 'Pago' },
]

const form = reactive({
  supplierId: undefined as string | number | undefined,
  rfc_receptor: '',
  name_receptor: '',
  templateFile: null as File | File[] | null,
})

const fixedErrors = ref<string[]>([])
const items = ref<ManualCfdiItem[]>([createEmptyItem()])

const hasRowsWithErrors = computed(() => items.value.some((item) => item.has_errors))

function createEmptyItem(source: 'manual' | 'excel' = 'manual'): ManualCfdiItem {
  return {
    key: `${Date.now()}-${Math.random()}`,
    source,
    row_number: null,
    serie: null,
    folio: null,
    invoice_date: null,
    tipo_comprobante: 'I',
    amount_cfdi: null,
    currency_id: null,
    notes: null,
    errors: [],
    has_errors: false,
  }
}

function clearRowErrors(item: ManualCfdiItem) {
  item.errors = []
  item.has_errors = false
}

function addRow() {
  items.value.push(createEmptyItem())
}

function removeRow(index: number) {
  items.value.splice(index, 1)
  if (items.value.length === 0) {
    items.value.push(createEmptyItem())
  }
}

function getSelectedTemplateFile() {
  if (Array.isArray(form.templateFile)) {
    return form.templateFile[0] ?? null
  }

  return form.templateFile
}

function isItemEmpty(item: ManualCfdiItem) {
  return !item.serie && !item.folio && !item.invoice_date && !item.amount_cfdi && !item.notes && !item.currency_id
}

function normalizeImportedItem(item: any): ManualCfdiItem {
  return {
    key: `${Date.now()}-${Math.random()}`,
    source: 'excel',
    row_number: item.row_number ?? null,
    serie: item.serie ?? null,
    folio: item.folio ?? null,
    invoice_date: item.invoice_date ?? null,
    tipo_comprobante: item.tipo_comprobante ?? 'I',
    amount_cfdi: item.amount_cfdi ?? null,
    currency_id: item.currency_id ?? null,
    notes: item.notes ?? null,
    errors: Array.isArray(item.errors) ? item.errors : [],
    has_errors: !!item.has_errors,
  }
}

function validateFixedFields() {
  const errors: string[] = []

  if (!form.supplierId) {
    errors.push('Supplier is required.')
  }
  if (!form.rfc_receptor?.trim()) {
    errors.push('RFC Receptor is required.')
  }
  if (!form.name_receptor?.trim()) {
    errors.push('Nombre Receptor is required.')
  }

  fixedErrors.value = errors
  return errors.length === 0
}

function validateRows() {
  let hasErrors = false

  items.value = items.value.map((item, index) => {
    const errors: string[] = []
    const amount = Number(item.amount_cfdi)

    if (!item.folio?.toString().trim()) {
      errors.push('Folio is required.')
    }
    if (!item.invoice_date) {
      errors.push('Invoice date is required.')
    }
    if (!item.tipo_comprobante) {
      errors.push('Tipo de comprobante is required.')
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      errors.push('Amount must be greater than zero.')
    }
    if (!item.currency_id) {
      errors.push('Currency is required.')
    }
    if (errors.length > 0) {
      hasErrors = true
    }

    return {
      ...item,
      row_number: item.row_number ?? index + 1,
      errors,
      has_errors: errors.length > 0,
    }
  })

  return !hasErrors
}

async function downloadTemplate() {
  try {
    loadingStore.loading = true
    const response = await $api.supplierInvoices.downloadManualCfdiTemplate()
    const url = URL.createObjectURL(response as Blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'supplier_manual_cfdi_template.xlsx'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.loading = false
    }, 250)
  }
}

async function loadTemplateRows() {
  try {
    const file = getSelectedTemplateFile()
    if (!file) {
      snackbar.add({ type: 'warning', text: 'Select an Excel file first.' })
      return
    }

    loadingStore.loading = true
    const response: any = await $api.supplierInvoices.previewManualCfdiImport({ file })
    const importedItems = (response.items ?? []).map((item: any) => normalizeImportedItem(item))
    const firstItem = items.value[0]

    if (items.value.length === 1 && firstItem && isItemEmpty(firstItem)) {
      items.value = importedItems
    } else {
      items.value.push(...importedItems)
    }

    form.templateFile = null
    snackbar.add({ type: 'success', text: 'Excel rows loaded into the form.' })
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.loading = false
    }, 250)
  }
}

async function saveSupplierCfdis() {
  try {
    const fixedValid = validateFixedFields()
    const rowsValid = validateRows()

    if (!fixedValid || !rowsValid) {
      snackbar.add({ type: 'warning', text: 'Review the highlighted errors before continuing.' })
      return
    }

    loadingStore.loading = true
    await $api.supplierInvoices.addManualCfdis({
      supplier_id: form.supplierId,
      rfc_receptor: form.rfc_receptor,
      name_receptor: form.name_receptor,
      items: items.value.map((item, index) => ({
        row_number: item.row_number ?? index + 1,
        serie: item.serie,
        folio: item.folio,
        invoice_date: item.invoice_date,
        tipo_comprobante: item.tipo_comprobante,
        amount_cfdi: item.amount_cfdi,
        currency_id: item.currency_id,
        notes: item.notes,
      })),
    })

    snackbar.add({ type: 'success', text: 'Supplier CFDIs added.' })
    router.push('/invoices/suppliers/cfdis')
  } catch (e: any) {
    const responseItems = e?.response?._data?.items
    if (Array.isArray(responseItems)) {
      items.value = responseItems.map((item: any) => normalizeImportedItem(item))
    }
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.loading = false
    }, 250)
  }
}
</script>
