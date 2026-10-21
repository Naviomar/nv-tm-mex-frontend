<template>
  <div v-if="canView">
    <v-tooltip text="View">
      <template v-slot:activator="{ props }">
        <v-btn
          color="green-darken-2"
          size="x-small"
          variant="elevated"
          v-bind="props"
          icon="mdi-eye-outline"
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

const canView = computed(() => can(props.permission))

const emit = defineEmits(['click'])

function onClick(item: any) {
  emit('click', item)
}
</script>
