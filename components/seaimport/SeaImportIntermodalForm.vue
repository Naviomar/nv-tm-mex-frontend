<template>
  <div>
    <v-card class="mb-4" variant="flat" density="compact">
      <v-card-title>
        <div class="flex justify-between">
          <div class="flex flex-col md:flex-row items-center gap-2">
            <div class="flex items-center gap-2">
              <v-icon size="small">mdi-train-car-intermodal</v-icon>
              <div>Intermodal information</div>
            </div>
            <v-card-subtitle>
              <div class="flex items-center gap-2">
                <v-icon size="small">mdi-ship-wheel</v-icon>
                <div>Sea Import information #{{ referencia.reference_number }}</div>
              </div>
            </v-card-subtitle>
          </div>
          <div>
            <v-btn icon size="x-small" @click="showIntermodalInfo = !showIntermodalInfo" color="blue-grey-darken-2">
              <v-icon v-if="showIntermodalInfo">mdi-eye-outline</v-icon>
              <v-icon v-if="!showIntermodalInfo">mdi-eye-closed</v-icon>
            </v-btn>
          </div>
        </div>
      </v-card-title>
      
      <v-card-text v-show="showIntermodalInfo">
        <div class="grid grid-cols-1 md:grid-cols-2">
          <div class="min-w-32">
            <v-radio-group
              v-model="intermodalMode.intermodal"
              label="Select transportation mode"
              row
              inline
              @update:modelValue="clearInternalTransit"
            >
              <v-radio
                v-for="(transp, idx) in catalogs.transportation_modes"
                :label="transp.name"
                :value="transp.id"
                :key="`transp-${idx}`"
                class="mr-4"
              ></v-radio>
            </v-radio-group>
            <v-btn
              v-if="intermodalMode.intermodal"
              @click="intermodalMode.intermodal = null"
              color="red"
              size="x-small"
              class="ml-2"
              >No intermodal</v-btn
            >
            <v-card-actions>
              <v-btn color="primary" @click="saveIntermodalInfo">Save changes</v-btn>
            </v-card-actions>
          </div>
          <div>
            <div v-if="canIntermodalTransit" class="pb-4">
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
    </v-card>
    <v-alert v-if="!canDoIntermodal" color="red-lighten-1" variant="tonal">
      <v-icon>mdi-alert-circle-outline</v-icon>
      <span>{{ intermodalBlockReason }}</span>
    </v-alert>

    <div v-if="hasIntermodal && canDoIntermodal">
      <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div class="flex flex-col md:flex-row gap-2 md:items-center">
          <p class="font-bold">Containers intermodal information</p>

          <v-btn color="blue" variant="tonal" size="small" @click="selectAll">Select all for port email</v-btn>
          <v-btn color="orange" variant="tonal" size="small" @click="clearSelection">Clear port email selection</v-btn>
          
          <div v-if="hasSelectedContainers" class="flex gap-2">
            <v-btn color="primary" size="small" variant="outlined" @click="preSendIntermodalNotyShow"
              ><v-icon>mdi-email-fast-outline</v-icon>Notify port about {{ countSelectedContainers }} selected container(s)</v-btn
            >
          </div>
        </div>
        <div class="flex flex-wrap gap-2">
          <v-btn color="indigo" variant="tonal" size="small" @click="startGeneralEdit" :disabled="showGeneralEditor"
            >General edit</v-btn
          >
          <v-btn color="green" variant="tonal" size="small" @click="toggleUpdateAll" :disabled="showGeneralEditor"
            >Update massive</v-btn
          >
          <v-btn v-if="hasIntermodalRail" color="purple" variant="tonal" size="small" @click="railNoty.openRailNotyDialog"
            >Notify customer rail arrival</v-btn
          >
        </div>
      </div>

      <v-alert class="my-3 text-blue-darken-2 dark:text-blue-lighten-4" border="start" variant="tonal" density="compact">
        Use the row checkboxes to select containers for the intermodal email sent from this module to port/intermodal contacts.
        Rail arrival notification is a separate customer email grouped by arrival date.
      </v-alert>

      <v-alert v-if="showGeneralEditor" class="my-3 text-indigo-darken-2 dark:text-indigo-lighten-4" border="start" variant="tonal">
        General edit mode is enabled. You can modify the container fields directly in the table and use the floating save button.
      </v-alert>

      <div class="overflow-x-auto rounded border border-slate-200">
        <v-table density="compact" class="min-w-fit">
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
              <th colspan="3" class="font-bold! text-center">Notifications</th>
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
              <th v-if="isTruck" class="font-bold!">Truck information</th>
              <th v-if="isTruck" class="font-bold!">Destination</th>
              <th v-if="isTruck" class="font-bold!">Address</th>

              <th class="font-bold!">Note</th>
              <th class="font-bold!">Customer delivery date</th>
              <th class="font-bold!">Notifications</th>
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
                    :disabled="showGeneralEditor"
                    @click="editContainer(container)"
                  ></v-btn>
                  <v-checkbox
                    v-model="container.intermodal.selected"
                    density="compact"
                    size="small"
                    variant="tonal"
                    color="primary"
                    :disabled="!canSelectContainerForIntermodalNotification(container)"
                  />
                </div>
              </td>
              <td class="whitespace-nowrap">
                <div class="flex flex-col gap-1 py-1">
                  <span class="font-medium">{{ container.container_number }}</span>
                  <span class="text-caption text-medium-emphasis">{{ container.container_type?.name || '-' }}</span>
                </div>
              </td>
              <td>
                <v-chip v-if="container.intermodal.transport_mode_id" color="green">
                  {{ getTransportMode(container.intermodal.transport_mode_id) }}
                </v-chip>
                <v-chip v-else color="red">No</v-chip>
              </td>
              <template v-if="isRail">
                <td class="whitespace-nowrap">
                  <v-text-field
                    v-if="showGeneralEditor"
                    v-model="container.intermodal.rail_requested_date"
                    density="compact"
                    type="date"
                    hide-details
                    variant="outlined"
                    class="min-w-[155px]"
                  />
                  <span v-else>{{ container.intermodal.rail_requested_date || '-' }}</span>
                </td>
                <td class="whitespace-nowrap">
                  <v-text-field
                    v-if="showGeneralEditor"
                    v-model="container.intermodal.rail_assigned_date"
                    density="compact"
                    type="date"
                    hide-details
                    variant="outlined"
                    class="min-w-[155px]"
                  />
                  <span v-else>{{ container.intermodal.rail_assigned_date || '-' }}</span>
                </td>
                <td class="whitespace-nowrap">
                  <v-text-field
                    v-if="showGeneralEditor"
                    v-model="container.intermodal.rail_departure_date"
                    density="compact"
                    type="date"
                    hide-details
                    variant="outlined"
                    class="min-w-[155px]"
                  />
                  <span v-else>{{ container.intermodal.rail_departure_date || '-' }}</span>
                </td>
                <td class="whitespace-nowrap">
                  <v-text-field
                    v-if="showGeneralEditor"
                    v-model="container.intermodal.rail_train_number"
                    density="compact"
                    hide-details
                    variant="outlined"
                    class="min-w-[180px]"
                  />
                  <span v-else>{{ container.intermodal.rail_train_number || '-' }}</span>
                </td>
                <td>
                  <v-autocomplete
                    v-if="showGeneralEditor"
                    v-model="container.intermodal.rail_ett"
                    :items="etts"
                    item-title="name"
                    item-value="value"
                    density="compact"
                    hide-details
                    variant="outlined"
                    class="min-w-[140px]"
                  />
                  <span v-else>{{ container.intermodal.rail_ett ? `${container.intermodal.rail_ett} hrs` : '-' }}</span>
                </td>
                <td>
                  <v-autocomplete
                    v-if="showGeneralEditor"
                    v-model="container.intermodal.rail_destination"
                    :items="terminalDestinations"
                    item-title="name"
                    item-value="name"
                    density="compact"
                    hide-details
                    variant="outlined"
                    class="min-w-[220px]"
                  />
                  <span v-else>{{ container.intermodal.rail_destination || '-' }}</span>
                </td>
                <td class="whitespace-nowrap">
                  <v-text-field
                    v-if="showGeneralEditor"
                    v-model="container.intermodal.rail_arrival_date"
                    density="compact"
                    type="date"
                    hide-details
                    variant="outlined"
                    class="min-w-[155px]"
                  />
                  <span v-else>{{ container.intermodal.rail_arrival_date || '-' }}</span>
                </td>
              </template>
              <template v-if="isTruck">
                <td class="whitespace-nowrap">
                  <v-text-field
                    v-if="showGeneralEditor"
                    v-model="container.intermodal.truck_requested_date"
                    density="compact"
                    type="date"
                    hide-details
                    variant="outlined"
                    class="min-w-[155px]"
                  />
                  <span v-else>{{ container.intermodal.truck_requested_date || '-' }}</span>
                </td>
                <td class="whitespace-nowrap">
                  <v-text-field
                    v-if="showGeneralEditor"
                    v-model="container.intermodal.truck_assigned_date"
                    density="compact"
                    type="date"
                    hide-details
                    variant="outlined"
                    class="min-w-[155px]"
                  />
                  <span v-else>{{ container.intermodal.truck_assigned_date || '-' }}</span>
                </td>
                <td class="whitespace-nowrap">
                  <v-text-field
                    v-if="showGeneralEditor"
                    v-model="container.intermodal.truck_departure_date"
                    density="compact"
                    type="date"
                    hide-details
                    variant="outlined"
                    class="min-w-[155px]"
                  />
                  <span v-else>{{ container.intermodal.truck_departure_date || '-' }}</span>
                </td>
                <td>
                  <v-combobox
                    v-if="showGeneralEditor"
                    v-model="container.intermodal.truck_truck_number"
                    :items="truckInformationCatalog"
                    :loading="truckInformationLoading"
                    item-title="name"
                    item-value="name"
                    density="compact"
                    hide-details
                    variant="outlined"
                    class="min-w-[220px]"
                    @update:search="onTruckInformationSearch"
                  />
                  <span v-else>{{ container.intermodal.truck_truck_number || '-' }}</span>
                </td>
                <td>
                  <v-textarea
                    v-if="showGeneralEditor"
                    v-model="container.intermodal.destino_localidad"
                    density="compact"
                    rows="2"
                    hide-details
                    variant="outlined"
                    class="min-w-[220px]"
                  />
                  <span v-else>{{ container.intermodal.destino_localidad || '-' }}</span>
                </td>
                <td>
                  <v-textarea
                    v-if="showGeneralEditor"
                    v-model="container.intermodal.truck_full_address"
                    density="compact"
                    rows="2"
                    hide-details
                    variant="outlined"
                    class="min-w-[240px]"
                  />
                  <div v-else class="flex items-start gap-1">
                    <span class="whitespace-normal">{{ getShortAddress(container.intermodal.truck_full_address, container.id) }}</span>
                    <v-btn
                      v-if="hasLongAddress(container.intermodal.truck_full_address)"
                      :icon="expandedAddresses[container.id] ? 'mdi-chevron-up' : 'mdi-chevron-down'"
                      size="x-small"
                      variant="text"
                      @click="toggleAddress(container.id)"
                    ></v-btn>
                  </div>
                </td>
              </template>
              <td>
                <v-textarea
                  v-if="showGeneralEditor"
                  v-model="container.intermodal.note"
                  density="compact"
                  rows="2"
                  hide-details
                  variant="outlined"
                  class="min-w-[220px]"
                />
                <span v-else>{{ container.intermodal.note || '-' }}</span>
              </td>
              <td class="whitespace-nowrap">
                <v-text-field
                  v-if="showGeneralEditor"
                  v-model="container.intermodal.customer_delivery_date"
                  density="compact"
                  type="date"
                  hide-details
                  variant="outlined"
                  class="min-w-[165px]"
                />
                <span v-else>{{ container.intermodal.customer_delivery_date || '-' }}</span>
              </td>
              <td>
                <div class="flex min-w-[300px] flex-col gap-2 py-2">
                  <div>
                    <div class="text-caption font-weight-bold text-blue-darken-2">Arrival notify history</div>
                    <div v-if="referencia.arrival_notys?.length" class="mt-1 flex flex-col gap-1">
                      <v-chip
                        v-for="(arrivalNoty, arrivalIndex) in referencia.arrival_notys"
                        :key="`arrival-noty-${index}-${arrivalIndex}`"
                        size="small"
                        color="blue-darken-2"
                        class="mr-2"
                      >
                        Arrival · {{ arrivalNoty.created_by?.name || 'N/A' }} @ {{ formatDateString(arrivalNoty.created_at) }}
                      </v-chip>
                    </div>
                    <v-chip v-else size="small" color="grey">No arrival notify sent yet</v-chip>
                  </div>

                  <div>
                    <div class="text-caption font-weight-bold text-green-darken-2">Intermodal notify history</div>
                    <div v-if="container.intermodal_notys?.some((noty: any) => noty.type !== 'rail')" class="mt-1 flex flex-col gap-1">
                      <v-chip
                        v-for="(noty, idx) in container.intermodal_notys.filter((noty: any) => noty.type !== 'rail')"
                        :key="`cont-${index}-noty-${idx}`"
                        :color="getIntermodalNotyColor(noty.type)"
                        class="mr-2"
                        size="small"
                      >
                        {{ getIntermodalNotyLabel(noty.type) }} · {{ noty.creator?.name || 'N/A' }} @
                        {{ formatDateString(noty.created_at) }}
                      </v-chip>
                    </div>
                    <v-chip v-else size="small" color="grey">No intermodal notify sent yet</v-chip>
                  </div>

                  <div>
                    <div class="text-caption font-weight-bold text-purple-darken-2">Rail notify history</div>
                    <div v-if="container.intermodal_notys?.some((noty: any) => noty.type === 'rail')" class="mt-1 flex flex-col gap-1">
                      <v-chip
                        v-for="(noty, idx) in container.intermodal_notys.filter((noty: any) => noty.type === 'rail')"
                        :key="`cont-${index}-rail-noty-${idx}`"
                        :color="getIntermodalNotyColor(noty.type)"
                        class="mr-2"
                        size="small"
                      >
                        {{ getIntermodalNotyLabel(noty.type) }} · {{ noty.creator?.name || 'N/A' }} @
                        {{ formatDateString(noty.created_at) }}
                      </v-chip>
                    </div>
                    <v-chip v-else size="small" color="grey">No rail notify sent yet</v-chip>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </v-table>
      </div>

      <div v-if="showGeneralEditor" class="fixed bottom-16 right-6 z-50 flex flex-row gap-2 bg-gray-100 dark:bg-gray-800 p-2 shadow-lg border border-gray-300 rounded-lg">
        <v-btn color="primary" size="large" prepend-icon="mdi-content-save" class="rounded-lg shadow-lg" @click="saveGeneralEdit"
          >Save all changes</v-btn
        >
        <v-btn color="red" size="large" variant="tonal" class="rounded-lg shadow-lg" @click="cancelGeneralEdit"
          >Cancel</v-btn>
      </div>

      <v-divider class="py-4 border-2 border-gray-700"></v-divider>

      <v-dialog v-model="showUpdateAll" max-width="1100" persistent scrollable :fullscreen="$vuetify.display.smAndDown">
        <v-card>
          <v-toolbar color="green">
            <v-btn icon @click="toggleUpdateAll"><v-icon>mdi-close</v-icon></v-btn>
            <v-toolbar-title>Update all containers</v-toolbar-title>
          </v-toolbar>
          <v-card-text class="pt-4">
            <div class="mb-4 text-medium-emphasis">All the fields with data will be updated to all containers.</div>

            <div v-if="isRail" class="mb-4 grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-6">
              <div class="xl:col-span-6 font-bold">Rail form</div>
              <v-text-field v-model="massiveForm.rail_requested_date" density="compact" label="Rail requested date" type="date" />
              <v-text-field v-model="massiveForm.rail_assigned_date" density="compact" label="Rail assigned date" type="date" />
              <v-text-field v-model="massiveForm.rail_departure_date" density="compact" label="Rail departed date" type="date" />
              <v-text-field v-model="massiveForm.rail_train_number" density="compact" label="Rail transport number" />
              <v-autocomplete
                v-model="massiveForm.rail_ett"
                :items="etts"
                item-title="name"
                item-value="value"
                density="compact"
                label="ETT"
              />
              <v-text-field v-model="massiveForm.rail_arrival_date" type="date" density="compact" label="Arrival date" />
              <v-autocomplete
                v-model="massiveForm.rail_destination"
                :items="terminalDestinations"
                item-title="name"
                item-value="name"
                density="compact"
                label="Terminal destination"
                class="xl:col-span-2"
              />
            </div>

            <div v-if="isTruck" class="mb-4 grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-4">
              <div class="xl:col-span-4 font-bold">Truck form</div>
              <v-text-field v-model="massiveForm.truck_requested_date" density="compact" label="Truck requested date" type="date" />
              <v-text-field v-model="massiveForm.truck_assigned_date" density="compact" label="Truck assigned date" type="date" />
              <v-text-field v-model="massiveForm.truck_departure_date" density="compact" label="Truck departed date" type="date" />
              <div>
                <AGlobalSearch
                  :onSearch="searchSuppliers"
                  v-model="search.supplier"
                  validate-key="massive_supplier_id"
                  label="Supplier"
                  :return-object="true"
                  @update:model-value="setSupplierTruckInformationMassive"
                />
                <v-combobox
                  v-model="massiveForm.truck_truck_number"
                  :items="truckInformationCatalog"
                  :loading="truckInformationLoading"
                  item-title="name"
                  item-value="name"
                  density="compact"
                  label="Truck information"
                  hint="Type at least 3 characters to search"
                  @update:search="onTruckInformationSearch"
                />
              </div>
              <div class="xl:col-span-4">
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
              <v-textarea
                v-model="massiveForm.truck_full_address"
                density="compact"
                label="Full address (delivery details)"
                :rows="2"
                class="xl:col-span-4"
              />
            </div>

            <div class="grid grid-cols-1 gap-2 md:grid-cols-2">
              <v-text-field
                v-model="massiveForm.customer_delivery_date"
                density="compact"
                label="Date of delivery to the customer"
                type="date"
              />
              <v-textarea v-model="massiveForm.note" density="compact" label="Note" :rows="2" hide-details />
            </div>
          </v-card-text>
          <v-card-actions class="justify-end">
            <v-btn color="secondary" @click="toggleUpdateAll">Cancel</v-btn>
            <v-btn color="primary" @click="updateAllContainers">Update all containers</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog v-model="editContainerDialog" max-width="1100" persistent scrollable :fullscreen="$vuetify.display.smAndDown">
        <v-card v-if="currentEditContainer">
          <v-toolbar color="primary">
            <v-btn icon @click="clearEditContainers"><v-icon>mdi-close</v-icon></v-btn>
            <v-toolbar-title>Edit container #{{ currentEditContainer.container_number }}</v-toolbar-title>
          </v-toolbar>
          <v-card-text class="pt-4">
            <div v-if="isRail" class="mb-4 grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-6">
              <div class="xl:col-span-6 font-bold">Rail form</div>
              <v-text-field v-model="currentEditContainer.intermodal.rail_requested_date" density="compact" label="Rail requested date" type="date" />
              <v-text-field v-model="currentEditContainer.intermodal.rail_assigned_date" density="compact" label="Rail assigned date" type="date" />
              <v-text-field v-model="currentEditContainer.intermodal.rail_departure_date" density="compact" label="Rail departed date" type="date" />
              <v-text-field v-model="currentEditContainer.intermodal.rail_train_number" density="compact" label="Rail transport number" />
              <v-autocomplete
                v-model="currentEditContainer.intermodal.rail_ett"
                :items="etts"
                item-title="name"
                item-value="value"
                density="compact"
                label="ETT"
              />
              <v-text-field v-model="currentEditContainer.intermodal.rail_arrival_date" type="date" density="compact" label="Arrival date" />
              <v-autocomplete
                v-model="currentEditContainer.intermodal.rail_destination"
                :items="terminalDestinations"
                item-title="name"
                item-value="name"
                density="compact"
                label="Terminal destination"
                class="xl:col-span-2"
              />
            </div>

            <div v-if="isTruck" class="mb-4 grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-4">
              <div class="xl:col-span-4 font-bold">Truck form</div>
              <v-text-field v-model="currentEditContainer.intermodal.truck_requested_date" density="compact" label="Truck requested date" type="date" />
              <v-text-field v-model="currentEditContainer.intermodal.truck_assigned_date" density="compact" label="Truck assigned date" type="date" />
              <v-text-field v-model="currentEditContainer.intermodal.truck_departure_date" density="compact" label="Truck departed date" type="date" />
              <div>
                <AGlobalSearch
                  :onSearch="searchSuppliers"
                  v-model="search.supplier"
                  validate-key="supplier_id"
                  label="Supplier"
                  :return-object="true"
                  @update:model-value="(supplier) => setSupplierTruckInformation(supplier, currentEditContainer)"
                />
                <v-combobox
                  v-model="currentEditContainer.intermodal.truck_truck_number"
                  :items="truckInformationCatalog"
                  :loading="truckInformationLoading"
                  item-title="name"
                  item-value="name"
                  density="compact"
                  label="Truck information"
                  hint="Type at least 3 characters to search"
                  @update:search="onTruckInformationSearch"
                />
              </div>
              <div class="xl:col-span-4">
                <AGlobalSearch
                  :onSearch="searchDestinations"
                  v-model="search.destination"
                  validate-key="destination_id"
                  label="Destination (catalog)"
                  :return-object="true"
                  @update:model-value="(destination) => setDestinationTruckInformation(destination, currentEditContainer)"
                />
                <v-textarea
                  v-model="currentEditContainer.intermodal.destino_localidad"
                  density="compact"
                  label="Destino / Localidad"
                  :rows="2"
                  hide-details
                />
              </div>
              <v-textarea
                v-model="currentEditContainer.intermodal.truck_full_address"
                density="compact"
                label="Full address (delivery details)"
                :rows="2"
                hide-details
                class="xl:col-span-4"
              />
            </div>

            <div class="grid grid-cols-1 gap-2 md:grid-cols-2">
              <v-text-field
                v-model="currentEditContainer.intermodal.customer_delivery_date"
                density="compact"
                label="Date of delivery to the customer"
                type="date"
              />
              <v-textarea v-model="currentEditContainer.intermodal.note" density="compact" label="Note" :rows="2" hide-details />
            </div>
          </v-card-text>
          <v-card-actions class="justify-end">
            <v-btn color="secondary" @click="clearEditContainers">Cancel</v-btn>
            <v-btn color="primary" @click="saveContainer(currentEditContainer)">Save changes</v-btn>
            <v-btn color="red" @click="deleteContainer(currentEditContainer)">Delete intermodal</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
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

    <v-dialog v-model="railNoty.showForm.value" max-width="1100" persistent scrollable :fullscreen="$vuetify.display.smAndDown">
      <v-card>
        <v-toolbar color="purple">
          <v-btn icon @click="railNoty.closeRailNotyDialgo"><v-icon>mdi-close</v-icon></v-btn>
          <v-toolbar-title>Rail arrival notification form</v-toolbar-title>
        </v-toolbar>
        <v-card-text class="pt-4">
          <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
            <v-autocomplete
              v-model="railNoty.destination.value"
              :items="terminalDestinations"
              item-title="name"
              item-value="name"
              label="Destination"
              density="compact"
            />
            <v-checkbox v-model="railNoty.include_pdf.value" label="Include PDF in notification" />
            <v-textarea
              v-model="railNoty.emails.value"
              label="Customer emails"
              hint="Comma separated emails"
              density="compact"
              :rows="3"
              hide-details
              class="md:col-span-2"
            />
            <div class="md:col-span-2">
              <CustomerEmailsWidget
                :customer-id="referencia.consignee_id"
                :notifys="customerNotifys"
                @fetched-emails="railNoty.setEmails"
              />
            </div>
          </div>

          <v-alert class="mt-4" type="info" variant="tonal">
            Each selected container can keep or update its own arrival date. Notifications will be sent grouped by arrival date.
          </v-alert>

          <div class="mt-4 flex flex-wrap items-center gap-2">
            <div class="font-bold">Containers and arrival dates</div>
            <v-btn color="primary" size="x-small" @click="railNoty.selectAll">Select all</v-btn>
            <v-btn color="secondary" size="x-small" variant="tonal" @click="railNoty.clearSelection">Clear all</v-btn>
          </div>

          <div class="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
            <v-card v-for="container in railNoty.containers.value" :key="`rail-container-${container.id}`" variant="outlined">
              <v-card-text>
                <div class="flex items-start justify-between gap-3">
                  <div>
                    <div class="font-weight-medium">{{ container.container_number }}</div>
                    <div class="text-caption text-medium-emphasis">{{ container.container_type_name || '-' }}</div>
                  </div>
                  <v-checkbox v-model="container.rail_noty_selected" color="primary" hide-details />
                </div>

                <v-text-field
                  v-model="container.rail_arrival_date"
                  label="Arrival date"
                  density="compact"
                  type="date"
                  class="mt-2"
                />
                <div class="text-caption text-medium-emphasis">
                  Saved date: {{ container.original_rail_arrival_date || 'Not defined' }}
                </div>
              </v-card-text>
            </v-card>
          </div>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn color="red" @click="railNoty.closeRailNotyDialgo">Cancel</v-btn>
          <v-btn color="amber" @click="railNoty.sendRailNotification">Notify rail arrival</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script setup lang="ts">
import { mailNotifications, LIVERPOOL_MBL_CONSIGNEE_IDS } from '~/utils/data/systemData'
import { formatDateString } from '~/utils/formatters'
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

const intermodalEditableFields = [
  'rail_requested_date',
  'rail_assigned_date',
  'rail_departure_date',
  'rail_train_number',
  'rail_ett',
  'rail_destination',
  'rail_arrival_date',
  'truck_requested_date',
  'truck_assigned_date',
  'truck_departure_date',
  'truck_truck_number',
  'destino_localidad',
  'truck_full_address',
  'note',
  'customer_delivery_date',
] as const

const getEmptyMassiveForm = () => ({
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
  note: null,

  customer_delivery_date: null,
})

const search = reactive<any>({
  supplier: null,
  destination: null,
})

const showUpdateAll = ref<any>(false)
const editContainerDialog = ref(false)
const showGeneralEditor = ref(false)
const generalEditBackup = ref<any[]>([])
const expandedAddresses = ref<Record<number, boolean>>({})
const truckInformationCatalog = ref<any[]>([])
const truckInformationLoading = ref(false)

const showIntermodalInfo = ref(true)
const intermodalMode = ref<any>({
  intermodal: null,
  internal_transit: null,
})

const massiveForm = ref<any>(getEmptyMassiveForm())

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
  note: null,

  customer_delivery_date: null,

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

const currentEditContainer = computed(() => {
  return formEdit.value.containers[0] ?? null
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

const canSelectContainerForIntermodalNotification = (container: any) => {
  return canDoIntermodal.value && referencia.value.transportation_mode_id != null && Boolean(container?.intermodal)
}

const hasSelectedContainers = computed(() => {
  return referencia.value.containers.some((container: any) => Boolean(container.intermodal?.selected))
})

const countSelectedContainers = computed(() => {
  return referencia.value.containers.filter((container: any) => Boolean(container.intermodal?.selected)).length
})

const clearInternalTransit = () => {
  intermodalMode.value.internal_transit = null
}

const cloneContainers = (containers: any[] = []) => {
  return JSON.parse(JSON.stringify(containers))
}

const normalizeIntermodalFieldValue = (value: any) => {
  if (value == null || value === '') {
    return null
  }

  if (typeof value === 'object') {
    if ('name' in value && value.name != null) {
      return value.name
    }

    if ('value' in value && value.value != null) {
      return value.value
    }

    return null
  }

  return value
}

const getIntermodalPayload = (container: any) => {
  const intermodal = container?.intermodal ?? {}

  const payload = intermodalEditableFields.reduce((acc: any, field) => {
    acc[field] = normalizeIntermodalFieldValue(intermodal[field])
    return acc
  }, {})

  return {
    id: container.id,
    intermodal: payload,
  }
}

const getBackupContainerById = (id: number) => {
  return generalEditBackup.value.find((container: any) => container.id === id)
}

const hasContainerChanged = (container: any) => {
  const originalContainer = getBackupContainerById(container.id)

  if (!originalContainer) {
    return false
  }

  return JSON.stringify(getIntermodalPayload(container).intermodal) !== JSON.stringify(getIntermodalPayload(originalContainer).intermodal)
}

const startGeneralEdit = () => {
  clearEditContainers()
  showUpdateAll.value = false
  generalEditBackup.value = cloneContainers(referencia.value.containers)
  showGeneralEditor.value = true
}

const cancelGeneralEdit = () => {
  if (generalEditBackup.value.length > 0) {
    referencia.value.containers = cloneContainers(generalEditBackup.value)
  }

  generalEditBackup.value = []
  showGeneralEditor.value = false
}

const saveGeneralEdit = async () => {
  const changedContainers = referencia.value.containers.filter((container: any) => hasContainerChanged(container))

  if (changedContainers.length === 0) {
    snackbar.add({ type: 'info', text: 'No container changes to save' })
    cancelGeneralEdit()
    return
  }

  try {
    loadingStore.start()

    for (const container of changedContainers) {
      try {
        await $api.referencias.updateSeaImportIntermodalContainerById(props.id.toString(), getIntermodalPayload(container))
      } catch (error) {
        snackbar.add({
          type: 'error',
          text: `Error updating container ${container.container_number || container.id}`,
        })
        throw error
      }
    }

    snackbar.add({ type: 'success', text: 'General container changes saved' })
    showGeneralEditor.value = false
    generalEditBackup.value = []
    await getSeaImportDetails()
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const toggleUpdateAll = () => {
  clearEditContainers()
  showUpdateAll.value = !showUpdateAll.value
  massiveForm.value = getEmptyMassiveForm()
  search.supplier = null
  search.destination = null
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

const searchTruckInformationCatalog = _Debounce(async (searchValue: string) => {
  try {
    truckInformationLoading.value = true
    const response = await $api.referencias.searchSeaImportTruckInformationCatalog(searchValue)
    truckInformationCatalog.value = Array.isArray(response) ? response : (response?.data ?? [])
  } catch (error) {
    snackbar.add({
      type: 'error',
      text: 'Error fetching truck information catalog',
    })
  } finally {
    truckInformationLoading.value = false
  }
}, 400)

const onTruckInformationSearch = (value: string) => {
  const searchValue = (value ?? '').trim()

  if (searchValue.length < 3) {
    truckInformationCatalog.value = []
    return
  }

  searchTruckInformationCatalog(searchValue)
}

const setSupplierTruckInformation = (supplier: any, editContainer: any) => {
  if (supplier) {
    editContainer.intermodal.truck_truck_number = supplier.name
  }
}

const setDestinationTruckInformation = (destination: any, editContainer: any) => {
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
    if (canSelectContainerForIntermodalNotification(container)) {
      container.intermodal.selected = true
    }
  })
}

const clearSelection = () => {
  referencia.value.containers.forEach((container: any) => {
    if (container.intermodal) {
      container.intermodal.selected = false
    }
  })
}

const getIntermodalNotyColor = (type: string | null) => {
  return type === 'rail' ? 'purple' : 'green'
}

const getIntermodalNotyLabel = (type: string | null) => {
  if (type === 'rail') {
    return 'Rail arrival'
  }

  if (!type || type === 'intermodal') {
    return 'Intermodal update'
  }

  return `Intermodal ${type}`
}

const toggleAddress = (containerId: number) => {
  expandedAddresses.value[containerId] = !expandedAddresses.value[containerId]
}

const hasLongAddress = (address: string | null, maxLength = 48) => {
  return Boolean(address && address.length > maxLength)
}

const getShortAddress = (address: string | null, containerId?: number, maxLength = 48) => {
  if (!address) {
    return '-'
  }

  if (containerId != null && expandedAddresses.value[containerId]) {
    return address
  }

  if (address.length <= maxLength) {
    return address
  }

  return `${address.slice(0, maxLength)}...`
}

const editContainer = (container: any) => {
  formEdit.value.containers = []

  if (container.intermodal == null) {
    container.intermodal = { ...intermodalData }
  }

  formEdit.value.containers.push(JSON.parse(JSON.stringify(container)))
  showUpdateAll.value = false
  editContainerDialog.value = true
}

const clearEditContainers = () => {
  formEdit.value.containers = []
  editContainerDialog.value = false
}

const saveIntermodalInfo = async () => {
  try {
    loadingStore.start()
    await $api.referencias.updateSeaImportIntermodalById(props.id.toString(), intermodalMode.value)
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

const saveContainer = async (container: any) => {
  try {
    loadingStore.start()
    await $api.referencias.updateSeaImportIntermodalContainerById(props.id.toString(), getIntermodalPayload(container))
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
    await $api.referencias.deleteSeaImportIntermodalContainerById(props.id.toString(), { id: container.id })
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
  preintermodalNoty.value.emails = ''
}

const closePreintermodalNoty = () => {
  preintermodalNoty.value.show = false
  preintermodalNoty.value.emails = ''
}

const sendIntermodalNotification = async () => {
  try {
    const selectedContainers = referencia.value.containers
      .filter((container: any) => container.intermodal?.selected)
      .map((container: any) => ({
        id: container.id,
      }))

    if (selectedContainers.length === 0) {
      snackbar.add({ type: 'error', text: 'Select at least one container for the intermodal email' })
      return
    }

    loadingStore.start()

    const body = {
      emails: preintermodalNoty.value.emails || '',
      containers: selectedContainers,
    }

    await $api.referencias.sendSeaImportIntermodalNotifications(props.id.toString(), body)
    snackbar.add({ type: 'success', text: 'Intermodal notification sent successfully' })

    closePreintermodalNoty()
    clearSelection()
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

    response.referencia.containers.forEach((container: any) => {
      if (container.intermodal == null) {
        container.intermodal = {
          ...intermodalData,
          transport_mode_id: response.referencia.transportation_mode_id,
        }
      } else if (container.intermodal.transport_mode_id == null && response.referencia.transportation_mode_id != null) {
        container.intermodal.transport_mode_id = response.referencia.transportation_mode_id
      }

      container.intermodal.selected = false
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

const updateAllContainers = async () => {
  try {
    loadingStore.start()
    const body = {
      ...massiveForm.value,
    }

    for (const key in body) {
      if (body[key] == null || body[key] === '') {
        delete body[key]
      }
    }

    if (Object.keys(body).length === 0) {
      snackbar.add({ type: 'info', text: 'Add at least one field to update' })
      return
    }

    await $api.referencias.updateSeaImportIntermodalAllContainers(props.id.toString(), body)
    snackbar.add({ type: 'success', text: 'Containers information updated' })

    showUpdateAll.value = false
    massiveForm.value = getEmptyMassiveForm()
    await getSeaImportDetails()
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
  const destination = ref(null)
  const include_pdf = ref(false)
  const containers = ref<any[]>([])

  const getContainers = () => {
    return referencia.value.containers
      .filter((container: any) => container.intermodal?.transport_mode_id != null)
      .map((container: any) => ({
        id: container.id,
        container_number: container.container_number,
        container_type_name: container.container_type?.name || null,
        rail_arrival_date: container.intermodal?.rail_arrival_date || null,
        original_rail_arrival_date: container.intermodal?.rail_arrival_date || null,
        rail_noty_selected: false,
      }))
  }

  const openRailNotyDialog = () => {
    containers.value = getContainers()
    destination.value =
      referencia.value.containers.find((container: any) => container.intermodal?.rail_destination)?.intermodal?.rail_destination || null
    showForm.value = true
  }

  const selectAll = () => {
    containers.value.forEach((container: any) => {
      container.rail_noty_selected = true
    })
  }

  const clearSelection = () => {
    containers.value.forEach((container: any) => {
      container.rail_noty_selected = false
    })
  }

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

      if (!destination.value) {
        snackbar.add({ type: 'error', text: 'Destination is required' })
        return
      }

      const selectedContainers = containers.value.filter((container: any) => container.rail_noty_selected)

      if (selectedContainers.length === 0) {
        snackbar.add({ type: 'error', text: 'Select at least one container' })
        return
      }

      if (selectedContainers.some((container: any) => !container.rail_arrival_date)) {
        snackbar.add({ type: 'error', text: 'Every selected container must have an arrival date' })
        return
      }

      loadingStore.start()

      const groupedContainers = selectedContainers.reduce((acc: Record<string, number[]>, container: any) => {
        const key = container.rail_arrival_date
        if (!acc[key]) {
          acc[key] = []
        }
        acc[key].push(container.id)
        return acc
      }, {})

      for (const [arrivalDate, containerIds] of Object.entries(groupedContainers)) {
        await $api.referencias.sendIntermodalRailNoty(props.id.toString(), {
          emails: emails.value,
          include_pdf: include_pdf.value,
          arrival_date: arrivalDate,
          destination: destination.value,
          containers: containerIds,
          referencia_id: props.id,
        })
      }

      snackbar.add({ type: 'success', text: 'Rail notifications sent successfully' })
      closeRailNotyDialgo()
      await getSeaImportDetails()
    } catch (e) {
      console.error(e)
    } finally {
      setTimeout(() => {
        loadingStore.stop()
      }, 250)
    }
  }

  const closeRailNotyDialgo = () => {
    showForm.value = false
    destination.value = null
    emails.value = ''
    include_pdf.value = false
    containers.value = []
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
    destination,
    include_pdf,
    containers,
    openRailNotyDialog,
    selectAll,
    clearSelection,
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
