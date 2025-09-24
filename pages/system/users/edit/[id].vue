<template>
  <v-container fluid>
    <v-btn color="slate" size="small" variant="outlined" to="/system/users" class="mb-4">Back</v-btn>

    <v-card class="mb-4">
      <v-card-title>
        <h2 class="text-xl font-bold">Edit user</h2>
      </v-card-title>
      <v-card-text>
        <UserEditForm :id="route.params.id!.toString()" />
      </v-card-text>
    </v-card>
  </v-container>
</template>
<script setup lang="ts">
definePageMeta({
  title: `Edit User`,
  layout: 'default',
})

const route = useRoute()
</script>
