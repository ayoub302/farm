// components/AdminGuard.jsx
"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Shield, AlertCircle, Loader2, Home } from "lucide-react";
import Link from "next/link";

export default function AdminGuard({ children }) {
  const { isLoaded, userId, getToken } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    console.log("[ADMIN_GUARD] Initializing...");
    console.log("[ADMIN_GUARD] Auth state:", { isLoaded, userId });

    async function verifyAdminAccess() {
      // 1. Verificar si Clerk está cargado
      if (!isLoaded) {
        console.log("[ADMIN_GUARD] Clerk not loaded yet");
        return;
      }

      // 2. Verificar si hay usuario autenticado
      if (!userId) {
        console.log(
          "[ADMIN_GUARD] No authenticated user, redirecting to sign-in",
        );
        setError("NOT_AUTHENTICATED");
        setTimeout(() => {
          router.push("/sign-in");
        }, 2000);
        return;
      }

      // 3. Verificar permisos de admin
      console.log("[ADMIN_GUARD] Verifying admin access for user:", userId);

      try {
        // Obtener token para la petición
        const token = await getToken();

        const response = await fetch("/api/admin/verify", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Cache-Control": "no-cache",
          },
          credentials: "include",
        });

        const data = await response.json();
        console.log("[ADMIN_GUARD] Verification response:", data);

        if (response.ok && data.success) {
          // ✅ USUARIO ES ADMIN
          console.log("[ADMIN_GUARD] User is admin:", data.user.email);
          setIsAdmin(true);
          setUserEmail(data.user.email);
          setError(null);
        } else {
          // ❌ NO ES ADMIN
          console.log("[ADMIN_GUARD] User is NOT admin:", data.error);
          setError(data.error || "NOT_ADMIN");
          setUserEmail(data.userEmail || null);

          // Redirigir después de mostrar mensaje
          setTimeout(() => {
            router.push("/");
          }, 3000);
        }
      } catch (error) {
        console.error("[ADMIN_GUARD] Error verifying admin:", error);
        setError("VERIFICATION_ERROR");

        setTimeout(() => {
          router.push("/");
        }, 3000);
      } finally {
        setLoading(false);
      }
    }

    verifyAdminAccess();
  }, [isLoaded, userId, router, getToken]);

  // 1. Estado de carga
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="relative mb-8">
            <Loader2 className="w-16 h-16 text-[#2d5a27] animate-spin mx-auto" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            Verifying Admin Access
          </h2>
          <p className="text-gray-600 mb-6">
            Checking your administrator permissions...
          </p>
          <div className="space-y-2">
            <div className="flex items-center justify-center text-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
              <span className="text-gray-500">Checking authentication</span>
            </div>
            <div className="flex items-center justify-center text-sm">
              <div
                className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"
                style={{ animationDelay: "0.2s" }}
              ></div>
              <span className="text-gray-500">Verifying user credentials</span>
            </div>
            <div className="flex items-center justify-center text-sm">
              <div
                className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"
                style={{ animationDelay: "0.4s" }}
              ></div>
              <span className="text-gray-500">Checking admin privileges</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. Estado de error
  if (error) {
    const errorConfig = {
      NOT_AUTHENTICATED: {
        title: "Authentication Required",
        message: "You need to sign in to access the admin dashboard.",
        icon: <Shield className="w-12 h-12 text-yellow-600" />,
        color: "yellow",
      },
      NOT_ADMIN: {
        title: "Access Denied",
        message: "You do not have administrator privileges.",
        icon: <AlertCircle className="w-12 h-12 text-red-600" />,
        color: "red",
      },
      VERIFICATION_ERROR: {
        title: "Verification Failed",
        message: "Unable to verify your access. Please try again.",
        icon: <AlertCircle className="w-12 h-12 text-orange-600" />,
        color: "orange",
      },
    };

    const config = errorConfig[error] || {
      title: "Access Error",
      message: "An error occurred while checking your permissions.",
      icon: <AlertCircle className="w-12 h-12 text-gray-600" />,
      color: "gray",
    };

    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div
            className={`bg-${config.color}-50 p-6 rounded-full inline-block mb-6`}
          >
            {config.icon}
          </div>

          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            {config.title}
          </h1>

          <p className="text-gray-600 mb-6">{config.message}</p>

          {userEmail && (
            <div className="bg-gray-100 p-4 rounded-lg mb-6">
              <p className="text-sm text-gray-700">
                <span className="font-medium">Logged in as:</span> {userEmail}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Required admin email:{" "}
                {process.env.ADMIN_EMAIL || "Not configured"}
              </p>
            </div>
          )}

          <div className="space-y-3">
            <Link
              href="/"
              className="inline-flex items-center justify-center w-full bg-[#2d5a27] text-white px-6 py-3 rounded-lg hover:bg-green-800 transition font-medium gap-2"
            >
              <Home className="w-5 h-5" />
              Return to Homepage
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              If you believe this is an error, please contact the system
              administrator.
            </p>
            <p className="text-xs text-gray-400 mt-2">Error code: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  // 3. Si es admin, mostrar el contenido
  if (isAdmin) {
    return (
      <>
        {/* Banner de admin */}
        <div className="bg-gradient-to-r from-[#2d5a27] to-green-700 text-white py-2 px-4 text-center text-sm">
          <div className="flex items-center justify-center gap-2">
            <Shield className="w-4 h-4" />
            <span>Admin Mode • Logged in as: {userEmail}</span>
          </div>
        </div>
        {children}
      </>
    );
  }

  // 4. Por si acaso (no debería llegar aquí)
  return null;
}
