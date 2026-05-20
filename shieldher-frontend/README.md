# 🛡️ ShieldHer — Frontend Setup Guide

## Pages Included

| Page | Route | Description |
|------|-------|-------------|
| Register | `/register` | Sign up with name, email, phone, password |
| Login | `/login` | Sign in with email + password |
| Verify OTP | `/verify-otp` | 6-digit OTP verification with resend |
| Dashboard | `/dashboard` | Home — threat score, quick actions, stats |
| SOS Center | `/sos` | Big SOS button + shake + voice + fake call |
| Journey Guardian | `/journey` | Start/track/end journey with check-in |
| Heatmap | `/heatmap` | Community danger zones + anonymous reporting |
| Profile | `/profile` | Trusted contacts management + settings |

---

## Step 1 — Install dependencies

```bash
cd shieldher
npm install
npm install -D tailwindcss postcss autoprefixer
```

---

## Step 2 — Connect your backend

1. Copy the env file:
```bash
cp .env.example .env
```

2. Edit `.env`:
```
REACT_APP_API_URL=http://localhost:5000/api
```

> For production deployment on Vercel, set this in your Vercel environment variables dashboard.

---

## Step 3 — Enable CORS on your backend

In your Express app, add this before your routes:

```js
// server.js or app.js
const cors = require("cors");

app.use(cors({
  origin: [
    "http://localhost:3000",           // React dev server
    "https://your-vercel-app.vercel.app" // Production
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
```

Install cors if not already:
```bash
npm install cors
```

---

## Step 4 — Auth flow wiring (already done)

The frontend connects to these exact routes from your backend:

| Action | Frontend call | Your backend route |
|--------|-------------|-------------------|
| Register | `POST /api/auth/register` | `authController.register` |
| Verify OTP | `POST /api/auth/verify-otp` | `authController.verifyEmail` |
| Resend OTP | `POST /api/auth/resend-otp` | `authController.resendOtp` |
| Login | `POST /api/auth/login` | `authController.login` |
| Refresh token | `POST /api/auth/refresh-token` | `authController.refreshToken` |
| Logout | `POST /api/auth/logout` | `authController.logout` |

Tokens are stored in `localStorage` as `accessToken` and `refreshToken`.
The Axios interceptor auto-refreshes on every 401 response.

---

## Step 5 — Run the app

```bash
npm start
```
Opens at `http://localhost:3000`

---

## Step 6 — Build for production

```bash
npm run build
```

Deploy the `/build` folder to **Vercel** (drag & drop or CLI):

```bash
npm install -g vercel
vercel --prod
```

---

## Adding future routes (when backend is ready)

Each page has a comment like `// In production: POST /api/journey/start`.
Just swap the placeholder with a real `api.post(...)` call from `src/services/api.js`.

Example for Journey:
```js
// src/services/api.js — add these:
export const journeyAPI = {
  start:   (data) => api.post("/journey/start",   data),
  checkIn: (id)   => api.post(`/journey/${id}/checkin`),
  end:     (id)   => api.post(`/journey/${id}/end`),
  history: ()     => api.get("/journey/history"),
};
```

---

## Tech Stack

- **React 18** + React Router v6
- **Tailwind CSS** (dark theme, custom design tokens)
- **Axios** with JWT auto-refresh interceptor
- **Web Speech API** (voice keyword trigger)
- **DeviceMotionEvent** (shake detection)
- **Syne + DM Sans** fonts (Google Fonts)

---

## Folder Structure

```
src/
├── components/
│   ├── BottomNav.jsx       ← App navigation bar
│   ├── ProtectedRoute.jsx  ← Auth guard
│   └── UI.jsx              ← Shared components
├── context/
│   └── AuthContext.js      ← Global auth state
├── pages/
│   ├── Register.jsx
│   ├── Login.jsx
│   ├── VerifyOtp.jsx
│   ├── Dashboard.jsx
│   ├── SOS.jsx
│   ├── Journey.jsx
│   ├── Heatmap.jsx
│   └── Profile.jsx
├── services/
│   └── api.js              ← Axios instance + all API calls
├── App.js
└── index.js
```
