<script setup lang="ts">
definePageMeta({ title: 'Rebate', layout: 'default' })

const { hasPermission } = useCheckUser()
await navigateTo(hasPermission('menu-rebate-containers') ? '/rebate/containers' : '/rebate/payments', { replace: true })
</script>

<template>
  <div />
</template>
