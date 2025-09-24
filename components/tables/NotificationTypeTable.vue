<template>
  <div>
    <div class="mb-4">
      <div class="grid grid-cols-6">
        <div class="col-span-2">
          <v-text-field density="compact" label="Name" v-model="filters.name" @keyup.enter="getNotificationsTypes" />
        </div>
      </div>
      <div class="grid grid-cols-1">
        <div class="flex gap-2">
          <v-btn color="secondary" @click="clearFilters"> Clear </v-btn>
          <v-btn color="primary" @click="getNotificationsTypes"> Search </v-btn>
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
              <th class="text-left">Internal emails</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(notificationType, index) in notificationsType.data"
              :key="`notytype-${index}`"
              :class="{ 'bg-red-100! dark:bg-red-900!': notificationType.deleted_at }"
            >
              <td>
                <div class="flex gap-2">
                  <ViewButton :item="notificationType" @click="viewNotificationTypeForm(notificationType)" />
                  <EditButton :item="notificationType" @click="editNotificationType(notificationType)" />
                </div>
              </td>
              <td>{{ notificationType.name }}</td>
              <td>{{ notificationType.code }}</td>
              <td>{{ notificationType.emails_count }}</td>
            </tr>
          </tbody>
        </v-table>
        <v-pagination
          v-model="notificationsType.current_page"
          :length="notificationsType.last_page"
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

const notificationsType = ref({
  data: [] as any,
  current_page: 1,
  page: 1,
  perPage: 10,
  last_page: 1,
})

const onClickPagination = async (page: number) => {
  
  notificationsType.value.current_page = page
  await getNotificationsTypes()
}

const getNotificationsTypes = async () => {
  try {
    loadingIndicator.start()
    loadingStore.loading = true
    const response = await $api.notificationsTypes.getNotificationsTypes({
      query: {
        page: notificationsType.value.current_page,
        perPage: notificationsType.value.perPage,
         ...flattenArraysToCommaSeparatedString(filters.value),
      },
    })

    notificationsType.value = response as any
  } catch (e) {
    console.error(e)
  } finally {
    // timeout 1 second
    setTimeout(() => {
      loadingIndicator.finish()
      loadingStore.loading = false
    }, 200)
  }
}

const showConfirmDelete = async (notificationType: any) => {
  const result = await confirm({
    title: 'Are you sure?',
    confirmationText: 'Update',
    content: 'Please confirm you want to delete or activate this notification type.',
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
      const response = await $api.notificationsTypes.delete(notificationType.id)
      snackbar.add({ type: 'success', text: 'Notification updated' })
      await getNotificationsTypes()
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
    name: '',
  }
  await getNotificationsTypes()
}
const viewNotificationTypeForm = (notificationType: any) => {
  router.push(`/configuration/notifications-types/view-${notificationType.id}`)
}

const editNotificationType = (notificationType: any) => {
  router.push(`/configuration/notifications-types/edit-${notificationType.id}`)
}

onMounted(async () => {
  await getNotificationsTypes()
})
</script>
