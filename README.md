# 🏠 RentMate AI

RentMate AI is a full-stack MERN web application that helps tenants discover compatible rooms and flatmates using AI-based matching. The platform provides separate dashboards for tenants, room owners, and administrators with secure authentication and real-time communication.

---

## ✨ Features

- 🔐 Secure JWT Authentication
- 👤 Tenant Dashboard
- 🏠 Room Owner Dashboard
- 👨‍💼 Admin Dashboard
- 🤖 AI Compatibility Matching
- 📍 Room Listings
- ❤️ Interest Requests
- 💬 Real-Time Chat
- 📱 Responsive User Interface

---

## 🛠 Tech Stack

### Frontend
- React.js
- React Router
- Vite
- Axios
- CSS
- React Icons

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- bcryptjs

---

## 📂 Project Structure

```
rent-flatmate-finder/
│
├── backend/
│   ├── src/
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── README.md
└── SYSTEM_DESIGN.md
```

---

## 🚀 Installation

### Clone Repository

```bash
git clone https://github.com/YashrajKatiyar/Rent-FlatMate-finder.git
```

### Backend Setup

```bash
cd rent-flatmate-finder
cd backend
npm install
npm run dev
```

### Frontend Setup

```bash
cd rent-flatmate-finder
cd frontend
npm install
npm run dev
```

---

## 🔑 Environment Variables

Create a `.env` file inside the backend folder.

```env
## 🔑 Environment Variables

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

```

## 👨‍💻 Author

**Yash Raj Katiyar**