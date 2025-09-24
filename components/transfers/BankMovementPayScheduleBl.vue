<template>
  <div>
    <div v-if="isValidBankMovement">
      <v-card color="blue-grey-lighten-5" class="mb-4">
        <v-card-title>
          <div class="flex justify-between">
            <div class="flex items-center gap-2">
              <v-icon size="x-small">mdi-receipt-text-plus-outline</v-icon>
              <div>Search Schedule BL payments</div>
            </div>
          </div>
        </v-card-title>
        <v-card-text>
          <div>
            <div class="mb-2">
              <AGlobalSearch :onSearch="searchLines" v-model="filters.line_id" label="Freight line *" hide-details />
            </div>
            <div v-if="filters.line_id">
              <span class="text-sm">Press ENTER to add the invoice number to search</span>
              <v-text-field
                v-model="filters.invoiceNumber"
                density="compact"
                label="Add Invoice numbers to search"
                @keyup.enter="addInvoiceToSearch"
              />
            </div>
          </div>
          <div v-if="filters.invoices.length > 0">
            <div>Search by</div>
            <div>
              <v-chip
                v-for="(invoiceNum, index) in filters.invoices"
                :key="`inv-${invoiceNum}`"
                closable
                class="mr-2 mb-2"
                @click:close="removeInvoiceToSearch(index)"
              >
                {{ invoiceNum }}
              </v-chip>
            </div>
            <div class="flex gap-2 mt-4">
              <v-btn size="small" color="secondary" @click="clearSearchInvoices">Clear</v-btn>
              <v-btn size="small" color="primary" :loading="loadingStore.loading" @click="searchLinePaySchedules"
                >Search BL Schedules</v-btn
              >
            </div>
          </div>
        </v-card-text>
      </v-card>

      <div class="grid grid-cols-1 gap-2">
        <div class="">
          <div class="max-w-xs mx-auto bg-white rounded-lg shadow-md overflow-hidden mt-2">
            <div class="bg-gray-100 px-4 py-2">
              <h2 class="text-lg font-medium text-gray-800">Bank movement #{{ bankMovement.id }}</h2>
            </div>
            <div class="px-4 py-5 sm:p-6">
              <div class="flex flex-col items-start justify-between mb-2">
                <span class="text-sm font-medium text-gray-600">Bank</span>
                <span class="text-lg font-medium text-gray-800"
                  >{{ bankMovement.bank_account?.bank_name }} ({{ bankMovement.bank_account?.currency?.code }})</span
                >
              </div>
              <div class="flex flex-row items-center justify-between mb-4">
                <div class="flex flex-col items-start">
                  <span class="text-sm font-medium text-gray-600">Acct number</span>
                  <span class="text-lg font-medium text-gray-800">{{ bankMovement.bank_account?.account_number }}</span>
                </div>
                <div class="flex flex-col items-start">
                  <span class="text-sm font-medium text-gray-600">In/Out</span>
                  <span
                    :class="{
                      'text-base text-gray-800 italic': true,
                      'text-green-700': bankMovement.type === 'deposit',
                      'text-red-700': bankMovement.type === 'withdrawal',
                    }"
                  >
                    {{ bankMovement.type }}
                  </span>
                </div>
              </div>
              <div class="flex flex-row items-center justify-between mb-4">
                <div class="flex flex-col items-start">
                  <span class="text-sm font-medium text-gray-600">Movement date</span>
                  <span class="text-lg font-medium text-gray-800">{{
                    formatDateOnlyString(bankMovement.movement_date)
                  }}</span>
                </div>
                <div class="flex flex-col items-start">
                  <span class="text-sm font-medium text-gray-600">Type</span>
                  <span class="text-base text-gray-800 italic">
                    {{ bankMovement.movement_type?.name }}
                  </span>
                </div>
              </div>
              <div class="flex flex-row items-center justify-between">
                <div class="flex flex-col items-start">
                  <span class="text-sm font-medium text-gray-600">Amount</span>
                  <span class="text-lg font-medium text-gray-800">{{ formatToCurrency(bankMovement.amount) }}</span>
                </div>
                <div class="flex flex-col items-start">
                  <span class="text-sm font-medium text-gray-600">Available Balance</span>
                  <span
                    class="text-lg font-bold text-gray-800 bg-green-200/50 border-dashed border-2 px-1 border-green-700"
                    >{{ formatToCurrency(bankMovement.amount_available) }}</span
                  >
                  <span v-if="getTotalCreditNotesSelected > 0" class="text-lg font-medium text-green-800"
                    >CN + {{ formatToCurrency(getTotalCreditNotesSelected) }}</span
                  >
                </div>
              </div>
              <div class="flex flex-col items-center justify-end bg-slate-100">
                <span class="text-sm font-medium text-gray-600">Used</span>
                <span class="text-lg font-medium text-gray-800">{{
                  formatToCurrency(bankMovement.amount - bankMovement.amount_available)
                }}</span>
              </div>
              <div class="flex flex-col items-center justify-end bg-slate-200">
                <span class="text-sm font-medium text-gray-600">Amount to Pay</span>
                <span class="text-lg font-medium text-gray-800">{{ formatToCurrency(amountToPayTotal) }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="col-span-1">
          <div v-if="hasLineInvoices" class="py-4">
            <v-alert type="info" color="amber" variant="tonal" density="compact">
              <div class="text-lg font-bold">Schedule BL Payments</div>
              <div class="grid grid-cols-1 gap-2">
                <v-card
                  v-for="(linePaySchedule, index) in linePaySchedulesInfo.linePaymentSchedules"
                  :key="`line-bl-schedule-pay-${index}`"
                  class="bg-blue-200! dark:bg-amber-900!"
                  density="compact"
                >
                  <v-card-title>Schedule BL Payment#{{ linePaySchedule.id }}</v-card-title>
                  <v-card-text>
                    <v-table density="compact">
                      <thead>
                        <tr>
                          <th class="font-bold!">Reference #</th>
                          <th class="font-bold!">Master BL</th>
                          <th class="font-bold!">Linked Line Invoices</th>
                          <th class="font-bold!">Amount</th>
                          <th class="font-bold!">Pending balance</th>
                          <th class="font-bold!">$ Selected Freight notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr
                          v-for="(scheduleRef, index2) in linePaySchedule.schedule_refs"
                          :key="`schedule-ref-${index}-${index2}`"
                        >
                          <td>{{ scheduleRef.referencia?.reference_number }}</td>
                          <td>{{ scheduleRef.ref_master_bl?.name }}</td>
                          <td>
                            <v-chip
                              v-for="(lineInvoiceRef, index3) in scheduleRef.line_invoice_refs"
                              :key="`invoice-ref-${index}-${index2}-${index3}`"
                              color="purple"
                              size="small"
                              class="mr-2"
                            >
                              #{{ lineInvoiceRef.line_invoice?.serie }}{{ lineInvoiceRef.line_invoice?.folio }}
                            </v-chip>
                          </td>
                          <td>{{ formatToCurrency(parseFloat(scheduleRef.amount)) }}</td>
                          <td>
                            {{
                              formatToCurrency(
                                parseFloat(scheduleRef.amount) -
                                  getLinkedLineInvoicesTotalPaid(scheduleRef) -
                                  getFreightNotesSelected(scheduleRef)
                              )
                            }}
                          </td>
                          <td>{{ formatToCurrency(getFreightNotesSelected(scheduleRef)) }}</td>
                        </tr>
                      </tbody>
                    </v-table>
                    <div class="grid grid-cols-2 gap-2 my-2">
                      <v-card class="bg-green-200! dark:bg-green-900!" density="compact">
                        <v-card-title>Selected on Credit Notes $</v-card-title>
                        <v-card-text>
                          <div class="text-3xl">{{ formatToCurrency(getCreditNotesSelected(linePaySchedule)) }}</div>
                        </v-card-text>
                      </v-card>

                      <v-card class="bg-red-200! dark:bg-red-900!" density="compact">
                        <v-card-title>Pending amount to justify</v-card-title>
                        <v-card-text>
                          <div class="text-3xl">
                            {{ formatToCurrency(getPendingAmount(linePaySchedule)) }}
                          </div>
                        </v-card-text>
                      </v-card>
                    </div>
                  </v-card-text>
                </v-card>
              </div>
            </v-alert>

            <!-- Si tiene credit notes se muestran aqui -->
            <v-alert
              v-if="linePaySchedulesInfo.lineCreditNotes.length <= 0"
              type="info"
              variant="outlined"
              density="compact"
            >
              <div class="text-lg font-bold">No credit notes available</div>
            </v-alert>

            <v-alert
              v-if="linePaySchedulesInfo.lineCreditNotes.length > 0"
              type="info"
              color="info"
              variant="tonal"
              density="compact"
            >
              <div class="text-lg font-bold">Credit Notes available:</div>
              <div>Select to rest the total amount.</div>
              <div class="grid grid-cols-3 gap-2">
                <v-card
                  v-for="(lineCreditNote, index) in linePaySchedulesInfo.lineCreditNotes"
                  :key="`line-credit-note-${index}`"
                  class="bg-blue-200! dark:bg-blue-900!"
                  density="compact"
                >
                  <v-card-title>Credit Note #{{ lineCreditNote.folio_real }}</v-card-title>
                  <v-card-text>
                    <v-autocomplete
                      v-model="lineCreditNote.line_pay_schedule_id"
                      :items="linePaySchedulesInfo.linePaymentSchedules"
                      :item-title="(item: any) => `Schedule BL Payment#${item.id}`"
                      item-value="id"
                      density="compact"
                      label="Select Schedule BL Payment"
                      @update:model-value="lineCreditNote.selected = false"
                    />
                    <div class="flex items-center">
                      <v-checkbox
                        v-model="lineCreditNote.selected"
                        :disabled="!lineCreditNote.line_pay_schedule_id"
                        hide-details
                      />
                      <div class="flex flex-col gap-2">
                        <span class="font-bold text-base"
                          >{{ getCurrencyName(lineCreditNote.currency_id) }}
                          {{ formatToCurrency(lineCreditNote.amount_available) }}
                        </span>
                        <span>
                          <UserInfoBadge :item="lineCreditNote">
                            @ {{ formatDateString(lineCreditNote.created_at) }}
                          </UserInfoBadge>
                        </span>
                      </div>
                    </div>
                  </v-card-text>
                </v-card>
              </div>
            </v-alert>

            <div class="font-bold text-lg">Freight notes</div>
            <div
              v-for="(lineInvoice, index) in linePaySchedulesInfo.lineInvoices"
              :key="`line-invoice-ref-${index}`"
              class="my-2"
            >
              <div v-for="(lineRef, index2) in lineInvoice.refs" :key="`line-invoice-ref-${index}-ref-${index2}`">
                <v-table density="compact" fixed-header>
                  <thead>
                    <tr>
                      <th class="font-bold!">Schedule BL #</th>
                      <th class="font-bold!">Freight note #</th>
                      <th class="font-bold!">Reference #</th>
                      <th class="font-bold!">Master BL</th>
                      <th class="font-bold!">Charge</th>
                      <th class="font-bold!">Amount</th>
                      <th class="font-bold!">Pending balance</th>
                      <th class="font-bold!">Pay amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(charge, index3) in lineRef.invoice.charges"
                      :key="`invoice-${index}-charge-${index2}-${index3}`"
                    >
                      <td>
                        <v-autocomplete
                          v-model="charge.line_pay_schedule_id"
                          :items="linePaySchedulesInfo.linePaymentSchedules"
                          :item-title="(item: any) => `Schedule BL Payment#${item.id}`"
                          :disabled="lineRef.has_line_pay_schedule_ref"
                          item-value="id"
                          density="compact"
                          label="Select Schedule BL Payment"
                        />
                      </td>
                      <td>
                        <div class="flex flex-col items-center gap-2">
                          <nuxt-link
                            :to="`/invoices/lines/notes/view-${lineInvoice.id}`"
                            target="_blank"
                            class="underline"
                          >
                            <v-icon>mdi-open-in-new</v-icon>
                            {{ lineInvoice.serie_folio }}
                          </nuxt-link>
                          <ButtonDownloadS3Object2 :s3Path="lineInvoice.attachment" />
                        </div>
                      </td>
                      <td>
                        <nuxt-link
                          :to="
                            lineRef.referencia?.impoExpo === 'I'
                              ? `/maritime/import/${lineRef.referencia?.id}`
                              : `/maritime/export/${lineRef.referencia?.id}`
                          "
                          target="_blank"
                          class="underline"
                        >
                          <v-icon>mdi-open-in-new</v-icon>
                          {{ lineRef.referencia?.reference_number }}
                        </nuxt-link>
                      </td>
                      <td>{{ lineRef.master_bl?.name }}</td>
                      <td>{{ charge.charge?.name }}</td>
                      <td>{{ formatToCurrency(parseFloat(charge.amount) + parseFloat(charge.amount_iva)) }}</td>
                      <td>
                        {{ formatToCurrency(charge.pending_balance) }}
                        <v-btn
                          size="x-small"
                          color="purple"
                          :disabled="!charge.line_pay_schedule_id"
                          @click="charge.amount_to_pay = charge.pending_balance"
                          >Set Max</v-btn
                        >
                      </td>
                      <td>
                        <div>
                          <v-text-field
                            v-model="charge.amount_to_pay"
                            type="number"
                            density="compact"
                            :disabled="!charge.line_pay_schedule_id"
                            :rules="[(v : any) => !!v || 'Amount is required']"
                            @update:model-value="checkMaxAmountToPay($event, charge)"
                          />
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </v-table>
              </div>
            </div>
            <v-btn color="primary" :loading="loadingStore.loading" @click="payInvoices"
              >Set payment to invoice(s) {{ formatToCurrency(amountToPayTotal) }}</v-btn
            >
          </div>

        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
const { $api, $notifications } = useNuxtApp()
const confirm = $notifications.useConfirm()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()
const router = useRouter()

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
})

const filters = ref<any>({
  invoiceNumber: '',
  line_id: null,
  invoices: [],
})

const bankMovement = ref<any>({})
const linePaySchedulesInfo = ref<any>({
  lineInvoices: [],
  linePaymentSchedules: [],
  lineCreditNotes: [],
})

const isValidBankMovement = computed(() => bankMovement.value.type === 'withdrawal')

const getTotalCreditNotesSelected = computed(() => {
  let total = 0
  linePaySchedulesInfo.value.lineCreditNotes?.forEach((creditNote: any) => {
    if (creditNote.selected) {
      total += parseFloat(creditNote.amount_available)
    }
  })

  return total
})

const getCreditNotesSelected = (linePaySchedule: any) => {
  let total = 0
  linePaySchedulesInfo.value.lineCreditNotes.forEach((creditNote: any) => {
    if (creditNote.line_pay_schedule_id === linePaySchedule.id && creditNote.selected) {
      total += parseFloat(creditNote.amount_available)
    }
  })

  return total
}

const getPendingAmount = (linePaySchedule: any) => {
  // TODO falta considerar las credit notes seleccionadas su monto
  let totalScheduled = linePaySchedule.schedule_refs.reduce((acc: any, scheduleRef: any) => {
    return acc + parseFloat(scheduleRef.amount)
  }, 0)

  const totalLinkedInvoices = linePaySchedule.schedule_refs.reduce((acc: any, scheduleRef: any) => {
    return acc + getLinkedLineInvoicesTotalPaid(scheduleRef)
  }, 0)
  const totalFreightNotes = totalFreightNotesSelected(linePaySchedule)

  return totalScheduled - totalFreightNotes - totalLinkedInvoices
}

const totalFreightNotesSelected = (linePaySchedule: any) => {
  let total = 0
  linePaySchedulesInfo.value.lineInvoices.forEach((lineInvoice: any) => {
    lineInvoice.refs.forEach((lineRef: any) => {
      lineRef.invoice.charges.forEach((charge: any) => {
        if (charge.line_pay_schedule_id === linePaySchedule.id) {
          total += parseFloat(charge.amount_to_pay || 0)
        }
      })
    })
  })

  return total
}

const getLinkedLineInvoicesTotalPaid = (scheduleRef: any) => {
  let total = 0
  scheduleRef.line_invoice_refs.forEach((lineInvoiceRef: any) => {
    const invoiceTotal = parseFloat(lineInvoiceRef.invoice?.total || 0)
    const totalPaidCharges = lineInvoiceRef.invoice?.charges.reduce((acc: any, charge: any) => {
      return acc + parseFloat(charge.amount_paid || 0)
    }, 0)

    total += totalPaidCharges
  })

  return total
}

const getFreightNotesSelected = (scheduleRef: any) => {
  let total = 0
  linePaySchedulesInfo.value.lineInvoices.forEach((lineInvoice: any) => {
    lineInvoice.refs.forEach((lineRef: any) => {
      lineRef.invoice.charges.forEach((charge: any) => {
        if (
          scheduleRef.referencia_id == lineRef.referencia_id &&
          charge.line_pay_schedule_id === scheduleRef.line_pay_schedule_id
        ) {
          total += parseFloat(charge.amount_to_pay || 0)
        }
      })
    })
  })

  return total
}

const getFreightNotesSelectedByLinePaySchedule = (linePaySchedule: any) => {
  let total = 0
  linePaySchedulesInfo.value.lineInvoices.forEach((lineInvoice: any) => {
    lineInvoice.refs.forEach((lineRef: any) => {
      lineRef.invoice.charges.forEach((charge: any) => {
        if (charge.line_pay_schedule_id === linePaySchedule.id) {
          total += parseFloat(charge.amount_to_pay || 0)
        }
      })
    })
  })

  return total
}

const amountToPayTotal = computed(() => {
  let total = 0
  linePaySchedulesInfo.value.lineInvoices?.forEach((lineInvoice: any) => {
    lineInvoice.refs.forEach((lineRef: any) => {
      lineRef.invoice.charges.forEach((charge: any) => {
        total += parseFloat(charge.amount_to_pay || 0)
      })
    })
  })

  return total
})

const areValidAmountsToPay = () => {
  let isValid = true
  linePaySchedulesInfo.value.linePaymentSchedules?.forEach((linePaySchedule: any) => {
    linePaySchedule.schedule_refs.forEach((scheduleRef: any) => {
      const maxTotal = parseFloat(scheduleRef.amount) - getLinkedLineInvoicesTotalPaid(scheduleRef)

      const totalAmount = linePaySchedulesInfo.value.lineInvoices.reduce((acc: any, lineInvoice: any) => {
        return (
          acc +
          lineInvoice.refs.reduce((acc2: any, lineRef: any) => {
            return (
              acc2 +
              lineRef.invoice.charges.reduce((acc3: any, charge: any) => {
                if (
                  lineRef.referencia_id === scheduleRef.referencia_id &&
                  charge.line_pay_schedule_id === scheduleRef.line_pay_schedule_id
                ) {
                  const val = Number(charge.amount_to_pay)
                  return acc3 + (isNaN(val) ? 0 : val)
                }
                return acc3
              }, 0)
            )
          }, 0)
        )
      }, 0)

      if (totalAmount > maxTotal + 0.01) {
        // tolerancia de redondeo
        console.warn(
          `Exceeds max allowed for scheduleRef ${scheduleRef.id} => totalAmount=${totalAmount}, maxTotal=${maxTotal}`
        )
        isValid = false
      }
    })
  })

  return isValid
}

const hasLineInvoices = computed(() => linePaySchedulesInfo.value.lineInvoices?.length > 0)

const addInvoiceToSearch = () => {
  if (filters.value.invoiceNumber) {
    // split by comma and remove empty spaces
    const refs = Array.from(
      new Set(
        filters.value.invoiceNumber
          .split(/,|;|\n|\s/)
          .filter(Boolean)
          .map((bl: string) => bl.trim())
      )
    )
    // remove duplicates in refs array using set

    refs.forEach((ref) => {
      filters.value.invoices.push(ref)
    })
    filters.value.invoices = [...new Set(filters.value.invoices)]
    filters.value.invoiceNumber = ''
  }
}
const removeInvoiceToSearch = (index: number) => {
  filters.value.invoices?.splice(index, 1)
}
const clearSearchInvoices = () => {
  filters.value.invoices = []
  linePaySchedulesInfo.value = []
}

const checkMaxAmountToPay = (value: any, charge: any) => {
  if (value > charge.pending_balance) {
    charge.amount_to_pay = charge.pending_balance
  }
}

const searchLines = async (search: any) => {
  try {
    const response = await $api.lines.searchLines({
      query: search,
    })
    return response
  } catch (error) {
    snackbar.add({
      type: 'error',
      text: 'Error fetching freight lines',
    })
  }
}

const payInvoices = async () => {
  try {
    if (!areValidAmountsToPay()) {
      snackbar.add({
        type: 'error',
        text: 'Amount to pay is invalid. Please verify amounts, the should be within BL Schedule payment amount.',
      })
      return
    }
    loadingStore.start()
    const creditNotes = linePaySchedulesInfo.value.lineCreditNotes.filter((creditNote: any) => creditNote.selected)
    const chargesToPay = [] as any
    linePaySchedulesInfo.value.lineInvoices.forEach((lineInvoice: any) => {
      lineInvoice.refs.forEach((lineRef: any) => {
        lineRef.invoice.charges.forEach((charge: any) => {
          chargesToPay.push({
            line_invoice_id: lineInvoice.id,
            line_invoice_ref_id: lineRef.id,
            line_pay_schedule_id: charge.line_pay_schedule_id,
            invoice_id: charge.invoice_id,
            chargeable_type: charge.chargeable_type,
            chargeable_id: charge.chargeable_id,
            charge_id: charge.charge_id,
            amount_to_pay: charge.amount_to_pay || 0,
          })
        })
      })
    })

    const body = {
      linePaySchedules: linePaySchedulesInfo.value.linePaymentSchedules,
      payments: chargesToPay,
      creditNotes,
    }
    await $api.bankMovements.payBlSchedules(bankMovement.value.id, body)

    snackbar.add({ type: 'success', text: 'Invoices paid successfully' })
    await getBankMovement()
    await searchLinePaySchedules()
  } catch (error) {
    console.error(error)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const searchLinePaySchedules = async () => {
  try {
    linePaySchedulesInfo.value = []
    loadingStore.start()
    const response: any = await $api.bankMovements.searchBLScheduleInvoices(bankMovement.value.id, filters.value)

    if (response.length <= 0) {
      snackbar.add({ type: 'info', text: 'No invoices found' })
    }

    // initialize selected in lineCreditNotes
    response.lineCreditNotes.forEach((creditNote: any) => {
      creditNote.selected = false
    })

    response.lineInvoices.forEach((lineInvoice: any) => {
      lineInvoice.refs.forEach((lineRef: any) => {
        lineRef.invoice.charges.forEach((charge: any) => {
          charge.line_pay_schedule_id = lineRef.line_pay_schedule_ref?.line_pay_schedule_id
          charge.amount_to_pay = 0
        })
      })
    })

    linePaySchedulesInfo.value = response
  } catch (error) {
    console.error(error)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const getBankMovement = async () => {
  try {
    loadingStore.start()
    const response: any = await $api.bankMovements.getMovement(props.id)

    bankMovement.value = response
    if (bankMovement.value.type !== 'withdrawal') {
      snackbar.add({ type: 'error', text: 'This is not a withdrawal bank movement' })
      router.back()
    }
  } catch (error) {
    console.error(error)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

await getBankMovement()
</script>
