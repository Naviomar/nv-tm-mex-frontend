<template>
  <div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <v-card class="mb-4">
          <v-card-title>
            <div class="font-bold">Customer Payment #{{ servicePayment.id }}</div>
          </v-card-title>
          <v-card-text>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div class="font-bold">Payment Type</div>
              <div class="font-bold">
                <v-chip v-if="servicePayment.serviceable_type" color="primary" size="small">
                  Service Payment
                </v-chip>
                <v-chip v-else color="orange" size="small">
                  Free Format
                </v-chip>
              </div>

              <div v-if="servicePayment.serviceable_type" class="font-bold">Reference linked</div>
              <div v-if="servicePayment.serviceable_type" class="font-bold">{{ servicePayment.serviceable?.reference_number }}</div>

              <div v-if="!servicePayment.serviceable_type" class="font-bold">Owner</div>
              <div v-if="!servicePayment.serviceable_type" class="font-bold">
                <span v-if="servicePayment.customer_id">
                  Customer: {{ servicePayment.customer?.name }}
                </span>
                <span v-if="servicePayment.custom_agent_id">
                  Customs Agent: {{ servicePayment.custom_agent?.name }}
                </span>
                <span v-if="servicePayment.beneficiary_id">
                  Beneficiary: {{ servicePayment.beneficiary?.name }}
                </span>
              </div>

              <div>Charge</div>
              <div>{{ servicePayment.charge?.name }}</div>

              <div v-if="servicePayment.container">Container</div>
              <div v-if="servicePayment.container">{{ servicePayment.container?.container_number }}</div>

              <div>Amount $</div>
              <div>{{ getCurrencyName(servicePayment.currency_id) }} {{ formatToCurrency(servicePayment.amount) }}</div>
            </div>
          </v-card-text>
        </v-card>
      </div>
    </div>
    <div>
      <v-card class="mb-4">
        <v-card-title>
          <div class="font-bold">Payments</div>
        </v-card-title>
        <v-card-text>
          <v-table density="compact">
            <thead>
              <tr>
                <th class="font-bold">Payment #</th>
                <th class="font-bold"></th>
                <th class="font-bold">Created at</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(payment, index) in servicePayment.payments" :key="`payment-${index}`">
                <td>{{ payment.id }}</td>
                <td>
                  <PaymentableLabelLink :payment="payment" />
                </td>
                <td>
                  <UserInfoBadge :item="payment">
                    {{ formatDateString(payment.created_at) }}
                  </UserInfoBadge>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>
<script setup lang="ts">
const { $api } = useNuxtApp()
const loadingStore = useLoadingStore()
const router = useRouter()

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
})

const servicePayment = ref<any>({})

const isPaid = (lineInvRef: any) => {
  return lineInvRef.invoice?.is_paid === 1
}

const getData = async () => {
  try {
    loadingStore.loading = true
    const response = (await $api.servicePayments.getById(props.id)) as any

    servicePayment.value = response
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

await getData()
</script>
