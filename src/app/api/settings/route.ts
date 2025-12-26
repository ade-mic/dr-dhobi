import { NextResponse } from "next/server";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { defaultSettings, SiteSettings } from "@/lib/siteSettings";

const SETTINGS_DOC = "site";

export async function GET() {
  try {
    const docRef = doc(db, "settings", SETTINGS_DOC);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data() as SiteSettings;
      // Merge with defaults to ensure all fields exist
      return NextResponse.json({ ...defaultSettings, ...data });
    }

    // Return defaults if no settings exist
    return NextResponse.json(defaultSettings);
  } catch (error) {
    console.error("Error fetching settings:", error);
    // Return defaults on error
    return NextResponse.json(defaultSettings);
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();

    const docRef = doc(db, "settings", SETTINGS_DOC);
    await setDoc(docRef, {
      ...data,
      updatedAt: new Date().toISOString(),
    }, { merge: true });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving settings:", error);
    return NextResponse.json(
      { error: "Failed to save settings" },
      { status: 500 }
    );
  }
}
