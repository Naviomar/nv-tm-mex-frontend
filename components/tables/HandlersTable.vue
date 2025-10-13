<template>
  <div>
    <div class="mb-4" @keyup.enter="onClickFilters">
      <div class="grid grid-cols-6 gap-4">
        <div class="col-span-3">
          <v-text-field density="compact" label="Name" v-model="filters.name" />
        </div>
        <div class="col-span-2">
          <v-autocomplete
            density="compact"
            label="Status"
            v-model="filters.deleted_status"
            :items="deletedStatus"
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
    <v-card>
      <v-card-text>
        <v-pagination
          v-model="handlers.current_page"
          :length="handlers.last_page"
          rounded="circle"
          density="compact"
          @update:model-value="onClickPagination"
        ></v-pagination>
        <v-table density="compact">
          <thead>
            <tr>
              <th class="text-left" width="50">Actions</th>
              <th class="text-left">Name</th>
              <th class="text-left">Gaffette</th>
              <th class="text-left">Created At</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(handler, index) in handlers.data"
              :key="`handler-${index}`"
              :class="{ 'bg-red-100! dark:bg-red-900!': handler.deleted_at }"
            >
              <td>
                <div class="flex gap-2">
                  <ViewButton :item="handler" @click="viewHandler(handler)" />
                  <EditButton :item="handler" @click="editHandler(handler)" />
                  <TrashButton :item="handler" @click="showConfirmDelete" />
                </div>
              </td>
              <td>{{ handler.name }}</td>
              <td>{{ handler.gaffette }}</td>
              <td>
                <UserInfoBadge :item="handler">
                  {{ formatDateString(handler.created_at) }}
                </UserInfoBadge>
              </td>
            </tr>
          </tbody>
        </v-table>
        <v-pagination
          v-model="handlers.current_page"
          :length="handlers.last_page"
          rounded="circle"
          density="compact"
          @update:model-value="onClickPagination"
        ></v-pagination>
      </v-card-text>
    </v-card>
  </div>
</template>
<script setup lang="ts">
import { deletedStatus } from '@/utils/data/systemData'
const { $api, $notifications } = useNuxtApp()
const snackbar = useSnackbar()
const confirm = $notifications.useConfirm()
const loadingIndicator = useLoadingIndicator()
const loadingStore = useLoadingStore()
const router = useRouter()

const filters = ref<any>({
  name: '',
  deleted_status: null,
})

const handlers = ref({
  data: [] as any,
  current_page: 1,
  page: 1,
  perPage: 10,
  last_page: 1,
})

const onClickPagination = async (page: number) => {
  handlers.value.current_page = page
  await getHandlers()
}

const onClickFilters = async () => {
  // set current page to 1
  handlers.value.current_page = 1
  await getHandlers()
}

const editHandler = (handler: any) => {
  router.push(`/configuration/handlers/edit-${handler.id}`)
}

const viewHandler = (handler: any) => {
  router.push(`/configuration/handlers/view-${handler.id}`)
}

const showConfirmDelete = async (handler: any) => {
  const result = await confirm({
    title: 'Are you sure?',
    confirmationText: 'Update',
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
      loadingStore.loading = true
      const response = await $api.handlers.delete(handler.id)
      snackbar.add({ type: 'success', text: 'handler deleted' })
      await getHandlers()
    } catch (e) {
      console.error(e)
    } finally {
      setTimeout(() => {
        loadingStore.stop()
      }, 250)
    }
  }
}

const getHandlers = async () => {
  try {
    loadingIndicator.start()
    loadingStore.loading = true
    const response = await $api.handlers.getHandlers({
      query: {
        page: handlers.value.current_page,
        perPage: handlers.value.perPage,
        ...flattenArraysToCommaSeparatedString(filters.value),
      },
    })

    handlers.value = response as any
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
    deleted_status: null,
  }
  await getHandlers()
}

onMounted(async () => {
  await getHandlers()
})
</script>
