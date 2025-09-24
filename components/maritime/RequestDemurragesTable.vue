<template>
  <div>
    <div @keyup.enter="onClickFilters">
      <div class="font-bold mb-2">Filters</div>
      <div class="grid grid-cols-4 gap-5">
        <div><v-text-field v-model="filters.from" density="compact" type="date" label="Date from" /></div>
        <div><v-text-field v-model="filters.to" density="compact" type="date" label="Date to" /></div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div>
          <v-text-field
            v-model="filters.id"
            density="compact"
            type="text"
            label="Request number"
            @keyup.enter="getData"
          />
        </div>

        <div>
          <AGlobalSearch :onSearch="searchLines" v-model="filters.lineId" label="Freight line *" />
        </div>
        <div>
          <v-text-field v-model="filters.masterBl" density="compact" type="text" label="Master BL" />
        </div>
        <div class="">
          <v-autocomplete
            density="compact"
            label="Status"
            v-model="filters.deleted_status"
            :items="deletedStatus"
            item-title="name"
            item-value="value"
            @keyup.enter="getData"
            hide-details
          />
        </div>
      </div>
      <div class="flex gap-4">
        <v-btn size="small" color="secondary" @click="clearFilters"> Clear </v-btn>
        <v-btn size="small" color="primary" @click="onClickFilters"> Search </v-btn>
      </div>
    </div>
    <div>
      <v-pagination
        v-model="reqDemurrages.current_page"
        :length="reqDemurrages.last_page"
        rounded="circle"
        @update:model-value="onClickPagination"
        density="compact"
      ></v-pagination>
      <v-table density="compact" fixed-header>
        <thead>
          <tr>
            <th>Actions</th>
            <th>Req #</th>
            <th>Freight line</th>
            <th>Service(s) #</th>
            <th>MBL</th>
            <th>Containers</th>
            <th>Status</th>

            <th>Total</th>
            <th>Currency</th>
            <th>Created at</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(reqDemurrage, index) in reqDemurrages.data"
            :key="`invoice-${index}`"
            :class="rowClass(reqDemurrage)"
          >
            <td>
              <ViewButton :item="reqDemurrage" @click="viewReqDemurrage(reqDemurrage)" />
            </td>
            <td>{{ reqDemurrage.id }}</td>
            <td>{{ reqDemurrage.line?.name }}</td>
            <td>
              <div class="flex flex-col gap-1">
                <v-chip
                  v-for="(reqContainer, index) in reqDemurrage.containers"
                  :key="`req-container-${index}`"
                  size="small"
                  color="primary"
                >
                  {{ reqContainer.referencia?.reference_number }}
                </v-chip>
              </div>
            </td>
            <td>
              <div
                v-for="(reqContainer, index) in reqDemurrage.containers"
                :key="`req-container2-${index}`"
                class="flex flex-col gap-1"
              >
                <v-chip
                  v-for="bl in reqContainer.referencia.master_bls"
                  :key="`ref-bl-${bl.id}-${index}`"
                  color="primary"
                  size="small"
                  >{{ bl.name }} {{ bl.consignee_mbl?.name }}</v-chip
                >
              </div>
            </td>
            <td>
              <div class="flex flex-col gap-1">
                <v-chip
                  v-for="(reqContainer, index) in reqDemurrage.containers"
                  :key="`req-container-${index}`"
                  size="small"
                  color="primary"
                >
                  {{ reqContainer.reference_container?.container_number }}
                  {{ reqContainer.reference_container?.container_type?.name }}
                </v-chip>
              </div>
            </td>
            <td>
              <div class="text-xs">{{ getInvoicePaidStatus(reqDemurrage) }}</div>
            </td>

            <td>
              {{
                formatToCurrency(
                  reqDemurrage.containers.reduce(
                    (acc: any, c: any) => acc + parseFloat(c.amount) + parseFloat(c.amount_iva),
                    0
                  )
                )
              }}
            </td>
            <td>{{ getCurrencyName(reqDemurrage.currency_id) }}</td>
            <td class="whitespace-nowrap">
              <UserInfoBadge :item="reqDemurrage">
                <div>{{ formatDateString(reqDemurrage.created_at) }}</div>
              </UserInfoBadge>
            </td>
          </tr>
        </tbody>
      </v-table>
      <v-pagination
        v-model="reqDemurrages.current_page"
        :length="reqDemurrages.last_page"
        rounded="circle"
        @update:model-value="onClickPagination"
        density="compact"
      ></v-pagination>
    </div>
  </div>
</template>
<script setup lang="ts">
import { deletedStatus } from '@/utils/data/systemData'
import { formatToCurrency } from '@/utils/formatters'
import { currencies } from '@/utils/data/systemData'

const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()
const router = useRouter()

const filters = ref({
  from: '',
  to: '',
  id: null,
  lineId: '',
  masterBl: '',
  houseBl: '',
  consigneeId: '',
  freight_forwarder_id: '',
  deleted_status: '',
})

const reqDemurrages = ref({
  data: [] as any,
  current_page: 1,
  page: 1,
  perPage: 10,
  last_page: 1,
})

const rowClass = (invoice: any) => {
  if (invoice.deleted_at) {
    return 'bg-red-100! dark:bg-red-900!'
  }
  if (invoice.is_proforma === 1) {
    return 'bg-stone-200'
  }
  return ''
}

const getTotal = (reqDemurrage: any) => {
  return 0
}

const onClickFilters = async () => {
  // set current page to 1
  reqDemurrages.value.current_page = 1
  await getData()
}

const onClickPagination = async (page: number) => {
  reqDemurrages.value.current_page = page
  await getData()
}

const getCurrenciesTotal = (invoice: any) => {
  if (!invoice.invoice_total) return []
  const totales = Object.keys(invoice.invoice_total).map((currency_id: any) => {
    // console.log('currency_id', currency_id)
    // console.log('total', invoice.invoice_total[currency_id])
    const currency = currencies.find((c) => c.id == currency_id)
    return `${currency?.name}: ${formatToCurrency(invoice.invoice_total[currency_id])}`
  })
  return totales
}

const clearFilters = async () => {
  filters.value = {
    from: '',
    to: '',
    id: null,
    lineId: '',
    masterBl: '',
    houseBl: '',
    consigneeId: '',
    freight_forwarder_id: '',
    deleted_status: '',
  }
  await getData()
}

const getInvoicePaidStatus = (reqDemurrage: any) => {
  if (reqDemurrage.deleted_at) {
    return 'Cancelled'
  }
  if (!reqDemurrage.invoice) {
    return 'Pending'
  }
  if (reqDemurrage.invoice?.is_paid) {
    return 'Paid @ ' + formatDateOnlyString(reqDemurrage.invoice.paid_at)
  }
  return 'Pending'
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

const getData = async () => {
  try {
    loadingStore.loading = true
    const response = (await $api.maritimeDemurrages.getPaged({
      query: {
        page: reqDemurrages.value.current_page,
        perPage: reqDemurrages.value.perPage,
        ...flattenArraysToCommaSeparatedString(filters.value),
      },
    })) as any

    reqDemurrages.value = response

    if (response.data.length === 0) {
      snackbar.add({
        type: 'info',
        text: 'No data found',
      })
    }
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const viewReqDemurrage = (reqDemurrage: any) => {
  router.push(`/invoices/search/lines/demurrages/req-pay-view-${reqDemurrage.id}`)
}

await getData()
</script>
