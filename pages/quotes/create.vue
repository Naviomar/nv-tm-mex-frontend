<template>
  <div class="pa-4 pa-md-8">
    <v-container fluid class="max-w-4xl mx-auto">
      <v-row class="mb-6">
        <v-col cols="12" class="d-flex align-center">
          <v-btn icon="mdi-arrow-left" variant="tonal" color="primary" to="/quotes" class="mr-4 rounded-xl"></v-btn>
          <div>
            <h1 class="text-h4 font-weight-bold text-main-header mb-1">Nueva Cotización</h1>
            <p class="text-body-1 text-primary font-weight-medium">Registrar una nueva cotización en el sistema.</p>
          </div>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12">
          <v-card class="rounded-xl border border-grey-lighten-3 elevation-0 overflow-hidden">
            <v-card-text class="pa-6 pa-md-8">
              <v-form @submit.prevent="submitForm" ref="formRef">
                <!-- DATOS BÁSICOS -->
                <div class="text-subtitle-1 font-weight-bold text-primary mb-4 text-uppercase">Datos Básicos</div>
                <v-row>
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="form.impoExpo"
                      :items="[{ title: 'Importación', value: 'I', icon: 'mdi-tray-arrow-down' }, { title: 'Exportación', value: 'E', icon: 'mdi-tray-arrow-up' }]"
                      label="Tipo *"
                      required
                      :rules="[v => !!v || 'Campo requerido']"
                      variant="outlined"
                      density="comfortable"
                      class="rounded-xl"
                    >
                      <template v-slot:item="{ props, item }">
                        <v-list-item v-bind="props" :prepend-icon="item.raw.icon"></v-list-item>
                      </template>
                      <template v-slot:selection="{ item }">
                        <v-icon :icon="item.raw.icon" class="mr-2" size="small"></v-icon>
                        {{ item.title }}
                      </template>
                    </v-select>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="form.modality"
                      :items="[{ title: 'Marítimo', value: 'M', icon: 'mdi-ferry' }, { title: 'Aéreo', value: 'A', icon: 'mdi-airplane' }]"
                      label="Modalidad *"
                      required
                      :rules="[v => !!v || 'Campo requerido']"
                      variant="outlined"
                      density="comfortable"
                      class="rounded-xl"
                    >
                      <template v-slot:item="{ props, item }">
                        <v-list-item v-bind="props" :prepend-icon="item.raw.icon"></v-list-item>
                      </template>
                      <template v-slot:selection="{ item }">
                        <v-icon :icon="item.raw.icon" class="mr-2" size="small"></v-icon>
                        {{ item.title }}
                      </template>
                    </v-select>
                  </v-col>
                </v-row>

                <v-divider class="my-6 border-dashed"></v-divider>

                <!-- INFORMACIÓN DEL CLIENTE -->
                <div class="text-subtitle-1 font-weight-bold text-primary mb-4 text-uppercase d-flex align-center">
                  Información del Cliente
                  <v-spacer></v-spacer>
                  <v-btn-toggle v-model="form.is_new_customer" mandatory color="primary" density="compact" class="ml-4 rounded-lg">
                    <v-btn :value="false" size="small">EXISTENTE</v-btn>
                    <v-btn :value="true" size="small">NUEVO</v-btn>
                  </v-btn-toggle>
                </div>
                
                <v-row>
                  <v-col cols="12" v-if="!form.is_new_customer">
                    <ACustomerSearch v-model="form.customer_id" label="Buscar Cliente Existente *" :rules="[v => !!v || 'Campo requerido']" />
                  </v-col>
                  <v-col cols="12" v-else>
                    <v-text-field
                      v-model="form.new_customer_email"
                      label="Email del Nuevo Cliente *"
                      prepend-inner-icon="mdi-email-outline"
                      variant="outlined"
                      density="comfortable"
                      class="rounded-xl"
                      placeholder="correo@ejemplo.com"
                      :rules="[v => !!v || 'Campo requerido', v => /.+@.+\..+/.test(v) || 'Email inválido']"
                    ></v-text-field>
                  </v-col>
                </v-row>

                <v-divider class="my-6 border-dashed"></v-divider>

                <!-- RUTA Y RESERVA -->
                <div class="text-subtitle-1 font-weight-bold text-primary mb-4 text-uppercase">Ruta y Reserva</div>
                <v-row>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="form.booking_number"
                      label="Número de Reserva / Referencia"
                      prepend-inner-icon="mdi-bookmark-outline"
                      variant="outlined"
                      density="comfortable"
                      class="rounded-xl"
                      placeholder="e.g. BK123456"
                    ></v-text-field>
                  </v-col>
                  
                  <v-col cols="12" md="6" class="d-flex align-center">
                    <v-switch
                      v-model="form.is_without_costs"
                      label="Sin costos (Precio manual)"
                      color="primary"
                      hide-details
                      inset
                    ></v-switch>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="form.executive_id"
                      :items="executives"
                      item-title="name"
                      item-value="id"
                      label="Ejecutivo Responsable"
                      variant="outlined"
                      density="comfortable"
                      prepend-inner-icon="mdi-account-tie-outline"
                      class="rounded-xl"
                    ></v-select>
                  </v-col>
                </v-row>

                <!-- DETALLES DE CONTENEDORES -->
                <div class="text-subtitle-1 font-weight-bold text-primary mt-6 mb-4 text-uppercase d-flex align-center">
                  Detalles de Contenedores
                  <v-spacer></v-spacer>
                  <v-btn size="small" variant="tonal" color="primary" prepend-icon="mdi-plus" @click="addContainer" class="rounded-xl font-weight-bold">Añadir Unidad</v-btn>
                </div>
                
                <v-row v-for="(container, index) in form.containers" :key="index" class="mb-4 align-center bg-surface border rounded-xl shadow-sm mx-0">
                  <v-col cols="12" sm="7">
                    <AContainerTypeSearch v-model="container.container_type_id" label="Tipo de Contenedor / Unidad *" />
                  </v-col>
                  <v-col cols="12" sm="3">
                    <v-text-field
                      v-model="container.quantity"
                      label="Cantidad *"
                      type="number"
                      variant="outlined"
                      density="comfortable"
                      class="rounded-xl"
                      hide-details
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="2" class="text-center">
                    <v-btn icon="mdi-trash-can-outline" variant="text" color="error" @click="removeContainer(index)" v-if="form.containers.length > 1"></v-btn>
                  </v-col>
                </v-row>


                <v-row v-if="!form.is_without_costs">
                  <v-col cols="12">
                    <v-autocomplete
                      label="Carga Rápida: Ruta Predefinida (Opcional)"
                      v-model="form.quote_route_id"
                      :items="availableRoutes"
                      item-title="displayName"
                      item-value="id"
                      variant="outlined"
                      density="comfortable"
                      class="rounded-xl"
                      prepend-inner-icon="mdi-auto-fix"
                      clearable
                      @update:modelValue="onRouteSelect"
                    >
                      <template v-slot:item="{ props, item }">
                        <v-list-item v-bind="props" :subtitle="`${item.raw.pol?.name} -> ${item.raw.pod?.name}`"></v-list-item>
                      </template>
                    </v-autocomplete>
                  </v-col>
                </v-row>

                <v-divider class="my-6 border-dashed"></v-divider>
                
                <v-row>
                  <v-col cols="12" class="d-flex justify-end align-center">
                    <v-btn color="grey" variant="text" to="/quotes" class="mr-4 px-8 rounded-xl text-none font-weight-bold">Cancelar</v-btn>
                    <v-btn 
                      color="primary" 
                      type="submit" 
                      :loading="saving"
                      elevation="4"
                      size="x-large"
                      class="rounded-xl px-12 text-none font-weight-black shadow-lg"
                      prepend-icon="mdi-content-save"
                    >
                      Crear Cotización
                    </v-btn>
                  </v-col>
                </v-row>
              </v-form>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const formRef = ref()
const saving = ref(false)
const router = useRouter()
const snackbar = useSnackbar()
const { $api } = useNuxtApp()

const form = ref({
  impoExpo: 'I',
  modality: 'M',
  booking_number: '',
  is_without_costs: false,
  customer_id: null,
  new_customer_email: '',
  quote_route_id: null,
  executive_id: null as number | null,
  containers: [
    { container_type_id: null, quantity: 1 }
  ]
})

const availableRoutes = ref([])
const executives = ref([])

async function fetchExecutives() {
  try {
    const data: any = await $api.users.getUsers()
    executives.value = data || []
    
    const { user: authUser } = useCheckUser()
    if (!form.value.executive_id && authUser.value) {
      form.value.executive_id = authUser.value.id
    }
  } catch (e) {
    console.error(e)
  }
}

function addContainer() {
  form.value.containers.push({ container_type_id: null, quantity: 1 })
}

function removeContainer(index: number) {
  form.value.containers.splice(index, 1)
}

async function fetchRoutes() {
  try {
    const data: any = await $api.quoteRoutes.getRoutes()
    availableRoutes.value = data.data.map((r: any) => ({
      ...r,
      displayName: `${r.pol?.name} -> ${r.pod?.name} (${r.line?.name || 'Any Line'})`
    }))
  } catch (e) {
    console.error('Failed to load routes')
  }
}

function onRouteSelect(val: any) {
  if (!val) return
  const route = availableRoutes.value.find((r: any) => r.id === val)
  // If we wanted to auto-fill other fields, we could do it here
}

async function submitForm() {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  saving.value = true
  try {
    const data: any = await $api.quotes.createQuote(form.value)

    snackbar.add({ type: 'success', text: 'Cotización creada exitosamente' })
    router.push(`/quotes/${data?.quote?.id || ''}`)
  } catch (e) {
    console.error(e)
    snackbar.add({ type: 'error', text: 'Error al crear la cotización' })
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  fetchRoutes()
  fetchExecutives()
})
</script>
