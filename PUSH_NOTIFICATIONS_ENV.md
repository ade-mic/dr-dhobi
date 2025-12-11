# Environment Variables for Push Notifications

Add these to your `.env.local` file:

```bash
# Firebase Configuration (already have these)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# VAPID Key for Web Push (NEW - required for FCM)
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_vapid_key
```

## How to Get Your VAPID Key

1. Go to Firebase Console: https://console.firebase.google.com
2. Select your project
3. Go to Project Settings (gear icon) → Cloud Messaging tab
4. Scroll to "Web configuration" section
5. Under "Web Push certificates", click "Generate key pair"
6. Copy the key and add it to your `.env.local` as `NEXT_PUBLIC_FIREBASE_VAPID_KEY`

## Update firebase-messaging-sw.js

Replace the placeholder values in `/public/firebase-messaging-sw.js` with your actual Firebase config values:

```javascript
firebase.initializeApp({
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
});
```

Note: Service workers can't access environment variables, so you need to hardcode these values.
