"use client";

import { useState, useEffect } from "react";
import ActividadCard from "@/components/ActividadCard";
import CosechaCard from "@/components/CosechaCard";
import Calendario from "@/components/Calendario";
import AdminButton from "@/components/AdminButton";
import Link from "next/link";
import { useLanguage } from "@/components/LanguageContext";

// Función para obtener texto en el idioma correcto
const getText = (obj, language) => {
  if (!obj) return "";
  if (typeof obj === "string") return obj;
  if (typeof obj === "object") {
    return obj[language] || obj.ar || obj.fr || "";
  }
  return String(obj);
};

const textos = {
  ar: {
    title: "مزرعة المنصوري",
    subtitle: "تتواصل مع الطبيعة وتشارك في حصادنا وأنشطتنا الزراعية",
    seeActivities: "عرض الأنشطة المتاحة",
    contactNow: "اتصل الآن",
    upcomingActivities: "الأنشطة القادمة في المزرعة",
    seeAllActivities: "عرض جميع الأنشطة →",
    harvestStatus: "حالة المحاصيل الحالية",
    seeCalendar: "عرض التقويم الكامل →",
    calendarTitle: "تقويم الأنشطة",
    howItWorks: "كيف تعمل؟",
    step1: "استشارة التقويم",
    step1Desc: "تحقق من مواعيد الحصاد والأنشطة المجدولة للأسبوع",
    step2: "التسجيل عبر الإنترنت",
    step2Desc: "سجل بسهولة للمشاركة في الأنشطة التي تهمك",
    step3: "تعال إلى المزرعة",
    step3Desc: "شارك وتعلم الزراعة المستدامة وخذ المنتجات الطازجة معك",
    ctaText: "أكثر من 500 عائلة شاركت في أنشطتنا هذا العام!",
    wantToParticipate: "أريد المشاركة",
    reserveActivity: "احجز نشاطاً",
    viewProducts: "عرض المنتجات",
    farmLocation: "موقع المزرعة",
    openingHours: "ساعات العمل",
    contactInformation: "معلومات الاتصال",
    quickLinks: "روابط سريعة",
    loadingActivities: "جاري تحميل الأنشطة...",
    noFeaturedActivities: "لا توجد أنشطة حالياً",
    loadingHarvests: "جاري تحميل المحاصيل...",
    noHarvests: "لا توجد محاصيل حالياً",
    viewAllHarvests: "عرض جميع المحاصيل →",
  },
  fr: {
    title: "Ferme Al Manssouri",
    subtitle:
      "Connectez-vous avec la nature et participez à nos récoltes et activités agricoles",
    seeActivities: "Voir les activités disponibles",
    contactNow: "Contactez maintenant",
    upcomingActivities: "Activités à venir à la ferme",
    seeAllActivities: "Voir toutes les activités →",
    harvestStatus: "État actuel des récoltes",
    calendarTitle: "Calendrier des activités",
    howItWorks: "Comment ça fonctionne ?",
    step1: "Consultez le calendrier",
    step1Desc:
      "Vérifiez les dates de récolte et les activités planifiées pour la semaine",
    step2: "Inscrivez-vous en ligne",
    step2Desc:
      "Inscrivez-vous facilement pour participer aux activités qui vous intéressent",
    step3: "Venez à la ferme",
    step3Desc:
      "Participez, apprenez l'agriculture durable et emportez des produits frais",
    ctaText: "Plus de 500 familles ont participé à nos activités cette année!",
    wantToParticipate: "Je veux participer",
    reserveActivity: "Réserver une activité",
    viewProducts: "Voir les produits",
    farmLocation: "Emplacement de la ferme",
    openingHours: "Horaires d'ouverture",
    contactInformation: "Informations de contact",
    loadingActivities: "Chargement des activités...",
    noFeaturedActivities: "Aucune activité pour le moment",
    loadingHarvests: "Chargement des récoltes...",
    noHarvests: "Aucune récolte pour le moment",
    viewAllHarvests: "Voir toutes les récoltes →",
  },
};

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const { language } = useLanguage();

  const [actividadesProximas, setActividadesProximas] = useState([]);
  const [cosechasActuales, setCosechasActuales] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [loadingHarvests, setLoadingHarvests] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch actividades (próximas 4)
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoadingActivities(true);
        const response = await fetch("/api/activities?limit=4");
        if (response.ok) {
          const data = await response.json();
          setActividadesProximas(data.actividades || []);
        } else {
          console.error("Failed to fetch activities");
        }
      } catch (error) {
        console.error("Error fetching activities:", error);
      } finally {
        setLoadingActivities(false);
      }
    };

    fetchActivities();
  }, []);

  // Fetch cosechas (recientes 6)
  useEffect(() => {
    const fetchHarvests = async () => {
      try {
        setLoadingHarvests(true);
        const response = await fetch("/api/harvests");
        if (response.ok) {
          const data = await response.json();
          // Tomar solo las primeras 6 cosechas más recientes
          const recentHarvests = (data.harvests || []).slice(0, 6);
          setCosechasActuales(recentHarvests);
        } else {
          console.error("Failed to fetch harvests");
        }
      } catch (error) {
        console.error("Error fetching harvests:", error);
      } finally {
        setLoadingHarvests(false);
      }
    };

    fetchHarvests();
  }, []);

  // Durante SSR, usar francés como idioma por defecto
  if (!mounted) {
    const defaultT = textos["fr"];
    return (
      <div className="relative">
        {/* Hero Section */}
        <section className="relative h-[600px] bg-gradient-to-r from-[#2d5a27] to-emerald-800 overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-40"></div>
          <div className="relative z-10 flex flex-col items-center justify-center h-full text-white text-center px-4">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              {defaultT.title} <span className="text-yellow-400">🌱</span>
            </h1>
            <p className="text-xl md:text-2xl max-w-3xl mb-8">
              {defaultT.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/activities"
                className="bg-[#2d5a27] text-white px-8 py-4 rounded-lg font-semibold hover:bg-green-800 transition text-lg"
              >
                {defaultT.seeActivities}
              </Link>
              <Link
                href="/contacto"
                className="bg-yellow-500 text-white px-8 py-4 rounded-lg font-semibold hover:bg-orange-500 transition text-lg"
              >
                {defaultT.contactNow}
              </Link>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#e8f5e9] to-transparent"></div>
        </section>

        {/* Próximas Actividades - Placeholder */}
        <section className="py-16 px-4 max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
              {defaultT.upcomingActivities}
            </h2>
          </div>
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2d5a27] mx-auto"></div>
            <p className="mt-4 text-gray-600">{defaultT.loadingActivities}</p>
          </div>
        </section>

        {/* Estado de Cosechas - Placeholder */}
        <section className="py-16 px-4 bg-emerald-50">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
                {defaultT.harvestStatus}
              </h2>
            </div>
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2d5a27] mx-auto"></div>
              <p className="mt-4 text-gray-600">{defaultT.loadingHarvests}</p>
            </div>
          </div>
        </section>

        {/* Calendario de Actividades */}
        <section className="py-16 px-4 max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-12">
            {defaultT.calendarTitle}
          </h2>
          <div className="bg-white rounded-xl shadow-lg p-4 h-64 flex items-center justify-center">
            <p className="text-gray-500">
              Calendrier en cours de chargement...
            </p>
          </div>
        </section>

        {/* Comment ça fonctionne ? */}
        <section className="bg-[#2d5a27] text-white">
          <div className="max-w-7xl mx-auto px-4 py-16">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              {defaultT.howItWorks}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="text-center">
                <div className="text-5xl mb-4">📅</div>
                <h3 className="text-xl font-bold mb-4">1. {defaultT.step1}</h3>
                <p className="text-gray-200">{defaultT.step1Desc}</p>
              </div>
              <div className="text-center">
                <div className="text-5xl mb-4">📝</div>
                <h3 className="text-xl font-bold mb-4">2. {defaultT.step2}</h3>
                <p className="text-gray-200">{defaultT.step2Desc}</p>
              </div>
              <div className="text-center">
                <div className="text-5xl mb-4">👨‍🌾</div>
                <h3 className="text-xl font-bold mb-4">3. {defaultT.step3}</h3>
                <p className="text-gray-200">{defaultT.step3Desc}</p>
              </div>
            </div>
            <div className="text-center mb-8">
              <p className="text-xl mb-6">{defaultT.ctaText}</p>
              <Link
                href="/reservation"
                className="inline-block bg-white text-[#2d5a27] px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition"
              >
                {defaultT.wantToParticipate}
              </Link>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // Solo el cliente continúa aquí después de la hidratación
  const t = textos[language];

  // Procesar actividades
  const actividadesProcesadas = actividadesProximas.map((actividad) => ({
    ...actividad,
    titulo: getText(actividad.titulo, language),
    descripcion: getText(actividad.descripcion, language),
    fecha: getText(actividad.fecha, language),
    duracion: getText(actividad.duracion, language),
    nivel: getText(actividad.nivel, language),
    enlace: `/reservation?activity=${actividad.id}`,
  }));

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative h-[600px] bg-gradient-to-r from-[#2d5a27] to-emerald-800 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-white text-center px-4">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            {t.title} <span className="text-yellow-400">🌱</span>
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mb-8">{t.subtitle}</p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/activities"
              className="bg-[#2d5a27] text-white px-8 py-4 rounded-lg font-semibold hover:bg-green-800 transition text-lg"
            >
              {t.seeActivities}
            </Link>
            <Link
              href="/contacto"
              className="bg-yellow-500 text-white px-8 py-4 rounded-lg font-semibold hover:bg-orange-500 transition text-lg"
            >
              {t.contactNow}
            </Link>
          </div>
        </div>

        {/* Elementos decorativos */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#e8f5e9] to-transparent"></div>
      </section>

      {/* Próximas Actividades */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
            {t.upcomingActivities}
          </h2>
        </div>

        {loadingActivities ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2d5a27] mx-auto"></div>
            <p className="mt-4 text-gray-600">{t.loadingActivities}</p>
          </div>
        ) : actividadesProcesadas.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-500">{t.noFeaturedActivities}</p>
            <Link
              href="/activities"
              className="mt-4 inline-block text-[#2d5a27] font-semibold hover:underline"
            >
              {t.seeAllActivities}
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-8">
              {actividadesProcesadas.map((actividad) => (
                <ActividadCard key={actividad.id} actividad={actividad} />
              ))}
            </div>

            {/* Botón para ver más actividades */}
            <div className="text-center mt-12">
              <Link
                href="/activities"
                className="inline-block bg-[#2d5a27] text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-800 transition text-lg"
              >
                {language === "ar"
                  ? "عرض المزيد من الأنشطة"
                  : "Voir plus d'activités"}{" "}
                →
              </Link>
            </div>
          </>
        )}
      </section>

      {/* Estado de Cosechas */}
      <section className="py-16 px-4 bg-emerald-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
              {t.harvestStatus}
            </h2>
            <Link
              href="/cosechas"
              className="text-[#2d5a27] font-semibold hover:underline"
            >
              {t.viewAllHarvests}
            </Link>
          </div>

          {loadingHarvests ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2d5a27] mx-auto"></div>
              <p className="mt-4 text-gray-600">{t.loadingHarvests}</p>
            </div>
          ) : cosechasActuales.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl text-gray-500">{t.noHarvests}</p>
              <Link
                href="/cosechas"
                className="mt-4 inline-block text-[#2d5a27] font-semibold hover:underline"
              >
                {t.viewAllHarvests}
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
              {cosechasActuales.map((cosecha) => (
                <div key={cosecha.id} className="h-full">
                  <div className="bg-white rounded-xl shadow-lg p-4 hover:shadow-xl transition-shadow h-full flex flex-col">
                    {/* Icono y título */}
                    <div className="flex items-start mb-3">
                      <div className="text-3xl mr-3 flex-shrink-0">
                        {cosecha.icon || "🌱"}
                      </div>
                      <div className="flex-grow">
                        <h3 className="font-bold text-gray-800">
                          {language === "ar"
                            ? cosecha.productAr
                            : cosecha.productFr}
                        </h3>
                      </div>
                    </div>

                    {/* Estado */}
                    <div className="mb-3">
                      <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {language === "ar"
                          ? cosecha.statusAr || "غير محدد"
                          : cosecha.statusFr || "Non spécifié"}
                      </span>
                    </div>

                    {/* Detalles */}
                    <div className="space-y-2 text-sm flex-grow">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">
                          {language === "ar" ? "الموسم" : "Saison"}
                        </span>
                        <span className="font-medium">
                          {cosecha.season || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Calendario de Actividades */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-12">
          {t.calendarTitle}
        </h2>
        <Calendario />
      </section>

      {/* Comment ça fonctionne ? */}
      <section className="bg-[#2d5a27] text-white">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            {t.howItWorks}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="text-5xl mb-4">📅</div>
              <h3 className="text-xl font-bold mb-4">1. {t.step1}</h3>
              <p className="text-gray-200">{t.step1Desc}</p>
            </div>

            <div className="text-center">
              <div className="text-5xl mb-4">📝</div>
              <h3 className="text-xl font-bold mb-4">2. {t.step2}</h3>
              <p className="text-gray-200">{t.step2Desc}</p>
            </div>

            <div className="text-center">
              <div className="text-5xl mb-4">👨‍🌾</div>
              <h3 className="text-xl font-bold mb-4">3. {t.step3}</h3>
              <p className="text-gray-200">{t.step3Desc}</p>
            </div>
          </div>

          <div className="text-center mb-8">
            <p className="text-xl mb-6">{t.ctaText}</p>
            <Link
              href="/reservation"
              className="inline-block bg-white text-[#2d5a27] px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition"
            >
              {t.wantToParticipate}
            </Link>
          </div>

          <div className="border-t border-green-600 pt-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-xl font-bold mb-4">{t.farmLocation}</h3>
                <p className="text-gray-200">Chemin du Jardin, 123</p>
                <p className="text-gray-200">Village Vert, Valence</p>
                <p className="text-gray-200">Code Postal: 46100</p>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-4">{t.openingHours}</h3>
                <p className="text-gray-200">Lundi - Vendredi: 9h - 18h</p>
                <p className="text-gray-200">Samedi: 10h - 14h</p>
                <p className="text-gray-200">Dimanche: Fermé</p>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-4">
                  {t.contactInformation}
                </h3>
                <p className="text-gray-200">📞 +212 612 345 678</p>
                <p className="text-gray-200">✉️ info@fermealmanssouri.com</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
