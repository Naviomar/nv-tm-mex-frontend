<template>
  <v-theme-provider :theme="theme">
    <v-snackbar v-bind="finalSnackbarProps" v-model="snackbar">
      <template v-if="contentComponent">
        <Component :is="contentComponent" />
      </template>
      <template v-else>
        {{ text }}
      </template>
      <template v-if="showCloseButton" #actions>
        <v-btn v-bind="closeButtonProps" variant="text" @click="snackbar = false">
          {{ closeButtonText }}
        </v-btn>
      </template>
    </v-snackbar>
  </v-theme-provider>
</template>
<script setup lang="ts">
import { type Component, type PropType, computed, ref } from 'vue'

const props = defineProps({
  text: {
    type: String,
    required: false,
    default: '',
  },
  contentComponent: {
    type: Object as PropType<Component>,
    required: false,
  },
  snackbarProps: {
    type: Object,
    required: false,
    default: () => ({}),
  },
  showCloseButton: {
    type: Boolean,
    required: false,
    default: true,
  },
  closeButtonProps: {
    type: Object,
    required: false,
    default: () => ({}),
  },
  closeButtonText: {
    type: String,
    required: false,
    default: 'Close',
  },
  theme: {
    type: String,
    required: true,
  },
  destroy: {
    type: Function,
    required: true,
  },
})

const snackbar = ref(true)

const finalSnackbarProps = computed(() => {
  return {
    ...props.snackbarProps,
    onAfterLeave() {
      props.snackbarProps.onAfterLeave?.()
      props.destroy()
    },
  }
})
</script>
