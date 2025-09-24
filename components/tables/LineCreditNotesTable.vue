<template>
  <div>
    <div @keyup.enter="onClickFilters">
      <div class="font-bold mb-2">Filters</div>
      <div class="grid grid-cols-4 gap-5">
        <div>
          <v-autocomplete
            v-model="filters.lineId"
            :items="catalogs.lines"
            item-title="name"
            item-value="id"
            label="Lines"
            density="compact"
          />
        </div>
        <div><v-text-field v-model="filters.id" type="text" label="Credit Note #" density="compact" /></div>
        <div><v-text-field v-model="filters.dateFrom" type="date" label="Date from" density="compact" /></div>
        <div><v-text-field v-model="filters.dateTo" type="date" label="Date to" density="compact" /></div>
      </div>
      <div class="flex gap-4">
        <v-btn class="" color="secondary" @click="clearFilters"> Clear </v-btn>
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
            <th>Fregiht lne</th>
            <th>Notes</th>
            <th>Line invoice related</th>
            <th>Amount</th>
            <th>Amount available</th>
            <th>Created at</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(creditNote, index) in creditNotes.data"
            :key="`cons-credit-note-${index}`"
            :class="{ 'bg-red-100! dark:bg-red-900!': creditNote.deleted_at }"
          >
            <td>
              <div class="flex gap-2">
                <ViewButton :item="creditNote" @click="viewCreditNote(creditNote)" />
                <TrashButton :item="creditNote" @click="showConfirmDelete(creditNote)" />
              </div>
            </td>
            <td>
              <v-chip color="blue" density="compact" class="uppercase"
                >{{ creditNote.inv_type }} #{{ creditNote.folio_real }}</v-chip
              >
            </td>
            <td>{{ creditNote.line?.name }}</td>
            <td>{{ creditNote.description }}</td>
            <td>
              <v-btn
                color="info"
                size="small"
                variant="tonal"
                class="cursor-pointer"
                @click="viewLineInvoice(creditNote.line_invoice)"
              >
                <v-icon>mdi-open-in-new</v-icon>
                #{{ creditNote.line_invoice?.serie_folio }}
              </v-btn>
            </td>
            <td class="whitespace-nowrap">
              {{ getCurrencyName(creditNote.currency_id) }} {{ formatToCurrency(creditNote.amount) }}
            </td>
            <td class="whitespace-nowrap">{{ formatToCurrency(creditNote.amount_available) }}</td>
            <td class="whitespace-nowrap">
              <UserInfoBadge :item="creditNote">
                <div>{{ formatDateString(creditNote.created_at) }}</div>
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
const { $api, $notifications } = useNuxtApp()
const loadingStore = useLoadingStore()
const confirm = $notifications.useConfirm()
const snackbar = useSnackbar()
const router = useRouter()

const filters = ref<any>({
  id: '',
  lineId: '',
  dateFrom: '',
  dateTo: '',
  invoiceId: '',
})

const catalogs = ref({
  lines: [] as any,
})

const creditNotes = ref<any>({
  data: [],
  current_page: 1,
  page: 1,
  perPage: 10,
  last_page: 1,
})

const showConfirmDelete = async (creditNote: any) => {
  const result = await confirm({
    title: 'Are you sure?',
    confirmationText: 'Yes, I confirm',
    content: 'Please confirm you want to delete it.',
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
      console.log(creditNote)
      snackbar.add({ type: 'info', text: 'Not implemented yet' })
    } catch (e) {
      console.error(e)
    } finally {
      setTimeout(() => {
        loadingStore.stop()
      }, 250)
    }
  }
}

const getInvoiceType = (invoice: any) => {
  if (!invoice) return ''
  if (invoice.invoiceable_type?.includes('InvoiceSeaTm')) {
    return `TM Invoice #${invoice.invoiceable_id}`
  }
  if (invoice.invoiceable_type?.includes('InvoiceSeaWm')) {
    return `WM Invoice #${invoice.invoiceable_id}`
  }
  return ''
}

const viewCreditNote = (creditNote: any) => {
  router.push(`/invoices/lines/credit-notes/view-${creditNote.id}`)
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

const viewLineInvoice = (lineInvoice: any) => {
  // router.push(`/invoices/lines/credit-notes/view-${note.id}`)
  navigateTo(`/invoices/lines/notes/view-${lineInvoice.id}`, {
    open: {
      target: '_blank',
    },
  })
}

const clearFilters = async () => {
  filters.value = {
    id: '',
    lineId: '',
    dateFrom: '',
    dateTo: '',
    invoiceId: '',
  }
  await getData()
}

const getData = async () => {
  try {
    loadingStore.loading = true
    const response = (await $api.lines.getCreditNotesPaged({
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
  const response = await $api.lines.getCreditNoteCatalogs()

  catalogs.value = response as any
}

await getCatalogs()
await getData()
</script>
