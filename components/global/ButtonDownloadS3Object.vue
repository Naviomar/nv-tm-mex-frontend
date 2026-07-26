<template>
  <div class="s3-download-trigger">
    <v-btn
      v-if="hasS3Path"
      size="small"
      :icon="iconOnly"
      :variant="iconOnly ? 'text' : 'outlined'"
      @click="downloadFile"
      ><v-icon>mdi-download-circle-outline</v-icon><template v-if="!iconOnly">{{ fileName }}</template></v-btn
    >
    <v-dialog v-model="showPdfDialog" fullscreen>
      <v-card>
        <v-toolbar color="primary">
          <v-btn icon @click="closePdfDialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title>Preview file</v-toolbar-title>
          <v-spacer></v-spacer>
        </v-toolbar>
        <v-card-text>
          <object ref="pdfViewer" type="application/pdf" width="100%" height="100%"></object>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>
<script setup lang="ts">
const { $api } = useNuxtApp()
const loadingStore = useLoadingStore()

const props = defineProps({
  s3Path: {
    type: String,
    required: false,
  },
  // Overrides the button label / downloaded filename — the raw S3 key
  // (last path segment) is a UUID, not something meant for humans to see.
  displayName: {
    type: String,
    required: false,
  },
  // Icon-only button, for contexts that already show the filename elsewhere
  // (e.g. a chat attachment chip) and would otherwise show it twice.
  iconOnly: {
    type: Boolean,
    default: false,
  },
})

const hasS3Path = computed(() => props.s3Path != null && props.s3Path !== '')

const fileName = computed(() => {
  if (!hasS3Path.value) return ''
  return props.displayName || props.s3Path!.split('/').pop()
})

const showPdfDialog = ref(false)
const pdfViewer = ref<any>(null)

const downloadFile = async () => {
  try {
    if (!hasS3Path) return
    loadingStore.loading = true

    const response = await $api.aws.downloadS3Object(props.s3Path!)

    const url = URL.createObjectURL(response as any)
    const a = document.createElement('a')
    a.href = url

    a.download = fileName.value as any // For PDF files
    document.body.appendChild(a)
    a.click()

    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.loading = false
    }, 100)
  }
}

const closePdfDialog = () => {
  showPdfDialog.value = false
  pdfViewer.value!.data = null
}

defineExpose({ downloadFile })
</script>
