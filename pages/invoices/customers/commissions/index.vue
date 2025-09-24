<template>
  <v-container fluid>
    <v-btn color="slate" size="small" variant="outlined" to="/invoices/search/tm" class="mb-4"
      >Back to tm invoices search</v-btn
    >
    <v-row>
      <v-col cols="12" md="12">
        <v-card variant="flat">
          <v-card-title>
            <h3>Bank commisions</h3>
          </v-card-title>
          <v-card-text>
            <BankCommisions />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
<script setup lang="ts">
const router = useRouter()

definePageMeta({
  title: 'Bank commissions - Home',
  layout: 'default',
})
</script>
