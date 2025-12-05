<template>
  <v-container fluid>
    <CatalogBackButton fallback-url="/configuration/freight-forwarders" />
    <v-card>
      <v-card-title>
        <h3>Edit freight forwarder</h3>
      </v-card-title>
      <v-card-text>
        <FreightForwardEditForm />
      </v-card-text>
    </v-card>
  </v-container>
</template>
<script setup lang="ts">
</script>
