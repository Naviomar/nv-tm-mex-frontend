const addWorkingDays = (startDate: Date, days: number) => {
  const date = new Date(startDate)
  while (days > 0) {
    date.setDate(date.getDate() + 1)
    // Decrease "days" only if it's a weekday.
    if (date.getDay() !== 0 && date.getDay() !== 6) {
      days -= 1
    }
  }
  return date
}

const initialYear = 2022
const currentYear = new Date().getFullYear()
const maxYear = currentYear + 1
const prefixYears: string[] = []
for (let i = maxYear; i >= initialYear; i--) {
  // Start from maxYear and go backwards
  // last two digits of the year
  prefixYears.push(i.toString())
}


export { addWorkingDays, prefixYears }
