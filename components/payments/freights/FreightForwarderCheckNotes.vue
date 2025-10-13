<template>
  <div>
    <v-card>
      <v-card-title>Locked / Unlocked - Agent freight forwarder notes</v-card-title>
      <v-card-text>
        <div class="mb-4" @keyup.enter="onClickFilters">
          <div class="grid grid-cols-6 gap-4">
            <div class="col-span-2">
              <AGlobalSearch
                v-model="filters.freightId"
                :onSearch="searchFfs"
                validate-key="freightId"
                label="Freight Forwarder"
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
          </div>
          <div class="grid grid-cols-1">
            <div class="flex gap-2">
              <v-btn color="secondary" size="small" @click="clearFilters"> Clear </v-btn>
              <v-btn color="primary" size="small" @click="getFfNotes"> Search </v-btn>
            </div>
          </div>
        </div>

        <div class="flex gap-2 mb-4">
          <v-btn color="primary" size="small" variant="tonal" @click="checkAll"> Check all </v-btn>
          <v-btn color="primary" size="small" variant="tonal" @click="uncheckAll"> Uncheck all </v-btn>
        </div>

        <div v-if="hasCheckedNotes" class="flex flex-col gap-2 mb-4 border p-2">
          <div class="font-bold">Actions:</div>
          <div class="flex gap-4">
            <v-btn color="green" size="small" @click="toggleLockNote('lock')"> Lock notes </v-btn>
            <v-btn color="orange" size="small" @click="toggleLockNote('unlock')"> Unlock notes </v-btn>
            <v-btn color="purple" size="small" @click="generatePdf"> PDF </v-btn>
            <v-btn color="lime" size="small" @click="generateExcel"> Excel </v-btn>
          </div>
        </div>

        <v-pagination
          v-model="ffNotes.current_page"
          :length="ffNotes.last_page"
          rounded="circle"
          density="compact"
          @update:model-value="onClickPagination"
        ></v-pagination>
        <div class="flex gap-2 mb-4">
          <v-chip size="small" color="green"><v-icon>mdi-lock-outline</v-icon>Locked</v-chip>
          <v-chip size="small" color="orange"><v-icon>mdi-lock-open-outline</v-icon>Unlocked</v-chip>
        </div>

        <v-table density="compact">
          <thead>
            <tr>
              <th class="text-left" width="50">Actions</th>
              <th class="text-left" width="50">Lock/Unlock</th>

              <th class="text-left">Vessel</th>
              <th class="text-left">ETD</th>

              <th class="text-left">Folio</th>

              <th class="text-left">Currency</th>
              <th class="text-left">Credit Note</th>
              <th class="text-left">Debit Note</th>
              <th class="text-left bg-orange-500!">Balance</th>

              <th class="text-left">F. F.</th>
              <th class="text-left">Customer</th>
              <th class="text-left">MBL</th>
              <th class="text-left">HBL</th>

              <th class="text-left">Notes</th>
              <th class="text-left">Created by</th>
              <th class="text-left">Payment pending</th>
              <th class="text-left">Payment sent</th>
              <th class="text-left">Is cancelled</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(ffNote, idx) in ffNotes.data"
              :key="ffNote.id"
              :class="{
                'dark:hover:bg-gray-700 hover:bg-slate-300': true,
                'bg-red-100! dark:bg-red-900!': ffNote.deleted_at,
              }"
            >
              <td>
                <div class="flex gap-2 items-center">
                  <div v-if="!isNotePending(ffNote)">
                    <v-tooltip location="top">
                      <template v-slot:activator="{ props }">
                        <v-icon v-bind="props" class="ml-1 cursor-pointer">mdi-alert-outline</v-icon>
                      </template>
                      <div>Missing:</div>
                      <div>{{ ffNoteMissingThings(ffNote) }}</div>
                    </v-tooltip>
                  </div>
                  <div v-if="isNotePending(ffNote)">
                    <v-checkbox v-model="ffNote.checked" density="compact" hide-details />
                  </div>
                </div>
              </td>
              <td>
                <div v-if="!ffNote.deleted_at">
                  <v-icon v-if="ffNote.checked_at == null" color="orange">mdi-lock-open-outline</v-icon>
                  <v-icon v-if="ffNote.checked_at != null" color="green">mdi-lock-outline</v-icon>
                </div>
              </td>

              <td>{{ getVessel(ffNote) }}</td>
              <td>{{ getEtdDate(ffNote) }}</td>

              <td>#{{ ffNote.service_folio }}</td>

              <td>{{ getCurrencyName(ffNote.currency_id) }}</td>

              <td class="whitespace-nowrap">
                {{ getCreditAmountLogic(ffNote) }}
              </td>
              <td class="whitespace-nowrap">{{ getDebitAmountLogic(ffNote) }}</td>
              <td class="bg-orange-500!">{{ formatToCurrency(sumUpToIndex(idx)) }}</td>

              <td>{{ ffNote.forwarder?.name }}</td>
              <td>{{ ffNote.serviceable?.consignee?.name }}</td>
              <td>{{ getMbl(ffNote) }}</td>
              <td>{{ getHbl(ffNote) }}</td>

              <td>
                {{ ffNote.notes }}
              </td>
              <td>
                <UserInfoBadge :item="ffNote"> </UserInfoBadge>
              </td>
              <td>
                <div v-if="!ffNote.note_payment">Pending request payment</div>
                <div v-if="ffNote.note_payment">
                  <v-chip color="blue" text-color="white" small @click="viewFfRequestPayment(ffNote.note_payment)">
                    <div class="flex gap-2">
                      <v-icon>mdi-eye-outline</v-icon>Req. payment #{{ ffNote.note_payment.ff_payment_id }}
                    </div>
                  </v-chip>
                </div>

                <div v-if="false">
                  <div v-if="ffNote.invoice?.is_paid == 1">Paid</div>
                  <div v-for="(charge, index) in ffNote.invoice?.charges" :key="`ffpay-${idx}-c-${index}`">
                    <div v-for="(payment, index2) in charge.payments" :key="`ffpay-${idx}-c-${index}-p-${index2}`">
                      <v-chip color="blue" text-color="white" small @click="viewPayment(payment)"
                        ><v-icon>mdi-eye-outline</v-icon>Payment #{{ payment.id }}
                        {{ formatToCurrency(payment.amount) }}</v-chip
                      >
                    </div>
                  </div>
                </div>
              </td>
              <td>
                <div v-if="ffNote.sent_at == null">
                  <v-icon color="orange">mdi-alert</v-icon>
                </div>
                <div v-if="ffNote.sent_at != null">
                  <v-icon color="green">mdi-check</v-icon>
                  <div>{{ formatDateString(ffNote.sent_at) }}</div>
                  <div>{{ ffNote.sent_user?.name }}</div>
                </div>
              </td>
              <td>
                <div v-if="ffNote.deleted_at" class="flex gap-2">
                  <v-icon color="">mdi-delete</v-icon>
                  <span>Notes: {{ ffNote.cancelled_reason }}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </v-table>
        <v-pagination
          v-model="ffNotes.current_page"
          :length="ffNotes.last_page"
          rounded="circle"
          density="compact"
          @update:model-value="onClickPagination"
        ></v-pagination>
        <div class="text-xs">Showing {{ ffNotes.from }} to {{ ffNotes.to }} from {{ ffNotes.total }} total records</div>
      </v-card-text>
    </v-card>
    <v-dialog v-model="lockingNotes.show" max-width="800">
      <v-card>
        <v-card-title>Please confirm this action</v-card-title>
        <v-card-text>
          <div class="text-sm">
            You are about to <span v-if="lockingNotes.type == 'lock'" class="text-base font-bold">lock</span>
            <span v-if="lockingNotes.type == 'unlock'" class="text-base font-bold">unlock</span> the selected notes. Are
            you sure?
          </div>
        </v-card-text>
        <v-card-actions>
          <v-btn color="secondary" @click="toggleLockNote"> Cancel </v-btn>
          <v-btn color="primary" @click="updateLockingNotes"> Yes, I confirm.</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script setup lang="ts">
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const router = useRouter()
const loadingStore = useLoadingStore()

const filters = ref<any>({
  startDate: '',
  endDate: '',
  folio: '',
  freightId: '',
  freightGroupId: '',
})

const lockingNotes = ref<any>({
  show: false,
  type: '',
})

const ffNotes = ref<any>({
  data: [],
  current_page: 1,
  page: 1,
  last_page: 1,
  from: 1,
  to: 1,
  total: 0,
})

const checkAll = () => {
  ffNotes.value.data.forEach((note: any) => {
    if (isNotePending(note)) {
      note.checked = true
    }
  })
}

const uncheckAll = () => {
  ffNotes.value.data.forEach((note: any) => {
    note.checked = false
  })
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

const sumUpToIndex = (index: number) => {
  let sum = 0
  for (let i = 0; i <= index; i++) {
    if (isNotePending(ffNotes.value.data[i])) {
      sum += getRealAmount(ffNotes.value.data[i])
    }
  }
  return sum
}

const getCreditAmountLogic = (note: any) => {
  // From Agent and Credit
  if (note.inbound == 1 && note.type == 'C') {
    return ''
  }
  if (note.inbound == 0 && note.type == 'D') {
    return ''
  }
  return formatToCurrency(-Math.abs(note.amount_total))
}

const getDebitAmountLogic = (note: any) => {
  if (note.inbound == 1 && note.type == 'D') {
    return ''
  }
  if (note.inbound == 0 && note.type == 'C') {
    return ''
  }
  return formatToCurrency(note.amount_total)
}

const getMbl = (ffNote: any) => {
  if (!ffNote.serviceable) {
    return 'N/A'
  }

  // Maritimo
  if (ffNote.serviceable.class_name.includes('Referencia')) {
    return ffNote.serviceable.master_bls?.map((mbl: any) => mbl.name).join(', ')
  }

  // Aereo
  if (ffNote.serviceable.class_name.includes('AirReference')) {
    return ffNote.serviceable.airline?.master_awb
  }

  return 'N/A'
}

const getHbl = (ffNote: any) => {
  if (!ffNote.serviceable) {
    return 'N/A'
  }

  // Maritimo
  if (ffNote.serviceable.class_name.includes('Referencia')) {
    return ffNote.serviceable.house_bls?.map((mbl: any) => mbl.name)[0] || ''
  }

  // Aereo
  if (ffNote.serviceable.class_name.includes('AirReference')) {
    return ffNote.serviceable.airline?.house_awb
  }

  return 'N/A'
}

const getVessel = (ffNote: any) => {
  if (!ffNote.serviceable) {
    return 'N/A'
  }

  // Maritimo
  if (ffNote.serviceable.class_name.includes('Referencia')) {
    return ffNote.serviceable.voyage_discharge?.short_name
  }

  // Aereo
  if (ffNote.serviceable.class_name.includes('AirReference')) {
    return ffNote.serviceable.airline?.name
  }

  return 'N/A'
}

const getEtdDate = (ffNote: any) => {
  if (!ffNote.serviceable) {
    return 'N/A'
  }

  // Maritimo
  if (ffNote.serviceable.class_name.includes('Referencia')) {
    return ffNote.serviceable.voyage_discharge?.eta_date
  }

  // Aereo
  if (ffNote.serviceable.class_name.includes('AirReference')) {
    return 'N/A'
  }

  return 'N/A'
}

const hasCheckedNotes = computed(() => {
  return ffNotes.value.data.some((note: any) => note.checked)
})

const toggleLockNote = async (type: string) => {
  lockingNotes.value.show = !lockingNotes.value.show
  lockingNotes.value.type = type
}

const onClickFilters = async () => {
  // set current page to 1
  ffNotes.value.current_page = 1
  await getFfNotes()
}

const generatePdf = async () => {
  try {
    loadingStore.loading = true
    const body = {
      ff_notes: ffNotes.value.data.filter((note: any) => note.checked).map((note: any) => note.id),
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
      ff_notes: ffNotes.value.data
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

const updateLockingNotes = async () => {
  try {
    loadingStore.loading = true
    const body = {
      ff_notes: ffNotes.value.data.filter((note: any) => note.checked).map((note: any) => note.id),
      type: lockingNotes.value.type,
    }
    await $api.ffNotes.updateLockingStatus(body)
    snackbar.add({ type: 'success', text: 'Notes locking updated.' })

    lockingNotes.value.show = false
    await getFfNotes()
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

const onClickPagination = async (page: number) => {
  ffNotes.value.current_page = page
  await getFfNotes()
}

const getFfNotes = async () => {
  try {
    loadingStore.loading = true
    const response = await $api.freightForwarders.getFfNotes({
      query: {
        ...flattenArraysToCommaSeparatedString(filters.value),
        page: ffNotes.value.current_page,
      },
    })

    ffNotes.value = response as any
  } catch (e) {
    console.error(e)
  } finally {
    // timeout 1 second
    loadingStore.stop()
  }
}

const viewFfRequestPayment = (notePayment: any) => {
  router.push(`/payments/agents/payments/view-${notePayment.ff_payment_id}`)
}

const viewPayment = (payment: any) => {
  console.log('payment', payment)
  if (payment.paymentable_type.includes('BankMovement')) {
    router.push(`/transfers/global/view-${payment.paymentable_id}?focusPayable=${payment.id}`)
    return
  }
  console.error('Unknown payment type')
}

const clearFilters = async () => {
  filters.value = {
    startDate: '',
    endDate: '',
    folio: '',
    freightId: '',
  }
  ffNotes.value.current_page = 1
  await getFfNotes()
}
</script>
