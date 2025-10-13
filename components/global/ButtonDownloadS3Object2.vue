<template>
  <div>
    <v-btn v-if="hasS3Path" size="small" variant="outlined" @click="downloadFile"
      ><v-icon>{{ icon }}</v-icon> {{ label }}</v-btn
    >
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

const hasS3Path = computed(() => props.s3Path != null && props.s3Path !== '')

const fileName = computed(() => {
  console.log('props.s3Path', props.s3Path)
  if (!hasS3Path) return ''
  return props.s3Path!.split('/').pop()
})

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
</script>
