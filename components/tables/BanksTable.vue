<template>
  <div>
    <div class="mb-4" @keyup.enter="onClickFilters">
      <div class="grid grid-cols-6">
        <div class="col-span-3">
          <v-text-field v-model="filters.name" density="compact" label="Name" />
        </div>
      </div>
      <div class="grid grid-cols-1">
        <div class="flex gap-2">
          <v-btn color="secondary" @click="clearFilters"> Clear </v-btn>
          <v-btn color="primary" @click="onClickFilters"> Search </v-btn>
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
              <th class="text-left">Code</th>
              <th class="text-left">Country</th>
              <th class="text-left">Created at</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(bank, index) in banks.data"
              :key="`bank-${index}`"
              :class="{ 'bg-red-100! dark:bg-red-900!': bank.deleted_at }"
            >
              <td>
                <div class="flex gap-2">
                  <ViewButton :item="bank" @click="viewBank(bank)" />
                  <EditButton :item="bank" @click="editBank(bank)" />
                  <TrashButton :item="bank" @click="showConfirmDelete" />
                </div>
              </td>
              <td>{{ bank.name }}</td>
              <td>{{ bank.code }}</td>
              <td>{{ bank.country?.name }}</td>
              <td>
                <UserInfoBadge :item="bank">
                  {{ formatDateString(bank.created_at) }}
                </UserInfoBadge>
              </td>
            </tr>
          </tbody>
        </v-table>
        <v-pagination
          v-model="banks.current_page"
          :length="banks.last_page"
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
const router = useRouter()

const loadingIndicator = useLoadingIndicator()
const loadingStore = useLoadingStore()

const filters = ref({
  name: '',
})

const banks = ref({
  data: [] as any,
  current_page: 1,
  page: 1,
  perPage: 10,
  last_page: 1,
})

const onClickFilters = async () => {
  // set current page to 1
  banks.value.current_page = 1
  await getBanks()
}

const onClickPagination = async (page: number) => {
  banks.value.current_page = page
  await getBanks()
}

const editBank = (airline: any) => {
  router.push(`/configuration/banks/edit-${airline.id}`)
}

const viewBank = (airline: any) => {
  router.push(`/configuration/banks/view-${airline.id}`)
}

const showConfirmDelete = async (port: any) => {
  const result = await confirm({
    title: 'Are you sure?',
    confirmationText: 'Update',
    content: 'Please confirm you want to delete or activate this bank.',
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
      const response = await $api.banks.delete(port.id)
      snackbar.add({ type: 'success', text: 'Bank deleted' })
      await getBanks()
    } catch (e) {
      console.error(e)
    } finally {
      setTimeout(() => {
        loadingStore.stop()
      }, 250)
    }
  }
}

const getBanks = async () => {
  try {
    loadingStore.start()
    const response = await $api.banks.getbBanks({
      query: {
        page: banks.value.current_page,
        perPage: banks.value.perPage,
        ...flattenArraysToCommaSeparatedString(filters.value),
      },
    })

    banks.value = response as any
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
    name: '',
  }
  await getBanks()
}

onMounted(async () => {
  await getBanks()
})
</script>
