<template>
  <div>
    <div class="mb-4">
      <div class="grid grid-cols-6">
        <div class="col-span-3">
          <v-text-field v-model="filters.name" density="compact" label="Name"></v-text-field>
        </div>
      </div>
      <div class="grid grid-cols-1">
        <div class="flex gap-2">
          <v-btn color="secondary" @click="clearFilters"> Clear </v-btn>
          <v-btn color="primary" @click="getBankAccountTypes"> Search </v-btn>
        </div>
      </div>
    </div>
    <v-card>
      <v-card-text>
        <v-table density="compact">
          <thead>
            <tr>
              <th class="text-left" width="50">Actions</th>
              <th class="text-left">Name</th>
              <th class="text-left">Currency</th>
              <th class="text-left">Currency code</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(bankAccountType, index) in bankAccountTypes.data"
              :key="`country-${index}`"
              :class="{ 'bg-red-100! dark:bg-red-900!': bankAccountType.deleted_at }"
            >
              <td>
                <TrashButton :item="bankAccountType" @click="showConfirmDelete" />
              </td>
              <td>{{ bankAccountType.name }}</td>
              <td>{{ bankAccountType.currency?.name }}</td>
              <td>{{ bankAccountType.currency?.code }}</td>
            </tr>
          </tbody>
        </v-table>
        <v-pagination
          v-model="bankAccountTypes.current_page"
          :length="bankAccountTypes.last_page"
          rounded="circle"
          density="compact"
          @update:model-value="onClickPagination"
        ></v-pagination>
      </v-card-text>
    </v-card>
  </div>
</template>
<script setup lang="ts">
const { $api, $notifications } = useNuxtApp()
const snackbar = useSnackbar()
const confirm = $notifications.useConfirm()

const loadingIndicator = useLoadingIndicator()
const loadingStore = useLoadingStore()

const filters = ref({
  name: '',
})

const bankAccountTypes = ref({
  data: [] as any,
  current_page: 1,
  page: 1,
  perPage: 10,
  last_page: 1,
})

const onClickPagination = async (page: number) => {
  bankAccountTypes.value.current_page = page
  await getBankAccountTypes()
}

const getBankAccountTypes = async () => {
  try {
    loadingIndicator.start()
    loadingStore.loading = true
    const response = await $api.bankAccountsTypes.getBankAccountsTypes({
      query: {
        page: bankAccountTypes.value.current_page,
        perPage: bankAccountTypes.value.perPage,
        ...flattenArraysToCommaSeparatedString(filters.value),
      },
    })

    bankAccountTypes.value = response as any
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingIndicator.finish()
      loadingStore.loading = false
    }, 200)
  }
}

const showConfirmDelete = async (bankAccountType: any) => {
  const result = await confirm({
    title: 'Are you sure?',
    confirmationText: 'Update',
    content: 'Please confirm you want to delete or activate this bank account type.',
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
      await $api.bankAccountsTypes.delete(bankAccountType.id)

      snackbar.add({ type: 'success', text: 'Bank account type deleted' })
      await getBankAccountTypes()
    } catch (e) {
      console.error(e)
    } finally {
      setTimeout(() => {
        loadingStore.stop()
      }, 250)
    }
  }
}

await getBankAccountTypes()

const clearFilters = async () => {
  filters.value = {
    name: '',
  }
  await getBankAccountTypes()
}
</script>
