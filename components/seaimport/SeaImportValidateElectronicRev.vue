<template>
  <div>
    <div v-if="checklist && checklist.can_proceed === false">
      <v-alert type="error" class="mb-4" border="start" prominent>
        {{ checklist.message }}
      </v-alert>

      <ProcessAuthorizationWrapper
        processName="sea-import-electronic-revalidation"
        :requestKey="`${props.referenceId}`"
        label="Electronic revalidation"
      >
        <template #auth>
          <SeaImportElectronicRevForm :referenceId="referenceId" @update-reference="refresh" />
        </template>
      </ProcessAuthorizationWrapper>
    </div>

    <div v-if="checklist && checklist.can_proceed === true">
      <SeaImportElectronicRevForm :referenceId="referenceId" @update-reference="refresh" />
    </div>
  </div>
</template>
<script setup lang="ts">
const { $api, $notifications } = useNuxtApp()
const snackbar = useSnackbar()
const confirm = $notifications.useConfirm()
const loadingStore = useLoadingStore()

const props = defineProps({
  referenceId: {
    type: [String, Number],
    required: true,
  },
})

const checklist = ref<any>(null)

const emits = defineEmits(['updateReference'])

const refresh = () => {
  emits('updateReference')
}

const getReferenciaChecklist = async () => {
  try {
    loadingStore.start()
    const response = (await $api.referencias.getChecklistRevalidationIsOk(props.referenceId.toString())) as any
    checklist.value = response
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

watch(
  () => props.referenceId,
  (value: any) => {
    if (value) {
      getReferenciaChecklist()
    }
  },
  { immediate: true }
)
</script>
