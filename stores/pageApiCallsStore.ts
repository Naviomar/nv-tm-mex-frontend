/**
 * Registra en vivo cada llamada a la API hecha mientras el usuario está en
 * una ruta dada — alimenta el drawer "Page permissions" para mostrar los
 * permisos que la vista actual REALMENTE ejercita (no solo el permiso "de
 * menú" que controla si aparece en la navegación).
 *
 * Se alimenta desde el único punto por el que pasan todas las llamadas:
 * repository/factory.ts (FetchFactory.call).
 */
interface RecordedApiCall {
  method: string
  url: string
  routePath: string
  ts: number
}

const MAX_CALLS = 500

export const usePageApiCallsStore = defineStore('pageApiCallsStore', () => {
  const calls = ref<RecordedApiCall[]>([])

  const record = (method: string, url: string, routePath: string) => {
    calls.value.push({ method: method.toUpperCase(), url, routePath, ts: Date.now() })
    if (calls.value.length > MAX_CALLS) {
      calls.value.splice(0, calls.value.length - MAX_CALLS)
    }
  }

  const callsForRoute = (routePath: string) => {
    return calls.value.filter((c) => c.routePath === routePath)
  }

  return {
    calls,
    record,
    callsForRoute,
  }
})
