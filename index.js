require('dotenv').config()
const http = require('http')

const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args))

const {
  quickDateKeyboard,
  calendarKeyboard,
  timeRangeKeyboard,
  timeListKeyboard,
  MORNING,
  NOON,
  EVENING
} = require('./bot/keyboard')

const {
  getState,
  resetState,
  setLastMessage,
  setCategory,
  toggleService,
  setDate,
  setTime,
  setCalendarPage
} = require('./bot/state')

const catalog = require('./data/catalog')

const BOT_TOKEN = process.env.BOT_TOKEN
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`
const PORT = process.env.PORT || 3000

// ---------------- Telegram helpers ----------------
async function tg(method, payload) {
  const res = await fetch(`${TELEGRAM_API}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  return res.json()
}

async function sendMessage(chatId, text, keyboard = null) {
  const res = await tg('sendMessage', {
    chat_id: chatId,
    text,
    reply_markup: keyboard
  })
  if (res?.result?.message_id) {
    setLastMessage(chatId, res.result.message_id)
  }
  return res
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
async function handleTelegramUpdate(body) {
  try {
    const update = JSON.parse(body || '{}')

    const msg = update.message
    const cb = update.callback_query

    // ---------- /start ----------
    if (msg && msg.text && msg.text.startsWith('/start')) {
      const chatId = msg.chat.id
      resetState(chatId)

      await sendMessage(
        chatId,
        'Merhaba 👋\nLütfen hizmetleri seçiniz ve devam ediniz.'
      )
      return
    }

    // ---------- CALLBACK ----------
    if (cb) {
      await answerCallback(cb.id)

      const chatId = cb.message.chat.id
      const state = getState(chatId)
      const key = cb.data

      // 👇 تمام منطق callbackهایی که قبلاً داشتی
      // (CONTINUE_SERVICES, DATE_, RANGE_, TIME_, CONFIRM و ...)
      // اینجا بدون هیچ res.end
    }
  } catch (err) {
    console.error('UPDATE ERROR:', err)
  }
}

// ---------------- Server ----------------
const server = http.createServer((req, res) => {
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

  req.on('end', () => {
    // 👈 اول پاسخ بده
    res.writeHead(200)
    res.end('ok')

    // 👇 بعدش منطق async را جدا اجرا کن
    handleTelegramUpdate(body)
  })
  return
}

        // ---------- /start ----------
        if (msg && msg.text === '/start') {
          const chatId = msg.chat.id
          resetState(chatId)

          await sendMessage(
            chatId,
            'Merhaba 👋\nLütfen hizmetleri seçiniz ve devam ediniz.'
          )

          res.writeHead(200)
          res.end('ok')
          return
        }

        // ---------- CALLBACK ----------
        if (cb) {
          await answerCallback(cb.id)

          const chatId = cb.message.chat.id
          const state = getState(chatId)
          const key = cb.data

          // ---- SERVICES (assumes you already reached service confirm) ----
          if (key === 'CONTINUE_SERVICES') {
            // بعد از تأیید سرویس‌ها → انتخاب روز
            await sendMessage(
              chatId,
              '📅 Lütfen randevu günü seçiniz:',
              quickDateKeyboard()
            )

            res.writeHead(200)
            res.end('ok')
            return
          }

          // ---- DATE QUICK / CALENDAR ----
          if (key.startsWith('DATE_')) {
            const date = key.replace('DATE_', '')
            setDate(chatId, date)

            await sendMessage(
              chatId,
              '⏰ Lütfen saat aralığını seçiniz:',
              timeRangeKeyboard()
            )

            res.writeHead(200)
            res.end('ok')
            return
          }

          if (key === 'OPEN_CALENDAR') {
            setCalendarPage(chatId, 0)
            await sendMessage(
              chatId,
              '📅 Uygun günler:',
              calendarKeyboard(0)
            )

            res.writeHead(200)
            res.end('ok')
            return
          }

          if (key === 'CALENDAR_NEXT') {
            const next = (state.calendarPage || 0) + 1
            setCalendarPage(chatId, next)

            await sendMessage(
              chatId,
              '📅 Uygun günler:',
              calendarKeyboard(next)
            )

            res.writeHead(200)
            res.end('ok')
            return
          }

          // ---- TIME RANGE ----
          if (key === 'RANGE_MORNING') {
            await sendMessage(
              chatId,
              '🟢 Sabah saatleri:',
              timeListKeyboard(MORNING)
            )
            res.writeHead(200); res.end('ok'); return
          }

          if (key === 'RANGE_NOON') {
            await sendMessage(
              chatId,
              '🟡 Öğle saatleri:',
              timeListKeyboard(NOON)
            )
            res.writeHead(200); res.end('ok'); return
          }

          if (key === 'RANGE_EVENING') {
            await sendMessage(
              chatId,
              '🔵 Akşam saatleri:',
              timeListKeyboard(EVENING)
            )
            res.writeHead(200); res.end('ok'); return
          }

          // ---- FINAL TIME SELECT ----
          if (key.startsWith('TIME_')) {
            const time = key.replace('TIME_', '')
            setTime(chatId, time)

            const totalMinutes = state.services.reduce((sum, id) => {
              const s = catalog.services.find(x => x.id === id)
              return sum + (s?.duration || 0)
            }, 0)

            const [h, m] = time.split(':').map(Number)
            const endTotal = h * 60 + m + totalMinutes
            const endH = String(Math.floor(endTotal / 60)).padStart(2, '0')
            const endM = String(endTotal % 60).padStart(2, '0')

            const serviceNames = state.services
              .map(id => catalog.services.find(s => s.id === id)?.name)
              .filter(Boolean)

            await sendMessage(
              chatId,
              `✅ Lütfen randevunuzu onaylayın:\n\n` +
                `🛎 Hizmetler:\n- ${serviceNames.join('\n- ')}\n\n` +
                `📅 Gün: ${state.date}\n` +
                `⏰ Başlangıç: ${time}\n` +
                `⏳ Süre: ${totalMinutes} dk\n` +
                `🏁 Bitiş (tahmini): ${endH}:${endM}\n\n` +
                `Onaylıyor musunuz؟`,
              {
                inline_keyboard: [
                  [{ text: '✅ Onayla', callback_data: 'CONFIRM_BOOKING' }],
                  [{ text: '🔁 Saat Değiştir', callback_data: 'CHANGE_TIME' }],
                  [{ text: '🔁 Gün Değiştir', callback_data: 'CHANGE_DATE' }]
                ]
              }
            )

            res.writeHead(200)
            res.end('ok')
            return
          }

          // ---- CHANGE DATE / TIME ----
          if (key === 'CHANGE_DATE') {
            await sendMessage(
              chatId,
              '📅 Lütfen randevu günü seçiniz:',
              quickDateKeyboard()
            )
            res.writeHead(200); res.end('ok'); return
          }

          if (key === 'CHANGE_TIME') {
            await sendMessage(
              chatId,
              '⏰ Lütfen saat aralığını seçiniz:',
              timeRangeKeyboard()
            )
            res.writeHead(200); res.end('ok'); return
          }

          // ---- CONFIRM ----
          if (key === 'CONFIRM_BOOKING') {
            await sendMessage(
              chatId,
              '🎉 Randevunuz alındı.\nDurum: pending\nSalon tarafından onaylanacaktır.'
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
