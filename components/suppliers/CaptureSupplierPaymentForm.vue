<template>
  <div>
    <div class="grid grid-cols-8 gap-5">
      <div class="col-span-5">
        <v-autocomplete
          v-model="form.supplier"
          :items="suppliers"
          return-object
          item-title="name"
          label="Supplier"
          @update:model-value="clearForm"
        />
      </div>
      <div class="col-span-3 mt-2 ml-4">
        <v-btn prepend-icon="mdi-magnify" color="primary" class="mr-4" @click="searchSupplierInvoices"
          >Search {{ countFolios }}</v-btn
        >
        <v-btn prepend-icon="mdi-delete-outline" color="red-lighten-3" @click="resetForm">Reset</v-btn>
      </div>
    </div>
    <div class="grid grid-cols-2 gap-5">
      <div class="col-span-1">
        <v-text-field
          v-model="form.from"
          type="date"
          label="From"
          clearable
          auto-grow
          clear-icon="mdi-close-circle"
          hint="Enter date"
        />
      </div>
      <div class="col-span-1">
        <v-text-field
          v-model="form.to"
          type="date"
          label="To"
          clearable
          auto-grow
          clear-icon="mdi-close-circle"
          hint="Enter date"
        />
      </div>
    </div>
    <div>
      <div class="grid grid-cols-6 gap-5">
        <div class="col-span-3">
          <v-textarea
            v-model="form.documentosText"
            rows="3"
            label="No. Documentos"
            clearable
            auto-grow
            clear-icon="mdi-close-circle"
            hint="Enter No. per line"
          />
        </div>
        <div class="col-span-3">
          <v-textarea
            v-model="form.foliosText"
            rows="3"
            label="No. Facturas"
            clearable
            auto-grow
            clear-icon="mdi-close-circle"
            hint="Enter No. per line"
          />
        </div>
      </div>
      <div class="flex gap-2 py-4">
        <div v-for="(folio, index) in folios" :key="`folio-${index}`">
          <v-chip>{{ folio }}</v-chip>
        </div>
      </div>
    </div>
    <div>
      <v-table density="compact">
        <thead>
          <tr>
            <th class="text-left">Actions</th>
            <th class="text-left">Solicitud</th>
            <th class="text-left">Factura</th>
            <th class="text-left">Proveedor</th>
            <th class="text-left">Total</th>
            <th class="text-left">Fecha factura</th>
            <th class="text-left">Capturó</th>
          </tr>
        </thead>
        <tbody></tbody>
      </v-table>
      <v-alert density="compact" type="warning" title="Detalles" class="my-4">
        Se encuentran todas las facturas con solicitud de pago y que no han sido pagadas.
      </v-alert>
      <div>
        <v-text-field type="text" label="No. cuenta" />
        <v-text-field type="text" label="Tipo documento" />
        <v-text-field type="text" label="No. Documento" />
        <v-text-field type="text" label="Importe" />
        <v-text-field type="text" label="Moneda" />
        <v-text-field type="date" label="Fecha pago" />
        <v-textarea rows="3" label="Notes" />

        <v-btn color="primary">Aplicar pago</v-btn>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { suppliers } from '@/utils/data/suppliersData'

type Supplier = { id: number; name: string }
type SupplierInvoice = {
  supplier: Supplier | null
  from: string | null
  to: string | null
  folios: string[]
  foliosText: string | null
}
const form = ref<SupplierInvoice>({ supplier: null, from: null, to: null, folios: [], foliosText: null })

const emit = defineEmits(['update'])

const clearForm = () => {
  form.value.supplier = null
  form.value.folios = []
  form.value.foliosText = null
}

const resetForm = () => {
  form.value.supplier = null
  clearForm()
}

const folios = computed(() => {
  if (form.value.foliosText) {
    let parts = form.value.foliosText.split('\n')
    parts = parts.map((part) => part.trim())
    // remove empty strings
    parts = parts.filter((part) => part)
    // unique values
    parts = [...new Set(parts)]
    return parts
  }
  return []
})

const countFolios = computed(() => {
  if (folios.value.length === 0) {
    return ''
  }
  return `(${folios.value.length})`
})

const searchSupplierInvoices = () => {
  console.log('searchSupplierInvoices')
  if (folios.value.length === 0) {
    return
  }
  // api backend search references
  emit('update', folios.value)
}
</script>
