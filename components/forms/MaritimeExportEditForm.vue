<template>
  <div>
    <v-card class="mb-4">
      <v-card-title>
        <div class="flex justify-between">
          <div class="flex items-center gap-2">
            <v-icon size="x-small">mdi-ship-wheel</v-icon>
            <div class="flex gap-2 items-center">
              Sea Export information #<ServiceNumberLabel :service="values" />
              <UserInfoBadge :item="values" />
              <ReferenciaClDetails :allinfo="values" :referenciaCl="values.referencia_cl" />
            </div>
          </div>

          <div>
            <v-btn icon size="x-small" @click="showExportInfo = !showExportInfo" color="blue-grey-darken-2">
              <v-icon v-if="showExportInfo">mdi-eye-outline</v-icon>
              <v-icon v-if="!showExportInfo">mdi-eye-closed</v-icon>
            </v-btn>
          </div>
        </div>
        <div v-if="values.migrator" class="text-xs py-2 text-center">
          Migrated by {{ values.migrator?.name }} on {{ formatDateString(values.migrated_at) }}
        </div>
      </v-card-title>
      <v-card-text v-show="showExportInfo">
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
              bg-color="blue-lighten-4"
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
              label="TM Type *"
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
              label="BL type *"
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
              :items="catalogs.voyage_destinations"
              item-title="name"
              item-value="id"
              variant="solo-filled"
              :bg-color="vesselDepartureSailedColor"
              :readonly="isLocked"
              @update:model-value="updateDepartureDate"
            />
            <div class="flex items-center gap-2">
              <span class="text-xs">
                {{ sailInfo }}
              </span>
              <UpdateExportLockedVoyage v-if="isLocked" :referencia="values" @refresh="getData" />
            </div>
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
        <SeaImportTranshipmentForm
          :referenciaId="values.id"
          :currentTranshipments="values.tranships"
          @update:transhipments="transhipments = $event"
        />

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
            <InputText name="booking_tm" density="compact" variant="solo-filled" label="Booking TM" readonly />
          </div>
          <div class="col-span-1">
            <InputAutocomplete
              name="custom_clearence"
              density="compact"
              label="Custom clearence"
              :items="[
                { value: 1, name: 'Yes' },
                { value: 0, name: 'No' },
              ]"
              item-title="name"
              item-value="value"
              variant="solo-filled"
            />
          </div>

          <div class="col-span-2">
            <SeaExportMasterBlsSmart
              :referenciaId="values.id"
              :currentMasterBls="values.master_bls"
              @update:masterBls="masterBls = $event"
            />
          </div>
          <div class="col-span-1">
            <v-card density="compact" class="mb-2">
              <v-card-title>
                <div class="flex justify-between">
                  <div class="flex items-center">
                    <v-icon size="x-small">mdi-multicast</v-icon>
                    <div class="ml-2 font-bold">House BLs</div>
                  </div>
                </div>
              </v-card-title>
              <v-card-text>
                <div v-for="(houseBl, index) in values.house_bls" :key="`house-${index}`">
                  {{ houseBl.name }}
                </div>
              </v-card-text>
            </v-card>
          </div>
        </div>
      </v-card-text>
    </v-card>
    <v-card class="mb-4">
      <v-card-title>
        <div class="flex justify-between">
          <div class="flex items-center gap-2">
            <v-icon size="x-small">mdi-account-outline</v-icon>
            <div>Customer information</div>
          </div>
          <div>
            <v-btn icon size="x-small" @click="showCustomerInfo = !showCustomerInfo" color="blue-grey-darken-2">
              <v-icon v-if="showCustomerInfo">mdi-eye-outline</v-icon>
              <v-icon v-if="!showCustomerInfo">mdi-eye-closed</v-icon>
            </v-btn>
          </div>
        </div>
      </v-card-title>
      <v-card-text v-show="showCustomerInfo">
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

              <div>
                <InputText
                  name="credit_days"
                  type="number"
                  density="compact"
                  variant="solo-filled"
                  label="Credit days *"
                />
              </div>
            </div>

            <div>Reference credit days: {{ values.credit_days }}</div>
          </div>
          <div class="col-span-2">
            <v-card density="compact" color="blue-grey-lighten-5">
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
                    Credit days:
                    <v-chip>{{ consigneeInfo.export_credit_days }}</v-chip>
                    <v-chip :color="creditDaysColor">{{ consigneeCreditFinalDate }}</v-chip>
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
        <div class="flex justify-between">
          <div class="flex items-center gap-2">
            <v-icon size="x-small">mdi-package-variant-closed</v-icon>
            <div>Cargo information</div>
          </div>
          <div>
            <v-btn icon size="x-small" @click="showCargoInfo = !showCargoInfo" color="blue-grey-darken-2">
              <v-icon v-if="showCargoInfo">mdi-eye-outline</v-icon>
              <v-icon v-if="!showCargoInfo">mdi-eye-closed</v-icon>
            </v-btn>
          </div>
        </div>
      </v-card-title>
      <v-card-text v-show="showCargoInfo">
        <div class="grid grid-cols-2 gap-2">
          <div class="border-double border-4 border-gray-400 p-2">
            <div class="font-bold mb-2">Total cargo</div>
            <div class="grid grid-cols-3 gap-2">
              <div>
                <v-text-field
                  v-model="cargo.total_m3"
                  density="compact"
                  variant="solo-filled"
                  label="Cubic meters"
                  :readonly="true"
                  prepend-inner-icon="mdi-axis-arrow-info"
                />
              </div>
              <div>
                <v-text-field
                  v-model="cargo.total_kgs"
                  density="compact"
                  variant="solo-filled"
                  label="KGS"
                  :readonly="true"
                  prepend-inner-icon="mdi-weight-kilogram"
                />
              </div>
              <div>
                <v-text-field
                  v-model="cargo.total_packages"
                  density="compact"
                  variant="solo-filled"
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
            <SeaImportContainersSmart
              :referencia-id="values.id"
              impoExpo="E"
              :catalogs="catalogs"
              :cargo-type="values.cargo_type"
              :current-containers="values.containers"
              @update:containers="containers = $event"
              @refresh="getData"
            />

            <SeaExportBkgContainersSmart
              :catalogs="catalogs"
              :current-containers="values.bkg_containers"
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

    <v-card color="light-green-lighten-4" class="mb-4">
      <v-card-title>
        <div class="flex justify-between">
          <div class="flex items-center">
            <v-icon size="x-small">mdi-abacus</v-icon>
            <div class="mx-2 font-bold">Rates</div>
            <ServiceChargeLogs :id="values.id!" :service-class="values.class_name" />
          </div>
          <div>
            <v-btn v-if="false" icon="mdi-lock-open-variant-outline" size="x-small" class="mr-4" color="red"></v-btn>
            <v-btn v-if="false" icon="mdi-lock-outline" size="x-small" color="success"></v-btn>
          </div>
        </div>
      </v-card-title>
      <v-card-text>
        <div class="grid grid-cols-3 gap-2 mb-4">
          <div class="col-span-3">
            <SeaExportChargesSmart :referenciaId="values.id!" :canEdit="canEditCharges" />
          </div>
          <div v-if="hasSomeDetentions" class="col-span-3">
            <v-card>
              <v-card-title>Detentions</v-card-title>
              <v-card-text>
                <v-table density="compact">
                  <thead>
                    <tr>
                      <th class="font-bold!">Container</th>
                      <th class="font-bold!">Type</th>
                      <th class="font-bold!">Days</th>
                      <th class="font-bold!">Line amount</th>
                      <th class="font-bold!">Customer amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(container, index) in values.containers" :key="`detention-cont-${index}`">
                      <td>{{ container.container_number }}</td>
                      <td>{{ container.container_type?.name }}</td>
                      <td>
                        {{ container.detention?.days }}
                      </td>
                      <td>
                        {{ formatToCurrency(container.detention?.amount_line) }}
                      </td>
                      <td>
                        {{ formatToCurrency(container.detention?.amount_customer) }}
                      </td>
                    </tr>
                  </tbody>
                </v-table>
              </v-card-text>
            </v-card>
          </div>

          <v-card density="compact">
            <v-card-title class="font-semibold text-lg">
              <v-icon class="mr-2">mdi-cash-refund</v-icon>
              Rebate
            </v-card-title>

            <v-card-text class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <div class="">Rebate amount</div>
                  <div class="flex items-center text-lg font-semibold">
                    {{ formatToCurrency(rebateAmount) }}
                  </div>
                </div>

                <div>
                  <div class="">Currency</div>
                  <div class="text-lg font-semibold">
                    {{ rebateCurrencyName }}
                  </div>
                </div>
              </div>

              <v-divider class="my-2" />

              <div>
                <div class="">Base rebate × total containers</div>
                <div class="text-lg font-semibold">
                  {{ formatToCurrency(values.rebate_total_amount) }}
                </div>
              </div>
              <div class="flex items-center gap-2">
                <v-text-field
                  v-model="formRebate.amount"
                  density="compact"
                  label="New rebate amount"
                  type="number"
                  hide-details
                />
                <v-btn color="brown" size="small" @click="updateRefRebate"> Update rebate </v-btn>
              </div>
            </v-card-text>
          </v-card>
        </div>

        <FfNotesForm
          :referenciaId="values.id!"
          serviceType="sea"
          :charges="catalogs.charges"
          :freights="catalogs.freights"
          @refresh="getData"
          @request-sell-charges="getSellCharges"
        />

      </v-card-text>
    </v-card>

    <v-card color="light-blue-lighten-4" class="mb-4">
      <v-card-title><div class="font-bold">Customer invoices & payments</div></v-card-title>
      <v-card-text>
        <SeaServiceCustomerInvoices :referenceId="values.id!" />
      </v-card-text>
    </v-card>

    <v-card color="light-blue-lighten-4" class="mb-4">
      <v-card-title><div class="font-bold">Line invoices & payments</div></v-card-title>
      <v-card-text>
        <SeaImportLinePaymentsDetails :referencia="values" />
      </v-card-text>
    </v-card>

    <v-card color="light-blue-lighten-4" class="mb-4">
      <v-card-title><div class="font-bold">Supplier invoices & payments</div></v-card-title>
      <v-card-text>
        <SeaImportSupplierInvoices :referenceId="values.id!" />
      </v-card-text>
    </v-card>

    <v-card color="red-lighten-4" class="mb-4">
      <v-card-title><div class="font-bold">Refunds</div></v-card-title>
      <v-card-text>
        <SeaImportRefunds :referenceId="values.id!" />
      </v-card-text>
    </v-card>

    <SeaExportProfitOverview :referencia-id="values.id!" />

    <SeaImportNotesForm :reference="values" />

    <DraggableDiv>
      <div class="text-center font-bold py-2">Ref #{{ values.reference_number }}</div>
      <div class="flex justify-end items-center">
        <v-btn class="mr-4" color="error" to="/maritime/export"> Return </v-btn>
        <v-btn color="primary" @click="onSaveSeaExportClick"> Save changes </v-btn>
      </div>
    </DraggableDiv>
  </div>
</template>
<script setup lang="ts">
import { currencies } from '@/utils/data/systemData'
import { cargoTypes } from '@/utils/data/seaData'
import { schemaExportEdit } from '~~/forms/maritimeReferenceForm'
import { permissions } from '@/utils/data/system'

const router = useRouter()
const route = useRoute()
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()
const exchangeRatesStore = useExchangeRatesStore()

const showExportInfo = ref(true)
const showCustomerInfo = ref(true)
const showCargoInfo = ref(true)

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
})

const catalogs = ref({
  lines: [] as any,
  sea_regions: [] as any,
  consignees: [] as any,
  consignee_mbls: [] as any,
  freights: [] as any,
  vessels: [] as any,
  voyage_destinations: [] as any,
  ports: [] as any,
  shippers: [] as any,
  container_types: [] as any,
  transportation_modes: [] as any,
  charges: [] as any,
  service_contracts: [] as any,
  destinations: [] as any,
  embalajes: [] as any,
})

const intermodalMode = ref<any>({
  intermodal: null,
  internal_transit: null,
})
const buyRate = ref(null)
const sellRate = ref(null)
const creditDebitNotes = ref<any>([])

const consigneeInfo = ref<any>(null)
const referencia = ref<any>({})

const transhipments = ref([] as any)
const masterBls = ref([] as any)
const houseBls = ref([] as any)
const containers = ref([] as any)
const booking_containers = ref<any>([])
const charges = ref([] as any)
const notes = ref([] as any)

const formRebate = ref({
  amount: null,
})

const initCreditDebitNotes = ref<any>([])

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

const rebateAmount = computed(() => referencia.value?.rebate ?? 0)
const rebateCurrencyName = computed(() => {
  const id = referencia.value?.rebate_currency_id
  return currencies.find((c) => c.id === id)?.name ?? 'N/A'
})

const onRebateCurrencyChange = (value: any) => {
  if (!value) {
    setValues({ rebate_exchange_rate: null })
  } else {
    if (value !== 2)
      // USD
      setValues({ rebate_exchange_rate: exchangeRatesStore.getExchangeRate(2, value) })
    else setValues({ rebate_exchange_rate: 1 })
  }
}

const canEditCharges = computed(() => {
  if (!referencia.value.voyage_discharge) {
    return false
  }
  return referencia.value.voyage_discharge?.locked_at == null
})

const hasSomeDetentions = computed(() => {
  return values.containers?.some((container: any) => container.detention != null)
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

const getSellCharges = (callback: Function) => {
  callback(
    (values.export_charges ?? [])
      .filter((charge: any) => charge.is_sell === 1 && charge.id)
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
    const response = await $api.consignees.getDetailsForReference(value)
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

const updateDepartureDate = (value: any) => {
  const voyageDest = catalogs.value.voyage_destinations.find((vd: any) => vd.id == value)
  let date = ''
  if (voyageDest) {
    date = voyageDest.eta_date
  }

  setValues({ voyage_departure: date })
}

const { handleSubmit, values, errors, meta, handleReset, setValues } = useForm({
  validationSchema: schemaExportEdit,
})

const getSeaExportCatalogs = async () => {
  const response = await $api.referenciasExport.getFormCatalogs()
  catalogs.value = response as any
}

const updateRefRebate = async () => {
  try {
    if (formRebate.value.amount == null || formRebate.value.amount == '' || formRebate.value.amount < 0) {
      snackbar.add({ type: 'warning', text: 'Please enter a valid rebate amount' })
      return
    }
    loadingStore.start()
    const body = {
      id: values.id,
      rebate: formRebate.value.amount,
    }
    await $api.referencias.updateSeaImportRebate(values.id, body)
    snackbar.add({ type: 'success', text: 'Rebate updated successfully' })
    await getData()

    formRebate.value.amount = null // Reset the rebate input field
  } catch (e) {
    console.error(e)
    snackbar.add({ type: 'error', text: 'Error updating rebate' })
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const getData = async () => {
  try {
    loadingStore.start()
    const response = (await $api.referenciasExport.getReferenciaById(props.id)) as any

    referencia.value = response
    setValues(response)
    // set departure date from voyage_discharge
    updateDepartureDate(response.voyage_discharge_id)
    transhipments.value = response.tranships
    masterBls.value = response.master_bls
    houseBls.value = response.house_bls
    containers.value = response.containers
    booking_containers.value = response.bkg_containers

    intermodalMode.value.intermodal = response.transportation_mode_id
    intermodalMode.value.internal_transit = response.internal_transit === 1

    charges.value = response.charges
    initCreditDebitNotes.value = response.ff_notes
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

onMounted(() => {
  onConsigneeChange(values.consignee_id)
})

const vesselDepartureSailedColor = computed(() => {
  if (!values.voyage_discharge) {
    return ''
  }
  return values.voyage_discharge?.is_sailed === 1 ? 'green' : 'warning'
})

const sailInfo = computed(() => {
  if (!values.voyage_discharge) {
    return ''
  }
  const isLocked = values.voyage_discharge.locked_at != null
  return values.voyage_discharge?.is_sailed === 1
    ? `Marked sailed @ ${formatDateOnlyString(values.voyage_discharge?.sailed_at)} ${isLocked ? '(locked)' : ''}`
    : `Not sailed ${isLocked ? '(locked)' : ''}`
})

const isLocked = computed(() => {
  return values.voyage_discharge?.locked_at != null
})

const voyageDestination = computed(() => {
  return catalogs.value.voyage_destinations.find((vd: any) => vd.id == values.voyage_discharge_id)
})

const consigneeCreditFinalDate = computed(() => {
  if (!voyageDestination) {
    return 'Select a voyage discharge'
  }
  if (!hasVoyageArrivalDate.value) {
    return 'TBC - ATA date'
  }
  const finalDate = new Date(voyageDestination.value?.arrival_date)
  finalDate.setDate(finalDate.getDate() + consigneeInfo.value?.export_credit_days)
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

const isCreditExpired = computed(() => {
  if (!voyageDestination || !hasVoyageArrivalDate) {
    return false
  }
  const today = new Date()
  const finalDate = new Date(voyageDestination.value?.arrival_date)
  finalDate.setDate(finalDate.getDate() + consigneeInfo.value?.export_credit_days)
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
      transportation_mode: intermodalMode.value,
      charges: charges.value,
      credit_debit_notes: creditDebitNotes.value,
      buy_rate_obj: buyRate.value,
      sell_rate_obj: sellRate.value,
    }
    // DEMO
    const response = await $api.referenciasExport.updateReference(values.id!, body)

    snackbar.add({ type: 'success', text: 'Sea export reference updated' })
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
  snackbar.add({ type: 'error', text: 'Please validate the form' })
}

const colorValidDateWl = (wl: any) => {
  const validFrom = new Date(wl.valid_from)
  const validTo = new Date(wl.valid_to)
  const today = new Date()
  let classes = 'flex justify-between p-2'

  if (today >= validFrom && today <= validTo) {
    return `${classes} bg-green-200`
  }
  return `${classes} bg-red-200`
}

const onSaveSeaExportClick = handleSubmit(onSuccess, onInvalidSubmit)

try {
  await getSeaExportCatalogs()
  await getData()
} catch (e) {
  console.error(e)
}

useHead({
  title: `#${values.reference_number} - Operations edition`,
})
</script>
