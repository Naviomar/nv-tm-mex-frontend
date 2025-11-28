<template>
  <v-card variant="flat">
    <v-card-text>
      <div class="mb-4" @keyup.enter="onClickFilters">
        <div class="grid grid-cols-6 gap-4">
          <div class="col-span-2">
            <AUserSearch v-model="filters.created_by" label="Requested by" />
          </div>
          <div class="col-span-2">
            <v-text-field v-model="filters.id" type="number" density="compact" label="By ID" />
          </div>
          <div class="col-span-2">
            <v-autocomplete
              density="compact"
              label="Status"
              v-model="filters.status"
              :items="estatuses"
              item-title="name"
              item-value="value"
              hide-details
            />
          </div>
          <div class="col-span-2">
            <v-autocomplete
              density="compact"
              label="Active / Inactive"
              v-model="filters.deleted_status"
              :items="deletedStatus"
              item-title="name"
              item-value="value"
              hide-details
            />
          </div>
        </div>
        <div class="grid grid-cols-1 pt-4">
          <div class="flex gap-2">
            <v-btn size="small" color="secondary" @click="clearFilters"> Clear </v-btn>
            <v-btn size="small" color="primary" @click="onClickFilters"> Search </v-btn>
          </div>
        </div>
      </div>

      <v-pagination
        v-model="reqAssistances.current_page"
        :length="reqAssistances.last_page"
        rounded="circle"
        density="compact"
        @update:model-value="onClickPagination"
      ></v-pagination>
      <div class="text-xs">
        Showing {{ reqAssistances.from }} to {{ reqAssistances.to }} from {{ reqAssistances.total }} total records
      </div>
      <v-table density="compact">
        <thead>
          <tr>
            <th class="text-left" width="20">ID</th>
            <th class="text-left" width="50">Actions</th>
            <th class="text-left">Requested by</th>
            <th class="text-left">Route</th>
            <th class="text-left">Message</th>
            <th class="text-left">Attachments</th>
            <th class="text-left">Status</th>
            <th class="text-left">Assisted by</th>
            <th class="text-left">Comments</th>
            <th class="text-left">Created at</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(reqAssist, index) in reqAssistances.data"
            :key="`reqAssist-${index}`"
            :class="{
              'dark:hover:bg-gray-700! hover:bg-slate-300!': true,
              'bg-red-100! dark:bg-red-900!': reqAssist.deleted_at,
            }"
          >
            <td>
              {{ reqAssist.id }}
            </td>
            <td>
              <div v-if="isPendingToGrant(reqAssist) && !reqAssist.deleted_at">
                <v-btn color="primary" size="x-small" @click="showFormGrant(reqAssist)"> Respond </v-btn>
              </div>
              <div v-if="!isPendingToGrant(reqAssist) && !reqAssist.deleted_at">
                <v-btn color="red" size="x-small" @click="showFormCancel(reqAssist)"> Delete </v-btn>
              </div>
            </td>
            <td class="whitespace-nowrap">{{ reqAssist.user?.name }}</td>

            <td class="whitespace-nowrap">
              <nuxt-link :to="`${reqAssist.route}`" target="_blank" class="flex items-center">
                <v-icon size="x-small" class="mr-1">mdi-open-in-new</v-icon>
                {{ reqAssist.route }}
              </nuxt-link>
            </td>

            <td class="whitespace-nowrap">{{ reqAssist.message }}</td>

            <td class="whitespace-nowrap">
              <div v-if="reqAssist.files.length <= 0">
                <v-chip color="warning">No attachments</v-chip>
              </div>
              <div v-if="reqAssist.files.length > 0" class="flex flex-col gap-1">
                <div v-for="(file, fileIndex) in reqAssist.files" :key="`file-${fileIndex}`">
                  <ButtonDownloadS3Object :s3Path="file.file_path" />
                </div>
              </div>
            </td>

            <td>
              <v-chip size="x-small" color="primary">{{ reqAssist.status }}</v-chip>
            </td>
            <td class="whitespace-nowrap">{{ reqAssist.assisted_by?.name }}</td>
            <td class="">
              {{ reqAssist.comments }}
            </td>
            <td class="whitespace-nowrap">
              <UserInfoBadge :item="reqAssist" createdByKey="created_by">
                {{ formatDateString(reqAssist.created_at) }}
              </UserInfoBadge>
            </td>
          </tr>
        </tbody>
      </v-table>
      <v-pagination
        v-model="reqAssistances.current_page"
        :length="reqAssistances.last_page"
        rounded="circle"
        density="compact"
        @update:model-value="onClickPagination"
      ></v-pagination>

      <v-dialog v-model="showGrantDialog" max-width="500" persistent>
        <v-card>
          <v-card-title>Assist Request</v-card-title>
          <v-card-text>
            <div class="border-4 border-dotted border-gray-300 p-2 mb-4">
              <div class="text-base">Route: {{ form.req_assist?.route }}</div>
              <div class="text-base">Requested by: {{ form.req_assist?.user?.name }}</div>
              <div class="text-base">Comments: {{ form.req_assist?.message || 'No comments' }}</div>
            </div>
            <v-autocomplete
              v-model="form.status"
              :items="[
                { text: 'Open', value: 'open' },
                { text: 'Grant', value: 'granted' },
                { text: 'Deny', value: 'denied' },
              ]"
              item-title="text"
              item-value="value"
              label="Grant or deny?"
            />
            <v-textarea v-model="form.comments" label="Comments" :rows="3" />
          </v-card-text>
          <v-card-actions>
            <div class="grow"></div>
            <v-btn color="error" @click="closeGrantDialog">Cancel</v-btn>
            <v-btn color="success" @click="preAssist">Save response</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog v-model="showCancelDialog" max-width="500" persistent>
        <v-card>
          <v-card-title>Cancel request assistance</v-card-title>
          <v-card-text> Please confirm the delete of the request assistance </v-card-text>
          <v-card-actions>
            <div class="grow"></div>
            <v-btn color="error" @click="closeCancelDialog">Cancel</v-btn>
            <v-btn color="success" @click="cancelReqAssistance">Yes, I confirm.</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-card-text>
  </v-card>
</template>
<script setup lang="ts">
import { authorizeResources, getAuthResourceByName } from '~/utils/data/system'
import { deletedStatus } from '~/utils/data/systemData'
const { $api, $notifications } = useNuxtApp()
const snackbar = useSnackbar()
const confirm = $notifications.useConfirm()
const router = useRouter()
const reqAssistStore = useAuthRequestStore()

const loadingIndicator = useLoadingIndicator()
const loadingStore = useLoadingStore()

const filters = ref<any>({
  id: null,
  search: '',
  deleted_status: null,
  created_by: null,
})

const catalogs = ref<any>({
  users: [],
})

const estatuses = ref<any>([
  { name: 'Open', value: 'open' },
  { name: 'Granted', value: 'granted' },
  { name: 'Denied', value: 'denied' },
])

const formCancel = ref<any>({
  req_assist: null,
  cancel_reason: '',
})

const form = ref<any>({
  req_assist: null,
  expires_at: null,
  is_authorized: null,
  comments: '',
})

const reqAssistances = ref<any>({
  data: [] as any,
  current_page: 1,
  page: 1,
  perPage: 10,
  last_page: 1,
})

const showGrantDialog = ref(false)
const showCancelDialog = ref(false)

const showFormGrant = (reqAssist: any) => {
  form.value.req_assist = reqAssist
  showGrantDialog.value = true
}

const showFormCancel = (reqAssist: any) => {
  formCancel.value.req_assist = reqAssist
  showCancelDialog.value = true
}

const onClickPagination = async (page: number) => {
  reqAssistances.value.current_page = page
  await getRequestAssistances()
}

const isPendingToGrant = (reqAssist: any) => {
  return reqAssist.status == 'open'
}

const preAssist = async () => {
  if (form.value.status == null) {
    snackbar.add({ type: 'error', text: 'Please provide a response for the request assistance' })
    return
  }
  await assistSaveReq()
}

const assistSaveReq = async () => {
  try {
    if (form.value.status == null) {
      snackbar.add({ type: 'error', text: 'Please provide a response for the request assistance' })
      return
    }
    loadingStore.loading = true
    const body = {
      id: form.value.req_assist.id,
      status: form.value.status,
      response: form.value.comments,
    }
    await $api.requestAssistances.respondRequest(form.value.req_assist.id, body)

    snackbar.add({ type: 'success', text: 'Request assistance response updated.' })
    closeGrantDialog()
    await getRequestAssistances()
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const cancelReqAssistance = async () => {
  try {
    loadingStore.loading = true
    const response = await $api.requestAssistances.cancelRequest(formCancel.value.req_assist.id, {
      cancel_reason: formCancel.value.cancel_reason,
    })

    snackbar.add({ type: 'success', text: 'Authorization request canceled' })
    closeCancelDialog()
    await getRequestAssistances()
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const closeGrantDialog = () => {
  showGrantDialog.value = false
  form.value = {
    req_assist: null,
    expires_at: null,
    is_authorized: null,
    comments: '',
  }
}

const closeCancelDialog = () => {
  showCancelDialog.value = false
  formCancel.value = {
    req_assist: null,
    cancel_reason: '',
  }
}

const onClickFilters = async () => {
  // set current page to 1
  reqAssistances.value.current_page = 1
  await getRequestAssistances()
}

const getRequestAssistances = async () => {
  try {
    loadingIndicator.start()
    loadingStore.loading = true
    const response = await $api.requestAssistances.getRequests({
      query: {
        page: reqAssistances.value.current_page,
        perPage: reqAssistances.value.perPage,
        ...flattenArraysToCommaSeparatedString(filters.value),
      },
    })

    reqAssistances.value = response as any
  } catch (e) {
    console.error(e)
  } finally {
    // timeout 1 second
    setTimeout(() => {
      loadingIndicator.finish()
      loadingStore.loading = false
    }, 200)
  }
}

const clearFilters = async () => {
  filters.value = {
    id: null,
    search: '',
    deleted_status: null,
    created_by: null,
  }
  reqAssistances.value.current_page = 1
  await getRequestAssistances()
}

await getRequestAssistances()
</script>
