"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "../components/LanguageContext";
import LanguageSwitcher from "./LanguageSwitcher";
import AdminButton from "./AdminButton";
import { FaBars, FaTimes, FaLeaf, FaCalendarAlt } from "react-icons/fa";

const textos = {
  ar: {
    navItems: [
      { name: "الرئيسية", path: "/" },
      { name: "الأنشطة", path: "/actividades" },
      { name: "المحاصيل", path: "/cosechas" },
      { name: "اتصل بنا", path: "/contacto" },
    ],
    title: "مزرعة المنصوري",
    subtitle: "زراعة عضوية وتجارب",
    reservarActividad: "حجز نشاط",
    banner: "🎃 حصاد القرع: متوفر من 1 إلى 3 نوفمبر.",
    reservaAhora: "احجز الآن!",
  },
  fr: {
    navItems: [
      { name: "Accueil", path: "/" },
      { name: "Activités", path: "/actividades" },
      { name: "Récoltes", path: "/cosechas" },
      { name: "Contact", path: "/contacto" },
    ],
    title: "Ferme Al Manssouri",
    subtitle: "Agriculture biologique et expériences",
    reservarActividad: "Réserver une activité",
    reservaAhora: "Réservez ahora !",
  },
};

// Función auxiliar para detectar si estamos en el cliente
function subscribe() {
  return () => {};
}

export default function Header() {
  const { language } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const isClient = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

  if (!isClient) {
    return (
      <header className="fixed top-0 w-full h-20 bg-white z-50 shadow-md" />
    );
  }

  const t = textos[language] || textos.fr;
  const isRTL = language === "ar";

  return (
    <header
      className="fixed top-0 w-full z-50 shadow-md"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Menú Principal */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="flex items-center gap-3">
              <div className="bg-green-600 p-2.5 rounded-full flex-shrink-0">
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

            {/* Navegación Desktop */}
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

            {/* 📱 Móvil - Solo botón de menú (SIN AdminButton) */}
            <div className="md:hidden flex items-center gap-2">
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

      {/* 📱 Menú Móvil Desplegable - AdminButton ARRIBA del botón "Réserver" */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 animate-fade-in-down">
          <div className="px-4 pt-2 pb-6 space-y-2">
            {t.navItems.map((item) => (
              <Link
                key={item.name}
                href={item.path}
                onClick={() => setIsMenuOpen(false)}
                className="block px-4 py-3 text-base font-bold text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-xl"
              >
                {item.name}
              </Link>
            ))}

            {/* 🔥 AdminButton ARRIBA del botón de reservar */}
            <div className="px-4 py-2">
              <AdminButton />
            </div>

            <Link
              href="/reservation"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-4 rounded-xl font-bold"
            >
              <FaCalendarAlt />
              {t.reservarActividad}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
