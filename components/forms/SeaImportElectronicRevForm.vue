<template>
  <div>
    <v-btn size="x-small" color="primary" class="mb-2" @click="getReferencia">
      <v-icon>mdi-sync</v-icon>Sync reference data
    </v-btn>
    <div class="grid grid-cols-2 gap-3 px-4 pb-4">
      <div class="flex flex-col">
        <div>Upload MBL files here</div>
        <v-file-input
          v-model="form.mbl_files"
          label="Upload MBL(s)"
          density="compact"
          multiple
          dense
          counter
          hide-details
        />
        <v-btn size="small" color="primary" @click="addMblFilesClick">Add MBL files</v-btn>
      </div>
      <div>
        <div v-if="!hasMblFiles">
          <div class="flex items-center justify-center">There are no MBL files</div>
        </div>
        <div v-else>
          <div class="font-bold">Uploaded MBL files</div>
          <v-table density="compact">
            <thead>
              <tr>
                <th class="text-left">Actions</th>
                <th class="text-left">MBL File</th>
                <th class="text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="mbl in form.current_mbls" :key="mbl.id">
                <td>
                  <v-btn
                    size="small"
                    variant="text"
                    icon="mdi-delete-outline"
                    color="red-lighten-2"
                    dense
                    @click="removeMblFile(mbl)"
                  ></v-btn>
                </td>
                <td><ButtonDownloadS3Object :s3Path="mbl.attachment" /></td>
                <td>
                  <UserInfoBadge :item="mbl">
                    {{ formatDateString(mbl.created_at) }}
                  </UserInfoBadge>
                </td>
              </tr>
            </tbody>
          </v-table>
        </div>
      </div>
    </div>
    <div class="grid grid-cols-1 pb-4">
      <Stamp :reference="reference" @updateReference="getReferencia" />
    </div>
    <div class="grid grid-cols-1 px-4 pb-4">
      <div v-if="!hasElectronicRevalidation">
        <div class="text-lg font-bold">
          <span
            class="inline-flex items-center justify-center h-8 w-8 rounded-full bg-purple-500 text-white text-center text-sm font-bold"
          >
            5
          </span>
          Electronic revalidation
        </div>
        <div class="mb-2">To send the electronic revalidation complete the previous step.</div>
      </div>
      <div v-if="hasElectronicRevalidation && !hasSent">
        <div class="text-lg font-bold">Send revalidation to consignee</div>
        <div class="mb-2">All MBL files and PDF with seal will be sent to the consignee.</div>
        <div class="grid grid-cols-3 gap-4">
          <div class="col-span-1">TO: Consignee emails *</div>
          <div class="col-span-2">
            <v-textarea
              v-model="formSend.consignee_emails"
              rows="3"
              placeholder="Enter emails separated by comma"
              hide-details
            />
            <CustomerEmailsWidget
              :customer-id="reference.consignee_id"
              :notifys="customerNotifys"
              @fetched-emails="setCustomerEmails"
            />
          </div>
          <div class="col-span-1">Additional notes</div>
          <div class="col-span-2">
            <v-textarea v-model="formSend.notes" density="compact" rows="4" placeholder="Notes" />
          </div>
          <div class="col-span-1"></div>
          <div class="col-span-2">
            <v-btn size="small" color="primary" @click="sendRevalidationClick">Send revalidation</v-btn>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { mailNotifications } from '~/utils/data/systemData'
const { $api, $notifications } = useNuxtApp()
const snackbar = useSnackbar()
const confirm = $notifications.useConfirm()
const loadingStore = useLoadingStore()
const router = useRouter()

const props = defineProps({
  referenceId: {
    type: [String, Number],
    required: true,
  },
})

const emits = defineEmits(['updateReference'])

const selectedNames = ['SeaImportNotifyRevalidation']

const customerNotifys = computed(() => {
  return mailNotifications.filter((notify) => selectedNames.includes(notify.short_name))
})

const reference = ref<any>({
  revalidation: null,
  release_mbls: [],
})

const form = ref<any>({
  mbl_files: [],
  current_mbls: [],
})

const formSend = ref<any>({
  consignee_emails: '',
  notes: '',
})

const hasElectronicRevalidation = computed(() => {
  return reference.value.revalidation != null && reference.value.revalidation.attachment_sellos != null
})

const hasSent = computed(() => {
  return reference.value.revalidation?.sent_at != null
})

const hasMblFiles = computed(() => {
  if (!form.value.current_mbls) {
    return false
  }
  return form.value.current_mbls.length > 0
})

const sendRevalidationClick = async () => {
  if (formSend.value.consignee_emails === '') {
    snackbar.add({ type: 'warning', text: 'Consignee emails are required' })

    return
  }
  sendRevalidation()
}

const sendRevalidation = async () => {
  try {
    loadingStore.start()
    const response = await $api.referencias.sendRevalidation(reference.value.id, formSend.value)

    snackbar.add({ type: 'success', text: 'Revalidation sent successfully' })

    formSend.value = {
      consignee_emails: '',
      notes: '',
    }

    emits('updateReference')
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const setCustomerEmails = (emails: string) => {
  formSend.value.consignee_emails = emails
}

const addMblFilesClick = () => {
  if (form.value.mbl_files.length === 0) {
    snackbar.add({ type: 'warning', text: 'No files selected' })
    return
  }
  submitMblFiles()
}

const submitMblFiles = async () => {
  try {
    loadingStore.start()
    const response = await $api.referencias.addMblFiles(reference.value.id, form.value)

    snackbar.add({ type: 'success', text: 'MBL files saved successfully' })

    // [Vue warn] Set operation on key "release_mbls" failed: target is readonly.
    // props.reference.release_mbls = response
    form.value.current_mbls = response
    form.value.mbl_files = []
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const removeMblFile = async (mbl: any) => {
  try {
    const confirmResult = await confirm({
      title: 'Are you sure?',
      confirmationText: 'Update',
      content: 'Please confirm this action.',
      dialogProps: {
        persistent: true,
        maxWidth: 500,
      },
      confirmationButtonProps: {
        color: 'primary',
      },
    })

    if (!confirmResult) {
      return
    }

    loadingStore.start()
    await $api.referencias.removeMblFile(reference.value.id, mbl.id)

    snackbar.add({ type: 'success', text: 'MBL file removed successfully' })

    form.value.current_mbls = form.value.current_mbls.filter((item: any) => item.id !== mbl.id)
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const getReferencia = async () => {
  try {
    loadingStore.start()
    const response = (await $api.referencias.getSeaImportById(props.referenceId.toString())) as any
    reference.value = response
    form.value.current_mbls = reference.value.release_mbls
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const getConsigneeEmails = async () => {
  try {
    loadingStore.start()
    const response = await $api.consignees.getConsigneeEmails(reference.value.consignee?.id)
    if (response.emails.length === 0) {
      snackbar.add({ type: 'warning', text: 'Consignee has no emails' })
      return
    }
    // response.emails to string comma separated
    formSend.value.consignee_emails = response.emails.join(', ')
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
      getReferencia()
    }
  },
  { immediate: true, deep: true }
)
</script>
