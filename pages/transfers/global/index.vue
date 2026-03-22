<template>
  <v-container fluid>
    <v-card>
      <v-card-title>
        <div class="flex justify-between items-center w-full">
          <div class="flex gap-2">
            <v-icon>mdi-piggy-bank-outline</v-icon>
            <h3 class="text-h6 font-weight-bold">Banking transactions</h3>
          </div>
          <div class="flex items-center">
            <div class="bg-grey-200 rounded-lg p-1 flex gap-1">
              <button
                @click="setTransactionType(false)"
                class="px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2"
                :class="!transactionType 
                  ? 'bg-green-500 text-white shadow-md border border-green-600' 
                  : 'text-grey-600 hover:text-grey-800'"
              >
                <v-icon size="small">mdi-bank-transfer-in</v-icon>
                Deposits
              </button>
              <button
                @click="setTransactionType(true)"
                class="px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2"
                :class="transactionType 
                  ? 'bg-red-500 text-white shadow-md border border-red-600' 
                  : 'text-grey-600 hover:text-grey-800'"
              >
                <v-icon size="small">mdi-bank-transfer-out</v-icon>
                Withdrawals
              </button>
            </div>
          </div>
        </div>
      </v-card-title>
      <v-card-text>
        <div class="flex gap-3">
          <v-btn color="blue" size="small" variant="elevated" to="/transfers/global/upload" class="mb-4"
            >Load bank transactions</v-btn
          >
          <v-btn color="purple" size="small" variant="elevated" @click="viewCustomerPayments">
            <v-icon>mdi-cash</v-icon> View customer payments
          </v-btn>
        </div>
        <BankMovements 
          @viewBankMovement="goToView" 
          @makePayments="goToMakePayments"
          :transaction-type="transactionType"
          :key="`bank-movements-${transactionType}`"
        />
      </v-card-text>
    </v-card>
  </v-container>
</template>
<script setup lang="ts">
const router = useRouter()

definePageMeta({
  title: 'Admin Pack - Home',
  layout: 'default',
})

// Toggle state for transaction type (false = deposit, true = withdrawal)
const transactionType = ref(false)

// Load transaction type from session storage immediately
const stored = sessionStorage.getItem('bankingTransactionType')
if (stored !== null) {
  transactionType.value = stored === 'true'
}

// Save transaction type to session storage when changed
const onTransactionTypeChange = (value: boolean | null) => {
  if (value !== null) {
    sessionStorage.setItem('bankingTransactionType', value.toString())
  }
}

// Set transaction type with session storage
const setTransactionType = (value: boolean) => {
  transactionType.value = value
  sessionStorage.setItem('bankingTransactionType', value.toString())
}

const goToView = (bankMovement: any) => {
  router.push(`/transfers/global/view-${bankMovement.id}`)
}

const goToMakePayments = (bankMovement: any) => {
  router.push(`/transfers/global/make-payments-${bankMovement.id}`)
}

const viewCustomerPayments = () => {
  router.push('/payments/customers')
}


</script>
