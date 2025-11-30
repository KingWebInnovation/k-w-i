"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./hero.module.css";
import heroImg from "../../../public/kwi-hero.jpg";
import heroImg1 from "../../../public/kwi-hero1.jpg";
import heroImg2 from "../../../public/kwi-hero2.jpg";
import heroImg3 from "../../../public/kwi-hero3.jpg";
import { CreditCard, Wallet, ArrowRight, Users, Star, Zap } from "lucide-react";

const images = [heroImg, heroImg1, heroImg2, heroImg3];

export default function Hero() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [stats, setStats] = useState({
    projects: 0,
    reviews: 0,
    turnaround: 0,
  });
  const [offsetY, setOffsetY] = useState(0);

  // Slideshow rotation
  useEffect(() => {
    const interval = setInterval(
      () => setCurrentIndex((prev) => (prev + 1) % images.length),
      10000
    );
    return () => clearInterval(interval);
  }, []);

  // Count-up stats animation
  useEffect(() => {
    let proj = 0,
      rev = 0,
      turn = 0;
    const timer = setInterval(() => {
      if (proj < 200) proj += 5;
      if (rev < 5) rev += 0.1;
      if (turn < 7) turn += 0.1;
      setStats({
        projects: proj > 200 ? 200 : proj,
        reviews: rev > 5 ? 5 : +rev.toFixed(1),
        turnaround: turn > 7 ? 7 : +turn.toFixed(1),
      });
      if (proj >= 200 && rev >= 5 && turn >= 7) clearInterval(timer);
    }, 50);
    return () => clearInterval(timer);
  }, []);

  // Scroll parallax effect
  useEffect(() => {
    const handleScroll = () => setOffsetY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className={styles.hero}>
      <div className={styles.container}>
        <div className={styles.heroContent}>
          {/* Left Text Block */}
          <div className={styles.textBlock}>
            <h1>
              Build a <span>Powerful Online Presence</span> With King Web
              Innovation
            </h1>
            <p>
              Professional websites designed to elevate your brand, attract
              customers, and grow your business.
            </p>

            {/* CTA Buttons */}
            <div className={styles.ctaWrapper}>
              <Link href="/#pricing" className={styles.ctaBtn}>
                Get Your Website <ArrowRight />
              </Link>
              <Link href="/#contact" className={styles.ctaBtnSecondary}>
                Schedule a Free Consultation
              </Link>
            </div>

            {/* Payments Section */}
            <div className={styles.paymentsWrapper}>
              <small>Accepted Payments:</small>
              <ul className={styles.payments}>
                <li>
                  <CreditCard className={styles.paymentIcon} /> Visa
                </li>
                <li>
                  <CreditCard className={styles.paymentIcon} /> Mastercard
                </li>
                <li>
                  <Wallet className={styles.paymentIcon} /> PayPal
                </li>
              </ul>
            </div>
          </div>

          {/* Right Image / Slideshow Block */}
          <div className={styles.imageBlock}>
            <div className={styles.slideshowWrapper}>
              {images.map((img, index) => (
                <div
                  key={index}
                  className={`${styles.slide} ${
                    index === currentIndex ? styles.activeSlide : ""
                  }`}
                >
                  <Image
                    src={img}
                    alt="Slideshow image"
                    className={styles.heroImg}
                    priority={index === 0}
                    style={{ transform: `translateY(${offsetY * 0.08}px)` }}
                    fill
                  />
                </div>
              ))}

              {/* Floating shapes */}
              <div className={styles.floatingShapes}>
                <div className={styles.shape}></div>
                <div className={styles.shape}></div>
                <div className={styles.shape}></div>
              </div>
            </div>

            {/* Verified Badge */}
            <div className={styles.verifiedBadge}>Trusted Web Agency</div>

            {/* Stats Overlay */}
            <div className={styles.statsOverlay}>
              <div className={styles.statsItem}>
                <Users className={styles.statsIcon} />
                <span>{stats.projects}+ Projects Delivered</span>
              </div>
              <div className={styles.statsItem}>
                <Star className={styles.statsIcon} />
                <span>{stats.reviews}★ Client Reviews</span>
              </div>
              <div className={styles.statsItem}>
                <Zap className={styles.statsIcon} />
                <span>{stats.turnaround} Day Turnaround</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
