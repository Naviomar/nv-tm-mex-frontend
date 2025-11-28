<template>
  <div>
    <v-card class="mb-4">
      <v-card-title><div class="font-bold">Sea Export information</div></v-card-title>
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
              <span class="font-bold">{{ values.next_year ? nextYear : new Date().getFullYear() }}</span>
            </div>
          </v-alert>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-6 gap-2">
          <div>
            <InputText
              name="doc_closing_date"
              type="date"
              density="compact"
              variant="solo-filled"
              label="Documentation closing date *"
            />
          </div>
          <div>
            <InputText
              name="voyage_departure"
              density="compact"
              variant="solo-filled"
              label="Departure date"
              readonly
              hint="Select vessel of departure to obtain departure date"
            />
          </div>

          <div>
            <InputText
              name="transit_days"
              type="number"
              density="compact"
              variant="solo-filled"
              label="Transit days *"
            />
          </div>
          <div>
            <InputAutocomplete
              name="nomination_type"
              density="compact"
              label="TM Type"
              :items="[
                { value: 'nomination', name: 'Nomination to TM' },
                { value: 'customer', name: 'Customer TM' },
              ]"
              item-title="name"
              item-value="value"
              variant="solo-filled"
            />
          </div>

          <div>
            <InputText name="po_num" density="compact" variant="solo-filled" label="P.O. / Invoice number" />
          </div>
          <div>
            <InputAutocomplete
              name="bl_type"
              density="compact"
              label="BL type"
              :items="[
                { value: 'master', name: 'BL Master' },
                { value: 'house', name: 'BL House' },
              ]"
              item-title="name"
              item-value="value"
              variant="solo-filled"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div>
            <InputAutocomplete
              name="line_id"
              density="compact"
              label="Line responsable *"
              :items="catalogs.lines"
              item-title="name_code"
              item-value="id"
              variant="solo-filled"
            />
          </div>

          <div>
            <InputAutocomplete
              name="sea_region_id"
              density="compact"
              label="Region *"
              :items="catalogs.sea_regions"
              item-title="name"
              item-value="id"
              variant="solo-filled"
            />
          </div>

          <div>
            <InputAutocomplete
              name="voyage_discharge_id"
              density="compact"
              label="Vessel departure *"
              :items="lineVoyages"
              item-title="name"
              item-value="id"
              variant="solo-filled"
              @update:model-value="updateDepartureDate"
            />
          </div>
        </div>
        <div class="grid grid-cols-4 gap-2">
          <div>
            <AGlobalSearch
              :onSearch="(params : SearchParams) => searchDestinations(params, 'origin')"
              validate-key="origin_id"
              append-inner-icon="mdi-ray-start-arrow"
              label="Origin"
              :set-id="values.origin_id || undefined"
            />
          </div>
          <div>
            <AGlobalSearch
              :onSearch="searchPolPorts"
              validate-key="pol_id"
              prepend-inner-icon="mdi-ferry"
              :item-title="(row : any) => `[${row.country?.code2}] ${row.name}`"
              label="POL *"
              :set-id="values.pol_id"
            />
          </div>
          <div>
            <AGlobalSearch
              :onSearch="searchPodPorts"
              validate-key="pod_id"
              append-inner-icon="mdi-ferry"
              :item-title="(row : any) => `[${row.country?.code2}] ${row.name}`"
              label="POD *"
              :set-id="values.pod_id"
            />
          </div>
          <div>
            <AGlobalSearch
              :onSearch="(params : SearchParams) => searchDestinations(params, 'destination')"
              validate-key="destination_id"
              append-inner-icon="mdi-ray-start-arrow"
              label="Destination"
              :set-id="values.destination_id || undefined"
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
                  validate-key="port_id"
                  append-inner-icon="mdi-ferry"
                  :item-title="(row : any) => `[${row.country?.code2}] ${row.name}`"
                  label="T/S Port"
                />
              </div>
              <div class="flex items-start gap-2">
                <v-text-field
                  v-model="tranship.tranship_date"
                  type="date"
                  density="compact"
                  variant="solo-filled"
                  label="Date"
                />

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
        <div class="grid grid-cols-3 gap-2">
          <div>
            <InputText
              name="booking_number"
              density="compact"
              variant="solo-filled"
              label="Booking Line *"
              append-inner-icon="mdi-file-document-outline"
            />
          </div>
          <div>
            <InputText
              name="booking_tm"
              density="compact"
              variant="solo-filled"
              label="Booking TM"
              hint="System generated"
              readonly
            />
          </div>

          <div class="col-span-2">
            <SeaExportMasterBlsSmart @update:masterBls="masterBls = $event" />
          </div>
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
                  label="Shipper *"
                  :set-id="values.consignee_id || undefined"
                  @update:model-value="onConsigneeChange"
                />
              </div>

              <div>
                <v-text-field v-model="executive" readonly density="compact" variant="solo-filled" label="Executive" />
              </div>
              <div>
                <AGlobalSearch
                  :onSearch="searchExportShippers"
                  validate-key="shipper_id"
                  label="Consignee"
                  :set-id="values.shipper_id || undefined"
                />
              </div>
              <div>
                <AGlobalSearch
                  :onSearch="searchExportShippers"
                  validate-key="notify_id"
                  label="Notify party"
                  :set-id="values.notify_id || undefined"
                />
              </div>

              <div>
                <AGlobalSearch
                  :onSearch="searchFfs"
                  validate-key="freight_forwarder_id"
                  label="Freight forwarder"
                  :set-id="values.freight_forwarder_id || undefined"
                />
              </div>
            </div>
          </div>
          <div class="col-span-2">
            <v-card density="compact" color="blue-grey-lighten-5">
              <v-card-title>
                <div class="flex justify-start items-center">
                  <v-icon size="x-small">mdi-account-outline</v-icon>
                  <div class="ml-2 font-bold">Shipper info</div>
                </div>
              </v-card-title>
              <v-card-text>
                <div v-if="!consigneeInfo">Select a shipper to see more information</div>
                <div v-if="consigneeInfo">
                  <div class="font-bold mb-2">
                    <v-chip>{{ consigneeInfo.export_credit_days }} credit days</v-chip>
                  </div>
                  <div v-if="!consigneeInfo.executive_active">
                    <div class="font-bold">No executive active</div>
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
            <div class="grid grid-cols-3 gap-2">
              <div class="col-span-3">
                <InputAutocomplete
                  name="cargo_type"
                  density="compact"
                  label="Condition type"
                  :items="cargoTypes"
                  item-title="name"
                  variant="solo-filled"
                  prepend-inner-icon="mdi-select-compare"
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
                  variant="solo-filled"
                  prepend-inner-icon="mdi-webpack"
                />
              </div>
              <div class="col-span-3">
                <InputTextArea
                  name="commodity"
                  density="compact"
                  :rows="3"
                  :counter="3000"
                  variant="solo-filled"
                  label="Commodities description"
                />
              </div>
            </div>
          </div>
          <div>
            <SeaExportBkgContainersSmart
              :catalogs="catalogs"
              :containers="booking_containers"
              @update:containers="booking_containers = $event"
            />

            <InputTextArea
              name="posicionamiento"
              density="compact"
              variant="solo-filled"
              label="Posicionamiento"
              :rows="3"
            />

            <InputText name="num_validacarga" density="compact" variant="solo-filled" label="Num. valida carga" />
          </div>
        </div>
      </v-card-text>
    </v-card>

    <div class="fixed bottom-14 right-0 m-4 bg-red-100 p-2">
      <div class="col-span-12 flex justify-end items-center">
        <v-btn class="mr-4" color="secondary" to="/maritime/export"> Cancel </v-btn>
        <v-btn color="primary" @click="onSaveSeaExportClick"> Save </v-btn>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { cargoTypes } from '@/utils/data/seaData'
import { schemaExport } from '~~/forms/maritimeReferenceForm'

const router = useRouter()
const route = useRoute()
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()

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

const catalogs = ref({
  lines: [] as any,
  sea_regions: [] as any,
  consignees: [] as any,
  freights: [] as any,
  vessels: [] as any,
  voyage_destinations: [] as any,
  ports: [] as any,
  shippers: [] as any,
  container_types: [] as any,
  transportation_modes: [] as any,
  charges: [] as any,
  service_contracts: [] as any,
  embalajes: [] as any,
  destinations: [] as any,
})

const creditDebitNotes = ref<any>([])

const consigneeInfo = ref<any>(null)

const transhipments = ref([] as any)
const masterBls = ref([] as any)
const houseBls = ref([] as any)
const containers = ref([] as any)
const booking_containers = ref([] as any)
const charges = ref([] as any)

const lineVoyages = computed(() => {
  return catalogs.value.voyage_destinations.filter((vd: any) => vd.voyage?.vessel?.line_id == values.line_id)
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

const executive = computed(() => {
  if (consigneeInfo.value?.executive_active?.executive) {
    const name = consigneeInfo.value?.executive_active?.executive?.name
    let validTo = consigneeInfo.value?.executive_active?.valid_to
    if (consigneeInfo.value?.executive_active?.undefined_time === 1) {
      validTo = 'Indefinite'
    }

    return `${name} (Valid to: ${validTo})`
  }
  return ''
})

const { handleSubmit, values, errors, meta, setValues } = useForm({
  validationSchema: schemaExport,
})

interface SearchParams {
  name?: string
  id?: number
  [key: string]: any // Allow additional keys, but we will filter them
}

const searchCustomers = async (search: SearchParams) => {
  try {
    search.is_export = 1
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

const searchExportShippers = async (search: SearchParams) => {
  try {
    search.shipperConsignee = 'consignee'
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

    query['is_foreign'] = type === 'origin' ? 0 : 1
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
    query['country_id'] = 140
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

const onConsigneeChange = async (value: any) => {
  if (!value) return
  try {
    loadingStore.start()
    const response = await $api.consignees.getDetailsForExportReference(value)
    consigneeInfo.value = response
    if (response.executive_active == null) {
      snackbar.add({ type: 'warning', text: 'Consignee has no an executive' })
    }
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const getCatalogs = async () => {
  const response = await $api.referenciasExport.getFormCatalogs()

  catalogs.value = response as any
}

await getCatalogs()

const loadingPorts = computed(() => {
  return catalogs.value.ports.filter((port: any) => port.country?.code === 'MX')
})

const dischargePorts = computed(() => {
  return catalogs.value.ports.filter((port: any) => port.country?.code !== 'MX')
})

const voyageDestination = computed(() => {
  return catalogs.value.voyage_destinations.find((vd: any) => vd.id == values.voyage_discharge_id)
})

const hasVoyageArrivalDate = computed(() => {
  return !!voyageDestination.value?.arrival_date
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

const updateDepartureDate = (value: any) => {
  const voyageDest = catalogs.value.voyage_destinations.find((vd: any) => vd.id == value)
  setValues({ voyage_departure: voyageDest.eta_date })
}

const creditDaysColor = computed(() => {
  if (!voyageDestination) {
    return 'grey'
  }

  return isCreditExpired.value ? 'red' : 'green'
})

const onSuccess = async () => {
  try {
    loadingStore.start()
    const body = {
      ...values,
      transhipments: transhipments.value,
      master_bls: masterBls.value,
      house_bls: houseBls.value,
      booking_containers: booking_containers.value,
      containers: containers.value,
      charges: charges.value,
      credit_debit_notes: creditDebitNotes.value,
    }
    // DEMO
    const response = (await $api.referenciasExport.createReferencia(body)) as any

    console.log(response)
    snackbar.add({ type: 'success', text: 'Sea export reference created' })
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
    router.push(`/maritime/export/${response.id}`)
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

function onInvalidSubmit({ values, errors, results }: any) {
  snackbar.add({ type: 'error', text: 'Validate form before submit' })
}

const addTranshipment = () => {
  transhipments.value.push({
    port_id: null,
    tranship_date: '',
  })
}

const removeTranshipment = (index: number) => {
  transhipments.value.splice(index, 1)
}

const onSaveSeaExportClick = handleSubmit(onSuccess, onInvalidSubmit)
</script>
