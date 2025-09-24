<template>
  <div>
    <v-card>
      <v-card-text>
        <h1 class="text-2xl font-bold mb-4">Capture proforma for Air {{ impoExpo }} Reference</h1>
        <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div class="col-span-1 md:col-span-3">
            <h3 class="px-2 font-bold text-lg">Air Ref #{{ airReference.reference_number }}</h3>
            <div class="px-2 font-bold text-lg">Customer: {{ airReference.consignee?.name }}</div>
            <v-divider class="my-2" />

            <v-alert
              v-if="hasInvoiceTm"
              density="compact"
              color="green"
              variant="outlined"
              icon="mdi-check-circle-outline"
              class="mb-2"
            >
              <span>Proforma/Invoice TM found</span>
            </v-alert>

            <v-alert
              v-if="!hasInvoiceTm"
              density="compact"
              color="warning"
              variant="outlined"
              icon="mdi-alert-outline"
              class="mb-2"
            >
              <span>No TM Invoice(s)</span>
            </v-alert>

            <v-alert
              v-if="hasInvoiceWm"
              density="compact"
              color="green"
              variant="outlined"
              icon="mdi-check-circle-outline"
              class="mb-2"
            >
              <span>Proforma/Invoice WM found</span>
            </v-alert>

            <v-alert
              v-if="!hasInvoiceWm"
              density="compact"
              color="warning"
              variant="outlined"
              icon="mdi-alert-outline"
              class="mb-2"
            >
              <span>No WM Invoice(s)</span>
            </v-alert>

            <v-divider class="my-2" />

            <div v-if="hasUnlinkedCharges">
              <h3 class="font-bold">Unlinked charges</h3>
              <v-alert density="compact" color="green" icon="mdi-eye-outline" variant="tonal" class="mb-2">
                <span>Charges not linked to any invoice.</span>
              </v-alert>

              <v-list>
                <v-list-item v-for="charge in unlinkedCharges" :key="`unlinked-charge-${charge.id}`">
                  <v-list-item-title>{{ charge.charge?.name }}</v-list-item-title>
                  <v-list-item-subtitle>
                    <div class="flex justify-between">
                      <div>
                        {{ formatToCurrency(charge.sell_amount) }}
                        {{ getCurrencyName(charge.sell_currency_id) }}
                        {{ charge.is_con_iva == 1 ? '+ iva' : '' }}
                      </div>
                      <div>{{ charge.inv_type }}</div>
                    </div>
                  </v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </div>
          </div>
          <div class="col-span-1 md:col-span-9">
            <v-alert
              v-if="canCreateInvoice"
              density="compact"
              variant="tonal"
              color="success"
              icon="mdi-check-circle-outline"
              class="mb-2"
            >
              <span>Ready to capture proforma</span>
            </v-alert>

            <v-alert v-if="!canCreateInvoice" density="compact" color="warning" icon="mdi-alert-outline" class="mb-2">
              <span>Not ready to capture proforma</span>
            </v-alert>

            <CaptureAirInvoiceForm v-if="canCreateInvoice" :airReference="airReference" />
          </div>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>
<script setup lang="ts">
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()

const props = defineProps({
  id: {
    type: [String, Number],
    required: true,
  },
})

const airReference = ref<any>({})

const impoExpo = computed(() => {
  if (!airReference.value) return ''
  return airReference.value.impoExpo === 'I' ? 'Import' : 'Export'
})

const hasProforma = computed(() => {
  if (!airReference.value) return false

  const allInvoices = airReference.value.invoice_tms_all?.concat(airReference.value.invoice_wms_all)
  // if some invoice has is_proforma = 1, then return true
  return allInvoices.some((invoice: any) => invoice.is_proforma === 1)
})

const hasInvoiceTm = computed(() => {
  if (!airReference.value) return false
  return airReference.value.invoice_tms_all?.length > 0 || false
})

const hasInvoiceWm = computed(() => {
  if (!airReference.value) return false
  return airReference.value.invoice_wms_all?.length > 0 || false
})

const hasUnlinkedCharges = computed(() => {
  if (!airReference.value) return false
  return airReference.value.charges?.some((charge: any) => !charge.invoice_charge) || false
})

const unlinkedCharges = computed(() => {
  if (!airReference.value) return []
  const refCharges =
    airReference.value.charges?.filter((charge: any) => charge.sell_amount != null && !charge.invoice_charge) || []
  return refCharges
})

const canCreateInvoice = computed(() => {
  return unlinkedCharges.value.length > 0
})

const getData = async () => {
  try {
    loadingStore.loading = true
    const response = (await $api.airReferences.getAirRferenceById(props.id.toString())) as any

    airReference.value = response
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

onMounted(async () => {
  await getData()
})
</script>
