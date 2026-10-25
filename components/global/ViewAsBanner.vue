<template>
  <v-system-bar v-if="viewing" color="warning" height="34" class="view-as-bar justify-center gap-3">
    <v-icon size="18">mdi-account-eye-outline</v-icon>
    <span class="text-body-2">
      Viewing as <strong>{{ user?.name }}</strong>
      <span class="opacity-80"> · read only, nothing is done on their behalf</span>
    </span>
    <v-btn size="x-small" variant="flat" color="white" class="text-none" prepend-icon="mdi-logout-variant" :loading="leaving" @click="leave">
      Exit
    </v-btn>
  </v-system-bar>
</template>

<script setup lang="ts">
const { user } = useSanctumAuth()
const { viewing, stop } = useViewAs()
const leaving = ref(false)

async function leave() {
  leaving.value = true
  await stop()
}
</script>

<style scoped>
.view-as-bar {
  z-index: 2500;
  font-weight: 500;
}
</style>
