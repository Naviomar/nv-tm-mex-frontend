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

const usoCfdi = [
  { id: 1, name: 'G01 - Adquisición de mercancias' },
  { id: 2, name: 'G02 - Devoluciones, descuentos o bonificaciones' },
  { id: 3, name: 'G03 - Gastos en general' },
  { id: 4, name: 'I01 - Construcciones' },
  { id: 5, name: 'I02 - Mobilario y equipo de oficina por inversiones' },
  { id: 6, name: 'I03 - Equipo de transporte' },
  { id: 7, name: 'I04 - Equipo de computo y accesorios' },
  { id: 8, name: 'I05 - Dados, troqueles, moldes, matrices y herramental' },
  { id: 9, name: 'I06 - Comunicaciones telefónicas' },
  { id: 10, name: 'I07 - Comunicaciones satelitales' },
  { id: 11, name: 'I08 - Otra maquinaria y equipo' },
  { id: 12, name: 'D01 - Honorarios médicos, dentales y gastos hospitalarios.' },
  { id: 13, name: 'D02 - Gastos médicos por incapacidad o discapacidad' },
  { id: 14, name: 'D03 - Gastos funerales.' },
  { id: 15, name: 'D04 - Donativos.' },
  { id: 16, name: 'D05 - Intereses reales efectivamente pagados por créditos hipotecarios (casa habitación).' },
  { id: 17, name: 'D06 - Aportaciones voluntarias al SAR.' },
  { id: 18, name: 'D07 - Primas por seguros de gastos médicos.' },
  { id: 19, name: 'D08 - Gastos de transportación escolar obligatoria.' },
  { id: 20, name: 'D09 - Depósitos en cuentas para el ahorro, primas que tengan como base planes de pensiones.' },
  { id: 21, name: 'D10 - Pagos por servicios educativos (colegiaturas)' },
  { id: 22, name: 'P01 - Por definir' },
]

const currencies = [
  { id: 1, name: 'MXN' },
  { id: 2, name: 'USD' },
  { id: 3, name: 'EUR' },
]

const formasPago = [
  { id: 1, name: 'Efectivo' },
  { id: 2, name: 'Transferencia' },
  { id: 3, name: 'Cheque' },
]

const metodosPago = [
  { id: 1, name: 'PUE - Pago en una sola exhibición' },
  { id: 2, name: 'PPD - Pago en parcialidades' },
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
        <h3>Capture TM invoice</h3>
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
          <div class="font-bold text-lg my-4">Invoice TM Details</div>
          <div class="grid grid-cols-2">
            <div><v-text-field type="text" prepend-icon="mdi-numeric" label="P.O." /></div>
            <div>
              <v-autocomplete
                :items="usoCfdi"
                item-title="name"
                item-value="id"
                prepend-icon="mdi-account"
                label="Uso de CFDI"
              />
            </div>
            <div>
              <v-autocomplete
                :items="metodosPago"
                item-title="name"
                item-value="id"
                prepend-icon="mdi-account"
                label="Método de pago"
              />
            </div>
            <div>
              <v-autocomplete
                :items="formasPago"
                item-title="name"
                item-value="id"
                prepend-icon="mdi-account"
                label="Forma de pago"
              />
            </div>
            <div><v-text-field type="text" prepend-icon="mdi-numeric" label="Tipo de cambio" /></div>
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
