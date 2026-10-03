<template>
  <div>
    <div class="flex items-center gap-2 mb-3">
      <v-icon color="primary">mdi-file-cog-outline</v-icon>
      <h3 class="text-lg font-bold">Configure supplier CFDI</h3>
    </div>

    <!-- 1. Invoice summary -->
    <SupplierCfdiSummary
      :supplier-cfdi="supplierCfdi"
      :available-balance="availableBalance"
      can-resync-cap-limit
      @sat-validated="onSatValidated"
      @resync-cap-limit="reSyncSupplierCapLimit"
    >
      <div class="flex flex-col gap-2">
        <v-alert v-if="supplierCfdi.sat_status === 'Cancelado'" type="error" variant="flat" density="compact">
          <div class="font-bold">Este CFDI está CANCELADO en SAT</div>
          <div class="text-sm">No se puede crear una solicitud de pago para este CFDI. Por favor contacte al proveedor.</div>
        </v-alert>

        <v-alert v-if="hasParent" type="info" title="Reissued invoice" variant="tonal" density="compact">
          This invoice is linked / reissued from
          <NuxtLink :to="`/invoices/suppliers/cfdis/view-${supplierCfdi.parent_deleted?.id}`" target="_blank" class="underline">
            <v-icon>mdi-open-in-new</v-icon> {{ supplierCfdi.parent_deleted?.serie_folio }}
          </NuxtLink>
        </v-alert>

        <v-alert v-if="isDeleted" type="error" title="Invoice is cancelled" density="compact">
          This invoice is cancelled and linked to
          <NuxtLink
            v-for="(children, index) in supplierCfdi.children_deleted"
            :key="`children-${index}`"
            :to="`/invoices/suppliers/cfdis/view-${children.id}`"
            target="_blank"
            class="underline"
          >
            <v-icon>mdi-open-in-new</v-icon> {{ children.serie_folio }}
          </NuxtLink>
        </v-alert>

        <v-alert v-if="canMarkAsFreeFormat" type="info" variant="tonal" density="compact">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div class="font-bold">¿Marcar como formato libre?</div>
              <div class="text-sm">
                Las facturas de formato libre no requieren desglose a referencias y se pueden pagar directamente.
              </div>
            </div>
            <v-btn color="deep-purple" size="small" prepend-icon="mdi-tag-outline" :loading="loadingFreeFormat" @click="toggleFreeFormat(true)">
              Marcar como formato libre
            </v-btn>
          </div>
        </v-alert>

        <v-alert v-if="supplierCfdi.is_free_format && !canRevertFreeFormat" type="info" variant="tonal" density="compact" color="deep-purple">
          <div class="font-bold">Este CFDI está marcado como Formato Libre</div>
          <div class="text-sm">Puede crear una solicitud de pago directamente sin desglosar conceptos.</div>
        </v-alert>

        <v-alert v-if="canRevertFreeFormat" type="warning" variant="tonal" density="compact">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div class="font-bold">Revertir formato libre</div>
              <div class="text-sm">Esta factura está marcada como formato libre. Puedes revertirla a formato normal.</div>
            </div>
            <v-btn color="orange" size="small" prepend-icon="mdi-undo" :loading="loadingFreeFormat" @click="toggleFreeFormat(false)">
              Revertir a normal
            </v-btn>
          </div>
        </v-alert>
      </div>
    </SupplierCfdiSummary>

    <!-- Free format charges -->
    <SupplierCfdiSection
      v-if="supplierCfdi.is_free_format"
      title="Cargos de formato libre"
      subtitle="Se pagan directamente, sin desglose a referencias. Las notas son obligatorias."
      icon="mdi-tag-outline"
      color="deep-purple"
    >
      <v-table v-if="supplierCfdi.cfdi_charges?.length > 0" density="compact" class="mb-4">
        <thead>
          <tr>
            <th class="w-24">Acciones</th>
            <th>Concepto</th>
            <th>Monto</th>
            <th>Notas</th>
            <th>Creado por</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="charge in supplierCfdi.cfdi_charges" :key="charge.id">
            <td>
              <v-btn icon="mdi-pencil" size="x-small" color="primary" variant="tonal" class="mr-1" @click="editCfdiCharge(charge)" />
              <v-btn icon="mdi-delete" size="x-small" color="error" variant="tonal" @click="confirmDeleteCfdiCharge(charge)" />
            </td>
            <td>{{ charge.charge?.name || 'Sin concepto' }}</td>
            <td>{{ getCurrencyName(charge.currency_id) }} {{ formatToCurrency(charge.amount) }}</td>
            <td class="text-xs">{{ charge.notes }}</td>
            <td>{{ charge.creator?.name }}</td>
          </tr>
        </tbody>
      </v-table>

      <div class="rounded tm-border p-4">
        <div class="font-bold mb-2">{{ editingCharge ? 'Editar cargo' : 'Agregar nuevo cargo' }}</div>
        <v-row>
          <v-col cols="12" md="4">
            <v-autocomplete
              v-model="newCfdiCharge.charge_id"
              :items="catalogs.free_format_charges || []"
              item-title="name"
              item-value="id"
              label="Concepto (opcional)"
              density="compact"
              clearable
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-text-field
              v-model.number="newCfdiCharge.amount"
              type="number"
              label="Monto *"
              density="compact"
              :prefix="getCurrencyName(supplierCfdi.currency_id)"
              :error-messages="chargeErrors.amount"
            />
          </v-col>
          <v-col cols="12" md="5">
            <v-combobox
              v-model="newCfdiCharge.notes"
              :items="catalogs.previous_notes || []"
              label="Notas (obligatorio) *"
              density="compact"
              clearable
              :error-messages="chargeErrors.notes"
            />
          </v-col>
        </v-row>
        <div class="flex gap-2">
          <v-btn color="deep-purple" size="small" :prepend-icon="editingCharge ? 'mdi-content-save' : 'mdi-plus'" :loading="loadingCharge" @click="saveCfdiCharge">
            {{ editingCharge ? 'Guardar cambios' : 'Agregar cargo' }}
          </v-btn>
          <v-btn v-if="editingCharge" color="grey" size="small" variant="outlined" @click="cancelEditCharge">Cancelar</v-btn>
        </div>
      </div>
    </SupplierCfdiSection>

    <template v-if="!supplierCfdi.is_free_format">
      <!-- 2. Registered concepts -->
      <SupplierCfdiSection
        step="1"
        title="Concepts registered in this invoice"
        subtitle="Breakdown already saved: each concept is a cost of one reference."
        icon="mdi-format-list-checks"
        color="teal"
      >
        <SupplierCfdiConceptsTable
          :invoices="supplierCfdi.invoices"
          :currency-id="supplierCfdi.currency_id"
          :usd-rates="supplierCfdi.usd_rates"
          deletable
          @delete="confirmDeleteSupInvoice"
        />

        <div v-if="supplierCfdi.line_containers?.length > 0" class="mt-4">
          <div class="font-bold py-2 flex items-center gap-2">
            <v-icon size="small" color="indigo">mdi-train-car-container</v-icon>
            Containers assigned for line payment
          </div>
          <v-alert type="info" density="compact" variant="tonal" class="mb-2 text-xs">
            These containers are not a supplier cost: the line cost is taken from the demurrages/detentions module and
            paid through its line payment request.
          </v-alert>
          <v-table density="compact">
            <thead>
              <tr>
                <th class="w-14">Actions</th>
                <th>Service Ref#</th>
                <th>Container</th>
                <th>Concept</th>
                <th>Amount</th>
                <th>Assigned by</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="lc in supplierCfdi.line_containers" :key="`line-container-${lc.id}`">
                <td>
                  <v-btn
                    v-if="!hasLinkWithDemurrageAndDetentions"
                    color="error"
                    icon="mdi-delete"
                    size="x-small"
                    variant="tonal"
                    @click="confirmRemoveLineContainer(lc)"
                  />
                </td>
                <td>{{ lc.referencia?.reference_number }}</td>
                <td class="font-mono">{{ lc.reference_container?.container_number }}</td>
                <td>{{ lc.charge?.name }}</td>
                <td>{{ getCurrencyName(lc.currency_id) }} {{ formatToCurrency(lc.amount) }}</td>
                <td>{{ lc.creator?.name }}</td>
              </tr>
            </tbody>
          </v-table>
        </div>
      </SupplierCfdiSection>

      <!-- 3. Add concepts -->
      <SupplierCfdiSection
        step="2"
        title="Add concepts to the invoice"
        subtitle="Find the reference(s), capture the charge and link it to the sell concept it covers."
        icon="mdi-playlist-plus"
        color="primary"
      >
        <template #actions>
          <v-chip :color="availableBalance > 0.01 ? 'warning' : 'success'" variant="tonal" size="small">
            Available: {{ formatToCurrency(availableBalance) }} {{ cfdiCurrencyName }}
          </v-chip>
        </template>

        <v-alert v-if="!canAddMoreSupplierPayConcepts" type="success" variant="tonal" density="compact" class="mb-2">
          La factura no se puede modificar: el monto total ya se desglosó o no es un CFDI de tipo ingreso/egreso.
        </v-alert>

        <v-alert v-if="hasLinkWithDemurrageAndDetentions" type="warning" density="compact" color="amber" class="mb-2">
          This invoice has links with a request payment for demurrage / detentions. Please remove them before adding
          more concepts.
        </v-alert>

        <template v-if="canAddMoreSupplierPayConcepts && !hasLinkWithDemurrageAndDetentions">
          <!-- A. Find references -->
          <div class="step-label"><span class="step-badge">A</span> Find reference(s)</div>
          <SearchGlobalServicesGrouped @update="setServicios" />

          <!-- B. Capture charge -->
          <template v-if="hasServiciosFound">
            <div class="step-label mt-5">
              <span class="step-badge">B</span> Capture the charge
              <v-chip size="x-small" variant="tonal" class="ml-2">{{ getServiciosTypeName }} · {{ countServiciosFound }} found</v-chip>
            </div>

            <div class="grid grid-cols-12 gap-4">
              <div class="col-span-12 lg:col-span-8 rounded-lg tm-border p-4">
                <div class="grid grid-cols-12 gap-3">
                  <div class="col-span-12 md:col-span-7">
                    <v-autocomplete
                      v-model="newConcept.service"
                      :items="serviciosFound.services"
                      item-title="reference_number"
                      return-object
                      label="Service Ref# *"
                      density="compact"
                      variant="outlined"
                      multiple
                      chips
                      closable-chips
                      :hint="serviceHint"
                      persistent-hint
                    >
                      <template #append-inner>
                        <v-btn
                          v-if="serviciosFound.services.length > 1"
                          size="x-small"
                          variant="tonal"
                          color="primary"
                          @click.stop="selectAllServices"
                        >
                          All
                        </v-btn>
                      </template>
                    </v-autocomplete>
                  </div>
                  <div class="col-span-12 md:col-span-5">
                    <v-autocomplete
                      v-model="newConcept.charge_id"
                      :items="conceptOptions"
                      item-title="name"
                      item-value="id"
                      label="Concept *"
                      density="compact"
                      variant="outlined"
                      hint="Concept the supplier is charging"
                      persistent-hint
                    />
                  </div>

                  <template v-if="!isLineConcept">
                    <div class="col-span-12 md:col-span-5">
                      <v-text-field
                        v-model.number="newConcept.amount"
                        type="number"
                        label="Amount per reference (before taxes) *"
                        density="compact"
                        variant="outlined"
                        :prefix="cfdiCurrencyName"
                        :hint="amountUsdHint"
                        persistent-hint
                      >
                        <template #append-inner>
                          <v-btn size="x-small" variant="tonal" color="primary" @click.stop="setMaxAmountAvailable">Max</v-btn>
                        </template>
                      </v-text-field>
                    </div>
                    <div class="col-span-6 md:col-span-2 flex items-center">
                      <v-switch v-model="newConcept.is_con_iva" color="green" label="IVA 16%" density="compact" hide-details inset />
                    </div>
                    <div class="col-span-6 md:col-span-3">
                      <v-combobox
                        v-model="newConcept.ret_iva_perc"
                        :items="[0, 4, 6, 10]"
                        label="Ret. IVA"
                        density="compact"
                        variant="outlined"
                        suffix="%"
                        hide-details
                      />
                    </div>
                    <div class="col-span-6 md:col-span-2 flex items-center">
                      <v-switch v-model="newConcept.is_ret_isr" color="red" label="Ret. ISR 10%" density="compact" hide-details inset />
                    </div>
                  </template>
                </div>

                <v-expansion-panels v-if="!isLineConcept" variant="accordion" class="mt-4">
                  <v-expansion-panel>
                    <v-expansion-panel-title class="text-sm">
                      <v-icon size="small" class="mr-2">mdi-calculator-variant-outline</v-icon> IVA calculator
                    </v-expansion-panel-title>
                    <v-expansion-panel-text>
                      <div class="grid grid-cols-12 gap-3 items-center">
                        <div class="col-span-12 md:col-span-5">
                          <v-radio-group v-model="calcIvaMode" density="compact" hide-details>
                            <v-radio label="Monto + IVA" value="masIva" />
                            <v-radio label="El precio ya incluye IVA" value="sinIva" />
                          </v-radio-group>
                        </div>
                        <div class="col-span-12 md:col-span-3">
                          <v-text-field v-model.number="calcMonto" label="Cantidad" type="number" density="compact" variant="outlined" hide-details min="0" />
                        </div>
                        <div class="col-span-12 md:col-span-4 text-sm">
                          <div class="flex justify-between"><span>Sin IVA</span><b>{{ formatToCurrency(calcMontoSinIva) }}</b></div>
                          <div class="flex justify-between"><span>IVA 16%</span><b>{{ formatToCurrency(calcIva) }}</b></div>
                          <div class="flex justify-between"><span>Con IVA</span><b>{{ formatToCurrency(calcTotalConIva) }}</b></div>
                          <v-btn size="x-small" color="primary" variant="tonal" class="mt-1" block @click="useCalculatorAmount">
                            Use {{ formatToCurrency(calcMontoSinIva) }} as amount
                          </v-btn>
                        </div>
                      </div>
                    </v-expansion-panel-text>
                  </v-expansion-panel>
                </v-expansion-panels>
              </div>

              <!-- Live total -->
              <div v-if="!isLineConcept" class="col-span-12 lg:col-span-4">
                <div class="rounded-lg tm-highlight-warning p-4 h-full flex flex-col">
                  <div class="text-xs uppercase tracking-wide text-medium-emphasis mb-2">Concept total</div>
                  <div class="text-sm flex flex-col gap-1">
                    <div class="flex justify-between"><span>Amount</span><span>{{ formatToCurrency(newConceptBreakdown.amount) }}</span></div>
                    <div v-if="newConceptBreakdown.iva" class="flex justify-between text-success"><span>+ IVA</span><span>{{ formatToCurrency(newConceptBreakdown.iva) }}</span></div>
                    <div v-if="newConceptBreakdown.retIva" class="flex justify-between text-error"><span>- Ret. IVA</span><span>{{ formatToCurrency(newConceptBreakdown.retIva) }}</span></div>
                    <div v-if="newConceptBreakdown.retIsr" class="flex justify-between text-error"><span>- Ret. ISR</span><span>{{ formatToCurrency(newConceptBreakdown.retIsr) }}</span></div>
                    <v-divider class="my-1" />
                    <div class="flex justify-between font-medium"><span>Per reference</span><span>{{ formatToCurrency(newConceptBreakdown.perService) }}</span></div>
                    <div class="flex justify-between text-medium-emphasis"><span>× references</span><span>{{ selectedServicesCount }}</span></div>
                  </div>
                  <div class="mt-2 text-2xl font-bold">{{ formatToCurrency(newConceptTotalAmount) }} <small class="text-sm">{{ cfdiCurrencyName }}</small></div>
                  <div v-if="!isCfdiUsd" class="text-xs text-medium-emphasis">
                    ≈ {{ formatToCurrency(toUsd(newConceptTotalAmount, supplierCfdi.currency_id)) }} USD · {{ rateLabel(supplierCfdi.currency_id) }}
                  </div>
                  <div class="text-xs mt-1" :class="remainingAfterConcept < -0.01 ? 'text-error font-bold' : 'text-medium-emphasis'">
                    Remaining in invoice after this: {{ formatToCurrency(remainingAfterConcept) }}
                  </div>
                  <v-spacer />
                  <v-btn
                    color="primary"
                    class="mt-4"
                    block
                    prepend-icon="mdi-link-variant"
                    :disabled="!canContinueConcept"
                    @click="addConcept"
                  >
                    Continue: link sell concepts
                  </v-btn>
                </div>
              </div>
            </div>

            <SupplierCfdiLineContainersPicker
              v-if="isLineConcept"
              :supplier-cfdi-id="supplierCfdi.id"
              :charge-id="newConcept.charge_id"
              :line-type="lineType!"
              :referencia-ids="pickerReferenciaIds"
              :available-balance="availableBalance"
              :currency-id="supplierCfdi.currency_id"
              @assigned="onLineContainersAssigned"
            />
            <v-alert v-if="isLineConcept && pickerReferenciaIds.length === 0" type="info" density="compact" variant="tonal" class="mt-2">
              Line payment concepts only apply to maritime references.
            </v-alert>
          </template>
        </template>

        <!-- C. Pending to save -->
        <template v-if="form.concepts.length > 0">
          <div class="step-label mt-5"><span class="step-badge">C</span> Review and save</div>
          <v-table density="compact" class="rounded tm-border">
            <thead>
              <tr>
                <th class="w-12"></th>
                <th>Service Ref#</th>
                <th>Concept</th>
                <th class="text-right">Amount / ref.</th>
                <th>Taxes</th>
                <th class="text-right">Total</th>
                <th>Linked to sell</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(concept, index) in form.concepts" :key="`concept-${index}`">
                <td>
                  <v-btn color="error" icon="mdi-delete" size="x-small" variant="tonal" @click="removeConcept(concept, index)" />
                </td>
                <td>
                  <div class="flex flex-wrap gap-1">
                    <v-chip v-for="service in concept.service" :key="`svc-${index}-${service.id}`" size="x-small" variant="tonal">
                      {{ service.reference_number }}
                    </v-chip>
                  </div>
                </td>
                <td>{{ getChargeName(concept.charge_id) }}</td>
                <td class="text-right whitespace-nowrap">{{ formatToCurrency(concept.amount) }} {{ getCurrencyName(concept.currency_id) }}</td>
                <td>
                  <div class="flex flex-wrap gap-1">
                    <v-chip v-if="concept.is_con_iva" size="x-small" color="green" variant="tonal">+IVA</v-chip>
                    <v-chip v-if="Number(concept.ret_iva_perc)" size="x-small" color="red" variant="tonal">-Ret IVA {{ concept.ret_iva_perc }}%</v-chip>
                    <v-chip v-if="concept.is_ret_isr" size="x-small" color="red" variant="tonal">-Ret ISR</v-chip>
                  </div>
                </td>
                <td class="text-right font-bold whitespace-nowrap">{{ formatToCurrency(conceptGrandTotal(concept)) }}</td>
                <td>
                  <div class="flex flex-wrap gap-1">
                    <v-chip
                      v-for="(sellConcept, sIndex) in concept.sell_concepts"
                      :key="`sell-concept-${index}-${sIndex}`"
                      size="x-small"
                      :color="sellConcept.class_name?.includes('FfNote') ? 'orange-darken-2' : 'primary'"
                      variant="tonal"
                    >
                      {{ sellConcept.charge?.name }} · {{ getCurrencyName(sellConcept.currency_id) }} {{ formatToCurrency(sellConcept.amount) }}
                    </v-chip>
                    <v-chip v-if="!concept.sell_concepts?.length" size="x-small" color="grey" variant="outlined">Without link</v-chip>
                  </div>
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="font-bold tm-row-muted">
                <td colspan="5" class="text-right">Total to save</td>
                <td class="text-right whitespace-nowrap">{{ formatToCurrency(draftTotal) }} {{ cfdiCurrencyName }}</td>
                <td></td>
              </tr>
            </tfoot>
          </v-table>
          <div class="flex justify-end mt-3">
            <v-btn color="success" prepend-icon="mdi-content-save" @click="saveCfdiChanges">
              Save {{ form.concepts.length }} concept(s)
            </v-btn>
          </div>
        </template>
      </SupplierCfdiSection>
    </template>

    <SupplierCfdiNotesForm :supplierCfdi="supplierCfdi" />

    <SupplierConceptVsSellProfitDialog
      :supplierConcept="dialogVsSellProfit"
      :charges="catalogs.charges"
      :usd-rates="supplierCfdi.usd_rates"
      @add-concept="addValidatedConcept"
    />
  </div>
</template>
<script setup lang="ts">
import { currencies } from '~/utils/data/systemData'
import { permissions } from '~/utils/data/system'
const { $api, $notifications } = useNuxtApp()
const confirm = $notifications.useConfirm()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()
const router = useRouter()
const darkMode = useDarkMode()
const supplierProvision = useSupplierProvisionStore()
const { hasPermission } = useCheckUser()

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
})

const supplierCfdi = ref<any>({})
const serviciosFound = ref<any>({ serviceType: null, services: [] })

const catalogs = ref<any>({
  charges: [],
  suppliers: [],
})

const newConcept = ref<any>({
  service_type: null,
  service: null,
  amount: 0,
  currency_id: null,
  is_con_iva: false,
  ret_iva_perc: 0,
  is_ret_isr: false,
})

const form = ref<any>({
  supplier_id: null,
  concepts: [],
})

const dialogVsSellProfit = ref<any>({
  show: false,
  concept: null,
})

const calcIvaMode = ref<'masIva' | 'sinIva'>('masIva')
const calcMonto = ref<number>(0)
const showCalc = ref<boolean>(true)
const loadingFreeFormat = ref<boolean>(false)
const loadingCharge = ref<boolean>(false)
const editingCharge = ref<any>(null)

const newCfdiCharge = ref<any>({
  charge_id: null,
  amount: 0,
  notes: '',
})

const chargeErrors = ref<any>({
  amount: [],
  notes: [],
})

const calcMontoSinIva = computed(() => {
  if (calcIvaMode.value === 'masIva') {
    return calcMonto.value
  }
  // si ya incluye IVA, monto / 1.16
  return Math.round((calcMonto.value / 1.16) * 100) / 100
})

const calcIva = computed(() => {
  if (calcIvaMode.value === 'masIva') {
    return Math.round(calcMonto.value * 0.16 * 100) / 100
  }
  // si ya incluye IVA, monto - montoSinIva
  return Math.round((calcMonto.value - calcMontoSinIva.value) * 100) / 100
})

const calcTotalConIva = computed(() => {
  if (calcIvaMode.value === 'masIva') {
    return Math.round(calcMonto.value * 1.16 * 100) / 100
  }
  // si ya incluye IVA, es el monto original
  return calcMonto.value
})

const isDeleted = computed(() => {
  return !!supplierCfdi.value.deleted_at
})

const hasParent = computed(() => {
  return !!supplierCfdi.value.parent_deleted
})

const getServiciosTypeName = computed(() => {
  if (serviciosFound.value.serviceType) {
    if (serviciosFound.value.serviceType === 'M') {
      return 'Maritime'
    }
    if (serviciosFound.value.serviceType === 'A') {
      return 'Air'
    }
  }
  return 'Unkown service'
})

const hasServiciosFound = computed(() => {
  return serviciosFound.value.services.length > 0
})

const countServiciosFound = computed(() => {
  return serviciosFound.value.services.length || 0
})

const serviceTypes = computed(() => {
  return [
    { name: 'Import maritime', value: 'IM' },
    { name: 'Export maritime', value: 'EM' },
    { name: 'Import air', value: 'IA' },
    { name: 'Export air', value: 'EA' },
  ]
})

const amountProvisioned = computed(() => {
  if (supplierCfdi.value.should_apply_cap_limit) {
    return parseFloat(supplierCfdi.value.cap_limit)
  }
  return parseFloat(supplierCfdi.value.amount_provisioned)
})

const { toUsd, rateLabel } = useCfdiUsdRates(() => supplierCfdi.value.usd_rates)

const cfdiCurrencyName = computed(() => getCurrencyName(supplierCfdi.value.currency_id) || '')
const isCfdiUsd = computed(() => Number(supplierCfdi.value.currency_id) === 2)

// Each selected reference generates its own supplier invoice row with the same amount.
const conceptGrandTotal = (concept: any) => calcTotalWithTaxes(concept) * (concept.service?.length || 1)

const draftTotal = computed(() =>
  form.value.concepts.reduce((acc: number, concept: any) => acc + conceptGrandTotal(concept), 0),
)

const isAmountGreaterThanProvisioned = computed(() => draftTotal.value - amountProvisioned.value > 0.01)

const selectedServicesCount = computed(() => newConcept.value.service?.length || 0)

const serviceHint = computed(() =>
  selectedServicesCount.value > 1
    ? `The amount is charged to each of the ${selectedServicesCount.value} references`
    : 'Reference that receives the cost',
)

const amountUsdHint = computed(() => {
  if (isCfdiUsd.value || !newConcept.value.amount) return 'Amount without IVA / retentions'
  return `≈ ${formatToCurrency(toUsd(newConcept.value.amount, supplierCfdi.value.currency_id))} USD (${rateLabel(supplierCfdi.value.currency_id)}, CFDI date)`
})

const newConceptBreakdown = computed(() => {
  const roundToTwo = (value: number) => Math.round(value * 100) / 100
  const amount = parseFloat(newConcept.value.amount) || 0
  const iva = newConcept.value.is_con_iva ? roundToTwo(amount * 0.16) : 0
  const retIva = Number(newConcept.value.ret_iva_perc) ? roundToTwo(amount * (Number(newConcept.value.ret_iva_perc) / 100)) : 0
  const retIsr = newConcept.value.is_ret_isr ? roundToTwo(amount * 0.1) : 0
  return { amount, iva, retIva, retIsr, perService: roundToTwo(amount + iva - retIva - retIsr) }
})

const remainingAfterConcept = computed(() => Math.round((availableBalance.value - newConceptTotalAmount.value) * 100) / 100)

const canContinueConcept = computed(
  () => selectedServicesCount.value > 0 && !!newConcept.value.charge_id && Number(newConcept.value.amount) > 0,
)

const useCalculatorAmount = () => {
  newConcept.value.amount = calcMontoSinIva.value
  if (calcIvaMode.value === 'sinIva' || calcIva.value > 0) newConcept.value.is_con_iva = true
}

const emptyConcept = () => ({
  service_type: null,
  // With a single reference found, it is preselected
  service: serviciosFound.value.services.length === 1 ? [...serviciosFound.value.services] : null,
  charge_id: null,
  amount: 0,
  currency_id: supplierCfdi.value.currency_id,
  is_con_iva: false,
  ret_iva_perc: 0,
  is_ret_isr: false,
})

const getLinkName = (link: any) => {
  if (link.chargeable_type.includes('Charge')) {
    return link.chargeable?.charge?.name
  }
  if (link.chargeable_type.includes('FfNote')) {
    return `F.F. Note #${link.chargeable_id} From TM Debit`
  }
  return 'Unknown link name'
}

// charge_id => 'demurrage' | 'detention'
const lineChargeTypes = computed<Record<string, string>>(() => catalogs.value.line_charges || {})

const lineType = computed<'demurrage' | 'detention' | null>(
  () => (lineChargeTypes.value[newConcept.value.charge_id] as any) || null,
)

const isLineConcept = computed(() => lineType.value !== null)

// Line payment concepts cannot be mixed with regular supplier concepts in the same invoice
const conceptOptions = computed(() => {
  const charges = catalogs.value.charges || []
  const assigned = supplierCfdi.value.line_containers || []
  if (assigned.length > 0) {
    const assignedType = assigned[0].type
    return charges.filter((c: any) => lineChargeTypes.value[c.id] === assignedType)
  }
  if (supplierCfdi.value.invoices?.length > 0 || form.value.concepts.length > 0) {
    return charges.filter((c: any) => !lineChargeTypes.value[c.id])
  }
  return charges
})

const pickerReferenciaIds = computed<number[]>(() => {
  if (serviciosFound.value.serviceType !== 'M') return []
  const services = newConcept.value.service?.length ? newConcept.value.service : serviciosFound.value.services
  return services.map((s: any) => s.id)
})

const assignedLineTotal = computed(() =>
  (supplierCfdi.value.line_containers || []).reduce((acc: number, lc: any) => acc + parseFloat(lc.amount || 0), 0),
)

const onLineContainersAssigned = async () => {
  newConcept.value.charge_id = null
  await getData()
}

const confirmRemoveLineContainer = async (lineContainer: any) => {
  const result = await confirm({
    title: 'Are you sure?',
    confirmationText: 'Yes, remove',
    content: `Remove container ${lineContainer.reference_container?.container_number} from this invoice?`,
    dialogProps: { persistent: true, maxWidth: 500 },
    confirmationButtonProps: { color: 'error' },
  })
  if (!result) return
  try {
    loadingStore.start()
    await $api.suppliers.removeLineContainer(supplierCfdi.value.id.toString(), lineContainer.id.toString())
    snackbar.add({ type: 'success', text: 'Container removed from invoice' })
    await getData()
  } catch (e: any) {
    console.error(e)
    snackbar.add({ type: 'error', text: e?.data?.message || 'Error removing container' })
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const availableBalance = computed(() => {
  if (supplierCfdi.value.should_apply_cap_limit) {
    return parseFloat(supplierCfdi.value.cap_limit)
  }
  const total = amountProvisioned.value - assignedLineTotal.value - draftTotal.value
  // return rounded to 2 decimals
  return Math.round((total + Number.EPSILON) * 100) / 100
})

const canAddMoreSupplierPayConcepts = computed(() => {
  return (
    availableBalance.value > 0 &&
    (supplierCfdi.value.tipo_comprobante === 'I' || supplierCfdi.value.tipo_comprobante === 'E')
  )
})

const hasLinkWithDemurrageAndDetentions = computed(() => {
  // if in supplierCfdi has length > 0 in reqDemurrages or reqDetentions
  return supplierCfdi.value.req_demurrages?.length > 0 || supplierCfdi.value.req_detentions?.length > 0
})

// Computed para verificar si se puede marcar como formato libre
const canMarkAsFreeFormat = computed(() => {
  // Se puede marcar como formato libre si:
  // 1. No tiene invoices (desglose)
  // 2. No está ya marcado como formato libre
  // 3. Es un CFDI de tipo ingreso (I) o egreso (E)
  // 4. No está eliminado
  // 5. El usuario tiene el permiso correspondiente
  return (
    hasPermission(permissions.MarkSupplierCfdiAsFreeFormat) &&
    !supplierCfdi.value.is_free_format &&
    supplierCfdi.value.invoices?.length === 0 &&
    !supplierCfdi.value.line_containers?.length &&
    (supplierCfdi.value.tipo_comprobante === 'I' || supplierCfdi.value.tipo_comprobante === 'E') &&
    !supplierCfdi.value.deleted_at
  )
})

// Computed para verificar si se puede revertir formato libre
const canRevertFreeFormat = computed(() => {
  return (
    hasPermission(permissions.RevertSupplierCfdiFromFreeFormat) &&
    supplierCfdi.value.is_free_format &&
    !supplierCfdi.value.requested_payment
  )
})

const getChargeName = (id: number) => {
  return catalogs.value.charges.find((charge: any) => charge.id === id)?.name
}

const getCurrencyName = (id: number) => {
  return currencies.find((currency) => currency.id === id)?.name
}

// Max amount (before taxes) per reference that still fits in the invoice balance.
const setMaxAmountAvailable = () => {
  const services = selectedServicesCount.value || 1
  const ivaFactor =
    1 +
    (newConcept.value.is_con_iva ? 0.16 : 0) -
    (Number(newConcept.value.ret_iva_perc) || 0) / 100 -
    (newConcept.value.is_ret_isr ? 0.1 : 0)
  const amount = Math.floor((availableBalance.value / services / (ivaFactor || 1)) * 100) / 100
  newConcept.value.amount = amount
  calcMonto.value = amount
}

const addConcept = () => {
  if (newConcept.value.amount <= 0) {
    snackbar.add({ type: 'warning', text: 'Amount must be greater than 0' })
    return
  }
  if (!newConcept.value.service?.length || !newConcept.value.charge_id) {
    snackbar.add({ type: 'warning', text: 'Please select a service and concept' })
    return
  }

  // Use tolerance comparison to handle floating-point precision errors
  const epsilon = 0.01 // 1 cent tolerance for currency
  if (draftTotal.value + conceptGrandTotal(newConcept.value) - amountProvisioned.value > epsilon) {
    snackbar.add({ type: 'warning', text: 'Amount is greater than provisioned' })
    return
  }

  const concept = JSON.parse(JSON.stringify(newConcept.value))
  concept.ret_iva_perc = Number(concept.ret_iva_perc) || 0
  concept.service_type = serviciosFound.value.serviceType

  dialogVsSellProfit.value.show = true
  dialogVsSellProfit.value.concept = concept

  newConcept.value = emptyConcept()
}

const newConceptTotalAmount = computed(() => {
  const roundToTwo = (value: number) => Math.round(value * 100) / 100

  // newConcept if IVA multiply by 1.16
  // newConcept if Ret. IVA multiply by 0.84
  // newConcept if Ret. ISR multiply by 0.10
  let total = parseFloat(newConcept.value.amount)
  let iva = 0
  let retIva = 0
  let retIsr = 0

  if (newConcept.value.is_con_iva) {
    iva = roundToTwo(newConcept.value.amount * 0.16)
  }
  if (newConcept.value.ret_iva_perc) {
    retIva = roundToTwo(newConcept.value.amount * (newConcept.value.ret_iva_perc / 100))
  }
  if (newConcept.value.is_ret_isr) {
    retIsr = roundToTwo(newConcept.value.amount * 0.1)
  }

  // Perform addition and subtraction without rounding
  total = total + iva - retIva - retIsr

  // multiply by number of services selected
  total = total * (newConcept.value.service ? newConcept.value.service.length : 1)

  // Round the final total to two decimal places
  return roundToTwo(total) || 0
})

const calcTotalWithTaxes = (concept: any) => {
  const roundUp = (value: number) => Math.round(value * 100) / 100

  let total = parseFloat(concept.amount)
  let iva = 0
  let retIva = 0
  let retIsr = 0
  if (concept.is_con_iva) {
    iva = roundUp(concept.amount * 0.16)
  }
  if (concept.ret_iva_perc) {
    retIva = roundUp(concept.amount * (concept.ret_iva_perc / 100))
  }
  if (concept.is_ret_isr) {
    retIsr = roundUp(concept.amount * 0.1)
  }

  total = total + iva - retIva - retIsr

  return roundUp(total)
}

const confirmDeleteSupInvoice = async (supplierInvoice: any) => {
  const result = await confirm({
    title: 'Are you sure?',
    confirmationText: 'Yes, I confirm',
    content: 'Please confirm this action.',
    dialogProps: {
      persistent: true,
      maxWidth: 500,
    },
    confirmationButtonProps: {
      color: 'primary',
    },
  })

  if (result) {
    await deleteSupplierInvoiceInCfdi(supplierInvoice)
  }
}

const reSyncSupplierCapLimit = async () => {
  try {
    loadingStore.start()
    await $api.suppliers.reSyncSupplierCapLimit(supplierCfdi.value.id)
    snackbar.add({ type: 'success', text: 'Cap limit re-synced' })

    await getData()
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const toggleFreeFormat = async (isFreeFormat: boolean) => {
  try {
    loadingFreeFormat.value = true
    const body = {
      is_free_format: isFreeFormat,
    }
    await $api.suppliers.toggleFreeFormat(supplierCfdi.value.id, body)
    snackbar.add({
      type: 'success',
      text: isFreeFormat ? 'CFDI marcado como formato libre' : 'CFDI desmarcado como formato libre',
    })

    await getData()
  } catch (e: any) {
    console.error(e)
    snackbar.add({ type: 'error', text: e?.response?.data?.message || 'Error al actualizar el formato' })
  } finally {
    loadingFreeFormat.value = false
  }
}

const validateCfdiCharge = () => {
  chargeErrors.value = { amount: [], notes: [] }
  let isValid = true

  if (!newCfdiCharge.value.notes || newCfdiCharge.value.notes.trim() === '') {
    chargeErrors.value.notes.push('Las notas son obligatorias')
    isValid = false
  }

  if (!newCfdiCharge.value.amount || newCfdiCharge.value.amount <= 0) {
    chargeErrors.value.amount.push('El monto debe ser mayor a 0')
    isValid = false
  }

  return isValid
}

const saveCfdiCharge = async () => {
  if (!validateCfdiCharge()) {
    return
  }

  try {
    loadingCharge.value = true
    const body = {
      charge_id: newCfdiCharge.value.charge_id,
      amount: newCfdiCharge.value.amount,
      currency_id: supplierCfdi.value.currency_id,
      notes: newCfdiCharge.value.notes,
    }

    if (editingCharge.value) {
      await $api.suppliers.updateCfdiCharge(supplierCfdi.value.id, editingCharge.value.id, body)
      snackbar.add({ type: 'success', text: 'Cargo actualizado correctamente' })
    } else {
      await $api.suppliers.addCfdiCharge(supplierCfdi.value.id, body)
      snackbar.add({ type: 'success', text: 'Cargo agregado correctamente' })
    }

    newCfdiCharge.value = {
      charge_id: null,
      amount: 0,
      notes: '',
    }
    editingCharge.value = null
    await getData()
  } catch (e: any) {
    console.error(e)
    snackbar.add({ type: 'error', text: e?.response?.data?.message || 'Error al guardar el cargo' })
  } finally {
    loadingCharge.value = false
  }
}

const editCfdiCharge = (charge: any) => {
  editingCharge.value = charge
  newCfdiCharge.value = {
    charge_id: charge.charge_id,
    amount: charge.amount,
    notes: charge.notes,
  }
}

const cancelEditCharge = () => {
  editingCharge.value = null
  newCfdiCharge.value = {
    charge_id: null,
    amount: 0,
    notes: '',
  }
  chargeErrors.value = { amount: [], notes: [] }
}

const confirmDeleteCfdiCharge = async (charge: any) => {
  const result = await confirm({
    title: '¿Estás seguro?',
    confirmationText: 'Sí, eliminar',
    content: '¿Deseas eliminar este cargo?',
    dialogProps: {
      persistent: true,
      maxWidth: 500,
    },
    confirmationButtonProps: {
      color: 'error',
    },
  })

  if (result) {
    await deleteCfdiCharge(charge)
  }
}

const deleteCfdiCharge = async (charge: any) => {
  try {
    loadingStore.start()
    await $api.suppliers.deleteCfdiCharge(supplierCfdi.value.id, charge.id)
    snackbar.add({ type: 'success', text: 'Cargo eliminado correctamente' })
    await getData()
  } catch (e: any) {
    console.error(e)
    snackbar.add({ type: 'error', text: e?.response?.data?.message || 'Error al eliminar el cargo' })
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const onSatValidated = async (response: any) => {
  // Actualizar el estado local del CFDI con la respuesta de validación SAT
  supplierCfdi.value.sat_status = response.sat_status
  supplierCfdi.value.sat_status_label = response.sat_status_label
  supplierCfdi.value.sat_validated_at = response.sat_validated_at
  supplierCfdi.value.sat_validator = response.sat_validator
  supplierCfdi.value.is_sat_valid = response.is_sat_valid
}

const deleteSupplierInvoiceInCfdi = async (supplierInvoice: any) => {
  try {
    loadingStore.start()
    const body = {
      supplier_cfdi_id: supplierCfdi.value.id,
      supplier_invoice_id: supplierInvoice.id,
    }
    await $api.suppliers.deleteSupplierInvoiceInCfdi(supplierCfdi.value.id, body)
    // Dynamic UI: drop the row right away, then reload the real state (balance, links, status)
    supplierCfdi.value.invoices = (supplierCfdi.value.invoices || []).filter((i: any) => i.id !== supplierInvoice.id)
    snackbar.add({ type: 'success', text: 'Supplier invoice removed' })
  } catch (e: any) {
    console.error(e)
    snackbar.add({ type: 'error', text: e?.data?.message || e?.response?._data?.message || 'Error removing the concept' })
  } finally {
    await getData()
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const selectAllServices = () => {
  newConcept.value.service = serviciosFound.value.services
}

const getEachServiceRefNumber = (service: any) => {
  if (service && service.length > 1) {
    return service.map((s: any) => s.reference_number).join(', ')
  }
  return ''
}

const cancelAddConcept = () => {
  newConcept.value = {
    service_type: null,
    service_id: null,
    amount: 0,
    currency_id: supplierCfdi.value.currency_id,
    is_con_iva: false,
    ret_iva_perc: 0,
    is_ret_isr: 0,
  }
}

const addValidatedConcept = (supplierConcept: any) => {
  console.log('addValidatedConcept')
  // foreach
  supplierProvision.addConcept(supplierConcept)
  console.log(supplierConcept)

  form.value.concepts.push(supplierConcept)
}

const removeConcept = (concept: any, index: number) => {
  supplierProvision.removeConcept(concept)
  form.value.concepts.splice(index, 1)
}

const setServicios = (servicios: any) => {
  serviciosFound.value = servicios
  newConcept.value.service = servicios.services?.length === 1 ? [...servicios.services] : null
}

const updateSupplierOnCfdi = async () => {
  try {
    loadingStore.start()
    const body = {
      supplier_cfdi_id: supplierCfdi.value.id,
      supplier_id: form.value.supplier_id,
    }
    await $api.suppliers.updateSupplierOnCfdi(body)
    snackbar.add({ type: 'success', text: 'Supplier updated' })

    await getData()
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const saveCfdiChanges = async () => {
  try {
    if (isAmountGreaterThanProvisioned.value) {
      snackbar.add({ type: 'warning', text: 'Amount is greater than provisioned' })
      return
    }
    loadingStore.start()
    const body = {
      ...form.value,
      supplier_cfdi_id: supplierCfdi.value.id,
    }
    const response = await $api.suppliers.saveCfdiChanges(body)
    snackbar.add({ type: 'success', text: 'Supplier invoice updated' })

    router.push('/invoices/suppliers/cfdis')
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const getCatalogs = async () => {
  try {
    loadingStore.start()
    const response = await $api.suppliers.getSupplierCfdiCatalogs()

    catalogs.value = response
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
    const response = await $api.suppliers.getSupplierCfdiById(props.id)

    supplierCfdi.value = response
    form.value.supplier_id = response.supplier_id
    newConcept.value.currency_id = response.currency_id
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

onMounted(async () => {
  await getCatalogs()
  await getData()

  supplierProvision.clearConcepts()

  if (supplierCfdi.value.supplier_id == null) {
    snackbar.add({ type: 'warning', text: 'CFDI not linked to a supplier.' })
    navigateTo('/invoices/suppliers/cfdis')
  }
})
</script>
<style scoped>
.step-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 0.85rem;
  margin-bottom: 8px;
}
.step-badge {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  color: white;
  background: rgb(var(--v-theme-primary));
}
</style>
