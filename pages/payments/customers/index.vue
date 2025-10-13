<template>
  <v-container fluid>
    <div>
      <div class="flex items-center justify-between w-full">
        <div class="text-xl">Customer payments</div>
        <v-btn color="purple" size="small" variant="elevated" @click="registerCustomerPayment">
          <v-icon>mdi-cash</v-icon> Register customer payment
        </v-btn>
      </div>
    </div>
    <div class="pt-4">
      <CustomerPaymentsTable />
    </div>
  </v-container>
</template>
<script setup lang="ts">
const router = useRouter()

const registerCustomerPayment = () => {
  // random hash
  const hash = Math.random().toString(36).substring(2, 15)
  router.push(`/payments/customers/register/AA/${hash}`)
}
</script>
