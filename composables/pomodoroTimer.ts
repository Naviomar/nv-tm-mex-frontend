export function usePomodoroTimer() {
  const expired = ref(false)
  const timeLeft = ref({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    totalSeconds: 0,
    percentaje: 0,
  })

  const startDate = ref<any>(null)
  const initDate = ref<any>(null)

  const countdown = setInterval(() => {
    const now = new Date().getTime()

    if (!startDate.value) {
      return 0
    }
    // Find the distance between now and the target date
    const distance = startDate.value - now

    // Time calculations for days, hours, minutes, and seconds
    const days = Math.floor(distance / (1000 * 60 * 60 * 24))
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((distance % (1000 * 60)) / 1000)

    const totalSeconds = Math.floor(distance / 1000)
    const totalSecondsInitial = Math.floor(startDate.value / 1000)
    const totalSecondsNow = Math.floor(now / 1000)
    // get seconds between initDate and startDate
    const totalSecondsBetween = Math.floor((startDate.value - initDate.value) / 1000)
    // get percentaje of time if totalSecondsBetween is 100% then totalSeconds is x%
    const percentaje = Math.floor((totalSeconds - totalSecondsInitial) / totalSecondsBetween) * 100

    // console.log('now', now.value)
    // console.log('startDate', startDate.value)
    timeLeft.value = {
      days,
      hours,
      minutes,
      seconds,
      totalSeconds,
      percentaje,
    }

    // If the countdown is over, stop the countdown and display a message
    if (distance < 0) {
      clearInterval(countdown)
      // document.getElementById('countdown').innerHTML = 'EXPIRED'
      expired.value = true
    }
  }, 1000)

  const addWorkingDays = (datee: Date, days: number) => {
    initDate.value = datee
    const date = new Date(datee)
    while (days > 0) {
      date.setDate(date.getDate() + 1)
      // Decrease "days" only if it's a weekday.
      if (date.getDay() !== 0 && date.getDay() !== 6) {
        days -= 1
      }
    }
    startDate.value = date
  }

  return {
    countdown,
    addWorkingDays,
    expired,
    timeLeft,
  }
}
