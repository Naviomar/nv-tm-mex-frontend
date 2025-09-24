<template>
  <div class="" @mouseover="playAvatar">
    <canvas ref="canvas" :style="classObject"></canvas>
  </div>
</template>

<script setup>
import { Fit, Layout, Rive } from '@rive-app/canvas'
import { random } from 'nanoid'

const props = defineProps({
  /**
   * Path to the Rive file (e.g., "/path/to/file.riv")
   */
  src: {
    type: String,
    required: true,
  },
  /**
   * Optional artboard name
   */
  artboard: {
    type: String,
    default: null,
  },
  /**
   * Optional state machine name
   */
  stateMachine: {
    type: String,
    default: null,
  },
  /**
   * Optional autoplay
   */
  autoplay: {
    type: Boolean,
    default: true,
  },
  /**
   * Optional width
   */
  width: {
    type: [Number, String],
    default: 100,
  },
  /**
   * Optional height
   */
  height: {
    type: [Number, String],
    default: 100,
  },
})

const avatarInputs = reactive({
  hair: 0,
  faceHair: 0,
  eyes: 0,
  bodyColor: 0,
  backgroundColor: 0,
})

const avatarStore = useAvatarStore()

const classObject = reactive({
  display: 'block',
  width: props.width,
  // height: props.height,
})

// Initialize inputs for the state machine
const initializeInputs = () => {
  // console.log('Initializing inputs...')
  // console.log(riveInstance)
  // console.log(props.stateMachine)
  // console.log(riveInstance.stateMachineInputs(props.stateMachine))

  // Sync Rive inputs with store
  const inputs = riveInstance.stateMachineInputs(props.stateMachine)

  const hairInput = inputs.find((input) => input.name === 'numBodyHair')
  const faceHairInput = inputs.find((input) => input.name === 'numBodyFaceHair')
  const eyesInput = inputs.find((input) => input.name === 'numBodyEyes')
  const bodyColorInput = inputs.find((input) => input.name === 'numBodyColor')
  const backgroundColorInput = inputs.find((input) => input.name === 'numBackgroundColor')

  // Set default or store values
  if (hairInput) hairInput.value = avatarStore.hair || 0
  if (faceHairInput) faceHairInput.value = avatarStore.faceHair || 0
  if (eyesInput) eyesInput.value = avatarStore.eyes || 0
  if (bodyColorInput) bodyColorInput.value = avatarStore.bodyColor || 0
  if (backgroundColorInput) backgroundColorInput.value = avatarStore.backgroundColor || 0

  // Update store if inputs were uninitialized
  avatarStore.setHair(hairInput?.value || 0)
  avatarStore.setFaceHair(faceHairInput?.value || 0)
  avatarStore.setEyes(eyesInput?.value || 0)
  avatarStore.setBodyColor(bodyColorInput?.value || 0)
  avatarStore.setBackgroundColor(backgroundColorInput?.value || 0)

  // get numBodySize [0, 2], numBodyFaceHair [0 to 3], numBodyHair [0 to 10], numBodyEyes [0, 2], numBodyColor [0 to 3]
  // random each of them

  // setRandomValue(faceHair, 4) // 4 face hair options
  // setRandomValue(hair, 11) // 11 hair options
  // setRandomValue(eyes, 3) // 3 eye options
  // setRandomValue(color, 4) // 4 color options
}

const setRandomValue = (input, maxValue) => {
  if (input) {
    input.value = Math.floor(Math.random() * maxValue)
  }
}

const canvas = ref(null) // Reference to the canvas element
let riveInstance = null

// Function to load and initialize the Rive animation
const loadRive = async (src) => {
  // console.log('Loading Rive')
  if (!canvas.value) {
    console.warn('No canvas found.')
    return
  }
  if (riveInstance) riveInstance.cleanup() // Clean up previous instance

  riveInstance = new Rive({
    src,
    canvas: canvas.value,
    artboard: props.artboard,
    // animations: props.stateMachine ? [props.stateMachine] : undefined,
    stateMachines: props.stateMachine ? props.stateMachine : undefined,
    isTouchScrollEnabled: true,
    autoplay: props.autoplay,
    layout: new Layout({
      alignment: 'center',
      fit: Fit.Contain,
    }),
    onLoad: () => {
      // console.log(`Rive file loaded: ${src}`)
      riveInstance.resizeDrawingSurfaceToCanvas()
      initializeInputs()
    },
    onError: (err) => console.error(`Error loading Rive file: ${err}`),
  })
}

// Play the avatar animation
// const playAvatar = () => {
//   if (!riveInstance.stateMachineInputs(props.stateMachine)) {
//     loadRive(props.src)
//     return
//   }
//   console.log(riveInstance.stateMachineInputs(props.stateMachine))
//   if (props.stateMachine) {
//     // riveInstance.play(props.stateMachine)
//     const avatarChanges = riveInstance.stateMachineInputs(props.stateMachine).find((input) => {
//       return input.name === 'changes'
//     })
//     if (avatarChanges) {
//       avatarChanges.fire()
//     }
//   }
// }

const playAvatar = () => {
  const changesInput = riveInstance.stateMachineInputs(props.stateMachine)?.find((input) => input.name === 'changes')
  if (changesInput) {
    changesInput.fire()
  }
}

// Watch for changes in the `src` prop
// watch(
//   () => props.src,
//   async (newSrc) => {
//     console.log('watch src')
//     if (newSrc) await loadRive(newSrc)
//   },
//   { immediate: true }
// )

watch(
  () => avatarStore.hair,
  (newHair) => {
    const hairInput = riveInstance.stateMachineInputs(props.stateMachine)?.find((input) => input.name === 'numBodyHair')
    if (hairInput) hairInput.value = newHair
  }
)

watch(
  () => avatarStore.faceHair,
  (newFaceHair) => {
    const faceHairInput = riveInstance
      .stateMachineInputs(props.stateMachine)
      ?.find((input) => input.name === 'numBodyFaceHair')
    if (faceHairInput) faceHairInput.value = newFaceHair
  }
)

watch(
  () => avatarStore.eyes,
  (newEyes) => {
    const eyesInput = riveInstance.stateMachineInputs(props.stateMachine)?.find((input) => input.name === 'numBodyEyes')
    if (eyesInput) eyesInput.value = newEyes
  }
)

watch(
  () => avatarStore.bodyColor,
  (newBodyColor) => {
    const bodyColorInput = riveInstance
      .stateMachineInputs(props.stateMachine)
      ?.find((input) => input.name === 'numBodyColor')
    if (bodyColorInput) bodyColorInput.value = newBodyColor
  }
)

watch(
  () => avatarStore.backgroundColor,
  (newBackgroundColor) => {
    const backgroundColorInput = riveInstance
      .stateMachineInputs(props.stateMachine)
      ?.find((input) => input.name === 'numBackgroundColor')
    if (backgroundColorInput) backgroundColorInput.value = newBackgroundColor
  }
)

onMounted(async () => {
  if (props.src) await loadRive(props.src)
})

onBeforeUnmount(() => {
  if (riveInstance) riveInstance.cleanup()
})
</script>

<style scoped>
.rive-canvas {
  display: block;
  width: 100px;
}
</style>
