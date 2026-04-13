<template>
  <div class="ticket-chat-panel" :style="panelStyle">
    <!-- Header -->
    <div class="chat-header d-flex align-center px-4 py-2">
      <v-avatar color="primary" size="32" rounded="lg" class="mr-2">
        <v-icon color="white" size="18">mdi-message-text</v-icon>
      </v-avatar>
      <div class="flex-grow-1 min-w-0">
        <div class="text-subtitle-2 font-weight-bold">Ticket Chat</div>
        <div class="text-caption text-medium-emphasis" style="line-height:1">
          {{ visibleMessages.length }} messages
        </div>
      </div>
      <v-chip
        v-if="unreadCount > 0"
        color="error"
        size="x-small"
        variant="flat"
        class="mr-2 font-weight-bold"
      >
        <v-icon start size="10">mdi-circle</v-icon>
        {{ unreadCount }} new
      </v-chip>
      <v-btn
        v-if="showInternalToggle"
        :color="showInternal ? 'warning' : 'default'"
        variant="tonal"
        size="x-small"
        @click="showInternal = !showInternal"
        class="mr-1"
        rounded="lg"
      >
        <v-icon size="14" class="mr-1">{{ showInternal ? 'mdi-eye' : 'mdi-eye-off-outline' }}</v-icon>
        {{ showInternal ? 'All' : 'Public' }}
      </v-btn>
      <v-btn icon size="x-small" variant="text" @click="$emit('close')">
        <v-icon size="18">mdi-close</v-icon>
      </v-btn>
    </div>

    <!-- CC Users -->
    <TicketCcUsers
      v-if="ticketType === 'authorization-request' || ticketType === 'process-request'"
      :ticket-type="ticketType"
      :ticket-id="ticketId"
    />

    <!-- Messages list -->
    <div class="messages-wrapper">
      <div
        ref="messagesContainer"
        class="chat-messages"
        @scroll="onMessagesScroll"
      >
        <div v-if="isLoading" class="d-flex justify-center py-6">
          <v-progress-circular indeterminate color="primary" size="32" width="3" />
        </div>

        <div v-else-if="visibleMessages.length === 0" class="empty-state d-flex flex-column align-center justify-center py-12">
          <v-avatar color="grey-lighten-3" size="72" class="mb-4">
            <v-icon size="36" color="grey-lighten-1">mdi-message-outline</v-icon>
          </v-avatar>
          <div class="text-body-1 font-weight-medium text-grey-darken-1">No messages yet</div>
          <div class="text-caption text-grey mt-1">Start the conversation below</div>
        </div>

        <template v-else>
          <div
            v-for="(msg, idx) in visibleMessages"
            :key="msg.id"
            class="mb-2"
          >
            <!-- Date separator -->
            <div
              v-if="showDateSeparator(idx)"
              class="date-separator"
            >
              <v-divider />
              <v-chip size="x-small" variant="tonal" color="grey" rounded="pill" class="flex-shrink-0 text-caption">
                {{ formatDate(msg.created_at) }}
              </v-chip>
              <v-divider />
            </div>

            <!-- Bubble row -->
            <div
              class="d-flex align-end"
              :class="isOwnMessage(msg) ? 'flex-row-reverse' : 'flex-row'"
              style="gap:8px"
            >
              <!-- Avatar -->
              <v-avatar
                size="32"
                :color="getAvatarColor(msg.sender_id)"
                class="flex-shrink-0"
                style="align-self:flex-end"
              >
                <span style="font-size:12px;font-weight:700;color:#fff">
                  {{ getInitials(msg.sender?.name) }}
                </span>
              </v-avatar>

              <div :style="{ maxWidth: '70%', minWidth: '80px' }">
                <!-- Sender name (only for others) -->
                <div
                  v-if="!isOwnMessage(msg)"
                  class="text-caption font-weight-bold mb-1"
                  :style="{ color: `rgb(var(--v-theme-${getAvatarColor(msg.sender_id)}))` }"
                >
                  {{ msg.sender?.name ?? 'Unknown' }}
                </div>

              <!-- Bubble body -->
              <div
                class="pa-3"
                :style="{
                  background: isOwnMessage(msg) ? 'rgb(var(--v-theme-primary))' : 'rgb(var(--v-theme-surface-bright, var(--v-theme-surface)))',
                  color: isOwnMessage(msg) ? '#ffffff' : 'rgb(var(--v-theme-on-surface))',
                  borderRadius: isOwnMessage(msg) ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  boxShadow: isOwnMessage(msg) ? '0 4px 12px rgba(var(--v-theme-primary), 0.35)' : '0 2px 8px rgba(0,0,0,0.10)',
                  border: isOwnMessage(msg) ? 'none' : '1px solid rgba(var(--v-border-color), var(--v-border-opacity))'
                }"
              >
                <v-chip
                  v-if="msg.is_internal"
                  color="warning"
                  size="x-small"
                  class="mb-1"
                  label
                  variant="flat"
                >
                  <v-icon size="10" class="mr-1">mdi-lock-outline</v-icon>
                  Internal note
                </v-chip>

                <!-- Inline edit mode -->
                <div v-if="editingMessageId === msg.id">
                  <div
                    :ref="(el) => { if (el) editDivRef = el as HTMLElement }"
                    class="edit-editor"
                    contenteditable="true"
                    @keydown.ctrl.enter.prevent="saveEdit"
                    @keydown.meta.enter.prevent="saveEdit"
                    @keydown.esc.prevent="cancelEdit"
                  />
                  <div class="d-flex justify-end gap-1 mt-1">
                    <v-btn size="x-small" variant="text" color="error" @click="cancelEdit">
                      <v-icon size="12">mdi-close</v-icon>
                    </v-btn>
                    <v-btn size="x-small" color="success" :loading="isSavingEdit" @click="saveEdit">
                      <v-icon size="12">mdi-check</v-icon>
                    </v-btn>
                  </div>
                </div>

                <!-- View mode -->
                <template v-else>
                  <!-- Rich HTML body rendered safely -->
                  <div
                    v-if="msg.body"
                    class="chat-body text-body-2"
                    :class="{ 'text-white': isOwnMessage(msg) }"
                    v-html="sanitizeHtml(msg.body)"
                  />

                  <!-- File attachments -->
                  <div v-if="msg.files?.length" class="mt-2 d-flex flex-column gap-1">
                    <div
                      v-for="file in msg.files"
                      :key="file.id"
                      class="d-flex align-center gap-1 file-chip"
                    >
                      <v-icon size="14" :color="isOwnMessage(msg) ? 'white' : 'primary'">mdi-paperclip</v-icon>
                      <span
                        class="text-caption font-weight-medium"
                        :class="isOwnMessage(msg) ? 'text-white' : 'text-primary'"
                      >{{ file.original_name }}</span>
                      <ButtonDownloadS3Object :s3Path="file.file_path" />
                    </div>
                  </div>
                </template>

                <!-- Timestamp + actions row -->
                <div
                  class="d-flex align-center mt-1"
                  style="gap:4px"
                  :style="{ justifyContent: isOwnMessage(msg) ? 'flex-end' : 'flex-start' }"
                >
                  <v-btn
                    v-if="isOwnMessage(msg) && !msg.deleted_at && editingMessageId !== msg.id"
                    icon
                    size="x-small"
                    variant="text"
                    style="height:18px;width:18px;opacity:0.7"
                    @click="startEdit(msg)"
                  >
                    <v-icon size="12" color="white">mdi-pencil-outline</v-icon>
                  </v-btn>
                  <span
                    v-if="msg.edits?.length && editingMessageId !== msg.id"
                    class="text-caption cursor-pointer"
                    :style="{ color: isOwnMessage(msg) ? 'rgba(255,255,255,0.75)' : 'rgba(var(--v-theme-on-surface), 0.6)', fontSize: '10px' }"
                    @click="toggleHistory(msg.id)"
                  >(edited)</span>
                  <span
                    class="text-caption"
                    style="font-size:10px"
                    :style="{ color: isOwnMessage(msg) ? 'rgba(255,255,255,0.8)' : 'rgba(var(--v-theme-on-surface), 0.55)' }"
                  >
                    {{ formatTime(msg.created_at) }}
                  </span>
                  <v-icon
                    v-if="isOwnMessage(msg)"
                    size="12"
                    :style="{ color: msg.read_at ? '#90caf9' : 'rgba(255,255,255,0.5)' }"
                  >
                    {{ msg.read_at ? 'mdi-check-all' : 'mdi-check' }}
                  </v-icon>
                </div>
              </div>

              <!-- Edit history -->
              <div
                v-if="showHistoryFor.includes(msg.id) && msg.edits?.length"
                class="mt-1 px-2"
              >
                <div class="text-caption text-medium-emphasis font-weight-medium mb-1">Edit history:</div>
                <div
                  v-for="edit in msg.edits"
                  :key="edit.id"
                  class="mb-1 pa-1 rounded-lg history-entry"
                >
                  <div class="text-caption opacity-50">{{ formatTime(edit.created_at) }}</div>
                  <div class="text-caption chat-body" v-html="sanitizeHtml(edit.body)" />
                </div>
              </div>

              </div>
            </div>
          </div>
        </template>
      </div>

      <!-- Scroll-to-bottom FAB -->
      <v-btn
        v-if="showScrollBtn"
        color="primary"
        size="small"
        icon
        rounded="circle"
        elevation="4"
        class="scroll-bottom-btn"
        @click="scrollToBottom"
      >
        <v-icon size="18">mdi-chevron-double-down</v-icon>
        <v-badge
          v-if="unreadCount > 0"
          :content="unreadCount"
          color="error"
          floating
        />
      </v-btn>
    </div>

    <!-- Composer -->
    <div class="chat-composer" :class="{ 'composer-internal': composerInternal }">
      <!-- Internal toggle for staff -->
      <div v-if="showInternalToggle" class="composer-toggle d-flex align-center px-3 pt-2 pb-1">
        <v-switch
          v-model="composerInternal"
          hide-details
          density="compact"
          color="warning"
          class="flex-shrink-0"
          style="transform:scale(0.85);transform-origin:left"
        />
        <span class="text-caption ml-1" :class="composerInternal ? 'text-warning font-weight-medium' : 'text-medium-emphasis'">
          {{ composerInternal ? '🔒 Internal note — hidden from requester' : 'Visible to requester' }}
        </span>
      </div>

      <!-- Staged files preview -->
      <div v-if="stagedFiles.length" class="d-flex flex-wrap gap-1 px-3 pt-2">
        <v-chip
          v-for="(f, i) in stagedFiles"
          :key="i"
          size="small"
          closable
          variant="tonal"
          color="primary"
          @click:close="removeFile(i)"
        >
          <v-icon size="14" class="mr-1">mdi-paperclip</v-icon>
          {{ f.name }}
        </v-chip>
      </div>

      <!-- Rich textarea using contenteditable -->
      <div class="px-3 pt-2">
        <div
          ref="editorRef"
          class="chat-editor"
          :class="{ 'internal-border': composerInternal }"
          contenteditable="true"
          :placeholder="composerInternal ? '🔒 Write an internal note…' : 'Write a message…'"
          @keydown.ctrl.enter.prevent="submitMessage"
          @keydown.meta.enter.prevent="submitMessage"
          @input="onEditorInput"
        />
      </div>

      <!-- Hidden file input -->
      <input ref="fileInputRef" type="file" multiple class="d-none" @change="onFileChange" />

      <!-- Formatting toolbar + send -->
      <div class="d-flex align-center px-3 py-2 gap-1">
        <v-btn icon size="x-small" variant="text" @click="execFormat('bold')" title="Bold">
          <v-icon size="14">mdi-format-bold</v-icon>
        </v-btn>
        <v-btn icon size="x-small" variant="text" @click="execFormat('italic')" title="Italic">
          <v-icon size="14">mdi-format-italic</v-icon>
        </v-btn>
        <v-btn icon size="x-small" variant="text" @click="execFormat('underline')" title="Underline">
          <v-icon size="14">mdi-format-underline</v-icon>
        </v-btn>
        <v-btn icon size="x-small" variant="text" @click="insertList" title="Bullet list">
          <v-icon size="14">mdi-format-list-bulleted</v-icon>
        </v-btn>
        <v-divider vertical class="mx-1" style="height:16px" />
        <v-btn icon size="x-small" variant="text" title="Attach file" @click="fileInputRef?.click()">
          <v-icon size="14">mdi-paperclip</v-icon>
        </v-btn>
        <v-spacer />
        <span class="text-caption text-medium-emphasis mr-1 d-none d-sm-inline">Ctrl+↵</span>
        <v-btn
          color="primary"
          size="small"
          rounded="xl"
          :loading="isSending"
          :disabled="!composerHasContent && !stagedFiles.length"
          @click="submitMessage"
        >
          <v-icon size="16" class="mr-1">mdi-send</v-icon>
          Send
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, watch } from 'vue'
import { useTicketChat } from '~/composables/useTicketChat'
import type { TicketType, TicketMessage } from '~/repository/modules/catalogs/ticketMessages'

const props = defineProps<{
  ticketType: TicketType
  ticketId: number
  height?: string
  canManage?: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'unread-change', count: number): void
}>()

const { $auth } = useNuxtApp() as any

const panelStyle = computed(() => ({
  height: props.height ?? '100%',
}))

const {
  messages,
  isLoading,
  isSending,
  unreadCount,
  fetchMessages,
  sendMessage,
  editMessage,
  markRead,
  deleteMessage,
  connectChannel,
} = useTicketChat(props.ticketType, props.ticketId)

// ── State ─────────────────────────────────────────────────────────────────

const showInternal = ref(false)
const composerInternal = ref(false)
const composerHasContent = ref(false)
const messagesContainer = ref<HTMLElement | null>(null)
const editorRef = ref<HTMLElement | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)
const stagedFiles = ref<File[]>([])

const editingMessageId = ref<number | null>(null)
const editDivRef = ref<HTMLElement | null>(null)
const isSavingEdit = ref(false)
const showHistoryFor = ref<number[]>([])

const currentUserId = computed(() => $auth?.user?.id ?? 0)
const showInternalToggle = computed(() => props.canManage ?? false)

// ── Computed ──────────────────────────────────────────────────────────────

const visibleMessages = computed(() => {
  if (showInternal.value) return messages.value
  return messages.value.filter((m) => !m.is_internal)
})

// ── Methods ───────────────────────────────────────────────────────────────

function isOwnMessage(msg: TicketMessage) {
  return Number(msg.sender_id) === Number(currentUserId.value)
}

function canDeleteMessage(msg: TicketMessage) {
  return isOwnMessage(msg) || (props.canManage ?? false)
}

function getInitials(name?: string) {
  if (!name) return '?'
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

const avatarColors = ['indigo', 'teal', 'deep-purple', 'blue-darken-2', 'green-darken-1', 'orange-darken-2']
function getAvatarColor(senderId: number) {
  return avatarColors[senderId % avatarColors.length]
}

function sanitizeHtml(html: string) {
  // Basic tag allowlist — prevents XSS while preserving formatting
  const allowed = /<\/?(b|i|u|strong|em|ul|ol|li|br|p|span)[^>]*>/gi
  return html.replace(/<(?!\/?(b|i|u|strong|em|ul|ol|li|br|p|span)\b)[^>]+>/gi, '')
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
}

function showDateSeparator(idx: number) {
  if (idx === 0) return true
  const prev = visibleMessages.value[idx - 1]
  const curr = visibleMessages.value[idx]
  return new Date(prev.created_at).toDateString() !== new Date(curr.created_at).toDateString()
}

async function scrollToBottom() {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

function onEditorInput() {
  composerHasContent.value = (editorRef.value?.innerText?.trim().length ?? 0) > 0
}

function execFormat(command: string) {
  editorRef.value?.focus()
  document.execCommand(command, false)
}

function insertList() {
  editorRef.value?.focus()
  document.execCommand('insertUnorderedList', false)
}

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  if (!input.files) return
  stagedFiles.value.push(...Array.from(input.files))
  input.value = '' // reset so same file can be re-selected
}

function removeFile(index: number) {
  stagedFiles.value.splice(index, 1)
}

function formatFileSize(bytes: number | null) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

async function submitMessage() {
  const body = editorRef.value?.innerHTML?.trim()
  const files = [...stagedFiles.value]
  if (!body && !files.length) return

  try {
    await sendMessage(body ?? '', composerInternal.value, files)
    if (editorRef.value) editorRef.value.innerHTML = ''
    composerHasContent.value = false
    composerInternal.value = false
    stagedFiles.value = []
    await scrollToBottom()
  } catch (_) {
    // errors handled in composable
  }
}

async function startEdit(msg: TicketMessage) {
  editingMessageId.value = msg.id
  await nextTick()
  if (editDivRef.value) {
    editDivRef.value.innerHTML = msg.body ?? ''
    editDivRef.value.focus()
    const range = document.createRange()
    range.selectNodeContents(editDivRef.value)
    range.collapse(false)
    window.getSelection()?.removeAllRanges()
    window.getSelection()?.addRange(range)
  }
}

function cancelEdit() {
  editingMessageId.value = null
  editDivRef.value = null
}

async function saveEdit() {
  if (!editDivRef.value || !editingMessageId.value) return
  const newBody = editDivRef.value.innerHTML.trim()
  if (!newBody) return
  isSavingEdit.value = true
  try {
    await editMessage(editingMessageId.value, newBody)
    editingMessageId.value = null
    editDivRef.value = null
  } catch (_) {
    // error handled in composable
  } finally {
    isSavingEdit.value = false
  }
}

function toggleHistory(msgId: number) {
  const idx = showHistoryFor.value.indexOf(msgId)
  if (idx === -1) {
    showHistoryFor.value = [...showHistoryFor.value, msgId]
  } else {
    showHistoryFor.value = showHistoryFor.value.filter((id) => id !== msgId)
  }
}

async function handleDeleteMessage(id: number) {
  await deleteMessage(id)
}

// ── Scroll-to-bottom FAB ──────────────────────────────────────────────────

const showScrollBtn = ref(false)

function onMessagesScroll() {
  const el = messagesContainer.value
  if (!el) return
  const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
  showScrollBtn.value = distFromBottom > 120
}

// ── Watchers ──────────────────────────────────────────────────────────────

watch(messages, () => scrollToBottom(), { deep: true })

watch(unreadCount, (val) => {
  emit('unread-change', val)
})

// ── Lifecycle ─────────────────────────────────────────────────────────────

onMounted(async () => {
  connectChannel()
  await fetchMessages()
  await markRead()
  await scrollToBottom()
})
</script>

<style scoped>
/* ── Panel shell ─────────────────────────────────────────────────────────── */
.ticket-chat-panel {
  display: flex;
  flex-direction: column;
  width: 100%;
  overflow: hidden;
  background: rgb(var(--v-theme-surface));
}

/* ── Header ──────────────────────────────────────────────────────────────── */
.chat-header {
  flex-shrink: 0;
  background: rgb(var(--v-theme-primary));
  color: #fff;
}

.chat-header .text-subtitle-2,
.chat-header .text-caption {
  color: rgba(255, 255, 255, 0.95) !important;
}

.chat-header .v-btn {
  color: rgba(255, 255, 255, 0.9) !important;
}

/* ── Messages area ───────────────────────────────────────────────────────── */
.messages-wrapper {
  position: relative;
  flex: 1 1 0;
  min-height: 0;        /* critical: lets flex child shrink below content size */
  overflow: hidden;
}

.chat-messages {
  position: absolute;
  inset: 0;             /* fill wrapper exactly */
  overflow-y: auto;
  overflow-x: hidden;
  scroll-behavior: smooth;
  padding: 12px 16px;
  background: rgba(var(--v-theme-on-surface), 0.03);
}

.chat-messages::-webkit-scrollbar { width: 4px; }
.chat-messages::-webkit-scrollbar-track { background: transparent; }
.chat-messages::-webkit-scrollbar-thumb {
  background: rgba(var(--v-theme-primary), 0.25);
  border-radius: 4px;
}

/* ── Bubbles ─────────────────────────────────────────────────────────────── */
.chat-bubble {
  word-break: break-word;
  border-radius: 20px;
  position: relative;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 10px 14px;
  line-height: 1.5;
}

/* Own messages — primary with modern gradient feel */
.bubble-own {
  background: linear-gradient(135deg, rgb(var(--v-theme-primary)) 0%, rgba(var(--v-theme-primary), 0.85) 100%);
  color: #fff;
  border-bottom-right-radius: 6px;
}

/* Other messages — neutral grey that works in both themes */
.bubble-other {
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-on-surface));
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-bottom-left-radius: 6px;
}

/* Internal notes */
.internal-note {
  border: 2px dashed rgb(var(--v-theme-warning)) !important;
  background: rgba(var(--v-theme-warning), 0.06) !important;
}

.internal-note.bubble-own {
  background: linear-gradient(135deg, rgba(var(--v-theme-warning), 0.25) 0%, rgba(var(--v-theme-warning), 0.18) 100%) !important;
  color: rgb(var(--v-theme-on-surface)) !important;
}

.internal-note.bubble-other {
  background: rgba(var(--v-theme-warning), 0.08) !important;
  color: rgb(var(--v-theme-on-surface)) !important;
}

/* ── Date separator ──────────────────────────────────────────────────────── */
.date-separator {
  user-select: none;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 16px 0 8px;
}

/* ── Scroll-to-bottom FAB ────────────────────────────────────────────────── */
.scroll-bottom-btn {
  position: absolute;
  bottom: 12px;
  right: 14px;
  z-index: 10;
  opacity: 0.92;
  transition: opacity 0.2s;
}
.scroll-bottom-btn:hover { opacity: 1; }

/* ── Composer ────────────────────────────────────────────────────────────── */
.chat-composer {
  flex-shrink: 0;
  background: rgb(var(--v-theme-surface));
  border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  transition: background 0.2s, border-top-color 0.2s;
}

.composer-internal {
  background: rgba(var(--v-theme-warning), 0.05);
  border-top-color: rgba(var(--v-theme-warning), 0.6);
}

/* ── Contenteditable editor ──────────────────────────────────────────────── */
.chat-editor {
  min-height: 48px;
  max-height: 130px;
  overflow-y: auto;
  border: 1.5px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 12px;
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-on-surface));
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  line-height: 1.55;
  padding: 10px 12px;
  caret-color: rgb(var(--v-theme-primary));
}

.chat-editor:focus {
  border-color: rgb(var(--v-theme-primary));
  box-shadow: 0 0 0 2px rgba(var(--v-theme-primary), 0.15);
}

.chat-editor.internal-border {
  border-color: rgb(var(--v-theme-warning));
  box-shadow: 0 0 0 2px rgba(var(--v-theme-warning), 0.15);
}

.chat-editor:empty::before {
  content: attr(placeholder);
  color: rgba(var(--v-theme-on-surface), 0.4);
  pointer-events: none;
}

/* ── Inline edit editor ──────────────────────────────────────────────────── */
.edit-editor {
  min-height: 38px;
  max-height: 110px;
  overflow-y: auto;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 8px;
  background: rgba(var(--v-theme-surface), 0.6);
  color: rgb(var(--v-theme-on-surface));
  outline: none;
  line-height: 1.5;
  padding: 6px 8px;
}

.edit-editor:focus {
  border-color: rgb(var(--v-theme-success));
}

/* ── Chat body rich text ─────────────────────────────────────────────────── */
.chat-body :deep(ul),
.chat-body :deep(ol) {
  padding-left: 1.2em;
  margin: 4px 0;
}
.chat-body :deep(p) { margin: 0; }

/* ── Misc ────────────────────────────────────────────────────────────────── */
.history-entry {
  border-left: 2px solid rgba(var(--v-border-color), var(--v-border-opacity));
  background: rgba(var(--v-theme-surface-variant), 0.25);
  padding: 4px 8px;
  border-radius: 6px;
}

.file-chip {
  background: rgba(var(--v-theme-surface-variant), 0.4);
  border-radius: 6px;
  padding: 2px 6px;
}

.empty-state { min-height: 180px; }

.cursor-pointer { cursor: pointer; }
</style>
