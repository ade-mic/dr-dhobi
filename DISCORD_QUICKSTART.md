# 🎮 Quick Discord Setup (5 Minutes)

## Step-by-Step Visual Guide

### 1️⃣ Create Discord Server (1 min)

```
Open Discord → Click [+] button → "Create My Own" 
→ "For me and my friends" → Name: "Dr Dhobi Admin" → Create
```

### 2️⃣ Create Bookings Channel (30 sec)

```
Right-click server name → "Create Channel" → Text Channel 
→ Name: "new-bookings" → Create
```

### 3️⃣ Get Webhook URL (2 min)

```
Right-click #new-bookings channel → "Edit Channel" 
→ "Integrations" tab → "Create Webhook" 
→ Name: "Dr Dhobi Bot" → Copy Webhook URL → Save
```

**Your webhook URL looks like:**
```
https://discord.com/api/webhooks/1234567890/abcdef...
```

### 4️⃣ Add to Environment (1 min)

Open `.env.local` and paste:

```bash
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR_URL_HERE
```

### 5️⃣ Test It! (30 sec)

1. Run `pnpm dev`
2. Go to `http://localhost:3000/booking`
3. Submit a test booking
4. **Check Discord** - You'll see a beautiful notification! 🎉

---

## What You'll See in Discord

When a customer books:

```
🔔 NEW BOOKING ALERT - Action Required

🧺 New Booking Received!

📋 Booking ID: abc123xyz789
👤 Customer: Rajesh Kumar         📞 Phone: +91 98765 43210
📧 Email: rajesh@example.com
🧼 Service: Dry Cleaning          📅 Date: Nov 30, 2025
⏰ Time: 10:00 AM - 12:00 PM
📍 Address: 123 MG Road, Bangalore
📝 Notes: Please handle delicate fabrics with care
```

---

## 📱 Get Mobile Notifications

Install Discord app:
- **iOS**: App Store → Search "Discord"
- **Android**: Play Store → Search "Discord"

Enable notifications for #new-bookings:
```
Right-click #new-bookings → Notification Settings → All Messages
```

Now you get instant push notifications on your phone! 📲

---

## 💡 Pro Tips

### Pin Urgent Bookings
Right-click message → "Pin Message" for VIP customers

### Search Bookings
Click search icon → Search by customer name, phone, or booking ID

### Multiple Admins
Invite team members to Discord server:
```
Right-click server → "Invite People" → Share invite link
```

### Custom Bot Avatar
Edit webhook → Upload image → Make it Dr Dhobi logo!

---

## 🎉 Done!

You now have **FREE instant notifications** that are:
- ✅ Better than email (instant)
- ✅ Better than SMS (free unlimited)
- ✅ Mobile + desktop support
- ✅ No monthly fees (₹0 forever)
- ✅ Searchable message history
- ✅ Team collaboration ready

**Next:** Open `/admin` dashboard to manage bookings! 🎛️
