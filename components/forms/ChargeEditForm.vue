<template>
  <div>
    <div class="grid grid-cols-12 gap-4 mb-2">
      <div class="col-span-12">
        <h2 class="text-2xl font-bold">Charge: {{ charge.name }}</h2>
      </div>
      <div class="col-span-6">
        <v-card color="">
          <v-card-text>
            <div>
              <v-text-field
                variant="filled"
                v-model="charge.name"
                readonly
                label="Name *"
                hint="Changing the name is not possible"
              />
              <button
                type="button"
                @click="searchChargesByName"
                class="mt-2 inline-flex items-center rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
              >
                Search similar
              </button>
              <div v-if="hasSimilarCharges" class="py-4 bg-slate-200 dark:bg-neutral-700 mb-4 border-dotted border-2">
                <div class="text-sm font-bold">Charges with similar name:</div>
                <div class="max-h-96 overflow-y-auto">
                  <div v-for="charge in similiarCharges" :key="charge.id" class="p-1">
                    {{ charge.name }} #{{ charge.id }}
                  </div>
                </div>
              </div>
            </div>
            <div>
              <v-text-field v-model="charge.code" density="compact" label="Code " />
            </div>

            <div>
              <v-autocomplete
                v-model="charge.charge_entity_id"
                density="compact"
                label="Entity"
                :items="chargeEntities"
                item-title="name"
                item-value="id"
                hint="Depending on the type of service where you can select the charge in the system."
              />
            </div>

            <div>
              <v-autocomplete
                v-model="charge.update_services"
                density="compact"
                label="Service(s)"
                :items="serviceTypes"
                item-title="name"
                item-value="id"
                multiple
                hint="Depending on the type of service where you can select the charge in the system."
              />
            </div>

            <div class="grid grid-cols-3 gap-2">
              <div class="col-span-2">
                <v-text-field v-model="charge.default_amount" density="compact" label="default amount" />
              </div>
              <div>
                <v-autocomplete
                  v-model="charge.default_currency_id"
                  density="compact"
                  label="Currency"
                  :items="currencies"
                  item-title="name"
                  item-value="id"
                />
              </div>
            </div>

            <div>
              <v-checkbox v-model="charge.can_be_deleted" label="Can be deleted?" />
            </div>

            <div>
              <v-checkbox v-model="charge.is_for_free_format_cfdi" label="Is for Free Format CFDI?" />
            </div>

            <div class="flex justify-center items-center">
              <NuxtLink
                to="/configuration/charges"
                class="mr-4 inline-flex items-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700"
              >
                Cancel
              </NuxtLink>
              <button
                type="button"
                @click="validateBeforeUpdate"
                class="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
              >
                Save changes
              </button>
            </div>
          </v-card-text>
        </v-card>
      </div>
      <div class="col-span-6">
        <div v-if="isSeaCharge" class="mb-4">
          <v-alert color="blue-grey-lighten-4">
            <v-alert-title>Sea charge options</v-alert-title>
            <div class="grid grid-cols-3 gap-2 mx-4">
              <div>
                <v-switch v-model="charge.sea_is_import" color="green" density="compact" label="is Import" />
              </div>
              <div>
                <v-switch v-model="charge.sea_is_export" color="green" density="compact" label="is Export" />
              </div>
              <div></div>
              <div>
                <v-switch v-model="charge.is_local" color="green" density="compact" label="is local?" />
              </div>
              <div>
                <v-switch
                  v-model="charge.is_warranty_deposit"
                  color="green"
                  density="compact"
                  label="is warranty deposit?"
                />
              </div>
              <div>
                <v-switch v-model="charge.is_ocean_freight" color="green" density="compact" label="is OCF?" />
              </div>
            </div>
          </v-alert>
        </div>
        <div v-if="isAirCharge" class="mb-4">
          <v-alert color="blue-grey-lighten-4">
            <v-alert-title>Air charge options</v-alert-title>
            <div class="grid grid-cols-2 gap-2 mx-4">
              <div>
                <v-switch v-model="charge.air_is_import" color="green" density="compact" label="is Import" />
              </div>
              <div>
                <v-switch v-model="charge.air_is_export" color="green" density="compact" label="is Export" />
              </div>
              <div>
                <v-switch v-model="charge.is_air_freight" color="green" density="compact" label="is Air Freight?" />
              </div>
            </div>
          </v-alert>
        </div>
        <div v-if="isFreeFormatCharge" class="mb-4">
          <v-alert color="blue-grey-lighten-4">
            <v-alert-title>Free format options</v-alert-title>
            <div class="grid grid-cols-2 gap-2 mx-4">
              <div>
                <v-switch v-model="charge.free_iva" color="green" density="compact" label="include IVA" />
              </div>
            </div>
          </v-alert>
        </div>

        <v-card color="" class="mb-4">
          <v-card-title>
            <div class="flex justify-between">
              <div>Invoice similar name(s)</div>
              <div class="flex items-center gap-2">
                <!-- Authorization status indicator -->
                <div v-if="isSuperAdmin" class="flex items-center gap-1">
                  <div class="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span class="text-xs text-purple-600">Super Admin</span>
                </div>
                <div v-else-if="authState.loading" class="text-xs text-gray-500">
                  Checking...
                </div>
                <div v-else-if="authState.authorized" class="flex items-center gap-1">
                  <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span class="text-xs text-green-600">Authorized</span>
                </div>
                <div v-else-if="authState.pending" class="flex items-center gap-1">
                  <div class="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span class="text-xs text-yellow-600">Pending</span>
                </div>
                <div v-else class="flex items-center gap-1">
                  <div class="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span class="text-xs text-red-600">Not Authorized</span>
                </div>
                
                <button
                  type="button"
                  @click="toggleCfdiForm"
                  :disabled="!isSuperAdmin && !authState.authorized && !authState.pending"
                  class="inline-flex items-center justify-center rounded-full bg-emerald-500 px-2 py-1 text-xs font-medium text-white shadow-sm hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  +
                </button>
              </div>
            </div>
          </v-card-title>
          <v-card-text>
            <!-- Authorization message -->
            <div v-if="!isSuperAdmin && !authState.authorized && !authState.pending && !authState.loading" class="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <div class="text-sm text-yellow-800">
                <strong>Authorization Required:</strong> You need to request authorization to add similar invoice names.
              </div>
              <button
                type="button"
                @click="openAuthDialog"
                class="mt-2 inline-flex items-center rounded-md bg-yellow-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-1"
              >
                Request Authorization
              </button>
            </div>
            
            <div v-if="authState.pending && !authState.loading" class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div class="text-sm text-blue-800">
                <strong>Pending Authorization:</strong> Your request is pending approval. You'll be notified when it's approved.
              </div>
            </div>
            
            <div v-if="cfdiForm.show" class="grid grid-cols-2 gap-2">
              <div class="col-span-2">
                <v-text-field variant="filled" v-model="cfdiForm.cfdi.name" label="Name *" />
              </div>
              <div class="col-span-2">
                <div class="flex justify-end items-center">
                  <button
                    type="button"
                    @click="toggleCfdiForm"
                    class="mr-4 inline-flex items-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    @click="saveCfdiName"
                    class="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
            <v-table density="compact">
              <thead>
                <tr>
                  <th class="text-left w-24">Actions</th>
                  <th class="text-left">Name</th>
                  <th class="text-left w-32">Registered by</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in charge?.cfdi_names" :key="`consig-exec-${index}`">
                  <td>
                    <div class="flex gap-2">
                      <button
                        type="button"
                        @click="deleteCfdiName(item.id)"
                        class="inline-flex items-center justify-center rounded-full bg-red-500 px-2 py-1 text-xs font-medium text-white shadow-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                      >
                        ✕
                      </button>
                    </div>
                  </td>
                  <td>{{ item.name }}</td>
                  <td>
                    <span v-if="item.creator" class="text-caption text-grey-darken-1">
                      {{ item.creator.name }}
                    </span>
                    <span v-else class="text-caption text-grey-lighten-1">—</span>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>
        </v-card>
      </div>
    </div>
    
    <!-- Authorization Request Dialog -->
    <v-dialog v-model="showAuthDialog" max-width="500px">
      <v-card>
        <v-card-title class="text-h5">
          Request Authorization for Similar Names
        </v-card-title>
        <v-card-text>
          <div class="mb-4">
            <p class="text-gray-600 mb-4">
              You need authorization to add similar invoice names to this charge. Please provide a reason for your request.
            </p>
            <v-textarea
              v-model="authReason"
              label="Reason for request"
              rows="3"
              variant="filled"
              hint="Explain why you need to add similar names to this charge"
            />
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="showAuthDialog = false">
            Cancel
          </v-btn>
          <v-btn 
            color="primary" 
            @click="requestAuthorization"
            :disabled="!authReason.trim()"
          >
            Submit Request
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    
    <SimilarItemsDialog v-model="showSimilarDialog" :similar-items="similiarCharges" @proceed="confirmUpdate" />
  </div>
</template>
<script setup lang="ts">
import { serviceTypes, chargeEntities, currencies } from '~/utils/data/systemData'
const router = useRouter()
const route = useRoute()
const { $api } = useNuxtApp()
const loadingStore = useLoadingStore()
const snackbar = useSnackbar()
const user = useSanctumUser<any>()

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
})

const cfdiForm = ref({
  show: false,
  cfdi: { name: '' },
})

// Authorization state
const authState = ref({
  authorized: false,
  pending: false,
  authorization: null,
  pendingRequest: null,
  loading: false,
})

// Check if current user is Super Admin - Super Admins bypass all authorization
const isSuperAdmin = computed(() => {
  return user.value?.roles?.some((role: any) => role.name === 'Super Admin') || false
})

const showAuthDialog = ref(false)
const authReason = ref('')

const toggleCfdiForm = () => {
  cfdiForm.value = { show: !cfdiForm.value.show, cfdi: { name: '' } }
}

// Authorization methods
const checkAuthorization = async () => {
  try {
    authState.value.loading = true
    
    // Super Admin bypass - always authorized
    if (isSuperAdmin.value) {
      authState.value.authorized = true
      authState.value.pending = false
      authState.value.authorization = null
      authState.value.pendingRequest = null
      authState.value.loading = false
      return
    }
    
    const response = await $api.charges.checkSimilarNamesAuth(props.id)
    authState.value.authorized = response.authorized
    authState.value.pending = !!response.pending_request
    authState.value.authorization = response.authorization || null
    authState.value.pendingRequest = response.pending_request || null
  } catch (error) {
    console.error('Error checking authorization:', error)
    snackbar.add({ type: 'error', text: 'Error checking authorization status' })
  } finally {
    authState.value.loading = false
  }
}

const requestAuthorization = async () => {
  try {
    loadingStore.start()
    const response = await $api.charges.requestSimilarNamesAuth(props.id, authReason.value)
    
    if (response.request) {
      snackbar.add({ type: 'success', text: 'Authorization request submitted successfully' })
      showAuthDialog.value = false
      authReason.value = ''
      await checkAuthorization() // Refresh status
    }
  } catch (error) {
    console.error('Error requesting authorization:', error)
    snackbar.add({ type: 'error', text: 'Error requesting authorization' })
  } finally {
    loadingStore.stop()
  }
}

const openAuthDialog = () => {
  showAuthDialog.value = true
}

const charge = ref<any>({})
const similiarCharges = ref<any>([])
const showSimilarDialog = ref(false) // Controls dialog visibility

const hasSimilarCharges = computed(() => similiarCharges.value.length > 0)

const confirmUpdate = () => {
  updateCharge()
}

const updateCharge = async () => {
  // if charge.services as array of objects get ids
  if (charge.value.services) {
    charge.value.services = normalizeArray(charge.value.services)
  }
  await $api.charges.update(props.id, charge.value)

  snackbar.add({ type: 'success', text: 'Charge updated' })
  router.push('/configuration/charges')
}

const isSeaCharge = computed(() => charge.value?.update_services?.includes(1))
const isAirCharge = computed(() => charge.value?.update_services?.includes(2))
const isFreeFormatCharge = computed(() => charge.value?.update_services?.includes(4))

const normalizeArray = (arr: any) => {
  if (!Array.isArray(arr)) {
    return []
  }
  return arr.map((item) => (typeof item === 'number' ? item : item.id))
}

const saveCfdiName = async () => {
  try {
    loadingStore.start()
    
    // Check authorization first (Super Admins bypass this)
    if (!isSuperAdmin.value && !authState.value.authorized) {
      if (authState.value.pending) {
        snackbar.add({ 
          type: 'warning', 
          text: 'Authorization request is pending approval. Please wait for approval before adding similar names.' 
        })
        return
      }
      
      // Show authorization dialog
      openAuthDialog()
      return
    }
    
    const body = { name: cfdiForm.value.cfdi.name }
    const response = await $api.charges.addCfdiName(props.id, body)
    
    await getData()
    cfdiForm.value = { show: false, cfdi: { name: '' } }

    snackbar.add({ type: 'success', text: 'Cfdi name created' })
  } catch (error: any) {
    console.error(error)
    
    // Handle different types of errors
    if (error.response?.status === 403) {
      const errorData = error.response.data
      
      if (errorData?.requires_authorization) {
        // Authorization required - show dialog
        snackbar.add({ 
          type: 'warning', 
          text: 'Authorization required. Please request authorization first.' 
        })
        openAuthDialog()
      } else if (errorData?.error_type === 'authorization_required') {
        // Specific authorization error
        snackbar.add({ 
          type: 'warning', 
          text: 'You need authorization to add similar names. Please request authorization first.' 
        })
        openAuthDialog()
      } else {
        // General permission error
        snackbar.add({ 
          type: 'error', 
          text: 'You do not have permission to add similar names. Please contact your administrator.' 
        })
      }
    } else {
      // Other errors
      snackbar.add({ 
        type: 'error', 
        text: 'Error adding CFDI name. Please try again.' 
      })
    }
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const validateBeforeUpdate = async () => {
  if (!charge.value.name || charge.value.name === '') {
    snackbar.add({ type: 'warning', text: 'Name is required' })
    return
  }
  await searchChargesByName()
  if (similiarCharges.value.length === 0) {
    confirmUpdate()
    return
  }
  showSimilarDialog.value = true
}

const searchChargesByName = async () => {
  try {
    loadingStore.loading = true
    const body = {
      name: charge.value.name,
    }
    const response = await $api.charges.searchByName(body)
    const items = Array.isArray(response) ? response : []
    similiarCharges.value = items.filter((item: any) => String(item.id) !== String(props.id))
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const deleteCfdiName = async (id: string) => {
  try {
    loadingStore.start()
    const body = {
      id: id,
    }
    await $api.charges.deleteCfdiName(props.id, body)
    await getData()

    snackbar.add({ type: 'success', text: 'Cfdi name deleted' })
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const getData = async () => {
  try {
    loadingStore.start()
    const response = await $api.charges.getById(props.id)
    charge.value = response
    charge.value.can_be_deleted = charge.value.can_be_deleted === 1
    charge.value.is_for_free_format_cfdi = charge.value.is_for_free_format_cfdi === 1
    // for each charge.services set update_services with ids
    if (charge.value.services) {
      charge.value.update_services = Array.from(new Set(charge.value.services.map((item: any) => item.id)))
    }
    // set air_is_import and air_is_export
    if (charge.value.services) {
      const airService = charge.value.services.find((item: any) => item.id === 2)
      charge.value.air_is_import = airService?.pivot?.is_import === 1
      charge.value.air_is_export = airService?.pivot?.is_export === 1

      const seaService = charge.value.services.find((item: any) => item.id === 1)
      charge.value.sea_is_import = seaService?.pivot?.is_import === 1
      charge.value.sea_is_export = seaService?.pivot?.is_export === 1
      charge.value.is_local = seaService?.pivot?.is_local === 1
      charge.value.is_warranty_deposit = seaService?.pivot?.is_warranty_deposit === 1
      charge.value.is_ocean_freight = seaService?.pivot?.is_ocean_freight === 1
      charge.value.is_air_freight = airService?.pivot?.is_air_freight === 1

      const freeFormat = charge.value.services.find((item: any) => item.id === 4)
      charge.value.free_iva = freeFormat?.pivot?.free_iva === 1
    }

    // Check authorization status after loading charge data
    await checkAuthorization()
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
