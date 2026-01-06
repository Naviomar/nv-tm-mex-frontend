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

          <!-- Alerts Button -->
          <AlertsButton />

          <!-- Chat Button with Badge -->
          <v-badge v-if="showNewMessage" color="red" content="!" overlap offset-x="8" offset-y="8">
            <v-btn variant="text" icon="mdi-message-fast-outline" @click.stop="toggleChatDrawer" />
          </v-badge>

          <!-- Fallback button if no new message -->
          <v-btn v-else variant="text" icon="mdi-message-fast-outline" @click.stop="toggleChatDrawer" />
        </v-app-bar>

        <NavRightDrawer
          :show="drawerRight"
          @new-message="showNewMessage = $event"
          @close="drawerRight = false"
        />
        <AlertsDrawer />
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
            <v-btn
              v-if="showRepositionDraggable"
              size="small"
              color="primary"
              variant="tonal"
              icon="mdi-target"
              title="Recentrar panel flotante"
              @click="repositionDraggable"
            />
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
const { connect: connectAlertsSocket, disconnect: disconnectAlertsSocket } = useAlertsSocket()

const currentYear = computed(() => new Date().getFullYear())
const appName = computed(() => config.public.appName)
const drawer = ref(true)
const drawerRight = ref(false)
const showNewMessage = ref(false)
const showRepositionDraggable = ref(false)

const toggleChatDrawer = () => {
  drawerRight.value = !drawerRight.value
  showNewMessage.value = false // clear badge when user toggles chat
}

const repositionDraggable = () => {
  if (import.meta.client) {
    window.dispatchEvent(new CustomEvent('nv-tm:draggable-reposition'))
  }
}

const DRAGGABLE_COUNT_KEY = '__nv_tm_draggable_count__'

const updateRepositionVisibility = (count: number) => {
  showRepositionDraggable.value = count > 0
}

const onDraggablePresence = (event: Event) => {
  const anyEvent = event as any
  updateRepositionVisibility(Number(anyEvent?.detail?.count ?? 0))
}

onMounted(() => {
  if (!import.meta.client) return

  const w = window as any
  updateRepositionVisibility(Number(w[DRAGGABLE_COUNT_KEY] ?? 0))
  window.addEventListener('nv-tm:draggable-presence', onDraggablePresence)
  
  // Connect to alerts socket
  connectAlertsSocket()
})

onBeforeUnmount(() => {
  if (!import.meta.client) return
  window.removeEventListener('nv-tm:draggable-presence', onDraggablePresence)
  
  // Disconnect alerts socket
  disconnectAlertsSocket()
})

const goToHome = () => {
  router.push('/')
}
</script>
