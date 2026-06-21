"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminButton() {
  const [showPanel, setShowPanel] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    setError("");
    if (!username || !password) {
      setError("Veuillez remplir tous les champs");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Identifiants incorrects");
        return;
      }
      setIsLoggedIn(true);
      setShowPanel(false);
      router.push("/admin/dashboard");
    } catch (err) {
      setError("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    setIsLoggedIn(false);
    setUsername("");
    setPassword("");
    router.push("/");
  };

  const disableCopyPaste = (e) => e.preventDefault();

  return (
    <div className="relative">
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="bg-gray-800 text-white px-3 py-1.5 rounded-lg hover:bg-gray-700 transition flex items-center gap-1.5 text-xs font-medium shadow-sm"
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

      {showPanel && (
        <div
          className="absolute top-full right-0 mt-2 bg-white shadow-2xl rounded-lg p-4 w-56 z-50 border border-gray-200"
          onClick={(e) => e.stopPropagation()}
        >
          {!isLoggedIn ? (
            <div className="space-y-3">
              <div className="text-center mb-1">
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
                  Accès Admin
                </h3>
                <p className="text-xs text-gray-500">Entrez vos identifiants</p>
              </div>

              <input
                type="text"
                placeholder="Utilisateur"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                onCopy={disableCopyPaste}
                onPaste={disableCopyPaste}
                onCut={disableCopyPaste}
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600"
              />

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Mot de passe"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  onCopy={disableCopyPaste}
                  onPaste={disableCopyPaste}
                  onCut={disableCopyPaste}
                  className="w-full border border-gray-300 rounded px-2 py-1.5 pr-8 text-xs focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3.5 w-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3.5 w-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded px-2 py-1.5">
                  <p className="text-xs text-red-600 text-center">⚠️ {error}</p>
                </div>
              )}

              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full bg-[#2d5a27] text-white py-1.5 rounded hover:bg-green-800 transition text-xs font-medium disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Connexion..." : "Se connecter"}
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="mb-1">
                <h3 className="font-semibold text-gray-800 text-xs">
                  Panneau Admin
                </h3>
                <p className="text-xs text-gray-500">Bienvenue, {username}</p>
              </div>

              <button
                onClick={() => {
                  setShowPanel(false);
                  router.push("/admin/dashboard");
                }}
                className="w-full bg-gradient-to-r from-green-500 to-[#2d5a27] text-white py-1.5 rounded hover:opacity-90 transition text-xs font-medium"
              >
                Tableau de bord
              </button>

              <div className="grid grid-cols-2 gap-1">
                <button
                  onClick={() => {
                    setShowPanel(false);
                    router.push("/admin/activities/new");
                  }}
                  className="bg-blue-50 text-blue-700 py-1 rounded hover:bg-blue-100 transition text-xs font-medium"
                >
                  Activités
                </button>
                <button
                  onClick={() => {
                    setShowPanel(false);
                    router.push("/admin/harvests");
                  }}
                  className="bg-orange-50 text-orange-700 py-1 rounded hover:bg-orange-100 transition text-xs font-medium"
                >
                  Récoltes
                </button>
              </div>

              <button
                onClick={handleLogout}
                className="w-full bg-gray-100 text-gray-700 py-1.5 rounded hover:bg-gray-200 transition text-xs font-medium mt-1"
              >
                Se déconnecter
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
