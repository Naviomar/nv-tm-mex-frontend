<template>
  <div>
    <v-card class="mb-4">
      <v-card-title>
        <div class="flex items-center gap-4">
          <div class="font-bold">Sea Export information</div>
          <div class="flex-1 max-w-md">
            <v-text-field
              v-model="legacySearch"
              density="compact"
              label="Search legacy export reference (e.g. EX26-10)"
              prepend-inner-icon="mdi-database-search-outline"
              clearable
              hide-details
              variant="outlined"
              color="orange"
              @update:model-value="onLegacyExpoSearch"
            />
          </div>
        </div>
      </v-card-title>

      <div style="position: relative;">
        <v-card
          v-if="legacyExpoResults.length > 0"
          class="mx-4 mb-2"
          color="orange-lighten-5"
          variant="outlined"
          style="position: absolute; z-index: 100; left: 0; right: 0; max-height: 400px; overflow-y: auto; box-shadow: 0 8px 24px rgba(0,0,0,0.25);"
        >
          <v-card-title class="text-sm font-bold pa-2 d-flex justify-space-between align-center">
            <div>
              <v-icon size="small" class="mr-1">mdi-database-clock-outline</v-icon>
              Legacy export references ({{ legacyExpoResults.length }})
            </div>
            <v-btn size="x-small" icon="mdi-close" variant="text" @click="legacyExpoResults = []" />
          </v-card-title>
          <v-card-text class="pa-0">
            <v-table density="compact" hover>
              <thead>
                <tr class="bg-orange-lighten-4">
                  <th>Reference</th>
                  <th>BL Master</th>
                  <th>BL House</th>
                  <th>Line</th>
                  <th>Shipper</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(item, idx) in legacyExpoResults"
                  :key="`legacy-expo-${idx}`"
                  :class="item.is_migrated ? 'bg-green-lighten-4 opacity-70' : 'cursor-pointer'"
                  @click="!item.is_migrated && selectLegacyExpoReference(item)"
                >
                  <td class="font-bold">
                    {{ item.referencia }}
                    <v-chip v-if="item.is_migrated" size="x-small" color="green" class="ml-1">Migrated</v-chip>
                  </td>
                  <td>{{ item.bl_master }}</td>
                  <td>{{ item.bl_house }}</td>
                  <td>{{ item.linea?.nomlinea || item.linea?.linea }}</td>
                  <td class="text-xs">{{ item.shipper }}</td>
                  <td>
                    <v-btn v-if="!item.is_migrated" size="x-small" color="orange" variant="text" icon="mdi-arrow-right-bold" />
                    <v-icon v-else size="small" color="green">mdi-check-circle</v-icon>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>
        </v-card>
      </div>

      <v-expand-transition>
        <v-alert
          v-if="legacyExpoApplied"
          type="info"
          density="compact"
          closable
          class="mx-4 mb-2"
          @click:close="legacyExpoApplied = false"
        >
          <span class="font-bold">Legacy data applied:</span> {{ legacyExpoApplied }}
        </v-alert>
      </v-expand-transition>

      <!-- Legacy Preview Dialog -->
      <v-dialog v-model="legacyPreview.show" max-width="900" persistent>
        <v-card>
          <v-card-title class="bg-orange-lighten-4">
            <div class="flex items-center gap-2">
              <v-icon>mdi-database-import-outline</v-icon>
              <span class="font-bold">Import from legacy: {{ legacyPreview.data?.referencia }}</span>
            </div>
          </v-card-title>
          <v-card-text v-if="legacyPreview.data" class="pa-4">
            <div class="text-sm mb-3 italic text-grey-darken-1">Review the data below. Click "Apply" to auto-fill the form.</div>
            <div class="grid grid-cols-2 gap-4">
              <v-card variant="outlined" density="compact">
                <v-card-title class="text-sm bg-blue-lighten-5 pa-2">
                  <v-icon size="small" class="mr-1">mdi-ferry</v-icon> Service Info
                </v-card-title>
                <v-card-text class="pa-2">
                  <div class="grid grid-cols-2 gap-1 text-sm">
                    <div class="font-bold">Line:</div>
                    <div>{{ legacyPreview.data.linea?.nomlinea || legacyPreview.data.linea?.linea || '—' }}</div>
                    <div class="font-bold">Vessel:</div>
                    <div>
                      {{ legacyPreview.data.barco?.barco || '—' }}
                      <v-chip v-if="legacyPreview.data.matching_vessel" size="x-small" color="green" class="ml-1">
                        Match: {{ legacyPreview.data.matching_vessel.name }}
                      </v-chip>
                    </div>
                    <div class="font-bold">Voyage:</div>
                    <div>{{ legacyPreview.data.barco?.viaje || '—' }}</div>
                    <div class="font-bold">Condition:</div>
                    <div>{{ legacyPreview.data.condicion || '—' }}</div>
                  </div>
                </v-card-text>
              </v-card>
              <v-card variant="outlined" density="compact">
                <v-card-title class="text-sm bg-teal-lighten-5 pa-2">
                  <v-icon size="small" class="mr-1">mdi-map-marker-path</v-icon> Ports
                </v-card-title>
                <v-card-text class="pa-2">
                  <div class="grid grid-cols-2 gap-1 text-sm">
                    <div class="font-bold">Origin:</div>
                    <div>{{ legacyPreview.data.puerto_origen ? `${legacyPreview.data.puerto_origen.puerto} (${legacyPreview.data.puerto_origen.pais})` : '—' }}</div>
                    <div class="font-bold">POL:</div>
                    <div>{{ legacyPreview.data.puerto_carga ? `${legacyPreview.data.puerto_carga.puerto} (${legacyPreview.data.puerto_carga.pais})` : '—' }}</div>
                    <div class="font-bold">POD:</div>
                    <div>{{ legacyPreview.data.puerto_descarga ? `${legacyPreview.data.puerto_descarga.puerto} (${legacyPreview.data.puerto_descarga.pais})` : '—' }}</div>
                    <div class="font-bold">Destination:</div>
                    <div>{{ legacyPreview.data.puerto_destino ? `${legacyPreview.data.puerto_destino.puerto} (${legacyPreview.data.puerto_destino.pais})` : '—' }}</div>
                  </div>
                </v-card-text>
              </v-card>
              <v-card variant="outlined" density="compact">
                <v-card-title class="text-sm bg-green-lighten-5 pa-2">
                  <v-icon size="small" class="mr-1">mdi-account-outline</v-icon> Customer Info
                </v-card-title>
                <v-card-text class="pa-2">
                  <div class="grid grid-cols-2 gap-1 text-sm">
                    <div class="font-bold">Shipper (consignee):</div>
                    <div>{{ legacyPreview.data.shipper_info?.cliente || legacyPreview.data.shipper || '—' }}</div>
                    <div class="font-bold">Consignee:</div>
                    <div>{{ legacyPreview.data.cliente?.cliente || legacyPreview.data.consignee || '—' }}</div>
                    <div class="font-bold">FF:</div>
                    <div>{{ legacyPreview.data.freight_forwarder?.ff || '—' }}</div>
                  </div>
                </v-card-text>
              </v-card>
              <v-card variant="outlined" density="compact">
                <v-card-title class="text-sm bg-purple-lighten-5 pa-2">
                  <v-icon size="small" class="mr-1">mdi-file-document-outline</v-icon> BLs
                </v-card-title>
                <v-card-text class="pa-2">
                  <div class="text-sm"><span class="font-bold">Master BL:</span> {{ legacyPreview.data.bl_master || '—' }}</div>
                  <div class="text-sm"><span class="font-bold">House BL:</span> {{ legacyPreview.data.bl_house || '—' }}</div>
                </v-card-text>
              </v-card>
              <v-card variant="outlined" density="compact">
                <v-card-title class="text-sm bg-amber-lighten-5 pa-2">
                  <v-icon size="small" class="mr-1">mdi-package-variant-closed</v-icon> Cargo & Containers
                </v-card-title>
                <v-card-text class="pa-2">
                  <div class="grid grid-cols-3 gap-1 text-sm mb-2">
                    <div><span class="font-bold">Kgs:</span> {{ legacyPreview.data.peso }}</div>
                    <div><span class="font-bold">Pkgs:</span> {{ legacyPreview.data.paquetes }}</div>
                    <div><span class="font-bold">Commodity:</span> {{ legacyPreview.data.mercancia || '—' }}</div>
                  </div>
                  <div class="font-bold text-sm mb-1">Containers ({{ legacyPreview.data.containers?.length || 0 }}):</div>
                  <v-table v-if="legacyPreview.data.containers?.length > 0" density="compact">
                    <thead><tr><th class="text-xs">Container #</th><th class="text-xs">Type</th><th class="text-xs">Kgs</th></tr></thead>
                    <tbody>
                      <tr v-for="(cnt, idx) in legacyPreview.data.containers" :key="`prev-cnt-${idx}`">
                        <td class="text-xs">{{ cnt.container_number }}</td>
                        <td class="text-xs"><v-chip size="x-small" :color="cnt.container_type_id ? 'green' : 'grey'">{{ cnt.equipo_legacy || '—' }}</v-chip></td>
                        <td class="text-xs">{{ cnt.weight }}</td>
                      </tr>
                    </tbody>
                  </v-table>
                </v-card-text>
              </v-card>
            </div>
            <div class="grid grid-cols-2 gap-2 mt-2 text-sm">
              <div><span class="font-bold">Booking:</span> {{ legacyPreview.data.booking || '—' }}</div>
              <div><span class="font-bold">PO:</span> {{ legacyPreview.data.porder || '—' }}</div>
            </div>
          </v-card-text>
          <v-card-actions class="bg-grey-lighten-4">
            <v-spacer />
            <v-btn color="grey" variant="text" @click="legacyPreview.show = false">Cancel</v-btn>
            <v-btn color="orange" variant="flat" @click="confirmLegacyExpoImport" prepend-icon="mdi-database-import-outline">
              Apply legacy data
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

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
            <SeaExportMasterBlsSmart ref="masterBlsRef" :currentMasterBls="masterBls" @update:masterBls="masterBls = $event" />
          </div>
          <div v-if="houseBls.length > 0" class="col-span-1">
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
                <div v-for="(houseBl, index) in houseBls" :key="`house-${index}`">
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
              ref="bkgContainersRef"
              :catalogs="catalogs"
              :currentContainers="booking_containers"
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

const masterBlsRef = ref<any>(null)
const bkgContainersRef = ref<any>(null)

const legacySearch = ref('')
const legacyExpoResults = ref<any[]>([])
const legacyExpoApplied = ref<string | false>(false)
let legacySearchTimeout: ReturnType<typeof setTimeout> | null = null
const legacyPreview = ref<{ show: boolean; data: any }>({ show: false, data: null })
const legacyReferenceId = ref<string | null>(null)

const lineVoyages = computed(() => {
  return catalogs.value.voyage_destinations.filter((vd: any) => vd.voyage?.vessel?.line_id == values.line_id)
})

const isConditionLCL = computed(() => {
  return values.cargo_type === 'LCL' || values.cargo_type === 'COCO'
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

const normalizeSearchResults = (results: any) => {
  return Array.isArray(results) ? results : (results?.data ?? [])
}

const normalizeCargoType = (value: any) => {
  if (!value) return null

  const normalized = String(value).trim().toUpperCase().replace(/[\s_-]+/g, ' ')
  const compact = normalized.replace(/\s+/g, '')
  const aliasMap: Record<string, string> = {
    BREAKBULK: 'BREAK BULK',
  }

  if (aliasMap[compact]) {
    return aliasMap[compact]
  }

  const directMatch = cargoTypes.find((item) => item.name === normalized)
  if (directMatch) {
    return directMatch.name
  }

  const looseMatch = cargoTypes.find((item) => {
    const itemCompact = item.name.replace(/\s+/g, '')
    return compact.includes(itemCompact) || itemCompact.includes(compact)
  })

  return looseMatch?.name ?? null
}

const inferCargoTypeFromLegacy = (detail: any) => {
  const candidates = [
    detail?.condicion,
    detail?.cargo_type,
    detail?.condition_type,
    ...(detail?.containers ?? []).flatMap((container: any) => [
      container?.condition_type,
      container?.cargo_type,
      container?.equipo_legacy,
      container?.container_type,
    ]),
  ]

  for (const candidate of candidates) {
    const normalized = normalizeCargoType(candidate)
    if (normalized) {
      return normalized
    }
  }

  return null
}

const findMatchedLine = (legacyLineName: string) => {
  const normalizedLegacyLineName = legacyLineName.toLowerCase().trim()

  return catalogs.value.lines.find((line: any) => {
    const candidates = [line.commercial_name, line.name, line.name_code]
      .filter(Boolean)
      .map((value: string) => value.toLowerCase().trim())

    return candidates.some((candidate: string) => {
      return candidate.includes(normalizedLegacyLineName) || normalizedLegacyLineName.includes(candidate)
    })
  })
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
      legacy_reference: legacyReferenceId.value,
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

// --- Legacy export search & import ---
const onLegacyExpoSearch = (value: string | null) => {
  if (legacySearchTimeout) clearTimeout(legacySearchTimeout)

  if (!value || value.length < 2) {
    legacyExpoResults.value = []
    return
  }

  legacySearchTimeout = setTimeout(async () => {
    try {
      const results = await $api.legacy.searchExpoMar(value)
      legacyExpoResults.value = results as any[]
    } catch (e) {
      console.error(e)
    }
  }, 400)
}

const selectLegacyExpoReference = async (item: any) => {
  try {
    loadingStore.start()

    const detail = (await $api.legacy.getExpoMarDetail(item.id)) as any
    if (!detail) {
      snackbar.add({ type: 'warning', text: 'Could not load legacy export reference detail' })
      return
    }
    legacyPreview.value = { show: true, data: detail }
    legacyExpoResults.value = []
    legacySearch.value = ''
  } catch (e) {
    console.error(e)
    snackbar.add({ type: 'error', text: 'Error loading legacy export reference' })
  } finally {
    setTimeout(() => { loadingStore.stop() }, 250)
  }
}

const matchBestPort = (results: any[], legacyPais: string, preferCountryId?: number) => {
  if (!results || results.length === 0) return null
  if (results.length === 1) return results[0]
  const legacy = (legacyPais || '').toLowerCase().trim()
  if (legacy) {
    const match = results.find((r: any) => {
      const cName = (r.country?.name || '').toLowerCase()
      return cName.includes(legacy) || legacy.includes(cName)
    })
    if (match) return match
  }
  if (preferCountryId) {
    const pref = results.find((r: any) => r.country_id === preferCountryId || r.country?.id === preferCountryId)
    if (pref) return pref
  }
  return results[0]
}

const matchBestDestination = (results: any[], legacyPais: string) => {
  if (!results || results.length === 0) return null
  if (results.length === 1) return results[0]
  const legacy = (legacyPais || '').toLowerCase().trim()
  if (legacy) {
    const match = results.find((r: any) => {
      const cName = (r.country?.name || r.country_name || '').toLowerCase()
      return cName.includes(legacy) || legacy.includes(cName)
    })
    if (match) return match
  }
  return results[0]
}

const confirmLegacyExpoImport = async () => {
  const detail = legacyPreview.value.data
  if (!detail) return

  try {
    loadingStore.start()
    const formValues: Record<string, any> = {}
    const legacyLineName = (detail.linea?.nomlinea || detail.linea?.linea || '').trim()
    const inferredCargoType = inferCargoTypeFromLegacy(detail)

    // --- Line ---
    if (legacyLineName) {
      const matchedLine = findMatchedLine(legacyLineName)
      if (matchedLine) {
        formValues.line_id = matchedLine.id
      } else {
        try {
          const supplierResults = normalizeSearchResults(await searchSuppliers({ name: legacyLineName }))
          if (supplierResults.length > 0) {
            formValues.coloader_id = supplierResults[0].id
          }
        } catch (e) { console.warn('Could not match consolidator from legacy line', e) }
      }
    }

    // --- Cargo Info ---
    if (inferredCargoType) {
      formValues.cargo_type = inferredCargoType
    }
    if (detail.mercancia) {
      formValues.commodity = detail.mercancia
    }

    // --- Booking / PO ---
    if (detail.booking) {
      formValues.booking_number = detail.booking
    }
    if (detail.porder) {
      formValues.po_num = detail.porder
    }

    // --- Customer Info: match shipper (consignee_id in export) ---
    if (detail.shipper_info?.cliente || detail.shipper) {
      const shipperName = (detail.shipper_info?.cliente || detail.shipper || '').trim()
      if (shipperName) {
        try {
          const results = normalizeSearchResults(await searchCustomers({ name: shipperName }))
          if (results.length > 0) {
            formValues.consignee_id = results[0].id
          }
        } catch (e) { console.warn('Could not match shipper', e) }
      }
    }

    // --- Customer Info: match consignee (shipper_id in export) ---
    if (detail.cliente?.cliente || detail.consignee) {
      const consigneeName = (detail.cliente?.cliente || detail.consignee || '').trim()
      if (consigneeName) {
        try {
          const results = normalizeSearchResults(await searchExportShippers({ name: consigneeName }))
          if (results.length > 0) {
            formValues.shipper_id = results[0].id
          }
        } catch (e) { console.warn('Could not match consignee', e) }
      }
    }

    // --- Customer Info: match freight forwarder ---
    if (detail.freight_forwarder?.ff) {
      try {
        const results = normalizeSearchResults(await searchFfs({ name: detail.freight_forwarder.ff.trim() }))
        if (results.length > 0) {
          formValues.freight_forwarder_id = results[0].id
        }
      } catch (e) { console.warn('Could not match FF', e) }
    }

    // --- Region ---
    if (detail.region) {
      const matchedRegion = catalogs.value.sea_regions.find((r: any) =>
        (r.name || '').toLowerCase().includes(detail.region.toLowerCase())
      )
      if (matchedRegion) {
        formValues.sea_region_id = matchedRegion.id
      }
    }

    // --- Ports: match legacy ports by name in new system ---
    // Export rules: Origin=domestic dest, POL=Mexico port, POD=foreign port, Destination=foreign dest
    if (detail.puerto_origen?.puerto) {
      try {
        const results = normalizeSearchResults(await searchDestinations({ name: detail.puerto_origen.puerto.trim() }, 'origin'))
        const best = matchBestDestination(results, detail.puerto_origen.pais || '')
        if (best) formValues.origin_id = best.id
      } catch (e) { console.warn('Could not match origin port', e) }
    }

    if (detail.puerto_carga?.puerto) {
      try {
        const results = normalizeSearchResults(await searchPolPorts({ name: detail.puerto_carga.puerto.trim() }))
        const best = matchBestPort(results, detail.puerto_carga.pais || '', 140)
        if (best) formValues.pol_id = best.id
      } catch (e) { console.warn('Could not match POL port', e) }
    }

    if (detail.puerto_descarga?.puerto) {
      try {
        const results = normalizeSearchResults(await searchPodPorts({ name: detail.puerto_descarga.puerto.trim() }))
        const best = matchBestPort(results, detail.puerto_descarga.pais || '')
        if (best) formValues.pod_id = best.id
      } catch (e) { console.warn('Could not match POD port', e) }
    }

    if (detail.puerto_destino?.puerto) {
      try {
        const results = normalizeSearchResults(await searchDestinations({ name: detail.puerto_destino.puerto.trim() }, 'destination'))
        const best = matchBestDestination(results, detail.puerto_destino.pais || '')
        if (best) formValues.destination_id = best.id
      } catch (e) { console.warn('Could not match destination port', e) }
    }

    if (detail.bl_house && !detail.bl_master) {
      formValues.bl_type = 'house'
    } else if (detail.bl_master && !detail.bl_house) {
      formValues.bl_type = 'master'
    }

    // Store legacy reference ID and separate legacy_id for backend
    legacyReferenceId.value = detail.id ? `EXPO-${detail.id}` : null
    if (detail.id) {
      formValues.legacy_id = detail.id
      formValues.legacy_reference = detail.referencia || null
    }

    // Apply form values
    if (Object.keys(formValues).length > 0) {
      setValues(formValues)
    }

    // Load consignee details for info panel
    if (formValues.consignee_id) {
      await onConsigneeChange(formValues.consignee_id)
    }

    // --- BLs ---
    const legacyMasterBl = (detail.bl_master || '').trim()
    const legacyHouseBl = (detail.bl_house || '').trim()
    const masterBlItems: any[] = legacyMasterBl
      ? [{
          name: legacyMasterBl,
          attachment: null,
          comments: null,
        }]
      : []
    const houseBlItems: any[] = legacyHouseBl && legacyHouseBl !== legacyMasterBl
      ? [{
          name: legacyHouseBl,
          consignee_id: null,
          type: null,
          attachment: null,
          comments: null,
        }]
      : []

    masterBls.value = masterBlItems
    houseBls.value = houseBlItems

    await nextTick()
    masterBlsRef.value?.setItems(masterBlItems)

    // --- Booking containers from EM_CONTE ---
    if (detail.containers && detail.containers.length > 0) {
      const bkgItems = detail.containers.map((cnt: any) => ({
        total: 1,
        container_type_id: cnt.container_type_id,
      }))
      // Group by container_type_id and sum totals
      const grouped: Record<number, any> = {}
      for (const item of bkgItems) {
        if (item.container_type_id) {
          if (grouped[item.container_type_id]) {
            grouped[item.container_type_id].total += 1
          } else {
            grouped[item.container_type_id] = { ...item }
          }
        }
      }
      const groupedItems = Object.values(grouped)
      booking_containers.value = groupedItems
      await nextTick()
      bkgContainersRef.value?.setItems(groupedItems)
    }

    legacyPreview.value.show = false
    legacyExpoApplied.value = `${detail.referencia} — ${detail.linea?.nomlinea || ''} / ${detail.containers?.length || 0} containers`

    snackbar.add({ type: 'success', text: `Legacy data applied from ${detail.referencia}` })
  } catch (e) {
    console.error(e)
    snackbar.add({ type: 'error', text: 'Error applying legacy data' })
  } finally {
    setTimeout(() => { loadingStore.stop() }, 250)
  }
}

const onSaveSeaExportClick = handleSubmit(onSuccess, onInvalidSubmit)
</script>
