<template>
  <div>
    <div v-for="dept in departments" :key="dept.id" class="mb-4">
      <v-card variant="flat" class="rounded-lg" bg-color="grey-lighten-5">
        <v-card-title class="py-4">
          <span class="d-flex align-center gap-2">
            <v-icon color="primary">mdi-office-building</v-icon>
            <span class="font-weight-bold">{{ dept.name }}</span>
            <v-chip size="x-small" color="primary" variant="tonal" class="ml-2">
              {{ dept.users?.length ?? 0 }} {{ (dept.users?.length ?? 0) === 1 ? 'member' : 'members' }}
            </v-chip>
          </span>
        </v-card-title>
        <v-card-text class="pa-0">
          <div v-for="(user, uIndex) in dept.users" :key="user.id">
            <div class="pa-4">
              <div class="d-flex align-center gap-3 mb-3">
                <v-avatar color="primary" size="36" rounded="lg">
                  <span class="text-white text-caption font-weight-bold">{{ getInitials(user.name) }}</span>
                </v-avatar>
                <div>
                  <div class="font-weight-medium">{{ user.name }}</div>
                  <div class="text-caption text-grey-darken-1">{{ user.email }}</div>
                </div>
              </div>
              <v-row dense>
                <v-col
                  v-for="perm in dept.permissions"
                  :key="perm.id"
                  cols="12"
                  sm="6"
                  md="4"
                  lg="3"
                >
                  <v-checkbox
                    :label="perm.name"
                    :model-value="editedPermissions[user.id]?.includes(perm.id)"
                    :loading="savingUser[user.id] === perm.id"
                    @update:model-value="(checked) => togglePermissionAndSave(dept.id, user.id, perm.id, checked)"
                    density="compact"
                    hide-details
                    color="primary"
                  />
                </v-col>
              </v-row>
            </div>
            <v-divider v-if="+uIndex < dept.users.length - 1" />
          </div>
          <div v-if="!dept.users?.length" class="text-center py-8 text-grey">
            <v-icon size="40" color="grey-lighten-2">mdi-account-off-outline</v-icon>
            <div class="mt-2 text-caption">No members to manage in this department.</div>
          </div>
        </v-card-text>
      </v-card>
    </div>

    <v-alert v-if="departments.length === 0" type="info" variant="tonal" density="compact" class="rounded-lg">
      You are not coordinator of any department with assigned permissions.
    </v-alert>
  </div>
</template>
<script setup lang="ts">
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()
const router = useRouter()

const departments = ref<any>([])
const editedPermissions = ref<Record<string, number[]>>({})
const savingUser = ref<Record<number, number | null>>({}) // userId: permissionId

function getInitials(name: string): string {
  return (name ?? '')
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const getDepartments = async () => {
  try {
    loadingStore.start()
    const response = await $api.users.getDepartmentsCoordinator()
    departments.value = response as any
    // Inicializa permisos editados
    for (const dept of departments.value) {
      for (const user of dept.users) {
        editedPermissions.value[user.id] = user.permissions.map((p: any) => p.id)
      }
    }
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const togglePermissionAndSave = async (
  departmentId: number,
  userId: number,
  permissionId: number,
  checked: boolean | null
) => {
  const perms = editedPermissions.value[userId] || []
  if (checked) {
    if (!perms.includes(permissionId)) perms.push(permissionId)
  } else {
    const idx = perms.indexOf(permissionId)
    if (idx !== -1) perms.splice(idx, 1)
  }
  editedPermissions.value[userId] = [...perms]
  savingUser.value[userId] = permissionId
  try {
    const body = {
      permissions: editedPermissions.value[userId],
      department_id: departmentId,
    }
    await $api.users.updateUserPermissions?.(userId, body)
    snackbar.add({ type: 'success', text: 'Permisos actualizados' })
  } catch (e) {
    snackbar.add({ type: 'error', text: 'Error al guardar permisos' })
  } finally {
    setTimeout(() => {
      savingUser.value[userId] = null
    }, 250)
  }
}

await getDepartments()
</script>
