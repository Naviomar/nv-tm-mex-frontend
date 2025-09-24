<template>
  <div>
    <div class="mb-4">
      <div class="grid grid-cols-6">
        <div class="col-span-3">
          <v-text-field v-model="filters.name" density="compact" label="Name / code" @keyup.enter="getCurrencies" />
        </div>
      </div>
      <div class="grid grid-cols-1">
        <div class="flex gap-2">
          <v-btn color="secondary" @click="clearFilters"> Clear </v-btn>
          <v-btn color="primary" @click="getCurrencies"> Search </v-btn>
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
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(currency, index) in currencies.data"
              :key="`currency-${index}`"
              :class="{ 'bg-red-100! dark:bg-red-900!': currency.deleted_at }"
            >
              <td>
                <div class="flex gap-2">
                  <ViewButton :item="currency" @click="viewCurrency(currency)" />
                  <TrashButton v-if="false" :item="currency" @click="showConfirmDelete" />
                </div>
              </td>
              <td>{{ currency.name }}</td>
              <td>{{ currency.code }}</td>
            </tr>
          </tbody>
        </v-table>
        <v-pagination
          v-model="currencies.current_page"
          :length="currencies.last_page"
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
const confirm = $notifications.useConfirm()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()
const router = useRouter()

const filters = ref({
  name: '',
})

const currencies = ref({
  data: [] as any,
  current_page: 1,
  page: 1,
  perPage: 10,
  last_page: 1,
})

const onClickPagination = async (page: number) => {
  currencies.value.current_page = page
  await getCurrencies()
}

const editCurrency = (currency: any) => {
  router.push(`/configuration/currencies/edit-${currency.id}`)
}

const viewCurrency = (currency: any) => {
  router.push(`/configuration/currencies/view-${currency.id}`)
}

const showConfirmDelete = async (currency: any) => {
  const result = await confirm({
    title: 'Are you sure?',
    confirmationText: 'Update',
    content: 'Please confirm you want to delete or activate it.',
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
      await $api.currencies.delete(currency.id)
      snackbar.add({ type: 'success', text: 'Currency deleted' })
      await getCurrencies()
    } catch (e) {
      console.error(e)
    } finally {
      setTimeout(() => {
        loadingStore.stop()
      }, 250)
    }
  }
}

const getCurrencies = async () => {
  try {
    loadingStore.start()
    const response = await $api.currencies.getCurrencies({
      query: {
        page: currencies.value.current_page,
        perPage: currencies.value.perPage,
        ...flattenArraysToCommaSeparatedString(filters.value),
      },
    })

    currencies.value = response as any
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
  await getCurrencies()
}

onMounted(async () => {
  await getCurrencies()
})
</script>
