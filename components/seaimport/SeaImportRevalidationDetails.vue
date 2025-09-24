<template>
  <div>
    <div>
      <div class="font-bold">MBL Files</div>
      <v-table density="compact">
        <thead>
          <tr>
            <th class="text-left">MBL File</th>
            <th class="text-left">Date</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(mbl, index) in reference.release_mbls" :key="`ref-reval-mbl-${index}`">
            <td><ButtonDownloadS3Object :s3Path="mbl.attachment" /></td>
            <td>
              <UserInfoBadge :item="mbl">
                {{ formatDateString(mbl.created_at) }}
              </UserInfoBadge>
            </td>
          </tr>
        </tbody>
      </v-table>
    </div>
    <div class="py-4">
      <div class="font-bold">PDF seal details</div>
      <v-table density="compact">
        <thead>
          <tr>
            <th class="text-left">Original PDF</th>
            <th class="text-left">Seal type</th>
            <th class="text-left">Sealed PDF</th>
            <th class="text-left">Sent at</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><ButtonDownloadS3Object :s3Path="reference.revalidation?.attachment_original" /></td>
            <td>{{ reference.revalidation?.seal_type }}</td>
            <td><ButtonDownloadS3Object :s3Path="reference.revalidation?.attachment_sellos" /></td>
            <td>
              <UserInfoBadge :item="reference.revalidation">
                {{ formatDateString(reference.revalidation?.sent_at) }} By {{ reference.revalidation?.sent_user?.name }}
              </UserInfoBadge>
            </td>
          </tr>
        </tbody>
      </v-table>
    </div>
  </div>
</template>
<script setup lang="ts">
const props = defineProps({
  reference: {
    type: Object,
    required: true,
  },
})
</script>
