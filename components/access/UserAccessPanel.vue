<template>
  <div class="access-panel">
    <div v-if="loading" class="text-center py-10">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <v-alert v-else-if="loadError" type="error" variant="tonal" density="compact">
      Could not load this user's access. Close and try again.
    </v-alert>

    <template v-else-if="user">
      <!-- Summary -->
      <div class="d-flex flex-wrap align-center gap-2 mb-3">
        <v-chip color="success" variant="tonal" size="small" prepend-icon="mdi-check-decagram">
          {{ summary.effective }} effective
        </v-chip>
        <v-chip color="primary" variant="tonal" size="small" prepend-icon="mdi-shield-account">
          {{ summary.fromRoles }} from roles
        </v-chip>
        <v-chip color="deep-purple" variant="tonal" size="small" prepend-icon="mdi-account-plus-outline">
          {{ summary.extra }} extra
        </v-chip>
        <v-chip :color="summary.revoked ? 'error' : 'grey'" variant="tonal" size="small" prepend-icon="mdi-cancel">
          {{ summary.revoked }} revoked
        </v-chip>
        <v-spacer />
        <span v-if="saving" class="d-flex align-center text-caption text-medium-emphasis">
          <v-progress-circular indeterminate size="14" width="2" class="mr-1" /> Saving...
        </span>
        <span v-else-if="saved" class="d-flex align-center text-caption text-success">
          <v-icon size="14" class="mr-1">mdi-check</v-icon> Saved
        </span>
        <v-btn
          size="x-small"
          variant="text"
          color="primary"
          prepend-icon="mdi-help-circle-outline"
          @click="openDocs"
        >
          How does this work?
        </v-btn>
      </div>

      <!-- Roles -->
      <div class="d-flex flex-wrap align-center gap-2 mb-3">
        <span class="text-caption text-medium-emphasis">Roles:</span>
        <v-chip v-for="role in user.roles" :key="role.id" size="x-small" color="secondary" variant="tonal">
          {{ role.name }}
        </v-chip>
        <span v-if="!user.roles?.length" class="text-caption text-medium-emphasis">None</span>
      </div>

      <v-alert v-if="isSuperAdminTarget" type="info" variant="tonal" density="compact" class="mb-3">
        Super Admin has full access: permissions can't be granted or revoked for this user.
      </v-alert>
      <v-alert v-else-if="isSelf" type="info" variant="tonal" density="compact" class="mb-3">
        This is your own account. You can't revoke your own permissions.
      </v-alert>

      <!-- Search + filters -->
      <v-text-field
        v-model="search"
        prepend-inner-icon="mdi-magnify"
        placeholder="Search permissions by name or description..."
        density="compact"
        variant="outlined"
        hide-details
        clearable
        class="mb-2"
      />
      <v-chip-group v-model="filter" mandatory selected-class="filter-chip--active" class="mb-2">
        <v-chip v-for="f in filters" :key="f.value" :value="f.value" size="small" variant="outlined" filter>
          {{ f.label }}
          <span class="ml-1 text-medium-emphasis">{{ f.count }}</span>
        </v-chip>
      </v-chip-group>

      <div v-if="hiddenByScope > 0" class="text-caption text-medium-emphasis mb-3">
        <v-icon size="14">mdi-lock-outline</v-icon>
        {{ hiddenByScope }} more permission(s) come from this user's roles but are outside what you can manage here.
      </div>

      <div v-if="filteredGroups.length === 0" class="text-center py-8 text-medium-emphasis">
        <v-icon size="40">mdi-key-off</v-icon>
        <div class="mt-2 text-body-2">No permissions match.</div>
      </div>

      <!-- Groups -->
      <PermissionGroupsList v-model="open" :groups="filteredGroups" :row-class="(p) => `access-row--${stateOf(p.id)}`">
        <template #group-stats="{ group }">
          <v-chip size="x-small" variant="tonal" color="primary" class="ml-3">
            {{ groupStats(group).allowed }}/{{ groupStats(group).total }}
          </v-chip>
          <v-chip v-if="groupStats(group).revoked" size="x-small" variant="flat" color="error" class="ml-2">
            {{ groupStats(group).revoked }} revoked
          </v-chip>
          <v-chip v-if="groupStats(group).extra" size="x-small" variant="tonal" color="deep-purple" class="ml-2">
            {{ groupStats(group).extra }} extra
          </v-chip>
        </template>

        <template #main="{ perm }">
          <div class="d-flex align-center flex-wrap gap-2">
            <span class="font-weight-medium text-body-2">{{ perm.humanLabel }}</span>

            <v-tooltip v-if="stateOf(perm.id) === 'inherited'" location="top">
              <template #activator="{ props: tp }">
                <v-chip v-bind="tp" size="x-small" color="primary" variant="tonal" prepend-icon="mdi-shield-account">
                  {{ roleLabel(perm.id) }}
                </v-chip>
              </template>
              Granted by: {{ (rolesByPermission.get(perm.id) ?? []).join(', ') }}
            </v-tooltip>

            <v-chip v-else-if="stateOf(perm.id) === 'extra'" size="x-small" color="deep-purple" variant="tonal" prepend-icon="mdi-account-plus-outline">
              Extra
            </v-chip>

            <v-tooltip v-else-if="isRevoked(perm.id)" location="top">
              <template #activator="{ props: tp }">
                <v-chip
                  v-bind="tp"
                  size="x-small"
                  color="error"
                  :variant="stateOf(perm.id) === 'revoked' ? 'flat' : 'outlined'"
                  prepend-icon="mdi-cancel"
                >
                  {{ stateOf(perm.id) === 'revoked' ? 'Revoked' : 'Revoked · no role grants it now' }}
                </v-chip>
              </template>
              <div>
                <div v-if="stateOf(perm.id) === 'revoked'">
                  The role still grants it, but this user can't use it.
                </div>
                <div v-else>No role grants it right now; it will stay denied if a role gives it again.</div>
                <div v-if="revocationOf(perm.id)?.reason">Reason: {{ revocationOf(perm.id)?.reason }}</div>
                <div v-if="revocationOf(perm.id)?.created_at">Since {{ formatDate(revocationOf(perm.id)?.created_at) }}</div>
              </div>
            </v-tooltip>
          </div>
        </template>

        <template #actions="{ perm }">
          <v-progress-circular v-if="busy.has(perm.id)" indeterminate size="18" width="2" />
          <template v-else>
            <v-btn
              v-if="isRevoked(perm.id) && canEdit && isManageable(perm.id)"
              size="x-small"
              variant="tonal"
              color="primary"
              @click="restore(perm)"
            >
              {{ stateOf(perm.id) === 'revoked' ? 'Undo' : 'Clear' }}
            </v-btn>
            <v-tooltip :disabled="!switchHint(perm.id)" location="left">
              <template #activator="{ props: tp }">
                <span v-bind="tp">
                  <v-switch
                    :model-value="isAllowed(perm.id)"
                    :disabled="!canEdit || !isManageable(perm.id) || (isRevoked(perm.id) && stateOf(perm.id) === 'revoked-dormant')"
                    :color="stateOf(perm.id) === 'extra' ? 'deep-purple' : 'primary'"
                    density="compact"
                    hide-details
                    inset
                    @update:model-value="(v: any) => onToggle(perm, !!v)"
                  />
                </span>
              </template>
              {{ switchHint(perm.id) }}
            </v-tooltip>
          </template>
        </template>
      </PermissionGroupsList>
    </template>

    <!-- Revoke confirmation -->
    <v-dialog v-model="revokeDialog.show" max-width="480" persistent>
      <v-card rounded="lg">
        <v-card-title class="d-flex align-center gap-2 text-error">
          <v-icon color="error">mdi-cancel</v-icon>
          Revoke permission?
        </v-card-title>
        <v-card-text>
          <div class="font-weight-medium">{{ revokeDialog.perm?.humanLabel }}</div>
          <div class="text-caption text-medium-emphasis mb-3">{{ revokeDialog.perm?.description || revokeDialog.perm?.name }}</div>
          <div class="text-body-2 mb-2">
            <strong>{{ user?.name }}</strong> will lose this permission even though
            <strong>{{ (rolesByPermission.get(revokeDialog.perm?.id) ?? []).join(', ') || 'their role' }}</strong>
            grants it. You can undo it at any time.
          </div>
          <div class="text-caption text-medium-emphasis mb-3">
            It applies to this user everywhere in the system, not only in this department.
          </div>
          <v-text-field
            v-model="revokeDialog.reason"
            label="Reason (optional)"
            placeholder="e.g. Moved to another team"
            density="compact"
            variant="outlined"
            hide-details
            maxlength="255"
          />
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer />
          <v-btn variant="text" @click="revokeDialog.show = false">Cancel</v-btn>
          <v-btn color="error" variant="flat" @click="confirmRevoke">Revoke</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { groupPermissions } from '~/utils/permissions/groupPermissions'
import type { PermissionGroup, PermissionNode } from '~/utils/permissions/groupPermissions'

type AccessState = 'inherited' | 'extra' | 'revoked' | 'revoked-dormant' | 'none'

const props = defineProps<{
  userId: number | string
  /** Limits every action to this department's admin scope (backend enforces it too). */
  departmentId?: number | string | null
  /** Permissions the current admin can manage; omit to manage the whole catalog. */
  scopePermissions?: any[] | null
  /**
   * Department mode: ids of the roles linked to the department. A permission the user only
   * gets from a role outside the department can't be revoked/restored from here (the backend
   * enforces the same rule).
   */
  departmentRoleIds?: number[] | null
  readonly?: boolean
}>()

const emit = defineEmits<{
  (e: 'updated', user: any): void
}>()

const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const { user: currentUser } = useCheckUser()
const pageDocs = usePageDocs()

const loading = ref(true)
const loadError = ref(false)
const user = ref<any>(null)
const catalog = ref<any[]>([])

const search = ref<string | null>('')
const filter = ref<'all' | 'inherited' | 'extra' | 'revoked' | 'none'>('all')
const open = ref<string[]>([])

const saving = ref(false)
const saved = ref(false)
const busy = ref(new Set<number>())
let savedTimer: ReturnType<typeof setTimeout> | null = null
let chain: Promise<void> = Promise.resolve()

const revokeDialog = reactive({ show: false, perm: null as PermissionNode | null, reason: '' })

// ── Derived state ────────────────────────────────────────────────

const isSuperAdminTarget = computed(() => (user.value?.roles ?? []).some((r: any) => r.name === 'Super Admin'))
const isSelf = computed(() => String(currentUser.value?.id) === String(props.userId))
const canEdit = computed(() => !props.readonly && !isSuperAdminTarget.value)

// permission id -> names of the roles that grant it
const rolesByPermission = computed(() => {
  const map = new Map<number, string[]>()
  for (const role of user.value?.roles ?? []) {
    for (const p of role.permissions ?? []) {
      map.set(p.id, [...(map.get(p.id) ?? []), role.name])
    }
  }
  return map
})

const roleIdsByPermission = computed(() => {
  const map = new Map<number, number[]>()
  for (const role of user.value?.roles ?? []) {
    for (const p of role.permissions ?? []) {
      map.set(p.id, [...(map.get(p.id) ?? []), role.id])
    }
  }
  return map
})

// In department mode, a permission granted only by roles of OTHER departments is read-only.
function isManageable(id: number): boolean {
  if (!props.departmentId || !props.departmentRoleIds) return true
  const grantingRoles = roleIdsByPermission.value.get(id)
  if (!grantingRoles) return true
  return grantingRoles.some((roleId) => props.departmentRoleIds!.includes(roleId))
}

const directIds = computed(() => new Set<number>((user.value?.permissions ?? []).map((p: any) => p.id)))

const revocations = computed(() => {
  const map = new Map<number, any>()
  for (const r of user.value?.permission_revocations ?? []) map.set(r.permission_id, r)
  return map
})

function stateOf(id: number): AccessState {
  if (revocations.value.has(id)) return rolesByPermission.value.has(id) ? 'revoked' : 'revoked-dormant'
  if (rolesByPermission.value.has(id)) return 'inherited'
  if (directIds.value.has(id)) return 'extra'
  return 'none'
}

const isRevoked = (id: number) => revocations.value.has(id)
const isAllowed = (id: number) => ['inherited', 'extra'].includes(stateOf(id))
const revocationOf = (id: number) => revocations.value.get(id)

function roleLabel(id: number): string {
  const roles = rolesByPermission.value.get(id) ?? []
  return roles.length > 1 ? `${roles[0]} +${roles.length - 1}` : (roles[0] ?? 'Role')
}

function switchHint(id: number): string {
  if (isSuperAdminTarget.value) return ''
  if (!isManageable(id)) return 'Granted by a role outside this department. Change it from System → Users → Permissions'
  const state = stateOf(id)
  if (state === 'inherited' && isSelf.value) return "You can't revoke your own permissions"
  if (state === 'revoked-dormant') return 'Use "Clear" to remove this revocation'
  return ''
}

// Whole-user summary (not limited to what this admin can manage), so it matches the
// numbers shown in the members table.
const summary = computed(() => {
  const roleIds = new Set<number>(rolesByPermission.value.keys())
  const revoked = new Set<number>(revocations.value.keys())
  const fromRoles = [...roleIds].filter((id) => !revoked.has(id)).length
  const extra = [...directIds.value].filter((id) => !roleIds.has(id) && !revoked.has(id)).length
  const revokedActive = [...revoked].filter((id) => roleIds.has(id)).length
  return { fromRoles, extra, revoked: revokedActive, effective: fromRoles + extra }
})

const visiblePerms = computed(() => catalog.value)
const visibleIds = computed(() => new Set<number>(visiblePerms.value.map((p: any) => p.id)))

const hiddenByScope = computed(() => {
  if (!props.scopePermissions) return 0
  let hidden = 0
  rolesByPermission.value.forEach((_, id) => {
    if (!visibleIds.value.has(id) && !revocations.value.has(id)) hidden++
  })
  return hidden
})

const counts = computed(() => {
  const c = { inherited: 0, extra: 0, revoked: 0, none: 0, all: visiblePerms.value.length }
  for (const p of visiblePerms.value) {
    const s = stateOf(p.id)
    if (s === 'inherited') c.inherited++
    else if (s === 'extra') c.extra++
    else if (s === 'none') c.none++
    else c.revoked++
  }
  return c
})

const filters = computed(() => [
  { value: 'all', label: 'All', count: counts.value.all },
  { value: 'inherited', label: 'From roles', count: counts.value.inherited },
  { value: 'extra', label: 'Extra', count: counts.value.extra },
  { value: 'revoked', label: 'Revoked', count: counts.value.revoked },
  { value: 'none', label: 'No access', count: counts.value.none },
])

function matchesFilter(id: number): boolean {
  const s = stateOf(id)
  switch (filter.value) {
    case 'inherited': return s === 'inherited'
    case 'extra': return s === 'extra'
    case 'revoked': return s === 'revoked' || s === 'revoked-dormant'
    case 'none': return s === 'none'
    default: return true
  }
}

const filteredGroups = computed((): PermissionGroup[] => {
  const q = (search.value ?? '').trim().toLowerCase()
  const matching = visiblePerms.value.filter((p: any) => {
    if (!matchesFilter(p.id)) return false
    if (!q) return true
    return (
      p.name.toLowerCase().includes(q) ||
      (p.description ?? '').toLowerCase().includes(q) ||
      p.name.replace(/[-.]/g, ' ').includes(q)
    )
  })
  return groupPermissions(matching)
})

function groupStats(group: PermissionGroup) {
  let total = 0, allowed = 0, revoked = 0, extra = 0
  for (const sub of group.subgroups) {
    for (const p of sub.permissions) {
      total++
      const s = stateOf(p.id)
      if (s === 'inherited' || s === 'extra') allowed++
      if (s === 'extra') extra++
      if (s === 'revoked' || s === 'revoked-dormant') revoked++
    }
  }
  return { total, allowed, revoked, extra }
}

// Auto-open the matching groups when searching/filtering (unless it'd open a wall of rows).
watch([search, filter], () => {
  const active = !!(search.value ?? '').trim() || filter.value !== 'all'
  const labels = filteredGroups.value.map((g) => g.label)
  open.value = active && labels.length <= 12 ? labels : []
})

// ── Actions ──────────────────────────────────────────────────────

function onToggle(perm: PermissionNode, allowed: boolean) {
  if (!canEdit.value || !isManageable(perm.id)) return
  const state = stateOf(perm.id)

  if (allowed) {
    // none -> extra, or undo a revocation
    send({ grant: [perm.id] }, [perm.id])
    return
  }

  if (state === 'extra') {
    send({ clear: [perm.id] }, [perm.id])
  } else if (state === 'inherited') {
    if (isSelf.value) return
    revokeDialog.perm = perm
    revokeDialog.reason = ''
    revokeDialog.show = true
  }
}

function restore(perm: PermissionNode) {
  send(stateOf(perm.id) === 'revoked' ? { grant: [perm.id] } : { clear: [perm.id] }, [perm.id])
}

function confirmRevoke() {
  const perm = revokeDialog.perm
  if (!perm) return
  revokeDialog.show = false
  send({ revoke: [perm.id], reason: revokeDialog.reason.trim() || null }, [perm.id])
}

// Calls run one after another so quick consecutive toggles can't overwrite each other.
function send(body: { grant?: number[]; revoke?: number[]; clear?: number[]; reason?: string | null }, ids: number[]) {
  ids.forEach((id) => busy.value.add(id))
  busy.value = new Set(busy.value)

  chain = chain.then(async () => {
    try {
      saving.value = true
      saved.value = false
      const res: any = await $api.users.updatePermissionOverrides(props.userId, {
        ...body,
        department_id: props.departmentId ?? null,
      })
      user.value = res.user
      emit('updated', res.user)
      if (res.ignored?.length) {
        snackbar.add({ type: 'warning', text: 'Some permissions are outside your scope and were not changed.' })
      }
      saved.value = true
      if (savedTimer) clearTimeout(savedTimer)
      savedTimer = setTimeout(() => (saved.value = false), 2000)
    } catch (e: any) {
      const message = e?.data?.message ?? e?.response?._data?.message ?? 'Error saving permissions'
      snackbar.add({ type: 'error', text: message })
    } finally {
      saving.value = false
      ids.forEach((id) => busy.value.delete(id))
      busy.value = new Set(busy.value)
    }
  })
}

function formatDate(value?: string | null): string {
  if (!value) return ''
  return new Date(value).toLocaleDateString()
}

function openDocs() {
  pageDocs.open('access-control', 'rules')
}

// ── Loading ──────────────────────────────────────────────────────

async function load() {
  loading.value = true
  loadError.value = false
  try {
    const [u, perms] = await Promise.all([
      $api.users.getUserById(String(props.userId)),
      props.scopePermissions ? Promise.resolve(props.scopePermissions) : $api.users.getPermissions(),
    ])
    user.value = u
    catalog.value = (perms as any[]) ?? []
  } catch (e) {
    console.error(e)
    loadError.value = true
  } finally {
    loading.value = false
  }
}

watch(() => [props.userId, props.departmentId], load, { immediate: true })

// A department's scope may finish loading after the panel mounts.
watch(
  () => props.scopePermissions,
  (list) => {
    if (list) catalog.value = list
  }
)
</script>

<style scoped>
.filter-chip--active {
  color: rgb(var(--v-theme-primary));
  border-color: rgb(var(--v-theme-primary));
}
</style>
