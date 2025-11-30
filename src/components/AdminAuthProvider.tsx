"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        // No user logged in, redirect to login
        router.push("/admin/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  return <>{children}</>;
}
