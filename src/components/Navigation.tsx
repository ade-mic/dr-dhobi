"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "./AuthProvider";
import { useSettings } from "./SettingsProvider";
import styles from "./Navigation.module.css";
import { BsFillTelephoneFill } from "react-icons/bs";
import Image from "next/image";

export function Navigation() {
  const pathname = usePathname();
  const { user, loading, isAdmin } = useAuth();
  const { settings } = useSettings();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Base navigation items
  const baseNavItems = [
    { href: "/", label: "Home" },
    { href: "/services", label: "Services" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  // Add user/login link based on auth state
  const navItems = [...baseNavItems];
  if (!loading) {
    if (user) {
      if (isAdmin) {
        navItems.push({ href: "/admin", label: "Manage" });
      } else {
        navItems.push({ href: "/user/dashboard", label: "My Laundry" });
      }
    } else {
      navItems.push({ href: "/login", label: "Sign In" });
    }
  }

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
            href={`tel:${settings.phone}`}
            className={styles.phone}
            onClick={() => setMobileMenuOpen(false)}
          >
            <BsFillTelephoneFill /> {settings.phoneDisplay}
          </a>
        </div>

        <Link href="/quote" className={styles.ctaButton}>
          Get Quote
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
