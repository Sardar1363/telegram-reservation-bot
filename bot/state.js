// bot/state.js

const state = {}

/**
 * ساخت یا دریافت state کاربر
 * state فقط در حافظه است (MVP)
 */
function getState(chatId) {
  if (!state[chatId]) {
    state[chatId] = {
      // UI / flow
      step: 'START',

      // زبان
      lang: 'fa',

      // انتخاب‌ها (سازگار با UI فعلی)
      categoryId: null,
      date: null,
      time: null,

      // پیش‌نویس رزرو (برای آینده)
      draft: {
        services: [],     // چند سرویسی
        compositeId: null,
        staffId: null,
        duration: null
      }
    }
  }
  return state[chatId]
}

/* ---------- UI setters (فعلی – بدون تغییر منطق) ---------- */

function setLanguage(chatId, lang) {
  getState(chatId).lang = lang
}

function setCategory(chatId, categoryId) {
  getState(chatId).categoryId = categoryId
}

function getCategory(chatId) {
  return getState(chatId).categoryId
}

function setDate(chatId, date) {
  getState(chatId).date = date
}

function setTime(chatId, time) {
  getState(chatId).time = time
}

/* ---------- Flow control ---------- */

function setStep(chatId, step) {
  getState(chatId).step = step
}

function getStep(chatId) {
  return getState(chatId).step
}

/* ---------- Draft helpers (آینده) ---------- */

function updateDraft(chatId, patch) {
  getState(chatId).draft = {
    ...getState(chatId).draft,
    ...patch
  }
}

function resetDraft(chatId) {
  getState(chatId).draft = {
    services: [],
    compositeId: null,
    staffId: null,
    duration: null
  }
}

/* ---------- Reset کامل مکالمه ---------- */
function resetState(chatId) {
  delete state[chatId]
}
function resetState(chatId) {
  state[chatId] = {}
}

module.exports = {
  resetState,
  // بقیه export ها
}

module.exports = {
  // core
  getState,
  resetState,

  // UI
  setLanguage,
  setCategory,
  getCategory,
  setDate,
  setTime,

  // flow
  setStep,
  getStep,

  // draft
  updateDraft,
  resetDraft
}
