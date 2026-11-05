<template>
  <div class="tm-btn-group bg-neutral-100 dark:bg-neutral-900 mb-4">
    <v-btn color="slate" size="small" variant="outlined" @click="$router.back()">Back</v-btn>

    <div class="font-bold">Rebate modules ➡️</div>
    <Can permission="menu-rebate-containers">
      <v-btn color="teal" size="small" to="/rebate/containers">
        <v-icon v-if="route.path === '/rebate/containers'">mdi-circle-double</v-icon>
        Containers
      </v-btn>
    </Can>
    <Can permission="menu-rebate-payments">
      <v-btn color="cyan" size="small" to="/rebate/payments">
        <v-icon v-if="route.path.startsWith('/rebate/payments')">mdi-circle-double</v-icon>
        Payment requests
      </v-btn>
    </Can>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
</script>
