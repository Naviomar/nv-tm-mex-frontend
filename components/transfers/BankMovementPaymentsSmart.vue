<template>
  <div>
    <div v-if="!bankMovement.id" class="flex justify-center py-12">
      <v-progress-circular indeterminate color="primary" />
    </div>
    <v-card v-else class="py-4">
      <div class="grid grid-cols-1 md:grid-cols-12 gap-2">
        <div class="col-span-1 md:col-span-3">
          <h1 class="text-xl font-bold mx-2">Pay invoices using</h1>
          <div class="max-w-xs mx-auto bg-white rounded-lg shadow-md overflow-hidden mt-2">
            <div class="bg-gray-100 px-4 py-2">
              <h2 class="text-lg font-medium text-gray-800">Bank movement #{{ bankMovement.id }}</h2>
            </div>
            <div class="px-4 py-5 sm:p-6">
              <div class="flex flex-col items-start justify-between mb-2">
                <span class="text-sm font-medium text-gray-600">Bank</span>
                <span class="text-lg font-medium text-gray-800"
                  >{{ bankMovement.bank_account?.bank_name }} ({{ bankMovement.bank_account?.currency?.code }})</span
                >
              </div>
              <div class="flex flex-row items-center justify-between mb-4">
                <div class="flex flex-col items-start">
                  <span class="text-sm font-medium text-gray-600">Acct number</span>
                  <span class="text-lg font-medium text-gray-800">{{ bankMovement.bank_account?.account_number }}</span>
                </div>
                <div class="flex flex-col items-start">
                  <span class="text-sm font-medium text-gray-600">In/Out</span>
                  <span
                    :class="{
                      'text-base text-gray-800 italic': true,
                      'text-green-700': movementType === 'deposit',
                      'text-red-700': movementType === 'withdrawal',
                    }"
                  >
                    {{ movementType }}
                  </span>
                </div>
              </div>
              <div class="flex flex-row items-center justify-between mb-4">
                <div class="flex flex-col items-start">
                  <span class="text-sm font-medium text-gray-600">Movement date</span>
                  <span class="text-lg font-medium text-gray-800">{{
                    formatDateOnlyString(bankMovement.movement_date)
                  }}</span>
                </div>
                <div class="flex flex-col items-start">
                  <span class="text-sm font-medium text-gray-600">Type</span>
                  <span class="text-base text-gray-800 italic">
                    {{ bankMovement.movement_type?.name }}
                  </span>
                </div>
              </div>
              <div class="flex flex-row items-center justify-between">
                <div class="flex flex-col items-start">
                  <span class="text-sm font-medium text-gray-600">Amount</span>
                  <span class="text-lg font-medium text-gray-800">{{ formatToCurrency(bankMovement.amount) }}</span>
                </div>
                <div class="flex flex-col items-start">
                  <span class="text-sm font-medium text-gray-600">Available Balance</span>
                  <span
                    class="text-lg font-bold text-gray-800 bg-green-200/50 border-dashed border-2 px-1 border-green-700"
                    >{{ formatToCurrency(bankMovement.amount_available) }}</span
                  >
                </div>
              </div>
              <div class="flex flex-col items-center justify-end bg-slate-100">
                <span class="text-sm font-medium text-gray-600">Used</span>
                <span class="text-lg font-medium text-gray-800">{{
                  formatToCurrency(bankMovement.amount - bankMovement.amount_available)
                }}</span>
              </div>
              <div class="flex flex-col items-center justify-end bg-slate-200">
                <span class="text-sm font-medium text-gray-600">Amount to Pay</span>
                <span class="text-lg font-medium text-gray-800">{{ formatToCurrency(amountToPayTotal) }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="col-span-1 md:col-span-9">
          <v-card class="mb-4">
            <v-card-title>
              <div class="flex justify-between">
                <div class="flex items-center gap-2">
                  <v-icon size="x-small">mdi-receipt-text-outline</v-icon>
                  <div>Existing payments</div>
                </div>
                <div>
                  <v-btn icon size="x-small" @click="showPayments = !showPayments" color="blue-grey-darken-2">
                    <v-icon v-if="showPayments">mdi-eye-outline</v-icon>
                    <v-icon v-if="!showPayments">mdi-eye-closed</v-icon>
                  </v-btn>
                </div>
              </div>
            </v-card-title>
            <v-card-text v-if="showPayments">
              <v-table density="compact" fixed-header min-height="50vh">
                <thead>
                  <tr>
                    <th class="w-20">Actions</th>
                    <th class="font-bold!">Invoice #</th>
                    <th class="font-bold!">Reference</th>
                    <th class="font-bold!">Concept</th>
                    <th class="font-bold!">Amount</th>
                    <th class="font-bold!">Paid</th>
                    <th class="font-bold!">Pending</th>
                    <th class="font-bold!">Status</th>
                    <th class="font-bold!">Date</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(payment, index) in bankMovement.all_payments"
                    :key="`inv-${index}`"
                    :id="`payment-${payment.id}`"
                    :class="{ 'bg-red-100! dark:bg-red-900!': payment.deleted_at }"
                  >
                    <td>
                      <ProcessAuthorizationWrapper
                        v-if="!payment.deleted_at && !hasBankMovAmountAvailable && !hasAssociatedRefund(payment)"
                        processName="bank-movement-payment-delete"
                        :requestKey="`${bankMovement.id}:${payment.id}`"
                        label="Undo payment"
                        :displayName="`Bank Mov. #${bankMovement.id} / Payment #${payment.id}`"
                      >
                        <template #auth>
                          <TrashButton :item="payment" @click="confirmDeletePayment(payment)" :can-restore="false" />
                        </template>
                      </ProcessAuthorizationWrapper>
                      <div v-if="hasBankMovAmountAvailable && !hasAssociatedRefund(payment)">
                        <TrashButton
                          :item="payment"
                          @click="confirmDeletePayment(payment, true)"
                          :can-restore="false"
                        />
                      </div>
                      <v-chip
                        v-if="hasAssociatedRefund(payment)"
                        color="orange"
                        size="x-small"
                        class="mt-1"
                      >
                        Has Refund
                      </v-chip>
                    </td>
                    <td>
                      <template v-if="payment.chargeable_type?.includes('Payable')">
                        <v-chip size="small" color="orange-darken-2">
                          {{ getPaymentChargeableName(payment) }}
                        </v-chip>
                        <InvoiceableLabelLink v-if="getLinkedInvoiceCharge(payment)" :paymentChargeable="getLinkedInvoiceCharge(payment)" />
                      </template>
                      <InvoiceableLabelLink v-else :paymentChargeable="payment.chargeable" />
                    </td>
                    <td>
                      <template v-if="payment.chargeable_type?.includes('Payable')">
                        {{ getLinkedInvoiceCharge(payment)?.serviceable?.reference_number || '—' }}
                      </template>
                      <template v-else>
                        {{ payment.chargeable?.serviceable?.reference_number }}
                      </template>
                    </td>
                    <td>
                      <template v-if="payment.chargeable_type?.includes('Payable')">
                        {{ getLinkedInvoiceCharge(payment)?.charge?.name || getPaymentChargeableName(payment) }}
                      </template>
                      <template v-else>
                        {{ getPaymentChargeableName(payment) }}
                      </template>
                    </td>
                    <td>
                      <template v-if="payment.chargeable_type?.includes('Payable') && getLinkedInvoiceCharge(payment)">
                        {{ formatToCurrency(parseFloat(getLinkedInvoiceCharge(payment).amount) + parseFloat(getLinkedInvoiceCharge(payment).amount_iva) || 0) }}
                      </template>
                      <template v-else-if="!payment.chargeable_type?.includes('Payable')">
                        {{ formatToCurrency(payment.chargeable?.amount + payment.chargeable?.amount_iva || 0) }}
                      </template>
                      <template v-else>—</template>
                    </td>
                    <td>{{ formatToCurrency(payment.amount) }}</td>
                    <td>
                      <template v-if="payment.chargeable_type?.includes('Payable') && getLinkedInvoiceCharge(payment)">
                        {{ formatToCurrency(getLinkedInvoiceCharge(payment).pending_balance) }}
                      </template>
                      <template v-else-if="!payment.chargeable_type?.includes('Payable')">
                        {{ formatToCurrency(payment.chargeable?.pending_balance) }}
                      </template>
                      <template v-else>—</template>
                    </td>
                    <td>
                      <div v-if="!payment.deleted_at">
                        <template v-if="payment.chargeable_type?.includes('Payable') && getLinkedInvoiceCharge(payment)">
                          <v-chip
                            :color="getLinkedInvoiceCharge(payment).pending_balance > 0 ? 'red' : 'green'"
                            text-color="white"
                            small
                            class="capitalize"
                          >
                            {{ getLinkedInvoiceCharge(payment).pending_balance > 0 ? 'Pending' : 'Paid' }}
                          </v-chip>
                          <v-chip color="orange-darken-2" size="x-small" class="ml-1">{{ getPaymentChargeableName(payment) }}</v-chip>
                        </template>
                        <v-chip
                          v-else-if="!payment.chargeable_type?.includes('Payable')"
                          :color="payment.chargeable?.pending_balance > 0 ? 'red' : 'green'"
                          text-color="white"
                          small
                          class="capitalize"
                        >
                          {{ payment.chargeable?.pending_balance > 0 ? 'Pending' : 'Paid' }}
                        </v-chip>
                        <v-chip v-else color="orange-darken-2" size="small">{{ getPaymentChargeableName(payment) }}</v-chip>
                      </div>
                    </td>
                    <td class="whitespace-nowrap">
                      <UserInfoBadge :item="payment">
                        {{ formatDateString(payment.created_at) }}
                      </UserInfoBadge>
                    </td>
                  </tr>
                </tbody>
              </v-table>
            </v-card-text>
          </v-card>

          <v-card v-if="showCommissionSection" color="orange-lighten-5" class="mb-4">
            <v-card-title>
              <div class="flex items-center gap-2">
                <v-icon size="x-small">mdi-percent-outline</v-icon>
                <div>{{ movementType === 'deposit' ? 'Apply commission / retention to invoice' : 'Apply remaining balance to commission' }}</div>
              </div>
            </v-card-title>
            <v-card-text>
              <template v-if="movementType === 'withdrawal'">
                <div class="flex items-center gap-4">
                  <div>
                    <span class="text-sm text-gray-600">Available balance: </span>
                    <span class="font-bold">{{ formatToCurrency(bankMovement.amount_available) }}</span>
                  </div>
                  <v-btn
                    color="orange-darken-2"
                    :loading="loadingStore.loading"
                    @click="confirmApplyCommission"
                  >
                    Apply {{ formatToCurrency(bankMovement.amount_available) }} to commission
                  </v-btn>
                </div>
              </template>
              <template v-if="movementType === 'deposit'">
                <v-alert density="compact" type="info" variant="tonal" class="mb-4">
                  <template v-slot:text>
                    <div class="text-sm">
                      Apply commission ($0.01 - $100) and/or retention (1% - 10%) to invoices with pending balance in range.
                    </div>
                  </template>
                </v-alert>
                <div v-for="payment in eligibleChargesForCommission" :key="`comm-${payment.id}`" class="mb-4 border rounded pa-3">
                  <div class="flex items-center gap-4 mb-2">
                    <InvoiceableLabelLink :paymentChargeable="payment.chargeable" />
                    <span class="text-sm text-gray-600">{{ payment.chargeable?.charge?.name }}</span>
                    <v-chip size="small" color="red">Pending: {{ formatToCurrency(payment.chargeable?.pending_balance) }}</v-chip>
                  </div>
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <v-text-field
                      v-model.number="commissionForm[payment.id].commission_amount"
                      type="number"
                      density="compact"
                      label="Commission amount (USD)"
                      :rules="[
                        (v: any) => !v || (v >= 0.01 && v <= 100) || 'Must be $0.01 - $100',
                        (v: any) => !v || v <= payment.chargeable?.pending_balance || 'Exceeds pending balance'
                      ]"
                      min="0.01"
                      :max="Math.min(100, payment.chargeable?.pending_balance || 100)"
                      step="0.01"
                    />
                    <v-text-field
                      v-model.number="commissionForm[payment.id].retention_percentage"
                      type="number"
                      density="compact"
                      label="Retention % (1-10)"
                      :rules="[
                        (v: any) => !v || (v >= 1 && v <= 10) || 'Must be 1% - 10%',
                        () => getCommissionTotal(payment) <= payment.chargeable?.pending_balance || 'Commission + Retention exceeds pending balance'
                      ]"
                      min="1"
                      max="10"
                      step="1"
                    />
                    <div class="flex flex-col gap-1">
                      <div v-if="commissionForm[payment.id].retention_percentage" class="text-sm">
                        Retention: {{ formatToCurrency(getInvoiceTotal(payment) * (commissionForm[payment.id].retention_percentage / 100)) }}
                        <span class="text-gray-500">({{ commissionForm[payment.id].retention_percentage }}% of invoice total {{ formatToCurrency(getInvoiceTotal(payment)) }})</span>
                      </div>
                      <div class="text-sm font-bold" :class="getCommissionTotal(payment) > payment.chargeable?.pending_balance ? 'text-red-600' : 'text-green-700'">
                        Total: {{ formatToCurrency(getCommissionTotal(payment)) }} / {{ formatToCurrency(payment.chargeable?.pending_balance) }}
                      </div>
                      <v-btn
                        color="orange-darken-2"
                        size="small"
                        :loading="loadingStore.loading"
                        :disabled="!isCommissionFormValid(payment)"
                        @click="confirmApplyCommissionRetention(payment)"
                      >
                        Apply
                      </v-btn>
                    </div>
                  </div>
                </div>
              </template>
            </v-card-text>
          </v-card>

          <v-card v-if="hasBankMovAmountAvailable" color="blue-grey-lighten-5" class="mb-4">
            <v-card-title>
              <div class="flex justify-between">
                <div class="flex items-center gap-2">
                  <v-icon size="x-small">mdi-receipt-text-plus-outline</v-icon>
                  <div>Search & pay service invoice(s)</div>
                </div>
              </div>
            </v-card-title>
            <v-card-text>
              <!-- // Posiblemente se necesite un componente para buscar y pagar facturas -->
              <v-alert
                v-if="movementType === 'deposit'"
                density="compact"
                type="info"
                variant="tonal"
                class="mb-4"
              >
                <template v-slot:text>
                  <div class="text-sm">
                    <strong>Tip:</strong> 
                    <span >
                      You can search directly by invoice number without selecting an invoice type. 
                      The system will search across all applicable invoice and request types.
                    </span>
                  </div>
                </template>
              </v-alert>
              <div class="mb-4">
                <div class="grid grid-cols-1 gap-4">
                  <v-autocomplete
                    v-model="filters.typeInvoice"
                    :items="typeInvoicesByMovementType"
                    density="compact"
                    item-title="name"
                    item-value="class_name"
                    :label="movementType === 'withdrawal' ? 'Invoice type (required)' : 'Invoice type (optional)'"
                    :rules="movementType === 'withdrawal' ? [(v: any) => !!v || 'Invoice type is required for withdrawals'] : []"
                    @update:model-value="clearSearchInvoices"
                    :clearable="movementType === 'deposit'"
                    :placeholder="movementType === 'deposit' ? 'All types will be searched if not selected' : ''"
                  >
                    <template v-slot:no-data>
                      <v-list-item>
                        <v-list-item-title>No types available</v-list-item-title>
                      </v-list-item>
                    </template>
                  </v-autocomplete>
                  <div v-if="isPayBlSchedule">
                    <v-btn color="purple" @click="goToModule(bankMovement.id)">Go to payment BL</v-btn>
                  </div>
                  <div v-if="!isPayBlSchedule">
                    <span class="text-sm">{{ searchFieldHint }}</span>
                    <v-text-field
                      v-model="filters.invoiceNumber"
                      density="compact"
                      :label="searchFieldLabel"
                      @keyup.enter="addInvoiceToSearch"
                    />
                  </div>
                </div>
                <div v-if="filters.invoices.length > 0">
                  <div>Search by</div>
                  <div>
                    <v-chip
                      v-for="(invoiceNum, index) in filters.invoices"
                      :key="`inv-${invoiceNum}`"
                      closable
                      class="mr-2 mb-2"
                      @click:close="removeInvoiceToSearch(index)"
                    >
                      {{ invoiceNum }}
                    </v-chip>
                  </div>
                  <div class="flex gap-2 mt-4">
                    <v-btn color="secondary" @click="clearSearchInvoices">Clear</v-btn>
                    <v-btn color="primary" :loading="loadingStore.loading" @click="searchInvoices">
                      {{ searchButtonText }}
                    </v-btn>
                  </div>
                </div>
              </div>

              <v-alert
                v-if="invoicesFound.length > 0 && invoicesFoundSelected.length <= 0"
                density="compact"
                variant="outlined"
                type="info"
                dense
              >
                Add invoice(s) to pay it using the bank movement
              </v-alert>
              <div v-if="invoicesFound.length > 0" class="py-4">
                <div class="my-2 flex items-center gap-4">
                  📌 Found invoice(s)
                  <v-btn
                    color="secondary"
                    size="small"
                    :loading="loadingStore.loading"
                    @click="addInvoiceToPayBulk(invoicesFound)"
                    >Add all unpaid invoices to pay</v-btn
                  >
                </div>
                <v-chip
                  v-for="(invoice, index) in invoicesFound"
                  :key="`inv-found-${index}`"
                  color="green-darken-4"
                  class="mr-2 mb-2"
                  append-icon="mdi-plus"
                  @click="addInvoiceToPay(invoice)"
                >
                  {{ getInvoiceableName(invoice) }} #{{ getInvoiceableGlobalNumberId(invoice) }}
                </v-chip>
              </div>
              <div v-if="invoicesFoundSelected.length > 0" class="py-4">
                <div class="font-bold text-lg">Invoice(s) added to pay</div>
                <div v-for="(invoiceToPay, index) in invoicesFoundSelected" :key="`inv-selected-${index}`" class="my-2">
                  <v-table density="compact" fixed-header>
                    <thead>
                      <tr>
                        <th class="font-bold! w-4">Actions</th>
                        <th class="font-bold!">Invoice #</th>
                        <th class="font-bold!">Charge</th>
                        <th class="font-bold!">Amount</th>
                        <th class="font-bold!">Pending balance</th>
                        <th class="font-bold!">Pay amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="(charge, index2) in invoiceToPay.charges"
                        :key="`inv-selected-${index}-charge-${index2}`"
                      >
                        <td>
                          <v-btn
                            color="red"
                            size="x-small"
                            icon="mdi-close"
                            class="cursor-pointer"
                            @click="removeChargeToInvoiceToPay(invoiceToPay, index, index2)"
                          >
                          </v-btn>
                        </td>
                        <td>
                          {{ getInvoiceableName(invoiceToPay) }} #{{ getInvoiceableGlobalNumberId(invoiceToPay) }}
                        </td>
                        <td>{{ charge.charge?.name }}</td>
                        <td>{{ formatToCurrency(parseFloat(charge.amount) + parseFloat(charge.amount_iva)) }}</td>
                        <td>{{ formatToCurrency(charge.pending_balance) }}</td>
                        <td>
                          <v-text-field
                            v-model="charge.amount_to_pay"
                            type="number"
                            density="compact"
                            :rules="[(v : any) => !!v || 'Amount is required']"
                            @update:model-value="checkMaxAmountToPay($event, charge)"
                          />
                        </td>
                      </tr>
                    </tbody>
                  </v-table>
                </div>
                <v-btn color="primary" :loading="loadingStore.loading" @click="payInvoices"
                  >Set payment to invoice(s) {{ formatToCurrency(amountToPayTotal) }}</v-btn
                >
              </div>

            </v-card-text>
          </v-card>

        </div>
      </div>
    </v-card>
  </div>
</template>
<script setup lang="ts">
import { typeInvoices } from '~/utils/data/systemData'
const { $api, $notifications } = useNuxtApp()
const confirm = $notifications.useConfirm()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()
const router = useRouter()
const route = useRoute()

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
})

const bankMovement = ref<any>({})
const showPayments = ref(true)

const getBankMovement = async () => {
  try {
    loadingStore.start()
    const response: any = await $api.bankMovements.getMovement(props.id)
    bankMovement.value = response
  } catch (error) {
    console.error(error)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const getInvoiceType = (payment: any) => {
  return getInvoiceableName(payment.chargeable?.invoice || {})
}

const getLinkedInvoiceCharge = (payment: any) => {
  if (!payment.chargeable_type?.includes('Payable')) return null
  const payable = payment.chargeable
  if (!payable?.payments?.length) return null
  const linkedPayment = payable.payments.find((p: any) => p.chargeable_type?.includes('InvoiceCharge'))
  return linkedPayment?.chargeable || null
}

onMounted(async () => {
  await getBankMovement()

  const focusPayahbleId = route.query.focusPayable
  if (focusPayahbleId) {
    const el = document.getElementById(`payable-${focusPayahbleId}`)
    if (el) {
      // add blink class
      el.classList.add('animate-pulse')
      el.classList.add('bg-blue-100')
      setTimeout(() => {
        el.classList.remove('animate-pulse')
        el.classList.remove('bg-blue-100')
      }, 15000)
    }
  }
})

const invoicesFound = ref<any>([])
const invoicesFoundSelected = ref<any>([])

const filters = ref<any>({
  typeInvoice: null,
  invoiceNumber: '',
  invoices: [],
})

const movementType = computed(() => bankMovement.value?.type?.trim() ?? '')

const typeInvoicesByMovementType = computed(() => {
  if (!bankMovement.value?.id) return []
  if (movementType.value === 'deposit') {
    return typeInvoices.filter((type: any) => type.deposit)
  }
  if (movementType.value === 'withdrawal') {
    return typeInvoices.filter((type: any) => type.withdrawal)
  }
  return []
})

const isInvoiceBasedType = computed(() => {
  const invoiceTypes = ['InvoiceSeaTm', 'InvoiceSeaWm', 'InvoiceAirTm', 'InvoiceAirWm', 'PartyInvoice']
  return invoiceTypes.includes(filters.value.typeInvoice)
})

const isRequestBasedType = computed(() => {
  const requestTypes = ['FfPayment', 'SupplierReqPayment', 'ReqAdvancePayment', 'ReqRefund', 'ReqDemurrage', 'ReqDetention']
  return requestTypes.includes(filters.value.typeInvoice)
})

const searchFieldLabel = computed(() => {
  if (!filters.value.typeInvoice && movementType.value === 'deposit') {
    return 'Add invoice/request numbers to search (all types)'
  }
  
  if (!filters.value.typeInvoice) return 'Add invoice/request numbers to search'
  
  if (isInvoiceBasedType.value) {
    return 'Add invoice numbers to search'
  }
  
  if (isRequestBasedType.value) {
    const labels: Record<string, string> = {
      'FfPayment': 'Add F.F. payment request ID/folio',
      'SupplierReqPayment': 'Add supplier request payment folio',
      'ReqAdvancePayment': 'Add advance payment request folio',
      'ReqRefund': 'Add refund request folio',
      'ReqDemurrage': 'Add demurrage request folio',
      'ReqDetention': 'Add detention request folio'
    }
    return labels[filters.value.typeInvoice] || 'Add request folio'
  }
  
  return 'Add numbers to search'
})

const searchFieldHint = computed(() => {
  if (!filters.value.typeInvoice && movementType.value === 'deposit') {
    return 'Press ENTER to add numbers to search (all invoice/request types)'
  }
  
  if (!filters.value.typeInvoice) return 'Press ENTER to add numbers to search'
  
  if (isInvoiceBasedType.value) {
    return 'Press ENTER to add the invoice number to search'
  }
  
  if (isRequestBasedType.value) {
    return 'Press ENTER to add the request ID/folio to search'
  }
  
  return 'Press ENTER to add numbers to search'
})

const searchButtonText = computed(() => {
  if (!filters.value.typeInvoice && movementType.value === 'deposit') {
    return 'Search all invoice/request types'
  }
  
  if (!filters.value.typeInvoice) return 'Search'
  
  if (isInvoiceBasedType.value) {
    return 'Search invoice(s)'
  }
  
  if (isRequestBasedType.value) {
    return 'Search request(s)'
  }
  
  return 'Search'
})

const addInvoiceToSearch = () => {
  if (filters.value.invoiceNumber) {
    // split by comma and remove empty spaces
    const refs = Array.from(
      new Set(
        filters.value.invoiceNumber
          .split(/,|;|\n|\s/)
          .filter(Boolean)
          .map((bl: string) => bl.trim())
      )
    )
    // remove duplicates in refs array using set

    refs.forEach((ref) => {
      filters.value.invoices.push(ref)
    })
    filters.value.invoices = [...new Set(filters.value.invoices)]
    filters.value.invoiceNumber = ''
  }
}

const removeInvoiceToSearch = (index: number) => {
  filters.value.invoices?.splice(index, 1)
}

const clearSearchInvoices = () => {
  filters.value.invoices = []
  invoicesFoundSelected.value = []
  invoicesFound.value = []
}

const addInvoiceToPay = (invoice: any) => {
  if (invoice.is_paid === 1) {
    snackbar.add({ type: 'warning', text: 'Invoice already paid' })
    return
  }
  // if invoice is already in the list, do not add it
  if (invoicesFoundSelected.value.find((inv: any) => inv.id === invoice.id)) {
    return
  }
  // The toRaw function returns the original object that was passed to reactive or ref to make it reactive.
  // It doesn't create a clone or a deep copy of the object; instead, it returns a reference to the original object.
  // const invoiceData = toRaw(invoice)
  const invoiceData = JSON.parse(JSON.stringify(invoice))
  // set amount_to_pay to pending_balance
  invoiceData.charges.forEach((charge: any) => {
    charge.amount_to_pay = Math.abs(charge.pending_balance)
  })
  invoicesFoundSelected.value.push(invoiceData)
}

const addInvoiceToPayBulk = (invoices: any) => {
  invoices.forEach((invoice: any) => {
    if (invoice.is_paid === 1) return
    // if invoice is already in the list, do not add it
    if (invoicesFoundSelected.value.find((inv: any) => inv.id === invoice.id)) return

    const invoiceData = JSON.parse(JSON.stringify(invoice))
    // set amount_to_pay to pending_balance
    invoiceData.charges.forEach((charge: any) => {
      charge.amount_to_pay = charge.pending_balance
    })
    invoicesFoundSelected.value.push(invoiceData)
  })
}

const removeInvoiceToPay = (index: number) => {
  console.log('removeInvoiceToPay', index)
  invoicesFoundSelected.value.splice(index, 1)
}

const removeChargeToInvoiceToPay = (invoice: any, invoiceIndex: number, indexCharge: number) => {
  invoice.charges.splice(indexCharge, 1)
  // remove invoice if no charges
  if (invoice.charges.length <= 0) {
    removeInvoiceToPay(invoiceIndex)
  }
}

const confirmDeletePayment = async (payment: any, skipCheckProcess = false) => {
  const result = await confirm({
    title: 'Are you sure?',
    confirmationText: 'Delete',
    content: 'Please confirm you want to delete this payment.',
    dialogProps: {
      persistent: true,
      maxWidth: 500,
    },
    confirmationButtonProps: {
      color: 'red',
    },
  })

  if (result) {
    try {
      loadingStore.start()
      await $api.bankMovements.deletePayment(bankMovement.value.id, payment, {
        headers: {
          'X-Skip-Process-Check': String(skipCheckProcess),
        },
      })
      snackbar.add({ type: 'success', text: 'Payment deleted' })
      await getBankMovement()
    } catch (error) {
      console.error(error)
    } finally {
      setTimeout(() => {
        loadingStore.stop()
      }, 250)
    }
  }
}

const hasAssociatedRefund = (payment: any): boolean => {
  // Check if the payment's chargeable is a ServicePayment with an associated refund
  const chargeable = payment.chargeable
  if (!chargeable) return false

  // Check if it's a ServicePayment (has reqRefundPayment relation)
  if (chargeable.req_refund_payment) {
    return true
  }

  // Alternative: check through the invoice -> ReqRefund -> refundPayments chain
  // This handles cases where the payment is linked to an InvoiceCharge that belongs to a ReqRefund invoice
  const invoice = chargeable.invoice
  if (invoice?.invoiceable_type?.includes('ReqRefund')) {
    const reqRefund = invoice.invoiceable
    if (reqRefund?.refund_payments?.length > 0) {
      // Check if any refund_payment points back to this service_payment
      return reqRefund.refund_payments.some((refundPayment: any) => {
        const payable = refundPayment.payable
        return payable && payable.id === chargeable.id
      })
    }
  }

  return false
}

const checkMaxAmountToPay = (value: any, charge: any) => {
  if (value > charge.pending_balance) {
    charge.amount_to_pay = charge.pending_balance
  }
}

const isPayBlSchedule = computed(() => {
  return filters.value.typeInvoice === 'LinePaymentSchedule'
})

const goToModule = (bankMovementId: number) => {
  router.push(`/transfers/global/bank-movement-${bankMovementId}/pay-bl-schedule`)
}

const amountToPayTotal = computed(() => {
  let total = 0
  invoicesFoundSelected.value.forEach((invoice: any) => {
    invoice.charges.forEach((charge: any) => {
      let amountToPay = parseFloat(charge.amount_to_pay)
      if (isNaN(amountToPay)) amountToPay = 0
      total += amountToPay
    })
  })
  return total
})

const hasBankMovAmountAvailable = computed(() => {
  if (!bankMovement.value?.id) return false
  if (bankMovement.value.movement_type?.id == 2 && bankMovement.value.sbc_status !== 'approved') return false
  return bankMovement.value.amount_available > 0
})

const eligibleChargesForCommission = computed(() => {
  if (!bankMovement.value?.all_payments) return []
  return bankMovement.value.all_payments.filter((p: any) => {
    if (p.deleted_at) return false
    if (p.chargeable_type?.includes('Payable')) return false
    const pending = p.chargeable?.pending_balance
    return pending > 0 && pending <= 100
  })
})

const showCommissionSection = computed(() => {
  if (movementType.value === 'withdrawal') {
    return bankMovement.value.amount_available >= 0.01 && bankMovement.value.amount_available <= 100
  }
  if (movementType.value === 'deposit') {
    return eligibleChargesForCommission.value.length > 0
  }
  return false
})

const commissionFormData = reactive<Record<number, { commission_amount: number | null; retention_percentage: number | null }>>({})

const commissionForm = computed(() => {
  eligibleChargesForCommission.value.forEach((p: any) => {
    if (!commissionFormData[p.id]) {
      commissionFormData[p.id] = { commission_amount: p.chargeable?.pending_balance ?? null, retention_percentage: null }
    }
  })
  return commissionFormData
})

const getInvoiceTotal = (payment: any) => {
  return parseFloat(payment.chargeable?.invoice?.total || 0)
}

const getCommissionTotal = (payment: any) => {
  const form = commissionFormData[payment.id]
  if (!form) return 0
  const commission = form.commission_amount || 0
  const invoiceTotal = getInvoiceTotal(payment)
  const retention = form.retention_percentage ? Math.round(invoiceTotal * (form.retention_percentage / 100) * 100) / 100 : 0
  return commission + retention
}

const isCommissionFormValid = (payment: any) => {
  const form = commissionFormData[payment.id]
  if (!form) return false
  if (!form.commission_amount && !form.retention_percentage) return false
  const pending = payment.chargeable?.pending_balance || 0
  if (form.commission_amount && (form.commission_amount < 0.01 || form.commission_amount > 100)) return false
  if (form.commission_amount && form.commission_amount > pending) return false
  if (form.retention_percentage && (form.retention_percentage < 1 || form.retention_percentage > 10)) return false
  if (getCommissionTotal(payment) > pending) return false
  return true
}

const confirmApplyCommissionRetention = async (payment: any) => {
  const form = commissionForm.value[payment.id]
  if (!isCommissionFormValid(payment)) return

  let desc = ''
  if (form.commission_amount) desc += `Commission: ${formatToCurrency(form.commission_amount)}`
  if (form.retention_percentage) {
    const invoiceTotal = getInvoiceTotal(payment)
    const retAmount = Math.round(invoiceTotal * (form.retention_percentage / 100) * 100) / 100
    if (desc) desc += ', '
    desc += `Retention: ${form.retention_percentage}% of invoice total ${formatToCurrency(invoiceTotal)} = ${formatToCurrency(retAmount)}`
  }

  const result = await confirm({
    title: 'Apply commission/retention to invoice?',
    confirmationText: 'Apply',
    content: desc,
    dialogProps: { persistent: true, maxWidth: 500 },
    confirmationButtonProps: { color: 'orange-darken-2' },
  })

  if (result) {
    try {
      loadingStore.start()
      await $api.bankMovements.applyCommissionRetention(bankMovement.value.id, {
        invoice_charge_id: payment.chargeable_id,
        commission_amount: form.commission_amount || null,
        retention_percentage: form.retention_percentage || null,
      })
      snackbar.add({ type: 'success', text: 'Commission/retention applied successfully' })
      await getBankMovement()
    } catch (error) {
      console.error(error)
    } finally {
      setTimeout(() => { loadingStore.stop() }, 250)
    }
  }
}

const payInvoices = async () => {
  try {
    loadingStore.start()
    const chargesToPay = [] as any
    invoicesFoundSelected.value.forEach((invoice: any) => {
      invoice.charges.forEach((charge: any) => {
        chargesToPay.push({
          invoice_id: charge.invoice_id,
          chargeable_type: charge.chargeable_type,
          chargeable_id: charge.chargeable_id,
          charge_id: charge.charge_id,
          amount_to_pay: charge.amount_to_pay || 0,
        })
      })
    })

    const body = {
      payments: chargesToPay,
    }
    const response = await $api.bankMovements.payInvoices(bankMovement.value.id, body)

    snackbar.add({ type: 'success', text: 'Invoices paid successfully' })
    await getBankMovement()
    // clear all
    invoicesFound.value = []
    invoicesFoundSelected.value = []
    showPayments.value = true
  } catch (error) {
    console.error(error)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const searchInvoices = async () => {
  try {
    invoicesFound.value = []
    invoicesFoundSelected.value = []
    loadingStore.start()
    const response: any = await $api.bankMovements.searchInvoices(bankMovement.value.id, filters.value)

    if (response.length <= 0) {
      snackbar.add({ type: 'info', text: 'No invoices found' })
    }

    invoicesFound.value = response
  } catch (error) {
    console.error(error)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const confirmApplyCommission = async () => {
  const result = await confirm({
    title: 'Apply remaining balance to commission?',
    confirmationText: 'Apply',
    content: `The remaining balance of ${formatToCurrency(bankMovement.value.amount_available)} will be applied as a bank commission.`,
    dialogProps: {
      persistent: true,
      maxWidth: 500,
    },
    confirmationButtonProps: {
      color: 'orange-darken-2',
    },
  })

  if (result) {
    try {
      loadingStore.start()
      await $api.bankMovements.applyRemainingToCommission(bankMovement.value.id)
      snackbar.add({ type: 'success', text: 'Remaining balance applied to commission' })
      await getBankMovement()
    } catch (error) {
      console.error(error)
    } finally {
      setTimeout(() => {
        loadingStore.stop()
      }, 250)
    }
  }
}

const viewInvoice = (payment: any) => {
  const invoiceableType = payment.chargeable?.invoice?.invoiceable_type
  if (invoiceableType.includes('InvoiceSeaTm')) {
    router.push(`/invoices/search/tm-view-${payment.chargeable?.invoice?.invoiceable_id}`)
    return
  }
  if (invoiceableType.includes('InvoiceSeaWm')) {
    router.push(`/invoices/search/wm-view-${payment.chargeable?.invoice?.invoiceable_id}`)
    return
  }
  if (invoiceableType.includes('InvoiceAirTm')) {
    router.push(`/invoices/search/tm-air-view-${payment.chargeable?.invoice?.invoiceable_id}`)
    return
  }
  if (invoiceableType.includes('InvoiceAirWm')) {
    router.push(`/invoices/search/wm-air-view-${payment.chargeable?.invoice?.invoiceable_id}`)
    return
  }
  if (invoiceableType.includes('FfPayment')) {
    router.push(`/invoices/search/ff-view-${payment.chargeable?.invoice?.invoiceable_id}`)
    return
  }
  if (invoiceableType.includes('LineInvoiceRef')) {
    router.push(`/invoices/lines/notes/viewref-${payment.chargeable?.invoice?.invoiceable_id}`)
    return
  }
  if (invoiceableType.includes('SupplierReqPayment')) {
    // router.push(`/invoices/lines/notes/viewref-${payment.chargeable?.invoice?.invoiceable_id}`)
    // return
  }
  if (invoiceableType.includes('PartyInvoice')) {
    router.push(`/invoices/search/free-format/view-${payment.chargeable?.invoice?.invoiceable_id}`)
    return
  }
  if (invoiceableType.includes('ReqAdvancePayment')) {
    router.push(`/advance-payments/view-${payment.chargeable?.invoice?.invoiceable_id}`)
    return
  }
  if (invoiceableType.includes('ReqRefund')) {
    router.push(`/refunds/view-${payment.chargeable?.invoice?.invoiceable_id}`)
    return
  }
  snackbar.add({ type: 'error', text: 'Unknown invoice type' })
}
</script>
