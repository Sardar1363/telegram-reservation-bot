const catalog = require('../data/catalog')

// ---------- Language ----------
function languageKeyboard() {
  return {
    inline_keyboard: [
      [{ text: '🇹🇷 Türkçe', callback_data: 'LANG_TR' }],
      [{ text: '🇮🇷 فارسی', callback_data: 'LANG_FA' }],
      [{ text: '🇬🇧 English', callback_data: 'LANG_EN' }],
      [{ text: '🇸🇦 العربية', callback_data: 'LANG_AR' }]
    ]
  }
}

// ---------- Category ----------
function categoryKeyboard() {
  return {
    inline_keyboard: catalog.categories.map(cat => [
      { text: cat.title, callback_data: `CAT_${cat.id}` }
    ])
  }
}

// ---------- Services ----------
function serviceKeyboard(categoryId, selected = []) {
  const services = catalog.services.filter(s => s.categoryId === categoryId)

  return {
    inline_keyboard: [
      [{ text: '🔁 Kategori Değiştir', callback_data: 'CHANGE_CATEGORY' }],
      
      ...services.map(s => [
        {
          text: `${selected.includes(s.id) ? '✔ ' : ''}${s.name} (${s.price}₺)`,
          callback_data: `SERVICE_${s.id}`
        }
      ])
    ]
  }
}

// ---------- Time slots ----------
function generateTimeSlots(start, end) {
  const slots = []
  let h = start
  let m = 0

  while (h < end) {
    slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
    m += 30
    if (m >= 60) {
      m = 0
      h++
    }
  }
  return slots
}

const MORNING = generateTimeSlots(9, 12)
const NOON = generateTimeSlots(12, 16)
const EVENING = generateTimeSlots(16, 20)

function timeRangeKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: MORNING[0], callback_data: `TIME_${MORNING[0]}` },
        { text: MORNING[1], callback_data: `TIME_${MORNING[1]}` }
      ],
      [{ text: '⏰ Diğer Sabah Saatleri', callback_data: 'MORE_MORNING' }],

      [
        { text: NOON[0], callback_data: `TIME_${NOON[0]}` },
        { text: NOON[1], callback_data: `TIME_${NOON[1]}` }
      ],
      [{ text: '⏰ Diğer Öğle Saatleri', callback_data: 'MORE_NOON' }],

      [
        { text: EVENING[0], callback_data: `TIME_${EVENING[0]}` },
        { text: EVENING[1], callback_data: `TIME_${EVENING[1]}` }
      ],
      [{ text: '⏰ Diğer Akşam Saatleri', callback_data: 'MORE_EVENING' }]
    ]
  }
}

function moreTimesKeyboard(slots, startIndex = 2) {
  const more = slots.slice(startIndex, startIndex + 5)
  return {
    inline_keyboard: [
      ...more.map(t => [{ text: t, callback_data: `TIME_${t}` }]),
      [{ text: '⬅️ Geri', callback_data: 'BACK_TO_TIME' }]
    ]
  }
}

module.exports = {
  languageKeyboard,
  categoryKeyboard,
  serviceKeyboard,
  timeRangeKeyboard,
  moreTimesKeyboard,
  MORNING,
  NOON,
  EVENING
}
