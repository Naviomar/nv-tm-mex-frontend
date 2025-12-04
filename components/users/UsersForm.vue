<template>
  <div>
    <VeeForm @submit="onSubmit" :validation-schema="schema" name="User add form" ref="userFormRef">
      <InputText name="name" density="compact" type="text" label="Name" @change="onChangeName" />
      <InputText name="email" density="compact" type="email" label="Email" />
      <InputText name="password" density="compact" type="text" label="Password" />
      <InputText name="password_confirmation" density="compact" type="text" label="Password confirmation" />
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
                :items="catalogs?.roles"
                density="compact"
                item-title="name"
                item-value="id"
                label="Assign Role(s)"
                multiple
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
                return-object
                variant="outlined"
                prepend-inner-icon="mdi-key-variant"
              />
            </div>
          </div>

          <!-- Role Permissions Details -->
          <div v-if="selectedRoles && selectedRoles.length > 0" class="mt-4">
            <v-divider class="mb-4" />
            <div class="text-subtitle-2 font-weight-bold mb-3 d-flex align-center">
              <v-icon size="small" class="mr-2">mdi-information</v-icon>
              Selected Role(s) Permissions
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <v-card
                v-for="role in selectedRoles"
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
            <v-btn color="primary" size="large" type="submit" prepend-icon="mdi-account-plus">
              Add User
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </VeeForm>
  </div>
</template>
<script setup lang="ts">
import { schema } from '~~/forms/userForm'
import VeeForm from '@/components/global/VeeForm.vue'

const { $api } = useNuxtApp()
const loadingStore = useLoadingStore()
const snackbar = useSnackbar()
const router = useRouter()

const userFormRef = ref<InstanceType<typeof VeeForm> | null>(null)

const onChangeName = (e: any) => {
  console.log('onChangeName', e.target.value)
}

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
    loadingStore.loading = true
    const response = await $api.users.createUser(values)

    snackbar.add({ type: 'success', text: 'User created' })

    router.push('/system/users')
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}
</script>
