require('dotenv').config()
const http = require('http')

const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args))

const {
  languageKeyboard,
  categoryKeyboard,
  serviceKeyboard,
  timeRangeKeyboard,
  moreTimesKeyboard,
  MORNING,
  NOON,
  EVENING
} = require('./bot/keyboard')

const {
  resetState,
  getState,
  setLanguage,
  setCategory,
  toggleService,
  setTimeRange,
  setTime
} = require('./bot/state')

const catalog = require('./data/catalog')

const BOT_TOKEN = process.env.BOT_TOKEN
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`
const PORT = process.env.PORT || 3000

// ---------- Telegram helper ----------
async function sendMessage(chatId, text, keyboard = null) {
  await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      reply_markup: keyboard
    })
  })
}

// ---------- Server ----------
async function answerCallback(callbackId) {
  await fetch(`${TELEGRAM_API}/answerCallbackQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      callback_query_id: callbackId
    })
  })
}

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200)
    res.end('Bot is running')
    return
  }

  if (req.method === 'POST' && req.url.startsWith('/telegram/webhook')) {
    let body = ''
    req.on('data', c => (body += c))

    req.on('end', async () => {
      try {
        const update = JSON.parse(body || '{}')
        const msg = update.message
        const cb = update.callback_query

        // ---------- /start ----------
        if (msg && msg.text === '/start') {
          const chatId = msg.chat.id
          resetState(chatId)

          await sendMessage(
            chatId,
            'سلام 👋\nلطفاً زبان خود را انتخاب کنید:',
            languageKeyboard()
          )
        }

        // ---------- CALLBACKS ----------
        if (cb) {
  await answerCallback(cb.id)

  const chatId = cb.message.chat.id
  const key = cb.data
  const state = getState(chatId)

  // ادامه منطق...
}
 {
          const chatId = cb.message.chat.id
          const key = cb.data
          const state = getState(chatId)

          // language
          if (key.startsWith('LANG_')) {
            setLanguage(chatId, key.replace('LANG_', ''))
            await sendMessage(chatId, 'دسته‌بندی خدمات را انتخاب کنید:', categoryKeyboard())
          }

          // category
          if (key.startsWith('CAT_')) {
            setCategory(chatId, key.replace('CAT_', ''))
            await sendMessage(
              chatId,
              'سرویس‌های مورد نظر را انتخاب کنید:',
              serviceKeyboard(state.categoryId, state.services)
            )
          }

          // toggle service
          if (key.startsWith('SERVICE_')) {
            toggleService(chatId, key.replace('SERVICE_', ''))
            await sendMessage(
              chatId,
              'سرویس‌های مورد نظر را انتخاب کنید:',
              serviceKeyboard(state.categoryId, state.services)
            )
          }

          // continue services
          if (key === 'CONTINUE_SERVICES') {
            await sendMessage(chatId, 'بازه زمانی را انتخاب کنید:', timeRangeKeyboard())
          }

          // time ranges
          if (key === 'MORE_MORNING') {
            setTimeRange(chatId, 'MORNING')
            await sendMessage(chatId, 'ساعت مورد نظر را انتخاب کنید:', moreTimesKeyboard(MORNING))
          }

          if (key === 'MORE_NOON') {
            setTimeRange(chatId, 'NOON')
            await sendMessage(chatId, 'ساعت مورد نظر را انتخاب کنید:', moreTimesKeyboard(NOON))
          }

          if (key === 'MORE_EVENING') {
            setTimeRange(chatId, 'EVENING')
            await sendMessage(chatId, 'ساعت مورد نظر را انتخاب کنید:', moreTimesKeyboard(EVENING))
          }

          // final time
          if (key.startsWith('TIME_')) {
            setTime(chatId, key.replace('TIME_', ''))

            const services = state.services.map(id =>
              catalog.services.find(s => s.id === id)?.name
            )

            await sendMessage(
              chatId,
              `⏰ ساعت انتخاب شد\n\nسرویس‌ها:\n• ${services.join(
                '\n• '
              )}\n\nساعت شروع: ${state.time}`
            )
          }
        }
      } catch (e) {
        console.error('ERROR:', e)
      }

      res.writeHead(200)
      res.end('ok')
    })
    return
  }

  res.writeHead(404)
  res.end('Not Found')
})

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
})
