<template>
  <div class="mb-4">
    <v-card density="compact">
      <v-toolbar density="compact" color="primary">
        <v-toolbar-title>
          <div class="flex items-center">
            <v-icon size="x-small">mdi-hand-okay</v-icon>
            <div class="ml-2 font-bold">Revalidation process</div>
          </div>
        </v-toolbar-title>
      </v-toolbar>

      <div v-if="!hasArrivalNotification">
        <v-card-text>
          <p>
            The arrival notification has not been completed. Please complete the arrival notification to start the
            revalidation process.
          </p>
        </v-card-text>
      </div>
      <div v-if="hasArrivalNotification">
        <v-tabs v-model="tab" class="tabs1">
          <v-tab value="option-0">
            <v-icon start> mdi-help-circle-outline </v-icon>
            About
          </v-tab>
          <v-tab value="option-1">
            <v-icon start> mdi-file </v-icon>
            Checklist revalidation
          </v-tab>
          <v-tab value="option-2">
            <v-icon start> mdi-transit-connection </v-icon>
            Release in transit
          </v-tab>
          <v-tab value="option-3">
            <v-icon start> mdi-transfer </v-icon>
            Release
          </v-tab>

          <v-tab value="option-4">
            <v-icon start> mdi-key-link </v-icon>
            Electronic revalidation
          </v-tab>
        </v-tabs>
        <v-window v-model="tab">
          <v-window-item value="option-0">
            <v-card flat>
              <v-card-text>
                <div class="font-bold">About</div>
                <div class="mb-2">
                  The revalidation process is a series of steps that must be completed to release the cargo from the
                  customs warehouse.
                </div>
                <div class="mb-2">
                  The process includes the following steps:
                  <ul>
                    <li>Checklist revalidation</li>
                    <li>Release in transit</li>
                    <li>Release</li>
                    <li>Electronic revalidation</li>
                  </ul>
                </div>
              </v-card-text>
            </v-card>
          </v-window-item>
          <v-window-item value="option-1">
            <v-card flat>
              <v-card-text>
                <SeaImportCheckListRevalidation :reference="reference" />
              </v-card-text>
            </v-card>
          </v-window-item>
          <v-window-item value="option-2">
            <v-card flat>
              <v-card-text>
                <SeaImportReleaseTransitForm :referenceId="reference.id" />
              </v-card-text>
            </v-card>
          </v-window-item>
          <v-window-item value="option-3">
            <v-card flat>
              <v-card-text>
                <SeaImportReleaseForm :referenceId="reference.id" />
              </v-card-text>
            </v-card>
          </v-window-item>
          <v-window-item value="option-4">
            <v-card v-if="tab === 'option-4'" flat>
              <v-card-text>
                <div v-if="!hasSentRevalidation">
                  <SeaImportValidateElectronicRev :referenceId="reference.id" @update-reference="refresh" />
                </div>
                <div v-if="hasSentRevalidation">
                  <div class="flex flex-col">
                    <div class="font-bold">Electronic revalidation</div>
                    <div class="mb-2">The electronic revalidation has been sent to the consignee.</div>
                    <div class="flex justify-start">
                      <v-btn size="small" color="red-darken-4" @click="onClickRedoRevalidation"
                        >Redo revalidation</v-btn
                      >
                    </div>
                    <div class="pt-4">
                      <SeaImportRevalidationDetails :reference="reference" />
                    </div>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-window-item>
        </v-window>
      </div>
    </v-card>
  </div>
</template>
<script setup lang="ts">
const { $api } = useNuxtApp()
const loadingStore = useLoadingStore()
const router = useRouter()

const props = defineProps({
  reference: {
    type: Object,
    required: true,
  },
})

const emits = defineEmits(['updateReference'])

const tab = ref('option-0')

const hasArrivalNotification = computed(() => {
  if (!props.reference.arrival_notys) return false
  return props.reference.arrival_notys.length > 0
})

const hasSentRevalidation = computed(() => {
  return props.reference.revalidation?.sent_at != null
})

const refresh = () => {
  emits('updateReference')
}

const onClickRedoRevalidation = async () => {
  try {
    loadingStore.loading = true
    const response = await $api.referencias.redoRevalidation(props.reference.id)
    emits('updateReference')
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}
</script>
