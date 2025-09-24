<template>
  <v-container fluid>
    <div>
      <v-btn color="slate" size="small" variant="outlined" class="mb-4" @click="$router.back()">Back</v-btn>

      <div class="flex items-center justify-between w-full">
        <div class="text-xl">Mail notifications</div>
      </div>
    </div>
    <div class="pt-4">
      <MailNotificationsConfig />
    </div>
  </v-container>
</template>
<script setup lang="ts">
definePageMeta({
  title: `Mail notifications Administration`,
  layout: 'default',
})
</script>
