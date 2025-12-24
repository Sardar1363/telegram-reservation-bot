require('dotenv').config()
const http = require('http')
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args))

const BOT_TOKEN = process.env.BOT_TOKEN
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`

const PORT = process.env.PORT || 3000

// ---------------- Telegram Sender ----------------
async function sendTelegramMessage(chatId, text) {
  const res = await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text
    })
  })

  return res.json()
}

// ---------------- HTTP Server ----------------
const server = http.createServer(async (req, res) => {
  console.log('INCOMING:', req.method, req.url)

  // Health check
  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200)
    res.end('Bot is running')
    return
  }

  // Telegram Webhook
  if (req.method === 'POST' && req.url.startsWith('/telegram/webhook')) {
    console.log('Webhook hit')

    let body = ''
    req.on('data', chunk => (body += chunk))

    req.on('end', async () => {
      try {
        const update = JSON.parse(body || '{}')
        console.log('Update received:', update)

        // ---- HANDLE /start ----
        if (update.message && update.message.text === '/start') {
          const chatId = update.message.chat.id

          await sendTelegramMessage(
            chatId,
            'سلام 👋\nبات رزرو سالن فعال شد ✅\n\nلطفاً منتظر مراحل بعدی باشید.'
          )
        }
      } catch (err) {
        console.error('Error handling update:', err)
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
