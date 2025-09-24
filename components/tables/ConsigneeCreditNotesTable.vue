<template>
  <div>
    <div @keyup.enter="onClickFilters">
      <div class="font-bold mb-2">Filters</div>
      <div class="grid grid-cols-4 gap-4 mb-4">
        <div>
          <ACustomerSearch v-model="filters.consigneeId" />
        </div>
        <div>
          <v-text-field v-model="filters.id" type="text" label="Credit Note #" density="compact" hide-details />
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
        <v-btn color="secondary" @click="clearFilters"> Clear </v-btn>
        <v-btn color="primary" @click="onClickFilters"> Search </v-btn>
      </div>
    </div>
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
                <TrashButton :item="creditNote" @click="showConfirmDelete" />
              </div>
            </td>
            <td>#{{ creditNote.id }}</td>
            <td>{{ creditNote.external_folio }}</td>
            <td>{{ creditNote.consignee?.name }}</td>
            <td>{{ creditNote.description }}</td>
            <td>{{ getCNInvoiceServices(creditNote) }}</td>
            <td class="whitespace-nowrap">{{ getInvoiceType(creditNote.invoice) }}</td>
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
const { $api, $notifications } = useNuxtApp()
const confirm = $notifications.useConfirm()
const loadingStore = useLoadingStore()
const router = useRouter()
const snackbar = useSnackbar()

const filters = ref({
  id: '',
  inv_type: null,
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
    return `TM Sea Invoice #${invoice.invoiceable_id}`
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

const getCNInvoiceServices = (creditNote: any) => {
  if (!creditNote.invoice) return '-'
  if (creditNote.invoice.invoiceable?.class_name.includes('Sea')) {
    return (creditNote.invoice.invoiceable.services || [])
      .map((service: any) => service.referencia?.reference_number)
      .join(', ')
  }
  if (creditNote.invoice.invoiceable?.class_name.includes('Air')) {
    return (creditNote.invoice.invoiceable.services || [])
      .map((service: any) => service.air_reference?.reference_number)
      .join(', ')
  }
  return '-'
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
    id: '',
    inv_type: null,
    consigneeId: '',
    dateFrom: '',
    dateTo: '',
    invoiceId: '',
  }
  await getData()
}

const showConfirmDelete = async (item: any) => {
  const result = await confirm({
    title: 'Please confirm this action.',
    confirmationText: 'Yes, I confirm',
    content: 'Deleting the credit note will release everything related to it..',
    dialogProps: {
      persistent: true,
      maxWidth: 500,
    },
    confirmationButtonProps: {
      color: 'primary',
    },
  })

  if (result) {
    try {
      loadingStore.start()
      const body = {
        ...item,
      }
      await $api.consigneeCreditNotes.deleteCustomerCreditNote(body)
      snackbar.add({ type: 'success', text: 'Customer Credit Note deleted' })
      await getData()
    } catch (e) {
      console.error(e)
    } finally {
      setTimeout(() => {
        loadingStore.stop()
      }, 250)
    }
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

const getCatalogs = async () => {
  const response = await $api.consigneeCreditNotes.getCatalogs()

  catalogs.value = response as any
}

await getCatalogs()
await getData()
</script>
