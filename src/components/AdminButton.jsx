"use client";

import { useState, useEffect, useRef } from "react";
import {
  useClerk,
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function AdminButton({ isMobile = false }) {
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const { signOut } = useClerk();
  const router = useRouter();
  const panelRef = useRef(null);
  const buttonRef = useRef(null);

  // Close panel on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setShowAdminPanel(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleDashboardClick = () => {
    setShowAdminPanel(false);
    router.push("/admin/dashboard");
  };

  return (
    <div ref={buttonRef} className="relative w-full">
      {/* BUTTON - Tamaño grande para móvil, normal para desktop */}
      <button
        onClick={() => setShowAdminPanel(!showAdminPanel)}
        className={`
          flex items-center justify-center gap-2
          bg-gray-800 text-white
          font-bold border border-gray-700
          shadow-lg hover:bg-gray-700
          transition-all duration-200
          w-full
          ${
            isMobile
              ? "px-4 py-4 rounded-xl text-base"
              : "px-3 py-3 sm:px-4 sm:py-2 rounded-full sm:rounded-lg text-sm sm:text-base"
          }
        `}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`${isMobile ? "h-5 w-5" : "h-4 w-4 sm:h-5 sm:w-5"}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
            clipRule="evenodd"
          />
        </svg>
        <span>Admin</span>
      </button>

      {/* PANEL - MISMO COMPORTAMIENTO EN TODOS LOS DISPOSITIVOS */}
      {showAdminPanel && (
        <div
          ref={panelRef}
          className={`
            absolute ${isMobile ? "bottom-full left-0 mb-2 w-full" : "top-full right-0 mt-2 w-56"}
            bg-white shadow-xl p-4 z-[999]
            border border-gray-200 rounded-lg
          `}
          onClick={(e) => e.stopPropagation()}
        >
          <SignedOut>
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-800 text-sm text-center">
                Admin Access
              </h3>

              <SignInButton mode="modal">
                <button className="w-full bg-green-700 text-white py-2 rounded hover:bg-green-800 transition text-sm font-medium">
                  Sign In
                </button>
              </SignInButton>
            </div>
          </SignedOut>

          <SignedIn>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-800 text-sm">
                  Admin Panel
                </h3>
                <UserButton afterSignOutUrl="/" />
              </div>

              <button
                onClick={handleDashboardClick}
                className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition text-sm font-medium"
              >
                Go to Dashboard
              </button>

              <button
                onClick={handleSignOut}
                className="w-full bg-gray-100 text-gray-700 py-2 rounded hover:bg-gray-200 transition text-sm font-medium"
              >
                Sign Out
              </button>
            </div>
          </SignedIn>
        </div>
      )}
    </div>
  );
}
