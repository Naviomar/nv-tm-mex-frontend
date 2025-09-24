<template>
  <v-container fluid>
    <v-btn color="slate" size="small" variant="outlined" to="/configuration/customers/groups" class="mb-4"
      >Back to customer groups</v-btn
    >
    <v-card>
      <v-card-title>
        <h3>New customer group</h3>
      </v-card-title>
      <v-card-text>
        <ConsigneeGroupForm />
      </v-card-text>
    </v-card>
  </v-container>
</template>
<script setup lang="ts">
definePageMeta({
  title: 'Customer groups - Add new group',
  layout: 'default',
})
</script>
