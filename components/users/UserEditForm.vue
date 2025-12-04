<template>
  <div>
    <form @submit="onSubmit">
      <InputText name="name" type="text" label="Name" />
      <InputText name="email" type="email" label="Email" />
      <InputText name="password" type="text" label="Password" />
      <InputText name="password_confirmation" type="text" label="Password confirmation" />
      <v-card class="mt-4">
        <v-card-title class="bg-primary text-white d-flex align-center">
          <v-icon class="mr-2">mdi-shield-account</v-icon>
          Roles and Permissions
        </v-card-title>
        <v-card-text class="pa-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <InputAutocomplete
                name="roles"
                :items="catalogs.roles"
                item-title="name"
                item-value="id"
                label="Assign Role(s)"
                multiple
                return-object
                chips
                closable-chips
                variant="outlined"
                prepend-inner-icon="mdi-shield"
              />
            </div>
            <div>
              <InputAutocomplete
                name="permissions"
                :items="catalogs.permissions"
                item-title="name"
                item-value="id"
                label="Direct Permission(s)"
                multiple
                chips
                closable-chips
                return-object
                variant="outlined"
                prepend-inner-icon="mdi-key-variant"
              />
            </div>
          </div>

          <!-- Role Permissions Details -->
          <div v-if="values.roles && values.roles.length > 0" class="mt-4">
            <v-divider class="mb-4" />
            <div class="text-subtitle-2 font-weight-bold mb-3 d-flex align-center">
              <v-icon size="small" class="mr-2">mdi-information</v-icon>
              Selected Role(s) Permissions
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <v-card
                v-for="role in values.roles"
                :key="`role-${role.id}`"
                variant="outlined"
                class="pa-3"
              >
                <div class="d-flex align-center mb-2">
                  <v-icon size="small" color="primary" class="mr-2">mdi-shield</v-icon>
                  <span class="font-weight-medium">{{ role.name }}</span>
                  <v-chip size="x-small" color="success" class="ml-2">
                    {{ role.permissions?.length || 0 }} permissions
                  </v-chip>
                </div>
                <v-divider class="my-2" />
                <div v-if="!role.permissions || role.permissions.length === 0" class="text-caption text-grey">
                  No permissions attached to this role
                </div>
                <div v-else class="d-flex flex-wrap gap-1">
                  <v-chip
                    v-for="permission in role.permissions"
                    :key="permission.id"
                    size="x-small"
                    variant="outlined"
                    color="primary"
                  >
                    <v-icon start size="x-small">mdi-key-variant</v-icon>
                    {{ permission.name }}
                  </v-chip>
                </div>
              </v-card>
            </div>
          </div>

          <div class="text-right mt-4">
            <v-btn color="primary" size="large" @click="onSubmit" prepend-icon="mdi-content-save">
              Update User
            </v-btn>
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
