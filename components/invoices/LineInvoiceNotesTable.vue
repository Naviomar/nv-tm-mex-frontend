<template>
  <div>
    <v-card>
      <v-card-text>
        <div class="mb-4" @keyup.enter="onClickFilters">
          <div>Filters:</div>
          <div class="grid grid-cols-12 gap-2">
            <div class="col-span-4">
              <v-text-field v-model="filters.masterBl" density="compact" label="Master BL" />
            </div>
            <div class="col-span-4">
              <AGlobalSearch :onSearch="searchLines" v-model="filters.line_id" label="Freight line" />
            </div>
          </div>
          <div class="flex gap-4 justify-end">
            <v-btn size="small" color="secondary" @click="clearFilters"> Clear </v-btn>
            <v-btn size="small" color="primary" @click="onClickFilters"> Search </v-btn>
          </div>
        </div>

        <v-pagination
          v-model="lineInvoices.current_page"
          :length="lineInvoices.last_page"
          rounded="circle"
          density="compact"
          @update:model-value="onClickPagination"
        ></v-pagination>

        <v-table density="compact" fixed-header>
          <thead>
            <tr>
              <th class="text-left">Actions</th>
              <th class="text-left">Line</th>
              <th class="text-left">Serie-Folio</th>
              <th class="text-left">Invoice date</th>
              <th class="text-left">Amount</th>
              <th class="text-left">Master BLs</th>
              <th class="text-left">Payment status</th>
              <th class="text-left">Attachment</th>
              <th class="text-left">Created at</th>
              <th class="text-left">#ID</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(item, index) in lineInvoices.data"
              :key="`reference-${index}`"
              :class="{
                'dark:hover:bg-gray-700 hover:bg-slate-300': true,
                'bg-red-100! dark:bg-red-900!': item.deleted_at,
              }"
            >
              <td>
                <div class="flex gap-2 items-center space-x-2">
                  
                  <template v-if="!item.deleted_at">
                    
                    <ViewButton :item="item" @click="viewLineInvoice(item)" />

                    <ProcessAuthorizationWrapper
                      v-if="!isPaid(item)"
                      processName="invoices.lines.update"
                      :requestKey="item.id"
                      label="Edit Line Invoice"
                      :displayName="item.serie_folio || `Line Invoice #${item.id}`"
                    >
                      <template #auth>
                        <EditButton :item="item" @click="editLineInvoice(item)" />
                      </template>
                    </ProcessAuthorizationWrapper>

                    <ProcessAuthorizationWrapper
                      v-if="!isPaid(item)"
                      processName="invoices.lines.delete"
                      :requestKey="item.id"
                      label="Cancel Line Invoice"
                      :displayName="item.serie_folio || `Line Invoice #${item.id}`"
                    >
                      <template #auth>
                        <v-btn
                          icon
                          size="x-small"
                          color="red"
                          variant="elevated" 
                          @click="deleteLineInvoice(item)"
                        >
                          <v-icon color="white">mdi-delete</v-icon>
                        </v-btn>
                      </template>
                    </ProcessAuthorizationWrapper>

                    <v-icon v-if="isPaid(item)" color="green" size="small" title="Invoice Paid - Locked">
                        mdi-lock-check
                    </v-icon>

                  </template>

                  <template v-else>
                    <v-chip
                        color="red"
                        variant="flat"
                        size="x-small"
                        class="font-weight-bold tracking-wider"
                        prepend-icon="mdi-cancel"
                    >
                        CANCELLED
                    </v-chip>
                  </template>

                </div>
              </td>

              <td>{{ item.line?.name }}</td>
              <td>
                <v-chip color="brown" size="small">{{ item.serie_folio }}</v-chip>
              </td>

              <td>
                {{ formatDateOnlyString(item.invoice_date) }}
              </td>
              <td>
                {{ formatToCurrency(item.total_amount) }}
              </td>
              <td class="whitespace-nowrap">
                <div
                  v-for="(lineInvoiceRef, index2) in item.refs"
                  class="grid grid-cols-2 gap-2"
                  :key="`line-invoice-ref-${index}-${index2}`"
                >
                  <div>{{ lineInvoiceRef.master_bl?.name }}</div>
                </div>
              </td>
              <td class="whitespace-nowrap">
                <div
                  v-for="(lineInvoiceRef, index2) in item.refs"
                  class="text-center"
                  :key="`line-invoice-ref-${index}-${index2}`"
                >
                  <v-chip size="small" :color="lineInvoiceRef.invoice?.is_paid == 1 ? 'green' : 'red'">{{
                    lineInvoiceRef.invoice?.is_paid == 1 ? 'Paid' : 'Unpaid'
                  }}</v-chip>
                </div>
              </td>
              <td>
                <ButtonDownloadS3Object2 :s3Path="item.attachment" />
              </td>
              <td class="whitespace-nowrap">
                <UserInfoBadge :item="item">
                  {{ formatDateString(item.created_at) }}
                </UserInfoBadge>
              </td>
              <td>{{ item.id }}</td>
            </tr>
          </tbody>
        </v-table>
        <v-pagination
          v-model="lineInvoices.current_page"
          :length="lineInvoices.last_page"
          rounded="circle"
          density="compact"
          @update:model-value="onClickPagination"
        ></v-pagination>
        <div class="text-xs">
          Showing {{ lineInvoices.from }} to {{ lineInvoices.to }} from {{ lineInvoices.total }} total records
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { flattenArraysToCommaSeparatedString } from '~/utils/formatters'
const { $api, $notifications } = useNuxtApp()
const router = useRouter()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()
const confirm = $notifications.useConfirm()

const initialYear = 2022
const currentYear = new Date().getFullYear()
const maxYear = currentYear + 1

const prefixYears = computed(() => {
  const years = []
  for (let i = initialYear; i <= maxYear; i++) {
    const year = i.toString().slice(-2)
    years.push(`${year}`)
  }
  return years
})

const emits = defineEmits(['view:reference'])

const catalogs = ref({
  lines: [] as any,
})

const filters = ref({
  year: '',
  referencia: '',
  referencias: [] as any,
  masterBl: '',
  line_id: '',
})

const lineInvoices = ref({
  data: [] as any,
  current_page: 1,
  page: 1,
  last_page: 1,
  from: 1,
  to: 1,
  total: 1,
})

// Función auxiliar para detectar si la factura está pagada
// Revisa si alguna de las referencias asociadas tiene estatus de pagado o monto pagado > 0
const isPaid = (item: any) => {
    if (!item.refs || item.refs.length === 0) return false
    
    return item.refs.some((ref: any) => {
        return ref.invoice?.is_paid == 1 || (ref.invoice?.amount_paid && parseFloat(ref.invoice.amount_paid) > 0)
    })
}

const addReferencia = () => {
  if (filters.value.referencia) {
    filters.value.referencia = filters.value.referencia.replace(/\s/g, '')
    const refs = Array.from(new Set(filters.value.referencia.split(',')))

    refs.forEach((ref) => {
      filters.value.referencias.push(ref)
    })
    filters.value.referencias = [...new Set(filters.value.referencias)]
    filters.value.referencia = ''
  }
}

const onClickFilters = async () => {
  lineInvoices.value.current_page = 1
  await getLineInvoices()
}

const onClickPagination = async (page: number) => {
  lineInvoices.value.current_page = page
  await getLineInvoices()
}

const getLineInvoices = async () => {
  try {
    loadingStore.loading = true
    const response = await $api.linePayments.getLineInvoices({
      query: {
        page: lineInvoices.value.current_page,
        ...flattenArraysToCommaSeparatedString(filters.value),
      },
    })

    lineInvoices.value = response as any

    if (lineInvoices.value.data.length === 0) {
      // snackbar.add({ type: 'info', text: 'No records found' })
    }
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.loading = false
    }, 250)
  }
}

const searchLines = async (search: any) => {
  try {
    const response = await $api.lines.searchLines({
      query: search,
    })
    return response
  } catch (error) {
    snackbar.add({
      type: 'error',
      text: 'Error fetching freight lines',
    })
  }
}

const getSeaImportFilters = async () => {
  try {
      const response = await $api.referencias.getSeaImportFilters()
      catalogs.value = response as any
  } catch(e) {
      console.error(e)
  }
}

await getSeaImportFilters()
await getLineInvoices()

const clearFilters = async () => {
  filters.value = {
    year: '',
    referencia: '',
    referencias: [],
    masterBl: '',
    line_id: '',
  }
  await getLineInvoices()
}

const viewLineInvoice = (item: any) => {
  router.push(`/invoices/lines/notes/view-${item.id}`)
}

const editLineInvoice = (item: any) => {
  router.push(`/invoices/lines/notes/edit-${item.id}`)
}

const deleteLineInvoice = async (item: any) => {
  const ok = await confirm({
    title: 'Are you sure?',
    content: `Do you want to cancel the invoice ${item.serie_folio}?`,
    confirmationText: 'Yes, Cancel',
    confirmationButtonProps: { color: 'red' },
  })

  if (!ok) return

  try {
    loadingStore.start()
    await $api.linePayments.delete(item.id)
    
    snackbar.add({ type: 'success', text: 'Line Invoice cancelled successfully' })
    await getLineInvoices()
  } catch (e) {
    console.error(e)
    snackbar.add({ type: 'error', text: 'Error cancelling invoice' })
  } finally {
    loadingStore.stop()
  }
}
</script>