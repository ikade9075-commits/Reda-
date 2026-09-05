# 🚀 دليل التثبيت والبدء

## المتطلبات

- Node.js (v14+)
- MongoDB (محلي أو Atlas)
- npm أو yarn

## التثبيت

### 1. استنساخ المستودع

```bash
git clone https://github.com/ikade9075-commits/Reda-.git
cd Reda-
```

### 2. تثبيت البيئة الخلفية (Backend)

```bash
cd backend
cp .env.example .env
npm install
```

**تعديل `.env`:**
- ضع `MONGODB_URI` الخاص بك
- عيّن `JWT_SECRET`

### 3. تثبيت الواجهة (Frontend)

```bash
cd ../frontend
npm install
```

## بدء التطبيق

### تشغيل البيئة الخلفية

```bash
cd backend
npm run dev
```

سيعمل على: `http://localhost:5000`

### تشغيل الواجهة

```bash
cd frontend
npm start
```

سيفتح: `http://localhost:3000`

## البنية

```
Reda-/
├── backend/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
└── README.md
```

## API Endpoints

### Auth
- `POST /api/auth/register` - تسجيل حساب
- `POST /api/auth/login` - تسجيل الدخول

### Users
- `GET /api/users` - جميع المستخدمين
- `GET /api/users/:id` - مستخدم معين
- `GET /api/users/search/:query` - البحث

### Messages
- `GET /api/messages/conversation/:conversationId` - رسائل محادثة
- `POST /api/messages` - إرسال رسالة

### Conversations
- `GET /api/conversations/user/:userId` - محادثات المستخدم
- `POST /api/conversations` - إنشاء محادثة

## Socket.io Events

- `user_joined` - المستخدم انضم
- `send_message` - إرسال رسالة
- `receive_message` - استقبال رسالة
- `typing` - يكتب الآن
- `user_status` - حالة المستخدم
- `disconnect` - قطع الاتصال

---

**ملاحظة:** تأكد من تشغيل MongoDB قبل بدء السيرفر!
