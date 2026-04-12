<template>
  <div>
    <v-card color="blue-lighten-4" class="mb-4">
      <v-card-title class="font-bold! text-base!">📋 Select search type</v-card-title>
      <v-card-text>
        <v-radio-group v-model="searchType" :inline="$vuetify.display.smAndUp">
          <v-radio label="By Service" value="service" />
          <v-radio label="Free Format (Without Service)" value="free-format" color="orange" />
        </v-radio-group>
      </v-card-text>
    </v-card>
    <v-card v-if="searchType === 'service'">
      <v-card-title>
        <h3>Search global references</h3>
      </v-card-title>
      <v-card-text>
        <SearchGlobalReferences @update="setReferences" />
      </v-card-text>
    </v-card>
    <v-card v-else color="orange-lighten-4">
      <v-card-title class="font-bold! text-base!">💰 Free Format Refund Search</v-card-title>
      <v-card-text>
        <v-alert type="info" variant="tonal" class="mb-4">
          Search for Free Format payments by beneficiary (customer, customs agent, or beneficiary)
        </v-alert>
        <div class="mb-4">
          <v-autocomplete
            v-model="form.beneficiary_type"
            :items="[
              { value: 'customer', name: 'Customer' },
              { value: 'custom_agent', name: 'Customs agent' },
              { value: 'beneficiary', name: 'Beneficiary' },
            ]"
            item-title="name"
            item-value="value"
            label="Beneficiary type"
            density="compact"
          />
        </div>
        <div v-if="form.beneficiary_type === 'customer'" class="mb-4">
          <ACustomerSearch v-model="form.beneficiaryId" label="Select Customer" />
        </div>
        <div v-if="form.beneficiary_type === 'custom_agent'" class="mb-4">
          <ACustomsAgentSearch v-model="form.beneficiaryId" label="Select Customs Agent" />
        </div>
        <div v-if="form.beneficiary_type === 'beneficiary'" class="mb-4">
          <ABeneficiarySearch v-model="form.beneficiaryId" label="Select Beneficiary" />
        </div>
        <v-btn
          v-if="form.beneficiaryId"
          color="primary"
          @click="searchFreeFormatPayments"
        >
          Search Free Format Payments
        </v-btn>
      </v-card-text>
    </v-card>
    <div v-if="hasReferences" class="py-4">
      <v-autocomplete
        v-model="form.currency_id"
        :items="currencies"
        item-title="name"
        item-value="id"
        label="Refund currency"
        density="compact"
        hide-details
        @update:model-value="clearSelectedPayments"
      />
    </div>
    <div v-if="hasReferences && hasCurrency" class="py-4">
      <div class="font-bold text-lg mb-4">Available payments in services</div>
      <div class="overflow-x-auto">
        <v-table density="compact">
          <thead>
            <tr>
              <th>Actions</th>
              <th>Service</th>
              <th>Concept</th>
              <th>Payment amount</th>
              <th>Created at</th>
            </tr>
          </thead>
          <tbody>
            <v-alert v-if="servicePaymentsByCurrency.length<1" color="error" variant="tonal" density="compact">You may validate currency</v-alert>
            <tr v-for="(servicePayment, i) in servicePaymentsByCurrency" :key="`serv-pay-${i}`">
              <td>
                <v-checkbox
                  v-model="servicePayment.selected"
                  density="compact"
                  label="Select payment to refund"
                  :disabled="servicePayment.req_refund_payment != null"
                  hide-details
                />
                <v-alert v-if="servicePayment.req_refund_payment != null" color="error" variant="tonal" density="compact">
                  Refund already requested in Req #{{ servicePayment.req_refund_payment.req_refund_id }}
                  <v-btn
                    color="error"
                    size="small"
                    @click="onClickViewRefund(servicePayment.req_refund_payment.req_refund_id)"
                    >View</v-btn
                  >
                </v-alert>
              </td>
              <td>
                <span v-if="servicePayment.serviceable">#{{ servicePayment.serviceable?.reference_number }}</span>
                <v-chip v-else color="orange" size="x-small">Free Format</v-chip>
              </td>
              <td>{{ servicePayment.charge?.name }}</td>
              <td>{{ formatToCurrency(servicePayment.amount) }} {{ getCurrencyName(servicePayment.currency_id) }}</td>
              <td>{{ formatDateString(servicePayment.created_at) }}</td>
            </tr>
          </tbody>
        </v-table>
      </div>

      <!-- Total amount selected in view box -->
      <div class="flex items-center">
        <div class="font-bold">Total amount selected:</div>
        <div class="font-bold text-xl">
          {{
            formatToCurrency(
              servicePayments
                .filter((payment: any) => payment.selected)
                .reduce((acc: number, payment: any) => {
                  return acc + parseFloat(payment.amount)
                }, 0)
            )
          }}
        </div>
      </div>

      <div class="font-bold text-lg my-4">Datos bancarios del beneficiario</div>
      <v-alert v-if="isFreeFormatSearch" type="info" variant="tonal" density="compact" class="mb-4">
        Beneficiary auto-filled from Free Format search
      </v-alert>
      <v-autocomplete
        v-model="form.beneficiary_type"
        :items="[
          { value: 'customer', name: 'Customer' },
          { value: 'custom_agent', name: 'Customs agent' },
          { value: 'beneficiary', name: 'Beneficiary' },
        ]"
        item-title="name"
        item-value="value"
        label="Beneficiary type"
        :readonly="isFreeFormatSearch"
        :variant="isFreeFormatSearch ? 'filled' : 'outlined'"
      />
      <div v-if="isCustomerType" class="mb-4">
        <div>
          <ACustomerSearch 
            v-model="form.beneficiaryId" 
            label="Beneficiario (customer)" 
            :readonly="isFreeFormatSearch"
          />
        </div>

        <CustomerSelectBankAccount v-model="form.bank" :id="form.beneficiaryId" />
      </div>
      <div v-if="isCustomsAgentType" class="mb-4">
        <div>
          <ACustomsAgentSearch 
            v-model="form.beneficiaryId" 
            label="Beneficiario (Customs Agent)" 
            :readonly="isFreeFormatSearch"
          />
        </div>

        <CustomsAgentSelectBankAccount v-model="form.bank" :id="form.beneficiaryId" />
      </div>
      <div v-if="isBeneficiaryType" class="mb-4">
        <div>
          <ABeneficiarySearch 
            v-model="form.beneficiaryId" 
            label="Beneficiary" 
            :readonly="isFreeFormatSearch"
          />
        </div>

        <BeneficiarySelectBankAccount v-model="form.bank" :id="form.beneficiaryId" />
      </div>

      <div v-if="form.bank" class="mb-4 p-4">
        <v-card>
          <v-card-title>Bank account selected:</v-card-title>
          <v-card-text>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="grid grid-cols-2 gap-0">
                <div class="font-bold">Bank:</div>
                <div>
                  <v-chip color="yellow-darken-4" v-if="form.bank?.is_default" size="small"
                    ><v-icon>mdi-star</v-icon></v-chip
                  >
                  {{ form.bank?.bank?.name }} - alias ({{ form.bank?.name }})
                </div>

                <div>Account number:</div>
                <div>
                  {{ form.bank?.account_number }} -
                  {{ getCurrencyName(form.bank?.currency_id) }}
                </div>

                <div>Beneficiary:</div>
                <div>{{ form.bank?.beneficiary_name }}</div>

                <div>Address:</div>
                <div>{{ form.bank?.beneficiary_address }}</div>
              </div>
              <div class="grid grid-cols-2 gap-0">
                <div>ABA:</div>
                <div>{{ form.bank?.aba }}</div>

                <div>SWIFT:</div>
                <div>{{ form.bank?.swift }}</div>

                <div>IBAN:</div>
                <div>{{ form.bank?.iban }}</div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </div>

      <div>
        <v-btn color="primary" @click="onClickRequestRefund">Request refund</v-btn>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { formatToCurrency } from '@/utils/formatters'
import { currencies } from '~/utils/data/systemData'
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()
const router = useRouter()

const searchType = ref('service')

const servicesResult = ref<any>({
  serviceType: '',
  services: [],
})

const form = ref<any>({
  currency_id: null,
  beneficiary_type: 'customer',
  beneficiaryId: null,
  bank: null,
})

const isFreeFormatSearch = computed(() => searchType.value === 'free-format')

const servicePayments = ref<any>([])

const isCustomerType = computed(() => form.value.beneficiary_type === 'customer')
const isCustomsAgentType = computed(() => form.value.beneficiary_type === 'custom_agent')
const isBeneficiaryType = computed(() => form.value.beneficiary_type === 'beneficiary')
const hasCurrency = computed(() => form.value.currency_id != null)

const servicePaymentsByCurrency = computed(() => {
  return servicePayments.value.filter((payment: any) => payment.currency_id === form.value.currency_id)
})

const clearSelectedPayments = () => {
  servicePayments.value = servicePayments.value.map((payment: any) => {
    return {
      ...payment,
      selected: false,
    }
  })
}

watch(
  () => form.value.beneficiary_type,
  () => {
    form.value.beneficiaryId = null
    form.value.bank = null
  }
)

watch(
  () => form.value.beneficiaryId,
  () => {
    form.value.bank = null
  }
)

const getInvoiceType = (invoice: any) => {
  if (!invoice) return ''
  if (invoice.invoiceable_type?.includes('InvoiceSeaTm')) {
    return `TM Invoice #${invoice.invoiceable_id}`
  }
  if (invoice.invoiceable_type?.includes('InvoiceSeaWm')) {
    return `WM Invoice #${invoice.invoiceable_id}`
  }
  return ''
}

const getPaymentType = (payment: any) => {
  if (!payment) return 'unkown'
  if (payment.paymentable_type?.includes('BankMovement')) {
    return `Bank movement #${payment.paymentable_id}`
  }
  if (payment.paymentable_type?.includes('InvoiceSeaWm')) {
    return `WM Invoice #${payment.paymentable_id}`
  }
  return 'unkown type'
}

const onClickViewRefund = (refundId: number) => {
  router.push(`/refunds/view-${refundId}`)
}

const onClickRequestRefund = async () => {
  try {
    loadingStore.start()
    const selectedPayments = servicePayments.value.filter((payment: any) => payment.selected)
    if (selectedPayments.length <= 0) {
      snackbar.add({ type: 'error', text: 'No payments selected' })
      return
    }
    if (!form.value.beneficiaryId) {
      snackbar.add({ type: 'error', text: 'No beneficiary selected' })
      return
    }
    if (!form.value.bank) {
      snackbar.add({ type: 'error', text: 'No bank account selected' })
      return
    }

    const body = {
      payments: selectedPayments.map((payment: any) => payment.id),
      beneficiary_type: form.value.beneficiary_type,
      beneficiary_id: form.value.beneficiaryId,
      bank_account_id: form.value.bank.id,
      currency_id: form.value.currency_id,
    }
    const response: any = await $api.refunds.requestRefund(body)
    snackbar.add({ type: 'success', text: 'Refund requested' })
    router.push(`/refunds/view-${response.id}`)
  } catch (error) {
    console.error(error)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const searchFreeFormatPayments = async () => {
  try {
    loadingStore.start()
    const body = {
      service_type: 'FF',
      beneficiary_type: form.value.beneficiary_type,
      beneficiary_id: form.value.beneficiaryId,
    }
    const response: any = await $api.refunds.searchByServices(body)
    console.log("response:",response)
    if (response.length <= 0) {
      snackbar.add({ type: 'info', text: 'No Free Format payments found for this beneficiary' })
    }

    servicePayments.value = response
      .map((payment: any) => {
        return {
          ...payment,
          selected: false,
        }
      })
      .sort((a: any, b: any) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      })
    
    servicesResult.value.services = [{ id: 'free-format' }]
    
    // Auto-fill beneficiary fields for Free Format
    // The beneficiary_type and beneficiaryId are already set from the search form
    // They will be locked via readonly attribute
  } catch (error) {
    console.error(error)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const getServicesPayments = async () => {
  try {
    loadingStore.start()
    const body = {
      service_type: servicesResult.value.serviceType,
      servicesIds: servicesResult.value.services.map((service: any) => service.id),
    }
    const response: any = await $api.refunds.searchByServices(body)
    if (response.length <= 0) {
      snackbar.add({ type: 'error', text: 'No services with payments found' })
    }

    servicePayments.value = response
      .map((payment: any) => {
        return {
          ...payment,
          selected: false,
        }
      })
      .sort((a: any, b: any) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      })
  } catch (error) {
    console.error(error)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const setReferences = (results: any) => {
  console.log(results)
  servicesResult.value = results
  if (servicesResult.value.services.length > 0) {
    getServicesPayments()
  }
}

const hasReferences = computed(() => {
  return servicesResult.value.services?.length > 0
})
</script>
