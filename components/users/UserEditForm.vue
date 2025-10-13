<template>
  <div>
    <form @submit="onSubmit">
      <InputText name="name" type="text" label="Name" />
      <InputText name="email" type="email" label="Email" />
      <InputText name="password" type="text" label="Password" />
      <InputText name="password_confirmation" type="text" label="Password confirmation" />
      <v-card>
        <v-card-title>Roles and permissions</v-card-title>
        <v-card-text>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <InputAutocomplete
                name="roles"
                :items="catalogs.roles"
                item-title="name"
                item-value="id"
                label="Role(s)"
                multiple
                return-object
                :chips="true"
                :closable-chips="true"
              />
            </div>
            <div>
              <div class="font-bold">Role(s) selected permission details:</div>
              <div v-if="values.roles?.length > 0">
                <div v-for="role in values.roles" :key="`role-${role.id}`" class="mb-4">
                  <v-alert>
                    <v-alert-title>Role {{ role.name }} - permissions attached:</v-alert-title>
                    <div v-if="role.permissions.length === 0">No permissions attached</div>
                    <div v-for="permission in role.permissions" :key="permission.id">
                      {{ permission.name }}
                    </div>
                  </v-alert>
                </div>
              </div>
            </div>
          </div>

          <InputAutocomplete
            name="permissions"
            :items="catalogs.permissions"
            item-title="name"
            item-value="id"
            label="Direct permission(s)"
            multiple
            chips
            closable-chips
            return-object
          />

          <div class="text-right">
            <v-btn color="primary" class="my-4" @click="onSubmit">Update user</v-btn>
          </div>
        </v-card-text>
      </v-card>
    </form>
  </div>
</template>
<script setup lang="ts">
import { schemaEdit } from '~~/forms/userForm'

const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()
const router = useRouter()

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
})

const { handleSubmit, values, errors, resetForm } = useForm({
  validationSchema: schemaEdit,
})

const form = ref({
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
  roles: null,
  permissions: null,
})

const catalogs = reactive({
  roles: [],
  permissions: [],
})

const onSuccess = async (values: any) => {
  try {
    loadingStore.start()
    const response = await $api.users.updateUser(props.id, values)
    console.log(response)

    snackbar.add({ type: 'success', text: 'User updated successfully' })

    router.push('/system/users')
  } catch (e) {
    console.error(e)
    snackbar.add({ type: 'error', text: 'Error updating user' })
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

function onInvalidSubmit({ values, errors, results }: any) {
  snackbar.add({ type: 'error', text: 'Please fill in all required fields' })
}

const onSubmit = handleSubmit(onSuccess, onInvalidSubmit)

const getUserToEdit = async () => {
  try {
    loadingStore.start()
    const response = await $api.users.getUserById(props.id, { method: 'get' })
    snackbar.add({ type: 'success', text: 'User fetched successfully' })
    resetForm({ values: response as any })
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const getCatalogs = async () => {
  try {
    loadingStore.start()
    const [roles, permissions] = await Promise.all([$api.users.getRoles(), $api.users.getPermissions()])
    catalogs.roles = roles
    catalogs.permissions = permissions
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

onMounted(async () => {
  await getCatalogs()
  await getUserToEdit()
})
</script>
