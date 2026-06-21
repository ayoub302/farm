"use client";

import { createContext, useContext, useState, useEffect } from "react";

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  // 1. Inicialización Lazy: Solo se ejecuta una vez al crear el estado
  const [language, setLanguage] = useState(() => {
    // Verificamos si estamos en el navegador (cliente)
    if (typeof window !== "undefined") {
      const savedLanguage = localStorage.getItem("farm-language");
      return savedLanguage || "ar";
    }
    return "ar"; // Valor por defecto para el servidor
  });

  // 2. Sincronización con el sistema externo (DOM y LocalStorage)
  useEffect(() => {
    localStorage.setItem("farm-language", language);

    // Ajustamos los atributos del documento para accesibilidad y RTL
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = language;
  }, [language]);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "ar" ? "fr" : "ar"));
  };

  const changeLanguage = (newLang) => {
    setLanguage(newLang);
  };

  return (
    <LanguageContext.Provider
      value={{ language, toggleLanguage, changeLanguage }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
