<template>
  <v-container fluid>
    <v-btn color="slate" size="small" variant="outlined" to="/configuration/freight-forwarders/groups" class="mb-4"
      >Back to freight-forwarders groups</v-btn
    >
    <v-card>
      <v-card-title>
        <h3>New freight forwarder group name</h3>
      </v-card-title>
      <v-card-text>
        <FreightForwardedGroupForm />
      </v-card-text>
    </v-card>
  </v-container>
</template>
<script setup lang="ts">
const router = useRouter()
</script>
