import { NextRequest, NextResponse } from "next/server";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

// Initialize Firebase Admin SDK
function getFirebaseAdmin() {
  if (getApps().length === 0) {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
      : null;

    if (serviceAccount) {
      initializeApp({
        credential: cert(serviceAccount),
      });
    } else {
      initializeApp({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      });
    }
  }

  return {
    auth: getAuth(),
    db: getFirestore(),
  };
}

// Helper to verify token and get user
async function verifyUser(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.split("Bearer ")[1];
  const { auth, db } = getFirebaseAdmin();

  try {
    const decodedToken = await auth.verifyIdToken(token);
    const userDoc = await db.collection("users").doc(decodedToken.uid).get();
    
    if (!userDoc.exists) return null;
    
    const userData = userDoc.data();
    return {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: userData?.name || "",
      role: userData?.role || "user",
    };
  } catch {
    return null;
  }
}

// GET - Get user's notifications
export async function GET(request: NextRequest) {
  try {
    const user = await verifyUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const unreadOnly = searchParams.get("unreadOnly") === "true";
    
    const { db } = getFirebaseAdmin();

    let query = db
      .collection("notifications")
      .where("userId", "==", user.uid)
      .orderBy("createdAt", "desc")
      .limit(limit);

    if (unreadOnly) {
      query = db
        .collection("notifications")
        .where("userId", "==", user.uid)
        .where("read", "==", false)
        .orderBy("createdAt", "desc")
        .limit(limit);
    }

    const snapshot = await query.get();
    const notifications = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Get unread count
    const unreadSnapshot = await db
      .collection("notifications")
      .where("userId", "==", user.uid)
      .where("read", "==", false)
      .get();

    return NextResponse.json({
      success: true,
      notifications,
      unreadCount: unreadSnapshot.size,
    });
  } catch (error: any) {
    console.error("Notifications GET error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Mark notifications as read
export async function POST(request: NextRequest) {
  try {
    const user = await verifyUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action, notificationIds } = body;
    const { db } = getFirebaseAdmin();

    switch (action) {
      case "mark-read": {
        if (!notificationIds || !Array.isArray(notificationIds)) {
          return NextResponse.json(
            { success: false, error: "Notification IDs are required" },
            { status: 400 }
          );
        }

        const batch = db.batch();
        
        for (const id of notificationIds) {
          const notificationRef = db.collection("notifications").doc(id);
          const notificationDoc = await notificationRef.get();
          
          if (notificationDoc.exists && notificationDoc.data()?.userId === user.uid) {
            batch.update(notificationRef, { read: true });
          }
        }

        await batch.commit();

        return NextResponse.json({
          success: true,
          message: "Notifications marked as read",
        });
      }

      case "mark-all-read": {
        const unreadSnapshot = await db
          .collection("notifications")
          .where("userId", "==", user.uid)
          .where("read", "==", false)
          .get();

        const batch = db.batch();
        unreadSnapshot.docs.forEach((doc) => {
          batch.update(doc.ref, { read: true });
        });

        await batch.commit();

        return NextResponse.json({
          success: true,
          message: "All notifications marked as read",
        });
      }

      case "delete": {
        if (!notificationIds || !Array.isArray(notificationIds)) {
          return NextResponse.json(
            { success: false, error: "Notification IDs are required" },
            { status: 400 }
          );
        }

        const batch = db.batch();
        
        for (const id of notificationIds) {
          const notificationRef = db.collection("notifications").doc(id);
          const notificationDoc = await notificationRef.get();
          
          if (notificationDoc.exists && notificationDoc.data()?.userId === user.uid) {
            batch.delete(notificationRef);
          }
        }

        await batch.commit();

        return NextResponse.json({
          success: true,
          message: "Notifications deleted",
        });
      }

      default:
        return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
    }
  } catch (error: any) {
    console.error("Notifications POST error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
