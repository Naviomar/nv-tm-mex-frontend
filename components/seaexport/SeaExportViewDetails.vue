<template>
  <div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <v-card class="mb-4">
          <v-card-title><div class="font-bold">Sea Export information</div></v-card-title>
          <v-card-text>
            <div class="grid grid-cols-2">
              <div class="font-bold">Reference #</div>
              <div class="font-bold">{{ referencia.reference_number }}</div>

              <div>Booking Number #</div>
              <div>{{ referencia.booking_number }}</div>

              <div>Line</div>
              <div>{{ referencia.line?.name }}</div>

              <div>Vessel / Voyage / destination</div>
              <div>{{ referencia.voyage_discharge?.name }}</div>

              <div>Origin</div>
              <div>{{ referencia.origin?.name }}</div>

              <div>POD</div>
              <div>{{ referencia.pod?.name }}</div>

              <div>POL</div>
              <div>{{ referencia.pol?.name }}</div>

              <div>Destination</div>
              <div>{{ referencia.destination?.name }}</div>
              <div class="col-span-2">
                <v-divider />
              </div>
              <div>Booking number</div>
              <div>{{ referencia.booking_number }}</div>
              <div>P.O.</div>
              <div>{{ referencia.po_num }}</div>
              <div class="col-span-2">
                <v-divider />
              </div>
            </div>
          </v-card-text>
        </v-card>
      </div>
      <div>
        <v-card class="mb-4">
          <v-card-title><div class="font-bold">Customer info</div></v-card-title>
          <v-card-text>
            <div class="grid grid-cols-2">
              <div>Consignee</div>
              <div>{{ referencia.consignee?.name }}</div>

              <div>Executive</div>
              <div>{{ referencia.executive?.name || 'No executive' }}</div>

              <div>Credit days</div>
              <div>{{ referencia.credit_days || 0 }} days</div>

              <div>Credit expiration date</div>
              <div>{{ creditExpirationDate }}</div>

              <div>Created at</div>
              <div>{{ formatDateString(referencia.created_at) }}</div>

              <div>Shipper</div>
              <div>{{ referencia.shipper?.name }}</div>

              <div>Notify</div>
              <div>{{ referencia.notify }}</div>

              <div>Release typing</div>
              <div>{{ referencia.release_type }}</div>

              <div>Release agent</div>
              <div>{{ referencia.release_agent?.name }}</div>
            </div>
          </v-card-text>
        </v-card>
      </div>

      <v-card class="mb-4">
        <v-card-title><div class="font-bold">Master BLs</div></v-card-title>
        <v-card-text>
          <v-table density="compact">
            <thead>
              <tr>
                <th class="text-left">Master BL #</th>
                <th class="text-left">Consignee MBL</th>
                <th class="text-left">Type</th>
                <th class="text-left">Attachment</th>
                <th class="text-left">Created by</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in referencia.master_bls" :key="`mbl-${index}`">
                <td>{{ item.name }}</td>
                <td>{{ item.consignee_mbl?.name }}</td>
                <td>{{ item.type }}</td>
                <td>
                  <ButtonDownloadS3Object :s3Path="item.attachment" />
                </td>
                <td>{{ item.created_by?.name }}</td>
              </tr>
            </tbody>
          </v-table>
        </v-card-text>
      </v-card>

      <v-card class="mb-4">
        <v-card-title><div class="font-bold">House BLs</div></v-card-title>
        <v-card-text>
          <v-table density="compact">
            <thead>
              <tr>
                <th class="text-left">House BL #</th>
                <th class="text-left">Consignee</th>
                <th class="text-left">Type</th>
                <th class="text-left">Attachment</th>
                <th class="text-left">Created by</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in referencia.house_bls" :key="`hbl-${index}`">
                <td>{{ item.name }}</td>
                <td>{{ item.consignee?.name }}</td>
                <td>{{ item.type }}</td>
                <td>
                  <ButtonDownloadS3Object :s3Path="item.attachment" />
                </td>
                <td>{{ item.created_by?.name }}</td>
              </tr>
            </tbody>
          </v-table>
        </v-card-text>
      </v-card>

      <div class="col-span-2">
        <v-card class="mb-4">
          <v-card-title><div class="font-bold">Cargo details</div></v-card-title>
          <v-card-text>
            <div class="grid grid-cols-2">
              <div>Condition type</div>
              <div>{{ referencia.cargo_type }}</div>

              <div>Tipo de embalaje</div>
              <div>{{ referencia.embalaje?.name }}</div>

              <div>Commodity description</div>
              <div>
                {{ referencia.commodity }}
              </div>
            </div>
            <v-table density="compact">
              <thead>
                <tr>
                  <th class="text-left">Container #</th>
                  <th class="text-left">Type</th>
                  <th class="text-left">m<sup>3</sup></th>
                  <th class="text-left">Kgs</th>
                  <th class="text-left"># Paquetes</th>
                  <th class="text-left">notes</th>
                  <th class="text-left">Created by</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in referencia.containers" :key="`container-${index}`">
                  <td>
                    <div class="flex items-center gap-2">
                      <div v-if="item.demurrage">
                        <v-tooltip text="Demurrages">
                          <template v-slot:activator="{ props }">
                            <v-icon v-bind="props" color="warning">mdi-timer-outline</v-icon>
                          </template>
                        </v-tooltip>
                      </div>
                      {{ item.container_number }}
                    </div>
                  </td>
                  <td>{{ item.container_type?.name }}</td>
                  <td>{{ item.volume }}</td>
                  <td>{{ item.weight }}</td>
                  <td>{{ item.num_packages }}</td>
                  <td>{{ item.notes }}</td>
                  <td>{{ item.creator?.name }}</td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>
        </v-card>
      </div>

      <div class="col-span-2">
        <v-card class="mb-4">
          <v-card-title><div class="font-bold">Rates</div></v-card-title>
          <v-card-text>
            <div v-if="!hasBuyCharges">
              <v-alert type="info" density="compact" variant="tonal"> No buy rates found </v-alert>
            </div>
            <div class="font-bold text-lg">Buy rate breakdown</div>
            <v-table density="compact">
              <thead>
                <tr>
                  <th class="text-left">#</th>
                  <th class="text-left">Master BL</th>
                  <th class="text-left">Concept</th>
                  <th class="text-left">Amount</th>

                  <th class="text-left">Currency</th>
                  <th class="text-left">Created by</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(bcharge, idx) in referencia.buy_rate_breakdown" :key="`buy-charge-${idx}`">
                  <td>{{ bcharge.id }}</td>
                  <td>{{ bcharge.reference_master_bl?.name }}</td>
                  <td>{{ bcharge.charge?.name }}</td>
                  <td>{{ formatToCurrency(bcharge.amount) }}</td>
                  <td>{{ bcharge.currency?.name }}</td>
                  <td>{{ bcharge.created_by?.name }}</td>
                </tr>
              </tbody>
            </v-table>

            <v-divider class="my-4"></v-divider>

            <div v-if="!hasSellCharges">
              <v-alert type="info" density="compact"> No sell rates found </v-alert>
            </div>
            <div class="font-bold text-lg">Sell rate breakdown</div>
            <v-table density="compact">
              <thead>
                <tr>
                  <th class="text-left">#</th>
                  <th class="text-left">Master BL</th>
                  <th class="text-left">Concept</th>
                  <th class="text-left">Amount</th>
                  <th class="text-left">Currency</th>
                  <th class="text-left">+ IVA</th>
                  <th class="text-left">TM/WM</th>
                  <th class="text-left">Created by</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(scharge, idx) in referencia.sell_rate_breakdown" :key="`sell-charge-${idx}`">
                  <td>{{ scharge.id }}</td>
                  <td>{{ scharge.reference_master_bl?.name }}</td>
                  <td>{{ scharge.charge?.name }}</td>
                  <td>{{ formatToCurrency(scharge.amount) }}</td>
                  <td>{{ scharge.currency?.name }}</td>
                  <td>{{ scharge.is_con_iva ? 'Si' : 'No' }}</td>
                  <td>
                    {{ scharge.inv_type }}
                  </td>
                  <td>{{ scharge.created_by?.name }}</td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>
        </v-card>
      </div>

      <div class="col-span-2">
        <v-card class="">
          <v-card-title><div class="font-bold">Charges</div></v-card-title>
          <v-card-text>
            <div v-if="!hasCharges">
              <v-alert type="info" density="compact"> No charges found </v-alert>
            </div>
            <v-table density="compact">
              <thead>
                <tr>
                  <th class="font-bold! w-32">Actions</th>
                  <th class="font-bold!"></th>
                  <th class="font-bold!">Charge</th>
                  <th class="font-bold!">F/D BL</th>
                  <th class="font-bold!">Type</th>
                  <th class="font-bold!">Base</th>
                  <th class="font-bold! bg-slate-100">Buy amount</th>
                  <th class="font-bold! bg-slate-100">Sell amout</th>
                  <th class="font-bold!">Buy owner</th>
                  <th class="font-bold!">Created at</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="!hasCharges">
                  <td colspan="10" class="text-center">No charges found</td>
                </tr>
                <tr v-if="hasCharges">
                  <td colspan="6"></td>
                  <td class="font-bold!">BUY</td>
                  <td class="font-bold!">SELL</td>
                  <td colspan="2"></td>
                </tr>

                <tr
                  v-if="hasCharges"
                  v-for="(exportCharge, index) in referencia.export_charges"
                  :key="`sea-export-charge-${index}`"
                >
                  <td></td>
                  <td>
                    <div class="flex items-center gap-2">
                      <v-icon size="small">{{ linkedChargeToInvoice(exportCharge) }}</v-icon>
                      <div :class="boxColorBuyOwner(exportCharge)"></div>
                      <v-chip size="small" color="primary">{{ exportCharge.inv_type }}</v-chip>
                    </div>
                  </td>
                  <td class="whitespace-nowrap">{{ exportCharge.charge?.name }}</td>
                  <td class="whitespace-nowrap">{{ exportCharge.fuera_dentro_bl_value }}</td>
                  <td class="whitespace-nowrap">{{ exportCharge.charge_type_value }}</td>
                  <td class="whitespace-nowrap">
                    <v-tooltip :text="`${exportCharge.base_quantity} * ${formatToCurrency(exportCharge.buy_amount)}`">
                      <template v-slot:activator="{ props }">
                        <div class="flex items-center gap-1">
                          {{ exportCharge.base_quantity }}
                          <v-icon v-bind="props" size="small">mdi-information-outline</v-icon>
                        </div>
                      </template>
                    </v-tooltip>
                  </td>
                  <td class="">
                    <span v-if="exportCharge.buy_owner">
                      <div>
                        {{ formatToCurrency(exportCharge.buy_total) }} {{ exportCharge.buy_currency?.code }}
                        {{ exportCharge.buy_iva > 0 ? 'has IVA' : '' }}
                        <v-chip size="small">{{ exportCharge.buy_type_value }}</v-chip>
                      </div>
                    </span>
                  </td>
                  <td class="">
                    <span v-if="exportCharge.is_sell">
                      {{ formatToCurrency(exportCharge.sell_total) }} {{ exportCharge.sell_currency?.code }}
                      {{ exportCharge.sell_iva > 0 ? 'has IVA' : '' }}
                      <v-chip size="small">{{ exportCharge.sell_type_value }}</v-chip>
                    </span>
                  </td>

                  <td>{{ exportCharge.buy_owner_value }}</td>
                  <td class="whitespace-nowrap">
                    <UserInfoBadge :item="exportCharge">
                      {{ formatDateString(exportCharge.created_at) }}
                    </UserInfoBadge>
                  </td>
                </tr>
              </tbody>
            </v-table>

            <div v-if="hasSomeDetentions" class="col-span-3">
              <div class="font-bold text-lg">Detentions</div>
              <v-table density="compact">
                <thead>
                  <tr>
                    <th class="font-bold!">Container</th>
                    <th class="font-bold!">Type</th>
                    <th class="font-bold!">Days</th>
                    <th class="font-bold!">Line amount</th>
                    <th class="font-bold!">Customer amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(container, index) in referencia.containers" :key="`detention-cont-${index}`">
                    <td>{{ container.container_number }}</td>
                    <td>{{ container.container_type?.name }}</td>
                    <td>
                      {{ container.detention?.days }}
                    </td>
                    <td>
                      {{ formatToCurrency(container.detention?.amount_line) }}
                    </td>
                    <td>
                      {{ formatToCurrency(container.detention?.amount_customer) }}
                    </td>
                  </tr>
                </tbody>
              </v-table>
            </div>
          </v-card-text>
        </v-card>
      </div>

      <div class="col-span-2">
        <v-card color="" class="">
          <v-card-title><div class="font-bold">Credit / Debit note(s)</div></v-card-title>
          <v-card-text>
            <FfNotesViewDetails :ffNotes="referencia.ff_notes" />
          </v-card-text>
        </v-card>
      </div>

      <div class="col-span-2">
        <v-card color="light-blue-lighten-4" class="">
          <v-card-title><div class="font-bold">Customer invoices & payments</div></v-card-title>
          <v-card-text>
            <SeaServiceCustomerInvoices :referenceId="referencia.id" />
          </v-card-text>
        </v-card>
      </div>

      <div class="col-span-2">
        <v-card color="light-blue-lighten-4" class="">
          <v-card-title><div class="font-bold">Line invoices & payments</div></v-card-title>
          <v-card-text>
            <SeaImportLinePaymentsDetails :referencia="referencia" />
          </v-card-text>
        </v-card>
      </div>

      <div class="col-span-2">
        <v-card color="light-blue-lighten-4" class="mb-4">
          <v-card-title><div class="font-bold">Supplier invoices & payments</div></v-card-title>
          <v-card-text>
            <SeaImportSupplierInvoices :referenceId="referencia.id" />
          </v-card-text>
        </v-card>
      </div>
    </div>

    <div class="col-span-2">
      <v-card color="red-lighten-4" class="">
        <v-card-title><div class="font-bold">Refunds</div></v-card-title>
        <v-card-text>
          <SeaImportRefunds :referenceId="referencia.id!" />
        </v-card-text>
      </v-card>
    </div>

  </div>
</template>
<script setup lang="ts">
import { currencies } from '@/utils/data/systemData'
const { $api } = useNuxtApp()
const loadingStore = useLoadingStore()

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
})

const referencia = ref<any>({})

const boxColorBuyOwner = (charge: any) => {
  return {
    'w-5 h-5 bg-yellow-300': charge.buy_owner_value === 'Freight line',
    'w-5 h-5 bg-red-200': charge.buy_owner_value === 'Supplier',
  }
}

const linkedChargeToInvoice = (charge: any) => {
  if (charge.invoice_charge != null) {
    return 'mdi-link'
  }
  return 'mdi-link-off'
}

const creditExpirationDate = computed(() => {
  if (!referencia.value?.credit_days) return ''
  const expirationDate = new Date(referencia.value.created_at)
  expirationDate.setDate(expirationDate.getDate() + referencia.value.credit_days)
  return formatDateOnlyString(expirationDate)
})

const hasBuyCharges = computed(() => {
  return referencia.value?.buy_rate_breakdown?.length > 0
})

const hasSellCharges = computed(() => {
  return referencia.value?.sell_rate_breakdown?.length > 0
})

const hasSomeDetentions = computed(() => {
  return referencia.value.containers?.some((container: any) => container.detention != null)
})

const hasCharges = computed(() => {
  return referencia.value?.export_charges?.length > 0
})

const hasWmInvoices = computed(() => {
  return referencia.value?.invoice_wms_all?.length > 0
})

const hasTmInvoices = computed(() => {
  return referencia.value?.invoice_tms_all?.length > 0
})

const invoiceWmTotal = (invoiceWm: any) => {
  return invoiceWm.concepts.reduce((acc: number, concept: any) => {
    return acc + parseFloat(concept.amount)
  }, 0)
}

const invoiceTmTotal = (invoiceTm: any) => {
  return invoiceTm.concepts.reduce((acc: number, concept: any) => {
    return acc + parseFloat(concept.amount)
  }, 0)
}

const getCurrenciesTotal = (invoice: any) => {
  if (!invoice.invoice_total) return []
  const totales = Object.keys(invoice.invoice_total).map((currency_id: any) => {
    console.log('currency_id', currency_id)
    console.log('total', invoice.invoice_total[currency_id])
    const currency = currencies.find((c) => c.id == currency_id)
    return `${currency?.name}: ${formatToCurrency(invoice.invoice_total[currency_id])}`
  })
  return totales
}

const getData = async () => {
  try {
    loadingStore.loading = true
    const response = (await $api.referencias.getSeaExportFullDetailById(props.id)) as any

    referencia.value = response
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

await getData()

useHead({
  title: `#${referencia.value.reference_number} View details`,
})
</script>
