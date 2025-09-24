<template>
  <div>
    <div v-if="hasInfo">
      <v-btn color="amber" size="small" @click="viewOrders">View tracker data</v-btn>
    </div>
    <v-dialog v-model="showDialog" max-width="800px">
      <v-card>
        <v-card-title>Tracker more details</v-card-title>
        <v-card-text>
          <div class="space-y-4">
            <div class="flex justify-between border-b pb-2">
              <span class="font-bold">Tracker Ref #:</span>
              <span class="break-words">{{ trackerRef.tracker_number }}</span>
            </div>
            <div class="flex justify-between border-b pb-2">
              <span class="font-bold">Prealert Emails:</span>
              <div class="flex flex-col space-y-1">
                <span
                  v-for="(email, index) in (trackerRef.prealert_email || '').split(',')"
                  :key="index"
                  class="break-words"
                >
                  {{ email.trim() }}
                </span>
              </div>
            </div>
            <div class="flex justify-between border-b pb-2">
              <span class="font-bold">Prealert Agent Emails:</span>
              <div class="flex flex-col space-y-1">
                <span
                  v-for="(email, index) in (trackerRef.prealert_email_agents || '').split(',')"
                  :key="index"
                  class="break-words"
                >
                  {{ email.trim() }}
                </span>
              </div>
            </div>
            <div class="flex justify-between border-b pb-2">
              <span class="font-bold">Weight:</span>
              <span>{{ trackerRef.peso }}</span>
            </div>
            <div class="flex justify-between border-b pb-2">
              <span class="font-bold">Metros:</span>
              <span>{{ trackerRef.metros }}</span>
            </div>
            <div class="flex justify-between border-b pb-2">
              <span class="font-bold">Paquetes:</span>
              <span>{{ trackerRef.paquetes }}</span>
            </div>
            <div class="flex justify-between border-b pb-2">
              <span class="font-bold">ID Contrato:</span>
              <span>{{ trackerRef.id_contrato }}</span>
            </div>
          </div>
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
  trackerRef: {
    type: Object as any,
    required: false,
    default: [],
  },
})

const hasInfo = computed(() => props.trackerRef != null)

const showDialog = ref(false)

const viewOrders = () => {
  showDialog.value = true
}
</script>
