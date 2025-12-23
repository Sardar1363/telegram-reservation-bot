const catalog = require('../data/catalog.js')

/* ---------- Language ---------- */
function languageKeyboard() {
  return {
    inline_keyboard: [
      [{ text: '1️⃣ Türkçe', callback_data: 'LANG_TR' }],
      [{ text: '2️⃣ فارسی', callback_data: 'LANG_FA' }],
      [{ text: '3️⃣ English', callback_data: 'LANG_EN' }],
      [{ text: '4️⃣ العربية', callback_data: 'LANG_AR' }]
    ]
  }
}

/* ---------- Categories ---------- */
function categoryKeyboard() {
  return {
    inline_keyboard: catalog.categories.map(cat => [
      {
        text: cat.title,
        callback_data: `CAT_${cat.id}`
      }
    ])
  }
}

/* ---------- Services (Multi Select) ---------- */
function serviceKeyboard(categoryId, selected = []) {
  const services = catalog.services.filter(
    s => s.categoryId === categoryId
  )

  return {
    inline_keyboard: [
      [
        { text: '🔁 Kategori Değiştir', callback_data: 'CHANGE_CATEGORY' }
      ],
      [
        { text: '✅ Devam Et', callback_data: 'CONTINUE_SERVICES' }
      ],
      ...services.map(s => [
        {
          text: `${selected.includes(s.id) ? '✔ ' : ''}${s.name} (${s.price}₺)`,
          callback_data: `SERVICE_${s.id}`
        }
      ])
    ]
  }
}

/* ---------- Confirm Services ---------- */
function confirmServicesKeyboard(selectedServices) {
  return {
    inline_keyboard: [
      ...selectedServices.map(s => [
        {
          text: `❌ ${s.name}`,
          callback_data: `REMOVE_${s.id}`
        }
      ]),
      [
        { text: '🔁 Hizmet Ekle / Değiştir', callback_data: 'BACK_TO_SERVICES' }
      ],
      [
        { text: '✅ Onayla ve Devam Et', callback_data: 'CONFIRM_SERVICES' }
      ]
    ]
  }
}

/* ---------- Quick Date ---------- */
function quickDateKeyboard(dates) {
  return {
    inline_keyboard: [
      ...dates.map(d => [
        {
          text: d.label,
          callback_data: `DATE_${d.value}`
        }
      ]),
      [
        { text: '📅 Takvimden Seç', callback_data: 'OPEN_CALENDAR' }
      ]
    ]
  }
}

/* ---------- Calendar (7 Days) ---------- */
function calendarKeyboard(days) {
  return {
    inline_keyboard: [
      ...days.map(d => [
        {
          text: d.label,
          callback_data: `DATE_${d.value}`
        }
      ]),
      [
        { text: '⏭️ Sonraki 7 Gün', callback_data: 'NEXT_7_DAYS' }
      ]
    ]
  }
}

module.exports = {
  languageKeyboard,
  categoryKeyboard,
  serviceKeyboard,
  confirmServicesKeyboard,
  quickDateKeyboard,
  calendarKeyboard
}
