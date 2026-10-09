<template>
  <div>
    <v-tabs v-model="tab" color="primary" density="compact" class="border-b">
      <v-tab value="flow" prepend-icon="mdi-sitemap-outline">Cómo funciona</v-tab>
      <v-tab value="rules" prepend-icon="mdi-scale-balance">Reglas</v-tab>
      <v-tab value="example" prepend-icon="mdi-account-search-outline">Ejemplo real</v-tab>
      <v-tab value="glossary" prepend-icon="mdi-key-chain-variant">Glosario de permisos</v-tab>
    </v-tabs>

    <div class="pa-5">
      <v-window v-model="tab">
        <!-- ===== FLOW ===== -->
        <v-window-item value="flow">
          <div class="text-body-2 text-medium-emphasis mb-4">
            El acceso de una persona se calcula con tres piezas: lo que le dan sus
            <strong>roles</strong>, lo que se le agrega como <strong>extra</strong> y lo que se le
            <strong>revoca</strong>. Lo revocado siempre se resta al final.
          </div>

          <div class="lane mb-4">
            <div class="d-flex align-center gap-2 mb-3">
              <v-chip color="secondary" size="small" variant="flat" prepend-icon="mdi-domain">Departamento</v-chip>
              <span class="text-caption text-medium-emphasis">Define hasta dónde puede dar acceso quien lo administra</span>
            </div>
            <div class="diagram-row">
              <FlowCard icon="mdi-domain" color="secondary" title="Departamento" subtitle="p. ej. Maritime Import" />
              <FlowArrow label="tiene" />
              <FlowCard icon="mdi-shield-crown" color="secondary" title="Roles Admin" subtitle="vinculados al depto" />
              <FlowArrow label="fijan el límite" />
              <FlowCard icon="mdi-key-variant" color="secondary" title="Scope" subtitle="lo que se puede otorgar" highlight />
            </div>
          </div>

          <div class="lane mb-4">
            <div class="d-flex align-center gap-2 mb-3">
              <v-chip color="primary" size="small" variant="flat" prepend-icon="mdi-account">Usuario</v-chip>
              <span class="text-caption text-medium-emphasis">De dónde sale lo que realmente puede hacer</span>
            </div>
            <div class="diagram-row">
              <FlowCard icon="mdi-shield-account" color="primary" title="Roles" subtitle="uno o varios, se suman" small />
              <FlowArrow label="+" />
              <FlowCard icon="mdi-account-plus-outline" color="deep-purple" title="Extras" subtitle="permisos directos" small />
              <FlowArrow label="−" />
              <FlowCard icon="mdi-cancel" color="error" title="Revocados" subtitle="siempre ganan" small />
              <FlowArrow label="=" />
              <FlowCard icon="mdi-check-decagram" color="success" title="Efectivos" subtitle="lo que puede hacer" highlight />
            </div>
          </div>

          <div class="text-subtitle-2 font-weight-bold mb-2">Los 4 estados de un permiso</div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div v-for="state in states" :key="state.title" class="screen-card">
              <v-icon :color="state.color" size="22">{{ state.icon }}</v-icon>
              <div>
                <div class="font-bold text-sm">{{ state.title }}</div>
                <div class="text-caption text-medium-emphasis">{{ state.text }}</div>
              </div>
            </div>
          </div>

          <v-alert type="info" variant="tonal" density="compact" class="mt-4">
            Dónde se cambia: <strong>Departamento → Members → columna Permissions</strong> (o Usuarios → botón de llave). Cada permiso tiene un
            interruptor; los cambios se guardan solos y quedan en la auditoría.
          </v-alert>
        </v-window-item>

        <!-- ===== RULES ===== -->
        <v-window-item value="rules">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div v-for="rule in rules" :key="rule.title" class="rule-card">
              <div class="rule-card__head">
                <v-icon :color="rule.color">{{ rule.icon }}</v-icon>
                <span>{{ rule.title }}</span>
              </div>
              <div class="text-body-2 text-medium-emphasis">{{ rule.text }}</div>
            </div>
          </div>
        </v-window-item>

        <!-- ===== EXAMPLE ===== -->
        <v-window-item value="example">
          <div class="text-body-2 text-medium-emphasis mb-3">
            Elige a una persona para ver de dónde vienen sus permisos. Es solo lectura.
          </div>
          <v-autocomplete
            v-model="selectedUserId"
            :items="users"
            :loading="loadingUsers"
            item-title="email"
            item-value="id"
            label="Buscar usuario por correo o nombre"
            density="compact"
            variant="outlined"
            hide-details
            clearable
            class="mb-4"
            @focus="loadUsers"
          >
            <template #item="{ props: aProps, item }">
              <v-list-item v-bind="aProps">
                <v-list-item-subtitle>{{ item.raw.name }}</v-list-item-subtitle>
              </v-list-item>
            </template>
          </v-autocomplete>

          <div v-if="loadingExample" class="text-center py-6"><v-progress-circular indeterminate /></div>
          <v-alert v-else-if="exampleError" type="warning" variant="tonal" density="compact">
            No se pudo cargar este usuario (puede que no tengas permiso para verlo).
          </v-alert>
          <div v-else-if="example" class="example-panel pa-4 rounded-lg">
            <div class="text-subtitle-2 font-weight-bold mb-3">
              {{ example.name }} tiene {{ example.effective }} permiso(s) efectivos:
            </div>

            <div class="mb-3">
              <div v-for="role in example.roles" :key="role.id" class="d-flex align-center gap-2 mb-1">
                <v-icon size="16" color="primary">mdi-shield-account</v-icon>
                <span class="text-body-2">Rol <strong>{{ role.name }}</strong> aporta</span>
                <v-chip size="x-small" color="primary" variant="tonal">{{ role.permissions?.length ?? 0 }}</v-chip>
              </div>
              <div v-if="!example.roles.length" class="text-caption text-medium-emphasis">Sin roles.</div>
            </div>

            <div class="d-flex align-center gap-2 mb-1">
              <v-icon size="16" color="deep-purple">mdi-account-plus-outline</v-icon>
              <span class="text-body-2">Extras (directos, que ningún rol da)</span>
              <v-chip size="x-small" color="deep-purple" variant="tonal">{{ example.extras }}</v-chip>
            </div>

            <div class="d-flex align-center gap-2 mb-2">
              <v-icon size="16" color="error">mdi-cancel</v-icon>
              <span class="text-body-2">Revocados</span>
              <v-chip size="x-small" :color="example.revoked.length ? 'error' : 'grey'" variant="tonal">
                {{ example.revoked.length }}
              </v-chip>
            </div>
            <div class="d-flex flex-wrap gap-1">
              <v-chip v-for="r in example.revoked" :key="r.permission_id" size="x-small" color="error" variant="outlined">
                {{ permissionName(r.permission_id) }}
                <span v-if="r.reason" class="ml-1 text-medium-emphasis">· {{ r.reason }}</span>
              </v-chip>
            </div>
          </div>
        </v-window-item>

        <!-- ===== GLOSSARY ===== -->
        <v-window-item value="glossary">
          <div class="text-body-2 text-medium-emphasis mb-3">Qué permite cada permiso del sistema.</div>
          <div v-if="loadingGlossary" class="text-center py-6"><v-progress-circular indeterminate /></div>
          <RolePermissionsPanel v-else :permissions="catalog" guide />
        </v-window-item>
      </v-window>
    </div>
  </div>
</template>

<script setup lang="ts">
const { $api } = useNuxtApp()
const pageDocs = usePageDocs()

const tab = ref('flow')

// "How does this work?" links elsewhere open this guide on a given tab.
watch(
  () => pageDocs.request.value,
  (req) => {
    if (req?.id !== 'access-control') return
    tab.value = req.tab ?? 'flow'
    // Consumed: a later open from the footer button should start on the first tab.
    pageDocs.request.value = null
  },
  { immediate: true }
)

const states = [
  { icon: 'mdi-shield-account', color: 'primary', title: 'Heredado', text: 'Lo da uno de sus roles. Se puede revocar apagando el interruptor.' },
  { icon: 'mdi-account-plus-outline', color: 'deep-purple', title: 'Extra', text: 'Se le dio directamente, sin rol. Apagarlo lo quita.' },
  { icon: 'mdi-cancel', color: 'error', title: 'Revocado', text: 'Un rol lo da, pero a esta persona se le quitó. Se deshace con «Undo».' },
  { icon: 'mdi-minus-circle-outline', color: 'grey', title: 'Sin acceso', text: 'Nadie se lo da. Encender el interruptor lo agrega como extra.' },
]

const rules = [
  { icon: 'mdi-gavel', color: 'error', title: 'La revocación siempre gana', text: 'Aunque un rol lo otorgue —o se le haya dado como extra— un permiso revocado no se puede usar. Para devolverlo basta quitar la revocación («Undo»).' },
  { icon: 'mdi-layers-plus', color: 'primary', title: 'Varios roles se suman', text: 'Si una persona tiene varios roles, tiene la unión de sus permisos. Revocar un permiso lo quita aunque lo den dos roles distintos.' },
  { icon: 'mdi-shield-crown-outline', color: 'amber-darken-2', title: 'Límites de quien administra', text: 'El administrador de un departamento solo puede conceder o revocar permisos dentro del scope de ese departamento y solo a sus miembros.' },
  { icon: 'mdi-account-lock-outline', color: 'secondary', title: 'Casos que no se pueden', text: 'Super Admin tiene acceso total y no se puede limitar. Nadie puede revocarse permisos a sí mismo.' },
  { icon: 'mdi-history', color: 'warning', title: 'Si el rol deja de darlo', text: 'La revocación queda guardada como «sin efecto». Si el rol vuelve a darlo, la persona sigue sin él. Se limpia con «Clear».' },
  { icon: 'mdi-menu', color: 'info', title: 'Revocar un permiso de menú', text: 'Solo oculta el enlace del menú. Para impedir el uso real hay que revocar también los permisos de API que usa la página (los ves en el botón «Page permissions» del pie).' },
  { icon: 'mdi-content-save-check-outline', color: 'success', title: 'Se guarda solo y se audita', text: 'Cada cambio se guarda al instante y registra quién lo hizo, qué cambió y el motivo (si lo escribió al revocar).' },
  { icon: 'mdi-account-multiple-minus-outline', color: 'grey', title: 'Quitar un rol no es revocar', text: 'Quitar un rol elimina todo lo que daba. Revocar es la excepción para un solo permiso, sin tocar el resto del rol.' },
]

// ── Example ──────────────────────────────────────────────────────
const users = ref<any[]>([])
const loadingUsers = ref(false)
const selectedUserId = ref<number | null>(null)
const loadingExample = ref(false)
const exampleError = ref(false)
const example = ref<any>(null)

async function loadUsers() {
  if (users.value.length || loadingUsers.value) return
  loadingUsers.value = true
  try {
    users.value = ((await $api.users.getAllUsers()) as any[]) ?? []
  } catch (e) {
    console.error(e)
  } finally {
    loadingUsers.value = false
  }
}

watch(selectedUserId, async (id) => {
  example.value = null
  exampleError.value = false
  if (!id) return
  loadingExample.value = true
  try {
    const u = (await $api.users.getUserById(String(id))) as any
    const roleIds = new Set<number>((u.roles ?? []).flatMap((r: any) => (r.permissions ?? []).map((p: any) => p.id)))
    const direct = (u.permissions ?? []).map((p: any) => p.id)
    const revoked = u.permission_revocations ?? []
    const all = new Set<number>([...roleIds, ...direct])
    revoked.forEach((r: any) => all.delete(r.permission_id))
    example.value = {
      name: u.name,
      roles: u.roles ?? [],
      extras: direct.filter((pid: number) => !roleIds.has(pid)).length,
      revoked,
      effective: all.size,
    }
    await loadCatalog()
  } catch (e) {
    console.error(e)
    exampleError.value = true
  } finally {
    loadingExample.value = false
  }
})

// ── Glossary / permission names ──────────────────────────────────
const catalog = ref<any[]>([])
const loadingGlossary = ref(false)

async function loadCatalog() {
  if (catalog.value.length) return
  catalog.value = ((await $api.users.getPermissions()) as any[]) ?? []
}

const permissionName = (id: number) => catalog.value.find((p: any) => p.id === id)?.name ?? `#${id}`

watch(tab, async (t) => {
  if (t !== 'glossary' || catalog.value.length) return
  loadingGlossary.value = true
  try {
    await loadCatalog()
  } catch (e) {
    console.error(e)
  } finally {
    loadingGlossary.value = false
  }
})
</script>

<style scoped>
.lane {
  background: rgba(var(--v-theme-on-surface), 0.02);
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  border-radius: 12px;
  padding: 14px 16px;
  overflow-x: auto;
}
.diagram-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.screen-card {
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.1);
  border-radius: 10px;
  padding: 10px 12px;
}
.rule-card {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.1);
  border-radius: 12px;
  padding: 14px 16px;
}
.rule-card__head {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  margin-bottom: 8px;
}
.example-panel {
  background: rgba(var(--v-theme-on-surface), 0.02);
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}
</style>
