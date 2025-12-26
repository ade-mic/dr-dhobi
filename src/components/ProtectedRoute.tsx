"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "admin" | "user" | "any";
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  requiredRole = "any",
  redirectTo = "/login",
}: ProtectedRouteProps) {
  const router = useRouter();
  const { user, userProfile, loading, isAdmin, isUser } = useAuth();

  useEffect(() => {
    if (loading) return;

    // Not logged in
    if (!user) {
      router.push(redirectTo);
      return;
    }

    // Check role requirements
    if (requiredRole === "admin" && !isAdmin) {
      // User trying to access admin routes
      router.push("/user/dashboard");
      return;
    }

    if (requiredRole === "user" && !isUser) {
      // Admin trying to access user-only routes (optional, usually admins can access everything)
      // You might want to allow admins to access user routes
      return;
    }
  }, [user, userProfile, loading, isAdmin, isUser, requiredRole, router, redirectTo]);

  // Show loading state
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          fontSize: "1.2rem",
          color: "#666",
        }}
      >
        Loading...
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return null;
  }

  // Role check for admin routes
  if (requiredRole === "admin" && !isAdmin) {
    return null;
  }

  return <>{children}</>;
}

// Convenience components for common use cases
export function AdminRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRole="admin" redirectTo="/login">
      {children}
    </ProtectedRoute>
  );
}

export function UserRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRole="any" redirectTo="/login">
      {children}
    </ProtectedRoute>
  );
}
