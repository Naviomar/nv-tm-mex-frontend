import { defineStore } from 'pinia'

export interface SubTab {
  id: string
  label: string
  path: string
  icon?: string
  closable?: boolean
}

export interface Tab {
  id: string
  label: string
  path: string
  icon?: string
  color?: string
  subTabs: SubTab[]
  activeSubTabId: string | null
}

interface TabsState {
  tabs: Tab[]
  activeTabId: string | null
  maxTabs: number
  maxSubTabs: number
}

export const useTabsStore = defineStore('system-tabs', {
  state: (): TabsState => ({
    tabs: [],
    activeTabId: null,
    maxTabs: 3,
    maxSubTabs: 3,
  }),

  getters: {
    activeTab: (state) => state.tabs.find((t) => t.id === state.activeTabId) || null,

    activeSubTab(): SubTab | null {
      const tab = this.activeTab
      if (!tab) return null
      return tab.subTabs.find((s) => s.id === tab.activeSubTabId) || null
    },

    hasTabs: (state) => state.tabs.length > 0,
  },

  actions: {
    /**
     * Open or activate a module tab. If the tab already exists, activate it.
     * If max tabs reached, replace the oldest non-active tab.
     */
    openTab(tabDef: { id: string; label: string; path: string; icon?: string; color?: string }) {
      const existing = this.tabs.find((t) => t.id === tabDef.id)
      if (existing) {
        this.activeTabId = existing.id
        return
      }

      const newTab: Tab = {
        id: tabDef.id,
        label: tabDef.label,
        path: tabDef.path,
        icon: tabDef.icon,
        color: tabDef.color,
        subTabs: [],
        activeSubTabId: null,
      }

      if (this.tabs.length >= this.maxTabs) {
        // Replace the oldest non-active tab
        const replaceIdx = this.tabs.findIndex((t) => t.id !== this.activeTabId)
        if (replaceIdx >= 0) {
          this.tabs.splice(replaceIdx, 1, newTab)
        } else {
          // All tabs are the active tab? Replace first
          this.tabs.splice(0, 1, newTab)
        }
      } else {
        this.tabs.push(newTab)
      }

      this.activeTabId = newTab.id
    },

    /**
     * Open or activate a sub-tab within the currently active tab.
     */
    openSubTab(subDef: { id: string; label: string; path: string; icon?: string }) {
      const tab = this.activeTab
      if (!tab) return

      const existing = tab.subTabs.find((s) => s.id === subDef.id)
      if (existing) {
        tab.activeSubTabId = existing.id
        return
      }

      const newSub: SubTab = {
        id: subDef.id,
        label: subDef.label,
        path: subDef.path,
        icon: subDef.icon,
        closable: true,
      }

      if (tab.subTabs.length >= this.maxSubTabs) {
        const replaceIdx = tab.subTabs.findIndex((s) => s.id !== tab.activeSubTabId)
        if (replaceIdx >= 0) {
          tab.subTabs.splice(replaceIdx, 1, newSub)
        } else {
          tab.subTabs.splice(0, 1, newSub)
        }
      } else {
        tab.subTabs.push(newSub)
      }

      tab.activeSubTabId = newSub.id
    },

    closeTab(tabId: string) {
      const idx = this.tabs.findIndex((t) => t.id === tabId)
      if (idx < 0) return

      this.tabs.splice(idx, 1)

      if (this.activeTabId === tabId) {
        // Activate the nearest remaining tab
        this.activeTabId = this.tabs.length > 0
          ? this.tabs[Math.min(idx, this.tabs.length - 1)].id
          : null
      }
    },

    closeSubTab(tabId: string, subTabId: string) {
      const tab = this.tabs.find((t) => t.id === tabId)
      if (!tab) return

      const idx = tab.subTabs.findIndex((s) => s.id === subTabId)
      if (idx < 0) return

      tab.subTabs.splice(idx, 1)

      if (tab.activeSubTabId === subTabId) {
        tab.activeSubTabId = tab.subTabs.length > 0
          ? tab.subTabs[Math.min(idx, tab.subTabs.length - 1)].id
          : null
      }
    },

    activateTab(tabId: string) {
      if (this.tabs.find((t) => t.id === tabId)) {
        this.activeTabId = tabId
      }
    },

    activateSubTab(tabId: string, subTabId: string) {
      const tab = this.tabs.find((t) => t.id === tabId)
      if (tab && tab.subTabs.find((s) => s.id === subTabId)) {
        this.activeTabId = tabId
        tab.activeSubTabId = subTabId
      }
    },
  },
})
