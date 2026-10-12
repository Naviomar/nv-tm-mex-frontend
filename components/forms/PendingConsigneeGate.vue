<template>
  <div>
    <v-progress-linear v-if="loading" indeterminate class="mb-2" />
    <template v-else-if="pending">
      <PendingConsigneeBanner :referencia="referencia" />
      <v-btn color="primary" variant="tonal" :to="editUrl" prepend-icon="mdi-pencil-outline">
        Register the customer on the reference
      </v-btn>
    </template>
    <slot v-else />
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'

/**
 * Compuerta para pantallas que dependen del cliente (cargos al cliente, proformas, facturas, demoras):
 * si la referencia sigue sin cliente muestra el aviso en lugar del contenido.
 */
const props = defineProps({
  kind: {
    type: String as PropType<'import' | 'export'>,
    required: true,
  },
  id: {
    type: [String, Number],
    required: true,
  },
})

const { $api } = useNuxtApp()

const referencia = ref<any>(null)
const loading = ref(true)

const pending = computed(() => !!referencia.value?.id && !referencia.value.consignee_id)
const editUrl = computed(() => `/maritime/${props.kind}/${props.id}`)

onMounted(async () => {
  try {
    referencia.value =
      props.kind === 'import'
        ? await $api.referencias.getSeaImportById(props.id.toString())
        : await $api.referenciasExport.getReferenciaById(props.id.toString())
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
})
</script>
