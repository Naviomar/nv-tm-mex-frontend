<script setup lang="ts">
import { suppliers } from '@/utils/data/suppliersData'

const form = ref({
  supplier: null,
  serie: null,
  folio: null,
  fecha: null,
})
</script>
<template>
  <div>
    <div>
      <v-autocomplete v-model="form.supplier" :items="suppliers" return-object item-title="name" label="Supplier" />
    </div>
    <div>
      <v-text-field v-model="form.serie" label="Serie" />
    </div>
    <div>
      <v-text-field v-model="form.folio" label="No. factura" />
    </div>
    <div>
      <v-text-field v-model="form.fecha" type="date" label="Fecha factura" />
    </div>
    <div>
      <v-alert density="compact" type="warning" title="Detalles" class="my-4">
        Se agregan referencias de diferentes servicios ? Por cada referencia encontrada poder agregar un concepto,
        monto, moneda, IVA, ret. IVA, ret. ISR.
      </v-alert>
    </div>
    <div>
      <v-btn color="primary">Save</v-btn>
    </div>
  </div>
</template>
