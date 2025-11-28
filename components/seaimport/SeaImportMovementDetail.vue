<template>
  <div>
    <v-card :color="darkMode.isDark ? 'cardBackground' : ''" class="mb-4">
      <v-card-title>
        <div class="flex justify-between">
          <div class="flex items-center gap-2">
            <v-icon size="x-small">mdi-ship-wheel</v-icon>
            <div class="flex items-center gap-2">
              <div>Sea Import information #{{ referencia.reference_number }}</div>
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
              <div>Shipper</div>
              <div>{{ referencia.shipper?.name }}</div>
              <div>Freight forwarder</div>
              <div>{{ referencia.freight_forwarder?.name }}</div>
              <div>Booking Number</div>
              <div>{{ referencia.booking_number }}</div>
              <div>P.O.</div>
              <div>{{ referencia.po_num }}</div>
              <div>Service contract</div>
              <div>{{ referencia.service_contract?.name }}</div>
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
              <div>{{ referencia.eta_date }}</div>
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

        <div class="flex flex-col gap-2 items-center">
          <TrackerSeaPONumbers :trackerPos="referencia.tracker_pos" :containers="referencia.containers" />
          <TrackerSeaMoreInfo :trackerRef="referencia.tracker_ref" />
          <TrackerSyncAlerts :sync-alerts="referencia.tracker_sync_alerts" />
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
                      <th class="text-left">Consginee</th>
                      <th class="text-left">Type</th>
                      <th class="text-left">Attachment</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(item, index) in masterBls" :key="`mbl-${index}`">
                      <td>{{ item.name }}</td>
                      <td>{{ item.consignee_mbl?.name }}</td>
                      <td>{{ item.type }}</td>
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
                      <th class="text-left">Consginee HBL</th>
                      <th class="text-left">Type</th>
                      <th class="text-left">Attachment</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(item, index) in houseBls" :key="`hbl-${index}`">
                      <td>{{ item.name }}</td>
                      <td>{{ item.consignee?.name }}</td>
                      <td>{{ item.type }}</td>
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
            <div class="font-bold mb-4">Rates</div>
            <div class="font-bold text-lg mb-2">Sell charges</div>
            <v-table density="compact" class="mb-4">
              <thead>
                <tr>
                  <th class="font-bold! text-left w-64">Charge</th>
                  <th class="font-bold! text-right">Amount</th>
                  <th class="font-bold! text-right">+ iva</th>
                  <th class="font-bold! text-right">Subtotal</th>
                  <th class="font-bold! w-32">TM/WM</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(charge, idx) in refSellCharges" :key="`ref-sell-charge-${idx}`">
                  <td>
                    {{ charge.charge?.name }}
                  </td>
                  <td class="text-right">
                    {{ formatToCurrency(charge.amount) }} {{ getCurrencyName(charge.currency_id) }}
                  </td>
                  <td class="text-right">
                    {{ formatToCurrency(getConceptIva(charge)) }}
                  </td>
                  <td class="text-right">
                    {{ formatToCurrency(getConceptTotal(charge)) }} {{ getCurrencyName(charge.currency_id) }}
                  </td>
                  <td class="text-right">
                    <v-chip size="small">{{ charge.inv_type }}</v-chip>
                  </td>
                </tr>
              </tbody>
            </v-table>
            <div class="font-bold text-lg mb-2">Local charges</div>
            <v-table density="compact" class="mb-4">
              <thead>
                <tr>
                  <th class="font-bold! text-left w-64">Charge</th>
                  <th class="font-bold! text-right">Amount</th>
                  <th class="font-bold! text-right">+ iva</th>
                  <th class="font-bold! text-right">Subtotal</th>
                  <th class="font-bold! w-32">TM/WM</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(charge, idx) in refCharges" :key="`ref-charge-${idx}`">
                  <td>
                    {{ charge.charge?.name }}
                  </td>
                  <td class="text-right">
                    {{ formatToCurrency(charge.amount) }} {{ getCurrencyName(charge.currency_id) }}
                  </td>
                  <td class="text-right">
                    {{ formatToCurrency(getConceptIva(charge)) }}
                  </td>
                  <td class="text-right">
                    {{ formatToCurrency(getConceptTotal(charge)) }} {{ getCurrencyName(charge.currency_id) }}
                  </td>
                  <td class="text-right">
                    <v-chip size="small">{{ charge.inv_type }}</v-chip>
                  </td>
                </tr>
              </tbody>
            </v-table>

            <div class="font-bold text-lg mb-4">Demurrage charges</div>
            <v-table density="compact" class="mb-4">
              <thead>
                <tr>
                  <th class="font-bold! text-left w-64">Charge</th>
                  <th class="font-bold! text-right">Amount</th>
                  <th class="font-bold! text-right">+ iva</th>
                  <th class="font-bold! text-right">Subtotal</th>
                  <th class="font-bold! w-32"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(charge, idx) in refDemurrageCharges" :key="`ref-charge-${idx}`">
                  <td>Demurrage #{{ charge.reference_container.container_number }}</td>
                  <td class="text-right">
                    {{ formatToCurrency(charge.amount) }} {{ getCurrencyName(charge.currency_id) }}
                  </td>
                  <td class="text-right">
                    {{ formatToCurrency(getConceptIva(charge)) }}
                  </td>
                  <td class="text-right">
                    {{ formatToCurrency(getConceptTotal(charge)) }} {{ getCurrencyName(charge.currency_id) }}
                  </td>
                  <td></td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="3" class="text-right font-bold">Total</td>
                  <td class="font-bold text-right">
                    {{ formatToCurrency(referenciaTotal) }}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </v-table>
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

    <SeaImportProfitOverview :referencia-id="referencia.id" />
  </div>
</template>
<script setup lang="ts">
const darkMode = useDarkMode()

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

const refSellCharges = computed(() => {
  return props.referencia?.sell_rate_breakdown
})

const refCharges = computed(() => {
  return props.referencia?.charges
})

const refDemurrageCharges = computed(() => {
  return props.referencia?.demurrage_charges
})

const getConceptIva = (concept: any) => {
  return concept.is_con_iva ? parseFloat(concept.amount) * 0.16 : 0
}

const getConceptTotal = (concept: any) => {
  return parseFloat(concept.amount) + getConceptIva(concept)
}

const referenciaTotal = computed(() => {
  if (!props.referencia) return 0

  const charges = refCharges.value.reduce((acc: number, charge: any) => {
    return acc + parseFloat(charge.amount) + (charge.is_con_iva ? parseFloat(charge.amount) * 0.16 : 0)
  }, 0)
  const sellCharges = refSellCharges.value.reduce((acc: number, charge: any) => {
    return acc + parseFloat(charge.amount) + (charge.is_con_iva ? parseFloat(charge.amount) * 0.16 : 0)
  }, 0)
  const demurrageCharges = refDemurrageCharges.value.reduce((acc: number, charge: any) => {
    return acc + parseFloat(charge.amount) + (charge.is_con_iva ? parseFloat(charge.amount) * 0.16 : 0)
  }, 0)

  return charges + sellCharges + demurrageCharges
})
</script>
