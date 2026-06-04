<template>
  <div>
    <div class="z-1010 right-0">
      <v-btn color="orange-lighten-2" size="small" @click="toggleSupportDialog">
        <v-icon>mdi-help-circle-outline</v-icon>
      </v-btn>
    </div>
    <v-dialog v-model="supportAssist.show" fullscreen>
      <v-card>
        <v-toolbar color="primary">
          <v-btn icon @click="closeDialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title>{{
            activeTab === 'assist' ? 'Request Assist' : 'My Authorization Requests'
          }}</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn v-slot:default v-if="activeTab === 'assist'" variant="text" @click="sendReqAssist">
              Send request
            </v-btn>
          </v-toolbar-items>
        </v-toolbar>

        <div class="flex border-b border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900 px-4">
          <button
            type="button"
            class="px-6 py-3 text-sm font-semibold transition-all border-b-2 flex items-center gap-2"
            :class="
              activeTab === 'assist'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400 font-bold'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-200'
            "
            @click="activeTab = 'assist'"
          >
            <v-icon size="18">mdi-comment-question-outline</v-icon>
            Request Assistance
          </button>
          <button
            type="button"
            class="px-6 py-3 text-sm font-semibold transition-all border-b-2 flex items-center gap-2"
            :class="
              activeTab === 'auths'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400 font-bold'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-200'
            "
            @click="switchToAuths"
          >
            <v-icon size="18">mdi-shield-lock-outline</v-icon>
            My Authorization Requests
          </button>
        </div>

        <v-card-title v-if="activeTab === 'assist'"> Assist Form </v-card-title>
        <v-card-text>
          <!-- Tab 1: Request Assistance -->
          <div v-show="activeTab === 'assist'">
            <v-alert type="info" density="compact" class="mb-4" variant="outlined">
              Use this form to request assistance with a specific part of the system. Your message will be reviewed by a
              support team member who can take action or guide you. Please describe your issue clearly and attach any
              useful evidence. <br /><br />
              <strong>Important:</strong> Make sure you are on the exact page or module where you need assistance before
              submitting this request. This helps us better understand and resolve your issue.
            </v-alert>

            <v-row no-gutters>
              <v-col v-slot:default v-if="false" cols="12">
                <v-text-field v-model="form.user_agent" label="User agent *" readonly density="compact" />
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-slot:default
                  v-model="form.current_route"
                  label="Current route *"
                  readonly
                  density="compact"
                />
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-slot:default
                  v-model="form.message"
                  label="Describa la ayuda que necesita *"
                  counter
                  density="compact"
                />
              </v-col>
              <v-col cols="12">
                <v-file-input
                  v-slot:default
                  v-model="form.attachments"
                  multiple
                  label="Adjunte soportes a su solicitud"
                  counter
                  density="compact"
                />
              </v-col>
            </v-row>
          </div>

          <!-- Tab 2: My Authorization Requests -->
          <div v-show="activeTab === 'auths'" class="space-y-4 pt-2">
            <div class="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-zinc-700">
              <h3 class="text-base font-bold text-gray-900 dark:text-white">Authorization Requests History</h3>
              <button
                type="button"
                class="px-3 py-1.5 text-xs font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-200 rounded transition flex items-center gap-1"
                @click="fetchUserAuthRequests"
                :disabled="loadingAuths"
              >
                <span
                  v-if="loadingAuths"
                  class="animate-spin inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full mr-1"
                ></span>
                Refresh List
              </button>
            </div>

            <!-- Loader -->
            <div v-if="loadingAuths" class="flex flex-col items-center justify-center py-12">
              <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500"></div>
              <p class="mt-2 text-sm text-gray-500 dark:text-zinc-400">Loading requests...</p>
            </div>

            <!-- Empty State -->
            <div
              v-else-if="userAuthRequests.length === 0"
              class="text-center py-12 bg-gray-50 dark:bg-zinc-900 rounded-lg border border-dashed border-gray-300 dark:border-zinc-700"
            >
              <span class="block text-3xl mb-2">📄</span>
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">No authorization requests found.</p>
              <p class="text-xs text-gray-400 mt-1">Requests you create via page action components will appear here.</p>
            </div>

            <!-- Table -->
            <div v-else class="overflow-x-auto border border-gray-200 dark:border-zinc-700 rounded-lg shadow-sm">
              <table class="min-w-full divide-y divide-gray-200 dark:divide-zinc-700 text-sm">
                <thead
                  class="bg-gray-50 dark:bg-zinc-800 text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider"
                >
                  <tr>
                    <th scope="col" class="px-4 py-3 text-left">ID</th>
                    <th scope="col" class="px-4 py-3 text-left">Date</th>
                    <th scope="col" class="px-4 py-3 text-left">Resource</th>
                    <th scope="col" class="px-4 py-3 text-left">Reference / Invoice</th>
                    <th scope="col" class="px-4 py-3 text-left">Reason</th>
                    <th scope="col" class="px-4 py-3 text-left">Status</th>
                    <th scope="col" class="px-4 py-3 text-left">Authorized By</th>
                    <th scope="col" class="px-4 py-3 text-left">Files</th>
                  </tr>
                </thead>
                <tbody class="bg-white dark:bg-zinc-900 divide-y divide-gray-200 dark:divide-zinc-800">
                  <tr
                    v-for="authReq in userAuthRequests"
                    :key="authReq.id"
                    class="hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <td class="px-4 py-3 whitespace-nowrap font-medium text-gray-900 dark:text-white">
                      #{{ authReq.id }}
                    </td>
                    <td class="px-4 py-3 whitespace-nowrap text-gray-500 dark:text-zinc-400">
                      {{ formatDateString(authReq.created_at) }}
                    </td>
                    <td class="px-4 py-3 whitespace-nowrap font-medium text-gray-700 dark:text-zinc-300">
                      {{ getResourceLabel(authReq.resource) }}
                    </td>
                    <td class="px-4 py-3 whitespace-nowrap font-semibold text-amber-600 dark:text-amber-400">
                      {{ authReq.invoice_number || authReq.resource_id || '—' }}
                    </td>
                    <td
                      class="px-4 py-3 max-w-xs truncate text-gray-600 dark:text-zinc-300"
                      :title="authReq.request_reason"
                    >
                      {{ authReq.request_reason || '—' }}
                    </td>
                    <td class="px-4 py-3 whitespace-nowrap">
                      <span
                        v-if="authReq.is_authorized === null"
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-900/50"
                      >
                        Pending
                      </span>
                      <span
                        v-else-if="authReq.is_authorized == 1 && !authReq.expired"
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-900/50"
                      >
                        Approved
                      </span>
                      <span
                        v-else-if="authReq.is_authorized == 1 && authReq.expired"
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-zinc-800 dark:text-zinc-400 border border-gray-200 dark:border-zinc-700"
                      >
                        Expired
                      </span>
                      <span
                        v-else
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-900/50"
                        :title="authReq.authorized_reason"
                      >
                        Rejected
                      </span>
                    </td>
                    <td class="px-4 py-3 whitespace-nowrap text-gray-600 dark:text-zinc-400">
                      {{ authReq.authorized?.name || '—' }}
                      <span
                        v-if="authReq.authorized_reason"
                        class="block text-xs text-gray-400 italic max-w-xs truncate"
                        :title="authReq.authorized_reason"
                      >
                        "{{ authReq.authorized_reason }}"
                      </span>
                    </td>
                    <td class="px-4 py-3 whitespace-nowrap">
                      <div v-if="!authReq.files || authReq.files.length === 0" class="text-xs text-gray-400 italic">
                        No attachments
                      </div>
                      <div v-else class="flex flex-col gap-1">
                        <div v-for="(file, fileIdx) in authReq.files" :key="fileIdx">
                          <ButtonDownloadS3Object :s3Path="file.attachment" />
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>
<script lang="ts" setup>
import { getAuthResourceByName } from '~/utils/data/system'

const { $api } = useNuxtApp()
const loadingStore = useLoadingStore()
const snackbar = useSnackbar()
const route = useRoute()
const { fireworks, simpleConfetti } = useConfetti()

const supportAssist = ref<any>({
  show: false,
})

const activeTab = ref('assist')
const userAuthRequests = ref<any[]>([])
const loadingAuths = ref(false)

const form = ref<any>({
  user_agent: '',
  current_route: '',
  message: '',
  attachments: [],
})

const toggleSupportDialog = async () => {
  supportAssist.value.show = !supportAssist.value.show
  form.value.current_route = route.fullPath
  form.value.user_agent = navigator.userAgent
  if (supportAssist.value.show) {
    activeTab.value = 'assist'
    await fetchUserAuthRequests()
  }
}

const closeDialog = () => {
  supportAssist.value.show = false
  activeTab.value = 'assist'
}

const switchToAuths = async () => {
  activeTab.value = 'auths'
  await fetchUserAuthRequests()
}

const fetchUserAuthRequests = async () => {
  try {
    loadingAuths.value = true
    const response = await $api.users.getMyAuthRequests()
    userAuthRequests.value = response || []
  } catch (e) {
    console.error(e)
    snackbar.add({ type: 'error', text: 'Error loading authorization requests' })
  } finally {
    loadingAuths.value = false
  }
}

const getResourceLabel = (resourceName: string) => {
  const resource = getAuthResourceByName(resourceName)
  return resource ? resource.description : resourceName
}

const sendReqAssist = async () => {
  try {
    if (!form.value.message) {
      snackbar.add({ type: 'error', text: 'Please fill all required fields' })
      return
    }
    loadingStore.loading = true
    const response = await $api.requestAssistances.sendRequestAssist(form.value)
    snackbar.add({ type: 'success', text: 'Request assistance created' })

    form.value = {
      user_agent: '',
      current_route: '',
      message: '',
      attachments: [],
    }

    // useConfetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } })
    fireworks()

    closeDialog()
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const testClick = () => {
  fireworks()
}
</script>
