<template>
  <div>
    <div @keyup.enter="onClickFilters">
      <div class="font-bold mb-2">Filters</div>
      <div class="grid grid-cols-5 gap-5">
        <div><v-text-field v-model="filters.id" type="number" density="compact" label="Folio" /></div>
        <div>
          <ASupplierSearch v-model="filters.supplier_id" />
        </div>
        <div><v-text-field v-model="filters.date_from" type="date" density="compact" label="Date from" /></div>
        <div><v-text-field v-model="filters.date_to" type="date" density="compact" label="Date to" /></div>
        <div>
          <v-autocomplete
            v-model="filters.deleted_status"
            density="compact"
            label="Status"
            :items="deletedStatus"
            item-title="name"
            item-value="value"
            clearable
          />
        </div>
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
              <div class="flex flex-col items-center gap-1">
                <ViewButton :id="supReqPayment.id" @click="viewItem(supReqPayment)" />
                <ProcessAuthorizationWrapper
                  v-if="!supReqPayment.deleted_at"
                  processName="supplier-request-cancel-payment"
                  :requestKey="`${supReqPayment.id}`"
                  label="Request cancellation"
                  :displayName="`Payment Request #${supReqPayment.id}`"
                >
                  <template #auth>
                    <TrashButton :item="supReqPayment" @click="showFormCancelReq(supReqPayment)" />
                  </template>
                </ProcessAuthorizationWrapper>
              </div>
            </td>
            <td>{{ supReqPayment.id }}</td>
            <td>{{ supReqPayment.supplier?.name }}</td>
            <td>
              <div class="flex flex-col items-center gap-1 py-2">
                <v-chip
                  v-for="(service, i) in getUniqueServices(supReqPayment)"
                  :key="`supReqPayment-${index}-service-${i}`"
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
            <td class="whitespace-nowrap">
              <div>{{ formatToCurrency(supReqPayment.invoice?.amount_paid) }}</div>
              <!-- Info de anticipos aplicados -->
              <div v-if="supReqPayment.pay_advances?.length > 0" class="mt-1">
                <v-chip
                  size="x-small"
                  :color="getAdvanceChipColor(supReqPayment)"
                  class="cursor-pointer"
                  @click="viewItem(supReqPayment)"
                >
                  <v-icon size="x-small" class="mr-1">mdi-cash-fast</v-icon>
                  {{ supReqPayment.pay_advances.length }} advance(s)
                </v-chip>
                <div class="text-xs mt-1">
                  <span class="font-semibold">Advances:</span>
                  {{ formatToCurrency(getTotalAdvances(supReqPayment)) }}
                </div>
                <div class="text-xs" :class="getBalanceClass(supReqPayment)">
                  <span class="font-semibold">{{ getBalanceLabel(supReqPayment) }}:</span>
                  {{ formatToCurrency(Math.abs(getPaymentBalance(supReqPayment))) }}
                </div>
              </div>
            </td>
            <td>
              <div class="flex flex-col items-center gap-1 mb-2">
                <v-chip
                  size="small"
                  :color="supReqPayment.deleted_at ? 'grey' : supReqPayment.invoice?.is_paid == 1 ? 'green' : 'red'"
                >
                  {{
                    supReqPayment.deleted_at ? 'Cancelled' : supReqPayment.invoice?.is_paid == 1 ? 'Paid' : 'Unpaid'
                  }}
                </v-chip>

                <InvoiceChargePaymentsView v-if="!supReqPayment.deleted_at" size="x-small" :invoice="supReqPayment.invoice" />
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
    <v-dialog v-model="formCancelReq.show" max-width="500">
      <v-card>
        <v-card-title>
          <span class="text-h5">Cancel payment request #{{ formCancelReq.supReqPayment?.id }}</span>
        </v-card-title>
        <v-card-text>
          <v-alert type="warning" variant="tonal" density="compact" class="mb-4">
            This will permanently cancel this payment request, release all linked invoices and applied advances, and
            mark it as cancelled everywhere (module, PDF). This action cannot be undone.
          </v-alert>
          <v-textarea v-model="formCancelReq.comments" label="Cancellation notes" density="compact" :rows="3" />
        </v-card-text>
        <v-card-actions>
          <v-btn color="red" @click="closeFormCancelReq">Close</v-btn>
          <v-btn color="primary" @click="confirmCancelReq">Cancel request</v-btn>
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
  deleted_status: '',
})

const supReqPayments = ref({
  data: [] as any,
  current_page: 1,
  page: 1,
  last_page: 1,
})

const formCancelReq = ref<any>({
  show: false,
  supReqPayment: null,
  comments: '',
})

const showFormCancelReq = (supReqPayment: any) => {
  formCancelReq.value.supReqPayment = supReqPayment
  formCancelReq.value.comments = ''
  formCancelReq.value.show = true
}

const closeFormCancelReq = () => {
  formCancelReq.value.show = false
  formCancelReq.value.supReqPayment = null
}

const confirmCancelReq = async () => {
  try {
    loadingStore.start()
    await $api.supplierReqPayments.cancelSupReqPayment(formCancelReq.value.supReqPayment.id.toString(), {
      comments: formCancelReq.value.comments,
    })
    snackbar.add({ type: 'success', text: 'Payment request cancelled' })
    closeFormCancelReq()
    await getSupReqPayments()
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const getUniqueServices = (supReqPayment: any) => {
  let services: any = []
  // pay_invoices_all incluye los pivotes con soft-delete (solicitudes canceladas
  // desvinculan sus facturas), pay_invoices solo trae los activos.
  supReqPayment.pay_invoices_all?.forEach((payInvoice: any) => {
    const referenceable = payInvoice.supplier_invoice?.referenceable
    if (
      referenceable &&
      !services.find(
        (service: any) => service.reference_number === referenceable.reference_number
      )
    ) {
      services.push(referenceable)
    }
  })

  return services
}

// Funciones para anticipos aplicados
const getTotalAdvances = (supReqPayment: any) => {
  if (!supReqPayment.pay_advances?.length) return 0
  return supReqPayment.pay_advances.reduce((acc: number, adv: any) => {
    return acc + parseFloat(adv.amount || 0)
  }, 0)
}

const getPaymentBalance = (supReqPayment: any) => {
  const totalAmount = parseFloat(supReqPayment.amount || 0)
  const totalAdvances = getTotalAdvances(supReqPayment)
  return totalAmount - totalAdvances
}

const getAdvanceChipColor = (supReqPayment: any) => {
  const balance = getPaymentBalance(supReqPayment)
  if (balance <= 0) return 'success'
  if (getTotalAdvances(supReqPayment) > 0) return 'info'
  return 'warning'
}

const getBalanceLabel = (supReqPayment: any) => {
  const balance = getPaymentBalance(supReqPayment)
  return balance >= 0 ? 'To pay' : 'In favor'
}

const getBalanceClass = (supReqPayment: any) => {
  const balance = getPaymentBalance(supReqPayment)
  if (balance <= 0) return 'text-green-600'
  return 'text-orange-600'
}

const clearFilters = async () => {
  filters.value = {
    id: '',
    date_from: '',
    date_to: '',
    supplier_id: '',
    deleted_status: '',
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
