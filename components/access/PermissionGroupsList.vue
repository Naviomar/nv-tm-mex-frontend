<template>
  <v-expansion-panels
    :model-value="modelValue"
    multiple
    variant="accordion"
    class="access-groups"
    @update:model-value="(v: any) => emit('update:modelValue', v)"
  >
    <v-expansion-panel v-for="group in groups" :key="group.label" :value="group.label" elevation="0">
      <v-expansion-panel-title class="access-group-title">
        <span class="font-weight-bold text-body-2 text-uppercase">{{ group.label }}</span>
        <slot name="group-stats" :group="group" />
        <v-spacer />
        <slot name="group-actions" :group="group" />
      </v-expansion-panel-title>
      <v-expansion-panel-text>
        <div v-for="sub in group.subgroups" :key="sub.label" class="mb-3">
          <div v-if="sub.label !== ROOT_SUBGROUP" class="d-flex align-center gap-2 mb-1">
            <div class="subgroup-bar" />
            <span class="text-body-2 font-weight-medium text-primary">{{ sub.label }}</span>
            <v-spacer />
            <slot name="sub-actions" :group="group" :sub="sub" />
          </div>

          <div
            v-for="perm in sub.permissions"
            :key="perm.id"
            class="access-row"
            :class="rowClass ? rowClass(perm) : ''"
          >
            <div class="access-row__main">
              <slot name="main" :perm="perm" />
              <div class="text-caption text-medium-emphasis access-row__desc">
                {{ perm.description || 'No description yet.' }}
                <span class="access-row__code">{{ perm.name }}</span>
              </div>
            </div>
            <div v-if="$slots.actions" class="access-row__actions">
              <slot name="actions" :perm="perm" />
            </div>
          </div>
        </div>
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script setup lang="ts">
import { ROOT_SUBGROUP } from '~/utils/permissions/groupPermissions'
import type { PermissionGroup, PermissionNode } from '~/utils/permissions/groupPermissions'

/**
 * Shared look for every permission list (user access, role editor, catalog, glossary):
 * module accordions > optional sub-module > one row per permission with its description.
 * What each row shows (state chips, switch...) is decided by the parent through slots.
 */
defineProps<{
  groups: PermissionGroup[]
  /** Open module labels (v-model). */
  modelValue: string[]
  rowClass?: (perm: PermissionNode) => string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void
}>()
</script>

<style scoped>
.access-groups {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 8px;
  overflow: hidden;
}

.access-group-title {
  min-height: 44px;
}

.subgroup-bar {
  width: 3px;
  height: 16px;
  border-radius: 2px;
  background: rgb(var(--v-theme-primary));
  opacity: 0.7;
}

.access-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid transparent;
}

.access-row + .access-row {
  margin-top: 2px;
}

.access-row:hover {
  background: rgba(var(--v-theme-on-surface), 0.04);
}

.access-row--revoked,
.access-row--revoked-dormant {
  background: rgba(var(--v-theme-error), 0.08);
  border-color: rgba(var(--v-theme-error), 0.3);
}

.access-row--extra {
  background: rgba(var(--v-theme-secondary), 0.05);
}

.access-row--granted {
  background: rgba(var(--v-theme-primary), 0.05);
}

.access-row__main {
  min-width: 0;
}

.access-row__desc {
  line-height: 1.35;
}

.access-row__code {
  margin-left: 6px;
  opacity: 0.6;
  font-family: ui-monospace, monospace;
  font-size: 11px;
}

.access-row__actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}
</style>
