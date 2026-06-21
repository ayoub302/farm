// components/AdminGuard.jsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminGuard({ children }) {
  const router = useRouter();
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkSession() {
      try {
        console.log("[ADMIN GUARD] Checking session...");
        const res = await fetch("/api/admin/check-session");

        if (res.ok) {
          console.log("[ADMIN GUARD] ✅ Session valid");
          setVerified(true);
        } else {
          console.log("[ADMIN GUARD] ❌ No session, redirecting...");
          router.push("/");
        }
      } catch (error) {
        console.error("[ADMIN GUARD ERROR]", error);
        router.push("/");
      } finally {
        setLoading(false);
      }
    }

    checkSession();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2d5a27] mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!verified) return null;

  return children;
}
