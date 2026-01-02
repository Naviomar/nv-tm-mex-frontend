<template>
  <v-badge
    v-if="alertsStore.hasUnread"
    :content="alertsStore.unreadCount > 99 ? '99+' : alertsStore.unreadCount"
    color="error"
    overlap
    offset-x="8"
    offset-y="8"
  >
    <v-btn
      variant="text"
      icon="mdi-bell-outline"
      @click.stop="toggleAlerts"
    />
  </v-badge>
  <v-btn
    v-else
    variant="text"
    icon="mdi-bell-outline"
    @click.stop="toggleAlerts"
  />
</template>

<script lang="ts" setup>
const alertsStore = useAlertsStore()

const toggleAlerts = () => {
  alertsStore.toggleDrawer()
}

onMounted(() => {
  alertsStore.fetchUnreadCount()
})
</script>
