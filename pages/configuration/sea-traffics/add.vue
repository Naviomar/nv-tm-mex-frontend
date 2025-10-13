<script setup lang="ts">
const router = useRouter()

const goBack = () => {
  router.back()
}
</script>
<template>
  <v-container fluid>
    <v-btn color="slate" size="small" variant="outlined" to="/configuration/sea-traffics" class="mb-4" @click="goBack"
      >Back to sea traffics</v-btn
    >
    <v-card>
      <v-card-title>
        <h3>New sea traffic</h3>
      </v-card-title>
      <v-card-text>
        <SeaTrafficForm />
      </v-card-text>
    </v-card>
  </v-container>
</template>
