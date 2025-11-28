<template>
  <div>
    <VeeForm @submit="onSaveSeaImportClick" :validation-schema="schema" ref="seaImportAddFormRef">
      <v-card class="mb-4">
        <v-card-title><div class="font-bold">New Sea Import reference</div></v-card-title>
        <v-card-subtitle>Mexico Form</v-card-subtitle>
        <v-card-text>
          <div v-if="isNextYearClose">
            <v-alert density="compact" color="blue-lighten-3" icon="mdi-skip-forward-outline" border class="my-4">
              <div class="font-bold">
                The year {{ nextYear }} is close, select if you want to use the next year for the reference.
              </div>
              <InputCheckbox
                color="primary"
                name="next_year"
                density="compact"
                label="Create reference for next year"
                hide-details
              />
              <div class="italic">
                Current reference year
                <span class="font-bold">{{
                  seaImportAddFormRef?.values.next_year ? nextYear : new Date().getFullYear()
                }}</span>
              </div>
            </v-alert>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-6 gap-2">
            <div class="col-span-2">
              <InputAutocomplete
                name="line_id"
                density="compact"
                label="Line responsable *"
                :items="catalogs.lines"
                item-title="name_code"
                item-value="id"
              />
            </div>
            <div>
              <InputAutocomplete
                name="vessel_departure_id"
                density="compact"
                label="Departure vessel"
                append-inner-icon="mdi-ray-start-arrow"
                :items="lineResponsableVessels"
                item-title="name"
                item-value="id"
              />
            </div>
            <div>
              <InputText
                name="voyage_departure"
                append-inner-icon="mdi-ray-start-arrow"
                density="compact"
                label="Departure voyage"
              />
            </div>
            <div>
              <InputText name="etd_date" type="date" density="compact" label="ETD *" />
            </div>
            <div>
              <InputText name="eta_date" type="date" density="compact" label="ETA(1)" />
            </div>
          </div>
          <div class="grid grid-cols-4 gap-2">
            <div class="col-span-2">
              <AGlobalSearch
                :onSearch="searchImportVoyages"
                validate-key="voyage_discharge_id"
                label="Arrival voyage"
                prepend-inner-icon="mdi-ray-end-arrow"
                :set-id="seaImportAddFormRef?.values.voyage_discharge_id || undefined"
              />
            </div>
            <div class="col-span-2">
              <AGlobalSearch
                :onSearch="searchFfs"
                validate-key="freight_forwarder_id"
                label="Freight forwarder"
                :set-id="seaImportAddFormRef?.values.freight_forwarder_id || undefined"
              />
            </div>
          </div>

          <div class="grid grid-cols-4 gap-2">
            <div>
              <InputAutocomplete
                name="sea_region_id"
                density="compact"
                label="Region"
                :items="catalogs.sea_regions"
                item-title="name"
                item-value="id"
              />
            </div>
            <div>
              <InputAutocomplete
                name="service_contract_id"
                density="compact"
                label="Service contract"
                :items="catalogs.service_contracts"
                item-title="name"
                item-value="id"
              />
            </div>
            <div></div>
          </div>

          <div class="grid grid-cols-4 gap-2">
            <div>
              <AGlobalSearch
                :onSearch="(params : SearchParams) => searchDestinations(params, 'origin')"
                validate-key="origin_id"
                append-inner-icon="mdi-ray-start-arrow"
                label="Origin"
                :set-id="seaImportAddFormRef?.values.origin_id || undefined"
              />
            </div>
            <div>
              <AGlobalSearch
                :onSearch="searchPolPorts"
                validate-key="pol_id"
                prepend-inner-icon="mdi-ferry"
                :item-title="(row : any) => `[${row.country?.code2}] ${row.name}`"
                label="POL *"
              />
            </div>
            <div>
              <AGlobalSearch
                :onSearch="searchPodPorts"
                validate-key="pod_id"
                append-inner-icon="mdi-ferry"
                :item-title="(row : any) => `[${row.country?.code2}] ${row.name}`"
                label="POD *"
              />
            </div>
            <div>
              <AGlobalSearch
                :onSearch="(params : SearchParams) => searchDestinations(params, 'destination')"
                validate-key="destination_id"
                append-inner-icon="mdi-ray-start-arrow"
                label="Destination"
                :set-id="seaImportAddFormRef?.values.destination_id || undefined"
              />
            </div>
          </div>
          <v-card density="compact" class="mb-2">
            <v-card-title>
              <div class="flex justify-between">
                <div class="flex items-center">
                  <v-icon size="x-small">mdi-multicast</v-icon>
                  <div class="ml-2 font-bold">Transhipment information</div>
                </div>
                <div>
                  <v-btn icon="mdi-plus" size="x-small" color="success" @click="addTranshipment"></v-btn>
                </div>
              </div>
            </v-card-title>
            <v-card-text>
              <div v-for="(tranship, index) in transhipments" :key="`tranship-${index}`" class="grid grid-cols-2 gap-2">
                <div>
                  <AGlobalSearch
                    v-model="tranship.port_id"
                    :onSearch="searchPorts"
                    validate-key="tranship.port_id"
                    prepend-inner-icon="mdi-ferry"
                    :item-title="(row : any) => `[${row.country?.code2}] ${row.name}`"
                    label="T/S Port"
                  />
                </div>
                <div class="flex items-start gap-2">
                  <v-text-field v-model="tranship.tranship_date" type="date" density="compact" label="Date" />

                  <v-btn
                    icon="mdi-delete-outline"
                    size="x-small"
                    color="red"
                    class="mt-2"
                    @click="removeTranshipment(index)"
                  ></v-btn>
                </div>
              </div>
            </v-card-text>
          </v-card>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <InputText name="po_num" density="compact" label="PO Number" />
            </div>
            <div>
              <InputText
                name="booking_number"
                density="compact"
                label="Booking Number"
                append-inner-icon="mdi-file-document-outline"
              />
            </div>

            <SeaImportMasterBlsSmart :consigneesmbls="catalogs.consignee_mbls" @update:masterBls="masterBls = $event" />

            <SeaImportHouseBlsSmart @update:houseBls="houseBls = $event" />
          </div>
        </v-card-text>
      </v-card>
      <v-card class="mb-4">
        <v-card-title>
          <div class="flex items-center">
            <v-icon size="x-small">mdi-account-outline</v-icon>
            <div class="ml-2 font-bold">Customer information</div>
          </div>
        </v-card-title>
        <v-card-text>
          <div class="grid grid-cols-5 gap-2">
            <div class="col-span-3">
              <div class="grid grid-cols-3 gap-2">
                <div class="col-span-2">
                  <AGlobalSearch
                    :onSearch="searchCustomers"
                    validate-key="consignee_id"
                    label="Consignee *"
                    :set-id="seaImportAddFormRef?.values.consignee_id || undefined"
                    @update:model-value="onConsigneeChange"
                  />
                </div>

                <div>
                  <v-text-field v-model="executive" readonly density="compact" label="Executive" />
                </div>
                <div>
                  <AGlobalSearch
                    :onSearch="searchShippers"
                    validate-key="shipper_id"
                    label="Shipper"
                    :set-id="seaImportAddFormRef?.values.shipper_id || undefined"
                  />
                </div>
                <div>
                  <InputText name="notify" density="compact" label="Notify" />
                </div>
              </div>
              <div class="grid grid-cols-3 gap-2">
                <div>
                  <InputAutocomplete
                    name="release_type"
                    density="compact"
                    label="Release typing"
                    :items="releaseTypings"
                    item-title="name"
                  />
                </div>
                <div>
                  <AGlobalSearch :onSearch="searchFfs" validate-key="release_agent_id" label="Release (Agent)" />
                </div>
              </div>
            </div>
            <div class="col-span-2">
              <v-card density="compact" color="secondary">
                <v-card-title>
                  <div class="flex justify-start items-center">
                    <v-icon size="x-small">mdi-account-outline</v-icon>
                    <div class="ml-2 font-bold">Customer info</div>
                  </div>
                </v-card-title>
                <v-card-text>
                  <div v-if="!consigneeInfo">Select a customer to see more information</div>
                  <div v-if="consigneeInfo">
                    <div class="font-bold mb-2">
                      <v-chip>{{ consigneeInfo.import_credit_days }} credit days</v-chip>
                      <v-chip :color="creditDaysColor">{{ consigneeCreditFinalDate }}</v-chip>
                    </div>
                    <div class="font-bold mb-2">
                      <v-chip>{{ consigneeInfo.import_free_days }} free days</v-chip>
                    </div>
                    <div class="font-bold">Guarantee letters</div>
                    <div v-if="consigneeInfo.warranty_letters_current.length <= 0" class="font-italic">
                      There are no warranty letters.
                    </div>
                    <div
                      v-for="(wl, wlidx) in consigneeInfo.warranty_letters_current"
                      :key="`wl-${wlidx}`"
                      class="mb-2"
                    >
                      <div :class="colorValidDateWl(wl)">
                        <div>Agent: {{ wl.custom_agent?.short_name }}</div>
                        <div>From: {{ wl.valid_from }}</div>
                        <div>To: {{ wl.valid_to }}</div>
                      </div>
                    </div>
                    <div class="font-bold">Entrust letters</div>
                    <div v-if="consigneeInfo.entrust_letters_current.length <= 0" class="font-italic">
                      There are no entrust letters.
                    </div>
                    <div
                      v-for="(enle, elidx) in consigneeInfo.entrust_letters_current"
                      :key="`el-${elidx}`"
                      class="mb-2"
                    >
                      <div v-if="entrustSamePort(enle)" :class="colorValidDateWl(enle)">
                        <div>Agent: {{ enle.custom_agent?.short_name }}</div>
                        <div>Port: {{ enle.port?.name }}</div>
                        <div>From: {{ enle.valid_from }}</div>
                        <div>To: {{ enle.valid_to }}</div>
                      </div>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </div>
          </div>
        </v-card-text>
      </v-card>
      <v-card class="mb-4">
        <v-card-title>
          <div class="flex items-center">
            <v-icon size="x-small">mdi-package-variant-closed</v-icon>
            <div class="ml-2 font-bold">Cargo information</div>
          </div>
        </v-card-title>
        <v-card-text>
          <div class="grid grid-cols-2 gap-2">
            <div class="border-double border-4 border-sky-200 p-2">
              <div class="font-bold mb-2">Total cargo</div>
              <div class="grid grid-cols-3 gap-2">
                <div>
                  <v-text-field
                    v-model="cargo.total_m3"
                    density="compact"
                    label="M3"
                    :readonly="true"
                    prepend-inner-icon="mdi-axis-arrow-info"
                  />
                </div>
                <div>
                  <v-text-field
                    v-model="cargo.total_kgs"
                    density="compact"
                    label="KGS"
                    :readonly="true"
                    prepend-inner-icon="mdi-weight-kilogram"
                  />
                </div>
                <div>
                  <v-text-field
                    v-model="cargo.total_packages"
                    density="compact"
                    label="Packages"
                    :readonly="true"
                    prepend-inner-icon="mdi-package-variant-closed"
                  />
                </div>
                <div class="col-span-3">
                  <InputAutocomplete
                    name="cargo_type"
                    density="compact"
                    label="Condition type"
                    :items="cargoTypes"
                    item-title="name"
                    prepend-inner-icon="mdi-select-compare"
                  />
                </div>
                <div v-if="isConditionLCL" class="col-span-3">
                  <AGlobalSearch
                    :onSearch="searchSuppliers"
                    validate-key="coloader_id"
                    label="Co-loader"
                    prepend-inner-icon="mdi-vector-link"
                    :set-id="seaImportAddFormRef?.values.coloader_id || undefined"
                  />
                </div>
                <div class="col-span-3">
                  <InputAutocomplete
                    name="embalaje_id"
                    density="compact"
                    label="Tipo de embalaje"
                    :items="catalogs.embalajes"
                    item-title="name"
                    item-value="id"
                    prepend-inner-icon="mdi-webpack"
                  />
                </div>
                <div class="col-span-3">
                  <InputTextArea
                    name="commodity"
                    density="compact"
                    :rows="3"
                    :counter="3000"
                    label="Commodities description"
                  />
                </div>
              </div>
            </div>
            <div>
              <SeaImportContainersSmart
                impoExpo="I"
                :catalogs="catalogs"
                :containers="containers"
                :cargo-type="seaImportAddFormRef?.values.cargo_type"
                @update:containers="containers = $event"
              />
            </div>
          </div>
        </v-card-text>
      </v-card>
      <v-card class="mb-4">
        <v-card-title>
          <div class="flex justify-between">
            <div class="flex items-center">
              <v-icon size="x-small">mdi-train-car-intermodal</v-icon>
              <div class="ml-2 font-bold">Intermodal information</div>
            </div>
          </div>
        </v-card-title>
        <v-card-text>
          <div class="grid grid-cols-2">
            <div class="min-w-32">
              <v-radio-group
                v-model="intermodalMode.intermodal"
                label="Select transportation mode"
                row
                @update:modelValue="intermodalMode.internal_transit = null"
              >
                <v-radio
                  v-for="(transp, idx) in catalogs.transportation_modes"
                  :label="transp.name"
                  :value="transp.id"
                  :key="`transp-${idx}`"
                ></v-radio>
              </v-radio-group>
              <v-btn
                v-if="intermodalMode.intermodal"
                @click="intermodalMode.intermodal = null"
                color="red"
                size="x-small"
                >No intermodal</v-btn
              >
            </div>
            <div v-if="canIntermodalTransit" class="px-4">
              <v-checkbox v-model="intermodalMode.internal_transit" label="Internal transit" />
              <p>
                If the box is checked, additional files for the shipping line can be attached at the time of arrival
                notification.
              </p>
            </div>
          </div>
        </v-card-text>
      </v-card>

      <div class="fixed bottom-14 right-0 m-4 bg-red-100 p-2">
        <div class="col-span-12 flex justify-end items-center">
          <v-btn class="mr-4" color="secondary" to="/maritime/import"> Cancel </v-btn>
          <v-btn color="primary" type="submit"> Save </v-btn>
        </div>
      </div>
    </VeeForm>
  </div>
</template>

<script setup lang="ts">
import { cargoTypes } from '@/utils/data/seaData'
import { schema } from '~~/forms/maritimeReferenceForm'
import VeeForm from '@/components/global/VeeForm.vue'

const router = useRouter()
const route = useRoute()
const { $api } = useNuxtApp()
const loadingStore = useLoadingStore()
const snackbar = useSnackbar()

const seaImportAddFormRef = ref<InstanceType<typeof VeeForm> | null>(null)

const catalogs = ref<any>({
  lines: [],
  sea_regions: [],
  consignees: [],
  consignee_mbls: [],
  freights: [],
  vessels: [],
  voyage_destinations: [],
  ports: [],
  shippers: [],
  container_types: [],
  transportation_modes: [],
  charges: [],
  service_contracts: [],
  embalajes: [],
  destinations: [],
})

const intermodalMode = ref<any>({
  intermodal: null,
  internal_transit: null,
})
const buyRate = ref(null)
const sellRate = ref(null)
const creditDebitNotes = ref<any>([])

const consigneeInfo = ref<any>(null)

const transhipments = ref<any>([])
const masterBls = ref<any>([])
const houseBls = ref<any>([])
const containers = ref<any>([])
const charges = ref<any>([])

const isNextYearClose = computed(() => {
  const today = new Date()
  const nextYear = new Date(today.getFullYear() + 1, 0, 1)
  const diff = nextYear.getTime() - today.getTime()
  const days = diff / (1000 * 60 * 60 * 24)
  return days <= 180 // TODO change to 60
})

const nextYear = computed(() => {
  const today = new Date()
  return today.getFullYear() + 1
})

const cargo = computed(() => {
  let total_m3 = containers.value.reduce((acc: any, container: any) => {
    return acc + parseFloat(container.volume)
  }, 0)
  let total_kgs = containers.value.reduce((acc: any, container: any) => {
    return acc + parseFloat(container.weight)
  }, 0)
  let total_packages = containers.value.reduce((acc: any, container: any) => {
    return acc + parseInt(container.num_packages)
  }, 0)

  total_m3 = isNaN(total_m3) ? 0 : parseFloat(total_m3).toFixed(4)
  total_kgs = isNaN(total_kgs) ? 0 : parseFloat(total_kgs).toFixed(4)
  total_packages = isNaN(total_packages) ? 0 : parseInt(total_packages)

  return {
    total_m3,
    total_kgs,
    total_packages,
  }
})

const lineResponsableVessels = computed(() => {
  return catalogs.value.vessels.filter((vessel: any) => vessel.line_id === seaImportAddFormRef.value?.values.line_id)
})

const executive = computed(() => {
  if (consigneeInfo.value?.executive_active?.executive) {
    const name = consigneeInfo.value?.executive_active?.executive?.name
    let validTo = consigneeInfo.value?.executive_active?.valid_to
    if (consigneeInfo.value?.executive_active?.undefined_time === 1) {
      validTo = 'Indefinite'
    }

    return `${name} (Until: ${validTo})`
  }
  return ''
})

const canIntermodalTransit = computed(() => {
  return intermodalMode.value.intermodal === 1 || intermodalMode.value.intermodal === 3
})

const onConsigneeChange = async (value: any) => {
  console.log(value)
  if (!value) return
  try {
    loadingStore.start()
    const response = await $api.consignees.getDetailsForReference(value)

    consigneeInfo.value = response
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

interface SearchParams {
  name?: string
  id?: number
  [key: string]: any // Allow additional keys, but we will filter them
}

const searchCustomers = async (search: SearchParams) => {
  try {
    const response = await $api.consignees.searchConsignees({
      query: search,
    })
    return response
  } catch (error) {
    snackbar.add({
      type: 'error',
      text: 'Error fetching consignees',
    })
  }
}

const searchShippers = async (search: SearchParams) => {
  try {
    const response = await $api.shippers.searchShippers({
      query: search,
    })
    return response
  } catch (error) {
    snackbar.add({
      type: 'error',
      text: 'Error fetching shippers',
    })
  }
}

const searchFfs = async (params: SearchParams) => {
  try {
    const response = await $api.freightForwarders.searchFfs({
      query: params,
    })
    return response
  } catch (error) {
    snackbar.add({
      type: 'error',
      text: 'Error fetching freight forwarders',
    })
  }
}

const searchSuppliers = async (params: SearchParams) => {
  try {
    const response = await $api.suppliers.searchSuppliers({
      query: params,
    })
    return response
  } catch (error) {
    snackbar.add({
      type: 'error',
      text: 'Error fetching suppliers',
    })
  }
}

const searchImportVoyages = async (search: SearchParams) => {
  try {
    const response = await $api.voyages.searchImportVoyages({
      query: search,
    })
    return response
  } catch (error) {
    snackbar.add({
      type: 'error',
      text: 'Error fetching voyages',
    })
  }
}

const searchDestinations = async (search: SearchParams, type: string) => {
  try {
    // Define the allowed keys you want to search by
    const allowedKeys = ['name', 'id']

    // Create the query object, filtering out any keys not in allowedKeys
    const query = Object.keys(search)
      .filter((key) => allowedKeys.includes(key))
      .reduce((obj: any, key) => {
        obj[key] = search[key]
        return obj
      }, {})

    query['is_foreign'] = type === 'origin' ? 1 : 0
    const response = await $api.destinations.searchDestinations({
      query: query,
    })
    return response
  } catch (error) {
    snackbar.add({
      type: 'error',
      text: 'Error fetching destinations',
    })
  }
}

const searchPorts = async (search: SearchParams) => {
  try {
    // Define the allowed keys you want to search by
    const allowedKeys = ['name', 'id']

    // Create the query object, filtering out any keys not in allowedKeys
    const query = Object.keys(search)
      .filter((key) => allowedKeys.includes(key))
      .reduce((obj: any, key) => {
        obj[key] = search[key]
        return obj
      }, {})

    const response = await $api.ports.searchPorts({
      query: query,
    })
    return response
  } catch (error) {
    snackbar.add({
      type: 'error',
      text: 'Error fetching ports',
    })
  }
}

const searchPolPorts = async (search: SearchParams) => {
  try {
    // Define the allowed keys you want to search by
    const allowedKeys = ['name', 'id']

    // Create the query object, filtering out any keys not in allowedKeys
    const query = Object.keys(search)
      .filter((key) => allowedKeys.includes(key))
      .reduce((obj: any, key) => {
        obj[key] = search[key]
        return obj
      }, {})

    // Add additional static values to the query if needed
    query['not_country_id'] = 140
    const response = await $api.ports.searchPorts({
      query: query,
    })
    return response
  } catch (error) {
    snackbar.add({
      type: 'error',
      text: 'Error fetching ports',
    })
  }
}

const searchPodPorts = async (search: SearchParams) => {
  try {
    // Define the allowed keys you want to search by
    const allowedKeys = ['name', 'id']

    // Create the query object, filtering out any keys not in allowedKeys
    const query = Object.keys(search)
      .filter((key) => allowedKeys.includes(key))
      .reduce((obj: any, key) => {
        obj[key] = search[key]
        return obj
      }, {})

    // Add additional static values to the query if needed
    query['country_ids'] = [140, 90, 65, 12, 52, 170, 61, 157, 1, 96, 167].join(',')
    const response = await $api.ports.searchPorts({
      query: query,
    })
    return response
  } catch (error) {
    snackbar.add({
      type: 'error',
      text: 'Error fetching ports',
    })
  }
}

const getSeaImportCatalogs = async () => {
  const response = await $api.referencias.getSeaImportFormCatalogs()

  catalogs.value = response as any
}

await getSeaImportCatalogs()

const entrustSamePort = (wl: any) => {
  const port = wl.port
  const pod = seaImportAddFormRef?.value?.values.pod_id!
  return parseInt(port?.id) === parseInt(pod)
}

const voyageDestination = computed(() => {
  return catalogs.value.voyage_destinations.find(
    (vd: any) => vd.id == seaImportAddFormRef?.value?.values.voyage_discharge_id
  )
})

const consigneeCreditFinalDate = computed(() => {
  if (!voyageDestination) {
    return 'Select a voyage discharge'
  }
  if (!hasVoyageArrivalDate.value) {
    return 'TBC - ATA date'
  }
  const finalDate = new Date(voyageDestination.value?.arrival_date)
  finalDate.setDate(finalDate.getDate() + consigneeInfo.value?.import_credit_days)
  if (isCreditExpired.value) {
    return 'Credit expired'
  }
  // format Date dd-MMM-yyyy
  const options = { year: 'numeric', month: 'short', day: 'numeric' } as any
  const finalDateFormatted = finalDate.toLocaleDateString('en-US', options)
  return `Until ${finalDateFormatted}`
})

const hasVoyageArrivalDate = computed(() => {
  return !!voyageDestination.value?.arrival_date
})

const isConditionLCL = computed(() => {
  return (
    seaImportAddFormRef?.value?.values.cargo_type === 'LCL' || seaImportAddFormRef?.value?.values.cargo_type === 'COCO'
  )
})

const isCreditExpired = computed(() => {
  if (!voyageDestination || !hasVoyageArrivalDate) {
    return false
  }
  const today = new Date()
  const finalDate = new Date(voyageDestination.value?.arrival_date)
  finalDate.setDate(finalDate.getDate() + consigneeInfo.value?.import_credit_days)
  if (today > finalDate) {
    return true
  }
  return false
})

const creditDaysColor = computed(() => {
  if (!voyageDestination) {
    return 'grey'
  }

  return isCreditExpired.value ? 'red' : 'green'
})

const onSaveSeaImportClick = async (values: any) => {
  try {
    loadingStore.start()
    const body = {
      ...values,
      transhipments: transhipments.value,
      master_bls: masterBls.value,
      house_bls: houseBls.value,
      containers: containers.value,
      transportation_mode: intermodalMode.value,
      charges: charges.value,
      credit_debit_notes: creditDebitNotes.value,
      buy_rate_obj: buyRate.value,
      sell_rate_obj: sellRate.value,
    }
    const response = (await $api.referencias.createSeaImport(body)) as any

    snackbar.add({
      type: 'success',
      text: `Sea import reference #${response.reference_number} created`,
    })

    setTimeout(() => {
      loadingStore.stop()
    }, 250)

    router.push(`/maritime/import/${response.id}`)
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const colorValidDateWl = (wl: any) => {
  const validFrom = new Date(wl.valid_from)
  const validTo = new Date(wl.valid_to)
  const today = new Date()
  let classes = 'flex justify-between p-2'

  if (today >= validFrom && today <= validTo) {
    return `${classes} bg-green-200 dark:bg-green-800`
  }
  return `${classes} bg-red-200 dark:bg-red-800`
}

const releaseTypings = [{ name: 'Original' }, { name: 'Copy' }, { name: 'Console' }]

const addTranshipment = () => {
  transhipments.value.push({
    port_id: null,
    tranship_date: '',
  })
}

const removeTranshipment = (index: number) => {
  transhipments.value.splice(index, 1)
}

onMounted(() => {
  seaImportAddFormRef.value!.setValues({
    notify: 'Same as consignee',
  })
})
</script>
