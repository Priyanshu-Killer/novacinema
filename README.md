# 🎬 NovaCinema — The Future of Movie Booking

A full-stack, production-ready movie ticket booking platform with real-time seat selection, payment simulation, admin dashboard, and QR ticket generation.

---

## 🌟 Brand Identity

**Brand Name:** NovaCinema  
**Tagline:** "Book the Future"  
**Theme:** Futuristic, cinematic dark theme with glassmorphism effects  
**Colors:**  
- Primary: Deep violet (`#040308` → `#5b44a0`)  
- Accent: Cyan (`#22d3ee`)  
- Gold: `#fbbf24`  
**Fonts:** Orbitron (display) + Syne (body) + Space Mono (code)

---

## 🏗️ Architecture

```
novacinema/
├── frontend/          # React + Vite + Tailwind
├── backend/           # Node.js + Express + Socket.IO
└── docs/              # Documentation
```

### Tech Stack

**Frontend:** React 18, Vite, Tailwind CSS, Framer Motion, Redux Toolkit, React Router, Socket.IO Client, Recharts

**Backend:** Node.js, Express.js, MongoDB, Mongoose, JWT, Socket.IO, QRCode, bcryptjs

---

## ⚡ Quick Start

### Prerequisites

- Node.js >= 18
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### 1. Clone & Install

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment

```bash
# Copy example env file
cd backend
cp .env.example .env
```

Edit `/backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/novacinema
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long
JWT_EXPIRES_IN=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
SEAT_LOCK_TIMEOUT=600000
```

### 3. Seed the Database

```bash
cd backend
npm run seed
```

This creates:
- **Admin account:** `admin@novacinema.com` / `Admin@123`
- **User account:** `user@novacinema.com` / `User@123`
- 6 sample movies
- 3 theatres (Mumbai, Delhi, Bangalore)
- 100+ shows for the next 7 days

### 4. Start the Servers

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

Open http://localhost:5173 🎉

---

## 🎯 Core Features

### User Features
- ✅ JWT Authentication (signup/login/logout)
- ✅ Movie browsing with search & genre filters
- ✅ Movie detail page
- ✅ Date-based show selection
- ✅ Theatre selection by city
- ✅ Interactive seat layout (Standard / Premium / Recliner)
- ✅ Real-time seat availability via Socket.IO
- ✅ Seat locking (10-min timeout)
- ✅ Mock payment gateway (Card/UPI/NetBanking/Wallet)
- ✅ QR code ticket generation
- ✅ Booking history
- ✅ User profile management

### Admin Features
- ✅ Admin dashboard with revenue analytics
- ✅ Movie CRUD (Add/Edit/Delete movies)
- ✅ Theatre management
- ✅ Show scheduling
- ✅ Booking management
- ✅ User management with activate/deactivate

### Real-Time Features
- ✅ Socket.IO live seat status updates
- ✅ Concurrency-safe booking (MongoDB transactions)
- ✅ Auto seat release after lock timeout

---

## 📡 API Documentation

### Auth
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login |
| GET | `/api/auth/me` | Protected | Get current user |
| PUT | `/api/auth/profile` | Protected | Update profile |
| PUT | `/api/auth/change-password` | Protected | Change password |

### Movies
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/movies` | Public | Get all movies (filterable) |
| GET | `/api/movies/featured` | Public | Get featured movies |
| GET | `/api/movies/:id` | Public | Get movie by ID |
| POST | `/api/movies` | Admin | Create movie |
| PUT | `/api/movies/:id` | Admin | Update movie |
| DELETE | `/api/movies/:id` | Admin | Remove movie |

### Shows
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/shows/movie/:movieId` | Public | Shows for a movie + date |
| GET | `/api/shows/:id` | Public | Show detail with seat map |
| POST | `/api/shows` | Admin | Create show |
| PUT | `/api/shows/:id` | Admin | Update show |
| DELETE | `/api/shows/:id` | Admin | Cancel show |

### Bookings
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/bookings/lock-seats` | User | Lock selected seats |
| POST | `/api/bookings` | User | Create confirmed booking |
| GET | `/api/bookings/my-bookings` | User | Get user bookings |
| GET | `/api/bookings/:id` | User | Get specific booking |
| PUT | `/api/bookings/:id/cancel` | User | Cancel booking |

### Payments
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/payments/process` | User | Process mock payment |
| GET | `/api/payments/history` | User | Payment history |

### Admin
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/admin/dashboard` | Admin | Stats & analytics |
| GET | `/api/admin/users` | Admin | All users |
| PUT | `/api/admin/users/:id/toggle-status` | Admin | Activate/deactivate user |
| GET | `/api/admin/bookings` | Admin | All bookings |

---

## 🔌 Socket.IO Events

### Client → Server
| Event | Payload | Description |
|-------|---------|-------------|
| `joinShow` | `showId` | Join show's real-time room |
| `leaveShow` | `showId` | Leave show room |
| `seatHover` | `{showId, row, seatNumber}` | Broadcast hover |

### Server → Client
| Event | Payload | Description |
|-------|---------|-------------|
| `seatUpdate` | `{showId, updatedSeats}` | Seat status changed |
| `seatsReleased` | `{showId}` | Expired locks released |
| `seatHovered` | `{row, seatNumber}` | Another user hovering |

---

## 🗄️ Database Schema

### Users
```javascript
{ name, email, password(hashed), phone, role: ['user','admin'], isActive, bookings[] }
```

### Movies
```javascript
{ title, description, genre[], language[], duration, rating, imdbRating, cast[], director, releaseDate, poster, banner, trailer, status: ['upcoming','nowShowing','ended'] }
```

### Theatres
```javascript
{ name, address: {street, city, state}, phone, screens: [{name, totalSeats, rows, cols, seatLayout[]}], amenities[] }
```

### Shows
```javascript
{ movie, theatre, screen, showDate, showTime, seats: [{row, seatNumber, seatType, price, status: ['available','locked','booked'], lockedBy, lockedAt}], pricing: {standard, premium, recliner}, format, language }
```

### Bookings
```javascript
{ bookingId(auto), user, show, movie, theatre, seats[], totalAmount, convenienceFee, finalAmount, status, paymentStatus, qrCode }
```

### Payments
```javascript
{ transactionId(auto), booking, user, amount, method, status, gatewayResponse }
```

---

## 🚀 Deployment

### Frontend (Vercel)
```bash
cd frontend
npm run build
# Deploy dist/ to Vercel, add VITE_API_URL env var
```

### Backend (Railway/Render)
```bash
# Add environment variables in your deployment platform
# Set MONGODB_URI to your Atlas connection string
# Set FRONTEND_URL to your deployed frontend URL
```

### Docker (Optional)
The project is ready to be containerized. Create `Dockerfile` in each directory.

---

## 🎨 Booking Flow

1. **Browse Movies** → User searches/filters movies
2. **Movie Detail** → View synopsis, trailer, cast
3. **Select Show** → Choose date → Theatre → Show timing
4. **Seat Selection** → Interactive seat map, real-time updates
5. **Lock Seats** → Seats locked for 10 minutes via API + Socket.IO broadcast
6. **Payment** → Mock gateway simulation
7. **Booking Confirmed** → QR code generated, confirmation page

---

## 🔐 Security

- JWT authentication with token expiry
- Password hashing with bcryptjs (salt rounds: 12)
- Role-based access control (user/admin)
- MongoDB transaction for concurrent booking safety
- Input validation on all routes
- CORS configured for specific origin

---

## 📱 PWA Ready

The frontend includes meta tags and is PWA-ready. Add a `vite-plugin-pwa` to enable service workers and offline support.

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch
3. Commit changes
4. Open a PR

---

*Crafted with ✦ by NovaCinema Engineering*
#   n o v a c i n e m a  
 