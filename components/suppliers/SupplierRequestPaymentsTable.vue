<template>
  <div>
    <div @keyup.enter="onClickFilters">
      <div class="font-bold mb-2">Filters</div>
      <div class="grid grid-cols-4 gap-5">
        <div><v-text-field v-model="filters.id" type="number" density="compact" label="Folio" /></div>
        <div>
          <ASupplierSearch v-model="filters.supplier_id" />
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
        v-model="supReqPayments.current_page"
        :length="supReqPayments.last_page"
        rounded="circle"
        density="compact"
        @update:model-value="onClickPagination"
      ></v-pagination>
      <v-table density="compact" fixed-header height="75vh">
        <thead>
          <tr>
            <th>Actions</th>
            <th>Folio</th>
            <th>Supplier</th>
            <th>Services</th>
            <th>Amount</th>
            <th>Amount paid</th>
            <th>Pay status</th>
            <th>Created at</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(supReqPayment, index) in supReqPayments.data"
            :key="`supReqPayment-${index}`"
            :class="{
              'dark:hover:bg-gray-700 hover:bg-slate-300': true,
              'bg-red-100! dark:bg-red-900!': supReqPayment.deleted_at,
            }"
          >
            <td>
              <div class="flex gap-2">
                <ViewButton :id="supReqPayment.id" @click="viewItem(supReqPayment)" />
                <div v-if="supReqPayment.deleted_at == null">
                  <TrashButton :item="supReqPayment" @click="showFormDelete(supReqPayment)" />
                </div>
              </div>
            </td>
            <td>{{ supReqPayment.id }}</td>
            <td>{{ supReqPayment.supplier?.name }}</td>
            <td>
              <div class="flex flex-col items-center gap-1 py-2">
                <v-chip
                  v-for="(service, i) in getUniqueServices(supReqPayment)"
                  :key="`supReqPayment-payinv-${i}`"
                  density="compact"
                  color="primary"
                >
                  {{ service.reference_number }}
                </v-chip>
              </div>
            </td>
            <td class="whitespace-nowrap">
              {{ formatToCurrency(supReqPayment.amount) }} {{ getCurrencyName(supReqPayment.currency_id) }}
            </td>
            <td class="whitespace-nowrap">{{ formatToCurrency(supReqPayment.invoice?.amount_paid) }}</td>
            <td>
              <div class="flex flex-col items-center gap-1 mb-2">
                <v-chip size="small" :color="supReqPayment.invoice?.is_paid == 1 ? 'green' : 'red'">{{
                  supReqPayment.invoice?.is_paid == 1 ? 'Paid' : 'Unpaid'
                }}</v-chip>

                <InvoiceChargePaymentsView size="x-small" :invoice="supReqPayment.invoice" />
              </div>
            </td>
            <td class="whitespace-nowrap">
              <UserInfoBadge :item="supReqPayment">
                {{ formatDateString(supReqPayment.created_at) }}
              </UserInfoBadge>
            </td>
          </tr>
        </tbody>
      </v-table>
      <v-pagination
        v-model="supReqPayments.current_page"
        :length="supReqPayments.last_page"
        rounded="circle"
        density="compact"
        @update:model-value="onClickPagination"
      ></v-pagination>
    </div>
    <v-dialog v-model="formDelete.show" max-width="500">
      <v-card>
        <v-card-title>
          <span class="text-h5">Cancel supplier request payment #{{ formDelete.supReqPayment?.id }}</span>
        </v-card-title>
        <v-card-text>
          <div class="grid grid-cols-2 gap-4">
            <div class="col-span-2">
              Please confirm the cancellation of the supplier request payment #{{ formDelete.supReqPayment?.id }}
            </div>
            <div class="col-span-2">
              <v-textarea v-model="formDelete.comments" label="Comments" />
            </div>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-btn color="red" @click="closeFormDelete">Close</v-btn>
          <v-btn color="primary" @click="deleteReqSupPayment">Yes, I confirm</v-btn>
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

const filters = ref<any>({
  id: '',
  date_from: '',
  date_to: '',
  supplier_id: '',
})

const formDelete = ref<any>({
  show: false,
  supReqPayment: null,
  comments: '',
})

const supReqPayments = ref({
  data: [] as any,
  current_page: 1,
  page: 1,
  last_page: 1,
})

const showFormDelete = (supReqPayment: any) => {
  formDelete.value.supReqPayment = supReqPayment
  formDelete.value.show = true
}

const closeFormDelete = () => {
  formDelete.value.show = false
  formDelete.value.supReqPayment = null
  formDelete.value.comments = ''
}

const getUniqueServices = (supReqPayment: any) => {
  let services: any = []
  // add reference_number to services array if it doesn't exist
  supReqPayment.pay_invoices?.forEach((payInvoice: any) => {
    if (
      !services.find(
        (service: any) => service.reference_number === payInvoice.supplier_invoice?.referenceable?.reference_number
      )
    ) {
      services.push(payInvoice.supplier_invoice?.referenceable)
    }
  })

  return services
}

const clearFilters = async () => {
  filters.value = {
    id: '',
    date_from: '',
    date_to: '',
    supplier_id: '',
  }
  await getSupReqPayments()
}

const viewItem = (supReqPayment: any) => {
  router.push(`/invoices/suppliers/cfdis/request-payment/view-${supReqPayment.id}`)
}

const onClickPagination = async (page: number) => {
  supReqPayments.value.current_page = page
  await getSupReqPayments()
}

const onClickFilters = async () => {
  // set current page to 1
  supReqPayments.value.current_page = 1
  await getSupReqPayments()
}

const deleteReqSupPayment = async () => {
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
      supplier_req_payment_id: formDelete.value.supReqPayment.id,
    }
    await $api.supplierReqPayments.cancelSupReqPayment(body)
    snackbar.add({
      type: 'success',
      text: 'Supplier request payment deleted successfully',
    })
    closeFormDelete()
    await getSupReqPayments()
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const getSupReqPayments = async () => {
  try {
    loadingStore.start()
    const response = await $api.supplierReqPayments.getPaged({
      query: {
        page: supReqPayments.value.current_page,
        ...flattenArraysToCommaSeparatedString(filters.value),
      },
    })

    supReqPayments.value = response as any
    if (supReqPayments.value.data.length === 0) {
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
  await getSupReqPayments()
})
</script>
