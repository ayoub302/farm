"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { Shield, AlertCircle, Loader2, Home, Mail, Key, LogOut } from "lucide-react";
import Link from "next/link";

export default function AdminGuard({ children }) {
  const { isLoaded, userId, getToken, signOut } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [adminEmails, setAdminEmails] = useState([]);
  const [userData, setUserData] = useState(null);
  const hasVerifiedRef = useRef(false);

  useEffect(() => {
    // Evitar verificación múltiple
    if (hasVerifiedRef.current) return;
    
    console.log("[ADMIN_GUARD] Initializing...");
    console.log("[ADMIN_GUARD] Auth state:", { isLoaded, userId });

    async function verifyAdminAccess() {
      // 1. Verificar si Clerk está cargado
      if (!isLoaded) {
        console.log("[ADMIN_GUARD] Clerk not loaded yet");
        return;
      }

      hasVerifiedRef.current = true;

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
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
          },
          credentials: "include",
        });

        const data = await response.json();
        console.log("[ADMIN_GUARD] Verification response:", data);

        if (response.ok && data.success) {
          // ✅ USUARIO ES ADMIN
          console.log("[ADMIN_GUARD] User is admin:", data.user?.email || data.email);
          setIsAdmin(true);
          setUserEmail(data.user?.email || data.email);
          setUserData(data.user || null);
          setError(null);
          
          // Guardar emails admin si vienen en la respuesta
          if (data.adminEmails) {
            setAdminEmails(data.adminEmails);
          }
        } else {
          // ❌ NO ES ADMIN
          console.log("[ADMIN_GUARD] User is NOT admin:", data.error);
          setError(data.error || "NOT_ADMIN");
          setUserEmail(data.email || data.userEmail || null);
          setUserData(data.user || null);
          
          // Guardar emails admin si vienen en la respuesta
          if (data.adminEmails) {
            setAdminEmails(data.adminEmails);
          }

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

  // Función para manejar sign out
  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/");
    } catch (error) {
      console.error("[ADMIN_GUARD] Error signing out:", error);
      router.push("/");
    }
  };

  // 1. Estado de carga
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="relative mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto animate-pulse">
              <Loader2 className="w-10 h-10 text-[#2d5a27] animate-spin" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            Verifying Admin Access
          </h2>
          <p className="text-gray-600 mb-6">
            Checking your administrator permissions...
          </p>
          <div className="space-y-3 max-w-xs mx-auto">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-gray-600">Loading authentication</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div
                className="w-2 h-2 bg-green-500 rounded-full animate-pulse"
                style={{ animationDelay: "0.2s" }}
              ></div>
              <span className="text-gray-600">Verifying credentials</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div
                className="w-2 h-2 bg-green-500 rounded-full animate-pulse"
                style={{ animationDelay: "0.4s" }}
              ></div>
              <span className="text-gray-600">Checking admin privileges</span>
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
        bgColor: "bg-yellow-50",
        iconBg: "bg-yellow-100",
        textColor: "text-yellow-800",
        borderColor: "border-yellow-200",
        buttonColor: "bg-yellow-600 hover:bg-yellow-700",
        action: "Sign In",
        actionLink: "/sign-in",
        secondaryAction: "Return Home",
        secondaryLink: "/",
      },
      NOT_ADMIN: {
        title: "Access Denied",
        message: "You do not have administrator privileges.",
        icon: <AlertCircle className="w-12 h-12 text-red-600" />,
        bgColor: "bg-red-50",
        iconBg: "bg-red-100",
        textColor: "text-red-800",
        borderColor: "border-red-200",
        buttonColor: "bg-red-600 hover:bg-red-700",
        action: "Go to Homepage",
        actionLink: "/",
        secondaryAction: "Sign Out",
      },
      VERIFICATION_ERROR: {
        title: "Verification Failed",
        message: "Unable to verify your access. Please try again.",
        icon: <AlertCircle className="w-12 h-12 text-orange-600" />,
        bgColor: "bg-orange-50",
        iconBg: "bg-orange-100",
        textColor: "text-orange-800",
        borderColor: "border-orange-200",
        buttonColor: "bg-orange-600 hover:bg-orange-700",
        action: "Try Again",
        actionLink: "/admin/dashboard",
        secondaryAction: "Return Home",
        secondaryLink: "/",
      },
    };

    const config = errorConfig[error] || {
      title: "Access Error",
      message: "An error occurred while checking your permissions.",
      icon: <AlertCircle className="w-12 h-12 text-gray-600" />,
      bgColor: "bg-gray-50",
      iconBg: "bg-gray-100",
      textColor: "text-gray-800",
      borderColor: "border-gray-200",
      buttonColor: "bg-gray-600 hover:bg-gray-700",
      action: "Return Home",
      actionLink: "/",
      secondaryAction: null,
    };

    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-md w-full">
          <div className={`${config.iconBg} p-4 rounded-full inline-block mb-6`}>
            {config.icon}
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">
            {config.title}
          </h1>

          <p className="text-gray-600 mb-6 text-sm sm:text-base">
            {config.message}
          </p>

          {userEmail && (
            <div className={`${config.bgColor} p-4 rounded-lg mb-6 border ${config.borderColor}`}>
              <div className="flex items-center justify-center gap-2 mb-2">
                <Mail className="w-4 h-4 text-gray-500" />
                <p className="text-sm text-gray-700 font-medium break-all">{userEmail}</p>
              </div>
              
              {adminEmails.length > 0 && (
                <div className="text-left mt-3 pt-3 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                    <Key className="w-3 h-3" />
                    Authorized admin emails:
                  </p>
                  <ul className="text-xs text-gray-600 space-y-1 max-h-32 overflow-y-auto">
                    {adminEmails.map((email, index) => (
                      <li key={index} className="flex items-center gap-1">
                        <span className="w-1 h-1 bg-green-500 rounded-full flex-shrink-0"></span>
                        <span className="break-all">{email}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div className="space-y-3">
            <Link
              href={config.actionLink}
              className={`inline-flex items-center justify-center w-full ${config.buttonColor} text-white px-6 py-3 rounded-lg transition font-medium gap-2 text-sm sm:text-base`}
            >
              <Home className="w-4 h-4 sm:w-5 sm:h-5" />
              {config.action}
            </Link>
            
            {config.secondaryAction && (
              <button
                onClick={config.secondaryAction === "Sign Out" ? handleSignOut : () => router.push(config.secondaryLink)}
                className="inline-flex items-center justify-center w-full bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition font-medium gap-2 text-sm sm:text-base"
              >
                {config.secondaryAction === "Sign Out" && <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />}
                {config.secondaryAction}
              </button>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs sm:text-sm text-gray-500">
              If you believe this is an error, please contact the system administrator.
            </p>
            <p className="text-xs text-gray-400 mt-2">Error code: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  // 3. Si es admin, mostrar el contenido con banner
  if (isAdmin) {
    return (
      <>
        {/* Banner de admin */}
        <div className="bg-gradient-to-r from-[#2d5a27] to-green-700 text-white py-2 px-4 text-center text-xs sm:text-sm sticky top-0 z-50 shadow-md">
          <div className="flex items-center justify-center gap-2 flex-wrap max-w-7xl mx-auto">
            <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="font-medium">Admin Mode</span>
            <span className="text-green-200 hidden sm:inline">•</span>
            <span className="text-green-100 truncate max-w-[150px] sm:max-w-xs hidden sm:inline">
              {userEmail}
            </span>
            <div className="flex gap-2 ml-0 sm:ml-4">
              <Link
                href="/"
                className="text-xs bg-white/20 hover:bg-white/30 px-2 py-1 sm:px-3 sm:py-1 rounded-full transition"
              >
                View Site
              </Link>
              <button
                onClick={handleSignOut}
                className="text-xs bg-red-500/20 hover:bg-red-500/30 px-2 py-1 sm:px-3 sm:py-1 rounded-full transition flex items-center gap-1"
              >
                <LogOut className="w-3 h-3" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
          {/* Email móvil */}
          <div className="sm:hidden text-xs text-green-200 mt-1 truncate px-4">
            {userEmail}
          </div>
        </div>
        {children}
      </>
    );
  }

  // 4. Por si acaso (no debería llegar aquí)
  return null;
}