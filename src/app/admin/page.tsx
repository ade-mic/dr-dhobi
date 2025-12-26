"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, addDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useAuth } from "@/components/AuthProvider";
import { AdminChatPanel } from "@/components/AdminChatPanel";
import type { Booking } from "@/types/booking";
import { GoSignOut } from "react-icons/go";
import { MdAttachMoney, MdOutlineMessage, MdOutlineRequestQuote, MdPhone, MdEmail, MdCleaningServices, MdCalendarToday, MdAccessTime, MdLocationOn, MdNoteAlt, MdDelete, MdSupportAgent, MdPeople, MdAdminPanelSettings, MdPerson, MdSearch, MdAdd, MdEdit, MdVisibility, MdVisibilityOff, MdSettings } from "react-icons/md";
import { TbBrandBooking } from "react-icons/tb";
import { RiShirtLine } from "react-icons/ri";
import { SiteSettings, defaultSettings } from "@/lib/siteSettings";

import styles from "./page.module.css";

type BookingWithId = Booking & { id: string };
type Message = { id: string; name: string; email: string; phone: string; message: string; createdAt: string; status?: string; subject?: string; type?: string; read?: boolean };
type QuoteRequest = { id: string; name: string; phone: string; email: string; serviceType: string; estimatedCost: number; createdAt: string; status: string; weight?: number; items?: Record<string, number>; selectiveWash?: boolean; read?: boolean };
type UserRecord = { id: string; name: string; email: string; phone?: string; role: "admin" | "user"; photoURL?: string; createdAt: string; updatedAt?: string };
type ChatSession = { id: string; userName: string; userEmail?: string; status: "active" | "closed"; unreadCount: number; lastMessage?: string; lastMessageAt?: string; createdAt: string };
type ServicePricingItem = { item: string; price: number };
type ServicePricing = { name: string; turnaround: string; items: ServicePricingItem[] };
type ServiceItem = {
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

// Available icon options for services
const iconOptions = [
  { id: "dry-cleaning", label: "Dry Cleaning" },
  { id: "wash-fold", label: "Wash & Fold" },
  { id: "express", label: "Express" },
  { id: "ironing", label: "Ironing" },
  { id: "laundry", label: "Laundry" },
  { id: "iron", label: "Iron" },
  { id: "clean", label: "Clean" },
  { id: "default", label: "Default" },
];

// Default service pricing
const defaultServicePricing: Record<string, ServicePricing> = {
  "dry-cleaning": {
    name: "Dry Cleaning",
    turnaround: "48 hours",
    items: [
      { item: "Shirt / Top", price: 50 },
      { item: "Trousers / Jeans", price: 60 },
      { item: "Suit (2-piece)", price: 250 },
      { item: "Dress / Saree", price: 100 },
      { item: "Jacket / Blazer", price: 150 },
    ],
  },
  "wash-fold": {
    name: "Wash & Fold",
    turnaround: "24 hours",
    items: [
      { item: "T-Shirt / Top", price: 30 },
      { item: "Shirt (formal)", price: 40 },
      { item: "Trousers / Jeans", price: 40 },
      { item: "Bedsheet (single)", price: 60 },
      { item: "Per kg (mixed)", price: 80 },
    ],
  },
  "express": {
    name: "Express Pickup",
    turnaround: "Same day",
    items: [
      { item: "Express surcharge", price: 100 },
      { item: "Same-day delivery", price: 150 },
    ],
  },
  "ironing": {
    name: "Premium Ironing",
    turnaround: "24 hours",
    items: [
      { item: "Shirt / Top", price: 20 },
      { item: "Trousers", price: 25 },
      { item: "Dress / Saree", price: 40 },
      { item: "Suit (2-piece)", price: 80 },
    ],
  },
};

export default function AdminDashboard() {
  const router = useRouter();
  const { user, userProfile, loading: authLoading, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<"bookings" | "pricing" | "messages" | "quotes" | "support" | "users" | "services" | "settings">("bookings");
  const [bookings, setBookings] = useState<BookingWithId[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [quoteRequests, setQuoteRequests] = useState<QuoteRequest[]>([]);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState<"all" | "admin" | "user">("all");
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [selectedBooking, setSelectedBooking] = useState<BookingWithId | null>(null);
  const [messageType, setMessageType] = useState<"email" | "whatsapp">("email");
  const [message, setMessage] = useState("");
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>("default");
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [pricingTab, setPricingTab] = useState<"quote" | "services">("services");
  const [pricing, setPricing] = useState({
    items: {
      shirts: 30,
      trousers: 40,
      tshirts: 25,
      jeans: 50,
      sarees: 80,
      kurtas: 45,
      bedsheets: 60,
      towels: 15,
    },
    pickupCharge: 50,
    freePickupThreshold: 300,
  });
  const [servicePricing, setServicePricing] = useState<Record<string, ServicePricing>>(defaultServicePricing);
  const [editingService, setEditingService] = useState<string | null>(null);
  const [savingPricing, setSavingPricing] = useState(false);
  
  // Services management state
  const [allServices, setAllServices] = useState<ServiceItem[]>([]);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingServiceData, setEditingServiceData] = useState<ServiceItem | null>(null);
  const [savingService, setSavingService] = useState(false);
  const [newService, setNewService] = useState<Partial<ServiceItem>>({
    name: "",
    icon: "default",
    description: "",
    features: [""],
    pricing: [{ item: "", price: 0 }],
    turnaround: "24 hours",
    order: 99,
    isActive: true,
  });

  // Site settings state
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(defaultSettings);
  const [savingSettings, setSavingSettings] = useState(false);

  // Real-time notification badge counts
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadQuotes, setUnreadQuotes] = useState(0);
  const [unreadChats, setUnreadChats] = useState(0);
  
  // Conversation stats for support tab
  const [conversationStats, setConversationStats] = useState({
    total: 0,
    open: 0,
    pending: 0,
    resolved: 0,
    closed: 0,
  });

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
        // Register for FCM push notifications
        await registerForPushNotifications();
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

  const registerForPushNotifications = async () => {
    try {
      const { getMessagingInstance } = await import("@/lib/firebase");
      const messaging = await getMessagingInstance();
      
      if (!messaging) {
        return;
      }

      const { getToken } = await import("firebase/messaging");
      
      const token = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      });

      if (token) {
        
        const { doc, setDoc } = await import("firebase/firestore");
        if (auth.currentUser) {
          await setDoc(doc(db, "adminTokens", auth.currentUser.uid), {
            token,
            email: auth.currentUser.email,
            updatedAt: new Date(),
          });
        }
      }
    } catch (error) {
      console.error("Error registering for push notifications:", error);
    }
  };

  const showTestNotification = () => {
    if (!isNotificationSupported || Notification.permission !== "granted") return;

    try {
      const notification = new Notification(" Dr Dhobi - Test Notification", {
        body: "You will receive notifications like this when new bookings arrive!",
        icon: "/icons/icon-192.svg",
        badge: "/icons/icon-192.svg",
        tag: "test-notification",
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    } catch (error) {
      console.error("Failed to show test notification:", error);
    }
  };

  // Check authentication and admin role
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    if (!isAdmin) {
      // User is logged in but not an admin
      router.push("/user/dashboard");
      return;
    }

    // Auto-register for push notifications if already granted
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      registerForPushNotifications();
    }

    // Fetch pricing settings
    fetchPricing();
  }, [authLoading, user, isAdmin, router]);

  const fetchPricing = async () => {
    try {
      const response = await fetch("/api/pricing");
      if (response.ok) {
        const data = await response.json();
        setPricing({
          items: data.items || pricing.items,
          pickupCharge: data.pickupCharge || 50,
          freePickupThreshold: data.freePickupThreshold || 300,
        });
        if (data.services) {
          setServicePricing(data.services);
        }
      }
    } catch (error) {
      console.error("Error fetching pricing:", error);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await fetch("/api/services");
      if (response.ok) {
        const data = await response.json();
        setAllServices(data);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  const saveService = async (serviceData: Partial<ServiceItem>) => {
    setSavingService(true);
    try {
      const response = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(serviceData),
      });

      if (response.ok) {
        alert("✅ Service saved successfully!");
        setShowServiceModal(false);
        setEditingServiceData(null);
        resetNewService();
        fetchServices();
      } else {
        alert("❌ Failed to save service");
      }
    } catch (error) {
      console.error("Error saving service:", error);
      alert("❌ Failed to save service");
    } finally {
      setSavingService(false);
    }
  };

  const deleteService = async (serviceId: string) => {
    if (!confirm("Are you sure you want to delete this service? This cannot be undone.")) return;
    
    try {
      const response = await fetch(`/api/services?id=${serviceId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("✅ Service deleted successfully!");
        fetchServices();
      } else {
        alert("❌ Failed to delete service");
      }
    } catch (error) {
      console.error("Error deleting service:", error);
      alert("❌ Failed to delete service");
    }
  };

  const toggleServiceActive = async (service: ServiceItem) => {
    await saveService({ ...service, isActive: !service.isActive });
  };

  const resetNewService = () => {
    setNewService({
      name: "",
      icon: "default",
      description: "",
      features: [""],
      pricing: [{ item: "", price: 0 }],
      turnaround: "24 hours",
      order: 99,
      isActive: true,
    });
  };

  const openEditService = (service: ServiceItem) => {
    setEditingServiceData(service);
    setNewService(service);
    setShowServiceModal(true);
  };

  const openAddService = () => {
    setEditingServiceData(null);
    resetNewService();
    setShowServiceModal(true);
  };

  // Site Settings functions
  const fetchSiteSettings = async () => {
    try {
      const response = await fetch("/api/settings");
      if (response.ok) {
        const data = await response.json();
        setSiteSettings({ ...defaultSettings, ...data });
      }
    } catch (error) {
      console.error("Error fetching site settings:", error);
    }
  };

  const saveSiteSettings = async () => {
    setSavingSettings(true);
    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(siteSettings),
      });

      if (response.ok) {
        alert("✅ Settings saved successfully! Changes will appear on the site.");
      } else {
        alert("❌ Failed to save settings");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("❌ Failed to save settings");
    } finally {
      setSavingSettings(false);
    }
  };

  const updateSetting = (key: keyof SiteSettings, value: string) => {
    setSiteSettings(prev => ({ ...prev, [key]: value }));
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch("/api/messages");
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const fetchQuoteRequests = async () => {
    try {
      const response = await fetch("/api/quotes");
      if (response.ok) {
        const data = await response.json();
        setQuoteRequests(data);
      }
    } catch (error) {
      console.error("Error fetching quote requests:", error);
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (!confirm("Delete this message?")) return;
    try {
      await fetch("/api/messages", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: messageId }),
      });
      setMessages(messages.filter(m => m.id !== messageId));
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  const markMessageAsRead = async (messageId: string) => {
    try {
      await updateDoc(doc(db, "messages", messageId), { read: true });
    } catch (error) {
      console.error("Error marking message as read:", error);
    }
  };

  const markAllMessagesAsRead = async () => {
    try {
      const unreadMsgs = messages.filter(m => !m.read);
      await Promise.all(unreadMsgs.map(m => updateDoc(doc(db, "messages", m.id), { read: true })));
    } catch (error) {
      console.error("Error marking all messages as read:", error);
    }
  };

  const deleteQuoteRequest = async (quoteId: string) => {
    if (!confirm("Delete this quote request?")) return;
    try {
      await fetch("/api/quotes", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: quoteId }),
      });
      setQuoteRequests(quoteRequests.filter(q => q.id !== quoteId));
    } catch (error) {
      console.error("Error deleting quote request:", error);
    }
  };

  const markQuoteAsRead = async (quoteId: string) => {
    try {
      await updateDoc(doc(db, "quoteRequests", quoteId), { read: true });
    } catch (error) {
      console.error("Error marking quote as read:", error);
    }
  };

  const markAllQuotesAsRead = async () => {
    try {
      const unreadQuotesList = quoteRequests.filter(q => !q.read);
      await Promise.all(unreadQuotesList.map(q => updateDoc(doc(db, "quoteRequests", q.id), { read: true })));
    } catch (error) {
      console.error("Error marking all quotes as read:", error);
    }
  };

  const updateQuoteStatus = async (quoteId: string, status: string) => {
    try {
      const response = await fetch("/api/quotes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: quoteId, status }),
      });
      if (response.ok) {
        setQuoteRequests(quoteRequests.map(q => q.id === quoteId ? { ...q, status } : q));
      }
    } catch (error) {
      console.error("Error updating quote status:", error);
    }
  };

  const savePricing = async () => {
    setSavingPricing(true);
    try {
      const response = await fetch("/api/pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...pricing,
          services: servicePricing,
        }),
      });

      if (response.ok) {
        alert("✅ Pricing updated successfully!");
        setShowPricingModal(false);
        setEditingService(null);
      } else {
        alert("❌ Failed to update pricing");
      }
    } catch (error) {
      console.error("Error saving pricing:", error);
      alert("❌ Failed to update pricing");
    } finally {
      setSavingPricing(false);
    }
  };

  const updateItemPrice = (item: string, price: number) => {
    setPricing((prev) => ({
      ...prev,
      items: {
        ...prev.items,
        [item]: Math.max(0, price),
      },
    }));
  };

  // Real-time listener for messages
  useEffect(() => {
    if (!isAdmin) return;

    const q = query(collection(db, "messages"), orderBy("createdAt", "desc"));
    let isFirstLoad = true;

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messageData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[];
      
      setMessages(messageData);
      setUnreadMessages(messageData.filter(m => !m.read).length);

      // Show browser notification for new messages (not on first load)
      if (!isFirstLoad && notificationPermission === "granted") {
        const newMessages = snapshot.docChanges().filter(
          change => change.type === "added" && !change.doc.metadata.hasPendingWrites
        );
        if (newMessages.length > 0) {
          const msg = newMessages[0].doc.data();
          new Notification("📬 New Contact Message", {
            body: `${msg.name}: ${msg.message?.substring(0, 50)}...`,
            icon: "/icons/icon-192.svg",
            tag: "new-message",
          });
        }
      }
      isFirstLoad = false;
    }, (error) => {
      console.error("Error listening to messages:", error);
    });

    return () => unsubscribe();
  }, [isAdmin, notificationPermission]);

  // Real-time listener for quote requests
  useEffect(() => {
    if (!isAdmin) return;

    const q = query(collection(db, "quoteRequests"), orderBy("createdAt", "desc"));
    let isFirstLoad = true;

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const quoteData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as QuoteRequest[];
      
      setQuoteRequests(quoteData);
      setUnreadQuotes(quoteData.filter(q => !q.read && q.status === "pending").length);

      // Show browser notification for new quotes (not on first load)
      if (!isFirstLoad && notificationPermission === "granted") {
        const newQuotes = snapshot.docChanges().filter(
          change => change.type === "added" && !change.doc.metadata.hasPendingWrites
        );
        if (newQuotes.length > 0) {
          const quote = newQuotes[0].doc.data();
          new Notification("📋 New Quote Request", {
            body: `${quote.name} - ${quote.serviceType} - ₹${quote.estimatedCost}`,
            icon: "/icons/icon-192.svg",
            tag: "new-quote",
          });
        }
      }
      isFirstLoad = false;
    }, (error) => {
      console.error("Error listening to quotes:", error);
    });

    return () => unsubscribe();
  }, [isAdmin, notificationPermission]);

  // Real-time listener for conversations (customer support chats)
  useEffect(() => {
    if (!isAdmin) return;

    const q = query(collection(db, "conversations"), orderBy("lastMessageAt", "desc"));
    let isFirstLoad = true;

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const conversationData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as { id: string; userName: string; lastMessage?: string; unreadByAdmin?: number; status: string }[];
      
      // Calculate unread count from conversations
      const totalUnread = conversationData.reduce((acc, conv) => acc + (conv.unreadByAdmin || 0), 0);
      setUnreadChats(totalUnread);
      
      // Calculate stats by status
      setConversationStats({
        total: conversationData.length,
        open: conversationData.filter(c => c.status === "open").length,
        pending: conversationData.filter(c => c.status === "pending").length,
        resolved: conversationData.filter(c => c.status === "resolved").length,
        closed: conversationData.filter(c => c.status === "closed").length,
      });

      // Show browser notification for new chat messages (not on first load)
      if (!isFirstLoad && notificationPermission === "granted") {
        const modifiedConvs = snapshot.docChanges().filter(
          change => change.type === "modified" && !change.doc.metadata.hasPendingWrites
        );
        if (modifiedConvs.length > 0) {
          const conv = modifiedConvs[0].doc.data();
          if (conv.unreadByAdmin > 0) {
            new Notification("💬 New Support Message", {
              body: `${conv.userName}: ${conv.lastMessage?.substring(0, 50)}...`,
              icon: "/icons/icon-192.svg",
              tag: "new-chat",
            });
          }
        }
      }
      isFirstLoad = false;
    }, (error) => {
      console.error("Error listening to conversations:", error);
    });

    return () => unsubscribe();
  }, [isAdmin, notificationPermission]);

  // Fetch services and settings based on active tab
  useEffect(() => {
    if (!isAdmin) return;

    if (activeTab === "services") {
      fetchServices();
    } else if (activeTab === "settings") {
      fetchSiteSettings();
    }
  }, [activeTab, isAdmin]);

  // Listen for users
  useEffect(() => {
    if (!isAdmin) return;

    const q = query(
      collection(db, "users"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const userData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as UserRecord[];
      setUsers(userData);
    });

    return () => unsubscribe();
  }, [isAdmin]);

  // Update user role
  const updateUserRole = async (userId: string, newRole: "admin" | "user") => {
    // Prevent admin from demoting themselves
    if (userId === user?.uid && newRole === "user") {
      alert("You cannot demote yourself from admin!");
      return;
    }

    try {
      await updateDoc(doc(db, "users", userId), {
        role: newRole,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error updating user role:", error);
      alert("Failed to update user role");
    }
  };

  // Filter users based on search and role filter
  const filteredUsers = users.filter((u) => {
    const matchesSearch = 
      u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.phone?.includes(userSearch);
    const matchesRole = userRoleFilter === "all" || u.role === userRoleFilter;
    return matchesSearch && matchesRole;
  });

  // Listen for new bookings and send browser notifications
  useEffect(() => {
    if (!isAdmin) return;

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
          
          if (notificationPermission === "granted") {
            newlyAdded.forEach((newBooking) => {
              try {
                // Try to use service worker notification for better PWA support
                if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                  navigator.serviceWorker.controller.postMessage({
                    type: 'SHOW_NOTIFICATION',
                    title: 'Dr Dhobi - New Booking!',
                    body: `${newBooking.name} booked ${newBooking.service}\nPhone: ${newBooking.phone}`,
                    data: {
                      bookingId: newBooking.id,
                      url: '/admin'
                    }
                  });
                } else {
                  // Fallback to regular notification
                  const notification = new Notification(" Dr Dhobi - New Booking!", {
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

                }

                // Try to play sound (non-blocking)
                try {
                  const audio = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHmq+8OOYTgwOVKzn77RiFQU7k9n0yoA1Bh9qvu/fnEkMDFKs6O6yYBYGPJHY8s2DNwYaabrv45lPDAx");
                  audio.volume = 0.5;
                  audio.play().catch((err) => console.log("Audio play blocked:", err.message));
                } catch (audioError) {
                  console.error("Failed to play notification sound:", audioError);
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
  }, [isAdmin, notificationPermission]);

  const updateBookingStatus = async (bookingId: string, status: Booking["status"]) => {
    try {
      // Find the booking to get user info
      const booking = bookings.find(b => b.id === bookingId);
      
      await updateDoc(doc(db, "bookings", bookingId), {
        status,
        updatedAt: new Date(),
      });

      // Send notification to user if they have a userId
      if (booking?.userId) {
        const statusMessages: Record<string, string> = {
          pending: "Your booking is pending confirmation.",
          confirmed: "Your booking has been confirmed! We'll pick up your laundry soon.",
          "in-progress": "Your laundry is now being processed.",
          completed: "Your laundry is ready! It will be delivered soon.",
          cancelled: "Your booking has been cancelled.",
        };

        await addDoc(collection(db, "notifications"), {
          userId: booking.userId,
          type: "booking",
          title: `Booking ${status.charAt(0).toUpperCase() + status.slice(1)}`,
          body: statusMessages[status] || `Your booking status has been updated to ${status}.`,
          data: {
            bookingId,
            status,
          },
          read: false,
          createdAt: new Date().toISOString(),
        });
      }
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
      router.push("/login");
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

  if (!user || !isAdmin) {
    return null;
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
            <h1>Management</h1>
            <p className={styles.userEmail}>Logged in as: {userProfile?.email || user?.email}</p>
          </div>
          <button className={styles.signOutBtn} onClick={handleSignOut}>
            <GoSignOut /> Sign Out
          </button>
        </div>

        {shouldShowNotificationBanner && (
          <div className={styles.notificationBanner}>
            <span>🔔 Enable push notifications to receive real-time alerts for new bookings (even when tab is closed)</span>
            <button onClick={requestNotificationPermission}>Enable Push Notifications</button>
          </div>
        )}

      </div>

      {/* Tab Navigation */}
      <div className={styles.tabNavigation}>
        <button
          onClick={() => setActiveTab("bookings")}
          className={`${styles.tabButton} ${activeTab === "bookings" ? styles.active : ""}`}
        >
          <TbBrandBooking /> Bookings ({bookings.length})
        </button>
        <button
          onClick={() => setActiveTab("pricing")}
          className={`${styles.tabButton} ${activeTab === "pricing" ? styles.active : ""}`}
        >
          <MdAttachMoney /> Pricing
        </button>
        <button
          onClick={() => setActiveTab("messages")}
          className={`${styles.tabButton} ${activeTab === "messages" ? styles.active : ""}`}
        >
          <MdOutlineMessage /> Messages ({messages.length})
          {unreadMessages > 0 && <span className={styles.badge}>{unreadMessages}</span>}
        </button>
        <button
          onClick={() => setActiveTab("quotes")}
          className={`${styles.tabButton} ${activeTab === "quotes" ? styles.active : ""}`}
        >
          <MdOutlineRequestQuote /> Quote Requests ({quoteRequests.length})
          {unreadQuotes > 0 && <span className={styles.badge}>{unreadQuotes}</span>}
        </button>
        <button
          onClick={() => setActiveTab("services")}
          className={`${styles.tabButton} ${activeTab === "services" ? styles.active : ""}`}
        >
          <RiShirtLine /> Services ({allServices.length})
        </button>
        <button
          onClick={() => setActiveTab("support")}
          className={`${styles.tabButton} ${activeTab === "support" ? styles.active : ""}`}
        >
          <MdSupportAgent /> Customer Support ({conversationStats.total})
          {unreadChats > 0 && <span className={styles.badge}>{unreadChats}</span>}
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`${styles.tabButton} ${activeTab === "users" ? styles.active : ""}`}
        >
          <MdPeople /> Users ({users.length})
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`${styles.tabButton} ${activeTab === "settings" ? styles.active : ""}`}
        >
          <MdSettings /> Settings
        </button>
      </div>

      {/* BOOKINGS TAB */}
      {activeTab === "bookings" && (
        <>
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
                <span className={styles.icon}><MdPhone /></span>
                <a href={`tel:${booking.phone}`}>{booking.phone}</a>
              </div>
              {booking.email && (
                <div className={styles.detailRow}>
                  <span className={styles.icon}><MdEmail /></span>
                  <span>{booking.email}</span>
                </div>
              )}
              <div className={styles.detailRow}>
                <span className={styles.icon}><MdCleaningServices /></span>
                <span>{booking.service}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.icon}><MdCalendarToday /></span>
                <span>{new Date(booking.date).toLocaleDateString("en-IN")}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.icon}><MdAccessTime /></span>
                <span>{booking.slot}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.icon}><MdLocationOn /></span>
                <span>{booking.address}</span>
              </div>
              {booking.notes && (
                <div className={styles.detailRow}>
                  <span className={styles.icon}><MdNoteAlt /></span>
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
                <MdOutlineMessage /> Message
              </button>
              
              <button
                className={styles.deleteBtn}
                onClick={() => deleteBooking(booking.id)}
              >
                <MdDelete /> Delete
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
        </>
      )}

      {/* PRICING TAB */}
      {activeTab === "pricing" && (
        <div className={styles.pricingContainer}>
          <div className={styles.pricingTabNav}>
            <button
              className={`${styles.pricingTabBtn} ${pricingTab === "services" ? styles.active : ""}`}
              onClick={() => setPricingTab("services")}
            >
              🛒 Service Pricing
            </button>
            <button
              className={`${styles.pricingTabBtn} ${pricingTab === "quote" ? styles.active : ""}`}
              onClick={() => setPricingTab("quote")}
            >
              📋 Quote Pricing
            </button>
          </div>

          {/* SERVICE PRICING (for Services Page) */}
          {pricingTab === "services" && (
            <div className={styles.servicePricingSection}>
              <div className={styles.sectionHeader}>
                <h2>Service Pricing</h2>
                <p className={styles.sectionSubtext}>Manage prices shown on the Services page</p>
              </div>

              <div className={styles.servicesGrid}>
                {Object.entries(servicePricing).map(([serviceId, service]) => (
                  <div key={serviceId} className={styles.serviceCard}>
                    <div className={styles.serviceCardHeader}>
                      <h3>{service.name}</h3>
                      <span className={styles.turnaroundBadge}>⏱️ {service.turnaround}</span>
                    </div>

                    {editingService === serviceId ? (
                      <div className={styles.serviceEditForm}>
                        <div className={styles.turnaroundEdit}>
                          <label>Turnaround Time:</label>
                          <input
                            type="text"
                            value={service.turnaround}
                            onChange={(e) => {
                              setServicePricing(prev => ({
                                ...prev,
                                [serviceId]: { ...prev[serviceId], turnaround: e.target.value }
                              }));
                            }}
                            className={styles.turnaroundInput}
                          />
                        </div>

                        <div className={styles.itemsList}>
                          {service.items.map((item, index) => (
                            <div key={index} className={styles.itemEditRow}>
                              <input
                                type="text"
                                value={item.item}
                                onChange={(e) => {
                                  const newItems = [...service.items];
                                  newItems[index] = { ...newItems[index], item: e.target.value };
                                  setServicePricing(prev => ({
                                    ...prev,
                                    [serviceId]: { ...prev[serviceId], items: newItems }
                                  }));
                                }}
                                className={styles.itemNameInput}
                                placeholder="Item name"
                              />
                              <div className={styles.priceInputWrapper}>
                                <span>₹</span>
                                <input
                                  type="number"
                                  value={item.price}
                                  onChange={(e) => {
                                    const newItems = [...service.items];
                                    newItems[index] = { ...newItems[index], price: parseInt(e.target.value) || 0 };
                                    setServicePricing(prev => ({
                                      ...prev,
                                      [serviceId]: { ...prev[serviceId], items: newItems }
                                    }));
                                  }}
                                  className={styles.priceInput}
                                  min="0"
                                />
                              </div>
                              <button
                                className={styles.removeItemBtn}
                                onClick={() => {
                                  const newItems = service.items.filter((_, i) => i !== index);
                                  setServicePricing(prev => ({
                                    ...prev,
                                    [serviceId]: { ...prev[serviceId], items: newItems }
                                  }));
                                }}
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>

                        <button
                          className={styles.addItemBtn}
                          onClick={() => {
                            const newItems = [...service.items, { item: "New Item", price: 0 }];
                            setServicePricing(prev => ({
                              ...prev,
                              [serviceId]: { ...prev[serviceId], items: newItems }
                            }));
                          }}
                        >
                          + Add Item
                        </button>

                        <div className={styles.editActions}>
                          <button
                            className={styles.cancelEditBtn}
                            onClick={() => setEditingService(null)}
                          >
                            Cancel
                          </button>
                          <button
                            className={styles.saveEditBtn}
                            onClick={savePricing}
                            disabled={savingPricing}
                          >
                            {savingPricing ? "Saving..." : "Save Changes"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className={styles.servicePriceList}>
                          {service.items.map((item, index) => (
                            <div key={index} className={styles.servicePriceItem}>
                              <span>{item.item}</span>
                              <span className={styles.servicePriceValue}>₹{item.price}</span>
                            </div>
                          ))}
                        </div>
                        <button
                          className={styles.editServiceBtn}
                          onClick={() => setEditingService(serviceId)}
                        >
                          ✏️ Edit Prices
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* QUOTE PRICING (for instant quotes) */}
          {pricingTab === "quote" && (
            <>
              <button 
                onClick={() => setShowPricingModal(true)}
                className={styles.pricingButton}
              >
                💰 Edit Quote Pricing
              </button>
              
              <div className={styles.pricingCard}>
                <h2 style={{ marginBottom: '20px' }}>Quote Calculator Pricing</h2>
                <p className={styles.sectionSubtext} style={{ marginBottom: '20px' }}>Used for instant quote calculations</p>
                
                <div className={styles.pricingSection}>
                  <h3>Item Prices (per piece)</h3>
                  <div className={styles.priceGrid}>
                    {Object.entries(pricing.items).map(([item, price]) => (
                      <div key={item} className={styles.priceItem}>
                        <p className={styles.priceItemName}>{item}</p>
                        <p className={styles.priceItemValue}>₹{price}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={styles.pricingSection}>
                  <h3>Pickup Settings</h3>
                  <div className={styles.priceGrid}>
                    <div className={styles.priceItem}>
                      <p className={styles.priceItemName}>Pickup Charge</p>
                      <p className={styles.priceItemValue}>₹{pricing.pickupCharge}</p>
                    </div>
                    <div className={styles.priceItem}>
                      <p className={styles.priceItemName}>Free Pickup Threshold</p>
                      <p className={styles.priceItemValue}>₹{pricing.freePickupThreshold}</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* MESSAGES TAB */}
      {activeTab === "messages" && (
        <div className={styles.tabContent}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ margin: 0 }}>Contact Messages ({messages.length})</h2>
            {unreadMessages > 0 && (
              <button onClick={markAllMessagesAsRead} className={styles.markAllReadBtn}>
                ✓ Mark All as Read ({unreadMessages})
              </button>
            )}
          </div>
          {messages.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No messages yet</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '15px' }}>
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`${styles.messageCard} ${!msg.read ? styles.unread : ''}`}
                  onClick={() => !msg.read && markMessageAsRead(msg.id)}
                >
                  <div className={styles.messageCardHeader}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h3 className={styles.messageCardInfo}>{msg.name}</h3>
                        {!msg.read && <span className={styles.newBadge}>NEW</span>}
                      </div>
                      <p className={styles.messageCardInfo}>
                        📧 {msg.email} | 📞 {msg.phone}
                      </p>
                      {msg.subject && (
                        <p className={styles.messageCardInfo} style={{ marginTop: '4px' }}>
                          📋 Subject: <strong>{msg.subject}</strong>
                        </p>
                      )}
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteMessage(msg.id); }}
                      className={styles.deleteMessageBtn}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                  <p className={styles.messageText}>{msg.message}</p>
                  <p className={styles.messageTime}>
                    📅 {new Date(msg.createdAt).toLocaleDateString("en-IN")} at {new Date(msg.createdAt).toLocaleTimeString("en-IN")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* QUOTES TAB */}
      {activeTab === "quotes" && (
        <div className={styles.tabContent}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ margin: 0 }}>Quote Requests ({quoteRequests.length})</h2>
            {unreadQuotes > 0 && (
              <button onClick={markAllQuotesAsRead} className={styles.markAllReadBtn}>
                ✓ Mark All as Read ({unreadQuotes})
              </button>
            )}
          </div>
          {quoteRequests.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No quote requests yet</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '15px' }}>
              {quoteRequests.map((quote) => (
                <div 
                  key={quote.id} 
                  className={`${styles.quoteCard} ${!quote.read ? styles.unread : ''}`}
                  onClick={() => !quote.read && markQuoteAsRead(quote.id)}
                >
                  <div className={styles.quoteCardHeader}>
                    <div>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '8px' }}>
                        <h3 style={{ margin: '0', fontSize: '18px', fontWeight: '600', color: '#333' }}>{quote.name}</h3>
                        {!quote.read && <span className={styles.newBadge}>NEW</span>}
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '600',
                          background: quote.status === 'pending' ? '#ffd700' : quote.status === 'contacted' ? '#1e8ba5' : '#2ecc71',
                          color: quote.status === 'pending' ? '#333' : 'white'
                        }}>
                          {quote.status}
                        </span>
                      </div>
                      <p className={styles.quoteCardInfo} style={{ marginTop: '0' }}>
                        📞 {quote.phone} | 📧 {quote.email}
                      </p>
                    </div>
                    <div className={styles.quoteActions}>
                      <select
                        value={quote.status}
                        onChange={(e) => updateQuoteStatus(quote.id, e.target.value)}
                        className={styles.quoteStatusSelect}
                      >
                        <option value="pending">Pending</option>
                        <option value="contacted">Contacted</option>
                        <option value="converted">Converted</option>
                      </select>
                      <button
                        onClick={() => deleteQuoteRequest(quote.id)}
                        className={styles.quoteDeleteBtn}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  <div className={styles.quoteDetailsGrid}>
                    <div className={styles.quoteDetailItem}>
                      <p className={styles.quoteDetailLabel}>Service</p>
                      <p className={styles.quoteDetailValue}>{quote.serviceType.replace('-', ' ')}</p>
                    </div>
                    <div className={styles.quoteDetailItem}>
                      <p className={styles.quoteDetailLabel}>Estimated Cost</p>
                      <p className={`${styles.quoteDetailValue} ${styles.highlighted}`}>₹{quote.estimatedCost}</p>
                    </div>
                    {quote.weight && (
                      <div className={styles.quoteDetailItem}>
                        <p className={styles.quoteDetailLabel}>Weight</p>
                        <p className={styles.quoteDetailValue}>{quote.weight} kg</p>
                      </div>
                    )}
                  </div>

                  {quote.items && Object.values(quote.items).some(v => v > 0) && (
                    <div className={styles.quoteItemsSection}>
                      <p className={styles.quoteItemsLabel}>Items</p>
                      <div className={styles.quoteItemsList}>
                        {Object.entries(quote.items).filter(([, qty]) => qty > 0).map(([item, qty]) => (
                          <span key={item} className={styles.quoteItemBadge}>
                            {item} ×{qty}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <p style={{ margin: '0', color: '#999', fontSize: '12px' }}>
                    📅 {new Date(quote.createdAt).toLocaleDateString("en-IN")} at {new Date(quote.createdAt).toLocaleTimeString("en-IN")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SERVICES TAB */}
      {activeTab === "services" && (
        <div className={styles.servicesManagement}>
          <div className={styles.servicesHeader}>
            <div>
              <h2>Service Management</h2>
              <p className={styles.sectionSubtext}>Add, edit, or remove services shown on the Services page</p>
            </div>
            <button className={styles.addServiceBtn} onClick={openAddService}>
              <MdAdd /> Add New Service
            </button>
          </div>

          <div className={styles.servicesList}>
            {allServices.length === 0 ? (
              <div className={styles.emptyState}>
                <p>No services found. Add your first service!</p>
              </div>
            ) : (
              allServices.map((service) => (
                <div key={service.id} className={`${styles.serviceManageCard} ${!service.isActive ? styles.inactive : ""}`}>
                  <div className={styles.serviceManageHeader}>
                    <div className={styles.serviceManageInfo}>
                      <h3>{service.name}</h3>
                      <span className={styles.serviceIconBadge}>Icon: {service.icon}</span>
                      <span className={styles.turnaroundBadge}>⏱️ {service.turnaround}</span>
                      <span className={`${styles.statusBadge} ${service.isActive ? styles.active : styles.inactive}`}>
                        {service.isActive ? "Active" : "Hidden"}
                      </span>
                    </div>
                    <div className={styles.serviceManageActions}>
                      <button
                        className={styles.toggleVisibilityBtn}
                        onClick={() => toggleServiceActive(service)}
                        title={service.isActive ? "Hide service" : "Show service"}
                      >
                        {service.isActive ? <MdVisibilityOff /> : <MdVisibility />}
                      </button>
                      <button
                        className={styles.editBtn}
                        onClick={() => openEditService(service)}
                      >
                        <MdEdit /> Edit
                      </button>
                      <button
                        className={styles.deleteBtn}
                        onClick={() => deleteService(service.id)}
                      >
                        <MdDelete />
                      </button>
                    </div>
                  </div>
                  
                  <p className={styles.serviceManageDesc}>{service.description}</p>
                  
                  <div className={styles.serviceManageDetails}>
                    <div className={styles.featuresPreview}>
                      <strong>Features:</strong>
                      <ul>
                        {service.features.slice(0, 3).map((f, i) => (
                          <li key={i}>{f}</li>
                        ))}
                        {service.features.length > 3 && <li>+{service.features.length - 3} more</li>}
                      </ul>
                    </div>
                    <div className={styles.pricingPreview}>
                      <strong>Pricing:</strong>
                      <ul>
                        {service.pricing.slice(0, 3).map((p, i) => (
                          <li key={i}>{p.item}: ₹{p.price}</li>
                        ))}
                        {service.pricing.length > 3 && <li>+{service.pricing.length - 3} more</li>}
                      </ul>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* SUPPORT CHAT TAB */}
      {activeTab === "support" && (
        <div className={styles.supportSection}>
          <AdminChatPanel />
        </div>
      )}

      {/* USERS TAB */}
      {activeTab === "users" && (
        <div className={styles.usersSection}>
          <div className={styles.usersHeader}>
            <h2><MdPeople /> User Management ({users.length} users)</h2>
            <div className={styles.usersControls}>
              <div className={styles.searchBox}>
                <MdSearch />
                <input
                  type="text"
                  placeholder="Search by name, email, or phone..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
              </div>
              <div className={styles.roleFilter}>
                <button
                  className={userRoleFilter === "all" ? styles.active : ""}
                  onClick={() => setUserRoleFilter("all")}
                >
                  All
                </button>
                <button
                  className={userRoleFilter === "admin" ? styles.active : ""}
                  onClick={() => setUserRoleFilter("admin")}
                >
                  <MdAdminPanelSettings /> Admins ({users.filter(u => u.role === "admin").length})
                </button>
                <button
                  className={userRoleFilter === "user" ? styles.active : ""}
                  onClick={() => setUserRoleFilter("user")}
                >
                  <MdPerson /> Users ({users.filter(u => u.role === "user").length})
                </button>
              </div>
            </div>
          </div>

          {filteredUsers.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No users found</p>
            </div>
          ) : (
            <div className={styles.usersGrid}>
              {filteredUsers.map((u) => (
                <div key={u.id} className={styles.userCard}>
                  <div className={styles.userAvatar}>
                    {u.photoURL ? (
                      <img src={u.photoURL} alt={u.name} />
                    ) : (
                      <span>{(u.name || u.email || "?").charAt(0).toUpperCase()}</span>
                    )}
                    <span className={`${styles.roleBadge} ${styles[u.role]}`}>
                      {u.role === "admin" ? <MdAdminPanelSettings /> : <MdPerson />}
                    </span>
                  </div>
                  <div className={styles.userInfo}>
                    <h3>{u.name || "No name"}</h3>
                    <p className={styles.userEmail}><MdEmail /> {u.email}</p>
                    {u.phone && <p className={styles.userPhone}><MdPhone /> {u.phone}</p>}
                    <p className={styles.userDate}>
                      Joined: {new Date(u.createdAt).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                  <div className={styles.userActions}>
                    <label className={styles.roleToggle}>
                      <span>Role:</span>
                      <select
                        value={u.role}
                        onChange={(e) => updateUserRole(u.id, e.target.value as "admin" | "user")}
                        disabled={u.id === user?.uid}
                        className={u.role === "admin" ? styles.adminSelect : styles.userSelect}
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </label>
                    {u.id === user?.uid && (
                      <span className={styles.youBadge}>You</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SETTINGS TAB */}
      {activeTab === "settings" && (
        <div className={styles.tabContent}>
          <h2 style={{ marginBottom: '20px' }}>Site Settings</h2>
          <p style={{ color: '#666', marginBottom: '30px' }}>
            Manage contact information, social links, and operating hours displayed across the website.
          </p>

          <div className={styles.settingsGrid}>
            {/* Contact Information */}
            <div className={styles.settingsSection}>
              <h3>📞 Contact Information</h3>
              <div className={styles.settingsGroup}>
                <label>Phone Number (for calling)</label>
                <input
                  type="text"
                  value={siteSettings.phone}
                  onChange={(e) => updateSetting("phone", e.target.value)}
                  placeholder="+918080808080"
                />
              </div>
              <div className={styles.settingsGroup}>
                <label>Phone Display (shown on site)</label>
                <input
                  type="text"
                  value={siteSettings.phoneDisplay}
                  onChange={(e) => updateSetting("phoneDisplay", e.target.value)}
                  placeholder="080-8080-8080"
                />
              </div>
              <div className={styles.settingsGroup}>
                <label>Email Address</label>
                <input
                  type="email"
                  value={siteSettings.email}
                  onChange={(e) => updateSetting("email", e.target.value)}
                  placeholder="hello@drdhobi.in"
                />
              </div>
              <div className={styles.settingsGroup}>
                <label>WhatsApp Number</label>
                <input
                  type="text"
                  value={siteSettings.whatsappNumber}
                  onChange={(e) => updateSetting("whatsappNumber", e.target.value)}
                  placeholder="+918080808080"
                />
              </div>
            </div>

            {/* Address */}
            <div className={styles.settingsSection}>
              <h3>📍 Business Address</h3>
              <div className={styles.settingsGroup}>
                <label>Street/Area</label>
                <input
                  type="text"
                  value={siteSettings.address}
                  onChange={(e) => updateSetting("address", e.target.value)}
                  placeholder="Koramangala"
                />
              </div>
              <div className={styles.settingsGroup}>
                <label>City</label>
                <input
                  type="text"
                  value={siteSettings.city}
                  onChange={(e) => updateSetting("city", e.target.value)}
                  placeholder="Bangalore"
                />
              </div>
              <div className={styles.settingsGroup}>
                <label>State</label>
                <input
                  type="text"
                  value={siteSettings.state}
                  onChange={(e) => updateSetting("state", e.target.value)}
                  placeholder="Karnataka"
                />
              </div>
              <div className={styles.settingsGroup}>
                <label>Country</label>
                <input
                  type="text"
                  value={siteSettings.country}
                  onChange={(e) => updateSetting("country", e.target.value)}
                  placeholder="India"
                />
              </div>
            </div>

            {/* Operating Hours */}
            <div className={styles.settingsSection}>
              <h3>🕐 Operating Hours</h3>
              <div className={styles.settingsGroup}>
                <label>Operating Days</label>
                <input
                  type="text"
                  value={siteSettings.operatingDays}
                  onChange={(e) => updateSetting("operatingDays", e.target.value)}
                  placeholder="Mon - Sat"
                />
              </div>
              <div className={styles.settingsGroup}>
                <label>Weekday Hours</label>
                <input
                  type="text"
                  value={siteSettings.weekdayHours}
                  onChange={(e) => updateSetting("weekdayHours", e.target.value)}
                  placeholder="8:00 AM - 8:00 PM"
                />
              </div>
              <div className={styles.settingsGroup}>
                <label>Weekend Hours</label>
                <input
                  type="text"
                  value={siteSettings.weekendHours}
                  onChange={(e) => updateSetting("weekendHours", e.target.value)}
                  placeholder="10:00 AM - 4:00 PM"
                />
              </div>
            </div>

            {/* Social Links */}
            <div className={styles.settingsSection}>
              <h3>🌐 Social Media Links</h3>
              <div className={styles.settingsGroup}>
                <label>Facebook URL</label>
                <input
                  type="url"
                  value={siteSettings.facebookUrl}
                  onChange={(e) => updateSetting("facebookUrl", e.target.value)}
                  placeholder="https://facebook.com/drdhobi"
                />
              </div>
              <div className={styles.settingsGroup}>
                <label>Instagram URL</label>
                <input
                  type="url"
                  value={siteSettings.instagramUrl}
                  onChange={(e) => updateSetting("instagramUrl", e.target.value)}
                  placeholder="https://instagram.com/drdhobi"
                />
              </div>
              <div className={styles.settingsGroup}>
                <label>Twitter/X URL</label>
                <input
                  type="url"
                  value={siteSettings.twitterUrl}
                  onChange={(e) => updateSetting("twitterUrl", e.target.value)}
                  placeholder="https://x.com/drdhobi"
                />
              </div>
              <div className={styles.settingsGroup}>
                <label>WhatsApp Link</label>
                <input
                  type="url"
                  value={siteSettings.whatsappUrl}
                  onChange={(e) => updateSetting("whatsappUrl", e.target.value)}
                  placeholder="https://wa.me/918080808080"
                />
              </div>
            </div>

            {/* Business Info */}
            <div className={styles.settingsSection}>
              <h3>🏢 Business Info</h3>
              <div className={styles.settingsGroup}>
                <label>Business Name</label>
                <input
                  type="text"
                  value={siteSettings.businessName}
                  onChange={(e) => updateSetting("businessName", e.target.value)}
                  placeholder="Dr Dhobi"
                />
              </div>
              <div className={styles.settingsGroup}>
                <label>Tagline</label>
                <input
                  type="text"
                  value={siteSettings.tagline}
                  onChange={(e) => updateSetting("tagline", e.target.value)}
                  placeholder="Premium Doorstep Laundry Service"
                />
              </div>
            </div>
          </div>

          <div style={{ marginTop: '30px', display: 'flex', gap: '15px' }}>
            <button
              onClick={saveSiteSettings}
              disabled={savingSettings}
              className={styles.saveBtn}
              style={{ padding: '14px 28px', fontSize: '16px' }}
            >
              {savingSettings ? "💾 Saving..." : "💾 Save All Settings"}
            </button>
            <button
              onClick={fetchSiteSettings}
              className={styles.cancelBtn}
              style={{ padding: '14px 28px', fontSize: '16px' }}
            >
              🔄 Reset Changes
            </button>
          </div>
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

      {showPricingModal && (
        <div className={styles.modal} onClick={() => setShowPricingModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2>💰 Manage Pricing</h2>
            <p className={styles.modalSubtext}>Set prices for instant quotations</p>

            <div className={styles.pricingSection}>
              <h3 className={styles.pricingSectionTitle}>Item Prices (per piece)</h3>
              <div className={styles.pricingItemsGrid}>
                {Object.entries(pricing.items).map(([item, price]) => (
                  <div key={item} className={styles.pricingInputGroup}>
                    <label className={styles.pricingInputLabel}>
                      {item}
                    </label>
                    <div className={styles.pricingInputWrapper}>
                      <span className={styles.pricingCurrencySymbol}>₹</span>
                      <input
                        type="number"
                        value={price}
                        onChange={(e) => updateItemPrice(item, parseInt(e.target.value) || 0)}
                        className={styles.pricingInput}
                        min="0"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.pricingSection}>
              <h3 className={styles.pricingSectionTitle}>Pickup Settings</h3>
              <div className={styles.pickupSettings}>
                <div className={styles.pickupSettingItem}>
                  <label className={styles.pricingInputLabel}>
                    Pickup Charge
                  </label>
                  <div className={styles.pricingInputWrapper}>
                    <span className={styles.pricingCurrencySymbol}>₹</span>
                    <input
                      type="number"
                      value={pricing.pickupCharge}
                      onChange={(e) => setPricing(prev => ({ ...prev, pickupCharge: parseInt(e.target.value) || 0 }))}
                      className={styles.pricingInput}
                      min="0"
                    />
                  </div>
                </div>

                <div className={styles.pickupSettingItem}>
                  <label className={styles.pricingInputLabel}>
                    Free Pickup Threshold (minimum order value)
                  </label>
                  <div className={styles.pricingInputWrapper}>
                    <span className={styles.pricingCurrencySymbol}>₹</span>
                    <input
                      type="number"
                      value={pricing.freePickupThreshold}
                      onChange={(e) => setPricing(prev => ({ ...prev, freePickupThreshold: parseInt(e.target.value) || 0 }))}
                      className={styles.pricingInput}
                      min="0"
                    />
                  </div>
                  <p className={styles.pickupHint}>
                    Orders above this amount get free pickup
                  </p>
                </div>
              </div>
            </div>

            <div className={styles.modalActions}>
              <button
                className={styles.cancelBtn}
                onClick={() => setShowPricingModal(false)}
                disabled={savingPricing}
              >
                Cancel
              </button>
              <button
                onClick={savePricing}
                disabled={savingPricing}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: savingPricing ? '#999' : '#1e8ba5',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: savingPricing ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  fontWeight: '500',
                  flex: 1,
                  minWidth: '120px',
                }}
              >
                {savingPricing ? '💾 Saving...' : '💾 Save Pricing'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SERVICE ADD/EDIT MODAL */}
      {showServiceModal && (
        <div className={styles.modal} onClick={() => setShowServiceModal(false)}>
          <div className={styles.serviceModalContent} onClick={(e) => e.stopPropagation()}>
            <h2>{editingServiceData ? "✏️ Edit Service" : "➕ Add New Service"}</h2>
            
            <div className={styles.serviceForm}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Service Name *</label>
                  <input
                    type="text"
                    value={newService.name || ""}
                    onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                    placeholder="e.g., Dry Cleaning"
                    className={styles.formInput}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Icon</label>
                  <select
                    value={newService.icon || "default"}
                    onChange={(e) => setNewService({ ...newService, icon: e.target.value })}
                    className={styles.formSelect}
                  >
                    {iconOptions.map((opt) => (
                      <option key={opt.id} value={opt.id}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Turnaround Time</label>
                  <input
                    type="text"
                    value={newService.turnaround || ""}
                    onChange={(e) => setNewService({ ...newService, turnaround: e.target.value })}
                    placeholder="e.g., 24 hours"
                    className={styles.formInput}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Display Order</label>
                  <input
                    type="number"
                    value={newService.order || 99}
                    onChange={(e) => setNewService({ ...newService, order: parseInt(e.target.value) || 99 })}
                    className={styles.formInput}
                    min="1"
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Description *</label>
                <textarea
                  value={newService.description || ""}
                  onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                  placeholder="Describe the service..."
                  className={styles.formTextarea}
                  rows={3}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Features</label>
                <div className={styles.dynamicList}>
                  {(newService.features || [""]).map((feature, index) => (
                    <div key={index} className={styles.dynamicListItem}>
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => {
                          const updatedFeatures = [...(newService.features || [])];
                          updatedFeatures[index] = e.target.value;
                          setNewService({ ...newService, features: updatedFeatures });
                        }}
                        placeholder="Feature description"
                        className={styles.formInput}
                      />
                      <button
                        type="button"
                        className={styles.removeItemBtn}
                        onClick={() => {
                          const updatedFeatures = (newService.features || []).filter((_, i) => i !== index);
                          setNewService({ ...newService, features: updatedFeatures.length ? updatedFeatures : [""] });
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className={styles.addItemBtn}
                    onClick={() => setNewService({ ...newService, features: [...(newService.features || []), ""] })}
                  >
                    + Add Feature
                  </button>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Pricing Items</label>
                <div className={styles.dynamicList}>
                  {(newService.pricing || [{ item: "", price: 0 }]).map((priceItem, index) => (
                    <div key={index} className={styles.pricingRow}>
                      <input
                        type="text"
                        value={priceItem.item}
                        onChange={(e) => {
                          const updatedPricing = [...(newService.pricing || [])];
                          updatedPricing[index] = { ...updatedPricing[index], item: e.target.value };
                          setNewService({ ...newService, pricing: updatedPricing });
                        }}
                        placeholder="Item name"
                        className={styles.formInput}
                      />
                      <div className={styles.priceInputWrapper}>
                        <span>₹</span>
                        <input
                          type="number"
                          value={priceItem.price}
                          onChange={(e) => {
                            const updatedPricing = [...(newService.pricing || [])];
                            updatedPricing[index] = { ...updatedPricing[index], price: parseInt(e.target.value) || 0 };
                            setNewService({ ...newService, pricing: updatedPricing });
                          }}
                          className={styles.priceInput}
                          min="0"
                        />
                      </div>
                      <button
                        type="button"
                        className={styles.removeItemBtn}
                        onClick={() => {
                          const updatedPricing = (newService.pricing || []).filter((_, i) => i !== index);
                          setNewService({ ...newService, pricing: updatedPricing.length ? updatedPricing : [{ item: "", price: 0 }] });
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className={styles.addItemBtn}
                    onClick={() => setNewService({ ...newService, pricing: [...(newService.pricing || []), { item: "", price: 0 }] })}
                  >
                    + Add Pricing Item
                  </button>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={newService.isActive !== false}
                    onChange={(e) => setNewService({ ...newService, isActive: e.target.checked })}
                  />
                  <span>Service is active (visible on website)</span>
                </label>
              </div>
            </div>

            <div className={styles.modalActions}>
              <button
                className={styles.cancelBtn}
                onClick={() => {
                  setShowServiceModal(false);
                  setEditingServiceData(null);
                  resetNewService();
                }}
                disabled={savingService}
              >
                Cancel
              </button>
              <button
                className={styles.saveBtn}
                onClick={() => saveService(editingServiceData ? { ...newService, id: editingServiceData.id, createdAt: editingServiceData.createdAt } : newService)}
                disabled={savingService || !newService.name || !newService.description}
              >
                {savingService ? "💾 Saving..." : editingServiceData ? "💾 Update Service" : "💾 Create Service"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
