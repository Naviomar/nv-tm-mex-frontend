<template>
  <div>
    <div v-if="!hasDemurrageInitDay">
      <v-alert
        color="warning"
        icon="mdi-alert"
        outlined
        prominent
        text="Vessel / Voyage destination does not have demurrage init day."
      />
      <v-btn @click="router.back()" variant="outlined" size="small" class="my-4">Return</v-btn>
    </div>
    <div v-if="hasDemurrageInitDay">
      <div class="grid grid-cols-1 gap-4">
        <div>
          <v-card>
            <v-card-title>
              <div class="flex items-center gap-2">
                <v-icon>mdi-ship-wheel</v-icon>
                Ref #{{ referencia.reference_number }}
              </div>
            </v-card-title>
            <v-card-text>
              <v-btn
                :to="`/maritime/import/service-details-${referencia.id}`"
                variant="outlined"
                size="small"
                class="mb-4"
                ><v-icon>mdi-open-in-new</v-icon>View reference</v-btn
              >
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <div class="grid grid-cols-3 items-center gap-2">
                    <div>Line</div>
                    <div class="col-span-2 font-bold">{{ referencia.line?.name }}</div>
                    <div>Vessel</div>
                    <div class="col-span-2 font-bold">{{ referencia.vessel_departure?.name }}</div>
                    <div>Voyage destination</div>
                    <div class="col-span-2 font-bold">{{ referencia.voyage_discharge?.short_name }}</div>
                    <div>POL</div>
                    <div class="col-span-2 font-bold">{{ referencia.pol?.name }}</div>
                    <div>POD</div>
                    <div class="col-span-2 font-bold">{{ referencia.pod?.name }}</div>
                    <div>Consignee</div>
                    <div class="col-span-2 font-bold">{{ referencia.consignee?.name }}</div>
                    <div>ATA</div>
                    <div class="col-span-2 font-bold">{{ referencia.voyage_discharge?.arrival_date }}</div>
                    <div>Master BL(s)</div>
                    <div class="col-span-2 font-bold">
                      <v-chip
                        v-for="bl in referencia.master_bls"
                        :key="`ref-bl-${bl.id}`"
                        color="primary"
                        class="text-xs"
                        >{{ bl.name }} {{ bl.consignee_mbl?.name }}</v-chip
                      >
                    </div>
                    <div>Demurrage init day</div>
                    <div class="col-span-2">
                      <v-chip variant="flat" color="green" class="text-xs">{{
                        referencia.voyage_discharge?.init_demurrage_at
                      }}</v-chip>
                    </div>
                  </div>

                  <div class="mx-auto max-w-64 pt-4">
                    <AuthorizeProcessSmart
                      ref="authorizeProcess"
                      label="Request a discount"
                      :resource="authorizeResources.DemurrageDiscount.resource"
                      :resourceId="referencia.id"
                      :refresh="refreshAuthReqs"
                    >
                      <template #auth>
                        <v-btn color="error" size="small" @click="onDiscountClick">Set discount</v-btn>
                      </template>
                    </AuthorizeProcessSmart>
                  </div>
                </div>
                <div>
                  <v-card class="mb-4">
                    <v-card-title>
                      <div class="flex items-center gap-2">
                        <v-icon>mdi-apps</v-icon>
                        Actions
                      </div>
                    </v-card-title>
                    <v-card-text>
                      <div class="flex flex-col gap-4">
                        <v-btn color="primary" size="small" block @click="showSendDialog = !showSendDialog">
                          <v-icon>mdi-email-outline</v-icon>
                          Send email
                        </v-btn>

                        <PreviewDemurrageCut :referencia="referencia" />

                        <v-dialog v-model="showSendDialog" persistent max-width="600px">
                          <v-card>
                            <v-card-title>Ref#{{ referencia.reference_number }} Send demurrages cut</v-card-title>
                            <v-card-text>
                              <v-textarea v-model="form.emails" label="Email(s)" rows="5" />
                            </v-card-text>
                            <v-card-actions>
                              <v-btn @click="showSendDialog = false">Close</v-btn>
                              <v-btn color="primary" @click="sendEmailClick" :loading="loadingStore.loading"
                                >Send</v-btn
                              >
                            </v-card-actions>
                          </v-card>
                        </v-dialog>
                      </div>
                    </v-card-text>
                  </v-card>

                  <div class="grid grid-cols-1 py-4 px-4">
                    <v-expansion-panels class="mb-4">
                      <v-expansion-panel bg-color="lime-lighten-4">
                        <v-expansion-panel-title>
                          <div class="flex items-center gap-2">
                            <v-icon>mdi-note-edit-outline</v-icon> Demurrage Notes
                          </div>
                        </v-expansion-panel-title>
                        <v-expansion-panel-text>
                          <div class="grid grid-cols-3 gap-2">
                            <div class="font-bold">Date</div>
                            <div class="font-bold">User</div>
                            <div class="font-bold">Note</div>
                          </div>
                          <div v-for="(note, index) in referencia.demurrage_notes" :key="`ref-note-${index}`">
                            <div class="grid grid-cols-3 gap-2">
                              <div>
                                {{ formatDateString(note.created_at) }}
                              </div>
                              <div>
                                {{ note.creator?.name }}
                              </div>
                              <div>
                                {{ note.description }}
                              </div>
                            </div>
                          </div>
                        </v-expansion-panel-text>
                      </v-expansion-panel>
                    </v-expansion-panels>

                    <div>Add notes about demurrages for this reference</div>
                    <v-textarea v-model="form.notes" label="Demurrage notes" rows="3" />
                    <v-btn @click="saveNote" color="primary" class="-mt-4">Add note</v-btn>
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </div>
        <div>
          <v-card class="mb-4">
            <v-card-title>
              <div class="flex items-center gap-2">
                <v-icon>mdi-timer-outline</v-icon>
                Calculations
              </div>
            </v-card-title>
            <v-card-subtitle> Here you can view and update empty return date for this reference. </v-card-subtitle>
            <v-card-text>
              <div class="grid grid-cols-3 gap-2">
                <v-card elevation="4">
                  <v-card-item>
                    <v-card-title> {{ demurrageInitDate }} </v-card-title>
                    <v-card-subtitle>Fecha inicio de días libres (demurrages init day)</v-card-subtitle>
                  </v-card-item>
                </v-card>

                <v-card elevation="4">
                  <v-card-item>
                    <v-card-title> {{ referenceFreeDays }} day(s) </v-card-title>
                    <v-card-subtitle>
                      <div class="flex items-center gap-2">
                        <div>
                          <v-icon color="green" @click="showEditFreeDays = !showEditFreeDays"
                            >mdi-pencil-outline</v-icon
                          >
                        </div>
                        <div>días libres en referencia</div>
                      </div>
                    </v-card-subtitle>
                  </v-card-item>
                  <v-card-text v-show="showEditFreeDays">
                    <v-text-field v-model="form.freeDays" label="Días libres" density="compact" />
                    <v-btn @click="saveFreeDays" size="small" color="primary">Actualizar días libres</v-btn>
                  </v-card-text>
                </v-card>

                <!-- Region Free Days Config Card -->
                <v-card elevation="4" :color="freeDaysConfig?.needs_sync ? 'amber-lighten-4' : ''">
                  <v-card-item>
                    <v-card-title class="flex items-center gap-2">
                      <v-icon size="small">mdi-map-marker</v-icon>
                      {{ freeDaysConfig?.region?.name || 'Sin región' }}
                    </v-card-title>
                    <v-card-subtitle>
                      <div v-if="freeDaysConfig?.has_region">
                        <span class="font-bold">Configurado:</span> {{ freeDaysConfig?.configured_free_days }} días
                        <span class="text-xs">({{ getSourceLabel(freeDaysConfig?.source) }})</span>
                      </div>
                      <div v-else class="text-orange-600">
                        <v-icon size="small" color="warning">mdi-alert</v-icon>
                        Sin región asignada - días libres = 0 para demoras
                      </div>
                    </v-card-subtitle>
                  </v-card-item>
                  <v-card-text v-if="freeDaysConfig?.needs_sync">
                    <v-alert type="warning" density="compact" class="mb-2">
                      <div class="text-xs">
                        Los días libres del servicio ({{ freeDaysConfig?.current_free_days }}) 
                        difieren de la configuración del cliente ({{ freeDaysConfig?.configured_free_days }}).
                      </div>
                    </v-alert>
                    <v-btn @click="syncFreeDays" size="small" color="primary" block>
                      <v-icon size="small" class="mr-1">mdi-sync</v-icon>
                      Sincronizar a {{ freeDaysConfig?.configured_free_days }} días
                    </v-btn>
                  </v-card-text>
                </v-card>
              </div>

              <div class="grid grid-cols-2 gap-2 mb-4">
                <div>
                  <v-text-field
                    v-model="form.containers_start_date"
                    label="Fecha de inicio de contenedores"
                    density="compact"
                    type="date"
                    class="mt-4"
                  />
                  <v-btn color="primary" class="-mt-4" size="small" @click="setStartDateToAll">
                    Set start date to all
                  </v-btn>
                </div>
                <div>
                  <v-text-field
                    v-model="form.containers_empty_return_date"
                    label="Fecha de retorno de contenedores vacíos"
                    density="compact"
                    type="date"
                    class="mt-4"
                  />
                  <v-btn color="primary" class="-mt-4" size="small" @click="setEmptyDateToAll">
                    Set return date to all
                  </v-btn>
                </div>
              </div>
              <v-btn color="primary" size="small" variant="outlined" class="mb-4" @click="selectAllContainersDays"
                >Select all</v-btn
              >
              <v-table density="compact" class="py-4 text-nowrap">
                <thead>
                  <tr>
                    <th class="w-8"></th>
                    <th>Container</th>
                    <th>Type</th>
                    <th>Cálculo</th>
                    <th>Start date</th>
                    <th>Return empty</th>
                    <th>Start & end date with free days</th>
                    <th class="w-24">Days with empty current date</th>
                    <th class="w-32">
                      <v-tooltip location="top" open-delay="300">
                        <template #activator="{ props }">
                          <span v-bind="props">
                            Rate 1
                            <v-icon size="small" class="ml-1">mdi-information-outline</v-icon>
                          </span>
                        </template>
                        <span>
                          Solo se puede modificar si tienes el permiso <b>{{ permissions.DemurragesUpdateSellRates }}</b
                          >. Si el campo está deshabilitado, solicita acceso a tu administrador.
                        </span>
                      </v-tooltip>
                    </th>
                    <th class="w-32">
                      <v-tooltip location="top" open-delay="300">
                        <template #activator="{ props }">
                          <span v-bind="props">
                            Rate 2
                            <v-icon size="small" class="ml-1">mdi-information-outline</v-icon>
                          </span>
                        </template>
                        <span>
                          Solo se puede modificar si tienes el permiso <b>{{ permissions.DemurragesUpdateSellRates }}</b
                          >. Si el campo está deshabilitado, solicita acceso a tu administrador.
                        </span>
                      </v-tooltip>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in referenciaContainersWithDemurrages" :key="`ref-days-cont-${index}`">
                    <td>
                      <v-checkbox v-model="item.selected_days" color="primary" hide-details />
                    </td>
                    <td>{{ item.container_number }}</td>
                    <td>{{ item.container_type?.name }}</td>
                    <td>
                      <v-chip variant="outlined" size="small">
                        {{ item.demurrage?.is_parcial ? 'Parcial' : 'Total' }}
                      </v-chip>
                    </td>
                    <td>
                      <v-text-field
                        v-model="item.demurrage.start_date"
                        type="date"
                        density="compact"
                        label="Start date"
                        @change="getContainerRatesByChange(item)"
                      />
                      <div class="-mt-4">Start date: {{ formatDateOnlyString(item.demurrage?.start_date) }}</div>
                    </td>
                    <td>
                      <v-text-field
                        v-model="item.demurrage.end_date"
                        type="date"
                        density="compact"
                        label="Return empty date"
                      />
                      <div class="-mt-4">Empty date: {{ formatDateOnlyString(item.demurrage?.end_date) }}</div>
                    </td>
                    <td>
                      <div class="flex gap-1 items-center justify-center">
                        <div>
                          <v-chip variant="outlined" size="small">
                            {{ formatDateOnlyString(item.demurrage?.start_date) }}
                          </v-chip>
                        </div>
                        <div>to</div>
                        <div>
                          <v-chip variant="outlined" size="small">
                            {{ formatDateOnlyString(freeDaysUntilDate(item)) }}
                          </v-chip>
                        </div>
                      </div>
                    </td>
                    <td>
                      <v-chip variant="outlined" :color="remainingDaysUntilEmptyDate(item) > 0 ? 'red' : 'green'">
                        {{ remainingDaysUntilEmptyDate(item) }}
                      </v-chip>
                    </td>
                    <td>
                      <v-text-field
                        v-model="item.demurrage.rate_1"
                        density="compact"
                        type="number"
                        dense="compact"
                        class="min-w-32"
                        :readonly="!canUpdateRates"
                      />
                    </td>
                    <td>
                      <v-text-field
                        v-model="item.demurrage.rate_2"
                        density="compact"
                        type="number"
                        dense="compact"
                        class="min-w-32"
                        :readonly="!canUpdateRates"
                      />
                    </td>
                  </tr>
                </tbody>
              </v-table>
              <p>Every calculation made updates the corresponding demurrage charges for the reference.</p>

              <div v-if="hasContainerDaysSelected">
                <div class="grid grid-cols-3 p-4">
                  <div class="col-span-2 mb-4">
                    <div class="grid grid-cols-6 gap-2 border font-bold">
                      <div>Container selected</div>
                      <div class="text-right">Rate 1</div>
                      <div class="text-right">Rate 2</div>
                      <div class="text-right">IVA</div>
                      <div class="text-right">Subtotal</div>
                      <div class="text-right">Total calculated</div>
                    </div>
                    <div v-for="(container, index) in containersSelected" :key="`ref-cont-cal-${index}`">
                      <div class="grid grid-cols-6 gap-2 border">
                        <div>{{ container.container_number }} - {{ container.container_type?.name }}</div>
                        <div class="text-right">{{ formatToCurrency(getContainerTotalRate1(container)) }}</div>
                        <div class="text-right">{{ formatToCurrency(getContainerTotalRate2(container)) }}</div>
                        <div class="text-right">{{ formatToCurrency(getContainerTotalRateIva(container)) }}</div>
                        <div class="text-right">{{ formatToCurrency(getContainerSubtotalRate(container)) }}</div>
                        <div class="text-right">{{ formatToCurrency(getContainerTotalRate(container)) }}</div>
                      </div>
                    </div>
                    <div
                      v-if="form.apply_discount"
                      v-for="(discount, index) in availableDiscounts"
                      :key="`ref-disc-demurrage-${index}`"
                    >
                      <div class="grid grid-cols-6 gap-2 border bg-red-300 dark:bg-red-800">
                        <div>Discount</div>
                        <div class="text-right">-</div>
                        <div class="text-right">-</div>
                        <div class="text-right">-</div>
                        <div class="text-right">
                          {{ discount.amount > 0 ? formatToCurrency(discount.amount) : discount.percentage + '%' }}
                        </div>
                        <div class="text-right">
                          {{ discount.amount > 0 ? formatToCurrency(discount.amount) : discount.percentage + '%' }}
                        </div>
                      </div>
                    </div>

                    <div class="py-4">
                      <v-autocomplete
                        v-model="form.type_calculation"
                        :items="['Total', 'Parcial']"
                        label="Calculation type"
                        density="compact"
                      />
                      
                      <!-- Mostrar advertencia y solicitud de autorización si se intenta cambiar de Total a Parcial -->
                      <div v-if="requiresRevertToPartialAuth" class="mb-4">
                        <v-alert type="warning" density="compact" class="mb-2">
                          <div class="text-sm">
                            Some selected containers are already totaled.
                            Authorization is required to return to partial.
                          </div>
                        </v-alert>
                        <AuthorizeProcessSmart
                          ref="authorizeRevertToPartial"
                          label="Request authorization to return to partial"
                          :resource="authorizeResources.DemurrageRevertToPartial.resource"
                          :resourceId="referencia.id"
                          :refresh="refreshAuthReqs"
                        >
                          <template #auth>
                            <v-chip color="success" size="small">
                              <v-icon>mdi-check</v-icon> Authorized - proceed
                            </v-chip>
                          </template>
                        </AuthorizeProcessSmart>
                      </div>
                      <v-checkbox
                        v-model="form.is_con_iva"
                        label="+ IVA (uncheck if demurrages do not have IVA)"
                        density="compact"
                        hide-details
                      />

                      <div v-if="hasAvailableDiscount">
                        <v-checkbox
                          v-model="form.apply_discount"
                          color="amber"
                          label="Apply available discount"
                          density="compact"
                          hide-details
                        />
                      </div>

                      <v-btn color="primary" @click="updateContainersDemurrages" size="small" class="mb-4">
                        Calculate & create demurrages to selected containers
                      </v-btn>
                    </div>
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>

          <!-- Rate Overrides Section -->
          <ReferenceRateOverrideManager
            :referencia-id="props.id"
            :active-override="referencia.rate_override"
            @refresh="getReferencia(props.id)"
          />

          <v-card class="mb-4">
            <v-card-title>
              <div class="flex items-center gap-2">
                <v-icon>mdi-sale-outline</v-icon>
                Discounts
              </div>
            </v-card-title>
            <v-card-text>
              <v-table density="compact">
                <thead>
                  <tr>
                    <th>Discount (% / amount)</th>
                    <th>Reason</th>
                    <th>Applied?</th>
                    <th>Created at</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(discount, index) in referencia.demurrage_discounts" :key="`ref-discount-${index}`">
                    <td>
                      <div v-if="discount.amount > 0">
                        <v-icon>mdi-currency-usd</v-icon>{{ formatToCurrency(discount.amount) }}
                      </div>
                      <div v-if="discount.percentage > 0"><v-icon>mdi-percent</v-icon>{{ discount.percentage }}%</div>
                    </td>
                    <td>{{ discount.comments }}</td>
                    <td>{{ discount.is_applied == 1 ? 'Yes' : 'Pending' }}</td>
                    <td>
                      <UserInfoBadge :item="discount">
                        {{ formatDateString(discount.created_at) }}
                      </UserInfoBadge>
                    </td>
                  </tr>
                </tbody>
              </v-table>
            </v-card-text>
          </v-card>

          <v-card class="mb-4">
            <v-card-title>
              <div class="flex items-center gap-2">
                <v-icon>mdi-calculator</v-icon>
                Past calculations
              </div>
            </v-card-title>
            <v-card-text>
              <div class="font-bold py-4">Past calculation(s)</div>
              <v-expansion-panels>
                <v-expansion-panel v-for="(container, index) in containerCalcs" :key="`panel-cont-${index}`">
                  <v-expansion-panel-title>
                    <div class="flex items-center gap-2">
                      <div class="font-bold">
                        {{ container.container_number }} - {{ container.container_type?.name }} ➡️
                      </div>
                      <PartialLastCalcShow :container="container" />
                    </div>
                  </v-expansion-panel-title>
                  <v-expansion-panel-text>
                    <div class="grid grid-cols-10 gap-2 border font-bold bg-neutral-200 dark:bg-neutral-600">
                      <div>Start date</div>
                      <div>End date</div>
                      <div>Free days</div>
                      <div>Rate 1</div>
                      <div>Rate 2</div>
                      <div>Subtotal</div>
                      <div>IVA</div>
                      <div>Total calculated</div>
                      <div>Created at</div>
                      <div>User</div>
                    </div>
                    <div
                      v-for="(calc, index2) in container.demurrage?.calculations || []"
                      :key="`ref-cont-cal-${index}-${index2}`"
                    >
                      <div class="grid grid-cols-10 gap-2 border">
                        <div>{{ formatDateOnlyString(calc.start_date) }}</div>
                        <div>{{ formatDateOnlyString(calc.end_date) }}</div>
                        <div>{{ calc.free_days }}</div>
                        <div>{{ formatToCurrency(calc.rate_1) }}</div>
                        <div>{{ formatToCurrency(calc.rate_2) }}</div>
                        <div>
                          <div class="flex flex-col justify-center items-center gap-0">
                            {{ formatToCurrency(calc.amount) }}
                            <div v-if="calc.discount > 0">
                              <v-chip color="red" class="text-xs" size="small" variant="outlined"
                                ><v-icon>mdi-sale-outline</v-icon>-{{ formatToCurrency(calc.discount) }}</v-chip
                              >
                            </div>
                          </div>
                        </div>
                        <div>{{ formatToCurrency(calc.amount_iva) }}</div>
                        <div>{{ formatToCurrency(parseFloat(calc.amount) + parseFloat(calc.amount_iva)) }}</div>
                        <div>{{ formatDateString(calc.created_at) }}</div>
                        <div>{{ calc.creator?.name }}</div>
                      </div>
                    </div>
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>
            </v-card-text>
          </v-card>

          <v-card class="mb-4">
            <v-card-title>
              <div class="flex items-center gap-2">
                <v-icon>mdi-currency-usd</v-icon>
                Line cost(s)
              </div>
            </v-card-title>
            <v-card-subtitle> Update/Add line payment for each container. </v-card-subtitle>
            <v-card-text>
              <v-table density="compact" class="py-4">
                <thead>
                  <tr>
                    <th>Container</th>
                    <th>Type</th>
                    <th>Current cost</th>
                    <th>Update cost</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(container, index) in referenciaContainersWithDemurrages"
                    :key="`line-demurrage-cont-${index}`"
                  >
                    <td>{{ container.container_number }}</td>
                    <td>{{ container.container_type?.name }}</td>
                    <td>
                      <div class="grid grid-cols-3 gap-0 border p-2">
                        <div>Subtotal</div>
                        <div>IVA</div>
                        <div>Total (USD)</div>
                        <div>{{ formatToCurrency(container.demurrage?.line_cost || 0) }}</div>
                        <div>{{ formatToCurrency(getLineDemurrageIva(container)) }}</div>
                        <div>{{ formatToCurrency(getLineDemurrageTotal(container)) }}</div>
                      </div>
                    </td>

                    <td>
                      <div class="flex flex-col gap-2">
                        <div class="grid grid-cols-3 gap-4">
                          <div class="col-span-2">
                            <v-text-field
                              v-model="container.demurrage.line_cost"
                              density="compact"
                              prepend-inner-icon="mdi-currency-usd"
                              type="number"
                              hide-details
                            />
                          </div>
                          <div class="col-span-1">
                            <v-checkbox
                              v-model="container.demurrage.line_has_iva"
                              :false-value="0"
                              :true-value="1"
                              label="+ IVA"
                              density="compact"
                              hide-details
                            />
                          </div>
                        </div>
                        <v-btn color="primary" size="small" class="-mt-4" @click="saveLinePayment(container)"
                          >Save</v-btn
                        >
                      </div>
                    </td>
                  </tr>
                </tbody>
              </v-table>
            </v-card-text>
          </v-card>

          <v-card class="mb-4">
            <v-card-title>
              <div class="flex justify-between">
                <div class="flex items-center gap-2">
                  <v-icon size="x-small">mdi-format-list-bulleted</v-icon>
                  <div>Logs</div>
                </div>
                <div>
                  <v-btn icon size="x-small" @click="showLogs = !showLogs" color="blue-grey-darken-2">
                    <v-icon v-if="showLogs">mdi-eye-outline</v-icon>
                    <v-icon v-if="!showLogs">mdi-eye-closed</v-icon>
                  </v-btn>
                </div>
              </div>
            </v-card-title>
            <v-card-text v-if="showLogs">
              <div class="grid grid-cols-6 gap-2">
                <div class="font-bold">Date</div>
                <div class="font-bold">User</div>
                <div class="font-bold">Action</div>
                <div class="col-span-3 font-bold">Description</div>
              </div>
              <div v-for="(log, index) in referencia.demurrage_logs" :key="`ref-log-${index}`">
                <div class="grid grid-cols-6 gap-2">
                  <div>
                    {{ formatDateString(log.created_at) }}
                  </div>
                  <div>
                    {{ log.creator?.name }}
                  </div>
                  <div>
                    {{ log.action }}
                  </div>
                  <div class="col-span-3">
                    {{ log.description }}
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </div>
      </div>
    </div>
    <v-dialog v-model="showDiscountDialog" max-width="400">
      <v-card>
        <v-card-title>Demurrages discount</v-card-title>
        <v-card-text>
          <div>Please complete the form.</div>

          <!-- Toggle between Amount or Percentage -->
          <v-radio-group v-model="formDiscount.type" row>
            <v-radio label="Amount (USD)" value="amount"></v-radio>
            <v-radio label="Percentage (%)" value="percentage"></v-radio>
          </v-radio-group>

          <!-- Amount Field -->
          <v-text-field
            v-if="formDiscount.type === 'amount'"
            v-model="formDiscount.amount"
            label="Amount (USD)"
            hint="Please provide the amount of the discount"
            prepend-inner-icon="mdi-currency-usd"
            type="number"
            clearable
          />

          <!-- Percentage Field -->
          <v-text-field
            v-if="formDiscount.type === 'percentage'"
            v-model="formDiscount.percentage"
            label="Percentage (%)"
            hint="Please provide the percentage of the discount"
            prepend-inner-icon="mdi-percent"
            type="number"
            min="1"
            max="99"
            clearable
          />

          <!-- Reason Field -->
          <v-textarea
            v-model="formDiscount.reason"
            label="Reason"
            hint="Please provide a reason for the discount"
            counter
            rows="3"
            clearable
          ></v-textarea>
        </v-card-text>
        <v-card-actions>
          <div class="w-full flex justify-around">
            <v-btn @click="showDiscountDialog = !showDiscountDialog">No, go back</v-btn>
            <v-btn color="error" @click="requestDiscountConfirm">Yes, request a discount</v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script setup lang="ts">
import { permissions } from '@/utils/data/system'
import moment from 'moment-timezone'
import { authorizeResources } from '~/utils/data/system'
const { $api, $notifications } = useNuxtApp()
const snackbar = useSnackbar()
const confirm = $notifications.useConfirm()
const router = useRouter()
const darkMode = useDarkMode()
const loadingStore = useLoadingStore()

const { hasPermission } = useCheckUser()

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
})

const authorizeProcess = ref<any>(null)
const authorizeRevertToPartial = ref<any>(null)

const form = reactive({
  notes: '',
  freeDays: '',
  containers_start_date: '',
  containers_empty_return_date: '',
  type_calculation: '',
  is_con_iva: true,
  apply_discount: false,
  emails: '',
})

const formDiscount = reactive({
  type: 'amount',
  amount: 0,
  percentage: 0,
  reason: '',
})

const showRefDetail = ref(false)
const showSendDialog = ref(false)
const showLogs = ref(false)
const showEditFreeDays = ref(false)
const referencia = ref<any>({})
const containerCalcs = ref<any>([])
const showDiscountDialog = ref(false)
const refreshAuthReqs = ref(false)
const freeDaysConfig = ref<any>(null)

const canUpdateRates = computed(() => {
  return hasPermission(permissions.DemurragesUpdateSellRates)
})

const hasDemurrageInitDay = computed(() => {
  return referencia.value?.voyage_discharge?.init_demurrage_at
})

const demurrageInitDate = computed(() => {
  return referencia.value?.voyage_discharge?.init_demurrage_at
})

const referenceFreeDays = computed(() => {
  return referencia.value?.demurrage_days || 0
})

const hasAvailableDiscount = computed(() => {
  return referencia.value?.demurrage_discounts.some((discount: any) => discount.is_applied == 0)
})

const availableDiscounts = computed(() => {
  return referencia.value?.demurrage_discounts.filter((discount: any) => discount.is_applied == 0)
})

// Computed para verificar si se requiere autorización para regresar de Total a Parcial
const requiresRevertToPartialAuth = computed(() => {
  // Si el usuario tiene el permiso para saltarse la autorización, no mostrar
  if (hasPermission('maritime-demurrages-bypass-revert-authorization')) {
    return false
  }
  
  // Solo mostrar si el tipo de cálculo seleccionado es Parcial
  if (form.type_calculation !== 'Parcial') {
    return false
  }
  
  // Verificar si algún contenedor seleccionado ya está en Total (is_parcial = 0)
  const selectedContainers = referencia.value?.containers?.filter((container: any) => container.selected_days) || []
  return selectedContainers.some((container: any) => container.demurrage?.is_parcial === 0)
})

const getContainerTotalLineCost = (container: any) => {
  if (container.demurrage.line_iva > 0) {
    return parseFloat(container.demurrage.line_cost) + parseFloat(container.demurrage.line_iva)
  }
  if (container.demurrage.line_has_iva) {
    return parseFloat(container.demurrage.line_cost) * 1.16
  }
  return parseFloat(container.demurrage.line_cost)
}

const onDiscountClick = async () => {
  showDiscountDialog.value = !showDiscountDialog.value
}

const remainingFreeDays = (container: any) => {
  const date = moment.tz(container.demurrage?.start_date, 'America/Mexico_City')
  date.add(referenceFreeDays.value, 'days')
  const today = moment.tz(new Date(), 'America/Mexico_City')
  const diff = date.diff(today, 'days')
  const days = Math.ceil(diff / (1000 * 3600 * 24))
  return days
}

const getLineDemurrageIva = (container: any) => {
  if (container.demurrage.line_has_iva) {
    return parseFloat(container.demurrage.line_cost || 0) * 0.16
  }
  return 0
}

const getLineDemurrageTotal = (container: any) => {
  return parseFloat(container.demurrage.line_cost || 0) + getLineDemurrageIva(container)
}

const remainingDaysUntilEmptyDate = (container: any) => {
  const emptyDate = moment.tz(container.demurrage?.end_date || new Date(), 'America/Mexico_City')
  // if emptyDate is lessthan free DaysUntilDate, return 0
  if (emptyDate < freeDaysUntilDate(container)) {
    return 0
  }

  // get the difference between emptyDate and free DaysUntilDate
  const diffDays = emptyDate.diff(freeDaysUntilDate(container), 'days')
  return diffDays
}

const freeDaysUntilDate = (container: any) => {
  const date = moment.tz(container.demurrage?.start_date, 'America/Mexico_City')
  date.add(referenceFreeDays.value - 1, 'days')
  return date
}

const setEmptyDateToAll = () => {
  referencia.value.containers.forEach((container: any) => {
    container.demurrage.end_date = form.containers_empty_return_date
  })
}

const setStartDateToAll = () => {
  referencia.value.containers.forEach((container: any) => {
    container.demurrage.start_date = form.containers_start_date
  })
  // call getContainerRatesByChange for all containers
  const ids = referencia.value.containers.map((container: any) => container.id)
  refreshContainerRates(ids, form.containers_start_date)
}

const hasContainerDaysSelected = computed(() => {
  return referencia.value.containers.some((container: any) => container.selected_days)
})

const containersSelected = computed(() => {
  return referencia.value.containers.filter((container: any) => container.selected_days)
})

const selectAllContainersDays = () => {
  referencia.value.containers.forEach((container: any) => {
    container.selected_days = !container.selected_days
  })
}

const getContainerTotalRate1 = (container: any) => {
  let days = remainingDaysUntilEmptyDate(container)
  // only first 3 days multiply by rate 1
  if (days > 3) {
    days = 3
  }
  return parseFloat(container.demurrage.rate_1) * days
}

const getContainerTotalRate2 = (container: any) => {
  let days = remainingDaysUntilEmptyDate(container)
  // only after 3 days multiply by rate 2
  if (days > 3) {
    days -= 3
  } else {
    days = 0
  }
  return parseFloat(container.demurrage.rate_2) * days
}

const getContainerTotalRateIva = (container: any) => {
  if (form.is_con_iva) {
    return (getContainerTotalRate1(container) + getContainerTotalRate2(container)) * 0.16
  }
  return 0
}

const getContainerSubtotalRate = (container: any) => {
  return getContainerTotalRate1(container) + getContainerTotalRate2(container)
}

const getContainerTotalRate = (container: any) => {
  if (form.is_con_iva) {
    return (getContainerTotalRate1(container) + getContainerTotalRate2(container)) * 1.16
  }
  return getContainerTotalRate1(container) + getContainerTotalRate2(container)
}

const referenciaContainersWithDemurrages = computed(() => {
  return referencia.value.containers.filter((container: any) => container.demurrage)
})

const requestDiscountConfirm = async () => {
  try {
    if (formDiscount.type === 'amount' && (!formDiscount.amount || formDiscount.amount <= 0)) {
      snackbar.add({ type: 'error', text: 'Amount is required.' })
      return
    }
    if (formDiscount.type === 'percentage' && (formDiscount.percentage < 1 || formDiscount.percentage > 99)) {
      snackbar.add({ type: 'error', text: 'Please enter a percentage between 1 and 99.' })
      return
    }
    if (!formDiscount.reason) {
      snackbar.add({ type: 'error', text: 'Reason is required.' })
      return
    }

    loadingStore.loading = true
    const body = {
      referencia_id: referencia.value.id,
      amount: formDiscount.amount,
      percentage: formDiscount.percentage,
      reason: formDiscount.reason,
    }
    const response = (await $api.demurrages.requestDiscount(referencia.value.id, body)) as any
    snackbar.add({ type: 'success', text: 'Discount requested successfully.' })
    showDiscountDialog.value = false
    refreshAuthReqs.value = true
    await getReferencia(props.id)
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const getContainerRatesByChange = (container: any) => {
  refreshContainerRates([container.id], container.demurrage.start_date)
}

const refreshContainerRates = async (ids: string[], start_date: string) => {
  try {
    loadingStore.loading = true
    const body = {
      reference_container_ids: ids,
      start_date: start_date,
    }
    const response = (await $api.demurrages.refreshContainerRates(referencia.value.id, body)) as any
    // response is an array of containers with id, rate_1_effective and rate_2_effective
    // find in referencia.value.containers by id and update rate_1 and rate_2
    response.forEach((updatedContainer: any) => {
      const container = referencia.value.containers.find((c: any) => c.id === updatedContainer.id)
      if (container) {
        container.demurrage.rate_1 = updatedContainer.rate_1_effective || 185
        container.demurrage.rate_2 = updatedContainer.rate_2_effective || 185
      }
    })
    snackbar.add({ type: 'success', text: 'Container rates refreshed successfully.' })
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const getReferencia = async (voyageDest: any) => {
  try {
    loadingStore.loading = true
    const response = (await $api.demurrages.getSeaImportById(props.id)) as any
    referencia.value = response
    containerCalcs.value = JSON.parse(JSON.stringify(referencia.value.containers))

    referencia.value.containers.forEach((container: any) => {
      container.demurrage.line_has_iva = container.demurrage.line_iva > 0 ? 1 : 0
    })

    // Load configured free days
    await getConfiguredFreeDays()

    // si se mueve, hay que actualizar PartialLastCalcShow.vue ya que obtiene el ultimo calculo
    // containerCalcs.value.forEach((container: any) => {
    //   container.demurrage?.calculations.sort((a: any, b: any) => {
    //     return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    //   })
    // })
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const getConfiguredFreeDays = async () => {
  try {
    const response = await $api.demurrages.getConfiguredFreeDays(props.id)
    freeDaysConfig.value = response
  } catch (e) {
    console.error(e)
  }
}

const getSourceLabel = (source: string) => {
  const labels: Record<string, string> = {
    'region': 'por región',
    'consignee_default': 'global del cliente',
    'consignee_default_no_region': 'global - sin región',
    'none': 'sin configuración',
  }
  return labels[source] || source
}

const syncFreeDays = async () => {
  try {
    loadingStore.loading = true
    const response = await $api.demurrages.syncFreeDaysFromConfig(props.id) as any
    snackbar.add({ 
      type: 'success', 
      text: `Días libres sincronizados: ${response.old_free_days} → ${response.new_free_days} (${response.source})` 
    })
    await getReferencia(props.id)
  } catch (e: any) {
    console.error(e)
    snackbar.add({ type: 'error', text: e.message || 'Error al sincronizar días libres' })
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const saveFreeDays = async () => {
  try {
    loadingStore.loading = true
    const body = {
      freeDays: form.freeDays,
    }
    const response = (await $api.demurrages.saveReferenciaFreeDays(props.id, body)) as any
    snackbar.add({ type: 'success', text: 'Free days updated successfully.' })
    showEditFreeDays.value = false
    form.freeDays = ''
    await getReferencia(props.id)
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const updateContainersDemurrages = async () => {
  if (!form.type_calculation) {
    snackbar.add({ type: 'error', text: 'Calculation type is required.' })
    return
  }
  try {
    loadingStore.loading = true
    const body = {
      containers: referencia.value.containers.filter((container: any) => container.selected_days),
      type: form.type_calculation,
      is_con_iva: form.is_con_iva,
      apply_discount: form.apply_discount,
    }
    const response = (await $api.demurrages.saveContainersCalculation(props.id, body)) as any
    snackbar.add({ type: 'success', text: 'Containers calculation saved successfully.' })
    await getReferencia(props.id)
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const saveLinePayment = async (container: any) => {
  try {
    loadingStore.loading = true
    const body = {
      demurrage_id: container.demurrage.id,
      reference_container_id: container.id,
      line_cost: container.demurrage.line_cost,
      line_has_iva: container.demurrage.line_has_iva,
    }
    const response = (await $api.demurrages.saveLinePayment(props.id, body)) as any
    snackbar.add({ type: 'success', text: 'Line payment updated successfully.' })
    await getReferencia(props.id)
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const sendEmailClick = async () => {
  try {
    loadingStore.loading = true
    const body = {
      emails: form.emails,
    }
    const response = (await $api.demurrages.sendEmailDemurrageCut(props.id, body)) as any
    snackbar.add({ type: 'success', text: response.message })
    form.emails = ''
    showSendDialog.value = false

    await getReferencia(props.id)
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const saveNote = async () => {
  try {
    loadingStore.loading = true
    const body = {
      notes: form.notes,
    }
    const response = (await $api.demurrages.saveDemurrageNote(props.id, body)) as any
    snackbar.add({ type: 'success', text: 'Note saved successfully.' })
    form.notes = ''
    await getReferencia(props.id)
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

await getReferencia(props.id)
</script>
