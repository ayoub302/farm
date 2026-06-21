"use client";

import { useState, useRef, useEffect } from "react";
import { useLanguage } from "../components/LanguageContext";
import { FaGlobe } from "react-icons/fa";

export default function LanguageSwitcher() {
  const { language, changeLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Cerrar el menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-700"
      >
        <FaGlobe className="text-xl" />
      </button>

      {isOpen && (
        <div
          className="absolute mt-2 w-32 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50 overflow-hidden"
          style={{
            right: language === "ar" ? "auto" : 0,
            left: language === "ar" ? 0 : "auto",
          }}
        >
          <div className="py-1">
            <button
              onClick={() => {
                changeLanguage("fr");
                setIsOpen(false);
              }}
              className="block w-full text-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Français
            </button>
            <button
              onClick={() => {
                changeLanguage("ar");
                setIsOpen(false);
              }}
              className="block w-full text-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              العربية
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
