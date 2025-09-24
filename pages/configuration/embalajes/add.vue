<template>
  <v-container fluid>
    <v-btn color="slate" size="small" variant="outlined" to="/configuration/embalajes" class="mb-4" @click="goBack"
      >Back to embalajes</v-btn
    >
    <v-card>
      <v-card-title>
        <h3>New embalaje</h3>
      </v-card-title>
      <v-card-text>
        <EmbalajeForm />
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
