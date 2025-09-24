<template>
  <div>
    <div v-for="dept in departments" :key="dept.id" class="mb-8 p-4 border rounded">
      <h3 class="font-bold text-lg mb-2">Department: {{ dept.name }}</h3>
      <div v-for="user in dept.users" :key="user.id" class="mb-4 p-2 border-b">
        <div class="font-semibold">
          {{ user.name }} <span class="text-xs text-gray-500">{{ user.email }}</span>
        </div>
        <div class="flex flex-wrap gap-4 mt-2">
          <div v-for="perm in dept.permissions" :key="perm.id" class="flex items-center">
            <v-checkbox
              :label="perm.name"
              :model-value="editedPermissions[user.id]?.includes(perm.id)"
              :loading="savingUser[user.id] === perm.id"
              @update:model-value="(checked) => togglePermissionAndSave(dept.id, user.id, perm.id, checked)"
              density="compact"
              hide-details
            />
          </div>
        </div>
      </div>
    </div>
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
