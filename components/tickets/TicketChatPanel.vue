<template>
  <div class="ticket-chat-panel d-flex flex-column" :style="{ height: panelHeight }">
    <!-- Header -->
    <div class="chat-header d-flex align-center pa-3 border-b">
      <v-icon class="mr-2" color="primary">mdi-message-text-outline</v-icon>
      <span class="text-subtitle-2 font-weight-bold">Ticket Chat</span>
      <v-spacer />
      <v-chip
        v-if="unreadCount > 0"
        color="error"
        size="x-small"
        class="mr-1"
      >
        {{ unreadCount }} new
      </v-chip>
      <v-btn
        v-if="showInternalToggle"
        :color="showInternal ? 'warning' : 'default'"
        variant="tonal"
        size="x-small"
        @click="showInternal = !showInternal"
        class="mr-1"
      >
        <v-icon size="14" class="mr-1">mdi-eye-outline</v-icon>
        Internal
      </v-btn>
      <v-btn icon size="x-small" variant="text" @click="$emit('close')">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </div>

    <!-- Messages list -->
    <div
      ref="messagesContainer"
      class="chat-messages flex-grow-1 overflow-y-auto pa-3"
    >
      <div v-if="isLoading" class="d-flex justify-center py-4">
        <v-progress-circular indeterminate color="primary" size="24" />
      </div>

      <div v-else-if="visibleMessages.length === 0" class="text-center text-medium-emphasis py-6">
        <v-icon size="40" class="mb-2 opacity-40">mdi-message-outline</v-icon>
        <div class="text-body-2">No messages yet</div>
      </div>

      <template v-else>
        <div
          v-for="(msg, idx) in visibleMessages"
          :key="msg.id"
          class="mb-3"
        >
          <!-- Date separator -->
          <div
            v-if="showDateSeparator(idx)"
            class="text-center text-caption text-medium-emphasis my-2"
          >
            <v-divider class="my-1" />
            {{ formatDate(msg.created_at) }}
          </div>

          <!-- Bubble -->
          <div
            :class="[
              'd-flex',
              isOwnMessage(msg) ? 'justify-end' : 'justify-start',
            ]"
          >
            <!-- Avatar for others -->
            <v-avatar
              v-if="!isOwnMessage(msg)"
              size="28"
              :color="getAvatarColor(msg.sender_id)"
              class="mr-2 mt-1 flex-shrink-0"
            >
              <span class="text-caption text-white font-weight-bold">
                {{ getInitials(msg.sender?.name) }}
              </span>
            </v-avatar>

            <div style="max-width: 72%">
              <!-- Sender name -->
              <div
                v-if="!isOwnMessage(msg)"
                class="text-caption text-medium-emphasis mb-1 ml-1"
              >
                {{ msg.sender?.name ?? 'Unknown' }}
              </div>

              <!-- Bubble body -->
              <v-card
                :color="isOwnMessage(msg) ? 'primary' : 'surface-variant'"
                :variant="isOwnMessage(msg) ? 'flat' : 'tonal'"
                rounded="lg"
                class="pa-2 px-3 chat-bubble"
                :class="{ 'internal-note': msg.is_internal }"
              >
                <v-chip
                  v-if="msg.is_internal"
                  color="warning"
                  size="x-small"
                  class="mb-1"
                  label
                >
                  <v-icon size="10" class="mr-1">mdi-lock-outline</v-icon>
                  Internal
                </v-chip>

                <!-- Inline edit mode -->
                <div v-if="editingMessageId === msg.id">
                  <div
                    :ref="(el) => { if (el) editDivRef = el as HTMLElement }"
                    class="edit-editor rounded pa-1 text-body-2"
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
                      class="d-flex align-center gap-1"
                    >
                      <v-icon size="14" :color="isOwnMessage(msg) ? 'white' : 'primary'">mdi-paperclip</v-icon>
                      <span
                        class="text-caption"
                        :class="isOwnMessage(msg) ? 'text-white' : 'text-primary'"
                      >{{ file.original_name }}</span>
                      <ButtonDownloadS3Object :s3Path="file.file_path" />
                    </div>
                  </div>
                </template>

                <!-- Timestamp + read indicator + edit btn -->
                <div
                  class="d-flex align-center mt-1"
                  :class="isOwnMessage(msg) ? 'justify-end' : 'justify-start'"
                >
                  <v-btn
                    v-if="isOwnMessage(msg) && !msg.deleted_at && editingMessageId !== msg.id"
                    icon
                    size="x-small"
                    variant="text"
                    class="mr-1 opacity-60"
                    style="height:16px;width:16px"
                    @click="startEdit(msg)"
                  >
                    <v-icon size="10" color="white">mdi-pencil</v-icon>
                  </v-btn>
                  <span
                    v-if="msg.edits?.length && editingMessageId !== msg.id"
                    class="text-caption opacity-60 mr-1 cursor-pointer"
                    :class="{ 'text-white': isOwnMessage(msg) }"
                    @click="toggleHistory(msg.id)"
                  >(edited)</span>
                  <span
                    class="text-caption opacity-70"
                    :class="{ 'text-white': isOwnMessage(msg) }"
                  >
                    {{ formatTime(msg.created_at) }}
                  </span>
                  <v-icon
                    v-if="isOwnMessage(msg)"
                    size="12"
                    class="ml-1"
                    :color="msg.read_at ? 'light-blue-lighten-3' : 'white'"
                    :class="{ 'opacity-70': !msg.read_at }"
                  >
                    {{ msg.read_at ? 'mdi-check-all' : 'mdi-check' }}
                  </v-icon>
                </div>
              </v-card>

              <!-- Edit history -->
              <div
                v-if="showHistoryFor.includes(msg.id) && msg.edits?.length"
                class="mt-1 px-2 text-left"
              >
                <div class="text-caption text-medium-emphasis font-weight-medium mb-1">Previous versions:</div>
                <div
                  v-for="edit in msg.edits"
                  :key="edit.id"
                  class="mb-1 pa-1 rounded history-entry"
                >
                  <div class="text-caption opacity-50 mb-0">{{ formatTime(edit.created_at) }}</div>
                  <div class="text-caption chat-body" v-html="sanitizeHtml(edit.body)" />
                </div>
              </div>

            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- Composer -->
    <div class="chat-composer pa-3 border-t">
      <!-- Internal toggle for staff -->
      <div v-if="showInternalToggle" class="d-flex align-center mb-2 gap-2">
        <v-switch
          v-model="composerInternal"
          hide-details
          density="compact"
          color="warning"
          class="mr-2"
        />
        <span class="text-caption text-medium-emphasis">
          {{ composerInternal ? 'Internal note (hidden from requester)' : 'Visible to requester' }}
        </span>
      </div>

      <!-- Rich textarea using contenteditable for basic bold/italic -->
      <div
        ref="editorRef"
        class="chat-editor rounded-lg pa-2 text-body-2"
        :class="{ 'internal-border': composerInternal }"
        contenteditable="true"
        :placeholder="composerInternal ? 'Write an internal note…' : 'Write a message…'"
        @keydown.ctrl.enter.prevent="submitMessage"
        @keydown.meta.enter.prevent="submitMessage"
        @input="onEditorInput"
      />

      <!-- Staged files preview -->
      <div v-if="stagedFiles.length" class="d-flex flex-wrap gap-1 mt-2">
        <v-chip
          v-for="(f, i) in stagedFiles"
          :key="i"
          size="small"
          closable
          @click:close="removeFile(i)"
        >
          <v-icon size="14" class="mr-1">mdi-paperclip</v-icon>
          {{ f.name }}
        </v-chip>
      </div>

      <!-- Hidden file input -->
      <input ref="fileInputRef" type="file" multiple class="d-none" @change="onFileChange" />

      <!-- Formatting toolbar -->
      <div class="d-flex align-center mt-2 gap-1">
        <v-btn icon size="x-small" variant="text" @click="execFormat('bold')" title="Bold">
          <v-icon size="14">mdi-format-bold</v-icon>
        </v-btn>
        <v-btn icon size="x-small" variant="text" @click="execFormat('italic')" title="Italic">
          <v-icon size="14">mdi-format-italic</v-icon>
        </v-btn>
        <v-btn icon size="x-small" variant="text" @click="execFormat('underline')" title="Underline">
          <v-icon size="14">mdi-format-underline</v-icon>
        </v-btn>
        <v-btn icon size="x-small" variant="text" @click="insertList" title="List">
          <v-icon size="14">mdi-format-list-bulleted</v-icon>
        </v-btn>
        <v-btn icon size="x-small" variant="text" title="Attach file" @click="fileInputRef?.click()">
          <v-icon size="14">mdi-paperclip</v-icon>
        </v-btn>
        <v-spacer />
        <span class="text-caption text-medium-emphasis mr-2">Ctrl+Enter to send</span>
        <v-btn
          color="primary"
          size="small"
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
  panelHeight?: string
  canManage?: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'unread-change', count: number): void
}>()

const { $auth } = useNuxtApp() as any

const panelHeight = computed(() => props.panelHeight ?? '500px')

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
  return msg.sender_id === currentUserId.value
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
.ticket-chat-panel {
  overflow: hidden;
  background: rgb(var(--v-theme-surface));
}

.chat-messages {
  background: rgba(var(--v-theme-surface-variant), 0.3);
}

.chat-bubble {
  word-break: break-word;
}

.internal-note {
  border: 1px dashed rgb(var(--v-theme-warning)) !important;
}

.chat-editor {
  min-height: 60px;
  max-height: 150px;
  overflow-y: auto;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  background: rgba(var(--v-theme-surface-variant), 0.2);
  outline: none;
  transition: border-color 0.2s;
  line-height: 1.5;
}

.chat-editor:focus {
  border-color: rgb(var(--v-theme-primary));
}

.chat-editor.internal-border {
  border-color: rgb(var(--v-theme-warning));
  background: rgba(var(--v-theme-warning), 0.05);
}

.chat-editor:empty::before {
  content: attr(placeholder);
  color: rgba(var(--v-theme-on-surface), 0.4);
  pointer-events: none;
}

.chat-body :deep(ul),
.chat-body :deep(ol) {
  padding-left: 1.2em;
  margin: 4px 0;
}

.chat-body :deep(p) {
  margin: 0;
}

.border-b {
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.border-t {
  border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.edit-editor {
  min-height: 40px;
  max-height: 120px;
  overflow-y: auto;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  background: rgba(var(--v-theme-surface-variant), 0.3);
  outline: none;
  line-height: 1.5;
}

.edit-editor:focus {
  border-color: rgb(var(--v-theme-success));
}

.history-entry {
  border-left: 2px solid rgba(var(--v-border-color), var(--v-border-opacity));
  background: rgba(var(--v-theme-surface-variant), 0.2);
}

.cursor-pointer {
  cursor: pointer;
}
</style>
