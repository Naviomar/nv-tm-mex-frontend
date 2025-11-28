<template>
  <div>
    
    <div v-if="hasData">
      <div class="max-w-xs mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div class="bg-gray-100 px-4 py-2">
          <h2 class="text-lg font-medium text-gray-800">Bank movement #{{ props.bankMovement.id }}</h2>
        </div>
        <div class="px-4 py-5 sm:p-6">
          <div class="flex flex-col items-start justify-between mb-2">
            <span class="text-sm font-medium text-gray-600">Bank</span>
            <span class="text-lg font-medium text-gray-800"
              >{{ props.bankMovement.bank_account?.bank_name }} ({{
                props.bankMovement.bank_account?.currency?.code
              }})</span
            >
          </div>
          <div class="flex flex-col items-start justify-between mb-2">
            <span class="text-sm font-medium text-gray-600">Acct number</span>
            <span class="text-lg font-medium text-gray-800">{{ props.bankMovement.bank_account?.account_number }}</span>
          </div>
          <div class="flex flex-row items-center justify-between mb-4">
            <div class="flex flex-col items-start">
              <span class="text-sm font-medium text-gray-600">Movement date</span>
              <span class="text-lg font-medium text-gray-800">{{
                formatDateOnlyString(props.bankMovement.movement_date)
              }}</span>
            </div>
            <div class="flex flex-col items-start">
              <span class="text-sm font-medium text-gray-600">Type</span>
              <span class="text-lg font-medium text-gray-800 italic">
                {{ props.bankMovement.movement_type?.name }}
              </span>
            </div>
          </div>
          <div class="flex flex-row items-center justify-between">
            <div class="flex flex-col items-start">
              <span class="text-sm font-medium text-gray-600">Amount</span>
              <span class="text-lg font-medium text-gray-800">{{ formatToCurrency(props.bankMovement.amount) }}</span>
            </div>
            <div class="flex flex-col items-start">
              <span class="text-sm font-medium text-gray-600">Available Balance</span>
              <span class="text-lg font-bold text-gray-800">{{
                formatToCurrency(props.bankMovement.amount_available)
              }}</span>
            </div>
          </div>
          <div class="flex flex-col items-center bg-slate-100">
            <span class="text-sm font-medium text-gray-600">Used</span>
            <span class="text-lg font-medium text-gray-800">{{
              formatToCurrency(props.bankMovement.amount - props.bankMovement.amount_available)
            }}</span>
          </div>
          <div class="flex flex-col items-center bg-slate-100">
          <BankMovementPayments :bankMovement="props.bankMovement" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
const props = defineProps({
  bankMovement: {
    type: Object,
    required: true,
  },
})

const hasData = computed(() => !!props.bankMovement)
</script>
