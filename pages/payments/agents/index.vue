<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12" md="12">
        <v-card>
          <v-card-title>
            <h3>Freight forwarder Agents debit / credit notes</h3>
          </v-card-title>
          <v-card-text>
            <div class="flex items-center justify-center gap-3">
              <v-btn v-if="false" color="primary" to="/payments/agents/check" class="mb-4">Check module</v-btn>

              <v-btn color="primary" to="/payments/agents/soa" class="mb-4">SOA module</v-btn>
              <v-btn
                color="lime"
                :to="{ path: '/payments/agents/payments', query: { status: 'pending' } }"
                class="mb-4"
              >
                Pending Payments module
              </v-btn>
              <v-btn
                color="lime"
                :to="{ path: '/payments/agents/payments', query: { status: 'paid' } }"
                class="mb-4"
              >
                Paid Payments module
              </v-btn>
              <v-btn color="orange" to="/payments/agents/reports" class="mb-4">Report module</v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
<script setup lang="ts">
definePageMeta({
  title: 'Import - Maritime',
  layout: 'default',
})
</script>
