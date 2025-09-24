<template>
  <div>
    <div>
      <v-btn color="primary" size="x-small" @click="showDialog"> View all </v-btn>
    </div>
    <v-dialog v-model="dialog" max-width="600">
      <v-card>
        <v-card-text>
          <v-list density="compact">
            <v-list-subheader>House AWBs</v-list-subheader>
            <v-list-item v-for="(houseAwb, index) in airRef.house_awbs" :key="`house-awb-${index}`">
              <template v-slot:prepend>
                <v-icon
                  icon="mdi-delete-outline"
                  color="red"
                  class="cursor-pointer"
                  @click="onDeleteClick(houseAwb)"
                ></v-icon>
              </template>
              <v-list-item-title>{{ houseAwb.name }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="dialog = false"> Close </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script setup lang="ts">
const { $api } = useNuxtApp()
const snackbar = useSnackbar()
const loadingStore = useLoadingStore()

const props = defineProps({
  airReference: {
    type: Object,
    required: true,
  },
})

const airRef = ref<any>(props.airReference)
// const airRef = toRef(props, 'airReference')

const emits = defineEmits(['refresh'])
const dialog = ref(false)

const showDialog = () => {
  dialog.value = true
}

const onDeleteClick = async (houseAwb: any) => {
  try {
    loadingStore.loading = true
    await $api.airExport.deleteHouseAwb(props.airReference.id, houseAwb.id)
    snackbar.add({ type: 'success', text: 'House AWB deleted' })
    emits('refresh')
    dialog.value = false
  } catch (error) {
    console.error(error)
  } finally {
    setTimeout(() => {
      loadingStore.loading = false
    }, 250)
  }
}

watch(
  () => props.airReference,
  (newVal, oldVal) => {
    // console.log('newVal', newVal)
    airRef.value = newVal
  },
  { deep: true, immediate: true }
)
</script>
