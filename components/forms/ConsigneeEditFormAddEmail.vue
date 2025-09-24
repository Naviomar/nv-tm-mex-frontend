<template>
  <v-card class="mb-4">
    <v-card-title>
      <div class="flex justify-between">
        <div>Emails</div>
        <div>
          <v-btn icon size="x-small" @click="toggle" :color="showForm ? 'black' : 'success'">
            <v-icon v-if="showForm">mdi-close</v-icon>
            <v-icon v-if="!showForm">mdi-plus</v-icon>
          </v-btn>
        </div>
      </div>
    </v-card-title>
    <v-card-text>
      <div v-if="showForm" class="p-4 mb-4 grid grid-cols-2 gap-2">
        <div class="col-span-2">
          <InputText name="email" density="compact" label="Email" />
        </div>
        <div class="col-span-2">
          <InputAutocomplete
            name="mail_notifications"
            label="Notification type"
            :items="customerMailNotifications"
            item-value="id"
            item-title="short_name"
            density="compact"
            :return-object="true"
            :chips="true"
            :closable-chips="true"
            :multiple="true"
          />
        </div>
        <div class="col-span-2">
          <div v-for="(notification, index) in values.mail_notifications" :key="index">
            <div class="grid grid-cols-2 items-center gap-2 mb-4">
              <div class="col-span-1">
                {{ customerMailNotifications.find((item: any) => item.id === notification.id)?.short_name }}
              </div>
              <InputAutocomplete
                :name="'notification' + notification.id + 'type'"
                v-model="notification.type"
                label="Select CC / TO"
                :items="[
                  { name: 'TO:', value: 'TO' },
                  { name: 'CC:', value: 'CC' },
                ]"
                item-value="value"
                item-title="name"
                density="compact"
                hide-details
                @on-change="onChangeType($event, notification)"
              />
            </div>
          </div>
        </div>
        <div class="col-span-2">
          <div class="flex justify-end items-center">
            <v-btn class="mr-4" color="secondary" @click="toggle"> Cancel </v-btn>
            <v-btn color="primary" @click="save"> Save </v-btn>
          </div>
        </div>
      </div>
      <v-table v-if="!showForm" density="compact">
        <thead>
          <tr>
            <th class="text-left">Actions</th>
            <th class="text-left">Email</th>
            <th class="text-left">Noty Type(s)</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in emails" :key="`cus-email-${index}`">
            <td>
              <div class="flex gap-2">
                <v-btn
                  size="small"
                  variant="text"
                  icon="mdi-pencil-outline"
                  color="blue-lighten-2"
                  density="compact"
                  @click="modeEdit(item)"
                >
                </v-btn>
                <v-btn
                  size="small"
                  variant="text"
                  icon="mdi-delete-outline"
                  color="red-lighten-2"
                  density="compact"
                  @click="showConfirmDelete(item.id)"
                ></v-btn>
              </div>
            </td>
            <td>{{ item.email }}</td>
            <td>
              <div class="overflow-y-auto max-h-32 my-2 border">
                <div v-for="(mailNoty, index) in item.mail_notifications" :key="`email-mail-noti-${index}`">
                  <span class="font-bold">{{ mailNoty.pivot.type }}</span
                  >: {{ mailNoty.short_name }}
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card-text>
  </v-card>
</template>
<script setup lang="ts">
import { mailNotifications } from '~/utils/data/systemData'
import { schema } from '~~/forms/emailNotificationTypeForm'
const { $api, $notifications } = useNuxtApp()
const snackbar = useSnackbar()
const confirm = $notifications.useConfirm()
const loadingStore = useLoadingStore()

const props = defineProps(['emails', 'catalogs', 'id'])
const emit = defineEmits(['refresh'])

const showForm = ref(false)

const { handleSubmit, values, setValues, resetForm } = useForm({
  validationSchema: schema,
  initialValues: {
    id: null,
    email: '',
    mail_notifications: [],
    mail_notification_ids: [],
  },
})

const toggle = () => {
  showForm.value = !showForm.value
  // if closed reset form
  if (!showForm.value) {
    resetForm({
      values: {
        id: null,
        email: '',
        mail_notification_ids: [],
      },
    })
  }
}

const customerMailNotifications = computed(() => {
  return mailNotifications.filter((notify) => notify.is_for_consignee)
})

const onChangeType = (value: any, notification: any) => {
  console.log(value, notification)
  setValues({
    mail_notifications: values.mail_notifications!.map((item: any) => {
      if (item.id === notification.id) {
        return {
          ...item,
          type: value,
        }
      }
      return item
    }),
  })
}

const onSuccess = async (values: any) => {
  await $api.consignees.upsertEmail(props.id, values)
  snackbar.add({ type: 'success', text: 'Email created' })
  emit('refresh')
  toggle()
}

function onInvalidSubmit({ values, errors, results }: any) {
  console.log(values) // current form values
  console.log(errors) // a map of field names and their first error message
  console.log(results) // a detailed map of field names and their validation results
  snackbar.add({ type: 'warning', text: 'Validate form before submit' })
}

const showConfirmDelete = async (id: any) => {
  const result = await confirm({
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

  if (result) {
    try {
      loadingStore.loading = true
      await $api.consignees.deleteEmail(id)

      snackbar.add({ type: 'success', text: 'Deleted' })
      emit('refresh')
    } catch (e) {
      console.error(e)
    } finally {
      setTimeout(() => {
        loadingStore.stop()
      }, 250)
    }
  }
}

const modeEdit = (item: any) => {
  console.log(item)
  showForm.value = true
  setValues({
    id: item.id,
    email: item.email,
    mail_notification_ids: item.mail_notifications.map((item: any) => item.id),
    mail_notifications: item.mail_notifications.map((notification: any) => ({
      short_name: notification.short_name,
      id: notification.id,
      type: notification.pivot?.type,
    })),
  })
}

const save = handleSubmit(onSuccess, onInvalidSubmit)
</script>
