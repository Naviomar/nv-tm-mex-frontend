<script setup lang="ts">
import { tickets } from '@/utils/data/invoicesData'
import { clientes } from '@/utils/data/clientesData'
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
        <div><v-text-field type="text" label="No. Folio"></v-text-field></div>
        <div><v-autocomplete :items="clientes" item-title="name" item-value="id" label="Customers" /></div>
        <div><v-text-field type="text" label="No. Boleto"></v-text-field></div>
        <div><v-text-field type="text" label="No. receipt"></v-text-field></div>
      </div>
    </div>
    <div>
      <v-pagination rounded="circle"></v-pagination>
      <v-table density="compact" fixed-header>
        <thead>
          <tr>
            <th>Actions</th>
            <th>Folio</th>
            <th>Customer</th>
            <th>Receipt / Boleto / Concept</th>
            <th>Total</th>
            <th>Moneda</th>
            <th>Usuario / Fecha</th>
            <th>Última modificación</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(invoice, index) in tickets" :key="`invoice-${index}`">
            <td>
              <v-btn variant="text" size="small" color="blue-lighten-2" density="compact">View</v-btn>
              <v-btn variant="text" size="small" color="blue-lighten-2" density="compact">PDF</v-btn>
              <v-btn icon size="small" color="red-lighten-2" density="compact"
                ><v-icon size="small" color="white">mdi-delete</v-icon></v-btn
              >
            </td>
            <td>{{ invoice.folio }}</td>
            <td>{{ invoice.customer }}</td>
            <td>{{ invoice.concepto }}</td>
            <td>{{ formatToCurrency(invoice.total) }}</td>
            <td>{{ invoice.currency }}</td>
            <td>
              <div>{{ invoice.created_at }}</div>
              <div>{{ invoice.created_by }}</div>
            </td>
            <td>{{ invoice.updated_at }}</td>
          </tr>
        </tbody>
      </v-table>
      <v-pagination rounded="circle"></v-pagination>
    </div>
  </div>
</template>
