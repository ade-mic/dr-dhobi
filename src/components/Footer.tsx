"use client";

import Link from "next/link";
import styles from "./Footer.module.css";
import { BsFillTelephoneFill, BsTwitterX, BsWhatsapp } from "react-icons/bs";
import { TiSocialFacebook, TiSocialInstagram } from "react-icons/ti";
import { FaLocationPin, FaRegClock } from "react-icons/fa6";
import { MdEmail } from "react-icons/md";
import { useSettings } from "./SettingsProvider";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { settings } = useSettings();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.grid}>
          <div className={styles.brand}>
            <div className={styles.logo}>
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <rect width="48" height="48" rx="10" fill="currentColor" />
                <text
                  x="24"
                  y="32"
                  fontFamily="Arial, sans-serif"
                  fontSize="20"
                  fontWeight="bold"
                  fill="white"
                  textAnchor="middle"
                >
                  DD
                </text>
              </svg>
              <span>{settings.businessName}</span>
            </div>
            <p>
              {settings.city}&apos;s trusted doorstep laundry service. Premium
              care for your fabrics, delivered with precision.
            </p>
            <div className={styles.social}>
              <a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer" aria-label="Facebook"><TiSocialFacebook /></a>
              <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram"><TiSocialInstagram /></a>
              <a href={settings.twitterUrl} target="_blank" rel="noopener noreferrer" aria-label="Twitter"><BsTwitterX /></a>
              <a href={settings.whatsappUrl} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"><BsWhatsapp /></a>
            </div>
          </div>

          <div>
            <h4>Services</h4>
            <ul>
              <li><Link href="/services#dry-cleaning">Dry Cleaning</Link></li>
              <li><Link href="/services#wash-fold">Wash & Fold</Link></li>
              <li><Link href="/services#express">Express Pickup</Link></li>
              <li><Link href="/services#ironing">Premium Ironing</Link></li>
            </ul>
          </div>

          <div>
            <h4>Company</h4>
            <ul>
              <li><Link href="/about">About Us</Link></li>
              <li><Link href="/quote">Quote Request</Link></li>
              <li><Link href="/services#service-areas">Service Areas</Link></li>
            </ul>
          </div>

          <div>
            <h4>Contact</h4>
            <ul>
              <li><BsFillTelephoneFill /> <a href={`tel:${settings.phone}`}>{settings.phoneDisplay}</a></li>
              <li><MdEmail /> <a href={`mailto:${settings.email}`}>{settings.email}</a></li>
              <li><FaLocationPin /> {settings.address}, {settings.city}</li>
              <li><FaRegClock /> {settings.operatingDays}: {settings.weekdayHours}</li>
            </ul>
          </div>
        </div>

        <div className={styles.bottom}>
          <p>&copy; {currentYear} {settings.businessName}. All rights reserved.</p>
          <div className={styles.legal}>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Service</Link>
            <Link href="/refund">Refund Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
