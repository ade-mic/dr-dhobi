"use client";

import { useState } from "react";
import styles from "./page.module.css";
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock, FaCheckCircle } from "react-icons/fa";
import { useSettings } from "@/components/SettingsProvider";

export default function ContactPage() {
  const { settings } = useSettings();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          type: "contact",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      setIsSubmitted(true);
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: <FaMapMarkerAlt />,
      title: "Our Location",
      details: [`${settings.address}, ${settings.city}`, `${settings.state}, ${settings.country}`],
    },
    {
      icon: <FaPhone />,
      title: "Phone Number",
      details: [settings.phoneDisplay, `${settings.operatingDays}: ${settings.weekdayHours}`],
    },
    {
      icon: <FaEnvelope />,
      title: "Email Address",
      details: [settings.email, "We reply within 24 hours"],
    },
    {
      icon: <FaClock />,
      title: "Working Hours",
      details: [`${settings.operatingDays}: ${settings.weekdayHours}`, `Sunday: ${settings.weekendHours}`],
    },
  ];

  return (
    <div className={styles.page}>
      <main className={styles.container}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <h1>Contact Us</h1>
          <p className={styles.heroSubtitle}>
            Have questions or feedback? We'd love to hear from you. 
            Reach out and we'll get back to you as soon as possible.
          </p>
        </section>

        <div className={styles.contentGrid}>
          {/* Contact Information */}
          <section className={styles.infoSection}>
            <h2>Get in Touch</h2>
            <div className={styles.infoCards}>
              {contactInfo.map((info, index) => (
                <div key={index} className={styles.infoCard}>
                  <div className={styles.infoIcon}>{info.icon}</div>
                  <div className={styles.infoContent}>
                    <h3>{info.title}</h3>
                    {info.details.map((detail, i) => (
                      <p key={i}>{detail}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Contact Form */}
          <section className={styles.formSection}>
            <h2>Send us a Message</h2>
            
            {isSubmitted ? (
              <div className={styles.successMessage}>
                <FaCheckCircle className={styles.successIcon} />
                <h3>Message Sent Successfully!</h3>
                <p>Thank you for reaching out. We'll get back to you within 24 hours.</p>
                <button 
                  onClick={() => setIsSubmitted(false)} 
                  className={styles.sendAnotherBtn}
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className={styles.contactForm}>
                {error && <div className={styles.errorMessage}>{error}</div>}
                
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="name">Full Name *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your name"
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="email">Email Address *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="phone">Phone Number *</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter your phone number"
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="subject">Subject</label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                    >
                      <option value="">Select a subject</option>
                      <option value="general">General Inquiry</option>
                      <option value="booking">Booking Question</option>
                      <option value="pricing">Pricing Information</option>
                      <option value="complaint">Complaint</option>
                      <option value="feedback">Feedback</option>
                      <option value="partnership">Partnership</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="message">Message *</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Write your message here..."
                    rows={6}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </button>
              </form>
            )}
          </section>
        </div>

        {/* FAQ Section */}
        <section className={styles.faqSection}>
          <h2>Frequently Asked Questions</h2>
          <div className={styles.faqGrid}>
            <div className={styles.faqItem}>
              <h3>How do I schedule a pickup?</h3>
              <p>You can schedule a pickup through our booking page or by contacting us directly.</p>
            </div>
            <div className={styles.faqItem}>
              <h3>What areas do you serve?</h3>
              <p>We currently serve most areas in Bangalore. Contact us to check if we cover your location.</p>
            </div>
            <div className={styles.faqItem}>
              <h3>What is your turnaround time?</h3>
              <p>Standard turnaround is 24-48 hours. Express service available for same-day delivery.</p>
            </div>
            <div className={styles.faqItem}>
              <h3>How do I track my order?</h3>
              <p>Once logged in, you can track your orders through your dashboard.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
