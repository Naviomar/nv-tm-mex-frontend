<template>
  <div>
    <div class="text-xl font-bold mb-4">My Auth Requests</div>
    <v-table density="compact">
      <thead>
        <tr>
          <th>ID</th>
          <th>Date</th>
          <th>Resource</th>
          <th>Reference / Invoice</th>
          <th>Reason</th>
          <th>Status</th>
          <th>User Auth</th>
          <th>Attachment(s)</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(authReq, index) in authRequets" :key="`u-auth-${index}`">
          <td>{{ authReq.id }}</td>
          <td class="whitespace-nowrap">{{ formatDateString(authReq.created_at) }}</td>
          <td class="whitespace-nowrap">{{ getResourceName(authReq.resource) || authReq.resource }}</td>
          <td class="whitespace-nowrap font-bold">{{ authReq.invoice_number || authReq.resource_id }}</td>
          <td class="max-w-xs truncate">{{ authReq.request_reason || '—' }}</td>
          <td>
            <div v-if="authReq.is_authorized == null">
              <v-chip size="small" color="warning">Pending</v-chip>
            </div>
            <div v-else>
              <v-chip size="small" color="success" v-if="authReq.is_authorized == 1">Approved</v-chip>
              <v-chip size="small" color="error" v-else>Rejected</v-chip>
            </div>
          </td>
          <td class="whitespace-nowrap">{{ authReq.authorized?.name || '—' }}</td>
          <td>
            <div v-if="authReq.files.length <= 0">
              <v-chip size="small" color="warning">No attachments</v-chip>
            </div>
            <div v-if="authReq.files.length > 0">
              <div v-for="(file, index) in authReq.files" :key="`file-${index}`">
                <ButtonDownloadS3Object :s3Path="file.attachment" />
              </div>
            </div>
          </td>
        </tr>
      </tbody>
    </v-table>
  </div>
</template>
<script setup lang="ts">
import { getAuthResourceByName } from '~/utils/data/system'
const { $api } = useNuxtApp()

const authRequets = ref<any>([])
const response = await $api.users.getMyAuthRequests()
authRequets.value = response

const getResourceName = (resource: string) => {
  return getAuthResourceByName(resource)?.description
}
</script>
