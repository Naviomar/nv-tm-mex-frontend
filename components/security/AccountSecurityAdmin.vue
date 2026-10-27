<template>
  <div>
    <!-- Resumen -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
      <v-card v-for="card in cards" :key="card.label" elevation="0" class="tm-border pa-3">
        <div class="d-flex align-center">
          <v-icon :color="card.color" class="mr-2">{{ card.icon }}</v-icon>
          <span class="text-caption text-medium-emphasis">{{ card.label }}</span>
        </div>
        <div class="text-h5 font-weight-bold mt-1">{{ card.value }}</div>
        <div v-if="card.hint" class="text-caption text-medium-emphasis">{{ card.hint }}</div>
      </v-card>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
      <!-- Cambio de contraseña obligatorio -->
      <v-card elevation="0" class="tm-border">
        <v-card-title class="d-flex align-center">
          <v-icon color="warning" class="mr-2">mdi-lock-reset</v-icon>Force password change
        </v-card-title>
        <v-card-text>
          <SecurityTargetPicker v-model="passwordTarget" :catalogs="catalogs" @preview="(p: any) => (passwordPreview = p)" />
          <v-text-field v-model="passwordReason" label="Reason (optional)" density="comfortable" variant="outlined" class="mt-3" hide-details />
          <div class="d-flex flex-wrap ga-2 mt-3">
            <v-btn color="warning" prepend-icon="mdi-lock-reset" :disabled="!passwordPreview?.count" @click="askConfirm('password', true)">
              Require password change
            </v-btn>
            <v-btn variant="text" :disabled="!passwordPreview?.count" @click="askConfirm('password', false)">Cancel pending change</v-btn>
          </div>
        </v-card-text>
      </v-card>

      <!-- Doble factor -->
      <v-card elevation="0" class="tm-border">
        <v-card-title class="d-flex align-center">
          <v-icon color="primary" class="mr-2">mdi-shield-key-outline</v-icon>Two-factor authentication
        </v-card-title>
        <v-card-text>
          <SecurityTargetPicker v-model="twoFactorTarget" :catalogs="catalogs" @preview="(p: any) => (twoFactorPreview = p)" />
          <v-text-field v-model="twoFactorReason" label="Reason (optional)" density="comfortable" variant="outlined" class="mt-3" hide-details />
          <div class="d-flex flex-wrap ga-2 mt-3">
            <v-btn color="primary" prepend-icon="mdi-shield-key-outline" :disabled="!twoFactorPreview?.count" @click="askConfirm('two_factor', true)">
              Require 2FA
            </v-btn>
            <v-btn variant="text" :disabled="!twoFactorPreview?.count" @click="askConfirm('two_factor', false)">Stop requiring</v-btn>
          </div>
        </v-card-text>
      </v-card>
    </div>

    <!-- Bitácoras -->
    <v-card elevation="0" class="tm-border">
      <v-tabs v-model="tab" density="compact">
        <v-tab value="events">Sign-in activity</v-tab>
        <v-tab value="actions">Admin actions</v-tab>
      </v-tabs>
      <v-divider />
      <v-card-text>
        <v-window v-model="tab">
          <v-window-item value="events">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
              <v-text-field v-model="eventFilters.search" label="Name, email or IP" density="compact" variant="outlined" hide-details clearable @keyup.enter="loadEvents(1)" />
              <v-select
                v-model="eventFilters.events"
                :items="eventOptions"
                label="Events"
                multiple
                chips
                closable-chips
                density="compact"
                variant="outlined"
                hide-details
              />
              <div class="d-flex align-center">
                <v-btn color="primary" size="small" @click="loadEvents(1)">Search</v-btn>
              </div>
            </div>
            <LoginEventsTable :rows="events.data" :page="events.page" :total="events.total" :per-page="events.per_page" show-user @page="loadEvents" />
          </v-window-item>

          <v-window-item value="actions">
            <v-table density="compact">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Action</th>
                  <th>By</th>
                  <th>Detail</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                <tr v-for="a in actions.data" :key="a.id">
                  <td class="whitespace-nowrap">{{ formatDateString(a.created_at) }}</td>
                  <td>
                    <v-chip :color="actionMeta(a.action).color" size="small" variant="tonal">
                      <v-icon start size="14">{{ actionMeta(a.action).icon }}</v-icon>{{ actionMeta(a.action).label }}
                    </v-chip>
                  </td>
                  <td>{{ a.actor_name || '—' }}</td>
                  <td class="text-body-2">
                    {{ describeAction(a) }}
                    <div v-if="a.reason" class="text-caption text-medium-emphasis">“{{ a.reason }}”</div>
                    <v-chip v-if="a.summary?.undone_at" size="x-small" color="grey" class="mt-1">Undone {{ formatDateString(a.summary.undone_at) }}</v-chip>
                  </td>
                  <td class="text-right">
                    <v-btn
                      v-if="a.action === 'remove_notifications' && !a.summary?.undone_at && hasPermission(SECURITY_PERMISSIONS.removeNotifications)"
                      size="small"
                      variant="outlined"
                      prepend-icon="mdi-undo"
                      @click="undo(a)"
                    >
                      Undo
                    </v-btn>
                  </td>
                </tr>
                <tr v-if="!actions.data.length">
                  <td colspan="5" class="text-center text-medium-emphasis py-4">No admin actions yet</td>
                </tr>
              </tbody>
            </v-table>
            <v-pagination
              v-if="actions.total > actions.per_page"
              v-model="actions.page"
              :length="Math.ceil(actions.total / actions.per_page)"
              density="compact"
              rounded="circle"
              @update:model-value="loadActions"
            />
          </v-window-item>
        </v-window>
      </v-card-text>
    </v-card>

    <!-- Confirmación -->
    <v-dialog v-model="confirm.show" max-width="520">
      <v-card>
        <v-card-title>{{ confirm.title }}</v-card-title>
        <v-card-text>
          <p class="mb-2">{{ confirm.text }}</p>
          <v-alert v-if="confirm.includesMe && confirm.active" type="warning" variant="tonal" density="compact">
            Includes you.
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="confirm.show = false">Cancel</v-btn>
          <v-btn :color="confirm.active ? 'warning' : 'primary'" :loading="saving" @click="apply">Confirm</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import type { SecurityTarget } from '~/repository/modules/accountSecurity'
import { loginEventMeta, securityActionMeta } from '~/utils/security/loginEvents'
import { SECURITY_PERMISSIONS } from '~/utils/security/permissions'

const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const { hasPermission } = useCheckUser()
const { refreshIdentity } = useSanctumAuth()

const tab = ref('events')
const catalogs = ref({ departments: [] as any[], roles: [] as any[], users: [] as any[] })
const overview = ref<any>(null)

const passwordTarget = ref<SecurityTarget>({ scope: 'all', department_ids: [], role_ids: [], user_ids: [], include_inactive: false })
const passwordPreview = ref<any>(null)
const passwordReason = ref('')
const twoFactorTarget = ref<SecurityTarget>({ scope: 'roles', department_ids: [], role_ids: [], user_ids: [], include_inactive: false })
const twoFactorPreview = ref<any>(null)
const twoFactorReason = ref('')

const events = ref<any>({ data: [], page: 1, total: 0, per_page: 25 })
const eventFilters = reactive({ search: '', events: [] as string[] })
const eventOptions = Object.entries(loginEventMeta).map(([value, m]) => ({ value, title: m.label }))
const actions = ref<any>({ data: [], page: 1, total: 0, per_page: 25 })

const confirm = reactive({ show: false, kind: '' as 'password' | 'two_factor' | '', active: true, title: '', text: '', includesMe: false })
const saving = ref(false)

const cards = computed(() => {
  const o = overview.value
  if (!o) return []
  return [
    { label: 'Active users', value: o.active_users, icon: 'mdi-account-group', color: 'primary' },
    { label: 'Pending password change', value: o.must_change_password, icon: 'mdi-lock-reset', color: 'warning' },
    { label: 'Using 2FA', value: o.two_factor_enabled, icon: 'mdi-shield-check', color: 'success', hint: o.two_factor_pending ? `${o.two_factor_pending} required but not set up` : '' },
    { label: 'Failed sign-ins (24h)', value: o.last_24h.failed, icon: 'mdi-alert-circle-outline', color: 'error', hint: o.last_24h.locked ? `${o.last_24h.locked} lockout(s)` : `${o.last_24h.logins} sign-ins` },
  ]
})

const actionMeta = (action: string) => securityActionMeta[action] ?? { label: action, color: 'grey', icon: 'mdi-information-outline' }

function describeAction(a: any): string {
  const s = a.summary || {}
  const scope = a.scope?.scope
  const scopeText = scope === 'all' ? 'all users' : scope ? `by ${scope}` : ''
  switch (a.action) {
    case 'force_password_change':
    case 'cancel_password_change':
    case 'require_two_factor':
    case 'release_two_factor':
      return `${s.affected ?? 0} user(s) ${scopeText}`
    case 'remove_notifications':
      return `${a.target_user_name ?? 'user'}: ${s.removed ?? 0} item(s) removed`
    case 'clone_user': {
      const total = Object.values(s.added || {}).reduce((acc: number, n: any) => acc + Number(n || 0), 0)
      return `${a.source_user_name ?? '?'} → ${a.target_user_name ?? '?'}: ${total} item(s) added`
    }
    default:
      return a.target_user_name ?? ''
  }
}

function askConfirm(kind: 'password' | 'two_factor', active: boolean) {
  const preview = kind === 'password' ? passwordPreview.value : twoFactorPreview.value
  confirm.kind = kind
  confirm.active = active
  confirm.includesMe = !!preview?.includes_me
  if (kind === 'password') {
    confirm.title = active ? 'Require a password change?' : 'Cancel the pending password change?'
    confirm.text = active
      ? `${preview.count} user(s), effective immediately.`
      : `${preview.count} user(s).`
  } else {
    confirm.title = active ? 'Require two-factor authentication?' : 'Stop requiring two-factor authentication?'
    confirm.text = active
      ? `${preview.count} user(s).`
      : `${preview.count} user(s).`
  }
  confirm.show = true
}

async function apply() {
  saving.value = true
  try {
    let res: any
    if (confirm.kind === 'password') {
      res = await $api.accountSecurity.forcePasswordChange({ ...passwordTarget.value, active: confirm.active, reason: passwordReason.value || null })
    } else {
      res = await $api.accountSecurity.requireTwoFactor({ ...twoFactorTarget.value, required: confirm.active, reason: twoFactorReason.value || null })
    }
    snackbar.add({ type: 'success', text: `Applied to ${res?.affected ?? 0} user(s)` })
    confirm.show = false
    if (confirm.includesMe && confirm.active) {
      // El propio administrador quedó incluido: se recarga su identidad y el middleware lo lleva a resolverlo.
      await refreshIdentity()
      return navigateTo('/system/auth/security-required')
    }
    passwordPreview.value = null
    twoFactorPreview.value = null
    await Promise.all([loadOverview(), loadActions(1)])
  } finally {
    saving.value = false
  }
}

async function undo(a: any) {
  const res: any = await $api.accountSecurity.undoAction(a.id)
  snackbar.add({ type: 'success', text: `Restored ${res?.restored ?? 0} item(s)` })
  await loadActions(actions.value.page)
}

async function loadOverview() {
  overview.value = await $api.accountSecurity.overview()
}

async function loadEvents(page = 1) {
  events.value = await $api.accountSecurity.loginEvents({
    page,
    search: eventFilters.search || undefined,
    'events[]': eventFilters.events.length ? eventFilters.events : undefined,
  })
}

async function loadActions(page = 1) {
  actions.value = await $api.accountSecurity.actions({ page })
}

onMounted(async () => {
  const [cat] = await Promise.all([$api.accountSecurity.catalogs(), loadOverview(), loadEvents(1), loadActions(1)])
  catalogs.value = cat as any
})
</script>
