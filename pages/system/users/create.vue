<template>
  <v-container fluid>
    <v-btn color="slate" size="small" variant="outlined" to="/system/users" class="mb-4">Back</v-btn>

    <v-card class="mb-4">
      <v-card-title>
        <h2 class="text-xl font-bold">Add user</h2>
      </v-card-title>
      <v-card-text>
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
