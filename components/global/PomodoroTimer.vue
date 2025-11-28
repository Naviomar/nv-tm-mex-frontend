<template>
  <div>
    <div v-if="pomodoro.expired.value">
      <div class="text-center">
        <h1 class="text-4xl font-bold">Time's up!</h1>
        <p class="text-lg">No more time available</p>
      </div>
    </div>
    <div v-if="!pomodoro.expired.value" class="grid grid-flow-col gap-1 text-center auto-cols-max bg-lime-200 dark:bg-lime-800">
      <div class="flex flex-col p-2 bg-neutral rounded-box text-neutral-content">
        <span class="countdown font-mono text-3xl">
          <span style="--value: 15">{{ pomodoro.timeLeft.value.days }}</span>
        </span>
        days
      </div>
      <div class="flex flex-col p-2 bg-neutral rounded-box text-neutral-content">
        <span class="countdown font-mono text-3xl">
          <span style="--value: 10">{{ pomodoro.timeLeft.value.hours }}</span>
        </span>
        hours
      </div>
      <div class="flex flex-col p-2 bg-neutral rounded-box text-neutral-content">
        <span class="countdown font-mono text-3xl">
          <span style="--value: 24">{{ pomodoro.timeLeft.value.minutes }}</span>
        </span>
        min
      </div>
      <div class="flex flex-col p-2 bg-neutral rounded-box text-neutral-content">
        <span class="countdown font-mono text-3xl">
          <span style="--value: 51">{{ pomodoro.timeLeft.value.seconds }}</span>
        </span>
        sec
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
const props = defineProps({
  startDate: {
    type: String,
    required: false,
  },
})

const pomodoro = usePomodoroTimer()

onMounted(() => {
  if (props.startDate) {
    const date = new Date(props.startDate)
    pomodoro.addWorkingDays(date, 0)
  }
})
</script>
<style scoped></style>
