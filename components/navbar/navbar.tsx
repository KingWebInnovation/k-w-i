"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./navbar.module.css";

import logo from "../../public/kwi-logo.png";
import { useUser, SignIn, SignUp, UserButton } from "@clerk/nextjs";

export default function Navbar() {
  const { user, isSignedIn } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("/");

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Services", href: "/#services" },
    { name: "Pricing", href: "/#pricing" },
    { name: "Testimonials", href: "/#testimonials" },
    { name: "Contact", href: "/#contact" },
  ];

  const role = user?.publicMetadata?.role || "user";

  const handleCloseMenu = () => setIsOpen(false);

  useEffect(() => {
    const handleHashChange = () => {
      setActiveLink(window.location.hash || "/");
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  return (
    <>
      <section className={styles.section}>
        <nav className={styles.nav}>
          <Link
            href="/"
            className={styles.logoLink}
            onClick={() => setActiveLink("/")}
          >
            <Image src={logo} alt="Logo Image" width={50} />
            <p>King Web Innovation</p>
          </Link>

          <button
            className={styles.hamburger}
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? "Close" : "Menu"}
          </button>

          <div className={`${styles.navMenu} ${isOpen ? styles.open : ""}`}>
            <div className={styles.navLinks}>
              {navLinks.map(({ name, href }) => (
                <Link
                  key={name}
                  href={href}
                  className={`${styles.navLink} ${
                    activeLink === href ? styles.active : ""
                  }`}
                  onClick={() => {
                    setActiveLink(href);
                    handleCloseMenu();
                  }}
                >
                  {name}
                </Link>
              ))}
            </div>

            <div className={styles.callToActions}>
              {!isSignedIn ? (
                <>
                  {/* Sign In Button */}
                  <button
                    className={styles.buttonLink}
                    onClick={() => {
                      setIsSignInModalOpen(true);
                      handleCloseMenu();
                    }}
                  >
                    Sign In
                  </button>

                  {/* Get Started Button -> Sign Up modal */}
                  <button
                    className={styles.outlineButton}
                    onClick={() => {
                      setIsSignUpModalOpen(true);
                      handleCloseMenu();
                    }}
                  >
                    Get Started
                  </button>
                </>
              ) : (
                <>
                  {role === "admin" && (
                    <Link
                      href={"/admindashboard"}
                      className={`${styles.outlineButton} ${styles.adminButton}`}
                      onClick={() => {
                        handleCloseMenu();
                      }}
                    >
                      Dashboard
                    </Link>
                  )}

                  {role === "user" && (
                    <Link
                      href="/clientdashboard"
                      className={styles.buttonLink}
                      onClick={handleCloseMenu}
                    >
                      Dashboard
                    </Link>
                  )}

                  <div className={styles.userButtonWrapper}>
                    <UserButton
                      appearance={{
                        elements: {
                          userButtonAvatarBox: {
                            width: "25px",
                            height: "25px",
                            borderRadius: "50%",
                          },
                          userButtonTrigger: {
                            background: "transparent",
                            padding: 0,
                          },
                        },
                      }}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </nav>
      </section>

      {/* Sign In Modal */}
      {isSignInModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
          onClick={() => setIsSignInModalOpen(false)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <SignIn
              signUpUrl="/sign-up"
              appearance={{
                elements: {
                  rootBox: {
                    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                    borderRadius: "8px",
                  },
                },
              }}
            />
          </div>
        </div>
      )}

      {/* Sign Up Modal */}
      {isSignUpModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
          onClick={() => setIsSignUpModalOpen(false)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <SignUp
              signInUrl="/sign-in"
              appearance={{
                elements: {
                  rootBox: {
                    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                    borderRadius: "8px",
                  },
                },
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}
