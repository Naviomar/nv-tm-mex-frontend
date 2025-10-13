<template>
  <div>
    <v-card class="mb-4">
      <v-card-title>
        <div class="flex justify-between">
          <div class="flex items-center gap-2">
            <v-icon size="x-small">mdi-ship-wheel</v-icon>
            <div>Air Ref #{{ airReference.reference_number }}</div>
          </div>
        </div>
      </v-card-title>
      <v-card-text>
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

        <div class="p-2 bg-slate-300 dark:bg-neutral-700">
          <div class="font-bold mb-4">Current charge(s) in reference.</div>
          <AirChargesSmart
            :referenciaId="props.id"
            :airReference="airReference"
            :show-proforma-btn="false"
            :impo-expo="airReference.impoExpo"
            ref="airChargesSmartRef"
          />
        </div>

        <div class="py-4">
          <div v-for="(invoice, index) in tm_invoices" :key="`tm-inv-${index}`">
            <InvoiceConsigneeChargesSmart
              :referenciaId="props.id"
              :referencia="airReference"
              :invoice="invoice"
              invoiceType="tm"
              serviceType="air"
              :charges="catalogs.charges"
              @refresh="refreshAll"
            />
          </div>

          <div v-for="(invoice, index) in wm_invoices" :key="`wm-inv-${index}`">
            <InvoiceConsigneeChargesSmart
              :referenciaId="props.id"
              :referencia="airReference"
              :invoice="invoice"
              invoiceType="wm"
              serviceType="air"
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

const airReference = ref<any>({})
const airChargesSmartRef = ref<any>(null)

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

const creditExpirationDate = computed(() => {
  if (!airReference.value.credit_days) return ''
  const expirationDate = new Date(airReference.value.created_at)
  expirationDate.setDate(expirationDate.getDate() + airReference.value.credit_days)
  return formatDateOnlyString(expirationDate)
})

const tm_invoices = computed(() => {
  if (!airReference.value) return []
  return airReference.value.invoice_tms
})

const wm_invoices = computed(() => {
  if (!airReference.value) return []
  return airReference.value.invoice_wms
})

const proformas = computed(() => {
  if (!airReference.value) return []
  const tm_profromas = airReference.value.invoice_tms.filter((inv: any) => inv.is_proforma == 1)
  const wm_profromas = airReference.value.invoice_wms.filter((inv: any) => inv.is_proforma == 1)
  // add inv_type to the invoices
  tm_profromas.forEach((inv: any) => {
    inv.inv_type = 'tm'
  })
  wm_profromas.forEach((inv: any) => {
    inv.inv_type = 'wm'
  })
  return [...tm_profromas, ...wm_profromas]
})

const refreshAll = async () => {
  await getData()
  airChargesSmartRef.value.getAirCharges()
}

const getData = async () => {
  try {
    loadingStore.start()
    const response = (await $api.airReferences.getAirRferenceById(props.id)) as any
    airReference.value = response

    // trigger child ChargesSmart components to refresh
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const getAirChargeCatalogs = async () => {
  const response = await $api.airReferences.getAllCharges()
  catalogs.value.charges = response as any
}

onMounted(async () => {
  await getAirChargeCatalogs()
  await getData()
})
</script>
