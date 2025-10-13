<template>
  <div>
    <VeeForm @submit="onSubmit" :validation-schema="schema" name="User add form" ref="userFormRef">
      <InputText name="name" density="compact" type="text" label="Name" @change="onChangeName" />
      <InputText name="email" density="compact" type="email" label="Email" />
      <InputText name="password" density="compact" type="text" label="Password" />
      <InputText name="password_confirmation" density="compact" type="text" label="Password confirmation" />
      <v-card>
        <v-card-title>Roles and permissions</v-card-title>
        <v-card-text>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <InputAutocomplete
                name="roles"
                :items="catalogs?.roles"
                density="compact"
                item-title="name"
                item-value="id"
                label="Role(s)"
                multiple
                return-object
              />
            </div>
            <div>
              <div class="font-bold">Role(s) selected permission details:</div>
              <div v-for="role in selectedRoles" :key="`role-${role.id}`" class="mb-4">
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

          <InputAutocomplete
            name="permissions"
            :items="catalogs?.permissions"
            item-title="name"
            item-value="id"
            label="Direct permission(s)"
            density="compact"
            multiple
            return-object
          />

          <div class="text-right">
            <v-btn color="primary" class="my-4" type="submit">Add user</v-btn>
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
