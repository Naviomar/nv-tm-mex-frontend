<template>
  <div v-if="filteredChats.length || expanded" class="live-chats mb-3">
    <button class="live-chats__bar" @click="expanded = !expanded">
      <v-icon size="18" :color="unreadTotal ? 'error' : undefined">mdi-chat-processing-outline</v-icon>
      <span class="live-chats__title">Live chats</span>
      <v-chip size="x-small" variant="tonal">{{ filteredChats.length }} active</v-chip>
      <v-chip v-if="unreadTotal" size="x-small" color="error" variant="flat">{{ unreadTotal }} unread</v-chip>
      <v-spacer />
      <v-btn
        icon="mdi-refresh"
        size="x-small"
        variant="text"
        :loading="loading"
        @click.stop="load"
      />
      <v-icon size="20">{{ expanded ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
    </button>

    <v-expand-transition>
      <div v-show="expanded" class="live-chats__list">
        <button
          v-for="chat in filteredChats"
          :key="chat.ticket_type + '-' + chat.ticket_id"
          class="live-chats__item"
          @click="openChat(chat)"
        >
          <v-badge :content="chat.unread_count" :model-value="chat.unread_count > 0" color="error" inline>
            <v-icon size="18">mdi-message-text-outline</v-icon>
          </v-badge>
          <div class="live-chats__main">
            <div class="live-chats__label">
              {{ chat.type_name }}<span v-if="chat.subject" class="text-medium-emphasis"> — {{ chat.subject }}</span>
            </div>
            <div class="live-chats__last"><strong>{{ chat.last_sender || 'Someone' }}:</strong> {{ chat.last_message || 'sent an attachment' }}</div>
          </div>
          <span class="text-caption text-medium-emphasis">{{ formatDate(chat.last_message_at) }}</span>
        </button>
        <div v-if="!filteredChats.length" class="live-chats__empty">No active chats.</div>
      </div>
    </v-expand-transition>
  </div>
</template>

<script setup lang="ts">
import type { LiveChat, TicketType } from '~/repository/modules/catalogs/ticketMessages'

const props = defineProps<{
  ticketType?: TicketType
}>()

const { $api } = useNuxtApp()
const router = useRouter()

const loading = ref(false)
// Collapsed by default: the bar only shows counts until the user asks for the list
const expanded = ref(false)
const chats = ref<LiveChat[]>([])

const filteredChats = computed(() => {
  if (!props.ticketType) return chats.value
  return chats.value.filter((c) => c.ticket_type === props.ticketType)
})

const unreadTotal = computed(() => filteredChats.value.reduce((sum, c) => sum + c.unread_count, 0))

const load = async () => {
  loading.value = true
  try {
    chats.value = await $api.ticketMessages.getLiveChats()
  } finally {
    loading.value = false
  }
}

const openChat = (chat: LiveChat) => {
  router.push(chat.action_url)
}

const formatDate = (value: string) => {
  if (!value) return ''
  return new Date(value).toLocaleString()
}

onMounted(load)
</script>

<style scoped>
.live-chats {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 8px;
  background: rgb(var(--v-theme-surface));
  overflow: hidden;
}
.live-chats__bar {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 6px 12px;
  cursor: pointer;
}
.live-chats__title {
  font-size: 0.85rem;
  font-weight: 600;
}
.live-chats__list {
  max-height: 260px;
  overflow-y: auto;
  border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
.live-chats__item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 6px 12px;
  text-align: left;
  cursor: pointer;
}
.live-chats__item:hover {
  background: rgba(var(--v-theme-primary), 0.06);
}
.live-chats__main {
  flex: 1 1 auto;
  min-width: 0;
}
.live-chats__label {
  font-size: 0.82rem;
  font-weight: 500;
}
.live-chats__last {
  font-size: 0.72rem;
  color: rgba(var(--v-theme-on-surface), 0.65);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.live-chats__empty {
  padding: 10px 12px;
  font-size: 0.8rem;
  color: rgba(var(--v-theme-on-surface), 0.6);
}
</style>
