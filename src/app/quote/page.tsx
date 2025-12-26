"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";
import { FaCheckCircle, FaPhone } from "react-icons/fa";
import { FaBoltLightning } from "react-icons/fa6";
import { SlCallOut } from "react-icons/sl";
import { GiTrousers, GiDress } from "react-icons/gi";
import { MdLocalShipping } from "react-icons/md";
import { SiC } from "react-icons/si";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { LoginBanner } from "@/components/LoginBanner";

export default function QuotePage() {
  const [quoteMode, setQuoteMode] = useState<"instant" | "contact" | null>(null);
  const [instantStep, setInstantStep] = useState<"service" | "details" | "contact" | "review">("service");
  const [userId, setUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    pincode: "",
    serviceType: "",
    pickupDate: "",
    pickupTime: "",
    weight: 0,
    selectiveWash: false,
    items: {
      shirts: 0,
      trousers: 0,
      tshirts: 0,
      jeans: 0,
      sarees: 0,
      kurtas: 0,
      bedsheets: 0,
      towels: 0,
    },
    specialInstructions: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [estimatedCost, setEstimatedCost] = useState(0);
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
  const [loadingPricing, setLoadingPricing] = useState(true);

  const serviceTypes = [
    { 
      value: "wash-fold", 
      label: "Wash & Fold", 
      description: "Professional washing with soft water and premium detergents",
      pricePerKg: 40,
      inputType: "weight" // Takes weight in kg
    },
    { 
      value: "dry-clean", 
      label: "Dry Cleaning", 
      description: "Eco-friendly solvent cleaning for delicate garments",
      pricePerPiece: 150,
      inputType: "items" // Select individual items
    },
    { 
      value: "steam-iron", 
      label: "Steam Ironing", 
      description: "Professional steam ironing with perfect creases",
      pricePerPiece: 25,
      inputType: "items"
    },
    { 
      value: "premium", 
      label: "Premium Laundry", 
      description: "Complete premium care for all garment types",
      pricePerPiece: 200,
      inputType: "items"
    },
  ];

  const getServiceConfig = (serviceValue: string) => {
    return serviceTypes.find((s) => s.value === serviceValue);
  };

  // Fetch pricing from backend
  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const response = await fetch("/api/pricing");
        if (response.ok) {
          const data = await response.json();
          setPricing(data);
        }
      } catch (error) {
        console.error("Error fetching pricing:", error);
      } finally {
        setLoadingPricing(false);
      }
    };
    
    fetchPricing();
  }, []);

  // Check authentication and auto-fill user data
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        
        // Fetch user profile from Firestore
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setFormData((prev) => ({
              ...prev,
              name: userData.name || prev.name,
              email: userData.email || prev.email,
              phone: userData.phone || prev.phone,
            }));
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        setUserId(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleItemChange = (item: string, value: number) => {
    setFormData((prev) => ({
      ...prev,
      items: {
        ...prev.items,
        [item]: Math.max(0, value),
      },
    }));
  };

  const calculateEstimate = (): number => {
    let total = 0;
    const selectedService = getServiceConfig(formData.serviceType);
    
    if (!selectedService) return 0;

    if (selectedService.inputType === "weight") {
      // For wash & fold - use weight
      total = formData.weight * (selectedService.pricePerKg || 0);
    } else {
      // For piece-based services
      Object.entries(formData.items).forEach(([item, quantity]) => {
        if (quantity > 0) {
          total += (selectedService.pricePerPiece || 0) * quantity;
        }
      });
    }
    
    // Add pickup charge if order is less than threshold
    if (total > 0 && total < pricing.freePickupThreshold) {
      total += pricing.pickupCharge;
    }
    
    setEstimatedCost(total);
    return total;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    calculateEstimate();
    setSubmitted(true);
    
    // Here you would typically send the data to your backend
    console.log("Quote request:", formData);
  };

  const totalItems = Object.values(formData.items).reduce((a, b) => a + b, 0);

  // Mode selection screen
  if (!quoteMode) {
    return (
      <div className={styles.page}>
        <main className={styles.container}>
          <section className={styles.hero}>
            <h1>Get Your Quote</h1>
            <p>Choose how you'd like to proceed with your laundry service</p>
          </section>

          {/* Login Banner for non-logged-in users */}
          {!userId && <LoginBanner variant="quote" />}

          <div className={styles.modeGrid}>
            {/* Instant Quote Option */}
            <div 
              onClick={() => setQuoteMode("instant")}
              className={`${styles.modeCard} ${styles.modeCardInstant}`}
            >
              <div className={styles.modeIcon}><FaBoltLightning /></div>
              <h2>Instant Quote</h2>
              <p>
                Get an immediate price estimate by selecting your items and quantities. Quick and convenient!
              </p>
              <div className={`${styles.modeBadge} ${styles.modeBadgeInstant}`}>
                Get Price in Seconds
              </div>
            </div>

            {/* Contact for Quote Option */}
            <div 
              onClick={() => setQuoteMode("contact")}
              className={`${styles.modeCard} ${styles.modeCardContact}`}
            >
              <div className={styles.modeIcon}><SlCallOut /></div>
              <h2>Contact for Quote</h2>
              <p>
                Prefer to discuss your requirements? Our team will call you to provide a personalized quote.
              </p>
              <div className={`${styles.modeBadge} ${styles.modeBadgeContact}`}>
                Personalized Service
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Contact mode - simple contact form
  if (quoteMode === "contact" && !submitted) {
    return (
      <div className={styles.page}>
        <main className={styles.container}>
          <button 
            onClick={() => setQuoteMode(null)}
            style={{
              background: '#f0f0f0',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              marginBottom: '20px',
              fontSize: '14px'
            }}
          >
            ← Back to Options
          </button>
          
          <section className={styles.hero}>
            <h1>Request a Call Back</h1>
            <p>Fill in your details and we'll call you to discuss your laundry needs</p>
          </section>

          <form 
            onSubmit={async (e) => {
              e.preventDefault();
              
              // Save contact message to database
              try {
                const response = await fetch("/api/messages", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    message: formData.specialInstructions,
                  }),
                });

                if (response.ok) {
                  setSubmitted(true);
                  console.log("Contact request saved successfully");
                } else {
                  alert("Failed to save request. Please try again.");
                }
              } catch (error) {
                console.error("Error saving contact request:", error);
                alert("Error saving request. Please try again.");
              }
            }} 
            className={styles.form}
          >
            <section className={styles.formSection}>
              <h2>Your Details</h2>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label htmlFor="name">Full Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your name"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="phone">Phone Number *</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    placeholder="+91 98765 43210"
                    pattern="[0-9+ -]{10,15}"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your@email.com"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="pincode">Pincode *</label>
                  <input
                    type="text"
                    id="pincode"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    required
                    placeholder="560034"
                    pattern="[0-9]{6}"
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="specialInstructions">Brief Description of Your Requirements</label>
                <textarea
                  id="specialInstructions"
                  name="specialInstructions"
                  value={formData.specialInstructions}
                  onChange={handleInputChange}
                  placeholder="Tell us about your laundry needs..."
                  rows={4}
                />
              </div>
            </section>

            <button type="submit" className={styles.submitBtn}>
              <SlCallOut /> Request Call Back
            </button>
          </form>
        </main>
      </div>
    );
  }

  // Contact mode success screen
  if (quoteMode === "contact" && submitted) {
    return (
      <div className={styles.page}>
        <main className={styles.container}>
          <div className={styles.successCard}>
            <FaPhone className={styles.successIcon} style={{ fontSize: '80px', color: '#1e8ba5' }} />
            <h1>Request Received!</h1>
            <p className={styles.successMessage}>
              Thank you, {formData.name}! We've received your request for a call back.
            </p>
            
            <div className={styles.quoteDetails}>
              <h2>What Happens Next?</h2>
              
              <div className={styles.nextSteps}>
                <ul>
                  <li>Our team will review your request</li>
                  <li>We'll call you at {formData.phone} within 2 hours</li>
                  <li>Discuss your specific laundry requirements</li>
                  <li>Provide a detailed personalized quote</li>
                  <li>Schedule a convenient pickup time</li>
                </ul>
              </div>
            </div>
            
            <button
              onClick={() => {
                setSubmitted(false);
                setQuoteMode(null);
                setFormData({
                  name: "",
                  phone: "",
                  email: "",
                  address: "",
                  pincode: "",
                  serviceType: "wash-fold",
                  pickupDate: "",
                  pickupTime: "",
                  weight: 0,
                  selectiveWash: false,
                  items: {
                    shirts: 0,
                    trousers: 0,
                    tshirts: 0,
                    jeans: 0,
                    sarees: 0,
                    kurtas: 0,
                    bedsheets: 0,
                    towels: 0,
                  },
                  specialInstructions: "",
                });
              }}
              className={styles.newQuoteBtn}
            >
              Make Another Request
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Instant quote success screen
  if (quoteMode === "instant" && submitted) {
    const selectedService = getServiceConfig(formData.serviceType);
    let costBeforePickup = estimatedCost;
    let pickupCharge = 0;
    
    // Calculate pickup charge if applicable
    if (estimatedCost > 0 && estimatedCost < pricing.freePickupThreshold) {
      costBeforePickup = estimatedCost - pricing.pickupCharge;
      pickupCharge = pricing.pickupCharge;
    }
    
    const isPricePerPiece = selectedService?.inputType === "items";
    const pricePerUnit = isPricePerPiece ? selectedService?.pricePerPiece : selectedService?.pricePerKg;
    
    return (
      <div className={styles.page}>
        <main className={styles.container}>
          <div className={styles.successCard}>
            <FaCheckCircle className={styles.successIcon} />
            <h1>Your Quote is Ready!</h1>
            <p className={styles.successMessage}>
              Thank you, {formData.name}! Here's your instant quote.
            </p>
            
            <div className={styles.quoteDetails}>
              <h2>Quote Summary</h2>
              
              <div className={styles.detailRow}>
                <span>Service:</span>
                <strong>{selectedService?.label}</strong>
              </div>
              
              <div className={styles.detailRow}>
                <span>{isPricePerPiece ? 'Quantity' : 'Weight'}:</span>
                <strong>{isPricePerPiece ? `${totalItems} pieces` : `${formData.weight} kg`}</strong>
              </div>

              {formData.selectiveWash && (
                <div className={styles.detailRow}>
                  <span>Selective Wash:</span>
                  <strong>Yes (Colors Separated)</strong>
                </div>
              )}
              
              <div className={styles.detailRow}>
                <span>Price per {isPricePerPiece ? 'piece' : 'kg'}:</span>
                <strong>₹{pricePerUnit}</strong>
              </div>
              
              {/* Item Breakdown for Piece-Based Services */}
              {isPricePerPiece && totalItems > 0 && (
                <>
                  <div style={{ marginTop: '16px', marginBottom: '16px', paddingTop: '16px', borderTop: '2px solid var(--dr-dhobi-light-gray)' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--dr-dhobi-navy)', marginBottom: '12px' }}>
                      Item Breakdown
                    </h3>
                    {Object.entries(formData.items).map(([item, quantity]) => {
                      if (quantity === 0) return null;
                      const itemTotal = (pricePerUnit || 0) * quantity;
                      return (
                        <div key={item} className={styles.detailRow} style={{ paddingTop: '8px', paddingBottom: '8px', borderBottom: '1px solid var(--dr-dhobi-light-gray)' }}>
                          <span>
                            {item.charAt(0).toUpperCase() + item.slice(1)} × {quantity}
                          </span>
                          <strong>₹{itemTotal}</strong>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
              
              <div className={styles.detailRow}>
                <span>Subtotal:</span>
                <strong>₹{costBeforePickup}</strong>
              </div>
              
              {pickupCharge > 0 && (
                <div className={styles.detailRow}>
                  <span>Pickup Charge:</span>
                  <strong>₹{pickupCharge}</strong>
                </div>
              )}
              
              <div className={styles.detailRow} style={{ paddingTop: '16px', borderTop: '2px solid var(--dr-dhobi-navy)' }}>
                <span style={{ fontSize: '18px', fontWeight: '700' }}>Total Estimated Cost:</span>
                <strong className={styles.price} style={{ fontSize: '20px' }}>₹{estimatedCost}</strong>
              </div>
              
              {pickupCharge > 0 && (
                <p className={styles.note}>
                  *Includes ₹{pickupCharge} pickup charge (Free for orders above ₹{pricing.freePickupThreshold})
                </p>
              )}
              
              <div className={styles.nextSteps}>
                <h3>What's Next?</h3>
                <ul>
                  <li>Our team will call you at {formData.phone} within 2 hours to confirm</li>
                  <li>We'll arrive on {formData.pickupDate} between {formData.pickupTime}</li>
                  <li>Inspect your items for any special care requirements</li>
                  <li>Confirm final pricing and schedule delivery</li>
                </ul>
              </div>
            </div>
            
            <button
              onClick={() => {
                setSubmitted(false);
                setQuoteMode(null);
                setInstantStep("service");
                setFormData({
                  name: "",
                  phone: "",
                  email: "",
                  address: "",
                  pincode: "",
                  serviceType: "",
                  pickupDate: "",
                  pickupTime: "",
                  weight: 0,
                  selectiveWash: false,
                  items: {
                    shirts: 0,
                    trousers: 0,
                    tshirts: 0,
                    jeans: 0,
                    sarees: 0,
                    kurtas: 0,
                    bedsheets: 0,
                    towels: 0,
                  },
                  specialInstructions: "",
                });
                setEstimatedCost(0);
              }}
              className={styles.newQuoteBtn}
            >
              Get Another Quote
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <main className={styles.container}>
        <button 
          onClick={() => setQuoteMode(null)}
          style={{
            background: '#f0f0f0',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '8px',
            cursor: 'pointer',
            marginBottom: '20px',
            fontSize: '14px'
          }}
        >
          ← Back to Options
        </button>
        
        <section className={styles.hero}>
          <h1>Instant Quote - Step {instantStep === "service" ? "1" : instantStep === "details" ? "2" : "3"} of 3</h1>
          <p>Let's find the perfect service and price for your laundry needs</p>
        </section>

        {/* STEP 1: SERVICE SELECTION */}
        {instantStep === "service" && (
          <div className={styles.form}>
            <section className={styles.formSection}>
              <h2>Which Service Do You Need?</h2>
              <p className={styles.sectionNote}>Select the service that best fits your needs</p>
              
              <div style={{ display: 'grid', gap: '16px', marginTop: '24px' }}>
                {serviceTypes.map((service) => (
                  <div
                    key={service.value}
                    onClick={() => {
                      setFormData(prev => ({ ...prev, serviceType: service.value }));
                      setInstantStep("details");
                    }}
                    style={{
                      padding: '20px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      backgroundColor: '#fff'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#1e8ba5';
                      e.currentTarget.style.backgroundColor = '#f0f8fb';
                      e.currentTarget.style.transform = 'translateX(8px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#e5e7eb';
                      e.currentTarget.style.backgroundColor = '#fff';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}
                  >
                    <h3 style={{ margin: '0 0 8px 0', color: '#0d3b66', fontSize: '18px', fontWeight: '600' }}>
                      {service.label}
                    </h3>
                    <p style={{ margin: '0', color: '#6b7280', fontSize: '14px' }}>
                      {service.description}
                    </p>
                    <p style={{ margin: '12px 0 0 0', color: '#1e8ba5', fontSize: '14px', fontWeight: '600' }}>
                      {service.inputType === 'weight' 
                        ? `₹${service.pricePerKg}/kg` 
                        : `₹${service.pricePerPiece}/piece`}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* STEP 2: SERVICE-SPECIFIC DETAILS */}
        {instantStep === "details" && (
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              setInstantStep("contact");
            }}
            className={styles.form}
          >
            <section className={styles.formSection}>
              <h2>Tell Us About Your Laundry</h2>
              <p className={styles.sectionNote}>Provide details specific to {getServiceConfig(formData.serviceType)?.label}</p>

              {/* Weight Input for Wash & Fold */}
              {getServiceConfig(formData.serviceType)?.inputType === "weight" && (
                <>
                  <div className={styles.formGroup}>
                    <label htmlFor="weight">Total Weight (kg) *</label>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '12px' }}>
                      <input
                        type="number"
                        id="weight"
                        value={formData.weight}
                        onChange={(e) => setFormData(prev => ({ ...prev, weight: parseFloat(e.target.value) || 0 }))}
                        required
                        min="0"
                        step="0.5"
                        placeholder="e.g., 25"
                        style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '16px' }}
                      />
                      <span style={{ fontSize: '14px', color: '#6b7280' }}>kg</span>
                    </div>
                    {formData.weight > 0 && (
                      <p style={{ marginTop: '12px', color: '#1e8ba5', fontSize: '14px', fontWeight: '600' }}>
                        Estimated: ₹{formData.weight * (getServiceConfig(formData.serviceType)?.pricePerKg || 0)}
                      </p>
                    )}
                  </div>

                  <div className={styles.formGroup}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={formData.selectiveWash}
                        onChange={(e) => setFormData(prev => ({ ...prev, selectiveWash: e.target.checked }))}
                        style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                      />
                      <span>Selective Wash (Separate colors)</span>
                    </label>
                    <p style={{ margin: '8px 0 0 0', color: '#6b7280', fontSize: '13px' }}>
                      Keep colors separate from whites
                    </p>
                  </div>
                </>
              )}

              {/* Item Selection for Piece-Based Services */}
              {getServiceConfig(formData.serviceType)?.inputType === "items" && (
                <>
                  <p className={styles.sectionNote} style={{ marginBottom: '20px' }}>
                    Select the items you want cleaned
                  </p>
                  {loadingPricing ? (
                    <div style={{ textAlign: 'center', padding: '20px' }}>Loading...</div>
                  ) : (
                    <div className={styles.itemsGrid}>
                      {Object.keys(formData.items).map((item) => (
                        <div key={item} className={styles.itemCounter}>
                          <label>{item.charAt(0).toUpperCase() + item.slice(1)}</label>
                          <div className={styles.counter}>
                            <button
                              type="button"
                              onClick={() =>
                                handleItemChange(item, formData.items[item as keyof typeof formData.items] - 1)
                              }
                              className={styles.counterBtn}
                            >
                              −
                            </button>
                            <span className={styles.count}>
                              {formData.items[item as keyof typeof formData.items]}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                handleItemChange(item, formData.items[item as keyof typeof formData.items] + 1)
                              }
                              className={styles.counterBtn}
                            >
                              +
                            </button>
                          </div>
                          <span className={styles.itemPrice}>₹{getServiceConfig(formData.serviceType)?.pricePerPiece}/pc</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {totalItems > 0 && (
                    <p style={{ marginTop: '20px', color: '#1e8ba5', fontSize: '14px', fontWeight: '600' }}>
                      Estimated: ₹{totalItems * (getServiceConfig(formData.serviceType)?.pricePerPiece || 0)}
                    </p>
                  )}
                </>
              )}

              <div className={styles.formGroup}>
                <label htmlFor="specialInstructions">Special Instructions (Optional)</label>
                <textarea
                  id="specialInstructions"
                  value={formData.specialInstructions}
                  onChange={(e) => setFormData(prev => ({ ...prev, specialInstructions: e.target.value }))}
                  placeholder="Any specific care instructions or notes?"
                  rows={3}
                />
              </div>
            </section>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'space-between' }}>
              <button
                type="button"
                onClick={() => setInstantStep("service")}
                className={styles.submitBtn}
                style={{ background: '#6b7280', flex: 1 }}
              >
                ← Back
              </button>
              <button
                type="submit"
                className={styles.submitBtn}
                disabled={getServiceConfig(formData.serviceType)?.inputType === "weight" ? formData.weight === 0 : totalItems === 0}
                style={{ flex: 1 }}
              >
                Continue →
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: CONTACT INFORMATION */}
        {instantStep === "contact" && !submitted && (
          <form 
            onSubmit={async (e) => {
              e.preventDefault();
              const finalCost = calculateEstimate();
              
              // Save quote request to database
              try {
                const quoteData = {
                  ...formData,
                  estimatedCost: finalCost,
                  ...(userId && { userId }), // Add userId if user is logged in
                };

                const response = await fetch("/api/quotes", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(quoteData),
                });

                if (response.ok) {
                  setSubmitted(true);
                  console.log("Quote request saved successfully");
                } else {
                  alert("Failed to save quote request. Please try again.");
                }
              } catch (error) {
                console.error("Error saving quote request:", error);
                alert("Error saving quote request. Please try again.");
              }
            }}
            className={styles.form}
          >
            <section className={styles.formSection}>
              <h2>Your Contact Details</h2>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label htmlFor="name">Full Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your name"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="phone">Phone Number *</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    placeholder="+91 98765 43210"
                    pattern="[0-9+ -]{10,15}"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your@email.com"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="pincode">Pincode *</label>
                  <input
                    type="text"
                    id="pincode"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    required
                    placeholder="560034"
                    pattern="[0-9]{6}"
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="address">Pickup Address *</label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your complete address"
                  rows={3}
                />
              </div>

              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label htmlFor="pickupDate">Preferred Pickup Date *</label>
                  <input
                    type="date"
                    id="pickupDate"
                    name="pickupDate"
                    value={formData.pickupDate}
                    onChange={handleInputChange}
                    required
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="pickupTime">Preferred Pickup Time *</label>
                  <select
                    id="pickupTime"
                    name="pickupTime"
                    value={formData.pickupTime}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select time slot</option>
                    <option value="7-9am">7:00 AM - 9:00 AM</option>
                    <option value="9-12pm">9:00 AM - 12:00 PM</option>
                    <option value="12-3pm">12:00 PM - 3:00 PM</option>
                    <option value="3-6pm">3:00 PM - 6:00 PM</option>
                    <option value="6-9pm">6:00 PM - 9:00 PM</option>
                  </select>
                </div>
              </div>
            </section>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'space-between' }}>
              <button
                type="button"
                onClick={() => setInstantStep("details")}
                className={styles.submitBtn}
                style={{ background: '#6b7280', flex: 1 }}
              >
                ← Back
              </button>
              <button
                type="submit"
                className={styles.submitBtn}
                style={{ flex: 1 }}
              >
                Get My Instant Quote
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
