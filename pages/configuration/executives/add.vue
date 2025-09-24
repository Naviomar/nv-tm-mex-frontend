<script setup lang="ts">
const router = useRouter()

const goBack = () => {
  router.back()
}
</script>
<template>
  <v-container fluid>
    <v-btn color="slate" size="small" variant="outlined" to="/configuration/executives" class="mb-4" @click="goBack"
      >Back to executives</v-btn
    >
    <v-card>
      <v-card-title>
        <h3>New executive</h3>
      </v-card-title>
      <v-card-text>
        <ExecutiveForm />
      </v-card-text>
    </v-card>
  </v-container>
</template>
