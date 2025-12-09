<template>
  <div>
    <v-card>
      <v-card-text>
        <!-- <pre>{{ props.reference?.revalidation }}</pre> -->
        <div class="grid grid-cols-3">
          <div>
            <span
              class="inline-flex items-center justify-center h-8 w-8 rounded-full bg-purple-500 text-white text-center text-sm font-bold"
            >
              1
            </span>
            <span class="ms-2">Seleccione un nuevo PDF para sellar</span>
          </div>
          <div class="flex">
            <v-file-input v-model="form.files" density="compact" counter label="File PDF" />

            <v-btn color="primary" @click="process"> Upload pdf</v-btn>
          </div>
        </div>
        <div class="flex gap-4 border p-4" v-if="fileOriginal || fileSealed">
          <h2>
            <UserInfoBadge :item="props.reference?.revalidation"> Files loaded </UserInfoBadge>
          </h2>
          <div v-if="fileOriginal">
            <div>Original PDF to seal <ButtonDownloadS3Object :s3Path="fileOriginal" /></div>
            <div class="flex gap-2">
              <v-btn color="primary" size="small" @click="previewPdfToSeal">Load PDF again</v-btn>
              <v-btn v-if="false" color="red" size="small" @click="startAgain">Delete & start again</v-btn>
            </div>
          </div>
          <div v-if="fileSealed">Sealed PDF <ButtonDownloadS3Object :s3Path="fileSealed" /></div>
        </div>

        <div class="grid grid-cols-7 gap-2 p-4 mb-4" v-if="fileOriginal || fileSealed">
          <div class="col-span-4">
            <div>
              <span
                class="inline-flex items-center justify-center h-8 w-8 rounded-full bg-purple-500 text-white text-center text-sm font-bold"
              >
                2
              </span>
              <span class="ms-2">Seleccione la página deseada para agregar el sello.</span>
            </div>
            <div class="flex flex-wrap images-preview">
              <div v-for="(image, index) in app.imagesPreviews" :key="`preview-page-${index}`">
                <img
                  v-if="image.value"
                  class="hover:cursor-pointer hover:border border-solid border-black p-4"
                  :src="image.value"
                  alt="Imagen"
                  width="150"
                  @click.prevent="app.transfer(image.value, index, true)"
                />
              </div>
            </div>
            <div>
              Selected page:
              {{ app.pageSelected !== null ? app.pageSelected + 1 : 'N/A' }}
            </div>
          </div>

          <div class="col-span-3">
            <div>
              <span
                class="inline-flex items-center justify-center h-8 w-8 rounded-full bg-purple-500 text-white text-center text-sm font-bold"
              >
                3
              </span>
              <span class="ms-2">Seleccione el tipo de sello y el tamaño del mismo.</span>
            </div>
            <div class="border-l border-black grid grid-cols-1 p-4">
              <div class="flex">
                <div class="text-center">
                  <div :class="cssSealRevalidado" @click="app.generate('REVALIDACION')">
                    <div>
                      <v-icon class="text-h3">mdi-stamper</v-icon>
                    </div>
                    <div>Revalidación</div>
                  </div>
                </div>
                <div :class="cssSealEndoso" @click="app.generate('ENDOSO')">
                  <div>
                    <v-icon class="text-h3">mdi-stamper</v-icon>
                  </div>
                  <div>Endoso</div>
                </div>
                <div class="flex gap-2 m-4 justify-center">
                  <div class="justify-center">{{ fontSizeRef }} pts</div>
                  <v-icon class="bg-black text-white rounded-xl p-4" @click="app.decreaseFont()">mdi-minus</v-icon>
                  <v-icon class="bg-black text-white rounded-xl p-4" @click="app.increaseFont()">mdi-plus</v-icon>
                </div>
              </div>
              <div class="block">
                <v-btn color="primary" @click="saveSeal"> Save PDF with seals</v-btn>
              </div>
            </div>
          </div>
        </div>
        <div>
          <div class="mb-2" v-if="fileOriginal || fileSealed">
            <span
              class="inline-flex items-center justify-center h-8 w-8 rounded-full bg-purple-500 text-white text-center text-sm font-bold"
            >
              4
            </span>
            <span class="ms-2"
              >Click y arrastre para colocar el sello en el lugar deseado
              <i>"puede seleccionar otra página para agregar un nuevo sello"</i>
            </span>
          </div>
          <canvas ref="canvasCustom" class="border" width="500" height="350"></canvas>

          <canvas
            ref="canvas1"
            class="border"
            width="1200"
            height="1500"
            @mousedown="app.startDragging"
            @mousemove="handleDragging"
            @mouseup="app.stopDragging"
          ></canvas>
          <canvas
            ref="canvas2"
            class="border"
            width="1200"
            height="1500"
            @mousedown="app.startDragging"
            @mousemove="handleDragging"
            @mouseup="app.stopDragging"
          ></canvas>
          <canvas
            ref="canvas3"
            class="border"
            width="1200"
            height="1500"
            @mousedown="app.startDragging"
            @mousemove="handleDragging"
            @mouseup="app.stopDragging"
          ></canvas>
          <canvas
            ref="canvas4"
            class="border"
            width="1200"
            height="1500"
            @mousedown="app.startDragging"
            @mousemove="handleDragging"
            @mouseup="app.stopDragging"
          ></canvas>
          <canvas
            ref="canvas5"
            class="border"
            width="1200"
            height="1500"
            @mousedown="app.startDragging"
            @mousemove="handleDragging"
            @mouseup="app.stopDragging"
          ></canvas>
          <canvas
            ref="canvas6"
            class="border"
            width="1200"
            height="1500"
            @mousedown="app.startDragging"
            @mousemove="handleDragging"
            @mouseup="app.stopDragging"
          ></canvas>
          <canvas
            ref="canvas7"
            class="border"
            width="1200"
            height="1500"
            @mousedown="app.startDragging"
            @mousemove="handleDragging"
            @mouseup="app.stopDragging"
          ></canvas>
          <canvas
            ref="canvas8"
            class="border"
            width="1200"
            height="1500"
            @mousedown="app.startDragging"
            @mousemove="handleDragging"
            @mouseup="app.stopDragging"
          ></canvas>
          <canvas
            ref="canvas9"
            class="border"
            width="1200"
            height="1500"
            @mousedown="app.startDragging"
            @mousemove="handleDragging"
            @mouseup="app.stopDragging"
          ></canvas>
          <canvas
            ref="canvas10"
            class="border"
            width="1200"
            height="1500"
            @mousedown="app.startDragging"
            @mousemove="handleDragging"
            @mouseup="app.stopDragging"
          ></canvas>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>
<script setup lang="ts">
const { $api } = useNuxtApp()
const snackbar = useSnackbar()

const loadingIndicator = useLoadingIndicator()
const loadingStore = useLoadingStore()

const props = defineProps({
  reference: {
    type: Object,
    required: false,
  },
})

const { user } = useSanctumAuth() as any

const emits = defineEmits(['updateReference'])

const imageStamp = ref<any>()
const imagenURL1 = ref<any>()
const imagenURL2 = ref<any>()
const imagenURL3 = ref<any>()
const imagenURL4 = ref<any>()
const imagenURL5 = ref<any>()
const imagenURL6 = ref<any>()
const imagenURL7 = ref<any>()
const imagenURL8 = ref<any>()
const imagenURL9 = ref<any>()
const imagenURL10 = ref<any>()

let offsetX = 0
let offsetY = 0

const canvas1 = ref<any>(null)
const canvas2 = ref<any>(null)
const canvas3 = ref<any>(null)
const canvas4 = ref<any>(null)
const canvas5 = ref<any>(null)
const canvas6 = ref<any>(null)
const canvas7 = ref<any>(null)
const canvas8 = ref<any>(null)
const canvas9 = ref<any>(null)
const canvas10 = ref<any>(null)

let isResizing = false
let sealWidth = 100 // Initial width of the seal
let sealHeight = 100 // Initial height of the seal

const cachedPageImages = []
const imageSelected = ref()
const containerSelected = ref<any>(null)
const canvasCustom = ref<any>(null)
let isDragging = false

const upload = ref<boolean>(false)
const fileOriginal = ref(null)
const fileSealed = ref(null)
const numPages = ref<number>(0)

const fontSizeRef = ref(12)
const typeSeal = ref('')

const form = reactive({
  files: [],
})

watch(
  () => props.reference,
  (value: any) => {
    if (value) {
      fileOriginal.value = value.revalidation?.attachment_original
      fileSealed.value = value.revalidation?.attachment_sellos
    }
  },
  { immediate: true, deep: true }
)

const cssSealRevalidado = computed(() => {
  let bgColor = ''
  if (typeSeal.value === 'REVALIDACION') {
    bgColor = 'bg-green-300 dark:bg-green-500'
  }
  return {
    'text-center w-32 m-4 p-4 border rounded-md hover:bg-green-600 hover:cursor-pointer': true,
    [bgColor]: true,
  }
})

const cssSealEndoso = computed(() => {
  let bgColor = ''
  if (typeSeal.value === 'ENDOSO') {
    bgColor = 'bg-green-300 dark:bg-green-500'
  }
  return {
    'text-center w-32 m-4 p-4 border rounded-md hover:bg-green-600 hover:cursor-pointer': true,
    [bgColor]: true,
  }
})

const totalLabelCargoType = computed(() => {
  if (props.reference?.cargo_type === 'FCL') {
    return `TOTAL CONTENEDORES: ${props.reference?.containers.length} CTRS`
  }
  if (props.reference?.cargo_type !== 'FCL') {
    // get total Kgs and total # of packages for each container
    let totalKgs = 0
    let totalPackages = 0
    props.reference?.containers.forEach((container: any) => {
      totalKgs += parseFloat(container.weight)
      totalPackages += container.num_packages
    })
    return `TOTAL KGS: ${totalKgs} KGS, TOTAL PAQUETES: ${totalPackages}`
  }
})

const hashSeal = computed(() => {
  return btoa(
    `TM_#${props.reference?.reference_number} ${props.reference?.voyage_discharge?.name} ${props.reference?.line?.name}`
  )
})

const app = reactive({
  canvasActive: null as any,
  imageActive: null as any,
  stampSelected: null as any,
  stampSize: {
    width: null as number | null,
    height: null as number | null,
  },
  pageSelected: null as any,
  canvas: [canvas1, canvas2, canvas3, canvas4, canvas5, canvas6, canvas7, canvas8, canvas9, canvas10],
  imagesPreviews: [
    imagenURL1,
    imagenURL2,
    imagenURL3,
    imagenURL4,
    imagenURL5,
    imagenURL6,
    imagenURL7,
    imagenURL8,
    imagenURL9,
    imagenURL10,
  ],
  states: [] as { posX: number | null; posY: number | null; stamp: any }[],
  init: function () {
    console.log('app init')
    this.states = []
    for (let i = 0; i < this.canvas.length; i++) {
      const canvas = this.canvas[i]!.value
      console.log('init canvas', canvas)
      canvas.style.display = 'none'
      this.states.push({ posX: null, posY: null, stamp: null })
    }
    // aqui esta poniendo el logo de la empresa por defecto al iniciar
    // const img = new Image()
    // img.src = '/dot.jpg'
    // this.stampSelected = img
    console.log(this.states)
    try {
      canvasCustom.value.style.display = 'none'
    } catch (e) {
      console.error('app init', e)
    }
  },
  transfer: function (imageBlob: any, container: number, draw: boolean) {
    try {
      // console.log('app transfer')
      console.log(imageBlob, container, draw)
      this.hideShowCanvas('none')
      const canvasRef = this.canvas[container]
      const canvas = canvasRef!.value
      console.log('canvas', canvas)
      canvas.style.display = 'block'

      const ctx = canvas.getContext('2d')
      // console.log('ctx', ctx)
      // const newImage = this.transformImage(imageBlob)

      const img = new Image()
      img.onload = () => {
        ctx.drawImage(img, 0, 0, 1200, 1500)
        if (draw) {
          const prevState = this.states[container]
          if (prevState.stamp) {
            console.warn('ESTADO PREVIO')
            console.warn(prevState)
            const posX = prevState.posX ? prevState.posX : 100
            const posY = prevState.posY ? prevState.posY : 100
            ctx.drawImage(prevState.stamp, posX, posY)
          }

          this.pageSelected = container
        }
      }
      img.src = imageBlob

      // console.log('newImage', newImage)
      // ctx.drawImage(newImage, 0, 0, 1200, 1500)
      // console.log(this.transformImage(imageBlob));
      // document.body.appendChild(this.transformImage(imageBlob));
    } catch (e) {
      console.error(e)
    }
  },

  startDragging: function (event: any) {
    const canvas = app.canvas[app.pageSelected]?.value
    const handleSize = 10
    const clickX = event.clientX - canvas.getBoundingClientRect().left
    const clickY = event.clientY - canvas.getBoundingClientRect().top

    // Check if the user clicked on the top-left handle
    if (
      clickX >= offsetX - handleSize / 2 &&
      clickX <= offsetX + handleSize / 2 &&
      clickY >= offsetY - handleSize / 2 &&
      clickY <= offsetY + handleSize / 2
    ) {
      isResizing = true
    } else {
      isDragging = true
    }

    handleDragging(event)
  },
  stopDragging: function (event: any) {
    isDragging = false
    isResizing = false
  },
  hideShowCanvas: function (value: any) {
    this.canvas.forEach((c) => {
      c.value.style.display = value
    })
  },
  transformImage: function (blob: any) {
    const image = new Image()
    image.src = blob
    return image
  },
  saveState: function (x: number, y: number) {
    const state = this.states[this.pageSelected]
    state!.posX = x
    state!.posY = y
    state!.stamp = this.stampSelected
  },
  save: function () {
    const dataUrls: string[] = []
    app.canvas.forEach((canvas) => {
      const dataUrl = canvas.value.toDataURL('image/png')
      dataUrls.push(dataUrl)
    })

    const formData = new FormData()
    dataUrls.forEach((img, index) => {
      console.log(img)
      formData.append(`image_${index}`, img)
    })
    // console.log(formData.getAll("image_1"));
  },
  increaseFont: function () {
    let tmp = fontSizeRef.value + 1
    if (tmp <= 18) fontSizeRef.value += 1

    this.generate(typeSeal.value)

    const image = this.imagesPreviews[this.pageSelected].value
    this.transfer(image, this.pageSelected, true)
  },
  decreaseFont: function () {
    let tmp = fontSizeRef.value - 1
    if (tmp >= 10) fontSizeRef.value -= 1
    this.generate(typeSeal.value)

    const image = this.imagesPreviews[this.pageSelected].value
    this.transfer(image, this.pageSelected, true)
  },
  generate: function (type: string) {
    console.warn('new seal')
    let customAgent = 'Pending customs agent'
    let customAgentPatente = ''
    let customAgentPatente2 = ''
    if (props.reference?.release?.release_agent) {
      customAgent = props.reference?.release?.release_agent.name
      customAgentPatente = `Patente: ${props.reference?.release?.release_agent.patente}`
      customAgentPatente2 = `${customAgent} ${props.reference?.release?.release_agent.patente}`
    }

    const date = new Date()

    const formattedDate =
      date.getFullYear() +
      '-' +
      String(date.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(date.getDate()).padStart(2, '0') +
      ' ' +
      String(date.getHours()).padStart(2, '0') +
      ':' +
      String(date.getMinutes()).padStart(2, '0') +
      ':' +
      String(date.getSeconds()).padStart(2, '0')

    const ctx = canvasCustom.value.getContext('2d')
    ctx.clearRect(0, 0, 500, 350)

    typeSeal.value = type
    const tipoSello = type === 'REVALIDACION' ? 'REVALIDADO' : 'ENDOSADO'
    let increment = 15
    const testFontSize = 14

    let baseWidth = 350
    let baseHeight = 175
    let scaleFactor = fontSizeRef.value / 12

    let w = Math.min(baseWidth * scaleFactor, canvasCustom.value.width)
    let h = Math.min(baseHeight * scaleFactor, canvasCustom.value.height)

    // console.log('w', w, 'h', h)
    // console.log('ctx', ctx)

    // let w = (320 * fontSizeRef.value) / 12
    // let h = (200 * fontSizeRef.value) / 12

    const fontName = `'Arial Narrow'`
    increment = Math.floor((fontSizeRef.value * increment) / 12)
    let base = 15
    const baseFont = fontSizeRef.value

    ctx.font = `${baseFont}px ${fontName}`
    ctx.textAlign = 'left'
    const maxWidth = w - 20 // Allow some padding inside the box
    const lineHeight = increment

    // Update calls
    base = wrapText(
      ctx,
      'B/M: ' + props.reference?.voyage_discharge?.voyage?.vessel?.name,
      10,
      base,
      maxWidth,
      lineHeight
    )

    // Use the new wrapTextWithAlignment for Voyage and ETA
    base = wrapTextWithAlignment(
      ctx,
      'Voyage: ' + (props.reference?.voyage_discharge.voyage.name || ''),
      'ETA: ' + (props.reference?.voyage_discharge?.eta_date || ''),
      20,
      base,
      maxWidth,
      lineHeight + 4
    )

    // Centered Text Example: 'type' text
    ctx.textAlign = 'center' // Set text alignment to center
    ctx.font = `bold ${baseFont + 3}px ${fontName}`
    base = wrapText(ctx, tipoSello, w / 2, base, maxWidth, lineHeight + 4) // Center type text

    ctx.textAlign = 'left'
    ctx.font = `${baseFont - 1}px ${fontName}`
    base = wrapText(ctx, 'CONFORME CON LA ENTREGA DE ESTA MERCANCIA', 10, base, maxWidth, lineHeight + 1)
    base = wrapText(ctx, 'AL AGENTE ADUANAL', 10, base, maxWidth, lineHeight + 1)

    ctx.font = `bold ${baseFont}px ${fontName}`
    base = wrapText(ctx, customAgentPatente2, 10, base, maxWidth, lineHeight + 1)

    ctx.font = `${baseFont}px ${fontName}`
    base = wrapText(ctx, totalLabelCargoType.value, 10, base, maxWidth, lineHeight + 1)
    base = wrapText(ctx, `${user.value?.name?.toUpperCase()} ${formattedDate}`, 10, base, maxWidth, lineHeight + 4)

    ctx.textAlign = 'center' // Set text alignment to center
    ctx.font = `bold ${baseFont}px ${fontName}`
    base = wrapText(ctx, 'TRANSPORTE MULTIMODAL, S.A. DE C.V.', w / 2, base, maxWidth, lineHeight)

    ctx.lineWidth = 3
    ctx.strokeRect(0, 0, w, h)

    const dataUrl = canvasCustom.value.toDataURL('image/png')
    const image = new Image()
    image.onload = () => {
      this.stampSelected = image
    }
    image.src = dataUrl

    snackbar.add({ type: 'success', text: 'Ahora de click en la página deseada para agregar el sello' })

    try {
      // const ctx2 = this.canvas[this.pageSelected]!.value.getContext('2d');
      // ctx2.drawImage(this.stampSelected, 0, 0);
      // this.saveState(100, 100);
    } catch (e) {
      console.warn(e)
    }
  },
})

const handleDragging = _Throttle((event: any) => {
  if ((isDragging || isResizing) && app.stampSelected) {
    const ctx = app.canvas[app.pageSelected]?.value.getContext('2d')
    const imageBlob = app.imagesPreviews[app.pageSelected]?.value
    const canvas = app.canvas[app.pageSelected]?.value

    if (canvas && ctx && imageBlob) {
      const imgPage = new Image()
      imgPage.onload = () => {
        ctx.clearRect(0, 0, 1200, 1500)

        if (isResizing) {
          const deltaX = event.clientX - canvas.getBoundingClientRect().left - offsetX
          const deltaY = event.clientY - canvas.getBoundingClientRect().top - offsetY

          sealWidth -= deltaX
          sealHeight -= deltaY
          offsetX += deltaX
          offsetY += deltaY
        } else if (isDragging) {
          offsetX = event.clientX - canvas.getBoundingClientRect().left - 100
          offsetY = event.clientY - canvas.getBoundingClientRect().top - 100
        }

        // Draw the image page and the stamp
        ctx.drawImage(imgPage, 0, 0, 1200, 1500)
        ctx.drawImage(app.stampSelected, offsetX, offsetY, sealWidth, sealHeight)
        drawHandles(ctx)
        app.saveState(offsetX, offsetY)
      }
      imgPage.src = imageBlob
    }
  }
}, 50)

// Draw only the top-left resize handle
const drawHandles = (ctx: any) => {
  const handleSize = 10

  ctx.fillStyle = 'red'
  ctx.fillRect(offsetX - handleSize / 2, offsetY - handleSize / 2, handleSize, handleSize)
}

const renderPageForExport = (pageIndex: number, includeHash: boolean): Promise<void> => {
  return new Promise((resolve) => {
    const canvasRef = app.canvas[pageIndex]
    const canvas = canvasRef?.value
    const imageBlob = app.imagesPreviews[pageIndex]?.value
    const state = app.states[pageIndex]

    if (!canvas || !imageBlob) {
      if (canvas && includeHash) {
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.font = '12px Arial'
          ctx.fillText(hashSeal.value, 100, 1500)
        }
      }
      resolve()
      return
    }

    const ctx = canvas.getContext('2d')
    if (!ctx) {
      resolve()
      return
    }

    const imgPage = new Image()
    imgPage.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(imgPage, 0, 0, 1200, 1500)

      if (state && state.stamp && state.posX !== null && state.posY !== null) {
        ctx.drawImage(state.stamp, state.posX, state.posY, sealWidth, sealHeight)
      }

      if (includeHash) {
        ctx.font = '12px Arial'
        ctx.fillText(hashSeal.value, 100, 1500)
      }

      resolve()
    }

    imgPage.src = imageBlob
  })
}

const addImage = () => {
  imageStamp.value = new Image()
  imageStamp.value.src = '/tm-logo-black.png'
}

onMounted(() => {
  // console.log('on mounted', app)
  app.init()
})

const wrapText = (ctx: any, text: any, x: any, y: any, maxWidth: any, lineHeight: any) => {
  const words = text.split(' ')
  let line = ''

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + ' '
    const metrics = ctx.measureText(testLine)
    const testWidth = metrics.width

    if (testWidth > maxWidth && i > 0) {
      ctx.fillText(line, x, y)
      line = words[i] + ' '
      y += lineHeight
    } else {
      line = testLine
    }
  }
  ctx.fillText(line, x, y)
  return y + lineHeight // Return the updated Y position
}

const wrapTextWithAlignment = (
  ctx: any,
  leftText: any,
  rightText: any,
  x: any,
  y: any,
  maxWidth: any,
  lineHeight: any
) => {
  // Measure widths
  const leftTextWidth = ctx.measureText(leftText).width
  const rightTextWidth = ctx.measureText(rightText).width

  // If both texts fit in the same line, draw them
  if (leftTextWidth + rightTextWidth <= maxWidth - 20) {
    ctx.fillText(leftText, x, y) // Draw left text
    ctx.fillText(rightText, x + maxWidth - rightTextWidth - 10, y) // Draw right text aligned to the right
    return y + lineHeight // Increment Y for the next line
  }

  // Otherwise, wrap each text separately
  y = wrapText(ctx, leftText, x, y, maxWidth, lineHeight) // Wrap left text
  return wrapText(ctx, rightText, x, y, maxWidth, lineHeight) // Wrap right text
}

const saveBlob = (blob: any, fileName: string) => {
  let a = document.createElement('a')
  document.body.appendChild(a)
  a.style.display = 'none'

  var url = window.URL.createObjectURL(blob)
  a.href = url
  a.download = fileName
  a.click()
  window.URL.revokeObjectURL(url)
}

const base64ToBlob = (base64: string, contentType: string) => {
  const byteCharacters = atob(base64)
  const byteArrays = []

  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512)
    const byteNumbers = new Array(slice.length)
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i)
    }
    const byteArray = new Uint8Array(byteNumbers)
    byteArrays.push(byteArray)
  }

  return new Blob(byteArrays, { type: contentType })
}

const startAgain = () => {
  fileOriginal.value = null
  fileSealed.value = null
  numPages.value = 0
  app.imagesPreviews.forEach((image, index) => {
    image.value = null
  })
}

const previewPdfToSeal = async () => {
  try {
    loadingStore.loading = true
    numPages.value = 0
    const response = await $api.testServices.previewPdfToSeal(props.reference?.id)
    console.log('preview images', response)

    response.images.forEach((image: any, idx: number) => {
      const imageBlob = base64ToBlob(image, 'image/jpeg')
      console.warn('blob', imageBlob)

      const newImage = URL.createObjectURL(imageBlob)
      app.imagesPreviews[idx].value = newImage
      app.transfer(newImage, idx, true)
      numPages.value += 1
    })
    // app.transfer(app.imagesPreviews[0].value, 0, true)
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingStore.stop()
    }, 250)
  }
}

const process = async () => {
  if (form.files.length === 0) {
    snackbar.add({ type: 'warning', text: 'No PDF file selected ' })
    return
  }

  try {
    loadingIndicator.start()
    loadingStore.loading = true
    const response = await $api.testServices.processPdf(props.reference?.id, form)

    const maxPages = response.images.length
    if (maxPages > 10) {
      snackbar.add({ type: 'error', text: 'Maxium pages is 10' })
      return
    }
    numPages.value = maxPages
    app.imagesPreviews.forEach((image, index) => {
      image.value = null
    })

    console.warn('numero de paginas', numPages.value)
    response.images.forEach((image: any, idx: number) => {
      const tmpImage = response.images[idx]
      const decodedImage = atob(tmpImage)
      const arrayBuffer = new ArrayBuffer(decodedImage.length)
      const uint8Array = new Uint8Array(arrayBuffer)
      for (let i = 0; i < decodedImage.length; i++) {
        uint8Array[i] = decodedImage.charCodeAt(i)
      }
      const blob = new Blob([uint8Array], { type: 'image/webp' })
      const newImage = URL.createObjectURL(blob)
      app.imagesPreviews[idx].value = newImage
      app.transfer(newImage, idx, true)
    })
    console.log(app.imagesPreviews)
    // app.transfer(app.imagesPreviews[0].value, 0, true)
    // app.imagesPreviews.forEach((image, index) => {
    //   console.log(image.value, index);
    //   if(index===0){
    //     app.transfer(image.value, index,true);
    //   }
    // });

    if (response.revalidation) {
      console.log(response.revalidation)
      fileOriginal.value = response.revalidation.attachment_original
      console.log(fileOriginal.value)
    }
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingIndicator.finish()
      loadingStore.loading = false
    }, 200)
  }
}
const saveSeal = async () => {
  try {
    loadingIndicator.start()
    loadingStore.start()

    const dataUrls: string[] = []
    for (let i = 0; i < numPages.value; i++) {
      await renderPageForExport(i, true)

      const canvasRef = app.canvas[i]
      const canvas = canvasRef?.value

      if (!canvas) continue

      const dataUrl = canvas.toDataURL('image/png')
      dataUrls.push(dataUrl)
    }

    // console.log('dataUrls', dataUrls)

    const formData = new FormData()
    formData.append('seal_type', typeSeal.value)
    dataUrls.forEach((img, index) => {
      formData.append(`image_${index}`, img)
    })

    console.log('save seal', formData)

    const response = await $api.testServices.addSeal(props.reference?.id, formData)
    console.log(response)
    fileOriginal.value = response.attachment_original
    fileSealed.value = response.attachment_sellos
    snackbar.add({ type: 'success', text: 'Success pdf with seals saved' })
    emits('updateReference')
  } catch (e) {
    console.error(e)
  } finally {
    setTimeout(() => {
      loadingIndicator.finish()
      loadingStore.loading = false
    }, 200)
  }
}
</script>
