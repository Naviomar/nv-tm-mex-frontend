<template>
  <v-container fluid>
    <v-btn
      color="slate"
      size="small"
      variant="outlined"
      to="/configuration/freight-forwarders"
      class="mb-4"
      @click="goBack"
      >Back to freight forwarders</v-btn
    >
    <v-card>
      <v-card-title>
        <h3>New freight forwarder</h3>
      </v-card-title>
      <v-card-text>
        <FreightForwarderForm />
      </v-card-text>
    </v-card>
  </v-container>
</template>
<script setup lang="ts">
const router = useRouter()

const goBack = () => {
  router.back()
}
</script>
