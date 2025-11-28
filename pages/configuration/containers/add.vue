<template>
  <v-container fluid>
    <v-btn color="slate" size="small" variant="outlined" to="/configuration/containers" class="mb-4"
      >Back to containers</v-btn
    >
    <v-card>
      <v-card-title>
        <h3>New Container</h3>
      </v-card-title>
      <v-card-text>
        <ContainerForm />
      </v-card-text>
    </v-card>
  </v-container>
</template>
<script setup lang="ts"></script>
