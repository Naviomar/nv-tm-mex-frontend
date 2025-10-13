<template>
  <v-card>
    <v-card-title>
      <div class="flex gap-4 items-center">
        <v-img :src="data.logo_url" alt="Image" max-width="100" />
        {{ data.name }}
      </div>
    </v-card-title>
    <v-card-text>
      <v-row>
        <v-col v-for="(value, key) in formattedData" :key="key" cols="12" sm="6">
          <strong>{{ key }}:</strong>
          <div v-if="isImage(value)">
            <v-img :src="value" alt="Image" max-width="100" />
          </div>
          <div v-else-if="typeof value === 'object' && value !== null">
            <v-list dense>
              <v-list-item v-for="(nestedValue, nestedKey) in value" :key="nestedKey">
                <strong>{{ formatKey(nestedKey) }}:</strong> {{ nestedValue }}
              </v-list-item>
            </v-list>
          </div>
          <div v-else>
            {{ value }}
          </div>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup>
const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
})

const excludedKeys = ['created_by', 'deleted_by', 'deleted_at', 'logo', 'logo_url', 'deletor']

const isImage = (value) => {
  return typeof value === 'string' && /\.(jpg|jpeg|png|gif|bmp|svg)$/i.test(value)
}

const isDateString = (value) => {
  // Check if value is a string and has typical date characters (e.g., '-', '/', ':')
  const hasDateCharacters = /[-/:]/.test(value)

  // Attempt to parse the date
  const parsedDate = Date.parse(value)

  // Ensure parsedDate is a valid number and that the value is not just numbers (like zip codes)
  return !isNaN(parsedDate) && hasDateCharacters && isNaN(Number(value))
}

// Function to format keys (capitalize and replace underscores with spaces)
const formatKey = (key) => {
  return key
    .replace(/_/g, ' ') // Replace underscores with spaces
    .replace(/\b\w/g, (char) => char.toUpperCase()) // Capitalize first letter
}

// Compute formatted data
// Compute formatted data
const formattedData = computed(() => {
  const processedData = { ...props.data }

  // Replace keys like country_id with their corresponding objects
  if (processedData.country) {
    processedData['Country'] = processedData.country.name
    delete processedData.country_id
  }

  if (processedData.creator) {
    processedData['Creator'] = processedData.creator.name
    delete processedData.created_by
  }

  return Object.keys(processedData).reduce((acc, key) => {
    if (!excludedKeys.includes(key)) {
      let value = processedData[key]

      // Check if the value is a date string and format it
      if (typeof value === 'string' && isDateString(value)) {
        value = formatDateString(value)
      }

      acc[formatKey(key)] = value
    }
    return acc
  }, {})
})
</script>
