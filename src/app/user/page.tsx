"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

export default function UserIndexRoute() {
  const router = useRouter();
  const { user, userProfile, loading, isAdmin } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    // Redirect based on role
    if (isAdmin) {
      router.replace("/admin");
    } else {
      router.replace("/user/dashboard");
    }
  }, [user, userProfile, loading, isAdmin, router]);

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #1e8ba5 0%, #167a8d 100%)",
      color: "white",
      padding: "2rem",
      textAlign: "center",
    }}>
      <div>
        <h1 style={{ margin: 0 }}>Redirecting…</h1>
        <p style={{ opacity: 0.9 }}>
          {loading
            ? "Checking your account and sending you to the right place."
            : "Almost there…"}
        </p>
      </div>
    </div>
  );
}
