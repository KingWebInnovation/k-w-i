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
          <Link href="/admindashboard/orders" className={styles.sidebarLink}>
            Manage Orders
          </Link>
          <Link
            href="/admindashboard/subscription"
            className={styles.sidebarLink}
          >
            Manage Subscriptions
          </Link>
          <Link href="/admindashboard/packages" className={styles.sidebarLink}>
            Manage Packages
          </Link>
          <Link
            href="/admindashboard/addpackages"
            className={styles.sidebarLink}
          >
            Add Packages
          </Link>
          <Link
            href="/admindashboard/manageservices"
            className={styles.sidebarLink}
          >
            Manage Services
          </Link>
          <Link
            href="/admindashboard/addservices"
            className={styles.sidebarLink}
          >
            Add Services
          </Link>
          <Link
            href="/admindashboard/newsletter"
            className={styles.sidebarLink}
          >
            Newsletter Subscription
          </Link>
        </aside>

        {/* Main Content */}
        <main className={styles.main}>{children}</main>
      </div>
    </div>
  );
}
