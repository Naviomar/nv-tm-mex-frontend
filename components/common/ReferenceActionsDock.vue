<template>
  <!-- Pinned: the actions move into the top bar (right side); otherwise they float in the draggable drawer -->
  <Teleport v-if="docked" to="#reference-bar-actions">
    <div class="flex items-center gap-3">
      <slot></slot>
      <v-icon
        size="18"
        class="cursor-pointer"
        color="primary"
        title="Unpin from header"
        @click="setPinned(false)"
        >mdi-pin</v-icon
      >
    </div>
  </Teleport>
  <DraggableDiv v-else>
    <template #header-actions>
      <v-icon
        size="18"
        class="cursor-pointer"
        title="Pin to header"
        @mousedown.stop
        @click="setPinned(true)"
        >mdi-pin-outline</v-icon
      >
    </template>
    <slot></slot>
  </DraggableDiv>
</template>

<script setup lang="ts">
const props = defineProps<{ referenceNumber?: string | null }>()

const { pinned, label, load, setPinned } = useReferenceHeaderPin()

const barReady = ref(false)
const docked = computed(() => pinned.value && barReady.value)

// The bar belongs to the page; dock only when it is actually mounted
const checkBar = async () => {
  await nextTick()
  barReady.value = !!document.getElementById('reference-bar-actions')
}

watch(
  () => props.referenceNumber,
  (value) => {
    label.value = value ? String(value) : null
  },
  { immediate: true },
)
watch(pinned, checkBar)

onMounted(async () => {
  await load()
  checkBar()
})
onBeforeUnmount(() => {
  label.value = null
})
</script>
