<template>
  <div>
    <VeeForm @submit="onSubmit" :validation-schema="schema" name="User add form" ref="userFormRef">
      <div class="form-section mb-6">
        <div class="section-header mb-4">
          <v-icon color="primary" size="20" class="mr-2">mdi-account-outline</v-icon>
          <span class="section-title">User Information</span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputText name="name" density="compact" type="text" label="Name" variant="outlined" />
          <InputText name="email" density="compact" type="email" label="Email" variant="outlined" />
        </div>

        <v-alert type="info" variant="tonal" density="comfortable" class="mt-4" icon="mdi-shield-key-outline">
          A secure password will be generated automatically and emailed to the user, along with sign-in instructions.
        </v-alert>
      </div>

      <div class="form-section">
        <div class="section-header mb-4">
          <v-icon color="primary" size="20" class="mr-2">mdi-shield-account-outline</v-icon>
          <span class="section-title">Roles and Permissions</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <InputAutocomplete
              name="roles"
              :items="catalogs?.roles"
              density="compact"
              item-title="name"
              item-value="id"
              label="Assign Role(s)"
              multiple
              chips
              closable-chips
              return-object
              variant="outlined"
              prepend-inner-icon="mdi-shield"
            />
          </div>
          <div>
            <InputAutocomplete
              name="permissions"
              :items="catalogs?.permissions"
              item-title="name"
              item-value="id"
              label="Direct Permission(s)"
              density="compact"
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
        <div v-if="selectedRoles && selectedRoles.length > 0" class="mt-5">
          <div class="text-subtitle-2 font-weight-medium mb-3 d-flex align-center text-grey-darken-1">
            <v-icon size="small" class="mr-2">mdi-information-outline</v-icon>
            Selected Role(s) Permissions
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div v-for="role in selectedRoles" :key="`role-${role.id}`" class="role-card pa-3">
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

      <div class="text-right mt-6">
        <v-btn color="primary" size="large" type="submit" prepend-icon="mdi-account-plus" :loading="submitting">
          Add User
        </v-btn>
      </div>
    </VeeForm>

    <!-- Generated password dialog: shown once, right after creation -->
    <v-dialog v-model="showPasswordDialog" max-width="480" persistent>
      <v-card>
        <v-card-title class="bg-primary text-white d-flex align-center">
          <v-icon class="mr-2">mdi-check-circle-outline</v-icon>
          User created
        </v-card-title>
        <v-card-text class="pt-4">
          <p class="mb-3">
            <strong>{{ createdUser?.name }}</strong> ({{ createdUser?.email }}) was created successfully. A
            temporary password was generated and emailed to the user.
          </p>
          <p class="text-caption text-grey-darken-1 mb-2">
            This password is shown only once. Copy it now if you need to share it manually.
          </p>
          <v-text-field
            :model-value="generatedPassword"
            label="Temporary password"
            variant="outlined"
            density="comfortable"
            readonly
            append-inner-icon="mdi-content-copy"
            @click:append-inner="copyGeneratedPassword"
          />
        </v-card-text>
        <v-card-actions class="justify-end pa-4 pt-0">
          <v-btn color="primary" @click="closePasswordDialog">Done</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script setup lang="ts">
import { schema } from '~~/forms/userForm'
import VeeForm from '@/components/global/VeeForm.vue'

const { $api } = useNuxtApp()
const loadingStore = useLoadingStore()
const snackbar = useSnackbar()
const router = useRouter()
const clipboard = useCopyToClipboard()

const userFormRef = ref<InstanceType<typeof VeeForm> | null>(null)
const submitting = ref(false)

const showPasswordDialog = ref(false)
const generatedPassword = ref('')
const createdUser = ref<{ name?: string; email?: string } | null>(null)

const selectedRoles = computed(() => {
  return userFormRef!.value?.values?.roles
})

const { data: catalogs } = await useAsyncData('roles-permissions', async () => {
  const [roles, permissions] = await Promise.all([$api.users.getRoles(), $api.users.getPermissions()])

  return {
    roles,
    permissions,
  }
})

const onSubmit = async (values: any) => {
  try {
    submitting.value = true
    loadingStore.loading = true
    const response = await $api.users.createUser(values)

    createdUser.value = { name: response?.name, email: response?.email }
    generatedPassword.value = response?.generated_password ?? ''
    showPasswordDialog.value = true

    snackbar.add({ type: 'success', text: 'User created' })
  } catch (e) {
    console.error(e)
    snackbar.add({ type: 'error', text: 'Error creating user' })
  } finally {
    submitting.value = false
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const copyGeneratedPassword = () => {
  clipboard.copyToClipboard(generatedPassword.value)
}

const closePasswordDialog = () => {
  showPasswordDialog.value = false
  router.push('/system/users')
}
</script>

<style scoped>
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
