<template>
  <div>
    <div v-if="!props.canRestore && !item.deleted_at">
      <v-tooltip :text="item.deleted_at ? 'Restore' : 'Delete'">
        <template v-slot:activator="{ props }">
          <v-btn
            :color="item.deleted_at ? 'blue-darken-4' : 'red'"
            text-color="white"
            size="x-small"
            variant="elevated"
            v-bind="props"
            :icon="item.deleted_at ? 'mdi-delete-empty-outline' : 'mdi-delete-outline'"
            @click="onClick(item)"
          ></v-btn>
        </template>
      </v-tooltip>
    </div>
    <div v-if="props.canRestore">
      <v-tooltip :text="item.deleted_at ? 'Restore' : 'Delete'">
        <template v-slot:activator="{ props }">
          <v-btn
            :color="item.deleted_at ? 'blue-darken-4' : 'red'"
            text-color="white"
            size="x-small"
            variant="elevated"
            v-bind="props"
            :icon="item.deleted_at ? 'mdi-delete-empty-outline' : 'mdi-delete-outline'"
            @click="onClick(item)"
          ></v-btn>
        </template>
      </v-tooltip>
    </div>
  </div>
</template>
<script setup lang="ts">
const props = defineProps({
  item: Object,
  required: true,
  default: () => ({}),
  canRestore: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['click'])

function onClick(item: any) {
  emit('click', item)
}
</script>
