<template>
  <div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <v-card class="mb-4">
          <v-card-title>
            <div class="font-bold">Notification type: {{ item.name }}</div>
          </v-card-title>
          <v-card-text>
            <div class="font-bold">Internal emails</div>
            <v-table density="compact">
              <thead>
                <tr>
                  <th class="text-left" width="20">Actions</th>
                  <th class="text-left">Email</th>
                  <th class="text-left">Created at</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="item.notification_types_emails?.length === 0">
                  <td colspan="3" class="text-center">No emails found</td>
                </tr>
                <tr v-for="(notyEmail, index) in item.notification_types_emails" :key="`notif-email-${index}`">
                  <td>
                    <div class="flex gap-2">
                      <TrashButton v-if="false" :item="notyEmail" @click="deleteNotyEmail" />
                    </div>
                  </td>
                  <td>{{ notyEmail.email }}</td>
                  <td>{{ formatDateString(notyEmail.created_at) }}</td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>
        </v-card>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
const { $api } = useNuxtApp()
const loadingStore = useLoadingStore()
const snackbar = useSnackbar()

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
})

const item = ref<any>({})

const getData = async () => {
  try {
    loadingStore.start()
    const response = await $api.notificationsTypes.getById(props.id)
    item.value = response
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

onMounted(async () => {
  await getData()
})
</script>
