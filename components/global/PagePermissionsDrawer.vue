<template>
  <div>
    <v-badge
      v-if="grantedPermissions.length"
      :content="grantedPermissions.length"
      color="deep-purple"
      overlap
      offset-x="8"
      offset-y="8"
    >
      <v-btn
        size="small"
        color="deep-purple"
        variant="tonal"
        icon="mdi-key-outline"
        title="Page permissions"
        @click="open"
      />
    </v-badge>
    <v-btn
      v-else
      size="small"
      color="deep-purple"
      variant="tonal"
      icon="mdi-key-outline"
      title="Page permissions"
      @click="open"
    />

    <Transition name="pp-slide">
      <div v-if="show" class="pp-scrim" @click.self="show = false">
        <div class="pp-panel">
          <div class="d-flex align-center justify-space-between px-4 py-3 bg-deep-purple">
            <div class="d-flex align-center gap-2 text-white">
              <v-icon color="white">mdi-key-outline</v-icon>
              <div>
                <div class="text-subtitle-2 font-weight-bold">Permissions controlling this view</div>
                <div class="text-caption" style="opacity: 0.85">{{ route.path }}</div>
              </div>
            </div>
            <v-btn icon size="small" variant="text" color="white" @click="show = false">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>

          <div class="pa-4 overflow-y-auto" style="max-height: 320px">
            <div v-if="grantedPermissions.length === 0" class="text-center text-grey-darken-1 py-6">
              <v-icon size="32" color="grey-lighten-1">mdi-key-off-outline</v-icon>
              <div class="mt-2 text-body-2">
                {{ pageHasKnownPermissions
                  ? "You don't have any of the permissions registered for this view."
                  : 'No permission info registered for this view yet.' }}
              </div>
            </div>

            <v-expansion-panels v-else variant="accordion">
              <v-expansion-panel v-for="perm in grantedPermissions" :key="perm.name">
                <v-expansion-panel-title>
                  <div class="d-flex align-center justify-space-between" style="width: 100%">
                    <span class="text-body-2 font-weight-medium">{{ perm.name }}</span>
                    <v-chip
                      size="x-small"
                      variant="tonal"
                      :color="perm.source === 'api' ? 'green' : 'blue-grey'"
                      class="mr-2"
                    >
                      {{ perm.source === 'api' ? 'used by this page' : 'menu only' }}
                    </v-chip>
                  </div>
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <div class="text-body-2 mb-3">
                    {{ perm.description || 'Sin descripción todavía.' }}
                  </div>
                  <div v-if="routesFor(perm.name).length" class="d-flex flex-column gap-1">
                    <div
                      v-for="(r, idx) in routesFor(perm.name)"
                      :key="idx"
                      class="d-flex align-center gap-2"
                    >
                      <v-chip size="x-small" :color="methodColor(r.method)" variant="flat" class="text-white" style="min-width: 52px; justify-content: center">
                        {{ r.method }}
                      </v-chip>
                      <code class="text-caption">{{ r.uri }}</code>
                    </div>
                  </div>
                  <div v-else class="text-caption text-grey-darken-1">
                    No API routes require this permission directly.
                  </div>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { getPagePermissions } from '~/utils/data/pagePermissions'
import { compileRoutePatterns, permissionsForCall, type PermissionsRoutesMap } from '~/utils/data/permissionsRoutesMatch'

const { $api } = useNuxtApp()
const { user, hasPermission } = useCheckUser()
const route = useRoute()
const pageApiCallsStore = usePageApiCallsStore()

const show = ref(false)
const routesMap = ref<PermissionsRoutesMap>({})
const routesMapLoaded = ref(false)

// Catálogo completo de permisos (nombre -> descripción). No basta con los
// permisos del usuario autenticado (user.permissions/roles.permissions):
// Super Admin puede no tener filas propias en role_has_permissions (accede
// por bypass de rol, no por asignación real) y aun así debe ver la
// descripción de cualquier permiso que le corresponda mostrar aquí.
const permissionsCatalog = ref<{ name: string; description: string | null }[]>([])
const catalogLoaded = ref(false)

const routePatterns = computed(() => compileRoutePatterns(routesMap.value))

const catalogByName = computed(() => {
  const map = new Map<string, { name: string; description: string | null }>()
  for (const p of permissionsCatalog.value) map.set(p.name, p)
  return map
})

async function loadRoutesMap() {
  if (routesMapLoaded.value) return
  try {
    routesMap.value = (await $api.users.getPermissionsRoutesMap()) as any
    routesMapLoaded.value = true
  } catch (e) {
    console.error(e)
  }
}

async function loadPermissionsCatalog() {
  if (catalogLoaded.value) return
  try {
    permissionsCatalog.value = (await $api.users.getPermissions()) as any
    catalogLoaded.value = true
  } catch (e) {
    console.error(e)
  }
}

// Permisos que la vista REALMENTE ejercita, observados de las llamadas al
// API que se hicieron mientras se está en esta ruta (no solo el permiso
// "de menú" que controla si aparece en la navegación).
const observedPermissions = computed(() => {
  if (!routesMapLoaded.value) return [] as string[]
  const calls = pageApiCallsStore.callsForRoute(route.path)
  const names = new Set<string>()
  for (const call of calls) {
    for (const name of permissionsForCall(routePatterns.value, call.method, call.url)) {
      names.add(name)
    }
  }
  return [...names]
})

function open() {
  show.value = true
  loadRoutesMap()
  loadPermissionsCatalog()
}

function routesFor(permissionName: string) {
  return routesMap.value[permissionName] ?? []
}

function methodColor(method: string) {
  switch (method) {
    case 'GET': return 'blue'
    case 'POST': return 'green'
    case 'PUT': case 'PATCH': return 'orange'
    case 'DELETE': return 'red'
    default: return 'grey'
  }
}

// Cierra con Escape, mismo comportamiento esperado de un panel flotante.
function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') show.value = false
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
})

// Fallback rápido mientras el catálogo completo no se ha pedido todavía
// (antes del primer open()): permisos del propio usuario autenticado, ya
// precargados, sin llamada extra. Cubre el caso normal (usuario con
// asignación real); el catálogo completo (loadPermissionsCatalog) es la
// fuente confiable para Super Admin, que puede no tener filas propias.
const myPermissionsByName = computed(() => {
  const map = new Map<string, { name: string; description: string | null }>()
  for (const p of (user.value as any)?.permissions ?? []) map.set(p.name, p)
  for (const role of (user.value as any)?.roles ?? []) {
    for (const p of role.permissions ?? []) map.set(p.name, p)
  }
  return map
})

const menuPermissionNames = computed(() => getPagePermissions(route.path))

const pageHasKnownPermissions = computed(
  () => menuPermissionNames.value.length > 0 || observedPermissions.value.length > 0
)

// Unión de: el permiso "de menú" (controla si la vista aparece en la
// navegación) + los permisos observados en llamadas reales al API hechas
// desde esta vista (create/edit/delete/etc. que el menú no captura) —
// filtrado con hasPermission(), que ya resuelve correctamente los dos
// casos: Super Admin ve todos los que apliquen a esta vista (bypass de
// rol), cualquier otro usuario (incluido Admin) solo los que tenga
// asignados por rol o directos.
const grantedPermissions = computed(() => {
  const menuSet = new Set(menuPermissionNames.value)
  const allNames = new Set([...menuPermissionNames.value, ...observedPermissions.value])

  return [...allNames]
    .filter((name) => hasPermission(name))
    .map((name) => ({
      ...(catalogByName.value.get(name) ?? myPermissionsByName.value.get(name) ?? { name, description: null }),
      source: menuSet.has(name) ? 'menu' : 'api',
    }))
})
</script>

<style scoped>
.pp-scrim {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.32);
  z-index: 3000;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.pp-panel {
  position: relative;
  width: 100%;
  max-width: 720px;
  margin: 0 16px 16px;
  background: rgb(var(--v-theme-surface));
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.25);
}

.pp-panel > div:first-child {
  border-radius: 16px 16px 0 0;
}

.pp-slide-enter-active,
.pp-slide-leave-active {
  transition: opacity 0.25s ease;
}

.pp-slide-enter-from,
.pp-slide-leave-to {
  opacity: 0;
}

.pp-slide-enter-active .pp-panel,
.pp-slide-leave-active .pp-panel {
  transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}

.pp-slide-enter-from .pp-panel,
.pp-slide-leave-to .pp-panel {
  transform: translateY(24px);
}
</style>
