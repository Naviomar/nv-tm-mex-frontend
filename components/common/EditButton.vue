<template>
  <div>
    <v-tooltip v-if="item.deleted_at == null" text="Edit">
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
const props = defineProps({
  item: Object,
  required: true,
  default: () => ({}),
})

const emit = defineEmits(['click'])

function onClick(item: any) {
  emit('click', item)
}
</script>
