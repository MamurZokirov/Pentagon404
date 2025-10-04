# 🚀 Serverga Joylashtirish (Deployment)

Bu qo'llanma Kazino Botni serverga qanday joylashtirishni tushuntiradi.

## 📋 Talab qilinadigan narsalar

- Linux server (Ubuntu 20.04+ tavsiya etiladi)
- Python 3.8 yoki yuqori
- Internet aloqasi
- SSH kirish huquqi
- Sudo huquqlari (ixtiyoriy, systemd uchun)

## 🔧 Serverga o'rnatish

### 1. Serverni yangilash

\`\`\`bash
sudo apt update
sudo apt upgrade -y
\`\`\`

### 2. Python va pip o'rnatish

\`\`\`bash
sudo apt install python3 python3-pip -y
\`\`\`

### 3. Botni serverga yuklash

**Git orqali:**
\`\`\`bash
git clone https://github.com/your-username/kazino-bot.git
cd kazino-bot
\`\`\`

**Yoki SCP orqali:**
\`\`\`bash
# Lokal kompyuterdan
scp -r kazino-bot/ user@server_ip:/home/user/
\`\`\`

### 4. Kutubxonalarni o'rnatish

\`\`\`bash
cd kazino-bot
pip3 install -r requirements.txt
\`\`\`

### 5. Environment o'zgaruvchilarini sozlash

\`\`\`bash
cp .env.example .env
nano .env
\`\`\`

`.env` faylida:
\`\`\`env
BOT_TOKEN=your_actual_bot_token
ADMIN_ID=your_telegram_id
\`\`\`

Saqlash: `Ctrl+O`, `Enter`, `Ctrl+X`

### 6. Ma'lumotlar papkasini yaratish

\`\`\`bash
mkdir -p data
chmod 755 data
\`\`\`

## 🏃 Botni ishga tushirish

### Variant 1: Screen bilan (oddiy)

\`\`\`bash
# Screen o'rnatish
sudo apt install screen -y

# Yangi screen sessiyasi yaratish
screen -S kazino-bot

# Botni ishga tushirish
python3 bot.py

# Screen'dan chiqish (bot ishlayveradi)
# Ctrl+A, keyin D

# Qaytish
screen -r kazino-bot

# Screen'ni to'xtatish
screen -X -S kazino-bot quit
\`\`\`

### Variant 2: Systemd service (professional)

**Service fayl yaratish:**
\`\`\`bash
sudo nano /etc/systemd/system/kazino-bot.service
\`\`\`

**Service fayl mazmuni:**
\`\`\`ini
[Unit]
Description=Kazino Telegram Bot
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/kazino-bot
Environment="BOT_TOKEN=your_bot_token_here"
Environment="ADMIN_ID=123456789"
ExecStart=/usr/bin/python3 /home/ubuntu/kazino-bot/bot.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
\`\`\`

**Eslatma:** `User`, `WorkingDirectory`, va `ExecStart` yo'llarini o'z serveringizga moslashtiring.

**Service'ni yoqish va ishga tushirish:**
\`\`\`bash
# Service'ni qayta yuklash
sudo systemctl daemon-reload

# Service'ni yoqish (server qayta ishga tushganda avtomatik ishga tushadi)
sudo systemctl enable kazino-bot

# Service'ni ishga tushirish
sudo systemctl start kazino-bot

# Statusni tekshirish
sudo systemctl status kazino-bot

# Log'larni ko'rish
sudo journalctl -u kazino-bot -f

# Service'ni to'xtatish
sudo systemctl stop kazino-bot

# Service'ni qayta ishga tushirish
sudo systemctl restart kazino-bot
\`\`\`

### Variant 3: Nohup bilan

\`\`\`bash
nohup python3 bot.py > bot.log 2>&1 &

# Process ID ni ko'rish
ps aux | grep bot.py

# To'xtatish
kill <process_id>
\`\`\`

## 🔍 Monitoring va Debugging

### Log'larni ko'rish

**Screen bilan:**
\`\`\`bash
screen -r kazino-bot
\`\`\`

**Systemd bilan:**
\`\`\`bash
sudo journalctl -u kazino-bot -f
\`\`\`

**Nohup bilan:**
\`\`\`bash
tail -f bot.log
\`\`\`

### Botni tekshirish

\`\`\`bash
# Bot ishlayotganini tekshirish
ps aux | grep bot.py

# Port tekshirish (agar kerak bo'lsa)
netstat -tulpn | grep python
\`\`\`

## 🔄 Yangilanishlar

### Kodni yangilash

\`\`\`bash
# Botni to'xtatish
sudo systemctl stop kazino-bot  # yoki screen -X -S kazino-bot quit

# Yangi kodni olish
git pull origin main

# Kutubxonalarni yangilash
pip3 install -r requirements.txt --upgrade

# Botni qayta ishga tushirish
sudo systemctl start kazino-bot  # yoki screen -S kazino-bot python3 bot.py
\`\`\`

## 🔒 Xavfsizlik

### Firewall sozlash

\`\`\`bash
# UFW o'rnatish
sudo apt install ufw -y

# SSH ruxsat berish
sudo ufw allow ssh

# Firewall yoqish
sudo ufw enable

# Status tekshirish
sudo ufw status
\`\`\`

### Fayllar huquqlarini sozlash

\`\`\`bash
# .env faylini faqat owner o'qishi mumkin
chmod 600 .env

# Bot fayllarini himoya qilish
chmod 755 bot.py
chmod 755 data/
\`\`\`

## 💾 Backup

### Ma'lumotlarni zaxiralash

\`\`\`bash
# Backup papkasi yaratish
mkdir -p ~/backups

# Ma'lumotlarni zaxiralash
tar -czf ~/backups/kazino-bot-$(date +%Y%m%d).tar.gz data/

# Eski backup'larni o'chirish (30 kundan eski)
find ~/backups -name "kazino-bot-*.tar.gz" -mtime +30 -delete
\`\`\`

### Avtomatik backup (cron)

\`\`\`bash
# Crontab ochish
crontab -e

# Har kuni soat 3:00 da backup
0 3 * * * tar -czf ~/backups/kazino-bot-$(date +\%Y\%m\%d).tar.gz ~/kazino-bot/data/
\`\`\`

## 🐛 Muammolarni hal qilish

### Bot ishlamayapti

1. **Log'larni tekshiring:**
\`\`\`bash
sudo journalctl -u kazino-bot -n 50
\`\`\`

2. **Environment o'zgaruvchilarni tekshiring:**
\`\`\`bash
cat .env
\`\`\`

3. **Python versiyasini tekshiring:**
\`\`\`bash
python3 --version
\`\`\`

4. **Kutubxonalar o'rnatilganligini tekshiring:**
\`\`\`bash
pip3 list | grep telegram
\`\`\`

### Ma'lumotlar saqlanmayapti

1. **data/ papkasi mavjudligini tekshiring:**
\`\`\`bash
ls -la data/
\`\`\`

2. **Yozish huquqlarini tekshiring:**
\`\`\`bash
chmod 755 data/
\`\`\`

3. **Disk bo'sh joyini tekshiring:**
\`\`\`bash
df -h
\`\`\`

### Bot sekin ishlayapti

1. **Server resurslarini tekshiring:**
\`\`\`bash
top
htop  # agar o'rnatilgan bo'lsa
\`\`\`

2. **Xotira ishlatilishini tekshiring:**
\`\`\`bash
free -h
\`\`\`

## 📊 Performance Optimization

### Swap qo'shish (agar RAM kam bo'lsa)

\`\`\`bash
# 2GB swap yaratish
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Doimiy qilish
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
\`\`\`

## 🎯 Tavsiyalar

1. **Screen yoki systemd ishlatish** - Bot doimiy ishlashi uchun
2. **Log'larni kuzatish** - Muammolarni tezda topish uchun
3. **Backup olish** - Ma'lumotlarni yo'qotmaslik uchun
4. **Firewall sozlash** - Xavfsizlik uchun
5. **Yangilanishlarni tekshirish** - Xavfsizlik va yangi funksiyalar uchun

## 📞 Yordam

Muammolar bo'lsa:
- Telegram: [@MamurZokirov](https://t.me/MamurZokirov)
- Log'larni yuboring: `sudo journalctl -u kazino-bot -n 100 > logs.txt`

---

**Muvaffaqiyatli deployment! 🚀**
