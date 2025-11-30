"use client";

import Link from "next/link";
import styles from "./page.module.css";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.dashboard}>
      {/* Navbar */}
      <nav className={styles.navbar}>
        <Link href="/" className={styles.navLink}>
          Home
        </Link>
      </nav>

      <div className={styles.container}>
        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <Link href="/clientdashboard/orders" className={styles.sidebarLink}>
            Manage Orders
          </Link>
          <Link
            href="/clientdashboard/subscription"
            className={styles.sidebarLink}
          >
            Manage Subscriptions
          </Link>
        </aside>

        {/* Main Content */}
        <main className={styles.main}>{children}</main>
      </div>
    </div>
  );
}
