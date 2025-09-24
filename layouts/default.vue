<template>
  <div>
    <v-app class="rounded-md">
      <v-theme-provider>
        <v-app-bar class="" color="">
          <v-app-bar-nav-icon variant="text" @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
          <v-app-bar-title class="ml-3!">
            <div class="flex items-center">
              <img
                :src="darkMode.isDark ? '/tm-logo.png' : '/tm-logo-black.png'"
                width="120"
                class="cursor-pointer"
                @click="goToHome"
              />
              {{ appName }}
            </div>
          </v-app-bar-title>

          <SwitchDarkLightMode />

          <UserInfoNav path="/profile" />

          <!-- Chat Button with Badge -->
          <v-badge v-if="showNewMessage" color="red" content="!" overlap offset-x="8" offset-y="8">
            <v-btn variant="text" icon="mdi-message-fast-outline" @click.stop="toggleChatDrawer" />
          </v-badge>

          <!-- Fallback button if no new message -->
          <v-btn v-else variant="text" icon="mdi-message-fast-outline" @click.stop="toggleChatDrawer" />
        </v-app-bar>

        <NavRightDrawer :show="drawerRight" @new-message="showNewMessage = $event" />
        <v-navigation-drawer v-model="drawer" rail expand-on-hover class="group">
          <MainMenu />
        </v-navigation-drawer>

        <v-main class="bg-main">
          <div><slot></slot></div>
        </v-main>

        <v-footer name="footer" app class="justify-end">
          <div class="flex items-center gap-4">
            <DivisaWidget />
            <div class="flex gap-2 text-sm">
              <SystemVersion />
            </div>
            <SupportAssist />
            <SupportDial />
          </div>
        </v-footer>
        <SnackbarApiErrors />
        <AuthVisibility />
        <OverlayLoading />
      </v-theme-provider>
    </v-app>
  </div>
</template>
<script lang="ts" setup>
const darkMode = useDarkMode()
const config = useRuntimeConfig()
const router = useRouter()

const currentYear = computed(() => new Date().getFullYear())
const appName = computed(() => config.public.appName)
const drawer = ref(true)
const drawerRight = ref(false)
const showNewMessage = ref(false)

const toggleChatDrawer = () => {
  drawerRight.value = !drawerRight.value
  showNewMessage.value = false // clear badge when user toggles chat
}

const goToHome = () => {
  router.push('/')
}
</script>
