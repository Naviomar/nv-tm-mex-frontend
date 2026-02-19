<template>
  <div>
    <div class="gap-4">
      <div>
        <v-card class="mb-4">
          <v-card-title>
            <div class="font-bold">Freight line invoice #{{ lineInvoice.serie_folio }}</div>
          </v-card-title>
          <v-card-text>
            <div class="grid grid-cols-3">
              <div class="font-bold">Freight line</div>
              <div class="col-span-2 font-bold">{{ lineInvoice.line?.name }}</div>

              <div class="font-bold">Serie</div>
              <div class="col-span-2 font-bold">{{ lineInvoice.serie }}</div>
              <div class="font-bold">Folio</div>
              <div class="col-span-2 font-bold">{{ lineInvoice.folio }}</div>

              <div class="font-bold">Total related MBLs</div>
              <div class="col-span-2">
                <div class="flex gap-4 mb-4">
                  <v-chip color="amber" v-for="(ref, index) in lineInvoice.refs" :key="`ref-${index}`"
                    >{{ ref.referencia?.reference_number }} {{ ref.master_bl?.name }} -
                    {{ formatToCurrency(ref.amount) }}</v-chip
                  >
                </div>
              </div>
              <div class="font-bold">Attachment:</div>
              <div class="col-span-2">
                <ButtonDownloadS3Object :s3Path="lineInvoice.attachment" />
              </div>
              <div>{{ totalNotes }}</div>
            </div>
          </v-card-text>
        </v-card>
      </div>
    </div>
    <div>
      <v-card class="mb-4">
        <v-card-title>
          <div class="font-bold">Linked references</div>
        </v-card-title>
        <v-card-text>
          <v-table density="compact">
            <thead>
              <tr>
                <th class="font-bold">FN #ID</th>
                <th class="font-bold">Reference #</th>
                <th class="font-bold">Master BL</th>
                <th class="font-bold">Type</th>
                <th class="font-bold">Amount</th>
                <th class="font-bold">Payment(s)</th>
                <th class="font-bold">Payment status</th>
                <th class="font-bold">Created at</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(lineInvRef, index) in lineInvoice.refs" :key="`line-inv-ref-${index}`">
                <td>{{ lineInvRef.id }}</td>
                <td>
                  <nuxt-link
                    :to="
                      lineInvRef.referencia?.impoExpo === 'I'
                        ? `/maritime/import/${lineInvRef.referencia?.id}`
                        : `/maritime/export/${lineInvRef.referencia?.id}`
                    "
                    target="_blank"
                    class="underline"
                  >
                    <v-icon>mdi-open-in-new</v-icon>
                    {{ lineInvRef.referencia?.reference_number }}
                  </nuxt-link>
                </td>
                <td>{{ lineInvRef.master_bl?.name }}</td>
                <td>{{ lineInvRef.tm_wm }}</td>
                <td>{{ formatToCurrency(lineInvRef.amount) }}</td>
                <td>
                  <div
                    v-for="(charge, idx) in lineInvRef.invoice?.charges"
                    :key="`line-inv-ref-${index}-charge-${idx}`"
                  >
                    <div v-for="(payment, idx2) in charge.payments" :key="`payment-${index}`">
                      <v-chip color="blue" text-color="white" @click="viewPayment(payment)" class="mb-1"
                        ><v-icon>mdi-eye-outline</v-icon>{{ getPaymentTypeName(payment) }} #{{
                          payment.paymentable_id
                        }}
                        {{ formatToCurrency(payment.amount) }}</v-chip
                      >
                    </div>
                  </div>
                </td>
                <td>
                  <v-chip color="green" text-color="white" v-if="isPaid(lineInvRef)">Paid</v-chip>
                  <v-chip color="red" text-color="white" v-else>Pending</v-chip>
                </td>
                <td>
                  <UserInfoBadge :item="lineInvRef">
                    {{ formatDateString(lineInvRef.created_at) }}
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
import { paymentableName } from '~/utils/data/morphNames'
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
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

const getPaymentTypeName = (payment: any) => {
  return paymentableName(payment)
}

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

  snackbar.add({ type: 'error', text: 'Unknown payment type' })
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
