<template>
  <div>Logout</div>
</template>
<script setup lang="ts">
const { logout } = useSanctumAuth()
onMounted(async () => {
  await logout()
})
</script>
