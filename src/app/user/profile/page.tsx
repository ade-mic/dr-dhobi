"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import { auth, db } from "@/lib/firebase";
import { useAuth } from "@/components/AuthProvider";
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential, signOut } from "firebase/auth";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { MdPerson, MdEmail, MdPhone, MdLock, MdArrowBack, MdSave } from "react-icons/md";

export default function ProfilePage() {
  const router = useRouter();
  const { user, userProfile, loading: authLoading, isAdmin, refreshProfile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Handle authentication and role-based redirects
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    // Redirect admins to admin dashboard
    if (isAdmin) {
      router.push("/admin");
      return;
    }

    // Initialize form data with profile data
    if (userProfile) {
      setFormData({
        name: userProfile.name || "",
        phone: userProfile.phone || "",
      });
    }
  }, [authLoading, user, userProfile, isAdmin, router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      if (!user) throw new Error("Not authenticated");

      await updateDoc(doc(db, "users", user.uid), {
        name: formData.name,
        phone: formData.phone,
      });

      await refreshProfile();
      setSuccess("Profile updated successfully!");
    } catch (error: any) {
      setError(error.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      const currentUser = auth.currentUser;
      if (!currentUser || !currentUser.email) throw new Error("Not authenticated");

      // Re-authenticate user before changing password
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        passwordData.currentPassword
      );
      await reauthenticateWithCredential(currentUser, credential);

      // Update password
      await updatePassword(currentUser, passwordData.newPassword);

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setSuccess("Password changed successfully!");
    } catch (error: any) {
      if (error.code === "auth/wrong-password") {
        setError("Current password is incorrect");
      } else {
        setError(error.message || "Failed to change password");
      }
    }
  };

  const handleDeleteAccount = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("Not authenticated");

      // Delete user document from Firestore
      await deleteDoc(doc(db, "users", currentUser.uid));

      // Delete authentication account
      await currentUser.delete();

      router.push("/");
    } catch (error: any) {
      setError(error.message || "Failed to delete account");
      setShowDeleteConfirm(false);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/login");
  };

  if (authLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.loading}>Loading profile...</div>
        </div>
      </div>
    );
  }

  if (!user || isAdmin) {
    return null;
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <button onClick={() => router.push("/user/dashboard")} className={styles.backButton}>
            <MdArrowBack /> Back to Dashboard
          </button>
          <h1>My Profile</h1>
          <p>Manage your account settings and preferences</p>
        </div>

        {error && <div className={styles.error}>{error}</div>}
        {success && <div className={styles.success}>{success}</div>}

        <div className={styles.content}>
          {/* Profile Information */}
          <div className={styles.card}>
            <h2>
              <MdPerson /> Profile Information
            </h2>
            <form onSubmit={handleUpdateProfile}>
              <div className={styles.formGroup}>
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="email">
                  <MdEmail /> Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={userProfile?.email || ""}
                  disabled
                  className={styles.disabled}
                />
                <small>Email cannot be changed</small>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="phone">
                  <MdPhone /> Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>

              <button type="submit" className={styles.saveButton} disabled={saving}>
                <MdSave /> {saving ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>

          {/* Change Password */}
          <div className={styles.card}>
            <h2>
              <MdLock /> Change Password
            </h2>
            <form onSubmit={handleChangePassword}>
              <div className={styles.formGroup}>
                <label htmlFor="currentPassword">Current Password</label>
                <input
                  type="password"
                  id="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, currentPassword: e.target.value })
                  }
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="newPassword">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, newPassword: e.target.value })
                  }
                  required
                  minLength={6}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                  }
                  required
                  minLength={6}
                />
              </div>

              <button type="submit" className={styles.saveButton}>
                <MdLock /> Update Password
              </button>
            </form>
          </div>

          {/* Account Actions */}
          <div className={styles.card}>
            <h2>Account Actions</h2>
            
            <div className={styles.actions}>
              <button onClick={handleSignOut} className={styles.signOutButton}>
                Sign Out
              </button>

              <div className={styles.dangerZone}>
                <h3>Danger Zone</h3>
                <p>Once you delete your account, there is no going back. Please be certain.</p>
                
                {!showDeleteConfirm ? (
                  <button onClick={handleDeleteAccount} className={styles.deleteButton}>
                    Delete Account
                  </button>
                ) : (
                  <div className={styles.confirmDelete}>
                    <p className={styles.warning}>
                      Are you sure? This action cannot be undone!
                    </p>
                    <div className={styles.confirmButtons}>
                      <button onClick={handleDeleteAccount} className={styles.confirmDeleteButton}>
                        Yes, Delete My Account
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className={styles.cancelButton}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
