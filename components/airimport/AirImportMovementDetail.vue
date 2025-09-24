<template>
  <div>
    <v-card class="mb-4">
      <v-card-title>
        <div class="flex justify-between">
          <div class="flex items-center gap-2">
            <v-icon size="x-small">mdi-airplane</v-icon>
            <div>Air {{ airImpoExo }} information #{{ airReference.reference_number }}</div>
          </div>
          <div>
            <v-btn icon size="x-small" @click="showInfo = !showInfo" color="blue-grey-darken-2">
              <v-icon v-if="showInfo">mdi-eye-outline</v-icon>
              <v-icon v-if="!showInfo">mdi-eye-closed</v-icon>
            </v-btn>
          </div>
        </div>
      </v-card-title>
      <v-card-text v-show="showInfo">
        <div class="grid grid-cols-2 gap-2">
          <div>
            <div class="grid grid-cols-[auto_1fr] gap-1">
              <div>Airline</div>
              <div>{{ airReference.airline?.name }}</div>
              <div>Origin</div>
              <div>{{ airReference.origin }}</div>
              <div>Destination</div>
              <div>{{ airReference.destination }}</div>
            </div>
          </div>
          <div>
            <div class="grid grid-cols-[auto_1fr] gap-1">
              <div>Consignee</div>
              <div>{{ airReference.consignee?.name }}</div>
              <div>
                <v-icon size="small">mdi-account-tie-outline</v-icon>
                Executive
              </div>
              <div>{{ airReference.executive?.name || 'No executive' }}</div>

              <div>
                <v-icon size="small">mdi-credit-card-outline</v-icon>
                Credit days
              </div>
              <div>{{ airReference.credit_days || 0 }} days</div>

              <div>
                <v-icon size="small">mdi-calendar-month-outline</v-icon>
                Credit expiration date
              </div>
              <div>{{ creditExpirationDate }}</div>

              <div>
                <v-icon size="small">mdi-calendar-month-outline</v-icon>
                Created at
              </div>
              <div>{{ formatDateString(airReference.created_at) }}</div>
              <div>Shipper</div>
              <div>{{ airReference.shipper }}</div>
              <div>Origin Freight Forwarder</div>
              <div>{{ airReference.origin_ff?.name }}</div>
            </div>
          </div>
        </div>

        <v-card v-if="isFromTracker" density="compact" class="dark:bg-neutral-700! my-4">
          <v-card-title> Tracker information </v-card-title>
          <v-card-text>
            <div class="flex gap-2 items-center">
              <TrackerAirPONumbers :trackerPos="airReference.tracker_pos" />
              <TrackerAirMoreInfo :trackerRef="airReference.tracker_ref" />
              <TrackerSyncAlerts :sync-alerts="airReference.tracker_sync_alerts" />
            </div>
          </v-card-text>
        </v-card>

        <v-card density="compact" class="my-2">
          <v-card-title>
            <div class="flex justify-between">
              <div class="flex items-center">
                <v-icon size="x-small">mdi-routes</v-icon>
                <div class="ml-2 font-bold">Routes</div>
              </div>
            </div>
          </v-card-title>
          <v-card-text>
            <div class="grid grid-cols-2 gap-2">
              <div class="">
                <div class="grid grid-cols-3 gap-2">
                  <div class="col-span-3 p-2 font-bold bg-neutral-300 dark:bg-neutral-700">
                    <div class="flex items-center justify-center gap-2">
                      <v-icon>mdi-airplane-takeoff</v-icon>
                      Departures
                    </div>
                  </div>
                  <template v-for="(airRoute, index) in airReference.transits" :key="`air-departure-${index}`">
                    <div>{{ airRoute.departure_airport?.full_name }}</div>
                    <div>{{ formatDateOnlyString(airRoute.departure_date) }}</div>
                    <div>
                      <v-icon>mdi-arrow-right-circle</v-icon>
                    </div>
                  </template>
                </div>
              </div>
              <div class="">
                <div class="grid grid-cols-3 gap-2">
                  <div class="col-span-3 p-2 text-center font-bold bg-neutral-300 dark:bg-neutral-700">
                    <div class="flex items-center justify-center gap-2">
                      <v-icon>mdi-airplane-landing</v-icon>
                      Arrivals
                    </div>
                  </div>
                  <template v-for="(airRoute, index) in airReference.transits" :key="`air-departure-${index}`">
                    <div>{{ airRoute.arrival_airport?.full_name }}</div>
                    <div>{{ formatDateOnlyString(airRoute.arrival_date) }}</div>
                    <div>
                      {{ airRoute.destination }}
                    </div>
                  </template>
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>

        <div class="grid grid-cols-2 gap-2 mt-4">
          <div>
            <v-card density="compact" class="mb-2">
              <v-card-title>
                <div class="flex justify-between">
                  <div class="flex items-center">
                    <v-icon size="x-small">mdi-multicast</v-icon>
                    <div class="ml-2 font-bold">Master BLs</div>
                  </div>
                </div>
              </v-card-title>
              <v-card-text>
                <v-table density="compact">
                  <thead>
                    <tr>
                      <th class="text-left">Master AWB #</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{{ airReference.master_awb }}</td>
                    </tr>
                  </tbody>
                </v-table>
              </v-card-text>
            </v-card>
          </div>
          <div>
            <v-card density="compact" class="mb-2">
              <v-card-title>
                <div class="flex justify-between">
                  <div class="flex items-center">
                    <v-icon size="x-small">mdi-multicast</v-icon>
                    <div class="ml-2 font-bold">House AWBs</div>
                  </div>
                </div>
              </v-card-title>
              <v-card-text>
                <v-table density="compact">
                  <thead>
                    <tr>
                      <th class="text-left">House AWB #</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(item, index) in houseAWBs" :key="`hbl-${index}`">
                      <td>{{ item.name }}</td>
                    </tr>
                  </tbody>
                </v-table>
              </v-card-text>
            </v-card>
          </div>
        </div>

        <!-- CBMs -->
        <AirReferenceDetailCBMs :airReference="airReference" />

        <v-card density="compact" class="mb-4">
          <v-card-text>
            <!-- Tabla de cargos -->
            <div class="py-4">
              <div class="font-bold">Air service concepts details</div>
              <v-table density="compact">
                <thead>
                  <tr>
                    <th class="font-bold!">Charge</th>
                    <th class="font-bold!">F/D AWB</th>
                    <th class="font-bold! bg-slate-100">Buy amount</th>
                    <th class="font-bold! bg-slate-100">Sell amout</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="!hasCharges">
                    <td colspan="4" class="text-center">No charges found</td>
                  </tr>
                  <tr v-if="hasCharges">
                    <td colspan="2"></td>
                    <td class="font-bold!">BUY</td>
                    <td class="font-bold!">SELL</td>
                  </tr>

                  <tr v-if="hasCharges" v-for="(charge, index) in charges" :key="`air-charge-${index}`">
                    <td>
                      <div class="flex gap-2">
                        <v-icon size="small">{{ linkedChargeToInvoice(charge) }}</v-icon>
                        {{ charge.charge?.name }}
                      </div>
                    </td>
                    <td>{{ charge.fuera_dentro_awb === 'F' ? 'Fuera de AWB' : 'Dentro de AWB' }}</td>

                    <td>
                      <div v-if="charge.buy_amount">
                        {{ formatToCurrency(charge.buy_amount) }} {{ charge.buy_currency?.code }}
                      </div>
                    </td>
                    <td>
                      <div v-if="charge.sell_amount">
                        {{ formatToCurrency(charge.sell_amount) }} {{ charge.sell_currency?.code }}
                      </div>
                    </td>
                  </tr>
                </tbody>
              </v-table>
              
            </div>
          </v-card-text>
        </v-card>

        <AirServiceCustomerInvoices :airReferenceId="airReference.id" />

        <v-card color="light-blue-lighten-4" class="my-4">
          <v-card-title><div class="font-bold">Supplier invoices & payments</div></v-card-title>
          <v-card-text>
            <AirSupplierInvoices :airReferenceId="airReference.id" />
          </v-card-text>
        </v-card>

        <v-card color="red-lighten-4" class="mb-4">
          <v-card-title><div class="font-bold">Refunds</div></v-card-title>
          <v-card-text>
            <AirRefunds :airReferenceId="airReference.id" />
          </v-card-text>
        </v-card>

        <AirProfitOverview :airReferenceId="airReference.id" />
      </v-card-text>
    </v-card>
  </div>
</template>
<script setup lang="ts">
const props = defineProps({
  airReference: {
    type: Object,
    required: true,
  },
})

const showInfo = ref(true)

const creditExpirationDate = computed(() => {
  if (!props.airReference.credit_days) return ''
  const expirationDate = new Date(props.airReference.created_at)
  expirationDate.setDate(expirationDate.getDate() + props.airReference.credit_days)
  return formatDateOnlyString(expirationDate)
})

const isFromTracker = computed(() => {
  return props.airReference.source_system_id === 2
})

const airImpoExo = computed(() => {
  return props.airReference.impoExpo === 'I' ? 'Import' : 'Export'
})

const houseAWBs = computed(() => {
  return props.airReference.house_awbs || []
})

const charges = computed(() => {
  return props.airReference.charges || []
})

const hasCharges = computed(() => {
  return charges.value.length > 0
})

const linkedChargeToInvoice = (charge: any) => {
  if (charge.invoice_charge != null) {
    return 'mdi-link'
  }
  return 'mdi-link-off'
}

const boxColorBuyOwner = (charge: any) => {
  return {
    'w-5 h-5 bg-yellow-300': charge.buy_owner_value === 'Freight line',
    'w-5 h-5 bg-red-200': charge.buy_owner_value === 'Supplier',
  }
}

const getConceptIva = (concept: any) => {
  return concept.is_con_iva ? parseFloat(concept.amount) * 0.16 : 0
}

const getConceptTotal = (concept: any) => {
  return parseFloat(concept.amount) + getConceptIva(concept)
}

useHead({
  title: `#${props.airReference.reference_number} - View details`,
})
</script>
