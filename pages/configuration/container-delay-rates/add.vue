<template>
  <v-container fluid>
    <v-btn color="slate" size="small" variant="outlined" to="/configuration/container-delay-rates" class="mb-4"
      >Back to container delay rates</v-btn
    >
    <v-card>
      <v-card-title>
        <h3>New Container Delay Rate</h3>
      </v-card-title>
      <v-card-text>
        <ContainerDelayRateForm mode="create" />
      </v-card-text>
    </v-card>
  </v-container>
</template>
<script setup lang="ts"></script>
