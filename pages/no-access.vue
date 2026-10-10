<template>
  <v-container fluid class="d-flex justify-center py-16">
    <v-card max-width="460" class="text-center pa-8 rounded-lg" variant="flat">
      <v-avatar color="grey-lighten-3" size="72" class="mb-4">
        <v-icon size="36" color="grey-darken-1">mdi-lock-outline</v-icon>
      </v-avatar>
      <div class="text-h6 font-weight-bold mb-2">You don't have access to this page</div>
      <div class="text-body-2 text-medium-emphasis mb-6">
        Your account doesn't include the permission needed to open it. If you think you should have it,
        ask your department administrator.
      </div>
      <div class="d-flex justify-center gap-2">
        <v-btn variant="tonal" color="secondary" @click="goBack">Go back</v-btn>
        <v-btn color="primary" variant="flat" to="/">Home</v-btn>
      </div>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
definePageMeta({
  title: 'No access',
  layout: 'default',
})

const router = useRouter()

// Going "back" would land on the page that redirected here, so return to the previous one before it.
const goBack = () => {
  if (window.history.length > 2) router.go(-2)
  else router.push('/')
}
</script>
