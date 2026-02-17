"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLanguage } from "../components/LanguageContext";
import { useClerk } from "@clerk/nextjs";
import LanguageSwitcher from "./LanguageSwitcher";
import AdminButton from "./AdminButton";
import { FaBars, FaTimes, FaLeaf, FaCalendarAlt } from "react-icons/fa";

const textos = {
  ar: {
    navItems: [
      { name: "الرئيسية", path: "/" },
      { name: "الأنشطة", path: "/activities" },
      { name: "المحاصيل", path: "/cosechas" },
      { name: "اتصل بنا", path: "/contacto" },
    ],
    title: "مزرعة المنصوري",
    subtitle: "زراعة عضوية وتجارب",
    reservarActividad: "حجز نشاط",
  },
  fr: {
    navItems: [
      { name: "Accueil", path: "/" },
      { name: "Activités", path: "/activities" },
      { name: "Récoltes", path: "/cosechas" },
      { name: "Contact", path: "/contacto" },
    ],
    title: "Ferme Al Manssouri",
    subtitle: "Agriculture biologique et expériences",
    reservarActividad: "Réserver une activité",
  },
};

// Componente simplificado de AdminButton para móvil
function AdminButtonMobile({ onClick }) {
  const { signOut } = useClerk();
  const router = useRouter();
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/");
      onClick();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleDashboardClick = () => {
    router.push("/admin/dashboard");
    onClick();
  };

  return (
    <div className="relative">
      {/* BUTTON simple para móvil */}
      <button
        onClick={() => setShowAdminPanel(!showAdminPanel)}
        className="w-full flex items-center justify-center gap-2 bg-gray-800 text-white px-4 py-4 rounded-xl font-bold hover:bg-gray-700 transition"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
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

      {/* Panel para móvil */}
      {showAdminPanel && (
        <div className="fixed inset-x-0 bottom-0 w-auto bg-white shadow-xl p-4 z-[1000] border border-gray-200 rounded-t-2xl">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-800 text-sm">
                Admin Panel
              </h3>
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

            <button
              onClick={() => setShowAdminPanel(false)}
              className="w-full mt-3 text-center text-gray-500 text-sm hover:text-gray-700 py-1"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { language } = useLanguage();

  const t = textos[language] || textos.fr;
  const isRTL = language === "ar";

  return (
    <header
      className="fixed top-0 w-full z-[999] shadow-md bg-white"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 shrink-0">
              <div className="bg-green-600 p-2.5 rounded-full">
                <FaLeaf className="text-white text-xl" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-lg md:text-xl font-extrabold text-gray-800 leading-tight">
                  {t.title}
                </h1>
                <p className="text-[10px] md:text-xs text-green-700 font-medium uppercase tracking-wider">
                  {t.subtitle}
                </p>
              </div>
            </Link>

            {/* Desktop */}
            <div className="hidden md:flex items-center gap-8">
              <nav className="flex items-center gap-8">
                {t.navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.path}
                    className={`text-sm font-bold transition-all hover:text-green-600 ${
                      pathname === item.path
                        ? "text-green-600"
                        : "text-gray-600"
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>

              <div className="flex items-center gap-3 border-s border-gray-200 ps-6">
                <AdminButton />
                <Link
                  href="/reservation"
                  className="bg-green-600 text-white px-5 py-2 rounded-full text-sm font-bold hover:bg-green-700 transition flex items-center gap-2"
                >
                  <FaCalendarAlt />
                  <span>{t.reservarActividad}</span>
                </Link>
                <LanguageSwitcher />
              </div>
            </div>

            {/* Mobile - SOLO LanguageSwitcher y hamburguesa */}
            <div className="md:hidden flex items-center gap-3 shrink-0">
              <LanguageSwitcher />

              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-700 p-2"
              >
                {isMenuOpen ? (
                  <FaTimes className="text-2xl" />
                ) : (
                  <FaBars className="text-2xl" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 animate-fade-in-down z-[999] relative">
          <div className="px-4 pt-2 pb-6">
            {/* Navegación */}
            <div className="space-y-2 mb-6">
              {t.navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-4 py-3 text-base font-bold rounded-xl transition-all ${
                    pathname === item.path
                      ? "bg-green-50 text-green-600"
                      : "text-gray-700 hover:bg-green-50 hover:text-green-600"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Botones en la misma fila - AdminButton dentro del menú */}
            <div className="flex flex-row gap-3">
              {/* Botón Admin - DENTRO del menú */}
              <div className="flex-1">
                <AdminButtonMobile onClick={() => setIsMenuOpen(false)} />
              </div>

              {/* Botón Réserver une activité */}
              <div className="flex-1">
                <Link
                  href="/reservation"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-4 rounded-xl font-bold hover:bg-green-700 transition"
                >
                  <FaCalendarAlt />
                  <span>{t.reservarActividad}</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
