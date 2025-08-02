const TelegramBot = require('node-telegram-bot-api');
const token = '8219817860:AAEercPGskexaV9JzfYWRR3zGDZQKHE04vk';
const bot = new TelegramBot(token, { polling: true });

// Kanallar ro'yxati
const channels = [
  { name: "🎥 1-Kanal", username: "@dgjoni_yt" },
  { name: "📚 2-Kanal", username: "@SHERALIYEVICHweb" }
];

// Fayllar ro'yxati
const files = {
  '1': {
    type: 'video',
    path: 'video1.mp4',
    caption: "🎬 Mana siz so‘ragan video!"
  },
  '2': {
    type: 'document',
    path: 'doc.pdf',
    caption: "📄 Mana siz so‘ragan hujjat!"
  }
};

// Obunani tekshirish funksiyasi
async function checkSubscription(userId) {
  for (const ch of channels) {
    try {
      const data = await bot.getChatMember(ch.username, userId);
      if (!['member', 'administrator', 'creator'].includes(data.status)) {
        return false;
      }
    } catch (e) {
      console.error(`❌ Xatolik kanal tekshiruvda: ${ch.username}`, e.message);
      return false;
    }
  }
  return true;
}

// /start komandasi
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  const isSubscribed = await checkSubscription(userId);

  if (!isSubscribed) {
    const inlineKeyboard = {
      inline_keyboard: [
        [
          { text: channels[0].name, url: `https://t.me/${channels[0].username.replace('@', '')}` }
        ],
        [
          { text: channels[1].name, url: `https://t.me/${channels[1].username.replace('@', '')}` }
        ],
        [
          { text: '✅ Obuna bo‘ldim', callback_data: 'check_subscription' }
        ]
      ]
    };

    bot.sendMessage(chatId, "📢 <b>Botdan foydalanish uchun  kanallarga obuna bo‘ling:</b>", {
      parse_mode: 'HTML',
      reply_markup: inlineKeyboard
    });
  } else {
    bot.sendMessage(chatId, "🔢Kerakli raqamni yuboring :", {
      parse_mode: 'HTML'
    });
  }
});

// Callback tugma: "Obuna bo‘ldim"
bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const userId = query.from.id;

  if (query.data === 'check_subscription') {
    const isSubscribed = await checkSubscription(userId);

    if (isSubscribed) {
      bot.sendMessage(chatId, "Kerakli raqamni yuboring:", {
        parse_mode: 'HTML'
      });
    } else {
      bot.sendMessage(chatId, "❌ Siz hali barcha kanallarga obuna bo‘lmagansiz.");
    }
  }

  bot.answerCallbackQuery(query.id);
});

// Raqam yuborilganda fayl yuborish
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const text = msg.text;

  if (text.startsWith('/start')) return;

  const isSubscribed = await checkSubscription(userId);
  if (!isSubscribed) {
    return bot.sendMessage(chatId, "🚫 Avval kanallarga obuna bo‘ling .");
  }

  if (!files.hasOwnProperty(text)) {
    return bot.sendMessage(chatId, "⚠️ Bunday raqam mavjud emas ");
  }

  const file = files[text];

  if (file.type === 'video') {
    bot.sendVideo(chatId, file.path, { caption: file.caption });
  } else if (file.type === 'document') {
    bot.sendDocument(chatId, file.path, { caption: file.caption });
  } else {
    bot.sendMessage(chatId, "⚠️ Fayl turi noto‘g‘ri belgilangan.");
  }
});
