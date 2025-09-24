<template>
  <div>
    <div v-for="(file, index) in files" :key="`prev-file-${index}`">
      <v-btn size="small" variant="outlined" @click="previewFile(file)"
        ><v-icon>mdi-download-circle-outline</v-icon>{{ file.name }}</v-btn
      >
    </div>
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
const props = defineProps({
  files: {
    type: Array<File>,
    required: true,
  },
})

const files = computed(() => {
  // if not and array of files, return an empty array of type File
  if (!Array.isArray(props.files)) return [] as File[]
})
const showPdfDialog = ref(false)
const pdfViewer = ref<any>(null)

const previewFile = (file: any) => {
  showPdfDialog.value = true
  const fileReader = new FileReader()
  fileReader.onload = () => {
    pdfViewer.value!.data = fileReader.result
  }
  fileReader.readAsDataURL(file)
}

const closePdfDialog = () => {
  showPdfDialog.value = false
  pdfViewer.value!.data = null
}
</script>
