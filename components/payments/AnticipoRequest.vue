<script setup lang="ts">
import { clientes } from '@/utils/data/clientesData'
import { references } from '@/utils/data/referencesData'
import { systemCompanies, systemBanks, currencies } from '@/utils/data/systemData'
import { formatToCurrency } from '@/utils/formatters'
type Rereference = string[]
const bancos = [
  { id: 1, name: 'Banamex' },
  { id: 2, name: 'Bancomer BBVA' },
  { id: 3, name: 'Bank of America' },
  { id: 4, name: 'Banorte' },
  { id: 5, name: 'Hsbc' },
]

const referencesDb = ref<Rereference>([])

const setReferences = (folios: any) => {
  // deberia de regresar las referencias existentes
  // y luego obtener los payments de cada referencia
  console.log('setReferences')
  console.log(folios)
  // references.value = folios
  referencesDb.value = references
}

const hasReferences = computed(() => {
  return referencesDb.value.length > 0
})
</script>
<template>
  <div>
    <v-card>
      <v-card-title>
        <h3>Search global references</h3>
      </v-card-title>
      <v-card-text>
        <SearchGlobalReferences @update="setReferences" />
      </v-card-text>
    </v-card>
    <div v-if="hasReferences" class="py-4">
      <div class="font-bold text-lg mb-4">Charges found</div>
      <v-expansion-panels>
        <v-expansion-panel
          v-for="(reference, i) in referencesDb"
          :key="`ref-${i}`"
          :title="reference.reference"
          :value="i"
        >
          <v-expansion-panel-text>
            <v-table>
              <thead>
                <tr>
                  <th></th>
                  <th>Reference</th>
                  <th>Charge</th>
                  <th>Amount</th>
                  <th>Currency</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(charge, index) in reference.charges" :key="`ref-${i}-charge-${index}`">
                  <td>
                    <v-checkbox></v-checkbox>
                  </td>
                  <td>{{ charge.reference }}</td>
                  <td>{{ charge.name }}</td>
                  <td>{{ formatToCurrency(charge.amount) }}</td>
                  <td>{{ charge.currency }}</td>
                </tr>
              </tbody>
            </v-table>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
      <v-btn color="primary">Add selected charge(s)</v-btn>

      <div class="font-bold text-lg my-4">Solicitud de anticipo</div>
      <div>
        <v-autocomplete
          :items="systemCompanies"
          item-title="name"
          item-value="id"
          prepend-icon="mdi-account"
          label="Empresa"
        />
      </div>
      <div>
        <v-autocomplete
          :items="systemBanks"
          item-title="accountNumber"
          item-value="id"
          prepend-icon="mdi-bank"
          label="Cuenta"
        />
      </div>
      <div class="grid grid-cols-2 gap-5">
        <div><v-text-field type="text" prepend-icon="mdi-currency-usd" label="Importe" /></div>
        <div>
          <v-autocomplete :items="currencies" item-title="name" item-value="id" label="Currency" />
        </div>
      </div>

      <div>
        <v-autocomplete
          :items="clientes"
          item-title="name"
          item-value="id"
          prepend-icon="mdi-account"
          label="Beneficiario (customer)"
        />
      </div>

      <div><v-textarea rows="3" label="Notas" /></div>
      <div><v-btn color="primary">Save anticipo</v-btn></div>
    </div>
  </div>
</template>
