<template>
  <v-container fluid>
    <h1 class="text-xl font-bold">Notifications Catalog</h1>
    <p class="text-sm text-medium-emphasis mb-4">
      Reference list of every system notification and what it is used for.
    </p>
    <div class="mt-4">
      <v-btn color="slate" size="small" variant="outlined" to="/configuration/customers/missing-notifications" class="mb-4">
        Back to customers notifications
      </v-btn>
    </div>

    <v-text-field
      v-model="search"
      density="compact"
      label="Search by name"
      prepend-inner-icon="mdi-magnify"
      clearable
      class="mb-4"
      style="max-width: 400px"
      @update:model-value="onSearch"
    ></v-text-field>

    <v-row>
      <v-col v-for="noty in notifications" :key="noty.id" cols="12" md="6" lg="4">
        <v-card variant="outlined">
          <v-card-item>
            <template v-slot:prepend>
              <v-icon color="primary">mdi-email-outline</v-icon>
            </template>
            <v-card-title>{{ formatNotificationName(noty.short_name) }}</v-card-title>
          </v-card-item>
          <v-card-text>
            {{ noty.description || 'No description available.' }}
          </v-card-text>
        </v-card>
      </v-col>
      <v-col v-if="!loading && !notifications.length" cols="12">
        <v-alert type="info" variant="tonal">No notifications found.</v-alert>
      </v-col>
    </v-row>

    <div v-if="lastPage > 1" class="d-flex justify-center mt-4">
      <v-pagination v-model="currentPage" :length="lastPage" rounded="circle" density="compact" @update:model-value="getNotifications"></v-pagination>
    </div>
  </v-container>
</template>
<script setup lang="ts">
import { formatNotificationName } from '~/utils/mailNotifications'

definePageMeta({
  title: 'Notifications Catalog',
  layout: 'default',
})

const { $api } = useNuxtApp()
const loadingStore = useLoadingStore()

const search = ref('')
const notifications = ref<any[]>([])
const currentPage = ref(1)
const lastPage = ref(1)
const loading = ref(false)

const getNotifications = async () => {
  try {
    loading.value = true
    loadingStore.start()
    const response: any = await $api.mailNotifications.getMailNotifications({
      query: {
        page: currentPage.value,
        limit: 12,
        name: search.value || undefined,
      },
    })
    notifications.value = (response.data ?? []).filter((n: any) => !n.deleted_at)
    lastPage.value = response.last_page
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
    setTimeout(() => {
      loadingStore.stop()
    }, 200)
  }
}

let searchTimeout: ReturnType<typeof setTimeout>
const onSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    getNotifications()
  }, 350)
}

await getNotifications()
</script>
