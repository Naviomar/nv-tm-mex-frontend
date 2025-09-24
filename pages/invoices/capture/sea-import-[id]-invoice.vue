<template>
  <v-container fluid>
    <div class="mb-4">
      <v-btn color="slate" size="small" variant="outlined" @click="$router.back()" class="mb-2">Back</v-btn>

      <v-card>
        <v-card-text>
          <h1 class="text-2xl font-bold mb-4">Capture proforma for Sea Import Reference</h1>
          <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div class="col-span-1 md:col-span-3">
              <h3 class="px-2 font-bold text-lg">Sea Ref #{{ referencia.reference_number }}</h3>
              <div class="px-2 font-bold text-lg">Consignee: {{ referencia.consignee?.name }}</div>
              <v-divider class="my-2" />
              <v-alert
                v-if="hasNotyArrival"
                density="compact"
                color="success"
                icon="mdi-check-circle-outline"
                class="mb-2"
              >
                <span>Noty Arrival</span>
              </v-alert>

              <v-alert
                v-if="!hasNotyArrival"
                density="compact"
                color="warning"
                variant="outlined"
                icon="mdi-alert-outline"
                class="mb-2"
              >
                <span>Notification Arrival not sent yet</span>
              </v-alert>

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

              <v-btn color="primary" block @click="showRefDetail = true">
                <v-icon>mdi-eye-outline</v-icon>
                View #{{ referencia.reference_number }}
              </v-btn>

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
                          {{ formatToCurrency(charge.amount) }}
                          {{ getCurrencyName(charge.currency_id) }}
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

              <CaptureSeaImportInvoiceV2 v-if="canCreateInvoice" :referencia="referencia" />
            </div>
          </div>
        </v-card-text>
      </v-card>
    </div>
    <v-dialog v-model="showRefDetail">
      <v-card>
        <v-card-title>
          <h3 class="font-bold">Viewing Sea Import Ref details</h3>
        </v-card-title>
        <v-card-text>
          <SeaImportMovementDetail :referencia="referencia" />
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="showRefDetail = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
<script setup lang="ts">
const { $api } = useNuxtApp()
const loadingStore = useLoadingStore()
const route = useRoute()

const id = route.params.id!.toString()

definePageMeta({
  title: 'Invoice Sea Import Reference - TM',
  layout: 'default',
})

const referencia = ref<any>({})
const showRefDetail = ref(false)

const hasNotyArrival = computed(() => {
  if (!referencia.value) return false
  if (!referencia.value.arrival_notys) return false
  return referencia.value?.arrival_notys.length > 0
})

const hasProforma = computed(() => {
  if (!referencia.value) return false

  const allInvoices = referencia.value.invoice_tms_all.concat(referencia.value.invoice_wms_all)
  // if some invoice has is_proforma = 1, then return true
  return allInvoices.some((invoice: any) => invoice.is_proforma === 1)
})

const hasInvoiceTm = computed(() => {
  if (!referencia.value) return false
  return referencia.value.invoice_tms_all.length > 0
})

const hasInvoiceWm = computed(() => {
  if (!referencia.value) return false
  return referencia.value.invoice_wms_all.length > 0
})

const hasUnlinkedCharges = computed(() => {
  if (!referencia.value) return false
  return referencia.value.charges.some((charge: any) => !charge.invoice_charge)
})

const unlinkedCharges = computed(() => {
  if (!referencia.value) return []
  const refCharges = referencia.value.charges.filter((charge: any) => !charge.invoice_charge)
  const sellCharges = referencia.value.sell_rate_breakdown.filter((charge: any) => !charge.invoice_charge)

  return [...refCharges, ...sellCharges]
})

const canCreateInvoice = computed(() => {
  return unlinkedCharges.value.length > 0
})

const getData = async () => {
  try {
    loadingStore.loading = true
    const response = (await $api.referencias.getSeaImportFullDetailById(id)) as any

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
</script>
