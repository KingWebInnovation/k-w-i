"use client";

import Link from "next/link";
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* Brand */}
        <div className={styles.brand}>
          <div className={styles.logo}>
            <div className={styles.icon}>KW</div>
            <h3>King Web Innovation</h3>
          </div>
          <div>
            <p>
              Helping U.S. businesses thrive online with professional websites,
              e-commerce solutions, and ongoing digital support. Your success is
              our mission.
            </p>
          </div>

          <div className={styles.socials}>
            <Link
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Facebook size={18} />
            </Link>
            <Link
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Twitter size={18} />
            </Link>
            <Link
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Instagram size={18} />
            </Link>
            <Link
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Linkedin size={18} />
            </Link>
          </div>
        </div>

        {/* Services */}
        <div className={styles.column}>
          <h4>Services</h4>
          <ul>
            <li>
              <Link href="#">Website Design</Link>
            </li>
            <li>
              <Link href="#">E-commerce Development</Link>
            </li>
            <li>
              <Link href="#">Website Maintenance</Link>
            </li>
            <li>
              <Link href="#">SEO & Marketing</Link>
            </li>
            <li>
              <Link href="#">Digital Marketing</Link>
            </li>
            <li>
              <Link href="#">Domain & Hosting</Link>
            </li>
          </ul>
        </div>

        {/* Quick Links */}
        <div className={styles.column}>
          <h4>Quick Links</h4>
          <ul>
            <li>
              <Link href="#">Our Services</Link>
            </li>
            <li>
              <Link href="#">Pricing Plans</Link>
            </li>
            <li>
              <Link href="#">Success Stories</Link>
            </li>
            <li>
              <Link href="#">Contact Us</Link>
            </li>
            <li>
              <Link href="#">Blog</Link>
            </li>
            <li>
              <Link href="#">Privacy Policy</Link>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div className={styles.column}>
          <h4>Get In Touch</h4>
          <p>
            <MapPin size={18} /> Long Island, NY, United States
          </p>
          <p>
            <Phone size={18} /> +1 941 448 0584
          </p>
          <p>
            <Mail size={18} /> kingwebinnovation@gmail.com
          </p>
          <Link href="/#contact" className={styles.cta}>
            Let&apos;s Build Your Website →
          </Link>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className={styles.bottomBar}>
        <p>
          © 2025 King Web Innovation. All rights reserved. Building U.S.
          businesses&apos; digital future, one website at a time.
        </p>
      </div>
    </footer>
  );
}
