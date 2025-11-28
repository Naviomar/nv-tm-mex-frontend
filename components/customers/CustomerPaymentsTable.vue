<template>
  <div>
    <v-form @keyup.enter="onClickFilters">
      <div class="mb-4">
        <div class="grid grid-cols-6 gap-4">
          <div class="col-span-2">
            <v-autocomplete
              v-model="filters.chargeId"
              variant="filled"
              density="compact"
              label="Charge"
              :items="catalogs.charges"
              item-title="name"
              item-value="id"
              multiple
            />
          </div>
          <div class="col-span-1">
            <v-text-field
              v-model="filters.bankMovementId"
              variant="filled"
              density="compact"
              label="Bank movement ID"
              type="number"
            />
          </div>
          <div class="col-span-1">
            <v-text-field
              v-model="filters.referenceNumber"
              variant="filled"
              density="compact"
              label="Reference number"
            />
          </div>
          <div class="col-span-1">
            <v-text-field
              v-model="filters.containerNumber"
              variant="filled"
              density="compact"
              label="Container number"
            />
          </div>
          <div class="col-span-1">
            <v-autocomplete
              density="compact"
              label="Status"
              v-model="filters.deleted_status"
              :items="deletedStatus"
              item-title="name"
              item-value="value"
            />
          </div>
        </div>
        <div class="grid grid-cols-1">
          <div class="flex gap-2">
            <v-btn color="secondary" @click="clearFilters"> Clear </v-btn>
            <v-btn color="primary" @click="onClickFilters"> Search </v-btn>
          </div>
        </div>
      </div>
    </v-form>
    <v-card>
      <v-card-text>
        <v-table density="compact">
          <thead>
            <tr>
              <th class="text-left" width="50">Actions</th>
              <th class="text-left"># ID</th>
              <th class="text-left">Reference</th>
              <th class="text-left">Charge</th>
              <th class="text-left">Container</th>
              <th class="text-left">Amount</th>
              <th class="text-left">Payments</th>
              <th class="text-left">Refunded</th>
              <th class="text-left">Created at</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(servicePayment, index) in servicePayments.data"
              :key="`service-payment-${index}`"
              :class="{ 'bg-red-100! dark:bg-red-900!': servicePayment.deleted_at }"
            >
              <td>
                <div class="flex gap-2">
                  <ViewButton :item="servicePayment" @click="viewServicePayment(servicePayment)" />
                  <TrashButton :can-restore="false" :item="servicePayment" @click="showConfirmDelete" />
                </div>
              </td>
              <td>{{ servicePayment.id }}</td>
              <td class="whitespace-nowrap">{{ servicePayment.serviceable?.reference_number }}</td>
              <td>{{ servicePayment.charge?.name }}</td>
              <td>{{ servicePayment.container?.container_number }}</td>

              <td class="whitespace-nowrap text-right">
                {{ getCurrencyName(servicePayment.currency_id) }} {{ formatToCurrency(servicePayment.amount) }}
              </td>
              <td>
                <div v-for="(payment, index) in servicePayment.payments" :key="`payment-${index}`">
                  <PaymentableLabelLink :payment="payment" />
                </div>
              </td>
              <td>
                <div class="flex flex-col gap-2">
                  <template v-if="servicePayment.req_refund_payment">
                    <v-chip
                      :color="servicePayment.req_refund_payment.req_refund.invoice.is_paid ? 'green' : 'red'"
                      size="small"
                    >
                      Refund #{{ servicePayment.req_refund_payment.req_refund_id }} —
                      {{ servicePayment.req_refund_payment.req_refund.invoice.is_paid ? 'Paid' : 'Pending' }}
                    </v-chip>
                  </template>

                  <template v-else>
                    <v-chip color="amber" size="small">Not refunded</v-chip>
                  </template>
                </div>
              </td>

              <td class="whitespace-nowrap">
                <UserInfoBadge :item="servicePayment">
                  {{ formatDateString(servicePayment.created_at) }}
                </UserInfoBadge>
              </td>
            </tr>
          </tbody>
        </v-table>
        <v-pagination
          v-model="servicePayments.current_page"
          :length="servicePayments.last_page"
          rounded="circle"
          density="compact"
          @update:model-value="onClickPagination"
        ></v-pagination>
      </v-card-text>
    </v-card>
  </div>
</template>
<script setup lang="ts">
import { deletedStatus } from '@/utils/data/systemData'
const { $api, $notifications } = useNuxtApp()
const snackbar = useSnackbar()
const confirm = $notifications.useConfirm()
const router = useRouter()
const loadingIndicator = useLoadingIndicator()
const loadingStore = useLoadingStore()
const user = useSanctumUser<any>()

const filters = ref({
  chargeId: null,
  containerNumber: '',
  deleted_status: '',
  bankMovementId: '',
  referenceNumber: '',
})

const catalogs = ref<any>({
  charges: [],
})

const servicePayments = ref<any>({
  data: [],
  current_page: 1,
  page: 1,
  perPage: 10,
  last_page: 1,
})

const onClickPagination = async (page: number) => {
  servicePayments.value.current_page = page
  await getServicePayments()
}

const viewServicePayment = (servicePayment: any) => {
  router.push(`/payments/customers/view-${servicePayment.id}`)
}

const editServicePayment = (servicePayment: any) => {
  router.push(`/payments/customers/edit-${servicePayment.id}`)
}

const showConfirmDelete = async (servicePayment: any) => {
  const result = await confirm({
    title: 'Are you sure?',
    confirmationText: 'Update',
    content: 'Please confirm you want to cancel this customer payment.',
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
      const response = await $api.servicePayments.delete(servicePayment.id)
      snackbar.add({ type: 'success', text: 'Payment cancelled' })
      await getServicePayments()
    } catch (e) {
      console.error(e)
    } finally {
      setTimeout(() => {
        loadingStore.stop()
      }, 250)
    }
  }
}

const onClickFilters = async () => {
  servicePayments.value.current_page = 1
  await getServicePayments()
}

const getServicePayments = async () => {
  try {
    loadingIndicator.start()
    loadingStore.loading = true
    const response = await $api.servicePayments.getPaged({
      query: {
        page: servicePayments.value.current_page,
        perPage: servicePayments.value.perPage,
        ...flattenArraysToCommaSeparatedString(filters.value),
      },
    })

    servicePayments.value = response as any
  } catch (e) {
    console.error(e)
  } finally {
    // timeout 1 second
    setTimeout(() => {
      loadingIndicator.finish()
      loadingStore.loading = false
    }, 200)
  }
}

const clearFilters = async () => {
  filters.value = {
    chargeId: null,
    containerNumber: '',
    deleted_status: '',
    bankMovementId: '',
    referenceNumber: '',
  }
  servicePayments.value.current_page = 1
  await getServicePayments()
}

const getCharges = async () => {
  try {
    loadingStore.start()
    const response = await $api.charges.getAll()
    catalogs.value.charges = response
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

await getCharges()
await getServicePayments()
</script>
