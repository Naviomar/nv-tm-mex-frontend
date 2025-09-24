<template>
  <div>
    <h1 class="text-base font-bold mb-4">
      <div class="flex items-center gap-2">
        <span class="underline">System Bank accounts</span>
        <v-icon @click="getSystemAccounts">mdi-refresh</v-icon>
      </div>
    </h1>
    <div v-if="loadingStore.loading">
      <v-skeleton-loader type="list-item-three-line" />
    </div>
    <div v-if="!systemAccounts || systemAccounts.length <= 0">
      <v-alert type="warning" outlined class="max-w-lg">There are no system accounts</v-alert>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
      <div v-for="(account, index) in systemAccounts" :key="`sys-acct-${index}`">
        <SystemAccountDetailCard :account="account" @success="onSuccessSaved"/>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
const { $api } = useNuxtApp()
const loadingStore = useLoadingStore()

const show = ref(false)
const systemAccounts = ref<any>([])

const getSystemAccounts = async () => {
  try {
    loadingStore.loading = true
    const response = await $api.systemAccounts.getAll()

    systemAccounts.value = response
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const onSuccessSaved = () => {
  getSystemAccounts();
}

onMounted(() => {
  getSystemAccounts()
})
</script>
