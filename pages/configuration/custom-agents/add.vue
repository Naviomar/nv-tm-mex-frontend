<template>
  <v-container fluid>
    <v-btn color="slate" size="small" variant="outlined" to="/configuration/custom-agents" class="mb-4" @click="goBack"
      >Back to customs agents</v-btn
    >
    <v-card>
      <v-card-title>
        <h3>New customs agent</h3>
      </v-card-title>
      <v-card-text>
        <CustomAgentForm />
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
