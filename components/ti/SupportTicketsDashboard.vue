<template>
  <div>
    <div class="flex justify-center items-center mb-2">
      <v-btn size="x-small" variant="tonal" color="primary" @click="getSupportTicketsDash">
        <v-icon>mdi-sync</v-icon> Refresh dashboard
      </v-btn>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
      <div>
        <v-card color="light-blue-accent-4">
          <v-card-title class="text-overline"> Open Tickets </v-card-title>
          <v-card-text>
            <div class="text-h3 font-weight-bold">{{ dashData.open_tickets }}</div>
          </v-card-text>
        </v-card>
      </div>
      <div>
        <v-card color="lime-darken-3">
          <v-card-title class="text-overline"> Working tickets </v-card-title>
          <v-card-text>
            <div class="text-h3 font-weight-bold">{{ dashData.working_tickets }}</div>
          </v-card-text>
        </v-card>
      </div>
      <div>
        <v-card color="teal-accent-4">
          <v-card-title class="text-overline"> Ready to test </v-card-title>
          <v-card-text>
            <div class="text-h3 font-weight-bold">{{ dashData.ready_to_test_tickets }}</div>
          </v-card-text>
        </v-card>
      </div>
      <div>
        <v-card color="light-green-accent-4">
          <v-card-title class="text-overline"> Closed </v-card-title>
          <v-card-text>
            <div class="text-h3 font-weight-bold">{{ dashData.closed_tickets }}</div>
          </v-card-text>
        </v-card>
      </div>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div>
        <v-card color="amber-darken-4" density="compact" max-height="80" variant="outlined">
          <v-card-title class="text-overline">
            <div class="flex items-center gap-2"><span class="text-xl">🚀</span> Next phase</div>
          </v-card-title>
          <v-card-text>
            <div class="text-h5 font-weight-bold">{{ dashData.next_tickets }}</div>
          </v-card-text>
        </v-card>
      </div>
      <div>
        <v-card color="purple-darken-4" density="compact" max-height="80" variant="outlined">
          <v-card-title class="text-overline">
            <div class="flex items-center gap-2"><span class="text-xl">🧐</span> Observation</div>
          </v-card-title>
          <v-card-text>
            <div class="text-h5 font-weight-bold">{{ dashData.observation_tickets }}</div>
          </v-card-text>
        </v-card>
      </div>
      <div>
        <v-card color="lime-darken-4" density="compact" max-height="80" variant="outlined">
          <v-card-title class="text-overline">
            <div class="flex items-center gap-2"><span class="text-xl">🔎</span> More info</div>
          </v-card-title>
          <v-card-text>
            <div class="text-h5 font-weight-bold">{{ dashData.moreinfo_tickets }}</div>
          </v-card-text>
        </v-card>
      </div>
      <div>
        <v-card color="red-darken-4" density="compact" max-height="80" variant="outlined">
          <v-card-title class="text-overline">
            <div class="flex items-center gap-2"><span class="text-xl">🫠</span> Doesn't apply</div>
          </v-card-title>
          <v-card-text>
            <div class="text-h5 font-weight-bold">{{ dashData.rejected_tickets }}</div>
          </v-card-text>
        </v-card>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
const { $api } = useNuxtApp()
const loadingStore = useLoadingStore()

const dashData = ref<any>({
  open_tickets: 0,
  working_tickets: 0,
  ready_to_test_tickets: 0,
  closed_tickets: 0,
})

const getSupportTicketsDash = async () => {
  try {
    loadingStore.start()
    const response = await $api.supportTi.getSupportTicketsDash()

    dashData.value = response as any
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

await getSupportTicketsDash()
</script>
