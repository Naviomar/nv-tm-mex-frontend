<template>
  <div>
    <div v-if="checklist && checklist.can_proceed === false">
      <v-alert v-if="!checklist.authorized" type="error" class="mb-4" border="start" prominent>
        {{ checklist.message }}
      </v-alert>
      <v-alert v-else type="success" class="mb-4" border="start" prominent>
        Autorización concedida. Puedes continuar con la revalidación electrónica a pesar de los temas pendientes.
      </v-alert>

      <ProcessAuthorizationWrapper
        processName="air-import-electronic-revalidation"
        :requestKey="`${props.referenceId}`"
        label="Send revalidation"
        :displayName="props.referenceNumber ? `Ref. ${props.referenceNumber}` : `Ref. ID ${props.referenceId}`"
      >
        <template #auth>
          <slot />
        </template>
      </ProcessAuthorizationWrapper>
    </div>

    <div v-if="checklist && checklist.can_proceed === true">
      <slot />
    </div>
  </div>
</template>
<script setup lang="ts">
const { $api } = useNuxtApp()
const loadingStore = useLoadingStore()

const props = defineProps({
  referenceId: {
    type: [String, Number],
    required: true,
  },
  referenceNumber: {
    type: String,
    default: null,
  },
})

const checklist = ref<any>(null)

const getAirReferenceChecklist = async () => {
  try {
    loadingStore.start()
    const response = (await $api.airImport.getChecklistRevalidationIsOk(props.referenceId.toString())) as any
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
      getAirReferenceChecklist()
    }
  },
  { immediate: true }
)

defineExpose({ refresh: getAirReferenceChecklist })
</script>
