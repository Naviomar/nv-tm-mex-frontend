<template>
  <div>
    <div v-if="hasAlerts">
      <v-btn color="red" size="small" @click="viewAlerts">View tracker alerts</v-btn>
    </div>
    <v-dialog v-model="showDialog" max-width="800px">
      <v-card>
        <v-card-title>Tracker sync alert(s)</v-card-title>
        <v-card-text>
          <v-table density="compact">
            <thead>
              <tr>
                <th class="text-left w-10">Type</th>
                <th class="text-left">Message</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(alert, index) in props.syncAlerts" :key="`tracker-alert-${index}`">
                <td>
                  {{ alert.type }}
                </td>
                <td>{{ alert.message }}</td>
              </tr>
            </tbody>
          </v-table>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="showDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script setup lang="ts">
const props = defineProps({
  syncAlerts: {
    type: Array as any,
    required: false,
    default: [],
  },
})

const hasAlerts = computed(() => props.syncAlerts != null && props.syncAlerts.length > 0)

const showDialog = ref(false)

const viewAlerts = () => {
  showDialog.value = true
}
</script>
