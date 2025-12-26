'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./page.module.css";
import { RiShirtLine } from "react-icons/ri";
import { FaShirt } from "react-icons/fa6";
import { FaShippingFast } from "react-icons/fa";
import { GiShoppingCart } from "react-icons/gi";
import { MdOutlineWorkspacePremium, MdLocalLaundryService, MdIron, MdDryCleaning } from "react-icons/md";
import { IoIosPricetag } from "react-icons/io";
import { Clock, Loader2 } from "lucide-react";
import { ReactNode } from "react";
import { useSettings } from "@/components/SettingsProvider";

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
};

// Icon mapping - maps icon string identifiers to React components
const iconMap: Record<string, ReactNode> = {
  "dry-cleaning": <RiShirtLine />,
  "wash-fold": <FaShirt />,
  "express": <FaShippingFast />,
  "ironing": <MdOutlineWorkspacePremium />,
  "laundry": <MdLocalLaundryService />,
  "iron": <MdIron />,
  "clean": <MdDryCleaning />,
  "default": <MdLocalLaundryService />,
};

const getIcon = (iconId: string): ReactNode => {
  return iconMap[iconId] || iconMap["default"];
};

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
  const { settings } = useSettings();
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch services from the database
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch("/api/services");
        if (response.ok) {
          const data: ServiceItem[] = await response.json();
          // Only show active services, sorted by order
          const activeServices = data
            .filter((s) => s.isActive)
            .sort((a, b) => a.order - b.order);
          setServices(activeServices);
        }
      } catch (error) {
        console.error("Error fetching services:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

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
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <h1>Our Services</h1>
            <p>
              Premium laundry and dry cleaning services tailored for Bangalore&apos;s
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

        {loading ? (
          <div className={styles.loadingState}>
            <Loader2 className={styles.spinner} />
            <p>Loading services...</p>
          </div>
        ) : services.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No services available at the moment.</p>
          </div>
        ) : (
          <div className={styles.servicesGrid}>
            {services.map((service) => {
              const isExpanded = expandedCards.has(service.id);
              return (
              <section key={service.id} id={service.id} className={styles.serviceCard}>
                <div className={styles.cardTop}>
                  <div className={styles.serviceHeader}>
                    <div className={styles.serviceIcon}>{getIcon(service.icon)}</div>
                    <div className={styles.serviceTitleGroup}>
                      <h2>{service.name}</h2>
                      <span className={styles.turnaround}><Clock /> {service.turnaround}</span>
                    </div>
                  </div>

                  <p className={styles.serviceDesc}>{service.description}</p>
                </div>

                <div className={`${styles.cardContent} ${isExpanded ? styles.expanded : ''}`}>
                  <div className={styles.features}>
                    <h3><GiShoppingCart /> What&apos;s Included</h3>
                    <ul>
                      {service.features.slice(0, isExpanded ? undefined : 3).map((feature, index) => (
                        <li key={index}>
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
                          <span className={styles.price}>
                            {service.icon === "express" ? `+₹${item.price}` : `₹${item.price}`}
                          </span>
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
        )}

        <section className={styles.areas} id="service-areas">
          <h2>We Serve 18+ Areas in Bangalore</h2>
          <div className={styles.areaGrid}>
            {areas.map((area) => (
              <div key={area} className={styles.areaChip}>
                📍 {area}
              </div>
            ))}
          </div>
          <p className={styles.areaNote}>
            Don&apos;t see your area? <a href={`tel:${settings.phone}`}>Call us</a> - we&apos;re
            expanding daily!
          </p>
        </section>

        <section className={styles.ctaBanner}>
          <h2>Ready to Experience Premium Laundry?</h2>
          <p>
            Book your first pickup and get 20% off. We&apos;ll handle the rest with care
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
