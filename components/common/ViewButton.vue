<template>
  <div>
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
