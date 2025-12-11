"use client";

import Link from "next/link";
import styles from "./Footer.module.css";
import { BsFillTelephoneFill, BsTwitterX, BsWhatsapp } from "react-icons/bs";
import { TiSocialFacebook, TiSocialInstagram } from "react-icons/ti";
import { FaLocationPin, FaRegClock } from "react-icons/fa6";

import { MdEmail } from "react-icons/md";

export function Footer() {
  const currentYear = new Date().getFullYear();

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
              <span>Dr Dhobi</span>
            </div>
            <p>
              Bangalore&apos;s trusted doorstep laundry service since 2014. Premium
              care for your fabrics, delivered with precision.
            </p>
            <div className={styles.social}>
              <a href="#" aria-label="Facebook"><TiSocialFacebook /></a>
              <a href="#" aria-label="Instagram"><TiSocialInstagram /></a>
              <a href="#" aria-label="Twitter"><BsTwitterX /></a>
              <a href="#" aria-label="WhatsApp"><BsWhatsapp /></a>
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
              <li><Link href="/pricing">Pricing</Link></li>
              <li><Link href="/areas">Service Areas</Link></li>
              <li><Link href="/careers">Careers</Link></li>
            </ul>
          </div>

          <div>
            <h4>Contact</h4>
            <ul>
              <li><BsFillTelephoneFill /> <a href="tel:+918080808080">080-8080-8080</a></li>
              <li><MdEmail /> <a href="mailto:hello@drdhobi.in">hello@drdhobi.in</a></li>
              <li><FaLocationPin /> Koramangala, Bangalore</li>
              <li><FaRegClock /> 7 AM - 9 PM, Daily</li>
            </ul>
          </div>
        </div>

        <div className={styles.bottom}>
          <p>&copy; {currentYear} Dr Dhobi. All rights reserved.</p>
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
