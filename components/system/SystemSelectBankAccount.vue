<template>
  <div>
    <v-card color="blue-lighten-4" variant="flat" class="mb-4" density="compact">
      <v-card-title>
        <div class="flex justify-between items-center text-base">
          <div>
            <div>System banks</div>
            <div class="font-bold">Choose a system bank account</div>
            <v-autocomplete
              v-model="filters.inv_type"
              :items="invoiceTypes"
              item-title="name"
              item-value="value"
              label="Filter by invoice type"
              density="compact"
            />
          </div>

          <v-btn icon size="x-small" @click="showInfo = !showInfo" color="blue-grey-darken-2">
            <v-icon v-if="showInfo">mdi-eye-outline</v-icon>
            <v-icon v-if="!showInfo">mdi-eye-closed</v-icon>
          </v-btn>
        </div>
      </v-card-title>
      <v-card-text v-if="showInfo">
        <v-table density="compact">
          <thead>
            <tr>
              <th class="text-left" width="50">Actions</th>
              <th class="text-left">Bank</th>
              <th class="text-left">Date added</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="systemBanksByInvType.length === 0">
              <td colspan="3" class="text-center">No bank accounts found</td>
            </tr>
            <tr v-for="(bank, index) in systemBanksByInvType" :key="`supplier-${index}`">
              <td>
                <v-btn color="secondary" size="small" @click="selectBank(bank)">Choose</v-btn>
              </td>
              <td>
                <div>
                  <div class="grid grid-cols-2 gap-4">
                    <div class="grid grid-cols-2 gap-0">
                      <div class="font-bold">Bank:</div>
                      <div>{{ bank.bank_account }}</div>

                      <div>Account number:</div>
                      <div>
                        <v-icon class="cursor-pointer" @click="clipboard.copyToClipboard(bank.account_number)">
                          mdi-content-copy
                        </v-icon>
                        {{ bank.account_number }} - {{ getCurrencyName(bank.currency_id) }}
                      </div>

                      <div>Invoiceable for:</div>
                      <div>{{ bank.inv_type }}</div>

                      <div>Purpose:</div>
                      <div>{{ bank.type }}</div>

                      <div>Address:</div>
                      <div>{{ bank.address }}</div>
                    </div>
                  </div>
                </div>
              </td>
              <td>{{ formatDateString(bank.created_at) }}</td>
            </tr>
          </tbody>
        </v-table>
      </v-card-text>
    </v-card>
  </div>
</template>
<script setup lang="ts">
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()
const clipboard = useCopyToClipboard()
const router = useRouter()

const props = defineProps({
  currencyId: {
    type: [String, Number],
    required: false,
    default: null,
  },
})

const showInfo = ref(true)
const systemBanks = ref<any>([])
const filters = ref({
  inv_type: null,
})

const invoiceTypes = [
  { value: 'tm', name: 'TM' },
  { value: 'wm', name: 'WM' },
]

const systemBanksByInvType = computed(() => {
  if (!filters.value.inv_type) return systemBanks.value
  return systemBanks.value.filter((bank: any) => {
    return bank.inv_type === filters.value.inv_type
  })
})

const emit = defineEmits(['update:modelValue'])

const selectBank = (bank: any) => {
  if (props.currencyId && props.currencyId && bank.currency_id !== props.currencyId) {
    snackbar.add({ type: 'error', text: 'The selected bank account does not match the currency selected' })
    return
  }
  emit('update:modelValue', bank)
  showInfo.value = false
  snackbar.add({ type: 'success', text: 'Bank account selected' })
}

const getSystemBankAccounts = async () => {
  try {
    loadingStore.start()
    const response = await $api.systemAccounts.getAllBankAccounts()
    systemBanks.value = response
  } catch (error) {
    console.error(error)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

await getSystemBankAccounts()
</script>
