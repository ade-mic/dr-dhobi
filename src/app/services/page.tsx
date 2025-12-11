'use client';

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./page.module.css";
import { RiShirtLine } from "react-icons/ri";
import { FaShirt } from "react-icons/fa6";
import { FaShippingFast } from "react-icons/fa";
import { GiShoppingCart } from "react-icons/gi";
import { MdOutlineWorkspacePremium } from "react-icons/md";
import { IoIosPricetag } from "react-icons/io";
import { Clock } from "lucide-react";


const services = [
  {
    id: "dry-cleaning",
    name: "Dry Cleaning",
    icon: <RiShirtLine />,
    description:
      "Our premium dry cleaning service uses eco-friendly solvents and expert techniques to restore your delicate garments to pristine condition.",
    features: [
      "Eco-friendly solvent cleaning",
      "Hand finishing by experts",
      "Stain pre-treatment included",
      "Quality inspection before delivery",
      "Suitable for silk, wool, and designer wear",
    ],
    pricing: [
      { item: "Shirt / Top", price: "₹50" },
      { item: "Trousers / Jeans", price: "₹60" },
      { item: "Suit (2-piece)", price: "₹250" },
      { item: "Dress / Saree", price: "₹100" },
      { item: "Jacket / Blazer", price: "₹150" },
    ],
    turnaround: "48 hours",
  },
  {
    id: "wash-fold",
    name: "Wash & Fold",
    icon: <FaShirt />,
    description:
      "Professional washing with soft water and premium detergents, followed by neat folding and packaging. Perfect for everyday wear.",
    features: [
      "Soft water washing technology",
      "Hypoallergenic detergents",
      "Separate wash for colors",
      "Neatly folded and packaged",
      "Weight-based pricing available",
    ],
    pricing: [
      { item: "T-Shirt / Top", price: "₹30" },
      { item: "Shirt (formal)", price: "₹40" },
      { item: "Trousers / Jeans", price: "₹40" },
      { item: "Bedsheet (single)", price: "₹60" },
      { item: "Per kg (mixed)", price: "₹80" },
    ],
    turnaround: "24 hours",
  },
  {
    id: "express",
    name: "Express Pickup",
    icon: <FaShippingFast />,
    description:
      "Need it done fast? Our express service guarantees 30-minute pickup and same-day delivery within Bangalore city limits.",
    features: [
      "30-minute pickup guarantee",
      "Same-day delivery available",
      "Live rider tracking",
      "Priority processing",
      "Available 7 AM - 9 PM daily",
    ],
    pricing: [
      { item: "Express surcharge", price: "+₹100" },
      { item: "Same-day delivery", price: "+₹150" },
    ],
    turnaround: "Same day",
  },
  {
    id: "ironing",
    name: "Premium Ironing",
    icon: <MdOutlineWorkspacePremium />,
    description:
      "Professional steam ironing with attention to every crease and collar. Your clothes will look brand new.",
    features: [
      "Professional steam ironing",
      "Collar and cuff attention",
      "Hanger delivery available",
      "Starch level customization",
      "Perfect for formal wear",
    ],
    pricing: [
      { item: "Shirt / Top", price: "₹20" },
      { item: "Trousers", price: "₹25" },
      { item: "Dress / Saree", price: "₹40" },
      { item: "Suit (2-piece)", price: "₹80" },
    ],
    turnaround: "24 hours",
  },
];

const areas = [
  "Koramangala",
  "Indiranagar",
  "HSR Layout",
  "Whitefield",
  "Marathahalli",
  "BTM Layout",
  "JP Nagar",
  "Electronic City",
  "Jayanagar",
  "Malleshwaram",
  "Banashankari",
  "Yelahanka",
];

export default function ServicesPage() {
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  const toggleCard = (serviceId: string) => {
    setExpandedCards((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(serviceId)) {
        newSet.delete(serviceId);
      } else {
        newSet.add(serviceId);
      }
      return newSet;
    });
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Quick Navigation
        <nav className={styles.quickNav}>
          {services.map((service) => (
            <a key={service.id} href={`#${service.id}`} className={styles.navLink}>
              <span className={styles.navIcon}>{service.icon}</span>
              <span className={styles.navLabel}>{service.name}</span>
            </a>
          ))}
        </nav> */}

        <header className={styles.header}>
          <div className={styles.headerContent}>
            <h1>Our Services</h1>
            <p>
              Premium laundry and dry cleaning services tailored for Bangalore's
              fast-paced lifestyle. Quality you can trust, delivered to your doorstep.
            </p>
          </div>
          <div className={styles.headerImage}>
            <Image
              src="/laundry2.jpg"
              alt="Laundry services"
              width={500}
              height={350}
              className={styles.servicesHeaderImg}
            />
          </div>
        </header>

        <div className={styles.servicesGrid}>
          {services.map((service) => {
            const isExpanded = expandedCards.has(service.id);
            return (
            <section key={service.id} id={service.id} className={styles.serviceCard}>
              <div className={styles.cardTop}>
                <div className={styles.serviceHeader}>
                  <div className={styles.serviceIcon}>{service.icon}</div>
                  <div className={styles.serviceTitleGroup}>
                    <h2>{service.name}</h2>
                    <span className={styles.turnaround}><Clock /> {service.turnaround}</span>
                  </div>
                </div>

                <p className={styles.serviceDesc}>{service.description}</p>
              </div>

              <div className={`${styles.cardContent} ${isExpanded ? styles.expanded : ''}`}>
                <div className={styles.features}>
                  <h3><GiShoppingCart /> What's Included</h3>
                  <ul>
                    {service.features.slice(0, isExpanded ? undefined : 3).map((feature, index) => (
                      <li key={feature}>
                        <span className={styles.checkmark}>✓</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className={styles.pricing}>
                  <h3><IoIosPricetag /> Pricing</h3>
                  <div className={styles.priceList}>
                    {service.pricing.slice(0, isExpanded ? undefined : 3).map((item) => (
                      <div key={item.item} className={styles.priceItem}>
                        <span className={styles.itemName}>{item.item}</span>
                        <span className={styles.priceDots}></span>
                        <span className={styles.price}>{item.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <button 
                className={styles.toggleButton}
                onClick={() => toggleCard(service.id)}
                aria-expanded={isExpanded}
              >
                {isExpanded ? (
                  <>
                    <span>Show Less</span>
                    <span className={styles.toggleIcon}>▲</span>
                  </>
                ) : (
                  <>
                    <span>Show More</span>
                    <span className={styles.toggleIcon}>▼</span>
                  </>
                )}
              </button>

              <div className={styles.cardFooter}>
                <Link href="/booking" className={styles.bookButton}>
                  <span>Book {service.name}</span>
                  <span className={styles.arrow}>→</span>
                </Link>
              </div>
            </section>
            );
          })}
        </div>

        <section className={styles.areas}>
          <h2>We Serve 18+ Areas in Bangalore</h2>
          <div className={styles.areaGrid}>
            {areas.map((area) => (
              <div key={area} className={styles.areaChip}>
                📍 {area}
              </div>
            ))}
          </div>
          <p className={styles.areaNote}>
            Don't see your area? <a href="tel:+918080808080">Call us</a> - we're
            expanding daily!
          </p>
        </section>

        <section className={styles.ctaBanner}>
          <h2>Ready to Experience Premium Laundry?</h2>
          <p>
            Book your first pickup and get 20% off. We'll handle the rest with care
            and precision.
          </p>
          <Link href="/booking" className={styles.ctaButton}>
            Book Your First Pickup
          </Link>
        </section>
      </div>
    </div>
  );
}
