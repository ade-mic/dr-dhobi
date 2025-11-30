"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import styles from "./page.module.css";

const services = [
  {
    id: "dry-cleaning",
    name: "Dry Cleaning",
    description: "Premium solvents, hand finishing, and inspection before delivery.",
    icon: "👔",
    turnaround: "48 hours",
  },
  {
    id: "wash-fold",
    name: "Wash & Fold",
    description: "Eco detergents, soft water rinse, and neatly packed folds.",
    icon: "👕",
    turnaround: "24 hours",
  },
  {
    id: "express",
    name: "Express Pickup",
    description: "30-minute pickup promise anywhere within Bangalore ring road.",
    icon: "⚡",
    turnaround: "Same day",
  },
  {
    id: "ironing",
    name: "Premium Ironing",
    description: "Professional steam ironing with attention to every detail.",
    icon: "🔥",
    turnaround: "24 hours",
  },
];

const timeSlots = [
  "7:00 – 9:00 AM",
  "11:00 – 1:00 PM",
  "3:00 – 5:00 PM",
  "7:00 – 9:00 PM",
];

export default function BookingPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    service: "",
    date: "",
    slot: "",
    address: "",
    notes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep = (currentStep: number) => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!formData.name.trim()) {
        newErrors.name = "Name is required";
      }
      if (!formData.phone.trim()) {
        newErrors.phone = "Phone number is required";
      } else if (!/^\+?[\d\s-]{10,}$/.test(formData.phone)) {
        newErrors.phone = "Invalid phone number";
      }
    }

    if (currentStep === 2) {
      if (!formData.service) {
        newErrors.service = "Please select a service";
      }
    }

    if (currentStep === 3) {
      if (!formData.date) {
        newErrors.date = "Please select a date";
      }
      if (!formData.slot) {
        newErrors.slot = "Please select a time slot";
      }
      if (!formData.address.trim()) {
        newErrors.address = "Address is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    setStep(step - 1);
    setErrors({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep(3)) return;

    startTransition(async () => {
      try {
        const response = await fetch("/api/bookings", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to create booking");
        }

        // Show success message
        alert(
          `🎉 Booking confirmed!\n\nBooking ID: ${result.bookingId}\n\nWe've sent a confirmation ${formData.email ? 'email' : 'to your phone'}. Our team will contact you 30 minutes before pickup.`
        );

        // Reset form and redirect
        setFormData({
          name: "",
          phone: "",
          email: "",
          service: "",
          date: "",
          slot: "",
          address: "",
          notes: "",
        });
        setStep(1);
        router.push("/?booking=success");
      } catch (error) {
        console.error("Booking error:", error);
        alert(
          "❌ Failed to create booking. Please try again or call us at 080-8080-8080"
        );
      }
    });
  };

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.bookingContainer}>
        <div className={styles.header}>
          <h1>Book Your Service</h1>
          <p>Complete your booking in 3 simple steps</p>
          <div className={styles.progress}>
            <div className={`${styles.progressStep} ${step >= 1 ? styles.active : ""}`}>
              <span>1</span>
              <p>Contact</p>
            </div>
            <div className={styles.progressLine}></div>
            <div className={`${styles.progressStep} ${step >= 2 ? styles.active : ""}`}>
              <span>2</span>
              <p>Service</p>
            </div>
            <div className={styles.progressLine}></div>
            <div className={`${styles.progressStep} ${step >= 3 ? styles.active : ""}`}>
              <span>3</span>
              <p>Schedule</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {step === 1 && (
            <div className={styles.stepContent}>
              <h2>Your Contact Information</h2>
              <p className={styles.stepDesc}>
                We'll use this to confirm your booking and send updates
              </p>

              <div className={styles.formGroup}>
                <label htmlFor="name">
                  Full Name <span className={styles.required}>*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="Anika Rao"
                  className={errors.name ? styles.error : ""}
                />
                {errors.name && <span className={styles.errorText}>{errors.name}</span>}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="phone">
                  Mobile Number <span className={styles.required}>*</span>
                </label>
                <input
                  id="phone"
                  type="tel"
                  inputMode="tel"
                  value={formData.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  placeholder="+91 98765 43210"
                  className={errors.phone ? styles.error : ""}
                />
                {errors.phone && <span className={styles.errorText}>{errors.phone}</span>}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="email">Email (Optional)</label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  placeholder="you@example.com"
                />
              </div>

              <div className={styles.actions}>
                <button type="button" onClick={handleNext} className={styles.nextButton}>
                  Continue →
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className={styles.stepContent}>
              <h2>Select Your Service</h2>
              <p className={styles.stepDesc}>
                Choose the service that best fits your needs
              </p>

              <div className={styles.serviceGrid}>
                {services.map((service) => (
                  <label
                    key={service.id}
                    className={`${styles.serviceCard} ${
                      formData.service === service.id ? styles.selected : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="service"
                      value={service.id}
                      checked={formData.service === service.id}
                      onChange={(e) => updateField("service", e.target.value)}
                    />
                    <div className={styles.serviceIcon}>{service.icon}</div>
                    <h3>{service.name}</h3>
                    <p>{service.description}</p>
                    <span className={styles.turnaround}>{service.turnaround}</span>
                  </label>
                ))}
              </div>
              {errors.service && <span className={styles.errorText}>{errors.service}</span>}

              <div className={styles.actions}>
                <button type="button" onClick={handleBack} className={styles.backButton}>
                  ← Back
                </button>
                <button type="button" onClick={handleNext} className={styles.nextButton}>
                  Continue →
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className={styles.stepContent}>
              <h2>Schedule Pickup</h2>
              <p className={styles.stepDesc}>
                Choose your preferred date, time, and provide your address
              </p>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="date">
                    Pickup Date <span className={styles.required}>*</span>
                  </label>
                  <input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => updateField("date", e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className={errors.date ? styles.error : ""}
                  />
                  {errors.date && <span className={styles.errorText}>{errors.date}</span>}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="slot">
                    Time Slot <span className={styles.required}>*</span>
                  </label>
                  <select
                    id="slot"
                    value={formData.slot}
                    onChange={(e) => updateField("slot", e.target.value)}
                    className={errors.slot ? styles.error : ""}
                  >
                    <option value="">Select a slot</option>
                    {timeSlots.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                  {errors.slot && <span className={styles.errorText}>{errors.slot}</span>}
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="address">
                  Pickup Address <span className={styles.required}>*</span>
                </label>
                <textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => updateField("address", e.target.value)}
                  placeholder="Building name, street, landmark, area"
                  rows={3}
                  className={errors.address ? styles.error : ""}
                />
                {errors.address && <span className={styles.errorText}>{errors.address}</span>}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="notes">Special Instructions (Optional)</label>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => updateField("notes", e.target.value)}
                  placeholder="Gate codes, fabric alerts, delivery preferences..."
                  rows={2}
                />
              </div>

              <div className={styles.summary}>
                <h3>Booking Summary</h3>
                <div className={styles.summaryGrid}>
                  <div>
                    <strong>Service:</strong>
                    <span>{services.find((s) => s.id === formData.service)?.name}</span>
                  </div>
                  <div>
                    <strong>Pickup:</strong>
                    <span>
                      {formData.date
                        ? new Date(formData.date).toLocaleDateString("en-IN", {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                          })
                        : "Not selected"}
                    </span>
                  </div>
                  <div>
                    <strong>Time:</strong>
                    <span>{formData.slot || "Not selected"}</span>
                  </div>
                  <div>
                    <strong>Contact:</strong>
                    <span>{formData.phone}</span>
                  </div>
                </div>
              </div>

              <div className={styles.actions}>
                <button type="button" onClick={handleBack} className={styles.backButton}>
                  ← Back
                </button>
                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={isPending}
                >
                  {isPending ? "Confirming..." : "Confirm Booking 🎉"}
                </button>
              </div>
            </div>
          )}
        </form>

        <div className={styles.helpBox}>
          <p>
            Need help? Call us at{" "}
            <a href="tel:+918080808080">080-8080-8080</a> or WhatsApp 24/7
          </p>
        </div>
      </div>
    </div>
  );
}
