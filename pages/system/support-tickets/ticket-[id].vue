<template>
  <v-container fluid>
    <v-btn color="primary" size="small" variant="outlined" @click="$router.back()">Back</v-btn>
    <SupportTicketDetails :id="id" />
  </v-container>
</template>
<script setup lang="ts">
const route = useRoute()

const id = route.params.id!.toString()

definePageMeta({
  title: 'Support Ticket Details',
  layout: 'default',
})
</script>
