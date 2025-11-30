"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";

export default function CatchAllPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isSignedIn } = useUser();

  const [showRedirectMessage, setShowRedirectMessage] = useState(false);

  useEffect(() => {
    const isClerkRedirect =
      pathname?.includes("sso-callback") ||
      searchParams?.has("sign_up_force_redirect_url") ||
      searchParams?.has("sign_in_force_redirect_url");

    // ✅ If Clerk redirect and user not signed in, go to sign-up page
    if (!isSignedIn && isClerkRedirect) {
      router.replace("/sign-up");
      return; // stop here — don’t show 404 message
    }

    // ✅ Otherwise, treat as 404 and redirect to home after 3s
    setShowRedirectMessage(true);
    const timer = setTimeout(() => router.push("/"), 3000);
    return () => clearTimeout(timer);
  }, [isSignedIn, pathname, searchParams, router]);

  // ✅ Show 404 spinner + redirect message
  if (showRedirectMessage) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          fontSize: "1.2rem",
          fontFamily: "sans-serif",
          gap: "1rem",
          padding: "2rem",
        }}
      >
        <div
          style={{
            width: "50px",
            height: "50px",
            border: "5px solid #ccc",
            borderTop: "5px solid #ff9d3c",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />
        Page not found! Redirecting to home...
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // ✅ Fallback to keep full height if nothing rendered yet
  return <div style={{ minHeight: "100vh" }} />;
}
