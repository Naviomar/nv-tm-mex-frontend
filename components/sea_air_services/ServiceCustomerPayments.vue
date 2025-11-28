<template>
  <div>
    <v-card color="amber-lighten-4" class="mb-4">
      <v-card-title><div class="font-bold">Saldos a favor / Depósito en garantía</div></v-card-title>
      <v-card-text>
        <v-table density="compact">
          <thead>
            <tr>
              <th class="text-left">Payment</th>
              <th class="text-left">Amount</th>
              <th class="text-left">Created at</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(servicePayment, key) in service.service_payments" :key="`serv-pay-${key}`">
              <td class="p-2">{{ servicePayment.charge?.name }}</td>
              <td class="p-2">
                {{ formatToCurrency(servicePayment.amount) }} {{ getCurrencyName(servicePayment.currency_id) }}
              </td>
              <td class="p-2">
                <UserInfoBadge :item="servicePayment">
                  {{ formatDateString(servicePayment.created_at) }}
                </UserInfoBadge>
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card-text>
    </v-card>
  </div>
</template>
<script setup lang="ts">
const props = defineProps({
  service: {
    type: Object,
    required: true,
  },
})
</script>
