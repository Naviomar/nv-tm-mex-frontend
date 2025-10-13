<template>
  <div>
    <slot name="trigger"></slot>
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
          <object ref="pdfServerViewer" type="application/pdf" width="100%" height="100%"></object>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>
<script setup lang="ts">
const props = defineProps({
  blobSource: {
    type: Object,
    required: true,
  },
})

const showPdfDialog = ref(false)
const pdfServerViewer = ref<any>(null)

watch(
  () => props.blobSource,
  (blobSource) => {
    console.log('watch blobSource', blobSource, showPdfDialog.value)
    if (blobSource && showPdfDialog.value === false) {
      showPdfDialog.value = true
      if (pdfServerViewer.value == null) {
        pdfServerViewer.value = document.createElement('object')
      }
      const blob = new Blob([blobSource as any], { type: 'application/pdf' })
      const pdfUrl = URL.createObjectURL(blob)
      pdfServerViewer.value.data = pdfUrl
    }
  }
)

const closePdfDialog = () => {
  showPdfDialog.value = false
  pdfServerViewer.value = null
}
</script>
