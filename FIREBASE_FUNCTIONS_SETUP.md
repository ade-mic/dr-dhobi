# Firebase Cloud Functions Setup

This directory contains Cloud Functions that handle push notifications when new bookings are created.

## Prerequisites

1. Firebase CLI installed: `npm install -g firebase-tools`
2. Firebase project initialized
3. Admin SDK credentials configured

## Setup Instructions

### 1. Initialize Firebase Functions (if not already done)

```bash
cd /home/ademich/laudry-service
firebase init functions
```

Select:
- Use existing project
- TypeScript
- ESLint: Yes
- Install dependencies: Yes

### 2. Install Dependencies

```bash
cd functions
npm install firebase-functions@latest firebase-admin@latest
```

### 3. Configure Environment

The function will automatically use your Firebase project configuration.

### 4. Deploy the Function

```bash
firebase deploy --only functions
```

## What This Function Does

- Listens for new documents in the `bookings` collection
- Retrieves all admin FCM tokens from `adminTokens` collection
- Sends push notifications to all logged-in admin devices
- Automatically cleans up invalid/expired tokens

## Testing

1. Ensure at least one admin is logged in with notifications enabled
2. Create a new booking from the frontend
3. Admin should receive a push notification immediately

## Monitoring

View function logs:
```bash
firebase functions:log
```

## Alternative: Client-Side Only Approach

If you prefer not to use Cloud Functions, the current implementation already provides:
- Real-time Firestore listeners that detect new bookings instantly
- Browser notifications when the admin dashboard tab is open
- Works for active sessions without needing backend infrastructure

The Cloud Functions approach adds:
- Notifications even when the tab is closed/minimized
- Works across multiple devices
- More reliable delivery
