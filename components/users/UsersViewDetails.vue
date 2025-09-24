<template>
  <div>
    <div class="mx-4">
      <v-btn color="slate" size="small" variant="outlined" to="/system/users" class="mb-4">Back</v-btn>
    </div>
    <div class="mx-4 sm:mx-auto md:mx-auto lg:mx-auto xl:mx-auto mt-2 bg-white shadow-xl rounded-lg text-gray-900">
      <div class="rounded-t-lg h-32 overflow-hidden">
        <img class="object-cover object-top w-full" src="/img/bg/perfil-bg.webp" alt="User profile image" />
      </div>
      <div class="mx-auto w-32 h-32 relative -mt-16 border-4 border-white rounded-full overflow-hidden">
        <img class="object-cover object-center h-32" src="/img/avatar/user-account.png" alt="Woman looking front" />
      </div>
      <div class="text-center mt-2">
        <h2 class="font-semibold">{{ user?.name }}</h2>
        <h2 class="font-normal">{{ user?.email }}</h2>
        <p class="text-gray-500">
          <v-chip v-for="(role, index) in user?.roles" :key="`role-${index}`" color="primary" class="mr-2">
            {{ role.name }}
          </v-chip>
        </p>
      </div>
      <div class="py-4 mt-2 text-gray-700 flex items-center justify-around">
        <v-tabs v-model="tab" density="compact">
          <v-tab value="1">Details</v-tab>
          <v-tab value="2">Roles / Permissions</v-tab>
          <v-tab value="3">Direct permissions</v-tab>
          <v-tab value="4">Security</v-tab>
        </v-tabs>
      </div>
      <div class="py-4 mt-2 text-gray-700 px-8">
        <v-window v-model="tab">
          <v-window-item value="1">
            <div class="border-t border-gray-200 px-4 py-5 sm:p-0">
              <dl class="sm:divide-y sm:divide-gray-200">
                <div class="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt class="text-sm font-medium text-gray-500">Full name</dt>
                  <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{{ user?.name }}</dd>
                </div>
                <div class="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt class="text-sm font-medium text-gray-500">Email address</dt>
                  <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{{ user?.email }}</dd>
                </div>
                <div class="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt class="text-sm font-medium text-gray-500">Email verified?</dt>
                  <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {{ user?.email_verified_at ? 'Yes' : 'No' }}
                  </dd>
                </div>
              </dl>
            </div>
          </v-window-item>
          <v-window-item value="2">
            <div class="border-t border-gray-200">
              <dl class="sm:divide-y sm:divide-gray-200">
                <div v-for="(role, index) in user?.roles" :key="`role-${index}`">
                  <div class="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt class="text-sm font-medium text-gray-500">Role</dt>
                    <dd class="text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      <v-chip color="red" class="mr-2">
                        {{ role.name }}
                      </v-chip>
                    </dd>
                  </div>
                  <div class="py-1 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt class="text-sm font-medium text-gray-500">Permissions</dt>
                    <dd class="text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      <v-chip
                        v-for="(permission, index2) in role.permissions"
                        :key="`role-${index}-permission-${index2}`"
                        color="primary"
                        class="mr-2 mb-2"
                      >
                        {{ permission.name }}
                      </v-chip>
                    </dd>
                  </div>
                </div>
              </dl>
            </div>
          </v-window-item>
          <v-window-item value="3">
            <div class="border-t border-gray-200">
              <dl class="sm:divide-y sm:divide-gray-200">
                <div class="py-1 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dd class="text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <div v-if="user?.permissions.length === 0">No permissions attached</div>
                    <div v-if="user?.permissions.length > 0">
                      <div class="font-bold mb-4">These permission(s) are enabale for the user.</div>
                      <v-chip
                        v-for="(permission, index) in user?.permissions"
                        :key="`permission-${index}`"
                        color="primary"
                        class="mr-2"
                      >
                        {{ permission.name }}
                      </v-chip>
                    </div>
                  </dd>
                </div>
              </dl>
            </div>
          </v-window-item>
          <v-window-item value="4">
            <div class="flex justify-center">
              <v-card class="w-full md:w-3/4">
                <v-card-title>Update password</v-card-title>
                <v-card-text>
                  <div>
                    <InputText name="password" density="compact" type="text" label="Password" />
                  </div>
                  <div>
                    <InputText
                      name="password_confirmation"
                      density="compact"
                      type="text"
                      label="Password confirmation"
                    />
                  </div>
                  <div>
                    <v-btn color="primary" class="my-4" @click="updatePasswordClick">Update password</v-btn>
                  </div>
                </v-card-text>
              </v-card>
            </div>
          </v-window-item>
        </v-window>
      </div>
      <div class="p-4 border-t mx-8 mt-2 text-center">
        <v-chip v-if="user?.is_active === 1" color="green">Active</v-chip>
        <v-chip v-if="user?.is_active === 0" color="red">Inactive</v-chip>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
const route = useRoute()
const { $api } = useNuxtApp()

const tab = ref(0)

const response = await $api.users.getUserById(route.params.id as string)
const user = ref(response)

const updatePasswordClick = async () => {
  console.log('updatePasswordClick')
}
</script>
