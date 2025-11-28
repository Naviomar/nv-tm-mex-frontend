<template>
  <form @submit="onSubmit">
    <slot />
    <div v-if="isSuperAdminRole()">
      <v-icon class="cursor-pointer" @click="showValues = true">mdi-code-block-braces</v-icon>
    </div>
    <v-dialog v-model="showValues" max-width="600">
      <v-card>
        <v-card-title>{{ props.name }} configuration</v-card-title>
        <v-card-text>
          <v-expansion-panels>
            <v-expansion-panel>
              <v-expansion-panel-title>Values</v-expansion-panel-title>
              <v-expansion-panel-text>
                <pre>{{ values }}</pre>
              </v-expansion-panel-text>
            </v-expansion-panel>
            <v-expansion-panel>
              <v-expansion-panel-title>Errors</v-expansion-panel-title>
              <v-expansion-panel-text>
                <pre>{{ errors }}</pre>
              </v-expansion-panel-text>
            </v-expansion-panel>
            <v-expansion-panel>
              <v-expansion-panel-title>Errors bag</v-expansion-panel-title>
              <v-expansion-panel-text>
                <pre>{{ errorBag }}</pre>
              </v-expansion-panel-text>
            </v-expansion-panel>
            <v-expansion-panel>
              <v-expansion-panel-title>meta</v-expansion-panel-title>
              <v-expansion-panel-text>
                <pre>{{ meta }}</pre>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-card-text>
        <v-card-actions>
          <v-btn @click="showValues = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </form>
</template>
<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/yup'
const snackbar = useSnackbar()
const { isSuperAdminRole } = useCheckUser()

const props = withDefaults(
  defineProps<{
    validationSchema: ReturnType<typeof toTypedSchema>
    initValues?: (data: any) => void
    name?: string
  }>(),
  {
    initValues: () => ({}),
    name: 'Form',
  }
)

const emit = defineEmits(['submit'])

const showValues = ref(false)

const { values, errors, errorBag, handleSubmit, resetForm, setValues, meta, validate } = useForm({
  // vee-validate will be aware of computed schema changes
  validationSchema: computed(() => props.validationSchema),
  // turn this on so each step values won't get removed when you move back or to the next step
  // keepValuesOnUnmount: true,
})

function onInvalidSubmit({ values, errors, results }: any) {
  snackbar.add({ type: 'error', text: 'Validate form before submit' })
}

const onSuccess = async (values: any) => {
  emit('submit', values)
}

const onSubmit = handleSubmit(onSuccess, onInvalidSubmit)

defineExpose({
  resetForm,
  setValues,
  validate,
  values,
  errors,
  errorBag,
  onSubmit,
})

watch(
  () => props.initValues,
  (newInitValues, oldInitValues) => {
    setValues({ ...newInitValues })
  },
  { immediate: true }
)
</script>
