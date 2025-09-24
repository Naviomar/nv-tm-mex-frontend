<template>
  <div>
    <v-card class="mb-4">
      <v-card-title>
        <div class="flex items-center gap-2">
          <v-icon size="x-small">mdi-airplane</v-icon>
          <div class="flex gap-2 items-center">
            Air Export service #{{ values.reference_number }}
            <UserInfoBadge :item="values" />
          </div>
        </div>
      </v-card-title>
      <v-card-subtitle>Mexico Form</v-card-subtitle>
      <v-card-text>
        <div class="grid grid-cols-1 md:grid-cols-5 gap-2">
          <div>
            <InputText name="master_awb" density="compact" variant="solo-filled" label="Master AWB *" />
          </div>
          <div>
            <InputText name="house_awb" density="compact" variant="solo-filled" label="House AWB *" hide-details />
            <div class="flex gap-2">
              <AirExportHouseAwbs :airReference="airReference" @refresh="getData" />
              <v-btn size="x-small" color="green" @click="addNewHouseAwb" class="mb-2"
                ><v-icon>mdi-plus</v-icon>Add House</v-btn
              >
            </div>
          </div>

          <div>
            <InputText name="origin" density="compact" variant="solo-filled" label="Origin *" />
          </div>
          <div>
            <InputText name="destination" density="compact" variant="solo-filled" label="Destination *" />
          </div>
          <div>
            <InputAutocomplete
              name="airline_id"
              density="compact"
              label="Airline *"
              :items="catalogs.airlines"
              item-title="name"
              item-value="id"
              variant="solo-filled"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-2">
          <div class="col-span-3">
            <AGlobalSearch
              :onSearch="searchCustomers"
              validate-key="consignee_id"
              label="Shipper *"
              :set-id="values.consignee_id || undefined"
              @update:model-value="onConsigneeChange"
            />
          </div>
          <div>
            <div class="flex flex-col">
              <div class="">Service executive:</div>
              <div class="font-bold">
                <span v-if="!values.executive_id">No executive</span>
                <span v-if="values.executive_id">{{ values.executive?.name }}</span>
              </div>
            </div>
            <div class="flex flex-col">
              <div class="">Customer current executive:</div>
              <div class="font-bold">{{ customerCurrentExecutive }}</div>
            </div>
            <div v-if="canUpdateExecutive" class="flex flex-col">
              <v-btn color="primary" size="x-small" @click="updateServiceExecutive">Update executive</v-btn>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div>
            <InputText name="shipper" density="compact" label="Consignee *" variant="solo-filled" />
          </div>

          <div>
            <AGlobalSearch
              :onSearch="searchFfs"
              validate-key="origin_ff_id"
              label="Origin freight Forwarder *"
              :set-id="values.origin_ff_id || undefined"
              hide-details
            />
          </div>
          <div>
            <AGlobalSearch
              :onSearch="searchFfs"
              validate-key="destination_ff_id"
              label="Destination freight Forwarder *"
              :set-id="values.destination_ff_id || undefined"
              hide-details
            />
          </div>

          <InputText name="credit_days" type="number" density="compact" variant="solo-filled" label="Credit days *" />
        </div>

        <v-card density="compact" color="grey-darken-3" class="mb-2">
          <v-card-title>
            <div class="flex justify-between">
              <div class="flex items-center">
                <v-icon size="x-small">mdi-airplane</v-icon>
                <div class="ml-2 font-bold">Routes</div>
              </div>
              <div>
                <div class="flex gap-2">
                  <v-btn icon="mdi-plus" size="x-small" color="success" @click="addRoute"></v-btn>
                  <v-btn
                    :icon="showRoutes ? 'mdi-eye-outline' : 'mdi-eye-off-outline'"
                    size="x-small"
                    color="gray"
                    @click="toggleRoutes"
                  ></v-btn>
                </div>
              </div>
            </div>
          </v-card-title>
          <v-card-text v-if="showRoutes">
            <div v-for="(route, index) in routes" :key="`route-${index}`">
              <div class="grid grid-cols-3 gap-5">
                <div>
                  <v-autocomplete
                    v-model="route.departure_country_id"
                    :items="catalogs.countries"
                    item-title="name"
                    item-value="id"
                    density="compact"
                    variant="solo-filled"
                    label="Departure Country"
                  />
                </div>
                <div>
                  <v-autocomplete
                    v-model="route.departure_airport_id"
                    :items="departureAirports(route)"
                    item-title="full_name"
                    item-value="id"
                    density="compact"
                    variant="solo-filled"
                    label="Departure airport"
                  >
                    <template v-slot:item="{ item, props }">
                      <v-list-item
                        v-bind="props"
                        :title="`${item.title} ${(item as any).raw.deleted_at ? '(Eliminado)' : ''}`"
                        :disabled="(item as any).raw.deleted_at != null"
                      >
                      </v-list-item>
                    </template>
                  </v-autocomplete>
                </div>
                <div>
                  <v-text-field
                    v-model="route.departure_date"
                    density="compact"
                    variant="solo-filled"
                    label="Departure date"
                    type="date"
                    prepend-icon="mdi-airplane-takeoff"
                  />
                </div>
              </div>
              <div class="grid grid-cols-3 gap-2">
                <div>
                  <v-autocomplete
                    v-model="route.arrival_country_id"
                    :items="catalogs.countries"
                    item-title="name"
                    item-value="id"
                    density="compact"
                    variant="solo-filled"
                    label="Arrival Country"
                  />
                </div>
                <div>
                  <v-autocomplete
                    v-model="route.arrival_airport_id"
                    :items="arrivalAirports(route)"
                    item-title="full_name"
                    item-value="id"
                    density="compact"
                    variant="solo-filled"
                    label="Arrival airport"
                  >
                    <template v-slot:item="{ item, props }">
                      <v-list-item
                        v-bind="props"
                        :title="`${item.title} ${(item as any).raw.deleted_at ? '(Eliminado)' : ''}`"
                        :disabled="(item as any).raw.deleted_at != null"
                      >
                      </v-list-item>
                    </template>
                  </v-autocomplete>
                </div>

                <div>
                  <v-text-field
                    v-model="route.arrival_date"
                    type="date"
                    density="compact"
                    variant="solo-filled"
                    label="Arrival date"
                    prepend-icon="mdi-airplane-landing"
                  />
                </div>

                <div class="flex items-start gap-2">
                  <v-text-field
                    v-model="route.flight_number"
                    density="compact"
                    variant="solo-filled"
                    label="Flight number"
                  />
                  <v-btn
                    icon="mdi-delete-outline"
                    size="x-small"
                    color="red"
                    class="mt-2"
                    @click="removeRoute(index)"
                  ></v-btn>
                </div>
                <div v-if="index === routes.length - 1">
                  <v-text-field
                    v-model="route.destination"
                    density="compact"
                    variant="solo-filled"
                    label="Destination"
                  />
                </div>
              </div>
            </div>
            <div class="totals">
              <div class="flex justify-end">
                <div class="font-bold">Transit days: {{ totalTransitDays }}</div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-card-text>
    </v-card>

    <AirExportHouseCbmsSmart :id="props.id" :refresh-data="handleRefreshData" impoExpo="expo" />

    <v-card density="compact" class="mb-2">
      <v-card-title>
        <div class="flex justify-between">
          <div class="flex items-center">
            <v-icon size="x-small">mdi-shipping-pallet</v-icon>
            <div class="ml-2 font-bold">Cargo</div>
          </div>
        </div>
      </v-card-title>
      <v-card-text>
        <div class="grid grid-cols-2 gap-5">
          <div>
            <InputText name="commodity" density="compact" variant="solo-filled" label="Commodity" />
          </div>
          <div class="flex items-start gap-2">
            <InputText
              name="rate"
              type="text"
              density="compact"
              variant="solo-filled"
              label="Rate"
              @change="validateNumber"
            />
          </div>
        </div>
      </v-card-text>
    </v-card>

    <v-card color="light-green-lighten-4" class="mb-4">
      <v-card-title>
        <div class="flex items-center">
          <v-icon size="x-small">mdi-check-network-outline</v-icon>
          <div class="ml-2 font-bold">Charges</div>
          <ServiceChargeLogs :id="values.id!" :service-class="values.class_name" />
        </div>
      </v-card-title>
      <v-card-text>
        <div class="mb-4">
          <AirChargesSmart :referenciaId="props.id" impo-expo="E" :airReference="values" :canEdit="canEditCharges" />
        </div>

        <div class="mb-4">
          <FfNotesForm
            :referenciaId="values.id!"
            serviceType="air"
            :charges="catalogs.charges"
            :freights="catalogs.freights"
            @refresh="getData"
            @request-sell-charges="getSellCharges"
          />
        </div>
      </v-card-text>
    </v-card>

    <AirServiceCustomerInvoices :airReferenceId="values.id!" />

    <v-card color="light-blue-lighten-4" class="my-4">
      <v-card-title><div class="font-bold">Supplier invoices & payments</div></v-card-title>
      <v-card-text>
        <AirSupplierInvoices :airReferenceId="values.id!" />
      </v-card-text>
    </v-card>

    <v-card color="red-lighten-4" class="mb-4">
      <v-card-title><div class="font-bold">Refunds</div></v-card-title>
      <v-card-text>
        <AirRefunds :airReferenceId="values.id!" />
      </v-card-text>
    </v-card>

    <AirProfitOverview :airReferenceId="props.id" />

    <AirServiceNotesForm :serviceId="props.id" />

    <DraggableDiv>
      <div class="text-center font-bold p-2">Ref #{{ values.reference_number }}</div>
      <div class="flex justify-end items-center">
        <v-btn class="mr-4" color="error" to="/air/export">Return</v-btn>
        <v-btn color="primary" @click="onSaveSeaExportClick">Save changes</v-btn>
      </div>
    </DraggableDiv>
  </div>
</template>

<script setup lang="ts">
import { schema } from '~/forms/airExportForm'

const router = useRouter()
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
})

const catalogs = ref<any>({
  airlines: [],
  consignees: [],
  freights: [],
  countries: [],
  shippers: [],
  destinations: [],
  custom_agents: [],
  handlers: [],
  warehouses: [],
  airports: [],
})

const initCreditDebitNotes = ref<any>([])
const consigneeInfo = ref<any>(null)
const airReference = ref<any>(null)

const routes = ref<any>([])
const charges = ref<any>([])

const showRoutes = ref(false)
const toggleRoutes = () => {
  showRoutes.value = !showRoutes.value
}

let refreshChildData: any = () => {}

const handleRefreshData = (refreshFn: any) => {
  // Save the reference to the child's getData function
  refreshChildData = refreshFn
}

const triggerRefresh = () => {
  if (refreshChildData) {
    refreshChildData() // Call the child's getData function
  }
}

const departureAirports = (route: any) => {
  return catalogs.value.airports.filter((airport: any) => airport.country_id === route.departure_country_id)
}

const arrivalAirports = (route: any) => {
  return catalogs.value.airports.filter((airport: any) => airport.country_id === route.arrival_country_id)
}

const totalTransitDays = computed(() => {
  // get departure date from first route and arrival date from last route and calculate difference
  if (routes.value.length > 0) {
    const departureDate = new Date(routes.value[0].departure_date)
    const arrivalDate = new Date(routes.value[routes.value.length - 1].arrival_date)
    let diff = arrivalDate.getTime() - departureDate.getTime()
    // add 1 day to include the departure day
    diff += 1000 * 60 * 60 * 24
    return diff / (1000 * 60 * 60 * 24)
  }

  return 0
})

const customerCurrentExecutive = computed(() => {
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

const canUpdateExecutive = computed(() => {
  if (consigneeInfo.value?.executive_active?.executive) {
    return true
  }
  return false
})

const canEditCharges = computed(() => {
  return values.locked_at == null
})


const getSellCharges = (callback: Function) => {
  callback(
    (values.charges ?? [])
      .filter((charge: any) => charge.sell_total && charge.id)
      .map((charge: any) => ({
        ...charge,
        amount_total: charge.sell_total ?? 0, // Ensure amount_total exists
      }))
  )
}

const updateServiceExecutive = () => {
  setValues({
    executive_id: consigneeInfo.value.executive_active?.executive?.id,
    executive: consigneeInfo.value.executive_active?.executive,
  })
  snackbar.add({ type: 'info', text: 'Please save changes to reflect changes on service.' })
}

const { handleSubmit, values, errors, meta, setValues } = useForm({
  validationSchema: schema,
})

interface SearchParams {
  name?: string
  id?: number
  [key: string]: any // Allow additional keys, but we will filter them
}

const searchCustomers = async (search: SearchParams) => {
  try {
    search.is_air_export = 1
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

const onConsigneeChange = async (value: any) => {
  if (!value) return
  try {
    loadingStore.loading = true
    const response = await $api.consignees.getDetailsForExportReference(value)

    consigneeInfo.value = response
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const getCatalogs = async () => {
  const response = await $api.airExport.getFormCatalogs()

  catalogs.value = response as any
}

await getCatalogs()

const onSuccess = async () => {
  try {
    loadingStore.loading = true
    const body = {
      ...values,
      routes: routes.value,
      charges: charges.value,
    }

    const response = await $api.airExport.updateReference(props.id, body)

    snackbar.add({ type: 'success', text: 'Air export reference updated' })

    await getData()
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

function onInvalidSubmit({ values, errors, results }: any) {
  console.log(values) // current form values
  console.log(errors) // a map of field names and their first error message
  console.log(results) // a detailed map of field names and their validation results
  snackbar.add({ type: 'warning', text: 'Validate form before submit' })
}

const addRoute = () => {
  // if exists previous route, add destination as departure airport for new route
  let lastArrivalAirport = null
  let lastArrivalCountry = null
  if (routes.value.length > 0) {
    lastArrivalAirport = routes.value[routes.value.length - 1].arrival_airport_id
    lastArrivalCountry = routes.value[routes.value.length - 1].arrival_country_id
  }
  routes.value.push({
    departure_country_id: lastArrivalCountry,
    departure_airport_id: lastArrivalAirport,
    departure_date: null,
    arrival_airport_id: null,
    destination: null,
    arrival_date: null,
    flight_number: null,
  })

  showRoutes.value = true
}

const removeRoute = (index: number) => {
  routes.value.splice(index, 1)
}

const onSaveSeaExportClick = handleSubmit(onSuccess, onInvalidSubmit)

const addNewHouseAwb = async () => {
  try {
    loadingStore.start()
    await $api.airExport.addNewHouseAwb(props.id)
    snackbar.add({ type: 'success', text: 'House AWB added' })
    await getData()
    triggerRefresh()
    // TODO por el momento refresh a toda la pagina.
    // window.location.reload()
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
    const response = (await $api.airExport.getReferenceById(props.id)) as any
    setValues({
      ...response,
    })

    airReference.value = response
    routes.value = response.transits

    initCreditDebitNotes.value = response.ff_notes
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

await getData()

useHead({
  title: `#${values.reference_number} - Operations edition`,
})
</script>
