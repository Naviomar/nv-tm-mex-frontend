<template>
  <v-container fluid>
    <v-btn color="slate" size="small" variant="outlined" to="/configuration/notifications-types" class="mb-4"
      >Back to Notification Types</v-btn
    >
    <v-card>
      <v-card-title>
        <h3>Edit Notification Type</h3>
      </v-card-title>
      <v-card-text>
        <NotificationTypeEditForm />
      </v-card-text>
    </v-card>
  </v-container>
</template>
<script setup lang="ts">
const router = useRouter()
</script>
