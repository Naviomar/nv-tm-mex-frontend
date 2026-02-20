<template>
  <div class="px-4 py-6 w-full max-w-6xl mx-auto">
    <div class="flex items-center gap-4 mb-6">
      <Button variant="ghost" @click="goBack">Back</Button>
      <h1 class="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Mail notification #{{ id }}</h1>
    </div>

    <Card class="mail-notification-edit-card">
      <div class="p-6 space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Left column: form fields -->
          <div class="space-y-4">
            <Input :model-value="shortName" label="Name" readonly />
            <Input
              :model-value="description"
              label="Description *"
              placeholder="Description"
              :error="descriptionError"
              @input="onDescriptionInput"
            />
            <div class="flex gap-2 pt-2">
              <Button to="/system/mail-notifications" variant="secondary">Cancel</Button>
              <Button variant="primary" @click="saveCharge">Save</Button>
            </div>
          </div>

          <!-- Right column: departments & users -->
          <div class="space-y-6">
            <!-- Departments -->
            <div class="space-y-3">
              <div class="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Departments</div>
              <div class="flex flex-wrap gap-2 items-end">
                <div class="flex-1 min-w-[140px]">
                  <Select v-model="form.department" label="Select department">
                    <option :value="null">Select…</option>
                    <option v-for="d in availableDepartments" :key="d.id" :value="d.id">
                      {{ d.name }}
                    </option>
                  </Select>
                </div>
                <Button variant="primary" size="sm" @click="linkDepartment">Add</Button>
              </div>
              <Table class="mail-notification-tables">
                <thead>
                  <tr class="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/50">
                    <th class="h-9 px-3 text-left font-medium text-zinc-600 dark:text-zinc-400">Name</th>
                    <th class="h-9 px-3 text-left font-medium text-zinc-600 dark:text-zinc-400 w-20">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(department, index) in linkedDepartments"
                    :key="`department-${index}`"
                    class="border-b border-zinc-100 dark:border-zinc-800/80 last:border-0 hover:bg-zinc-50/80 dark:hover:bg-zinc-900/30"
                  >
                    <td class="px-3 py-2 flex justify-between items-center gap-2 text-zinc-900 dark:text-zinc-100">
                      {{ department.name }}
                      <UserInfoBadge :item="department" />
                    </td>
                    <td class="px-3 py-2 text-zinc-900 dark:text-zinc-100 text-center">
                      <TrashButton :item="department" @click="unlinkDepartment(department)" />
                    </td>
                  </tr>
                  <tr v-if="linkedDepartments.length === 0">
                    <td colspan="2" class="px-3 py-4 text-center text-zinc-500 dark:text-zinc-400 text-sm">
                      No departments linked
                    </td>
                  </tr>
                </tbody>
              </Table>
            </div>

            <!-- Users -->
            <div class="space-y-3">
              <div class="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Users</div>
              <div class="space-y-2">
                <div class="flex flex-wrap gap-3 items-center">
                  <div class="flex-1 min-w-[160px]">
                    <Input v-model="userSearch" placeholder="Filter by email or name…" />
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-xs text-zinc-500 dark:text-zinc-400">Default type:</span>
                    <Select v-model="defaultNotifyType">
                      <option value="CC">CC</option>
                      <option value="BCC">BCC</option>
                    </Select>
                  </div>
                </div>
                <div
                  class="max-h-48 overflow-y-auto rounded-md border border-zinc-200 dark:border-zinc-800 divide-y divide-zinc-200 dark:divide-zinc-800"
                >
                  <div
                    v-for="u in filteredAvailableUsers"
                    :key="u.id"
                    class="flex items-center gap-2 px-3 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-900/40"
                  >
                    <span class="flex-1 min-w-0 truncate text-sm text-zinc-900 dark:text-zinc-100" :title="u.email">{{
                      u.email
                    }}</span>
                    <select
                      :value="getUserPendingType(u.id)"
                      class="h-8 w-20 shrink-0 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-2 text-xs text-zinc-900 dark:text-zinc-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400"
                      @change="setUserPendingType(u.id, ($event.target as HTMLSelectElement).value)"
                    >
                      <option value="CC">CC</option>
                      <option value="BCC">BCC</option>
                    </select>
                    <Button size="sm" variant="primary" @click="linkUserQuick(u)">Add</Button>
                  </div>
                  <p
                    v-if="filteredAvailableUsers.length === 0"
                    class="px-3 py-3 text-sm text-zinc-500 dark:text-zinc-400"
                  >
                    {{ userSearch ? 'No users match the filter.' : 'All users are already linked.' }}
                  </p>
                </div>
              </div>
              <Table class="mail-notification-tables">
                <thead>
                  <tr class="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/50">
                    <th class="h-9 px-3 text-left font-medium text-zinc-600 dark:text-zinc-400">User email</th>
                    <th class="h-9 px-3 text-left font-medium text-zinc-600 dark:text-zinc-400">
                      Notification type (CC / BCC)
                    </th>
                    <th class="h-9 px-3 text-left font-medium text-zinc-600 dark:text-zinc-400 w-20">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(user, index) in linkedUsers"
                    :key="`user-${index}`"
                    class="border-b border-zinc-100 dark:border-zinc-800/80 last:border-0 hover:bg-zinc-50/80 dark:hover:bg-zinc-900/30"
                  >
                    <td class="px-3 py-2 text-zinc-900 dark:text-zinc-100">{{ user.name }}</td>
                    <td class="px-3 py-2 flex justify-between items-center gap-2 text-zinc-900 dark:text-zinc-100">
                      {{ user.pivot?.type }}
                      <UserInfoBadge :item="user.pivot" />
                    </td>
                    <td class="px-3 py-2 text-zinc-900 dark:text-zinc-100 text-center">
                      <TrashButton :item="user" @click="unlinkUser(user)" />
                    </td>
                  </tr>
                  <tr v-if="linkedUsers.length === 0">
                    <td colspan="3" class="px-3 py-4 text-center text-zinc-500 dark:text-zinc-400 text-sm">
                      No users linked
                    </td>
                  </tr>
                </tbody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </Card>
  </div>
</template>
<script setup lang="ts">
import { useField } from 'vee-validate'
import { schema } from '~/forms/mailNotificationForm'

const route = useRoute()
const router = useRouter()
const { $api } = useNuxtApp()
const snackbar = useSnackbar()

const id = route.params.id as string

const goBack = () => {
  router.back()
}

const linkedUsers = ref<any[]>([])
const linkedDepartments = ref<any[]>([])
const users = ref<any[]>([])
const departments = ref<any[]>([])
const form = reactive({
  department: null as number | null,
})
const userSearch = ref('')
const defaultNotifyType = ref<'CC' | 'BCC'>('CC')
const userPendingTypes = ref<Record<number, string>>({})

const { setValues, handleSubmit } = useForm({
  validationSchema: schema,
})

const { value: shortName } = useField<string>('short_name')
const { value: description, errorMessage: descriptionError, setValue: setDescription } = useField<string>('description')

function onDescriptionInput(e: Event) {
  const target = e.target as HTMLInputElement
  setDescription(target.value)
}

watch(
  () => id,
  async (currentId) => {
    if (currentId) {
      const response = (await $api.mailNotifications.getById(currentId)) as any
      setValues({
        ...response,
        short_name: response.short_name ?? response.name ?? '',
        description: response.description ?? '',
      })
      linkedUsers.value = response.users ?? []
      linkedDepartments.value = response.departments ?? []
    }
  },
  { immediate: true },
)

const availableUsers = computed(() => {
  return users.value.filter((user: any) => {
    return !linkedUsers.value.some((linkedUser: any) => linkedUser.id === user.id)
  })
})

const availableDepartments = computed(() => {
  return departments.value.filter((department: any) => {
    return !linkedDepartments.value.some((linkedDepartment: any) => linkedDepartment.id === department.id)
  })
})

const filteredAvailableUsers = computed(() => {
  const q = userSearch.value.trim().toLowerCase()
  if (!q) return availableUsers.value
  return availableUsers.value.filter((u: any) => {
    const email = (u.email ?? '').toLowerCase()
    const name = (u.name ?? '').toLowerCase()
    return email.includes(q) || name.includes(q)
  })
})

function getUserPendingType(userId: number) {
  return userPendingTypes.value[userId] ?? defaultNotifyType.value
}

function setUserPendingType(userId: number, type: string) {
  userPendingTypes.value[userId] = type
}

async function linkUserQuick(user: any) {
  const type = getUserPendingType(user.id) as 'CC' | 'BCC'
  await $api.mailNotifications.linkUser(id, { user_id: user.id, type })
  const copy = { ...user }
  if (!copy.pivot) copy.pivot = {}
  copy.pivot.type = type
  linkedUsers.value.push(copy)
  snackbar.add({ type: 'success', text: 'User linked' })
}

const onSuccess = async (values: any) => {
  if (id) {
    await $api.mailNotifications.update(id, values)
    snackbar.add({ type: 'success', text: 'Mail notification updated' })
    router.push('/system/mail-notifications')
    return
  }
}

function onInvalidSubmit() {
  snackbar.add({ type: 'error', text: 'Please fill all required fields' })
}

const saveCharge = handleSubmit(onSuccess, onInvalidSubmit)

const unlinkUser = async (user: any) => {
  await $api.mailNotifications.unlinkUser(id, { user_id: user.id })
  linkedUsers.value = linkedUsers.value.filter((u: any) => u.id !== user.id)
  snackbar.add({ type: 'success', text: 'User unlinked' })
}

const linkDepartment = async () => {
  if (!form.department) {
    snackbar.add({ type: 'warning', text: 'Please select a department' })
    return
  }
  await $api.mailNotifications.linkDepartment(id, { department_id: form.department })
  const department = departments.value.find((d: any) => d.id === form.department)
  linkedDepartments.value.push(department)
  form.department = null
  snackbar.add({ type: 'success', text: 'Department linked' })
}

const unlinkDepartment = async (department: any) => {
  await $api.mailNotifications.unlinkDepartment(id, { department_id: department.id })
  linkedDepartments.value = linkedDepartments.value.filter((d: any) => d.id !== department.id)
  snackbar.add({ type: 'success', text: 'Department unlinked' })
}

onMounted(async () => {
  users.value = await $api.users.getAllUsers()
  departments.value = await $api.departments.getAllDepartments()
})
</script>
