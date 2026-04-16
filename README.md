#  Tiệm Tóc Backend API

Backend cho hệ thống quản lý tiệm tóc, hỗ trợ đặt lịch, thanh toán online, quản lý dịch vụ, người dùng và nhiều tính năng nâng cao.

---

##  Công nghệ sử dụng

* **Node.js + Express**
* **MongoDB + Mongoose**
* **JWT Authentication**
* **Cloudinary** (upload ảnh)
* **VNPay** (thanh toán online)
* **Nodemailer** (gửi email OTP)
* **Node-cache** (lưu OTP)
* **Multer** (upload file)
* **Joi** (validate dữ liệu)
* **Cron Job** (tự động xử lý)

---

## 📦 Cài đặt

### 1. Clone project

```bash
git clone https://github.com/your-username/tiemtoc_be.git
cd tiemtoc_be
```

### 2. Cài dependencies

```bash
npm install
```

### 3. Tạo file `.env`

```env
HOST=localhost
PORT=5000
JWT_SECRET_KEY=your_secret_key
JWT_REFRESH_SECRET_KEY=your_refresh_secret_key
ACCESS_TOKEN_EXPIRES_IN=
REFRESH_TOKEN_EXPIRES_IN=
# Cloudinary
CLOUDINARY_CLOUD_NAME= 
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_PUBLIC_ID_SECRET=

# Email
EMAIL_USER=
EMAIL_PASS=

# VNPay
VNP_TMN_CODE=
VNP_HASH_SECRET=
VNP_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNP_RETURN_URL=http://localhost:5000/api/payment/return
# MongoDB
MONGODB_URL=
DATABASE_NAME=
# Cấu hình FE return
FE_URL=""
# Chatbot AI
GEMINI_API_KEY=""
---

## ▶️ Chạy project

### Development

```bash
npm run dev
```

### Production

```bash
npm start
```

---

## 📁 Cấu trúc thư mục

```
src/
│
├── controllers/       # Xử lý request
├── services/          # Business logic
├── models/            # MongoDB schema
├── routes/            # Định nghĩa API
├── middlewares/       # Middleware (auth, upload,...)
├── utils/             # Helper functions
├── config/            # Config hệ thống
└── server.js          # Entry point
```

---

## 🔐 Tính năng chính

### 👤 Authentication

* Đăng ký / đăng nhập
* JWT access token
* OTP email verification
* Quên mật khẩu

### 💈 Booking

* Đặt lịch cắt tóc
* Kiểm tra trùng lịch
* Booking draft + confirm

### 💳 Thanh toán

* Tích hợp VNPay
* Xử lý callback return URL
* Xác nhận thanh toán → tạo booking

### 🖼 Upload

* Upload avatar
* Upload ảnh dịch vụ (Cloudinary)

### 📬 Email

* Gửi OTP
* Gửi thông báo booking

---

## 📌 API mẫu

### Đăng ký

```
POST /api/auth/register
```

### Đăng nhập

```
POST /api/auth/login
```

### Tạo booking

```
POST /api/booking
```

### Thanh toán VNPay

```
POST /api/payment/create
```

---

## 🧪 Test

```bash
npm test
```

---

## ⚠️ Lưu ý

* Không commit file `.env`
* Sử dụng MongoDB Atlas hoặc local
* VNPay cần dùng sandbox để test

---


## 📜 License

ISC
