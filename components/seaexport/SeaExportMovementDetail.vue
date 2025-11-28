<template>
  <div>
    <v-card class="mb-4">
      <v-card-title>
        <div class="flex justify-between">
          <div class="flex items-center gap-2">
            <v-icon size="x-small">mdi-ship-wheel</v-icon>
            <div class="flex items-center gap-2">
              <div>Sea Export information #{{ referencia.reference_number }}</div>
              <UserInfoBadge :item="referencia" />
            </div>
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
            <div class="grid grid-cols-2 gap-1">
              <div>Customer</div>
              <div>{{ referencia.consignee?.name }}</div>
              <div>Executive</div>
              <div>{{ referencia.executive?.name }}</div>
              <div>Credit days</div>
              <div>{{ referencia.credit_days }}</div>
              <div>Line</div>
              <div>{{ referencia.line?.commercial_name }}</div>
              <div>Vessel departure</div>
              <div>{{ referencia.vessel_departure?.name }}</div>
              <div>Departure voyage</div>
              <div>{{ referencia.voyage_departure }}</div>

              <div>Freight forwarder</div>
              <div>{{ referencia.freight_forwarder?.name }}</div>
              <div>Booking Number</div>
              <div>{{ referencia.booking_number }}</div>
            </div>
          </div>
          <div>
            <div class="grid grid-cols-2 gap-1">
              <div>Region</div>
              <div>{{ referencia.sea_region?.name }}</div>
              <div>Voyage discharge</div>
              <div>{{ referencia.voyage_discharge?.name }}</div>
              <div>ETD</div>
              <div>{{ referencia.etd_date }}</div>
              <div>ETA</div>
              <div>{{ formatDateOnlyString(referencia.eta_date) }}</div>
              <div>Origin</div>
              <div>{{ referencia.origin_port?.name }}</div>
              <div>POL</div>
              <div>{{ referencia.pol?.name }}</div>
              <div>POD</div>
              <div>{{ referencia.pod?.name }}</div>
              <div>Destination</div>
              <div>{{ referencia.destination?.name }}</div>
            </div>
          </div>
        </div>

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
                      <th class="text-left">Master BL #</th>
                      <th class="text-left">Attachment</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(item, index) in masterBls" :key="`mbl-${index}`">
                      <td>{{ item.name }}</td>
                      <td>
                        <ButtonDownloadS3Object :s3Path="item.attachment" />
                      </td>
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
                    <div class="ml-2 font-bold">House BLs</div>
                  </div>
                </div>
              </v-card-title>
              <v-card-text>
                <v-table density="compact">
                  <thead>
                    <tr>
                      <th class="text-left">House BL #</th>
                      <th class="text-left">Attachment</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(item, index) in houseBls" :key="`hbl-${index}`">
                      <td>{{ item.name }}</td>
                      <td>
                        <ButtonDownloadS3Object :s3Path="item.attachment" />
                      </td>
                    </tr>
                  </tbody>
                </v-table>
              </v-card-text>
            </v-card>
          </div>
        </div>

        <div class="my-4">
          <SeaCargoDetails :referencia="referencia" />
        </div>

        <v-card density="compact" class="mb-4">
          <v-card-text>
            <!-- Tabla de cargos -->
            <div class="py-4">
              <div class="font-bold">Charge details</div>
              <div class="flex gap-2 mb-2">
                <div class="w-5 h-5 bg-yellow-300"></div>
                <div>Freight line</div>
                <div class="w-5 h-5 bg-red-200"></div>
                <div>Supplier</div>
              </div>
              <v-table density="compact">
                <thead>
                  <tr>
                    <th class="font-bold!"></th>
                    <th class="font-bold!">Charge</th>
                    <th class="font-bold!">F/D BL</th>
                    <th class="font-bold!">Buy amount</th>
                    <th class="font-bold!">Sell amout</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="!hasCharges">
                    <td colspan="5" class="text-center">No charges found</td>
                  </tr>
                  <tr v-if="hasCharges">
                    <td colspan="3"></td>
                    <td class="font-bold!">BUY</td>
                    <td class="font-bold!">SELL</td>
                  </tr>

                  <tr v-if="hasCharges" v-for="charge in charges" :key="`charge-${charge.id}`">
                    <td>
                      <div :class="boxColorBuyOwner(charge)"></div>
                    </td>
                    <td>{{ charge.charge?.name }}</td>
                    <td>{{ charge.fuera_dentro_bl === 'F' ? 'Fuera de BL' : 'Dentro de BL' }}</td>

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
      </v-card-text>
    </v-card>

    <v-card color="" class="mb-4">
      <v-card-title><div class="font-bold">Credit / Debit note(s)</div></v-card-title>
      <v-card-text>
        <FfNotesViewDetails :ffNotes="referencia.ff_notes" />
      </v-card-text>
    </v-card>

    <v-card color="light-blue-lighten-4" class="mb-4">
      <v-card-title><div class="font-bold">Customer invoices & payments</div></v-card-title>
      <v-card-text>
        <SeaServiceCustomerInvoices :referenceId="referencia.id!" />
      </v-card-text>
    </v-card>

    <v-card color="light-blue-lighten-4" class="mb-4">
      <v-card-title><div class="font-bold">Line invoices & payments</div></v-card-title>
      <v-card-text>
        <SeaImportLinePaymentsDetails :referencia="referencia" />
      </v-card-text>
    </v-card>

    <v-card color="light-blue-lighten-4" class="mb-4">
      <v-card-title><div class="font-bold">Supplier invoices & payments</div></v-card-title>
      <v-card-text>
        <SeaImportSupplierInvoices :referenceId="referencia.id" />
      </v-card-text>
    </v-card>

    <v-card color="red-lighten-4" class="mb-4">
      <v-card-title><div class="font-bold">Refunds</div></v-card-title>
      <v-card-text>
        <SeaImportRefunds :referenceId="referencia.id!" />
      </v-card-text>
    </v-card>

    <SeaExportProfitOverview :referencia-id="referencia.id" />
  </div>
</template>
<script setup lang="ts">
const props = defineProps({
  referencia: {
    type: Object,
    required: true,
  },
})

const showInfo = ref(true)

const masterBls = computed(() => {
  return props.referencia.master_bls
})

const houseBls = computed(() => {
  return props.referencia.house_bls
})

const boxColorBuyOwner = (charge: any) => {
  return {
    'w-5 h-5 bg-yellow-300': charge.buy_owner === 'F',
    'w-5 h-5 bg-red-200': charge.buy_owner === 'S',
  }
}

const charges = computed(() => {
  return props.referencia.export_charges || []
})

const hasCharges = computed(() => {
  return charges.value.length > 0
})
</script>
