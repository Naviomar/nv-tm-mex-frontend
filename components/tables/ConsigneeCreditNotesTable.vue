<template>
  <div>
    <div @keyup.enter="onClickFilters">
      <div class="font-bold mb-2">Filters</div>
      <div class="grid grid-cols-4 gap-4 mb-4">
        <div>
          <ACustomerSearch v-model="filters.consigneeId" />
        </div>
        <div>
          <v-text-field v-model="filters.external_folio" type="text" label="Credit Note #" density="compact" hide-details />
        </div>
        <div>
          <v-autocomplete
            v-model="filters.inv_type"
            :items="invoiceTypes"
            item-value="value"
            item-title="name"
            label="Invoice type"
            density="compact"
            hide-details
          />
        </div>
        <div>
          <v-text-field v-model="filters.dateFrom" type="date" label="Date from" density="compact" hide-details />
        </div>
        <div><v-text-field v-model="filters.dateTo" type="date" label="Date to" density="compact" hide-details /></div>
      </div>
      <div class="flex gap-2">
        <v-btn color="amber" size="small" @click="exportToExcel">Export to Excel</v-btn>
        <v-btn color="secondary" @click="clearFilters"> Clear </v-btn>
        <v-btn color="primary" @click="onClickFilters"> Search </v-btn>
      </div>
    </div>

    <!-- Dialog para solicitar autorización de cancelación -->
    <v-dialog v-model="showCancelDialog" max-width="500" persistent>
      <v-card>
        <v-card-title class="text-h6">
          <v-icon>mdi-file-cancel-outline</v-icon> Cancel Credit Note
        </v-card-title>
        <v-card-text>
          <div class="mb-4">
            <div class="text-sm text-gray-600 dark:text-gray-400">
              Credit Note: <strong>#{{ selectedCreditNote?.id }}</strong>
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400">
              Customer: <strong>{{ selectedCreditNote?.consignee?.name }}</strong>
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400">
              Amount: <strong>{{ formatToCurrency(selectedCreditNote?.amount) }}</strong>
            </div>
          </div>
          <AuthorizeProcessSmart
            ref="authorizeCancelCN"
            label="Request authorization to cancel"
            :resource="authorizeResources.CancelCustomerCreditNote.resource"
            :resourceId="String(selectedCreditNote?.id || '')"
            :refresh="refreshAuthReqs"
            :resourceData="{ folio: selectedCreditNote?.external_folio || ('CN-' + selectedCreditNote?.id), consignee: selectedCreditNote?.consignee?.name }"
          >
            <template #auth>
              <div class="flex flex-col gap-2">
                <v-chip color="success" size="small">
                  <v-icon>mdi-check</v-icon> Authorized
                </v-chip>
                <v-btn color="error" size="small" @click="confirmCancelCreditNote">
                  <v-icon>mdi-delete</v-icon> Confirm Cancelation
                </v-btn>
              </div>
            </template>
          </AuthorizeProcessSmart>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="grey" @click="closeCancelDialog">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog para solicitar autorización de restauración -->
    <v-dialog v-model="showRestoreDialog" max-width="500" persistent>
      <v-card>
        <v-card-title class="text-h6">
          <v-icon>mdi-restore</v-icon> Restore Credit Note
        </v-card-title>
        <v-card-text>
          <div class="mb-4">
            <div class="text-sm text-gray-600 dark:text-gray-400">
              Credit Note: <strong>#{{ selectedCreditNote?.id }}</strong>
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400">
              Customer: <strong>{{ selectedCreditNote?.consignee?.name }}</strong>
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400">
              Amount: <strong>{{ formatToCurrency(selectedCreditNote?.amount) }}</strong>
            </div>
          </div>
          <AuthorizeProcessSmart
            ref="authorizeRestoreCN"
            label="Request authorization to restore"
            :resource="authorizeResources.RestoreCustomerCreditNote.resource"
            :resourceId="String(selectedCreditNote?.id || '')"
            :refresh="refreshAuthReqsRestore"
            :resourceData="{ folio: selectedCreditNote?.external_folio || ('CN-' + selectedCreditNote?.id), consignee: selectedCreditNote?.consignee?.name }"
          >
            <template #auth>
              <div class="flex flex-col gap-2">
                <v-chip color="success" size="small">
                  <v-icon>mdi-check</v-icon> Authorized
                </v-chip>
                <v-btn color="primary" size="small" @click="confirmRestoreCreditNote">
                  <v-icon>mdi-restore</v-icon> Confirm Restore
                </v-btn>
              </div>
            </template>
          </AuthorizeProcessSmart>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="grey" @click="closeRestoreDialog">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <div>
      <v-pagination
        v-model="creditNotes.current_page"
        :length="creditNotes.last_page"
        rounded="circle"
        @update:model-value="onClickPagination"
        density="compact"
      ></v-pagination>
      <v-table density="compact" fixed-header>
        <thead>
          <tr>
            <th>Actions</th>
            <th>Folio</th>
            <th>External folio</th>
            <th>Customer</th>
            <th>Notes</th>
            <th>Services related</th>
            <th>Invoice related</th>
            <th>Amount</th>
            <th>Amount available</th>
            <th>Created at</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(creditNote, index) in creditNotes.data"
            :key="`cons-credit-note-${index}`"
            :class="{
              'dark:hover:bg-gray-700 hover:bg-slate-300': true,
              'bg-red-100! dark:bg-red-900!': creditNote.deleted_at,
            }"
          >
            <td>
              <div class="flex gap-2">
                <ViewButton :item="creditNote" @click="viewCreditNote(creditNote)" />
                <EditButton :item="creditNote" @click="editCreditNote(creditNote)" />
                <TrashButton :item="creditNote" @click="handleTrashButtonClick(creditNote)" />
              </div>
            </td>
            <td>#{{ creditNote.id }}</td>
            <td>{{ creditNote.external_folio }}</td>
            <td>{{ creditNote.consignee?.name }}</td>
            <td>{{ creditNote.description }}</td>
            <td>{{ getCNInvoiceServices(creditNote) }}</td>
            <td class="whitespace-nowrap">
              <template v-if="creditNote.invoices && creditNote.invoices.length > 1">
                <v-chip v-for="(inv, iIdx) in creditNote.invoices" :key="`inv-${iIdx}`" size="x-small" class="mr-1">
                  {{ inv.invoice_number }}
                </v-chip>
              </template>
              <template v-else>
                {{ creditNote.invoice?.invoice_number }}
              </template>
            </td>
            <td>{{ formatToCurrency(creditNote.amount) }}</td>
            <td>{{ formatToCurrency(creditNote.amount_available) }}</td>
            <td class="whitespace-nowrap">
              <UserInfoBadge :item="creditNote">
                {{ formatDateString(creditNote.created_at) }}
              </UserInfoBadge>
            </td>
          </tr>
        </tbody>
      </v-table>
      <v-pagination
        v-model="creditNotes.current_page"
        :length="creditNotes.last_page"
        rounded="circle"
        @update:model-value="onClickPagination"
        density="compact"
      ></v-pagination>
    </div>
  </div>
</template>
<script setup lang="ts">
import { formatToCurrency } from '@/utils/formatters'
import { authorizeResources } from '~/utils/data/system'

const { $api, $notifications } = useNuxtApp()
const confirm = $notifications.useConfirm()
const loadingStore = useLoadingStore()
const router = useRouter()
const snackbar = useSnackbar()

// Variables para el sistema de autorización de cancelación
const showCancelDialog = ref(false)
const selectedCreditNote = ref<any>(null)
const refreshAuthReqs = ref(false)
const authorizeCancelCN = ref<any>(null)

// Variables para el sistema de autorización de restauración
const showRestoreDialog = ref(false)
const refreshAuthReqsRestore = ref(false)
const authorizeRestoreCN = ref<any>(null)

const filters = ref({
  external_folio: '',
  inv_type: '',
  consigneeId: '',
  dateFrom: '',
  dateTo: '',
  invoiceId: '',
})

const catalogs = ref({
  consignees: [] as any,
})

const creditNotes = ref({
  data: [] as any,
  current_page: 1,
  page: 1,
  perPage: 10,
  last_page: 1,
})

const invoiceTypes = [
  { value: 'tm', name: 'TM' },
  { value: 'wm', name: 'WM' },
]

const getInvoiceType = (invoice: any) => {
  if (!invoice) return ''
  if (invoice.invoiceable_type?.includes('InvoiceSeaTm')) {
    return `TM Sea Invoice #${invoice.external_folio}`
  }
  if (invoice.invoiceable_type?.includes('InvoiceSeaWm')) {
    return `WM Sea Invoice #${invoice.invoiceable_id}`
  }
  if (invoice.invoiceable_type?.includes('InvoiceAirTm')) {
    return `TM Air Invoice #${invoice.invoiceable_id}`
  }
  if (invoice.invoiceable_type?.includes('InvoiceAirWm')) {
    return `WM Air Invoice #${invoice.invoiceable_id}`
  }
  return ''
}

const viewCreditNote = (creditNote: any) => {
  router.push(`/invoices/search/credit-notes/view-${creditNote.id}`)
}

const editCreditNote = (creditNote: any) => {
  router.push(`/invoices/search/credit-notes/edit-${creditNote.id}`)
}

const getServicesFromInvoice = (invoice: any) => {
  if (!invoice?.invoiceable) return ''
  if (invoice.invoiceable.class_name?.includes('Sea')) {
    return (invoice.invoiceable.services || [])
      .map((s: any) => s.referencia?.reference_number)
      .filter(Boolean)
      .join(', ')
  }
  if (invoice.invoiceable.class_name?.includes('Air')) {
    return (invoice.invoiceable.services || [])
      .map((s: any) => s.air_reference?.reference_number)
      .filter(Boolean)
      .join(', ')
  }
  return ''
}

const getCNInvoiceServices = (creditNote: any) => {
  // Multi-invoice: collect services from all linked invoices
  if (creditNote.invoices && creditNote.invoices.length > 0) {
    const all = creditNote.invoices
      .map((inv: any) => getServicesFromInvoice(inv))
      .filter(Boolean)
    return all.join(', ') || '-'
  }
  // Fallback: single invoice
  return getServicesFromInvoice(creditNote.invoice) || '-'
}

const onClickFilters = async () => {
  // set current page to 1
  creditNotes.value.current_page = 1
  await getData()
}

const onClickPagination = async (page: number) => {
  creditNotes.value.current_page = page
  await getData()
}

const clearFilters = async () => {
  filters.value = {
    external_folio: '',
    inv_type: '',
    consigneeId: '',
    dateFrom: '',
    dateTo: '',
    invoiceId: '',
  }
  await getData()
}

// Handler inteligente para TrashButton - decide entre cancelar o restaurar
const handleTrashButtonClick = async (item: any) => {
  if (item.deleted_at) {
    // Si está eliminado, mostrar modal de autorización para restaurar
    showConfirmRestore(item)
  } else {
    // Si no está eliminado, mostrar modal de cancelación
    showConfirmDelete(item)
  }
}

// Abrir el diálogo de autorización para cancelar
const showConfirmDelete = async (item: any) => {
  selectedCreditNote.value = item
  showCancelDialog.value = true
  refreshAuthReqs.value = !refreshAuthReqs.value
}

// Cerrar el diálogo de cancelación
const closeCancelDialog = () => {
  showCancelDialog.value = false
  selectedCreditNote.value = null
}

// Confirmar la cancelación después de tener autorización
const confirmCancelCreditNote = async () => {
  if (!selectedCreditNote.value) return
  
  try {
    loadingStore.start()
    const body = {
      ...selectedCreditNote.value,
    }
    await $api.consigneeCreditNotes.deleteCustomerCreditNote(body)
    snackbar.add({ type: 'success', text: 'Credit note canceled successfully' })
    closeCancelDialog()
    await getData()
  } catch (e: any) {
    console.error(e)
    snackbar.add({ type: 'error', text: e?.data?.message || 'Error canceling credit note' })
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

// Abrir el diálogo de autorización para restaurar
const showConfirmRestore = async (item: any) => {
  selectedCreditNote.value = item
  showRestoreDialog.value = true
  refreshAuthReqsRestore.value = !refreshAuthReqsRestore.value
}

// Cerrar el diálogo de restauración
const closeRestoreDialog = () => {
  showRestoreDialog.value = false
  selectedCreditNote.value = null
}

// Confirmar la restauración después de tener autorización
const confirmRestoreCreditNote = async () => {
  if (!selectedCreditNote.value) return
  
  try {
    loadingStore.start()
    await $api.consigneeCreditNotes.restore(selectedCreditNote.value.id)
    snackbar.add({ type: 'success', text: 'Credit note restored successfully' })
    closeRestoreDialog()
    await getData()
  } catch (e: any) {
    console.error(e)
    snackbar.add({ type: 'error', text: e?.data?.message || 'Error restoring credit note' })
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const getData = async () => {
  try {
    loadingStore.loading = true
    const response = (await $api.consigneeCreditNotes.getPaged({
      query: {
        page: creditNotes.value.current_page,
        perPage: creditNotes.value.perPage,
        ...flattenArraysToCommaSeparatedString(filters.value),
      },
    })) as any

    creditNotes.value = response
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const exportToExcel = async () => {
  try {
    loadingStore.start()


    console.log("queryFilters::",filters.value)
    
 
    const response = (await $api.consigneeCreditNotes.exportInvoicesToExcel({
        query: {
          ...flattenArraysToCommaSeparatedString(filters.value),
        },
      })) as any

      const blob = new Blob([response], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })

      const today = new Date();
      const currentDate = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
      const link = document.createElement('a')
      link.href = window.URL.createObjectURL(blob)
      link.download = `export-invoices-tmNc-${currentDate}.xlsx`
      link.click()

    
    
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
    const response = await $api.consigneeCreditNotes.getCatalogs()
    catalogs.value = response as any
  } catch (e) {
    console.error('Error loading catalogs:', e)
  }
}

await getCatalogs()
await getData()
</script>
