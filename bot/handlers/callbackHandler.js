// bot/handlers/callbackHandler.js

const {
  getState,
  setLanguage,
  setCategory,
  setTime,
  updateDraft,
  setStep,
  resetState
} = require('../state')

const {
  languageKeyboard,
  categoryKeyboard,
  serviceKeyboard,
  timeRangeKeyboard,
  moreTimesKeyboard,
  MORNING,
  NOON,
  EVENING
} = require('../keyboard')

const catalog = require('../../data/catalog')
const { resolveFinalService } = require('../../rules/serviceRules')
const { sendMessage, answerCallback } = require('../telegramApi')

async function handleCallback({ chatId, data, callbackId }) {
  const s = getState(chatId)

  if (callbackId) {
    await answerCallback(callbackId)
  }

  /* ---------- Language ---------- */
  if (data.startsWith('LANG_')) {
    setLanguage(chatId, data.replace('LANG_', ''))
    setStep(chatId, 'SELECT_CATEGORY')

    await sendMessage(chatId, 'Hizmet kategorisini seçiniz:', categoryKeyboard())
    return
  }

  /* ---------- Change category ---------- */
  if (data === 'CHANGE_CATEGORY') {
    setCategory(chatId, null)
    updateDraft(chatId, { services: [] })
    setStep(chatId, 'SELECT_CATEGORY')

    await sendMessage(chatId, 'Hizmet kategorisini seçiniz:', categoryKeyboard())
    return
  }

  /* ---------- Category ---------- */
  if (data.startsWith('CAT_')) {
    const categoryId = data.replace('CAT_', '')
    setCategory(chatId, categoryId)
    setStep(chatId, 'SELECT_SERVICE')

    await sendMessage(
      chatId,
      'Hizmet seçiniz:',
      serviceKeyboard(categoryId, s.draft.services)
    )
    return
  }

  /* ---------- Toggle Service ---------- */
  if (data.startsWith('SERVICE_')) {
    const serviceId = data.replace('SERVICE_', '')
    const services = s.draft.services.includes(serviceId)
      ? s.draft.services.filter(x => x !== serviceId)
      : [...s.draft.services, serviceId]

    updateDraft(chatId, { services })

    await sendMessage(
      chatId,
      'Hizmet seçiniz:',
      serviceKeyboard(s.categoryId, services)
    )
    return
  }

  /* ---------- Continue ---------- */
  if (data === 'CONTINUE_SERVICES') {
    setStep(chatId, 'SELECT_TIME')
    await sendMessage(chatId, 'Saat seçiniz:', timeRangeKeyboard())
    return
  }

  /* ---------- More Times ---------- */
  if (data === 'MORE_MORNING')
    return sendMessage(chatId, 'Sabah saatleri:', moreTimesKeyboard(MORNING))
  if (data === 'MORE_NOON')
    return sendMessage(chatId, 'Öğle saatleri:', moreTimesKeyboard(NOON))
  if (data === 'MORE_EVENING')
    return sendMessage(chatId, 'Akşam saatleri:', moreTimesKeyboard(EVENING))

  /* ---------- Time Select → CONFIRM ---------- */
  if (data.startsWith('TIME_')) {
    const startTime = data.replace('TIME_', '')
    setTime(chatId, startTime)
    setStep(chatId, 'CONFIRM')

    const finalService = resolveFinalService(s.draft)

    const [h, m] = startTime.split(':').map(Number)
    const endTotal = h * 60 + m + finalService.duration
    const endH = String(Math.floor(endTotal / 60)).padStart(2, '0')
    const endM = String(endTotal % 60).padStart(2, '0')

    await sendMessage(
      chatId,
      `Randevu Özeti\n\n` +
        `Hizmet: ${finalService.name}\n` +
        `Süre: ${finalService.duration} dk\n` +
        `Ücret: ${finalService.price}₺\n` +
        `Saat: ${startTime} – ${endH}:${endM}\n\n` +
        `Onaylıyor musunuz?`,
      {
        inline_keyboard: [
          [{ text: '✅ Onayla', callback_data: 'CONFIRM_OK' }],
          [{ text: '🔄 Baştan Başla', callback_data: 'CONFIRM_RESET' }]
        ]
      }
    )
    return
  }

  /* ---------- CONFIRM ACTIONS ---------- */
  if (data === 'CONFIRM_OK') {
  const finalService = resolveFinalService(s.draft)

  saveReservation({
    chatId,
    categoryId: s.categoryId,
    service: {
      id: finalService.id,
      name: finalService.name,
      duration: finalService.duration,
      price: finalService.price
    },
    time: s.time
  })

  setStep(chatId, 'DONE')

  await sendMessage(
    chatId,
    `Randevunuz oluşturuldu ✅\n\n` +
      `💆 Hizmet: ${finalService.name}\n` +
      `⏰ Saat: ${s.time}\n` +
      `⏱ Süre: ${finalService.duration} dk\n` +
      `💰 Ücret: ${finalService.price}₺\n\n` +
      `Sizi bekliyoruz 🌸`
  )

  resetState(chatId)
  return
}

  if (data === 'CONFIRM_RESET') {
    resetState(chatId)
    await sendMessage(chatId, 'Baştan başlayalım 👇', categoryKeyboard())
    return
  }
}

module.exports = {
  handleCallback
}
