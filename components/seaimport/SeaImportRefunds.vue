<template>
  <div>
    <div class="flex justify-between items-center">
      <div class="font-bold">Refunds in service</div>
      <v-btn
        icon="mdi-refresh"
        color="red"
        variant="tonal"
        size="x-small"
        @click="getSeaImportSupplierInvoices"
      ></v-btn>
    </div>
    <v-table density="compact">
      <thead>
        <tr>
          <th class="text-left">Payment</th>
          <th class="text-left">Folio</th>
          <th class="text-left">Beneficiary</th>
          <th class="text-left">Amount</th>
          <th class="text-left">Invoice date</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="refunds.length === 0">
          <td class="p-2 text-center" colspan="5">No refunds linked to service</td>
        </tr>
        <tr v-for="(refund, key) in refunds" :key="key">
          <td class="p-2">
            <v-chip size="small" :color="refund.invoice?.is_paid == 1 ? 'green' : 'red'">{{
              refund.invoice?.is_paid == 1 ? 'Paid' : 'Unpaid'
            }}</v-chip>
          </td>
          <td class="p-2">
            <v-btn size="small" color="lime" variant="outlined" @click="goToReqRefund(refund)">
              <v-icon>mdi-open-in-new</v-icon>
              Req. refund #{{ refund.id }}
            </v-btn>
          </td>
          <td class="p-2">{{ refund.beneficiary?.name }}</td>
          <td class="p-2">{{ getCurrencyName(refund.currency_id) }} {{ formatToCurrency(refund.total_amount) }}</td>
          <td class="p-2">
            <UserInfoBadge :item="refund">
              {{ formatDateOnlyString(refund.created_at) }}
            </UserInfoBadge>
          </td>
        </tr>
      </tbody>
    </v-table>
  </div>
</template>
<script setup lang="ts">
import UserInfoBadge from '../common/UserInfoBadge.vue'

const { $api } = useNuxtApp()
const loadingStore = useLoadingStore()
const router = useRouter()

const props = defineProps({
  referenceId: {
    type: [String, Number],
    required: true,
  },
})

const refunds = ref<any>([])

const goToReqRefund = (refund: any) => {
  router.push(`/refunds/view-${refund.id}`)
}

const getSeaImportSupplierInvoices = async () => {
  try {
    loadingStore.start()
    refunds.value = []
    const response = await $api.referencias.getSeaImportRefunds(props.referenceId.toString())
    refunds.value = response
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

onMounted(async () => {
  await getSeaImportSupplierInvoices()
})
</script>
