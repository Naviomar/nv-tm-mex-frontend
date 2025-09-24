<template>
  <div class="py-5">
    <div class="relative">
      <div
        v-if="hasOtherChargeName"
        class="absolute -top-3 left-0 text-xs light:text-gray-800 dark:text-gray-200 line-through"
      >
        {{ props.invoiceCharge.charge?.name }}
      </div>
      <div>
        {{ chargeName }}
        <div v-if="hasOtherNames">
          <v-btn size="small" density="compact" color="grey" prepend-icon="mdi-swap-horizontal" @click="toggleForm"
            >Change</v-btn
          >
          <div v-if="form.show">
            <v-autocomplete
              v-model="form.cfdi_name"
              density="compact"
              :items="chargeNames"
              item-title="name"
              label="Select a name"
              return-object
            />
            <v-btn size="small" density="compact" color="grey" @click="saveCfdiName">Save</v-btn>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()

const props = defineProps({
  invoiceCharge: {
    type: Object,
    required: true,
  },
  names: {
    type: Array,
    required: true,
  },
})

const form = ref<any>({
  show: false,
  cfdi_name: null,
})

const toggleForm = () => {
  form.value.show = !form.value.show
}

const hasOtherNames = computed(() => {
  if (props.names.length <= 0) {
    return false
  }
  return props.names.some((x: any) => x.charge_id === props.invoiceCharge.charge?.id)
})

const chargeNames = computed(() => {
  return props.names.filter((x: any) => x.charge_id === props.invoiceCharge.charge?.id)
})

const hasOtherChargeName = computed(() => {
  return props.invoiceCharge.charge_name != null
})

const chargeName = computed(() => {
  if (props.invoiceCharge.charge_name != null) {
    return props.invoiceCharge.charge_name
  }
  return props.invoiceCharge.charge?.name
})

const saveCfdiName = async () => {
  try {
    loadingStore.loading = true
    const body = {
      invoice_charge_id: props.invoiceCharge.id,
      name: form.value.cfdi_name.name,
    }
    const response = await $api.invoices.updateChargeCfdiName(body)

    props.invoiceCharge.charge_name = JSON.parse(JSON.stringify(form.value.cfdi_name.name))
    form.value = { show: false, cfdi_name: null }

    snackbar.add({ type: 'success', text: 'CFDI name updated' })
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}
</script>
