<template>
  <div>
    <div class="">
      <v-btn color="slate" size="small" variant="outlined" @click="$router.back" class="mb-4">Back</v-btn>
    </div>
    <div class="v-card sm:mx-auto md:mx-auto lg:mx-auto xl:mx-auto shadow-xl rounded-lg">
      <div class="rounded-t-lg h-32 overflow-hidden">
        <img class="object-cover object-top w-full" src="/img/bg/perfil-bg.webp" alt="User profile image" />
      </div>
      <div class="mx-auto w-32 h-32 relative -mt-16 border-4 border-white rounded-full overflow-hidden">
        <img v-if="false" class="object-cover object-center h-32" :src="getUserAvatar" alt="User" />
        <div class="-mx-[78px] -mt-[7px]">
          <ClientOnly fallbackTag="span">
            <RiveAvatar
              src="/rive-files/avatar.riv"
              artboard="Avatar"
              state-machine="State Machine 1"
              autoplay
              width="275px"
            />
          </ClientOnly>
        </div>
        <div class="absolute bottom-0 left-1/2 transform -translate-x-1/2 bg-blue-600 rounded-full z-10">
          <v-btn icon="mdi-pencil-outline" size="x-small" variant="text" color="white" @click="onClickEditRiveAvatar" />
        </div>
        <div class="hidden">
          <v-file-input
            ref="avatarInput"
            v-model="form.avatar"
            class="hidden"
            accept="image/*"
            @change="onFileChange"
          />
        </div>
      </div>
      <div class="text-center mt-2">
        <h2 class="font-semibold">{{ user?.name }}</h2>
        <h2 class="font-normal">{{ user?.email }}</h2>
        <p class="">
          <v-chip v-for="(role, index) in user?.roles" :key="`role-${index}`" color="primary" class="mr-2">
            {{ role.name }}
          </v-chip>
        </p>
      </div>
      <div class="py-4 mt-2 flex items-center justify-around">
        <v-tabs v-model="tab" density="compact">
          <v-tab value="1">Details</v-tab>
          <v-tab value="2">Auth Requests</v-tab>
          <v-tab value="6">Req. Assist</v-tab>
          <v-tab value="3">Roles / Permissions</v-tab>
          <v-tab value="4">Direct permissions</v-tab>
          <v-tab value="5">Security</v-tab>
        </v-tabs>
      </div>
      <div class="py-4 mt-2 px-8">
        <v-window v-model="tab">
          <v-window-item value="1">
            <div class="border-t border-gray-200 px-4 py-5 sm:p-0">
              <dl class="sm:divide-y sm:divide-gray-200">
                <div class="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt class="text-sm font-medium">Full name</dt>
                  <dd class="mt-1 text-sm sm:mt-0 sm:col-span-2">{{ user?.name }}</dd>
                </div>
                <div class="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt class="text-sm font-medium">Email address</dt>
                  <dd class="mt-1 text-sm sm:mt-0 sm:col-span-2">{{ user?.email }}</dd>
                </div>
                <div class="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt class="text-sm font-medium">Email verified?</dt>
                  <dd class="mt-1 text-sm sm:mt-0 sm:col-span-2">
                    {{ user?.email_verified_at ? 'Yes' : 'No' }}
                  </dd>
                </div>
                <div class="py-3">
                  <NuxtLink to="/system/departments/manage-user-permissions">
                    <v-btn color="primary" size="small">Manage user permissions</v-btn>
                  </NuxtLink>
                </div>
                <div v-for="(department, index) in user?.departments" :key="`department-${index}`">
                  <div class="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt class="text-sm font-medium">Department</dt>
                    <dd class="mt-1 text-sm sm:mt-0 sm:col-span-2 font-bold">
                      {{ department.name }} - {{ department.pivot?.department_type }}
                    </dd>
                  </div>
                  <div class="py-1 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt class="text-sm font-medium">Permissions</dt>
                    <dd class="text-sm sm:mt-0 sm:col-span-2">
                      <v-chip
                        v-for="(permission, index2) in department.permissions"
                        :key="`department-${index}-permission-${index2}`"
                        variant="tonal"
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
          <v-window-item value="2">
            <UserAuthRequests />
          </v-window-item>
          <v-window-item value="6">
            <UserReqAssistances />
          </v-window-item>
          <v-window-item value="3">
            <div class="border-t border-gray-200">
              <dl class="sm:divide-y sm:divide-gray-200">
                <div v-for="(role, index) in user?.roles" :key="`role-${index}`">
                  <div class="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt class="text-sm font-medium">Role</dt>
                    <dd class="text-sm sm:mt-0 sm:col-span-2">
                      <v-chip color="red" class="mr-2">
                        {{ role.name }}
                      </v-chip>
                    </dd>
                  </div>
                  <div class="py-1 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt class="text-sm font-medium">Permissions</dt>
                    <dd class="text-sm sm:mt-0 sm:col-span-2">
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
          <v-window-item value="4">
            <div class="border-t border-gray-200">
              <dl class="sm:divide-y sm:divide-gray-200">
                <div class="py-1 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dd class="text-sm sm:mt-0 sm:col-span-2">
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
          <v-window-item value="5">
            <UserUpdatePassword />
          </v-window-item>
        </v-window>
      </div>
      <div class="p-4 border-t mx-8 mt-2 text-center">
        <v-chip v-if="user?.deleted_at == null" color="green">Active</v-chip>
        <v-chip v-if="user?.deleted_at != null" color="red">Inactive</v-chip>
      </div>
    </div>

    <v-dialog v-model="avatarDialog" max-width="500px">
      <v-card>
        <v-card-title class="text-h6">Change your avatar</v-card-title>
        <v-card-text>
          <div class="flex justify-center mb-4">
            <ClientOnly fallbackTag="span">
              <RiveAvatar
                src="/rive-files/avatar.riv"
                artboard="Avatar"
                state-machine="State Machine 1"
                autoplay
                width="275px"
              />
            </ClientOnly>
          </div>
          <div class="grid grid-cols-2 gap-0">
            <div>Hair</div>
            <v-number-input
              v-model="form.hair"
              density="compact"
              control-variant="split"
              :min="0"
              :max="10"
              @update:modelValue="(value) => updateAvatar('hair', value)"
            />
            <div>Face hair</div>
            <v-number-input
              v-model="form.faceHair"
              density="compact"
              :min="0"
              :max="3"
              control-variant="split"
              @update:modelValue="(value) => updateAvatar('faceHair', value)"
            />
            <div>Eyes</div>
            <v-number-input
              v-model="form.eyes"
              density="compact"
              control-variant="split"
              :min="0"
              :max="2"
              @update:modelValue="(value) => updateAvatar('eyes', value)"
            />
            <div>Body color</div>
            <v-number-input
              v-model="form.bodyColor"
              density="compact"
              control-variant="split"
              :min="0"
              :max="3"
              @update:modelValue="(value) => updateAvatar('bodyColor', value)"
            />
            <div>Background color</div>
            <v-number-input
              v-model="form.backgroundColor"
              density="compact"
              control-variant="split"
              :min="0"
              :max="3"
              @update:modelValue="(value) => updateAvatar('backgroundColor', value)"
            />
          </div>
        </v-card-text>
        <v-card-actions>
          <v-btn color="red" size="small" @click="avatarDialog = false">Cancel</v-btn>
          <v-btn color="primary" size="small" @click="saveAvatarConfig">Save changes</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script setup lang="ts">
const { $api } = useNuxtApp()
const route = useRoute()
const loadingStore = useLoadingStore()
const snackbar = useSnackbar()
const { refreshIdentity } = useSanctumAuth()

const tab = ref(0)
const avatarInput = ref<HTMLInputElement>()

const avatarStore = useAvatarStore()

const form = reactive({
  avatar: null,
  hair: avatarStore.hair,
  faceHair: avatarStore.faceHair,
  eyes: avatarStore.eyes,
  bodyColor: avatarStore.bodyColor,
  backgroundColor: avatarStore.backgroundColor,
})

const user = ref<any>(null)
const avatarDialog = ref(false)

const getUserAvatar = computed(() => {
  return user.value?.avatar_url ? user.value.avatar_url : '/img/avatar/user-account.png'
})

const onFileChange = async () => {
  try {
    loadingStore.start()
    const body = {
      avatar: form.avatar,
    }
    await $api.users.updateUserAvatar(body)
    snackbar.add({ type: 'success', text: 'Avatar updated successfully' })
    const response = await $api.users.getMyProfile()
    user.value = response
    refreshIdentity()
  } catch (e: any) {
    console.error(e)
    avatarInput.value!.value = ''
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const saveAvatarConfig = async () => {
  try {
    loadingStore.start()
    const body = {
      hair: form.hair,
      faceHair: form.faceHair,
      eyes: form.eyes,
      bodyColor: form.bodyColor,
      backgroundColor: form.backgroundColor,
    }
    await $api.users.updateAvatarConfig({ avatar_config: body })
    snackbar.add({ type: 'success', text: 'Avatar updated successfully' })
    avatarDialog.value = false
  } catch (e: any) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const onClickEditAvatar = () => {
  avatarInput.value!.click()
}

const onClickEditRiveAvatar = () => {
  avatarDialog.value = true
}

const updateAvatar = (field: string, value: number) => {
  avatarStore[`set${capitalize(field)}`](value) // Dynamically call the store's setter
}

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

onMounted(async () => {
  const response = await $api.users.getMyProfile()
  user.value = response
})
</script>
