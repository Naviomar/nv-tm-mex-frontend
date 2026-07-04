<template>
  <div class="user-edit-form">
    <form @submit="onSubmit">
      <!-- Basic Info Section -->
      <div class="form-section mb-6">
        <div class="section-header mb-4">
          <v-icon color="primary" size="20" class="mr-2">mdi-account-outline</v-icon>
          <span class="section-title">User Information</span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputText name="name" type="text" label="Name" />
          <InputText name="email" type="email" label="Email" />
          <InputText name="password" type="text" label="Password" />
          <InputText name="password_confirmation" type="text" label="Password confirmation" />
        </div>
      </div>

      <!-- Roles & Permissions Section -->
      <div class="form-section mb-6">
        <div class="section-header mb-4">
          <v-icon color="primary" size="20" class="mr-2">mdi-shield-account-outline</v-icon>
          <span class="section-title">Roles and Permissions</span>
        </div>
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
        <div v-if="values.roles && values.roles.length > 0" class="mt-5">
          <div class="text-subtitle-2 font-weight-medium mb-3 d-flex align-center text-grey-darken-1">
            <v-icon size="small" class="mr-2">mdi-information-outline</v-icon>
            Selected Role(s) Permissions
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div
              v-for="role in values.roles"
              :key="`role-${role.id}`"
              class="role-card pa-3"
            >
              <div class="d-flex align-center mb-2">
                <v-icon size="small" color="primary" class="mr-2">mdi-shield</v-icon>
                <span class="font-weight-medium text-body-2">{{ role.name }}</span>
                <v-chip size="x-small" color="primary" variant="tonal" class="ml-2">
                  {{ role.permissions?.length || 0 }} perms
                </v-chip>
              </div>
              <div v-if="!role.permissions || role.permissions.length === 0" class="text-caption text-grey">
                No permissions attached to this role
              </div>
              <div v-else class="d-flex flex-wrap gap-1">
                <v-chip
                  v-for="permission in role.permissions"
                  :key="permission.id"
                  size="x-small"
                  variant="tonal"
                  color="primary"
                >
                  {{ permission.name }}
                </v-chip>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Data Access Restrictions Section -->
      <div class="form-section">
        <div class="section-header mb-4">
          <v-icon color="deep-purple" size="20" class="mr-2">mdi-shield-lock-outline</v-icon>
          <span class="section-title">Data Access Restrictions</span>
        </div>
        <UserDataRestrictionsPanel :user-id="props.id" />
      </div>

      <!-- Submit Button -->
      <div class="text-right mt-6">
        <v-btn color="primary" size="large" @click="onSubmit" prepend-icon="mdi-content-save">
          Update User
        </v-btn>
      </div>
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
    console.log("user:",response)

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

<style scoped>
.user-edit-form {
  max-width: 100%;
}

.form-section {
  padding: 20px 24px;
  border-radius: 12px;
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-border-color), 0.12);
}

.section-header {
  display: flex;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(var(--v-border-color), 0.08);
}

.section-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.85);
  letter-spacing: 0.3px;
}

.role-card {
  border-radius: 8px;
  background: rgba(var(--v-theme-primary), 0.04);
  border: 1px solid rgba(var(--v-border-color), 0.08);
  transition: border-color 0.2s ease;
}

.role-card:hover {
  border-color: rgba(var(--v-theme-primary), 0.2);
}

.gap-1 {
  gap: 4px;
}
.gap-3 {
  gap: 12px;
}
.gap-4 {
  gap: 16px;
}
</style>
