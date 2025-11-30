# 🧺 Dr Dhobi - Progressive Web App

A complete **Progressive Web App (PWA)** for Dr Dhobi Laundry Service with real-time booking management, Discord notifications, and admin dashboard.

## ✨ Features

### Customer-Facing
- 📱 **PWA** - Installable on mobile devices with offline support
- 🏠 **Landing Page** - Hero section, services overview, testimonials, FAQ
- 📋 **Booking Form** - 3-step wizard (Contact → Service → Schedule)
- 🧼 **Services Page** - Detailed pricing and service descriptions
- 📧 **Email Confirmations** - Automatic booking confirmations

### Admin Features
- 🎛️ **Admin Dashboard** (`/admin`) - Real-time booking management
- 📊 **Statistics** - Total, pending, in-progress, completed bookings
- 🔄 **Status Updates** - Change booking status with dropdown
- 💬 **Customer Messaging** - Send emails or WhatsApp messages to customers
- 🔔 **Browser Notifications** - Instant PWA push notifications for new bookings
- 🗑️ **Delete Bookings** - Remove cancelled or test bookings

### Backend
- 🔥 **Firebase Firestore** - Real-time database
- 📧 **Resend API** - Email service (3K free emails/month)
- 🔔 **PWA Push Notifications** - Browser notifications (no server needed!)
- 💬 **WhatsApp Ready** - Integration prepared (requires Twilio)

## 🚀 Quick Start

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Set Up Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your credentials:

```bash
cp .env.local.example .env.local
```

See **BACKEND_SETUP.md** for Firebase & Resend setup.  
See **DISCORD_ADMIN_SETUP.md** for Discord & admin dashboard setup.

### 3. Run Development Server
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## 📱 Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page with hero, services, testimonials, FAQ |
| `/services` | Detailed services page with pricing |
| `/booking` | 3-step booking form |
| `/admin` | Admin dashboard (real-time booking management) |

## 🎨 Tech Stack

- **Framework**: Next.js 16.0.3 (App Router)
- **UI**: React 19.2.0, TypeScript 5.x
- **Database**: Firebase Firestore
- **Email**: Resend API
- **Styling**: CSS Modules
- **Icons**: React Icons
- **Notifications**: Discord Webhooks

## 💰 Cost

| Service | Free Tier | Cost |
|---------|-----------|------|
| **Firebase** | 20K writes/day, 50K reads/day | ₹0 |
| **Resend** | 3,000 emails/month | ₹0 |
| **PWA Notifications** | Unlimited (browser-based) | ₹0 |
| **Vercel** | Unlimited bandwidth | ₹0 |
| **Total** | | **₹0/month** |

## 📚 Documentation

- **FIREBASE_AUTH_SETUP.md** - Complete Firebase Authentication guide
- **BACKEND_SETUP.md** - Firebase Firestore & Resend configuration
- **.env.local.example** - Environment variables template

## 🔧 Admin Dashboard

Access at `/admin` to:
- View all bookings in real-time
- Update booking status (pending → confirmed → in-progress → completed)
- Send emails or WhatsApp messages to customers
- Filter bookings by status
- Delete cancelled bookings

### 🔒 Authentication

Admin dashboard is protected with **Firebase Authentication** (email/password).

**Setup:**
1. Enable Firebase Auth in Firebase Console
2. Create admin user with email and password
3. Login at `/admin/login`

See **FIREBASE_AUTH_SETUP.md** for complete setup guide.

## 🎯 Testing

1. Go to `/booking` and submit a test booking
2. Get instant browser notification (if admin dashboard is open)
3. Open `/admin` to see the booking appear in real-time
4. Update status and send test messages

## 🚀 Deploy to Vercel

```bash
vercel
```

Add environment variables in Vercel dashboard under Project Settings → Environment Variables.

## 🎨 Branding

**Colors:**
- Navy: `#0d3b66` (Primary)
- Teal: `#1e8ba5` (Secondary)
- Orange: `#f4a259` (Accent)
- Cream: `#f9f7f3` (Background)

## 📄 License

Private - Dr Dhobi Laundry Service

---

**Built with ❤️ for Dr Dhobi**
