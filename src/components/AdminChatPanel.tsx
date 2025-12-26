"use client";

import { useState, useEffect, useRef } from "react";
import { collection, query, orderBy, onSnapshot, addDoc, doc, updateDoc, increment, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "./AuthProvider";
import type { Conversation, ChatMessage } from "@/types/chat";
import styles from "./AdminChat.module.css";
import { MdSend, MdPerson, MdCircle, MdCheck, MdRefresh } from "react-icons/md";

export function AdminChatPanel() {
  const { user, userProfile } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [filter, setFilter] = useState<"all" | "open" | "pending" | "resolved" | "closed">("all");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Listen for all conversations
  useEffect(() => {
    let q;
    
    if (filter === "all") {
      q = query(
        collection(db, "conversations"),
        orderBy("lastMessageAt", "desc")
      );
    } else {
      q = query(
        collection(db, "conversations"),
        where("status", "==", filter),
        orderBy("lastMessageAt", "desc")
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const convs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Conversation[];
      
      setConversations(convs);
    });

    return () => unsubscribe();
  }, [filter]);

  // Listen for messages in active conversation
  useEffect(() => {
    if (!activeConversation) return;

    const q = query(
      collection(db, "conversations", activeConversation.id, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ChatMessage[];
      
      setMessages(msgs);
      
      // Scroll to bottom
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    });

    // Mark messages as read by admin
    if (activeConversation.unreadByAdmin > 0) {
      updateDoc(doc(db, "conversations", activeConversation.id), {
        unreadByAdmin: 0,
      });
    }

    return () => unsubscribe();
  }, [activeConversation]);

  const handleSendMessage = async () => {
    if (!user || !userProfile || !activeConversation || !newMessage.trim()) return;

    const messageText = newMessage.trim();
    setNewMessage("");

    try {
      // Add message to subcollection
      await addDoc(collection(db, "conversations", activeConversation.id, "messages"), {
        conversationId: activeConversation.id,
        senderId: user.uid,
        senderName: userProfile.name || "Support Team",
        senderRole: "admin",
        message: messageText,
        messageType: "text",
        read: false,
        createdAt: new Date().toISOString(),
      });

      // Update conversation
      await updateDoc(doc(db, "conversations", activeConversation.id), {
        lastMessage: messageText.substring(0, 100),
        lastMessageAt: new Date().toISOString(),
        lastMessageBy: "admin",
        unreadByUser: increment(1),
        updatedAt: new Date().toISOString(),
        assignedAdminId: user.uid,
        assignedAdminName: userProfile.name || "Support",
      });

      // Create notification for the user
      await addDoc(collection(db, "notifications"), {
        userId: activeConversation.userId,
        type: "message",
        title: "New Message from Support",
        body: messageText.substring(0, 100),
        data: {
          conversationId: activeConversation.id,
          senderId: user.uid,
        },
        read: false,
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error sending message:", error);
      setNewMessage(messageText);
    }
  };

  const handleStatusChange = async (status: Conversation["status"]) => {
    if (!activeConversation) return;

    try {
      await updateDoc(doc(db, "conversations", activeConversation.id), {
        status,
        updatedAt: new Date().toISOString(),
      });

      // Update local state
      setActiveConversation({ ...activeConversation, status });

      // Notify user about status change
      await addDoc(collection(db, "notifications"), {
        userId: activeConversation.userId,
        type: "message",
        title: "Support Request Updated",
        body: `Your support request has been marked as "${status}"`,
        data: {
          conversationId: activeConversation.id,
        },
        read: false,
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } else if (days === 1) {
      return "Yesterday";
    } else if (days < 7) {
      return date.toLocaleDateString([], { weekday: "short" });
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  const getTotalUnread = () => {
    return conversations.reduce((acc, conv) => acc + (conv.unreadByAdmin || 0), 0);
  };

  return (
    <div className={styles.container}>
      {/* Conversation List */}
      <div className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h3>Support Chats</h3>
          {getTotalUnread() > 0 && (
            <span className={styles.unreadBadge}>{getTotalUnread()}</span>
          )}
        </div>

        <div className={styles.filterTabs}>
          {(["all", "open", "pending", "resolved", "closed"] as const).map((f) => (
            <button
              key={f}
              className={`${styles.filterTab} ${filter === f ? styles.active : ""}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        <div className={styles.conversationList}>
          {conversations.length === 0 ? (
            <div className={styles.emptyList}>
              <MdPerson />
              <p>No conversations</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                className={`${styles.conversationItem} ${
                  activeConversation?.id === conv.id ? styles.active : ""
                } ${conv.unreadByAdmin > 0 ? styles.unread : ""}`}
                onClick={() => setActiveConversation(conv)}
              >
                <div className={styles.convAvatar}>
                  {conv.userName.charAt(0).toUpperCase()}
                </div>
                <div className={styles.convInfo}>
                  <div className={styles.convName}>{conv.userName}</div>
                  <div className={styles.convSubject}>{conv.subject}</div>
                  <div className={styles.convPreview}>
                    {conv.lastMessageBy === "admin" && <MdCheck className={styles.sentIcon} />}
                    {conv.lastMessage}
                  </div>
                </div>
                <div className={styles.convMeta}>
                  <span className={styles.convTime}>{formatTime(conv.lastMessageAt)}</span>
                  {conv.unreadByAdmin > 0 && (
                    <span className={styles.unreadCount}>{conv.unreadByAdmin}</span>
                  )}
                  <span className={`${styles.statusDot} ${styles[conv.status]}`} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={styles.chatArea}>
        {!activeConversation ? (
          <div className={styles.noSelection}>
            <MdPerson />
            <h3>Select a conversation</h3>
            <p>Choose a conversation from the list to start chatting</p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className={styles.chatHeader}>
              <div className={styles.chatHeaderInfo}>
                <div className={styles.chatAvatar}>
                  {activeConversation.userName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4>{activeConversation.userName}</h4>
                  <p>{activeConversation.userEmail}</p>
                </div>
              </div>
              <div className={styles.chatActions}>
                <select
                  value={activeConversation.status}
                  onChange={(e) => handleStatusChange(e.target.value as Conversation["status"])}
                  className={styles.statusSelect}
                >
                  <option value="open">Open</option>
                  <option value="pending">Pending</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>

            {/* Messages */}
            <div className={styles.messagesContainer}>
              <div className={styles.subjectHeader}>
                <strong>Subject:</strong> {activeConversation.subject}
                {activeConversation.relatedBookingId && (
                  <span className={styles.bookingLink}>
                    📦 Related Booking: {activeConversation.relatedBookingId}
                  </span>
                )}
              </div>

              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`${styles.message} ${
                    msg.senderRole === "admin" ? styles.sent : styles.received
                  }`}
                >
                  {msg.senderRole === "user" && (
                    <span className={styles.senderName}>{msg.senderName}</span>
                  )}
                  <div className={styles.messageContent}>{msg.message}</div>
                  <span className={styles.messageTime}>
                    {formatTime(msg.createdAt)}
                    {msg.senderRole === "admin" && msg.read && (
                      <MdCheck className={styles.readIcon} />
                    )}
                  </span>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className={styles.messageInput}>
              <textarea
                placeholder="Type your reply..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                rows={2}
              />
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className={styles.sendBtn}
              >
                <MdSend />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
