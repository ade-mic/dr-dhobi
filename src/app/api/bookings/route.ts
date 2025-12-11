import { NextRequest, NextResponse } from "next/server";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { BookingFormData } from "@/types/booking";

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

    // Create booking in Firestore
    const bookingData = {
      ...data,
      status: "pending",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, "bookings"), bookingData);

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
