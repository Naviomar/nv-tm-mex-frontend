<template>
  <div>
    <v-card class="mb-4">
      <v-card-title>
        <div class="flex justify-between">
          <div class="flex items-center gap-2">
            <v-icon size="x-small">mdi-ship-wheel</v-icon>
            <div>Maritime Ref #{{ referencia.reference_number }}</div>
          </div>
        </div>
      </v-card-title>
      <v-card-text>
        <div class="grid grid-cols-2 gap-2">
          <div>
            <div class="grid grid-cols-2 gap-1">
              <div>Line</div>
              <div>{{ referencia.line?.commercial_name }}</div>
              <div>Vessel departure</div>
              <div>{{ referencia.vessel_departure?.name }}</div>
              <div>Departure voyage</div>
              <div>{{ referencia.voyage_departure }}</div>
              <div>ETD</div>
              <div>{{ referencia.etd_date }}</div>
              <div>ETA</div>
              <div>{{ referencia.eta_date }}</div>
              <div>Freight forwarder</div>
              <div>{{ referencia.freight_forwarder?.name }}</div>
              <div>Booking Number</div>
              <div>{{ referencia.booking_number }}</div>
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

        <div class="p-2 bg-slate-300 dark:bg-neutral-700">
          <div class="font-bold mb-4">Current charge(s) in reference.</div>
          <SeaExportChargesSmart
            :canEdit="canEditCharges"
            :referenciaId="props.id"
            :show-proforma-btn="false"
            ref="seaExportChargesSmartRef"
          />
        </div>

        <div class="py-4">
          <div v-for="(invoice, index) in tm_invoices" :key="`tm-inv-${index}`">
            <InvoiceConsigneeChargesSmart
              :referenciaId="props.id"
              :referencia="referencia"
              :invoice="invoice"
              invoiceType="tm"
              serviceType="sea"
              :charges="catalogs.charges"
              @refresh="refreshAll"
            />
          </div>

          <div v-for="(invoice, index) in wm_invoices" :key="`wm-inv-${index}`">
            <InvoiceConsigneeChargesSmart
              :referenciaId="props.id"
              :referencia="referencia"
              :invoice="invoice"
              invoiceType="wm"
              serviceType="sea"
              :charges="catalogs.charges"
              @refresh="refreshAll"
            />
          </div>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>
<script setup lang="ts">
import { currencies } from '@/utils/data/systemData'
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
})

const catalogs = ref<any>({
  charges: [],
})

const referencia = ref<any>({})
const seaExportChargesSmartRef = ref<any>(null)

const chargeForm = ref<any>({
  show: false,
  invoice_sea: null,
  charge: {
    charge_id: null,
    amount: 0,
    currency_id: null,
    is_con_iva: false,
  },
})

const tm_invoices = computed(() => {
  if (!referencia.value) return []
  return referencia.value.invoice_tms
})

const wm_invoices = computed(() => {
  if (!referencia.value) return []
  return referencia.value.invoice_wms
})

const proformas = computed(() => {
  if (!referencia.value) return []
  const tm_profromas = referencia.value.invoice_tms.filter((inv: any) => inv.is_proforma == 1)
  const wm_profromas = referencia.value.invoice_wms.filter((inv: any) => inv.is_proforma == 1)
  // add inv_type to the invoices
  tm_profromas.forEach((inv: any) => {
    inv.inv_type = 'tm'
  })
  wm_profromas.forEach((inv: any) => {
    inv.inv_type = 'wm'
  })
  return [...tm_profromas, ...wm_profromas]
})

const canEditCharges = computed(() => {
  if (!referencia.value.voyage_discharge) {
    return false
  }
  return referencia.value.voyage_discharge.locked_at == null
})

const isChargeLinkedToInvoice = (charge: any) => {
  return charge.invoice_charge != null
}

const linkedChargeIcon = (charge: any) => {
  if (charge.invoice_charge != null) {
    return 'mdi-link'
  }
  return 'mdi-link-off'
}

const refreshAll = async () => {
  await getData()
  seaExportChargesSmartRef.value.getExportCharges()
}

const getData = async () => {
  try {
    loadingStore.start()
    const response = (await $api.referenciasExport.getReferenciaById(props.id)) as any
    referencia.value = response

    // trigger child ChargesSmart components to refresh
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const getSeaExportCatalogs = async () => {
  const response = await $api.referenciasExport.getChargeCatalogs()
  catalogs.value = response as any
}

onMounted(async () => {
  await getSeaExportCatalogs()
  await getData()
})
</script>
