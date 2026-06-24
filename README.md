# 🚌 RIT Bus Seat Booking App

A web/mobile application that allows college students to book, manage, and track their bus seats for daily commutes — built to simplify the college transport experience.

---

## 📌 About the Project

Managing college bus seats manually is chaotic — students miss their rides, admins struggle with tracking, and seat allocation is a mess. This app solves that by bringing bus seat booking online with a clean, student-friendly interface.

Students can log in, view available buses, pick their seat, and confirm their booking in seconds. Admins can manage routes, monitor occupancy, and handle cancellations from a dedicated dashboard.

---

## ✨ Features

- 🔐 **Student Authentication** — Secure login/signup with college ID or email
- 🗺️ **Route & Stop Selection** — Browse available bus routes and stops
- 💺 **Interactive Seat Map** — Visual seat layout to choose your preferred seat
- 📅 **Daily / Weekly Booking** — Book for a single day or recurring schedules
- 🔔 **Booking Notifications** — Confirmation alerts via email or push notification
- ❌ **Cancellation & Rescheduling** — Flexible cancellation before departure
- 🛠️ **Admin Dashboard** — Manage buses, routes, students, and seat allocation
- 📊 **Occupancy Reports** — Real-time seat availability and booking stats

---

## 🖥️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js / Flutter *(update as per your stack)* |
| Backend | Node.js + Express / Django *(update as per your stack)* |
| Database | MongoDB / PostgreSQL *(update as per your stack)* |
| Authentication | JWT / Firebase Auth |
| Notifications | Email (Nodemailer) / Firebase Cloud Messaging |
| Hosting | Vercel / Render / Railway *(update as per your stack)* |

> **Note:** Update the tech stack table above to match the actual technologies you're using.

---

## 📂 Project Structure

```
college-bus-booking/
│
├── client/                  # Frontend source code
│   ├── public/
│   └── src/
│       ├── components/      # Reusable UI components
│       ├── pages/           # App pages (Home, Booking, Dashboard, etc.)
│       ├── services/        # API call handlers
│       └── utils/           # Helper functions
│
├── server/                  # Backend source code
│   ├── controllers/         # Route logic
│   ├── models/              # Database schemas
│   ├── routes/              # API endpoints
│   ├── middleware/          # Auth, error handling
│   └── config/              # DB connection, env setup
│
├── .env.example             # Environment variable template
├── .gitignore
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) v18+
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [MongoDB](https://www.mongodb.com/) (local or Atlas) *(or your DB of choice)*
- Git

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/your-username/college-bus-booking.git
cd college-bus-booking
```

2. **Set up environment variables**

```bash
cp .env.example .env
```

Edit `.env` and fill in your values:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
```

3. **Install dependencies**

```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

4. **Run the app**

```bash
# Start the backend server
cd server
npm run dev

# Start the frontend (in a separate terminal)
cd client
npm start
```

5. **Open in browser**

```
http://localhost:3000
```

---

## 📸 Screenshots

> *(Add screenshots of your app here once UI is ready)*

| Student Login | Seat Selection | Admin Dashboard |
|---|---|---|
| *(screenshot)* | *(screenshot)* | *(screenshot)* |

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new student |
| POST | `/api/auth/login` | Student login |
| GET | `/api/buses` | Get all available buses |
| GET | `/api/buses/:id/seats` | Get seat layout for a bus |
| POST | `/api/bookings` | Create a new booking |
| GET | `/api/bookings/me` | Get current user's bookings |
| DELETE | `/api/bookings/:id` | Cancel a booking |
| GET | `/api/admin/bookings` | Admin: view all bookings |

---

## 👥 User Roles

| Role | Access |
|---|---|
| **Student** | Register, login, view buses, book/cancel seats |
| **Admin** | Manage buses, routes, students, view all bookings and reports |

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m "Add: your feature description"`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

Please make sure your code follows the existing style and includes relevant comments.

---

## 🐛 Reporting Issues

Found a bug? [Open an issue](https://github.com/your-username/college-bus-booking/issues) with:

- A clear title and description
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)

---

