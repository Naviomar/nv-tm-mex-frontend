<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-4">
      <v-tabs v-model="activeTab" color="primary">
        <v-tab value="users">
          <v-icon start>mdi-account-group</v-icon>
          Members
          <v-chip size="x-small" color="primary" variant="tonal" class="ml-2">{{ linkedUsers.length }}</v-chip>
        </v-tab>
        <v-tab value="roles">
          <v-icon start>mdi-shield-account</v-icon>
          Roles & Permissions
        </v-tab>
      </v-tabs>
      <v-btn
        variant="tonal"
        color="primary"
        prepend-icon="mdi-book-open-page-variant-outline"
        size="small"
        @click="pageDocs.open('access-control')"
      >
        How access works
      </v-btn>
    </div>
    <v-divider class="mb-4" />

    <v-window v-model="activeTab">
      <!-- ====== USERS TAB ====== -->
      <v-window-item value="users">
        <!-- Add user row -->
        <Can permission="departments-edit">
          <v-card variant="flat" class="mb-4 rounded-lg" bg-color="blue-grey-lighten-5">
            <v-card-text class="pa-4">
              <div class="d-flex align-center gap-2 mb-4">
                <v-avatar color="primary" size="32" rounded="lg">
                  <v-icon size="18" color="white">mdi-account-plus</v-icon>
                </v-avatar>
                <div>
                  <div class="text-subtitle-1 font-weight-bold">Add member</div>
                  <div class="text-caption text-grey-darken-1">Link a user to this department</div>
                </div>
              </div>
              <v-row dense align="center">
                <v-col cols="12" md="5">
                  <v-autocomplete
                    v-model="form.user"
                    density="compact"
                    :items="availableUsers"
                    item-title="email"
                    item-value="id"
                    label="Search user by email or name"
                    variant="outlined"
                    bg-color="white"
                    hide-details
                    clearable
                  >
                    <template #item="{ props: aProps, item }">
                      <v-list-item v-bind="aProps">
                        <template #prepend>
                          <v-avatar size="28" color="primary">
                            <span class="text-white text-caption">{{ getInitials(item.raw.name) }}</span>
                          </v-avatar>
                        </template>
                        <v-list-item-subtitle>{{ item.raw.name }}</v-list-item-subtitle>
                      </v-list-item>
                    </template>
                  </v-autocomplete>
                </v-col>
                <v-col cols="12" md="3">
                  <v-select
                    v-model="form.department_type"
                    density="compact"
                    :items="departmentTypes"
                    item-title="label"
                    item-value="value"
                    label="Type"
                    variant="outlined"
                    bg-color="white"
                    hide-details
                  />
                </v-col>
                <v-col cols="12" md="4">
                  <v-btn
                    color="primary"
                    variant="flat"
                    block
                    :disabled="!form.user || !form.department_type"
                    @click="linkUser"
                    prepend-icon="mdi-account-plus"
                  >
                    Add to Department
                  </v-btn>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </Can>

        <!-- Members table -->
        <v-card variant="flat" class="rounded-lg" bg-color="grey-lighten-5">
          <v-card-text class="pa-0">
            <v-table density="comfortable" hover class="rounded-lg">
              <thead>
                <tr class="bg-grey-lighten-4">
                  <th style="width: 56px"></th>
                  <th>
                    <span class="d-flex align-center gap-2 text-caption font-weight-bold text-grey-darken-1">
                      <v-icon size="16">mdi-account</v-icon> Member
                    </span>
                  </th>
                  <th style="width: 155px">
                    <span class="d-flex align-center gap-2 text-caption font-weight-bold text-grey-darken-1">
                      <v-icon size="16">mdi-badge-account</v-icon> Type
                    </span>
                  </th>
                  <th>
                    <span class="d-flex align-center gap-2 text-caption font-weight-bold text-grey-darken-1">
                      <v-icon size="16">mdi-shield-account</v-icon> Roles
                    </span>
                  </th>
                  <th style="width: 190px">
                    <span class="d-flex align-center gap-2 text-caption font-weight-bold text-grey-darken-1">
                      <v-icon size="16">mdi-key-variant</v-icon> Permissions
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(member, index) in linkedUsers" :key="`user-${index}`">
                  <td>
                    <Can permission="departments-edit">
                      <v-tooltip text="Remove from department" location="top">
                        <template #activator="{ props: tProps }">
                          <v-btn
                            v-bind="tProps"
                            size="x-small"
                            variant="tonal"
                            color="error"
                            icon="mdi-account-minus"
                            @click="unlinkUser(member)"
                          />
                        </template>
                      </v-tooltip>
                    </Can>
                  </td>
                  <td>
                    <div class="d-flex align-center gap-2 py-1">
                      <v-avatar
                        size="32"
                        :color="member.pivot?.department_type === 'coordinator' ? 'amber-darken-2' : 'primary'"
                      >
                        <span class="text-white text-caption font-weight-bold">{{ getInitials(member.name) }}</span>
                      </v-avatar>
                      <div>
                        <div class="font-weight-medium text-sm">{{ member.name }}</div>
                        <div class="text-caption text-grey-darken-1">{{ member.email }}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <v-select
                      :model-value="member.pivot?.department_type ?? 'member'"
                      :items="departmentTypes"
                      item-title="label"
                      item-value="value"
                      density="compact"
                      variant="outlined"
                      hide-details
                      style="min-width: 140px"
                      :loading="updatingType === member.id"
                      :disabled="!hasPermission('departments-edit')"
                      @update:model-value="(val) => changeUserType(member, val)"
                    />
                  </td>
                  <td>
                    <div class="d-flex flex-wrap align-center gap-1">
                      <v-chip
                        v-for="role in member.roles"
                        :key="role.id"
                        size="x-small"
                        :color="role.name?.includes('Admin') ? 'amber-darken-2' : 'secondary'"
                        variant="tonal"
                        :closable="isDepartmentRole(role.id) && canManageRoles"
                        @click:close="removeRole(member, role)"
                      >
                        {{ role.name }}
                      </v-chip>
                      <span v-if="!member.roles?.length" class="text-caption text-medium-emphasis">No role</span>

                      <v-menu v-if="canManageRoles && assignableRoles(member).length" location="bottom start">
                        <template #activator="{ props: mProps }">
                          <v-btn
                            v-bind="mProps"
                            size="x-small"
                            variant="tonal"
                            color="success"
                            icon="mdi-plus"
                            title="Add a role"
                            :loading="assigningTo === member.id"
                          />
                        </template>
                        <v-list density="compact">
                          <v-list-subheader>Add a role</v-list-subheader>
                          <v-list-item
                            v-for="role in assignableRoles(member)"
                            :key="role.id"
                            :title="role.name"
                            :subtitle="role.role_type === 'admin' ? 'Admin role' : 'Member role'"
                            @click="addRole(member, role)"
                          >
                            <template #prepend>
                              <v-icon size="small" :color="role.role_type === 'admin' ? 'amber-darken-2' : 'primary'">
                                {{ role.role_type === 'admin' ? 'mdi-shield-crown' : 'mdi-shield-account' }}
                              </v-icon>
                            </template>
                          </v-list-item>
                        </v-list>
                      </v-menu>
                    </div>
                  </td>
                  <td>
                    <div class="d-flex align-center flex-wrap gap-1">
                      <v-btn
                        size="x-small"
                        variant="tonal"
                        :color="totalPermCount(member) ? 'primary' : 'grey'"
                        prepend-icon="mdi-key-variant"
                        @click="openAccessModal(member)"
                      >
                        {{ totalPermCount(member) }}
                      </v-btn>
                      <v-chip v-if="directCount(member)" size="x-small" color="deep-purple" variant="tonal" title="Extra permissions given directly">
                        +{{ directCount(member) }} extra
                      </v-chip>
                      <v-chip v-if="revokedCount(member)" size="x-small" color="error" variant="flat" title="Permissions revoked even though a role grants them">
                        -{{ revokedCount(member) }} revoked
                      </v-chip>
                    </div>
                  </td>
                </tr>
                <tr v-if="linkedUsers.length === 0">
                  <td colspan="5" class="text-center py-10 text-grey">
                    <v-icon size="48" color="grey-lighten-2">mdi-account-group-outline</v-icon>
                    <div class="mt-2 text-caption">No members yet. Add one above.</div>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>
        </v-card>
      </v-window-item>

      <!-- ====== ROLES TAB ====== -->
      <v-window-item value="roles">
        <DepartmentRolesPanel
          v-if="props.id"
          :department-id="props.id"
          :linked-users="linkedUsers"
          @roles-changed="reloadDepartment"
        />
      </v-window-item>
    </v-window>
  </div>

  <!-- Modal: user access (roles' permissions, extras and revocations) -->
  <v-dialog v-model="accessModal.show" max-width="980" scrollable>
    <v-card class="rounded-lg">
      <v-toolbar color="primary" density="comfortable" class="rounded-t-lg">
        <v-toolbar-title>
          <v-icon class="mr-2">mdi-key-variant</v-icon>
          Permissions: {{ accessModal.user?.name }}
        </v-toolbar-title>
        <v-spacer />
        <v-btn icon @click="accessModal.show = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>
      <v-card-text style="max-height: 78vh; overflow-y: auto" class="pa-4 rounded-b-lg">
        <div v-if="accessModal.loading" class="text-center py-6">
          <v-progress-circular indeterminate color="primary" />
        </div>
        <UserAccessPanel
          v-else-if="accessModal.user"
          :user-id="accessModal.user.id"
          :department-id="props.id"
          :scope-permissions="scopePermissions"
          :department-role-ids="deptRoles.map((r: any) => r.id)"
          @updated="onAccessUpdated"
        />
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
const { $api, $notifications } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()
const confirm = $notifications.useConfirm()
const pageDocs = usePageDocs()
const { hasPermission } = useCheckUser()
// assign / revoke department roles (backend: system-admin-department + managing the department)
const canManageRoles = computed(() => hasPermission('system-admin-department'))

const props = defineProps({
  id: {
    type: String,
    required: false,
  },
})

const activeTab = ref('users')
const linkedUsers = ref<any[]>([])
const allUsers = ref<any[]>([])
const scopePermissions = ref<any[]>([])
const updatingType = ref<number | null>(null)

const form = reactive({
  user: null as number | null,
  department_type: null as string | null,
})

const departmentTypes = [
  { label: 'Member', value: 'member' },
  { label: 'Coordinator', value: 'coordinator' },
]

const accessModal = ref({
  show: false,
  user: null as any,
  loading: false,
})

// Roles linked to this department (admin + member): the ones that can be added/removed inline.
const deptRoles = ref<any[]>([])
const assigningTo = ref<number | null>(null)

async function loadDeptRoles() {
  if (!props.id) return
  try {
    deptRoles.value = (await $api.departments.getDepartmentRoles(props.id)) as any[]
  } catch (e) {
    console.error(e)
  }
}

const isDepartmentRole = (roleId: number) => deptRoles.value.some((r: any) => r.id === roleId)

const assignableRoles = (member: any) =>
  deptRoles.value.filter((r: any) => !(member.roles ?? []).some((mr: any) => mr.id === r.id))

async function addRole(member: any, role: any) {
  try {
    assigningTo.value = member.id
    await $api.departments.assignRoleToUser(props.id!, { user_id: member.id, role_id: role.id })
    await reloadDepartment()
    snackbar.add({ type: 'success', text: `Role "${role.name}" added to ${member.name}` })
  } catch (e) {
    console.error(e)
    snackbar.add({ type: 'error', text: 'Error adding role' })
  } finally {
    assigningTo.value = null
  }
}

async function removeRole(member: any, role: any) {
  const ok = await confirm({
    title: 'Remove role?',
    confirmationText: 'Remove',
    content: `Remove role "${role.name}" from ${member.name}? They will lose the permissions it grants.`,
    dialogProps: { persistent: true, maxWidth: 420 },
    confirmationButtonProps: { color: 'error' },
  })
  if (!ok) return
  try {
    assigningTo.value = member.id
    await $api.departments.revokeRoleFromUser(props.id!, { user_id: member.id, role_id: role.id })
    await reloadDepartment()
    snackbar.add({ type: 'success', text: 'Role removed' })
  } catch (e) {
    console.error(e)
    snackbar.add({ type: 'error', text: 'Error removing role' })
  } finally {
    assigningTo.value = null
  }
}

const revokedIdsOf = (member: any): Set<number> =>
  new Set((member.permission_revocations ?? []).map((r: any) => r.permission_id))

const roleIdsOf = (member: any): number[] =>
  (member.roles ?? []).flatMap((r: any) => (r.permissions ?? []).map((p: any) => p.id))

// Effective permissions: roles + direct - revoked.
function totalPermCount(member: any): number {
  const ids = new Set<number>([...(member.permissions ?? []).map((p: any) => p.id), ...roleIdsOf(member)])
  revokedIdsOf(member).forEach((id) => ids.delete(id))
  return ids.size
}

// Extra (direct) permissions that no role already grants.
function directCount(member: any): number {
  const fromRoles = new Set(roleIdsOf(member))
  return (member.permissions ?? []).filter((p: any) => !fromRoles.has(p.id)).length
}

// Only revocations that are still hiding something a role grants.
function revokedCount(member: any): number {
  const fromRoles = new Set(roleIdsOf(member))
  return [...revokedIdsOf(member)].filter((id) => fromRoles.has(id)).length
}

function getInitials(name: string): string {
  return (name ?? '')
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const availableUsers = computed(() =>
  allUsers.value.filter((u: any) => !linkedUsers.value.some((l: any) => l.id === u.id))
)

async function reloadDepartment() {
  if (!props.id) return
  try {
    const response = (await $api.departments.getById(props.id)) as any
    linkedUsers.value = response.users ?? []
    await loadDeptRoles()
  } catch (e) {
    console.error(e)
  }
}

async function loadScopePermissions() {
  if (!props.id) return
  try {
    scopePermissions.value = (await $api.departments.getAdminScopePermissions(props.id)) as any[]
  } catch (e) {
    console.error(e)
  }
}

watch(
  () => props.id,
  async (id) => {
    if (id) {
      try {
        loadingStore.start()
        const response = (await $api.departments.getById(id)) as any
        linkedUsers.value = response.users ?? []
        await loadDeptRoles()
      } catch (e) {
        console.error(e)
      } finally {
        loadingStore.stop()
      }
    }
  },
  { immediate: true }
)

async function linkUser() {
  if (!form.user || !form.department_type) return
  try {
    const body = {
      user_id: form.user,
      department_type: form.department_type,
    }
    await $api.departments.linkUser(props.id!, body)
    const user = allUsers.value.find((u: any) => u.id === form.user)
    linkedUsers.value.push({ ...user, pivot: { department_type: form.department_type }, roles: [], permissions: [] })
    form.user = null
    form.department_type = null
    snackbar.add({ type: 'success', text: 'User added to department' })
  } catch (e) {
    console.error(e)
    snackbar.add({ type: 'error', text: 'Error adding user' })
  }
}

async function changeUserType(member: any, newType: string) {
  if (member.pivot?.department_type === newType) return
  try {
    updatingType.value = member.id
    await $api.departments.updateUserType(props.id!, { user_id: member.id, department_type: newType })
    const idx = linkedUsers.value.findIndex((u: any) => u.id === member.id)
    if (idx >= 0) {
      linkedUsers.value[idx] = {
        ...linkedUsers.value[idx],
        pivot: { ...linkedUsers.value[idx].pivot, department_type: newType },
      }
      await reloadDepartment()
    }
    snackbar.add({ type: 'success', text: 'Member type updated' })
  } catch (e) {
    console.error(e)
    snackbar.add({ type: 'error', text: 'Error updating member type' })
  } finally {
    updatingType.value = null
  }
}

async function unlinkUser(member: any) {
  const ok = await confirm({
    title: 'Remove user?',
    confirmationText: 'Remove',
    content: `Remove "${member.name}" from this department? They will lose all department roles and permissions.`,
    dialogProps: { persistent: true, maxWidth: 420 },
    confirmationButtonProps: { color: 'error' },
  })
  if (!ok) return
  try {
    await $api.departments.unlinkUser(props.id!, { user_id: member.id })
    linkedUsers.value = linkedUsers.value.filter((u: any) => u.id !== member.id)
    snackbar.add({ type: 'success', text: 'User removed from department' })
  } catch (e) {
    console.error(e)
    snackbar.add({ type: 'error', text: 'Error removing user' })
  }
}

async function openAccessModal(member: any) {
  accessModal.value = { show: true, user: member, loading: true }
  try {
    await loadScopePermissions()
  } finally {
    accessModal.value.loading = false
  }
}

// The access panel saves on its own; mirror its result in the members table.
function onAccessUpdated(updated: any) {
  const idx = linkedUsers.value.findIndex((u: any) => u.id === updated.id)
  if (idx < 0) return
  linkedUsers.value[idx] = {
    ...linkedUsers.value[idx],
    roles: updated.roles,
    permissions: updated.permissions,
    permission_revocations: updated.permission_revocations,
  }
}

onMounted(async () => {
  allUsers.value = (await $api.users.getAllUsers()) as any[]
})
</script>
