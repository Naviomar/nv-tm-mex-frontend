<template>
  <button
    class="theme-toggle"
    :class="{ 'theme-toggle--dark': darkMode.isDark }"
    :title="darkMode.isDark ? 'Switch to light mode' : 'Switch to dark mode'"
    @click="darkMode.toggleTheme"
  >
    <!-- Track -->
    <span class="theme-toggle__track">
      <!-- Thumb -->
      <span class="theme-toggle__thumb">
        <transition name="icon-swap" mode="out-in">
          <v-icon v-if="darkMode.isDark" key="moon" size="12" class="theme-toggle__icon">mdi-moon-waning-crescent</v-icon>
          <v-icon v-else key="sun" size="12" class="theme-toggle__icon theme-toggle__icon--sun">mdi-white-balance-sunny</v-icon>
        </transition>
      </span>
      <!-- Stars (dark mode decoration) -->
      <span v-if="darkMode.isDark" class="theme-toggle__star theme-toggle__star--1" />
      <span v-if="darkMode.isDark" class="theme-toggle__star theme-toggle__star--2" />
      <span v-if="darkMode.isDark" class="theme-toggle__star theme-toggle__star--3" />
    </span>
  </button>
</template>

<script setup lang="ts">
const darkMode = useDarkMode()
</script>

<style scoped>
.theme-toggle {
  position: relative;
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  border: none;
  background: transparent;
  padding: 4px;
  border-radius: 999px;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.theme-toggle:hover .theme-toggle__track {
  opacity: 0.9;
  box-shadow: 0 0 0 3px rgba(var(--v-theme-primary), 0.15);
}

/* ── Track ───────────────────────────────────────────────────────── */
.theme-toggle__track {
  position: relative;
  width: 44px;
  height: 24px;
  border-radius: 999px;
  background: linear-gradient(135deg, #e8c96a 0%, #f4a528 100%);
  transition: background 0.35s ease, box-shadow 0.2s ease;
  overflow: hidden;
}

.theme-toggle--dark .theme-toggle__track {
  background: linear-gradient(135deg, #1a1f3c 0%, #2d3561 100%);
}

/* ── Thumb ───────────────────────────────────────────────────────── */
.theme-toggle__thumb {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.32s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.3s ease;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
  z-index: 2;
}

.theme-toggle--dark .theme-toggle__thumb {
  transform: translateX(20px);
  background: #e8eaf6;
}

/* ── Icons ───────────────────────────────────────────────────────── */
.theme-toggle__icon {
  color: #f4a528 !important;
}

.theme-toggle__icon--sun {
  color: #e67e22 !important;
}

.theme-toggle--dark .theme-toggle__icon {
  color: #5c6bc0 !important;
}

/* ── Star decorations ────────────────────────────────────────────── */
.theme-toggle__star {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.7);
  animation: twinkle 2s infinite ease-in-out;
}
.theme-toggle__star--1 { width: 2px; height: 2px; top: 5px; left: 8px; animation-delay: 0s; }
.theme-toggle__star--2 { width: 2px; height: 2px; top: 14px; left: 14px; animation-delay: 0.6s; }
.theme-toggle__star--3 { width: 3px; height: 3px; top: 8px; left: 18px; animation-delay: 1.2s; }

@keyframes twinkle {
  0%, 100% { opacity: 0.4; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.4); }
}

/* ── Icon swap transition ────────────────────────────────────────── */
.icon-swap-enter-active,
.icon-swap-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.icon-swap-enter-from {
  opacity: 0;
  transform: rotate(-45deg) scale(0.5);
}
.icon-swap-leave-to {
  opacity: 0;
  transform: rotate(45deg) scale(0.5);
}
</style>
