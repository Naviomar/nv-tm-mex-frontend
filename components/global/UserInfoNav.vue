<template>
  <button v-if="user" class="ml-auto mr-4 flex gap-4" @click="naviteToProfile">
    <div class="-mx-6">
      <ClientOnly fallbackTag="span">
        <RiveAvatar
          src="/rive-files/avatar.riv"
          artboard="Avatar"
          state-machine="State Machine 1"
          autoplay
          width="100px"
          height="100px"
        />
      </ClientOnly>
    </div>
    <img :src="avatar" v-if="false" alt="avatar" class="rounded-full w-10 h-10" />

    <div class="flex flex-col gap-1">
      <span class="text-sm font-semibold">{{ user.name }}</span>
      <span class="text-xs">{{ user.email }}</span>
    </div>
  </button>
</template>

<script setup lang="ts">
const props = defineProps({
  path: {
    type: String,
    required: true,
  },
})
const { user } = useSanctumAuth()

const avatar = computed(() => {
  return user.value?.avatar_url || '/img/avatar/user-account.png'
})

function naviteToProfile() {
  navigateTo(props.path)
}
</script>
