<template>
  <div>
    <v-card>
      <v-card-text>
        <div class="mb-4" @keyup.enter="onClickFilters">
          <div>Filters:</div>
          <div class="grid grid-cols-12 gap-2">
            <div class="col-span-3">
              <v-autocomplete
                v-model="filters.forwarderId"
                :items="catalogs.forwarders"
                item-title="name"
                item-value="id"
                density="compact"
                label="Freight Forwarder"
              />
            </div>
            <div class="col-span-2">
              <v-text-field v-model="filters.referenciaNumber" density="compact" label="Sea Reference number" />
            </div>
            <div class="col-span-3">
              <v-autocomplete
                v-model="filters.linkedRef"
                :items="[
                  { value: true, name: 'Yes' },
                  { value: false, name: 'No' },
                ]"
                item-title="name"
                item-value="value"
                density="compact"
                label="Linked to service"
                clearable
              />
            </div>
            <div class="col-span-2">
              <v-autocomplete
                v-model="filters.inbound"
                :items="[
                  { value: 1, name: 'From Agent' },
                  { value: 0, name: 'From TM' },
                ]"
                item-title="name"
                item-value="id"
                density="compact"
                label="Type"
              />
            </div>
            <div class="col-span-4">
              <v-textarea
                v-model="filters.numberFolios"
                density="compact"
                label="Multiline folio search"
                placeholder="Enter folio numbers separated by new line"
                rows="5"
                hide-details
              />
            </div>
          </div>
          <div class="flex py-2">
            <v-btn class="mx-4" color="secondary" size="small" @click="clearFilters"> Clear </v-btn>
            <v-btn color="primary" size="small" @click="onClickFilters"> Search </v-btn>
          </div>
        </div>

        <v-pagination
          v-model="ffNotes.current_page"
          :length="ffNotes.last_page"
          rounded="circle"
          density="compact"
          @update:model-value="onClickPagination"
        ></v-pagination>
        <v-table density="compact" fixed-header>
          <thead>
            <tr>
              <th class="text-left" width="50">Actions</th>
              <th class="text-left" width="50">Locked</th>
              <th class="text-left">Folio</th>
              <th class="text-left">F.F. Agent</th>
              <th class="text-left">Type</th>
              <th class="text-left">Credit / Debit</th>
              <th class="text-left">Service type</th>
              <th class="text-left">Service Ref #</th>
              <th class="text-left">Req. Payment</th>
              <th class="text-left">Invoice date</th>
              <th class="text-left">Amount</th>
              <th class="text-left">Attachment</th>
              <th class="text-left" width="50">System Id</th>
              <th class="text-left">Created at</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(item, index) in ffNotes.data"
              :key="`ffnote-${index}`"
              :class="{
                'dark:hover:bg-gray-700 hover:bg-slate-300': true,
                'bg-red-100! dark:bg-red-900!': item.deleted_at,
              }"
            >
              <td>
                <v-btn
                  variant="text"
                  icon="mdi-eye-outline"
                  color="blue-lighten-2"
                  density="compact"
                  @click="viewFfAgentInvoice(item)"
                ></v-btn>
              </td>
              <td>
                <div v-if="item.checked_at">
                  <v-btn density="compact" color="green" variant="outlined" icon="mdi-lock-outline"></v-btn>
                </div>
                <div v-if="!item.checked_at">
                  <v-btn size="x-small" color="warning" variant="outlined" icon="mdi-lock-open-outline"></v-btn>
                </div>
              </td>
              <td class="whitespace-nowrap font-bold">{{ item.service_folio }}</td>
              <td>{{ item.forwarder?.name }}</td>
              <td class="whitespace-nowrap">{{ item.inbound == 1 ? 'From Agent' : 'From TM' }}</td>
              <td class="whitespace-nowrap">{{ item.type === 'C' ? 'Credit' : 'Debit' }}</td>
              <td class="whitespace-nowrap">{{ getServiceType(item) }}</td>
              <td class="whitespace-nowrap">
                <div v-if="!item.serviceable">
                  <v-chip size="small" color="primary"> No Ref# linked </v-chip>
                </div>
                <div v-if="item.serviceable">
                  <v-chip size="small" color="primary"> {{ item.serviceable?.reference_number }} </v-chip>
                </div>
              </td>
              <td>
                <v-chip v-if="!item.note_payment" color="purple" size="small">Pending req. payment</v-chip>

                <div class="flex flex-col gap-2">
                  <v-chip v-if="item.note_payment" color="green" size="small" @click="goToFfNotePayment(item)">
                    <v-icon>mdi-open-in-new</v-icon>
                    Req. payment #{{ item.note_payment?.ff_payment_id }}</v-chip
                  >
                  <div v-if="item.note_payment?.payment?.invoice?.is_paid == 0">
                    <v-chip color="amber" size="small">Pending payment</v-chip>
                  </div>
                  <div v-if="item.note_payment?.payment?.invoice?.is_paid == 1">
                    <v-chip color="success" size="small"
                      >Paid @ {{ formatDateString(item.note_payment?.payment?.invoice?.updated_at) }}</v-chip
                    >
                  </div>
                </div>
              </td>
              <td>
                {{ formatDateOnlyString(item.created_at) }}
              </td>
              <td class="whitespace-nowrap">
                {{ getCurrencyName(item.currency_id) }} {{ formatToCurrency(getTotalFromFfNote(item)) }}
              </td>
              <td>
                <div v-if="item.inbound === 0">
                  <v-btn size="small" variant="tonal" @click="previewTmFfNotePdf(item)"
                    ><v-icon>mdi-printer-eye</v-icon>PDF</v-btn
                  >
                </div>
                <ButtonDownloadS3Object2 :s3Path="item.attachment" />
              </td>
              <td>{{ item.id }}</td>
              <td class="whitespace-nowrap">
                <UserInfoBadge :item="item">
                  <div>{{ formatDateString(item.created_at) }}</div>
                </UserInfoBadge>
              </td>
            </tr>
          </tbody>
        </v-table>
        <v-pagination
          v-model="ffNotes.current_page"
          :length="ffNotes.last_page"
          rounded="circle"
          density="compact"
          @update:model-value="onClickPagination"
        ></v-pagination>
        <div class="text-xs">Showing {{ ffNotes.from }} to {{ ffNotes.to }} from {{ ffNotes.total }} total records</div>
      </v-card-text>
    </v-card>

    <v-dialog v-model="showPdfDialog" fullscreen>
      <v-card>
        <v-toolbar color="primary">
          <v-btn icon @click="closePdfDialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title>Preview file</v-toolbar-title>
          <v-spacer></v-spacer>
        </v-toolbar>
        <v-card-text>
          <object ref="pdfServerViewer" type="application/pdf" width="100%" height="100%"></object>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>
<script setup lang="ts">
import { flattenArraysToCommaSeparatedString } from '~/utils/formatters'
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const router = useRouter()
const loadingStore = useLoadingStore()

const initialYear = 2022
const currentYear = new Date().getFullYear()
const maxYear = currentYear + 1

const pdfServerViewer = ref<any>(null)
const showPdfDialog = ref(false)

const prefixYears = computed(() => {
  const years = []
  for (let i = initialYear; i <= maxYear; i++) {
    // last two digits of the year
    const year = i.toString().slice(-2)
    years.push(`${year}`)
  }
  return years
})

const catalogs = ref({
  forwarders: [] as any,
})

const filters = ref<any>({
  year: '',
  referenciaNumber: '',
  linkedRef: null,
  forwarderId: '',
  inbound: null,
  numberFolios: null,
  folios: null,
})

const ffNotes = ref<any>({
  data: [],
  current_page: 1,
  page: 1,
  last_page: 1,
  from: 1,
  to: 1,
  total: 1,
})

const getServiceType = (item: any) => {
  const serviceType = item.serviceable_type
  if (!serviceType) return 'No service type'
  let service = 'Unknown'
  if (serviceType.includes('Referencia')) {
    service = `Sea ${item.serviceable?.impoExpo === 'I' ? 'Import' : 'Export'}`
  }
  if (serviceType.includes('AirReference')) {
    service = `Air ${item.serviceable?.impoExpo === 'I' ? 'Import' : 'Export'}`
  }

  return service
}

const getTotalFromFfNote = (item: any) => {
  if (item.inbound === 1) return item.amount
  return item.concepts.reduce((acc: number, concept: any) => {
    return acc + parseFloat(concept.amount)
  }, 0)
}

const goToFfNotePayment = (item: any) => {
  router.push(`/payments/agents/payments/view-${item.note_payment.ff_payment_id}?ff_note_id=${item.id}`)
}

const onClickFilters = async () => {
  // set current page to 1
  ffNotes.value.current_page = 1
  await getFfNotes()
}

const onClickPagination = async (page: number) => {
  ffNotes.value.current_page = page
  await getFfNotes()
}

const closePdfDialog = () => {
  showPdfDialog.value = false
  pdfServerViewer.value = null
}
const previewTmFfNotePdf = async (creditDebit: any) => {
  try {
    showPdfDialog.value = true
    loadingStore.start()
    const response = await $api.ffNotes.getFfNotePdf(creditDebit.id)
    const blob = new Blob([response as any], { type: 'application/pdf' })
    const pdfUrl = URL.createObjectURL(blob)
    if (pdfServerViewer.value == null) {
      pdfServerViewer.value = document.createElement('object')
    }
    pdfServerViewer.value.data = pdfUrl
  } catch (e) {
    console.error(e)
    showPdfDialog.value = false
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const getFfNotes = async () => {
  try {
    loadingStore.loading = true

    // folios convert to array comma separated
    if (filters.value.numberFolios) {
      filters.value.folios = filters.value.numberFolios.split('\n').filter((x: string) => x)
      // remove empty strings and duplicates
      filters.value.folios = [...new Set(filters.value.folios)]
    }

    const response = await $api.freightForwarders.getFfNotes({
      query: {
        page: ffNotes.value.current_page,
        ...flattenArraysToCommaSeparatedString(filters.value),
      },
    })

    ffNotes.value = response as any
    if (ffNotes.value.data.length === 0) {
      snackbar.add({
        type: 'info',
        text: 'No records found',
      })
    }
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.loading = false
    }, 250)
  }
}

const getSeaImportFilters = async () => {
  const response = await $api.freightForwarders.getNotesFilters()
  catalogs.value = response as any
}

const clearFilters = async () => {
  filters.value = {
    year: '',
    linkedRef: null,
    referenciaNumber: '',
    forwarderId: '',
    inbound: null,
    numberFolios: null,
    folios: null,
  }
  await getFfNotes()
}

const viewFfAgentInvoice = (item: any) => {
  router.push(`/invoices/ffagents/notes/view-${item.id}`)
}

onMounted(async () => {
  await getSeaImportFilters()
  await getFfNotes()
})
</script>
