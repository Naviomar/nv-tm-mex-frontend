<script setup lang="ts">
import { supplierInvoices } from '@/utils/data/invoicesData'
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
        <div><v-text-field type="text" label="No. Solicitud"></v-text-field></div>
        <div><v-text-field type="text" label="No. Factura"></v-text-field></div>
        <div><v-autocomplete :items="clientes" item-title="name" item-value="id" label="Proveedor" /></div>
        <div><v-text-field type="text" label="Reference number"></v-text-field></div>
      </div>
    </div>
    <div>
      <v-pagination rounded="circle"></v-pagination>
      <v-table density="compact" fixed-header>
        <thead>
          <tr>
            <th>Actions</th>
            <th>Files</th>
            <th>Solicitud</th>
            <th>Serie/Folio</th>
            <th>Proveedor</th>
            <th>Concepto(s)</th>
            <th>Total</th>
            <th>Fecha factura</th>
            <th>Referencia</th>
            <th>Pago a Prv</th>
            <th>Container(s)</th>
            <th>Registro</th>
            <th>Modificó</th>
            <th>Recibo Solicitud</th>
            <th>Canceló</th>
            <th>Notas</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(invoice, index) in supplierInvoices"
            :key="`invoice-${index}`"
            :class="{ 'bg-red-100! dark:bg-red-900!': invoice.deleted_at }"
          >
            <td>
              <v-btn variant="text" size="small" color="blue-lighten-2" density="compact">View</v-btn>
            </td>
            <td>
              <div>
                <v-btn variant="text" size="small" color="blue-lighten-2" density="compact">XML</v-btn>
                <v-btn variant="text" size="small" color="blue-lighten-2" density="compact">ZIP</v-btn>
              </div>
            </td>
            <td>{{ invoice.solicitudPagoId }}</td>
            <td>{{ invoice.serieFolio }}</td>
            <td>{{ invoice.proveedor }}</td>
            <td>{{ invoice.conceptos }}</td>
            <td>{{ formatToCurrency(invoice.total) }}</td>
            <td>
              <div>{{ invoice.created_at }}</div>
            </td>
            <td>{{ invoice.referencia }}</td>
            <td>
              <div>
                <div>{{ invoice.pago.tipo }}</div>
                <div>{{ invoice.pago.banco }}</div>
                <div>{{ invoice.pago.cuenta }}</div>
                <div>{{ invoice.pago.fecha }}</div>
              </div>
            </td>
            <td>
              <div
                v-for="(container, ci) in invoice.containers"
                :key="`ref-${index}-invoice-${index}-cont-${ci}`"
                class="mb-1"
              >
                <v-chip size="small">{{ container }}</v-chip>
              </div>
            </td>
            <td>
              <div>{{ invoice.created_by }}</div>
            </td>
            <td>{{ invoice.updated_by }}</td>
            <td>{{ invoice.recibo }}</td>
            <td>{{ invoice.cancelled_by }}</td>
            <td>{{ invoice.notes }}</td>
          </tr>
        </tbody>
      </v-table>
      <v-pagination rounded="circle"></v-pagination>
      <v-alert density="compact" type="warning" title="Detalles" class="my-4">
        En la tabla solicitud es el número de solicitud de pago.
      </v-alert>
    </div>
  </div>
</template>
