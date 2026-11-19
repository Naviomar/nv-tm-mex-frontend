<template>
  <v-card class="mb-4" variant="flat" :style="{ border: '1px solid rgba(var(--v-border-color), var(--v-border-opacity))' }">
    <v-card-title>
      <div class="flex items-center gap-2 font-bold">
        <v-icon size="small">mdi-key-link</v-icon>
        Electronic revalidation
      </div>
    </v-card-title>
    <v-card-text>
      <div v-if="loading" class="text-medium-emphasis">Loading checklist…</div>

      <template v-else-if="checklist">
        <div v-if="hasSent" class="text-medium-emphasis">
          The electronic revalidation was already sent to the consignee.
        </div>

        <template v-else>
          <v-alert v-if="checklist.can_proceed" type="success" variant="tonal" density="compact" class="mb-3">
            The checklist is complete. Operations can send the revalidation, no authorization is needed.
          </v-alert>
          <template v-else>
            <v-alert type="warning" variant="tonal" density="compact" class="mb-3">
              Operations cannot send the revalidation yet. Review the pending items below; if the revalidation must go
              out anyway, request the authorization and assign it to who will send it.
            </v-alert>
            <RevalidationChecks :checks="checklist.checks ?? []" class="mb-3" />
            <ProcessAuthorizationWrapper
              :processName="processName"
              :requestKey="`${referenceId}`"
              label="Request authorization to revalidate"
              :displayName="referenceNumber ? `Ref. ${referenceNumber}` : `Ref. ID ${referenceId}`"
              block
            />
          </template>
        </template>
      </template>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
const props = defineProps<{
  kind: 'sea' | 'air'
  referenceId: string | number
  referenceNumber?: string | null
  hasSent?: boolean
}>()

const { $api } = useNuxtApp()
const checklist = ref<any>(null)
const loading = ref(false)

const processName = computed(() =>
  props.kind === 'sea' ? 'sea-import-electronic-revalidation' : 'air-import-electronic-revalidation'
)

async function load() {
  loading.value = true
  try {
    const module: any = props.kind === 'sea' ? $api.referencias : $api.airImport
    const response = await module.getChecklistRevalidationIsOk(String(props.referenceId))
    // A reference without consignee has no checklist (the endpoint answers with an error message)
    checklist.value = response?.checks ? response : null
  } catch (e) {
    console.error(e)
    checklist.value = null
  } finally {
    loading.value = false
  }
}

watch(() => props.referenceId, (id) => id && load(), { immediate: true })
</script>
