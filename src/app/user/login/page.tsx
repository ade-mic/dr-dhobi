"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Redirect old user login to unified login page
export default function UserLoginRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/login");
  }, [router]);

  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "100vh",
      fontSize: "1.2rem",
      color: "#666",
    }}>
      Redirecting to login...
    </div>
  );
}
