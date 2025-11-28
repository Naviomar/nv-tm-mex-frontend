<template>
  <div>
    <v-card>
      <v-card-title>
        <h3>Address</h3>
      </v-card-title>
      <v-card-text>
        <div class="grid grid-cols-2 gap-2">
          <div class="col-span-2">
            <InputText density="compact" name="address.name" label="Alias *" />
          </div>
          <div>
            <InputText density="compact" name="address.street" label="Street *" />
          </div>
          <div>
            <InputText density="compact" name="address.number" label="Number *" />
          </div>
          <div class="col-span-2">
            <InputText density="compact" name="address.neighborhood" label="Neighborhood *" />
          </div>
          <div>
            <InputText density="compact" name="address.city" label="City *" />
          </div>
          <div>
            <InputText density="compact" name="address.state" label="State *" />
          </div>
          <div class="col-span-2">
            <InputAutocomplete
              name="address.country_id"
              label="Country *"
              :items="catalogs.countries"
              item-value="id"
              item-title="name"
              variant="solo-filled"
              density="compact"
            />
          </div>
          <div>
            <InputText density="compact" name="address.zip_code" label="Zip code *" />
          </div>
          <div>
            <InputSwitch density="compact" name="address.is_default" label="Is Default address" class="mx-4" />
          </div>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
const { $api } = useNuxtApp()

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
})

const catalogs = ref<any>({
  countries: [],
})

onMounted(async () => {
  catalogs.value.countries = await $api.countries.getAll()
})
</script>
