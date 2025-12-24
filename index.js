require('dotenv').config()
const http = require('http')

const PORT = process.env.PORT || 3000

const server = http.createServer((req, res) => {
  // 🔍 لاگ همه درخواست‌ها
  console.log('INCOMING:', req.method, req.url)

  // health check
  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200)
    res.end('Bot is running')
    return
  }

  // Telegram webhook (انعطاف‌پذیر)
  if (req.method === 'POST' && req.url.startsWith('/telegram/webhook')) {
    console.log('Webhook hit:', req.method, req.url)

    let body = ''
    req.on('data', chunk => (body += chunk))
    req.on('end', () => {
      try {
        const update = JSON.parse(body || '{}')
        console.log('Update received:', update)
      } catch (e) {
        console.error('JSON parse error', e)
      }

      res.writeHead(200)
      res.end('ok')
    })
    return
  }

  // fallback
  res.writeHead(404)
  res.end('Not Found')
})

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
})
