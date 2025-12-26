import { NextResponse } from "next/server";
import { collection, addDoc, query, orderBy, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function GET() {
  try {
    const q = query(collection(db, "quoteRequests"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    
    const quotes = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(quotes);
  } catch (error) {
    console.error("Error fetching quote requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch quote requests" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    const docRef = await addDoc(collection(db, "quoteRequests"), {
      ...data,
      createdAt: new Date().toISOString(),
      status: "pending",
    });

    return NextResponse.json({ 
      success: true, 
      id: docRef.id 
    });
  } catch (error) {
    console.error("Error saving quote request:", error);
    return NextResponse.json(
      { error: "Failed to save quote request" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, status } = await request.json();
    
    await updateDoc(doc(db, "quoteRequests", id), {
      status,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating quote request:", error);
    return NextResponse.json(
      { error: "Failed to update quote request" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    
    await deleteDoc(doc(db, "quoteRequests", id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting quote request:", error);
    return NextResponse.json(
      { error: "Failed to delete quote request" },
      { status: 500 }
    );
  }
}
