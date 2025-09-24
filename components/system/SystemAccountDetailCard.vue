<template>
  <div>
    <v-card
      color="lime-lighten-4"
      class="mx-auto"
      :title="account.name"
      :subtitle="account.tax_number"
      prepend-icon="mdi-bank-outline"
    >
      <template v-slot:append>
        <v-hover>
          <template v-slot:default="{ isHovering, props }">
            <v-icon
              v-bind="props"
              :color="isHovering ? 'lime-darken-4' : 'green'"
              class="cursor-pointer"
              @click="onClickAddBankAccount"
              >mdi-bank-plus</v-icon
            >
          </template>
        </v-hover>
      </template>
      <v-card-text>
        <div class="border m-2 p-1">
          <div>{{ account.address }}</div>
          <div>Zipcode: {{ account.zip_code }}</div>
        </div>
        <SystemBankAccountForm
          v-if="showBankAcctForm"
          :account="account"
          :editBankAccount="editBankAccount"
          @close="showBankAcctForm = false"
          @success="onSuccessSaved"
        />
      </v-card-text>
      <v-card-actions>
        <v-btn variant="text"> view bank accounts </v-btn>

        <v-spacer></v-spacer>

        <v-btn :icon="show ? 'mdi-chevron-up' : 'mdi-chevron-down'" @click="show = !show"></v-btn>
      </v-card-actions>
      <v-expand-transition>
        <div v-show="show" class="px-4 py-4">
          <v-divider></v-divider>

          <v-alert v-if="account.bank_accounts.length === 0" color="lime-darken-4" dense outlined>
            No bank accounts found
          </v-alert>

          <v-card
            v-for="(bankAccount, index) in account.bank_accounts"
            :key="`bnk-acct-${index}`"
            :class="{
              'mx-auto mb-4': true,
              'bg-red-lighten-4': bankAccount.deleted_at,
              'bg-lime': !bankAccount.deleted_at,
            }"
            hover
          >
            <v-card-item>
              <v-card-title>
                <div class="flex items-center gap-3">
                  <v-icon>mdi-piggy-bank-outline</v-icon>
                  <UserInfoBadge :item="bankAccount">
                    <span>{{ bankAccount.bank_name }}</span>
                  </UserInfoBadge>
                </div>
              </v-card-title>
              <v-card-subtitle class="font-bold!"
                >Currency: {{ getCurrencyName(bankAccount.currency_id) }}</v-card-subtitle
              >
            </v-card-item>

            <v-card-text>
              <div>Type: {{ bankAccount.type }}</div>
              <div>Account #{{ bankAccount.account_number }}</div>
              <div>Address: {{ bankAccount.address }}</div>
              <div>Zipcode: {{ bankAccount.zip_code }}</div>
            </v-card-text>
            <v-card-actions>
              <v-btn color="red" variant="outlined" @click="onClickDelete(bankAccount)">
                {{ bankAccount.deleted_at ? 'Restore' : 'Delete' }}
              </v-btn>
              <v-btn color="primary" variant="outlined" @click="onClickEdit(bankAccount)"> Edit </v-btn>
            </v-card-actions>
          </v-card>
        </div>
      </v-expand-transition>
    </v-card>
  </div>
</template>
<script setup lang="ts">
import { currencies } from '~/utils/data/systemData'
const { $api, $notifications } = useNuxtApp()
const confirm = $notifications.useConfirm()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()

const props = defineProps({
  account: {
    type: Object,
    default: () => ({ name: null, rfc: null, address: null, bank_accounts: [] }),
    required: true,
  },
})

const emits = defineEmits(['success'])

const show = ref(false)
const showBankAcctForm = ref(false)
const editBankAccount = ref<any>(null)

const onClickAddBankAccount = () => {
  editBankAccount.value = null
  showBankAcctForm.value = !showBankAcctForm.value
}

const onClickEdit = (bankAccount: any) => {
  editBankAccount.value = bankAccount
  showBankAcctForm.value = true
}

const onClickDelete = async (bankAccount: any) => {
  const result = await confirm({
    title: 'Are you sure?',
    confirmationText: `This will ${bankAccount.deleted_at ? 'restore' : 'delete'} the bank account.`,
    content: 'Please confirm you want to delete or restore it.',
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
      loadingStore.start()
      await $api.systemAccounts.deleteBankAccount(props.account.id, bankAccount.id)

      snackbar.add({ type: 'success', text: `Bank account ${bankAccount.deleted_at ? 'Restored' : 'Deleted'}` })
      emits('success')
    } catch (e) {
      console.error(e)
    } finally {
      setTimeout(() => {
        loadingStore.stop()
      }, 250)
    }
  }
}

const onSuccessSaved = () => {
  showBankAcctForm.value = false
  emits('success')
}

const getCurrencyName = (id: number) => {
  const currency = currencies.find((c: any) => c.id == id)
  return currency?.name
}
</script>
