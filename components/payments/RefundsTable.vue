<template>
  <div>
    <div @keyup.enter="onClickFilters">
      <div class="font-bold mb-2">Filters</div>
      <div class="grid grid-cols-4 gap-5">
        <div><v-text-field v-model="filters.id" type="text" density="compact" label="Folio" /></div>
        <div>
          <ACustomerSearch v-model="filters.customer_id" :allow-deleted="true" />
        </div>
        <div>
          <AGlobalSearch
            :onSearch="searchCustomsAgents"
            v-model="filters.custom_agent_id"
            validate-key="custom_agent_id"
            label="Customs Agent"
            hide-details
          />
        </div>
        <div><v-text-field v-model="filters.date_from" type="date" density="compact" label="Date from" /></div>
        <div><v-text-field v-model="filters.date_to" type="date" density="compact" label="Date to" /></div>
      </div>
      <div class="flex gap-4">
        <v-btn class="" color="secondary" @click="clearFilters"> Clear </v-btn>
        <v-btn color="primary" @click="onClickFilters"> Search </v-btn>
      </div>
    </div>
    <div>
      <v-pagination
        v-model="refunds.current_page"
        :length="refunds.last_page"
        rounded="circle"
        density="compact"
        @update:model-value="onClickPagination"
      ></v-pagination>
      <v-table density="compact">
        <thead>
          <tr>
            <th>Actions</th>
            <th>Folio</th>
            <th>Beneficiary</th>
            <th>Services</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Created at</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(refund, index) in refunds.data"
            :key="`refund-${index}`"
            :class="{
              'dark:hover:bg-gray-700 hover:bg-slate-300': true,
              'bg-red-100! dark:bg-red-900!': refund.deleted_at,
            }"
          >
            <td>
              <div class="flex gap-2">
                <ViewButton :item="refund" @click="viewItem(refund)" />
                <div v-if="refund.deleted_at == null">
                  <TrashButton
                    :item="refund"
                    @click="checkUserAndExecute(refund.created_by, () => showFormDelete(refund))"
                  />
                </div>
              </div>
            </td>
            <td>{{ refund.id }}</td>
            <td>
              {{ refund.beneficiary?.name }}
              <span v-if="refund.beneficiary?.deleted_at"> (Eliminado)</span>
            </td>
            <td>
              <div class="flex flex-col items-center gap-1 py-2">
                <v-chip
                  v-for="(refundPay, i) in refund.refund_payments"
                  :key="`refund-pay-${i}`"
                  density="compact"
                  color="primary"
                >
                  {{ refundPay.payable?.serviceable?.reference_number }}
                </v-chip>
              </div>
            </td>
            <td>{{ getCurrencyName(refund.currency_id) }} {{ formatToCurrency(getTotalRefund(refund)) }}</td>
            <td>
              <div class="flex flex-col items-center gap-1">
                <v-chip size="small" :color="refund.invoice?.is_paid == 1 ? 'green' : 'red'">{{
                  refund.invoice?.is_paid == 1 ? 'Paid' : 'Unpaid'
                }}</v-chip>
                <InvoiceChargePaymentsView :invoice="refund.invoice" />
              </div>
            </td>
            <td class="whitespace-nowrap">
              <UserInfoBadge :item="refund">
                {{ formatDateString(refund.created_at) }}
              </UserInfoBadge>
            </td>
          </tr>
        </tbody>
      </v-table>
      <v-pagination
        v-model="refunds.current_page"
        :length="refunds.last_page"
        rounded="circle"
        density="compact"
        @update:model-value="onClickPagination"
      ></v-pagination>
    </div>
    <v-dialog v-model="formDelete.show" max-width="500">
      <v-card>
        <v-card-title>
          <span class="text-h5">Cancel refund #{{ formDelete.refund?.id }}</span>
        </v-card-title>
        <v-card-text>
          <div class="grid grid-cols-2 gap-4">
            <div class="col-span-2">Please confirm the cancellation of the refund #{{ formDelete.refund?.id }}</div>
            <div class="col-span-2">
              <v-textarea v-model="formDelete.comments" label="Comments" />
            </div>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-btn color="red" @click="closeFormDelete">Close</v-btn>
          <v-btn color="primary" @click="deleteRefund">Yes, I confirm</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script setup lang="ts">
import { deletedStatus } from '@/utils/data/systemData'
const { $api } = useNuxtApp()
const router = useRouter()
const loadingStore = useLoadingStore()
const snackbar = useSnackbar()
const { checkUserAndExecute } = useCheckUser()

const filters = ref<any>({
  id: '',
  year: '',
  referencia: '',
  date_from: '',
  date_to: '',
  customer_id: '',
  custom_agent_id: null,
})

const refunds = ref({
  data: [] as any,
  current_page: 1,
  page: 1,
  last_page: 1,
})

const formDelete = ref<any>({
  show: false,
  refund: null,
  comments: '',
})

const clearFilters = async () => {
  filters.value = {
    id: '',
    year: '',
    date_from: '',
    date_to: '',
    customer_id: '',
    custom_agent_id: null,
  }
  await getRefunds()
}

const searchCustomsAgents = async (params: any) => {
  try {
    const response = await $api.customAgents.searchCustomsAgents({
      query: params,
    })
    return response
  } catch (error) {
    snackbar.add({
      type: 'error',
      text: 'Error fetching customs agents.',
    })
  }
}

const showFormDelete = (refund: any) => {
  formDelete.value.refund = refund
  formDelete.value.show = true
}

const closeFormDelete = () => {
  formDelete.value.show = false
  formDelete.value.refund = null
  formDelete.value.comments = ''
}

const getTotalRefund = (refund: any) => {
  return (
    refund.refund_payments?.reduce((acc: number, curr: any) => {
      return acc + parseFloat(curr.amount)
    }, 0) || 0
  )
}

const viewItem = (reqRefund: any) => {
  router.push(`/refunds/view-${reqRefund.id}`)
}

const onClickFilters = async () => {
  // set current page to 1
  refunds.value.current_page = 1
  await getRefunds()
}

const onClickPagination = async (page: number) => {
  refunds.value.current_page = page
  await getRefunds()
}

const deleteRefund = async () => {
  try {
    if (!formDelete.value.comments) {
      snackbar.add({
        type: 'warning',
        text: 'Please add comments',
      })
      return
    }
    loadingStore.start()
    const body = {
      comments: formDelete.value.comments,
      refund_id: formDelete.value.refund.id,
    }
    await $api.refunds.delete(body)
    snackbar.add({
      type: 'success',
      text: 'Refund deleted successfully',
    })
    closeFormDelete()
    await getRefunds()
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const getRefunds = async () => {
  try {
    loadingStore.start()
    const response = await $api.refunds.getPaged({
      query: {
        page: refunds.value.current_page,
        ...flattenArraysToCommaSeparatedString(filters.value),
      },
    })

    refunds.value = response as any
    if (refunds.value.data.length === 0) {
      snackbar.add({
        type: 'info',
        text: 'No records found',
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

onMounted(async () => {
  await getRefunds()
})
</script>
