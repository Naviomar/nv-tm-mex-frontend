<template>
  <div>
    <!-- Toggle Button -->
    <v-btn
      class="mb-4 btn-online-toggle"
      color="primary"
      variant="tonal"
      size="small"
      :prepend-icon="showOnlineUsers ? 'mdi-account-multiple-minus-outline' : 'mdi-account-multiple-outline'"
      @click="toggleOnlineUsers"
    >
      {{
        (showOnlineUsers ? 'Hide Online Users' : 'Show Online Users') +
        (onlineUsers ? ` (${onlineUsers})` : '')
      }}
    </v-btn>

    <!-- Online Users Section -->
    <v-expand-transition>
      <div v-if="showOnlineUsers" class="mx-4 mb-4">
        <p class="text-xs text-gray-500 dark:text-white">Online Users: {{ onlineUsers }}</p>
        <ul>
          <li v-for="user in users" :key="user.id" class="text-sm text-gray-700 dark:text-white">
            {{ user.name }}
          </li>
        </ul>
      </div>
    </v-expand-transition>
    <div
      class="flex flex-col space-y-4 p-4 overflow-y-auto h-[60vh] bg-neutral-100 dark:bg-neutral-900"
      ref="chatContainer"
    >
      <div
        v-for="(message, index) in messages"
        :key="index"
        class="flex flex-col space-y-1"
        :class="message.sender_id === user.id ? 'items-end' : 'items-start'"
      >
        <div class="text-xs text-gray-500">{{ message.name }}</div>
        <div
          class="px-4 py-2 rounded-lg break-words max-w-full"
          :class="message.sender_id === user.id ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'"
        >
          {{ message.text }}
        </div>
      </div>
    </div>
    <div class="">
      <div class="flex items-center justify-between w-full p-4 border-t border-gray-200">
        <input
          type="text"
          v-model="newMessage"
          @keyup.enter="sendMessage"
          class="w-full p-2 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          placeholder="Type a message..."
        />
        <button
          @click.prevent="sendMessage"
          class="inline-flex items-center justify-center w-12 h-12 ml-4 text-white bg-blue-500 rounded-lg hover:bg-blue-600"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
const echo = useEcho()

const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()
const { user, isAuthenticated } = useSanctumAuth() as any

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
})

const messages = ref<any[]>([])
const newMessage = ref('')
const chatContainer = ref<any>(null) // Add a ref for the chat container
const hasNewMessage = ref(false)
const emit = defineEmits(['new-message'])

// Toggle visibility of online users
const showOnlineUsers = ref(false)

const toggleOnlineUsers = () => {
  showOnlineUsers.value = !showOnlineUsers.value
}

const onlineUsers = ref<number>(0) // To track the count of online users
const users = ref<any[]>([]) // To track the list of users in the presence channel

const writeNewMessage = (e: any) => {
  messages.value.push(e.data)

  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
  })

  if (!props.isOpen) {
    hasNewMessage.value = true
  }
}

function stopAllListeners() {
  echo.leaveAllChannels()
}

function getMessageClasses(message: any) {
  const isCurrentUser = message.sender_id === user.value.id
  return isCurrentUser ? 'self-end bg-blue-500 text-white' : 'self-start bg-gray-200 text-black'
}

const sendMessage = async () => {
  if (!newMessage.value.trim()) {
    return
  }

  const message = newMessage.value
  newMessage.value = ''

  const body = {
    message,
  }

  try {
    await $api.users.sendMessage(body)
  } catch (e) {
    console.error(e)
  }
}

function subscribeToPublicChannel() {
  const name = 'public-channel'
  const event = 'Mexico.PublicEvent'

  echo
    .channel(name)
    .listen(event, (e: any) => {
      // console.log('Public channel event', e)
      writeNewMessage(e)
    })
    .error((e: object) => {
      console.error('Public channel error', e)
    })
}

function subscribeToPrivateChannel() {
  const name = `chat.${user.value?.id}`
  const event = 'Mexico.MessageSent'

  echo
    .private(name)
    .listen(event, (e: any) => {
      console.log('Private channel MessageSent', e)
      writeNewMessage(e)
    })
    .error((e: object) => {
      console.error('Private channel error', e)
    })
}

function subscribeToPresenceChannel() {
  const name = 'presence-public-channel'

  echo
    .join(name) // Join the presence channel
    .here((members: any) => {
      // console.log('Current members:', members)
      users.value = members
      onlineUsers.value = members.length
    })
    .joining((member: any) => {
      // console.log('User joined:', member)
      users.value.push(member)
      onlineUsers.value = users.value.length
    })
    .leaving((member: any) => {
      // console.log('User left:', member)
      users.value = users.value.filter((u: any) => u.id !== member.id)
      onlineUsers.value = users.value.length
    })
    .error((e: object) => {
      console.error('Presence channel error', e)
    })
}

watch(
  () => props.isOpen,
  (val) => {
    if (val) hasNewMessage.value = false
  }
)

watch(hasNewMessage, (val) => {
  emit('new-message', val)
})

onMounted(() => {
  subscribeToPublicChannel()
  subscribeToPresenceChannel()
  if (isAuthenticated.value) {
    subscribeToPrivateChannel()
  }
})
</script>

<style scoped>
.btn-online-toggle {
  border-radius: 9999px;
  text-transform: none;
  font-weight: 600;
  letter-spacing: 0.04em;
  margin: 12px 16px 8px;
}
</style>
