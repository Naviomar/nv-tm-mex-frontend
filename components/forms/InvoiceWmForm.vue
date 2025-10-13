<script setup lang="ts">
import { payments, references } from '@/utils/data/referencesData'
import { formatToCurrency } from '@/utils/formatters'
type Rereference = string[]

const referencesDb = ref<Rereference>([])

const setReferences = (folios: any) => {
  // deberia de regresar las referencias existentes
  // y luego obtener los payments de cada referencia
  console.log('setReferences')
  console.log(folios)
  // references.value = folios
  referencesDb.value = references
}

const currencies = [
  { id: 1, name: 'MXN' },
  { id: 2, name: 'USD' },
  { id: 3, name: 'EUR' },
]

const referenceCharges = [
  {
    selected: false,
    containers: ['CMAU1234567', 'CMAU1234567'],
    charge: 'Import Maritime',
    amount: 1000,
    iva: 160,
    subtotal: 1160,
  },
  {
    selected: false,
    containers: ['CMAU1234567', 'CMAU1234567'],
    charge: 'Import Maritime',
    amount: 1000,
    iva: 160,
    subtotal: 1160,
  },
  {
    selected: false,
    containers: ['CMAU1234567', 'CMAU1234567'],
    charge: 'Import Maritime',
    amount: 1000,
    iva: 160,
    subtotal: 1160,
  },
  {
    selected: false,
    containers: ['CMAU1234567', 'CMAU1234567'],
    charge: 'Import Maritime',
    amount: 1000,
    iva: 160,
    subtotal: 1160,
  },
  {
    selected: false,
    containers: ['CMAU1234567', 'CMAU1234567'],
    charge: 'Import Maritime',
    amount: 1000,
    iva: 160,
    subtotal: 1160,
  },
  {
    selected: false,
    containers: ['CMAU1234567', 'CMAU1234567'],
    charge: 'Import Maritime',
    amount: 1000,
    iva: 160,
    subtotal: 1160,
  },
  {
    selected: false,
    containers: ['CMAU1234567', 'CMAU1234567'],
    charge: 'Import Maritime',
    amount: 1000,
    iva: 160,
    subtotal: 1160,
  },
]

const hasReferences = computed(() => {
  return referencesDb.value.length > 0
})
</script>
<template>
  <div>
    <v-card>
      <v-card-title>
        <h3>Capture WM invoice</h3>
      </v-card-title>
      <v-card-text>
        <div>
          <v-autocomplete
            :items="clientes"
            item-title="name"
            item-value="id"
            prepend-icon="mdi-account"
            label="Customer"
          />
        </div>

        <SearchGlobalReferences @update="setReferences" />

        <div v-if="hasReferences" class="py-4">
          <div class="font-bold text-lg my-4">Reference Details</div>
          <v-table density="compact">
            <thead>
              <tr>
                <th class="text-left"></th>
                <th class="text-left">Container(s)</th>
                <th class="text-left">Concept</th>
                <th class="text-left">Amount</th>
                <th class="text-left">IVA</th>
                <th class="text-left">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in referenceCharges" :key="`reference-charge-${index}`">
                <td>
                  <v-checkbox />
                </td>
                <td>
                  <div
                    v-for="(container, ci) in item.containers"
                    :key="`ref-${index}-item-${index}-cont-${ci}`"
                    class="mb-1"
                  >
                    <v-chip size="small">{{ container }}</v-chip>
                  </div>
                </td>
                <td>{{ item.charge }}</td>
                <td>{{ item.amount }}</td>
                <td>{{ item.iva }}</td>
                <td>{{ item.subtotal }}</td>
              </tr>
            </tbody>
          </v-table>
          <div class="font-bold text-lg my-4">Invoice WM Details</div>
          <div class="grid grid-cols-2">
            <div>
              <v-autocomplete
                :items="currencies"
                item-title="name"
                item-value="id"
                prepend-icon="mdi-currency-usd"
                label="Currency"
              />
            </div>
          </div>
          <div><v-textarea rows="3" label="Notas:" /></div>

          <div><v-textarea rows="3" label="Email(s)" /></div>
          <div><v-btn color="primary">Save invoice</v-btn></div>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>
