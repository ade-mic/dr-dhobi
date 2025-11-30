# 🔥 Firebase Authentication Setup for Admin Dashboard

## Quick Start (5 Minutes)

### Step 1: Enable Email/Password Authentication

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your **Dr Dhobi** project
3. Click **Authentication** in the left sidebar
4. Click **Get Started** button
5. Go to **Sign-in method** tab
6. Click on **Email/Password** provider
7. Toggle **Enable** switch to ON
8. Click **Save**

### Step 2: Create Your First Admin User

1. Stay in Firebase Console → Authentication
2. Click the **Users** tab
3. Click **Add user** button
4. Fill in the form:
   ```
   Email: admin@drdhobi.in
   Password: [Choose a strong password]
   ```
5. Click **Add user**
6. ✅ Done! Your admin account is created

### Step 3: Test Login

1. Start your dev server: `pnpm dev`
2. Go to `http://localhost:3000/admin`
3. You'll see the login page
4. Enter your email and password
5. Click **Sign In**
6. 🎉 You're in the admin dashboard!

---

## 📋 Managing Admin Users

### Add Additional Admins

1. Firebase Console → Authentication → Users
2. Click **Add user**
3. Enter new admin's email and temporary password
4. Click **Add user**
5. Share credentials securely (use password manager or encrypted messaging)
6. Advise them to change password after first login

### View All Admins

Firebase Console → Authentication → Users tab shows:
- Email addresses
- User IDs
- Created dates
- Last sign-in times
- Providers (Email/Password)

### Delete Admin Access

1. Users tab → Find the admin
2. Click **⋮** (three dots) on the right
3. Select **Delete user**
4. Confirm deletion
5. User immediately loses access

### Disable Admin Temporarily

1. Users tab → Find the admin
2. Click **⋮** (three dots)
3. Select **Disable user**
4. To re-enable: Click **⋮** → **Enable user**

---

## 🔒 Password Management

### Reset Admin Password

**Option 1: From Firebase Console**
1. Authentication → Users
2. Find the user
3. Click **⋮** → **Reset password**
4. Admin receives password reset email
5. Follow link to create new password

**Option 2: Self-Service (Future Feature)**
You can add a "Forgot Password" link that uses:
```typescript
import { sendPasswordResetEmail } from "firebase/auth";
await sendPasswordResetEmail(auth, email);
```

### Password Requirements

Firebase enforces:
- Minimum 6 characters (we recommend 12+)
- Can include uppercase, lowercase, numbers, symbols

**Best Practice Password:**
```
Dr#Dhobi!2025@Adm1n$ecure
```

---

## 🛡️ Security Configuration

### Set Up Firestore Security Rules

Protect your booking data by requiring authentication:

1. Firebase Console → Firestore Database
2. Click **Rules** tab
3. Replace with this:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /bookings/{booking} {
      // Public can create bookings (customer booking form)
      allow create: if true;
      
      // Only authenticated admins can read/update/delete
      allow read, update, delete: if request.auth != null;
    }
  }
}
```

4. Click **Publish**

### Enable Email Verification (Optional)

1. Authentication → Settings → User account management
2. Toggle on **Email enumeration protection**
3. This prevents attackers from discovering valid emails

### Set Up Password Policy (Optional)

1. Authentication → Settings → Password policy
2. Set minimum length (12+ recommended)
3. Require uppercase, lowercase, numeric, non-alphanumeric

---

## 🎨 Login Experience

### What Admins See

1. Navigate to `/admin`
2. Automatic redirect to `/admin/login`
3. Beautiful login form with:
   - Dr Dhobi logo
   - Email input
   - Password input
   - "Sign In" button
4. On success → Dashboard with "Logged in as: [email]"
5. "Sign Out" button in header

### Error Messages

User-friendly errors for common issues:
- ❌ "Invalid email address"
- ❌ "No account found with this email"
- ❌ "Incorrect password"
- ❌ "This account has been disabled"
- ❌ "Invalid email or password"

---

## 🔐 Session & Security

### How Sessions Work

- **Token-based**: Firebase issues JWT tokens
- **Auto-refresh**: Tokens auto-refresh (1-hour default)
- **Persistent**: Stays logged in across page refreshes
- **Secure**: Tokens stored in secure browser storage
- **Multi-device**: Can login from multiple devices

### Sign Out

Admins can sign out by:
1. Clicking **Sign Out** button in dashboard header
2. Manually going to `/admin/login` (auto-signs out)
3. Tokens expire after inactivity

### Session Monitoring

Firebase Console → Authentication → Users shows:
- **Last sign-in**: When admin last logged in
- **Created**: When account was created
- Track suspicious activity

---

## 🧪 Testing Checklist

### ✅ Test Login
- [ ] Go to `/admin` → Redirects to `/admin/login`
- [ ] Enter valid credentials → Access dashboard
- [ ] See "Logged in as: [email]" in header
- [ ] Dashboard loads bookings correctly

### ✅ Test Invalid Login
- [ ] Wrong email → Error: "No account found"
- [ ] Wrong password → Error: "Incorrect password"
- [ ] Invalid email format → Error: "Invalid email address"
- [ ] Disabled account → Error: "Account has been disabled"

### ✅ Test Sign Out
- [ ] Click "Sign Out" button → Redirect to login
- [ ] Try accessing `/admin` → Redirect to login
- [ ] Login again → Works correctly

### ✅ Test Session Persistence
- [ ] Login → Refresh page → Still logged in
- [ ] Login → Close tab → Reopen `/admin` → Still logged in
- [ ] Login → Wait 1 hour → Should auto-refresh token

---

## 🚀 Production Deployment

### Pre-Launch Checklist

- [ ] Firebase Auth enabled in production project
- [ ] Admin users created
- [ ] Strong passwords set (12+ characters)
- [ ] Firestore security rules published
- [ ] Test login on production URL
- [ ] Credentials saved in password manager
- [ ] Document who has admin access

### Environment Variables

Your `.env.local` should already have:
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
```

**Vercel Deployment:**
1. Add same variables in Vercel Dashboard
2. Settings → Environment Variables
3. Add all `NEXT_PUBLIC_FIREBASE_*` variables
4. Deploy

---

## 🐛 Troubleshooting

### "No account found with this email"

**Solution:**
1. Check Firebase Console → Authentication → Users
2. Verify email is listed
3. Check for typos in email address
4. Create user if missing

### "Incorrect password"

**Solution:**
1. Use Firebase Console to reset password
2. Authentication → Users → ⋮ → Reset password
3. Check email for reset link
4. Set new password

### Redirects to login even when logged in

**Solution:**
1. Check browser console for errors
2. Verify Firebase config in `.env.local`
3. Clear browser cache/cookies
4. Try incognito mode
5. Check Firebase Console for authentication logs

### "Auth/network-request-failed"

**Solution:**
1. Check internet connection
2. Verify Firebase project is active
3. Check Firebase Console for outages
4. Verify API key is correct

### Session expires too quickly

**Solution:**
Firebase tokens last 1 hour by default. To extend:
```typescript
// In firebase.ts
import { setPersistence, browserLocalPersistence } from "firebase/auth";
await setPersistence(auth, browserLocalPersistence);
```

---

## 💡 Advanced Features (Future)

### Add "Forgot Password" Link

In `/admin/login/page.tsx`, add:
```typescript
const handleForgotPassword = async () => {
  if (!email) {
    setError("Please enter your email first");
    return;
  }
  
  try {
    await sendPasswordResetEmail(auth, email);
    alert("Password reset email sent! Check your inbox.");
  } catch (error) {
    setError("Failed to send reset email");
  }
};
```

### Add Google Sign-In

1. Firebase Console → Authentication → Sign-in method
2. Enable **Google** provider
3. Update login page to include Google button
4. Use `signInWithPopup(auth, googleProvider)`

### Add Two-Factor Authentication

1. Enable phone authentication in Firebase
2. Use `multiFactor` API
3. Require SMS code after password

### Role-Based Access Control

Store admin roles in Firestore:
```javascript
admins/
  ├── user123/
  │   ├── email: "admin@drdhobi.in"
  │   ├── role: "owner"  // owner, manager, staff
  │   └── permissions: ["view", "edit", "delete", "message"]
```

---

## 📱 Mobile Admin Access

Firebase Auth works on mobile browsers:
- ✅ iOS Safari
- ✅ Android Chrome
- ✅ Mobile responsive login form
- ✅ Touch-friendly buttons

Consider building a native admin app with:
- React Native + Firebase
- Flutter + Firebase Auth
- Native push notifications

---

## 🆘 Emergency Access

### Locked Out?

1. **Create new admin via Firebase Console**
   - Authentication → Users → Add user
   - Use different email

2. **Use Firebase Admin SDK**
   - Create a Node.js script
   - Use service account credentials
   - Manually add/reset users

3. **Contact Firebase Support**
   - Firebase Console → Support
   - Open support ticket

### Lost Access to Firebase Console?

1. Check Google account access
2. Verify project ownership
3. Contact team members with access
4. Check billing account permissions

---

**Your admin dashboard is now secured with Firebase Authentication! 🔥**

**Next Steps:**
1. Create admin accounts in Firebase Console
2. Test login flow
3. Set Firestore security rules
4. Deploy to production
5. Document admin credentials securely

Need help? Check Firebase documentation or reach out at hello@drdhobi.in
