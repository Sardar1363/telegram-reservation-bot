// ---------- DATE ----------
const DAY_NAMES_TR = ['Pazar','Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi']

function isWorkingDay(date) {
  return date.getDay() !== 0 // Sunday off
}

function formatDate(date) {
  return date.toISOString().split('T')[0]
}

function quickDateKeyboard() {
  const rows = []
  const today = new Date()

  for (let i = 0; rows.length < 4; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)

    if (!isWorkingDay(d)) continue

    const label =
      i === 0 ? 'Bugün' :
      i === 1 ? 'Yarın' :
      i === 2 ? 'Yarından Sonra' :
      DAY_NAMES_TR[d.getDay()]

    rows.push([{ text: label, callback_data: `DATE_${formatDate(d)}` }])
  }

  rows.push([{ text: '📅 Takvimden Seç', callback_data: 'OPEN_CALENDAR' }])
  return { inline_keyboard: rows }
}

function calendarKeyboard(page = 0) {
  const rows = []
  let date = new Date()
  date.setDate(date.getDate() + page * 7)

  let count = 0
  while (count < 7) {
    if (isWorkingDay(date)) {
      rows.push([{
        text: `${DAY_NAMES_TR[date.getDay()]} ${date.getDate()}`,
        callback_data: `DATE_${formatDate(date)}`
      }])
      count++
    }
    date.setDate(date.getDate() + 1)
  }

  rows.push([{ text: '➡️ Sonraki', callback_data: 'CALENDAR_NEXT' }])
  return { inline_keyboard: rows }
}

// ---------- TIME ----------
function timeRangeKeyboard() {
  return {
    inline_keyboard: [
      [{ text: '🟢 Sabah', callback_data: 'RANGE_MORNING' }],
      [{ text: '🟡 Öğle', callback_data: 'RANGE_NOON' }],
      [{ text: '🔵 Akşam', callback_data: 'RANGE_EVENING' }]
    ]
  }
}

function generateTimes(start, end) {
  const times = []
  for (let h = start; h < end; h++) {
    times.push(`${String(h).padStart(2,'0')}:00`)
    times.push(`${String(h).padStart(2,'0')}:30`)
  }
  return times
}

const MORNING = generateTimes(9, 12)
const NOON = generateTimes(12, 16)
const EVENING = generateTimes(16, 20)

function timeListKeyboard(times) {
  return {
    inline_keyboard: times.slice(0,5).map(t => [
      { text: t, callback_data: `TIME_${t}` }
    ])
  }
}

module.exports = {
  quickDateKeyboard,
  calendarKeyboard,
  timeRangeKeyboard,
  timeListKeyboard,
  MORNING,
  NOON,
  EVENING
}
