import { NextRequest, NextResponse } from "next/server";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

// Initialize Firebase Admin SDK
function getFirebaseAdmin() {
  if (getApps().length === 0) {
    // Use environment variables for Firebase Admin credentials
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
      : null;

    if (serviceAccount) {
      initializeApp({
        credential: cert(serviceAccount),
      });
    } else {
      // For development, use default credentials or Application Default Credentials
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

// GET - Verify token and get user profile
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "No authorization token provided" },
        { status: 401 }
      );
    }

    const token = authHeader.split("Bearer ")[1];
    const { auth, db } = getFirebaseAdmin();

    // Verify the token
    const decodedToken = await auth.verifyIdToken(token);
    const uid = decodedToken.uid;

    // Get user profile from Firestore
    const userDoc = await db.collection("users").doc(uid).get();

    if (!userDoc.exists) {
      return NextResponse.json(
        { success: false, error: "User profile not found" },
        { status: 404 }
      );
    }

    const userData = userDoc.data();

    return NextResponse.json({
      success: true,
      user: {
        uid,
        name: userData?.name || "",
        email: userData?.email || decodedToken.email || "",
        phone: userData?.phone || "",
        role: userData?.role || "user",
        createdAt: userData?.createdAt || "",
      },
    });
  } catch (error: any) {
    console.error("Token verification error:", error);

    if (error.code === "auth/id-token-expired") {
      return NextResponse.json(
        { success: false, error: "Token expired" },
        { status: 401 }
      );
    }

    if (error.code === "auth/argument-error") {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to verify token" },
      { status: 500 }
    );
  }
}

// POST - Create or update user profile
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "No authorization token provided" },
        { status: 401 }
      );
    }

    const token = authHeader.split("Bearer ")[1];
    const body = await request.json();
    const { action, userData } = body;

    const { auth, db } = getFirebaseAdmin();

    // Verify the token
    const decodedToken = await auth.verifyIdToken(token);
    const uid = decodedToken.uid;

    switch (action) {
      case "create-profile": {
        // Create user profile in Firestore
        const userProfile = {
          name: userData.name,
          email: userData.email || decodedToken.email,
          phone: userData.phone || "",
          role: "user", // Default role is always "user" for new signups
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await db.collection("users").doc(uid).set(userProfile);

        return NextResponse.json({
          success: true,
          user: { uid, ...userProfile },
          message: "Profile created successfully",
        });
      }

      case "update-profile": {
        // Get current user data to preserve role
        const currentDoc = await db.collection("users").doc(uid).get();
        const currentData = currentDoc.data();

        const updateData = {
          name: userData.name || currentData?.name,
          email: userData.email || currentData?.email,
          phone: userData.phone || currentData?.phone,
          role: currentData?.role || "user", // Preserve existing role
          updatedAt: new Date().toISOString(),
        };

        await db.collection("users").doc(uid).update(updateData);

        return NextResponse.json({
          success: true,
          user: { uid, ...updateData, createdAt: currentData?.createdAt },
          message: "Profile updated successfully",
        });
      }

      case "set-role": {
        // Only admins can change roles
        const adminDoc = await db.collection("users").doc(uid).get();
        const adminData = adminDoc.data();

        if (adminData?.role !== "admin") {
          return NextResponse.json(
            { success: false, error: "Only admins can change user roles" },
            { status: 403 }
          );
        }

        const { targetUid, newRole } = userData;

        if (!targetUid || !["admin", "user"].includes(newRole)) {
          return NextResponse.json(
            { success: false, error: "Invalid target user or role" },
            { status: 400 }
          );
        }

        await db.collection("users").doc(targetUid).update({
          role: newRole,
          updatedAt: new Date().toISOString(),
        });

        return NextResponse.json({
          success: true,
          message: `User role updated to ${newRole}`,
        });
      }

      default:
        return NextResponse.json(
          { success: false, error: "Invalid action" },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error("Profile API error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
