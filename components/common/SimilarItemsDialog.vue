<template>
  <v-dialog v-model="dialog" persistent max-width="500px">
    <v-card color="brown-darken-1">
      <v-card-title class="text-lg font-bold text-center">
        <div class="flex items-center justify-center">🚨 Similar names 🚨</div>
      </v-card-title>
      <v-card-text>
        <p class="font-bold leading-4">
          Please review if record already exists before creating it. The list shows existing records in system. If you
          are editing, you should not be changing the name to something else.
        </p>
        <div v-if="similarItems.length <= 0">
          <div class="max-h-96 overflow-y-auto border p-2 rounded-md">
            <div class="text-center">No similar records found</div>
          </div>
        </div>
        <div v-if="similarItems.length">
          <div class="max-h-96 overflow-y-auto border p-2 rounded-md">
            <div
              v-for="item in similarItems"
              :key="item.id"
              class="border border-b border-dotted"
              :class="{ 'bg-brown-darken-4': currentName && item.name === currentName }"
            >
              <v-icon v-if="currentName && item.name === currentName">mdi-equal-box</v-icon>
              {{ item.name }} <span class="text-xs">#{{ item.id }}</span>
            </div>
          </div>
        </div>
      </v-card-text>
      <v-card-actions class="flex justify-end">
        <v-btn color="secondary" size="small" @click="closeDialog">Cancel</v-btn>
        <v-btn color="red-darken-4" size="small" @click="proceed">Proceed Anyway</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
    default: false,
  },
  currentName: {
    type: String,
    required: false,
    default: null,
  }, // Current name of the item
  similarItems: {
    type: Array as PropType<any[]>,
    default: () => [],
  }, // List of similar items
})

const dialog = ref(props.modelValue)

const emit = defineEmits(['update:modelValue', 'proceed'])

// Close dialog function
const closeDialog = () => {
  emit('update:modelValue', false)
  dialog.value = false
}

// Proceed function (triggers API call in parent)
const proceed = () => {
  emit('proceed')
  closeDialog()
}

watch(
  () => props.modelValue,
  (newVal) => {
    dialog.value = newVal
  }
)
</script>
