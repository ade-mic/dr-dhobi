"use client";

import type { ReactNode } from "react";
import { useCallback, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import { RiShirtLine } from "react-icons/ri";
import { FaShirt } from "react-icons/fa6";
import { FaShippingFast } from "react-icons/fa";
import { MdOutlineWorkspacePremium } from "react-icons/md";

type Step = 1 | 2 | 3;

interface BookingService {
  id: string;
  name: string;
  description: string;
  icon: ReactNode;
  turnaround: string;
}

interface BookingFormData {
  name: string;
  phone: string;
  email: string;
  service: string;
  date: string;
  slot: string;
  address: string;
  notes: string;
}

type StepValidator = (data: BookingFormData) => Record<string, string>;

interface SuccessInfo {
  bookingId: string;
  email: string;
  phone: string;
  hasEmail: boolean;
}

const describeContactChannels = ({ email, phone, hasEmail }: SuccessInfo) => {
  const channels: string[] = [];
  if (hasEmail && email) channels.push(`email ${email}`);
  if (phone) channels.push(`phone ${phone}`);
  if (!channels.length) return "our team";
  if (channels.length === 1) return channels[0];
  return `${channels[0]} and ${channels[1]}`;
};

const services: BookingService[] = [
  {
    id: "dry-cleaning",
    name: "Dry Cleaning",
    description: "Premium solvents, hand finishing, and inspection before delivery.",
    icon: <RiShirtLine />,
    turnaround: "48 hours",
  },
  {
    id: "wash-fold",
    name: "Wash & Fold",
    description: "Eco detergents, soft water rinse, and neatly packed folds.",
    icon: <FaShirt />,
    turnaround: "24 hours",
  },
  {
    id: "express",
    name: "Express Pickup",
    description: "30-minute pickup promise anywhere within Bangalore ring road.",
    icon: <FaShippingFast />,
    turnaround: "Same day",
  },
  {
    id: "ironing",
    name: "Premium Ironing",
    description: "Professional steam ironing with attention to every detail.",
    icon: <MdOutlineWorkspacePremium />,
    turnaround: "24 hours",
  },
];

const timeSlots = [
  "7:00 – 9:00 AM",
  "11:00 – 1:00 PM",
  "3:00 – 5:00 PM",
  "7:00 – 9:00 PM",
];

const createInitialFormData = (): BookingFormData => ({
  name: "",
  phone: "",
  email: "",
  service: "",
  date: "",
  slot: "",
  address: "",
  notes: "",
});

const stepValidators: Record<Step, StepValidator> = {
  1: (data) => {
    const validationErrors: Record<string, string> = {};

    if (!data.name.trim()) {
      validationErrors.name = "Name is required";
    }

    if (!data.phone.trim()) {
      validationErrors.phone = "Phone number is required";
    } else if (!/^\+?[\d\s-]{10,}$/.test(data.phone)) {
      validationErrors.phone = "Invalid phone number";
    }

    return validationErrors;
  },
  2: (data) => {
    const validationErrors: Record<string, string> = {};

    if (!data.service) {
      validationErrors.service = "Please select a service";
    }

    return validationErrors;
  },
  3: (data) => {
    const validationErrors: Record<string, string> = {};

    if (!data.date) {
      validationErrors.date = "Please select a date";
    }
    if (!data.slot) {
      validationErrors.slot = "Please select a time slot";
    }
    if (!data.address.trim()) {
      validationErrors.address = "Address is required";
    }

    return validationErrors;
  },
};

export default function BookingPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState<Step>(1);
  const [formData, setFormData] = useState<BookingFormData>(createInitialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successInfo, setSuccessInfo] = useState<SuccessInfo | null>(null);

  const selectedService = useMemo(
    () => services.find((service) => service.id === formData.service),
    [formData.service]
  );

  const validateStep = useCallback(
    (currentStep: Step) => {
      const validationErrors = stepValidators[currentStep]?.(formData) ?? {};
      setErrors(validationErrors);
      return Object.keys(validationErrors).length === 0;
    },
    [formData]
  );

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => (Math.min(prev + 1, 3) as Step));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    setStep((prev) => (Math.max(prev - 1, 1) as Step));
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
        setSuccessInfo({
          bookingId: result.bookingId,
          email: formData.email,
          phone: formData.phone,
          hasEmail: Boolean(formData.email),
        });
      } catch (error) {
        console.error("Booking error:", error);
        alert(
          "❌ Failed to create booking. Please try again or call us at 080-8080-8080"
        );
      }
    });
  };

  const updateField = useCallback(
    (field: keyof BookingFormData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: "" }));
      }
    },
    [errors]
  );

  const handleSuccessClose = useCallback(() => {
    setSuccessInfo(null);
    setFormData(createInitialFormData());
    setStep(1);
    router.push("/?booking=success");
  }, [router]);

  const successModal = successInfo ? (
    <div className={styles.successModal} role="dialog" aria-modal="true">
      <div className={styles.modalOverlay}>
        <div className={styles.modalContent}>
          <div className={styles.modalIcon}>✓</div>
          <h2>Booking Received</h2>
          <p>
            Thanks for booking with Dr Dhobi—your request is locked in.
            We'll follow up through {describeContactChannels(successInfo)} shortly.
          </p>
          <div className={styles.bookingDetails}>
            <p>
              <strong>Booking ID:</strong> {successInfo.bookingId}
            </p>
          </div>
          <p className={styles.modalSubtext}>
            Our team will contact you 30 minutes before pickup.
          </p>
          <button
            type="button"
            onClick={handleSuccessClose}
            className={styles.modalButton}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  ) : null;

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
                    <span>{selectedService?.name}</span>
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
      {successModal}
    </div>
  );
}
