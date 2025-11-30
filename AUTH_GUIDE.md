# 🔒 Admin Authentication Guide - Firebase Auth

## Overview

The admin dashboard at `/admin` is now protected with **Firebase Authentication** using email and password. Admin accounts are managed directly in the Firebase Console.

## 🔐 How It Works

1. Navigate to `/admin` → Automatically redirected to `/admin/login`
2. Enter your email and password
3. Firebase validates credentials
4. On success, you're redirected to the admin dashboard
5. Session persists until you sign out

## 🚀 Initial Setup

### Step 1: Enable Firebase Authentication

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your **Dr Dhobi** project
3. Click **Authentication** in left sidebar
4. Click **Get Started**
5. Go to **Sign-in method** tab
6. Click **Email/Password**
7. Toggle **Enable** to ON
8. Click **Save**

### Step 2: Create Admin User

1. In Firebase Console → Authentication
2. Click **Users** tab
3. Click **Add user** button
4. Enter:
   - **Email**: `admin@drdhobi.in` (or your email)
   - **Password**: Choose a strong password (12+ characters)
5. Click **Add user**

### Step 3: Test Login

1. Go to `http://localhost:3000/admin`
2. You'll be redirected to the login page
3. Enter the credentials you just created
4. Click **Sign In**
5. You should now see the admin dashboard!

## 🔑 Managing Admin Users

### Add New Admin

**Option 1: Firebase Console (Recommended)**
1. Firebase Console → Authentication → Users
2. Click **Add user**
3. Enter email and password
4. Click **Add user**
5. Share credentials securely with the new admin

**Option 2: Programmatically (Advanced)**
Create a setup script or use Firebase Admin SDK

### Remove Admin Access

1. Firebase Console → Authentication → Users
2. Find the user
3. Click the **⋮** menu
4. Select **Delete user**
5. Confirm deletion

### Reset Password

**From Firebase Console:**
1. Authentication → Users
2. Find the user
3. Click **⋮** → **Reset password**
4. Firebase sends password reset email
5. Admin follows link to set new password

**Self-Service (Add to app later):**
Implement password reset flow using `sendPasswordResetEmail()`

## 🎨 Login Page Features

### User-Friendly Errors
- "Invalid email address"
- "No account found with this email"
- "Incorrect password"
- "This account has been disabled"

### Security Features
- Client-side validation
- Firebase secure authentication
- Session management
- Auto-redirect if already logged in

## 🛡️ Security Best Practices

### Strong Password Requirements
- ✅ At least 12 characters
- ✅ Mix of uppercase and lowercase
- ✅ Include numbers and symbols
- ✅ No dictionary words
- ✅ No personal information

**Example strong password:**
```
Dr#Dh0bi!2025@Adm1n
```

### Additional Security Tips

1. **Don't share credentials** - Keep them secret
2. **Change regularly** - Update password every 3-6 months
3. **Use password manager** - Store securely (1Password, LastPass, Bitwarden)
4. **Different per environment** - Dev vs Production credentials
5. **Team access** - Create separate credentials for each admin

## 🔓 Session Management

- **Session duration**: Until browser is closed
- **Logout**: Close browser or clear browser data
- **Multiple devices**: Login works on all devices
- **Concurrent sessions**: Multiple admins can login simultaneously

## 🚀 Advanced Authentication (Optional)

If you need more robust authentication, consider:

### Option 1: Firebase Authentication
```bash
pnpm install firebase-admin
```

Benefits:
- Email/password authentication
- Google/Facebook OAuth
- Email verification
- Password reset flows
- Role-based access control

### Option 2: NextAuth.js
```bash
pnpm install next-auth
```

Benefits:
- Multiple OAuth providers (Google, GitHub, etc.)
- Email magic links
- JWT sessions
- Built-in CSRF protection

### Option 3: Auth0 / Clerk
Third-party authentication services with:
- Advanced security features
- User management dashboard
- Multi-factor authentication (MFA)
- SSO (Single Sign-On)

## 🧪 Testing Authentication

### Test Login
1. Go to `http://localhost:3000/admin`
2. You should see login popup
3. Enter credentials:
   - Username: `admin`
   - Password: `drdhobi2025`
4. Click "Sign in"
5. You should now see the admin dashboard

### Test Invalid Credentials
1. Enter wrong username/password
2. You should see "Authentication required" error
3. Login popup appears again

### Test Logout
1. Close browser completely
2. Reopen and go to `/admin`
3. Login popup should appear again

## 🐛 Troubleshooting

### "Authentication required" error even with correct credentials

**Solution 1:** Check environment variables
```bash
# Print current values (be careful in production!)
echo $ADMIN_USERNAME
echo $ADMIN_PASSWORD
```

**Solution 2:** Restart dev server
```bash
# Stop server (Ctrl+C)
pnpm dev
```

**Solution 3:** Clear browser cache
- Chrome: Settings → Privacy → Clear browsing data
- Firefox: History → Clear Recent History
- Safari: Develop → Empty Caches

### Login popup doesn't appear

**Check middleware is working:**
1. Open browser DevTools (F12)
2. Go to Network tab
3. Navigate to `/admin`
4. Check response status (should be 401)
5. Check headers (should have `WWW-Authenticate`)

### Can't remember password

**Development:**
1. Check `.env.local` file
2. Or reset to default: `drdhobi2025`

**Production:**
1. Access Vercel dashboard
2. Check Environment Variables section
3. Update `ADMIN_PASSWORD`
4. Redeploy

## 📱 Mobile Access

HTTP Basic Auth works on mobile browsers:

**iOS Safari:**
1. Navigate to admin URL
2. Login popup appears
3. Enter credentials
4. Tap "Log In"

**Android Chrome:**
1. Navigate to admin URL
2. Login popup appears
3. Enter credentials
4. Tap "Sign in"

**Note:** Some mobile browsers may not save credentials between sessions.

## 🔐 Production Deployment Checklist

Before going live:

- [ ] Change `ADMIN_USERNAME` from default
- [ ] Change `ADMIN_PASSWORD` to strong password (12+ chars)
- [ ] Add credentials to Vercel environment variables
- [ ] Test login on production URL
- [ ] Store credentials in password manager
- [ ] Share credentials securely with team (if applicable)
- [ ] Document who has access
- [ ] Set password rotation reminder (3-6 months)

## 🆘 Emergency Access

If locked out:

1. **Vercel CLI access:**
```bash
vercel env pull .env.local
cat .env.local | grep ADMIN
```

2. **Vercel Dashboard access:**
- Login to Vercel
- Go to project settings
- View environment variables

3. **Reset credentials:**
- Update environment variables
- Redeploy application

## 💡 Pro Tips

1. **Bookmark with credentials** (use with caution):
```
https://admin:password@yourdomain.com/admin
```

2. **Share credentials securely:**
- Use password sharing features in 1Password/LastPass
- Or encrypted messaging (Signal, WhatsApp)
- Never send via plain email/SMS

3. **Multiple admin accounts:**
Create Firebase Auth for granular permissions:
- Owner (full access)
- Manager (view + edit)
- Staff (view only)

---

**Your admin dashboard is now secure! 🔒**

Need help? Check the troubleshooting section or reach out at hello@drdhobi.in
