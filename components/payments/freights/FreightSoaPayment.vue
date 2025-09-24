<template>
  <div>
    <v-card>
      <v-card-title>Agents F.F. SOA - Credit / debit notes</v-card-title>
      <v-card-subtitle>Check and send notes to pay</v-card-subtitle>
      <v-card-text>
        <div class="mb-4" @keyup.enter="onClickFilters">
          <div class="grid grid-cols-4 gap-4">
            <div class="col-span-2">
              <AFreightForwarderSearch v-if="false" v-model="filters.freightId" label="Freight forwarder" />
              <v-autocomplete
                v-model="filters.freightId"
                clearable
                :items="freightForwarders"
                item-title="name"
                item-value="id"
                density="compact"
                label="Freight forwarder"
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
              <v-autocomplete
                v-model="filters.currencyId"
                clearable
                :items="currencies"
                item-title="name"
                item-value="id"
                density="compact"
                label="Currency"
              />
            </div>
            <div v-if="false" class="col-span-1">
              <v-text-field v-model="filters.folio" clearable density="compact" label="# Note" />
            </div>
          </div>
          <div class="grid grid-cols-1">
            <div class="flex gap-2">
              <v-btn size="small" color="secondary" @click="clearFilters"> Clear </v-btn>
              <v-btn size="small" color="primary" @click="getFreightSoa"> Search </v-btn>
            </div>
          </div>
        </div>

        <div>
          <div class="flex gap-2 mb-4">
            <v-btn color="primary" size="small" variant="tonal" @click="checkAll"> Check all </v-btn>
            <v-btn color="primary" size="small" variant="tonal" @click="uncheckAll"> Uncheck all </v-btn>
          </div>

          <div v-if="hasCheckedNotes" class="flex gap-2 mb-4 border p-2">
            <v-btn v-if="false" color="green" size="small" variant="tonal" @click="checkNotes"> Check note</v-btn>
            <v-btn color="purple" size="small" variant="outlined" @click="generatePdf"> PDF </v-btn>
            <v-btn color="lime" size="small" variant="outlined" @click="generateExcel"> Excel </v-btn>

            <v-btn color="green" size="small" variant="elevated" @click="lockFfNotes('lock')">
              <v-icon>mdi-lock-outline</v-icon>Lock {{ countCheckedNotes }} notes
            </v-btn>
            <v-btn color="amber" size="small" variant="elevated" @click="lockFfNotes('unlock')">
              <v-icon>mdi-lock-open-outline</v-icon>Unlock {{ countCheckedNotes }} notes
            </v-btn>
            <v-btn color="green" size="small" variant="elevated" @click="sendToPay">
              Request payment for {{ countCheckedNotes }} notes
            </v-btn>
          </div>

          <div class="font-bold">Labels color meaning</div>
          <div class="flex gap-2 mb-4">
            <v-chip color="orange"><span class="inline-block w-5 h-5 bg-yellow-600 mr-2"></span>Check note</v-chip>
            <v-chip color="blue"><span class="inline-block w-5 h-5 bg-blue-600 mr-2"></span>Payment request</v-chip>
            <v-chip color="red"><span class="inline-block w-5 h-5 bg-red-700 mr-2"></span>Cancelled note</v-chip>
          </div>

          <v-alert v-if="maxCreditNotesFound" type="warning" density="compact">
            <v-icon>mdi-alert-circle</v-icon> Warning - Too many notes found. (Max 2000 per request.)
          </v-alert>
          <v-table density="compact" class="overflow-x-auto table-nowrap scroll-bold">
            <thead>
              <tr>
                <th class="text-left">Actions</th>
                <th v-if="hasCheckedNotes" class="text-left min-w-48">Note #</th>
                <th class="text-left">Payment request</th>
                <th class="text-left">Vessel</th>
                <th class="text-left">Date</th>
                <th class="text-left">DN / CN #</th>

                <th class="text-left">Credit Note</th>
                <th class="text-left">Debit Note</th>
                <th class="text-left bg-orange-500!">Balance</th>
                <th class="text-left">Service Ref #</th>
                <th class="text-left">BL</th>
                <th class="text-left">Customer</th>

                <th class="text-left">F.F. Agent</th>
                <th class="text-left">F.F. Group</th>
                <th class="text-left">Type</th>
                <th class="text-left">Base currency</th>

                <th class="text-left">Buy rate (USD)</th>
                <th class="text-left">PP/CC</th>
                <th class="text-left">Sell rate (USD)</th>
                <th class="text-left">PP/CC</th>
                <th class="text-left">Profit sell</th>
                <th class="text-left">Rebate</th>
                <th class="text-left bg-indigo-300! dark:bg-indigo-700!">Profit</th>
                <th class="text-left bg-sky-300! dark:bg-sky-700!">Freight payment</th>

                <th v-for="containerType in containerTypes" :key="`th-cont-type-${containerType.id}`" class="text-left">
                  {{ containerType.name }}
                </th>

                <th class="text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(note, index) in creditNotes" :key="`note-${index}`" :class="columnClass(note)">
                <td>
                  <div class="flex gap-2 items-center">
                    <div v-if="!isNotePending(note)">
                      <v-tooltip location="top">
                        <template v-slot:activator="{ props }">
                          <v-icon v-bind="props" class="ml-1 cursor-pointer">mdi-alert-outline</v-icon>
                        </template>
                        <div>Missing:</div>
                        <div>{{ ffNoteMissingThings(note) }}</div>
                      </v-tooltip>
                      <v-file-input
                        v-model="note.file"
                        density="compact"
                        label="Attachment"
                        @update:model-value="uploadFfNoteAttachment(note)"
                      />
                    </div>
                    <div v-if="isNotePending(note)">
                      <v-checkbox v-model="note.checked" density="compact" hide-details />
                    </div>
                    <div v-if="!note.deleted_at">
                      <v-icon v-if="note.checked_at == null" color="orange">mdi-lock-open-outline</v-icon>
                      <v-icon v-if="note.checked_at != null" color="green" @click="confirmUnlockNote(note)"
                        >mdi-lock-outline</v-icon
                      >
                    </div>
                  </div>
                </td>
                <td v-if="hasCheckedNotes">
                  <div v-if="note.checked">
                    <v-text-field v-model="note.notes" density="compact" hide-details />
                    <span class="text-xs text-gray-500 dark:text-white">Observations</span>
                  </div>
                </td>
                <td>
                  <div v-if="note.note_payment != null">
                    <v-chip color="blue" size="small" @click="viewFfReqPayment(note.note_payment)">
                      <div class="flex gap-2">
                        <v-icon>mdi-eye-outline</v-icon>
                        Payment request #{{ note.note_payment?.ff_payment_id }}
                      </div>
                    </v-chip>
                  </div>
                  <div v-if="note.note_payment == null">
                    <v-chip color="orange" size="small">Pending</v-chip>
                  </div>
                </td>
                <td class="whitespace-nowrap">
                  {{ getVesselFromServiceable(note) }}
                </td>
                <td class="whitespace-nowrap">
                  <UserInfoBadge :item="note">
                    {{ formatDateString(note.created_at) }}
                  </UserInfoBadge>
                </td>
                <td class="whitespace-nowrap font-bold">
                  <v-chip color="blue" size="small" @click="viewFfNote(note.id)">
                    <div class="flex gap-2">
                      <v-icon>mdi-eye-outline</v-icon>
                      #{{ note.folio }}
                    </div>
                  </v-chip>
                </td>

                <td>
                  {{ getCreditAmountLogic(note) }}
                </td>
                <td>
                  {{ getDebitAmountLogic(note) }}
                </td>
                <td class="bg-orange-500!">{{ formatToCurrency(sumUpToIndex(index)) }}</td>
                <td>
                  <div v-if="!note.serviceable">
                    <v-chip size="small" color="primary"> No Ref# linked </v-chip>
                  </div>
                  <div v-if="note.serviceable">
                    <v-chip size="small" color="primary"> {{ note.serviceable?.reference_number }} </v-chip>
                  </div>
                </td>
                <td>{{ getMasterBlFromServiceable(note) }}</td>
                <td class="whitespace-nowrap">{{ note.serviceable?.consignee?.name }}</td>

                <td class="whitespace-nowrap">{{ note.forwarder?.name }}</td>
                <td class="whitespace-nowrap">{{ note.forwarder?.freight_group?.name }}</td>

                <td class="whitespace-nowrap">
                  {{ note.inbound == 1 ? 'From Agent' : 'From TM' }} / {{ note.type === 'C' ? 'Credit' : 'Debit' }}
                </td>
                <td>{{ getCurrencyName(note.currency_id) }}</td>

                <td>{{ formatToCurrency(getByServiceTotalBuy(note)) }}</td>
                <td>{{ note.serviceable?.buy_rate_type }}</td>
                <td>{{ formatToCurrency(getByServiceTotalSell(note)) }}</td>
                <td>{{ note.serviceable?.sell_rate_type }}</td>
                <td>{{ getProfitSell(note) }}</td>
                <td>
                  {{ getCurrencyName(note.serviceable?.rebate_currency_id) }}
                  {{ formatToCurrency(note.serviceable?.rebate) }}
                </td>
                <td class="bg-indigo-300! dark:bg-indigo-700!">{{ note.profit }}</td>
                <td class="bg-sky-300! dark:bg-sky-700!">{{ note.freight_payment }}</td>

                <td v-for="containerType in containerTypes" :key="`td-cont-type-${containerType.id}`" class="text-left">
                  {{ getTotalContainersByType(note.serviceable, containerType) }}
                </td>

                <td>
                  <div v-if="note.deleted_at" class="flex gap-2">
                    <v-icon color="">mdi-delete</v-icon>
                    <span>Notes: {{ note.cancelled_reason }}</span>
                  </div>
                  <div v-if="!note.deleted_at">
                    <v-icon color="green">mdi-check</v-icon>
                  </div>
                </td>
              </tr>
            </tbody>
          </v-table>

          <div class="flex justify-center p-4">
            <v-card>
              <v-card-title>
                <div v-if="checkedTotalBalance < 0" class="text-red-500">Total balance due to F.F. Agent</div>
                <div v-else class="text-green-500">Total balance due to TM</div>
              </v-card-title>
              <v-card-text>
                <div class="text-lg text-center">{{ formatToCurrency(checkedTotalBalance) }}</div>
              </v-card-text>
            </v-card>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>
<script setup lang="ts">
import { currencies } from '@/utils/data/systemData'

const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const router = useRouter()
const loadingStore = useLoadingStore()

const filters = ref<any>({
  startDate: '',
  endDate: '',
  creditDebit: '',
  type: '',
  folio: '',
  freightId: null,
  freightGroupId: null,
  currencyId: null,
})

const creditNotes = ref<any>([])
const freightForwarders = ref<any>([])
let containerTypes: any = []

const columnClass = (note: any) => {
  if (note.note_payment != null) {
    return {
      'bg-blue-100': true,
    }
  }
  return {
    'dark:hover:bg-gray-700 hover:bg-slate-300': true,
    'bg-red-100! dark:bg-red-900!': note.deleted_at,
  }
}

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

const ffNoteMissingThings = (note: any) => {
  const missing = []
  if (note.inbound === 1 && note.attachment == null) {
    missing.push('Attachment')
  }
  if (note.deleted_at != null) {
    missing.push('Cancelled')
  }
  if (note.note_payment != null) {
    missing.push('Payment request')
  }
  return missing.join(', ')
}

const isNotePending = (note: any) => {
  if (note.deleted_at != null) {
    return false
  }
  if (note.note_payment != null) {
    return false
  }
  if (note.inbound === 1 && note.attachment == null) {
    return false
  }
  return true
}

const checkAll = () => {
  creditNotes.value.forEach((note: any) => {
    if (isNotePending(note)) {
      note.checked = true
    }
  })
}

const uncheckAll = () => {
  creditNotes.value.forEach((note: any) => {
    note.checked = false
  })
}

const getCreditAmountLogic = (note: any) => {
  // From Agent and Credit
  if (note.inbound == 1 && note.type == 'C') {
    return formatToCurrency(note.amount_total)
  }
  if (note.inbound == 0 && note.type == 'D') {
    return formatToCurrency(note.amount_total)
  }
  return ''
}

const getDebitAmountLogic = (note: any) => {
  if (note.inbound == 1 && note.type == 'D') {
    return formatToCurrency(-Math.abs(note.amount_total))
  }
  if (note.inbound == 0 && note.type == 'C') {
    return formatToCurrency(-Math.abs(note.amount_total))
  }
  return ''
}

const hasCheckedNotes = computed(() => {
  return creditNotes.value.some((note: any) => note.checked)
})

const countCheckedNotes = computed(() => {
  return creditNotes.value.filter((note: any) => note.checked).length
})

const checkedNotes = computed(() => {
  return creditNotes.value.filter((note: any) => note.checked)
})

const maxCreditNotesFound = computed(() => {
  return creditNotes.value.length >= 2000
})

const sumUpToIndex = (index: number) => {
  let sum = 0
  for (let i = 0; i <= index; i++) {
    if (isNotePending(creditNotes.value[i])) {
      sum += getRealAmount(creditNotes.value[i])
    }
  }
  return sum
}

const getRealAmount = (note: any) => {
  // if From Agent and Debit rest amount
  if (note.inbound == 1 && note.type == 'D') {
    return -parseFloat(note.amount_total)
  }
  // if From Agent and Credit add amount
  if (note.inbound == 1 && note.type == 'C') {
    return parseFloat(note.amount_total)
  }
  // if From TM and Credit rest amount
  if (note.inbound == 0 && note.type == 'C') {
    return -parseFloat(note.amount_total)
  }
  // if From TM and Debit add amount
  if (note.inbound == 0 && note.type == 'D') {
    return parseFloat(note.amount_total)
  }
  return 0
}

const getServiceType = (item: any) => {
  const serviceType = item.serviceable_type
  if (!serviceType) return 'No service type'
  let service = 'Unknown'
  if (serviceType.includes('Referencia')) {
    service = `Sea ${item.impoExpo === 'I' ? 'Import' : 'Export'}`
  }
  if (serviceType.includes('AirReference')) {
    service = `Air ${item.impoExpo === 'I' ? 'Import' : 'Export'}`
  }

  return service
}

const viewFfReqPayment = (notePayment: any) => {
  router.push(`/payments/agents/payments/view-${notePayment.ff_payment_id}`)
}

const viewFfNote = (noteId: number) => {
  router.push(`/invoices/ffagents/notes/view-${noteId}`)
}

const getVesselFromServiceable = (note: any) => {
  if (!note.serviceable) {
    return 'No service linked'
  }
  const serviceType = note.serviceable_type
  if (serviceType.includes('Referencia')) {
    return `⚓ ${note.serviceable?.voyage_discharge?.short_name}`
  }
  if (serviceType.includes('AirReference')) {
    return `✈️ ${note.serviceable?.airline?.name}`
  }
}

const getMasterBlFromServiceable = (note: any) => {
  if (!note.serviceable) {
    return 'No service linked'
  }
  const serviceType = note.serviceable_type
  if (serviceType.includes('Referencia')) {
    return note.serviceable?.master_bls?.map((bl: any) => bl.name).join(', ')
  }
  if (serviceType.includes('AirReference')) {
    return note.serviceable?.master_awb
  }
}

const checkedTotalBalance = computed(() => {
  return creditNotes.value.reduce((acc: number, note: any) => {
    if (note.checked) {
      if (isNotePending(note)) {
        acc += getRealAmount(note)
      }
    }
    return acc
  }, 0)
})

const getByServiceTotalBuy = (note: any) => {
  if (!note.serviceable) {
    return 0
  }
  // if serviceable class_name is Referencia sum buy_rate_breakdown
  if (note.serviceable.class_name.includes('Referencia')) {
    // TODO if serviceable.impoExpo is 'I' then use buy_rate_breakdown else use export_charges
    if (note.serviceable.impoExpo === 'I') {
      return note.serviceable.buy_rate_breakdown
        .map((br: any) => parseFloat(br.amount))
        .reduce((acc: number, buyRate: number) => acc + buyRate, 0)
    }
    if (note.serviceable.impoExpo === 'E') {
      // Sum export_charges amounts where type is 'buyer'
      return note.serviceable.export_charges
        .filter((charge: any) => charge.buy_amount != null)
        .map((charge: any) => parseFloat(charge.buy_amount))
        .reduce((acc: number, exportCharge: number) => acc + exportCharge, 0)
    }
  }

  // if serviceable class_name is AirReference sum charges
  if (note.serviceable.class_name.includes('AirReference')) {
    return note.serviceable.charges
      .filter((charge: any) => charge.buy_amount != null)
      .map((ch: any) => parseFloat(ch.amount))
      .reduce((acc: number, charge: number) => acc + charge, 0)
  }

  return 0
}

const getByServiceTotalSell = (note: any) => {
  if (!note.serviceable) {
    return 0
  }
  // if serviceable class_name is Referencia sum sell_rate_breakdown and charges
  if (note.serviceable.class_name.includes('Referencia')) {
    if (note.serviceable.impoExpo === 'I') {
      const sellRateBreakdown = note.serviceable.sell_rate_breakdown
        .map((br: any) => parseFloat(br.amount))
        .reduce((acc: number, sellRate: number) => acc + sellRate, 0)

      const charges = note.serviceable.charges
        .map((ch: any) => parseFloat(ch.amount))
        .reduce((acc: number, charge: number) => acc + charge, 0)

      return sellRateBreakdown + charges
    }

    if (note.serviceable.impoExpo === 'E') {
      // Sum export_charges amounts where type is 'seller'
      return note.serviceable.export_charges
        .filter((charge: any) => charge.is_sell === 1)
        .map((charge: any) => parseFloat(charge.sell_amount))
        .reduce((acc: number, exportCharge: number) => acc + exportCharge, 0)
    }
  }

  // if serviceable class_name is AirReference sum charges
  if (note.serviceable.class_name.includes('AirReference')) {
    return note.serviceable.charges
      .filter((charge: any) => charge.is_sell === 1)
      .map((ch: any) => parseFloat(ch.amount))
      .reduce((acc: number, charge: number) => acc + charge, 0)
  }

  return 0
}

const getTotalContainersByType = (serviceable: any, containerType: any) => {
  if (!serviceable) {
    return 0
  }
  return serviceable.containers.filter((container: any) => container.container_type_id === containerType.id).length || 0
}

const getProfitSell = (note: any) => {
  if (!note.serviceable) {
    return 'No service linked'
  }

  return formatToCurrency(getByServiceTotalSell(note) - getByServiceTotalBuy(note))
}

const checkNotes = () => {
  const notes = creditNotes.value.filter((note: any) => note.checked)
}

const confirmUnlockNote = async (note: any) => {
  const confirm = window.confirm(`Are you sure you want to unlock this note #${note.folio}?`)
  if (confirm) {
    try {
      loadingStore.loading = true
      const response = await $api.ffNotes.unlockFfNote(note.id)
      note.checked = false
      note.checked_at = null
      snackbar.add({ type: 'success', text: 'Note unlocked' })
    } catch (e) {
      console.error(e)
    } finally {
      setTimeout(() => {
        loadingStore.stop()
      }, 250)
    }
  }
}

const uploadFfNoteAttachment = async (note: any) => {
  try {
    if (!note.file) {
      return
    }
    loadingStore.loading = true
    const body = {
      ff_note_id: note.id,
      file: note.file,
    }
    const response = await $api.ffNotes.uploadFfNoteAttachment(note.id, body)
    snackbar.add({ type: 'success', text: 'Attachment uploaded.' })
    note.attachment = response
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const generatePdf = async () => {
  try {
    loadingStore.loading = true
    const body = {
      ff_notes: creditNotes.value.filter((note: any) => note.checked).map((note: any) => note.id),
    }
    const response = await $api.ffNotes.previewFfNotesPdf(body)

    const blob = new Blob([response], { type: 'application/pdf' })
    const url = window.URL.createObjectURL(blob)
    window.open(url)
    snackbar.add({ type: 'success', text: 'PDF generated.' })
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const generateExcel = async () => {
  try {
    loadingStore.loading = true
    const body = {
      ff_notes: creditNotes.value
        .filter((note: any) => note.checked)
        .map((note: any) => note.id)
        .reverse(),
    }
    console.log('body', body)
    const response = await $api.ffNotes.previewFfNotesExcel(body)
    snackbar.add({ type: 'success', text: 'Excel generated.' })
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

const lockFfNotes = async (type: string) => {
  if (!hasCheckedNotes.value) {
    snackbar.add({ type: 'error', text: 'No notes selected' })
    return
  }
  try {
    loadingStore.loading = true
    const body = {
      ff_notes: creditNotes.value.filter((note: any) => note.checked).map((note: any) => note.id),
      type: type,
    }
    await $api.ffNotes.updateLockingStatus(body)
    snackbar.add({ type: 'success', text: 'Notes locking updated.' })
    await getFreightSoa()
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 200)
  }
}

const sendToPay = async () => {
  if (!hasCheckedNotes.value) {
    snackbar.add({ type: 'error', text: 'No notes selected' })
    return
  }
  try {
    loadingStore.loading = true
    let body = {
      notes: creditNotes.value
        .filter((note: any) => note.checked)
        .map((note: any) => {
          return {
            id: note.id,
            notes: note.notes,
          }
        }),
      ff_type: filters.value.freightId ? 'ff_agent' : 'ff_group',
      ff_id: filters.value.freightId || filters.value.freightGroupId,
    }

    const response = await $api.ffNotes.generatePayment(body)

    snackbar.add({ type: 'success', text: `Payment request #${response.id} generated` })
    router.push(`/payments/agents/payments/view-${response.id}`)
    // await getFreightSoa()
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 200)
  }
}

const onClickFilters = async () => {
  await getFreightSoa()
}

const getFreightSoa = async () => {
  try {
    // if not freightId or freightGroupId
    if (!filters.value.freightId && !filters.value.freightGroupId) {
      snackbar.add({ type: 'error', text: 'Please select a freight forwarder or group' })
      return
    }

    // if filter is by freightGroupId clear freightId
    if (filters.value.freightGroupId) {
      filters.value.freightId = null
    }

    creditNotes.value = []
    loadingStore.loading = true
    const response = await $api.freightForwarders.getNotesSOA({
      query: {
        ...flattenArraysToCommaSeparatedString(filters.value),
      },
    })

    creditNotes.value = response as any

    if (creditNotes.value.length === 0) {
      snackbar.add({ type: 'info', text: 'No notes found' })
    }

    if (creditNotes.value.length >= 2000) {
      snackbar.add({ type: 'warning', text: 'Warning - Too many notes found. (Max 2000 per request.)' })
    }
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const clearFilters = async () => {
  filters.value = {
    startDate: '',
    endDate: '',
    creditDebit: '',
    type: '',
    folio: '',
    freightId: null,
    freightGroupId: null,
    currencyId: null,
  }
  creditNotes.value = []
}

const getContainerTypes = async () => {
  try {
    const response = (await $api.containers.getAllTypes()) as any
    containerTypes = response
  } catch (error) {
    console.error(error)
  }
}

const getCatalogs = async () => {
  try {
    loadingStore.start()
    const response = await $api.freightForwarders.getAllFreightForwarders()
    freightForwarders.value = response as any
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

await getContainerTypes()

onMounted(async () => {
  await getCatalogs()
})
</script>
