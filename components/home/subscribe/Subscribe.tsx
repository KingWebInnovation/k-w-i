"use client";

import { useState } from "react";
import styles from "./Subscribe.module.css";
import { Mail } from "lucide-react";
import axios, { AxiosError } from "axios";

export default function SubscribeSection() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await axios.post("/api/admin/newsletter", { email });
      setMessage(res.data.message || "Subscribed successfully!");
      setEmail(""); // clear input
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      setMessage(
        error.response?.data?.message || error.message || "Subscription failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={styles.subscribeSection}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h2 className={styles.title}>
            Stay Ahead with <span>Web Insights</span> & Trends
          </h2>
          <p className={styles.text}>
            Receive monthly updates on website design, digital marketing
            strategies, and success stories from U.S. businesses leveraging King
            Web Innovation.
          </p>
        </header>

        <main className={styles.main}>
          <form className={styles.form} onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="your@email.com"
              required
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            <button type="submit" className={styles.button} disabled={loading}>
              <Mail size={18} />
              {loading ? "Subscribing..." : "Subscribe"}
            </button>
          </form>
          {message && <p className={styles.message}>{message}</p>}
        </main>
      </div>
    </section>
  );
}
