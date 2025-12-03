<template>
  <div class="flex flex-wrap items-center gap-2 bg-neutral-100 dark:bg-neutral-900 mb-4">
    <v-btn color="slate" size="small" variant="outlined" @click="$router.back()">Back</v-btn>

    <div class="font-bold">F.F. Agent modules ➡️</div>
    <v-btn v-if="false" color="pink" size="small" to="/payments/agents/check">
      <v-icon v-if="isCheckModule">mdi-circle-double</v-icon>
      Check module
    </v-btn>

    <v-btn color="amber" size="small" to="/payments/agents/soa">
      <v-icon v-if="isSoaModule">mdi-circle-double</v-icon>
      SOA module
    </v-btn>
    <v-btn
      color="lime"
      size="small"
      :to="{ path: '/payments/agents/payments', query: { status: 'pending' } }"
    >
      <v-icon v-if="isPendingPaymentsTab">mdi-circle-double</v-icon>
      Pending Payments module
    </v-btn>
    <v-btn
      color="lime"
      size="small"
      :to="{ path: '/payments/agents/payments', query: { status: 'paid' } }"
    >
      <v-icon v-if="isAllPaymentsTab">mdi-circle-double</v-icon>
      Paid Payments module
    </v-btn>
    <v-btn color="purple" size="small" to="/payments/agents/reports">
      <v-icon v-if="isReportModule">mdi-circle-double</v-icon>
      Reports module
    </v-btn>
  </div>
</template>
<script setup lang="ts">
const route = useRoute()

// if route is /payments/agents/check, then add the Check module link

const isCheckModule = computed(() => route.path === '/payments/agents/check')
const isSoaModule = computed(() => route.path === '/payments/agents/soa')
const isPaymentsModule = computed(() => route.path === '/payments/agents/payments')
const isPendingPaymentsTab = computed(
  () => isPaymentsModule.value && (!route.query.status || route.query.status === 'pending')
)
const isAllPaymentsTab = computed(
  () => isPaymentsModule.value && route.query.status === 'paid'
)
const isReportModule = computed(() => route.path === '/payments/agents/reports')
</script>
