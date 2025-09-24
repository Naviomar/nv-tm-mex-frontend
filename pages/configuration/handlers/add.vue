<template>
  <v-container fluid>
    <v-btn color="slate" size="small" variant="outlined" to="/configuration/handlers" class="mb-4" @click="goBack"
      >Back to handlers</v-btn
    >
    <v-card>
      <v-card-title>
        <h3>New handler</h3>
      </v-card-title>
      <v-card-text>
        <HandlerForm />
      </v-card-text>
    </v-card>
  </v-container>
</template>
<script setup lang="ts">
const router = useRouter()

definePageMeta({
  title: 'Config Handlers',
  layout: 'default',
})

const goBack = () => {
  router.back()
}
</script>
