<template>
  <div>
    <div class="text-xl font-bold mb-4">My Auth Requests</div>
    <v-table density="compact">
      <thead>
        <tr>
          <th>ID</th>
          <th>Date</th>
          <th>Resource</th>
          <th>Resource ID</th>
          <th>Status</th>
          <th>User Auth</th>
          <th>Attachment(s)</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(authReq, index) in authRequets" :key="`u-auth-${index}`">
          <td>{{ authReq.id }}</td>
          <td>{{ formatDateString(authReq.created_at) }}</td>
          <td>{{ authReq.resource }}</td>
          <td>{{ authReq.resource_id }}</td>
          <td>
            <div v-if="authReq.is_authorized == null">
              <v-chip color="warning">Pending</v-chip>
            </div>
            <div v-else>
              <v-chip color="success" v-if="authReq.is_authorized == 1">Yes</v-chip>
              <v-chip color="error" v-else>No</v-chip>
            </div>
          </td>
          <td>{{ authReq.authorized?.name }}</td>
          <td>
            <div v-if="authReq.files.length <= 0">
              <v-chip color="warning">No attachments</v-chip>
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
const { $api } = useNuxtApp()

const authRequets = ref<any>([])
const response = await $api.users.getMyAuthRequests()
authRequets.value = response
</script>
