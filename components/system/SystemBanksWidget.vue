<template>
  <div>
    <div class="flex justify-start gap-4 mb-4">
      <v-btn color="primary" size="small" @click="onClickCreateSystemAccount"
        ><v-icon>mdi-account-cash-outline</v-icon>Create system account</v-btn
      >
    </div>
    <SystemAccountForm v-if="showSystemAcctForm" @close="showSystemAcctForm = false" />
    <SystemBanksTable v-if="!showSystemAcctForm" />
  </div>
</template>
<script setup lang="ts">
const showSystemAcctForm = ref(false)

const onClickCreateSystemAccount = () => {
  showSystemAcctForm.value = !showSystemAcctForm.value
}
</script>
