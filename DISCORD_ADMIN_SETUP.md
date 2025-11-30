# Discord & Admin Dashboard Setup Guide

This guide explains how to set up Discord notifications and use the Admin Dashboard to manage bookings for Dr Dhobi Laundry Service.

## 📊 Admin Dashboard Features

The admin dashboard at `/admin` provides:
- **Real-time booking monitoring** - See all bookings as they come in
- **Status management** - Update booking status (pending → confirmed → in-progress → completed)
- **Customer messaging** - Send emails or WhatsApp messages to customers
- **Statistics dashboard** - View total, pending, in-progress, and completed bookings
- **Filter bookings** - Filter by status to focus on what matters
- **Delete bookings** - Remove cancelled or test bookings

## 🎯 Setup Steps

### 1. Create Discord Server & Webhook (FREE)

#### Step 1: Create Discord Server
1. Open Discord (download from https://discord.com if needed)
2. Click the **+** button on the left sidebar
3. Select **Create My Own**
4. Choose **For me and my friends** or **For a club or community**
5. Name it **"Dr Dhobi Admin"** (or any name you prefer)
6. Click **Create**

#### Step 2: Create a Channel for Bookings
1. In your new server, right-click on the server name
2. Select **Create Channel**
3. Choose **Text Channel**
4. Name it **"new-bookings"**
5. Click **Create Channel**

#### Step 3: Create Webhook for Notifications
1. Right-click on the **#new-bookings** channel
2. Select **Edit Channel**
3. Go to **Integrations** tab
4. Click **Create Webhook**
5. Name it **"Dr Dhobi Bot"**
6. (Optional) Upload an avatar image for the bot
7. Click **Copy Webhook URL**
8. Save this URL - you'll need it for the environment variables
9. Click **Save Changes**

**Your webhook URL will look like:**
```
https://discord.com/api/webhooks/1234567890123456789/abcdefghijklmnopqrstuvwxyz1234567890
```

### 2. Configure Environment Variables

Create a `.env.local` file in your project root:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Resend Email API
RESEND_API_KEY=re_your_resend_api_key

# Admin Email (receives booking notifications)
ADMIN_EMAIL=hello@drdhobi.in

# Discord Webhook (paste the URL you copied)
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR_WEBHOOK_URL_HERE

# WhatsApp API (optional - only if you want WhatsApp integration)
WHATSAPP_API_URL=https://api.twilio.com/2010-04-01/Accounts/YOUR_ACCOUNT_SID/Messages.json
WHATSAPP_API_TOKEN=your_twilio_auth_token

# Admin Authentication (IMPORTANT - Change these!)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password_here
```

### 3. Test Discord Notifications

1. Start your development server:
```bash
pnpm dev
```

2. Go to `http://localhost:3000/booking`

3. Fill out and submit a test booking

4. Check your Discord server - you should see a beautiful embedded message with:
   - 🧺 "New Booking Received!" title
   - Customer details (name, phone, email)
   - Service information (type, date, time, address)
   - Booking ID and notes (if provided)

## 🎛️ Using the Admin Dashboard

### Accessing the Dashboard

Navigate to `http://localhost:3000/admin` (or `yourdomain.com/admin` in production)

### Dashboard Features

#### 1. **Statistics Overview**
At the top, you'll see four stat cards:
- Total Bookings
- Pending (needs confirmation)
- In Progress (being processed)
- Completed (finished orders)

#### 2. **Filter Bookings**
Use the filter buttons to show:
- **All** - All bookings
- **Pending** - New bookings waiting for confirmation
- **Confirmed** - Confirmed pickups
- **In Progress** - Currently being processed
- **Completed** - Finished orders
- **Cancelled** - Cancelled bookings

#### 3. **Update Booking Status**
For each booking card:
1. Use the dropdown to change status
2. Status updates automatically save to Firebase
3. Color-coded badges show current status:
   - 🟡 Yellow = Pending
   - 🔵 Blue = Confirmed
   - 🟠 Orange = In Progress
   - 🟢 Green = Completed
   - 🔴 Red = Cancelled

#### 4. **Send Messages to Customers**

**Via Email:**
1. Click the **💬 Message** button on any booking
2. Select **📧 Email** tab
3. Type your message (e.g., "Your order is ready for pickup!")
4. Click **Send Email**
5. Customer receives a formatted email with your message

**Via WhatsApp (if configured):**
1. Click the **💬 Message** button
2. Select **💬 WhatsApp** tab
3. Type your message
4. Click **Send WhatsApp**
5. Customer receives WhatsApp message (requires Twilio setup)

#### 5. **Delete Bookings**
- Click the **🗑️** button to delete a booking
- Confirmation prompt appears before deletion
- Use for test bookings or cancelled orders

### Real-time Updates

The dashboard uses Firebase real-time listeners, so:
- ✅ New bookings appear automatically (no refresh needed)
- ✅ Status changes sync across all open admin windows
- ✅ Deletions update immediately

## 📱 Discord Mobile App

Install Discord on your phone to receive instant notifications:
- **iOS**: https://apps.apple.com/app/discord/id985746746
- **Android**: https://play.google.com/store/apps/details?id=com.discord

Turn on push notifications for the **#new-bookings** channel to get alerts instantly!

## 🔒 Security Recommendations

### Admin Dashboard Authentication

The admin dashboard is now **protected with HTTP Basic Authentication**. 

**Default credentials (CHANGE THESE!):**
- Username: `admin`
- Password: `drdhobi2025`

**To change credentials:**
1. Open `.env.local`
2. Update `ADMIN_USERNAME` and `ADMIN_PASSWORD`
3. Restart server

**How it works:**
- Browser shows login popup when accessing `/admin`
- Credentials are checked against environment variables
- Session persists until browser is closed
- All `/admin/*` routes are protected

**For production, consider:**
- Strong password (12+ characters, mixed case, numbers, symbols)
- Firebase Authentication for role-based access
- NextAuth.js for OAuth (Google, GitHub login)

### Discord Webhook Security
- ⚠️ **Never commit** `.env.local` to Git
- ✅ Keep webhook URL secret (treat it like a password)
- ✅ If exposed, regenerate webhook in Discord settings

## 💡 Pro Tips

1. **Pin Important Bookings** - Right-click messages in Discord and select "Pin" for urgent orders

2. **Set up Notifications** - In Discord:
   - Right-click **#new-bookings** → Notification Settings
   - Set to **All Messages** for instant alerts

3. **Use Discord Search** - Search for customer names or phone numbers in Discord

4. **Mobile First** - Install Discord mobile app for on-the-go management

5. **Test Messages** - Use the admin dashboard to test email/WhatsApp templates before going live

## 🆓 Cost Breakdown

| Service | Free Tier | Cost |
|---------|-----------|------|
| **Discord** | Unlimited messages, unlimited users | ₹0 |
| **Firebase** | 20K writes/day, 50K reads/day | ₹0 |
| **Resend** | 3,000 emails/month | ₹0 |
| **Next.js Hosting** | Vercel free tier (unlimited bandwidth) | ₹0 |
| **Total** | | **₹0/month** |

## 🔧 Troubleshooting

### Discord notifications not working?
- ✅ Check that `DISCORD_WEBHOOK_URL` is set in `.env.local`
- ✅ Verify webhook URL is correct (test by pasting in browser - should show `{"message": "401: Unauthorized"}`)
- ✅ Restart dev server after adding environment variables

### Admin dashboard shows "Loading..."?
- ✅ Ensure Firebase is configured correctly
- ✅ Check browser console for errors
- ✅ Verify `.env.local` has all Firebase config variables

### Email sending fails?
- ✅ Check `RESEND_API_KEY` is set
- ✅ Verify domain in Resend dashboard (use `onboarding@resend.dev` for testing)
- ✅ Check Resend dashboard for error logs

### WhatsApp not working?
- ℹ️ WhatsApp requires Twilio setup (optional)
- ℹ️ If not configured, email works as primary communication

## 🚀 Next Steps

1. **Deploy to Production**
   - Deploy to Vercel: `vercel deploy`
   - Add environment variables in Vercel dashboard
   - Test booking flow end-to-end

2. **Customize Messages**
   - Edit email templates in `/src/app/api/admin/send-message/route.ts`
   - Customize Discord embed colors/format in `/src/app/api/bookings/route.ts`

3. **Add More Features**
   - Payment integration
   - SMS notifications (via Twilio)
   - Customer portal to track orders
   - Analytics dashboard

---

**Need help?** Create an issue or reach out at hello@drdhobi.in
