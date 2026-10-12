<template>
  <v-alert v-if="pending" type="warning" variant="tonal" density="compact" class="mb-3" icon="mdi-account-question-outline">
    <div class="font-bold">Pending customer</div>
    <div class="text-sm">
      This reference was captured without a customer. Customer emails (arrival notice, revalidation, alerts),
      invoicing and credit / free days calculations stay blocked until a customer is assigned.
      <span v-if="executiveName">Responsible executive: <b>{{ executiveName }}</b>.</span>
    </div>
  </v-alert>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'

const props = defineProps({
  referencia: {
    type: Object as PropType<any>,
    default: null,
  },
})

const pending = computed(() => !!props.referencia && !props.referencia.consignee_id)
const executiveName = computed(() => props.referencia?.executive?.name || '')
</script>
