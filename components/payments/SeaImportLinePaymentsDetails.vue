<template>
  <div>
    <div class="grid grid-cols-2 gap-2">
      <div>
        <div class="font-bold">Payment schedule</div>
        <v-table density="compact">
          <thead>
            <tr>
              <th class="text-left">Payment</th>
              <th class="text-left">Amount</th>
              <th class="text-left">User</th>
              <th class="text-left">Sent</th>
              <th class="text-left">Created</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(refSchedule, index) in payments.ref_schedules" :key="`pay-data-${index}`">
              <td>
                <v-chip color="warning" size="small">Pending</v-chip>
              </td>
              <td class="whitespace-nowrap">
                {{ getCurrencyName(refSchedule.currency_id) }} {{ formatToCurrency(refSchedule.amount) }}
              </td>
              <td class="whitespace-nowrap">{{ refSchedule.creator?.name }}</td>
              <td>
                <div v-if="refSchedule.schedule.sent_at == null">
                  <v-chip color="warning" size="small">Pending</v-chip>
                </div>
                <div v-if="refSchedule.schedule.sent_at != null">
                  <v-chip color="success" size="small"
                    >Sent @ {{ formatDateString(refSchedule.schedule.sent_at) }}</v-chip
                  >
                </div>
              </td>
              <td class="whitespace-nowrap">{{ formatDateString(refSchedule.created_at) }}</td>
            </tr>
          </tbody>
        </v-table>
      </div>
      <div class="col-span-1">
        <div class="font-bold">Line invoice(s)</div>
        <v-table density="compact">
          <thead>
            <tr>
              <th class="text-left">Link as paid</th>
              <th class="text-left">Folio/Serie</th>
              <th class="text-left">Amount</th>
              <th class="text-left">Credit Notes</th>
              <th class="text-left">Line</th>
              <th class="text-left">Invoice date</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(c, key) in payments.line_invoice_refs" :key="key">
              <td class="p-2">
                <div v-if="c.invoice?.is_paid == 0">
                  <v-chip color="warning" size="small">Pending</v-chip>
                </div>
                <div v-if="c.invoice?.is_paid == 1">
                  <v-chip color="success" size="small">Paid @ {{ formatDateString(c.invoice?.updated_at) }}</v-chip>
                </div>
              </td>
              <td class="p-2">{{ c.line_invoice?.folio }}-{{ c.line_invoice?.serie }}</td>
              <td class="p-2 whitespace-nowrap">
                {{ getCurrencyName(c.currency_id) }} {{ formatToCurrency(c.amount) }}
              </td>
              <td class="p-2 whitespace-nowrap">
                <!-- loop line_credit_notes -->
                <div
                  v-for="(note, index) in c.line_invoice?.line_credit_notes"
                  :key="`line-cn-${index}`"
                  class="grid grid-cols-1 gap-2"
                >
                  <v-btn
                    color="info"
                    size="small"
                    variant="tonal"
                    class="cursor-pointer"
                    @click="viewLineCreditNote(note)"
                  >
                    <v-icon>mdi-open-in-new</v-icon>
                    #{{ note.folio_real }} {{ formatToCurrency(note.amount) }}
                  </v-btn>
                </div>
              </td>
              <td class="p-2 whitespace-nowrap">{{ c.line_invoice?.line?.name }}</td>
              <td class="p-2">
                <UserInfoBadge :item="c.line_invoice">
                  {{ formatDateOnlyString(c.line_invoice?.invoice_date) }}
                </UserInfoBadge>
              </td>
            </tr>
          </tbody>
        </v-table>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
const { $api } = useNuxtApp()
const loadingStore = useLoadingStore()
const router = useRouter()

const props = defineProps({
  referencia: {
    type: Object,
    required: true,
  },
})

const payments = ref<any>({
  ref_schedules: [],
  line_invoice_refs: [],
})

const viewLineCreditNote = (note: any) => {
  // router.push(`/invoices/lines/credit-notes/view-${note.id}`)
  navigateTo(`/invoices/lines/credit-notes/view-${note.id}`, {
    open: {
      target: '_blank',
    },
  })
}

const getReferenciaLinePayments = async () => {
  try {
    loadingStore.loading = true
    const response = await $api.referencias.getLinePaymentsDetail(props.referencia.id)
    payments.value = response
  } catch (e) {
    console.error(e)
  } finally {
    // timeout 1 second
    loadingStore.stop()
  }
}

await getReferenciaLinePayments()
</script>
