<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-wrap items-center gap-3">
      <div class="text-body-2 text-medium-emphasis flex-1" style="min-width: 260px">
        Events that affect or close port operations (hurricanes, closures, strikes, congestion...), with start and end dates.
      </div>
      <v-btn-toggle v-model="view" mandatory density="comfortable" variant="outlined" divided color="primary">
        <v-btn value="list" size="small" prepend-icon="mdi-format-list-bulleted">List</v-btn>
        <v-btn value="calendar" size="small" prepend-icon="mdi-calendar-month-outline">Calendar</v-btn>
      </v-btn-toggle>
      <Can permission="port-logbook-create">
        <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreate()">Add event</v-btn>
      </Can>
    </div>

    <PortLogbookSummary :summary="summary" @select-status="goToList" />

    <PortLogbookTable
      v-if="view === 'list'"
      :refresh-key="refreshKey"
      :status="listStatus"
      @open="openDetail"
      @edit="openEdit"
      @close-event="closeEntry"
      @delete="deleteEntry"
    />
    <PortLogbookCalendar v-else :refresh-key="refreshKey" @open="openDetail" @create="openCreate" />

    <PortLogbookEntryDialog v-model="entryDialog" :entry="selected" :start-date="startDate" @saved="refresh" />
    <PortLogbookDetailDialog
      v-model="detailDialog"
      :entry="selected"
      @edit="openEdit"
      @close-event="closeEntry"
      @delete="deleteEntry"
    />
  </div>
</template>
<script setup lang="ts">
import type { IPortLogbookEntry } from '~/repository/modules/catalogs/portLogbook'

const { $api, $notifications } = useNuxtApp()
const confirm = $notifications.useConfirm()
const loadingStore = useLoadingStore()
const snackbar = useSnackbar()
const { entryTitle } = usePortLogbook()

const view = ref<'list' | 'calendar'>('list')
const summary = ref<Record<string, number>>({})
const refreshKey = ref(0)
const listStatus = ref<string | null>(null)
const selected = ref<IPortLogbookEntry | null>(null)
const startDate = ref<string | null>(null)
const entryDialog = ref(false)
const detailDialog = ref(false)

const loadSummary = async () => {
  try {
    summary.value = (await $api.portLogbook.getSummary()) as any
  } catch (e) {
    console.error(e)
  }
}

const refresh = async () => {
  refreshKey.value++
  await loadSummary()
  // keep the open detail in sync with what was just edited/closed
  if (detailDialog.value && selected.value) {
    try {
      selected.value = (await $api.portLogbook.getById(selected.value.id)) as IPortLogbookEntry
    } catch (e) {
      console.error(e)
    }
  }
}

const goToList = (status: string) => {
  view.value = 'list'
  listStatus.value = status
}

const openCreate = (date?: string) => {
  selected.value = null
  startDate.value = typeof date === 'string' ? date : null
  entryDialog.value = true
}
const openEdit = (entry: IPortLogbookEntry) => {
  selected.value = entry
  startDate.value = null
  entryDialog.value = true
}
const openDetail = (entry: IPortLogbookEntry) => {
  selected.value = entry
  detailDialog.value = true
}

const closeEntry = async (entry: IPortLogbookEntry) => {
  const result = await confirm({
    title: 'Close event',
    confirmationText: 'Close event',
    content: `Mark "${entryTitle(entry)}" at ${entry.port?.name} as resolved now (the port resumes operations)?`,
    dialogProps: { persistent: true, maxWidth: 500 },
    confirmationButtonProps: { color: 'primary' },
  })
  if (!result) return
  try {
    loadingStore.start()
    await $api.portLogbook.close(entry.id)
    snackbar.add({ type: 'success', text: 'Event closed' })
    await refresh()
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => loadingStore.stop(), 250)
  }
}

const deleteEntry = async (entry: IPortLogbookEntry) => {
  const result = await confirm({
    title: 'Are you sure?',
    confirmationText: 'Delete',
    content: 'Please confirm you want to delete this port event.',
    dialogProps: { persistent: true, maxWidth: 500 },
    confirmationButtonProps: { color: 'primary' },
  })
  if (!result) return
  try {
    loadingStore.start()
    await $api.portLogbook.delete(entry.id)
    detailDialog.value = false
    snackbar.add({ type: 'success', text: 'Port event deleted' })
    await refresh()
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => loadingStore.stop(), 250)
  }
}

onMounted(loadSummary)
</script>
