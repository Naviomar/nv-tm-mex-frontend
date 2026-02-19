<template>
  <div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <v-card class="mb-4">
          <v-card-title>
            <div class="font-bold">Line invoice #{{ lineInvoice.id }}</div>
          </v-card-title>
          <v-card-text>
            <div class="grid grid-cols-2">
              <div class="font-bold">Freight (line)</div>
              <div class="font-bold">{{ lineInvoice.line?.name }}</div>

              <div>Total related MBLs</div>
              <div>{{ totalNotes }}</div>
            </div>
          </v-card-text>
        </v-card>
      </div>
    </div>
    <div>
      <v-card class="mb-4">
        <v-card-title>
          <div class="font-bold">Freight note reference(s)</div>
        </v-card-title>
        <v-card-text>
          <v-table density="compact">
            <thead>
              <tr>
                <th class="font-bold">ID</th>
                <th class="font-bold">Reference #</th>
                <th class="font-bold">Master BL</th>
                <th class="font-bold">Type</th>
                <th class="font-bold">Amount</th>
                <th class="font-bold">Payment(s)</th>
                <th class="font-bold">Payment status</th>
                <th class="font-bold">Created at</th>
                <th class="font-bold">User</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(lineInvRef, index) in lineInvoice.refs" :key="`line-inv-ref-${index}`">
                <td>{{ lineInvRef.id }}</td>
                <td>{{ lineInvRef.referencia?.reference_number }}</td>
                <td>{{ lineInvRef.master_bl?.name }}</td>
                <td>{{ lineInvRef.tm_wm }}</td>
                <td>{{ formatToCurrency(lineInvRef.amount) }}</td>
                <td>
                  <div
                    v-for="(charge, idx) in lineInvRef.invoice?.charges"
                    :key="`line-inv-ref-${index}-charge-${idx}`"
                  >
                    <div v-for="(payment, idx2) in charge.payments" :key="`payment-${index}`">
                      <v-chip color="blue" text-color="white" small @click="viewPayment(payment)" class="mb-1"
                        ><v-icon>mdi-eye-outline</v-icon>Payment #{{ payment.id }}
                        {{ formatToCurrency(payment.amount) }}</v-chip
                      >
                    </div>
                  </div>
                </td>
                <td>
                  <v-chip color="green" text-color="white" v-if="isPaid(lineInvRef)">Paid</v-chip>
                  <v-chip color="red" text-color="white" v-else>Pending</v-chip>
                </td>
                <td>{{ formatDateString(lineInvRef.created_at) }}</td>
                <td>{{ lineInvRef.creator?.name }}</td>
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

const lineInvoice = ref<any>({})

const isPaid = (lineInvRef: any) => {
  return lineInvRef.invoice?.is_paid === 1
}

const totalNotes = computed(() => {
  return lineInvoice.value.note_payments?.length
})

const viewPayment = (payment: any) => {
  console.log('payment', payment)
  if (payment.paymentable_type.includes('BankMovement')) {
    router.push(`/transfers/global/view-${payment.paymentable_id}?focusPayable=${payment.id}`)
    return
  }
  if (payment.paymentable_type.includes('ConsigneeCreditNote') || 
      (payment.paymentable_type.includes('CreditNote') && !payment.paymentable_type.includes('LineCreditNote'))) {
    router.push(`/invoices/search/credit-notes/view-${payment.paymentable_id}`)
    return
  }
  console.error('Unknown payment type')
}

const getData = async () => {
  try {
    loadingStore.loading = true
    const response = (await $api.linePayments.getLineInvoiceById(props.id)) as any

    lineInvoice.value = response
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
