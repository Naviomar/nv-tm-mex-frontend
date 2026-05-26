<template>
  <v-dialog v-model="show" max-width="900">
    <v-card>
      <v-card-title>
        <div class="flex justify-between items-center">
          <div class="flex items-center gap-2">
            <v-icon>mdi-receipt-text-outline</v-icon>
            <div>Line Payment Detail #{{ paymentData?.id }}</div>
          </div>
          <v-btn icon size="small" @click="close">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
      </v-card-title>
      <v-card-text>
        <div v-if="paymentData">
          <!-- Payment Schedule Info -->
          <v-card variant="tonal" color="blue" class="mb-4">
            <v-card-text>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <div class="text-xs text-blue-darken-1 font-semibold mb-1">SCHEDULE ID</div>
                  <div class="font-semibold">#{{ paymentData.id }}</div>
                </div>
                <div>
                  <div class="text-xs text-blue-darken-1 font-semibold mb-1">AMOUNT</div>
                  <div class="font-semibold">{{ getCurrencyName(paymentData.currency_id) }} {{ formatToCurrency(paymentData.amount) }}</div>
                </div>
                <div>
                  <div class="text-xs text-blue-darken-1 font-semibold mb-1">CREATED BY</div>
                  <div class="font-semibold">{{ paymentData.creator?.name }}</div>
                </div>
                <div>
                  <div class="text-xs text-blue-darken-1 font-semibold mb-1">CREATED AT</div>
                  <div class="font-semibold">{{ formatDateString(paymentData.created_at) }}</div>
                </div>
                <div>
                  <div class="text-xs text-blue-darken-1 font-semibold mb-1">SENT AT</div>
                  <div class="font-semibold">{{ paymentData.schedule?.sent_at ? formatDateString(paymentData.schedule.sent_at) : 'Pending' }}</div>
                </div>
                <div>
                  <div class="text-xs text-blue-darken-1 font-semibold mb-1">STATUS</div>
                  <v-chip :color="paidLineSchedule(paymentData).line_paid === 1 ? 'success' : 'warning'" size="small">
                    {{ paidLineSchedule(paymentData).line_paid === 1 ? 'Paid' : 'Pending' }}
                  </v-chip>
                </div>
              </div>
            </v-card-text>
          </v-card>

          <!-- Line Invoice Refs -->
          <div class="font-bold text-base mb-2">Line Invoices Applied</div>
          <v-table density="compact">
            <thead>
              <tr>
                <th class="font-bold!">Folio/Serie</th>
                <th class="font-bold!">Line</th>
                <th class="font-bold!">Amount</th>
                <th class="font-bold!">Invoice Date</th>
                <th class="font-bold!">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(lineInvoiceRef, index) in paymentData.line_invoice_refs" :key="`line-inv-${index}`">
                <td>{{ lineInvoiceRef.line_invoice?.folio }}-{{ lineInvoiceRef.line_invoice?.serie }}</td>
                <td>{{ lineInvoiceRef.line_invoice?.line?.name }}</td>
                <td>{{ getCurrencyName(lineInvoiceRef.currency_id) }} {{ formatToCurrency(lineInvoiceRef.amount) }}</td>
                <td>{{ formatDateOnlyString(lineInvoiceRef.line_invoice?.invoice_date) }}</td>
                <td>
                  <v-chip
                    :color="lineInvoiceRef.invoice?.is_paid === 1 ? 'success' : 'warning'"
                    size="small"
                  >
                    {{ lineInvoiceRef.invoice?.is_paid === 1 ? 'Paid' : 'Pending' }}
                  </v-chip>
                </td>
              </tr>
            </tbody>
          </v-table>

          <!-- Credit Notes Applied -->
          <div v-if="paymentData.line_credit_notes && paymentData.line_credit_notes.length > 0" class="font-bold text-base mb-2 mt-4">
            Credit Notes Applied
          </div>
          <v-table v-if="paymentData.line_credit_notes && paymentData.line_credit_notes.length > 0" density="compact">
            <thead>
              <tr>
                <th class="font-bold!">Folio</th>
                <th class="font-bold!">Amount</th>
                <th class="font-bold!">Available</th>
                <th class="font-bold!">Created At</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(creditNote, index) in paymentData.line_credit_notes" :key="`cn-${index}`">
                <td>{{ creditNote.folio_real }}</td>
                <td>{{ getCurrencyName(creditNote.currency_id) }} {{ formatToCurrency(creditNote.amount) }}</td>
                <td>{{ formatToCurrency(creditNote.amount_available) }}</td>
                <td>{{ formatDateString(creditNote.created_at) }}</td>
              </tr>
            </tbody>
          </v-table>
        </div>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" @click="close">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  paymentData: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['update:modelValue'])

const show = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const close = () => {
  show.value = false
}

const paidLineSchedule = (refSchedule: any) => {
  let data_reference_line = refSchedule.line_invoice_refs
  let is_paid_line = 0
  let array_paid = new Array()

  if (typeof data_reference_line === 'object' && data_reference_line !== 'null') {
    let sizeData = Object.keys(data_reference_line).length

    for (let i = 0; i < sizeData; i++) {
      is_paid_line = data_reference_line[i].invoice.is_paid
      array_paid.push(is_paid_line)
    }
  }

  if (array_paid.includes(0) === true) {
    return { line_paid: 0 }
  } else {
    return { line_paid: 1 }
  }
}
</script>
