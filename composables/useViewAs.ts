const STORAGE_KEY = 'nv-tm:view-as'

/** Id of the user being viewed in this tab (sessionStorage: it never leaks to other tabs or survives the browser). */
export function readViewAsId(): number | null {
  if (!import.meta.client) return null
  try {
    const value = Number(sessionStorage.getItem(STORAGE_KEY))
    return Number.isFinite(value) && value > 0 ? value : null
  } catch {
    return null
  }
}

function writeViewAsId(id: number | null) {
  try {
    if (id) sessionStorage.setItem(STORAGE_KEY, String(id))
    else sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    // no-op: without storage the view simply cannot be kept across reloads
  }
}

/**
 * "View as": a Super Admin looks at the system as another user sees it (permissions, restrictions, scope), read only.
 * The backend decides everything from the X-View-As header; the browser only remembers which user for this tab.
 */
export function useViewAs() {
  const { $api } = useNuxtApp()
  const { user } = useSanctumAuth()
  const config = useRuntimeConfig()

  const viewing = computed(() => !!(user.value as any)?.view_as)
  const realUser = computed(() => (user.value as any)?.view_as?.real_user ?? null)
  const canStart = computed(() => !viewing.value && !!(user.value as any)?.roles?.some((role: any) => role.name === 'Super Admin'))

  function reload() {
    window.location.assign(config.app.baseURL || '/')
  }

  async function start(target: { id: number }) {
    await $api.viewAs.start(target.id)
    writeViewAsId(target.id)
    reload()
  }

  async function stop() {
    const id = readViewAsId() ?? (user.value as any)?.id
    try {
      await $api.viewAs.stop(Number((user.value as any)?.id ?? id))
    } catch {
      // leaving the view must always work, even if the audit call fails
    }
    writeViewAsId(null)
    reload()
  }

  /** Drops a stale view (e.g. the user was deactivated) without asking the API. */
  function forget() {
    writeViewAsId(null)
  }

  return { viewing, realUser, canStart, start, stop, forget }
}
