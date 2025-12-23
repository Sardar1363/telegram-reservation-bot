// bot/date.js

const WORKING_DAYS = [1, 2, 3, 4, 5, 6]
// 0 = Sunday (Pazar) ❌ تعطیل
// 1 = Monday … 6 = Saturday ✅ کاری

const DAY_NAMES_TR = [
  'Pazar',
  'Pazartesi',
  'Salı',
  'Çarşamba',
  'Perşembe',
  'Cuma',
  'Cumartesi'
]

// تعطیلی‌های دستی (بعداً از تنظیمات سالن می‌آید)
const CUSTOM_HOLIDAYS = [
  // '2025-01-15'
]

function isWorkingDay(date) {
  const day = date.getDay()
  const iso = date.toISOString().slice(0, 10)

  if (!WORKING_DAYS.includes(day)) return false
  if (CUSTOM_HOLIDAYS.includes(iso)) return false

  return true
}

function getWorkingDates(startDate = new Date(), count = 7) {
  const dates = []
  let current = new Date(startDate)

  while (dates.length < count) {
    if (isWorkingDay(current)) {
      dates.push(new Date(current))
    }
    current.setDate(current.getDate() + 1)
  }

  return dates
}

function formatDateTR(date) {
  const dayName = DAY_NAMES_TR[date.getDay()]
  const day = date.getDate()
  const month = date.toLocaleString('tr-TR', { month: 'long' })

  return `${dayName} ${day} ${month}`
}

module.exports = {
  getWorkingDates,
  formatDateTR
}
