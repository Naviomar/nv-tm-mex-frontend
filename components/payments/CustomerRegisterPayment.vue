<template>
  <div>
    <v-btn size="small" variant="outlined" class="mb-4" @click="$router.back">Back</v-btn>
    <v-card>
      <v-card-title class="font-bold! text-base!">Register payments to customer services</v-card-title>
      <v-card-text>
        <div class="grid grid-cols-4 gap-4">
          <div>
            <BankMovementSearchWidget v-model="form.bankMovement" type="deposit" />
          </div>
          <div class="col-span-3">
            <v-card color="lime-lighten-4">
              <v-card-title class="font-bold! text-base!">🔍 Start search services</v-card-title>
              <v-card-text>
                <SearchGlobalReferences @update="setServicios" />
              </v-card-text>
            </v-card>
          </div>
        </div>
        <div class="grid grid-cols-4 gap-4 py-4">
          <div>
            <BankMovementReceiptView :bankMovement="form.bankMovement" />
            <div class="py-4 text-center bg-slate-300 dark:bg-neutral-700 mx-4 text-lg">
              <div class="font-bold">New balance</div>
              <div>{{ formatToCurrency(newBalance) }}</div>
            </div>
          </div>
          <div class="col-span-3">
            <v-card v-if="hasServicesFound" color="lime-lighten-4">
              <v-card-title class="font-bold! text-base!">Select services to continue</v-card-title>
              <v-card-text>
                <v-autocomplete
                  v-model="form.selectedServices"
                  :items="getResultServices"
                  return-object
                  multiple
                  item-title="reference_number"
                  label="Select service(s)"
                  density="compact"
                  hide-details
                />
                <div v-if="form.selectedServices.length > 0">
                  <v-btn color="primary" class="mt-4" @click="getServiceDetails">Validate services to continue</v-btn>
                </div>
              </v-card-text>
            </v-card>

            <v-card v-if="hasServicesDetails">
              <v-card-title>
                <div class="flex justify-between">
                  <div class="font-bold! text-base!">Add payments</div>
                  <div>
                    <v-btn
                      :color="paymentForm.showPaymentForm ? 'secondary' : 'green'"
                      size="small"
                      @click="togglePaymentForm"
                    >
                      {{ paymentForm.showPaymentForm ? 'Hide' : 'Add payment' }}
                    </v-btn>
                  </div>
                </div>
              </v-card-title>
              <v-card-text>
                <div v-if="paymentForm.showPaymentForm">
                  <div class="grid grid-cols-5 gap-2">
                    <div class="">
                      <v-autocomplete
                        v-model="payForm.service"
                        :items="form.servicesDetails"
                        return-object
                        label="Service *"
                        item-title="reference_number"
                        density="compact"
                      />
                      <div v-if="hasPayFormServiceServPayments">
                        <v-btn color="amber" size="x-small" @click="showServicePaymentsDialog"
                          ><v-icon>mdi-eye-outline</v-icon> Service has payments</v-btn
                        >
                      </div>
                    </div>
                    <div class="">
                      <v-autocomplete
                        v-model="payForm.charge"
                        :items="paymentCharges"
                        item-title="name"
                        return-object
                        label="Concept *"
                        density="compact"
                        @update:model-value="payForm.container = null"
                      />
                    </div>
                    <div class="">
                      <v-autocomplete
                        v-if="isChargeGuaranteeDeposit"
                        v-model="payForm.container"
                        :items="serviceContainersNotSelected"
                        item-title="container_number"
                        return-object
                        label="Container *"
                        density="compact"
                      />
                    </div>
                    <div class="">
                      <v-text-field v-model="payForm.amount" type="number" label="Payment amount *" density="compact" />
                    </div>
                    <div class="mt-2">
                      <v-btn color="primary" size="small" variant="tonal" @click="addPayment">Add</v-btn>
                    </div>
                  </div>
                </div>

                <v-table density="compact">
                  <thead>
                    <tr>
                      <th class="font-bold w-10"></th>
                      <th class="font-bold">Service</th>
                      <th class="font-bold">Concept</th>
                      <th class="font-bold">Container</th>
                      <th class="font-bold">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(payment, index) in paymentForm.payments" :key="index">
                      <td>
                        <v-btn icon size="x-small" variant="tonal" color="red" @click="removePayment(index)">
                          <v-icon>mdi-delete</v-icon>
                        </v-btn>
                      </td>
                      <td>
                        <div class="flex items-center gap-1">
                          <div>
                            <v-btn
                              icon
                              size="x-small"
                              variant="tonal"
                              color="primary"
                              @click="viewServicePopup(payment.service)"
                            >
                              <v-icon>mdi-eye-outline</v-icon>
                            </v-btn>
                          </div>
                          <div>{{ payment.service.reference_number }}</div>
                        </div>
                      </td>
                      <td>{{ payment.charge.name }}</td>
                      <td>{{ payment.container?.container_number }}</td>
                      <td>{{ formatToCurrency(payment.amount) }}</td>
                    </tr>
                  </tbody>
                </v-table>
              </v-card-text>
              <v-card-actions v-if="hasPayments && hasBankMovement">
                <v-btn color="primary" @click="submitPaymentToBankMovement">
                  <span class="text-xl">👉</span>Submit payments
                </v-btn>
              </v-card-actions>
            </v-card>
          </div>
        </div>
      </v-card-text>
    </v-card>
    <v-dialog v-model="servicePopup.show" max-width="600">
      <v-card>
        <v-card-title class="text-h6">Service detail Ref #{{ servicePopup.service?.reference_number }}</v-card-title>
        <v-card-text>
          <v-table density="compact">
            <thead>
              <tr>
                <th class="font-bold">Sell concept</th>
                <th class="font-bold">Amount</th>
                <th class="font-bold">Currency</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(charge, index) in servicePopup.service.charges" :key="`service-charge-${index}`">
                <td>{{ charge.charge?.name }}</td>
                <td>{{ formatToCurrency(charge.amount) }}</td>
                <td>{{ getCurrencyName(charge.currency_id) }}</td>
              </tr>
              <tr v-for="(charge, index) in servicePopup.service.sell_rate_breakdown" :key="`service-charge-${index}`">
                <td>{{ charge.charge?.name }}</td>
                <td>{{ formatToCurrency(charge.amount) }}</td>
                <td>{{ getCurrencyName(charge.currency_id) }}</td>
              </tr>
            </tbody>
          </v-table>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="servicePopup.show = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="servicePaymentsDialog" max-width="800px">
      <v-card color="amber">
        <v-card-title><v-icon>mdi-cash-fast</v-icon> Payments </v-card-title>
        <v-card-text>
          <v-table density="compact">
            <thead>
              <tr>
                <th>Concept</th>
                <th>Container</th>
                <th>Amount</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(servPayment, index) in payForm.service.service_payments" :key="`service-payment-${index}`">
                <td>{{ servPayment.charge?.name }}</td>
                <td>{{ servPayment.container?.container_number }}</td>
                <td>{{ formatToCurrency(servPayment.amount) }}</td>
                <td class="whitespace-nowrap">
                  <UserInfoBadge :item="servPayment">
                    {{ formatDateString(servPayment.created_at) }}
                  </UserInfoBadge>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card-text>
        <v-card-actions>
          <v-btn color="red" @click="servicePaymentsDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script setup lang="ts">
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()

const props = defineProps({
  service: {
    type: String,
    required: true,
  },
  serviceId: {
    type: String,
    required: true,
  },
})

const catalogs = reactive<any>({
  charges: [],
})

const servicePaymentsDialog = ref(false)

const getResultServices = computed(() => form.value.servicesResult?.services || [])
const hasServicesFound = computed(() => form.value.servicesResult?.services?.length > 0)
const hasServicesDetails = computed(() => form.value.servicesDetails?.length > 0)
const serviceContainers = computed(() => payForm.service?.containers || [])
const serviceContainersNotSelected = computed(() => {
  return serviceContainers.value.filter((container: any) => {
    return !paymentForm.value.payments.find((payment: any) => payment.container?.id === container.id)
  })
})
const hasPayments = computed(() => paymentForm.value.payments.length > 0)
const hasBankMovement = computed(() => form.value.bankMovement != null)

const newBalance = computed(() => {
  if (form.value.bankMovement) {
    return (
      form.value.bankMovement.amount_available -
      paymentForm.value.payments.reduce((acc: number, payment: any) => {
        return acc + parseFloat(payment.amount)
      }, 0)
    )
  }
  return 0
})

const hasPayFormServiceServPayments = computed(() => {
  return payForm.service?.service_payments?.length > 0
})

const isChargeGuaranteeDeposit = computed(() => {
  if (!payForm.charge) {
    return false
  }
  return payForm.charge.id === 34
})

const paymentCharges = computed(() => {
  return catalogs.charges.filter((charge: any) => charge.id === 34 || charge.id === 50)
})

const bankMovementAmountAvailable = computed(() => {
  return form.value.bankMovement?.amount_available || 0
})

const paymentsAmount = computed(() => {
  return (
    paymentForm.value.payments.reduce((acc: number, payment: any) => {
      return acc + parseFloat(payment.amount)
    }, 0) || 0
  )
})

const form = ref<any>({
  bankMovement: null,
  servicesResult: { services: [] },
  selectedServices: [],
  servicesDetails: [],
})

const payForm = reactive<any>({
  service: null,
  containerId: null,
  chargeId: null,
  amount: 0,
})

const paymentForm = ref<any>({
  payments: [],
  showPaymentForm: false,
})

const servicePopup = ref<any>({
  show: false,
  service: null,
})

const togglePaymentForm = () => {
  paymentForm.value.showPaymentForm = !paymentForm.value.showPaymentForm
}

const setServicios = (service: any) => {
  form.value.servicesResult = service
  form.value.selectedServices = []
  form.value.servicesDetails = []
  clearPayForm()
}

const clearPayForm = () => {
  payForm.service = null
  payForm.container = null
  payForm.charge = null
  payForm.amount = 0
}

const showServicePaymentsDialog = () => {
  servicePaymentsDialog.value = true
}

const addPayment = () => {
  if (!payForm.service || !payForm.charge || !payForm.amount) {
    snackbar.add({ type: 'warning', text: 'All fields are required' })
    return
  }
  if (payForm.amount <= 0) {
    snackbar.add({ type: 'warning', text: 'Amount must be greater than 0' })
    return
  }

  // if charge is guarantee deposit and container is not selected show error
  if (isChargeGuaranteeDeposit.value && !payForm.container) {
    snackbar.add({ type: 'error', text: 'Container is required for guarantee deposit' })
    return
  }

  // if containers is already in service.payments show error
  if (payForm.container) {
    const containerInPayments = payForm.service.service_payments.find(
      (sp: any) => sp.container_id === payForm.container.id
    )
    if (containerInPayments) {
      snackbar.add({ type: 'error', text: 'Container is already in payments' })
      return
    }
  }

  // if payments amount is greather than bank movement amount available show error
  const newAmount = paymentsAmount.value + parseFloat(payForm.amount)
  if (newAmount > bankMovementAmountAvailable.value) {
    snackbar.add({ type: 'error', text: 'Payments amount is greather than bank movement amount available' })
    return
  }
  const payment = {
    service: {
      id: payForm.service.id,
      reference_number: payForm.service.reference_number,
      class_name: payForm.service.class_name,
    },
    container: {
      id: payForm.container?.id || null,
      container_number: payForm.container?.container_number || null,
    },
    charge: {
      id: payForm.charge.id,
      name: payForm.charge.name,
    },
    amount: payForm.amount,
  }
  paymentForm.value.payments.push(payment)

  clearPayForm()
}

const removePayment = (index: number) => {
  paymentForm.value.payments.splice(index, 1)
}

const viewServicePopup = (service: any) => {
  servicePopup.value.show = true
  // get service details from form.value.servicesDetails
  servicePopup.value.service = form.value.servicesDetails.find(
    (s: any) => s.id === service.id && s.class_name === service.class_name
  )
}

const submitPaymentToBankMovement = async () => {
  try {
    loadingStore.start()
    const body = {
      bank_movement_id: form.value.bankMovement.id,
      payments: paymentForm.value.payments,
    }
    const response: any = await $api.bankMovements.addCustomerPaymentsToBankMovement(body)
    snackbar.add({ type: 'success', text: 'Payments added successfully' })
    paymentForm.value.payments = []
    form.value = {
      bankMovement: null,
      servicesResult: { services: [] },
      selectedServices: [],
      servicesDetails: [],
    }
  } catch (error) {
    console.error(error)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const getServiceDetails = async () => {
  try {
    loadingStore.start()
    form.value.servicesDetails = []
    clearPayForm()
    const body = {
      services: form.value.selectedServices.map((service: any) => {
        return {
          id: service.id,
          class_name: service.class_name,
        }
      }),
    }

    const response: any = await $api.systemServices.searchServicesForCustomerPayments(body)
    form.value.servicesDetails = response
  } catch (error) {
    console.error(error)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const getCatalogs = async () => {
  try {
    loadingStore.start()
    const response: any = await $api.charges.getAll()
    catalogs.charges = response
  } catch (error) {
    console.error(error)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

onMounted(async () => {
  await getCatalogs()
})
</script>
