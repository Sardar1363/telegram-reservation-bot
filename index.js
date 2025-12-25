require('dotenv').config()
const http = require('http')

const BOT_TOKEN = process.env.BOT_TOKEN
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`

const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args))

const PORT = process.env.PORT || 3000

// ================== Telegram API ==================
function sendMessage(chatId, text, replyMarkup = null) {
  return fetch(`${TELEGRAM_API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      reply_markup: replyMarkup
    })
  })
}

// ================== MAIN HANDLER ==================
async function handleTelegramUpdate(body) {
  try {
    const update = JSON.parse(body || '{}')

    // پیام متنی
    if (update.message) {
      const chatId = update.message.chat.id
      const text = update.message.text || ''

      if (text === '/start') {
        await sendMessage(
          chatId,
          'Merhaba 👋\nLütfen dilinizi seçiniz:'
          // languageKeyboard() ← از فایل keyboard
        )
        return
      }

      return
    }

    // callback_query
    if (update.callback_query) {
      const chatId = update.callback_query.message.chat.id
      const data = update.callback_query.data

      console.log('CALLBACK:', data)

      // 👇 اینجا فقط dispatch می‌کنیم
      // handleCallback(chatId, data)

      return
    }
  } catch (err) {
    console.error('HANDLE UPDATE ERROR:', err)
  }
}

// ================== SERVER ==================
const server = http.createServer((req, res) => {
  // health check
  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200)
    res.end('Bot is running')
    return
  }

  // telegram webhook
  if (req.method === 'POST' && req.url === '/telegram/webhook') {
    let body = ''
    req.on('data', chunk => (body += chunk))
    req.on('end', () => {
      // پاسخ فوری به تلگرام
      res.writeHead(200)
      res.end('ok')

      // پردازش async جدا
      handleTelegramUpdate(body)
    })
    return
  }

  res.writeHead(404)
  res.end('Not Found')
})

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
})
