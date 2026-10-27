<template>
  <div>
    <div v-if="loading" class="py-6 text-center"><v-progress-circular indeterminate color="primary" /></div>

    <template v-else-if="inventory">
      <v-alert v-if="lastResult" type="success" variant="tonal" density="compact" class="mb-3">
        Removed {{ lastResult.removed }} item(s).
        <template #append>
          <v-btn size="small" variant="outlined" prepend-icon="mdi-undo" :loading="undoing" @click="undo">Undo</v-btn>
        </template>
      </v-alert>

      <div class="d-flex align-center mb-3">
        <div class="flex-grow-1 text-body-2">
          <strong>{{ inventory.user.name }}</strong> appears in <strong>{{ inventory.total }}</strong> place(s).
        </div>
        <v-btn size="small" variant="text" @click="setAll(true)">Select all</v-btn>
        <v-btn size="small" variant="text" @click="setAll(false)">None</v-btn>
      </div>

      <v-expansion-panels multiple variant="accordion" class="mb-3">
        <v-expansion-panel v-for="group in groupsWithItems" :key="group.key" elevation="0" class="tm-border">
          <v-expansion-panel-title>
            <v-checkbox-btn
              :model-value="groupState(group.key) === 'all'"
              :indeterminate="groupState(group.key) === 'some'"
              class="flex-grow-0 mr-2"
              @click.stop
              @update:model-value="(v: boolean) => toggleGroup(group, v)"
            />
            <span class="font-weight-medium">{{ group.label }}</span>
            <v-chip size="x-small" class="ml-2">{{ selectedIn(group.key).length }}/{{ group.count }}</v-chip>
            <v-chip v-if="!group.selected_by_default" size="x-small" color="warning" variant="tonal" class="ml-2">review</v-chip>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <div v-if="group.hint" class="text-caption text-medium-emphasis mb-2">{{ group.hint }}</div>
            <div class="items-list">
              <v-checkbox
                v-for="item in group.items"
                :key="item.id"
                v-model="selection[group.key]"
                :value="item.id"
                density="compact"
                hide-details
              >
                <template #label>
                  <span>{{ item.label }}</span>
                  <span v-if="item.detail" class="text-caption text-medium-emphasis ml-2">{{ item.detail }}</span>
                </template>
              </v-checkbox>
            </div>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>

      <div v-if="!groupsWithItems.length" class="text-center text-medium-emphasis py-4">
        This user is not in any notification.
      </div>

      <v-alert v-if="inventory.via_departments?.length" type="info" variant="tonal" density="compact" class="mb-3">
        Also receives as department member:
        <ul class="ml-4">
          <li v-for="d in inventory.via_departments" :key="d.department_id">
            <strong>{{ d.department }}</strong>: {{ d.notifications.join(', ') }}
          </li>
        </ul>
      </v-alert>

      <div v-if="groupsWithItems.length" class="d-flex align-center ga-2">
        <v-text-field v-model="reason" label="Reason (optional)" density="comfortable" variant="outlined" hide-details class="flex-grow-1" />
        <v-btn color="error" prepend-icon="mdi-bell-remove-outline" :disabled="!totalSelected" :loading="saving" @click="confirmDialog = true">
          Remove {{ totalSelected }}
        </v-btn>
      </div>
    </template>

    <v-dialog v-model="confirmDialog" max-width="460">
      <v-card>
        <v-card-title>Remove from {{ totalSelected }} notification(s)?</v-card-title>
        <v-card-text>You can undo it afterwards.</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="confirmDialog = false">Cancel</v-btn>
          <v-btn color="error" :loading="saving" @click="remove">Remove</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ userId: number | string }>()
const emit = defineEmits<{ (e: 'removed', result: any): void }>()

const { $api } = useNuxtApp()
const snackbar = useSnackbar()

const loading = ref(true)
const saving = ref(false)
const undoing = ref(false)
const confirmDialog = ref(false)
const inventory = ref<any>(null)
const selection = ref<Record<string, number[]>>({})
const reason = ref('')
const lastResult = ref<any>(null)

const groupsWithItems = computed(() => (inventory.value?.groups ?? []).filter((g: any) => g.count > 0))
const selectedIn = (key: string) => selection.value[key] ?? []
const totalSelected = computed(() => Object.values(selection.value).reduce((acc, ids) => acc + ids.length, 0))

function groupState(key: string) {
  const group = groupsWithItems.value.find((g: any) => g.key === key)
  const n = selectedIn(key).length
  return n === 0 ? 'none' : n === group?.count ? 'all' : 'some'
}

function toggleGroup(group: any, on: boolean) {
  selection.value[group.key] = on ? group.items.map((i: any) => i.id) : []
}

function setAll(on: boolean) {
  for (const g of groupsWithItems.value) toggleGroup(g, on)
}

function applyInventory(data: any) {
  inventory.value = data
  // Por defecto: todo lo que es notificación; lo que cambia accesos (ejecutivo, aprobador) queda para revisar.
  selection.value = Object.fromEntries((data.groups ?? []).map((g: any) => [g.key, g.selected_by_default ? g.items.map((i: any) => i.id) : []]))
}

async function load() {
  loading.value = true
  try {
    applyInventory(await $api.accountSecurity.notificationFootprint(props.userId))
  } finally {
    loading.value = false
  }
}

async function remove() {
  saving.value = true
  try {
    const payload = Object.fromEntries(Object.entries(selection.value).filter(([, ids]) => ids.length))
    const res: any = await $api.accountSecurity.removeNotifications(props.userId, payload, reason.value || null)
    lastResult.value = res
    applyInventory(res.inventory)
    confirmDialog.value = false
    snackbar.add({ type: 'success', text: `Removed ${res.removed} item(s)` })
    emit('removed', res)
  } finally {
    saving.value = false
  }
}

async function undo() {
  if (!lastResult.value) return
  undoing.value = true
  try {
    const res: any = await $api.accountSecurity.undoAction(lastResult.value.action_id)
    snackbar.add({ type: 'success', text: `Restored ${res.restored} item(s)` })
    lastResult.value = null
    await load()
  } finally {
    undoing.value = false
  }
}

watch(() => props.userId, load)
onMounted(load)
defineExpose({ reload: load })
</script>

<style scoped>
.items-list {
  max-height: 280px;
  overflow-y: auto;
}
</style>
