<script setup lang="ts">
import { clientes, payments } from '@/utils/paymentsData'
import { formatToCurrency } from '@/utils/formatters'
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
        <div><v-text-field type="text" label="Reference number"></v-text-field></div>
        <div><v-autocomplete :items="clientes" item-title="name" item-value="id" label="Customers" /></div>
        <div><v-text-field type="text" label="BL House"></v-text-field></div>
        <div><v-text-field type="text" label="Container"></v-text-field></div>
        <div><v-text-field type="text" label="Document number"></v-text-field></div>
        <div><v-text-field type="date" label="Transfer/deposit date"></v-text-field></div>

        <div><v-text-field type="text" label="Amount USD"></v-text-field></div>
        <div><v-text-field type="text" label="Amount MXN"></v-text-field></div>

        <div><v-text-field type="text" label="Factura TM-WM"></v-text-field></div>
      </div>
    </div>
    <div>
      <v-pagination rounded="circle"></v-pagination>
      <v-table density="compact" fixed-header>
        <thead>
          <tr>
            <th>Actions</th>
            <th>Document</th>
            <th>Customer</th>
            <th>BL House</th>
            <th>Referencia(s)</th>
            <th>Factura</th>
            <th>Monto USD</th>
            <th>Monto MXN</th>
            <th>Saldo</th>
            <th>Fecha transfer</th>
            <th>Bank / account number</th>
            <th>Usuario</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(payment, index) in payments" :key="`payment-${index}`">
            <td>
              <v-btn variant="text" size="small" color="blue-lighten-2" density="compact">View</v-btn>
              <v-btn variant="text" size="small" color="blue-lighten-2" density="compact">PDF</v-btn>
            </td>
            <td>{{ payment.document }}</td>
            <td>{{ payment.customer }}</td>
            <td>{{ payment.blHouses }}</td>
            <td>{{ payment.references }}</td>
            <td>{{ payment.factura }}</td>
            <td>{{ formatToCurrency(payment.amountUsd) }}</td>
            <td>{{ formatToCurrency(payment.amountMxn) }}</td>
            <td>{{ formatToCurrency(payment.balance) }}</td>
            <td>{{ payment.fechaTransfer }}</td>
            <td>{{ payment.bankNumber }}</td>
            <td>
              <div>{{ payment.createdAt }}</div>
              <div>{{ payment.createdBy }}</div>
            </td>
          </tr>
        </tbody>
      </v-table>
      <v-pagination rounded="circle"></v-pagination>
    </div>
  </div>
</template>
