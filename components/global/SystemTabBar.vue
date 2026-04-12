<template>
  <!-- Nothing renders when no tabs -->
  <transition name="tabbar-fade">
    <div v-if="tabsStore.hasTabs" class="systab">

      <!-- Minimized: just a small pill showing active tab + expand btn -->
      <transition name="tabbar-swap" mode="out-in">
        <div v-if="minimized" key="mini" class="systab__mini">
          <v-icon size="14" class="systab__mini-icon">{{ activeTab?.icon ?? 'mdi-tab' }}</v-icon>
          <span class="systab__mini-label">{{ activeTab?.label ?? '…' }}</span>
          <span v-if="activeTab && activeSubTab" class="systab__mini-sep">›</span>
          <span v-if="activeSubTab" class="systab__mini-sub">{{ activeSubTab.label }}</span>
          <button class="systab__toggle" title="Expand tabs" @click="toggle">
            <v-icon size="13">mdi-chevron-down</v-icon>
          </button>
        </div>

        <!-- Expanded: full tabs + sub-tabs -->
        <div v-else key="full" class="systab__full">
          <!-- Module pills -->
          <div class="systab__row">
            <button
              v-for="tab in tabsStore.tabs"
              :key="tab.id"
              class="systab__pill"
              :class="{ 'systab__pill--active': tab.id === tabsStore.activeTabId }"
              :style="tab.id === tabsStore.activeTabId && tab.color
                ? { '--pc': `var(--v-theme-${tab.color})` }
                : {}"
              @click="onTabClick(tab)"
            >
              <v-icon v-if="tab.icon" size="13">{{ tab.icon }}</v-icon>
              <span>{{ tab.label }}</span>
              <span class="systab__pill-close" @click.stop="tabsStore.closeTab(tab.id)">
                <v-icon size="10">mdi-close</v-icon>
              </span>
            </button>

            <!-- Collapse button -->
            <button class="systab__toggle systab__toggle--collapse" title="Minimize tabs" @click="toggle">
              <v-icon size="13">mdi-chevron-up</v-icon>
            </button>
          </div>

          <!-- Sub-tab pills -->
          <transition name="subtabs-expand">
            <div v-if="activeTab && activeTab.subTabs.length > 0" class="systab__row systab__row--sub">
              <button
                v-for="sub in activeTab.subTabs"
                :key="sub.id"
                class="systab__subpill"
                :class="{ 'systab__subpill--active': sub.id === activeTab.activeSubTabId }"
                @click="onSubTabClick(sub)"
              >
                <v-icon v-if="sub.icon" size="11">{{ sub.icon }}</v-icon>
                <span>{{ sub.label }}</span>
                <span
                  v-if="sub.closable !== false"
                  class="systab__subpill-close"
                  @click.stop="tabsStore.closeSubTab(activeTab.id, sub.id)"
                >
                  <v-icon size="9">mdi-close</v-icon>
                </span>
              </button>
            </div>
          </transition>
        </div>
      </transition>

    </div>
  </transition>
</template>

<script setup lang="ts">
import type { Tab, SubTab } from '~/stores/useTabsStore'

const STORAGE_KEY = 'systab-minimized'

const tabsStore = useTabsStore()
const router = useRouter()

const minimized = ref(true)

onMounted(() => {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored !== null) minimized.value = stored === 'true'
})

const toggle = () => {
  minimized.value = !minimized.value
  localStorage.setItem(STORAGE_KEY, String(minimized.value))
}

const activeTab = computed(() => tabsStore.activeTab)
const activeSubTab = computed(() => {
  const tab = activeTab.value
  if (!tab || !tab.activeSubTabId) return null
  return tab.subTabs.find((s) => s.id === tab.activeSubTabId) ?? null
})

const onTabClick = (tab: Tab) => {
  tabsStore.activateTab(tab.id)
  const path = tab.activeSubTabId
    ? tab.subTabs.find((s) => s.id === tab.activeSubTabId)?.path ?? tab.path
    : tab.path
  router.push(path)
}

const onSubTabClick = (sub: SubTab) => {
  if (!activeTab.value) return
  tabsStore.activateSubTab(activeTab.value.id, sub.id)
  router.push(sub.path)
}
</script>

<style scoped>
/* ── Root wrapper ────────────────────────────────────────────────────── */
.systab {
  display: flex;
  align-items: center;
  max-width: 520px;
  min-width: 0;
}

/* ── Minimized pill ──────────────────────────────────────────────────── */
.systab__mini {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 8px 3px 10px;
  border-radius: 999px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.15);
  background: rgba(var(--v-theme-on-surface), 0.04);
  font-size: 0.75rem;
  color: rgba(var(--v-theme-on-surface), 0.7);
  white-space: nowrap;
  max-width: 320px;
  overflow: hidden;
}

.systab__mini-icon { opacity: 0.7; flex-shrink: 0; }
.systab__mini-label { font-weight: 600; overflow: hidden; text-overflow: ellipsis; max-width: 90px; }
.systab__mini-sep { opacity: 0.4; }
.systab__mini-sub { opacity: 0.75; overflow: hidden; text-overflow: ellipsis; max-width: 90px; }

/* ── Expanded wrapper ────────────────────────────────────────────────── */
.systab__full {
  display: flex;
  flex-direction: column;
  gap: 2px;
  max-width: 520px;
  min-width: 0;
}

/* ── Rows ────────────────────────────────────────────────────────────── */
.systab__row {
  display: flex;
  align-items: center;
  gap: 4px;
  overflow-x: auto;
  scrollbar-width: none;
  flex-wrap: nowrap;
}
.systab__row::-webkit-scrollbar { display: none; }

.systab__row--sub {
  padding-left: 2px;
}

/* ── Toggle button ───────────────────────────────────────────────────── */
.systab__toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.15);
  background: rgba(var(--v-theme-on-surface), 0.05);
  cursor: pointer;
  color: rgba(var(--v-theme-on-surface), 0.6);
  flex-shrink: 0;
  transition: all 0.15s ease;
}
.systab__toggle:hover {
  background: rgba(var(--v-theme-primary), 0.1);
  color: rgb(var(--v-theme-primary));
  border-color: rgba(var(--v-theme-primary), 0.3);
}
.systab__toggle--collapse { margin-left: 2px; }

/* ── Module pill ─────────────────────────────────────────────────────── */
.systab__pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border-radius: 999px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.15);
  background: transparent;
  cursor: pointer;
  white-space: nowrap;
  font-size: 0.75rem;
  font-weight: 500;
  color: rgba(var(--v-theme-on-surface), 0.65);
  transition: all 0.15s ease;
  flex-shrink: 0;
}
.systab__pill:hover {
  border-color: rgba(var(--v-theme-primary), 0.4);
  color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.06);
}
.systab__pill--active {
  background: rgb(var(--pc, var(--v-theme-primary)));
  border-color: rgb(var(--pc, var(--v-theme-primary)));
  color: #fff;
  font-weight: 600;
  box-shadow: 0 1px 6px rgba(var(--pc, var(--v-theme-primary)), 0.4);
}
.systab__pill--active:hover { filter: brightness(1.08); }

.systab__pill-close {
  display: inline-flex;
  align-items: center;
  width: 13px;
  height: 13px;
  border-radius: 50%;
  opacity: 0;
  transition: opacity 0.12s;
  margin-left: 1px;
  cursor: pointer;
}
.systab__pill:hover .systab__pill-close,
.systab__pill--active .systab__pill-close { opacity: 0.75; }
.systab__pill-close:hover { opacity: 1 !important; background: rgba(255,255,255,0.25); }

/* ── Sub-tab pill ────────────────────────────────────────────────────── */
.systab__subpill {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 2px 8px;
  border-radius: 999px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.1);
  background: transparent;
  cursor: pointer;
  white-space: nowrap;
  font-size: 0.7rem;
  font-weight: 500;
  color: rgba(var(--v-theme-on-surface), 0.55);
  transition: all 0.12s ease;
  flex-shrink: 0;
}
.systab__subpill:hover {
  border-color: rgba(var(--v-theme-primary), 0.35);
  color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.06);
}
.systab__subpill--active {
  background: rgba(var(--v-theme-primary), 0.12);
  border-color: rgba(var(--v-theme-primary), 0.4);
  color: rgb(var(--v-theme-primary));
  font-weight: 600;
}

.systab__subpill-close {
  display: inline-flex;
  align-items: center;
  width: 11px;
  height: 11px;
  border-radius: 50%;
  opacity: 0;
  transition: opacity 0.12s;
  margin-left: 1px;
  cursor: pointer;
}
.systab__subpill:hover .systab__subpill-close,
.systab__subpill--active .systab__subpill-close { opacity: 0.6; }
.systab__subpill-close:hover {
  opacity: 1 !important;
  background: rgba(var(--v-theme-error), 0.12);
  color: rgb(var(--v-theme-error));
}

/* ── Transitions ─────────────────────────────────────────────────────── */
.tabbar-fade-enter-active, .tabbar-fade-leave-active { transition: opacity 0.2s; }
.tabbar-fade-enter-from, .tabbar-fade-leave-to { opacity: 0; }

.tabbar-swap-enter-active, .tabbar-swap-leave-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.tabbar-swap-enter-from { opacity: 0; transform: scale(0.95); }
.tabbar-swap-leave-to { opacity: 0; transform: scale(0.95); }

.subtabs-expand-enter-active, .subtabs-expand-leave-active {
  transition: max-height 0.18s ease, opacity 0.18s ease;
  overflow: hidden;
}
.subtabs-expand-enter-from, .subtabs-expand-leave-to { max-height: 0; opacity: 0; }
.subtabs-expand-enter-to, .subtabs-expand-leave-from { max-height: 32px; opacity: 1; }
</style>
