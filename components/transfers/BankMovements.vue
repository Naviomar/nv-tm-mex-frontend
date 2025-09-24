<template>
  <div>
    <div>
      <div class="font-bold mb-2">Filters</div>
      <div @keyup.enter="onClickFilters">
        <div class="grid grid-cols-4 gap-2">
          <div>
            <v-text-field v-model="filters.id" type="text" density="compact" label="By Id" hide-details />
          </div>
          <div>
            <v-text-field v-model="filters.search" type="text" density="compact" label="Text" hide-details />
          </div>
          <div>
            <v-autocomplete
              v-model="filters.bankAccount"
              :items="catalogs.bank_accounts"
              density="compact"
              item-title="bank_account"
              item-value="id"
              label="Bank account"
              hide-details
            />
          </div>
          <div>
            <v-autocomplete
              v-model="filters.movementType"
              :items="catalogs.movement_types"
              density="compact"
              item-title="name"
              item-value="id"
              label="Movement type"
              hide-details
            />
          </div>
          <div>
            <v-autocomplete
              v-model="filters.type"
              :items="[
                { name: 'Deposit', value: 'deposit' },
                { name: 'Withdrawal', value: 'withdrawal' },
              ]"
              density="compact"
              item-title="name"
              item-value="value"
              label="Deposit/Withdrawal"
              hide-details
            />
          </div>
          <div>
            <v-text-field
              v-model="filters.amount"
              type="number"
              density="compact"
              label="Movement amount"
              hide-details
            />
          </div>
          <div>
            <v-autocomplete
              v-model="filters.hasPendingBalance"
              :items="yesNoOptions"
              density="compact"
              item-title="name"
              item-value="value"
              label="Pending balance"
              hide-details
            />
          </div>
          <div>
            <v-autocomplete
              v-model="filters.hasUsedBalance"
              :items="yesNoOptions"
              density="compact"
              item-title="name"
              item-value="value"
              label="Used balance"
              hide-details
            />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-2 my-4">
          <div>
            <v-text-field v-model="filters.from" type="date" density="compact" label="Date from" hide-details />
          </div>
          <div>
            <v-text-field v-model="filters.to" type="date" density="compact" label="Date to" hide-details />
          </div>
        </div>
        <div>
          <v-text-field
            v-model="filters.referenceNumber"
            type="text"
            density="compact"
            label="Reference Number # "
            hide-details
          />
        </div>
      </div>
      <div class="flex gap-2 mt-4">
        <v-btn size="small" color="secondary" @click="clearFilters"> Clear </v-btn>
        <v-btn size="small" color="primary" @click="onClickFilters"> Search </v-btn>
        <v-btn size="small" color="amber" @click="exportDataXlsx"
          ><v-icon>mdi-microsoft-excel</v-icon> Export excel
        </v-btn>
        <v-btn size="small" color="lime" @click="exportByPaymentsDataXlsx"
          ><v-icon>mdi-microsoft-excel</v-icon> Export by payments
        </v-btn>
      </div>
    </div>
    <div>
      <v-pagination
        v-model="bankMovements.current_page"
        :length="bankMovements.last_page"
        rounded="circle"
        density="compact"
        @update:model-value="onClickPagination"
      ></v-pagination>
      <div class="text-xs">
        Showing {{ bankMovements.from }} to {{ bankMovements.to }} from {{ bankMovements.total }} total records
      </div>
      <v-table density="compact" fixed-header height="75vh">
        <thead>
          <tr>
            <th class="font-bold!"></th>
            <th class="font-bold!">Actions</th>
            <th class="font-bold!">Movement date</th>
            <th class="font-bold!">Bank</th>
            <th class="font-bold!">Movement type</th>
            <th class="font-bold!">Deposit/Withdrawal</th>
            <th class="font-bold!">Amount</th>
            <th class="font-bold! bg-yellow-500/25!">Balance</th>
            <th class="font-bold!">Description</th>
            <th class="font-bold!">Reference</th>
            <th class="font-bold!">Text</th>
            <th class="font-bold!">is Payable?</th>
            <th class="font-bold!">Payable notes</th>
            <th class="font-bold!">Payable user</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(bankMovement, index) in bankMovements.data" :key="`bofa-${index}`" class="hover:bg-yellow-500/25">
            <td>
              <div class="flex flex-col items-center gap-2 my-4">
                <v-btn
                  v-if="isUsable(bankMovement)"
                  color="blue-grey"
                  density="compact"
                  variant="elevated"
                  @click="goToPayment(bankMovement)"
                >
                  <span class="text-xl">💸</span> Apply payments</v-btn
                >

                <v-btn color="red" variant="elevated" density="compact" @click="showNotaBankMovement(bankMovement)">
                  <span class="text-xl">🔏</span> Lock / Unlock
                </v-btn>

                <div v-if="bankMovement.payments.length > 0">
                  <BankMovementPayments :bankMovement="bankMovement" />
                </div>
                <v-btn v-if="false" size="small" color="green-lighten-2" density="compact"
                  >Aplicar nota crédito/débito</v-btn
                >
              </div>
            </td>
            <td>
              <div class="flex flex-col justify-center items-center gap-2">
                <v-btn
                  variant="text"
                  size="small"
                  color="blue-lighten-2"
                  density="compact"
                  @click="viewBankMovement(bankMovement)"
                  >View</v-btn
                >
                <div class="flex items-center gap-2">
                  <v-icon class="cursor-pointer" @click="clipboard.copyToClipboard(bankMovement.id)">
                    mdi-content-copy
                  </v-icon>
                  #{{ bankMovement.id }}
                </div>

                <UserInfoBadge :item="bankMovement" />
              </div>
            </td>
            <td>{{ bankMovement.movement_date }}</td>
            <td class="whitespace-nowrap">{{ bankMovement.bank_account?.bank_account }}</td>
            <td>
              {{ bankMovement.movement_type?.name }}
              <div v-if="bankMovement.movement_type?.name === 'cheque'">
                <v-chip v-if="bankMovement.sbc_status === 'pending'" color="amber" size="small" class="w-full">
                  SBC
                </v-chip>
                <v-chip v-if="bankMovement.sbc_status === 'approved'" color="green" size="small" class="w-full">
                  Firme
                </v-chip>
                <v-chip v-if="bankMovement.sbc_status === 'rejected'" color="red" size="small" class="w-full">
                  Devuelto
                </v-chip>

                <v-btn size="x-small" color="blue-lighten-4" @click="showChequeDetail(bankMovement)"
                  >Update status</v-btn
                >
              </div>
            </td>
            <td>
              <v-chip :color="bankMovement.type == 'deposit' ? 'green' : 'red'" size="small" class="w-full">
                {{ bankMovement.type }}
              </v-chip>
            </td>
            <td class="whitespace-nowrap">
              {{ getCurrencyName(bankMovement.bank_account?.currency_id) }} {{ formatToCurrency(bankMovement.amount) }}
            </td>
            <td class="whitespace-nowrap bg-yellow-500/50">
              {{ getCurrencyName(bankMovement.bank_account?.currency_id) }}
              {{ formatToCurrency(bankMovement.amount_available) }}
            </td>
            <!-- <td v-html="splitPaymentDetail(bankMovement.paymentDetail)"></td> -->
            <td>{{ bankMovement.description }}</td>
            <td>{{ bankMovement.reference }}</td>
            <td>{{ bankMovement.texto }}</td>
            <td>{{ bankMovement.is_usable == 1 ? 'Yes' : 'No' }}</td>
            <td>{{ bankMovement.usable_notes }}</td>
            <td>{{ bankMovement.usable_user?.name }}</td>
          </tr>
        </tbody>
      </v-table>
      <v-pagination
        v-model="bankMovements.current_page"
        :length="bankMovements.last_page"
        rounded="circle"
        density="compact"
        @update:model-value="onClickPagination"
      ></v-pagination>
      <v-dialog v-model="formCheque.show" width="600">
        <v-card color="orange-lighten-4">
          <v-card-title>Update cheque status #{{ formCheque.bankMovement.id }}</v-card-title>
          <v-card-text>
            <div class="pb-4">
              <div>Amount {{ formatToCurrency(formCheque.bankMovement.amount) }}</div>
              <div>Date {{ formatDateOnlyString(formCheque.bankMovement.movement_date) }}</div>
              <div>Time {{ formCheque.bankMovement.movement_time }}</div>
            </div>

            <v-autocomplete
              v-model="formCheque.sbc_status"
              density="compact"
              :items="[
                { name: 'SBC', value: 'pending' },
                { name: 'Firme', value: 'approved' },
                { name: 'Devuelto', value: 'rejected' },
              ]"
              item-title="name"
              item-value="value"
              label="Current cheque status"
            />
            <div class="text-sm -mt-2">SBC: Unless well-paid (money not yet available)</div>
          </v-card-text>
          <v-card-actions>
            <div class="w-full flex justify-around">
              <v-btn @click="formCheque.show = false">Cancel</v-btn>
              <v-btn color="primary" @click="saveChequeStatus">Save changes</v-btn>
            </div>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
    <v-dialog v-model="notaDialog.show">
      <v-card>
        <v-card-title>Bank movement note #{{ notaDialog.bankMovement?.id }}</v-card-title>
        <v-card-text>
          <BankMovementNotaForm :bankMovement="notaDialog.bankMovement" @refresh="refreshAndCloseDialog" />
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="notaDialog.show = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script setup lang="ts">
import { formatToCurrency } from '@/utils/formatters'
const clipboard = useCopyToClipboard()
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()
const route = useRoute()
const router = useRouter()

const emits = defineEmits(['viewBankMovement', 'makePayments'])

const filters = ref<any>({
  id: null,
  referenceNumber: null,
  search: '',
  hasPendingBalance: null,
  hasUsedBalance: null,
  bankAccount: null,
  movementType: null,
  type: null,
  amount: '',
  from: '',
  to: '',
})

const formCheque = ref<any>({
  show: false,
  bankMovement: {},
  is_sbc_cheque: null,
})

const catalogs = ref({
  bank_accounts: [],
  movement_types: [],
})

const notaDialog = ref<any>({
  show: false,
  bankMovement: null,
})

const yesNoOptions = [
  { name: 'Yes', value: 1 },
  { name: 'No', value: 0 },
]

const bankMovements = ref<any>({
  data: [] as any,
  current_page: 1,
  page: 1,
  last_page: 1,
})

const clearFilters = async () => {
  filters.value = {
    id: null,
    referenceNumber: null,
    search: '',
    hasPendingBalance: null,
    hasUsedBalance: null,
    bankAccount: null,
    movementType: null,
    type: null,
    amount: '',
    from: '',
    to: '',
  }
  bankMovements.value.current_page = 1
  await getBankMovements()
}

const isUsable = (bankMovement: any) => {
  return bankMovement.is_usable == 1
}

const onClickPagination = async (page: number) => {
  bankMovements.value.current_page = page
  await getBankMovements()
}

const refreshAndCloseDialog = async () => {
  await getBankMovements()
  notaDialog.value = {
    show: false,
    bankMovement: null,
  }
}

const getBankMovements = async () => {
  try {
    loadingStore.loading = true
    const response = await $api.bankMovements.getMovements({
      query: {
        page: bankMovements.value.current_page,
        ...flattenArraysToCommaSeparatedString(filters.value),
      },
    })

    bankMovements.value = response as any
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const getBankMovementFilters = async () => {
  const response = await $api.bankMovements.getBankMovementFilters()

  catalogs.value = response as any
}

const exportByPaymentsDataXlsx = async () => {
  try {
    loadingStore.loading = true
    const response = await $api.bankMovements.exportByPaymentsDataXlsx({
      query: {
        ...flattenArraysToCommaSeparatedString(filters.value),
      },
    })

    const blob = new Blob([response], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    const link = document.createElement('a')
    link.href = window.URL.createObjectURL(blob)
    link.download = 'bankMovements_by_payments.xlsx'
    link.click()
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const exportDataXlsx = async () => {
  try {
    loadingStore.loading = true
    const response = await $api.bankMovements.exportDataXlsx({
      query: {
        ...flattenArraysToCommaSeparatedString(filters.value),
      },
    })

    const blob = new Blob([response], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    const link = document.createElement('a')
    link.href = window.URL.createObjectURL(blob)
    link.download = 'bankMovements.xlsx'
    link.click()
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const onClickFilters = async () => {
  // set current page to 1
  bankMovements.value.current_page = 1
  await getBankMovements()
}

const showChequeDetail = (bankMovement: any) => {
  formCheque.value = {
    show: !formCheque.value.show,
    bankMovement,
    sbc_status: bankMovement.sbc_status,
  }
}

const saveChequeStatus = async () => {
  try {
    console.log('update cheque PERO CUAL CHEQUE ?', formCheque.value.bankMovement)
    loadingStore.loading = true
    const body = {
      sbc_status: formCheque.value.sbc_status,
    }
    const response = await $api.bankMovements.updateChequeStatus(formCheque.value.bankMovement.id, body)
    if (response) {
      snackbar.add({
        type: 'success',
        text: 'Cheque status updated',
      })
    }

    formCheque.value = {
      show: false,
      bankMovement: {},
      is_sbc_cheque: null,
    }

    await getBankMovements()
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const viewBankMovement = (movement: any) => {
  emits('viewBankMovement', movement)
}

const goToPayment = (movement: any) => {
  emits('makePayments', movement)
}

const showNotaBankMovement = (bankMovement: any) => {
  notaDialog.value = {
    show: true,
    bankMovement,
  }
}

const splitPaymentDetail = (movement: any) => {
  const paymentDetail = movement.split('|')
  // iterate over paymentDetail and return a v-chip for each element
  return paymentDetail
    .map((detail: any) => {
      return `<div>${detail}</div>`
    })
    .join('')
}

await getBankMovementFilters()

watch(
  filters,
  (newFilters) => {
    router.push({
      query: {
        ...route.query,
        ...newFilters,
      },
    })
  },
  { deep: true }
)

onMounted(async () => {
  const queryFilters: any = route.query
  Object.keys(filters.value).forEach((key) => {
    if (queryFilters[key]) {
      filters.value[key] = !isNaN(queryFilters[key]) ? Number(queryFilters[key]) : queryFilters[key]
    }
  })

  await getBankMovements()
})
</script>
