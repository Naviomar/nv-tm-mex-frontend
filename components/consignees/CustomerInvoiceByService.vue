<template>
  <div>
    <v-card>
      <v-card-title>Customer invoice by service</v-card-title>
      <v-card-text>
        <div class="grid grid-cols-1 gap-2">
          <div>
            <div class="font-bold py-4">1. Select a service</div>
            <SearchGlobalReferences @update="setServicios" :set-search="serviceSearch" />
          </div>
          <div v-if="hasServiciosFound" class="py-4">
            <div class="font-bold">2. Services found. Select invoice type and continue</div>
            <div class="flex gap-4">
              <v-autocomplete
                v-if="isSeaImport"
                v-model="form.charge_type"
                density="compact"
                variant="solo-filled"
                label="Charge type"
                :items="[
                  { value: 'demurrages', name: 'Demurrages' },
                  { value: 'no_demurrages', name: 'Other charges' },
                ]"
                item-title="name"
                item-value="value"
                @update:model-value="clearSelectedCharges"
              />
              <v-autocomplete
                v-model="form.invoice_type"
                density="compact"
                variant="solo-filled"
                label="Invoice type"
                :items="invoiceTypes"
                item-title="name"
                item-value="name"
                @update:model-value="clearSelectedCharges"
              />
              <v-autocomplete
                v-model="form.currency_id"
                density="compact"
                variant="solo-filled"
                label="Invoice currency"
                :items="currencies"
                item-title="name"
                item-value="id"
                @update:model-value="clearSelectedCharges"
              />
            </div>

            <div v-if="hasInvoiceInitData">
              <div class="font-bold">Charge(s) in services</div>
              <v-table density="compact" class="mb-4">
                <thead>
                  <tr>
                    <th>Actions</th>
                    <th>Customer</th>
                    <th>Service</th>
                    <th>Charge</th>
                    <th>Base</th>
                    <th>Amount</th>
                    <th>has IVA</th>
                    <th>Has invoice?</th>
                  </tr>
                </thead>
                <tbody>
                  <template v-for="(service, index) in servicesWithCharges" :key="`service-${index}`">
                    <template v-for="(group, gIndex) in getOceanFreightGroups(service)" :key="`of-group-${index}-${gIndex}`">
                      <!-- Ocean Freight group parent row -->
                      <tr
                        :class="[
                          group.mode === 'absorb' ? 'bg-amber-lighten-5' : 'bg-blue-grey-lighten-5',
                          isGroupDisabled(group.items) ? 'opacity-60' : '',
                        ]"
                      >
                        <td>
                          <v-checkbox
                            :model-value="isGroupSelected(group.items)"
                            :indeterminate="isGroupIndeterminate(group.items)"
                            density="compact"
                            color="primary"
                            :disabled="isGroupDisabled(group.items)"
                            hide-details
                            @update:model-value="(val) => toggleGroup(group.items, !!val)"
                          />
                        </td>
                        <td>{{ service.consignee?.name }}</td>
                        <td>{{ service.reference_number }}</td>
                        <td colspan="5">
                          <div class="flex items-center gap-2">
                            <v-icon size="small">mdi-ferry</v-icon>
                            <span class="font-bold">{{ group.main.charge?.name }}</span>
                            <v-chip v-if="group.mode === 'breakdown'" size="small" color="blue-grey">
                              <v-icon start size="small">mdi-call-split</v-icon>
                              Breakdown × {{ group.items.length }}
                            </v-chip>
                            <v-chip v-else size="small" color="amber-darken-2">
                              <v-icon start size="small">mdi-merge</v-icon>
                              Absorbs {{ group.items.length - 1 }} charge{{ group.items.length - 1 > 1 ? 's' : '' }}
                            </v-chip>
                            <v-tooltip location="top">
                              <template #activator="{ props: tooltipProps }">
                                <v-icon v-bind="tooltipProps" size="small" class="text-medium-emphasis"
                                  >mdi-information-outline</v-icon
                                >
                              </template>
                              <span v-if="group.mode === 'breakdown'"
                                >Each charge below will be invoiced as its own line.</span
                              >
                              <span v-else
                                >Selecting Ocean Freight selects and merges these charges into a single line — no
                                breakdown.</span
                              >
                            </v-tooltip>
                            <span class="ml-auto font-bold"
                              >{{ formatToCurrency(getGroupTotal(group.items)) }} {{ getCurrencyName(group.items[0].currency_id) }}</span
                            >
                            <InvoicedChip :charge="group.main" :get-route="getInvoiceDetailRoute" />
                          </div>
                        </td>
                      </tr>
                      <tr
                        v-for="(sell_charge, i2) in group.items"
                        :key="`of-item-${index}-${gIndex}-${i2}`"
                        :class="['bg-grey-lighten-5', isChargeInvoiced(sell_charge) ? 'opacity-60' : '']"
                      >
                        <td>
                          <v-checkbox
                            v-model="sell_charge.selected"
                            density="compact"
                            color="primary"
                            :disabled="group.mode === 'absorb' || isChargeInvoiced(sell_charge)"
                            hide-details
                          />
                        </td>
                        <td></td>
                        <td></td>
                        <td class="pl-8">
                          <v-icon size="x-small" class="mr-1 text-medium-emphasis">mdi-subdirectory-arrow-right</v-icon>
                          <span :class="group.mode === 'absorb' ? 'text-medium-emphasis' : ''">{{
                            sell_charge.charge?.name
                          }}</span>
                          <v-chip
                            v-if="group.mode === 'absorb' && sell_charge !== group.main"
                            size="x-small"
                            variant="tonal"
                            color="amber-darken-2"
                            class="ml-2"
                          >
                            included
                          </v-chip>
                        </td>
                        <td>{{ sell_charge.base_quantity || 1 }}</td>
                        <td>{{ formatToCurrency(sell_charge.amount) }} {{ getCurrencyName(sell_charge.currency_id) }}</td>
                        <td>
                          <v-checkbox
                            v-model="sell_charge.is_con_iva"
                            density="compact"
                            color="primary"
                            :disabled="isChargeInvoiced(sell_charge)"
                            hide-details
                          />
                        </td>
                        <td>
                          <InvoicedChip :charge="sell_charge" :get-route="getInvoiceDetailRoute" />
                        </td>
                      </tr>
                    </template>
                    <tr
                      v-for="(sell_charge, index2) in getNonGroupedCharges(service)"
                      :key="`service-${index}-sell-charge-${index2}`"
                      :class="isChargeInvoiced(sell_charge) ? 'opacity-60' : ''"
                    >
                      <td>
                        <v-checkbox
                          v-model="sell_charge.selected"
                          density="compact"
                          color="primary"
                          :disabled="isChargeInvoiced(sell_charge)"
                          hide-details
                        />
                      </td>
                      <td>{{ service.consignee?.name }}</td>
                      <td>{{ service.reference_number }}</td>
                      <td>
                        <v-chip class="mr-2">{{ sell_charge.inv_type }}</v-chip> {{ sell_charge.charge?.name }}
                        <span v-if="sell_charge.class_name.includes('ContainerDetention')" class="ml-2">{{
                          sell_charge.reference_container.container_number
                        }}</span>
                      </td>
                      <td>{{ sell_charge.base_quantity || 1 }}</td>
                      <td>{{ formatToCurrency(sell_charge.amount) }} {{ getCurrencyName(sell_charge.currency_id) }}</td>
                      <td>
                        <v-checkbox
                          v-model="sell_charge.is_con_iva"
                          density="compact"
                          color="primary"
                          :disabled="isChargeInvoiced(sell_charge)"
                          hide-details
                        />
                      </td>
                      <td>
                        <InvoicedChip :charge="sell_charge" :get-route="getInvoiceDetailRoute" />
                      </td>
                    </tr>
                  </template>
                </tbody>
              </v-table>

              <div class="grid grid-cols-2 gap-2">
                <div class="mb-4">
                  <ChooseCustomerWithAddress @selected:customer="setCustomer" />
                </div>
                <div v-if="isTm">
                  <div>
                    <div class="font-bold">CFDI information</div>
                    <v-autocomplete
                      v-model="form.cfdi.regimen_fiscal"
                      :items="cfdiCatalogs.regimenFiscales"
                      density="compact"
                      label="Régimen fiscal"
                      item-title="name"
                      item-value="name"
                      readonly
                    />
                    <v-autocomplete
                      v-model="form.cfdi.uso_cfdi"
                      :items="cfdiCatalogs.usosCfdi"
                      density="compact"
                      label="Uso de CFDI"
                      item-title="name"
                      item-value="name"
                    />
                    <v-autocomplete
                      v-model="form.cfdi.metodo_pago"
                      :items="cfdiCatalogs.metodosPago"
                      density="compact"
                      label="Método de pago"
                      item-title="name"
                      item-value="name"
                      @update:model-value="form.cfdi.forma_pago = null"
                    />
                    <v-autocomplete
                      v-model="form.cfdi.forma_pago"
                      :items="availableFormasPago"
                      density="compact"
                      label="Forma de pago"
                      item-title="name"
                      item-value="name"
                    />
                    <div>
                      <div class="font-bold mb-2">Additional notes</div>
                      <v-textarea v-model="form.notes" density="compact" rows="3" />
                    </div>
                  </div>
                </div>
                <div v-else>
                  <div>
                    <div class="font-bold mb-2">Additional notes</div>
                    <v-textarea v-model="form.notes" density="compact" rows="3" />
                  </div>
                </div>
              </div>

              <!-- Split by containers -->
              <div
                v-if="isMaritimeAndOneService && !hasDetentionCharges && form.charge_type === 'no_demurrages'"
                class="py-4"
              >
                <v-checkbox
                  v-model="form.split_by_containers"
                  density="compact"
                  :label="`Split concepts by ${serviceTotalContainers} containers`"
                />
                <div v-if="form.split_by_containers">
                  <v-alert color="amber" type="info" variant="outlined" density="compact" class="mb-2">
                    <span
                      >Splitting invoices by containers will create an invoice for each container. Dividing the charges
                      between them.</span
                    >
                  </v-alert>
                  <div v-for="(container, index) in serviceContainers" :key="`container-${container.id}`">
                    <div>
                      <v-icon class="mr-2">mdi-train-car-container</v-icon>{{ container.container_number }}
                      {{ container.container_type?.name }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- <LinkDeleteInvoice v-model="form.link_deleted_invoice" :invType="form.invoice_type" /> -->
              <LinkDeleteInvoiceNew 
                v-model="form.link_deleted_invoice" 
                :inv-type="form.invoice_type"
                :service-type="linkerServiceType"
                :reference-id="linkerServiceType === 'sea' ? singleServiceId : null"
                :air-reference-id="linkerServiceType === 'air' ? singleServiceId : null"
              />
              <v-alert
                v-if="form.link_deleted_invoice"
                color="red-darken-2"
                variant="tonal"
                density="compact"
                class="my-2"
              >
                <div class="d-flex align-center justify-space-between flex-wrap gap-2">
                  <div>
                    A previous cancelled invoice 
                    <NuxtLink 
                      :to="getInvoiceDetailRoute(form.link_deleted_invoice)" 
                      target="_blank"
                      class="text-white font-weight-bold text-decoration-underline"
                    >
                      {{ form.link_deleted_invoice?.invoice?.invoice_number || form.link_deleted_invoice?.id }}
                    </NuxtLink>
                    will be linked to this invoice.
                  </div>
                  <v-btn color="red" size="x-small" @click="form.link_deleted_invoice = null">Remove</v-btn>
                </div>
              </v-alert>

              <div class="font-bold">3. Create invoice with selected charge(s)</div>
              <v-table density="compact">
                <thead>
                  <tr>
                    <th>Service</th>
                    <th>Charge</th>
                    <th>Base</th>
                    <th>Amount</th>
                    <th>IVA</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  <template v-for="(service, index) in servicesWithCharges" :key="`sel-service-${index}`">
                    <tr
                      v-for="(charge, index2) in selectedSellCharges(service)"
                      :key="`selected-service-${index}-sell-charge-${index2}`"
                    >
                      <td>{{ service.reference_number }}</td>
                      <td>
                        <v-icon v-if="charge.is_ocean_freight && charge.has_desglose" size="x-small" class="mr-1"
                          >mdi-ferry</v-icon
                        >
                        {{ charge.charge?.name }}
                        <span v-if="charge.class_name.includes('ContainerDetention')" class="ml-2">{{
                          charge.reference_container.container_number
                        }}</span>
                      </td>
                      <td>{{ charge.base_quantity || 1 }}</td>
                      <td>{{ formatToCurrency(charge.amount) }} {{ getCurrencyName(charge.currency_id) }}</td>
                      <td>
                        <v-chip v-if="charge.is_con_iva == 1" color="success" class="ml-2">Yes</v-chip>
                        <v-chip v-else color="error" class="ml-2">No</v-chip>
                      </td>
                      <td class="text-right">
                        {{ getCurrencyName(charge.currency_id) }} {{ formatToCurrency(getSubtotalBase(charge)) }}
                      </td>
                    </tr>
                  </template>
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="5" class="text-right font-bold">Total</td>
                    <td class="font-bold text-right">
                      {{ formatToCurrency(totalSelected) }}
                      {{ getCurrencyName(form.currency_id) }}
                    </td>
                  </tr>
                </tfoot>
              </v-table>

              <div class="mt-4">
                <v-btn color="primary" @click="createInvoice">Create invoice</v-btn>
              </div>
            </div>

          </div>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>
<script setup lang="ts">
import { currencies, cfdiCatalogs } from '~/utils/data/systemData'
const { $api } = useNuxtApp()
const loadingStore = useLoadingStore()
const snackbar = useSnackbar()
const router = useRouter()
const route = useRoute()

const serviciosFound = ref<any>({ serviceType: null, services: [] })
const servicesWithCharges = ref<any>([])
const form = ref<any>({
  invoice_type: null,
  currency_id: null,
  charge_type: null, // For sea import charges
  split_by_containers: false,
  link_deleted_invoice: null,
  customer: null,
  cfdi: {
    regimen_fiscal: null,
    uso_cfdi: null,
    metodo_pago: null,
    forma_pago: null,
  },
  services: [],
  notes: null,
})

const serviceSearch = ref<any>(null)

const invoiceTypes = [{ name: 'TM' }, { name: 'WM' }]

const hasServiciosFound = computed(() => !!serviciosFound.value.services.length)
const serviceTypeSelected = computed(() => serviciosFound.value.serviceType)
const hasInvoiceInitData = computed(() => !!form.value.invoice_type && !!form.value.currency_id)
const isTm = computed(() => form.value.invoice_type === 'TM')
const linkerServiceType = computed(() => {
  return serviciosFound.value.serviceType === 'EA' || serviciosFound.value.serviceType === 'IA' ? 'air' : 'sea'
})
const singleServiceId = computed(() => {
  return serviciosFound.value.services.length === 1 ? serviciosFound.value.services[0]?.id ?? null : null
})

const isSeaImport = computed(() => serviciosFound.value.serviceType === 'IM')

const availableFormasPago = computed(() => {
  if (!form.value.cfdi.metodo_pago) return []
  if (form.value.cfdi.metodo_pago.includes('PPD')) {
    return cfdiCatalogs.formasPago.filter((forma: any) => forma.name === '99 - Por definir')
  }

  return cfdiCatalogs.formasPago
})

const hasSelectedServiceCharges = computed(() => {
  const sell_charges = servicesWithCharges.value.filter((service: any) => {
    if (serviciosFound.value.serviceType === 'EM') {
      const exportCarges = service.export_charges.some((charge: any) => charge.selected)
      const detentions = service.containers.some((container: any) => container.detention?.selected)
      return exportCarges || detentions
    }
    if (serviciosFound.value.serviceType === 'IM' && form.value.charge_type === 'no_demurrages') {
      const impoSell1 = service.sell_rate_breakdown.some((sell_charge: any) => sell_charge.selected)
      const impoSell2 = service.charges.some((charge: any) => charge.selected)

      return impoSell1 || impoSell2
    }
    if (serviciosFound.value.serviceType === 'IM' && form.value.charge_type === 'demurrages') {
      return service.demurrage_charges.some((demurrageCharge: any) => demurrageCharge.selected)
    }

    // Air services
    if (serviciosFound.value.serviceType === 'EA' || serviciosFound.value.serviceType === 'IA') {
      return service.charges.some((charge: any) => charge.selected)
    }
  })

  return sell_charges.length > 0
})

const isMaritimeAndOneService = computed(() => {
  return serviciosFound.value.serviceType === 'IM' && serviciosFound.value.services.length === 1
})

const hasDetentionCharges = computed(() => {
  return servicesWithCharges.value.some((service: any) => {
    return service.containers.some((container: any) => container.detention)
  })
})

const serviceTotalContainers = computed(() => {
  return servicesWithCharges.value.reduce((acc: any, service: any) => {
    return acc + service.total_containers
  }, 0)
})

const serviceContainers = computed(() => {
  return servicesWithCharges.value[0]?.containers || []
})

const getSubtotalBase = (charge: any) => {
  const iva = charge.is_con_iva ? parseFloat(charge.amount) * 0.16 : 0
  let subtotal: any = (charge.base_quantity || 1) * (parseFloat(charge.amount) + iva)
  subtotal = subtotal.toFixed(2)
  return subtotal.toString()
}

const totalSelected = computed(() => {
  let total = 0
  servicesWithCharges.value.forEach((service: any) => {
    const sell_charges = selectedSellCharges(service)
    sell_charges.forEach((charge: any) => {
      const iva = charge.is_con_iva ? parseFloat(charge.amount) * 0.16 : 0
      total += (charge.base_quantity || 1) * (parseFloat(charge.amount) + iva)
    })
  })
  return Number(total.toFixed(2))
})

const selectedSellCharges = (service: any) => {
  if (serviciosFound.value.serviceType === 'EM') {
    const exportCharges = service.export_charges.filter((charge: any) => charge.selected)
    const detentions = service.containers
      .filter((container: any) => container.detention?.selected)
      .map((container: any) => container.detention)

    return exportCharges.concat(detentions)
  }

  if (serviciosFound.value.serviceType === 'IM' && form.value.charge_type === 'no_demurrages') {
    const sellCharges = service.sell_rate_breakdown.filter((sell_charge: any) => sell_charge.selected)
    const charges = service.charges.filter((charge: any) => charge.selected)

    return sellCharges.concat(charges)
  }

  if (serviciosFound.value.serviceType === 'IM' && form.value.charge_type === 'demurrages') {
    return service.demurrage_charges.filter((demurrageCharge: any) => demurrageCharge.selected)
  }

  // Air services
  if (serviciosFound.value.serviceType === 'EA' || serviciosFound.value.serviceType === 'IA') {
    return service.charges.filter((charge: any) => charge.selected)
  }

  return []
}

const getInvoiceDetailRoute = (invoice: any) => {
  if (!invoice) return '#'
  const invoiceType = invoice.invoice_type || form.value.invoice_type
  const serviceType = serviciosFound.value?.serviceType
  const isAir = serviceType === 'EA' || serviceType === 'IA'
  const basePath = isAir
    ? (invoiceType === 'TM' ? '/invoices/search/tm-air-view' : '/invoices/search/wm-air-view')
    : (invoiceType === 'TM' ? '/invoices/search/tm-view' : '/invoices/search/wm-view')
  return `${basePath}-${invoice.id}`
}

const clearSelectedCharges = () => {
  form.value.link_deleted_invoice = null
  // for each service, clear selected charges

  // Sea import charges
  servicesWithCharges.value.forEach((service: any) => {
    service.sell_rate_breakdown?.forEach((sell_charge: any) => {
      sell_charge.selected = false
    })
    service.charges?.forEach((charge: any) => {
      charge.selected = false
    })
    service.demurrage_charges?.forEach((demurrageCharge: any) => {
      demurrageCharge.selected = false
    })

    service.export_charges?.map((charge: any) => {
      charge.amount = charge.sell_amount
      charge.currency_id = charge.sell_currency_id
      charge.is_con_iva = charge.sell_iva > 0 ? 1 : 0
      charge.selected = false
    })

    service.containers?.forEach((container: any) => {
      if (container.detention) {
        container.detention.selected = false
        container.detention.is_con_iva = container.detention.is_con_iva ?? true
      }
    })

    // Air services
    if (serviciosFound.value.serviceType === 'EA' || serviciosFound.value.serviceType === 'IA') {
      service.charges?.forEach((charge: any) => {
        charge.amount = charge.sell_amount
        charge.currency_id = charge.sell_currency_id
        charge.is_con_iva = charge.sell_iva > 0 ? 1 : 0
        charge.selected = false
      })
    }
  })
}

const setServicios = (servicios: any) => {
  serviciosFound.value = servicios
  if (serviciosFound.value.services.length <= 0) {
    servicesWithCharges.value = []
  }
  if (serviciosFound.value.services.length > 0) {
    findServicesPendingCharges()
  }
}

const getServiceSellCharges = (service: any) => {
  // Exportacion maritima
  if (serviciosFound.value.serviceType === 'EM') {
    const allowCollectInvoicing = !!service.consignee?.allow_collect_export_invoicing
    const exportCharges =
      service.export_charges?.filter((charge: any) => {
        return (
          // TODO verificar que cuando no sea sell charge venga nulo
          (charge.sell_type === 'P' || (allowCollectInvoicing && charge.sell_type === 'C')) &&
          charge.sell_amount != null &&
          charge.sell_currency_id == form.value.currency_id
        )
      }) || []

    // get service.containers where detention is not null and them map detention
    const detentions = [] as any[]
    service.containers?.forEach((container: any) => {
      if (container.detention != null) {
        container.detention.selected = container.detention.selected || false // Ensure reactivity is preserved
        container.detention.amount = container.detention.amount_customer
        container.detention.currency_id = container.detention.currency_customer_id
        detentions.push(container.detention)
      }
    })

    return exportCharges.concat(detentions)
  }

  if (serviciosFound.value.serviceType === 'IM' && form.value.charge_type === 'no_demurrages') {
    const sellCharges =
      service.sell_rate_breakdown?.filter((sell_charge: any) => {
        return sell_charge.currency_id == form.value.currency_id
      }) || []
    const charges =
      service.charges?.filter((charge: any) => {
        return charge.currency_id == form.value.currency_id
      }) || []

    return sellCharges.concat(charges)
  }

  if (serviciosFound.value.serviceType === 'IM' && form.value.charge_type === 'demurrages') {
    const demurrageCharges =
      service.demurrage_charges?.filter((demurrageCharge: any) => {
        return demurrageCharge.currency_id == form.value.currency_id
      }) || []

    return demurrageCharges
  }

  // Air services
  if (serviciosFound.value.serviceType === 'EA' || serviciosFound.value.serviceType === 'IA') {
    const charges =
      service.charges?.filter((charge: any) => {
        return (
          // TODO verificar que cuando no sea sell charge venga nulo
          charge.sell_amount != null && charge.sell_currency_id == form.value.currency_id
        )
      }) || []

    return charges
  }

  return []
}

const isChargeInvoiced = (charge: any) => {
  return (
    charge.invoice_charge != null ||
    (charge.invoice_charges && charge.invoice_charges.length > 0) ||
    charge.absorbed_invoice_id != null
  )
}

const getOceanFreightGroups = (service: any) => {
  if (!(serviciosFound.value.serviceType === 'IM' && form.value.charge_type === 'no_demurrages')) {
    return []
  }
  const sellCharges =
    service.sell_rate_breakdown?.filter((sell_charge: any) => sell_charge.currency_id == form.value.currency_id) || []

  const groups: { mode: 'breakdown' | 'absorb'; inv_type: string; main: any; items: any[] }[] = []
  const oceanFreightItems = sellCharges.filter((c: any) => c.is_ocean_freight)
  const byInvType: Record<string, any[]> = {}
  oceanFreightItems.forEach((item: any) => {
    const key = item.inv_type || 'default'
    if (!byInvType[key]) byInvType[key] = []
    byInvType[key].push(item)
  })

  Object.entries(byInvType).forEach(([inv_type, oceanItems]) => {
    // Broken down into several sell-rate lines: each becomes its own invoice line
    if (oceanItems.length > 1 && oceanItems.every((c: any) => c.has_desglose)) {
      groups.push({ mode: 'breakdown', inv_type, main: oceanItems[0], items: oceanItems })
      return
    }

    // Lump-sum Ocean Freight: other sell-rate charges of the same currency/inv_type
    // get absorbed into it (merged amount, single invoice line) when selected together
    const main = oceanItems.find((c: any) => !c.has_desglose)
    if (!main) return
    const siblings = sellCharges.filter((c: any) => c !== main && !c.is_ocean_freight && c.inv_type === inv_type)
    if (siblings.length === 0) return
    groups.push({ mode: 'absorb', inv_type, main, items: [main, ...siblings] })
  })

  return groups
}

const getNonGroupedCharges = (service: any) => {
  const all = getServiceSellCharges(service)
  const grouped = getOceanFreightGroups(service).flatMap((g: any) => g.items)
  return all.filter((c: any) => !grouped.includes(c))
}

const getGroupTotal = (items: any[]) => {
  return items.reduce((acc, item) => acc + parseFloat(item.amount || 0), 0)
}

const isGroupSelected = (items: any[]) => items.every((i) => i.selected)
const isGroupIndeterminate = (items: any[]) => items.some((i) => i.selected) && !items.every((i) => i.selected)
const isGroupDisabled = (items: any[]) => items.every((i) => isChargeInvoiced(i))

const toggleGroup = (items: any[], value: boolean) => {
  items.forEach((item) => {
    if (!isChargeInvoiced(item)) {
      item.selected = value
    }
  })
}

const findServicesPendingCharges = async () => {
  try {
    loadingStore.start()
    const body = {
      serviceType: serviciosFound.value.serviceType,
      services: serviciosFound.value.services.map((service: any) => service.id),
    }
    const response: any = await $api.invoices.fetchPendingChargesByService(body)
    servicesWithCharges.value = response
    clearSelectedCharges()
  } catch (error) {
    console.error(error)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const setCustomer = (customer: any) => {
  console.log('setCustomer', customer)
  form.value.customer = customer
  form.value.cfdi.regimen_fiscal = customer.regimen_fiscal
}

const createInvoice = async () => {
  try {
    if (!form.value.customer) {
      snackbar.add({ type: 'warning', text: 'Select a customer to create the invoice' })
      return
    }
    if (!hasSelectedServiceCharges.value) {
      snackbar.add({ type: 'warning', text: 'Select at least one charge to create the invoice' })
      return
    }
    loadingStore.start()

    // filter selected charges
    let services = servicesWithCharges.value.map((service: any) => {
      return {
        id: service.id,
        reference_number: service.reference_number,
        sell_rate_breakdown: service.sell_rate_breakdown?.filter((sell_charge: any) => sell_charge.selected) || [],
        charges: service.charges?.filter((charge: any) => charge.selected) || [],
        export_charges: service.export_charges?.filter((charge: any) => charge.selected) || [],
        demurrage_charges: service.demurrage_charges?.filter((demurrageCharge: any) => demurrageCharge.selected) || [],
        detentions: service.containers
          .filter((container: any) => container.detention?.selected)
          .map((container: any) => container.detention),
      }
    })

    // discard services without selected charges
    services = services.filter((service: any) => {
      return (
        service.sell_rate_breakdown.length > 0 ||
        service.charges.length > 0 ||
        service.export_charges.length > 0 ||
        service.demurrage_charges.length > 0 ||
        service.detentions.length > 0
      )
    })

    const body = {
      invoice_type: form.value.invoice_type,
      currency_id: form.value.currency_id,
      split_by_containers: form.value.split_by_containers,
      link_deleted_invoice: form.value.link_deleted_invoice,
      customer: form.value.customer,
      cfdi: form.value.cfdi,
      serviceType: serviciosFound.value.serviceType,
      charge_type: form.value.charge_type,
      services: services,
      notes: form.value.notes,
    }
    const response: any = await $api.invoices.createInvoiceByService(body)
    snackbar.add({ type: 'success', text: 'Customer invoice created' })

    if (form.value.split_by_containers) {
      router.push('/invoices/search')
      return
    } else {
      if (serviciosFound.value.serviceType === 'EM' || serviciosFound.value.serviceType === 'IM') {
        router.push(`/invoices/search/${form.value.invoice_type.toLowerCase()}-view-${response.id}`)
        return
      }
      if (serviciosFound.value.serviceType === 'EA' || serviciosFound.value.serviceType === 'IA') {
        router.push(`/invoices/search/${form.value.invoice_type.toLowerCase()}-air-view-${response.id}`)
        return
      }
    }
  } catch (error) {
    console.error(error)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

onMounted(() => {
  // get query params service, impoExpo, service_id
  const query = route.query
  if (query.service) {
    const body = {
      service: query.service,
      year: query.year,
      service_number: query.service_number,
    }
    serviceSearch.value = body
  }
})
</script>
