<template>
  <div class="flex flex-wrap items-center gap-2 bg-zinc-100 dark:bg-zinc-900 rounded-lg p-3 mb-4">
    <Button variant="secondary" size="sm" @click="$router.back()">Back</Button>

    <span class="font-bold text-zinc-700 dark:text-zinc-300">Authorizations ➡️</span>

    <Button
      :to="'/auth-requests'"
      size="sm"
      :variant="isAuthRequests ? 'primary' : 'secondary'"
    >
      <span v-if="isAuthRequests" class="mdi mdi-circle-double text-base mr-1" aria-hidden="true"></span>
      Auth. Requests
    </Button>
    <Button
      :to="'/auth-process-requests'"
      size="sm"
      :variant="isAuthProcess ? 'primary' : 'secondary'"
    >
      <span v-if="isAuthProcess" class="mdi mdi-circle-double text-base mr-1" aria-hidden="true"></span>
      Auth. Processes
    </Button>
    <Button
      :to="'/request-assistance'"
      size="sm"
      :variant="isRequestAssistance ? 'primary' : 'secondary'"
    >
      <span v-if="isRequestAssistance" class="mdi mdi-circle-double text-base mr-1" aria-hidden="true"></span>
      Request Assistance
    </Button>
  </div>
</template>
<script setup lang="ts">
const route = useRoute()

// if route is /payments/agents/check, then add the Check module link

const isAuthRequests = computed(() => route.path === '/auth-requests')
const isAuthProcess = computed(() => route.path === '/auth-process-requests')
const isRequestAssistance = computed(() => route.path === '/request-assistance')
</script>
