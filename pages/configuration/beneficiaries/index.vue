<template>
  <v-container fluid>
    <div>
      <div class="flex items-center justify-between w-full">
        <div class="text-xl">Beneficiaries</div>
        <v-btn color="primary" to="/configuration/beneficiaries/add"> Add beneficiary </v-btn>
      </div>
    </div>
    <div class="pt-4">
      <BeneficiaryTable />
    </div>
  </v-container>
</template>
