<template>
  <div>
    <v-card>
      <v-card-title>Agent F.F. Notes - Payments request</v-card-title>
      <v-card-text>
        <div class="mb-4" @keyup.enter="onClickFilters">
          <div class="grid grid-cols-6 gap-4">
            <div class="col-span-2">
              <AGlobalSearch
                v-model="filters.freightId"
                :onSearch="searchFfs"
                validate-key="freightId"
                label="Freight Forwarder *"
              />
            </div>
            <div class="col-span-2">
              <AGlobalSearch
                v-model="filters.freightGroupId"
                :onSearch="searchFfGroups"
                validate-key="freightGroupId"
                label="Freight Forwarder Group"
              />
            </div>
            <div class="col-span-1">
              <v-text-field v-model="filters.startDate" clearable type="date" density="compact" label="Start date" />
            </div>
            <div class="col-span-1">
              <v-text-field v-model="filters.endDate" clearable type="date" density="compact" label="End date" />
            </div>
            <div class="col-span-1">
              <v-text-field v-model="filters.id" clearable density="compact" label="# Request Payment" />
            </div>
            <div class="col-span-2">
              <v-autocomplete
                density="compact"
                label="Active / Inactive"
                v-model="filters.deleted_status"
                :items="deletedStatus"
                item-title="name"
                item-value="value"
                hide-details
              />
            </div>
            <div class="col-span-2">
              <v-autocomplete
                density="compact"
                label="Status"
                v-model="filters.status"
                :items="[
                  { name: 'Pending', value: 'pending' },
                  { name: 'Paid', value: 'paid' },
                  { name: 'All', value: 'all' },
                ]"
                item-title="name"
                item-value="value"
                hide-details
              />
            </div>
          </div>
          <div class="grid grid-cols-1">
            <div class="flex gap-2">
              <v-btn color="secondary" @click="clearFilters"> Clear </v-btn>
              <v-btn color="primary" @click="onClickFilters"> Search </v-btn>
            </div>
          </div>
        </div>

        <div v-if="hasCheckedNotes" class="flex gap-2 mb-4 border p-2">
          <v-btn color="green" size="small" variant="tonal" @click="showSendPaymentRequest">
            Send payment request
          </v-btn>
        </div>

        <div class="flex gap-2 mb-4">
          <v-chip color="green"
            ><span class="inline-block w-5 h-5 bg-green-500 mr-2"></span>Payment request sent</v-chip
          >
          <v-chip color="orange"><span class="inline-block w-5 h-5 bg-orange-500 mr-2"></span>Payment pending</v-chip>
        </div>

        <v-pagination
          v-model="ffPayments.current_page"
          :length="ffPayments.last_page"
          rounded="circle"
          density="compact"
          @update:model-value="onClickPagination"
        ></v-pagination>
        <v-table density="compact">
          <thead>
            <tr>
              <th class="text-left" width="50">Actions</th>
              <th class="text-left" width="50">Send payment request</th>
              <th class="text-left">Folio</th>
              <th class="text-left">Freight Forwarder</th>
              <th class="text-left">Amount</th>
              <th class="text-left">SOA (PDF)</th>
              <th class="text-left">SOA (Excel)</th>
              <th class="text-left">Created by</th>
              <th class="text-left">Payment pending</th>
              <th class="text-left">Payment sent</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(ffpayment, idx) in ffPayments.data"
              :key="ffpayment.id"
              :class="{
                'dark:hover:bg-gray-700 hover:bg-slate-300': true,
                'bg-red-100! dark:bg-red-900!': ffpayment.deleted_at,
              }"
            >
              <td>
                <div class="flex gap-2">
                  <ViewButton :item="ffpayment" @click="viewFfReqPayment(ffpayment)" />
                  <div v-if="ffpayment.sent_at == null && ffpayment.deleted_at == null">
                    <TrashButton :item="ffpayment" @click="deleteFfPayment(ffpayment)" />
                  </div>
                </div>
              </td>
              <td>
                <div v-if="ffpayment.sent_at == null && ffpayment.deleted_at == null">
                  <v-checkbox v-if="false" v-model="ffpayment.checked_email" density="compact" hide-details />
                  <v-btn color="green" size="small" variant="tonal" @click="showSendPaymentRequest(ffpayment)">
                    Send payment request
                  </v-btn>
                </div>
              </td>
              <td>Req. Pay#{{ ffpayment.id }}</td>
              <td>{{ ffpayment.forwarderable?.name }} {{ getForwarderableType(ffpayment) }}</td>
              <td>{{ getCurrencyName(ffpayment.currency_id) }} {{ formatToCurrency(ffpayment.amount) }}</td>
              <td>
                <v-btn color="primary" size="small" variant="tonal" @click="downloadFfPaymentPdf(ffpayment)"
                  ><v-icon>mdi-cloud-download</v-icon> PDF
                </v-btn>
              </td>
              <td>
                <v-btn color="primary" size="small" variant="tonal" @click="downloadFfPaymentExel(ffpayment)"
                  ><v-icon>mdi-cloud-download</v-icon> Excel
                </v-btn>
              </td>
              <td class="whitespace-nowrap">
                <UserInfoBadge :item="ffpayment">
                  {{ formatDateString(ffpayment.created_at) }}
                </UserInfoBadge>
              </td>
              <td>
                <div v-if="ffpayment.invoice?.is_paid == 0">Pending payment</div>
                <div v-if="ffpayment.invoice?.is_paid == 1">Paid</div>
                <div v-for="(charge, index) in ffpayment.invoice?.charges" :key="`ffpay-${idx}-c-${index}`">
                  <div v-for="(payment, index2) in charge.payments" :key="`ffpay-${idx}-c-${index}-p-${index2}`">
                    <v-chip color="blue" text-color="white" small @click="viewPayment(payment)"
                      ><v-icon>mdi-eye-outline</v-icon>Payment #{{ payment.id }}
                      {{ formatToCurrency(payment.amount) }}</v-chip
                    >
                  </div>
                </div>
              </td>
              <td>
                <div v-if="ffpayment.sent_at == null">
                  <v-icon color="orange">mdi-alert</v-icon>
                </div>
                <div v-if="ffpayment.sent_at != null">
                  <v-icon color="green">mdi-check</v-icon>
                  <div>{{ formatDateString(ffpayment.sent_at) }}</div>
                  <div>{{ ffpayment.sent_user?.name }}</div>
                </div>
              </td>
            </tr>
          </tbody>
        </v-table>
        <v-pagination
          v-model="ffPayments.current_page"
          :length="ffPayments.last_page"
          rounded="circle"
          density="compact"
          @update:model-value="onClickPagination"
        ></v-pagination>
        <div class="text-xs">
          Showing {{ ffPayments.from }} to {{ ffPayments.to }} from {{ ffPayments.total }} total records
        </div>
      </v-card-text>
    </v-card>
    <v-dialog v-model="sendPayment.show" max-width="800">
      <v-card>
        <v-card-title>Request for payment SOA F.F.</v-card-title>
        <v-card-text>
          <div class="text-sm">
            <p>Please review the following information.</p>
          </div>
          <div v-if="agentHasToPay">
            <v-text-field v-model="sendPayment.subject" label="Email Subject" density="compact" />
          </div>
          <v-textarea v-model="sendPayment.to" label="TO" rows="2" density="compact" />
          <v-textarea v-model="sendPayment.message" label="Message" :rows="7" density="compact" />
        </v-card-text>
        <v-card-actions>
          <v-btn color="secondary" @click="closeSendPaymentRequest"> Cancel </v-btn>
          <v-btn color="primary" @click="sendPaymentRequest"> Send payment request</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script setup lang="ts">
import { deletedStatus } from '~/utils/data/systemData'
import { bankAccounts } from '~/utils/data/systemData'
const { $api, $notifications } = useNuxtApp()
const confirm = $notifications.useConfirm()
const snackbar = useSnackbar()
const router = useRouter()

const loadingStore = useLoadingStore()

const filters = ref<any>({
  startDate: '',
  endDate: '',
  id: '',
  freightId: '',
  freightGroupId: '',
  deleted_status: 'active',
  status: 'pending',
})

let catalogs = reactive({
  freights: [],
})

const sendPayment = ref<any>({
  show: false,
  ffPayment: null,
  subject: '',
  to: '',
  message: '',
})

const ffPayments = ref({
  data: [] as any,
  current_page: 1,
  page: 1,
  last_page: 1,
  from: 1,
  to: 1,
  total: 0,
})

const agentHasToPay = computed(() => {
  return parseFloat(sendPayment.value.ffPayment?.amount) > 0
})

const hasCheckedNotes = computed(() => {
  return ffPayments.value.data.some((note: any) => note.checked_email)
})

const searchFfGroups = async (params: any) => {
  try {
    const response = await $api.freightForwarders.searchFfGroups({
      query: params,
    })
    return response
  } catch (error) {
    snackbar.add({
      type: 'error',
      text: 'Error fetching freight forwarder groups',
    })
  }
}

const showSendPaymentRequest = async (ffPayment: any) => {
  sendPayment.value.ffPayment = ffPayment
  sendPayment.value.show = true
  const agente = ffPayment.forwarderable?.name || '-'
  // replace {agente} {monto} with selected notes
  // TODO falta mostrar los datos para pago en el mensaje, si es TM son los de WM ya se sabe y si es del agente se debe mostrar

  // Cuando es negativo es por que hay que pagarle al agente
  if (parseFloat(ffPayment.amount) < 0) {
    const bankData = ffPayment.forwarderable?.banks[0] || {}
    const bank = `
      Banco: ${bankData.bank?.name || ''}
      Nombre del beneficiario: ${bankData.beneficiary_name || ''}
      Dirección del beneficiario: ${bankData.beneficiary_address || ''}${
      bankData.beneficiary_city ? ', ' + bankData.beneficiary_city : ''
    }${bankData.beneficiary_zip_code ? ', ' + bankData.beneficiary_zip_code : ''}${bankData.country?.name}
      Cuenta: ${bankData.account_number || ''}
      CLABE: ${bankData.clabe || ''}
      ABA: ${bankData.aba || ''}
      SWIFT: ${bankData.swift || ''}
      IBAN: ${bankData.iban || ''}
      Correo beneficiario: ${bankData.beneficiary_email || ''}
      Teléfono beneficiario: ${bankData.beneficiary_phone || ''}
      Moneda: ${getCurrencyName(bankData.currency_id) || ''}
      `.trim()
    sendPayment.value.to =
      'cparrajr@naviomar.com,raul.espejo@naviomar.com,mos@tmultimod.com,aldo.campos@naviomar.com,pedro.aguirre@naviomar.com,liliana.meneses@naviomar.com'
    sendPayment.value.message = `Buen día ! \n
      Por favor programar el pago de ${formatToCurrency(Math.abs(ffPayment.amount))} ${getCurrencyName(
      ffPayment.currency_id
    )} para los siguientes Agentes. \n 
      ${agente} \n
      Datos para pago: \n
      ${bank} \n
      Saludos,`
  }

  // Cuando es positivo es por que el agente nos paga a nosotros
  if (parseFloat(ffPayment.amount) > 0) {
    const wmBank = bankAccounts.find((b: any) => b.type === 'wm')
    const bankDetail = `
      Banco: ${wmBank?.bank || ''}
      Nombre del beneficiario: ${wmBank?.beneficiary || ''}
      Cuenta: ${wmBank?.account_number || ''}
      Swift Code: ${wmBank?.swift || ''}
      ABA Code: ${wmBank?.aba || ''}
      Dirección: ${wmBank?.bank_address || ''}
      País: ${wmBank?.country || ''}
      Moneda: ${wmBank?.currency || ''}
      `.trim()

    sendPayment.value.to = ''
    sendPayment.value.message = `Buen día ! \n
      Agente ${agente} favor de realizar el pago correspondiente. \n 
      ${formatToCurrency(ffPayment.amount)} ${getCurrencyName(ffPayment.currency_id)} \n
      Datos para realizar el pago: \n
      ${bankDetail} \n
      Saludos,`
  }
}

const closeSendPaymentRequest = async () => {
  sendPayment.value.show = false
}

const getForwarderableType = (ffpayment: any) => {
  // if contains FreightGroup return Group else return Freight
  return ffpayment.forwarderable_type.includes('FreightGroup') ? ' (Group)' : ''
}

const sendPaymentRequest = async () => {
  try {
    // Validar que haya al menos un correo
    if (!sendPayment.value.to || !sendPayment.value.to.trim()) {
      snackbar.add({ type: 'error', text: 'Debes ingresar al menos un correo en el campo TO.' })
      return
    }

    // Validar que el subject tenga valor si el campo es visible (cuando agentHasToPay es true)
    if (agentHasToPay.value && (!sendPayment.value.subject || !sendPayment.value.subject.trim())) {
      snackbar.add({ type: 'error', text: 'El campo Asunto (Subject) es obligatorio.' })
      return
    }

    loadingStore.loading = true
    const body = {
      ff_payment_id: sendPayment.value.ffPayment.id,
      subject: sendPayment.value.subject,
      to: sendPayment.value.to,
      message: sendPayment.value.message,
    }
    const response = await $api.ffNotes.sendEmailFfPayment(body)
    snackbar.add({ type: 'success', text: 'Payment request sent' })

    sendPayment.value = {
      show: false,
      ffPayment: null,
      subject: '',
      to: '',
      message: '',
    }
    await getFreightPayments()
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const searchFfs = async (params: any) => {
  try {
    const response = await $api.freightForwarders.searchFfs({
      query: params,
    })
    return response
  } catch (error) {
    snackbar.add({
      type: 'error',
      text: 'Error fetching freight forwarders',
    })
  }
}

const onClickFilters = async () => {
  // set current page to 1
  ffPayments.value.current_page = 1
  await getFreightPayments()
}

const onClickPagination = async (page: number) => {
  ffPayments.value.current_page = page
  await getFreightPayments()
}

const downloadFfPaymentPdf = async (ffpayment: any) => {
  try {
    loadingStore.loading = true
    const response = await $api.ffNotes.downloadFfPaymentPdf(ffpayment.id)
    const blob = new Blob([response], { type: 'application/pdf' })
    const url = window.URL.createObjectURL(blob)
    window.open(url)
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const downloadFfPaymentExel = async (ffpayment: any) => {
  try {
    loadingStore.loading = true
    const response = await $api.ffNotes.downloadFfPaymentExel(ffpayment.id)
    const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = window.URL.createObjectURL(blob)
    window.open(url)
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const getFreightPayments = async () => {
  try {
    // if (!filters.value.freightId && !filters.value.freightGroupId) {
    //   snackbar.add({ type: 'error', text: 'Please select a Freight Forwarder or group' })
    //   return
    // }
    loadingStore.loading = true
    const response = await $api.freightForwarders.getNotesPayments({
      query: {
        ...flattenArraysToCommaSeparatedString(filters.value),
        page: ffPayments.value.current_page,
      },
    })

    ffPayments.value = response as any
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const viewFfReqPayment = (ffpayment: any) => {
  router.push(`/payments/agents/payments/view-${ffpayment.id}`)
}

const viewPayment = (payment: any) => {
  // console.log('payment', payment)
  if (payment.paymentable_type.includes('BankMovement')) {
    router.push(`/transfers/global/view-${payment.paymentable_id}?focusPayable=${payment.id}`)
    return
  }
  console.error('Unknown payment type')
}

const deleteFfPayment = async (ffpayment: any) => {
  const result = await confirm({
    title: 'Are you sure?',
    confirmationText: 'Update',
    content: 'Please confirm you want to delete this payment request.',
    dialogProps: {
      persistent: true,
      maxWidth: 500,
    },
    confirmationButtonProps: {
      color: 'primary',
    },
  })

  if (result) {
    try {
      loadingStore.loading = true
      await $api.ffNotes.deletePayment(ffpayment.id)

      snackbar.add({ type: 'success', text: 'Payment request deleted' })
      await getFreightPayments()
    } catch (e) {
      console.error(e)
    } finally {
      setTimeout(() => {
        loadingStore.stop()
      }, 250)
    }
  }
}

const clearFilters = async () => {
  filters.value = {
    startDate: '',
    endDate: '',
    id: '',
    freightId: '',
    freightGroupId: '',
    deleted_status: 'active',
    status: 'pending',
  }
  await getFreightPayments()
}

const getCatalogs = async () => {
  try {
    const response = await $api.ffNotes.getSoaCatalogs()
    catalogs = response as any
  } catch (e) {
    console.error(e)
  }
}

await getCatalogs()
await getFreightPayments()
</script>
