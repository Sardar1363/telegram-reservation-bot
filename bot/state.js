const userState = {}

function initUser(chatId) {
  if (!userState[chatId]) {
    userState[chatId] = {
      language: 'tr',
      category: null,
      services: [],
      date: null
    }
  }
}

function setLanguage(chatId, lang) {
  initUser(chatId)
  userState[chatId].language = lang
}

function setCategory(chatId, categoryId) {
  initUser(chatId)
  userState[chatId].category = categoryId
}

function getCategory(chatId) {
  return userState[chatId]?.category || null
}

function setServices(chatId, services) {
  initUser(chatId)
  userState[chatId].services = services
}

function getServices(chatId) {
  return userState[chatId]?.services || []
}

function setDate(chatId, date) {
  initUser(chatId)
  userState[chatId].date = date
}

function getDate(chatId) {
  return userState[chatId]?.date || null
}

module.exports = {
  setLanguage,
  setCategory,
  getCategory,
  setServices,
  getServices,
  setDate,
  getDate
}
