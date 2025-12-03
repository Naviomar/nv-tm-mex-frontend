<template>
  <div>
    <v-card class="mb-4" variant="flat" density="compact">
      <v-card-title>
        <div class="flex justify-between">
          <div class="flex items-center gap-2">
            <v-icon size="small">mdi-train-car-intermodal</v-icon>
            <div>Intermodal information</div>
          </div>
          <div>
            <v-btn icon size="x-small" @click="showIntermodalInfo = !showIntermodalInfo" color="blue-grey-darken-2">
              <v-icon v-if="showIntermodalInfo">mdi-eye-outline</v-icon>
              <v-icon v-if="!showIntermodalInfo">mdi-eye-closed</v-icon>
            </v-btn>
          </div>
        </div>
      </v-card-title>
      <v-card-subtitle>
        <div class="flex items-center gap-2">
          <v-icon size="small">mdi-ship-wheel</v-icon>
          <div>Sea Import information #{{ referencia.reference_number }}</div>
        </div>
      </v-card-subtitle>
      <v-card-text v-show="showIntermodalInfo">
        <div class="grid grid-cols-2">
          <div class="min-w-32">
            <v-radio-group
              v-model="intermodalMode.intermodal"
              label="Select transportation mode"
              row
              @update:modelValue="clearInternalTransit"
            >
              <v-radio
                v-for="(transp, idx) in catalogs.transportation_modes"
                :label="transp.name"
                :value="transp.id"
                :key="`transp-${idx}`"
              ></v-radio>
            </v-radio-group>
            <v-btn v-if="intermodalMode.intermodal" @click="intermodalMode.intermodal = null" color="red" size="x-small"
              >No intermodal</v-btn
            >
          </div>
          <div>
            <div v-if="canIntermodalTransit" class="py-4">
              <v-checkbox v-model="intermodalMode.internal_transit" label="Internal transit" hide-details />
              <v-alert density="compact" type="info">
                If Internal transit checkbox is checked, additional files for the shipping line can be attached at the
                time of arrival notification.
              </v-alert>
            </div>
            <IntermodalProofDelivery v-if="hasIntermodal" :service="referencia" />
          </div>
        </div>
      </v-card-text>
      <v-card-actions>
        <v-btn color="primary" @click="saveIntermodalInfo">Save changes</v-btn>
      </v-card-actions>
    </v-card>

    <v-alert v-if="!canDoIntermodal" color="red-lighten-1" variant="tonal">
      <v-icon>mdi-alert-circle-outline</v-icon>
      <span>{{ intermodalBlockReason }}</span>
    </v-alert>

    <div v-if="hasIntermodal && canDoIntermodal">
      <div class="font-bold">Containers intermodal information</div>
      <div class="flex gap-4 my-2">
        <v-btn color="green" variant="tonal" size="small" class="" @click="toggleUpdateAll">Update massive</v-btn>
        <v-btn color="blue" variant="tonal" size="small" class="" @click="selectAll">Select all</v-btn>
        <v-btn color="orange" variant="tonal" size="small" class="" @click="clearSelection">Clear all</v-btn>
        <v-btn
          v-if="hasIntermodalRail"
          color="purple"
          variant="tonal"
          size="small"
          @click="railNoty.showForm.value = true"
          >Rail arrival notification</v-btn
        >
      </div>
      <div v-if="hasSelectedContainers" class="flex gap-2 p-2">
        <v-btn color="primary" size="small" variant="outlined" @click="preSendIntermodalNotyShow"
          ><v-icon>mdi-email-fast-outline</v-icon>Send notification about
          {{ countSelectedContainers }} container(s)</v-btn
        >
      </div>
      <v-table density="compact">
        <thead>
          <tr class="bg-slate-200">
            <th colspan="3" class="font-bold! text-center">
              <div class="flex items-center justify-center gap-2">
                <v-icon size="small">mdi-train-car-container</v-icon>
                Container
              </div>
            </th>
            <th v-if="isRail" colspan="7" class="font-bold! text-center">
              <div class="flex items-center justify-center gap-2">
                <v-icon size="small">mdi-train-car-intermodal</v-icon>
                Rail
              </div>
            </th>
            <th v-if="isTruck" colspan="6" class="font-bold! text-center">
              <div class="flex items-center justify-center gap-2">
                <v-icon size="small">mdi-truck-cargo-container</v-icon>
                Truck
              </div>
            </th>
            <th colspan="2" class="font-bold! text-center">Noty</th>
          </tr>

          <tr class="bg-slate-100">
            <th class="font-bold!"></th>
            <th class="font-bold!">Container</th>
            <th class="font-bold!">Modality</th>

            <th v-if="isRail" class="font-bold!">Requested</th>
            <th v-if="isRail" class="font-bold!">Assigned</th>
            <th v-if="isRail" class="font-bold!">Departed</th>
            <th v-if="isRail" class="font-bold!">Transport</th>
            <th v-if="isRail" class="font-bold!">ETT</th>
            <th v-if="isRail" class="font-bold!">Destination</th>
            <th v-if="isRail" class="font-bold!">Arrival</th>

            <th v-if="isTruck" class="font-bold!">Truck requested</th>
            <th v-if="isTruck" class="font-bold!">Truck assigned</th>
            <th v-if="isTruck" class="font-bold!">Truck departed</th>
            <th v-if="isTruck" class="font-bold!">Transport</th>
            <th v-if="isTruck" class="font-bold!">Destination</th>
            <th v-if="isTruck" class="font-bold!">Address</th>

            <th class="font-bold!">Customer delivery date</th>
            <th class="font-bold!">Arrival notify</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(container, index) in referencia.containers" :key="`cont-${index}`">
            <td>
              <div class="flex gap-2">
                <v-btn
                  icon="mdi-pencil-outline"
                  size="small"
                  variant="tonal"
                  color="primary"
                  @click="editContainer(container)"
                ></v-btn>
                <v-checkbox
                  v-model="container.intermodal.selected"
                  density="compact"
                  size="small"
                  variant="tonal"
                  color="primary"
                  :disabled="container.intermodal.transport_mode_id == null"
                />
              </div>
            </td>
            <td class="whitespace-nowrap">
              <div class="flex flex-col gap-2 mb-2">
                {{ container.container_number }}-{{ container.container_type?.name }}
              </div>
            </td>
            <td>
              <v-chip v-if="container.intermodal.transport_mode_id" color="green">
                {{ getTransportMode(container.intermodal.transport_mode_id) }}
              </v-chip>
              <v-chip v-if="container.intermodal.transport_mode_id == null" color="red">No</v-chip>
            </td>
            <template v-if="isRail">
              <td class="whitespace-nowrap">{{ container.intermodal.rail_requested_date }}</td>
              <td class="whitespace-nowrap">{{ container.intermodal.rail_assigned_date }}</td>
              <td class="whitespace-nowrap">{{ container.intermodal.rail_departure_date }}</td>
              <td class="whitespace-nowrap">{{ container.intermodal.rail_train_number }}</td>
              <td>
                <span>{{ container.intermodal.rail_ett ? `${container.intermodal.rail_ett} hrs` : '-' }}</span>
              </td>
              <td>{{ container.intermodal.rail_destination }}</td>
              <td class="whitespace-nowrap">{{ container.intermodal.rail_arrival_date }}</td>
            </template>
            <template v-if="isTruck">
              <td class="whitespace-nowrap">{{ container.intermodal.truck_requested_date }}</td>
              <td class="whitespace-nowrap">{{ container.intermodal.truck_assigned_date }}</td>
              <td class="whitespace-nowrap">{{ container.intermodal.truck_departure_date }}</td>
              <td>{{ container.intermodal.truck_truck_number }}</td>
              <td>{{ container.intermodal.destino_localidad }}</td>
              <td>{{ container.intermodal.truck_full_address }}</td>
            </template>
            <td>
              {{ container.intermodal.customer_delivery_date }}
            </td>
            <td>
              <div v-for="(noty, idx) in container.intermodal_notys" :key="`cont-${index}-noty-${idx}`" class="mb-1">
                <v-chip color="green" class="mr-2" size="small"
                  >[{{ noty.type == null ? 'intermodal' : noty.type }}] {{ noty.creator?.name }} @
                  {{ formatDateString(noty.created_at) }}</v-chip
                >
              </div>
            </td>
          </tr>
        </tbody>
      </v-table>

      <v-divider class="py-4 border-2 border-gray-700"></v-divider>

      <v-card v-if="showUpdateAll" class="mb-2" density="compact" color="light-green-lighten-3">
        <v-card-title>Update all containers</v-card-title>
        <v-card-subtitle>All the fields with data will be updated to all containers.</v-card-subtitle>
        <v-card-text>
          <!-- Rail form -->
          <div v-if="isRail" class="grid grid-cols-6 gap-2 mb-2">
            <div class="col-span-6 font-bold">Rail form</div>
            <div class="">
              <v-text-field
                v-model="massiveForm.rail_requested_date"
                density="compact"
                label="Rail requested date"
                type="date"
              />
            </div>
            <div class="">
              <v-text-field
                v-model="massiveForm.rail_assigned_date"
                density="compact"
                label="Rail assigned date"
                type="date"
              />
            </div>
            <div class="">
              <v-text-field
                v-model="massiveForm.rail_departure_date"
                density="compact"
                label="Rail departed date"
                type="date"
              />
            </div>
            <div class="col-span-1">
              <v-text-field v-model="massiveForm.rail_train_number" density="compact" label="Rail transport number" />
            </div>
            <div class="">
              <v-autocomplete
                v-model="massiveForm.rail_ett"
                :items="etts"
                item-title="name"
                item-value="value"
                density="compact"
                label="ETT"
              />
            </div>
            <div class="col-span-1">
              <v-text-field
                v-model="massiveForm.rail_arrival_date"
                type="date"
                density="compact"
                label="Arrival date"
              />
            </div>
            <div class="col-span-2">
              <v-autocomplete
                v-model="massiveForm.rail_destination"
                :items="terminalDestinations"
                item-title="name"
                item-value="name"
                density="compact"
                label="Terminal destination"
              />
            </div>
          </div>
          <!-- Truck form -->
          <div v-if="isTruck" class="grid grid-cols-4 gap-2 mb-2">
            <div class="col-span-4 font-bold">Truck form</div>
            <div class="">
              <v-text-field
                v-model="massiveForm.truck_requested_date"
                density="compact"
                label="Truck requested date"
                type="date"
              />
            </div>
            <div class="">
              <v-text-field
                v-model="massiveForm.truck_assigned_date"
                density="compact"
                label="Truck assigned date"
                type="date"
              />
            </div>
            <div class="">
              <v-text-field
                v-model="massiveForm.truck_departure_date"
                density="compact"
                label="Truck departed date"
                type="date"
              />
            </div>
            <div class="">
              <AGlobalSearch
                :onSearch="searchSuppliers"
                v-model="search.supplier"
                validate-key="massive_supplier_id"
                label="Supplier"
                :return-object="true"
                @update:model-value="setSupplierTruckInformationMassive"
              />
              <v-text-field v-model="massiveForm.truck_truck_number" density="compact" label="Truck information" />
            </div>
            <div class="col-span-4">
              <AGlobalSearch
                :onSearch="searchDestinations"
                v-model="search.destination"
                validate-key="massive_destination_id"
                label="Destination (catalog)"
                :return-object="true"
                @update:model-value="setDestinationTruckInformationMassive"
              />
              <v-textarea
                v-model="massiveForm.destino_localidad"
                density="compact"
                label="Destino / Localidad"
                :rows="2"
                hide-details
              />
            </div>
            <div class="col-span-4">
              <v-textarea
                v-model="massiveForm.truck_full_address"
                density="compact"
                label="Full address (delivery details)"
                :rows="2"
              />
            </div>
          </div>
          <div>
            <v-text-field
              v-model="massiveForm.customer_delivery_date"
              density="compact"
              label="Date of delivery to the customer"
              type="date"
            />
          </div>
        </v-card-text>
        <v-card-actions>
          <v-btn color="secondary" @click="toggleUpdateAll">Cancel</v-btn>
          <v-btn color="primary" @click="updateAllContainers">Update all containers</v-btn>
        </v-card-actions>
      </v-card>

      <v-divider class="py-4 border-2 border-gray-700"></v-divider>

      <div v-if="hasEditContainers">
        <div v-for="(editContainer, index) in formEdit.containers" :key="`edit-container-${index}`">
          <v-card class="mb-2" density="compact" color="light-green-lighten-2">
            <v-card-title>Edit container #{{ editContainer.container_number }}</v-card-title>
            <v-card-text>
              <!-- Rail form -->
              <div v-if="isRail" class="grid grid-cols-6 gap-2 mb-2">
                <div class="col-span-6 font-bold">Rail form</div>
                <div class="">
                  <v-text-field
                    v-model="editContainer.intermodal.rail_requested_date"
                    density="compact"
                    label="Rail requested date"
                    type="date"
                  />
                </div>
                <div class="">
                  <v-text-field
                    v-model="editContainer.intermodal.rail_assigned_date"
                    density="compact"
                    label="Rail assigned date"
                    type="date"
                  />
                </div>
                <div class="">
                  <v-text-field
                    v-model="editContainer.intermodal.rail_departure_date"
                    density="compact"
                    label="Rail departed date"
                    type="date"
                  />
                </div>
                <div class="col-span-1">
                  <v-text-field
                    v-model="editContainer.intermodal.rail_train_number"
                    density="compact"
                    label="Rail transport number"
                  />
                </div>
                <div class="">
                  <v-autocomplete
                    v-model="editContainer.intermodal.rail_ett"
                    :items="etts"
                    item-title="name"
                    item-value="value"
                    density="compact"
                    label="ETT"
                  />
                </div>
                <div class="col-span-1">
                  <v-text-field
                    v-model="editContainer.intermodal.rail_arrival_date"
                    type="date"
                    density="compact"
                    label="Arrival date"
                  />
                </div>
                <div class="col-span-2">
                  <v-autocomplete
                    v-model="editContainer.intermodal.rail_destination"
                    :items="terminalDestinations"
                    item-title="name"
                    item-value="name"
                    density="compact"
                    label="Terminal destination"
                  />
                </div>
              </div>
              <!-- Truck form -->
              <div v-if="isTruck" class="grid grid-cols-4 gap-2 mb-2">
                <div class="col-span-4 font-bold">Truck form</div>
                <div class="">
                  <v-text-field
                    v-model="editContainer.intermodal.truck_requested_date"
                    density="compact"
                    label="Truck requested date"
                    type="date"
                  />
                </div>
                <div class="">
                  <v-text-field
                    v-model="editContainer.intermodal.truck_assigned_date"
                    density="compact"
                    label="Truck assigned date"
                    type="date"
                  />
                </div>
                <div class="">
                  <v-text-field
                    v-model="editContainer.intermodal.truck_departure_date"
                    density="compact"
                    label="Truck departed date"
                    type="date"
                  />
                </div>
                <div class="">
                  <AGlobalSearch
                    :onSearch="searchSuppliers"
                    v-model="search.supplier"
                    validate-key="supplier_id"
                    label="Supplier"
                    :return-object="true"
                    @update:model-value="(supplier) => setSupplierTruckInformation(supplier, editContainer)"
                  />
                  <v-text-field
                    v-model="editContainer.intermodal.truck_truck_number"
                    density="compact"
                    label="Truck information"
                  />
                </div>
                <div class="col-span-4">
                  <AGlobalSearch
                    :onSearch="searchDestinations"
                    v-model="search.destination"
                    validate-key="destination_id"
                    label="Destination (catalog)"
                    :return-object="true"
                    @update:model-value="(destination) => setDestinationTruckInformation(destination, editContainer)"
                  />
                  <v-textarea
                    v-model="editContainer.intermodal.destino_localidad"
                    density="compact"
                    label="Destino / Localidad"
                    :rows="2"
                    hide-details
                  />
                </div>
                <div class="col-span-4">
                  <v-textarea
                    v-model="editContainer.intermodal.truck_full_address"
                    density="compact"
                    label="Full address (delivery details)"
                    :rows="2"
                    hide-details
                  />
                </div>
              </div>
              <div>
                <v-text-field
                  v-model="editContainer.intermodal.customer_delivery_date"
                  density="compact"
                  label="Date of delivery to the customer"
                  type="date"
                />
              </div>
            </v-card-text>
            <v-card-actions>
              <v-btn color="primary" @click="saveContainer(editContainer)">Save changes</v-btn>
              <v-btn color="red" @click="deleteContainer(editContainer)">Delete intermodal</v-btn>
            </v-card-actions>
          </v-card>
        </div>
        <v-divider></v-divider>
        <v-btn color="red" variant="tonal" size="small" @click="clearEditContainers">Cancel edit</v-btn>
      </div>
    </div>

    <v-dialog v-model="preintermodalNoty.show" max-width="700" persistent>
      <v-card>
        <v-card-title>Intermodal notification, before send...</v-card-title>
        <v-card-text>
          <div>
            <div>You can add more emails like Customs Agents to notify.</div>
            <v-textarea
              v-model="preintermodalNoty.emails"
              label="Additional emails (TO) (optional)"
              hint="Comma separated emails"
              density="compact"
              :rows="3"
              hide-details
            />
          </div>
        </v-card-text>
        <v-card-actions>
          <div class="w-full flex justify-around">
            <v-btn color="red" @click="closePreintermodalNoty">Cancel</v-btn>
            <v-btn color="amber" @click="sendIntermodalNotification">Notify intermodal</v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="railNoty.showForm.value" max-width="700" persistent>
      <v-card>
        <v-card-title>Rail arrival notification form</v-card-title>
        <v-card-text>
          <div>
            <v-text-field
              v-model="railNoty.arrival_date.value"
              label="Arrival date"
              hint="Comma separated emails"
              density="compact"
              type="date"
            />
            <v-autocomplete
              v-model="railNoty.destination.value"
              :items="terminalDestinations"
              item-title="name"
              item-value="name"
              label="Destination"
              density="compact"
            />
            <v-textarea
              v-model="railNoty.emails.value"
              label="Customer emails"
              hint="Comma separated emails"
              density="compact"
              :rows="3"
              hide-details
            />
            <CustomerEmailsWidget
              :customer-id="referencia.consignee_id"
              :notifys="customerNotifys"
              @fetched-emails="railNoty.setEmails"
            />

            <v-checkbox v-model="railNoty.include_pdf.value" label="Include PDF in notification" />
            <div class="p-2">
              <div class="font-bold">Select container(s)</div>
              <v-btn color="primary" size="x-small" @click="selectRailAll">Select all</v-btn>
              <div class="grid grid-cols-3 gap-2">
                <div v-for="(container, index) in referencia.containers" :key="`cont-${index}`">
                  <v-checkbox
                    v-model="container.intermodal.rail_noty_selected"
                    :label="container.container_number"
                    hint="Send notification for this container"
                    density="compact"
                    hide-details
                  />
                </div>
              </div>
            </div>
          </div>
        </v-card-text>
        <v-card-actions>
          <div class="w-full flex justify-around">
            <v-btn color="red" @click="railNoty.closeRailNotyDialgo">Cancel</v-btn>
            <v-btn color="amber" @click="railNoty.sendRailNotification">Notify rail arrival</v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script setup lang="ts">
import { mailNotifications, LIVERPOOL_MBL_CONSIGNEE_IDS } from '~/utils/data/systemData'
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()

const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
})

const referencia = ref<any>({})
const catalogs = ref<any>({
  transportation_modes: [],
  destinations: [],
})
const preintermodalNoty = ref<any>({
  show: false,
  emails: null,
})

const selectedNames = ['SeaImportIntermodalRailNoty']

const customerNotifys = computed(() => {
  return mailNotifications.filter((notify) => selectedNames.includes(notify.short_name))
})

const etts = [
  { name: '24 hrs', value: 24 },
  { name: '36 hrs', value: 36 },
  { name: '40 hrs', value: 40 },
  { name: '42 hrs', value: 42 },
  { name: '48 hrs', value: 48 },
  { name: '72 hrs', value: 72 },
  { name: '96 hrs', value: 96 },
  { name: '120 hrs', value: 120 },
  { name: '144 hrs', value: 144 },
]

const search = reactive<any>({
  supplier: null,
})

const showUpdateAll = ref<any>(false)

const showIntermodalInfo = ref(true)
const intermodalMode = ref<any>({
  intermodal: null,
  internal_transit: null,
})

const massiveForm = ref<any>({
  rail_requested_date: null,
  rail_assigned_date: null,
  rail_departure_date: null,
  rail_train_number: null,
  rail_ett: null,
  rail_destination: null,
  rail_arrival_date: null,

  truck_requested_date: null,
  truck_assigned_date: null,
  truck_departure_date: null,
  truck_truck_number: null,
  destino_localidad: null,
  truck_full_address: null,
})

const intermodalData = {
  transport_mode_id: null,
  rail_requested_date: null,
  rail_assigned_date: null,
  rail_departure_date: null,
  rail_train_number: null,
  rail_ett: null,
  rail_destination: null,

  rail_arrival_date: null,
  truck_requested_date: null,
  truck_assigned_date: null,
  truck_departure_date: null,
  truck_truck_number: null,
  destino_localidad: null,
  truck_full_address: null,

  rail_noty_selected: false,
}

const terminalDestinations = [
  { name: 'Terminal Intermodal de Altamira' },
  { name: 'Terminal Intermodal de Monterrey' },
  { name: 'Terminal Intermodal de Querétaro' },
  { name: 'Terminal Intermodal de Guadalajara' },
  { name: 'Terminal Intermodal de Lázaro Cárdenas' },
  { name: 'Terminal Intermodal de Manzanillo' },
  { name: 'Terminal Intermodal de Silao' },
  { name: 'Terminal Intermodal de San Luis Potosí' },
  { name: 'Terminal Intermodal de Puebla' },
  { name: 'Terminal Intermodal de Hermosillo' },
  { name: 'Terminal Intermodal de Torreón' },
  { name: 'Terminal Intermodal de Aguascalientes' },
  { name: 'Terminal Intermodal de Salinas Victoria' },
  { name: 'Terminal Intermodal de CDMX' },
  { name: 'Terminal Intermodal de IMEX' },
  { name: 'Terminal Intermodal de Puerta México Toluca' },
  { name: 'Terminal Intermodal de Pantaco' },
  { name: 'Terminal Intermodal de Cuatitlán Estado de México' },
]

const formEdit = ref<any>({
  containers: [],
})

const hasIntermodal = computed(() => {
  return referencia.value.transportation_mode_id != null
})

const isRail = computed(() => {
  return referencia.value.transportation_mode_id === 1 || referencia.value.transportation_mode_id === 3
})

const isTruck = computed(() => {
  return referencia.value.transportation_mode_id === 2 || referencia.value.transportation_mode_id === 3
})

const hasIntermodalRail = computed(() => {
  return referencia.value.transportation_mode_id === 1 || referencia.value.transportation_mode_id === 3
})

const isLiverpoolMbl = computed(() => {
  if (!referencia.value?.master_bls) {
    return false
  }
  return referencia.value.master_bls.some((mbl: any) =>
    LIVERPOOL_MBL_CONSIGNEE_IDS.includes(Number(mbl.consignee_mbl_id))
  )
})

const canDoIntermodal = computed(() => {
  const hasArrival = referencia.value?.arrival_notys?.length > 0
  if (!hasArrival) {
    return false
  }
  if (isLiverpoolMbl.value) {
    return true
  }
  return referencia.value?.revalidation != null
})

const intermodalBlockReason = computed(() => {
  const hasArrival = referencia.value?.arrival_notys?.length > 0
  if (!hasArrival) {
    return 'Intermodal information cannot be modified. Reference should have arrival notification completed.'
  }
  if (!isLiverpoolMbl.value && referencia.value?.revalidation == null) {
    return 'Intermodal information cannot be modified. Revalidation process should be completed.'
  }
  return ''
})

const canIntermodalTransit = computed(() => {
  return intermodalMode.value.intermodal === 1 || intermodalMode.value.intermodal === 3
})

const hasEditContainers = computed(() => {
  return formEdit.value.containers.length > 0
})

const hasSelectedContainers = computed(() => {
  return referencia.value.containers.some((container: any) => container.intermodal.selected)
})

const countSelectedContainers = computed(() => {
  return referencia.value.containers.filter((container: any) => container.intermodal.selected).length
})

const clearInternalTransit = () => {
  intermodalMode.value.internal_transit = null
}

const onModifyAllClick = () => {
  formEdit.value.containers = JSON.parse(JSON.stringify(referencia.value.containers))
}

const toggleUpdateAll = () => {
  formEdit.value.containers = []
  showUpdateAll.value = !showUpdateAll.value
  massiveForm.value = {
    rail_requested_date: null,
    rail_assigned_date: null,
    rail_departure_date: null,
    rail_train_number: null,
    rail_ett: null,
    rail_destination: null,
    rail_arrival_date: null,

    truck_requested_date: null,
    truck_assigned_date: null,
    truck_departure_date: null,
    truck_truck_number: null,
    truck_full_address: null,

    customer_delivery_date: null,
  }
}

const searchSuppliers = async (params: any) => {
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

const searchDestinations = async (params: any) => {
  try {
    const response = await $api.destinations.searchDestinations({
      query: params,
    })
    return response
  } catch (error) {
    snackbar.add({
      type: 'error',
      text: 'Error fetching destinations',
    })
  }
}

const setSupplierTruckInformation = (supplier: any, editContainer: any) => {
  console.log(editContainer)
  if (supplier) {
    editContainer.intermodal.truck_truck_number = supplier.name
  }
}

const setDestinationTruckInformation = (destination: any, editContainer: any) => {
  console.log('destination', destination)
  console.log('editContainer', editContainer)
  if (destination) {
    editContainer.intermodal.destino_localidad = destination.name
  }
}

const setSupplierTruckInformationMassive = (supplier: any) => {
  if (supplier) {
    massiveForm.value.truck_truck_number = supplier.name
  }
}

const setDestinationTruckInformationMassive = (destination: any) => {
  if (destination) {
    massiveForm.value.destino_localidad = destination.name
  }
}

const getTransportMode = (id: number) => {
  return catalogs.value.transportation_modes.find((mode: any) => mode.id === id)?.name
}

const selectAll = () => {
  referencia.value.containers.forEach((container: any) => {
    if (container.intermodal.transport_mode_id != null) {
      container.intermodal.selected = true
    }
  })
}

const selectRailAll = () => {
  referencia.value.containers.forEach((container: any) => {
    if (container.intermodal.transport_mode_id != null) {
      container.intermodal.rail_noty_selected = true
    }
  })
}

const clearSelection = () => {
  referencia.value.containers.forEach((container: any) => {
    container.intermodal.selected = false
  })
}

const editContainer = (container: any) => {
  console.log('edit Container', container)
  formEdit.value.containers = []
  if (container.intermodal == null) {
    container.intermodal = { ...intermodalData }
  }
  formEdit.value.containers.push(JSON.parse(JSON.stringify(container)))
  showUpdateAll.value = false
}

const clearEditContainers = () => {
  formEdit.value.containers = []
  showUpdateAll.value = false
}

const saveIntermodalInfo = async () => {
  try {
    loadingStore.start()
    const response = await $api.referencias.updateSeaImportIntermodalById(props.id.toString(), intermodalMode.value)
    snackbar.add({ type: 'success', text: 'Intermodal information updated' })

    await getSeaImportDetails()
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const updateAllContainers = async () => {
  console.log(massiveForm.value)
  try {
    loadingStore.start()
    const body = {
      ...massiveForm.value,
    }
    // remove empty values
    for (const key in body) {
      if (body[key] == null || body[key] === '') {
        delete body[key]
      }
    }
    const response = await $api.referencias.updateSeaImportIntermodalAllContainers(props.id.toString(), body)
    snackbar.add({ type: 'success', text: 'Containers information updated' })

    clearEditContainers()
    await getSeaImportDetails()
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const saveContainer = async (container: any) => {
  try {
    loadingStore.start()
    const response = await $api.referencias.updateSeaImportIntermodalContainerById(props.id.toString(), container)
    snackbar.add({ type: 'success', text: 'Container information updated' })

    clearEditContainers()
    await getSeaImportDetails()
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const deleteContainer = async (container: any) => {
  try {
    loadingStore.start()
    const response = await $api.referencias.deleteSeaImportIntermodalContainerById(props.id.toString(), container)
    snackbar.add({ type: 'success', text: 'Container intermodal information deleted' })

    clearEditContainers()
    await getSeaImportDetails()
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const preSendIntermodalNotyShow = () => {
  preintermodalNoty.value.show = true
  preintermodalNoty.value.emails = null
}

const closePreintermodalNoty = () => {
  preintermodalNoty.value.show = false
  preintermodalNoty.value.emails = null
}

const sendIntermodalNotification = async () => {
  try {
    loadingStore.start()
    const body = {
      emails: preintermodalNoty.value.emails,
      containers: referencia.value.containers
        .filter((container: any) => container.intermodal.selected)
        .map((container: any) => {
          return {
            id: container.id,
          }
        }),
    }
    await $api.referencias.sendSeaImportIntermodalNotifications(props.id.toString(), body)
    snackbar.add({ type: 'success', text: 'Intermodal notification sent successfully' })
    closePreintermodalNoty()

    await getSeaImportDetails()
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const getSeaImportDetails = async () => {
  try {
    loadingStore.start()
    const response = (await $api.referencias.getSeaImportIntermodalById(props.id.toString())) as any

    // foreach response.referencia.containers
    // if container.intermodal is null, set container.intermodal = intermodalData
    response.referencia.containers.forEach((container: any) => {
      if (container.intermodal == null) {
        container.intermodal = { ...intermodalData }
      }
    })
    referencia.value = response.referencia

    intermodalMode.value.intermodal = response.referencia.transportation_mode_id
    intermodalMode.value.internal_transit = response.referencia.internal_transit === 1

    catalogs.value = response.catalogs
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const useRailNoty = () => {
  const showForm = ref(false)
  const emails = ref('')
  const arrival_date = ref(null)
  const destination = ref(null)
  const include_pdf = ref(false)

  const setEmails = (customerEmails: string) => {
    // if array split by comma
    if (Array.isArray(customerEmails)) {
      emails.value = customerEmails.join(', ')
      return
    }
    emails.value = customerEmails
  }

  const sendRailNotification = async () => {
    try {
      // validate emails are in comma separated format
      if (!validateCommaSeparatedEmails(emails.value)) {
        snackbar.add({ type: 'error', text: 'Emails are required and is not valid.' })
        return
      }

      if (!arrival_date.value) {
        snackbar.add({ type: 'error', text: 'Arrival date is required' })
        return
      }

      if (!destination.value) {
        snackbar.add({ type: 'error', text: 'Destination is required' })
        return
      }

      if (!referencia.value.containers.some((container: any) => container.intermodal.rail_noty_selected)) {
        snackbar.add({ type: 'error', text: 'Select at least one container' })
        return
      }

      loadingStore.loading = true

      const selectedContainers = referencia.value.containers
        .filter((container: any) => container.intermodal.rail_noty_selected)
        .map((container: any) => container.id)
      const body = {
        emails: emails.value,
        include_pdf: include_pdf.value,
        arrival_date: arrival_date.value,
        destination: destination.value,
        containers: selectedContainers,
        referencia_id: props.id,
      }
      await $api.referencias.sendIntermodalRailNoty(props.id.toString(), body)

      snackbar.add({ type: 'success', text: 'Rail notification sent' })
      closeRailNotyDialgo()
      getSeaImportDetails()
    } catch (e) {
      console.error(e)
    } finally {
      loadingStore.loading = false
    }
  }

  const closeRailNotyDialgo = () => {
    showForm.value = false
    arrival_date.value = null
    destination.value = null
    emails.value = ''
    include_pdf.value = false
  }

  function validateCommaSeparatedEmails(emails: string) {
    if (!emails) return false
    // Regular expression for validating an email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    // Split the input string by commas and trim each resulting email
    const emailArray = emails.split(',').map((email) => email.trim())

    // Validate each email and return false if any email is invalid
    for (let email of emailArray) {
      if (!emailRegex.test(email)) {
        return false
      }
    }

    // If all emails are valid, return true
    return true
  }

  return {
    showForm,
    emails,
    arrival_date,
    destination,
    include_pdf,
    sendRailNotification,
    closeRailNotyDialgo,
    setEmails,
  }
}

const railNoty = useRailNoty()

onMounted(async () => {
  await getSeaImportDetails()
})
</script>
