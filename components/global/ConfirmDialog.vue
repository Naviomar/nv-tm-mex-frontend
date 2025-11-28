<script setup lang="ts">
import { type Component, type PropType, computed, inject, onMounted, ref } from 'vue'
import { type ConfirmDialogKeyValue } from '@/utils/notifications'

const props = defineProps({
  title: {
    type: String,
    required: false,
    default: 'Are you sure?',
  },
  titleComponent: {
    type: Object as PropType<Component>,
    required: false,
  },
  titleComponentProps: {
    type: Object,
    required: false,
  },
  content: {
    type: String,
    required: false,
    default: '',
  },
  contentComponent: {
    type: Object as PropType<Component>,
    required: false,
  },
  contentComponentProps: {
    type: Object,
    required: false,
  },
  confirmationKeyword: {
    type: String,
    required: false,
  },
  confirmationKeywordTextFieldProps: {
    type: Object,
    required: false,
    default: () => ({}),
  },
  confirmationText: {
    type: String,
    required: false,
    default: 'Ok',
  },
  cancellationText: {
    type: String,
    required: false,
    default: 'Cancel',
  },
  dialogProps: {
    type: Object,
    required: false,
    default: () => ({}),
  },
  cardProps: {
    type: Object,
    required: false,
    default: () => ({}),
  },
  cardTitleProps: {
    type: Object,
    required: false,
    default: () => ({}),
  },
  cardTextProps: {
    type: Object,
    required: false,
    default: () => ({}),
  },
  cardActionsProps: {
    type: Object,
    required: false,
    default: () => ({}),
  },
  actionsContentComponent: {
    type: Object as PropType<Component>,
    required: false,
  },
  cancellationButtonProps: {
    type: Object,
    required: false,
    default: () => ({}),
  },
  confirmationButtonProps: {
    type: Object,
    required: false,
    default: () => ({}),
  },
  theme: {
    type: String,
    required: true,
  },
  destroy: {
    type: Function,
    required: true,
  },
  promiseId: {
    type: String,
    required: true,
  },
})

const dialog = inject('ConfirmDialogKey') as ConfirmDialogKeyValue
const isOpen = ref(true)
const textFieldInput = ref<HTMLInputElement | null>(null)
const textField = ref('')

function confirm() {
  dialog?.state.promiseIds.get(props.promiseId)?.resolve?.(true)
  isOpen.value = false
}

function cancel() {
  dialog?.state.promiseIds.get(props.promiseId)?.resolve?.(false)
  isOpen.value = false
}

onMounted(() => {
  textFieldInput.value?.focus()
})

const confirmationButtonDisabled = computed(() => {
  if (!props.confirmationKeyword) return false

  return props.confirmationKeyword !== textField.value
})

const finalDialogProps = computed(() => {
  return {
    ...props.dialogProps,
    onAfterLeave() {
      props.dialogProps.onAfterLeave?.()
      dialog?.state.promiseIds.delete(props.promiseId)
      props.destroy()
    },
  }
})
</script>

<template>
  <v-theme-provider :theme="theme">
    <v-dialog v-bind="finalDialogProps" v-model="isOpen">
      <v-card v-bind="cardProps">
        <component :is="titleComponent" v-if="titleComponent" v-bind="titleComponentProps" />
        <v-card-title v-else v-bind="cardTitleProps">
          {{ title }}
        </v-card-title>
        <v-card-text v-bind="cardTextProps">
          <component :is="contentComponent" v-if="contentComponent" v-bind="contentComponentProps" />
          <v-text-field
            v-else-if="confirmationKeyword"
            ref="textFieldInput"
            v-model="textField"
            v-bind="confirmationKeywordTextFieldProps"
            variant="underlined"
          />
          <template v-else>
            {{ content }}
          </template>
        </v-card-text>
        <v-card-actions v-bind="cardActionsProps">
          <component
            :is="actionsContentComponent"
            v-if="actionsContentComponent"
            :confirmation-button-disabled="confirmationButtonDisabled"
            :cancel="cancel"
            :confirm="confirm"
          />
          <template v-else>
            <v-spacer />
            <v-btn v-bind="cancellationButtonProps" @click="cancel">
              {{ cancellationText }}
            </v-btn>
            <v-btn
              color="primary"
              :disabled="confirmationButtonDisabled"
              v-bind="confirmationButtonProps"
              @click="confirm"
            >
              {{ confirmationText }}
            </v-btn>
          </template>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-theme-provider>
</template>
