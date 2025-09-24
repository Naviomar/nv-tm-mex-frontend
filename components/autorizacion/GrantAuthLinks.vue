<template>
  <div class="flex flex-wrap items-center gap-2 bg-neutral-100 dark:bg-neutral-900 mb-4">
    <v-btn color="slate" size="small" variant="outlined" @click="$router.back()">Back</v-btn>

    <div class="font-bold">Authorizations ➡️</div>

    <v-btn color="amber" size="small" to="/auth-requests">
      <v-icon v-if="isAuthRequests">mdi-circle-double</v-icon>
      Auth. Requests
    </v-btn>
    <v-btn color="orange" size="small" to="/auth-process-requests">
      <v-icon v-if="isAuthProcess">mdi-circle-double</v-icon>
      Auth. Processes
    </v-btn>
    <v-btn color="purple" size="small" to="/request-assistance">
      <v-icon v-if="isRequestAssistance">mdi-circle-double</v-icon>
      Request Assistance
    </v-btn>
  </div>
</template>
<script setup lang="ts">
const route = useRoute()

// if route is /payments/agents/check, then add the Check module link

const isAuthRequests = computed(() => route.path === '/auth-requests')
const isAuthProcess = computed(() => route.path === '/auth-process-requests')
const isRequestAssistance = computed(() => route.path === '/request-assistance')
</script>
