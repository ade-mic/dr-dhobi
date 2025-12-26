"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { UserRole } from "@/types/user";
import { FcGoogle } from "react-icons/fc";
import styles from "./page.module.css";

export default function LoginPage() {
  const router = useRouter();
  const [isSignup, setIsSignup] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isSignup) {
        // Create new user account
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );

        // Create user profile with default "user" role
        await setDoc(doc(db, "users", userCredential.user.uid), {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          role: "user" as UserRole, // All new signups are users
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });

        // Redirect to user dashboard after signup
        router.push("/user/dashboard");
      } else {
        // Sign in existing user
        const userCredential = await signInWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );

        // Get user profile to check role
        const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));

        if (userDoc.exists()) {
          const userData = userDoc.data();
          const role = userData.role as UserRole;

          // Redirect based on role
          if (role === "admin") {
            router.push("/admin");
          } else {
            router.push("/user/dashboard");
          }
        } else {
          // If no profile exists, create one with default user role
          await setDoc(doc(db, "users", userCredential.user.uid), {
            name: "",
            email: formData.email,
            role: "user" as UserRole,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
          router.push("/user/dashboard");
        }
      }
    } catch (err: any) {
      console.error("Authentication error:", err);

      // User-friendly error messages
      switch (err.code) {
        case "auth/email-already-in-use":
          setError("Email already in use. Please sign in instead.");
          break;
        case "auth/invalid-credential":
          setError("Invalid email or password");
          break;
        case "auth/weak-password":
          setError("Password should be at least 6 characters");
          break;
        case "auth/invalid-email":
          setError("Invalid email address");
          break;
        case "auth/user-disabled":
          setError("This account has been disabled");
          break;
        case "auth/user-not-found":
          setError("No account found with this email");
          break;
        case "auth/wrong-password":
          setError("Incorrect password");
          break;
        default:
          setError(err.message || "Authentication failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignup(!isSignup);
    setIsForgotPassword(false);
    setResetEmailSent(false);
    setError("");
    setFormData({ name: "", email: "", password: "", phone: "" });
  };

  const handleForgotPassword = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!formData.email) {
      setError("Please enter your email address");
      setLoading(false);
      return;
    }

    try {
      await sendPasswordResetEmail(auth, formData.email);
      setResetEmailSent(true);
    } catch (err: any) {
      console.error("Password reset error:", err);

      switch (err.code) {
        case "auth/user-not-found":
          setError("No account found with this email address");
          break;
        case "auth/invalid-email":
          setError("Invalid email address");
          break;
        case "auth/too-many-requests":
          setError("Too many attempts. Please try again later.");
          break;
        default:
          setError(err.message || "Failed to send reset email. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user profile exists
      const userDoc = await getDoc(doc(db, "users", user.uid));

      if (userDoc.exists()) {
        // Existing user - redirect based on role
        const userData = userDoc.data();
        const role = userData.role as UserRole;

        if (role === "admin") {
          router.push("/admin");
        } else {
          router.push("/user/dashboard");
        }
      } else {
        // New user - create profile with default user role
        await setDoc(doc(db, "users", user.uid), {
          name: user.displayName || "",
          email: user.email || "",
          phone: user.phoneNumber || "",
          photoURL: user.photoURL || "",
          role: "user" as UserRole,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        router.push("/user/dashboard");
      }
    } catch (err: any) {
      console.error("Google sign-in error:", err);

      switch (err.code) {
        case "auth/popup-closed-by-user":
          setError("Sign-in was cancelled");
          break;
        case "auth/popup-blocked":
          setError("Pop-up was blocked. Please allow pop-ups for this site.");
          break;
        case "auth/account-exists-with-different-credential":
          setError("An account already exists with this email using a different sign-in method.");
          break;
        default:
          setError(err.message || "Google sign-in failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginCard}>
        <div className={styles.logoSection}>
          <div className={styles.logoIcon}>🧺</div>
          <h1>Dr Dhobi</h1>
          <p className={styles.subtitle}>
            {isForgotPassword 
              ? "Reset your password" 
              : isSignup 
                ? "Create your account" 
                : "Welcome back!"}
          </p>
        </div>

        {error && <div className={styles.error}>⚠️ {error}</div>}

        {resetEmailSent ? (
          <div className={styles.successMessage}>
            <div className={styles.successIcon}>✉️</div>
            <h3>Check your email</h3>
            <p>We&apos;ve sent a password reset link to <strong>{formData.email}</strong></p>
            <p className={styles.successHint}>
              Didn&apos;t receive the email? Check your spam folder or try again.
            </p>
            <button
              type="button"
              onClick={() => {
                setIsForgotPassword(false);
                setResetEmailSent(false);
                setFormData({ name: "", email: "", password: "", phone: "" });
              }}
              className={styles.submitBtn}
            >
              Back to Sign In
            </button>
          </div>
        ) : isForgotPassword ? (
          <form onSubmit={handleForgotPassword} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="your.email@example.com"
                required
                disabled={loading}
                className={styles.input}
              />
            </div>

            <button type="submit" disabled={loading} className={styles.submitBtn}>
              {loading ? "Sending..." : "Send Reset Link"}
            </button>

            <button
              type="button"
              onClick={() => {
                setIsForgotPassword(false);
                setError("");
              }}
              className={styles.backBtn}
              disabled={loading}
            >
              ← Back to Sign In
            </button>
          </form>
        ) : (
          <>
            <form onSubmit={handleSubmit} className={styles.form}>
          {isSignup && (
            <div className={styles.formGroup}>
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter your full name"
                required={isSignup}
                disabled={loading}
                className={styles.input}
              />
            </div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="your.email@example.com"
              required
              disabled={loading}
              className={styles.input}
            />
          </div>

          {isSignup && (
            <div className={styles.formGroup}>
              <label htmlFor="phone">Phone Number</label>
              <input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="+91 XXXXX XXXXX"
                required={isSignup}
                disabled={loading}
                className={styles.input}
              />
            </div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              placeholder="Enter your password"
              required
              minLength={6}
              disabled={loading}
              className={styles.input}
            />
            {!isSignup && (
              <button
                type="button"
                onClick={() => {
                  setIsForgotPassword(true);
                  setError("");
                }}
                className={styles.forgotPasswordBtn}
                disabled={loading}
              >
                Forgot password?
              </button>
            )}
          </div>

          <button type="submit" disabled={loading} className={styles.submitBtn}>
            {loading ? "Please wait..." : isSignup ? "Create Account" : "Sign In"}
          </button>
        </form>

        <div className={styles.divider}>
          <span>or</span>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className={styles.googleBtn}
        >
          <FcGoogle className={styles.googleIcon} />
          Continue with Google
        </button>

        <div className={styles.toggleSection}>
          <p>
            {isSignup ? "Already have an account?" : "Don't have an account?"}
            <button
              type="button"
              onClick={toggleMode}
              className={styles.toggleBtn}
              disabled={loading}
            >
              {isSignup ? "Sign In" : "Sign Up"}
            </button>
          </p>
        </div>
        </>
        )}
      </div>
    </div>
  );
}
