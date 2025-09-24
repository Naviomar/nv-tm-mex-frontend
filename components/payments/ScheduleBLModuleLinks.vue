<template>
  <div class="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-900 mb-4">
    <div class="font-bold">Schedule BL Payment ➡️</div>
    <v-btn color="lime" size="small" to="/payments/lines/schedules">
      <v-icon v-if="isLink3">mdi-circle-double</v-icon>
      BL payment release history
    </v-btn>

    <v-btn color="pink" size="small" to="/payments/lines/schedules/report-bls">
      <v-icon v-if="isLink1">mdi-circle-double</v-icon>
      New BL payment release report
    </v-btn>

    <v-btn color="amber" size="small" to="/payments/lines/schedules/sea-services">
      <v-icon v-if="isLink2">mdi-circle-double</v-icon>
      Request BL Payment
    </v-btn>
  </div>
</template>
<script setup lang="ts">
const route = useRoute()

const isLink1 = computed(() => route.path === '/payments/lines/schedules/report-bls')
const isLink2 = computed(() => route.path === '/payments/lines/schedules/sea-services')
const isLink3 = computed(() => route.path === '/payments/lines/schedules')
</script>
