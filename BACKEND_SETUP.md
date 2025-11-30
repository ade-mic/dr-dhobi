# Dr Dhobi - Backend Setup Guide

## 🔥 Firebase Setup

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" and name it `dr-dhobi`
3. Disable Google Analytics (optional)
4. Click "Create project"

### 2. Enable Firestore Database
1. In Firebase Console, go to **Build > Firestore Database**
2. Click "Create database"
3. Start in **Production mode**
4. Choose location: `asia-south1` (Mumbai) for India
5. Click "Enable"

### 3. Get Firebase Configuration
1. Go to **Project Settings** (gear icon)
2. Scroll to "Your apps" section
3. Click **Web** icon (`</>`)
4. Register app name: `Dr Dhobi Web`
5. Copy the `firebaseConfig` object

### 4. Configure Environment Variables
Create `.env.local` file in project root:

```bash
cp .env.local.example .env.local
```

Fill in your Firebase config:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=dr-dhobi.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=dr-dhobi
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=dr-dhobi.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

### 5. Set Firestore Security Rules
In Firebase Console > Firestore Database > Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /bookings/{booking} {
      // Anyone can create bookings
      allow create: if true;
      
      // Only authenticated admins can read/update/delete
      allow read, update, delete: if false; // Change when you add admin auth
    }
  }
}
```

Click **Publish**

---

## 📧 Resend Email Setup

### 1. Create Resend Account
1. Go to [resend.com](https://resend.com)
2. Sign up for free (3,000 emails/month free)
3. Verify your email

### 2. Get API Key
1. Go to [API Keys](https://resend.com/api-keys)
2. Click "Create API Key"
3. Name it: `Dr Dhobi Production`
4. Copy the API key (starts with `re_`)

### 3. Add to Environment Variables
In `.env.local`:
```env
RESEND_API_KEY=re_your_api_key_here
ADMIN_EMAIL=hello@drdhobi.in
```

### 4. Verify Domain (Optional, for Production)
For testing, use: `bookings@resend.dev`

For production with custom domain:
1. Go to [Domains](https://resend.com/domains)
2. Add your domain: `drdhobi.in`
3. Add DNS records from Resend to your domain provider
4. Wait for verification
5. Update email from address in API route

---

## 🚀 Testing the Integration

### 1. Start Development Server
```bash
pnpm dev
```

### 2. Test Booking Flow
1. Open `http://localhost:3000/booking`
2. Fill out the form completely
3. Submit booking
4. Check:
   - Console for any errors
   - Firebase Console > Firestore Database for new booking
   - Customer email inbox for confirmation
   - Admin email for notification

### 3. Troubleshooting

**Error: Firebase not initialized**
- Check `.env.local` exists and has correct values
- Restart dev server after adding env variables

**Error: Resend API key invalid**
- Verify API key starts with `re_`
- Check no extra spaces in `.env.local`

**Emails not sending**
- Check Resend dashboard for error logs
- Verify email addresses are valid
- Check spam folder

**Firestore permission denied**
- Check Firestore rules allow `create`
- Make sure project ID matches

---

## 📊 View Bookings in Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Firestore Database**
4. Open **bookings** collection
5. View all submitted bookings with details

---

## 💰 Cost Monitoring

### Free Tier Limits:
- **Firebase Firestore**: 50K reads, 20K writes, 1GB storage/day
- **Resend**: 3,000 emails/month, 100/day

For 1,000 bookings/month:
- Firestore: ~2,000 writes (well within free tier)
- Resend: ~2,000 emails (within free tier)

**Total Cost: ₹0** 🎉

---

## 🔐 Security Checklist

- [x] `.env.local` added to `.gitignore`
- [x] Firestore rules restrict admin operations
- [x] API validates required fields
- [x] Email sends handled gracefully (won't fail booking)
- [ ] Add rate limiting (future)
- [ ] Add admin authentication (future)

---

## Next Steps

1. ✅ Complete Firebase setup
2. ✅ Get Resend API key
3. ✅ Configure `.env.local`
4. ✅ Deploy Firestore rules
5. ✅ Test booking end-to-end
6. 🔜 Deploy to Vercel
7. 🔜 Add Meta WhatsApp API (optional)

---

Need help? Contact: hello@drdhobi.in
