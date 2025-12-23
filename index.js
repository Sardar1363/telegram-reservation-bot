require('dotenv').config()

const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args))

const http = require('http')

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

const catalog = require('./data/catalog')

const BOT_TOKEN = process.env.BOT_TOKEN
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`

const PORT = process.env.PORT || 3000

// ---------------- STATE (Rule-based) ----------------
const state = {}

function getState(chatId) {
  if (!state[chatId]) {
    state[chatId] = {
      language: null,
      categoryId: null,
      services: [],
      time: null
    }
  }
  return state[chatId]
}

// ---------------- Telegram helpers ----------------
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

async function answerCallback(id) {
  await fetch(`${TELEGRAM_API}/answerCallbackQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ callback_query_id: id })
  })
}

// ---------------- Webhook Handler ----------------
async function handleUpdate(update) {
  // /start
  if (update.message && update.message.text === '/start') {
    const chatId = update.message.chat.id
    state[chatId] = null

    await sendMessage(
      chatId,
      'Merhaba 👋\nBen Selena Güzellik Salonu randevu asistanıyım.\n\nLütfen dilinizi seçiniz:',
      languageKeyboard()
    )
    return
  }

  if (!update.callback_query) return

  const chatId = update.callback_query.message.chat.id
  const key = update.callback_query.data
  const s = getState(chatId)

  await answerCallback(update.callback_query.id)

  // Language
  if (key.startsWith('LANG_')) {
    s.language = key.replace('LANG_', '')
    await sendMessage(chatId, 'Hizmet kategorisini seçiniz:', categoryKeyboard())
    return
  }

  // Change category
  if (key === 'CHANGE_CATEGORY') {
    s.categoryId = null
    await sendMessage(chatId, 'Hizmet kategorisini seçiniz:', categoryKeyboard())
    return
  }

  // Category
  if (key.startsWith('CAT_')) {
    s.categoryId = key.replace('CAT_', '')
    await sendMessage(
      chatId,
      'Hizmet seçiniz:',
      serviceKeyboard(s.categoryId, s.services)
    )
    return
  }

  // Toggle service
  if (key.startsWith('SERVICE_')) {
    const id = key.replace('SERVICE_', '')
    s.services = s.services.includes(id)
      ? s.services.filter(x => x !== id)
      : [...s.services, id]

    await sendMessage(
      chatId,
      'Hizmet seçiniz:',
      serviceKeyboard(s.categoryId, s.services)
    )
    return
  }

  // Continue services
  if (key === 'CONTINUE_SERVICES') {
    await sendMessage(chatId, 'Saat seçiniz:', timeRangeKeyboard())
    return
  }

  // More times
  if (key === 'MORE_MORNING')
    return sendMessage(chatId, 'Sabah saatleri:', moreTimesKeyboard(MORNING))
  if (key === 'MORE_NOON')
    return sendMessage(chatId, 'Öğle saatleri:', moreTimesKeyboard(NOON))
  if (key === 'MORE_EVENING')
    return sendMessage(chatId, 'Akşam saatleri:', moreTimesKeyboard(EVENING))

  // Time select → FINAL CONFIRM MESSAGE
  if (key.startsWith('TIME_')) {
    const startTime = key.replace('TIME_', '')
    s.time = startTime

    const totalMinutes = s.services.reduce((sum, id) => {
      const svc = catalog.services.find(x => x.id === id)
      return sum + (svc?.duration || 0)
    }, 0)

    const [h, m] = startTime.split(':').map(Number)
    const endTotal = h * 60 + m + totalMinutes
    const endH = String(Math.floor(endTotal / 60)).padStart(2, '0')
    const endM = String(endTotal % 60).padStart(2, '0')

    const lines = s.services.map(id => {
      const svc = catalog.services.find(x => x.id === id)
      return `• ${svc.name}`
    })

    await sendMessage(
      chatId,
      `Lütfen randevu bilgilerinizi kontrol ediniz:\n\n${lines.join(
        '\n'
      )}\n\nBaşlangıç: ${startTime}\nBitiş (tahmini): ${endH}:${endM}\n\nOnaylıyor musunuz?`
    )
  }
}

// ---------------- HTTP SERVER ----------------
const server = http.createServer(async (req, res) => {
  if (req.method === 'POST' && req.url === '/webhook') {
    let body = ''
    req.on('data', chunk => (body += chunk))
    req.on('end', async () => {
      const update = JSON.parse(body)
      await handleUpdate(update)
      res.writeHead(200)
      res.end('OK')
    })
  } else {
    res.writeHead(200)
    res.end('Bot is running')
  }
})

server.listen(PORT, () => {
  console.log(`🚀 Webhook server running on port ${PORT}`)
})
