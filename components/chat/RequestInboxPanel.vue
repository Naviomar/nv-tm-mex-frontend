<template>
  <div class="inbox">
    <!-- Conversation view -->
    <template v-if="selectedChat">
      <div class="inbox__chat-head">
        <v-btn icon="mdi-arrow-left" size="small" variant="text" @click="closeChat" />
        <div class="inbox__chat-title">
          <span class="text-body-2 font-weight-medium">{{ selectedChat.type_name }}</span>
          <span class="text-caption text-medium-emphasis">
            {{ [selectedChat.subject, selectedChat.requester].filter(Boolean).join(' · ') }}
          </span>
        </div>
        <v-spacer />
        <v-btn
          size="x-small"
          variant="text"
          color="primary"
          append-icon="mdi-open-in-new"
          @click="goTo(selectedChat.action_url)"
        >
          Open request
        </v-btn>
      </div>
      <div class="inbox__chat-body">
        <TicketChatPanel
          :ticket-type="selectedChat.ticket_type"
          :ticket-id="selectedChat.ticket_id"
          :can-manage="isAdminRole()"
          height="100%"
          @close="closeChat"
        />
      </div>
    </template>

    <!-- Inbox -->
    <template v-else>
      <div class="inbox__toolbar">
        <v-tabs v-model="tab" density="compact" color="primary" grow>
          <v-tab value="all">All<span class="inbox__count">{{ store.total }}</span></v-tab>
          <v-tab value="requests">Requests<span class="inbox__count inbox__count--warn">{{ store.pendingRequests.length }}</span></v-tab>
          <v-tab value="chats">Chats<span class="inbox__count inbox__count--err">{{ store.unreadChats.length }}</span></v-tab>
        </v-tabs>
        <div class="inbox__filters">
          <v-text-field
            v-model="search"
            density="compact"
            variant="outlined"
            hide-details
            clearable
            prepend-inner-icon="mdi-magnify"
            placeholder="Search type, reference, person…"
          />
          <v-btn-toggle v-model="kind" density="compact" variant="outlined" color="primary" divided>
            <v-btn v-for="(meta, key) in typeMeta" :key="key" :value="key" size="small" :title="meta.label">
              <v-icon size="18">{{ meta.icon }}</v-icon>
            </v-btn>
          </v-btn-toggle>
        </div>
      </div>

      <div class="inbox__scroll">
        <template v-for="group in groups" :key="group.key">
          <section v-if="group.items.length" class="inbox__section">
            <header class="inbox__section-title">
              <v-icon size="16" :color="group.color">{{ group.icon }}</v-icon>
              <span>{{ group.title }}</span>
              <span class="inbox__section-hint">{{ group.hint }}</span>
            </header>

            <button
              v-for="item in group.items"
              :key="`${group.key}-${item.ticket_type}-${item.ticket_id}`"
              class="inbox__item"
              :class="{ 'inbox__item--urgent': isUrgent(item) }"
              @click="group.key === 'chats' ? openChat(item as LiveChat) : goTo(item.action_url)"
            >
              <v-badge
                :model-value="group.key === 'chats'"
                :content="(item as LiveChat).unread_count"
                color="error"
                location="top end"
                offset-x="2"
                offset-y="2"
              >
                <v-avatar size="38" :color="typeMeta[item.ticket_type].color" variant="tonal">
                  <v-icon size="20">{{ typeMeta[item.ticket_type].icon }}</v-icon>
                </v-avatar>
              </v-badge>

              <div class="inbox__item-main">
                <div class="inbox__item-top">
                  <span class="inbox__item-title" :title="item.type_name">{{ item.type_name }}</span>
                  <span class="inbox__item-time" :title="fullDate(timeOf(item))">{{ timeAgo(timeOf(item)) }}</span>
                </div>
                <div v-if="item.subject" class="inbox__item-subject" :title="item.subject">{{ item.subject }}</div>
                <div class="inbox__item-text">
                  <template v-if="group.key === 'chats'">
                    <strong>{{ (item as LiveChat).last_sender || 'Someone' }}:</strong>
                    <template v-if="(item as LiveChat).last_message">{{ (item as LiveChat).last_message }}</template>
                    <em v-else>sent an attachment</em>
                  </template>
                  <template v-else>{{ item.summary || 'No description provided.' }}</template>
                </div>
                <div class="inbox__item-meta">
                  <span class="inbox__who"><v-icon size="13">mdi-account-outline</v-icon>{{ item.requester || 'Unknown' }}</span>
                  <v-chip
                    v-if="priorityOf(item)"
                    size="x-small"
                    :color="priorityColor(priorityOf(item)!)"
                    variant="tonal"
                    label
                  >{{ priorityOf(item) }}</v-chip>
                  <v-chip size="x-small" variant="tonal" label>{{ item.status_label }}</v-chip>
                  <v-spacer />
                  <span class="inbox__cta">
                    {{ group.key === 'chats' ? 'Reply' : 'Review' }}
                    <v-icon size="14">mdi-arrow-right</v-icon>
                  </span>
                </div>
              </div>
            </button>
          </section>
        </template>

        <div v-if="!hasItems" class="inbox__empty">
          <v-icon size="44" :color="store.total ? 'grey' : 'success'">
            {{ store.total ? 'mdi-filter-off-outline' : 'mdi-check-circle-outline' }}
          </v-icon>
          <div class="text-body-2 mt-2">{{ store.total ? 'Nothing matches your filters' : "You're all caught up" }}</div>
          <div class="text-caption text-medium-emphasis">
            {{ store.total ? 'Clear the search or the type filter.' : 'No requests waiting and no unread chats.' }}
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { LiveChat, PendingRequest, TicketType } from '~/repository/modules/catalogs/ticketMessages'

const emit = defineEmits<{ (e: 'navigate'): void }>()

const store = useRequestInboxStore()
const router = useRouter()
const { isAdminRole } = useCheckUser()

const selectedChat = ref<LiveChat | null>(null)
const tab = ref<'all' | 'requests' | 'chats'>('all')
const search = ref('')
const kind = ref<TicketType | undefined>(undefined)

const typeMeta: Record<TicketType, { label: string; icon: string; color: string }> = {
  'authorization-request': { label: 'Authorizations', icon: 'mdi-shield-key-outline', color: 'primary' },
  'process-request': { label: 'Processes', icon: 'mdi-cog-sync-outline', color: 'info' },
  'support-assistance': { label: 'Support', icon: 'mdi-lifebuoy', color: 'secondary' },
}

type Item = LiveChat | PendingRequest

const matches = (item: Item) => {
  if (kind.value && item.ticket_type !== kind.value) return false
  const q = search.value?.trim().toLowerCase()
  if (!q) return true
  return [item.type_name, item.subject, item.requester, item.summary, (item as LiveChat).last_message, (item as LiveChat).last_sender]
    .some((v) => v && String(v).toLowerCase().includes(q))
}

const groups = computed(() => [
  {
    key: 'requests',
    title: 'Waiting for you',
    hint: 'New requests without a decision',
    icon: 'mdi-clock-alert-outline',
    color: 'warning',
    items: tab.value === 'chats' ? [] : store.pendingRequests.filter(matches),
  },
  {
    key: 'chats',
    title: 'Unread messages',
    hint: 'Replies on open requests',
    icon: 'mdi-message-badge-outline',
    color: 'error',
    items: tab.value === 'requests' ? [] : store.unreadChats.filter(matches),
  },
])

const hasItems = computed(() => groups.value.some((g) => g.items.length))

const timeOf = (item: Item) => (item as LiveChat).last_message_at ?? (item as PendingRequest).created_at
const priorityOf = (item: Item) => {
  const p = (item as PendingRequest).priority
  return p && p !== 'low' ? p : null
}
const isUrgent = (item: Item) => ['critical', 'high'].includes((item as PendingRequest).priority ?? '')
const fullDate = (value: string) => (value ? new Date(value).toLocaleString() : '')

const priorityColor = (p: string) => ({ critical: 'error', high: 'warning', medium: 'info' } as Record<string, string>)[p] ?? 'default'

const timeAgo = (value: string) => {
  if (!value) return ''
  const diff = Math.max(0, Date.now() - new Date(value).getTime())
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'now'
  if (min < 60) return `${min}m ago`
  const h = Math.floor(min / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

const openChat = (chat: LiveChat) => {
  selectedChat.value = chat
}

const closeChat = () => {
  if (selectedChat.value) store.markChatRead(selectedChat.value.ticket_type, selectedChat.value.ticket_id)
  selectedChat.value = null
  store.refresh()
}

const goTo = (url: string) => {
  emit('navigate')
  router.push(url)
}
</script>

<style scoped>
.inbox {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
}
.inbox__toolbar {
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  background: rgb(var(--v-theme-surface));
}
.inbox__count {
  margin-left: 6px;
  padding: 0 6px;
  min-width: 18px;
  border-radius: 9px;
  font-size: 0.68rem;
  line-height: 18px;
  background: rgba(var(--v-theme-on-surface), 0.12);
}
.inbox__count--warn {
  background: rgba(var(--v-theme-warning), 0.2);
}
.inbox__count--err {
  background: rgba(var(--v-theme-error), 0.18);
}
.inbox__filters {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
}
.inbox__scroll {
  overflow-y: auto;
  flex: 1 1 auto;
}
.inbox__section-title {
  display: flex;
  align-items: baseline;
  gap: 6px;
  position: sticky;
  top: 0;
  z-index: 1;
  padding: 8px 14px;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  background: rgb(var(--v-theme-background));
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}
.inbox__section-title .v-icon {
  align-self: center;
}
.inbox__section-hint {
  font-weight: 400;
  text-transform: none;
  letter-spacing: 0;
  color: rgba(var(--v-theme-on-surface), 0.55);
}
.inbox__item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  width: 100%;
  padding: 12px 14px;
  text-align: left;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  border-left: 3px solid transparent;
  background: rgb(var(--v-theme-surface));
  cursor: pointer;
}
.inbox__item:hover {
  background: rgba(var(--v-theme-primary), 0.06);
}
.inbox__item--urgent {
  border-left-color: rgb(var(--v-theme-error));
}
.inbox__item-main {
  flex: 1 1 auto;
  min-width: 0;
}
.inbox__item-top {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
}
.inbox__item-title {
  font-size: 0.86rem;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.inbox__item-time {
  flex: 0 0 auto;
  font-size: 0.7rem;
  color: rgba(var(--v-theme-on-surface), 0.55);
}
.inbox__item-subject {
  font-size: 0.78rem;
  font-weight: 500;
  color: rgb(var(--v-theme-primary));
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.inbox__item-text {
  margin-top: 2px;
  font-size: 0.78rem;
  line-height: 1.35;
  color: rgba(var(--v-theme-on-surface), 0.75);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.inbox__item-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 6px;
}
.inbox__who {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  max-width: 160px;
  font-size: 0.72rem;
  color: rgba(var(--v-theme-on-surface), 0.65);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.inbox__cta {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-size: 0.72rem;
  font-weight: 600;
  color: rgb(var(--v-theme-primary));
}
.inbox__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 56px 16px;
  text-align: center;
}
.inbox__chat-head {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.12);
}
.inbox__chat-title {
  display: flex;
  flex-direction: column;
  min-width: 0;
  line-height: 1.2;
}
.inbox__chat-body {
  flex: 1 1 auto;
  min-height: 0;
}
</style>
