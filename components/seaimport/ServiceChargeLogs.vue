<template>
  <div>
    <v-btn color="slate" size="small" variant="outlined" @click="showLogs">Service Charge Audit Logs</v-btn>
    <v-dialog v-model="logs.show" max-width="800px">
      <v-card>
        <v-card-title>Service Charge Tracking</v-card-title>
        <v-card-text>
          <v-table density="compact" class="max-h-[400px] overflow-y-auto">
            <thead>
              <tr>
                <th class="font-bold!">User Info</th>
                <th class="font-bold!">Data</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="log in logs.data" :key="`service-charge-log-${log.id}`">
                <td>
                  <UserInfoBadge :item="log">
                    {{ formatDateString(log.created_at) }}
                  </UserInfoBadge>
                </td>
                <td>
                  <ChargeAuditBadge :item="log" />
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="closeLogs">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script setup lang="ts">
const { $api } = useNuxtApp()
const loadingStore = useLoadingStore()

const props = defineProps({
  id: {
    type: [String, Number],
    required: true,
  },
  serviceClass: {
    type: String,
    required: true,
  },
})

const logs = ref<any>({
  show: false,
  data: [],
})

const showLogs = async () => {
  try {
    logs.value.show = true
    loadingStore.loading = true
    const body = {
      service_class: props.serviceClass,
      service_id: props.id,
    }
    const response = await $api.serviceChargeLogs.getByService(body)
    logs.value.data = response
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const closeLogs = () => {
  logs.value = {
    show: false,
    data: [],
  }
}
</script>
