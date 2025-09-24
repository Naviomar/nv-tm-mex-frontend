<template>
  <div>
    <div v-if="false" class="mb-4">
      <div class="grid grid-cols-6">
        <div class="col-span-3">
          <v-text-field density="compact" label="Name" />
        </div>
      </div>
      <div class="grid grid-cols-1">
        <div class="flex gap-2">
          <v-btn color="secondary" @click="clearFilters"> Clear </v-btn>
          <v-btn color="primary" @click="getFreightForwardersInAGroup"> Search </v-btn>
        </div>
      </div>
    </div>
    <v-card>
      <v-card-title>
        <h3>Freight forwarders in Group #{{ ffGroup.name }}</h3>
      </v-card-title>
      <v-card-text>
        <v-table density="compact">
          <thead>
            <tr>
              <th class="text-left">Freight forwarder</th>
              <th class="text-left">Created at</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="freightsForwarders.length === 0">
              <td colspan="2" class="text-center">No freight forwarders in this group</td>
            </tr>
            <tr v-for="(ff, index) in freightsForwarders" :key="`ff-${index}`" :class="{ 'bg-red-100! dark:bg-red-900!': ff.deleted_at }">
              <td>{{ ff.name }}</td>
              <td>{{ formatDateString(ff.created_at) }}</td>
            </tr>
          </tbody>
        </v-table>
      </v-card-text>
    </v-card>
  </div>
</template>
<script setup lang="ts">
const { $api, $notifications } = useNuxtApp()
const snackbar = useSnackbar()
const confirm = $notifications.useConfirm()
const router = useRouter()
const route = useRoute()

const loadingIndicator = useLoadingIndicator()
const loadingStore = useLoadingStore()
const id = route.params.id

const filters = ref({
  name: '',
})

const ffGroup = ref<any>()

const freightsForwarders = ref<any>()

const getFreightForwardersInAGroup = async () => {
  try {
    loadingIndicator.start()
    loadingStore.loading = true
    const response = (await $api.freightForwardersGroups.getFreightForwardersInAGroup(id as string)) as any

    ffGroup.value = response.group || {}
    freightsForwarders.value = response.freightForwarders || []
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

await getFreightForwardersInAGroup()

const clearFilters = async () => {
  filters.value = {
    name: '',
  }
  await getFreightForwardersInAGroup()
}
</script>
