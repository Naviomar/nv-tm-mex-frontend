<template>
  <v-container fluid>
    <h1 class="text-xl font-bold underline mb-2">Admin department users</h1>
    <DepartmentAdminForm 
        :id="String(id_department)"
    />
  </v-container>
</template>
<script setup lang="ts">
const { $api } = useNuxtApp()
const { user } = useCheckUser()
const snackbar = useSnackbar()

definePageMeta({
  title: `Admin department users`,
  layout: 'default',
})
console.log("--->",user.value.roles[0])
if(user.value.roles[0]){
  const rol = user.value.roles[0].id;
  let id_department = 0;
  
  switch (rol) {
    case 1:
        id_department = 9;
      break;
    case 4:
        id_department = 1;
      break;
    case 5:
        id_department = 2;
      break;
    case 6:
        id_department = 3;
      break;
    case 7:
        id_department = 4;
      break;
    case 8:
        id_department = 6;
      break;
    case 9:
        id_department = 8;
      break;
    case 11:
      id_department = 5;
    break;
   
    default:
      break;
  }
}else{
  snackbar.add({ type: 'error', text: 'Usted no tiene permisos para realizar esta acción.' })
}
  

</script>
