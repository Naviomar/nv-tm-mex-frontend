<script setup lang="ts">
import { clientes, bofaMovements } from '@/utils/paymentsData'
import { formatToCurrency } from '@/utils/formatters'

const splitPaymentDetail = (movement) => {
  const paymentDetail = movement.split('|')
  // iterate over paymentDetail and return a v-chip for each element
  return paymentDetail
    .map((detail) => {
      return `<div>${detail}</div>`
    })
    .join('')
}
</script>
<template>
  <div>
    <div>
      <div class="font-bold mb-2">Filters</div>
      <div class="grid grid-cols-2 gap-5">
        <div><v-text-field type="date" label="Date from"></v-text-field></div>
        <div><v-text-field type="date" label="Date to"></v-text-field></div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div><v-text-field type="text" label="Movement amount"></v-text-field></div>
        <div><v-autocomplete :items="clientes" item-title="name" item-value="id" label="Customers" /></div>
      </div>
    </div>
    <div>
      <v-pagination rounded="circle"></v-pagination>
      <v-table density="compact" fixed-header>
        <thead>
          <tr>
            <th></th>
            <th>Actions</th>
            <th>Movement date</th>
            <th>Bank</th>
            <th>Amount</th>
            <th class="bg-yellow">Balance</th>
            <th>Customer</th>
            <th>Payment detail</th>
            <th>Aplicó</th>
            <th>Liberó</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(bofaMovement, index) in bofaMovements" :key="`bofa-${index}`">
            <td>APLICADA</td>
            <td>
              <v-btn variant="text" size="small" color="blue-lighten-2" density="compact">View</v-btn>
            </td>
            <td>{{ bofaMovement.movementDate }}</td>
            <td>{{ bofaMovement.bank }}</td>
            <td>{{ formatToCurrency(bofaMovement.amount) }}</td>
            <td class="bg-yellow">{{ formatToCurrency(bofaMovement.balance) }}</td>
            <td>{{ bofaMovement.customer }}</td>
            <td v-html="splitPaymentDetail(bofaMovement.paymentDetail)"></td>
            <td>{{ bofaMovement.aplico }}</td>
            <td>{{ bofaMovement.libero }}</td>
          </tr>
        </tbody>
      </v-table>
      <v-pagination rounded="circle"></v-pagination>
    </div>
  </div>
</template>
