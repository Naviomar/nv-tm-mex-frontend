<template>
  <v-container fluid>
    <div v-if="false" class="mb-4">
      <v-btn color="slate" size="small" variant="outlined" @click="$router.back()" class="mb-2">Back</v-btn>

      <v-card>
        <v-card-text>
          <h1 class="text-2xl font-bold mb-4">
            Capture a demurrage invoice for Sea Import Reference #{{ referencia.reference_number }}
          </h1>
          <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div class="col-span-1 md:col-span-3">
              <h3 class="px-2 font-bold text-lg">Sea Ref #{{ referencia.reference_number }}</h3>
              <div class="px-2 font-bold text-lg">Consignee: {{ referencia.consignee?.name }}</div>
              <v-divider class="my-2" />

              <v-btn color="primary" block @click="showRefDetail = true">
                <v-icon>mdi-eye-outline</v-icon>
                View #{{ referencia.reference_number }}
              </v-btn>

              <v-divider class="my-2" />

              <div v-if="hasDemChargesUnlinked">
                <h3 class="font-bold">Unlinked demurrage charges</h3>

                <v-list>
                  <v-list-item v-for="charge in demChargesUnlinked" :key="`unlinked-charge-${charge.id}`">
                    <v-list-item-title>{{ charge.charge?.name }}</v-list-item-title>
                    <v-list-item-subtitle>
                      <div class="flex justify-between">
                        <div>Demurrage #{{ charge.reference_container?.container_number }}</div>
                        <div>
                          {{ getCurrencyName(charge.currency_id) }} {{ formatToCurrency(charge.amount) }}
                          {{ charge.amount_iva > 0 ? ' + IVA' : '' }} {{ getInfoParcialTotal(charge) }}
                        </div>
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
                color="success"
                icon="mdi-check-circle-outline"
                class="mb-2"
              >
                <span>There are demurrage charges without an invoice</span>
              </v-alert>

              <v-alert v-if="!canCreateInvoice" density="compact" color="warning" icon="mdi-alert-outline" class="mb-2">
                <span>There are no demurrage charges available to create an invoice</span>
              </v-alert>

              <CaptureSeaImportInvoiceDemurrage v-if="canCreateInvoice" :referencia="referencia" />
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
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()
const route = useRoute()

const id = route.params.id!.toString()

definePageMeta({
  title: 'Invoice Sea Import Reference - TM',
  layout: 'default',
})

const referencia = ref<any>({})
const showRefDetail = ref(false)

const hasDemChargesUnlinked = computed(() => {
  if (!referencia.value) return false
  return referencia.value.demurrage_charges.some((charge: any) => !charge.invoice_charge)
})

const demChargesUnlinked = computed(() => {
  if (!referencia.value) return []
  return referencia.value.demurrage_charges.filter((charge: any) => !charge.invoice_charge)
})

const canCreateInvoice = computed(() => {
  return hasDemChargesUnlinked.value
})

const getInfoParcialTotal = (charge: any) => {
  // find charge.reference_container_id in referencia.containers then in demurrage key find is_parcial
  const container = referencia.value.containers.find((container: any) => container.id === charge.reference_container_id)
  if (!container) return ''
  return container.demurrage.is_parcial ? 'Parcial' : 'Total'
}

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
