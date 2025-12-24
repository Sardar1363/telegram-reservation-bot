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
async function tg(method, payload) {
  const res = await fetch(`${TELEGRAM_API}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  return res.json()
}

async function sendMessage(chatId, text, keyboard = null) {
  return tg('sendMessage', {
    chat_id: chatId,
    text,
    reply_markup: keyboard
  })
}

async function editMessage(chatId, messageId, text, keyboard = null) {
  return tg('editMessageText', {
    chat_id: chatId,
    message_id: messageId,
    text,
    reply_markup: keyboard
  })
}

async function answerCallback(callbackId) {
  return tg('answerCallbackQuery', { callback_query_id: callbackId })
}

// ---------- Server ----------
const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200)
    res.end('Bot is running')
    return
  }

  if (req.method === 'POST' && req.url.startsWith('/telegram/webhook')) {
    let body = ''
    req.on('data', chunk => (body += chunk))

    req.on('end', async () => {
      try {
        const update = JSON.parse(body || '{}')

        const msg = update.message
        const cb = update.callback_query

        // ---- /start ----
        if (msg && msg.text === '/start') {
          const chatId = msg.chat.id
          resetState(chatId)

          await sendMessage(
            chatId,
            'سلام 👋\nلطفاً زبان خود را انتخاب کنید:',
            languageKeyboard()
          )
        }

        // ---- callbacks ----
        if (cb) {
          const chatId = cb.message.chat.id
          const messageId = cb.message.message_id
          const key = cb.data

          await answerCallback(cb.id)

          // LANGUAGE
          if (key.startsWith('LANG_')) {
            setLanguage(chatId, key.replace('LANG_', ''))
            await sendMessage(chatId, 'دسته‌بندی خدمات را انتخاب کنید:', categoryKeyboard())
            res.writeHead(200); res.end('ok'); return
          }

          // CHANGE CATEGORY
          if (key === 'CHANGE_CATEGORY') {
            setCategory(chatId, null)
            await sendMessage(chatId, 'دسته‌بندی خدمات را انتخاب کنید:', categoryKeyboard())
            res.writeHead(200); res.end('ok'); return
          }

          // CATEGORY → show services (NEW message)
          if (key.startsWith('CAT_')) {
            setCategory(chatId, key.replace('CAT_', ''))
            const st = getState(chatId)

            await sendMessage(
              chatId,
              'سرویس‌های مورد نظر را انتخاب کنید:',
              serviceKeyboard(st.categoryId, st.services)
            )
            res.writeHead(200); res.end('ok'); return
          }

          // TOGGLE SERVICE → EDIT SAME MESSAGE (کلیدی‌ترین اصلاح)
          if (key.startsWith('SERVICE_')) {
            toggleService(chatId, key.replace('SERVICE_', ''))
            const st = getState(chatId)

            await editMessage(
              chatId,
              messageId,
              'سرویس‌های مورد نظر را انتخاب کنید:',
              serviceKeyboard(st.categoryId, st.services)
            )
            res.writeHead(200); res.end('ok'); return
          }

          // CONTINUE
          if (key === 'CONTINUE_SERVICES') {
            const st = getState(chatId)
            if (!st.services || st.services.length === 0) {
              await sendMessage(chatId, '⚠️ لطفاً حداقل یک سرویس انتخاب کنید.')
              res.writeHead(200); res.end('ok'); return
            }
            await sendMessage(chatId, 'بازه زمانی را انتخاب کنید:', timeRangeKeyboard())
            res.writeHead(200); res.end('ok'); return
          }

          // TIME RANGE
          if (key === 'MORE_MORNING') {
            setTimeRange(chatId, 'MORNING')
            await sendMessage(chatId, 'ساعت را انتخاب کنید:', moreTimesKeyboard(MORNING))
            res.writeHead(200); res.end('ok'); return
          }
          if (key === 'MORE_NOON') {
            setTimeRange(chatId, 'NOON')
            await sendMessage(chatId, 'ساعت را انتخاب کنید:', moreTimesKeyboard(NOON))
            res.writeHead(200); res.end('ok'); return
          }
          if (key === 'MORE_EVENING') {
            setTimeRange(chatId, 'EVENING')
            await sendMessage(chatId, 'ساعت را انتخاب کنید:', moreTimesKeyboard(EVENING))
            res.writeHead(200); res.end('ok'); return
          }

          // FINAL TIME
          if (key.startsWith('TIME_')) {
            setTime(chatId, key.replace('TIME_', ''))
            const st = getState(chatId)

            const services = (st.services || [])
              .map(id => catalog.services.find(s => s.id === id)?.name)
              .filter(Boolean)

            await sendMessage(
              chatId,
              `⏰ ساعت انتخاب شد\n\nسرویس‌ها:\n• ${services.join('\n• ')}\n\nساعت شروع: ${st.time}`
            )
            res.writeHead(200); res.end('ok'); return
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
