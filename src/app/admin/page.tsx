"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import type { Booking } from "@/types/booking";
import styles from "./page.module.css";

type BookingWithId = Booking & { id: string };

export default function AdminDashboard() {
  const router = useRouter();
  const [bookings, setBookings] = useState<BookingWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string>("");
  const [filter, setFilter] = useState<string>("all");
  const [selectedBooking, setSelectedBooking] = useState<BookingWithId | null>(null);
  const [messageType, setMessageType] = useState<"email" | "whatsapp">("email");
  const [message, setMessage] = useState("");
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>("default");

  const isNotificationSupported = useMemo(
    () => typeof window !== "undefined" && "Notification" in window,
    []
  );

  useEffect(() => {
    if (!isNotificationSupported) {
      setNotificationPermission("denied");
      return;
    }

    setNotificationPermission(Notification.permission);
    
    // Listen for permission changes
    const checkPermission = setInterval(() => {
      if (Notification.permission !== notificationPermission) {
        setNotificationPermission(Notification.permission);
      }
    }, 1000);

    return () => clearInterval(checkPermission);
  }, [isNotificationSupported, notificationPermission]);

  const requestNotificationPermission = async () => {
    if (!isNotificationSupported) {
      alert("Notifications are not supported in this browser");
      return;
    }

    try {
      const permissionResult = await Notification.requestPermission();
      setNotificationPermission(permissionResult);
      
      if (permissionResult === "granted") {
        // Send a test notification
        showTestNotification();
      } else {
        alert("Notification permission was denied. Please enable notifications in your browser settings.");
      }
    } catch (error) {
      console.error("Notification permission request failed", error);
      alert("Failed to request notification permission");
    }
  };

  const showTestNotification = () => {
    if (!isNotificationSupported || Notification.permission !== "granted") return;

    try {
      const notification = new Notification("🧺 Dr Dhobi - Test Notification", {
        body: "You will receive notifications like this when new bookings arrive!",
        icon: "/icons/icon-192.svg",
        badge: "/icons/icon-192.svg",
        tag: "test-notification",
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      console.log("Test notification sent successfully");
    } catch (error) {
      console.error("Failed to show test notification:", error);
    }
  };

  // Check authentication
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setIsAuthenticated(false);
        setAuthLoading(false);
        router.push("/admin/login");
        return;
      }

      setUserEmail(user.email || "");
      setIsAuthenticated(true);
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  // Listen for new bookings and send browser notifications
  useEffect(() => {
    if (!isAuthenticated) return;

    setLoading(true);
    const q = query(
      collection(db, "bookings"),
      orderBy("createdAt", "desc")
    );

    let isFirstLoad = true;
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const bookingData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as BookingWithId[];
      
      if (!isFirstLoad) {
        const newlyAdded = snapshot
          .docChanges()
          .filter((change) => change.type === "added" && !change.doc.metadata.hasPendingWrites)
          .map((change) => ({
            id: change.doc.id,
            ...change.doc.data(),
          })) as BookingWithId[];

        if (newlyAdded.length > 0) {
          console.log(`🔔 ${newlyAdded.length} new booking(s) detected:`, newlyAdded);
          
          if (notificationPermission === "granted") {
            newlyAdded.forEach((newBooking) => {
              try {
                const notification = new Notification("🧺 Dr Dhobi - New Booking!", {
                  body: `${newBooking.name} booked ${newBooking.service}\nPhone: ${newBooking.phone}`,
                  icon: "/icons/icon-192.svg",
                  badge: "/icons/icon-192.svg",
                  tag: `booking-${newBooking.id}`,
                  requireInteraction: true,
                });

                notification.onclick = () => {
                  window.focus();
                  notification.close();
                };

                console.log("✅ Notification sent for booking:", newBooking.id);

                // Try to play sound (non-blocking)
                try {
                  const audio = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHmq+8OOYTgwOVKzn77RiFQU7k9n0yoA1Bh9qvu/fnEkMDFKs6O6yYBYGPJHY8s2DNwYaabrv45lPDAx");
                  audio.volume = 0.5;
                  audio.play().catch((err) => console.log("Audio play blocked:", err.message));
                } catch (audioError) {
                  console.log("Audio notification skipped:", audioError);
                }
              } catch (notificationError) {
                console.error("Failed to show notification:", notificationError);
              }
            });
          } else {
            console.warn("🔕 New bookings detected but notifications are not granted. Current permission:", notificationPermission);
          }
        }
      }

      setBookings(bookingData);
      setLoading(false);
      isFirstLoad = false;
    });

    return () => unsubscribe();
  }, [isAuthenticated, notificationPermission]);

  const updateBookingStatus = async (bookingId: string, status: Booking["status"]) => {
    try {
      await updateDoc(doc(db, "bookings", bookingId), {
        status,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
    }
  };

  const deleteBooking = async (bookingId: string) => {
    if (!confirm("Are you sure you want to delete this booking?")) return;
    
    try {
      await deleteDoc(doc(db, "bookings", bookingId));
    } catch (error) {
      console.error("Error deleting booking:", error);
      alert("Failed to delete booking");
    }
  };

  
  const filteredBookings = bookings.filter((booking) => {
    if (filter === "all") return true;
    return booking.status === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "#ffd700";
      case "confirmed": return "#1e8ba5";
      case "in-progress": return "#f4a259";
      case "completed": return "#2ecc71";
      case "cancelled": return "#e74c3c";
      default: return "#999";
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push("/admin/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (authLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Checking authentication...</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading bookings...</div>
      </div>
    );
  }

  const shouldShowNotificationBanner = isNotificationSupported && notificationPermission !== "granted";

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div>
            <h1>🧺 Dr Dhobi Admin Dashboard</h1>
            <p className={styles.userEmail}>Logged in as: {userEmail}</p>
          </div>
          <button className={styles.signOutBtn} onClick={handleSignOut}>
            🚪 Sign Out
          </button>
        </div>

        {shouldShowNotificationBanner && (
          <div className={styles.notificationBanner}>
            <span>Enable browser notifications to be alerted when a new booking arrives.</span>
            <button onClick={requestNotificationPermission}>Allow Notifications</button>
          </div>
        )}

        {notificationPermission === "granted" && (
          <div className={styles.notificationSuccess}>
            <span>✅ Notifications enabled! You'll be alerted when new bookings arrive.</span>
            <button onClick={showTestNotification}>Test Notification</button>
          </div>
        )}
        
        <div className={styles.stats}>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>{bookings.length}</span>
            <span className={styles.statLabel}>Total Bookings</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>
              {bookings.filter((b) => b.status === "pending").length}
            </span>
            <span className={styles.statLabel}>Pending</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>
              {bookings.filter((b) => b.status === "in-progress").length}
            </span>
            <span className={styles.statLabel}>In Progress</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>
              {bookings.filter((b) => b.status === "completed").length}
            </span>
            <span className={styles.statLabel}>Completed</span>
          </div>
        </div>
      </div>

      <div className={styles.filters}>
        <button
          className={filter === "all" ? styles.active : ""}
          onClick={() => setFilter("all")}
        >
          All
        </button>
        <button
          className={filter === "pending" ? styles.active : ""}
          onClick={() => setFilter("pending")}
        >
          Pending
        </button>
        <button
          className={filter === "confirmed" ? styles.active : ""}
          onClick={() => setFilter("confirmed")}
        >
          Confirmed
        </button>
        <button
          className={filter === "in-progress" ? styles.active : ""}
          onClick={() => setFilter("in-progress")}
        >
          In Progress
        </button>
        <button
          className={filter === "completed" ? styles.active : ""}
          onClick={() => setFilter("completed")}
        >
          Completed
        </button>
        <button
          className={filter === "cancelled" ? styles.active : ""}
          onClick={() => setFilter("cancelled")}
        >
          Cancelled
        </button>
      </div>

      <div className={styles.bookingsGrid}>
        {filteredBookings.map((booking) => (
          <div key={booking.id} className={styles.bookingCard}>
            <div className={styles.bookingHeader}>
              <div>
                <h3>{booking.name}</h3>
                <p className={styles.bookingId}>ID: {booking.id}</p>
              </div>
              <span
                className={styles.statusBadge}
                style={{ background: getStatusColor(booking.status) }}
              >
                {booking.status}
              </span>
            </div>

            <div className={styles.bookingDetails}>
              <div className={styles.detailRow}>
                <span className={styles.icon}>📞</span>
                <a href={`tel:${booking.phone}`}>{booking.phone}</a>
              </div>
              {booking.email && (
                <div className={styles.detailRow}>
                  <span className={styles.icon}>📧</span>
                  <span>{booking.email}</span>
                </div>
              )}
              <div className={styles.detailRow}>
                <span className={styles.icon}>🧼</span>
                <span>{booking.service}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.icon}>📅</span>
                <span>{new Date(booking.date).toLocaleDateString("en-IN")}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.icon}>⏰</span>
                <span>{booking.slot}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.icon}>📍</span>
                <span>{booking.address}</span>
              </div>
              {booking.notes && (
                <div className={styles.detailRow}>
                  <span className={styles.icon}>📝</span>
                  <span>{booking.notes}</span>
                </div>
              )}
            </div>

            <div className={styles.actions}>
              <select
                value={booking.status}
                onChange={(e) => updateBookingStatus(booking.id, e.target.value as Booking["status"])}
                className={styles.statusSelect}
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              
              <button
                className={styles.messageBtn}
                onClick={() => setSelectedBooking(booking)}
              >
                💬 Message
              </button>
              
              <button
                className={styles.deleteBtn}
                onClick={() => deleteBooking(booking.id)}
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredBookings.length === 0 && (
        <div className={styles.emptyState}>
          <p>No bookings found for this filter</p>
        </div>
      )}

      {selectedBooking && (
        <div className={styles.modal} onClick={() => setSelectedBooking(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2>Send Message to {selectedBooking.name}</h2>
            <p className={styles.modalSubtext}>Booking ID: {selectedBooking.id}</p>

            <div className={styles.messageTypeToggle}>
              <button
                className={messageType === "email" ? styles.active : ""}
                onClick={() => setMessageType("email")}
              >
                📧 Email
              </button>
              <button
                className={messageType === "whatsapp" ? styles.active : ""}
                onClick={() => setMessageType("whatsapp")}
              >
                💬 WhatsApp
              </button>
            </div>

            <textarea
              className={styles.messageInput}
              placeholder={`Enter your ${messageType} message...`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
            />

            <div className={styles.modalActions}>
              <button
                className={styles.cancelBtn}
                onClick={() => setSelectedBooking(null)}
              >
                Cancel
              </button>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
