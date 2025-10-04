# 🚀 Kazino Bot - To'liq O'rnatish Qo'llanmasi

## 1️⃣ Telegram Bot Yaratish

### BotFather orqali bot yaratish:

1. Telegram'da [@BotFather](https://t.me/BotFather) ni oching
2. `/start` komandasi bilan botni ishga tushiring
3. `/newbot` komandasi bilan yangi bot yarating
4. Bot uchun nom kiriting (masalan: "Mening Kazino Botim")
5. Bot uchun username kiriting (masalan: "my_kazino_bot")
6. BotFather sizga token beradi, uni saqlang!

**Token misoli:** `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`

## 2️⃣ Kanallar Yaratish

Bot uchun 4 ta kanal yarating:

1. Telegram'da yangi kanal yarating
2. Kanal turini "Public" qiling
3. Kanal uchun username o'rnating (masalan: @mykazinochannel1)
4. Bu jarayonni 4 marta takrorlang

**Eslatma:** Kanal username'larini yozib oling!

## 3️⃣ Botni Kanalga Admin Qilish

Har bir kanal uchun:

1. Kanalga kiring
2. Kanal sozlamalarini oching
3. "Administrators" bo'limiga o'ting
4. "Add Administrator" tugmasini bosing
5. Botingizni qidiring va admin qiling
6. Kerakli huquqlarni bering (kamida "Post Messages")

## 4️⃣ Loyihani O'rnatish

### Python o'rnatish (agar o'rnatilmagan bo'lsa):

**Windows:**
- [python.org](https://python.org) dan Python 3.8+ ni yuklab oling
- O'rnatishda "Add Python to PATH" ni belgilang

**Linux/Mac:**
\`\`\`bash
# Python versiyasini tekshirish
python3 --version

# Agar yo'q bo'lsa, o'rnatish
sudo apt update
sudo apt install python3 python3-pip
\`\`\`

### Loyihani sozlash:

1. **Fayllarni yuklab oling** (yoki nusxalang)

2. **Terminal/CMD ni oching** va loyiha papkasiga o'ting:
\`\`\`bash
cd path/to/kazino-bot
\`\`\`

3. **Virtual environment yarating** (tavsiya etiladi):
\`\`\`bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/Mac
python3 -m venv venv
source venv/bin/activate
\`\`\`

4. **Kerakli kutubxonalarni o'rnating:**
\`\`\`bash
pip install -r requirements.txt
\`\`\`

## 5️⃣ Botni Sozlash

### .env faylini yaratish:

1. `.env.example` faylini `.env` ga nusxalang
2. `.env` faylini oching va tokenni kiriting:

\`\`\`env
BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
\`\`\`

### Kanallarni sozlash:

`bot.py` faylini oching va `REQUIRED_CHANNELS` ro'yxatini o'zgartiring:

\`\`\`python
REQUIRED_CHANNELS = [
    "@mykazinochannel1",
    "@mykazinochannel2",
    "@mykazinochannel3",
    "@mykazinochannel4"
]
\`\`\`

## 6️⃣ Botni Ishga Tushirish

Terminal/CMD da:

\`\`\`bash
python bot.py
\`\`\`

Agar hammasi to'g'ri bo'lsa, ko'rasiz:
\`\`\`
INFO - Bot ishga tushmoqda...
\`\`\`

## 7️⃣ Botni Sinab Ko'rish

1. Telegram'da botingizni oching
2. `/start` komandasi bilan boshlang
3. Barcha kanallarga obuna bo'ling
4. "Obunani Tekshirish" tugmasini bosing
5. Asosiy menyu ochilishi kerak!

## 8️⃣ Guruhda O'yin O'ynash

### Guruh yaratish:

1. Telegram'da yangi guruh yarating
2. Guruhni "Public" qiling va username bering
3. Botni guruhga qo'shing
4. Botni admin qiling

### O'yin boshlash:

1. Botda "🕹 O'yin Boshlash" tugmasini bosing
2. Guruh linkini yuboring (masalan: @mygamegroup)
3. Maksimal sonni kiriting (masalan: 100)
4. Guruhda o'yin boshlanadi!

## 🔧 Muammolarni Hal Qilish

### "Bot token is invalid"
- Tokenni to'g'ri nusxalaganingizni tekshiring
- BotFather'dan yangi token oling

### "Bot is not an administrator"
- Botni guruh/kanalda admin qilganingizni tekshiring
- Botga kerakli huquqlar berganingizni tekshiring

### "Module not found"
- `pip install -r requirements.txt` ni qayta ishga tushiring
- Virtual environment faollashtirilganini tekshiring

### Bot javob bermayapti
- Bot ishlab turganini tekshiring (terminal ochiq bo'lishi kerak)
- Internet aloqangizni tekshiring
- Bot loglarini o'qing (terminal'dagi xabarlar)

## 🌐 Botni 24/7 Ishlatish

### Bepul hosting variantlari:

1. **PythonAnywhere** (bepul tier)
2. **Heroku** (bepul tier)
3. **Replit** (bepul tier)
4. **Railway** (bepul trial)

### VPS (tavsiya etiladi):

1. **DigitalOcean** ($5/oy)
2. **Linode** ($5/oy)
3. **Vultr** ($2.5/oy)

### Screen bilan ishlatish (Linux):

\`\`\`bash
# Screen sessiyasini boshlash
screen -S kazino_bot

# Botni ishga tushirish
python bot.py

# Screen'dan chiqish (bot ishlayveradi)
# Ctrl+A, keyin D

# Screen'ga qaytish
screen -r kazino_bot
\`\`\`

## 📞 Yordam

Qo'shimcha yordam kerak bo'lsa:
- Telegram: [@MamurZokirov](https://t.me/MamurZokirov)

---

**Muvaffaqiyatlar! 🎉**
