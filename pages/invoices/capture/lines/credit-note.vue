<template>
  <v-container fluid>
    <v-btn color="slate" size="small" variant="outlined" @click="$router.back()" class="mb-2">Back</v-btn>
    <LineCreditNoteForm />
  </v-container>
</template>
<script setup lang="ts">
definePageMeta({
  title: 'TM - Line Credit notes',
  layout: 'default',
})
</script>
