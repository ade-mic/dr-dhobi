import { NextRequest, NextResponse } from "next/server";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { BookingFormData } from "@/types/booking";

// Initialize Firebase Admin for token verification
let adminApp: import("firebase-admin").app.App | null = null;

async function getAdminApp() {
  if (adminApp) return adminApp;
  
  const admin = await import("firebase-admin");
  
  if (!admin.apps.length) {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (!serviceAccount) {
      throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY is not set");
    }
    
    adminApp = admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(serviceAccount)),
    });
  } else {
    adminApp = admin.apps[0] as import("firebase-admin").app.App;
  }
  
  return adminApp;
}

async function verifyToken(token: string): Promise<string | null> {
  try {
    const app = await getAdminApp();
    const auth = (await import("firebase-admin")).auth(app);
    const decodedToken = await auth.verifyIdToken(token);
    return decodedToken.uid;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const data: BookingFormData = await request.json();

    // Validate required fields
    if (!data.name || !data.phone || !data.service || !data.date || !data.slot || !data.address) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Extract userId from token if present
    let userId: string | null = null;
    const authHeader = request.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      userId = await verifyToken(token);
    }

    // Create booking in Firestore
    const bookingData = {
      ...data,
      ...(userId && { userId }),
      status: "pending",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, "bookings"), bookingData);

    // Create notification for user if they have a userId
    if (userId) {
      await addDoc(collection(db, "notifications"), {
        userId,
        type: "booking",
        title: "Booking Confirmed",
        body: `Your ${data.service} booking for ${data.date} has been received.`,
        data: {
          bookingId: docRef.id,
        },
        read: false,
        createdAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      bookingId: docRef.id,
      message: "Booking created successfully",
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json(
      { error: "Failed to create booking. Please try again." },
      { status: 500 }
    );
  }
}
