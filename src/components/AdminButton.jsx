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

export default function AdminButton() {
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { signOut } = useClerk();
  const router = useRouter();
  const panelRef = useRef(null);
  const buttonRef = useRef(null);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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

  const panelPosition = isMobile
    ? "fixed inset-x-0 bottom-0"
    : "absolute top-full right-0 mt-2";

  const panelWidth = isMobile ? "w-auto" : "w-56";

  return (
    <div ref={buttonRef} className="relative z-40 shrink-0">
      {/* BUTTON */}
      <button
        onClick={() => setShowAdminPanel(!showAdminPanel)}
        className="
          flex items-center gap-2
          bg-gray-800 text-white
          px-3 py-3 sm:px-4 sm:py-2
          rounded-full sm:rounded-lg
          shadow-lg hover:bg-gray-700
          transition-all duration-200
          font-medium
          border border-gray-700
        "
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
            clipRule="evenodd"
          />
        </svg>
        {!isMobile && <span>Admin</span>}
      </button>

      {/* PANEL */}
      {showAdminPanel && (
        <div
          ref={panelRef}
          className={`
            ${panelPosition} ${panelWidth}
            bg-white shadow-xl p-4 z-[999]
            border border-gray-200
            ${isMobile ? "rounded-t-2xl" : "rounded-lg"}
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
                className="w-full bg-gray-100 text-gray-700 py-2 rounded hover:bg-gray-200 transition text-sm font-medium mt-2"
              >
                Sign Out
              </button>
            </div>
          </SignedIn>

          {isMobile && (
            <button
              onClick={() => setShowAdminPanel(false)}
              className="w-full mt-3 text-center text-gray-500 text-sm hover:text-gray-700 py-1"
            >
              Close
            </button>
          )}
        </div>
      )}
    </div>
  );
}
