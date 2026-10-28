<template>
  <div>
    <v-tooltip v-if="item.deleted_at == null && canEdit" text="Edit">
      <template v-slot:activator="{ props }">
        <v-btn
          color="blue"
          size="x-small"
          variant="elevated"
          v-bind="props"
          icon="mdi-pencil-outline"
          @click="onClick(item)"
        ></v-btn>
      </template>
    </v-tooltip>
  </div>
</template>
<script setup lang="ts">
import type { PermissionSpec } from '~/composables/useCheckUser'

const { can } = useCheckUser()

const props = defineProps({
  item: Object,
  required: true,
  default: () => ({}),
  permission: {
    type: [String, Array, Object] as PropType<PermissionSpec | null>,
    default: null,
  },
})

const emit = defineEmits(['click'])

const canEdit = computed(() => can(props.permission))

function onClick(item: any) {
  emit('click', item)
}
</script>
