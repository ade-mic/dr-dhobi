import { NextRequest, NextResponse } from "next/server";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
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

// GET - Get user's conversations or specific conversation messages
export async function GET(request: NextRequest) {
  try {
    const user = await verifyUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get("conversationId");
    const { db } = getFirebaseAdmin();

    if (conversationId) {
      // Get messages for a specific conversation
      const conversationDoc = await db.collection("conversations").doc(conversationId).get();
      
      if (!conversationDoc.exists) {
        return NextResponse.json({ success: false, error: "Conversation not found" }, { status: 404 });
      }

      const conversation = conversationDoc.data();
      
      // Check access
      if (user.role !== "admin" && conversation?.userId !== user.uid) {
        return NextResponse.json({ success: false, error: "Access denied" }, { status: 403 });
      }

      // Get messages
      const messagesSnapshot = await db
        .collection("conversations")
        .doc(conversationId)
        .collection("messages")
        .orderBy("createdAt", "asc")
        .get();

      const messages = messagesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Mark messages as read
      const batch = db.batch();
      const unreadField = user.role === "admin" ? "unreadByAdmin" : "unreadByUser";
      
      messagesSnapshot.docs.forEach((doc) => {
        const msgData = doc.data();
        if (!msgData.read && msgData.senderRole !== user.role) {
          batch.update(doc.ref, { read: true });
        }
      });
      
      // Reset unread count
      batch.update(db.collection("conversations").doc(conversationId), {
        [unreadField]: 0,
      });
      
      await batch.commit();

      return NextResponse.json({
        success: true,
        conversation: { id: conversationDoc.id, ...conversation },
        messages,
      });
    } else {
      // Get all conversations for user
      let query;
      
      if (user.role === "admin") {
        // Admins see all conversations
        query = db.collection("conversations").orderBy("lastMessageAt", "desc");
      } else {
        // Users see only their conversations
        query = db
          .collection("conversations")
          .where("userId", "==", user.uid)
          .orderBy("lastMessageAt", "desc");
      }

      const snapshot = await query.get();
      const conversations = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return NextResponse.json({ success: true, conversations });
    }
  } catch (error: any) {
    console.error("Chat GET error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create conversation or send message
export async function POST(request: NextRequest) {
  try {
    const user = await verifyUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action, conversationId, message, subject, relatedBookingId } = body;
    const { db } = getFirebaseAdmin();

    switch (action) {
      case "create-conversation": {
        // Create a new conversation (user only)
        const newConversation = {
          userId: user.uid,
          userName: user.name,
          userEmail: user.email || "",
          status: "open",
          subject: subject || "General Inquiry",
          lastMessage: message || "Started a conversation",
          lastMessageAt: new Date().toISOString(),
          lastMessageBy: "user",
          unreadByUser: 0,
          unreadByAdmin: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          relatedBookingId: relatedBookingId || null,
        };

        const conversationRef = await db.collection("conversations").add(newConversation);

        // Add initial message if provided
        if (message) {
          await conversationRef.collection("messages").add({
            conversationId: conversationRef.id,
            senderId: user.uid,
            senderName: user.name,
            senderRole: "user",
            message,
            messageType: "text",
            read: false,
            createdAt: new Date().toISOString(),
          });
        }

        // Create notification for admins
        const adminsSnapshot = await db.collection("users").where("role", "==", "admin").get();
        const batch = db.batch();
        
        adminsSnapshot.docs.forEach((adminDoc) => {
          const notificationRef = db.collection("notifications").doc();
          batch.set(notificationRef, {
            userId: adminDoc.id,
            type: "message",
            title: "New Support Request",
            body: `${user.name} started a new conversation: ${subject || "General Inquiry"}`,
            data: {
              conversationId: conversationRef.id,
              senderId: user.uid,
            },
            read: false,
            createdAt: new Date().toISOString(),
          });
        });
        
        await batch.commit();

        return NextResponse.json({
          success: true,
          conversationId: conversationRef.id,
          message: "Conversation created successfully",
        });
      }

      case "send-message": {
        if (!conversationId || !message) {
          return NextResponse.json(
            { success: false, error: "Conversation ID and message are required" },
            { status: 400 }
          );
        }

        const conversationRef = db.collection("conversations").doc(conversationId);
        const conversationDoc = await conversationRef.get();

        if (!conversationDoc.exists) {
          return NextResponse.json({ success: false, error: "Conversation not found" }, { status: 404 });
        }

        const conversation = conversationDoc.data();

        // Check access
        if (user.role !== "admin" && conversation?.userId !== user.uid) {
          return NextResponse.json({ success: false, error: "Access denied" }, { status: 403 });
        }

        // Add message
        const messageRef = await conversationRef.collection("messages").add({
          conversationId,
          senderId: user.uid,
          senderName: user.name,
          senderRole: user.role,
          message,
          messageType: "text",
          read: false,
          createdAt: new Date().toISOString(),
        });

        // Update conversation
        const unreadField = user.role === "admin" ? "unreadByUser" : "unreadByAdmin";
        await conversationRef.update({
          lastMessage: message.substring(0, 100),
          lastMessageAt: new Date().toISOString(),
          lastMessageBy: user.role,
          [unreadField]: FieldValue.increment(1),
          updatedAt: new Date().toISOString(),
          status: conversation?.status === "resolved" ? "open" : conversation?.status,
        });

        // Create notification for the other party
        const recipientId = user.role === "admin" ? conversation?.userId : null;
        
        if (recipientId) {
          // Notify user
          await db.collection("notifications").add({
            userId: recipientId,
            type: "message",
            title: "New Message from Support",
            body: message.substring(0, 100),
            data: {
              conversationId,
              senderId: user.uid,
            },
            read: false,
            createdAt: new Date().toISOString(),
          });
        } else if (user.role === "user") {
          // Notify all admins
          const adminsSnapshot = await db.collection("users").where("role", "==", "admin").get();
          const batch = db.batch();
          
          adminsSnapshot.docs.forEach((adminDoc) => {
            const notificationRef = db.collection("notifications").doc();
            batch.set(notificationRef, {
              userId: adminDoc.id,
              type: "message",
              title: `Message from ${user.name}`,
              body: message.substring(0, 100),
              data: {
                conversationId,
                senderId: user.uid,
              },
              read: false,
              createdAt: new Date().toISOString(),
            });
          });
          
          await batch.commit();
        }

        return NextResponse.json({
          success: true,
          messageId: messageRef.id,
          message: "Message sent successfully",
        });
      }

      case "update-status": {
        if (!conversationId) {
          return NextResponse.json(
            { success: false, error: "Conversation ID is required" },
            { status: 400 }
          );
        }

        // Only admins can update status
        if (user.role !== "admin") {
          return NextResponse.json({ success: false, error: "Access denied" }, { status: 403 });
        }

        const { status } = body;
        if (!["open", "pending", "resolved", "closed"].includes(status)) {
          return NextResponse.json({ success: false, error: "Invalid status" }, { status: 400 });
        }

        await db.collection("conversations").doc(conversationId).update({
          status,
          updatedAt: new Date().toISOString(),
          assignedAdminId: user.uid,
          assignedAdminName: user.name,
        });

        return NextResponse.json({
          success: true,
          message: "Conversation status updated",
        });
      }

      default:
        return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
    }
  } catch (error: any) {
    console.error("Chat POST error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
