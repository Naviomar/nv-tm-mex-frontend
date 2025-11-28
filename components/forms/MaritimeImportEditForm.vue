<template>
  <div>
    <div v-if="isRefDeleted">
      <v-card class="mb-4">
        <v-card-title>
          <div class="flex justify-between">
            <div class="flex items-center gap-2">
              <v-icon size="x-small">mdi-alert-circle-outline</v-icon>
              <div class="text-red-600 font-bold">This reference has been deleted.</div>
            </div>
            <div>
              <v-btn
                size="small"
                @click="$router.push(`/maritime/import/view-details-${referencia.id}`)"
                color="blue-grey-darken-2"
              >
                <v-icon>mdi-arrow-left</v-icon>Ver detalle de la referencia #{{ referencia.reference_number }}
              </v-btn>
            </div>
          </div>
        </v-card-title>
        <v-card-text>
          This reference has been deleted and cannot be edited. Please contact support if you need further assistance.
        </v-card-text>
      </v-card>
    </div>
    <div v-if="!isRefDeleted">
      <v-card class="mb-4">
        <v-card-title>
          <div class="flex justify-between">
            <div class="flex items-center gap-2">
              <v-icon size="x-small">mdi-ship-wheel</v-icon>
              <div>
                <div class="flex gap-2 items-center">
                  Sea Import information #<ServiceNumberLabel :service="values" />
                  <UserInfoBadge :item="values" />
                  <ReferenciaSourceDetails :referencia="values" />
                </div>
                <span v-if="isFromTracker" class="text-xs text-red-500"> (Tracker)</span>
              </div>
            </div>
            <div>
              <v-btn icon size="x-small" @click="showImportInfo = !showImportInfo" color="blue-grey-darken-2">
                <v-icon v-if="showImportInfo">mdi-eye-outline</v-icon>
                <v-icon v-if="!showImportInfo">mdi-eye-closed</v-icon>
              </v-btn>
            </div>
          </div>
        </v-card-title>
        <v-card-subtitle> Details </v-card-subtitle>
        <v-card-text v-show="showImportInfo">
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
          <div class="grid grid-cols-1 md:grid-cols-6 gap-2">
            <div>
              <InputAutocomplete
                name="line_id"
                density="compact"
                label="Line responsable *"
                :items="catalogs.lines"
                item-title="name_code"
                item-value="id"
                @update:model-value="refreshVessels"
              />
            </div>
            <div class="col-span-2">
              <InputAutocomplete
                name="vessel_departure_id"
                density="compact"
                label="Departure vessel"
                :items="lineResponsableVessels"
                item-title="name"
                item-value="id"
              />
            </div>
            <div>
              <InputText name="voyage_departure" density="compact" label="Departure voyage" />
            </div>
            <div>
              <InputText name="etd_date" type="date" density="compact" label="ETD" />
            </div>
            <div>
              <InputText name="eta_date" type="date" density="compact" label="ETA(1)" />
            </div>
          </div>
          <div class="grid grid-cols-4 gap-2 mb-4">
            <div class="col-span-2">
              <AGlobalSearch
                :onSearch="searchImportVoyages"
                validate-key="voyage_discharge_id"
                label="Arrival voyage"
                prepend-inner-icon="mdi-ray-end-arrow"
                :bg-color="vesselDepartureSailedColor"
                :readonly="referencia.voyage_discharge?.locked_at != null"
                :set-id="values.voyage_discharge_id || undefined"
              />
              <div class="flex items-center gap-2">
                <span>
                  {{ sailInfo }}
                </span>
                <UpdateImportLockedVoyage v-if="isLocked" :referencia="values" @refresh="getData" />
              </div>
            </div>
            <div class="col-span-2">
              <AGlobalSearch
                :onSearch="searchFfs"
                validate-key="freight_forwarder_id"
                label="Freight forwarder"
                :set-id="values.freight_forwarder_id || undefined"
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
            <div>
              <div class="flex flex-col gap-2 items-center">
                <TrackerSeaPONumbers :trackerPos="values.tracker_pos" :containers="values.containers" />
                <TrackerSeaMoreInfo :trackerRef="values.tracker_ref" />
                <TrackerSyncAlerts :sync-alerts="values.tracker_sync_alerts" />
              </div>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <SeaImportMasterBlsSmart
              :referenciaId="values.id"
              :currentMasterBls="values.master_bls"
              :consigneesmbls="catalogs.consignee_mbls"
              @update:masterBls="masterBls = $event"
            />

            <SeaImportHouseBlsSmart
              :referenciaId="values.id"
              :currentHouseBls="values.house_bls"
              @update:houseBls="houseBls = $event"
            />
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
                <div class="col-span-2">
                  <AGlobalSearch
                    :onSearch="searchShippers"
                    validate-key="shipper_id"
                    label="Shipper"
                    :set-id="values.shipper_id || undefined"
                  />
                </div>
                <div>
                  <InputText name="notify" density="compact" label="Notify" />
                </div>
              </div>
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <InputAutocomplete
                    name="release_type"
                    density="compact"
                    label="Release typing"
                    :items="releaseTypings"
                    item-title="name"
                    item-value="name"
                  />
                </div>
                <div>
                  <AGlobalSearch
                    :onSearch="searchFfs"
                    validate-key="release_agent_id"
                    label="Release (Agent)"
                    :set-id="values.release_agent_id || undefined"
                  />
                </div>
              </div>
              <div class="grid grid-cols-3 gap-2">
                <InputText
                  name="credit_days"
                  type="number"
                  density="compact"
                  variant="solo-filled"
                  label="Credit days *"
                />
              </div>
              <div class="flex gap-2">
                <v-chip size="small" class="chip-gradient"
                  >Reference demurrage free days: <strong>{{ values.demurrage_days }}</strong></v-chip
                >
                <v-chip size="small" class="chip-aurora"
                  >Reference credit days: <strong>{{ values.credit_days }}</strong></v-chip
                >
                <SeaImportUpdateDemurrageDays :referencia="values" @refresh="getData" />
              </div>
            </div>
            <div class="col-span-2">
              <SeaImportNotifyArrival :referencia="values" @refresh="getData" />

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
                      <v-chip>{{ consigneeInfo.import_credit_days }}</v-chip>
                      <v-chip :color="creditDaysColor">{{ consigneeCreditFinalDate }}</v-chip>
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
                      <div v-if="entrustSamePort(wl)" :class="colorValidDateWl(wl)">
                        <div>Agent: {{ wl.custom_agent?.short_name }}</div>
                        <div>Port: {{ wl.port?.name }}</div>
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
              <div class="py-4">
                <ReferenciaCartaEncomiendas :referencia="values" @update:referencia="getData" />
              </div>
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
                    :set-id="values.coloader_id || undefined"
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
              <div class="text-center">
                <v-btn
                  class="chip-gradient"
                  size="small"
                  :to="`/maritime/import/demurrages/reference-${values.id}-demurrages`"
                  >Go to demurrage calculations</v-btn
                >
              </div>
              <SeaImportContainersSmart
                :referencia-id="values.id"
                impoExpo="I"
                :catalogs="catalogs"
                :containers="containers"
                :cargo-type="values.cargo_type"
                :current-containers="values.containers"
                @update:containers="containers = $event"
                @refresh="getData"
              />
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
            <SeaImportBuyRateForm
              :charges="catalogs.charges"
              :referencia="values"
              :currencies="currencies"
              :masterBls="masterBls"
              @update:rate="setBuyRate"
              @refresh="getData"
              :initData="initBuyRate"
            />

            <SeaImportSellRateForm
              :charges="catalogs.charges"
              :referencia="values"
              :currencies="currencies"
              @update:rate="setSellRate"
              @refresh="getData"
              :initData="initSellRate"
            />

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

          <SeaImportChargesSmart
            :referenciaId="values.id"
            :referencia="values"
            :currentCharges="values.charges"
            :currencies="currencies"
            :catalogs="catalogs"
            @update:charges="charges = $event"
            @refresh="getData"
          />

          <SeaImportDemurragesSmart
            v-if="values.demurrage_charges!.length > 0"
            :charges="values.demurrage_charges"
            :referencia="values"
          />

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

      <v-card v-if="hasInvoices" color="light-green-lighten-4" class="mb-4">
        <v-card-title>
          <div class="flex justify-between">
            <div class="flex items-center">
              <v-icon size="x-small">mdi-abacus</v-icon>
              <div class="ml-2 font-bold">Rates</div>
            </div>
          </div>
        </v-card-title>
        <v-card-text> Rates are locked invoices are present, authorization process to update rates here. </v-card-text>
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

      <SeaImportProfitOverview ref="profitOverviewRef" :referencia-id="values.id!" />

      <SeaImportReleaseProcess :reference="values" @update-reference="getData" />

      <SeaImportNotesForm :reference="values" />

      <DraggableDiv>
        <div class="text-center font-bold flex justify-center p-2">Ref #<ServiceNumberLabel :service="values" /></div>
        <div class="flex justify-end items-center">
          <v-btn class="mr-4" color="error" to="/maritime/import"> Return </v-btn>
          <v-btn color="primary" @click="onSaveSeaImportClick"> Save changes </v-btn>
        </div>
      </DraggableDiv>
    </div>
  </div>
</template>
<script setup lang="ts">
import { currencies } from '@/utils/data/systemData'
import { cargoTypes } from '@/utils/data/seaData'
import { schemaEdit } from '~~/forms/maritimeReferenceForm'
import { permissions } from '@/utils/data/system'

const { $api } = useNuxtApp()
const loadingStore = useLoadingStore()
const snackbar = useSnackbar()
const exchangeRatesStore = useExchangeRatesStore()
const router = useRouter()
const route = useRoute()

const showImportInfo = ref(true)
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

const buyRate = ref(null)
const sellRate = ref(null)

const consigneeInfo = ref<any>(null)
const incident = ref<any>(null)

const referencia = ref<any>({})
const transhipments = ref([] as any)
const masterBls = ref([] as any)
const houseBls = ref([] as any)
const containers = ref([] as any)
const charges = ref([] as any)

const initBuyRate = ref<any>(null)
const initSellRate = ref<any>(null)

const profitOverviewRef = ref<any>(null)

const formRebate = ref({
  amount: null,
})

const isRefDeleted = computed(() => {
  return referencia.value?.deleted_at != null
})

const lineResponsableVessels = computed(() => {
  return catalogs.value.vessels.filter((vessel: any) => vessel.line_id === values.line_id)
})

const refreshVessels = async (value: any) => {
  setValues({ vessel_departure_id: '', voyage_discharge_id: null })
}

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

const setBuyRate = (rate: any) => {
  // console.log('set BuyRate', rate)
  buyRate.value = rate
}
const setSellRate = (rate: any) => {
  // console.log('set SellRate', rate)
  sellRate.value = rate
}

const hasInvoices = computed(() => {
  if (!values.invoice_tms || !values.invoice_wms) {
    return false
  }
  // if empty array
  if (values.invoice_tms.length <= 0 && values.invoice_wms.length <= 0) {
    return false
  }

  if (values.invoice_tms.some((inv: any) => inv.is_proforma == 1)) {
    return false
  }
  if (values.invoice_wms.some((inv: any) => inv.is_proforma == 1)) {
    return false
  }
  return true
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

const rebateAmount = computed(() => referencia.value?.rebate ?? 0)
const rebateCurrencyName = computed(() => {
  const id = referencia.value?.rebate_currency_id
  return currencies.find((c) => c.id === id)?.name ?? 'N/A'
})

const updateServiceExecutive = () => {
  setValues({
    executive_id: consigneeInfo.value.executive_active?.executive?.id,
    executive: consigneeInfo.value.executive_active?.executive,
  })
  snackbar.add({ type: 'info', text: 'Please save changes to reflect changes on service.' })
}

const onConsigneeChange = async (value: any) => {
  if (!value) return
  try {
    loadingStore.start()
    const response = await $api.consignees.getDetailsForReference(value)
    consigneeInfo.value = response
    if (response.executive_active == null) {
      snackbar.add({ type: 'warning', text: 'Customer has no active executive' })
    }
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const getSellCharges = (callback: Function) => {
  callback((values.sell_rate_breakdown ?? []).concat(values.charges ?? []))
}

const clearIncident = () => {
  incident.value = null
  setValues({ incident: null })
}

const setIncident = (value: any) => {
  setValues({ incident: value })
}

const { handleSubmit, values, errors, meta, handleReset, setValues } = useForm({
  validationSchema: schemaEdit,
})

const { addFormGuard } = useFormGuard(meta.value) // Pass `meta` to the composable
addFormGuard() // Attach the form guard to the component

// onBeforeRouteLeave((to, from, next) => {
//   if (meta.value.dirty) {
//     const answer = window.confirm('You have unsaved changes. Do you really want to leave?')
//     if (answer) {
//       next() // Allow navigation
//     } else {
//       next(false) // Prevent navigation
//     }
//   } else {
//     next() // Allow navigation if no unsaved changes
//   }
// })

const vesselDepartureSailedColor = computed(() => {
  if (!values.voyage_discharge) {
    return ''
  }
  return values.voyage_discharge?.arrival_date ? 'green' : 'warning'
})

const sailInfo = computed(() => {
  if (!values.voyage_discharge) {
    return ''
  }
  const isLocked = values.voyage_discharge.locked_at != null
  return values.voyage_discharge?.arrival_date != null
    ? `Arrived @ ${values.voyage_discharge?.arrival_date} ${isLocked ? '(locked)' : ''}`
    : `Pending arrival ${isLocked ? '(locked)' : ''}`
})

const isLocked = computed(() => {
  return values.voyage_discharge?.locked_at != null
})

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
    const response = (await $api.referencias.getSeaImportById(props.id)) as any

    // console.log(response)
    referencia.value = response
    setValues(response)
    incident.value = response.incident
    transhipments.value = response.tranships
    masterBls.value = response.master_bls
    houseBls.value = response.house_bls
    containers.value = response.containers

    initBuyRate.value = {
      charges: response.buy_rate_breakdown,
      buy_rate_type: response.buy_rate_type,
    }
    initSellRate.value = {
      charges: response.sell_rate_breakdown,
      sell_rate_type: response.sell_rate_type,
    }

    charges.value = response.charges

    await profitOverviewRef.value?.getSeaImportProfit()
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

await getSeaImportCatalogs()
await getData()

onMounted(async () => {
  onConsigneeChange(values.consignee_id)
})

const entrustSamePort = (wl: any) => {
  const port = wl.port
  const pod = values.pod_id!
  return parseInt(port?.id) === parseInt(pod)
}

const voyageDestination = computed(() => {
  return catalogs.value.voyage_destinations.find((vd: any) => vd.id == values.voyage_discharge_id)
})

const isFromTracker = computed(() => {
  return values.source_system_id === 2
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
  return values.cargo_type === 'LCL' || values.cargo_type === 'COCO'
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

const onSuccess = async () => {
  try {
    loadingStore.start()
    const body = {
      ...values,
      transhipments: transhipments.value,
      master_bls: masterBls.value,
      house_bls: houseBls.value,
      containers: containers.value,
      charges: charges.value,
      buy_rate_obj: buyRate.value,
      sell_rate_obj: sellRate.value,
    }

    // console.log(body)
    await $api.referencias.updateSeaImport(values.id!, body)

    snackbar.add({ type: 'success', text: 'Sea import reference updated' })

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
  snackbar.add({ type: 'warning', text: 'Validate form before submit' })
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

const releaseTypings = [{ name: 'Original' }, { name: 'Copy' }, { name: 'Console' }]

const onSaveSeaImportClick = handleSubmit(onSuccess, onInvalidSubmit)

useHead({
  title: `#${values.reference_number} - Operations edition`,
})
</script>
