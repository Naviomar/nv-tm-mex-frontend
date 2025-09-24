<script setup lang="ts">
import { creditNotes } from '@/utils/data/creditNotesData'
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
        <div><v-text-field type="text" label="Serie"></v-text-field></div>
        <div><v-text-field type="text" label="BL"></v-text-field></div>
        <div><v-text-field type="text" label="Contenedores"></v-text-field></div>
        <div><v-text-field type="text" label="Referencia"></v-text-field></div>
        <div><v-autocomplete :items="clientes" item-title="name" item-value="id" label="Customers" /></div>
      </div>
    </div>
    <div>
      <v-pagination rounded="circle"></v-pagination>
      <v-table density="compact" fixed-header>
        <thead>
          <tr>
            <th>Actions</th>
            <th>Folio</th>
            <th>Serie</th>
            <th>Customer</th>
            <th>Concepto</th>
            <th>BL-Contenedor</th>
            <th>Subtotal</th>
            <th>IVA</th>
            <th>Total</th>
            <th>Moneda</th>
            <th>Envio a</th>
            <th>Fecha Factura</th>
            <th>Notas</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(creditNote, index) in creditNotes" :key="`credit-note-${index}`">
            <td>
              <div><v-btn variant="text" size="x-small" color="blue-lighten-2" density="compact">View</v-btn></div>
              <div><v-btn variant="text" size="x-small" color="blue-lighten-2" density="compact">Add note</v-btn></div>
              <div>
                <v-btn variant="text" size="x-small" color="blue-lighten-2" density="compact"
                  >Generar nota de crédito</v-btn
                >
              </div>
            </td>
            <td>{{ creditNote.folio }}</td>
            <td>{{ creditNote.serie }}</td>
            <td>{{ creditNote.customer }}</td>
            <td>{{ creditNote.concepto }}</td>
            <td>{{ creditNote.blContenedor }}</td>

            <td>{{ formatToCurrency(creditNote.subtotal) }}</td>
            <td>{{ formatToCurrency(creditNote.iva) }}</td>
            <td>{{ formatToCurrency(creditNote.total) }}</td>
            <td>{{ creditNote.currency }}</td>

            <td>{{ creditNote.envioA }}</td>
            <td>{{ creditNote.fechaFactura }}</td>
            <td>{{ creditNote.notas }}</td>
          </tr>
        </tbody>
      </v-table>
      <v-pagination rounded="circle"></v-pagination>
    </div>
  </div>
</template>
