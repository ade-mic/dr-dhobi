import { NextRequest, NextResponse } from "next/server";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { BookingFormData } from "@/types/booking";

export async function POST(request: NextRequest) {
  try {
    const data: BookingFormData & { userId?: string } = await request.json();

    // Validate required fields
    if (!data.name || !data.phone || !data.service || !data.date || !data.slot || !data.address) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Extract userId if passed from client
    const { userId, ...bookingFields } = data;

    // Create booking in Firestore
    const bookingData = {
      ...bookingFields,
      ...(userId && { userId }),
      status: "pending",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, "bookings"), bookingData);

    // Create notification for user if they have a userId
    if (userId) {
      try {
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
      } catch (notifError) {
        console.error("Error creating notification:", notifError);
        // Don't fail the booking if notification fails
      }
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
