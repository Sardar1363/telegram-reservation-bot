// داخل if (cb) بعد از answerCallback

const chatId = cb.message.chat.id
const key = cb.data
const state = getState(chatId)

// -------- LANGUAGE --------
if (key.startsWith('LANG_')) {
  setLanguage(chatId, key.replace('LANG_', ''))
  await sendMessage(chatId, 'دسته‌بندی خدمات را انتخاب کنید:', categoryKeyboard())
  return
}

// -------- CHANGE CATEGORY --------
if (key === 'CHANGE_CATEGORY') {
  setCategory(chatId, null)
  await sendMessage(chatId, 'دسته‌بندی خدمات را انتخاب کنید:', categoryKeyboard())
  return
}

// -------- CATEGORY --------
if (key.startsWith('CAT_')) {
  setCategory(chatId, key.replace('CAT_', ''))
  await sendMessage(
    chatId,
    'سرویس‌های مورد نظر را انتخاب کنید:',
    serviceKeyboard(state.categoryId, state.services)
  )
  return
}

// -------- TOGGLE SERVICE --------
if (key.startsWith('SERVICE_')) {
  toggleService(chatId, key.replace('SERVICE_', ''))
  await sendMessage(
    chatId,
    'سرویس‌های مورد نظر را انتخاب کنید:',
    serviceKeyboard(state.categoryId, state.services)
  )
  return
}

// -------- CONTINUE --------
if (key === 'CONTINUE_SERVICES') {
  if (!state.services.length) {
    await sendMessage(chatId, '⚠️ لطفاً حداقل یک سرویس انتخاب کنید.')
    return
  }

  await sendMessage(chatId, 'بازه زمانی را انتخاب کنید:', timeRangeKeyboard())
  return
}

// -------- TIME RANGE --------
if (key === 'MORE_MORNING') {
  setTimeRange(chatId, 'MORNING')
  await sendMessage(chatId, 'ساعت را انتخاب کنید:', moreTimesKeyboard(MORNING))
  return
}

if (key === 'MORE_NOON') {
  setTimeRange(chatId, 'NOON')
  await sendMessage(chatId, 'ساعت را انتخاب کنید:', moreTimesKeyboard(NOON))
  return
}

if (key === 'MORE_EVENING') {
  setTimeRange(chatId, 'EVENING')
  await sendMessage(chatId, 'ساعت را انتخاب کنید:', moreTimesKeyboard(EVENING))
  return
}

// -------- FINAL TIME --------
if (key.startsWith('TIME_')) {
  setTime(chatId, key.replace('TIME_', ''))

  const services = state.services
    .map(id => catalog.services.find(s => s.id === id)?.name)
    .filter(Boolean)

  await sendMessage(
    chatId,
    `⏰ ساعت انتخاب شد\n\nسرویس‌ها:\n• ${services.join('\n• ')}\n\nساعت شروع: ${state.time}`
  )
  return
}
