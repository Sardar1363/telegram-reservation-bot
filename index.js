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

// ---------- Telegram helpers ----------
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

async function answerCallback(callbackId) {
  await fetch(`${TELEGRAM_API}/answerCallbackQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      callback_query_id: callbackId
    })
  })
}

// ---------- Server ----------
const server = http.createServer((req, res) => {
  console.log('INCOMING:', req.method, req.url)

  // health check
  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200)
    res.end('Bot is running')
    return
  }

  // telegram webhook
  if (req.method === 'POST' && req.url.startsWith('/telegram/webhook')) {
    let body = ''
    req.on('data', chunk => (body += chunk))

    req.on('end', async () => {
      try {
        const update = JSON.parse(body || '{}')
        console.log('RAW UPDATE:', JSON.stringify(update))

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

        // ---------- CALLBACK ----------
        if (cb) {
          console.log('CALLBACK RECEIVED')
          console.log('CALLBACK ID:', cb.id)
          console.log('CALLBACK DATA:', cb.data)

          // 🔴 خیلی مهم: اول جواب callback
          await answerCallback(cb.id)

          const chatId = cb.message.chat.id
          const key = cb.data
          const state = getState(chatId)

          // language
          if (key.startsWith('LANG_')) {
            console.log('LANGUAGE SELECTED:', key)
            setLanguage(chatId, key.replace('LANG_', ''))

            await sendMessage(
              chatId,
              'دسته‌بندی خدمات را انتخاب کنید:',
              categoryKeyboard()
            )
          }

          // category
          else if (key.startsWith('CAT_')) {
            console.log('CATEGORY SELECTED:', key)
            setCategory(chatId, key.replace('CAT_', ''))

            await sendMessage(
              chatId,
              'سرویس‌های مورد نظر را انتخاب کنید:',
              serviceKeyboard(state.categoryId, state.services)
            )
          }

          // toggle service
          else if (key.startsWith('SERVICE_')) {
            toggleService(chatId, key.replace('SERVICE_', ''))

            await sendMessage(
              chatId,
              'سرویس‌های مورد نظر را انتخاب کنید:',
              serviceKeyboard(state.categoryId, state.services)
            )
          }

          // continue
          else if (key === 'CONTINUE_SERVICES') {
            await sendMessage(
              chatId,
              'بازه زمانی را انتخاب کنید:',
              timeRangeKeyboard()
            )
          }

          // time ranges
          else if (key === 'MORE_MORNING') {
            setTimeRange(chatId, 'MORNING')
            await sendMessage(chatId, 'ساعت را انتخاب کنید:', moreTimesKeyboard(MORNING))
          }

          else if (key === 'MORE_NOON') {
            setTimeRange(chatId, 'NOON')
            await sendMessage(chatId, 'ساعت را انتخاب کنید:', moreTimesKeyboard(NOON))
          }

          else if (key === 'MORE_EVENING') {
            setTimeRange(chatId, 'EVENING')
            await sendMessage(chatId, 'ساعت را انتخاب کنید:', moreTimesKeyboard(EVENING))
          }

          // final time
          else if (key.startsWith('TIME_')) {
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
      } catch (err) {
        console.error('ERROR:', err)
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
