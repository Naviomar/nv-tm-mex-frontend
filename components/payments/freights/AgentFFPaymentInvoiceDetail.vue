<template>
  <div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <v-card class="mb-4">
          <v-card-title>
            <div class="font-bold">Agent F.F. Payment request #{{ ffPayment.id }}</div>
            <div>
              <v-chip :color="isPaid ? 'green' : 'warning'" text-color="white" small class="capitalize">
                {{ isPaid ? "Paid" : "Payment pending" }}
              </v-chip>
            </div>
          </v-card-title>
          <v-card-text>
            <div class="grid grid-cols-2">
              <div class="font-bold">Freight Forwarder</div>
              <div class="font-bold">{{ ffPayment.forwarder?.name }}</div>

              <div>Balance</div>
              <div>{{ formatToCurrency(ffPayment.amount) }}</div>

              <div>Total note(s)</div>
              <div>{{ totalNotes }}</div>
              <div>Sent email</div>
              <div>
                <div v-if="ffPayment.sent_at == null">
                  <v-icon color="orange">mdi-alert</v-icon>
                </div>
                <div v-if="ffPayment.sent_at != null">
                  <v-icon color="green">mdi-check</v-icon>
                  <div>{{ formatDateString(ffPayment.sent_at) }}</div>
                  <div>{{ ffPayment.sent_user?.name }}</div>
                </div>
              </div>
            </div>

            <div class="flex gap-5">
              <v-btn color="primary" size="small" variant="tonal" @click="downloadFfPaymentPdf(ffPayment)"
                ><v-icon>mdi-cloud-download</v-icon> PDF
              </v-btn>

              <v-btn color="primary" size="small" variant="tonal" @click="downloadFfPaymentExel(ffPayment)"
                ><v-icon>mdi-cloud-download</v-icon> Excel
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </div>
    </div>
    <div>
      <v-card class="mb-4">
        <v-card-title>
          <div class="font-bold">F.F. Credit / Debit Notes</div>
        </v-card-title>
        <v-card-text>
          <v-table density="compact">
            <thead>
              <tr>
                <th class="font-bold">ID</th>
                <th class="font-bold">Note #</th>
                <th class="font-bold">Type</th>
                <th class="font-bold">Credit / Debit</th>
                <th class="font-bold">Amount</th>
                <th class="font-bold">Created at</th>
                <th class="font-bold">User</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(notePayment, index) in ffPayment.note_payments" :key="`note-${index}`">
                <td>{{ notePayment.ff_note?.id }}</td>
                <td>{{ notePayment.ff_note?.folio }}</td>
                <td>{{ notePayment.ff_note?.inbound == 1 ? "From agent" : "From TM" }}</td>
                <td>{{ notePayment.ff_note?.type === "C" ? "Credit" : "Debit" }}</td>
                <td>{{ formatToCurrency(notePayment.ff_note?.amount_total) }}</td>
                <td>{{ formatDateString(notePayment.ff_note?.created_at) }}</td>
                <td>{{ notePayment.ff_note?.creator?.name }}</td>
              </tr>
            </tbody>
          </v-table>
        </v-card-text>
      </v-card>

      <v-card class="mb-4">
        <v-card-title>
          <div class="font-bold">Income / Outcome (bank movements)</div>
        </v-card-title>
        <v-card-text>
          <div v-for="(charge, index) in ffPayment.invoice?.charges" :key="`c-${index}`">
            <div v-for="(payment, index2) in charge.payments" :key="`c-${index}-p-${index2}`">
              <v-chip color="blue" text-color="white" small @click="viewPayment(payment)"
                ><v-icon>mdi-eye-outline</v-icon>Payment #{{ payment.id }}
                {{ formatToCurrency(payment.amount) }}</v-chip
              >
            </div>
          </div>
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

const ffPayment = ref<any>({})

const isPaid = computed(() => {
  if (!ffPayment.value?.invoice) {
    return false
  }
  return ffPayment.value?.invoice.is_paid === 1
})

const totalNotes = computed(() => {
  return ffPayment.value.note_payments?.length
})

const viewPayment = (payment: any) => {
  console.log("payment", payment)
  if (payment.paymentable_type.includes("BankMovement")) {
    router.push(`/transfers/global/view-${payment.paymentable_id}?focusPayable=${payment.id}`)
    return
  }
  console.error("Unknown payment type")
}

const downloadFfPaymentPdf = async (ffpayment: any) => {
  try {
    loadingStore.loading = true
    const response = await $api.ffNotes.downloadFfPaymentPdf(ffpayment.id)
    const blob = new Blob([response], { type: "application/pdf" })
    const url = window.URL.createObjectURL(blob)
    window.open(url)
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const downloadFfPaymentExel = async (ffpayment: any) => {
  try {
    loadingStore.loading = true
    const response = await $api.ffNotes.downloadFfPaymentExel(ffpayment.id)
    const blob = new Blob([response], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
    const url = window.URL.createObjectURL(blob)
    window.open(url)
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const getData = async () => {
  try {
    loadingStore.loading = true
    const response = (await $api.ffNotes.getPaymentById(props.id)) as any

    ffPayment.value = response
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
