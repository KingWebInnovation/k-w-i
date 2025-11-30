"use client";

import { useQuery } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import styles from "./page.module.css";

interface Subscriber {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
}

export default function SubscribersPage() {
  const {
    data: subscribers,
    isLoading,
    isError,
    error,
  } = useQuery<Subscriber[], AxiosError<{ message: string }>>({
    queryKey: ["subscribers"],
    queryFn: async () => {
      const res = await axios.get<Subscriber[]>("/api/admin/newsletter");
      return res.data;
    },
  });

  const handleMessage = (email: string) => {
    window.location.href = `mailto:${email}`;
  };

  if (isLoading) return <p>Loading subscribers...</p>;
  if (isError)
    return <p>Error: {error.response?.data?.message || error.message}</p>;

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Newsletter Subscribers</h1>

      {subscribers?.length === 0 ? (
        <p>No subscribers found.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Email</th>
              <th>Subscribed At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {subscribers?.map((sub) => (
              <tr key={sub._id}>
                <td>{sub.email}</td>
                <td>{new Date(sub.createdAt).toLocaleString()}</td>
                <td>
                  <button
                    className={styles.messageButton}
                    onClick={() => handleMessage(sub.email)}
                  >
                    Message
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
