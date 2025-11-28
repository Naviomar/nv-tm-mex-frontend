<template>
  <div>
    <VeeForm @submit="saveCustomer" ref="customerFormRef" :validation-schema="schema">
      <div class="grid grid-cols-12 gap-4 mb-2">
        <div class="col-span-12 md:col-span-7">
          <v-card color="">
            <v-card-text>
              <div>
                <InputText name="name" density="compact" label="Name *" />
                <v-btn color="primary" size="small" @click="searchConsigneesByName"> Search similar </v-btn>
                <div v-if="hasSimilars" class="py-4 bg-slate-200 dark:bg-neutral-700 mb-4 border-dotted border-2">
                  <div class="text-sm font-bold">Customers with similar name:</div>
                  <div class="max-h-96 overflow-y-auto">
                    <div v-for="customer in similars" :key="customer.id" class="p-1">
                      {{ customer.name }} #{{ customer.id }}
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <InputText name="contact_name" density="compact" label="Contact name" />
              </div>
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <InputText name="code" density="compact" label="Code" />
                </div>
                <div>
                  <InputText name="finance_code" density="compact" label="Finance code" />
                </div>
              </div>

              <v-card density="compact" class="mb-2" color="blue-lighten-5">
                <v-card-title>Maritime</v-card-title>
                <v-card-text>
                  <div>Enable the customer to the following maritime services.</div>
                  <div class="grid grid-cols-2 gap-2">
                    <div>
                      <div>
                        <InputSwitch name="is_import" label="Import" density="compact" />
                      </div>
                      <div>
                        <InputText name="import_credit_days" density="compact" label="Credit days (Import)" />
                      </div>
                    </div>
                    <div>
                      <div>
                        <InputSwitch name="is_export" label="Export" density="compact" />
                      </div>
                      <div>
                        <InputText name="export_credit_days" density="compact" label="Credit days (Export)" />
                      </div>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
              <v-card density="compact" class="mb-2" color="blue-lighten-5">
                <v-card-title>Air</v-card-title>
                <v-card-text>
                  <div>Enable the customer to the following air services.</div>
                  <div class="grid grid-cols-2 gap-2">
                    <div>
                      <InputSwitch name="is_air_import" label="Import" density="compact" />
                    </div>
                    <div>
                      <InputSwitch name="is_air_export" label="Export" density="compact" />
                    </div>
                  </div>
                </v-card-text>
              </v-card>
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <InputAutocomplete
                    name="consignee_group_id"
                    item-title="name"
                    item-value="id"
                    :items="catalogs.consignee_groups"
                    label="Consignee group"
                    density="compact"
                  />
                </div>
                <div>
                  <InputAutocomplete
                    name="executive_id"
                    label="Executive"
                    :items="catalogs.executives"
                    item-value="id"
                    item-title="name"
                    density="compact"
                  />
                </div>
              </div>

              <div>
                <InputAutocomplete
                  name="country_id"
                  density="compact"
                  :items="catalogs.countries"
                  item-value="id"
                  item-title="name"
                  label="Country"
                />
              </div>
              <div>
                <InputText name="tax_number" density="compact" label="RFC *" />
              </div>
              <InputAutocomplete
                name="regimen_fiscal"
                :items="cfdiCatalogs.regimenFiscales"
                density="compact"
                label="Régimen fiscal *"
                item-title="name"
                item-value="name"
              />
              <div>
                <InputText name="curp" density="compact" label="CURP" />
              </div>

              <div>
                <InputTextArea name="notes" :counter="5" label="Notes" />
              </div>

              <div class="flex justify-end items-center">
                <v-btn class="mr-4" color="secondary" to="/configuration/customers"> Cancel </v-btn>
                <v-btn color="primary" @click="validateBeforeCreate"> Save </v-btn>
              </div>
            </v-card-text>
          </v-card>
        </div>
        <div class="col-span-12 md:col-span-5">
          <AddressForm v-model="address" />
          <pre>{{ address }}</pre>
        </div>
      </div>
    </VeeForm>

    <SimilarItemsDialog v-model="showSimilarDialog" :similar-items="similars" @proceed="confirmCreate" />
  </div>
</template>
<script setup lang="ts">
import { cfdiCatalogs } from '~/utils/data/systemData'
import { schema } from '~~/forms/consigneeForm'
import VeeForm from '@/components/global/VeeForm.vue'

const router = useRouter()
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()

const customerFormRef = ref<InstanceType<typeof VeeForm> | null>(null)
const similars = ref<any>([])
const showSimilarDialog = ref(false) // Controls dialog visibility
const hasSimilars = computed(() => similars.value.length > 0)

const catalogs = ref<any>({
  executives: [],
  consignee_groups: [],
  countries: [],
})

const address = ref({})

const saveCustomer = async (values: any) => {
  try {
    loadingStore.loading = true
    await $api.consignees.create(values)

    snackbar.add({ type: 'success', text: 'Customer created' })
    router.push('/configuration/customers')
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const confirmCreate = () => {
  customerFormRef.value!.onSubmit()
}

const validateBeforeCreate = async () => {
  if (!customerFormRef.value!.values.name || customerFormRef.value!.values.name === '') {
    snackbar.add({ type: 'warning', text: 'Name is required' })
    return
  }
  await searchConsigneesByName()
  showSimilarDialog.value = true
}

const searchConsigneesByName = async () => {
  try {
    loadingStore.loading = true
    const body = {
      name: customerFormRef.value!.values.name,
    }
    const response = await $api.consignees.searchByName(body)
    similars.value = response
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const getConsigneeCatalogs = async () => {
  const response = await $api.consignees.getCatalogs()

  catalogs.value = response as any
}

await getConsigneeCatalogs()
</script>
