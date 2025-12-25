require('dotenv').config()
const http = require('http')

const BOT_TOKEN = process.env.BOT_TOKEN
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`

const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args))

const PORT = process.env.PORT || 3000

// ---------- Telegram API ----------
function sendMessage(chatId, text) {
  return fetch(`${TELEGRAM_API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text
    })
  })
}

// ---------- Update Handler ----------
async function handleTelegramUpdate(body) {
  try {
    const update = JSON.parse(body || '{}')

    if (update.message && update.message.text) {
      const chatId = update.message.chat.id
      const text = update.message.text

      console.log('MESSAGE:', text)

      if (text.startsWith('/start')) {
        await sendMessage(chatId, '✅ Bot çalışıyor. /start alındı.')
      }
    }
  } catch (err) {
    console.error('UPDATE ERROR:', err)
  }
}

// ---------- Server ----------
const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200)
    res.end('Bot is running')
    return
  }

  if (req.method === 'POST' && req.url === '/telegram/webhook') {
    let body = ''
    req.on('data', chunk => (body += chunk))
    req.on('end', () => {
      // ✅ پاسخ فوری به تلگرام
      res.writeHead(200)
      res.end('ok')

      // ⛔️ بدون await
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
