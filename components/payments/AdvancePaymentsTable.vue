<template>
  <div>
    <div @keyup.enter="onClickFilters">
      <div class="font-bold mb-2">Filters</div>
      <div class="grid grid-cols-4 gap-5">
        <div><v-text-field v-model="filters.id" type="text" density="compact" label="Folio" /></div>
        <div>
          <ASupplierSearch v-model="filters.supplier_id" />
        </div>
        <div><v-text-field v-model="filters.date_from" type="date" density="compact" label="Date from" /></div>
        <div><v-text-field v-model="filters.date_to" type="date" density="compact" label="Date to" /></div>
      </div>
      <div class="flex gap-4">
        <v-btn class="" color="secondary" @click="clearFilters"> Clear </v-btn>
        <v-btn color="primary" @click="getAdvancePayments"> Search </v-btn>
      </div>
    </div>
    <div>
      <v-pagination
        v-model="advPayments.current_page"
        :length="advPayments.last_page"
        rounded="circle"
        density="compact"
        @update:model-value="onClickPagination"
      ></v-pagination>
      <v-table density="compact">
        <thead>
          <tr>
            <th>Actions</th>
            <th>Folio</th>
            <th>Supplier</th>
            <th>Services linked</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Created at</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(advPayment, index) in advPayments.data"
            :key="`advance-payment-${index}`"
            :class="{
              'dark:hover:bg-gray-700 hover:bg-slate-300': true,
              'bg-red-100! dark:bg-red-900!': advPayment.deleted_at,
            }"
          >
            <td>
              <div class="flex gap-2">
                <ViewButton :item="advPayment" @click="viewItem(advPayment)" />
                <div v-if="advPayment.deleted_at == null">
                  <TrashButton :item="advPayment" @click="showFormDelete(advPayment)" />
                </div>
              </div>
            </td>
            <td>{{ advPayment.id }}</td>
            <td>{{ advPayment.supplier?.name }}</td>
            <td>
              <div class="flex flex-col items-center gap-1 py-2">
                <v-chip
                  v-for="(payService, i) in advPayment.pay_services"
                  :key="`adv-pay-service-${i}`"
                  density="compact"
                  color="primary"
                >
                  {{ payService.serviceable?.reference_number }}
                </v-chip>
              </div>
            </td>
            <td class="whitespace-nowrap">
              {{ getCurrencyName(advPayment.currency_id) }} {{ formatToCurrency(advPayment.amount) }}
            </td>
            <td>
              <div class="flex flex-col items-center gap-1 mb-2">
                <v-chip size="small" :color="advPayment.invoice?.is_paid == 1 ? 'green' : 'red'">{{
                  advPayment.invoice?.is_paid == 1 ? 'Paid' : 'Unpaid'
                }}</v-chip>
                <InvoiceChargePaymentsView size="x-small" :invoice="advPayment.invoice" />
              </div>
            </td>
            <td class="whitespace-nowrap">
              <UserInfoBadge :item="advPayment">
                {{ formatDateString(advPayment.created_at) }}
              </UserInfoBadge>
            </td>
          </tr>
        </tbody>
      </v-table>
      <v-pagination
        v-model="advPayments.current_page"
        :length="advPayments.last_page"
        rounded="circle"
        density="compact"
        @update:model-value="onClickPagination"
      ></v-pagination>
    </div>
    <v-dialog v-model="formDelete.show" max-width="500">
      <v-card>
        <v-card-title>
          <span class="text-h5">Cancel advance payment #{{ formDelete.advPayment?.id }}</span>
        </v-card-title>
        <v-card-text>
          <div class="grid grid-cols-2 gap-4">
            <div class="col-span-2">
              Please confirm the cancellation of the advance payment #{{ formDelete.advPayment?.id }}
            </div>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-btn color="red" @click="closeFormDelete">Close</v-btn>
          <v-btn color="primary" @click="deleteAdvPayment">Yes, I confirm</v-btn>
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
const { checkUserAndNotify } = useCheckUser()

const filters = ref<any>({
  id: null,
  supplier_id: null,
  date_from: null,
  date_to: null,
})

const formDelete = ref<any>({
  show: false,
  advPayment: null,
  comments: '',
})

const advPayments = ref({
  data: [] as any,
  current_page: 1,
  page: 1,
  last_page: 1,
})

const showFormDelete = (advPayment: any) => {
  if (!checkUserAndNotify(advPayment.created_by)) {
    return
  }
  formDelete.value.advPayment = advPayment
  formDelete.value.show = true
}

const closeFormDelete = () => {
  formDelete.value.show = false
  formDelete.value.advPayment = null
  formDelete.value.comments = ''
}

const clearFilters = async () => {
  filters.value = {
    id: null,
    supplier_id: null,
    date_from: null,
    date_to: null,
  }
  advPayments.value.current_page = 1
  await getAdvancePayments()
}

const viewItem = (reqRefund: any) => {
  router.push(`/advance-payments/view-${reqRefund.id}`)
}

const onClickFilters = async () => {
  // set current page to 1
  advPayments.value.current_page = 1
  await getAdvancePayments()
}

const onClickPagination = async (page: number) => {
  advPayments.value.current_page = page
  await getAdvancePayments()
}

const deleteAdvPayment = async () => {
  try {
    loadingStore.start()
    await $api.advancePayments.cancelAdvRequest(formDelete.value.advPayment.id)
    snackbar.add({
      type: 'success',
      text: 'Advance payment cancelled successfully',
    })
    closeFormDelete()
    await getAdvancePayments()
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const getAdvancePayments = async () => {
  try {
    loadingStore.start()
    const response = await $api.advancePayments.getPaged({
      query: {
        page: advPayments.value.current_page,
        ...flattenArraysToCommaSeparatedString(filters.value),
      },
    })

    advPayments.value = response as any
    if (advPayments.value.data.length === 0) {
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

await getAdvancePayments()
</script>
