require('dotenv').config()
const http = require('http')

const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args))

const { languageKeyboard } = require('./bot/keyboard')
const { resetState } = require('./bot/state')

const BOT_TOKEN = process.env.BOT_TOKEN
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`

const PORT = process.env.PORT || 3000

// -------- Telegram helper --------
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

// -------- HTTP Server --------
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
        const update = JSON.parse(body || {})
        console.log('UPDATE:', update)

        // /start
        if (update.message && update.message.text === '/start') {
          const chatId = update.message.chat.id

          resetState(chatId)

          await sendMessage(
            chatId,
            'سلام 👋\nلطفاً زبان خود را انتخاب کنید:',
            languageKeyboard()
          )
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
