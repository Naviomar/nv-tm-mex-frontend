<template>
  <v-container fluid>
    <v-btn color="slate" size="small" variant="outlined" to="/system/departments" class="mb-4"
      >Back to departments</v-btn
    >
    <v-card>
      <v-card-title>
        <h3>Manage User Permissions (Department)</h3>
      </v-card-title>
      <v-card-text>
        <div class="mb-4 p-4 bg-slate-50 border rounded text-gray-700">
          <p>
            Aquí puedes administrar los permisos de los usuarios miembros en los departamentos donde eres coordinador.
            <br />
            Solo podrás modificar los permisos que tiene asignado el departamento, y únicamente para los usuarios que
            son miembros (no coordinadores).
            <br />
            Los cambios se aplican de inmediato al activar o desactivar cada permiso.
          </p>
        </div>
        <DepartmentUserPermissionsForm />
      </v-card-text>
    </v-card>
  </v-container>
</template>
<script setup lang="ts">
const router = useRouter()

definePageMeta({
  title: 'Config Departments',
  layout: 'default',
})
</script>
