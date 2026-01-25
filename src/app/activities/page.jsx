"use client";

import { useState, useEffect } from "react";
import ActividadCard from "@/components/ActividadCard";
import Link from "next/link";
import { useLanguage } from "@/components/LanguageContext";

// Textos de la página
const textosPagina = {
  ar: {
    title: "أنشطتنا",
    subtitle: "اكتشف جميع الأنشطة التي نقدمها في مزرعتنا",
    filterByCategory: "تصفية حسب الفئة",
    all: "الكل",
    harvest: "حصاد",
    workshop: "ورشة عمل",
    visit: "زيارة",
    tasting: "تذوق",
    educational: "تعليمي",
    family: "عائلي",
    seasonal: "موسمي",
    doubts: "أسئلة شائعة",
    importantInfo: "معلومات مهمة",
    info1: "يجب الحجز المسبق لجميع الأنشطة",
    info2: "الملابس والأحذية المناسبة للريف",
    info3: "يمكن إلغاء النشاط بسبب الأحوال الجوية",
    info4: "جميع الأنشطة مجانية تماماً",
    info5: "الأنشطة مناسبة للأطفال من سن 6 سنوات",
    schedules: "الجداول الزمنية",
    scheduleText: "الأنشطة متاحة طوال العام. اتصل بنا للحصول على مواعيد محددة.",
    contactForInfo: "اتصل بنا للمزيد من المعلومات",
    loading: "جاري تحميل الأنشطة...",
    noActivities: "لا توجد أنشطة حالياً. تحقق لاحقاً!",
    errorLoading: "حدث خطأ في تحميل الأنشطة. حاول مرة أخرى.",
    tryAgain: "حاول مرة أخرى",
  },
  fr: {
    title: "Nos Activités",
    subtitle:
      "Découvrez toutes les activités que nous proposons dans notre ferme",
    filterByCategory: "Filtrer par catégorie",
    all: "Tout",
    harvest: "Récolte",
    workshop: "Atelier",
    visit: "Visite",
    tasting: "Dégustation",
    educational: "Éducation",
    family: "Familial",
    seasonal: "Saisonnier",
    doubts: "Questions Fréquentes",
    importantInfo: "Informations importantes",
    info1: "Réservation obligatoire pour toutes les activités",
    info2: "Vêtements et chaussures adaptés à la campagne",
    info3:
      "Activité annulable en cas de conditions météorologiques défavorables",
    info4: "Toutes les activités sont complètement gratuites",
    info5: "Activités adaptées aux enfants à partir de 6 ans",
    schedules: "Horaires",
    scheduleText:
      "Les activités sont disponibles toute l'année. Contactez-nous pour des dates spécifiques.",
    contactForInfo: "Contactez-nous pour plus d'informations",
    loading: "Chargement des activités...",
    noActivities:
      "Aucune activité disponible pour le moment. Revenez plus tard!",
    errorLoading:
      "Erreur lors du chargement des activités. Veuillez réessayer.",
    tryAgain: "Réessayer",
  },
};

// Función para obtener el texto en el idioma correcto
const getText = (obj, language) => {
  if (!obj) return "";
  if (typeof obj === "string") return obj;
  if (typeof obj === "object") {
    return obj[language] || obj.ar || obj.fr || "";
  }
  return String(obj);
};

export default function ActividadesPage() {
  const { language } = useLanguage();
  const t = textosPagina[language];
  const [categoriaFiltro, setCategoriaFiltro] = useState("all");
  const [actividades, setActividades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch activities from API
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch("/api/activities");
        if (response.ok) {
          const data = await response.json();
          setActividades(data.actividades || []);
        } else {
          // Usar el texto basado en el lenguaje actual
          const errorText =
            language === "ar"
              ? "حدث خطأ في تحميل الأنشطة. حاول مرة أخرى."
              : "Erreur lors du chargement des activités. Veuillez réessayer.";
          setError(errorText);
        }
      } catch (error) {
        console.error("Error fetching activities:", error);
        // Usar el texto basado en el lenguaje actual
        const errorText =
          language === "ar"
            ? "حدث خطأ في تحميل الأنشطة. حاول مرة أخرى."
            : "Erreur lors du chargement des activités. Veuillez réessayer.";
        setError(errorText);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [language]); // language como dependencia

  // Función para recargar actividades
  const handleRetry = () => {
    setError(null);
    setLoading(true);
    const fetchActivities = async () => {
      try {
        const response = await fetch("/api/activities");
        if (response.ok) {
          const data = await response.json();
          setActividades(data.actividades || []);
        } else {
          const errorText =
            language === "ar"
              ? "حدث خطأ في تحميل الأنشطة. حاول مرة أخرى."
              : "Erreur lors du chargement des activités. Veuillez réessayer.";
          setError(errorText);
        }
      } catch (error) {
        const errorText =
          language === "ar"
            ? "حدث خطأ في تحميل الأنشطة. حاول مرة أخرى."
            : "Erreur lors du chargement des activités. Veuillez réessayer.";
        setError(errorText);
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  };

  // Procesar actividades
  const actividadesProcesadas = actividades.map((actividad) => ({
    ...actividad,
    titulo: getText(actividad.titulo, language),
    descripcion: getText(actividad.descripcion, language),
    fecha: getText(actividad.fecha, language),
    duracion: getText(actividad.duracion, language),
    nivel: getText(actividad.nivel, language),
    categoria: actividad.categoria,
    imagen: actividad.imagen,
    cuposDisponibles: actividad.cuposDisponibles,
    enlace: `/reservation?activity=${actividad.id}`,
  }));

  // Filtrar actividades según la categoría seleccionada
  const actividadesFiltradas = actividadesProcesadas.filter((actividad) => {
    if (categoriaFiltro === "all") return true;
    return actividad.categoria === categoriaFiltro;
  });

  // Lista de categorías disponibles
  const categoriasDisponibles = [
    "all",
    "harvest",
    "workshop",
    "visit",
    "tasting",
    "educational",
    "family",
    "seasonal",
  ];

  if (loading) {
    return (
      <div className="py-12 px-4 max-w-7xl mx-auto">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2d5a27] mx-auto"></div>
          <p className="mt-4 text-gray-600">{t.loading}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 px-4 max-w-7xl mx-auto">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md mx-auto">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={handleRetry}
              className="px-6 py-2 bg-[#2d5a27] text-white rounded-lg hover:bg-green-800 transition"
            >
              {t.tryAgain}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="py-12 px-4 max-w-7xl mx-auto"
      dir={language === "ar" ? "rtl" : "ltr"}
    >
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
          {t.title}
        </h1>
        <p className="text-xl text-gray-600">{t.subtitle}</p>
      </div>

      {/* Filtros de categorías */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          {t.filterByCategory}
        </h2>
        <div className="flex flex-wrap gap-3">
          {categoriasDisponibles.map((categoria) => {
            // Obtener etiqueta traducida
            let label;
            switch (categoria) {
              case "all":
                label = t.all;
                break;
              case "harvest":
                label = t.harvest;
                break;
              case "workshop":
                label = t.workshop;
                break;
              case "visit":
                label = t.visit;
                break;
              case "tasting":
                label = t.tasting;
                break;
              case "educational":
                label = t.educational;
                break;
              case "family":
                label = t.family;
                break;
              case "seasonal":
                label = t.seasonal;
                break;
              default:
                label = categoria;
            }

            return (
              <button
                key={categoria}
                onClick={() => setCategoriaFiltro(categoria)}
                className={`px-6 py-2 rounded-full border-2 transition-colors ${
                  categoriaFiltro === categoria
                    ? "bg-[#2d5a27] border-[#2d5a27] text-white"
                    : "border-[#2d5a27] text-[#2d5a27] hover:bg-[#2d5a27] hover:text-white"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid de actividades */}
      {actividadesFiltradas.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-500">
            {actividades.length === 0
              ? t.noActivities
              : language === "ar"
              ? "لا توجد أنشطة في هذه الفئة حالياً"
              : "Aucune activité dans cette catégorie pour le moment"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {actividadesFiltradas.map((actividad) => (
            <ActividadCard key={actividad.id} actividad={actividad} />
          ))}
        </div>
      )}

      {/* Información adicional */}
      <div className="mt-16 p-8 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">{t.doubts}</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-bold text-gray-700 mb-4">
              {t.importantInfo}
            </h3>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span>{t.info1}</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span>{t.info2}</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span>{t.info3}</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span>{t.info4}</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span>{t.info5}</span>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-700 mb-4">
              {t.schedules}
            </h3>
            <p className="text-gray-600 mb-6">{t.scheduleText}</p>
            <Link
              href="/contacto"
              className="inline-block bg-[#2d5a27] text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-800 transition"
            >
              {t.contactForInfo}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
