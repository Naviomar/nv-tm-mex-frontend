<template>
  <div>
    <v-btn v-if="hasS3Path" size="small" color="primary" variant="tonal" @click="fetchFile"
      ><v-icon>{{ icon }}</v-icon> {{ label }}</v-btn
    >
    <v-dialog v-model="dialog" fullscreen>
      <v-card>
        <v-toolbar color="primary">
          <v-btn icon @click="dialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title>File Preview</v-toolbar-title>
          <v-spacer></v-spacer>
        </v-toolbar>
        <v-card-text class="">
          <v-img v-if="isImage" :src="fileUrl" max-width="100%" max-height="100%" />

          <!-- Show the PDF -->
          <v-responsive v-if="isPDF" aspect-ratio="1.77">
            <embed :src="fileUrl" type="application/pdf" width="100%" height="100%" />
          </v-responsive>

          <!-- If the format is unsupported -->
          <v-alert v-if="isUnsupported" type="info" border="start" elevation="2">
            This file type cannot be displayed. Click the button below to download it.
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-btn v-if="isUnsupported" color="primary" @click="downloadFile">Download File</v-btn>

          <v-btn color="primary" @click="dialog = false">Close</v-btn>
        </v-card-actions>
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
  icon: {
    type: String,
    required: false,
    default: 'mdi-download-circle-outline',
  },
  label: {
    type: String,
    required: false,
    default: '',
  },
})

const dialog = ref(false)
const fileUrl = ref<string | null>(null)
const fileType = ref<string | null>(null)

const isImage = computed(() => fileType.value && fileType.value.startsWith('image'))
const isPDF = computed(() => fileType.value === 'application/pdf')
const isUnsupported = computed(() => !isImage.value && !isPDF.value)

const hasS3Path = computed(() => props.s3Path != null && props.s3Path !== '')

const fileName = computed(() => {
  console.log('props.s3Path', props.s3Path)
  if (!hasS3Path) return ''
  return props.s3Path!.split('/').pop()
})

const fetchFile = async () => {
  try {
    if (!hasS3Path) return
    loadingStore.start()

    const response = await $api.aws.downloadS3Object(props.s3Path!)
    fileType.value = response.type // Get the MIME type of the file
    fileUrl.value = URL.createObjectURL(response)

    if (isUnsupported.value) {
      // If the file is unsupported, download it directly
      downloadFile()
    } else {
      // Otherwise, show the dialog
      dialog.value = true
    }
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const downloadFile = () => {
  if (!fileUrl.value) return
  const a = document.createElement('a')
  a.href = fileUrl.value
  a.download = fileName.value as string
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(fileUrl.value)
}
</script>
