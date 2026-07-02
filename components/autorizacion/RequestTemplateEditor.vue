<template>
  <v-dialog v-model="open" persistent max-width="1280" content-class="canvas-dialog">
    <v-card class="canvas-root">
      <!-- ── Top bar ──────────────────────────────────────────── -->
      <v-toolbar density="compact" class="canvas-toolbar border-b">
        <v-icon class="ml-2 mr-2">mdi-palette-outline</v-icon>
        <v-toolbar-title class="text-body-2 font-weight-medium">
          Template editor — <span class="text-medium-emphasis">{{ props.requestType?.code }}</span>
        </v-toolbar-title>
        <v-spacer />
        <v-btn variant="text" size="small" :loading="saving" color="primary" @click="save">
          <v-icon start>mdi-content-save-outline</v-icon>Save
        </v-btn>
        <v-btn variant="text" size="small" @click="close">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>

      <!-- ── Two-panel canvas ─────────────────────────────────── -->
      <div class="canvas-panels">
        <!-- ── LEFT: editor ─────────────────────────────────── -->
        <div class="canvas-left">
          <div class="canvas-scroll">
            <!-- Global settings -->
            <div class="canvas-section-label">Global settings</div>

            <v-text-field
              v-model="draft.title"
              label="Title"
              density="compact"
              variant="outlined"
              clearable
              class="mb-2"
            />
            <v-textarea
              v-model="draft.subtitle"
              label="Subtitle / instructions"
              density="compact"
              variant="outlined"
              rows="2"
              auto-grow
              class="mb-2"
            />

            <div class="canvas-section-label mt-1">Reason field</div>
            <v-switch
              v-model="draft.reason.show"
              label="Show reason field"
              density="compact"
              color="primary"
              hide-details
              class="mb-1"
            />
            <template v-if="draft.reason.show">
              <v-text-field
                v-model="draft.reason.label"
                label="Label"
                density="compact"
                variant="outlined"
                class="mb-2"
              />
              <div class="d-flex gap-2 mb-2">
                <v-switch
                  v-model="draft.reason.required"
                  label="Required"
                  density="compact"
                  color="primary"
                  hide-details
                />
                <v-text-field
                  v-model.number="draft.reason.rows"
                  label="Rows"
                  type="number"
                  density="compact"
                  variant="outlined"
                  style="max-width:90px"
                  hide-details
                />
              </div>
            </template>

            <div class="canvas-section-label mt-1">Button labels</div>
            <div class="d-flex gap-2 mb-2">
              <v-text-field
                v-model="draft.buttons.submit"
                label="Submit button"
                density="compact"
                variant="outlined"
                hide-details
              />
              <v-text-field
                v-model="draft.buttons.cancel"
                label="Cancel button"
                density="compact"
                variant="outlined"
                hide-details
              />
            </div>

            <!-- Elements list -->
            <div class="canvas-section-label mt-2 d-flex align-center justify-space-between">
              <span>Elements</span>
              <v-menu>
                <template #activator="{ props: mp }">
                  <v-btn v-bind="mp" size="x-small" variant="tonal" color="primary" prepend-icon="mdi-plus">
                    Add
                  </v-btn>
                </template>
                <v-list density="compact">
                  <v-list-item prepend-icon="mdi-alert-circle-outline" title="Alert block" @click="addElement('alert_block')" />
                  <v-list-item prepend-icon="mdi-text" title="Text block" @click="addElement('text_block')" />
                  <v-list-item prepend-icon="mdi-format-header-2" title="Section header" @click="addElement('section')" />
                  <v-list-item prepend-icon="mdi-form-textbox" title="Form field" @click="addElement('form_field')" />
                  <v-divider />
                  <v-list-subheader>Code-driven</v-list-subheader>
                  <v-list-item prepend-icon="mdi-layers-plus" title="Charge builder" @click="addElement('charge_builder')" />
                </v-list>
              </v-menu>
            </div>

            <!-- Drag & drop element list -->
            <div class="element-list mt-1" @dragover.prevent>
              <div
                v-for="(el, idx) in draft.elements"
                :key="el.id"
                class="element-row"
                :class="{ 'element-row--drag-over': dragOverIdx === idx }"
                draggable="true"
                @dragstart="onDragStart(idx)"
                @dragover.prevent="dragOverIdx = idx"
                @dragleave="dragOverIdx = null"
                @drop.prevent="onDrop(idx)"
                @dragend="dragOverIdx = null"
              >
                <v-icon class="drag-handle" size="16" color="grey">mdi-drag-vertical</v-icon>

                <!-- Element type chip -->
                <v-chip
                  :color="elementColor(el.type)"
                  size="x-small"
                  class="mr-1 flex-shrink-0"
                  style="font-size:10px"
                >
                  {{ elementLabel(el.type) }}
                </v-chip>

                <!-- Summary text -->
                <span class="element-summary text-truncate flex-grow-1">
                  {{ elementSummary(el) }}
                </span>

                <!-- Edit button (disabled for code-driven elements) -->
                <v-tooltip v-if="el.type === 'charge_builder'" text="Code-driven — not configurable" location="top">
                  <template #activator="{ props: tp }">
                    <v-btn v-bind="tp" icon size="x-small" variant="text" disabled>
                      <v-icon size="14">mdi-lock-outline</v-icon>
                    </v-btn>
                  </template>
                </v-tooltip>
                <v-btn
                  v-else
                  icon
                  size="x-small"
                  variant="text"
                  @click="openEditDialog(idx)"
                >
                  <v-icon size="14">mdi-pencil-outline</v-icon>
                </v-btn>

                <!-- Move up/down -->
                <v-btn
                  icon
                  size="x-small"
                  variant="text"
                  :disabled="idx === 0"
                  @click="moveElement(idx, -1)"
                >
                  <v-icon size="14">mdi-arrow-up</v-icon>
                </v-btn>
                <v-btn
                  icon
                  size="x-small"
                  variant="text"
                  :disabled="idx === draft.elements.length - 1"
                  @click="moveElement(idx, 1)"
                >
                  <v-icon size="14">mdi-arrow-down</v-icon>
                </v-btn>

                <!-- Delete -->
                <v-btn
                  icon
                  size="x-small"
                  variant="text"
                  color="error"
                  @click="removeElement(idx)"
                >
                  <v-icon size="14">mdi-delete-outline</v-icon>
                </v-btn>
              </div>

              <div v-if="draft.elements.length === 0" class="element-empty">
                No elements. Click "Add" to insert one.
              </div>
            </div>
          </div>
        </div>

        <!-- ── RIGHT: preview ───────────────────────────────── -->
        <div class="canvas-right">
          <div class="canvas-preview-label">Live preview</div>
          <div class="canvas-preview-wrap">
            <RequestTemplatePreview :template="draft" />
          </div>
        </div>
      </div>
    </v-card>

    <!-- ── Element edit dialog ───────────────────────────────── -->
    <v-dialog v-model="editDialog" max-width="500" :scrim="false" content-class="element-dialog">
      <v-card v-if="editingElement">
        <v-card-title class="text-body-1 pa-3">
          Edit {{ elementLabel(editingElement.type) }}
        </v-card-title>
        <v-card-text class="pa-3 pt-0">
          <!-- alert_block -->
          <template v-if="editingElement.type === 'alert_block'">
            <v-select
              v-model="(editingElement as ITemplateElementAlertBlock).alert_type"
              :items="alertTypeOptions"
              item-title="label"
              item-value="value"
              label="Type"
              density="compact"
              variant="outlined"
              class="mb-2"
            />
            <v-textarea
              v-model="(editingElement as ITemplateElementAlertBlock).alert_text"
              label="Alert text"
              density="compact"
              variant="outlined"
              rows="3"
              auto-grow
            />
          </template>

          <!-- text_block -->
          <template v-else-if="editingElement.type === 'text_block'">
            <v-textarea
              v-model="(editingElement as ITemplateElementTextBlock).text"
              label="Text"
              density="compact"
              variant="outlined"
              rows="4"
              auto-grow
            />
          </template>

          <!-- section -->
          <template v-else-if="editingElement.type === 'section'">
            <v-text-field
              v-model="(editingElement as ITemplateElementSection).title"
              label="Section title"
              density="compact"
              variant="outlined"
            />
          </template>

          <!-- form_field -->
          <template v-else-if="editingElement.type === 'form_field'">
            <v-select
              v-model="(editingElement as ITemplateElementFormField).field.type"
              :items="fieldTypeOptions"
              label="Type"
              density="compact"
              variant="outlined"
              class="mb-2"
            />
            <v-text-field
              v-model="(editingElement as ITemplateElementFormField).field.name"
              label="Field name (snake_case)"
              density="compact"
              variant="outlined"
              class="mb-2"
            />
            <v-text-field
              v-model="(editingElement as ITemplateElementFormField).field.label"
              label="Label"
              density="compact"
              variant="outlined"
              class="mb-2"
            />
            <v-switch
              v-model="(editingElement as ITemplateElementFormField).field.required"
              label="Required"
              density="compact"
              color="primary"
              hide-details
              class="mb-2"
            />

            <!-- options for radio/select -->
            <template v-if="['radio','select'].includes((editingElement as ITemplateElementFormField).field.type)">
              <div class="canvas-section-label mb-1">Options</div>
              <div
                v-for="(opt, oi) in ((editingElement as ITemplateElementFormField).field.options ?? [])"
                :key="oi"
                class="d-flex gap-1 mb-1"
              >
                <v-text-field
                  v-model="opt.label"
                  label="Label"
                  density="compact"
                  variant="outlined"
                  hide-details
                />
                <v-text-field
                  v-model="opt.value"
                  label="Value"
                  density="compact"
                  variant="outlined"
                  hide-details
                  style="max-width:120px"
                />
                <v-btn icon size="x-small" variant="text" color="error" @click="removeFieldOption(oi)">
                  <v-icon size="14">mdi-delete-outline</v-icon>
                </v-btn>
              </div>
              <v-btn size="x-small" variant="tonal" prepend-icon="mdi-plus" @click="addFieldOption">
                Add option
              </v-btn>
            </template>
          </template>
        </v-card-text>
        <v-card-actions class="pa-3 pt-0">
          <v-spacer />
          <v-btn size="small" @click="editDialog = false">Done</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-dialog>
</template>

<script setup lang="ts">
import type {
  IAuthRequestType,
  IRequestTemplate,
  ITemplateElement,
  ITemplateElementAlertBlock,
  ITemplateElementTextBlock,
  ITemplateElementSection,
  ITemplateElementFormField,
  ITemplateElementChargeBuilder,
  ITemplateElementType,
} from '~/repository/modules/catalogs/authRequestTypes'

const props = defineProps<{
  modelValue: boolean
  requestType: IAuthRequestType | null
}>()

const emit = defineEmits<{
  'update:modelValue': [v: boolean]
  saved: [template: IRequestTemplate]
}>()

const { $api } = useNuxtApp()
const snackbar = useSnackbar()

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}

const open = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const DEFAULT_DRAFT = (): IRequestTemplate => ({
  title: null,
  subtitle: null,
  reason: { show: true, label: 'Reason', required: true, rows: 3 },
  buttons: { submit: 'Submit request', cancel: 'Cancel' },
  elements: [],
})

const draft = ref<IRequestTemplate>(DEFAULT_DRAFT())
const saving = ref(false)

// Reset draft when dialog opens or requestType changes
watch(
  () => [props.modelValue, props.requestType] as const,
  ([isOpen, rt]) => {
    if (isOpen && rt) {
      draft.value = rt.template ? JSON.parse(JSON.stringify(rt.template)) : DEFAULT_DRAFT()
    }
  },
  { immediate: true },
)

function close() {
  open.value = false
}

async function save() {
  if (!props.requestType) return
  saving.value = true
  try {
    await $api.authRequestTypes.updateType(props.requestType.id, { template: draft.value })
    emit('saved', draft.value)
    snackbar.add({ type: 'success', text: 'Template saved.' })
    close()
  } catch {
    snackbar.add({ type: 'error', text: 'Failed to save template.' })
  } finally {
    saving.value = false
  }
}

// ── Elements ────────────────────────────────────────────────────────────────

const alertTypeOptions = [
  { label: 'Info', value: 'info' },
  { label: 'Warning', value: 'warning' },
  { label: 'Error', value: 'error' },
  { label: 'Success', value: 'success' },
]

const fieldTypeOptions = ['text', 'textarea', 'radio', 'select', 'checkbox', 'number']

function addElement(type: ITemplateElementType) {
  const base = { id: uid(), type }
  let el: ITemplateElement
  if (type === 'alert_block') {
    el = { ...base, type, alert_text: 'Alert message', alert_type: 'info' } as ITemplateElementAlertBlock
  } else if (type === 'text_block') {
    el = { ...base, type, text: 'Text block content...' } as ITemplateElementTextBlock
  } else if (type === 'section') {
    el = { ...base, type, title: 'Section title' } as ITemplateElementSection
  } else if (type === 'charge_builder') {
    el = { ...base, type, charges_catalog_key: 'charges' } as ITemplateElementChargeBuilder
    draft.value.elements.push(el)
    return // no edit dialog for code-driven elements
  } else {
    el = {
      ...base,
      type,
      field: { type: 'text', name: 'field_' + Date.now(), label: 'New field', required: false, options: [] },
    } as ITemplateElementFormField
  }
  draft.value.elements.push(el)
  // Auto-open edit dialog for the new element
  editingIndex.value = draft.value.elements.length - 1
  editingElement.value = JSON.parse(JSON.stringify(el))
  editDialog.value = true
}

function removeElement(idx: number) {
  draft.value.elements.splice(idx, 1)
}

function moveElement(idx: number, dir: -1 | 1) {
  const arr = draft.value.elements
  const target = idx + dir
  if (target < 0 || target >= arr.length) return
  const tmp = arr[idx] as ITemplateElement
  arr[idx] = arr[target] as ITemplateElement
  arr[target] = tmp
}

// ── Drag & drop ─────────────────────────────────────────────────────────────

const dragIdx = ref<number | null>(null)
const dragOverIdx = ref<number | null>(null)

function onDragStart(idx: number) {
  dragIdx.value = idx
}

function onDrop(targetIdx: number) {
  if (dragIdx.value === null || dragIdx.value === targetIdx) return
  const arr = draft.value.elements
  const [moved] = arr.splice(dragIdx.value, 1) as [ITemplateElement]
  arr.splice(targetIdx, 0, moved)
  dragIdx.value = null
  dragOverIdx.value = null
}

// ── Element edit dialog ──────────────────────────────────────────────────────

const editDialog = ref(false)
const editingIndex = ref<number | null>(null)
const editingElement = ref<ITemplateElement | null>(null)

function openEditDialog(idx: number) {
  const el = draft.value.elements[idx]
  if (!el || el.type === 'charge_builder') return
  editingIndex.value = idx
  editingElement.value = JSON.parse(JSON.stringify(el))
  editDialog.value = true
}

// Sync edit dialog changes back to draft in real time
watch(editingElement, (el) => {
  if (el !== null && editingIndex.value !== null) {
    const target = draft.value.elements[editingIndex.value]
    if (target) draft.value.elements[editingIndex.value] = JSON.parse(JSON.stringify(el))
  }
}, { deep: true })

function addFieldOption() {
  if (!editingElement.value || editingElement.value.type !== 'form_field') return
  const field = (editingElement.value as ITemplateElementFormField).field
  if (!field.options) field.options = []
  field.options.push({ label: '', value: '' })
}

function removeFieldOption(idx: number) {
  if (!editingElement.value || editingElement.value.type !== 'form_field') return
  const field = (editingElement.value as ITemplateElementFormField).field
  field.options?.splice(idx, 1)
}

// ── Display helpers ──────────────────────────────────────────────────────────

function elementLabel(type: string): string {
  return { form_field: 'Field', section: 'Section', text_block: 'Text', alert_block: 'Alert', charge_builder: 'Charge builder' }[type] ?? type
}

function elementColor(type: string): string {
  return { form_field: 'primary', section: 'purple', text_block: 'grey', alert_block: 'orange', charge_builder: 'teal' }[type] ?? 'grey'
}

function elementSummary(el: ITemplateElement): string {
  if (el.type === 'alert_block') return (el as ITemplateElementAlertBlock).alert_text
  if (el.type === 'text_block') return (el as ITemplateElementTextBlock).text
  if (el.type === 'section') return (el as ITemplateElementSection).title
  if (el.type === 'form_field') return (el as ITemplateElementFormField).field.label
  if (el.type === 'charge_builder') return `catalog: ${(el as ITemplateElementChargeBuilder).charges_catalog_key}`
  return ''
}
</script>

<style scoped>
.canvas-root {
  display: flex;
  flex-direction: column;
  height: 90vh;
  max-height: 90vh;
}

.canvas-toolbar {
  flex-shrink: 0;
}

.canvas-panels {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* ── Left panel ── */
.canvas-left {
  width: 380px;
  flex-shrink: 0;
  border-right: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.canvas-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.canvas-section-label {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(var(--v-theme-on-surface), 0.38);
  margin-bottom: 8px;
  margin-top: 4px;
}

/* ── Element list ── */
.element-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.element-row {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 6px;
  border-radius: 6px;
  background: rgba(var(--v-theme-on-surface), 0.04);
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  cursor: grab;
  user-select: none;
  transition: background 0.15s;
}

.element-row:hover {
  background: rgba(var(--v-theme-on-surface), 0.08);
}

.element-row--drag-over {
  border-color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.08);
}

.drag-handle {
  cursor: grab;
  opacity: 0.5;
}

.element-summary {
  font-size: 11px;
  color: rgba(var(--v-theme-on-surface), 0.65);
  min-width: 0;
}

.element-empty {
  font-size: 11px;
  color: rgba(var(--v-theme-on-surface), 0.3);
  padding: 12px 8px;
  text-align: center;
  border: 1px dashed rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 6px;
}

/* ── Right panel ── */
.canvas-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: rgba(var(--v-theme-surface-variant), 0.3);
  overflow: hidden;
}

.canvas-preview-label {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(var(--v-theme-on-surface), 0.3);
  padding: 10px 20px 6px;
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.canvas-preview-wrap {
  flex: 1;
  overflow-y: auto;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 32px 20px;
}

.canvas-preview-wrap > * {
  width: 100%;
  max-width: 460px;
}
</style>

<style>
.canvas-dialog {
  height: 90vh !important;
  max-height: 90vh !important;
  align-self: center;
}
/* Ensures element-dialog sits above the canvas dialog */
.element-dialog {
  z-index: 9999 !important;
}
</style>
