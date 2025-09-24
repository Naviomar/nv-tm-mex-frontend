<template>
  <div>
    <v-card class="mb-4">
      <v-card-title>
        <div class="flex items-center gap-2">
          <v-icon size="x-small">mdi-airplane</v-icon>
          <div class="flex gap-2 items-center">
            Air Import service #<ServiceNumberLabel :service="values" />
            <UserInfoBadge :item="values" />
          </div>
        </div>
      </v-card-title>
      <v-card-subtitle>Mexico Form</v-card-subtitle>
      <v-card-text>
        <div class="flex items-center bg-neutral-100 dark:bg-neutral-900 px-2 mb-4">
          <v-radio-group
            v-model="incident"
            direction="horizontal"
            prepend-icon="mdi-alert-circle-outline"
            label="Incident"
            @update:model-value="setIncident"
          >
            <div class="flex justify-around">
              <v-radio density="compact" color="red" label="Damaged" value="damaged"></v-radio>
              <v-radio density="compact" color="red" label="Pama" value="pama"></v-radio>
              <v-radio density="compact" color="red" label="Abandon" value="abandon"></v-radio>
              <v-radio density="compact" color="red" label="Stolen" value="stolen"></v-radio>
            </div>
          </v-radio-group>
          <v-btn v-if="incident" icon size="x-small" color="red" @click="clearIncident">
            <v-icon>mdi-close-circle</v-icon>
          </v-btn>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-5 gap-2">
          <div>
            <InputText name="master_awb" density="compact" variant="solo-filled" label="Master AWB *" />
          </div>
          <div>
            <InputText name="house_awb" density="compact" variant="solo-filled" label="House AWB *" />
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
              label="Consignee *"
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
            <InputText name="shipper" density="compact" label="Shipper *" variant="solo-filled" />
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

          <InputText name="credit_days" type="number" density="compact" variant="solo-filled" label="Credit days *" />
        </div>

        <v-card v-if="isFromTracker" density="compact" class="dark:bg-neutral-700! my-4">
          <v-card-title> Tracker information </v-card-title>
          <v-card-text>
            <div class="flex gap-2 items-center">
              <TrackerAirPONumbers :trackerPos="values.tracker_pos" />
              <TrackerAirMoreInfo :trackerRef="values.tracker_ref" />
              <TrackerSyncAlerts :sync-alerts="values.tracker_sync_alerts" />
            </div>
          </v-card-text>
        </v-card>

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

    <AirExportHouseCbmsSmart :id="props.id" impoExpo="impo" />

    <v-card class="mb-4">
      <v-card-title>
        <div class="flex items-center">
          <v-icon size="x-small">mdi-package-variant-closed</v-icon>
          <div class="ml-2 font-bold">Cargo information</div>
        </div>
      </v-card-title>
      <v-card-text>
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
          <AirChargesSmart :referenciaId="props.id" :airReference="values" impo-expo="I" :canEdit="canEditCharges" />
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

    <v-card class="mb-4">
      <v-card-title>
        <div class="flex items-center">
          <v-icon size="x-small">mdi-check-network-outline</v-icon>
          <div class="ml-2 font-bold flex items-center">
            Release information

            <UserInfoBadge v-if="values.sent_releases?.length" :item="values" />
          </div>
        </div>
      </v-card-title>
      <v-card-text>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div>
            <InputText name="release_date" type="date" density="compact" variant="solo-filled" label="Release date" />
          </div>
          <div>
            <InputText
              name="release_airline_date"
              type="date"
              density="compact"
              variant="solo-filled"
              label="Release airline"
            />
          </div>
          <div>
            <InputAutocomplete
              name="release_agent_id"
              :items="catalogs.custom_agents"
              item-title="name"
              item-value="id"
              density="compact"
              variant="solo-filled"
              label="A.A."
            />
          </div>
          <div>
            <InputAutocomplete
              name="handler_id"
              density="compact"
              variant="solo-filled"
              label="Handler"
              :items="catalogs.handlers"
              item-title="full_name"
              item-value="id"
            />
            <AirHandlersSmart @refresh="getCatalogs" />
          </div>
          <div>
            <InputAutocomplete
              name="warehouse_id"
              density="compact"
              variant="solo-filled"
              label="Warehouse"
              :items="catalogs.warehouses"
              item-title="name"
              item-value="id"
            />
            <AirWarehousesSmart @refresh="getCatalogs" />
          </div>
          <div>
            <InputTextArea name="release_notes" density="compact" variant="solo-filled" label="Notes" />
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div>
            <InputFile name="files" density="compact" multiple label="Attachment(s)" />
          </div>
          <div>
            <div class="font-bold">Attachments in release information</div>
            <div v-if="values.release_files?.length === 0">No attachments</div>
            <div v-for="(file, index) in values.release_files" :key="`file-${index}`">
              <div class="flex gap-2 items-center">
                <div>
                  <v-icon color="red" size="small" class="cursor-pointer">mdi-close-circle</v-icon>
                </div>
                <ButtonDownloadS3Object :s3Path="file.attachment" />
              </div>
            </div>
          </div>
        </div>

        <div>
          <div class="flex justify-end gap-3">
            <v-btn color="primary" size="small" variant="tonal" @click="onSaveRevalidation">
              Save revalidation changes
            </v-btn>
            <v-btn color="green" size="small" variant="tonal" @click="toggleRevalidation"> Send revalidation </v-btn>
          </div>
        </div>

        <div v-if="hasSentRevalidations" class="py-4">
          <v-expansion-panels class="mb-4">
            <v-expansion-panel bg-color="lime-lighten-4">
              <v-expansion-panel-title> Past revalidations sent</v-expansion-panel-title>
              <v-expansion-panel-text>
                <div class="grid grid-cols-3 font-bold">
                  <div>Sent @</div>
                  <div>Sent by</div>
                  <div>Emails copied</div>
                </div>
                <div v-for="(revalidation, index) in values.sent_releases" :key="`revalidation-${index}`">
                  <div class="grid grid-cols-3">
                    <div>{{ formatDateString(revalidation.created_at) }}</div>
                    <div>{{ revalidation.creator?.name }}</div>
                    <div>{{ revalidation.emails }}</div>
                  </div>
                </div>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </div>
      </v-card-text>
    </v-card>

    <AirServiceNotesForm :serviceId="props.id" />

    <DraggableDiv>
      <div class="text-center font-bold p-2">Ref #{{ values.reference_number }}</div>
      <div class="flex justify-end items-center">
        <v-btn class="mr-4" color="error" to="/air/import"> Return </v-btn>
        <v-btn color="primary" @click="onSaveAirImportClick"> Save changes </v-btn>
      </div>
    </DraggableDiv>

    <v-dialog v-model="formRevalidation.show" max-width="800">
      <v-card>
        <v-card-title>Send revalidation</v-card-title>
        <v-card-text>
          <div class="grid grid-cols-1 gap-2">
            <div>
              <v-textarea
                v-model="formRevalidation.customer_emails"
                density="compact"
                label="Customer emails"
                :rows="2"
                hide-details
              />
              <CustomerEmailsWidget
                :customer-id="values.consignee_id"
                :notifys="customerNotifys"
                @fetched-emails="setCustomerEmails"
              />
            </div>
            <div>
              <v-textarea
                v-model="formRevalidation.agent_emails"
                density="compact"
                label="Agent emails"
                :rows="2"
                hide-details
              />
              <CustomsAgentEmailsWidget :id="values.release_agent_id" @fetched-emails="setCustomsAgentEmails" />
            </div>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-btn color="error" @click="toggleRevalidation">Cancel</v-btn>
          <v-btn color="primary" @click="onSendRevalidation">Yes, send it</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script setup lang="ts">
import { mailNotifications } from '~/utils/data/systemData'
import { schema } from '~/forms/airImportForm'

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
  charges: [],
  freights: [],
  countries: [],
  shippers: [],
  destinations: [],
  custom_agents: [],
  handlers: [],
  warehouses: [],
  airports: [],
})

const selectedNames = ['SeaImportNotifyRevalidation']

const customerNotifys = computed(() => {
  return mailNotifications.filter((notify) => selectedNames.includes(notify.short_name))
})

const initCreditDebitNotes = ref<any>([])
const consigneeInfo = ref<any>(null)
const routes = ref<any>([])
const charges = ref<any>([])
const incident = ref<any>(null)

const formRevalidation = ref<any>({
  show: false,
  customer_emails: '',
  agent_emails: '',
})

const showRoutes = ref(false)
const toggleRoutes = () => {
  showRoutes.value = !showRoutes.value
}

const toggleRevalidation = () => {
  formRevalidation.value.show = !formRevalidation.value.show
}
const setCustomerEmails = (emails: string) => {
  formRevalidation.value.customer_emails = emails
}
const setCustomsAgentEmails = (emails: string) => {
  formRevalidation.value.agent_emails = emails
}

const hasSentRevalidations = computed(() => {
  return values.sent_releases ? values.sent_releases.length > 0 : false
})

const departureAirports = (route: any) => {
  return catalogs.value.airports.filter((airport: any) => airport.country_id === route.departure_country_id)
}

const arrivalAirports = (route: any) => {
  return catalogs.value.airports.filter((airport: any) => airport.country_id === route.arrival_country_id)
}

const isFromTracker = computed(() => {
  return values.source_system_id === 2
})

const clearIncident = () => {
  incident.value = null
  setValues({ incident: null })
}

const setIncident = (value: any) => {
  setValues({ incident: value })
}

const validateNumber = (event: any) => {
  const value = event.target.value.trim()

  if (value !== '' && Number.isNaN(Number(value))) {
    snackbar.add({
      type: 'error',
      text: 'Rate must be a number',
    })
    event.target.value = ''
    setValues({
      rate: null,
    })
  }
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

const updateServiceExecutive = () => {
  setValues({
    executive_id: consigneeInfo.value.executive_active?.executive?.id,
    executive: consigneeInfo.value.executive_active?.executive,
  })
  snackbar.add({ type: 'info', text: 'Please save changes to reflect changes on service.' })
}

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

const canEditCharges = computed(() => {
  return values.locked_at == null
})

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
    search.is_air_import = 1
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
    loadingStore.start()
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
  const response = await $api.airImport.getFormCatalogs()

  catalogs.value = response as any
}

await getCatalogs()

const onSuccess = async () => {
  try {
    loadingStore.start()
    const body = {
      ...values,
      routes: routes.value,
      charges: charges.value,
    }
    const response = await $api.airImport.updateReference(props.id, body)

    snackbar.add({ type: 'success', text: 'Air import reference updated' })
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
  console.log('onInvalidSubmit', values, errors, results)
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

const onSaveAirImportClick = handleSubmit(onSuccess, onInvalidSubmit)

const onSaveRevalidation = async () => {
  try {
    loadingStore.start()
    const body = {
      ...values,
    }
    const response = await $api.airImport.updateRevalidation(props.id, body)

    snackbar.add({ type: 'success', text: 'Revalidation updated' })
    await getData()
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const onSendRevalidation = async () => {
  try {
    if (!formRevalidation.value.customer_emails && !formRevalidation.value.agent_emails) {
      snackbar.add({ type: 'warning', text: 'Please provide at least one email' })
      return
    }
    loadingStore.start()
    const body = {
      customer_emails: formRevalidation.value.customer_emails,
      agent_emails: formRevalidation.value.agent_emails,
    }
    const response = await $api.airImport.sendRevalidation(props.id, body)

    snackbar.add({ type: 'success', text: 'Revalidation sent' })
    await getData()

    toggleRevalidation()
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
    const response = (await $api.airImport.getReferenceById(props.id)) as any

    setValues({
      ...response,
    })
    incident.value = response.incident

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
