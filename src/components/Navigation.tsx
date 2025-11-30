"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import styles from "./Navigation.module.css";
import { BsFillTelephoneFill } from "react-icons/bs";
import Image from "next/image";

export function Navigation() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/services", label: "Services" },
    { href: "/booking", label: "Book Now" },
    { href: "/admin", label: "Admin" },
  ];

  return (
    <nav className={`${styles.nav} ${scrolled ? styles.scrolled : ""}`}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          <Image 
            src="/icons/icon-192.svg"
            alt="Dr Dhobi Logo"
            width={30}
            height={30}
            className={styles.logoImage}
          />
          <span className={styles.logoText}>Dr Dhobi</span>
        </Link>

        <div className={`${styles.links} ${mobileMenuOpen ? styles.open : ""}`}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={pathname === item.href ? styles.active : ""}
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <a
            href="tel:+918080808080"
            className={styles.phone}
            onClick={() => setMobileMenuOpen(false)}
          >
            <BsFillTelephoneFill /> 080-8080-8080
          </a>
        </div>

        <Link href="/booking" className={styles.ctaButton}>
          Quick Booking
        </Link>

        <button
          className={styles.hamburger}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>
  );
}
