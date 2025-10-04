# Admin Panel Qo'llanma

## Admin ID ni o'rnatish

1. `bot.py` faylini oching
2. 18-qatorda `ADMIN_ID` ni o'z Telegram ID ingizga o'zgartiring:

\`\`\`python
ADMIN_ID = 123456789  # BU YERGA O'Z TELEGRAM ID INGIZNI KIRITING!
\`\`\`

### Telegram ID ni qanday topish mumkin?

1. [@userinfobot](https://t.me/userinfobot) botiga /start yuboring
2. Bot sizga ID ingizni yuboradi
3. Shu ID ni `ADMIN_ID` ga kiriting

## Admin Panel Funksiyalari

### 1. Statistika
- Jami foydalanuvchilar soni
- Jami o'yinlar soni
- Jami g'alabalar soni
- Faol o'yinlar soni
- Joriy vaqt

### 2. Foydalanuvchilar Ro'yxati
- Barcha foydalanuvchilar ID si
- Har bir foydalanuvchining o'yinlar va g'alabalar soni
- Maksimal 20 ta foydalanuvchi ko'rsatiladi

### 3. Faol O'yinlar
- Hozirda qaysi guruhlarda o'yin borligini ko'rish
- Har bir o'yinning maksimal soni
- O'yinni kim boshlaganini ko'rish

### 4. Xabar Yuborish (Broadcast)
- Barcha foydalanuvchilarga bir vaqtning o'zida xabar yuborish
- Yangiliklar, e'lonlar va boshqa ma'lumotlarni tarqatish
- /cancel buyrug'i bilan bekor qilish mumkin

## Xavfsizlik

- Admin panel faqat siz uchun ko'rinadi
- Boshqa foydalanuvchilar admin tugmasini ko'rmaydi
- Admin funksiyalariga faqat siz kirish huquqiga egasiz
- Agar boshqa odam admin panel tugmasini bosishga harakat qilsa, "Sizda ruxsat yo'q!" xabari chiqadi

## Foydalanish

1. Botga /start yuboring
2. Asosiy menyuda "Admin Panel" tugmasi paydo bo'ladi
3. Admin panelga kiring va kerakli funksiyani tanlang
4. "Asosiy Menyu" tugmasi orqali qaytishingiz mumkin
