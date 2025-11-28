<template>
  <div>
    <div class="py-4">
      <v-card class="mb-4">
        <v-card-title>
          <div class="flex items-center gap-2">
            <div :style="{ backgroundColor: supportTicket.color || '#FFFFFF' }" class="rounded-full h-4 w-4"></div>
            <span>Ticket details</span>
          </div>
        </v-card-title>
        <v-card-text>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Subject -->
            <div>
              <h2 class="font-bold text-lg">Ticket #</h2>
              <p>{{ supportTicket.id }}</p>
              <h2 class="font-bold text-lg">Subject</h2>
              <p>{{ supportTicket.subject }}</p>
            </div>

            <!-- Message -->
            <div>
              <h2 class="font-bold text-lg">Message</h2>
              <p class="whitespace-pre-line">{{ supportTicket.message }}</p>
            </div>

            <!-- Steps -->
            <div>
              <h2 class="font-bold text-lg">Steps to reproduce</h2>
              <p>{{ supportTicket.steps }}</p>
            </div>

            <!-- User Agent -->
            <div>
              <h2 class="font-bold text-lg">User Agent</h2>
              <p>{{ supportTicket.user_agent }}</p>
            </div>

            <!-- IP Address -->
            <div>
              <h2 class="font-bold text-lg">IP Address</h2>
              <p>{{ supportTicket.ip_address }}</p>
            </div>

            <!-- Current Route -->
            <div>
              <h2 class="font-bold text-lg">Current Route</h2>
              <p>{{ supportTicket.current_route }}</p>
              <p>@ {{ formatDateString(supportTicket.created_at) }} by {{ supportTicket.creator?.name }}</p>
            </div>

            <div>
              <h2 class="font-bold text-lg">Add more support attachments</h2>
              <v-file-input v-model="newFiles" label="Upload new file" density="compact" multiple />
              <v-btn @click="uploadFiles" color="primary" size="small">Upload files</v-btn>
            </div>

            <div>
              <div class="grid grid-cols-3 gap-4 border border-gray-100 p-2">
                <div class="">
                  <h2 class="font-bold text-lg">Priority</h2>
                  <v-chip :color="priorityColor">{{ supportTicket.priority }}</v-chip>
                </div>
                <div class="">
                  <h2 class="font-bold text-lg">Severity</h2>
                  <v-chip :color="severityColor">{{ supportTicket.severity }}</v-chip>
                </div>
                <div class="">
                  <h2 class="font-bold text-lg">Category</h2>
                  <p class="font-bold">{{ supportTicket.category }}</p>
                </div>
              </div>
            </div>

            <div v-if="isAdmin" class="flex justify-end">
              <v-btn color="lime" size="small" class="cursor-pointer" @click="migrarAProduction"
                >Migrar a producción</v-btn
              >
            </div>
          </div>
        </v-card-text>
      </v-card>

      <v-card>
        <v-card-text>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Status -->
            <div>
              <div class="flex justify-between mb-4">
                <h2 class="font-bold text-lg">Status</h2>
                <v-chip color="amber">{{ supportTicket.status }}</v-chip>
              </div>
              <v-autocomplete
                v-model="form.new_status"
                :items="[
                  'open',
                  'working',
                  'ready-to-test',
                  'in-observation',
                  'more-info',
                  'closed',
                  'next-phase',
                  'rejected',
                ]"
                label="Change status"
                density="compact"
                hide-details
              />
              <v-btn @click="changeStatus" color="primary" size="small">Update status</v-btn>
            </div>

            <div>
              <h2 class="font-bold text-lg">Attachments</h2>
              <!-- Files associated with the supportTicket -->
              <div v-if="supportTicket.files && supportTicket.files.length">
                <div class="grid grid-cols-1 gap-4">
                  <div class="p-4 rounded-sm">
                    <div v-for="file in supportTicket.files" :key="file.id" class="flex gap-2 mb-2">
                      <v-btn size="small" @click="deleteFile(file)" color="red" variant="tonal"
                        ><v-icon>mdi-close</v-icon></v-btn
                      >
                      <ButtonPreviewS3File icon="mdi-file-eye-outline" :s3Path="file.file" />
                      <span>{{ file.file }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>

      <div class="max-w-[640px] mx-auto py-4">
        <SupportTicketComments :id="supportTicket.id" @refresh="getSupportTicket" />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
const { $api } = useNuxtApp()
const loadingStore = useLoadingStore()
const router = useRouter()
const route = useRoute()
const snackbar = useSnackbar()
const user = useSanctumUser<any>()

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
})

const supportTicket = ref<any>({})
const form = reactive({
  new_status: '',
})
const newFiles = ref<any>([])

const isAdmin = computed(() => {
  return user.value?.id === 1
})

const priorityColor = computed(() => {
  switch (supportTicket.value.priority) {
    case 'low':
      return 'green'
    case 'medium':
      return 'orange'
    case 'high':
      return 'red'
    case 'urgent':
      return 'red'
    case 'critical':
      return 'red'
    default:
      return 'gray'
  }
})

const severityColor = computed(() => {
  switch (supportTicket.value.severity) {
    case 's1':
      return 'red'
    case 's2':
      return 'orange'
    case 's3':
      return 'yellow'
    case 's4':
      return 'green'
    case 's5':
      return 'blue'
    case 's6':
      return 'purple'
    default:
      return 'gray'
  }
})

const uploadFiles = async () => {
  try {
    // if no files, return
    if (!newFiles.value.length) {
      snackbar.add({
        type: 'warning',
        text: 'No files selected',
      })
      return
    }
    // if any file is bigger than 10MB, return
    const filesBiggerThan10MB = newFiles.value.filter((file: any) => file.size > 5 * 1024 * 1024)
    if (filesBiggerThan10MB.length) {
      snackbar.add({
        type: 'error',
        text: 'Some files are bigger than 5MB',
      })
      return
    }

    loadingStore.start()
    await $api.supportTi.addFilesToTicket(props.id, { files: newFiles.value })

    snackbar.add({
      type: 'success',
      text: 'Files uploaded successfully',
    })

    await getSupportTicket()
  } catch (error) {
    console.error(error)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const deleteFile = async (file: any) => {
  try {
    loadingStore.start()
    await $api.supportTi.deleteFileFromTicket(props.id, file.id)

    snackbar.add({
      type: 'success',
      text: 'File deleted successfully',
    })

    await getSupportTicket()
  } catch (error) {
    console.error(error)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const migrarAProduction = async () => {
  try {
    loadingStore.start()
    await $api.supportTi.migrateTicketToProduction(props.id)

    snackbar.add({
      type: 'success',
      text: 'Ticket migrated to production successfully',
    })

    await getSupportTicket()
  } catch (error) {
    console.error(error)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const changeStatus = async () => {
  try {
    if (!form.new_status) {
      snackbar.add({
        type: 'warning',
        text: 'Please select a status',
      })
      return
    }
    loadingStore.start()
    const body = {
      new_status: form.new_status,
    }
    await $api.supportTi.updateTicketStatus(props.id, body)
    await getSupportTicket()

    snackbar.add({
      type: 'success',
      text: 'Status updated successfully',
    })
  } catch (error) {
    console.error(error)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const getSupportTicket = async () => {
  try {
    loadingStore.start()
    const response: any = await $api.supportTi.getTicketById(props.id)

    supportTicket.value = response
  } catch (error) {
    console.error(error)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

await getSupportTicket()
</script>
