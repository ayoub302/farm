"use client";

import Link from "next/link";
import { useLanguage } from "@/components/LanguageContext";
import { FaEnvelope, FaPhone, FaMapMarkerAlt } from "react-icons/fa";

// Constante para detectar si estamos en el cliente
const isClient = typeof window !== "undefined";

// Coordenadas aproximadas de Ferme Caïd Mansouri, Douar Alhamri, Berkane
const GOOGLE_MAPS_URL =
  "https://www.google.com/maps?q=Ferme+Caïd+Mansouri,+Douar+Alhamri,+Berkane,+Morocco";

const QUICK_LINKS = [
  { key: "activities", href: "/activities" },
  { key: "harvestCalendar", href: "/cosechas" },
  { key: "reservationsContact", href: "/contacto" },
  { key: "faq", href: "#" },
  { key: "giftExperiences", href: "#" },
];

const LEGAL_LINKS = [
  { key: "legalNotice", href: "#" },
  { key: "privacyPolicy", href: "#" },
  { key: "cookiePolicy", href: "#" },
];

const textos = {
  ar: {
    title: "مزرعة المنصوري",
    description:
      "زراعة عضوية، تجارب تعليمية ومنتجات طازجة مباشرة من الحقل إلى مائدتك.",
    quickLinks: "روابط سريعة",
    activitiesAvailable: "الأنشطة المتاحة",
    harvestCalendar: "تقويم المحاصيل",
    reservationsContact: "الحجوزات والاتصال",
    faq: "الأسئلة المتكررة",
    giftExperiences: "هدايا التجارب",
    contact: "اتصل بنا",
    address: {
      farm: "مزرعة القايد المنصوري",
      douar: "دوار الحمري",
      commune: "جماعة بوغريبة",
      province: "إقليم بركان",
      postal: "الرمز البريدي: 60000",
      openInMaps: "افتح في خرائط جوجل",
    },
    phone: "+212 661 105 373",
    email: "n_bachiri@hotmail.com",
    rights: `© ${new Date().getFullYear()} مزرعة المنصوري. جميع الحقوق محفوظة.`,
    legalNotice: "إشعار قانوني",
    privacyPolicy: "سياسة الخصوصية",
    cookiePolicy: "سياسة ملفات تعريف الارتباط",
  },
  fr: {
    title: "Ferme Al Manssouri",
    description:
      "Agriculture biologique, expériences éducatives et produits frais directement du champ à votre table.",
    quickLinks: "Liens rapides",
    activitiesAvailable: "Activités disponibles",
    harvestCalendar: "Calendrier des récoltes",
    reservationsContact: "Réservations et contact",
    contact: "Contact",
    address: {
      farm: "Ferme Caïd Mansouri",
      douar: "Douar Alhamri",
      commune: "Commune de Boughriba",
      province: "Province de Berkane",
      postal: "Code Postal: 60000",
      openInMaps: "Ouvrir dans Google Maps",
    },
    phone: "+212 661 105 373",
    email: "n_bachiri@hotmail.com",
    rights: `© ${new Date().getFullYear()} Ferme Al Manssouri. Tous droits réservés.`,
    legalNotice: "Mentions légales",
    privacyPolicy: "Politique de confidentialité",
    cookiePolicy: "Politique de cookies",
  },
};

// Componente de dirección reutilizable
const AddressSection = ({ t }) => (
  <a
    href={GOOGLE_MAPS_URL}
    target="_blank"
    rel="noopener noreferrer"
    className="text-gray-300 hover:text-white transition group"
  >
    <div className="flex flex-col">
      <span className="font-medium group-hover:text-green-400 transition">
        {t.address.farm}
      </span>
      <span>{t.address.douar}</span>
      <span>{t.address.commune}</span>
      <span>{t.address.province}</span>
      <span className="font-medium mt-1">{t.address.postal}</span>
      <span className="inline-flex items-center mt-2 text-green-400 font-medium text-sm group-hover:underline">
        <span className="mr-1">📍</span>
        {t.address.openInMaps}
        <span className="ml-1">↗</span>
      </span>
    </div>
  </a>
);

// Componente de enlaces rápidos
const QuickLinks = ({ t }) => (
  <ul className="space-y-3">
    {QUICK_LINKS.map(({ key, href }) => (
      <li key={key}>
        <Link
          href={href}
          className="text-gray-300 hover:text-white hover:underline transition-colors"
        >
          {t[key]}
        </Link>
      </li>
    ))}
  </ul>
);

// Componente de información de contacto
const ContactInfo = ({ t }) => (
  <ul className="space-y-4">
    <li className="flex items-start">
      <FaMapMarkerAlt className="text-yellow-400 mr-3 mt-1 flex-shrink-0" />
      <AddressSection t={t} />
    </li>
    <li className="flex items-center">
      <FaPhone className="text-yellow-400 mr-3 flex-shrink-0" />
      <a
        href={`tel:${t.phone.replace(/\s/g, "")}`}
        className="text-gray-300 hover:text-white hover:underline transition"
      >
        {t.phone}
      </a>
    </li>
    <li className="flex items-center">
      <FaEnvelope className="text-yellow-400 mr-3 flex-shrink-0" />
      <a
        href={`mailto:${t.email}`}
        className="text-gray-300 hover:text-white hover:underline transition"
      >
        {t.email}
      </a>
    </li>
  </ul>
);

// Componente principal del Footer
export default function Footer() {
  const { language } = useLanguage();
  const currentLanguage = isClient ? language : "fr";
  const t = textos[currentLanguage];

  return (
    <footer
      className="bg-gray-900 text-white"
      dir={currentLanguage === "ar" ? "rtl" : "ltr"}
    >
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Grid principal */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Columna 1: Información */}
          <div>
            <h3 className="text-2xl font-bold mb-4 flex items-center">
              <span className="text-yellow-400 mr-2">🌱</span>
              {t.title}
            </h3>
            <p className="text-gray-300">{t.description}</p>
          </div>

          {/* Columna 2: Enlaces rápidos */}
          <div>
            <h4 className="text-xl font-bold mb-6">{t.quickLinks}</h4>
            <QuickLinks t={t} />
          </div>

          {/* Columna 3: Contacto */}
          <div>
            <h4 className="text-xl font-bold mb-6">{t.contact}</h4>
            <ContactInfo t={t} />
          </div>
        </div>

        {/* Línea divisoria */}
        <div className="border-t border-gray-800 my-8"></div>

        {/* Pie inferior */}
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">{t.rights}</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            {LEGAL_LINKS.map(({ key, href }) => (
              <Link
                key={key}
                href={href}
                className="text-gray-400 hover:text-white text-sm transition"
              >
                {t[key]}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
