<template>
  <div>
    <v-app class="rounded-md">
      <v-main>
        <div class=""><slot></slot></div>
      </v-main>

      <v-footer name="footer" app class="auth-footer" :class="darkMode.isDark ? 'theme-dark' : 'theme-light'">
        <v-tooltip :text="hideGlobeMotion ? 'Mostrar animación' : 'Ocultar animación (puntos)'" location="top">
          <template #activator="{ props }">
            <v-btn
              v-bind="props"
              icon
              size="small"
              variant="text"
              class="auth-footer-btn"
              @click="toggleGlobeMotion"
            >
              <v-icon size="20">{{ hideGlobeMotion ? 'mdi-blur-off' : 'mdi-blur' }}</v-icon>
            </v-btn>
          </template>
        </v-tooltip>

        <span class="auth-footer-text flex-grow-1 text-center">{{ appName }} © {{ year }}</span>

        <SwitchDarkLightMode class="auth-footer-btn" />
      </v-footer>
      <SnackbarApiErrors />
      <OverlayLoading />
    </v-app>
  </div>
</template>
<script lang="ts" setup>
const config = useRuntimeConfig()
const darkMode = useDarkMode()
const { hideGlobeMotion, toggleGlobeMotion } = useReducedMotion()

const appName = computed(() => config.public.appName)
const year = new Date().getFullYear()
</script>

<style scoped>
.auth-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  backdrop-filter: blur(6px);
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.auth-footer-btn :deep(.v-icon) {
  opacity: 0.65;
}
.theme-dark .auth-footer-btn :deep(.v-icon) {
  color: #fff;
}
.theme-light .auth-footer-btn :deep(.v-icon) {
  color: #000;
}

.auth-footer.theme-dark {
  background: rgba(5, 7, 13, 0.35) !important;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}
.auth-footer.theme-light {
  background: rgba(244, 246, 251, 0.5) !important;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}

.auth-footer-text {
  font-size: 12px;
  letter-spacing: 0.03em;
}
.theme-dark .auth-footer-text {
  color: rgba(255, 255, 255, 0.65);
}
.theme-light .auth-footer-text {
  color: rgba(0, 0, 0, 0.55);
}
</style>
