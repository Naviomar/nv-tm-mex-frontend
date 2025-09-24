<template>
  <v-container fluid>
    <v-btn color="slate" size="small" variant="outlined" to="/configuration/freight-forwarders/groups" class="mb-4"
      >Back to Freight forwarders groups</v-btn
    >
    <FreightForwardersInGroupTable />
  </v-container>
</template>
<script setup lang="ts">
const route = useRoute()
const router = useRouter()

const id = route.params.id
</script>
