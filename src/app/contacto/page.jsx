"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/components/LanguageContext";
import {
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaPaperPlane,
  FaHome,
} from "react-icons/fa";

const textos = {
  ar: {
    pageTitle: "اتصل بنا",
    pageSubtitle: "لديك استفسار؟ تريد معلومات؟ اكتب لنا وسنرد عليك قريباً",
    contactInfo: "معلومات الاتصال",
    addressTitle: "العنوان",
    address: "طريق الحديقة، 123\nالقرية الخضراء، بلنسية\nالرمز البريدي: 46100",
    viewOnMaps: "عرض على خرائط Google ←",
    phoneTitle: "هاتف",
    hours: "من الاثنين إلى الجمعة: 9:00 - 18:00",
    emailTitle: "البريد الإلكتروني",
    responseTime: "نرد في أقل من 24 ساعة",
    visitHoursTitle: "ساعات الزيارة",
    weekendHours: "عطلات نهاية الأسبوع: 10:00 - 14:00 و 16:00 - 19:00",
    weekdaysHours: "أيام الأسبوع: فقط بحجز مسبق",
    groupsHours: "المجموعات: متاح أي يوم مع حجز",
    faqTitle: "الأسئلة المتكررة",
    faq1: {
      q: "كم من الوقت يستغرق الرد؟",
      a: "نرد على جميع الاستفسارات خلال 24 ساعة.",
    },
    faq2: {
      q: "هل يمكنني الاتصال خارج ساعات العمل؟",
      a: "نعم، اترك رسالة وسنتصل بك في أقرب وقت.",
    },
    faq3: {
      q: "هل تقدمون معلومات بالبريد العادي؟",
      a: "نعم، يمكننا إرسال كتيبات معلوماتية.",
    },
    sendMessage: "أرسل لنا رسالة",
    fullName: "الاسم الكامل *",
    email: "البريد الإلكتروني *",
    phone: "رقم الهاتف *",
    message: "رسالتك *",
    placeholderName: "أدخل اسمك الكامل",
    placeholderEmail: "example@email.com",
    placeholderPhone: "+212 612345678",
    phoneNote: "يجب أن يبدأ بـ +212 ويتبع بـ 9 أرقام",
    placeholderMessage: "اكتب رسالتك هنا...",
    note: "جميع الحوامل مطلوبة. سنرد عليك في غضون 24 ساعة.",
    send: "إرسال الرسالة",
    sending: "جاري الإرسال...",
    sendingAnimation: "جاري إرسال رسالتك...",
    successMessage: "✅ تم إرسال رسالتك بنجاح!",
    successDetails: "سنرد عليك في أقرب وقت ممكن.",
    errorMessage: "حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة مرة أخرى.",
    validationError: "يرجى ملء جميع الحقول المطلوبة.",
    phoneValidationError:
      "رقم الهاتف غير صحيح. يجب أن يكون +212 متبوعاً بـ 9 أرقام.",
    messageSent: "🎉 تم الإرسال!",
    contactSoon: "سنقوم بالاتصال بك قريباً.",
    sendAnother: "إرسال رسالة أخرى",
    backToHome: "العودة إلى الصفحة الرئيسية",
    whatHappensNext: "ماذا يحدث بعد الآن؟",
    nextStep1: "سنراجع رسالتك خلال 24 ساعة",
    nextStep2: "سنتصل بك على الرقم الذي قدمته",
    nextStep3: "سنرسل تأكيداً إلى بريدك الإلكتروني",
    needReservation: "هل تريد حجز زيارة؟",
    goToReservation: "اذهب إلى نموذج الحجز →",
  },
  fr: {
    pageTitle: "Contactez-nous",
    pageSubtitle:
      "Une question? Besoin d'informations? Écrivez-nous et nous vous répondrons rapidement.",
    contactInfo: "Informations de contact",
    addressTitle: "Adresse",
    address:
      "Ferme Caïd Mansouri, Douar Alhamri, Commune de Boughriba\n, Province de Berkane, \nCode Postal: 60000",
    viewOnMaps: "Voir sur Google Maps →",
    phoneTitle: "Téléphone",
    hours: "Du lundi au vendredi: 9:00 - 18:00",
    emailTitle: "Email",
    responseTime: "Nous répondons en moins de 24 heures",
    visitHoursTitle: "Horaires de visite",
    weekendHours: "Week-ends: 10:00 - 14:00 et 16:00 - 19:00",
    weekdaysHours: "Semaine: Uniquement sur réservation",
    groupsHours: "Groupes: Disponible tous les jours sur réservation",
    faqTitle: "Questions fréquentes",
    faq1: {
      q: "Combien de temps pour une réponse?",
      a: "Nous répondons à toutes les demandes dans les 24 heures.",
    },
    faq2: {
      q: "Puis-je appeler en dehors des heures d'ouverture?",
      a: "Oui, laissez un message et nous vous rappellerons.",
    },
    faq3: {
      q: "Envoyez-vous des informations par courrier?",
      a: "Oui, nous pouvons envoyer des brochures.",
    },
    sendMessage: "Envoyez-nous un message",
    fullName: "Nom complet *",
    email: "Email *",
    phone: "Téléphone *",
    message: "Votre message *",
    placeholderName: "Entrez votre nom complet",
    placeholderEmail: "exemple@email.com",
    placeholderPhone: "+212 612345678",
    phoneNote: "Doit commencer par +212 suivi de 9 chiffres",
    placeholderMessage: "Écrivez votre message ici...",
    note: "Tous les champs sont obligatoires. Nous répondrons dans les 24 heures.",
    send: "Envoyer le message",
    sending: "Envoi en cours...",
    sendingAnimation: "Envoi de votre message...",
    successMessage: "✅ Votre message a été envoyé avec succès!",
    successDetails: "Nous vous répondrons dès que possible.",
    errorMessage:
      "Une erreur s'est produite lors de l'envoi. Veuillez réessayer.",
    validationError: "Veuillez remplir tous les champs obligatoires.",
    phoneValidationError:
      "Numéro de téléphone invalide. Doit être +212 suivi de 9 chiffres.",
    messageSent: "🎉 Message envoyé!",
    contactSoon: "Nous vous contacterons bientôt.",
    sendAnother: "Envoyer un autre message",
    backToHome: "Retour à l'accueil",
    whatHappensNext: "Que se passe-t-il ensuite?",
    nextStep1: "Nous examinerons votre message sous 24 heures",
    nextStep2: "Nous vous appellerons au numéro fourni",
    nextStep3: "Nous enverrons une confirmation à votre email",
    needReservation: "Voulez-vous réserver une visite?",
    goToReservation: "Aller au formulaire de réservation →",
  },
};

export default function ContactoPage() {
  const { language } = useLanguage();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const t = textos[language];

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "+212 ",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({
    type: "", // "success", "error", "loading"
    message: "",
    details: "",
  });

  const validatePhone = (phone) => {
    // Debe comenzar con +212 y tener exactamente 9 dígitos adicionales
    const phoneRegex = /^\+212\s?\d{9}$/;
    return phoneRegex.test(phone.replace(/\s/g, ""));
  };

  const handlePhoneChange = (e) => {
    let value = e.target.value;

    // Asegurarse de que comience con +212
    if (!value.startsWith("+212")) {
      value = "+212 " + value.replace(/^\+212\s?/, "");
    }

    // Limitar a +212 + 9 dígitos + espacios opcionales
    const digits = value.replace(/[^\d]/g, "");
    if (digits.length <= 12) {
      // +212 (3) + 9 dígitos
      setFormData((prev) => ({
        ...prev,
        phone: value,
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      handlePhoneChange(e);
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Limpiar estado de error si el usuario comienza a editar
    if (submitStatus.type === "error") {
      setSubmitStatus({ type: "", message: "", details: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar campos requeridos
    if (
      !formData.name ||
      !formData.email ||
      !formData.phone ||
      !formData.message
    ) {
      setSubmitStatus({
        type: "error",
        message: t.validationError,
        details: "",
      });
      return;
    }

    // Validar teléfono
    if (!validatePhone(formData.phone)) {
      setSubmitStatus({
        type: "error",
        message: t.phoneValidationError,
        details: t.phoneNote,
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus({
      type: "loading",
      message: t.sendingAnimation,
      details: "",
    });

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.replace(/\s/g, ""), // Quitar espacios
          subject: "Contact Form Inquiry",
          message: formData.message.trim(),
          source: "contact_form",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t.errorMessage);
      }

      // Éxito
      setSubmitStatus({
        type: "success",
        message: t.successMessage,
        details: t.successDetails,
      });
    } catch (error) {
      console.error("Error sending message:", error);
      setSubmitStatus({
        type: "error",
        message: t.errorMessage,
        details: error.message || t.errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubmitStatus({ type: "", message: "", details: "" });
    setFormData({
      name: "",
      email: "",
      phone: "+212 ",
      message: "",
    });
  };

  // Página de confirmación
  if (submitStatus.type === "success") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-green-50 to-emerald-50 px-4 py-12">
        <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center">
          <div className="mb-6">
            <div className="w-24 h-24 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <FaCheckCircle className="text-white text-5xl" />
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            {isClient ? t.messageSent : ""}
          </h1>

          <p className="text-2xl text-emerald-600 font-semibold mb-6">
            {isClient ? t.successMessage : ""}
          </p>

          <div className="bg-gradient-to-r from-green-50 to-emerald-100 rounded-2xl p-6 mb-8">
            <p className="text-gray-700 text-lg mb-4">
              {isClient ? t.contactSoon : ""}
            </p>
          </div>

          <div className="mb-10 text-left">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {isClient ? t.whatHappensNext : ""}
            </h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <div className="bg-emerald-100 p-2 rounded-full mr-4">
                  <span className="text-emerald-600 font-bold">1</span>
                </div>
                <p className="text-gray-700">{isClient ? t.nextStep1 : ""}</p>
              </div>
              <div className="flex items-center">
                <div className="bg-emerald-100 p-2 rounded-full mr-4">
                  <span className="text-emerald-600 font-bold">2</span>
                </div>
                <p className="text-gray-700">{isClient ? t.nextStep2 : ""}</p>
              </div>
              <div className="flex items-center">
                <div className="bg-emerald-100 p-2 rounded-full mr-4">
                  <span className="text-emerald-600 font-bold">3</span>
                </div>
                <p className="text-gray-700">{isClient ? t.nextStep3 : ""}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={resetForm}
              className="px-6 py-4 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl flex items-center justify-center font-bold text-lg"
            >
              <FaPaperPlane className="mr-3" />
              {isClient ? t.sendAnother : ""}
            </button>

            <Link
              href="/"
              className="px-6 py-4 bg-gray-100 text-gray-800 rounded-xl hover:bg-gray-200 transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl flex items-center justify-center font-bold text-lg"
            >
              <FaHome className="mr-3" />
              {isClient ? t.backToHome : ""}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 px-4 max-w-7xl mx-auto min-h-screen">
      <div className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
          {isClient ? t.pageTitle : ""}
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          {isClient ? t.pageSubtitle : ""}
        </p>

        {/* Enlace a reservas */}
        <div className="mt-6">
          <Link
            href="/reservation"
            className="inline-flex items-center text-green-600 hover:text-green-800 font-semibold text-lg"
          >
            {isClient ? t.needReservation : ""}
            <span className="ml-2">→</span>
          </Link>
        </div>
      </div>

      {submitStatus.type && submitStatus.type !== "success" && (
        <div
          className={`mb-6 rounded-xl p-6 shadow-lg transition-all duration-300 ${
            submitStatus.type === "error"
              ? "bg-gradient-to-r from-red-50 to-orange-100 border-l-4 border-red-500"
              : "bg-gradient-to-r from-blue-50 to-cyan-100 border-l-4 border-blue-500"
          }`}
        >
          <div className="flex items-start">
            <div
              className={`mr-4 mt-1 ${
                submitStatus.type === "error" ? "text-red-600" : "text-blue-600"
              }`}
            >
              {submitStatus.type === "error" ? (
                <FaExclamationTriangle className="text-3xl" />
              ) : (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              )}
            </div>
            <div className="flex-1">
              <h3
                className={`text-xl font-bold mb-2 ${
                  submitStatus.type === "error"
                    ? "text-red-800"
                    : "text-blue-800"
                }`}
              >
                {submitStatus.message}
              </h3>
              {submitStatus.details && (
                <p className="text-gray-700">{submitStatus.details}</p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Información de contacto */}
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-8">
            {isClient ? t.contactInfo : ""}
          </h2>

          <div className="space-y-8">
            <div className="flex items-start">
              <div className="bg-green-600 p-3 rounded-full mr-4">
                <FaMapMarkerAlt className="text-white text-xl" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {isClient ? t.addressTitle : ""}
                </h3>
                <p className="text-gray-600 whitespace-pre-line">
                  {isClient ? t.address : ""}
                </p>
                <Link
                  href="https://maps.google.com"
                  target="_blank"
                  className="text-green-600 hover:underline mt-2 inline-block"
                >
                  {isClient ? t.viewOnMaps : ""}
                </Link>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-green-600 p-3 rounded-full mr-4">
                <FaPhone className="text-white text-xl" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {isClient ? t.phoneTitle : ""}
                </h3>
                <p className="text-gray-600 text-2xl font-bold">
                  +212 612 345 678
                </p>
                <p className="text-gray-500 mt-1">{isClient ? t.hours : ""}</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-green-600 p-3 rounded-full mr-4">
                <FaEnvelope className="text-white text-xl" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {isClient ? t.emailTitle : ""}
                </h3>
                <p className="text-gray-600 text-xl">n_bachiri@hotmail.com</p>
                <p className="text-gray-500 mt-1">
                  {isClient ? t.responseTime : ""}
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-green-600 p-3 rounded-full mr-4">
                <FaClock className="text-white text-xl" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {isClient ? t.visitHoursTitle : ""}
                </h3>
                <p className="text-gray-600">
                  <span className="font-bold">Week-ends:</span>{" "}
                  {isClient ? t.weekendHours : ""}
                  <br />
                  <span className="font-bold">Semaine:</span>{" "}
                  {isClient ? t.weekdaysHours : ""}
                  <br />
                  <span className="font-bold">Groupes:</span>{" "}
                  {isClient ? t.groupsHours : ""}
                </p>
              </div>
            </div>
          </div>

          {/* Preguntas frecuentes */}
          <div className="mt-12 bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-2xl shadow-md">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              {isClient ? t.faqTitle : ""}
            </h3>
            <div className="space-y-4">
              <div className="p-3 hover:bg-white rounded-lg transition">
                <h4 className="font-bold text-gray-700">
                  {isClient ? t.faq1.q : ""}
                </h4>
                <p className="text-gray-600 mt-1">{isClient ? t.faq1.a : ""}</p>
              </div>
              <div className="p-3 hover:bg-white rounded-lg transition">
                <h4 className="font-bold text-gray-700">
                  {isClient ? t.faq2.q : ""}
                </h4>
                <p className="text-gray-600 mt-1">{isClient ? t.faq2.a : ""}</p>
              </div>
              <div className="p-3 hover:bg-white rounded-lg transition">
                <h4 className="font-bold text-gray-700">
                  {isClient ? t.faq3.q : ""}
                </h4>
                <p className="text-gray-600 mt-1">{isClient ? t.faq3.a : ""}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Formulario de contacto SIMPLIFICADO */}
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
          <div className="flex items-center mb-6">
            <div className="bg-green-100 p-3 rounded-full mr-4">
              <FaPaperPlane className="text-green-600 text-xl" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800">
              {isClient ? t.sendMessage : ""}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 mb-2 font-semibold">
                {isClient ? t.fullName : ""}
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={isSubmitting}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
                placeholder={isClient ? t.placeholderName : ""}
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2 font-semibold">
                {isClient ? t.email : ""}
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isSubmitting}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
                placeholder={isClient ? t.placeholderEmail : ""}
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2 font-semibold">
                {isClient ? t.phone : ""}
                <span className="text-sm text-gray-500 ml-2">
                  {isClient ? `(${t.phoneNote})` : ""}
                </span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                disabled={isSubmitting}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed font-mono"
                placeholder={isClient ? t.placeholderPhone : ""}
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2 font-semibold">
                {isClient ? t.message : ""}
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="6"
                required
                disabled={isSubmitting}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed resize-none"
                placeholder={isClient ? t.placeholderMessage : ""}
              />
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-blue-800 text-sm">
                <span className="font-bold">📝 {isClient ? t.note : ""}</span>
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-4 rounded-lg font-bold text-lg transition-all duration-300 ${
                isSubmitting
                  ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                  : "bg-green-600 text-white hover:bg-green-700 transform hover:-translate-y-1 shadow-md hover:shadow-lg"
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  {isClient ? t.sending : ""}
                </div>
              ) : isClient ? (
                t.send
              ) : (
                ""
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
