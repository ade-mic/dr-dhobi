import { NextResponse } from "next/server";
import { collection, doc, getDocs, setDoc, deleteDoc, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";

export type ServiceItem = {
  id: string;
  name: string;
  icon: string;
  description: string;
  features: string[];
  pricing: { item: string; price: number }[];
  turnaround: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

// Default services matching the original static definitions
const defaultServices: ServiceItem[] = [
  {
    id: "dry-cleaning",
    name: "Dry Cleaning",
    icon: "dry-cleaning",
    description:
      "Our premium dry cleaning service uses eco-friendly solvents and expert techniques to restore your delicate garments to pristine condition.",
    features: [
      "Eco-friendly solvent cleaning",
      "Hand finishing by experts",
      "Stain pre-treatment included",
      "Quality inspection before delivery",
      "Suitable for silk, wool, and designer wear",
    ],
    pricing: [
      { item: "Shirt / Top", price: 50 },
      { item: "Trousers / Jeans", price: 60 },
      { item: "Suit (2-piece)", price: 250 },
      { item: "Dress / Saree", price: 100 },
      { item: "Jacket / Blazer", price: 150 },
    ],
    turnaround: "48 hours",
    order: 1,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "wash-fold",
    name: "Wash & Fold",
    icon: "wash-fold",
    description:
      "Professional washing with soft water and premium detergents, followed by neat folding and packaging. Perfect for everyday wear.",
    features: [
      "Soft water washing technology",
      "Hypoallergenic detergents",
      "Separate wash for colors",
      "Neatly folded and packaged",
      "Weight-based pricing available",
    ],
    pricing: [
      { item: "T-Shirt / Top", price: 30 },
      { item: "Shirt (formal)", price: 40 },
      { item: "Trousers / Jeans", price: 40 },
      { item: "Bedsheet (single)", price: 60 },
      { item: "Per kg (mixed)", price: 80 },
    ],
    turnaround: "24 hours",
    order: 2,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "express",
    name: "Express Pickup",
    icon: "express",
    description:
      "Need it done fast? Our express service guarantees 30-minute pickup and same-day delivery within Bangalore city limits.",
    features: [
      "30-minute pickup guarantee",
      "Same-day delivery available",
      "Live rider tracking",
      "Priority processing",
      "Available 7 AM - 9 PM daily",
    ],
    pricing: [
      { item: "Express surcharge", price: 100 },
      { item: "Same-day delivery", price: 150 },
    ],
    turnaround: "Same day",
    order: 3,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "ironing",
    name: "Premium Ironing",
    icon: "ironing",
    description:
      "Professional steam ironing with attention to every crease and collar. Your clothes will look brand new.",
    features: [
      "Professional steam ironing",
      "Collar and cuff attention",
      "Hanger delivery available",
      "Starch level customization",
      "Perfect for formal wear",
    ],
    pricing: [
      { item: "Shirt / Top", price: 20 },
      { item: "Trousers", price: 25 },
      { item: "Dress / Saree", price: 40 },
      { item: "Suit (2-piece)", price: 80 },
    ],
    turnaround: "24 hours",
    order: 4,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// GET - Fetch all services
export async function GET() {
  try {
    const servicesRef = collection(db, "services");
    
    // Try to get services without ordering first (avoids index requirement)
    let snapshot;
    try {
      const q = query(servicesRef, orderBy("order", "asc"));
      snapshot = await getDocs(q);
    } catch (indexError) {
      // If orderBy fails (missing index), fetch without ordering
      console.log("Fetching without order, index may be missing:", indexError);
      snapshot = await getDocs(servicesRef);
    }

    if (snapshot.empty) {
      // Initialize with default services if none exist
      console.log("No services found, initializing with defaults...");
      for (const service of defaultServices) {
        await setDoc(doc(db, "services", service.id), service);
      }
      return NextResponse.json(defaultServices);
    }

    const services = snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    })) as ServiceItem[];

    // Sort by order if we fetched without ordering
    services.sort((a, b) => (a.order || 99) - (b.order || 99));

    return NextResponse.json(services);
  } catch (error) {
    console.error("Error fetching services:", error);
    // Return default services on error so the page still works
    return NextResponse.json(defaultServices);
  }
}

// POST - Create or update a service
export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Generate ID if not provided (new service)
    const serviceId = data.id || data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    
    const serviceData: ServiceItem = {
      id: serviceId,
      name: data.name,
      icon: data.icon || "default",
      description: data.description || "",
      features: data.features || [],
      pricing: data.pricing || [],
      turnaround: data.turnaround || "24 hours",
      order: data.order || 99,
      isActive: data.isActive !== undefined ? data.isActive : true,
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await setDoc(doc(db, "services", serviceId), serviceData);

    return NextResponse.json({ success: true, service: serviceData });
  } catch (error) {
    console.error("Error saving service:", error);
    return NextResponse.json(
      { error: "Failed to save service" },
      { status: 500 }
    );
  }
}

// DELETE - Remove a service
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const serviceId = searchParams.get("id");

    if (!serviceId) {
      return NextResponse.json(
        { error: "Service ID is required" },
        { status: 400 }
      );
    }

    await deleteDoc(doc(db, "services", serviceId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting service:", error);
    return NextResponse.json(
      { error: "Failed to delete service" },
      { status: 500 }
    );
  }
}
