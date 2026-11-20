/**
 * Shared loading of process-request state for screens that render many
 * ProcessAuthorizationWrapper (one per table row). Without it every row asked for the
 * user's whole request list and for its own record: N rows = 2N+ calls per page.
 *
 * - User requests: one call shared by every caller within a short window.
 * - Per-record requests: calls made in the same tick for the same process are grouped
 *   into a single batch call.
 */
const USER_TTL_MS = 3000
const BATCH_WINDOW_MS = 30

let userCache: { at: number; promise: Promise<any[]> } | null = null

const pending = new Map<
  string,
  { keys: Set<string>; waiters: Map<string, Array<{ resolve: (v: any[]) => void; reject: (e: unknown) => void }>>; timer: ReturnType<typeof setTimeout> }
>()

export function useProcessRequestLoader() {
  const { $api } = useNuxtApp()
  const api = () => ($api as any).authProcessRequests

  function invalidateUserRequests() {
    userCache = null
  }

  function loadUserRequests(force = false): Promise<any[]> {
    if (!force && userCache && Date.now() - userCache.at < USER_TTL_MS) return userCache.promise
    const promise = Promise.resolve(api().getUserRequests()).then((r: any) => r ?? [])
    userCache = { at: Date.now(), promise }
    // A failed call must not be served to the next caller
    promise.catch(() => {
      if (userCache?.promise === promise) userCache = null
    })
    return promise
  }

  function loadRecordRequests(processName: string, requestKey: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      let batch = pending.get(processName)
      if (!batch) {
        const created = {
          keys: new Set<string>(),
          waiters: new Map<string, Array<{ resolve: (v: any[]) => void; reject: (e: unknown) => void }>>(),
          timer: setTimeout(() => flush(processName), BATCH_WINDOW_MS),
        }
        pending.set(processName, created)
        batch = created
      }
      const key = String(requestKey)
      batch.keys.add(key)
      const list = batch.waiters.get(key) ?? []
      list.push({ resolve, reject })
      batch.waiters.set(key, list)
    })
  }

  async function flush(processName: string) {
    const batch = pending.get(processName)
    if (!batch) return
    pending.delete(processName)
    const keys = [...batch.keys]
    const settle = (fn: (w: { resolve: (v: any[]) => void; reject: (e: unknown) => void }, key: string) => void) =>
      batch.waiters.forEach((waiters, key) => waiters.forEach((w) => fn(w, key)))
    try {
      // Chunks keep the query string well below URL limits
      const grouped: Record<string, any[]> = {}
      for (let i = 0; i < keys.length; i += 100) {
        Object.assign(grouped, (await api().getRequestsByResourceBatch({ process_name: processName, request_keys: keys.slice(i, i + 100) })) ?? {})
      }
      settle((w, key) => w.resolve(grouped[key] ?? []))
    } catch (e) {
      settle((w) => w.reject(e))
    }
  }

  return { loadUserRequests, loadRecordRequests, invalidateUserRequests }
}
