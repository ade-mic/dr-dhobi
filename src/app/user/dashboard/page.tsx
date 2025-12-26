"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { useAuth } from "@/components/AuthProvider";
import { ChatWidget } from "@/components/ChatWidget";
import { NotificationBell } from "@/components/NotificationBell";
import { collection, query, where, orderBy, onSnapshot, doc, deleteDoc } from "firebase/firestore";
import { MdLogout, MdPerson, MdReceipt, MdRequestQuote, MdHome, MdSettings, MdChat, MdDelete } from "react-icons/md";
import styles from "./page.module.css";
import Image from "next/image";

type Booking = {
  id: string;
  name: string;
  phone: string;
  email: string;
  service: string;
  date: string;
  slot: string;
  address: string;
  notes?: string;
  status: "pending" | "confirmed" | "in-progress" | "completed" | "cancelled";
  createdAt: string;
  userId?: string;
};

type QuoteRequest = {
  id: string;
  name: string;
  phone: string;
  email: string;
  serviceType: string;
  estimatedCost: number;
  createdAt: string;
  status: string;
  weight?: number;
  items?: Record<string, number>;
  userId?: string;
};

export default function UserDashboard() {
  const router = useRouter();
  const { user, userProfile, loading: authLoading, isAdmin } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [activeTab, setActiveTab] = useState<"bookings" | "quotes">("bookings");
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: "booking" | "quote"; id: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

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
  }, [authLoading, user, isAdmin, router]);

  useEffect(() => {
    if (!user) return;

    // Listen to user's bookings
    const bookingsQuery = query(
      collection(db, "bookings"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribeBookings = onSnapshot(bookingsQuery, (snapshot) => {
      const bookingData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Booking[];
      setBookings(bookingData);
    });

    return () => unsubscribeBookings();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    // Listen to user's quote requests
    const quotesQuery = query(
      collection(db, "quoteRequests"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribeQuotes = onSnapshot(quotesQuery, (snapshot) => {
      const quoteData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as QuoteRequest[];
      setQuotes(quoteData);
    });

    return () => unsubscribeQuotes();
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleDeleteBooking = async (id: string) => {
    if (!user) return;
    setDeleting(true);
    try {
      await deleteDoc(doc(db, "bookings", id));
      setDeleteConfirm(null);
    } catch (error) {
      console.error("Error deleting booking:", error);
      alert("Failed to delete booking. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteQuote = async (id: string) => {
    if (!user) return;
    setDeleting(true);
    try {
      await deleteDoc(doc(db, "quoteRequests", id));
      setDeleteConfirm(null);
    } catch (error) {
      console.error("Error deleting quote:", error);
      alert("Failed to delete quote request. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "#ffd700";
      case "confirmed": return "#1e8ba5";
      case "in-progress": return "#f4a259";
      case "completed": return "#2ecc71";
      case "cancelled": return "#e74c3c";
      case "contacted": return "#1e8ba5";
      case "converted": return "#2ecc71";
      default: return "#999";
    }
  };

  if (authLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading your laundry...</div>
      </div>
    );
  }

  if (!user || isAdmin) {
    return null;
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.logoWrapper}>
            <Image src="/icons/icon-192.svg" alt="Logo" width={25} height={25} />
            <h1>My Laundry</h1>
            <p className={styles.userInfo}>
              <MdPerson /> {userProfile?.name} | {userProfile?.email}
            </p>
          </div>
          <div className={styles.headerActions}>
            <NotificationBell />
            <button onClick={() => router.push("/")} className={styles.homeBtn}>
              <MdHome /> Home
            </button>
            <button onClick={() => router.push("/user/profile")} className={styles.profileBtn}>
              <MdSettings /> Profile
            </button>
            <button onClick={handleSignOut} className={styles.signOutBtn}>
              <MdLogout /> Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className={styles.stats}>
        <div className={styles.statCard}>
          <MdReceipt className={styles.statIcon} />
          <div>
            <div className={styles.statNumber}>{bookings.length}</div>
            <div className={styles.statLabel}>Total Bookings</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <MdRequestQuote className={styles.statIcon} />
          <div>
            <div className={styles.statNumber}>{quotes.length}</div>
            <div className={styles.statLabel}>Quote Requests</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statNumber}>
            {bookings.filter(b => b.status === "pending" || b.status === "confirmed").length}
          </div>
          <div className={styles.statLabel}>Active Orders</div>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          onClick={() => setActiveTab("bookings")}
          className={`${styles.tab} ${activeTab === "bookings" ? styles.activeTab : ""}`}
        >
          <MdReceipt /> My Bookings ({bookings.length})
        </button>
        <button
          onClick={() => setActiveTab("quotes")}
          className={`${styles.tab} ${activeTab === "quotes" ? styles.activeTab : ""}`}
        >
          <MdRequestQuote /> My Quotes ({quotes.length})
        </button>
      </div>

      {/* Bookings Tab */}
      {activeTab === "bookings" && (
        <div className={styles.content}>
          {bookings.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No bookings yet</p>
              <button onClick={() => router.push("/booking")} className={styles.actionBtn}>
                Create Your First Booking
              </button>
            </div>
          ) : (
            <div className={styles.grid}>
              {bookings.map((booking) => (
                <div key={booking.id} className={styles.card}>
                  <div className={styles.cardHeader}>
                    <h3>{booking.service}</h3>
                    <div className={styles.cardActions}>
                      <span
                        className={styles.statusBadge}
                        style={{ background: getStatusColor(booking.status) }}
                      >
                        {booking.status}
                      </span>
                      <button
                        className={styles.deleteBtn}
                        onClick={() => setDeleteConfirm({ type: "booking", id: booking.id })}
                        title="Delete booking"
                      >
                        <MdDelete />
                      </button>
                    </div>
                  </div>
                  <div className={styles.cardBody}>
                    <p><strong>Date:</strong> {new Date(booking.date).toLocaleDateString("en-IN")}</p>
                    <p><strong>Time:</strong> {booking.slot}</p>
                    <p><strong>Address:</strong> {booking.address}</p>
                    {booking.notes && <p><strong>Notes:</strong> {booking.notes}</p>}
                    <p className={styles.cardDate}>
                      Booked on {new Date(booking.createdAt).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Quotes Tab */}
      {activeTab === "quotes" && (
        <div className={styles.content}>
          {quotes.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No quote requests yet</p>
              <button onClick={() => router.push("/quote")} className={styles.actionBtn}>
                Request Your First Quote
              </button>
            </div>
          ) : (
            <div className={styles.grid}>
              {quotes.map((quote) => (
                <div key={quote.id} className={styles.card}>
                  <div className={styles.cardHeader}>
                    <h3>{quote.serviceType.replace('-', ' ')}</h3>
                    <div className={styles.cardActions}>
                      <span
                        className={styles.statusBadge}
                        style={{ background: getStatusColor(quote.status) }}
                      >
                        {quote.status}
                      </span>
                      <button
                        className={styles.deleteBtn}
                        onClick={() => setDeleteConfirm({ type: "quote", id: quote.id })}
                        title="Delete quote request"
                      >
                        <MdDelete />
                      </button>
                    </div>
                  </div>
                  <div className={styles.cardBody}>
                    <p className={styles.estimatedCost}>
                      <strong>Estimated Cost:</strong> ₹{quote.estimatedCost}
                    </p>
                    {quote.weight && <p><strong>Weight:</strong> {quote.weight} kg</p>}
                    {quote.items && Object.values(quote.items).some(v => v > 0) && (
                      <div className={styles.itemsList}>
                        <strong>Items:</strong>
                        <div className={styles.items}>
                          {Object.entries(quote.items).filter(([, qty]) => qty > 0).map(([item, qty]) => (
                            <span key={item} className={styles.itemBadge}>
                              {item} ×{qty}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    <p className={styles.cardDate}>
                      Requested on {new Date(quote.createdAt).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className={styles.modalOverlay} onClick={() => !deleting && setDeleteConfirm(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3>Confirm Delete</h3>
            <p>
              Are you sure you want to delete this {deleteConfirm.type === "booking" ? "booking" : "quote request"}? 
              This action cannot be undone.
            </p>
            <div className={styles.modalActions}>
              <button
                className={styles.cancelBtn}
                onClick={() => setDeleteConfirm(null)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                className={styles.confirmDeleteBtn}
                onClick={() => {
                  if (deleteConfirm.type === "booking") {
                    handleDeleteBooking(deleteConfirm.id);
                  } else {
                    handleDeleteQuote(deleteConfirm.id);
                  }
                }}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Widget */}
      <ChatWidget />
    </div>
  );
}
