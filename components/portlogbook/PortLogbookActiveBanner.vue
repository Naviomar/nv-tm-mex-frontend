<template>
  <v-alert v-if="active.length" type="warning" variant="tonal" density="compact" class="mb-3" icon="mdi-anchor">
    <div class="font-weight-medium">Ports with active events ({{ active.length }})</div>
    <ul class="text-body-2">
      <li v-for="e in active" :key="e.id">
        <b>{{ e.port?.name }}</b> — {{ e.event_name || e.event_type_label }} ({{ e.operations_status_label }}), since
        {{ formatDateString(e.starts_at) }}
      </li>
    </ul>
    <NuxtLink to="/configuration/port-logbook" class="text-body-2 underline">Open port logbook</NuxtLink>
  </v-alert>
</template>
<script setup lang="ts">
// Mounted inside <Can permission="port-logbook-view"> by its parents: the endpoint is permission-protected.
const { $api } = useNuxtApp()
const active = ref<any[]>([])

onMounted(async () => {
  try {
    active.value = (await $api.portLogbook.getActive()) as any[]
  } catch (e) {
    console.error(e)
  }
})
</script>
