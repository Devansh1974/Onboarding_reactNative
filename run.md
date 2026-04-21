# WingMann Running Guide 🚀

Follow these steps to start your development environment.

## 1. Start the Backend Server
Open a new terminal and run:
```bash
cd backend
npm start
```
*The server will log "✅ MongoDB connected successfully" and "🚀 WingMann Backend running on http://0.0.0.0:8001".*

## 2. Start the Frontend (Mobile App)
Open a separate terminal and run:
```bash
cd frontend
npm start -- -c
```
*The `-c` flag is **REQUIRED** every time you change a configuration or network setting. It clears the Metro cache.*

---

## 🛠 What to do if you change Wi-Fi
If you change your Wi-Fi network, your phone will lose connection to your computer. Follow these steps to fix it:

### Step 1: Find your current LAN IP
Run this command in your Mac terminal:
```bash
ipconfig getifaddr en0
```
*(Common result: `192.168.1.XX`)*

### Step 2: Update the Environment File
Open `frontend/.env`.
Update the `EXPO_PUBLIC_BACKEND_URL` with your new IP:
```env
EXPO_PUBLIC_BACKEND_URL=http://<YOUR_NEW_IP>:8001
```

### Step 3: Restart Expo
Go to your frontend terminal, press `Ctrl + C` to stop the old server, then run:
```bash
npm start -- -c
```
*Scan the new QR code with your phone and you are good to go!*
