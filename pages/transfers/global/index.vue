<template>
  <v-container fluid>
    <v-card>
      <v-card-title>
        <div class="flex gap-2">
          <v-icon>mdi-piggy-bank-outline</v-icon>
          <h3>Banking transactions</h3>
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
        <BankMovements @viewBankMovement="goToView" @makePayments="goToMakePayments" />
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
