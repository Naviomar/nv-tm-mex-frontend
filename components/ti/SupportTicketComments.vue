<template>
  <div>
    <v-card flat :rounded="false" color="blue-grey-darken-1">
      <v-card-title @click="checkScrollPosition"> Messages </v-card-title>
      <v-card-text>
        <div class="h-64 overflow-y-auto" ref="messagesContainer">
          <div v-if="supportTicket.comments && supportTicket.comments.length === 0">
            <p class="text-gray-700">No messages yet</p>
          </div>
          <div v-for="(message, index) in supportTicket.comments" :key="index" class="mb-2">
            <div :class="{ 'text-right': index % 2 === 0, 'text-left': index % 2 !== 0 }">
              <div
                :class="{
                  'inline-block p-2 rounded-lg text-white': true,
                  'bg-gray-900': index % 2 === 0,
                  'bg-gray-800 text-black': index % 2 !== 0,
                  'rounded-br-none': index % 2 === 0,
                  'rounded-bl-none': index % 2 !== 0,
                }"
              >
                <div class="font-bold" v-html="formatComment(message.comment)"></div>
                <div class="text-xs">{{ message.creator?.name }} @ {{ formatDateString(message.created_at) }}</div>
                <div v-if="message.files && message.files.length > 0" class="mt-2 flex gap-4">
                  <div v-for="(adjunto, adjIndex) in message.files" :key="`adjunto-${adjIndex}`" class="">
                    <v-img
                      :src="adjunto.file_url"
                      width="50"
                      height="50"
                      cover
                      class="rounded-lg max-h-40 object-cover shadow-lg cursor-pointer"
                      @click="openImageModal(message, adjunto.file_url)"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </v-card-text>
      <div
        v-if="isOverflowing && !atBottom"
        @click="scrollToBottom"
        class="absolute bottom-4 left-1/2 transform -translate-x-1/2 cursor-pointer text-blue-500"
      >
        ⬇️
      </div>
    </v-card>
    <v-card flat :rounded="false" rounded-0 color="blue-grey-darken-1">
      <v-card-text>
        <v-form @submit.prevent="sendMessage">
          <v-textarea
            v-model="form.newMessage"
            ref="textareaMessage"
            bg-color="blue-grey-darken-4"
            label="Type a reply"
            outlined
            rows="3"
            counter
            class="mb-2"
            hint="Be as clear as possible in your messages. 😀"
          />
          <v-btn type="submit" color="grey-lighten-5" variant="tonal"> 🚀 Send </v-btn>
        </v-form>
      </v-card-text>
    </v-card>

    <!-- Optional Modal for Full-Size Image Preview -->
    <v-dialog v-model="isImageModalOpen">
      <v-card>
        <v-card-text>
          <div class="flex justify-between mb-4">
            <div>{{ selectedImageUrl.mensaje.mensaje }}</div>
            <v-btn color="red" size="small" @click="isImageModalOpen = false">Close</v-btn>
          </div>
          <div class="px-8">
            <v-img
              :src="selectedImageUrl.url"
              width="100%"
              height="100%"
              class="rounded-lg object-cover shadow-lg cursor-pointer"
            />
          </div>
        </v-card-text>
        <v-card-actions>
          <v-btn color="red" size="small" @click="isImageModalOpen = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script setup lang="ts">
const { $api, $notifications } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
})

const emits = defineEmits(['refresh'])

const supportTicket = ref<any>({})
const form = ref<any>({
  newMessage: '',
  randomId: Math.random().toString(36).substring(7),
})
const textareaMessage = ref<HTMLInputElement>()
const selectedImageUrl = ref<any>({
  mensaje: '',
  url: '',
})
const isImageModalOpen = ref(false)

const messagesContainer = ref<any>()
const isOverflowing = ref(false)
const atBottom = ref(false)

const checkOverflow = () => {
  if (messagesContainer.value) {
    // console.log(messagesContainer.value.scrollHeight, messagesContainer.value.clientHeight)
    isOverflowing.value = messagesContainer.value.scrollHeight > messagesContainer.value.clientHeight
  } else {
    console.error('messagesContainer is not defined')
  }
}

const checkScrollPosition = () => {
  if (messagesContainer.value) {
    atBottom.value =
      messagesContainer.value.scrollHeight - messagesContainer.value.scrollTop === messagesContainer.value.clientHeight
  }
}

const scrollToBottom = () => {
  messagesContainer.value.scrollTo({
    top: messagesContainer.value.scrollHeight,
    behavior: 'smooth',
  })

  atBottom.value = true
}

const openImageModal = (mensaje: any, url: string) => {
  selectedImageUrl.value.mensaje = mensaje
  selectedImageUrl.value.url = url
  isImageModalOpen.value = true
}

onMounted(() => {
  checkOverflow()
  checkScrollPosition()
  textareaMessage.value?.addEventListener('paste', handlePaste)
})

const handlePaste = (event: any) => {
  const items = (event.clipboardData || event.originalEvent.clipboardData).items
  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    if (item.type.startsWith('image/')) {
      const file = item.getAsFile()
      sendImageToBackend(file) // Function to send image to backend
    }
  }
}

const sendImageToBackend = async (file: any) => {
  try {
    loadingStore.start()
    const body = {
      ticket_id: props.id,
      temporal_id: form.value.randomId,
      files: [file],
    }
    await $api.supportTi.addFilesToTicket(props.id, body)

    form.value.newMessage += `![image](Se adjunta imagen para referencia)\n`
    textareaMessage.value?.focus()

    emits('refresh')
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const formatComment = (comment: string) => {
  return comment.replace(/(?:\r\n|\r|\n)/g, '<br>')
}

watch(supportTicket.value.comments, () => {
  checkOverflow()
  checkScrollPosition()
})

const sendMessage = async () => {
  try {
    if (!form.value.newMessage || form.value.newMessage.trim() === '') {
      snackbar.add({ type: 'warning', text: 'Please write a message...' })
      return
    }
    loadingStore.start()
    const body = {
      comment: form.value.newMessage,
      temporal_id: form.value.randomId,
    }
    const response = (await $api.supportTi.ticketAddComment(props.id, body)) as any

    // add to the top of the list
    supportTicket.value.comments.unshift(response)
    form.value.newMessage = ''
    form.value.adjuntos = []
    form.value.randomId = Math.random().toString(36).substring(7)

    messagesContainer.value.scrollTo({
      top: 0,
      behavior: 'smooth',
    })

    setTimeout(() => {
      checkOverflow()
    }, 100)

    snackbar.add({ type: 'success', text: 'Message sent' })
    await getData()
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const getData = async () => {
  try {
    loadingStore.start()
    const response = (await $api.supportTi.getTicketComments(props.id)) as any

    supportTicket.value = response
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

await getData()
</script>
