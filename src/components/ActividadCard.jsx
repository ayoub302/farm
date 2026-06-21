"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/components/LanguageContext";
import Image from "next/image";

export default function ActividadCard({ actividad }) {
  const { language } = useLanguage();
  const [currentLanguage, setCurrentLanguage] = useState("fr");

  useEffect(() => {
    setCurrentLanguage(language);
  }, [language]);

  const getText = (obj) => {
    if (!obj) return "";
    if (typeof obj === "string") return obj;
    if (typeof obj === "object") {
      return obj[currentLanguage] || obj.ar || obj.fr || "";
    }
    return String(obj);
  };

  const titulo = getText(actividad.titulo);
  const descripcion = getText(actividad.descripcion);
  const fecha = getText(actividad.fecha);

  // Obtener horarios de los datos
  const horaInicio = actividad.horaInicio || "09:00";
  const horaFin = actividad.horaFin || "12:00";
  const horarioCompleto =
    getText(actividad.horarioCompleto) || `${horaInicio} - ${horaFin}`;

  // Lógica de Imágenes Dinámicas
  const getActivityImage = () => {
    if (actividad.imagen && actividad.imagen.trim() !== "") {
      return actividad.imagen;
    }

    const fullText = (titulo + " " + descripcion).toLowerCase();
    const cat = getText(actividad.categoria)?.toLowerCase() || "";

    if (
      cat.includes("family") ||
      cat.includes("familial") ||
      cat.includes("عائلي") ||
      fullText.includes("familiar") ||
      fullText.includes("en famille") ||
      fullText.includes("عائلي")
    )
      return "/familia.png";

    if (
      cat.includes("educational") ||
      cat.includes("éducation") ||
      cat.includes("تعليمي") ||
      fullText.includes("educación") ||
      fullText.includes("educativa")
    )
      return "/educacion.png";

    if (
      cat.includes("visit") ||
      cat.includes("visite") ||
      cat.includes("زيارة") ||
      fullText.includes("visita guiada") ||
      fullText.includes("visite guidée")
    )
      return "/visita.png";

    if (
      cat.includes("workshop") ||
      cat.includes("atelier") ||
      cat.includes("ورشة") ||
      fullText.includes("taller") ||
      fullText.includes("taller práctico")
    )
      return "/martillo.png";

    if (
      cat.includes("harvest") ||
      cat.includes("récolte") ||
      cat.includes("حصاد") ||
      fullText.includes("cosecha") ||
      fullText.includes("recolte")
    ) {
      if (
        fullText.includes("تفاح") ||
        fullText.includes("pomme") ||
        fullText.includes("apple")
      )
        return "/manzana.png";
      if (
        fullText.includes("بطاط") ||
        fullText.includes("patate") ||
        fullText.includes("potato")
      )
        return "/patata.png";
      if (
        fullText.includes("يوسفي") ||
        fullText.includes("mandarine") ||
        fullText.includes("orange")
      )
        return "/mandarina.png";
      if (fullText.includes("قرع") || fullText.includes("citrouille"))
        return "/calabaza.png";
      if (
        fullText.includes("جزر") ||
        fullText.includes("carotte") ||
        fullText.includes("carrot")
      )
        return "/zanahoria.png";
      if (
        fullText.includes("سبانخ") ||
        fullText.includes("épinard") ||
        fullText.includes("spinach")
      )
        return "/espinacas.png";

      return "/manzana.png";
    }

    if (
      cat.includes("تذوق") ||
      cat.includes("dégustation") ||
      cat.includes("tasting")
    )
      return "/mandarina.png";

    if (
      cat.includes("موسمي") ||
      cat.includes("saisonnier") ||
      cat.includes("seasonal")
    )
      return "/calabaza.png";

    return "/familia.png";
  };

  // Colores de Categoría
  const getCategoriaStyle = (categoria) => {
    const cat = getText(categoria).toLowerCase();
    if (
      cat.includes("حصاد") ||
      cat.includes("récolte") ||
      cat.includes("harvest")
    )
      return { color: "bg-green-100 text-green-800", label: "Récolte" };
    if (
      cat.includes("ورشة") ||
      cat.includes("atelier") ||
      cat.includes("workshop")
    )
      return { color: "bg-yellow-100 text-yellow-800", label: "Atelier" };
    if (
      cat.includes("زيارة") ||
      cat.includes("visite") ||
      cat.includes("visit")
    )
      return { color: "bg-blue-100 text-blue-800", label: "Visite" };
    if (
      cat.includes("تعليمي") ||
      cat.includes("éducation") ||
      cat.includes("educational")
    )
      return { color: "bg-purple-100 text-purple-800", label: "Éducation" };
    if (
      cat.includes("عائلي") ||
      cat.includes("familial") ||
      cat.includes("family")
    )
      return { color: "bg-pink-100 text-pink-800", label: "Familial" };
    if (
      cat.includes("تذوق") ||
      cat.includes("dégustation") ||
      cat.includes("tasting")
    )
      return { color: "bg-orange-100 text-orange-800", label: "Dégustation" };
    if (
      cat.includes("موسمي") ||
      cat.includes("saisonnier") ||
      cat.includes("seasonal")
    )
      return { color: "bg-indigo-100 text-indigo-800", label: "Saisonnier" };

    return { color: "bg-gray-100 text-gray-800", label: "Activité" };
  };

  const categoriaLabel = actividad.categoria
    ? getText(actividad.categoria)
    : currentLanguage === "ar"
    ? "نشاط"
    : "Activité";

  const style = getCategoriaStyle(categoriaLabel);
  const activityImage = getActivityImage();
  const reservarText = currentLanguage === "ar" ? "سجل الآن" : "S'inscrire";

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full">
      {/* Cabecera con Imagen */}
      <div className="relative h-40 w-full overflow-hidden bg-gradient-to-br from-green-50 to-emerald-50">
        {activityImage ? (
          <div className="relative h-full w-full flex items-center justify-center">
            <div className="relative h-full w-full max-w-[70%]">
              <Image
                src={activityImage}
                alt={titulo}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority={false}
                quality={75}
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <span className="text-3xl">🌱</span>
          </div>
        )}

        <div className="absolute top-3 left-3">
          <span
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${style.color}`}
          >
            {style.label}
          </span>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2 min-h-[3rem]">
            {titulo}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-2 min-h-[2.5rem]">
            {descripcion}
          </p>
        </div>

        {/* SECCIÓN DE FECHA Y HORA */}
        <div className="mb-3 space-y-2 pt-2 border-t border-gray-100">
          {/* Fecha */}
          <div className="flex items-center gap-2 text-emerald-700 font-semibold text-sm">
            <span className="text-base">📅</span>
            <span className="whitespace-nowrap">{fecha}</span>
          </div>

          {/* Hora - AUTOMÁTICA desde la base de datos */}
          <div className="flex items-center gap-2 text-blue-600 font-medium text-sm">
            <span className="text-base">🕐</span>
            <span className="whitespace-nowrap">{horarioCompleto}</span>
          </div>
        </div>

        {/* Duración y Nivel */}
        {actividad.duracion && (
          <div className="mb-3 flex items-center gap-2 text-sm text-gray-500">
            <span className="text-gray-400">⏱️</span>
            <span>{getText(actividad.duracion)}</span>
            <span className="text-gray-300">•</span>
            <span className="text-gray-400">📊</span>
            <span className="font-medium">{getText(actividad.nivel)}</span>
          </div>
        )}

        {/* Cupos disponibles */}
        {actividad.cuposDisponibles !== undefined && (
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="text-gray-400">👥</span>
              <span>{currentLanguage === "ar" ? "المقاعد:" : "Places:"}</span>
            </div>
            <span
              className={`text-sm font-semibold ${
                actividad.cuposDisponibles > 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {actividad.cuposDisponibles}{" "}
              {currentLanguage === "ar" ? "متبقي" : "disponibles"}
            </span>
          </div>
        )}

        <div className="mt-auto pt-3 border-t border-gray-100">
          <Link
            href={
              actividad.enlace ||
              `/reservation?activity=${
                actividad.id || encodeURIComponent(titulo)
              }`
            }
            className="block w-full bg-[#2d5a27] text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-green-800 transition-all duration-200 text-center text-sm shadow-sm"
          >
            {reservarText}
          </Link>
        </div>
      </div>
    </div>
  );
}
