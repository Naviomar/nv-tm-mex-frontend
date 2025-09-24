<script setup lang="ts">
import { supplierPayments } from '@/utils/data/invoicesData'
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
        <div><v-text-field type="text" label="No. Documento"></v-text-field></div>
        <div><v-text-field type="text" label="No. Factura"></v-text-field></div>
        <div><v-autocomplete :items="clientes" item-title="name" item-value="id" label="Proveedor" /></div>
      </div>
    </div>
    <div>
      <v-pagination rounded="circle"></v-pagination>
      <v-table density="compact" fixed-header>
        <thead>
          <tr>
            <th>Actions</th>
            <th>Documento</th>
            <th>Transfered amount</th>
            <th>Cuenta origen</th>
            <th>Total (facturas)</th>
            <th>Saldo transferencia</th>
            <th>Fecha pago</th>
            <th>Proveedor</th>
            <th>No. Factura</th>
            <th>Capturó</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(payment, index) in supplierPayments" :key="`payment-${index}`">
            <td>
              <v-btn variant="text" size="small" color="blue-lighten-2" density="compact">View</v-btn>
              <v-btn variant="text" size="small" color="red-lighten-2" density="compact">Cancel</v-btn>
            </td>
            <td>
              <div>
                <div>{{ payment.pago.tipo }}</div>
                <div>{{ payment.pago.banco }}</div>
                <div>{{ payment.pago.cuenta }}</div>
                <div>{{ payment.pago.fecha }}</div>
              </div>
            </td>
            <td>{{ payment.transferAmount }}</td>
            <td>{{ payment.cuenta }}</td>
            <td>{{ formatToCurrency(payment.total) }}</td>
            <td>{{ formatToCurrency(payment.saldo) }}</td>
            <td>
              <div>{{ payment.created_at }}</div>
            </td>
            <td>{{ payment.proveedor }}</td>

            <td>{{ payment.noFactura }}</td>
            <td>{{ payment.created_by }}</td>
          </tr>
        </tbody>
      </v-table>
      <v-pagination rounded="circle"></v-pagination>
    </div>
  </div>
</template>
