<template>
  <div>
    <div class="grid grid-cols-12 gap-4 mb-2">
      <div class="col-span-6">
        <v-card color="">
          <v-card-text>
            <VeeForm
              @submit="validateBeforeCreate"
              :validation-schema="schemaEdit"
              :init-values="consignee"
              ref="customerFormRef"
            >
              <div>
                <InputText name="name" density="compact" variant="solo-filled" label="Name *" />
                <v-btn color="primary" size="small" @click="searchCustomersByName"> Search similar </v-btn>
                <div
                  v-if="hasSimilarCustomers"
                  class="py-4 bg-slate-200 dark:bg-neutral-700 mb-4 border-dotted border-2"
                >
                  <div class="text-sm font-bold">Customers with similar name:</div>
                  <div class="max-h-96 overflow-y-auto">
                    <div v-for="customer in similiarCustomers" :key="customer.id" class="p-1">
                      {{ customer.name }} #{{ customer.id }}
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <InputText name="contact_name" density="compact" variant="solo-filled" label="Contact name" />
              </div>
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <InputText name="code" density="compact" variant="solo-filled" label="Code" />
                </div>
                <div>
                  <InputText name="finance_code" density="compact" variant="solo-filled" label="Finance code" />
                </div>
              </div>
              <div>
                <InputAutocomplete
                  name="consignee_group_id"
                  item-title="name"
                  item-value="id"
                  :items="catalogs.consignee_groups"
                  density="compact"
                  label="Consignee group"
                />
              </div>

              <v-card density="compact" class="mb-2" color="blue-lighten-5">
                <v-card-title>Maritime</v-card-title>
                <v-card-text>
                  <div class="grid grid-cols-2 gap-2">
                    <div>
                      <div>
                        <InputSwitch name="is_import" label="import" variant="solo-filled" />
                      </div>
                      <div>
                        <InputText
                          name="import_credit_days"
                          density="compact"
                          variant="solo-filled"
                          label="Credit days (Import)"
                        />
                      </div>
                      <div>
                        <InputText
                          name="import_free_days"
                          density="compact"
                          variant="solo-filled"
                          label="Free days (Import)"
                        />
                      </div>
                    </div>
                    <div>
                      <div>
                        <InputSwitch name="is_export" label="export" variant="solo-filled" />
                      </div>
                      <div>
                        <InputText
                          name="export_credit_days"
                          density="compact"
                          variant="solo-filled"
                          label="Credit days (Export)"
                        />
                      </div>
                      <div>
                        <InputText
                          name="export_free_days"
                          density="compact"
                          variant="solo-filled"
                          label="Free days (Export)"
                        />
                      </div>
                    </div>
                  </div>
                  <div>Enable the customer to the following maritime services.</div>
                </v-card-text>
              </v-card>
              <v-card density="compact" class="mb-4" color="blue-lighten-5">
                <v-card-title>Air</v-card-title>
                <v-card-text>
                  <div class="grid grid-cols-2 gap-2">
                    <div>
                      <InputSwitch name="is_air_import" label="import" variant="solo-filled" />
                      <div>
                        <InputText
                          name="import_air_credit_days"
                          density="compact"
                          variant="solo-filled"
                          label="Credit days (Import)"
                        />
                      </div>
                    </div>
                    <div>
                      <InputSwitch name="is_air_export" label="export" variant="solo-filled" />
                      <div>
                        <InputText
                          name="export_air_credit_days"
                          density="compact"
                          variant="solo-filled"
                          label="Credit days (Export)"
                        />
                      </div>
                    </div>
                  </div>
                  <div>Enable the customer to the following air services.</div>
                </v-card-text>
              </v-card>

              <div>
                <InputAutocomplete
                  name="country_id"
                  item-title="name"
                  item-value="id"
                  :items="catalogs.countries"
                  density="compact"
                  variant="solo-filled"
                  label="Country"
                />
              </div>
              <div>
                <InputText name="tax_number" density="compact" variant="solo-filled" label="RFC *" />
              </div>
              <div>
                <InputAutocomplete
                  name="regimen_fiscal"
                  item-title="name"
                  item-value="name"
                  :items="cfdiCatalogs.regimenFiscales"
                  density="compact"
                  variant="solo-filled"
                  label="Régimen fiscal *"
                />
              </div>
              <div>
                <InputText name="curp" density="compact" variant="solo-filled" label="CURP" />
              </div>

              <InputAutocomplete
                name="uso_cfdi"
                :items="cfdiCatalogs.usosCfdi"
                density="compact"
                label="Uso de CFDI"
                variant="solo-filled"
                item-title="name"
                item-value="name"
              />
              <InputAutocomplete
                name="metodo_pago"
                :items="cfdiCatalogs.metodosPago"
                density="compact"
                label="Método de pago"
                variant="solo-filled"
                item-title="name"
                item-value="name"
                @update:model-value="clearFormaPago"
              />
              <InputAutocomplete
                name="forma_pago"
                :items="availableFormasPago"
                density="compact"
                label="Forma de pago"
                variant="solo-filled"
                item-title="name"
                item-value="name"
              />

              <v-card density="compact" class="mb-2" color="blue-lighten-5">
                <v-card-title>Rebate config</v-card-title>
                <v-card-text>
                  <div class="font-bold text-lg">Maritime Import</div>
                  <div class="grid grid-cols-2 gap-2">
                    <div>
                      <InputText
                        name="rebate"
                        type="number"
                        density="compact"
                        variant="solo-filled"
                        label="Automatic rebate (USD)"
                        hide-details
                      />
                    </div>
                    <div>
                      <InputAutocomplete
                        name="line_id"
                        density="compact"
                        label="Lines"
                        :items="catalogs.lines"
                        item-title="name_code"
                        item-value="id"
                        variant="solo-filled"
                        :multiple="true"
                        hide-details
                        chips
                        closable-chips
                      />
                    </div>
                  </div>
                  <div class="mb-4">
                    <v-btn color="brown" size="small" @click="updateRebateImport">Update Rebate</v-btn>
                  </div>

                  <div class="font-bold text-lg">Maritime Export</div>
                  <div class="grid grid-cols-2 gap-2">
                    <div>
                      <InputText
                        name="rebate_export"
                        type="number"
                        density="compact"
                        variant="solo-filled"
                        label="Automatic rebate (USD)"
                        hide-details
                      />
                    </div>
                    <div>
                      <InputAutocomplete
                        name="line_export_id"
                        density="compact"
                        label="Lines"
                        :items="catalogs.lines"
                        item-title="name_code"
                        item-value="id"
                        variant="solo-filled"
                        :multiple="true"
                        hide-details
                        chips
                        closable-chips
                      />
                    </div>
                  </div>
                  <div class="mb-4">
                    <v-btn color="brown" size="small" @click="updateRebateExport">Update Rebate</v-btn>
                  </div>
                </v-card-text>
              </v-card>

              <div v-if="false">
                <InputTextArea name="notes" variant="solo-filled" :counter="400" label="Notes" />
              </div>
              <div v-if="false">
                <InputSwitch name="is_active" label="Active" variant="solo-filled" />
              </div>

              <div class="flex justify-end items-center">
                <v-btn class="mr-4" color="secondary" to="/configuration/customers"> Cancel </v-btn>
                <v-btn color="primary" type="submit"> Save </v-btn>
              </div>
            </VeeForm>
          </v-card-text>
        </v-card>
      </div>
      <div class="col-span-6">
        <v-card color="" class="mb-4">
          <v-card-title>
            <div class="flex justify-between">
              <div>Executive(s)</div>
              <div>
                <v-btn icon="mdi-plus" size="x-small" color="success" @click="toggleExecutiveForm"></v-btn>
              </div>
            </div>
          </v-card-title>
          <v-card-text>
            <VeeForm @submit="saveExecutive" :validation-schema="schemaExecutive" ref="executiveFormRef">
              <div v-if="showExecutiveForm" class="grid grid-cols-2 gap-2">
                <div class="col-span-2">
                  <InputAutocomplete
                    name="executive_id"
                    label="Executive *"
                    :items="catalogs.executives"
                    item-value="id"
                    item-title="name"
                    variant="solo-filled"
                    density="compact"
                    hide-details
                  />
                </div>
                <div class="col-span-2">
                  <InputCheckbox
                    name="undefined_time"
                    label="Mark as undefined time"
                    variant="solo-filled"
                    hide-details
                  />
                </div>
                <div>
                  <InputText
                    name="executive_valid_from"
                    type="date"
                    density="compact"
                    variant="solo-filled"
                    label="Valid from *"
                  />
                </div>
                <div v-if="!executiveFormRef!.values.undefined_time">
                  <InputText
                    name="executive_valid_to"
                    type="date"
                    density="compact"
                    variant="solo-filled"
                    label="Valid to"
                  />
                </div>
                <div class="col-span-2">
                  <div class="flex justify-end items-center">
                    <v-btn class="mr-4" color="secondary" @click="toggleExecutiveForm"> Cancel </v-btn>
                    <v-btn color="primary" type="submit"> Save </v-btn>
                  </div>
                </div>
              </div>
            </VeeForm>
            <v-table density="compact">
              <thead>
                <tr>
                  <th class="text-left">Actions</th>
                  <th class="text-left">Executive</th>
                  <th class="text-left">From</th>
                  <th class="text-left">To</th>
                  <th class="text-left">Active</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in consignee?.consignee_executives" :key="`consig-exec-${index}`">
                  <td>
                    <div class="flex gap-2">
                      <v-btn
                        size="small"
                        variant="text"
                        icon="mdi-delete-outline"
                        color="red-lighten-2"
                        density="compact"
                        @click="showConfirmDelete(item.id)"
                      ></v-btn>
                    </div>
                  </td>
                  <td>{{ item.executive.name }}</td>
                  <td>{{ item.valid_from }}</td>
                  <td>{{ item.undefined_time ? 'Undefined' : item.valid_to }}</td>
                  <td>{{ getExecutiveActiveByDates(item) }}</td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>
        </v-card>
        <CustomerBankForm :id="id.toString()" />
        <ConsigneeEditFormAddresses :consignee="consignee" @update:consignee="getData" />
        <ConsigneeEditFormAddEntrustLetter
          :letters="consignee?.entrust_letters"
          :catalogs="catalogs"
          :id="id.toString()"
          @refresh="getData"
        />
        <ConsigneeEditFormAddWarranty
          :guarantee="consignee?.warranty_letters"
          :catalogs="catalogs"
          :id="id.toString()"
          @refresh="getData"
        />
        <ConsigneeEditFormAddEmail
          :emails="consignee?.consignee_emails"
          :catalogs="catalogs"
          :id="id.toString()"
          @refresh="getData"
        />

        <div class="mb-4">
          <CustomerServicePrintsConfig :id="id.toString()" />
        </div>

        <div class="mb-4">
          <CustomerNotesForm :customer="consignee" />
        </div>
      </div>
    </div>
    <SimilarItemsDialog v-model="showSimilarDialog" :similar-items="similiarCustomers" @proceed="saveConsignee" />
  </div>
</template>
<script setup lang="ts">
import { schemaEdit, schemaExecutive } from '~~/forms/consigneeForm'
import { cfdiCatalogs } from '~~/utils/data/systemData'
import VeeForm from '@/components/global/VeeForm.vue'

const router = useRouter()
const route = useRoute()
const { $api, $notifications } = useNuxtApp()
const confirm = $notifications.useConfirm()
const loadingStore = useLoadingStore()
const snackbar = useSnackbar()

const id = route.params.id!

const showExecutiveForm = ref(false)
const customerFormRef = ref<InstanceType<typeof VeeForm> | null>(null)
const executiveFormRef = ref<InstanceType<typeof VeeForm> | null>(null)
const similiarCustomers = ref<any>([])
const showSimilarDialog = ref(false) // Controls dialog visibility
const hasSimilarCustomers = computed(() => similiarCustomers.value.length > 0)

const catalogs = ref<any>({
  executives: [],
  consignee_groups: [],
  countries: [],
  ports: [],
  agents: [],
  notification_types: [],
  regimen_fiscales: [],
  lines: [],
})
const consignee = ref<any>({
  consignee_executives: [],
})

const availableFormasPago = computed(() => {
  const values = customerFormRef.value?.values
  if (!values?.metodo_pago) return []
  if (values?.metodo_pago.includes('PPD')) {
    return cfdiCatalogs.formasPago.filter((forma: any) => forma.name === '99 - Por definir')
  }

  return cfdiCatalogs.formasPago
})

const clearFormaPago = () => {
  customerFormRef.value!.setValues({
    ...customerFormRef.value!.values,
    forma_pago: '',
  })
}

const searchCustomersByName = async () => {
  try {
    loadingStore.loading = true
    const values = customerFormRef.value?.values
    const body = {
      name: values!.name,
    }
    const response = await $api.consignees.searchByName(body)
    similiarCustomers.value = response
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const getExecutiveActiveByDates = (item: any) => {
  const today = new Date()
  const validFrom = new Date(item.valid_from)
  const validTo = new Date(item.valid_to)

  if (item.undefined_time) {
    return 'Yes'
  }

  if (today >= validFrom && today <= validTo) {
    return 'Yes'
  }

  return 'No'
}

const validateBeforeCreate = async () => {
  const values = customerFormRef.value?.values
  if (!values!.name || values!.name === '') {
    snackbar.add({ type: 'warning', text: 'Name is required' })
    return
  }
  await searchCustomersByName()
  showSimilarDialog.value = true
}

const saveConsignee = async () => {
  try {
    const values = customerFormRef.value?.values
    await $api.consignees.update(id!.toString(), values)
    snackbar.add({
      type: 'success',
      text: 'Consignee updated successfully',
    })
    router.push('/configuration/customers')
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const updateRebateImport = async () => {
  try {
    loadingStore.start()
    const values = customerFormRef.value?.values
    const body = {
      rebate: values!.rebate,
      lines: values!.line_id,
    }
    await $api.consignees.updateImportRebate(id!.toString(), body)
    snackbar.add({
      type: 'success',
      text: 'Rebate updated successfully',
    })
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const updateRebateExport = async () => {
  try {
    loadingStore.start()
    const values = customerFormRef.value?.values
    const body = {
      rebate_export: values!.rebate_export,
      lines: values!.line_export_id,
    }
    await $api.consignees.updateExportRebate(id!.toString(), body)
    snackbar.add({
      type: 'success',
      text: 'Rebate updated successfully',
    })
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const saveExecutive = async (values: any) => {
  try {
    loadingStore.start()
    const response = await $api.consignees.updateExecutive(id!.toString(), values)

    const resSuccess = await $api.consignees.getById(id!.toString())
    consignee.value.consignee_executives = resSuccess.consignee_executives
    showExecutiveForm.value = false
    snackbar.add({
      type: 'success',
      text: 'Executive added successfully',
    })
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const showConfirmDelete = async (consigneeExecutiveId: any) => {
  const result = await confirm({
    title: 'Are you sure?',
    confirmationText: 'Update',
    content: 'Please confirm you want to delete or activate this executive.',
    dialogProps: {
      persistent: true,
      maxWidth: 500,
    },
    confirmationButtonProps: {
      color: 'primary',
    },
  })

  if (result) {
    try {
      loadingStore.start()
      const response = await $api.consignees.deleteConsignee(consigneeExecutiveId)
      snackbar.add({
        type: 'success',
        text: 'Executive deleted successfully',
      })

      // remove the deleted executive from the list
      consignee.value.consignee_executives = consignee.value.consignee_executives.filter(
        (item: any) => item.id !== consigneeExecutiveId
      )
    } catch (e) {
      console.error(e)
    } finally {
      setTimeout(() => {
        loadingStore.stop()
      }, 250)
    }
  }
}

const toggleExecutiveForm = () => {
  showExecutiveForm.value = !showExecutiveForm.value
}

const getConsigneeCatalogs = async () => {
  const response = await $api.consignees.getCatalogs()

  catalogs.value = response as any
}

const getData = async () => {
  try {
    loadingStore.start()
    const response: any = await $api.consignees.getById(id!.toString())
    // response.is_import = response.is_import === 1
    // response.is_export = response.is_export === 1
    // response.is_air_import = response.is_air_import === 1
    // response.is_air_export = response.is_air_export === 1
    consignee.value = response
    consignee.value.line_id = response.rebate_lines
      .map((item: any) => item.line_id)
    consignee.value.line_export_id = response.rebate_lines_export
      .map((item: any) => item.line_id)
    // console.log(customerFormRef.value)
    // customerFormRef.value?.setValues(response)
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

await getConsigneeCatalogs()
await getData()
</script>
