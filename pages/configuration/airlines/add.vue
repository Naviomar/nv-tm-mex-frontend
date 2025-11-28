<template>
  <v-container fluid>
    <v-btn color="slate" size="small" variant="outlined" to="/configuration/airlines" class="mb-4" @click="goBack"
      >Back to airlines</v-btn
    >
    <v-card>
      <v-card-title>
        <h3>New airline</h3>
      </v-card-title>
      <v-card-text>
        <AirlineForm />
      </v-card-text>
    </v-card>
  </v-container>
</template>
<script setup lang="ts">
const router = useRouter()

definePageMeta({
  title: 'Config Airlines',
  layout: 'default',
})

const goBack = () => {
  router.back()
}
</script>
