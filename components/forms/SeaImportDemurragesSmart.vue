<template>
  <div>
    <v-card density="compact" class="mb-2">
      <v-card-title>
        <div class="flex justify-between">
          <div class="flex items-center">
            <v-icon size="x-small">mdi-counter</v-icon>
            <div class="ml-2 font-bold">Demurrage charge(s)</div>
          </div>
        </div>
      </v-card-title>
      <v-card-subtitle>Demurrages in reference</v-card-subtitle>
      <v-card-text>
        <v-table density="compact">
          <thead>
            <tr>
              <th class="font-bold!">Charge</th>
              <th class="font-bold!">Amount</th>
              <th class="font-bold!">Last calculation</th>

              <th class="font-bold!">Invoice status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(demCharge, index) in charges" :key="`dem-charge-${index}`">
              <td>Demurrage {{ demCharge.reference_container?.container_number }}</td>
              <td>
                {{ formatToCurrency(demCharge.amount) }} {{ getCurrencyName(demCharge.currency_id) }}
                {{ demCharge.is_con_iva == 1 ? '+ IVA' : '' }}
              </td>
              <td>{{ getInfoParcialTotal(demCharge) }} @ {{ formatDateString(getLastCalc(demCharge)) }}</td>

              <td>
                <v-chip size="small" color="success" v-if="demCharge.invoice_charge">Linked invoice</v-chip>
                <v-chip size="small" color="amber" v-else>Pending</v-chip>
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card-text>
    </v-card>
  </div>
</template>
<script setup lang="ts">
const props = defineProps({
  charges: {
    type: Array as PropType<any[]>,
    required: false,
  },
  referencia: {
    type: Object as PropType<any>,
    required: true,
    default: () => ({}),
  },
})

const getInfoParcialTotal = (charge: any) => {
  // find charge.reference_container_id in referencia.containers then in demurrage key find is_parcial
  const container = props.referencia.containers.find((container: any) => container.id === charge.reference_container_id)
  if (!container) return ''
  return container.demurrage?.is_parcial ? 'Parcial' : 'Total'
}

const getLastCalc = (charge: any) => {
  const container = props.referencia.containers.find((container: any) => container.id === charge.reference_container_id)
  if (!container) return ''
  return container.demurrage?.updated_at
}
</script>
