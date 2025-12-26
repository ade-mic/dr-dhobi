"use client";

import Link from "next/link";
import styles from "./LoginBanner.module.css";
import { FaUserPlus, FaSignInAlt, FaGift, FaHistory, FaBell } from "react-icons/fa";

interface LoginBannerProps {
  variant?: "quote" | "booking" | "default";
}

export function LoginBanner({ variant = "default" }: LoginBannerProps) {
  const benefits = [
    { icon: <FaHistory />, text: "Track your orders" },
    { icon: <FaBell />, text: "Get notifications" },
    { icon: <FaGift />, text: "Exclusive offers" },
  ];

  const getMessage = () => {
    switch (variant) {
      case "quote":
        return "Sign in to save your quote and track responses";
      case "booking":
        return "Sign in to track your booking and get updates";
      default:
        return "Sign in for a better experience";
    }
  };

  return (
    <div className={styles.banner}>
      <div className={styles.content}>
        <div className={styles.left}>
          <span className={styles.badge}>✨ Better Experience</span>
          <p className={styles.message}>{getMessage()}</p>
          <div className={styles.benefits}>
            {benefits.map((benefit, index) => (
              <span key={index} className={styles.benefit}>
                {benefit.icon} {benefit.text}
              </span>
            ))}
          </div>
        </div>
        <div className={styles.actions}>
          <Link href="/login" className={styles.signInBtn}>
            <FaSignInAlt /> Sign In
          </Link>
          <Link href="/login?mode=signup" className={styles.registerBtn}>
            <FaUserPlus /> Register
          </Link>
        </div>
      </div>
    </div>
  );
}
