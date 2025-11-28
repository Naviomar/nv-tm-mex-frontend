<template>
  <div>
    <v-card>
      <v-card-title> Release </v-card-title>
      <v-card-subtitle> Release TM / Line </v-card-subtitle>
      <v-card-text>
        <div class="grid grid-cols-2 gap-2">
          <div>
            <v-card color="green-lighten-4">
              <v-card-title> Release TM (HBL)</v-card-title>
              <v-card-text>
                <div class="grid grid-cols-1 gap-2">
                  <v-autocomplete
                    v-model="formTm.release_type"
                    density="compact"
                    :items="blTypes"
                    item-title="name"
                    item-value="name"
                    label="Release typing"
                  />
                  <v-textarea v-model="formTm.notes" density="compact" label="Notes" :rows="3" />
                </div>
              </v-card-text>
              <v-card-actions>
                <v-btn color="green-darken-4" @click="onClickSaveReleaseTm">Save</v-btn>
              </v-card-actions>
            </v-card>

            <div class="font-bold pt-4 px-4">Saved TM releases</div>
            <v-table density="compact">
              <thead>
                <tr>
                  <th class="font-bold!">Release type</th>
                  <th class="font-bold!">Notes</th>
                  <th class="font-bold!">User</th>
                  <th class="font-bold!">Date</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="releases.tm.length === 0">
                  <td colspan="4" class="text-center">No data</td>
                </tr>
                <tr v-for="(rls, index) in releases.tm" :key="`ref-rel-tm-${rls.id}`">
                  <td>{{ rls.release_type }}</td>
                  <td>{{ rls.notes }}</td>
                  <td>{{ rls.creator?.name }}</td>
                  <td>{{ formatDateString(rls.created_at) }}</td>
                </tr>
              </tbody>
            </v-table>
          </div>
          <div>
            <v-card color="green-lighten-4">
              <v-card-title> Release Line (MBL)</v-card-title>
              <v-card-text>
                <div class="grid grid-cols-1 gap-2">
                  <div>
                    <v-autocomplete
                      v-model="formLine.release_type"
                      density="compact"
                      :items="blTypes"
                      item-title="name"
                      item-value="name"
                      label="Release typing"
                    />
                    <v-textarea v-model="formLine.notes" density="compact" label="Notes" :rows="3" />
                  </div>
                </div>
              </v-card-text>
              <v-card-actions>
                <v-btn color="primary" @click="onClickSaveReleaseLine">Save</v-btn>
              </v-card-actions>
            </v-card>

            <div class="font-bold pt-4 px-4">Saved Line releases</div>
            <v-table density="compact">
              <thead>
                <tr>
                  <th class="font-bold!">Release type</th>
                  <th class="font-bold!">Notes</th>
                  <th class="font-bold!">User</th>
                  <th class="font-bold!">Date</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="releases.line.length === 0">
                  <td colspan="4" class="text-center">No data</td>
                </tr>
                <tr v-for="(rls, index) in releases.line" :key="`ref-rel-line-${rls.id}`">
                  <td>{{ rls.release_type }}</td>
                  <td>{{ rls.notes }}</td>
                  <td>{{ rls.creator?.name }}</td>
                  <td>{{ formatDateString(rls.created_at) }}</td>
                </tr>
              </tbody>
            </v-table>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>
<script setup lang="ts">
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()

const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
})

const releases = ref<any>({
  tm: [],
  line: [],
})

const blTypes = [{ name: 'Sea waybill' }, { name: 'TLX Release' }, { name: 'Original' }]

const formTm = ref({
  release_type: '',
  notes: '',
})

const formLine = ref({
  release_type: '',
  notes: '',
})

const onClickSaveReleaseTm = async () => {
  try {
    if (!formTm.value.release_type) {
      snackbar.add({ type: 'warning', text: 'Please fill all fields' })
      return
    }
    loadingStore.loading = true
    const body = {
      release_type: formTm.value.release_type,
      notes: formTm.value.notes,
    }
    const response = (await $api.referenciasExport.saveReleaseTm(props.id.toString(), body)) as any

    snackbar.add({ type: 'success', text: 'Release TM saved successfully' })

    formTm.value = {
      release_type: '',
      notes: '',
    }

    await getSeaExportReleases()
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const onClickSaveReleaseLine = async () => {
  try {
    if (!formLine.value.release_type) {
      snackbar.add({ type: 'warning', text: 'Please fill all fields' })
      return
    }
    loadingStore.loading = true
    const body = {
      release_type: formLine.value.release_type,
      notes: formLine.value.notes,
    }
    const response = (await $api.referenciasExport.saveReleaseLine(props.id.toString(), body)) as any

    snackbar.add({ type: 'success', text: 'Release Line saved successfully' })

    formLine.value = {
      release_type: '',
      notes: '',
    }

    await getSeaExportReleases()
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const getSeaExportReleases = async () => {
  try {
    loadingStore.loading = true
    const response = (await $api.referenciasExport.getReleasesTmLine(props.id.toString())) as any
    releases.value = response
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

onMounted(async () => {
  await getSeaExportReleases()
})
</script>
