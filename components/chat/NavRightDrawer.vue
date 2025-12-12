<template>
  <div>
    <!-- Chat Drawer -->
    <transition name="chat-slide">
      <div v-if="drawer" class="chat-panel">
        <v-card class="chat-card elevation-10">
          <v-card-title class="chat-card__header">
            <div class="d-flex align-center gap-2">
              <v-avatar size="28" class="chat-card__avatar">
                <v-icon size="20">mdi-message-text-outline</v-icon>
              </v-avatar>
              <div class="d-flex flex-column">
                <span class="chat-card__title">Online Chat</span>
                <span class="chat-card__subtitle">We usually reply in a few minutes</span>
              </div>
            </div>
            <v-btn
              icon="mdi-close"
              variant="text"
              size="small"
              class="chat-card__close"
              @click="drawer = false"
            />
          </v-card-title>
          <v-divider class="chat-card__divider" />
          <v-card-text class="pa-0 chat-card__body">
            <Broadcast :is-open="drawer" @new-message="emit('new-message', $event)" />
          </v-card-text>
        </v-card>
      </div>
    </transition>
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
const emit = defineEmits(['new-message', 'close'])

watch(
  () => props.show,
  (val) => {
    drawer.value = val
  },
  { immediate: true }
)

watch(
  () => drawer.value,
  (val) => {
    if (!val) emit('close')
  }
)
</script>

<style scoped>
.chat-panel {
  position: fixed;
  right: 24px;
  bottom: 88px;
  top: 80px;
  max-width: 420px;
  width: 100%;
  z-index: 3000;
}

.chat-slide-enter-active,
.chat-slide-leave-active {
  transition: transform 0.45s cubic-bezier(0.22, 1, 0.36, 1),
              opacity 0.45s ease;
  transform-origin: top right;
}

.chat-slide-enter-from,
.chat-slide-leave-to {
  transform: translate(0, -8px) scale(0.4);
  opacity: 0;
}

.chat-card {
  border-radius: 16px 0 16px 16px; /* top-right square, other corners rounded */
  overflow: hidden;
  border: 1px solid rgba(148, 163, 184, 0.35);
}

.chat-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background-color: #ffffff;
  color: #111827;
  border-bottom: 1px solid rgba(148, 163, 184, 0.5);
}

.chat-card__title {
  font-weight: 600;
  font-size: 0.92rem;
  letter-spacing: 0.02em;
  color: #1c2a7a;
}

.chat-card__subtitle {
  font-size: 0.7rem;
  opacity: 0.8;
  color: #6b7280;
}

.chat-card__avatar {
  background: #e5edff;
  color: #1c2a7a;
  box-shadow: 0 0 0 1px rgba(129, 140, 248, 0.8);
}

.chat-card__close {
  color: #6b7280 !important;
}

.chat-card__divider {
  opacity: 0.9;
}

.chat-card__body {
  background-color: #f9fafb;
}
</style>
