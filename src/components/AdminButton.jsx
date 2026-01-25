// components/AdminButton.js
"use client";

import { useState } from "react";
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
  const { signOut } = useClerk();
  const router = useRouter();

  const handleSignOut = async () => {
    console.log("[ADMIN LOG] - User signing out");
    try {
      await signOut();
      console.log("[ADMIN LOG] - Sign out successful");
      router.push("/");
    } catch (error) {
      console.error("[ADMIN LOG ERROR] - Error signing out:", error);
    }
  };

  const handleDashboardClick = () => {
    console.log("[ADMIN LOG] - Navigating to Dashboard");
    setShowAdminPanel(false);
    router.push("/admin/dashboard");
  };

  return (
    <div className="relative">
      {/* Botón Admin - Estilo similar al navbar */}
      <button
        onClick={() => setShowAdminPanel(!showAdminPanel)}
        className="
          bg-gray-800 text-white px-3 py-1.5 rounded-lg 
          hover:bg-gray-700 transition flex items-center gap-1.5
          text-xs font-medium shadow-sm
        "
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-3.5 w-3.5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
            clipRule="evenodd"
          />
        </svg>
        Admin
      </button>

      {/* Panel flotante */}
      {showAdminPanel && (
        <div
          className="absolute top-full right-0 mt-2 bg-white shadow-2xl rounded-lg p-3 w-56 z-50 border border-gray-200 animate-fadeIn"
          onClick={(e) => e.stopPropagation()}
        >
          <SignedOut>
            <div className="space-y-2">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full mb-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-gray-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-800 text-xs">
                  Admin Access
                </h3>
                <p className="text-xs text-gray-500">
                  Sign in to access dashboard
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-1.5 mb-1">
                <p className="text-xs text-yellow-700 font-medium text-center">
                  🔒 Only for authorized users
                </p>
              </div>

              <SignInButton mode="modal">
                <button className="w-full bg-[#2d5a27] text-white py-1.5 rounded hover:bg-green-800 transition text-xs font-medium">
                  Sign In
                </button>
              </SignInButton>
            </div>
          </SignedOut>

          <SignedIn>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-800 text-xs">
                    Admin Panel
                  </h3>
                  <p className="text-xs text-gray-500">Welcome back!</p>
                </div>
                <div className="scale-75">
                  <UserButton afterSignOutUrl="/" />
                </div>
              </div>

              <button
                onClick={handleDashboardClick}
                className="w-full bg-gradient-to-r from-green-500 to-[#2d5a27] text-white py-1.5 rounded hover:opacity-90 transition text-xs font-medium"
              >
                Go to Dashboard
              </button>

              <div className="grid grid-cols-2 gap-1 mt-1">
                <button
                  onClick={() => {
                    setShowAdminPanel(false);
                    router.push("/admin/activities/new");
                  }}
                  className="bg-blue-50 text-blue-700 py-1 rounded hover:bg-blue-100 transition text-xs font-medium"
                >
                  Activities
                </button>
                <button
                  onClick={() => {
                    setShowAdminPanel(false);
                    router.push("/admin/harvests");
                  }}
                  className="bg-orange-50 text-orange-700 py-1 rounded hover:bg-orange-100 transition text-xs font-medium"
                >
                  Harvests
                </button>
              </div>

              <button
                onClick={handleSignOut}
                className="w-full bg-gray-100 text-gray-700 py-1.5 rounded hover:bg-gray-200 transition text-xs font-medium mt-1"
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
