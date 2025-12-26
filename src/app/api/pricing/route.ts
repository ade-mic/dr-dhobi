import { NextResponse } from "next/server";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Default service pricing structure
const defaultServicePricing = {
  "dry-cleaning": {
    name: "Dry Cleaning",
    turnaround: "48 hours",
    items: [
      { item: "Shirt / Top", price: 50 },
      { item: "Trousers / Jeans", price: 60 },
      { item: "Suit (2-piece)", price: 250 },
      { item: "Dress / Saree", price: 100 },
      { item: "Jacket / Blazer", price: 150 },
    ],
  },
  "wash-fold": {
    name: "Wash & Fold",
    turnaround: "24 hours",
    items: [
      { item: "T-Shirt / Top", price: 30 },
      { item: "Shirt (formal)", price: 40 },
      { item: "Trousers / Jeans", price: 40 },
      { item: "Bedsheet (single)", price: 60 },
      { item: "Per kg (mixed)", price: 80 },
    ],
  },
  "express": {
    name: "Express Pickup",
    turnaround: "Same day",
    items: [
      { item: "Express surcharge", price: 100 },
      { item: "Same-day delivery", price: 150 },
    ],
  },
  "ironing": {
    name: "Premium Ironing",
    turnaround: "24 hours",
    items: [
      { item: "Shirt / Top", price: 20 },
      { item: "Trousers", price: 25 },
      { item: "Dress / Saree", price: 40 },
      { item: "Suit (2-piece)", price: 80 },
    ],
  },
};

export async function GET() {
  try {
    const docRef = doc(db, "settings", "pricing");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      // Merge with defaults to ensure all services exist
      return NextResponse.json({
        items: data.items || {
          shirts: 30,
          trousers: 40,
          tshirts: 25,
          jeans: 50,
          sarees: 80,
          kurtas: 45,
          bedsheets: 60,
          towels: 15,
        },
        pickupCharge: data.pickupCharge || 50,
        freePickupThreshold: data.freePickupThreshold || 300,
        services: data.services || defaultServicePricing,
        updatedAt: data.updatedAt,
      });
    } else {
      // Return default pricing if not set
      const defaultPricing = {
        items: {
          shirts: 30,
          trousers: 40,
          tshirts: 25,
          jeans: 50,
          sarees: 80,
          kurtas: 45,
          bedsheets: 60,
          towels: 15,
        },
        pickupCharge: 50,
        freePickupThreshold: 300,
        services: defaultServicePricing,
        updatedAt: new Date().toISOString(),
      };
      return NextResponse.json(defaultPricing);
    }
  } catch (error) {
    console.error("Error fetching pricing:", error);
    return NextResponse.json(
      { error: "Failed to fetch pricing" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const docRef = doc(db, "settings", "pricing");
    
    await setDoc(docRef, {
      ...data,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating pricing:", error);
    return NextResponse.json(
      { error: "Failed to update pricing" },
      { status: 500 }
    );
  }
}
