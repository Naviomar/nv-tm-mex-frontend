/**
 * Persistence for user UI preferences (filter layouts, column layouts, ...).
 *
 * Strategy: localStorage is the fast cache applied on first paint; the
 * backend is the source of truth synced per user, so preferences survive
 * cache clearing and follow the user across devices.
 */
export function useUiPreference(key: string) {
  const { $api } = useNuxtApp()

  const readLocal = (): any | null => {
    try {
      const raw = localStorage.getItem(key)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  }

  const writeLocal = (value: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Ignore storage errors (private mode, quota, etc.)
    }
  }

  // Debounced so rapid interactions (dragging, span changes) hit the API once
  const saveServer = _Debounce(async (value: any) => {
    try {
      await $api.uiPreferences.save(key, value)
    } catch {
      // Silently keep the local copy; the next change will retry
    }
  }, 800)

  /** Persist locally right away and schedule the backend sync */
  const persist = (value: any) => {
    writeLocal(value)
    saveServer(value)
  }

  /**
   * Fetch the preference from the backend. Returns the stored value or null
   * when the user has nothing saved yet (or the request fails).
   */
  const loadServer = async (): Promise<any | null> => {
    try {
      const response = await $api.uiPreferences.get(key)
      const value = response?.value ?? null
      if (value !== null) writeLocal(value)
      return value
    } catch {
      return null
    }
  }

  return { readLocal, persist, loadServer }
}
