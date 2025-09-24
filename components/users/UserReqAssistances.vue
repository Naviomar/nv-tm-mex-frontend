<template>
  <div>
    <div class="text-xl font-bold mb-4">My Request Assistances</div>
    <v-table density="compact">
      <thead>
        <tr>
          <th>ID</th>
          <th>Date</th>
          <th>Message</th>
          <th>Status</th>
          <th>User Auth</th>
          <th>Comments</th>
          <th>Attachment(s)</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(reqAssist, index) in requestAssistances" :key="`u-auth-${index}`">
          <td>{{ reqAssist.id }}</td>
          <td>{{ formatDateString(reqAssist.created_at) }}</td>
          <td>
            {{ reqAssist.message }}
          </td>
          <td>
            <v-chip color="primary">{{ reqAssist.status }}</v-chip>
          </td>
          <td>{{ reqAssist.assisted_by?.name }}</td>
          <td>
            {{ reqAssist.comments }}
          </td>
          <td>
            <div v-if="reqAssist.files.length <= 0">
              <v-chip color="warning">No attachments</v-chip>
            </div>
            <div v-if="reqAssist.files.length > 0">
              <div v-for="(file, index) in reqAssist.files" :key="`file-${index}`">
                <ButtonDownloadS3Object :s3Path="file.file_path" />
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

const requestAssistances = ref<any>([])
const response = await $api.users.getMyRequestAssistances()
requestAssistances.value = response
</script>
