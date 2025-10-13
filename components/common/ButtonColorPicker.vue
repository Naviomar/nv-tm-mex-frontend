<template>
  <div class="color-picker-container" ref="buttonContainer">
    <!-- Button to toggle the color picker -->
    <v-btn color="black" @click="toggleColorPicker" icon size="x-small" variant="tonal">
      <v-icon>mdi-format-color-fill</v-icon>
    </v-btn>

    <!-- Inline Color Picker -->
    <v-color-picker
      v-if="showColorPicker"
      v-model="selectedColor"
      mode="hexa"
      hide-canvas
      hide-inputs
      show-swatches
      :swatches="customSwatches"
      class="color-picker"
      v-click-outside="onClickOutside"
      :style="colorPickerStyles"
      @update:model-value="updateColor"
    />

    <!-- Display the selected color -->
    <div v-if="false" class="mt-4">
      <p>Selected Color: {{ selectedColor }}</p>
      <div :style="{ backgroundColor: selectedColor, height: '50px', width: '50px' }"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
const darkMode = useDarkMode()

const props = defineProps({
  item: {
    type: Object as PropType<any>,
    required: true,
  },
})

const emits = defineEmits(['update'])

// Reactive state for the color picker
const showColorPicker = ref(false)
const selectedColor = ref<any>(null) // Default color

// Define custom swatches
const customSwatches = [
  ['#2196F3', '#9C27B0', '#4CAF50', '#FF9800', '#FFC107'], // Row 1
  ['#009688', '#F44336', '#3F51B5', '#00BCD4', '#607D8B'], // Row 2
]

// const customSwatches = [
//   ['#B2DFDB', '#B2EBF2', '#FFE082', '#DCE775', '#C5CAE9'], // Row 1
//   ['#F8BBD0', '#FFCCBC', '#E1BEE7', '#CFD8DC', '#FFF59D'], // Row 2
// ];

// const customSwatches = [
//   ['#00796B', '#0097A7', '#FF8F00', '#AFB42B', '#303F9F'], // Row 1
//   ['#C2185B', '#F4511E', '#7B1FA2', '#455A64', '#FBC02D'], // Row 2
// ];

// Determine the position of the color picker
const buttonContainer = ref<any>(null)
const positionAbove = ref(false)

const toggleColorPicker = () => {
  showColorPicker.value = !showColorPicker.value

  if (showColorPicker.value && buttonContainer.value) {
    // Calculate whether to show the picker above or below
    const rect = buttonContainer.value.getBoundingClientRect()
    const viewportHeight = window.innerHeight
    positionAbove.value = rect.bottom + 200 > viewportHeight
  }
}

const updateColor = (color: string) => {
  showColorPicker.value = false
  emits('update', selectedColor.value)
}

const onClickOutside = () => {
  showColorPicker.value = false
}

const colorPickerStyles = computed(() => ({
  position: 'absolute',
  zIndex: 10,
  top: positionAbove.value ? '-220px' : '40px',
  left: '0',
}))

// watch(
//   () => selectedColor.value,
//   (color) => {
//     if (color) {
//       emits('update', color)
//     }
//   },
//   { immediate: true }
// )

// watch(
//   () => props.item.color,
//   (color) => {
//     selectedColor.value = color
//   },
//   { immediate: true }
// )

onMounted(() => {
  selectedColor.value = props.item.color
})
</script>

<style scoped>
.color-picker-container {
  position: relative;
  display: inline-block;
}
</style>
