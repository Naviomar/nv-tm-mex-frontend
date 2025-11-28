<template>
  <div>
    <v-card>
      <v-card-title>
        <h3>Search global references</h3>
      </v-card-title>
      <v-card-text>
        <SearchGlobalReferences @update="setReferences" />
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
            <td>#{{ servicePayment.serviceable?.reference_number }}</td>
            <td>{{ servicePayment.charge?.name }}</td>
            <td>{{ formatToCurrency(servicePayment.amount) }} {{ getCurrencyName(servicePayment.currency_id) }}</td>
            <td>{{ formatDateString(servicePayment.created_at) }}</td>
          </tr>
        </tbody>
      </v-table>

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
      <v-autocomplete
        v-model="form.beneficiary_type"
        :items="[
          { value: 'customer', name: 'Customer' },
          { value: 'customagent', name: 'Customs agent' },
        ]"
        item-title="name"
        item-value="value"
        label="Beneficiary type"
      />
      <div v-if="isCustomerType" class="mb-4">
        <div>
          <ACustomerSearch v-model="form.beneficiaryId" label="Beneficiario (customer)" />
        </div>

        <CustomerSelectBankAccount v-model="form.bank" :id="form.beneficiaryId" />
      </div>
      <div v-if="isCustomsAgentType" class="mb-4">
        <div>
          <ACustomsAgentSearch v-model="form.beneficiaryId" label="Beneficiario (Customs Agent)" />
        </div>

        <CustomsAgentSelectBankAccount v-model="form.bank" :id="form.beneficiaryId" />
      </div>

      <div v-if="form.bank" class="mb-4 p-4">
        <v-card>
          <v-card-title>Customer bank account selected:</v-card-title>
          <v-card-text>
            <div class="grid grid-cols-2 gap-4">
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

const servicePayments = ref<any>([])

const isCustomerType = computed(() => form.value.beneficiary_type === 'customer')
const isCustomsAgentType = computed(() => form.value.beneficiary_type === 'customagent')
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
