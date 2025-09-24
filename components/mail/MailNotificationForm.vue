<template>
  <div>
    <div class="grid grid-cols-12 gap-4">
      <div class="col-span-6">
        <div>
          <InputText density="compact" name="short_name" label="Name" readonly />
        </div>
        <div>
          <InputText density="compact" name="description" label="Description *" />
        </div>

        <div class="flex justify-center items-center">
          <v-btn class="mr-4" color="secondary" to="/system/departments"> Cancel </v-btn>
          <v-btn color="primary" @click="saveCharge"> Save </v-btn>
        </div>
      </div>
      <div class="col-span-6">
        <div class="mb-4">
          <div class="font-bold">Departments</div>
          <div class="flex gap-2">
            <v-autocomplete
              v-model="form.department"
              density="compact"
              :items="availableDepartments"
              item-title="name"
              item-value="id"
              label="Select department"
            />
            <v-btn color="primary" size="small" @click="linkDepartment">Add</v-btn>
          </div>
          <v-table density="compact">
            <thead>
              <tr>
                <th class="text-left w-20">Actions</th>
                <th class="text-left">Name</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(department, index) in linkedDepartments" :key="`department-${index}`">
                <td>
                  <div class="flex gap-2">
                    <TrashButton :item="department" @click="unlinkDepartment(department)" />
                  </div>
                </td>

                <td class="flex justify-between items-center">
                  {{ department.name }}
                  <UserInfoBadge :item="department" />
                </td>
              </tr>
            </tbody>
          </v-table>
        </div>
        <div class="mb-4">
          <div class="font-bold">Users</div>
          <div class="flex gap-2">
            <v-autocomplete
              v-model="form.user"
              density="compact"
              :items="availableUsers"
              item-title="email"
              item-value="id"
              label="Select user"
            />
            <v-autocomplete
              v-model="form.type"
              density="compact"
              :items="[
                { name: 'CC', value: 'CC' },
                { name: 'BCC', value: 'BCC' },
              ]"
              item-title="name"
              item-value="value"
              label="Notify type"
            />
            <v-btn color="primary" size="small" @click="linkUser">Add</v-btn>
          </div>
          <v-table density="compact">
            <thead>
              <tr>
                <th class="text-left">Actions</th>
                <th class="text-left">User email</th>
                <th class="text-left">Notification type (CC / BCC)</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(user, index) in linkedUsers" :key="`user-${index}`">
                <td>
                  <div class="flex gap-2">
                    <TrashButton :item="user" @click="unlinkUser(user)" />
                  </div>
                </td>

                <td>{{ user.name }}</td>
                <td class="flex justify-between items-center">
                  {{ user.pivot?.type }}
                  <UserInfoBadge :item="user.pivot" />
                </td>
              </tr>
            </tbody>
          </v-table>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { schema } from '~/forms/departmentForm'

const router = useRouter()
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()

const props = defineProps({
  id: {
    type: String,
    required: false,
  },
})

const linkedUsers = ref<any>([])
const linkedDepartments = ref<any>([])
const users = ref<any>([])
const departments = ref<any>([])
const form = reactive({
  user: null,
  department: null,
  type: null,
})

watch(
  () => props.id,
  async (id) => {
    if (id) {
      const response = (await $api.mailNotifications.getById(id)) as any
      setValues(response)
      linkedUsers.value = response.users
      linkedDepartments.value = response.departments
    }
  },
  { immediate: true }
)

const availableUsers = computed(() => {
  // users that are not linked
  return users.value.filter((user: any) => {
    return !linkedUsers.value.some((linkedUser: any) => linkedUser.id === user.id)
  })
})

const availableDepartments = computed(() => {
  // departments that are not linked
  return departments.value.filter((department: any) => {
    return !linkedDepartments.value.some((linkedDepartment: any) => linkedDepartment.id === department.id)
  })
})

const { handleSubmit, setValues } = useForm({
  validationSchema: schema,
})

const onSuccess = async (values: any) => {
  if (props.id) {
    await $api.mailNotifications.update(props.id, values)
    snackbar.add({ type: 'success', text: 'Mail notification updated' })
    router.push('/system/mail-notifications')
    return
  }
}

function onInvalidSubmit({ values, errors, results }: any) {
  snackbar.add({ type: 'error', text: 'Please fill all required fields' })
}

const saveCharge = handleSubmit(onSuccess, onInvalidSubmit)

const linkUser = async () => {
  if (!form.user) {
    snackbar.add({ type: 'warning', text: 'Please select a user' })
    return
  }
  if (!form.type) {
    snackbar.add({ type: 'warning', text: 'Please select a notify type' })
    return
  }
  const body = {
    user_id: form.user,
    type: form.type,
  }
  const response = await $api.mailNotifications.linkUser(props.id, body)
  // find user by id
  const user = users.value.find((u: any) => u.id === form.user)
  if (user) {
    if (!user.pivot) {
      user.pivot = {} // Initialize the pivot object if it doesn't exist
    }
    user.pivot.type = form.type
  }
  linkedUsers.value.push(user)
  form.user = null
  snackbar.add({ type: 'success', text: 'User linked' })
}

const unlinkUser = async (user: any) => {
  const body = {
    user_id: user.id,
  }
  await $api.mailNotifications.unlinkUser(props.id, body)
  // remove user from linkedUsers
  linkedUsers.value = linkedUsers.value.filter((u: any) => u.id !== user.id)
  snackbar.add({ type: 'success', text: 'User unlinked' })
}

const linkDepartment = async () => {
  if (!form.department) {
    snackbar.add({ type: 'warning', text: 'Please select a department' })
    return
  }
  const body = {
    department_id: form.department,
  }
  const response = await $api.mailNotifications.linkDepartment(props.id, body)
  // find user by id
  const department = departments.value.find((u: any) => u.id === form.department)
  linkedDepartments.value.push(department)
  form.department = null
  snackbar.add({ type: 'success', text: 'Department linked' })
}

const unlinkDepartment = async (department: any) => {
  const body = {
    department_id: department.id,
  }
  await $api.mailNotifications.unlinkDepartment(props.id, body)
  // remove user from linkedDepartments
  linkedDepartments.value = linkedDepartments.value.filter((u: any) => u.id !== department.id)
  snackbar.add({ type: 'success', text: 'Department unlinked' })
}

onMounted(async () => {
  users.value = await $api.users.getAllUsers()
  departments.value = await $api.departments.getAllDepartments()
})
</script>
