<template>
  <v-dialog :model-value="modelValue" max-width="640" persistent scrollable @update:model-value="close">
    <v-card>
      <v-card-title class="text-h6 d-flex align-center ga-2 pt-4 px-6">
        <v-icon>mdi-shield-lock-outline</v-icon>
        {{ tpl.title || 'Request Authorization' }}
      </v-card-title>

      <v-card-text class="px-6" style="max-height: 72vh">
        <p class="text-sm text-medium-emphasis mb-3">
          One request will be created for each of the {{ items.length }} selected invoices. Approvers will receive a single
          notice and can answer them all at once.
        </p>

        <template v-for="el in tpl.elements" :key="el.id">
          <v-alert
            v-if="el.type === 'alert_block'"
            :type="(el as any).alert_type"
            variant="tonal"
            density="compact"
            class="mb-3"
          >
            {{ (el as any).alert_text }}
          </v-alert>
        </template>

        <div class="text-caption text-uppercase font-weight-bold text-disabled mb-1">Invoices ({{ items.length }})</div>
        <div class="tm-panel tm-border rounded mb-3 batch-items">
          <div v-for="item in items" :key="item.id" class="d-flex align-center px-3 py-1 ga-2">
            <span class="font-weight-medium text-body-2">{{ item.folio }}</span>
            <span class="text-caption text-medium-emphasis text-truncate flex-grow-1">{{ item.supplier }}</span>
            <span v-if="item.total" class="text-caption">{{ item.total }}</span>
            <v-btn
              icon="mdi-close"
              size="x-small"
              variant="text"
              title="Remove from this request"
              :disabled="items.length <= 1 || saving"
              @click="emit('remove', item.id)"
            />
          </div>
        </div>

        <v-textarea
          v-model="reason"
          :label="tpl.reason?.label || 'Justification'"
          :rows="tpl.reason?.rows ?? 3"
          counter
          clearable
        />

        <FileDropZone v-model="files" label="Supporting documents (optional)" />

        <v-divider class="my-3" />
        <div class="text-caption text-uppercase font-weight-bold text-disabled mb-1">Who will carry it out once approved?</div>
        <div class="text-caption text-medium-emphasis mb-3">
          You can always do it yourself. Add a department (any of its members can do it) and/or specific people.
        </div>
        <v-autocomplete
          v-model="assignment.departmentId"
          :items="departmentOptions"
          item-title="name"
          item-value="id"
          label="Department (optional)"
          :loading="loadingAssignment"
          prepend-inner-icon="mdi-domain"
          density="compact"
          clearable
          hide-details
          class="mb-3"
        />
        <v-autocomplete
          v-model="assignment.userIds"
          :items="userOptions"
          item-title="name"
          item-value="id"
          label="People (optional)"
          :loading="loadingAssignment"
          prepend-inner-icon="mdi-account-multiple-plus-outline"
          density="compact"
          multiple
          chips
          closable-chips
          clearable
          hide-details
        />
      </v-card-text>

      <v-divider />
      <v-card-actions class="px-6 py-3">
        <v-spacer />
        <v-btn variant="text" :disabled="saving" @click="close">Cancel</v-btn>
        <v-btn color="success" variant="flat" :loading="saving" @click="submit">
          {{ tpl.buttons?.submit || 'Submit request' }} ({{ items.length }})
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import type { IRequestBatchResult } from '~/repository/modules/catalogs/authProcessRequests'

export interface IBatchRequestItem {
  id: number | string
  folio: string
  supplier?: string | null
  total?: string | null
}

const PROCESS_NAME = 'supplier-work-past-date'

const props = defineProps<{
  modelValue: boolean
  items: IBatchRequestItem[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'remove', id: number | string): void
  (e: 'done', result: IBatchRequestResult): void
}>()

type IBatchRequestResult = IRequestBatchResult

const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const { user: currentUser } = useCheckUser()
const { getTemplate, loadCatalog } = useRequestTypeCatalog()

const tpl = computed(() => getTemplate(PROCESS_NAME))

const saving = ref(false)
const reason = ref('')
const files = ref<File[]>([])
const assignment = ref<{ departmentId: number | null; userIds: number[] }>({ departmentId: null, userIds: [] })
const departmentOptions = ref<any[]>([])
const userOptions = ref<any[]>([])
const loadingAssignment = ref(false)

async function loadAssignmentOptions() {
  if (departmentOptions.value.length && userOptions.value.length) return
  loadingAssignment.value = true
  try {
    const [departments, users] = await Promise.all([
      ($api as any).departments.getAllDepartments(),
      ($api as any).users.getAllUsers(),
    ])
    departmentOptions.value = (departments as any[]) ?? []
    userOptions.value = ((users as any[]) ?? []).filter((u: any) => u.id !== currentUser.value?.id)
  } catch (e) {
    console.error(e)
  } finally {
    loadingAssignment.value = false
  }
}

watch(
  () => props.modelValue,
  (open) => {
    if (!open) return
    // Refresh the template so recent edits are reflected
    loadCatalog(true)
    loadAssignmentOptions()
  },
)

function close() {
  if (saving.value) return
  emit('update:modelValue', false)
}

async function submit() {
  if (tpl.value.reason?.required !== false && !reason.value.trim()) {
    snackbar.add({ type: 'error', text: 'Please provide a reason for the authorization request' })
    return
  }

  saving.value = true
  try {
    const result = await $api.authProcessRequests.requestBatch({
      process_name: PROCESS_NAME,
      request_keys: props.items.map((item) => item.id),
      reason: reason.value.trim(),
      department_id: assignment.value.departmentId,
      executor_user_ids: assignment.value.userIds,
      files: files.value,
    })

    const created = result.created.length
    snackbar.add({ type: 'success', text: `${created} authorization request${created === 1 ? '' : 's'} sent` })
    if (result.skipped.length) {
      const detail = result.skipped.map((s) => `${s.label ?? s.request_key}: ${s.message}`).join(' · ')
      snackbar.add({ type: 'warning', text: `${result.skipped.length} skipped — ${detail}` })
    }

    reason.value = ''
    files.value = []
    assignment.value = { departmentId: null, userIds: [] }
    emit('done', result)
    emit('update:modelValue', false)
  } catch (e) {
    // The request layer already reports the server message
    console.error(e)
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.batch-items {
  max-height: 220px;
  overflow-y: auto;
}
</style>
