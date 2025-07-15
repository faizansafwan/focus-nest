# 🧠 FocusNest

FocusNest is a productivity-centric task management application designed to help users plan and organize their focus-driven work cycles. Built using a modern stack including **Next.js**, **Redux Toolkit**, **Node.js**, and **MongoDB**, the app integrates **Two-Factor Authentication (2FA)**, **JWT security**, and a clean, intuitive UI.

---

## 🚀 Features

- ✅ User Registration with JWT token generation
- ✅ Secure Login with Two-Factor Authentication (OTP via Email)
- ✅ User Profile View with Logout
- ✅ Add Tasks with title, description, priority, and date range
- ✅ Redux for state management
- ✅ Protected routes using JWT middleware
- ✅ Responsive and modern UI with TailwindCSS

---

## 📦 Tech Stack

**Frontend:**
- Next.js 14 (App Router)
- Redux Toolkit
- TailwindCSS

**Backend:**
- Node.js + Express
- MongoDB + Mongoose
- JSON Web Token (JWT)
- OTP Generator + Nodemailer

---

## ⚙️ Setup Instructions

### 📁 1. Clone the Repository

```bash
git clone https://github.com/faizansafwan/focus-nest.git
cd focus-nest
```


###  2. Backend Setup
```bash
cd backend
npm install
```

**Create a .env file in /backend root and add:**
```bash
# MongoDB connection string
MONGO_URI=mongodb+srv://faisaf010:kPVAeR7HM55o4P4R@cluster1.k34m7ms.mongodb.net/focusNest?retryWrites=true&w=majority&appName=Cluster1

# JWT secret key for signing tokens
JWT_SECRET=super_secret_key

# GitHub Proxy API token for OpenAI-like service
GITHUB_TOKEN=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

# Optional: Server port (defaults to 5000 if not set)
PORT=5000

# Optional: Your mail credentials (used in sendEmail.js if applicable)
EMAIL_USER=faizansafwan075@gmail.com
EMAIL_PASS=frlitgdjwyxntpdz
```

**Run the development server:**
```bash 
npm run dev
```



### 3. Frontend Setup
```bash
cd focusnest-frontend
npm install
```

**Run the development server:**
```bash 
npm run dev
```


 


