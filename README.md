# 👁️ Eye Stress Detector(AI + MERN)

AI-powered full-stack platform that detects digital eye stress from images/videos using deep learning and automatically sends report emails with visualization.

---

## 🚀 Highlights

✨ ResNet18 deep learning eye-stress detection  
✨ Image & video upload with real-time inference  
✨ Automated email report with chart visualization  
✨ JWT authentication & protected routes  
✨ History tracking with MongoDB  
✨ Webcam capture integration  
✨ Microservice architecture (AI + MERN separation)

---

## 🧠 Architecture

React Frontend → FastAPI AI Service → Express Backend → MongoDB

---

## 🛠️ Tech Stack

**AI / ML:** PyTorch, ResNet18, Torchvision, Matplotlib, PIL  
**AI Backend:** FastAPI, Uvicorn, SMTP Email Automation  
**Backend:** Node.js, Express, MongoDB, Mongoose, JWT, bcrypt, Multer  
**Frontend:** React (Vite), TailwindCSS, Axios, React Router, Webcam  

---

## ▶️ Run the Project (3 Terminals)

### 🧠 FastAPI
```bash
.\venv\Scripts\Activate.ps1
python main.py
```

---

### ⚡ Node Backend
```bash
cd backend
npm install
node server.js
```

---

### 🎨 Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 🔑 Environment Setup

### Root `.env`
```env
EMAIL_USER=your_email
EMAIL_PASS=your_app_password
SMTP_SERVER=smtp.gmail.com
```

### Backend `.env`
```env
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret
PORT=5000
```

---

## ⭐ Author

**Bindu Varenya Varma Penmetsa**  
AI & Full-Stack Developer
