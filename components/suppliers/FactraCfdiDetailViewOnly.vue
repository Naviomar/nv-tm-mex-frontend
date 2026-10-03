<template>
  <div>
    <div class="flex items-center gap-2 mb-3">
      <v-icon color="primary">mdi-file-eye-outline</v-icon>
      <h3 class="text-lg font-bold">Supplier CFDI</h3>
    </div>

    <SupplierCfdiSummary :supplier-cfdi="supplierCfdi" :available-balance="availableBalance" @sat-validated="onSatValidated">
      <div v-if="hasParent || isDeleted" class="flex flex-col gap-2">
        <v-alert v-if="hasParent" type="info" title="Reissued invoice" variant="tonal" density="compact">
          This invoice is linked / reissued from
          <NuxtLink :to="`/invoices/suppliers/cfdis/view-${supplierCfdi.parent_deleted?.id}`" target="_blank" class="underline">
            <v-icon>mdi-open-in-new</v-icon> {{ supplierCfdi.parent_deleted?.serie_folio }}
          </NuxtLink>
        </v-alert>
        <v-alert v-if="isDeleted" type="error" title="Invoice is cancelled" density="compact">
          This invoice is cancelled and linked to
          <NuxtLink
            v-for="(children, index) in supplierCfdi.children_deleted"
            :key="`children-${index}`"
            :to="`/invoices/suppliers/cfdis/view-${children.id}`"
            target="_blank"
            class="underline"
          >
            <v-icon>mdi-open-in-new</v-icon> {{ children.serie_folio }}
          </NuxtLink>
        </v-alert>
      </div>
    </SupplierCfdiSummary>

    <SupplierCfdiSection
      v-if="hasLinkReqDemurrages || hasLinkReqDetentions"
      title="Line payment requests"
      subtitle="This invoice is paid through the demurrages / detentions line payment request."
      icon="mdi-train-car-container"
      color="indigo"
    >
      <div class="flex flex-wrap gap-2">
        <v-chip
          v-for="reqDemurrage in supplierCfdi.req_demurrages"
          :key="`req-demurrage-link-${reqDemurrage.id}`"
          :to="`/invoices/search/lines/demurrages/req-pay-view-${reqDemurrage.id}`"
          color="primary"
          prepend-icon="mdi-open-in-new"
        >
          Req. Demurrage {{ reqDemurrage.folio || '#' + reqDemurrage.id }} · {{ formatToCurrency(reqDemurrage.amount) }}
          <span v-if="reqDemurrage.inv_type" class="ml-1 uppercase">({{ reqDemurrage.inv_type }})</span>
        </v-chip>
        <v-chip
          v-for="reqDetention in supplierCfdi.req_detentions"
          :key="`req-detention-link-${reqDetention.id}`"
          :to="`/invoices/search/lines/detentions/req-pay-view-${reqDetention.id}`"
          color="primary"
          prepend-icon="mdi-open-in-new"
        >
          Req. Detention {{ reqDetention.folio || '#' + reqDetention.id }} · {{ formatToCurrency(reqDetention.amount) }}
          <span v-if="reqDetention.inv_type" class="ml-1 uppercase">({{ reqDetention.inv_type }})</span>
        </v-chip>
      </div>
    </SupplierCfdiSection>

    <SupplierCfdiSection
      v-if="supplierCfdi.is_free_format"
      title="Cargos de formato libre"
      subtitle="Se pagan directamente, sin desglose a referencias."
      icon="mdi-tag-outline"
      color="deep-purple"
    >
      <v-table density="compact">
        <thead>
          <tr>
            <th>Concepto</th>
            <th>Monto</th>
            <th>Notas</th>
            <th>Creado por</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!supplierCfdi.cfdi_charges?.length">
            <td colspan="4" class="text-center">Sin cargos registrados</td>
          </tr>
          <tr v-for="charge in supplierCfdi.cfdi_charges" :key="charge.id">
            <td>{{ charge.charge?.name || 'Sin concepto' }}</td>
            <td>{{ getCurrencyName(charge.currency_id) }} {{ formatToCurrency(charge.amount) }}</td>
            <td class="text-xs">{{ charge.notes }}</td>
            <td>{{ charge.creator?.name }}</td>
          </tr>
        </tbody>
      </v-table>
    </SupplierCfdiSection>

    <SupplierCfdiSection
      v-else
      title="Concepts registered in this invoice"
      subtitle="Each concept is a cost of one reference, optionally linked to the sell concept it covers."
      icon="mdi-format-list-checks"
      color="teal"
    >
      <SupplierCfdiConceptsTable
        :invoices="supplierCfdi.invoices"
        :currency-id="supplierCfdi.currency_id"
        :usd-rates="supplierCfdi.usd_rates"
      />

      <div v-if="supplierCfdi.line_containers?.length > 0" class="mt-4">
        <div class="font-bold py-2 flex items-center gap-2">
          <v-icon size="small" color="indigo">mdi-train-car-container</v-icon>
          Containers assigned for line payment
        </div>
        <v-table density="compact">
          <thead>
            <tr>
              <th>Service Ref#</th>
              <th>Container</th>
              <th>Concept</th>
              <th>Amount</th>
              <th>Assigned by</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="lc in supplierCfdi.line_containers" :key="`line-container-${lc.id}`">
              <td>{{ lc.referencia?.reference_number }}</td>
              <td class="font-mono">{{ lc.reference_container?.container_number }}</td>
              <td>{{ lc.charge?.name }}</td>
              <td>{{ getCurrencyName(lc.currency_id) }} {{ formatToCurrency(lc.amount) }}</td>
              <td>{{ lc.creator?.name }}</td>
            </tr>
          </tbody>
        </v-table>
      </div>
    </SupplierCfdiSection>
  </div>
</template>
<script setup lang="ts">
const loadingStore = useLoadingStore()
const { $api } = useNuxtApp()

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
})

const supplierCfdi = ref<any>({})

const isDeleted = computed(() => !!supplierCfdi.value.deleted_at)
const hasParent = computed(() => !!supplierCfdi.value.parent_deleted)
const hasLinkReqDemurrages = computed(() => supplierCfdi.value.req_demurrages?.length > 0)
const hasLinkReqDetentions = computed(() => supplierCfdi.value.req_detentions?.length > 0)

const availableBalance = computed(() => {
  const value = supplierCfdi.value.should_apply_cap_limit ? supplierCfdi.value.cap_limit : supplierCfdi.value.amount_provisioned
  return Math.round(((parseFloat(value) || 0) + Number.EPSILON) * 100) / 100
})

const onSatValidated = (response: any) => {
  supplierCfdi.value.sat_status = response.sat_status
  supplierCfdi.value.sat_status_label = response.sat_status_label
  supplierCfdi.value.sat_validated_at = response.sat_validated_at
  supplierCfdi.value.sat_validator = response.sat_validator
  supplierCfdi.value.is_sat_valid = response.is_sat_valid
}

const getData = async () => {
  try {
    loadingStore.start()
    supplierCfdi.value = await $api.suppliers.getSupplierCfdiById(props.id)
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

onMounted(getData)
</script>
