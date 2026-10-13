<template>
  <div class="mt-4">
    <div class="font-bold mb-1">Executive users</div>
    <div class="text-xs tm-muted mb-2">
      System users that ARE this executive. They receive the in-app alerts of the executive's references (for example,
      references pending customer) and its emails.
    </div>
    <v-autocomplete
      v-model="userIds"
      :items="users"
      item-title="name"
      item-value="id"
      label="Users"
      multiple
      chips
      closable-chips
      density="compact"
      hide-details="auto"
    >
      <template #item="{ props: itemProps, item }">
        <v-list-item v-bind="itemProps" :subtitle="item.raw.email" />
      </template>
    </v-autocomplete>
    <div v-if="!userIds.length" class="text-xs text-warning mt-1">
      Without a linked user the alerts of this executive fall back to the alert type's configured recipients.
    </div>

    <div class="font-bold mt-6 mb-1">Distribution list</div>
    <div class="text-xs tm-muted mb-2">
      Extra people copied with this executive's notifications: a team mate (system user) or any email address.
    </div>
    <div v-for="(member, index) in members" :key="member.key" class="grid grid-cols-12 gap-2 items-start mb-1">
      <div class="col-span-3">
        <v-select
          v-model="member.kind"
          :items="kinds"
          density="compact"
          hide-details
          @update:model-value="onKindChange(member)"
        />
      </div>
      <div v-if="member.kind === 'user'" class="col-span-8">
        <v-autocomplete
          v-model="member.user_id"
          :items="users"
          item-title="name"
          item-value="id"
          label="User"
          density="compact"
          hide-details
        />
      </div>
      <template v-else>
        <div class="col-span-4">
          <v-text-field v-model="member.email" label="Email" density="compact" hide-details />
        </div>
        <div class="col-span-4">
          <v-text-field v-model="member.name" label="Name (optional)" density="compact" hide-details />
        </div>
      </template>
      <div class="col-span-1">
        <v-btn icon size="x-small" variant="text" color="error" @click="members.splice(index, 1)">
          <v-icon>mdi-delete-outline</v-icon>
        </v-btn>
      </div>
    </div>
    <v-btn size="small" variant="tonal" prepend-icon="mdi-plus" class="mt-2" @click="addMember">Add to list</v-btn>
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'

interface Member {
  key: string
  id?: number
  kind: 'user' | 'email'
  user_id: number | null
  email: string
  name: string
  notes?: string
}

defineProps({
  users: {
    type: Array as PropType<{ id: number; name: string; email: string }[]>,
    default: () => [],
  },
})

const userIds = defineModel<number[]>('userIds', { default: () => [] })
const members = defineModel<Member[]>('members', { default: () => [] })

const kinds = [
  { title: 'System user', value: 'user' },
  { title: 'Email', value: 'email' },
]

let counter = 0
const newKey = () => `m-${Date.now()}-${counter++}`

const addMember = () => {
  members.value.push({ key: newKey(), kind: 'email', user_id: null, email: '', name: '' })
}

const onKindChange = (member: Member) => {
  if (member.kind === 'user') {
    member.email = ''
  } else {
    member.user_id = null
  }
}
</script>
