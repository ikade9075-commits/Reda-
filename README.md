# 🚀 Reda - Advanced Messaging App

## ✨ الإصدار 2.0.0 - المزايا المتقدمة

### 🔐 الأمان (Security)
- ✅ تشفير End-to-End (AES-256)
- ✅ مصادقة ثنائية (2FA) - Google Authenticator
- ✅ حذف الرسائل التلقائي بعد مدة محددة
- ✅ تشفير كلمات المرور (bcrypt)
- ✅ JWT tokens آمن

### 📞 مكالمات صوتية وفيديو (WebRTC)
- ✅ مكالمات فيديو P2P
- ✅ مكالمات صوتية
- ✅ تبديل الميكروفون والكاميرا
- ✅ ICE candidates للاتصال الفوري
- ✅ عرض الفيديو المحلي والبعيد

### 💾 النسخ الاحتياطي والتصدير
- ✅ تحميل كل المحادثات والرسائل
- ✅ تصدير البيانات كـ JSON
- ✅ استعادة النسخ الاحتياطية
- ✅ حفظ الملفات الشخصية

### 🌐 الاستضافة والنشر
- ✅ Heroku deployment ready
- ✅ Railway deployment ready
- ✅ Docker support
- ✅ Environment variables configured
- ✅ CI/CD ready

---

## 🛠️ التثبيت والتشغيل

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

---

## 📋 المتطلبات
- Node.js v14+
- MongoDB
- npm/yarn
- HTTPS certificate (للمكالمات)

---

## 🚀 النشر على Heroku
```bash
heroku login
heroku create your-app-name
git push heroku main
```

## 🚀 النشر على Railway
```bash
railway login
railway init
railway up
```

---

## 📊 الميزات

| الميزة | الحالة |
|--------|--------|
| Real-time Chat | ✅ |
| File Upload | ✅ |
| Video Calls | ✅ |
| Audio Calls | ✅ |
| End-to-End Encryption | ✅ |
| 2FA Authentication | ✅ |
| Message Backup | ✅ |
| Dark Mode | ✅ |
| Groups | ✅ |
| Message Delete/Edit | ✅ |
| Auto-delete Messages | ✅ |

---

## 🔑 المفاتيح الأمنية

 ضع في `.env`:
```
JWT_SECRET=your_secure_key_here
MONGODB_URI=mongodb://...
CORS_ORIGIN=http://localhost:3000
PORT=5000
```

---

## 📞 الدعم
للمساعدة أو الإبلاغ عن مشاكل، قم بإنشاء issue على GitHub.

---

**Made with ❤️ by ikade9075**
