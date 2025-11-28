<template>
  <div>
    <div>Steps:</div>
    <ul class="ml-4 list-disc">
      <li>Export TM invoices with no CFDI.</li>
      <li>Review the data & confirmation</li>
      <li>
        <v-btn size="small" color="blue" variant="tonal" @click="onClickDownloadLayout">Download zip file demo</v-btn>
      </li>
      <li>The zip file is an example of how to fill out the excel file called control.</li>
      <li>
        You have to put the XML and PDF of each invoice and in the excel file relate the invoice ID with the CFDI UUID
        to link them.
      </li>
      <li>Upload the zip file with the XML and PDF files.</li>
    </ul>
    <div class="py-4">
      <div class="font-bold mb-2">Filters</div>
      <div class="grid grid-cols-2 gap-5">
        <div class="flex">
          <v-file-input v-model="form.zipFile" density="compact" counter accept=".zip" label="File ZIP" />
          <v-btn color="primary" class="ms-4" @click="uploadZip"> Upload</v-btn>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { systemLayouts } from '~/utils/data/system'
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()
const router = useRouter()

const form = reactive({
  zipFile: null,
})

const uploadZip = async () => {
  if (!form.zipFile) {
    snackbar.add({ type: 'warning', text: 'No Zip file selected.' })
    return
  }

  try {
    loadingStore.loading = true

    const response = await $api.invoices.uploadZipTm(form)
    snackbar.add({ type: 'success', text: 'Zip file uploaded' })
    router.push(`/adminpack/zip-file-jobs/view-tm-job-${response.id}`)
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.loading = false
    }, 250)
  }
}

const onClickDownloadLayout = async () => {
  try {
    loadingStore.loading = true

    const response = await $api.aws.downloadS3Object(systemLayouts.invoiceTmCfdiZip.path)

    const url = URL.createObjectURL(response as any)
    const a = document.createElement('a')
    a.href = url

    a.download = systemLayouts.invoiceTmCfdiZip.filename
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
