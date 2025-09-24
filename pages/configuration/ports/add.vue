<script setup lang="ts"></script>
<template>
  <v-container fluid>
    <v-btn color="slate" size="small" variant="outlined" to="/configuration/ports" class="mb-4"
      >Back to ports</v-btn
    >
    <v-card>
      <v-card-title>
        <h3>New Port</h3>
      </v-card-title>
      <v-card-text>
        <PortForm />
      </v-card-text>
    </v-card>
  </v-container>
</template>
