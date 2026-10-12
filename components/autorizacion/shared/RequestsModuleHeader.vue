<template>
  <div class="req-header">
    <div class="req-header__top">
      <v-btn variant="text" size="small" prepend-icon="mdi-arrow-left" @click="$router.back()">Back</v-btn>
      <v-icon size="18" class="text-medium-emphasis">mdi-shield-key-outline</v-icon>
      <span class="req-header__module">Authorizations</span>
    </div>

    <v-tabs :model-value="route.path" color="primary" density="comfortable" class="req-header__tabs">
      <v-tab
        v-for="tab in tabs"
        :key="tab.to"
        :value="tab.to"
        :to="tab.to"
        :prepend-icon="tab.icon"
      >
        {{ tab.label }}
        <v-chip
          v-if="pendingFor(tab.type)"
          size="x-small"
          color="warning"
          variant="flat"
          class="ml-2"
          :title="`${pendingFor(tab.type)} waiting for your decision`"
        >{{ pendingFor(tab.type) }}</v-chip>
      </v-tab>
    </v-tabs>

    <div class="req-header__title">
      <h1>{{ current.title }}</h1>
      <p>{{ current.description }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TicketType } from '~/repository/modules/catalogs/ticketMessages'

const route = useRoute()
const inbox = useRequestInboxStore()

const tabs: { to: string; label: string; icon: string; type: TicketType; title: string; description: string }[] = [
  {
    to: '/auth-requests',
    label: 'Authorizations',
    icon: 'mdi-shield-key-outline',
    type: 'authorization-request',
    title: 'Authorization requests',
    description: 'Approvals needed to run sensitive actions on invoices, references and vouchers. Granting one lets the requester perform that single action.',
  },
  {
    to: '/auth-process-requests',
    label: 'Processes',
    icon: 'mdi-cog-sync-outline',
    type: 'process-request',
    title: 'Process requests',
    description: 'Changes that need a second pair of eyes before they apply, such as bank accounts, revalidations and locked charges.',
  },
  {
    to: '/request-assistance',
    label: 'Support',
    icon: 'mdi-lifebuoy',
    type: 'support-assistance',
    title: 'Support requests',
    description: 'Help requested from the team: missing charges, permissions or data fixes. Use the chat to follow up with the requester.',
  },
]

const current = computed(() => tabs.find((t) => t.to === route.path) ?? tabs[0]!)

const pendingFor = (type: TicketType) => inbox.pendingRequests.filter((r) => r.ticket_type === type).length
</script>

<style scoped>
.req-header {
  margin-bottom: 12px;
}
.req-header__top {
  display: flex;
  align-items: center;
  gap: 6px;
}
.req-header__module {
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: rgba(var(--v-theme-on-surface), 0.6);
}
.req-header__tabs {
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
.req-header__title {
  margin-top: 14px;
}
.req-header__title h1 {
  font-size: 1.35rem;
  font-weight: 700;
  line-height: 1.2;
}
.req-header__title p {
  margin-top: 2px;
  max-width: 820px;
  font-size: 0.85rem;
  color: rgba(var(--v-theme-on-surface), 0.65);
}
</style>
