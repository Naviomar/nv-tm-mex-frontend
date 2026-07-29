<template>
  <v-container fluid>
    <v-btn color="slate" size="small" variant="outlined" to="/system/users" class="mb-4" prepend-icon="mdi-arrow-left">
      Back
    </v-btn>

    <v-card class="mb-4">
      <v-card-title class="bg-primary text-white d-flex align-center py-4">
        <v-icon class="mr-2">mdi-account-plus-outline</v-icon>
        <div>
          <div class="text-h6 font-weight-bold">Add user</div>
          <div class="text-caption font-weight-regular" style="opacity: 0.85">
            Create an account, assign roles/permissions, and send credentials automatically
          </div>
        </div>
      </v-card-title>
      <v-card-text class="pa-6">
        <UsersForm />
      </v-card-text>
    </v-card>
  </v-container>
</template>
<script setup lang="ts">
definePageMeta({
  title: `Create User`,
  layout: 'default',
})
</script>
