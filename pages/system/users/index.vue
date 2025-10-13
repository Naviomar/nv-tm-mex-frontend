<template>
  <v-container fluid>
    <h1 class="text-xl font-bold underline mb-2">Users administration</h1>

    <NuxtErrorBoundary>
      <UsersAdministration />
      <template #error="{ error }">
        <v-alert type="error">
          {{ error }}
        </v-alert>
        <div>
          <v-btn color="primary" @click="onClickResetError(error)">Reload</v-btn>
        </div>
      </template>
    </NuxtErrorBoundary>
  </v-container>
</template>
<script setup lang="ts">
definePageMeta({
  title: `Users Administration`,
  layout: 'default',
})

const onClickResetError = async (error: any) => {
  await navigateTo('/system/users', { replace: true })
  error.value = null
}

</script>
