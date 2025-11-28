<template>
  <div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <v-card class="mb-4">
          <v-card-title><div class="font-bold">Sea Import information</div></v-card-title>
          <v-card-text>
            <div class="grid grid-cols-[auto_1fr] space-x-2">
              <div class="font-bold">Reference #</div>
              <div class="font-bold">
                <ServiceNumberLabel :service="referencia" />
              </div>

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

            <div class="py-1">
              <v-btn
                class="chip-gradient"
                size="small"
                :to="`/maritime/import/demurrages/reference-${referencia.id}-demurrages`"
                >Go to demurrage calculations</v-btn
              >
            </div>
          </v-card-text>
        </v-card>
      </div>
      <div>
        <v-card class="mb-4">
          <v-card-title><div class="font-bold">Customer info</div></v-card-title>
          <v-card-text>
            <div class="grid grid-cols-[auto_1fr] space-x-2">
              <div>Consignee</div>
              <div>{{ referencia.consignee?.name }}</div>

              <div>
                <v-icon size="small">mdi-account-tie-outline</v-icon>
                Executive
              </div>
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
        <SeaCargoDetails :referencia="referencia" />
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
        <v-card class="mb-4">
          <v-card-title><div class="font-bold">Charges</div></v-card-title>
          <v-card-text>
            <div v-if="!hasCharges">
              <v-alert type="info" density="compact"> No charges found </v-alert>
            </div>
            <v-table density="compact">
              <thead>
                <tr>
                  <th class="text-left">#</th>
                  <th class="text-left">Concept</th>
                  <th class="text-left">Amount</th>
                  <th class="text-left">Currency</th>
                  <th class="text-left">Fuera / Dentro BL</th>
                  <th class="text-left">+ IVA</th>
                  <th class="text-left">TM/WM</th>
                  <th class="text-left">Created by</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(charge, idx) in referencia.charges" :key="`charge-${idx}`">
                  <td>{{ charge.id }}</td>
                  <td>{{ charge.charge?.name }}</td>
                  <td>{{ formatToCurrency(charge.amount) }}</td>
                  <td>{{ charge.currency?.name }}</td>
                  <td>{{ charge.fuera_dentro_bl === 'F' ? 'Fuera de BL' : 'Dentro BL' }}</td>
                  <td>{{ charge.is_con_iva ? 'Si' : 'No' }}</td>
                  <td>
                    {{ charge.inv_type }}
                  </td>
                  <td>{{ charge.created_by?.name }}</td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>
        </v-card>
      </div>

      <div class="col-span-2">
        <div v-if="referencia.demurrage_charges.length <= 0">
          <v-alert type="info" density="compact"> No demurrage charge(s) found </v-alert>
        </div>
        <SeaImportDemurragesSmart
          v-if="referencia.demurrage_charges.length > 0"
          :charges="referencia.demurrage_charges"
          :referencia="referencia"
        />
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
            <SeaServiceCustomerInvoices :referenceId="referencia.id!" />
          </v-card-text>
        </v-card>
      </div>

      <div class="col-span-2">
        <v-card color="light-blue-lighten-4" class="mb-4">
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
      <v-card color="red-lighten-4" class="mb-4">
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
const router = useRouter()

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
})

const referencia = ref<any>({})

const getData = async () => {
  try {
    loadingStore.loading = true
    const response = (await $api.referencias.getSeaImportFullDetailById(props.id)) as any

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

const hasCharges = computed(() => {
  return referencia.value?.charges?.length > 0
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

const viewInvoice = (invoice: any, invType: string) => {
  router.push(`/invoices/search/${invType}-view-${invoice.id}`)
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

useHead({
  title: `#${referencia.value.reference_number} - View details`,
})
</script>
