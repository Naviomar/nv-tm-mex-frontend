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
                    <tr
                      v-for="(sell_charge, index2) in getServiceSellCharges(service)"
                      :key="`service-${index}-sell-charge-${index2}`"
                    >
                      <td>
                        <v-checkbox
                          v-model="sell_charge.selected"
                          density="compact"
                          color="primary"
                          :disabled="sell_charge.invoice_charge != null"
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
                        <v-chip v-if="sell_charge.is_con_iva == 1" color="success" class="ml-2">Yes</v-chip>
                        <v-chip v-else color="error" class="ml-2">No</v-chip>
                      </td>
                      <td>
                        <v-chip v-if="sell_charge.invoice_charge" color="success" class="ml-2">Yes</v-chip>
                        <v-chip v-else color="error" class="ml-2">Pending invoice</v-chip>
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

              <LinkDeleteInvoice v-model="form.link_deleted_invoice" :invType="form.invoice_type" />
              <v-alert
                v-if="form.link_deleted_invoice"
                color="red-darken-2"
                variant="tonal"
                density="compact"
                class="my-2"
              >
                A previous cancelled invoice #{{ form.link_deleted_invoice?.id }} will be linked to this invoice.
                <v-btn color="red" size="x-small" @click="form.link_deleted_invoice = null">Remove</v-btn>
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

const clearSelectedCharges = () => {
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
    const exportCharges =
      service.export_charges?.filter((charge: any) => {
        console.log('charge', charge)
        return (
          // TODO verificar que cuando no sea sell charge venga nulo
          charge.sell_type === 'P' && charge.sell_amount != null && charge.sell_currency_id == form.value.currency_id
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
