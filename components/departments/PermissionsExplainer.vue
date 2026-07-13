<template>
  <div>
    <!-- ====== STATIC DIAGRAM: how it all connects ====== -->
    <div class="text-body-2 text-grey-darken-1 mb-5">
      Dos formas en que un usuario puede tener un permiso, y de dónde sale
      la lista de permisos que tú puedes asignar como admin de este
      departamento.
    </div>

    <div class="diagram-flow mb-6">
      <!-- Row 1: department scope -->
      <div class="diagram-row">
        <FlowCard icon="mdi-domain" color="secondary" title="Departamento" subtitle="Este departamento" />
        <FlowArrow label="tiene" />
        <FlowCard icon="mdi-shield-crown" color="secondary" title="Roles Admin" subtitle="vinculados al depto" />
        <FlowArrow label="definen" />
        <FlowCard icon="mdi-key-variant" color="secondary" title='"Scope"' subtitle="lo que TÚ puedes otorgar" highlight />
      </div>

      <v-divider class="my-4" />

      <!-- Row 2: user's effective permissions -->
      <div class="diagram-row">
        <FlowCard icon="mdi-account" color="primary" title="Usuario" subtitle="un subordinado tuyo" />
        <div class="diagram-branch">
          <div class="diagram-branch-line">
            <FlowArrow label="tiene 1 o más" />
            <FlowCard icon="mdi-shield-account" color="primary" title="Roles" subtitle="asignados al usuario" small />
            <FlowArrow label="otorgan" />
            <FlowCard icon="mdi-key" color="grey" title="Permisos vía rol" subtitle="indirectos" small />
          </div>
          <div class="diagram-branch-line">
            <FlowArrow label="puede tener" />
            <FlowCard icon="mdi-account-key" color="primary" title="Permisos directos" subtitle="asignados a él, sin rol" small />
          </div>
        </div>
        <FlowArrow label="suma =" />
        <FlowCard icon="mdi-check-decagram" color="success" title="Permisos efectivos" subtitle="lo que el usuario puede hacer" highlight />
      </div>
    </div>

    <v-alert type="info" variant="tonal" density="compact" class="mb-6">
      Un permiso "vía rol" y uno "directo" nunca deberían ser el mismo — si
      lo son, es un duplicado sin sentido (el sistema ya evita que esto
      pase al asignar permisos nuevos).
    </v-alert>

    <!-- ====== INTERACTIVE: pick a real member ====== -->
    <v-divider class="mb-5" />
    <div class="d-flex align-center gap-2 mb-3">
      <v-icon color="primary">mdi-magnify</v-icon>
      <span class="text-subtitle-1 font-weight-bold">Ver un ejemplo real</span>
    </div>
    <v-autocomplete
      v-model="selectedUserId"
      :items="props.linkedUsers"
      item-title="email"
      item-value="id"
      label="Elige un miembro de este departamento"
      density="compact"
      variant="outlined"
      hide-details
      clearable
      class="mb-4"
    >
      <template #item="{ props: aProps, item }">
        <v-list-item v-bind="aProps">
          <v-list-item-subtitle>{{ item.raw.name }}</v-list-item-subtitle>
        </v-list-item>
      </template>
    </v-autocomplete>

    <div v-if="selectedUser" class="example-panel pa-4 rounded-lg">
      <div class="text-subtitle-2 font-weight-bold mb-3">
        {{ selectedUser.name }} tiene {{ effectivePermissionIds.length }} permiso(s) en total:
      </div>

      <div v-if="selectedUser.roles?.length" class="mb-4">
        <div v-for="role in selectedUser.roles" :key="role.id" class="mb-2">
          <div class="d-flex align-center gap-2">
            <v-icon size="16" color="secondary">mdi-shield-account</v-icon>
            <span class="text-body-2">Por el rol <strong>{{ role.name }}</strong>:</span>
            <v-chip size="x-small" color="secondary" variant="tonal">{{ role.permissions?.length ?? 0 }}</v-chip>
          </div>
        </div>
      </div>
      <div v-else class="text-caption text-grey-darken-1 mb-4">No tiene roles asignados.</div>

      <div class="d-flex align-center gap-2 mb-1">
        <v-icon size="16" color="primary">mdi-account-key</v-icon>
        <span class="text-body-2">Permisos directos (sin rol):</span>
        <v-chip size="x-small" color="primary" variant="tonal">{{ selectedUser.permissions?.length ?? 0 }}</v-chip>
      </div>

      <div class="d-flex align-center gap-2 mt-3">
        <v-icon size="16" :color="duplicateCount > 0 ? 'warning' : 'success'">
          {{ duplicateCount > 0 ? 'mdi-alert-circle-outline' : 'mdi-check-circle-outline' }}
        </v-icon>
        <span class="text-caption" :class="duplicateCount > 0 ? 'text-warning' : 'text-success'">
          {{ duplicateCount > 0
            ? `${duplicateCount} permiso(s) directo(s) duplican un rol — revísalos en "Direct permissions"`
            : 'Sin duplicados entre permisos directos y de rol' }}
        </span>
      </div>
    </div>
    <div v-else class="text-caption text-grey-darken-1">
      Elige un miembro arriba para ver de dónde vienen sus permisos.
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  linkedUsers: any[]
}>()

const selectedUserId = ref<number | null>(null)

const selectedUser = computed(() =>
  props.linkedUsers.find((u: any) => u.id === selectedUserId.value) ?? null
)

const rolePermissionIds = computed(() => {
  if (!selectedUser.value) return [] as number[]
  const ids = (selectedUser.value.roles ?? []).flatMap((r: any) => (r.permissions ?? []).map((p: any) => p.id))
  return [...new Set(ids)] as number[]
})

const directPermissionIds = computed(() =>
  (selectedUser.value?.permissions ?? []).map((p: any) => p.id)
)

const effectivePermissionIds = computed(() =>
  [...new Set([...rolePermissionIds.value, ...directPermissionIds.value])]
)

const duplicateCount = computed(() =>
  directPermissionIds.value.filter((id: number) => rolePermissionIds.value.includes(id)).length
)
</script>

<style scoped>
.diagram-flow {
  background: rgba(var(--v-theme-on-surface), 0.02);
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  border-radius: 12px;
  padding: 20px;
  overflow-x: auto;
}

.diagram-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.diagram-branch {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.diagram-branch-line {
  display: flex;
  align-items: center;
  gap: 8px;
}

.example-panel {
  background: rgba(var(--v-theme-on-surface), 0.02);
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}
</style>
