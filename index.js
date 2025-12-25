require('dotenv').config()
const http = require('http')

const {
  handleTextMessage,
  handleCallbackQuery
} = require('./bot/handlers/callbackHandler')

const PORT = process.env.PORT || 3000

const server = http.createServer((req, res) => {
  console.log('RAW REQUEST:', req.method, req.url)
  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200)
    res.end('Bot is running')
    return
  }

  if (req.method === 'POST' && req.url === '/telegram/webhook') {
    let body = ''
    req.on('data', chunk => (body += chunk))
    req.on('end', () => {
      res.writeHead(200)
      res.end('ok')

      const update = JSON.parse(body || '{}')

      if (update.message) {
        handleTextMessage(update.message)
      }

      if (update.callback_query) {
        handleCallbackQuery(update.callback_query)
      }
    })
    return
  }

  res.writeHead(404)
  res.end('Not Found')
})

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
})
