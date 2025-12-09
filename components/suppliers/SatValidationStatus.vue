<template>
  <div class="flex items-center gap-2">
    <!-- Chip de estatus SAT -->
    <v-chip
      :color="satStatusColor"
      :variant="satStatusVariant"
      size="small"
      :prepend-icon="satStatusIcon"
    >
      {{ satStatusLabel }}
    </v-chip>

    <!-- Información adicional si está validado -->
    <v-tooltip v-if="supplierCfdi.sat_validated_at" location="top">
      <template #activator="{ props }">
        <v-icon v-bind="props" size="small" color="grey">mdi-information-outline</v-icon>
      </template>
      <div class="text-xs">
        <div>Validado: {{ formatDateString(supplierCfdi.sat_validated_at) }}</div>
        <div v-if="supplierCfdi.sat_validator">Por: {{ supplierCfdi.sat_validator?.name }}</div>
        <div v-if="supplierCfdi.sat_cancellation_status">
          Estado cancelación: {{ supplierCfdi.sat_cancellation_status }}
        </div>
        <div v-if="supplierCfdi.sat_efos_status">
          EFOS: {{ getEfosLabel(supplierCfdi.sat_efos_status) }}
        </div>
      </div>
    </v-tooltip>

    <!-- Botón de validación manual -->
    <v-btn
      v-if="showValidateButton"
      icon
      size="x-small"
      :color="needsValidation ? 'warning' : 'primary'"
      variant="tonal"
      :loading="loading"
      @click="validateWithSat"
      :title="needsValidation ? 'Validar con SAT' : 'Re-validar con SAT'"
    >
      <v-icon size="small">mdi-shield-check</v-icon>
    </v-btn>
  </div>
</template>

<script setup lang="ts">
const { $api, $notifications } = useNuxtApp()
const snackbar = useSnackbar()

const props = defineProps({
  supplierCfdi: {
    type: Object,
    required: true,
  },
  showValidateButton: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['validated'])

const loading = ref(false)

const satStatusColor = computed(() => {
  const status = props.supplierCfdi.sat_status
  if (!status) return 'grey'

  const colors: Record<string, string> = {
    Vigente: 'success',
    Cancelado: 'error',
    'No Encontrado': 'warning',
    'Error de Validación': 'grey',
  }
  return colors[status] || 'grey'
})

const satStatusVariant = computed(() => {
  const status = props.supplierCfdi.sat_status
  if (status === 'Cancelado') return 'flat'
  return 'tonal'
})

const satStatusIcon = computed(() => {
  const status = props.supplierCfdi.sat_status
  if (!status) return 'mdi-help-circle-outline'

  const icons: Record<string, string> = {
    Vigente: 'mdi-check-circle',
    Cancelado: 'mdi-cancel',
    'No Encontrado': 'mdi-alert-circle',
    'Error de Validación': 'mdi-alert-outline',
  }
  return icons[status] || 'mdi-help-circle-outline'
})

const satStatusLabel = computed(() => {
  return props.supplierCfdi.sat_status_label || 'Sin validar'
})

const needsValidation = computed(() => {
  return !props.supplierCfdi.sat_status && props.supplierCfdi.uuid
})

const getEfosLabel = (efosStatus: string): string => {
  const labels: Record<string, string> = {
    '100': 'No listado',
    '200': 'Presunto',
    '300': 'Definitivo',
    '400': 'Desvirtuado',
    '500': 'Sentencia Favorable',
  }
  return labels[efosStatus] || efosStatus
}

const validateWithSat = async () => {
  try {
    loading.value = true
    const response = await $api.suppliers.validateCfdiSat(props.supplierCfdi.id.toString())

    if (response.sat_status === 'Vigente') {
      snackbar.add({
        type: 'success',
        text: `CFDI ${props.supplierCfdi.serie_folio} está vigente en SAT`,
      })
    } else if (response.sat_status === 'Cancelado') {
      snackbar.add({
        type: 'error',
        text: `CFDI ${props.supplierCfdi.serie_folio} está CANCELADO en SAT`,
      })
    } else {
      snackbar.add({
        type: 'warning',
        text: `CFDI ${props.supplierCfdi.serie_folio}: ${response.message}`,
      })
    }

    emit('validated', response)
  } catch (error: any) {
    console.error(error)
    snackbar.add({
      type: 'error',
      text: error?.response?.data?.message || 'Error al validar con SAT',
    })
  } finally {
    loading.value = false
  }
}
</script>
