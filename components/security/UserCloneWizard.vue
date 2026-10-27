<template>
  <div>
    <!-- Origen y destino -->
    <div class="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-2 items-center mb-2">
      <v-autocomplete
        v-model="sourceId"
        :items="users"
        :item-title="userTitle"
        item-value="id"
        label="Copy from (source)"
        prepend-inner-icon="mdi-account-arrow-right-outline"
        density="comfortable"
        variant="outlined"
        hide-details
      />
      <v-btn icon="mdi-swap-horizontal" variant="text" :disabled="!sourceId || !targetId" title="Swap" @click="swap" />
      <v-autocomplete
        v-model="targetId"
        :items="users.filter((u: any) => u.id !== sourceId)"
        :item-title="userTitle"
        item-value="id"
        label="Copy to (target)"
        prepend-inner-icon="mdi-account-arrow-left-outline"
        density="comfortable"
        variant="outlined"
        hide-details
      />
    </div>
    <div v-if="hasPermission(SECURITY_PERMISSIONS.createUser)" class="text-caption mb-4">
      <NuxtLink to="/system/users/create" class="text-primary">+ New user</NuxtLink>
    </div>

    <div v-if="loading" class="py-6 text-center"><v-progress-circular indeterminate color="primary" /></div>

    <template v-else-if="preview">
      <v-expansion-panels multiple variant="accordion" class="mb-3">
        <v-expansion-panel v-for="block in preview.blocks.filter((b: any) => b.count > 0)" :key="block.key" elevation="0" class="tm-border">
          <v-expansion-panel-title>
            <v-checkbox-btn v-model="blocks" :value="block.key" :disabled="!block.new" class="flex-grow-0 mr-2" @click.stop />
            <span class="font-weight-medium">{{ block.label }}</span>
            <v-chip size="x-small" :color="block.new ? 'primary' : 'grey'" class="ml-2">{{ block.new }} new</v-chip>
            <span v-if="block.count > block.new" class="text-caption text-medium-emphasis ml-2">{{ block.count - block.new }} already on target</span>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <div v-if="block.hint" class="text-caption text-medium-emphasis mb-2">{{ block.hint }}</div>
            <div class="items-list">
              <div v-for="item in block.items" :key="`${block.key}-${item.id}`" class="d-flex align-center text-body-2 py-1">
                <v-icon size="16" :color="item.on_target ? 'grey' : 'primary'" class="mr-2">
                  {{ item.on_target ? 'mdi-check' : 'mdi-plus' }}
                </v-icon>
                <span :class="{ 'text-medium-emphasis': item.on_target }">{{ item.label }}</span>
                <span v-if="item.detail" class="text-caption text-medium-emphasis ml-2">{{ item.detail }}</span>
              </div>
            </div>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
      <div v-if="!preview.blocks.some((b: any) => b.count > 0)" class="text-center text-medium-emphasis py-4">The source user has nothing to copy.</div>

      <!-- Rotación de personal -->
      <v-card elevation="0" class="tm-border pa-3 mb-3">
        <div class="text-subtitle-2 mb-1"><v-icon size="18" class="mr-1">mdi-account-switch-outline</v-icon>Staff rotation</div>
        <v-checkbox
          v-if="hasPermission(SECURITY_PERMISSIONS.removeNotifications)"
          v-model="removeSourceNotifications"
          density="compact"
          hide-details
          :label="`Then remove ${preview.source.name} from all notifications`"
        />
        <v-checkbox
          v-if="hasPermission(SECURITY_PERMISSIONS.deactivateUser) && preview.source.is_active"
          v-model="deactivateSource"
          density="compact"
          hide-details
          :label="`Then deactivate ${preview.source.name}`"
        />
      </v-card>

      <div class="d-flex align-center ga-2">
        <v-text-field v-model="reason" label="Reason (optional)" density="comfortable" variant="outlined" hide-details class="flex-grow-1" />
        <v-btn color="primary" prepend-icon="mdi-account-multiple-plus-outline" :disabled="!blocks.length" :loading="saving" @click="apply">
          Clone
        </v-btn>
      </div>
    </template>

    <v-alert v-if="result" type="success" variant="tonal" class="mt-4">
      <div class="font-weight-medium mb-1">Done</div>
      <div>{{ result.total }} item(s) added to {{ result.targetName }}.</div>
      <div v-if="result.removed !== null">{{ result.removed }} notification(s) removed from {{ result.sourceName }}.</div>
      <div v-if="result.deactivated">{{ result.sourceName }} was deactivated.</div>
    </v-alert>
  </div>
</template>

<script setup lang="ts">
import { SECURITY_PERMISSIONS } from '~/utils/security/permissions'

const props = defineProps<{ sourceUserId?: number | null; targetUserId?: number | null }>()
const emit = defineEmits<{ (e: 'done'): void }>()

const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const { hasPermission } = useCheckUser()

const users = ref<any[]>([])
const sourceId = ref<number | null>(props.sourceUserId ?? null)
const targetId = ref<number | null>(props.targetUserId ?? null)
const preview = ref<any>(null)
const blocks = ref<string[]>([])
const loading = ref(false)
const saving = ref(false)
const reason = ref('')
const removeSourceNotifications = ref(false)
const deactivateSource = ref(false)
const result = ref<any>(null)

const userTitle = (u: any) => `${u.name} · ${u.email}${u.is_active ? '' : ' (inactive)'}`

function swap() {
  ;[sourceId.value, targetId.value] = [targetId.value, sourceId.value]
}

watch([sourceId, targetId], loadPreview)

async function loadPreview() {
  preview.value = null
  result.value = null
  if (!sourceId.value || !targetId.value || sourceId.value === targetId.value) return
  loading.value = true
  try {
    preview.value = await $api.accountSecurity.clonePreview(targetId.value, sourceId.value)
    blocks.value = preview.value.blocks.filter((b: any) => b.new > 0).map((b: any) => b.key)
  } finally {
    loading.value = false
  }
}

async function apply() {
  if (!preview.value) return
  saving.value = true
  const sourceName = preview.value.source.name
  const targetName = preview.value.target.name
  try {
    const res: any = await $api.accountSecurity.cloneFrom(targetId.value!, { source_user_id: sourceId.value!, blocks: blocks.value, reason: reason.value || null })
    let removed: number | null = null
    let deactivated = false

    if (removeSourceNotifications.value) {
      const inventory: any = await $api.accountSecurity.notificationFootprint(sourceId.value!)
      const selection = Object.fromEntries(
        inventory.groups.filter((g: any) => g.selected_by_default && g.count).map((g: any) => [g.key, g.items.map((i: any) => i.id)]),
      )
      removed = Object.keys(selection).length
        ? ((await $api.accountSecurity.removeNotifications(sourceId.value!, selection, reason.value || `Rotation to ${targetName}`)) as any).removed
        : 0
    }

    if (deactivateSource.value && preview.value.source.is_active) {
      // delete-user alterna is_active; solo se llama si sigue activo.
      await $api.users.deleteUser(String(sourceId.value))
      deactivated = true
    }

    result.value = { total: res.total, targetName, sourceName, removed, deactivated }
    snackbar.add({ type: 'success', text: `Cloned ${res.total} item(s) to ${targetName}` })
    preview.value = null
    emit('done')
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  const cat: any = await $api.accountSecurity.catalogs()
  users.value = cat.users
  if (sourceId.value && targetId.value) await loadPreview()
})
</script>

<style scoped>
.items-list {
  max-height: 240px;
  overflow-y: auto;
}
</style>
