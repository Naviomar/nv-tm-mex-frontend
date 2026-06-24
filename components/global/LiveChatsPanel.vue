<template>
  <v-card
    :variant="hideHeader ? 'flat' : 'outlined'"
    :class="hideHeader ? '' : 'mb-4'"
    :style="inline ? 'flex: 1 1 auto; min-height: 0; display: flex; flex-direction: column' : ''"
  >
    <v-card-title v-if="!hideHeader" class="d-flex align-center py-2">
      <v-icon class="mr-2" size="small">mdi-chat-processing-outline</v-icon>
      <span class="text-subtitle-1">Live chats</span>
      <v-spacer />
      <v-btn icon="mdi-refresh" size="small" variant="text" :loading="loading" @click="load" />
      <v-btn icon size="small" variant="text" @click="expanded = !expanded">
        <v-icon>{{ expanded ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
      </v-btn>
    </v-card-title>

    <v-expand-transition>
      <div v-show="expanded" :class="inline ? 'd-flex flex-column' : ''" :style="inline ? 'flex: 1 1 auto; min-height: 0' : ''">
        <!-- Inline conversation view -->
        <template v-if="inline && selectedChat">
          <div class="d-flex align-center px-2 py-1" style="border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.12)">
            <v-btn icon="mdi-arrow-left" size="small" variant="text" @click="selectedChat = null" />
            <span class="text-body-2 ml-1 font-weight-medium">{{ selectedChat.label }}</span>
          </div>
          <div style="flex: 1 1 auto; min-height: 0">
            <TicketChatPanel
              :ticket-type="selectedChat.ticket_type"
              :ticket-id="selectedChat.ticket_id"
              :can-manage="isAdminRole()"
              height="100%"
              @close="selectedChat = null"
            />
          </div>
        </template>

        <!-- Chat list -->
        <template v-else>
          <v-divider v-if="!hideHeader" />
          <v-list v-if="filteredChats.length" density="compact" class="py-0">
            <v-list-item
              v-for="chat in filteredChats"
              :key="chat.ticket_type + '-' + chat.ticket_id"
              @click="openChat(chat)"
            >
              <template #prepend>
                <v-badge :content="chat.unread_count" :model-value="chat.unread_count > 0" color="error" inline>
                  <v-icon size="small">mdi-message-text-outline</v-icon>
                </v-badge>
              </template>
              <v-list-item-title class="text-body-2">
                {{ chat.label }}
                <span class="text-medium-emphasis"> &mdash; {{ chat.requester }}</span>
              </v-list-item-title>
              <v-list-item-subtitle class="text-caption">
                {{ chat.last_message }}
              </v-list-item-subtitle>
              <template #append>
                <span class="text-caption text-medium-emphasis">{{ formatDate(chat.last_message_at) }}</span>
              </template>
            </v-list-item>
          </v-list>
          <v-card-text v-else class="text-medium-emphasis text-body-2">
            No live chats to follow up right now.
          </v-card-text>
        </template>
      </div>
    </v-expand-transition>
  </v-card>
</template>

<script setup lang="ts">
import type { LiveChat, TicketType } from '~/repository/modules/catalogs/ticketMessages'

const props = defineProps<{
  ticketType?: TicketType
  hideHeader?: boolean
  /** When true, clicking a chat expands the conversation in place instead of navigating away */
  inline?: boolean
}>()

const { $api } = useNuxtApp()
const router = useRouter()
const { isAdminRole } = useCheckUser()

const loading = ref(false)
const expanded = ref(true)
const chats = ref<LiveChat[]>([])
const selectedChat = ref<LiveChat | null>(null)

const filteredChats = computed(() => {
  if (!props.ticketType) return chats.value
  return chats.value.filter((c) => c.ticket_type === props.ticketType)
})

const load = async () => {
  loading.value = true
  try {
    chats.value = await $api.ticketMessages.getLiveChats()
  } finally {
    loading.value = false
  }
}

const openChat = (chat: LiveChat) => {
  if (props.inline) {
    selectedChat.value = chat
  } else {
    router.push(chat.action_url)
  }
}

const formatDate = (value: string) => {
  if (!value) return ''
  return new Date(value).toLocaleString()
}

onMounted(load)
</script>
