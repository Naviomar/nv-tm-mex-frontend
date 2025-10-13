<template>
  <div>
    <div class="grid grid-cols-12 gap-4">
      <div class="col-span-6">
        <VeeForm @submit="saveSupplierCfdi" ref="supplierCfdiRef" :validation-schema="schemaManualCfdiAdd">
          <v-card>
            <v-card-title>
              <h3>Add Manual CFDI</h3>
            </v-card-title>
            <v-card-text>
              <div>
                <ASupplierSearch v-model="form.supplierId" label="Supplier *" />
                <InputText name="supplier_id" type="hidden" />
              </div>
              <div>
                <InputText name="rfc_receptor" type="text" label="RFC Receptor *" density="compact" />
              </div>
              <div>
                <InputText name="name_receptor" type="text" label="Nombre Receptor *" density="compact" />
              </div>
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <InputText name="serie" label="Serie" density="compact" />
                </div>
                <div>
                  <InputText name="folio" label="Folio *" density="compact" />
                </div>
              </div>
              <div>
                <InputAutocomplete
                  name="tipo_comprobante"
                  density="compact"
                  :items="[
                    { value: 'I', name: 'Ingreso' },
                    { value: 'E', name: 'Egreso' },
                  ]"
                  item-title="name"
                  item-value="value"
                  label="Tipo de comprobante *"
                />
              </div>
              <div>
                <InputText name="invoice_date" type="date" label="Invoice date *" density="compact" />
              </div>
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <InputText name="amount_cfdi" type="number" label="Amount *" density="compact" />
                </div>
                <InputAutocomplete
                  name="currency_id"
                  density="compact"
                  :items="currencies"
                  item-title="name"
                  item-value="id"
                  label="Currency *"
                />
              </div>
              <div>
                <InputTextArea name="notes" label="Notes" density="compact" />
              </div>

              <div class="flex justify-end items-center gap-4">
                <v-btn color="secondary" to="/invoices/suppliers/cfdis"> Cancel </v-btn>
                <v-btn color="primary" type="submit"> Add Manual CFDI </v-btn>
              </div>
            </v-card-text>
          </v-card>
        </VeeForm>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { currencies } from '@/utils/data/systemData'
import { schemaManualCfdiAdd } from '~/forms/supplierForm'
import VeeForm from '@/components/global/VeeForm.vue'

const router = useRouter()
const { $api } = useNuxtApp()
const loadingStore = useLoadingStore()
const snackbar = useSnackbar()

const supplierCfdiRef = ref<InstanceType<typeof VeeForm> | null>(null)
const form = reactive({
  supplierId: undefined,
})

const saveSupplierCfdi = async (values: any) => {
  try {
    loadingStore.loading = true
    await $api.supplierInvoices.addManualCfdi(values)

    snackbar.add({ type: 'success', text: 'Supplier CFDI added.' })
    router.push('/invoices/suppliers/cfdis')
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.loading = false
    }, 250)
  }
}

watch(
  () => form.supplierId,
  (newValue) => {
    if (newValue) {
      supplierCfdiRef.value?.setValues({ supplier_id: newValue })
    }
  }
)
</script>
