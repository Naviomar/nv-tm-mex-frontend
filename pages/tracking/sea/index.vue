<template>
  <v-container fluid>
    <v-card>
      <v-card-title>
        <div class="flex justify-between">
          <div class="flex gap-2">
            <v-icon>mdi-radar</v-icon>
            <h3>Maritime Tracking</h3>
          </div>
          <div class="flex gap-4">
            <v-btn
              color="purple"
              size="small"
              @click="
                navigateTo(appUrl!, {
                  external: true,
                  open: {
                    target: '_blank',
                  },
                })
              "
              >Go to public link</v-btn
            >
            <v-btn color="primary" size="small" @click="$router.push('/tracking/sea/add')">Add new event</v-btn>
          </div>
        </div>
      </v-card-title>
      <v-card-text>
        <SeaTrackingsTable />
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()

definePageMeta({
  title: 'Home',
  layout: 'default',
})

const appUrl = `${config.public.appUrl}/public/tracking/maritime`
</script>
