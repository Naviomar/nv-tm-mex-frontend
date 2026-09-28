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
              <th class="font-bold!">Empty return date</th>
              <th class="font-bold!">Amount</th>
              <th class="font-bold!">Last calculation</th>
              <th class="font-bold!">Invoice status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, index) in rows" :key="`dem-row-${index}`">
              <td>Demurrage {{ row.container.container_number }}</td>
              <td>{{ row.container.demurrage?.end_date ? formatDateOnlyString(row.container.demurrage.end_date) : '-' }}</td>
              <td>
                <template v-if="row.charge">
                  {{ formatToCurrency(row.charge.amount) }} {{ getCurrencyName(row.charge.currency_id) }}
                  {{ row.charge.is_con_iva == 1 ? '+ IVA' : '' }}
                </template>
                <template v-else-if="row.container.demurrage">
                  {{ formatToCurrency(row.container.demurrage.amount) }} USD
                  {{ Number(row.container.demurrage.amount_iva) > 0 ? '+ IVA' : '' }}
                </template>
                <template v-else>-</template>
              </td>
              <td>
                <template v-if="row.container.demurrage">
                  {{ row.container.demurrage.is_parcial ? 'Partial' : 'Total' }} @
                  {{ formatDateString(row.container.demurrage.updated_at) }}
                </template>
                <v-chip v-else size="small" color="grey">No calculation</v-chip>
              </td>
              <td>
                <template v-if="row.charge">
                  <v-chip size="small" color="success" v-if="row.charge.invoice_charge">Linked invoice</v-chip>
                  <v-chip size="small" color="amber" v-else>Pending</v-chip>
                </template>
                <v-chip v-else-if="row.container.demurrage" size="small" color="grey" variant="outlined">
                  No charge generated
                </v-chip>
                <template v-else>-</template>
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
    default: () => [],
  },
  referencia: {
    type: Object as PropType<any>,
    required: true,
    default: () => ({}),
  },
})

const rows = computed(() => {
  const containers = props.referencia.containers ?? []
  return containers.flatMap((container: any) => {
    const containerCharges = (props.charges ?? []).filter((c: any) => c.reference_container_id === container.id)
    if (containerCharges.length === 0) return [{ container, charge: null }]
    return containerCharges.map((charge: any) => ({ container, charge }))
  })
})
</script>
