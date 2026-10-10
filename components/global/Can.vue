<template>
  <slot v-if="allowed" />
  <slot v-else name="denied" />
</template>

<script setup lang="ts">
import type { PermissionSpec } from '~/composables/useCheckUser'

/**
 * Renders its content only when the user has the permission(s); otherwise nothing, or the
 * `denied` slot (e.g. a read-only version of a field). Use it around any button, form or
 * section that triggers a write the backend protects with a permission:
 *
 *   <Can permission="airlines-create"><v-btn to="/.../add">Add</v-btn></Can>
 *   <Can :permission="{ any: ['a', 'b'] }">...</Can>      (at least one)
 *   <Can :permission="['a', 'b']">...</Can>               (all of them)
 */
const props = defineProps<{
  permission?: PermissionSpec | null
}>()

const { can } = useCheckUser()
const allowed = computed(() => can(props.permission))
</script>
