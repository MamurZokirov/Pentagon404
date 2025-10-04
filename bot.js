const { Telegraf, Scenes, session, Markup } = require("telegraf")
const fs = require("fs").promises
const path = require("path")
require("dotenv").config()

// Logging setup
const log = {
  info: (msg) => console.log(`[INFO] ${new Date().toISOString()} - ${msg}`),
  error: (msg) => console.error(`[ERROR] ${new Date().toISOString()} - ${msg}`),
  warning: (msg) => console.warn(`[WARN] ${new Date().toISOString()} - ${msg}`),
}

const ADMIN_ID = Number.parseInt(process.env.ADMIN_ID || "123456789")
const BOT_TOKEN = process.env.BOT_TOKEN

// File paths
const CHANNELS_FILE = "channels.json"
const USERS_FILE = "users.json"
const STATS_FILE = "stats.json"
const USER_PREFS_FILE = "user_prefs.json"

// Conversation states
const WAITING_FOR_GROUP = "WAITING_FOR_GROUP"
const WAITING_FOR_MAX_NUMBER = "WAITING_FOR_MAX_NUMBER"
const WAITING_FOR_COUNT = "WAITING_FOR_COUNT"
const WAITING_FOR_BROADCAST = "WAITING_FOR_BROADCAST"
const WAITING_FOR_CHANNEL_ADD = "WAITING_FOR_CHANNEL_ADD"
const WAITING_FOR_CHANNEL_REMOVE = "WAITING_FOR_CHANNEL_REMOVE"

// Global data
const activeGames = {}
let allUsers = new Set()
let userStats = {}
let requiredChannels = []
let userPrefs = {}

// Translations
const TRANSLATIONS = {
  uz: {
    welcome: "👋 Assalomu alaykum, {}!\n\n🌐 Iltimos, tilni tanlang:",
    language_selected: "✅ Til tanlandi: O'zbekcha",
    subscribe_prompt:
      "👋 Assalomu alaykum, {}!\n\n🔔 Botdan foydalanish uchun quyidagi kanallarga obuna bo'ling:\n\nObuna bo'lgandan keyin 'Obunani Tekshirish' tugmasini bosing.",
    check_subscription_btn: "✅ Obunani Tekshirish",
    not_subscribed_alert: "❌ Siz hali barcha kanallarga obuna bo'lmadingiz!",
    main_menu_title:
      "🎰 Kazino Bot - Asosiy Menyu\n\nO'yin boshlash yoki yordam olish uchun tugmalardan birini tanlang:",
    start_game_btn: "🕹 O'yin Boshlash",
    sos_btn: "🆘 SOS",
    change_language_btn: "🌐 Tilni O'zgartirish",
    cabinet_btn: "👤 Kabinet",
    admin_panel_btn: "⚙️ Admin Panel",
    admin_panel_title: "⚙️ ADMIN PANEL\n\nBoshqaruv paneli:",
    statistics_btn: "📊 Statistika",
    broadcast_btn: "📢 Xabar Yuborish",
    users_list_btn: "👥 Foydalanuvchilar",
    active_games_btn: "🎮 Faol O'yinlar",
    channels_btn: "📢 Kanallar",
    statistics_text:
      "📊 BOT STATISTIKASI\n\n👥 Jami foydalanuvchilar: {}\n🎮 Jami o'yinlar: {}\n🏆 Jami g'alabalar: {}\n🎯 Faol o'yinlar: {}\n📢 Majburiy kanallar: {}\n\n⏰ Vaqt: {}",
    broadcast_prompt:
      "📢 Barcha foydalanuvchilarga yuborish uchun xabarni yozing yoki forward qiling:\n\n✅ Matn xabarlar\n✅ Rasm, video, audio\n✅ Kanaldan forward\n✅ Guruhdan forward\n\n/cancel - bekor qilish",
    broadcast_success: "✅ Xabar {} ta foydalanuvchiga yuborildi!",
    broadcast_failed: "⚠️ {} ta foydalanuvchiga yuborildi, {} ta xatolik.",
    broadcast_cancelled: "❌ Xabar yuborish bekor qilindi.",
    users_list_text: "👥 FOYDALANUVCHILAR RO'YXATI\n\nJami: {} ta foydalanuvchi\n\n{}",
    active_games_text: "🎮 FAOL O'YINLAR\n\nJami: {} ta o'yin\n\n{}",
    no_active_games: "🎮 Hozirda faol o'yinlar yo'q.",
    channels_list_text: "📢 MAJBURIY KANALLAR\n\nJami: {} ta kanal\n\n{}",
    add_channel_btn: "➕ Kanal Qo'shish",
    remove_channel_btn: "➖ Kanal O'chirish",
    add_channel_prompt:
      "➕ Yangi kanal qo'shish\n\nKanal username ni kiriting (@ bilan):\nMasalan: @mychannel\n\n/cancel - bekor qilish",
    channel_added: "✅ Kanal muvaffaqiyatli qo'shildi: {}",
    channel_exists: "⚠️ Bu kanal allaqachon ro'yxatda!",
    invalid_channel: "❌ Noto'g'ri kanal formati! @ bilan boshlang.",
    remove_channel_prompt: "➖ Kanalni o'chirish\n\nO'chirish uchun kanal raqamini kiriting:\n\n{}",
    channel_removed: "✅ Kanal muvaffaqiyatli o'chirildi!",
    invalid_channel_number: "❌ Noto'g'ri raqam! Qaytadan urinib ko'ring.",
    cabinet_info:
      "👤 KABINET\n\n📊 Sizning ma'lumotlaringiz:\n\n🆔 ID: {}\n👤 Ism: {}\n📱 Username: @{}\n🌐 Til: {}\n\n📈 Statistika:\n🎮 O'yinlar soni: {}\n🏆 G'alabalar: {}",
    game_start_prompt:
      "🎮 O'yin boshlanmoqda!\n\nIltimos, o'yin o'tkaziladigan guruh linkini yuboring.\nMasalan: @mygroupusername yoki https://t.me/mygroupusername\n\n⚠️ Eslatma: Bot guruhda admin bo'lishi kerak!",
    bot_not_admin: "❌ Bot bu guruhda admin emas!\nIltimos, botni guruhga admin qiling va qaytadan urinib ko'ring.",
    group_found:
      "✅ Guruh topildi: {}\n\n🔢 Endi maksimal sonni kiriting (masalan: 100)\nBot 1 dan shu songacha tasodifiy sonlar o'ylaydi.",
    group_not_found:
      "❌ Guruh topilmadi yoki botda muammo bor!\nIltimos, to'g'ri guruh linkini kiriting va bot guruhda admin ekanligiga ishonch hosil qiling.",
    ask_count:
      "✅ Maksimal son: {}\n\n🎲 Endi bot nechta son o'ylashi kerakligini kiriting (masalan: 5)\nBot 1 dan {} gacha {} ta tasodifiy son o'ylaydi.",
    number_too_small: "❌ Son kamida 2 bo'lishi kerak! Qaytadan kiriting:",
    count_too_small: "❌ Kamida 1 ta son bo'lishi kerak! Qaytadan kiriting:",
    count_too_large: "❌ Maksimal sondan ko'p bo'lishi mumkin emas! Qaytadan kiriting:",
    game_started_user:
      "🎉 O'yin {} guruhida boshlandi!\n\n🎲 Bot 1 dan {} gacha {} ta son o'yladi.\nGuruhda ishtirokchilar son yozishlari mumkin!",
    game_started_group:
      "🎮 O'YIN BOSHLANDI! 🎮\n\n🎲 Men 1 dan {} gacha {} ta son o'yladim!\n👤 O'yinni boshlagan: @{}\n\n💡 To'g'ri sonlarni topish uchun guruhda son yozing!\n✅ To'g'ri topgan kishi g'olib bo'ladi!\n\n📊 Qolgan sonlar: {} ta",
    invalid_number: "❌ Iltimos, faqat son kiriting! Qaytadan urinib ko'ring:",
    game_cancelled: "❌ O'yin sozlash bekor qilindi.",
    win_message: "🎉🎉🎉 WIN! 🎉🎉🎉\n\n🏆 G'olib: {} (@{})\n🎲 To'g'ri son: {}\n\n📊 Qolgan sonlar: {}\n\n{}",
    game_finished: "🎮 O'yin tugadi! Barcha sonlar topildi!\n\nYangi o'yin boshlash uchun botga murojaat qiling.",
    wrong_guess:
      "❌ XATO!\n\n👤 Foydalanuvchi: {} (@{})\n🔢 Sizning raqamingiz: {}\n\nQaytadan urinib ko'ring! (1-{})\n📊 Qolgan sonlar: {} ta",
    sos_message: "🆘 YORDAM\n\nBiror muammo bo'lsa admin bilan bog'laning, sizga yordam berishadi!",
    admin_btn: "👤 Admin",
    developer_btn: "👨‍💻 Dasturchi",
    back_to_menu: "🔙 Asosiy Menyu",
    back_to_admin: "🔙 Admin Panel",
    back_to_channels: "🔙 Kanallar",
    no_username: "username yo'q",
  },
  ru: {
    welcome: "👋 Здравствуйте, {}!\n\n🌐 Пожалуйста, выберите язык:",
    language_selected: "✅ Язык выбран: Русский",
    subscribe_prompt:
      "👋 Здравствуйте, {}!\n\n🔔 Для использования бота подпишитесь на следующие каналы:\n\nПосле подписки нажмите кнопку 'Проверить подписку'.",
    check_subscription_btn: "✅ Проверить подписку",
    not_subscribed_alert: "❌ Вы еще не подписались на все каналы!",
    main_menu_title: "🎰 Казино Бот - Главное меню\n\nВыберите одну из кнопок, чтобы начать игру или получить помощь:",
    start_game_btn: "🕹 Начать игру",
    sos_btn: "🆘 SOS",
    change_language_btn: "🌐 Изменить язык",
    cabinet_btn: "👤 Кабинет",
    admin_panel_btn: "⚙️ Админ Панель",
    admin_panel_title: "⚙️ АДМИН ПАНЕЛЬ\n\nПанель управления:",
    statistics_btn: "📊 Статистика",
    broadcast_btn: "📢 Рассылка",
    users_list_btn: "👥 Пользователи",
    active_games_btn: "🎮 Активные Игры",
    channels_btn: "📢 Каналы",
    statistics_text:
      "📊 СТАТИСТИКА БОТА\n\n👥 Всего пользователей: {}\n🎮 Всего игр: {}\n🏆 Всего побед: {}\n🎯 Активных игр: {}\n📢 Обязательных каналов: {}\n\n⏰ Время: {}",
    broadcast_prompt:
      "📢 Напишите или перешлите сообщение для рассылки всем пользователям:\n\n✅ Текстовые сообщения\n✅ Фото, видео, аудио\n✅ Пересылка из канала\n✅ Пересылка из группы\n\n/cancel - отменить",
    broadcast_success: "✅ Сообщение отправлено {} пользователям!",
    broadcast_failed: "⚠️ Отправлено {} пользователям, {} ошибок.",
    broadcast_cancelled: "❌ Рассылка отменена.",
    users_list_text: "👥 СПИСОК ПОЛЬЗОВАТЕЛЕЙ\n\nВсего: {} пользователей\n\n{}",
    active_games_text: "🎮 АКТИВНЫЕ ИГРЫ\n\nВсего: {} игр\n\n{}",
    no_active_games: "🎮 Сейчас нет активных игр.",
    channels_list_text: "📢 ОБЯЗАТЕЛЬНЫЕ КАНАЛЫ\n\nВсего: {} каналов\n\n{}",
    add_channel_btn: "➕ Добавить Канал",
    remove_channel_btn: "➖ Удалить Канал",
    add_channel_prompt:
      "➕ Добавить новый канал\n\nВведите username канала (с @):\nНапример: @mychannel\n\n/cancel - отменить",
    channel_added: "✅ Канал успешно добавлен: {}",
    channel_exists: "⚠️ Этот канал уже в списке!",
    invalid_channel: "❌ Неверный формат канала! Начните с @.",
    remove_channel_prompt: "➖ Удалить канал\n\nВведите номер канала для удаления:\n\n{}",
    channel_removed: "✅ Канал успешно удален!",
    invalid_channel_number: "❌ Неверный номер! Попробуйте снова.",
    cabinet_info:
      "👤 КАБИНЕТ\n\n📊 Ваша информация:\n\n🆔 ID: {}\n👤 Имя: {}\n📱 Username: @{}\n🌐 Язык: {}\n\n📈 Статистика:\n🎮 Игр сыграно: {}\n🏆 Побед: {}",
    game_start_prompt:
      "🎮 Начинаем игру!\n\nПожалуйста, отправьте ссылку на группу, где будет проходить игра.\nНапример: @mygroupusername или https://t.me/mygroupusername\n\n⚠️ Примечание: Бот должен быть администратором в группе!",
    bot_not_admin:
      "❌ Бот не является администратором в этой группе!\nПожалуйста, сделайте бота администратором и попробуйте снова.",
    group_found:
      "✅ Группа найдена: {}\n\n🔢 Теперь введите максимальное число (например: 100)\nБот загадает случайное число от 1 до этого числа.",
    group_not_found:
      "❌ Группа не найдена или возникла проблема с ботом!\nПожалуйста, введите правильную ссылку на группу и убедитесь, что бот является администратором.",
    ask_count:
      "✅ Максимальное число: {}\n\n🎲 Теперь введите, сколько чисел должен загадать бот (например: 5)\nБот загадает {} случайных чисел от 1 до {}.",
    number_too_small: "❌ Число должно быть не менее 2! Введите снова:",
    count_too_small: "❌ Должно быть минимум 1 число! Введите снова:",
    count_too_large: "❌ Не может быть больше максимального числа! Введите снова:",
    game_started_user:
      "🎉 Игра началась в группе {}!\n\n🎲 Бот загадал {} чисел от 1 до {}.\nУчастники могут писать числа в группе!",
    game_started_group:
      "🎮 ИГРА НАЧАЛАСЬ! 🎮\n\n🎲 Я загадал {} чисел от 1 до {}!\n👤 Игру начал: @{}\n\n💡 Пишите числа в группе, чтобы угадать!\n✅ Кто угадает первым - победитель!\n\n📊 Осталось чисел: {}",
    invalid_number: "❌ Пожалуйста, введите только число! Попробуйте снова:",
    game_cancelled: "❌ Настройка игры отменена.",
    win_message:
      "🎉🎉🎉 ПОБЕДА! 🎉🎉🎉\n\n🏆 Победитель: {} (@{})\n🎲 Правильное число: {}\n\n📊 Осталось чисел: {}\n\n{}",
    game_finished: "🎮 Игра окончена! Все числа найдены!\n\nОбратитесь к боту, чтобы начать новую игру.",
    wrong_guess:
      "❌ НЕПРАВИЛЬНО!\n\n👤 Пользователь: {} (@{})\n🔢 Ваше число: {}\n\nПопробуйте снова! (1-{})\n📊 Осталось чисел: {}",
    sos_message: "🆘 ПОМОЩЬ\n\nЕсли у вас возникли проблемы, свяжитесь с администратором, они вам помогут!",
    admin_btn: "👤 Администратор",
    developer_btn: "👨‍💻 Разработчик",
    back_to_menu: "🔙 Главное меню",
    back_to_admin: "🔙 Админ Панель",
    back_to_channels: "🔙 Каналы",
    no_username: "нет имени пользователя",
  },
  en: {
    welcome: "👋 Hello, {}!\n\n🌐 Please select a language:",
    language_selected: "✅ Language selected: English",
    subscribe_prompt:
      "👋 Hello, {}!\n\n🔔 To use the bot, please subscribe to the following channels:\n\nAfter subscribing, click the 'Check Subscription' button.",
    check_subscription_btn: "✅ Check Subscription",
    not_subscribed_alert: "❌ You haven't subscribed to all channels yet!",
    main_menu_title: "🎰 Casino Bot - Main Menu\n\nSelect one of the buttons to start a game or get help:",
    start_game_btn: "🕹 Start Game",
    sos_btn: "🆘 SOS",
    change_language_btn: "🌐 Change Language",
    cabinet_btn: "👤 Cabinet",
    admin_panel_btn: "⚙️ Admin Panel",
    admin_panel_title: "⚙️ ADMIN PANEL\n\nControl panel:",
    statistics_btn: "📊 Statistics",
    broadcast_btn: "📢 Broadcast",
    users_list_btn: "👥 Users",
    active_games_btn: "🎮 Active Games",
    channels_btn: "📢 Channels",
    statistics_text:
      "📊 BOT STATISTICS\n\n👥 Total users: {}\n🎮 Total games: {}\n🏆 Total wins: {}\n🎯 Active games: {}\n📢 Required channels: {}\n\n⏰ Time: {}",
    broadcast_prompt:
      "📢 Write or forward a message to broadcast to all users:\n\n✅ Text messages\n✅ Photos, videos, audio\n✅ Forward from channel\n✅ Forward from group\n\n/cancel - cancel",
    broadcast_success: "✅ Message sent to {} users!",
    broadcast_failed: "⚠️ Sent to {} users, {} errors.",
    broadcast_cancelled: "❌ Broadcast cancelled.",
    users_list_text: "👥 USERS LIST\n\nTotal: {} users\n\n{}",
    active_games_text: "🎮 ACTIVE GAMES\n\nTotal: {} games\n\n{}",
    no_active_games: "🎮 No active games at the moment.",
    channels_list_text: "📢 REQUIRED CHANNELS\n\nTotal: {} channels\n\n{}",
    add_channel_btn: "➕ Add Channel",
    remove_channel_btn: "➖ Remove Channel",
    add_channel_prompt:
      "➕ Add new channel\n\nEnter channel username (with @):\nFor example: @mychannel\n\n/cancel - cancel",
    channel_added: "✅ Channel successfully added: {}",
    channel_exists: "⚠️ This channel is already in the list!",
    invalid_channel: "❌ Invalid channel format! Start with @.",
    remove_channel_prompt: "➖ Remove channel\n\nEnter channel number to remove:\n\n{}",
    channel_removed: "✅ Channel successfully removed!",
    invalid_channel_number: "❌ Invalid number! Try again.",
    cabinet_info:
      "👤 CABINET\n\n📊 Your information:\n\n🆔 ID: {}\n👤 Name: {}\n📱 Username: @{}\n🌐 Language: {}\n\n📈 Statistics:\n🎮 Games played: {}\n🏆 Wins: {}",
    game_start_prompt:
      "🎮 Starting the game!\n\nPlease send the link to the group where the game will take place.\nFor example: @mygroupusername or https://t.me/mygroupusername\n\n⚠️ Note: The bot must be an administrator in the group!",
    bot_not_admin:
      "❌ The bot is not an administrator in this group!\nPlease make the bot an administrator and try again.",
    group_found:
      "✅ Group found: {}\n\n🔢 Now enter the maximum number (for example: 100)\nThe bot will think of a random number from 1 to this number.",
    group_not_found:
      "❌ Group not found or there's a problem with the bot!\nPlease enter the correct group link and make sure the bot is an administrator.",
    ask_count:
      "✅ Maximum number: {}\n\n🎲 Now enter how many numbers the bot should think of (for example: 5)\nThe bot will think of {} random numbers from 1 to {}.",
    number_too_small: "❌ The number must be at least 2! Enter again:",
    count_too_small: "❌ Must be at least 1 number! Enter again:",
    count_too_large: "❌ Cannot be more than the maximum number! Enter again:",
    game_started_user:
      "🎉 The game has started in the {} group!\n\n🎲 The bot thought of {} numbers from 1 to {}.\nParticipants can write numbers in the group!",
    game_started_group:
      "🎮 GAME STARTED! 🎮\n\n🎲 I thought of {} numbers from 1 to {}!\n👤 Game started by: @{}\n\n💡 Write numbers in the group to guess!\n✅ Whoever guesses first wins!\n\n📊 Numbers remaining: {}",
    invalid_number: "❌ Please enter only a number! Try again:",
    game_cancelled: "❌ Game setup cancelled.",
    win_message: "🎉🎉🎉 WIN! 🎉🎉🎉\n\n🏆 Winner: {} (@{})\n🎲 Correct number: {}\n\n📊 Numbers remaining: {}\n\n{}",
    game_finished: "🎮 Game over! All numbers found!\n\nContact the bot to start a new game.",
    wrong_guess: "❌ WRONG!\n\n👤 User: {} (@{})\n🔢 Your number: {}\n\nTry again! (1-{})\n📊 Numbers remaining: {}",
    sos_message: "🆘 HELP\n\nIf you have any problems, contact the administrator, they will help you!",
    admin_btn: "👤 Admin",
    developer_btn: "👨‍💻 Developer",
    back_to_menu: "🔙 Main Menu",
    back_to_admin: "🔙 Admin Panel",
    back_to_channels: "🔙 Channels",
    no_username: "no username",
  },
}

// Helper functions
function formatText(template, ...args) {
  let result = template
  args.forEach((arg) => {
    result = result.replace("{}", arg)
  })
  return result
}

function getUserLanguage(ctx) {
  if (ctx.session && ctx.session.language) {
    return ctx.session.language
  }
  const userId = ctx.from?.id
  if (userId && userPrefs[userId] && userPrefs[userId].language) {
    return userPrefs[userId].language
  }
  return "uz"
}

function getText(ctx, key, ...args) {
  const lang = getUserLanguage(ctx)
  const text = TRANSLATIONS[lang][key] || TRANSLATIONS["uz"][key]
  return formatText(text, ...args)
}

function setUserLanguage(userId, language, ctx) {
  if (ctx.session) {
    ctx.session.language = language
  }
  if (!userPrefs[userId]) {
    userPrefs[userId] = {}
  }
  userPrefs[userId].language = language
  saveData()
  log.info(`User ${userId} language changed to: ${language}`)
}

function getUserStats(userId) {
  if (!userStats[userId]) {
    userStats[userId] = {
      games_played: 0,
      wins: 0,
    }
  }
  return userStats[userId]
}

function isAdmin(userId) {
  return userId === ADMIN_ID
}

// File operations
async function loadChannels() {
  try {
    const data = await fs.readFile(CHANNELS_FILE, "utf8")
    const parsed = JSON.parse(data)
    if (Array.isArray(parsed)) {
      requiredChannels = parsed
    } else if (parsed.channels && Array.isArray(parsed.channels)) {
      requiredChannels = parsed.channels
    } else {
      requiredChannels = []
    }
    log.info(`Loaded ${requiredChannels.length} channels`)
  } catch (error) {
    log.warning(`Failed to load channels: ${error.message}`)
    requiredChannels = ["@SavdoGuruhlar"]
    await saveChannels()
  }
}

async function saveChannels() {
  try {
    await fs.writeFile(CHANNELS_FILE, JSON.stringify(requiredChannels, null, 2))
    log.info(`Saved ${requiredChannels.length} channels`)
  } catch (error) {
    log.error(`Failed to save channels: ${error.message}`)
  }
}

async function loadUsers() {
  try {
    const data = await fs.readFile(USERS_FILE, "utf8")
    allUsers = new Set(JSON.parse(data))
    log.info(`Loaded ${allUsers.size} users`)
  } catch (error) {
    log.warning(`Failed to load users: ${error.message}`)
    allUsers = new Set()
  }
}

async function saveUsers() {
  try {
    await fs.writeFile(USERS_FILE, JSON.stringify([...allUsers], null, 2))
  } catch (error) {
    log.error(`Failed to save users: ${error.message}`)
  }
}

async function loadStats() {
  try {
    const data = await fs.readFile(STATS_FILE, "utf8")
    userStats = JSON.parse(data)
    log.info(`Loaded stats for ${Object.keys(userStats).length} users`)
  } catch (error) {
    log.warning(`Failed to load stats: ${error.message}`)
    userStats = {}
  }
}

async function saveStats() {
  try {
    await fs.writeFile(STATS_FILE, JSON.stringify(userStats, null, 2))
  } catch (error) {
    log.error(`Failed to save stats: ${error.message}`)
  }
}

async function loadUserPrefs() {
  try {
    const data = await fs.readFile(USER_PREFS_FILE, "utf8")
    userPrefs = JSON.parse(data)
    log.info(`Loaded preferences for ${Object.keys(userPrefs).length} users`)
  } catch (error) {
    log.warning(`Failed to load user prefs: ${error.message}`)
    userPrefs = {}
  }
}

async function saveUserPrefs() {
  try {
    await fs.writeFile(USER_PREFS_FILE, JSON.stringify(userPrefs, null, 2))
  } catch (error) {
    log.error(`Failed to save user prefs: ${error.message}`)
  }
}

async function saveData() {
  await Promise.all([saveUsers(), saveStats(), saveChannels(), saveUserPrefs()])
}

// Check subscription
async function checkSubscription(ctx, userId) {
  const notSubscribed = []

  for (const channel of requiredChannels) {
    try {
      const member = await ctx.telegram.getChatMember(channel, userId)
      if (["left", "kicked"].includes(member.status)) {
        notSubscribed.push(channel)
      }
    } catch (error) {
      log.error(`Error checking channel ${channel}: ${error.message}`)
      notSubscribed.push(channel)
    }
  }

  return {
    isSubscribed: notSubscribed.length === 0,
    notSubscribed,
  }
}

// Main bot setup
async function main() {
  if (!BOT_TOKEN || BOT_TOKEN === "YOUR_BOT_TOKEN_HERE") {
    console.error("❌ Error: BOT_TOKEN not set!")
    console.error("Please set BOT_TOKEN in .env file or environment variable.")
    console.error("\nRequired environment variables:")
    console.error("  - BOT_TOKEN: Telegram bot token")
    console.error("  - ADMIN_ID: Admin user ID (default: 123456789)")
    process.exit(1)
  }

  // Load data
  await Promise.all([loadChannels(), loadUsers(), loadStats(), loadUserPrefs()])

  const bot = new Telegraf(BOT_TOKEN)

  // Session middleware
  bot.use(
    session({
      defaultSession: () => ({}),
    }),
  )

  // Start command
  bot.start(async (ctx) => {
    const user = ctx.from
    allUsers.add(user.id)
    await saveData()

    if (!ctx.session.language) {
      const keyboard = Markup.inlineKeyboard([
        [Markup.button.callback("🇺🇿 O'zbekcha", "lang_uz"), Markup.button.callback("🇷🇺 Русский", "lang_ru")],
        [Markup.button.callback("🇬🇧 English", "lang_en")],
      ])

      return ctx.reply(
        `👋 Assalomu alaykum / Здравствуйте / Hello, ${user.first_name}!\n\n` +
          "🌐 Tilni tanlang / Выберите язык / Select language:",
        keyboard,
      )
    } else {
      return checkAndProceed(ctx)
    }
  })

  // Language selection
  bot.action(/^lang_(uz|ru|en)$/, async (ctx) => {
    const lang = ctx.match[1]
    setUserLanguage(ctx.from.id, lang, ctx)

    const langNames = {
      uz: "O'zbekcha 🇺🇿",
      ru: "Русский 🇷🇺",
      en: "English 🇬🇧",
    }

    await ctx.editMessageText(`✅ ${getText(ctx, "language_selected")}\n\n🌐 ${langNames[lang]}`)

    setTimeout(() => checkAndProceedCallback(ctx), 1000)
  })

  // Check subscription
  async function checkAndProceed(ctx) {
    const user = ctx.from
    const { isSubscribed, notSubscribed } = await checkSubscription(ctx, user.id)

    if (!isSubscribed) {
      const buttons = notSubscribed.map((channel) => [
        Markup.button.url(`📢 ${channel}`, `https://t.me/${channel.substring(1)}`),
      ])
      buttons.push([Markup.button.callback(getText(ctx, "check_subscription_btn"), "check_subscription")])

      return ctx.reply(getText(ctx, "subscribe_prompt", user.first_name), Markup.inlineKeyboard(buttons))
    } else {
      return showMainMenu(ctx)
    }
  }

  async function checkAndProceedCallback(ctx) {
    const user = ctx.from
    const { isSubscribed, notSubscribed } = await checkSubscription(ctx, user.id)

    if (!isSubscribed) {
      const buttons = notSubscribed.map((channel) => [
        Markup.button.url(`📢 ${channel}`, `https://t.me/${channel.substring(1)}`),
      ])
      buttons.push([Markup.button.callback(getText(ctx, "check_subscription_btn"), "check_subscription")])

      return ctx.reply(getText(ctx, "subscribe_prompt", user.first_name), Markup.inlineKeyboard(buttons))
    } else {
      return showMainMenuCallback(ctx)
    }
  }

  bot.action("check_subscription", async (ctx) => {
    await ctx.answerCbQuery()
    const { isSubscribed } = await checkSubscription(ctx, ctx.from.id)

    if (isSubscribed) {
      await ctx.deleteMessage()
      return showMainMenuCallback(ctx)
    } else {
      return ctx.answerCbQuery(getText(ctx, "not_subscribed_alert"), { show_alert: true })
    }
  })

  // Main menu
  async function showMainMenu(ctx) {
    const langNames = {
      uz: "O'zbekcha 🇺🇿",
      ru: "Русский 🇷🇺",
      en: "English 🇬🇧",
    }
    const currentLang = getUserLanguage(ctx)

    const keyboard = [
      [Markup.button.callback(getText(ctx, "start_game_btn"), "start_game")],
      [Markup.button.callback(getText(ctx, "cabinet_btn"), "cabinet")],
      [Markup.button.callback(getText(ctx, "sos_btn"), "sos")],
      [Markup.button.callback(`${getText(ctx, "change_language_btn")} (${langNames[currentLang]})`, "change_lang")],
    ]

    if (isAdmin(ctx.from.id)) {
      keyboard.splice(2, 0, [Markup.button.callback(getText(ctx, "admin_panel_btn"), "admin_panel")])
    }

    return ctx.reply(getText(ctx, "main_menu_title"), Markup.inlineKeyboard(keyboard))
  }

  async function showMainMenuCallback(ctx) {
    const langNames = {
      uz: "O'zbekcha 🇺🇿",
      ru: "Русский 🇷🇺",
      en: "English 🇬🇧",
    }
    const currentLang = getUserLanguage(ctx)

    const keyboard = [
      [Markup.button.callback(getText(ctx, "start_game_btn"), "start_game")],
      [Markup.button.callback(getText(ctx, "cabinet_btn"), "cabinet")],
      [Markup.button.callback(getText(ctx, "sos_btn"), "sos")],
      [Markup.button.callback(`${getText(ctx, "change_language_btn")} (${langNames[currentLang]})`, "change_lang")],
    ]

    if (isAdmin(ctx.from.id)) {
      keyboard.splice(2, 0, [Markup.button.callback(getText(ctx, "admin_panel_btn"), "admin_panel")])
    }

    return ctx.reply(getText(ctx, "main_menu_title"), Markup.inlineKeyboard(keyboard))
  }

  bot.action("main_menu", async (ctx) => {
    await ctx.answerCbQuery()
    await ctx.deleteMessage()
    return showMainMenu(ctx)
  })

  // Cabinet
  bot.action("cabinet", async (ctx) => {
    await ctx.answerCbQuery()
    const user = ctx.from
    const stats = getUserStats(user.id)
    const lang = getUserLanguage(ctx)

    const langNames = {
      uz: "O'zbekcha 🇺🇿",
      ru: "Русский 🇷🇺",
      en: "English 🇬🇧",
    }

    const text = getText(
      ctx,
      "cabinet_info",
      user.id,
      user.first_name,
      user.username || "yo'q",
      langNames[lang],
      stats.games_played,
      stats.wins,
    )

    return ctx.editMessageText(
      text,
      Markup.inlineKeyboard([[Markup.button.callback(getText(ctx, "back_to_menu"), "main_menu")]]),
    )
  })

  // SOS
  bot.action("sos", async (ctx) => {
    await ctx.answerCbQuery()
    return ctx.editMessageText(
      getText(ctx, "sos_message"),
      Markup.inlineKeyboard([
        [Markup.button.url(getText(ctx, "admin_btn"), "https://t.me/MamurZokirov")],
        [Markup.button.url(getText(ctx, "developer_btn"), "https://t.me/MamurZokirov")],
        [Markup.button.callback(getText(ctx, "back_to_menu"), "main_menu")],
      ]),
    )
  })

  // Change language
  bot.action("change_lang", async (ctx) => {
    await ctx.answerCbQuery()
    const currentLang = getUserLanguage(ctx)

    return ctx.editMessageText(
      "🌐 Tilni tanlang / Выберите язык / Select language:",
      Markup.inlineKeyboard([
        [
          Markup.button.callback(`${currentLang === "uz" ? "✅ " : ""}🇺🇿 O'zbekcha`, "lang_uz"),
          Markup.button.callback(`${currentLang === "ru" ? "✅ " : ""}🇷🇺 Русский`, "lang_ru"),
        ],
        [Markup.button.callback(`${currentLang === "en" ? "✅ " : ""}🇬🇧 English`, "lang_en")],
        [Markup.button.callback(getText(ctx, "back_to_menu"), "main_menu")],
      ]),
    )
  })

  // Admin panel
  bot.action("admin_panel", async (ctx) => {
    await ctx.answerCbQuery()
    if (!isAdmin(ctx.from.id)) {
      return ctx.answerCbQuery("❌ Sizda ruxsat yo'q!", { show_alert: true })
    }

    return ctx.editMessageText(
      getText(ctx, "admin_panel_title"),
      Markup.inlineKeyboard([
        [Markup.button.callback(getText(ctx, "statistics_btn"), "admin_stats")],
        [Markup.button.callback(getText(ctx, "broadcast_btn"), "admin_broadcast")],
        [Markup.button.callback(getText(ctx, "channels_btn"), "admin_channels")],
        [Markup.button.callback(getText(ctx, "users_list_btn"), "admin_users")],
        [Markup.button.callback(getText(ctx, "active_games_btn"), "admin_games")],
        [Markup.button.callback(getText(ctx, "back_to_menu"), "main_menu")],
      ]),
    )
  })

  // Admin stats
  bot.action("admin_stats", async (ctx) => {
    await ctx.answerCbQuery()
    if (!isAdmin(ctx.from.id)) {
      return ctx.answerCbQuery("❌ Sizda ruxsat yo'q!", { show_alert: true })
    }

    const totalUsers = allUsers.size
    const totalGames = Object.values(userStats).reduce((sum, s) => sum + s.games_played, 0)
    const totalWins = Object.values(userStats).reduce((sum, s) => sum + s.wins, 0)
    const activeGamesCount = Object.keys(activeGames).length
    const channelsCount = requiredChannels.length
    const currentTime = new Date().toLocaleString()

    const text = getText(
      ctx,
      "statistics_text",
      totalUsers,
      totalGames,
      totalWins,
      activeGamesCount,
      channelsCount,
      currentTime,
    )

    return ctx.editMessageText(
      text,
      Markup.inlineKeyboard([[Markup.button.callback(getText(ctx, "back_to_admin"), "admin_panel")]]),
    )
  })

  // Admin users
  bot.action("admin_users", async (ctx) => {
    await ctx.answerCbQuery()
    if (!isAdmin(ctx.from.id)) {
      return ctx.answerCbQuery("❌ Sizda ruxsat yo'q!", { show_alert: true })
    }

    const usersArray = [...allUsers].slice(0, 20)
    const usersInfo = usersArray
      .map((userId, idx) => {
        const stats = getUserStats(userId)
        return `${idx + 1}. ID: ${userId} | 🎮 ${stats.games_played} | 🏆 ${stats.wins}`
      })
      .join("\n")

    const text = getText(ctx, "users_list_text", allUsers.size, usersInfo || "Foydalanuvchilar yo'q")

    return ctx.editMessageText(
      text,
      Markup.inlineKeyboard([[Markup.button.callback(getText(ctx, "back_to_admin"), "admin_panel")]]),
    )
  })

  // Admin games
  bot.action("admin_games", async (ctx) => {
    await ctx.answerCbQuery()
    if (!isAdmin(ctx.from.id)) {
      return ctx.answerCbQuery("❌ Sizda ruxsat yo'q!", { show_alert: true })
    }

    let text
    if (Object.keys(activeGames).length === 0) {
      text = getText(ctx, "no_active_games")
    } else {
      const gamesInfo = Object.entries(activeGames)
        .map(([groupId, game], idx) => {
          return (
            `${idx + 1}. Guruh ID: ${groupId}\n` +
            `   Son: 1-${game.max_number}\n` +
            `   Nechta son: ${game.count}\n` +
            `   Boshlagan: @${game.creator_username}`
          )
        })
        .join("\n\n")

      text = getText(ctx, "active_games_text", Object.keys(activeGames).length, gamesInfo)
    }

    return ctx.editMessageText(
      text,
      Markup.inlineKeyboard([[Markup.button.callback(getText(ctx, "back_to_admin"), "admin_panel")]]),
    )
  })

  // Admin channels
  bot.action("admin_channels", async (ctx) => {
    await ctx.answerCbQuery()
    if (!isAdmin(ctx.from.id)) {
      return ctx.answerCbQuery("❌ Sizda ruxsat yo'q!", { show_alert: true })
    }

    const channelsList = requiredChannels.map((ch, idx) => `${idx + 1}. ${ch}`).join("\n")
    const text = getText(ctx, "channels_list_text", requiredChannels.length, channelsList)

    return ctx.editMessageText(
      text,
      Markup.inlineKeyboard([
        [Markup.button.callback(getText(ctx, "add_channel_btn"), "admin_add_channel")],
        [Markup.button.callback(getText(ctx, "remove_channel_btn"), "admin_remove_channel")],
        [Markup.button.callback(getText(ctx, "back_to_admin"), "admin_panel")],
      ]),
    )
  })

  // Broadcast
  bot.action("admin_broadcast", async (ctx) => {
    await ctx.answerCbQuery()
    if (!isAdmin(ctx.from.id)) {
      return ctx.answerCbQuery("❌ Sizda ruxsat yo'q!", { show_alert: true })
    }

    ctx.session.waitingFor = WAITING_FOR_BROADCAST
    return ctx.reply(getText(ctx, "broadcast_prompt"))
  })

  // Add channel
  bot.action("admin_add_channel", async (ctx) => {
    await ctx.answerCbQuery()
    if (!isAdmin(ctx.from.id)) {
      return ctx.answerCbQuery("❌ Sizda ruxsat yo'q!", { show_alert: true })
    }

    ctx.session.waitingFor = WAITING_FOR_CHANNEL_ADD
    return ctx.reply(getText(ctx, "add_channel_prompt"))
  })

  // Remove channel
  bot.action("admin_remove_channel", async (ctx) => {
    await ctx.answerCbQuery()
    if (!isAdmin(ctx.from.id)) {
      return ctx.answerCbQuery("❌ Sizda ruxsat yo'q!", { show_alert: true })
    }

    const channelsList = requiredChannels.map((ch, idx) => `${idx + 1}. ${ch}`).join("\n")
    ctx.session.waitingFor = WAITING_FOR_CHANNEL_REMOVE
    return ctx.reply(getText(ctx, "remove_channel_prompt", channelsList))
  })

  // Start game
  bot.action("start_game", async (ctx) => {
    await ctx.answerCbQuery()
    ctx.session.waitingFor = WAITING_FOR_GROUP
    ctx.session.gameData = {}
    return ctx.reply(getText(ctx, "game_start_prompt"))
  })

  // Cancel command
  bot.command("cancel", async (ctx) => {
    if (ctx.session.waitingFor) {
      ctx.session.waitingFor = null
      ctx.session.gameData = null
      return ctx.reply(getText(ctx, "game_cancelled"))
    }
  })

  // Handle text messages (conversations)
  bot.on("text", async (ctx) => {
    if (!ctx.session.waitingFor) return

    const state = ctx.session.waitingFor

    // Broadcast
    if (state === WAITING_FOR_BROADCAST && isAdmin(ctx.from.id)) {
      let successCount = 0
      let failedCount = 0

      for (const userId of allUsers) {
        try {
          await ctx.telegram.copyMessage(userId, ctx.chat.id, ctx.message.message_id)
          successCount++
        } catch (error) {
          log.error(`Failed to send to ${userId}: ${error.message}`)
          failedCount++
        }
      }

      ctx.session.waitingFor = null
      if (failedCount > 0) {
        return ctx.reply(getText(ctx, "broadcast_failed", successCount, failedCount))
      } else {
        return ctx.reply(getText(ctx, "broadcast_success", successCount))
      }
    }

    // Add channel
    if (state === WAITING_FOR_CHANNEL_ADD && isAdmin(ctx.from.id)) {
      const channel = ctx.message.text.trim()

      if (!channel.startsWith("@")) {
        return ctx.reply(getText(ctx, "invalid_channel"))
      }

      if (requiredChannels.includes(channel)) {
        ctx.session.waitingFor = null
        return ctx.reply(getText(ctx, "channel_exists"))
      }

      requiredChannels.push(channel)
      await saveData()
      ctx.session.waitingFor = null
      return ctx.reply(getText(ctx, "channel_added", channel))
    }

    // Remove channel
    if (state === WAITING_FOR_CHANNEL_REMOVE && isAdmin(ctx.from.id)) {
      const num = Number.parseInt(ctx.message.text.trim())

      if (isNaN(num) || num < 1 || num > requiredChannels.length) {
        return ctx.reply(getText(ctx, "invalid_channel_number"))
      }

      requiredChannels.splice(num - 1, 1)
      await saveData()
      ctx.session.waitingFor = null
      return ctx.reply(getText(ctx, "channel_removed"))
    }

    // Game: waiting for group
    if (state === WAITING_FOR_GROUP) {
      const groupLink = ctx.message.text.trim()
      let groupUsername

      if (groupLink.startsWith("@")) {
        groupUsername = groupLink
      } else if (groupLink.includes("t.me/")) {
        const parts = groupLink.split("t.me/")[1].split("/")[0]
        groupUsername = parts.startsWith("@") ? parts : "@" + parts
      } else {
        groupUsername = "@" + groupLink
      }

      try {
        const chat = await ctx.telegram.getChat(groupUsername)
        const botMember = await ctx.telegram.getChatMember(chat.id, ctx.botInfo.id)

        if (!["administrator", "creator"].includes(botMember.status)) {
          return ctx.reply(getText(ctx, "bot_not_admin"))
        }

        ctx.session.gameData = {
          groupId: chat.id,
          groupUsername,
          groupTitle: chat.title,
        }
        ctx.session.waitingFor = WAITING_FOR_MAX_NUMBER
        return ctx.reply(getText(ctx, "group_found", chat.title))
      } catch (error) {
        log.error(`Group check error: ${error.message}`)
        return ctx.reply(getText(ctx, "group_not_found"))
      }
    }

    // Game: waiting for max number
    if (state === WAITING_FOR_MAX_NUMBER) {
      const maxNumber = Number.parseInt(ctx.message.text.trim())

      if (isNaN(maxNumber) || maxNumber < 2) {
        return ctx.reply(getText(ctx, "number_too_small"))
      }

      ctx.session.gameData.maxNumber = maxNumber
      ctx.session.waitingFor = WAITING_FOR_COUNT
      return ctx.reply(getText(ctx, "ask_count", maxNumber, maxNumber, maxNumber))
    }

    // Game: waiting for count
    if (state === WAITING_FOR_COUNT) {
      const count = Number.parseInt(ctx.message.text.trim())
      const maxNumber = ctx.session.gameData.maxNumber

      if (isNaN(count) || count < 1) {
        return ctx.reply(getText(ctx, "count_too_small"))
      }

      if (count > maxNumber) {
        return ctx.reply(getText(ctx, "count_too_large"))
      }

      // Generate random numbers
      const secretNumbers = []
      const available = Array.from({ length: maxNumber }, (_, i) => i + 1)
      for (let i = 0; i < count; i++) {
        const idx = Math.floor(Math.random() * available.length)
        secretNumbers.push(available[idx])
        available.splice(idx, 1)
      }

      const gameData = ctx.session.gameData
      const creatorLanguage = getUserLanguage(ctx)

      activeGames[gameData.groupId] = {
        secret_numbers: secretNumbers,
        remaining_numbers: [...secretNumbers],
        max_number: maxNumber,
        count,
        creator: ctx.from.id,
        creator_username: ctx.from.username || ctx.from.first_name,
        language: creatorLanguage,
      }

      const stats = getUserStats(ctx.from.id)
      stats.games_played++
      await saveData()

      await ctx.reply(getText(ctx, "game_started_user", gameData.groupUsername, maxNumber, count))
      await ctx.telegram.sendMessage(
        gameData.groupId,
        getText(ctx, "game_started_group", count, maxNumber, activeGames[gameData.groupId].creator_username, count),
      )

      ctx.session.waitingFor = null
      ctx.session.gameData = null
    }
  })

  // Handle group messages (game logic)
  bot.on("message", async (ctx, next) => {
    if (ctx.chat.type === "private") return next()
    if (!ctx.message.text) return

    const chatId = ctx.chat.id
    if (!activeGames[chatId]) return

    const userGuess = Number.parseInt(ctx.message.text.trim())
    if (isNaN(userGuess)) return

    const game = activeGames[chatId]
    const gameLang = game.language || "uz"

    if (game.remaining_numbers.includes(userGuess)) {
      // Winner!
      const winner = ctx.from
      const stats = getUserStats(winner.id)
      stats.wins++
      await saveData()

      const idx = game.remaining_numbers.indexOf(userGuess)
      game.remaining_numbers.splice(idx, 1)

      if (game.remaining_numbers.length === 0) {
        await ctx.reply(
          formatText(
            TRANSLATIONS[gameLang].win_message,
            winner.first_name,
            winner.username || TRANSLATIONS[gameLang].no_username,
            userGuess,
            0,
            TRANSLATIONS[gameLang].game_finished,
          ),
        )
        delete activeGames[chatId]
      } else {
        const continueMessages = {
          uz: `Davom eting! Yana ${game.remaining_numbers.length} ta son qoldi!`,
          ru: `Продолжайте! Осталось еще ${game.remaining_numbers.length} чисел!`,
          en: `Continue! ${game.remaining_numbers.length} numbers remaining!`,
        }
        await ctx.reply(
          formatText(
            TRANSLATIONS[gameLang].win_message,
            winner.first_name,
            winner.username || TRANSLATIONS[gameLang].no_username,
            userGuess,
            game.remaining_numbers.length,
            continueMessages[gameLang] || continueMessages.uz,
          ),
        )
      }
    } else {
      await ctx.reply(
        formatText(
          TRANSLATIONS[gameLang].wrong_guess,
          ctx.from.first_name,
          ctx.from.username || TRANSLATIONS[gameLang].no_username,
          userGuess,
          game.max_number,
          game.remaining_numbers.length,
        ),
      )
    }
  })

  // Launch bot
  log.info("✅ Bot successfully started!")
  log.info(`📊 Loaded data:`)
  log.info(`   - Users: ${allUsers.size}`)
  log.info(`   - Channels: ${requiredChannels.length}`)
  log.info(`   - Admin ID: ${ADMIN_ID}`)

  bot.launch()

  // Enable graceful stop
  process.once("SIGINT", () => {
    log.info("Stopping bot...")
    bot.stop("SIGINT")
  })
  process.once("SIGTERM", () => {
    log.info("Stopping bot...")
    bot.stop("SIGTERM")
  })
}

main().catch((error) => {
  log.error(`Failed to start bot: ${error.message}`)
  console.error(error)
  process.exit(1)
})
