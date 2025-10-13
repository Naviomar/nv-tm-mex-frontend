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
          <ACustomerSearch v-model="filters.consigneeId" />
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
        v-model="reqDetentions.current_page"
        :length="reqDetentions.last_page"
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
            v-for="(reqDetention, index) in reqDetentions.data"
            :key="`invoice-${index}`"
            :class="rowClass(reqDetention)"
          >
            <td>
              <ViewButton :item="reqDetention" @click="viewReqDemurrage(reqDetention)" />
            </td>
            <td>{{ reqDetention.id }}</td>
            <td>{{ reqDetention.line?.name }}</td>
            <td>
              <div class="flex flex-col gap-1">
                <v-chip
                  v-for="(reqContainer, index) in reqDetention.containers"
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
                v-for="(reqContainer, index) in reqDetention.containers"
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
                  v-for="(reqContainer, index) in reqDetention.containers"
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
              <div class="text-xs">{{ getInvoicePaidStatus(reqDetention) }}</div>
            </td>

            <td>
              {{
                formatToCurrency(
                  reqDetention.containers.reduce(
                    (acc: any, c: any) => acc + parseFloat(c.amount) + parseFloat(c.amount_iva),
                    0
                  )
                )
              }}
            </td>
            <td>{{ getCurrencyName(reqDetention.currency_id) }}</td>
            <td class="whitespace-nowrap">
              <UserInfoBadge :item="reqDetention">
                <div>{{ formatDateString(reqDetention.created_at) }}</div>
              </UserInfoBadge>
            </td>
          </tr>
        </tbody>
      </v-table>
      <v-pagination
        v-model="reqDetentions.current_page"
        :length="reqDetentions.last_page"
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

const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()
const router = useRouter()

const filters = ref({
  from: '',
  to: '',
  id: null,
  masterBl: '',
  houseBl: '',
  consigneeId: '',
  deleted_status: '',
})

const reqDetentions = ref({
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

const onClickFilters = async () => {
  // set current page to 1
  reqDetentions.value.current_page = 1
  await getData()
}

const onClickPagination = async (page: number) => {
  reqDetentions.value.current_page = page
  await getData()
}

const clearFilters = async () => {
  filters.value = {
    from: '',
    to: '',
    id: null,
    masterBl: '',
    houseBl: '',
    consigneeId: '',
    deleted_status: '',
  }
  await getData()
}

const getInvoicePaidStatus = (reqDetention: any) => {
  if (reqDetention.deleted_at) {
    return 'Cancelled'
  }
  if (!reqDetention.invoice) {
    return 'Pending'
  }
  if (reqDetention.invoice?.is_paid) {
    return 'Paid @ ' + formatDateOnlyString(reqDetention.invoice.paid_at)
  }
  return 'Pending'
}

const getData = async () => {
  try {
    loadingStore.loading = true
    const response = (await $api.maritimeDetentions.getPaged({
      query: {
        page: reqDetentions.value.current_page,
        perPage: reqDetentions.value.perPage,
        ...flattenArraysToCommaSeparatedString(filters.value),
      },
    })) as any

    reqDetentions.value = response

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

const viewReqDemurrage = (reqDetention: any) => {
  router.push(`/invoices/search/lines/detentions/req-pay-view-${reqDetention.id}`)
}

await getData()
</script>
