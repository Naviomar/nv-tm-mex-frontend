<template>
  <div>
    <v-table density="compact">
      <thead>
        <tr>
          <th>Date</th>
          <th v-if="showUser">User</th>
          <th>Event</th>
          <th>IP</th>
          <th>Device</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row.id">
          <td class="whitespace-nowrap">{{ formatDateString(row.created_at) }}</td>
          <td v-if="showUser">
            <div>{{ row.user_name || '—' }}</div>
            <div class="text-caption text-medium-emphasis">{{ row.email }}</div>
          </td>
          <td>
            <v-chip :color="meta(row.event).color" size="small" variant="tonal">
              <v-icon start size="14">{{ meta(row.event).icon }}</v-icon>
              {{ meta(row.event).label }}
            </v-chip>
            <span v-if="row.meta?.minutes" class="text-caption text-medium-emphasis ml-1">{{ row.meta.minutes }} min</span>
          </td>
          <td class="text-caption">{{ row.ip }}</td>
          <td class="text-caption" :title="row.user_agent">{{ describeUserAgent(row.user_agent) }}</td>
        </tr>
        <tr v-if="!rows.length">
          <td :colspan="showUser ? 5 : 4" class="text-center text-medium-emphasis py-4">No activity recorded</td>
        </tr>
      </tbody>
    </v-table>
    <v-pagination
      v-if="pages > 1"
      :model-value="page"
      :length="pages"
      density="compact"
      rounded="circle"
      @update:model-value="(p: number) => emit('page', p)"
    />
  </div>
</template>

<script setup lang="ts">
import { loginEventMeta, describeUserAgent } from '~/utils/security/loginEvents'

const props = withDefaults(defineProps<{ rows: any[]; page?: number; total?: number; perPage?: number; showUser?: boolean }>(), {
  page: 1,
  total: 0,
  perPage: 25,
  showUser: false,
})
const emit = defineEmits<{ (e: 'page', page: number): void }>()

const pages = computed(() => Math.ceil((props.total || 0) / (props.perPage || 25)))
const meta = (event: string) => loginEventMeta[event] ?? { label: event, color: 'grey', icon: 'mdi-information-outline' }
</script>
