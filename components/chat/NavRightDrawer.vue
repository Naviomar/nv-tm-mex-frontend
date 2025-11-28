<template>
  <div>
    <!-- Chat Drawer -->
    <v-navigation-drawer v-model="drawer" name="drawer-chat" location="right" width="300" class="p-4 m-4 mb-8 rounded-lg" style="height: calc(100% - 120px); bottom: 20px;" persistent>
      <div class="text-center font-bold">Online Chat</div>
      <Broadcast :is-open="drawer" @new-message="emit('new-message', $event)" />
    </v-navigation-drawer>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  show: {
    type: Boolean,
    required: true,
    default: false,
  },
})

const drawer = ref(false)
const emit = defineEmits(['new-message'])

watch(
  () => props.show,
  (val) => {
    drawer.value = val
  },
  { immediate: true }
)
</script>
