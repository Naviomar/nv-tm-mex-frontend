<script setup lang="ts">
import { payments, references } from '@/utils/data/referencesData'
import { formatToCurrency } from '@/utils/formatters'
type Rereference = string[]

const concepts = [
  { id: 1, name: 'Concept 1' },
  { id: 2, name: 'Concept 2' },
  { id: 3, name: 'Concept 3' },
  { id: 4, name: 'Concept 4' },
]

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

const charges = [
  {
    selected: false,
    charge: 'Import Maritime',
    amount: 1000,
    iva: 160,
    subtotal: 1160,
  },
]

const form = ref({
  folio: '',
  reference: '',
  cliente: null,
  conceptAdminPack: null,
  concepts: [] as any[],
})

const addConcept = () => {
  form.value.concepts.push({
    concept: '',
    noReceipt: '',
    noBoleto: '',
    amount: 0,
    iva: 0,
    reference: '',
  })
}

const removeConcept = (index: number) => {
  form.value.concepts.splice(index, 1)
}
</script>
<template>
  <div>
    <v-card>
      <v-card-title>
        <h3>Capture Ticket</h3>
      </v-card-title>
      <v-card-text>
        <div><v-text-field v-model="form.folio" prepend-icon="mdi-account" label="Folio" /></div>
        <div><v-text-field v-model="form.reference" prepend-icon="mdi-account" label="Reference" /></div>
        <div>
          <v-autocomplete
            :items="clientes"
            item-title="name"
            item-value="id"
            prepend-icon="mdi-account"
            label="Customer"
          />
        </div>

        <div class="py-4">
          <div class="font-bold text-lg my-4">Concept(s) Details</div>
          <div>
            <v-autocomplete
              :items="concepts"
              item-title="name"
              item-value="id"
              prepend-icon="mdi-account"
              label="AdminPack Concept"
            />
          </div>

          <div class="grid grid-cols-2">
            <v-btn color="primary" density="compact" icon @click="addConcept"><v-icon>mdi-plus</v-icon></v-btn>
          </div>
          <v-table density="compact">
            <thead>
              <tr>
                <th class="text-left"></th>
                <th class="text-left">Concept</th>
                <th class="text-left">No. receipt</th>
                <th class="text-left">No. Boleto</th>
                <th class="text-left">Amount</th>
                <th class="text-left">IVA</th>
                <th class="text-left">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in form.concepts" :key="`reference-charge-${index}`">
                <td>
                  <v-btn icon color="red" density="compact" @click="removeConcept(index)">
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                </td>
                <td><v-text-field v-model="item.concept" /></td>
                <td><v-text-field v-model="item.noReceipt" /></td>
                <td><v-text-field v-model="item.noBoleto" /></td>
                <td><v-text-field v-model="item.amount" /></td>
                <td><v-text-field v-model="item.iva" /></td>
                <td>{{ parseFloat(item.amount) + parseFloat(item.iva) }}</td>
                <td><v-text-field v-model="item.reference" /></td>
              </tr>
            </tbody>
          </v-table>
          <div class="grid grid-cols-2">
            <div>Subtotal</div>
            <div>{{ formatToCurrency(1000) }}</div>
            <div>IVA</div>
            <div>{{ formatToCurrency(160) }}</div>
            <div>Total</div>
            <div>{{ formatToCurrency(1160) }}</div>
          </div>
          <div class="font-bold text-lg my-4">Ticket Details</div>
          <div class="grid grid-cols-2">
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
