"use client";

import Link from "next/link";
import { useLanguage } from "@/components/LanguageContext";
import {
  FaFacebook,
  FaInstagram,
  FaYoutube,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
} from "react-icons/fa";

// Constante para detectar si estamos en el cliente
const isClient = typeof window !== "undefined";

export default function Footer() {
  const { language } = useLanguage();

  // Idioma para SSR (francés) y para cliente (idioma real del usuario)
  const currentLanguage = isClient ? language : "fr";

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
      address: "طريق الحديقة، 123\nالقرية الخضراء، بلنسية",
      phone: "96 123 45 67",
      email: "info@granjalahuertafeliz.com",
      newsletter: "النشرة الإخبارية",
      newsletterText: "اشترك لتلقي أخبار عن المحاصيل والأنشطة.",
      emailPlaceholder: "بريدك الإلكتروني",
      subscribe: "اشتراك",
      rights: `© ${new Date().getFullYear()} مزرعة المنصوري . جميع الحقوق محفوظة.`,
      legalNotice: "إشعار قانوني",
      privacyPolicy: "سياسة الخصوصية",
      cookiePolicy: "سياسة ملفات تعريف الارتباط",
    },
    fr: {
      title: "Ferme Al Manssouri",
      description:
        "Agriculture biologique, expériences éducatives et produits frais directement du champ à votre table.",
      activitiesAvailable: "Activités disponibles",
      harvestCalendar: "Calendrier des récoltes",
      reservationsContact: "Réservations et contact",
      faq: "Questions fréquentes",
      giftExperiences: "Cadeaux d'expériences",
      contact: "Contact",
      address: "Chemin du Jardin, 123\nVillage Vert, Valence",
      phone: "96 123 45 67",
      email: "info@granjalahuertafeliz.com",
      newsletter: "Newsletter",
      newsletterText:
        "Abonnez-vous pour recevoir des nouvelles sur les récoltes et activités.",
      emailPlaceholder: "Votre email",
      subscribe: "S'abonner",
      rights: `© ${new Date().getFullYear()} Ferme Al Manssouri. Tous droits réservés.`,
      legalNotice: "Mentions légales",
      privacyPolicy: "Politique de confidentialité",
      cookiePolicy: "Politique de cookies",
    },
  };

  const t = textos[currentLanguage];

  return (
    <footer
      className="bg-gray-900 text-white"
      dir={currentLanguage === "ar" ? "rtl" : "ltr"}
    >
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Columna 1: Información */}
          <div>
            <h3 className="text-2xl font-bold mb-4 flex items-center">
              <span className="text-yellow-400 mr-2">🌱</span>
              {t.title}
            </h3>
            <p className="text-gray-300 mb-6">{t.description}</p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="bg-gray-800 p-2 rounded-full hover:bg-green-600 transition"
                aria-label={currentLanguage === "ar" ? "فيسبوك" : "Facebook"}
              >
                <FaFacebook className="text-xl" />
              </a>
              <a
                href="#"
                className="bg-gray-800 p-2 rounded-full hover:bg-green-600 transition"
                aria-label={currentLanguage === "ar" ? "إنستغرام" : "Instagram"}
              >
                <FaInstagram className="text-xl" />
              </a>
              <a
                href="#"
                className="bg-gray-800 p-2 rounded-full hover:bg-green-600 transition"
                aria-label={currentLanguage === "ar" ? "يوتيوب" : "YouTube"}
              >
                <FaYoutube className="text-xl" />
              </a>
            </div>
          </div>

          {/* Columna 2: Enlaces rápidos */}
          <div>
            <h4 className="text-xl font-bold mb-6">{t.quickLinks}</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/actividades"
                  className="text-gray-300 hover:text-white hover:underline"
                >
                  {t.activitiesAvailable}
                </Link>
              </li>
              <li>
                <Link
                  href="/cosechas"
                  className="text-gray-300 hover:text-white hover:underline"
                >
                  {t.harvestCalendar}
                </Link>
              </li>
              <li>
                <Link
                  href="/contacto"
                  className="text-gray-300 hover:text-white hover:underline"
                >
                  {t.reservationsContact}
                </Link>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-white hover:underline"
                >
                  {t.faq}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-white hover:underline"
                >
                  {t.giftExperiences}
                </a>
              </li>
            </ul>
          </div>

          {/* Columna 3: Contacto */}
          <div>
            <h4 className="text-xl font-bold mb-6">{t.contact}</h4>
            <ul className="space-y-4">
              <li className="flex items-center">
                <FaMapMarkerAlt className="text-yellow-400 mr-3" />
                <span className="text-gray-300 whitespace-pre-line">
                  {t.address}
                </span>
              </li>
              <li className="flex items-center">
                <FaPhone className="text-yellow-400 mr-3" />
                <span className="text-gray-300">{t.phone}</span>
              </li>
              <li className="flex items-center">
                <FaEnvelope className="text-yellow-400 mr-3" />
                <span className="text-gray-300">{t.email}</span>
              </li>
            </ul>
          </div>

          {/* Columna 4: Newsletter */}
          <div>
            <h4 className="text-xl font-bold mb-6">{t.newsletter}</h4>
            <p className="text-gray-300 mb-4">{t.newsletterText}</p>
            <form className="space-y-3">
              <input
                type="email"
                placeholder={t.emailPlaceholder}
                className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-green-600"
              />
              <button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-800 text-white font-semibold py-3 rounded-lg transition"
              >
                {t.subscribe}
              </button>
            </form>
          </div>
        </div>

        {/* Línea divisoria */}
        <div className="border-t border-gray-800 my-8"></div>

        {/* Pie inferior */}
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">{t.rights}</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="#" className="text-gray-400 hover:text-white text-sm">
              {t.legalNotice}
            </Link>
            <Link href="#" className="text-gray-400 hover:text-white text-sm">
              {t.privacyPolicy}
            </Link>
            <Link href="#" className="text-gray-400 hover:text-white text-sm">
              {t.cookiePolicy}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
