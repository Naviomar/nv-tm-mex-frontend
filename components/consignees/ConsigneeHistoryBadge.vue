<template>
  <div class="relative">
    <div class="flex gap-2 items-center">
      <div class="content-slot">
        <slot></slot>
      </div>

      <div>
        <v-tooltip location="top">
          <template v-slot:activator="{ props }">
            <v-icon v-bind="props" @click="openDetails">mdi-account-question</v-icon>
          </template>
          <div>Historial del cliente</div>
        </v-tooltip>
      </div>
    </div>

    <v-dialog v-model="showDetails" max-width="480">
      <v-card>
        <v-card-title>
          <div class="flex gap-2 items-center">
            <v-icon>mdi-history</v-icon>
            <div class="font-bold">Historial del cliente</div>
          </div>
        </v-card-title>
        <v-card-text style="max-height: 60vh; overflow-y: auto">
          <div v-if="loading" class="flex justify-center py-6">
            <v-progress-circular indeterminate color="primary" />
          </div>
          <div v-else-if="!events.length" class="text-center py-6 text-medium-emphasis">
            Sin actividad registrada
          </div>
          <v-list v-else lines="two" density="compact">
            <v-list-item v-for="(event, index) in events" :key="`activity-${index}`">
              <template v-slot:prepend>
                <v-avatar>
                  <v-icon :color="actionColor(event.action)">{{ actionIcon(event.action) }}</v-icon>
                </v-avatar>
              </template>
              <v-list-item-title>{{ event.description }}</v-list-item-title>
              <template v-slot:subtitle>
                <div>{{ event.user?.name || 'Sistema' }}</div>
                <div class="italic text-xs font-bold">@ {{ formatDateString(event.at) }}</div>
              </template>
            </v-list-item>
          </v-list>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" size="x-small" @click="showDetails = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
const { $api } = useNuxtApp()

const props = defineProps({
  consigneeId: {
    type: [Number, String],
    required: true,
  },
})

const showDetails = ref(false)
const loading = ref(false)
const events = ref<any[]>([])
const loaded = ref(false)

const actionColor = (action: string) => {
  if (action === 'created') return 'green'
  if (action === 'deleted') return 'red'
  return 'amber'
}

const actionIcon = (action: string) => {
  if (action === 'created') return 'mdi-creation-outline'
  if (action === 'deleted') return 'mdi-delete-outline'
  return 'mdi-update'
}

watch(
  () => props.consigneeId,
  () => {
    loaded.value = false
    events.value = []
  }
)

const openDetails = async () => {
  showDetails.value = true
  if (loaded.value) return
  try {
    loading.value = true
    const response = await $api.consignees.getActivityLog(props.consigneeId)
    events.value = (response as any) || []
    loaded.value = true
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.content-slot {
  position: relative;
  z-index: 1;
}
</style>
