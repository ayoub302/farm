"use client";

import { useState, useEffect, useCallback } from "react";
import CosechaCard from "@/components/CosechaCard";
import Link from "next/link";
import { useLanguage } from "@/components/LanguageContext";

const textos = {
  ar: {
    pageTitle: "تقويم المحاصيل",
    pageSubtitle:
      "تحقق من المنتجات التي نحصدها كل شهر. خطط لزيارتك وفقًا لما يهمك أكثر.",
    cosechasDe: "محاصيل",
    comoFuncionan: "كيف تعمل محاصيلنا؟",
    point1: "جميع محاصيلنا عضوية ومستدامة",
    point2: "يمكن للزوار المشاركة في المحاصيل المجدولة",
    point3: "تأخذ معك جزءًا مما تحصد (حسب النشاط)",
    point4: "تتعلم عن الزراعة المستدامة وتقنيات الزراعة",
    consejosVisita: "نصائح للزيارة",
    consejo1: "ارتدِ ملابس مريحة يمكن أن تتسخ",
    consejo2: "أحذية مغلقة ومناسبة للحقل",
    consejo3: "واقي الشمس وقبعة في الأيام المشمسة",
    consejo4: "احضر ماءً للحفاظ على رطوبتك",
    participarTitle: "هل تريد المشاركة في محاصيلنا؟",
    participarText:
      "انضم إلى أنشطتنا وخذ المنتجات الطازجة معك إلى المنزل، محصودة حديثًا.",
    verActividades: "عرض الأنشطة المتاحة",
    contactarGrupos: "الاتصال للمجموعات",
    sinCosechas: "لا توجد محاصيل مجدولة لهذا الشهر بعد.",
    mensajeAdmin: "سيتم إضافة المحاصيل قريباً من خلال لوحة التحكم.",
    loading: "جاري تحميل المحاصيل...",
    error: "حدث خطأ في تحميل المحاصيل. يرجى المحاولة مرة أخرى.",
    tryAgain: "حاول مرة أخرى →",
    noHarvestsThisMonth: "لا توجد محاصيل لهذا الشهر",
    viewAllHarvests: "عرض جميع المحاصيل",
  },
  fr: {
    pageTitle: "Calendrier des récoltes",
    pageSubtitle:
      "Consultez les produits que nous récoltons chaque mois. Planifiez votre visite selon ce qui vous intéresse le plus.",
    cosechasDe: "Récoltes de",
    comoFuncionan: "Comment fonctionnent nos récoltes?",
    point1: "Toutes nos récoltes sont biologiques et durables",
    point2: "Les visiteurs peuvent participer aux récoltes programmées",
    point3:
      "Vous emportez une partie de ce que vous récoltez (selon l'activité)",
    point4:
      "Vous apprenez sur l'agriculture durable et les techniques de culture",
    consejosVisita: "Conseils pour la visite",
    consejo1: "Portez des vêtements confortables qui peuvent se salir",
    consejo2: "Chaussures fermées et adaptées à la campagne",
    consejo3: "Crème solaire et casquette les jours ensoleillés",
    consejo4: "Apportez de l'eau pour rester hydraté",
    participarTitle: "Voulez-vous participer à nos récoltes?",
    participarText:
      "Rejoignez nos activités et emportez chez vous des produits frais, récemment récoltés.",
    verActividades: "Voir les activités disponibles",
    contactarGrupos: "Contacter pour les groupes",
    sinCosechas: "Aucune récolte programmée pour ce mois pour le moment.",
    mensajeAdmin:
      "Les récoltes seront ajoutées prochainement via le tableau de bord.",
    loading: "Chargement des récoltes...",
    error: "Erreur lors du chargement des récoltes. Veuillez réessayer.",
    tryAgain: "Réessayer →",
    noHarvestsThisMonth: "Aucune récolte ce mois-ci",
    viewAllHarvests: "Voir toutes les récoltes",
  },
};

const meses = {
  ar: [
    "يناير",
    "فبراير",
    "مارس",
    "أبريل",
    "مايو",
    "يونيو",
    "يوليو",
    "أغسطس",
    "سبتمبر",
    "أكتوبر",
    "نوفمبر",
    "ديسمبر",
  ],
  fr: [
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre",
  ],
};

export default function CosechasPage() {
  const { language } = useLanguage();
  const t = textos[language];
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cosechas, setCosechas] = useState([]);
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  // Estado para el mes seleccionado - usar un valor fijo inicial basado en el idioma actual
  const [mesSeleccionado, setMesSeleccionado] = useState(
    `${meses[language][currentMonth]} ${currentYear}`
  );

  // Función fetchHarvests con useCallback para evitar dependencias circulares
  const fetchHarvests = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch("/api/harvests");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (response.ok) {
        setCosechas(data.harvests || []);
      } else {
        setError(data.error || t.error);
      }
    } catch (err) {
      console.error("Error fetching harvests:", err);
      setError(t.error);
    } finally {
      setLoading(false);
    }
  }, [t.error]);

  // Efecto para sincronizar el mes seleccionado cuando cambia el idioma
  useEffect(() => {
    setMesSeleccionado(`${meses[language][currentMonth]} ${currentYear}`);
  }, [language, currentMonth, currentYear]);

  // Efecto para cargar las cosechas
  useEffect(() => {
    fetchHarvests();
  }, [fetchHarvests]);

  // Filtrar cosechas por mes seleccionado
  const cosechasDelMes = cosechas.filter((harvest) => {
    if (!harvest?.nextHarvest) return false;

    try {
      const harvestDate = new Date(harvest.nextHarvest);
      const harvestMonth = harvestDate.getMonth();
      const harvestYear = harvestDate.getFullYear();

      // Extraer el mes del string seleccionado
      const selectedMonthString = mesSeleccionado.split(" ")[0];
      const selectedMonthIndex = meses[language].indexOf(selectedMonthString);

      // También verificar el año
      return harvestMonth === selectedMonthIndex && harvestYear === currentYear;
    } catch (error) {
      console.error("Error processing harvest date:", error);
      return false;
    }
  });

  // Crear array de meses con año actual
  const mesesConAno = meses[language].map((mes) => `${mes} ${currentYear}`);

  return (
    <div
      className="min-h-screen py-12 px-4 max-w-7xl mx-auto"
      dir={language === "ar" ? "rtl" : "ltr"}
    >
      <div className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
          {t.pageTitle}
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          {t.pageSubtitle}
        </p>
      </div>

      {/* Selector de meses */}
      <div className="mb-12">
        <div className="flex flex-wrap justify-center gap-3">
          {mesesConAno.map((mes) => (
            <button
              key={mes}
              onClick={() => setMesSeleccionado(mes)}
              className={`px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-semibold transition-colors whitespace-nowrap ${
                mesSeleccionado === mes
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {mes}
            </button>
          ))}
        </div>
      </div>

      {/* Cosechas del mes seleccionado */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          {t.cosechasDe} {mesSeleccionado}
        </h2>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">{t.loading}</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 bg-red-50 rounded-2xl">
            <div className="text-5xl mb-4">❌</div>
            <h3 className="text-xl font-semibold text-red-700 mb-2">{error}</h3>
            <button
              onClick={fetchHarvests}
              className="mt-4 text-sm text-green-600 hover:underline font-medium"
            >
              {t.tryAgain}
            </button>
          </div>
        ) : cosechasDelMes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {cosechasDelMes.map((cosecha) => (
              <CosechaCard
                key={cosecha.id}
                cosecha={cosecha}
                language={language}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-2xl">
            <div className="text-5xl mb-4">🌱</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {t.noHarvestsThisMonth}
            </h3>
            <p className="text-gray-500 mb-6">{t.mensajeAdmin}</p>
            <div className="space-y-4">
              <button
                onClick={fetchHarvests}
                className="block mx-auto text-sm text-green-600 hover:underline font-medium"
              >
                {t.tryAgain}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Información sobre las cosechas */}
      <div className="grid md:grid-cols-2 gap-8 mb-16">
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">
            {t.comoFuncionan}
          </h3>
          <ul className="space-y-4 text-gray-600">
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>{t.point1}</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>{t.point2}</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>{t.point3}</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>{t.point4}</span>
            </li>
          </ul>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-8 rounded-2xl">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">
            {t.consejosVisita}
          </h3>
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="bg-green-600 text-white p-2 rounded-lg mr-4">
                👕
              </div>
              <p className="text-gray-700">{t.consejo1}</p>
            </div>
            <div className="flex items-center">
              <div className="bg-green-600 text-white p-2 rounded-lg mr-4">
                👟
              </div>
              <p className="text-gray-700">{t.consejo2}</p>
            </div>
            <div className="flex items-center">
              <div className="bg-green-600 text-white p-2 rounded-lg mr-4">
                🧴
              </div>
              <p className="text-gray-700">{t.consejo3}</p>
            </div>
            <div className="flex items-center">
              <div className="bg-green-600 text-white p-2 rounded-lg mr-4">
                💧
              </div>
              <p className="text-gray-700">{t.consejo4}</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center p-8 bg-gradient-to-r from-green-600 to-emerald-700 rounded-2xl text-white">
        <h2 className="text-3xl font-bold mb-6">{t.participarTitle}</h2>
        <p className="text-xl mb-8 max-w-2xl mx-auto">{t.participarText}</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/actividades"
            className="bg-white text-green-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition"
          >
            {t.verActividades}
          </Link>
          <Link
            href="/contacto"
            className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white hover:text-green-600 transition"
          >
            {t.contactarGrupos}
          </Link>
        </div>
      </div>
    </div>
  );
}
