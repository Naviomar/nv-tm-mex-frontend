<template>
  <v-container fluid>
    <v-card class="p-4">
      <v-card-title class="text-xl font-bold">Authorization Requests</v-card-title>
      <v-card-subtitle> Select the module you want to access </v-card-subtitle>
      <v-card-text>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
          <v-card color="amber" class="cursor-pointer" @click="goToAuthRequests">
            <v-card-text>
              <div class="flex flex-col items-center gap-2">
                <v-icon size="x-large">mdi-security</v-icon>
                <div class="text-lg">Authorization Requests module</div>
              </div>
            </v-card-text>
          </v-card>

          <v-card color="orange" class="cursor-pointer" @click="goToAuthProcesses">
            <v-card-text>
              <div class="flex flex-col items-center gap-2">
                <v-icon size="x-large">mdi-shield-key-outline</v-icon>
                <div class="text-lg">Authorization Process module</div>
              </div>
            </v-card-text>
          </v-card>

          <v-card color="purple" class="cursor-pointer" @click="goToRequestAssistance">
            <v-card-text>
              <div class="flex flex-col items-center gap-2">
                <v-icon size="x-large">mdi-handshake-outline</v-icon>
                <div class="text-lg">Request Assistance module</div>
              </div>
            </v-card-text>
          </v-card>
        </div>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
const router = useRouter()

definePageMeta({
  title: 'Auth requests - System',
  layout: 'default',
})

const goToAuthRequests = () => {
  router.push('/auth-requests')
}

const goToAuthProcesses = () => {
  router.push('/auth-process-requests')
}

const goToRequestAssistance = () => {
  router.push('/request-assistance')
}
</script>
