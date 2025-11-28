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
    <div v-if="hasReferencesWithBuyCharges" class="py-4">
      <div class="font-bold text-lg mb-4">Buy concepts in services & F.F. TM Debit notes</div>
      <v-expansion-panels>
        <v-expansion-panel v-for="(service, i) in services" :key="`inv-${i}`" :value="i" color="teal-lighten-4">
          <v-expansion-panel-title>
            <div class="text-lg font-bold">
              <div>{{ service.reference_number }}</div>
            </div>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <v-table density="compact">
              <thead>
                <tr>
                  <th>Actions</th>
                  <th>Sell Concept</th>
                  <th>Amount</th>
                  <th>Linked to another advance payment</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(buyCharge, i2) in service.buyConcepts" :key="`ref-${i}-serv-buy-charge-${i2}`">
                  <td>
                    <v-checkbox
                      v-model="buyCharge.selected"
                      density="compact"
                      label="Select"
                      hide-details
                      :disabled="buyCharge.req_adv_payment != null"
                      @update:model-value="updateTotalAmount"
                    />
                  </td>
                  <td>
                    {{ buyCharge.charge?.name }}
                    <div v-if="buyCharge.supplier_invoice_link">
                      <v-chip color="deep-orange" size="small">Linked in a supplier invoice</v-chip>
                    </div>
                  </td>
                  <td>{{ formatToCurrency(buyCharge.amount) }} {{ getCurrencyName(buyCharge.currency_id) }}</td>
                  <td>
                    <v-chip v-if="buyCharge.req_adv_payment" color="green"> In other advance payment </v-chip>
                    <v-chip v-else color="red">No</v-chip>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>

      <v-card class="my-4">
        <v-card-title>Advance payment details</v-card-title>
        <v-card-text>
          <div class="grid grid-cols-4 gap-4">
            <div>
              <v-autocomplete
                v-model="form.currency_id"
                :items="currencies"
                item-title="name"
                item-value="id"
                label="Currency"
                density="compact"
                @update:model-value="updateTotalAmount"
              />
            </div>
            <div>
              <v-text-field
                v-model="form.amount"
                label="Amount"
                type="number"
                density="compact"
                @update:model-value="validateMaxAmount"
              />
            </div>
            <div class="col-span-2">
              <v-card :color="darkMode.isDark ? 'purple-darken-3' : 'purple-lighten-1'">
                <v-card-title>Max amount</v-card-title>
                <v-card-text>
                  <div class="text-lg">Max amount allowed: $ {{ formatToCurrency(totalSelected) }}</div>
                  <div class="text-lg">{{ percentajeAdvPaid }}% will be paid in advance</div>
                  <div v-if="!hasCurrency">
                    <v-alert color="error" density="compact">
                      <div>Select a currency to continue</div>
                    </v-alert>
                  </div>
                </v-card-text>
              </v-card>
            </div>
            <div class="col-span-4">
              <v-textarea v-model="form.notes" label="Description" density="compact" />
            </div>
          </div>
        </v-card-text>
      </v-card>

      <div v-if="hasCurrency">
        <div class="mb-4">
          <div class="font-bold text-lg my-4">Datos bancarios del ordenante</div>
          <SystemSelectBankAccount v-model="form.origin_bank" :currency-id="form.currency_id" />

          <div v-if="form.origin_bank" class="mb-4">
            <v-card>
              <v-card-title>Originator bank account selected</v-card-title>
              <v-card-text>
                <div class="grid grid-cols-2 gap-4">
                  <div class="grid grid-cols-2 gap-0">
                    <div class="font-bold">Bank:</div>
                    <div>{{ form.origin_bank?.bank_account }}</div>

                    <div>Account number:</div>
                    <div>
                      {{ form.origin_bank?.account_number }} -
                      {{ getCurrencyName(form.origin_bank?.currency_id) }}
                    </div>

                    <div>Type:</div>
                    <div>{{ form.origin_bank?.type }}</div>

                    <div>Address:</div>
                    <div>{{ form.origin_bank?.address }}</div>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </div>
        </div>
        <div>
          <div class="font-bold text-lg my-4">Datos bancarios del beneficiario</div>
          <div class="mb-2">
            <ASupplierSearch v-model="form.supplierId" label="Beneficiario (supplier)" />
          </div>

          <SupplierSelectBankAccount
            v-model="form.supplier_bank"
            :id="form.supplierId"
            :currency-id="form.currency_id"
          />

          <div v-if="form.supplier_bank" class="mb-4">
            <v-card>
              <v-card-title>Supplier bank account selected</v-card-title>
              <v-card-text>
                <div class="grid grid-cols-2 gap-4">
                  <div class="grid grid-cols-2 gap-0">
                    <div class="font-bold">Bank:</div>
                    <div>
                      <v-chip color="yellow-darken-4" v-if="form.supplier_bank?.is_default" size="small"
                        ><v-icon>mdi-star</v-icon></v-chip
                      >
                      {{ form.supplier_bank?.bank?.name }} - alias ({{ form.supplier_bank?.name }})
                    </div>

                    <div>Account number:</div>
                    <div>
                      {{ form.supplier_bank?.account_number }} -
                      {{ getCurrencyName(form.supplier_bank?.currency_id) }}
                    </div>

                    <div>Beneficiary:</div>
                    <div>{{ form.supplier_bank?.beneficiary_name }}</div>

                    <div>Address:</div>
                    <div>{{ form.supplier_bank?.beneficiary_address }}</div>
                  </div>
                  <div class="grid grid-cols-2 gap-0">
                    <div>ABA:</div>
                    <div>{{ form.supplier_bank?.aba }}</div>

                    <div>SWIFT:</div>
                    <div>{{ form.supplier_bank?.swift }}</div>

                    <div>IBAN:</div>
                    <div>{{ form.supplier_bank?.iban }}</div>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </div>
        </div>

        <div><v-btn color="primary" @click="onClickReqAdvPayment">Request advance payment</v-btn></div>
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
const darkMode = useDarkMode()
const exchangeRatesStore = useExchangeRatesStore()

const servicesResult = ref<any>({
  serviceType: '',
  services: [],
})

const form = ref<any>({
  supplierId: null,
  origin_bank: null,
  supplier_bank: null,
  currency_id: null,
  amount: null,
  notes: '',
})

const totalSelected = computed(() => {
  if (form.value.currency_id == null) return 0
  // TODO depende del servicio donde estan los sell charges, esto es IM
  // TODO mejorar como se ponen los cargos para iterar en los expansion panels
  const total = services.value.reduce((acc: number, curr: any) => {
    console.log('curr', curr)
    return (
      acc +
      curr.buyConcepts.reduce((acc2: number, curr2: any) => {
        const exRate = exchangeRatesStore.getExchangeRate(curr2.currency_id, form.value.currency_id)
        return acc2 + (curr2.selected ? parseFloat(curr2.amount) * exRate : 0)
      }, 0)
    )
  }, 0)

  // fixed to 2 decimals
  return Math.round(total * 100) / 100
})

const percentajeAdvPaid = computed(() => {
  if (form.value.amount == null || totalSelected.value == 0) return 0
  return Math.round((form.value.amount / totalSelected.value) * 100)
})

const updateTotalAmount = () => {
  console.log('updateTotalAmount')
  if (form.value.currency_id == null) {
    snackbar.add({ type: 'error', text: 'Select a currency for the advance payment to continue' })
    return
  }
  form.value.amount = totalSelected.value
}

const validateMaxAmount = () => {
  if (form.value.amount > totalSelected.value) {
    form.value.amount = totalSelected.value
    snackbar.add({ type: 'error', text: 'The amount exceeds the total selected' })
  }
}

const getInvoiceType = (invoice: any) => {
  if (!invoice) return ''
  if (invoice.invoiceable_type?.includes('InvoiceSeaTm')) {
    return `Reference #${invoice.invoiceable_id}`
  }
  if (invoice.invoiceable_type?.includes('InvoiceSeaWm')) {
    return `Reference #${invoice.invoiceable_id}`
  }
  return ''
}

const services = ref<any>([])

const viewService = (service: any) => {
  console.log(service)
}

const setBuyConceptsHomogenized = () => {
  services.value = services.value.map((service: any) => {
    let buyRateBreakdown = []
    let localCharges = []
    let exportCharges = []
    let airCharges = []

    if (service.class_name.includes('Referencia') && service.impoExpo === 'I') {
      buyRateBreakdown = (service.buy_rate_breakdown ?? []).map((buyCharge: any) => ({
        ...buyCharge,
        selected: false,
      }))
    }

    if (service.class_name.includes('Referencia') && service.impoExpo === 'E') {
      // export maritime charges are in export_charges and only where buy_amount is not null
      exportCharges = (service.export_charges ?? [])
        .filter((exportCharge: any) => exportCharge.buy_total != null)
        .map((exportCharge: any) => ({
          ...exportCharge,
          amount: exportCharge.buy_total,
          currency_id: exportCharge.buy_currency_id,
          selected: false,
        }))
    }

    if (service.class_name.includes('AirReference')) {
      airCharges = (service.charges ?? [])
        .filter((airCharge: any) => airCharge.buy_total != null)
        .map((airCharge: any) => ({
          ...airCharge,
          amount: airCharge.buy_total,
          currency_id: airCharge.buy_currency_id,
          selected: false,
        }))
    }

    const ffNotes = (service.ff_notes ?? []).map((ffNote: any) => ({
      ...ffNote,
      selected: false,
      supplier_invoice_link: (ffNote.concepts || []).some((ffNote: any) => ffNote.supplier_invoice_link),
      charge: {
        name: `F.F. Note #${ffNote.id} From TM Debit`,
      },
    }))

    return {
      ...service,
      buy_rate_breakdown: buyRateBreakdown,
      ff_notes: ffNotes,
      buyConcepts: [...buyRateBreakdown, ...ffNotes, ...exportCharges, ...airCharges],
    }
  })
}

const getServicesBuyConcepts = async () => {
  try {
    loadingStore.start()
    services.value = []
    const body = {
      service_type: servicesResult.value.serviceType,
      servicesIds: servicesResult.value.services.map((service: any) => service.id),
    }
    const response: any = await $api.advancePayments.searchBuyConceptsForServices(body)
    if (response.length <= 0) {
      snackbar.add({ type: 'error', text: 'No services with buy charges found' })
    }

    services.value = response

    setBuyConceptsHomogenized()
  } catch (error) {
    console.error(error)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const onClickReqAdvPayment = async () => {
  try {
    loadingStore.start()
    let servicesWithSelectedPayments = services.value.map((service: any) => {
      return {
        id: service.id,
        class_name: service.class_name,
        buy_concepts: service.buyConcepts
          .filter((buyCharge: any) => buyCharge.selected)
          .map((buyCharge: any) => ({
            id: buyCharge.id,
            class_name: buyCharge.class_name,
          })),
      }
    })

    // remove services without selected buy charges
    servicesWithSelectedPayments = servicesWithSelectedPayments.filter(
      (service: any) => service.buy_concepts.length > 0
    )

    if (totalSelected.value <= 0) {
      snackbar.add({ type: 'error', text: 'No buy concepts selected' })
      return
    }
    if (!form.value.supplierId) {
      snackbar.add({ type: 'error', text: 'No supplier selected' })
      return
    }
    if (!form.value.origin_bank) {
      snackbar.add({ type: 'error', text: 'No origin bank account selected' })
      return
    }
    if (!form.value.supplier_bank) {
      snackbar.add({ type: 'error', text: 'No bank account selected' })
      return
    }

    const body = {
      services: servicesWithSelectedPayments,
      currency_id: form.value.currency_id,
      amount: form.value.amount,
      origin_bank_id: form.value.origin_bank.id,
      supplier_id: form.value.supplierId,
      bank_account_id: form.value.supplier_bank.id,
      notes: form.value.notes,
    }
    const response: any = await $api.advancePayments.requestAdvancePayment(body)
    snackbar.add({ type: 'success', text: 'Advance payment created' })
    router.push('/advance-payments')
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
    getServicesBuyConcepts()
  }
}

const hasReferences = computed(() => {
  return servicesResult.value.services?.length > 0
})

const hasReferencesWithBuyCharges = computed(() => {
  return services.value.length > 0
})

const hasCurrency = computed(() => {
  return form.value.currency_id != null
})
</script>
