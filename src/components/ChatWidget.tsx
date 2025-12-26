"use client";

import { useState, useEffect, useRef } from "react";
import { collection, query, where, orderBy, onSnapshot, addDoc, doc, updateDoc, increment } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { useAuth } from "./AuthProvider";
import type { Conversation, ChatMessage } from "@/types/chat";
import styles from "./Chat.module.css";
import { MdSend, MdClose, MdChat, MdExpandMore, MdExpandLess, MdCircle } from "react-icons/md";

interface ChatWidgetProps {
  relatedBookingId?: string;
  defaultSubject?: string;
}

export function ChatWidget({ relatedBookingId, defaultSubject }: ChatWidgetProps) {
  const { user, userProfile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [subject, setSubject] = useState(defaultSubject || "");
  const [loading, setLoading] = useState(false);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Listen for user's conversations
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "conversations"),
      where("userId", "==", user.uid),
      orderBy("lastMessageAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const convs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Conversation[];
      
      setConversations(convs);
      
      // Calculate total unread
      const totalUnread = convs.reduce((acc, conv) => acc + (conv.unreadByUser || 0), 0);
      setUnreadCount(totalUnread);
    });

    return () => unsubscribe();
  }, [user]);

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

    // Mark messages as read
    if (activeConversation.unreadByUser > 0) {
      updateDoc(doc(db, "conversations", activeConversation.id), {
        unreadByUser: 0,
      });
    }

    return () => unsubscribe();
  }, [activeConversation]);

  const handleCreateConversation = async () => {
    if (!user || !userProfile || !subject.trim()) return;

    setLoading(true);
    try {
      const conversationData = {
        userId: user.uid,
        userName: userProfile.name,
        userEmail: userProfile.email,
        status: "open",
        subject: subject.trim(),
        lastMessage: "Started a conversation",
        lastMessageAt: new Date().toISOString(),
        lastMessageBy: "user",
        unreadByUser: 0,
        unreadByAdmin: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        relatedBookingId: relatedBookingId || null,
      };

      const conversationRef = await addDoc(collection(db, "conversations"), conversationData);
      
      setActiveConversation({
        id: conversationRef.id,
        ...conversationData,
      } as Conversation);
      
      setShowNewConversation(false);
      setSubject("");
    } catch (error) {
      console.error("Error creating conversation:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!user || !userProfile || !activeConversation || !newMessage.trim()) return;

    const messageText = newMessage.trim();
    setNewMessage("");

    try {
      // Add message to subcollection
      await addDoc(collection(db, "conversations", activeConversation.id, "messages"), {
        conversationId: activeConversation.id,
        senderId: user.uid,
        senderName: userProfile.name,
        senderRole: "user",
        message: messageText,
        messageType: "text",
        read: false,
        createdAt: new Date().toISOString(),
      });

      // Update conversation
      await updateDoc(doc(db, "conversations", activeConversation.id), {
        lastMessage: messageText.substring(0, 100),
        lastMessageAt: new Date().toISOString(),
        lastMessageBy: "user",
        unreadByAdmin: increment(1),
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error sending message:", error);
      setNewMessage(messageText);
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

  if (!user) return null;

  return (
    <>
      {/* Chat Toggle Button */}
      {!isOpen && (
        <button
          className={styles.chatToggle}
          onClick={() => setIsOpen(true)}
          aria-label="Open chat"
        >
          <MdChat />
          {unreadCount > 0 && (
            <span className={styles.unreadBadge}>{unreadCount}</span>
          )}
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={`${styles.chatWindow} ${isMinimized ? styles.minimized : ""}`}>
          {/* Header */}
          <div className={styles.chatHeader}>
            <div className={styles.headerInfo}>
              <MdChat />
              <span>Customer Support</span>
              {unreadCount > 0 && <span className={styles.headerBadge}>{unreadCount}</span>}
            </div>
            <div className={styles.headerActions}>
              <button onClick={() => setIsMinimized(!isMinimized)}>
                {isMinimized ? <MdExpandLess /> : <MdExpandMore />}
              </button>
              <button onClick={() => setIsOpen(false)}>
                <MdClose />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <div className={styles.chatBody}>
              {/* Conversation List View */}
              {!activeConversation && !showNewConversation && (
                <div className={styles.conversationList}>
                  <button
                    className={styles.newConversationBtn}
                    onClick={() => setShowNewConversation(true)}
                  >
                    + Start New Conversation
                  </button>

                  {conversations.length === 0 ? (
                    <div className={styles.emptyState}>
                      <p>No conversations yet</p>
                      <p className={styles.hint}>Start a chat with our support team</p>
                    </div>
                  ) : (
                    conversations.map((conv) => (
                      <div
                        key={conv.id}
                        className={`${styles.conversationItem} ${conv.unreadByUser > 0 ? styles.unread : ""}`}
                        onClick={() => setActiveConversation(conv)}
                      >
                        <div className={styles.convHeader}>
                          <span className={styles.convSubject}>{conv.subject}</span>
                          <span className={styles.convTime}>{formatTime(conv.lastMessageAt)}</span>
                        </div>
                        <div className={styles.convPreview}>
                          {conv.lastMessageBy === "admin" && <MdCircle className={styles.adminDot} />}
                          <span>{conv.lastMessage}</span>
                        </div>
                        {conv.unreadByUser > 0 && (
                          <span className={styles.unreadDot}>{conv.unreadByUser}</span>
                        )}
                        <span className={`${styles.statusBadge} ${styles[conv.status]}`}>
                          {conv.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* New Conversation Form */}
              {showNewConversation && (
                <div className={styles.newConversationForm}>
                  <button
                    className={styles.backBtn}
                    onClick={() => setShowNewConversation(false)}
                  >
                    ← Back
                  </button>
                  <h4>New Conversation</h4>
                  <input
                    type="text"
                    placeholder="What do you need help with?"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className={styles.subjectInput}
                  />
                  <button
                    className={styles.startChatBtn}
                    onClick={handleCreateConversation}
                    disabled={!subject.trim() || loading}
                  >
                    {loading ? "Starting..." : "Start Chat"}
                  </button>
                </div>
              )}

              {/* Active Conversation */}
              {activeConversation && (
                <div className={styles.activeConversation}>
                  <div className={styles.convNavBar}>
                    <button
                      className={styles.backBtn}
                      onClick={() => {
                        setActiveConversation(null);
                        setMessages([]);
                      }}
                    >
                      ← Back
                    </button>
                    <span className={styles.convTitle}>{activeConversation.subject}</span>
                  </div>

                  <div className={styles.messagesContainer}>
                    {messages.length === 0 ? (
                      <div className={styles.emptyMessages}>
                        <p>No messages yet. Say hello!</p>
                      </div>
                    ) : (
                      messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`${styles.message} ${
                            msg.senderRole === "user" ? styles.sent : styles.received
                          }`}
                        >
                          {msg.senderRole === "admin" && (
                            <span className={styles.senderName}>{msg.senderName}</span>
                          )}
                          <div className={styles.messageContent}>{msg.message}</div>
                          <span className={styles.messageTime}>
                            {formatTime(msg.createdAt)}
                          </span>
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  <div className={styles.messageInput}>
                    <textarea
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      rows={1}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className={styles.sendBtn}
                    >
                      <MdSend />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}
