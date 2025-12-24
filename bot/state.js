const state = {}

function getState(chatId) {
  if (!state[chatId]) {
    state[chatId] = {
      language: null,
      categoryId: null,
      services: [],
      timeRange: null,
      time: null
    }
  }
  return state[chatId]
}

function resetState(chatId) {
  state[chatId] = {
    language: null,
    categoryId: null,
    services: [],
    timeRange: null,
    time: null
  }
}

function setLanguage(chatId, lang) {
  getState(chatId).language = lang
}

function setCategory(chatId, categoryId) {
  getState(chatId).categoryId = categoryId
  getState(chatId).services = []
}

function toggleService(chatId, serviceId) {
  const s = getState(chatId)
  s.services = s.services.includes(serviceId)
    ? s.services.filter(x => x !== serviceId)
    : [...s.services, serviceId]
}

function setTimeRange(chatId, range) {
  getState(chatId).timeRange = range
}

function setTime(chatId, time) {
  getState(chatId).time = time
}

module.exports = {
  getState,
  resetState,
  setLanguage,
  setCategory,
  toggleService,
  setTimeRange,
  setTime
}
