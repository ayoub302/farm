"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/components/LanguageContext";
import {
  FaCalendarAlt,
  FaUsers,
  FaPhone,
  FaEnvelope,
  FaCheckCircle,
  FaExclamationTriangle,
  FaPaperPlane,
  FaHome,
  FaArrowLeft,
} from "react-icons/fa";

const textos = {
  ar: {
    pageTitle: "حجز زيارة",
    pageSubtitle:
      "احجز زيارتك إلى المزرعة السعيدة. اختر التاريخ والوقت والأنشطة.",
    contactInfo: "معلومات الحجز",
    personalInfo: "معلومات شخصية",
    fullName: "الاسم الكامل *",
    email: "البريد الإلكتروني *",
    phone: "رقم الهاتف *",
    phoneNote: "يجب أن يبدأ بـ +212 ويتبع بـ 9 أرقام",
    reservationDetails: "تفاصيل الحجز",
    visitDate: "تاريخ الزيارة *",
    visitTime: "وقت الزيارة *",
    numPeople: "عدد الأشخاص *",
    activityType: "نوع النشاط *",
    specialRequirements: "متطلبات خاصة أو ملاحظات",
    activities: [
      { value: "tour", label: "جولة في المزرعة" },
      { value: "workshop", label: "ورشة زراعية" },
      { value: "family", label: "زيارة عائلية" },
      { value: "school", label: "زيارة مدرسية" },
      { value: "corporate", label: "فعالية للشركات" },
      { value: "private", label: "جولة خاصة" },
    ],
    timeSlots: [
      "09:00 صباحاً",
      "10:30 صباحاً",
      "12:00 ظهراً",
      "14:00 بعد الظهر",
      "15:30 بعد الظهر",
      "17:00 مساءً",
    ],
    peopleOptions: [
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "أكثر من 10",
    ],
    message: "ملاحظات إضافية",
    placeholderName: "أدخل اسمك الكامل",
    placeholderEmail: "example@email.com",
    placeholderPhone: "+212 612345678",
    placeholderMessage: "أي متطلبات خاصة، حساسيات، أو أسئلة...",
    note: "سيتم تأكيد حجزك خلال 24 ساعة. للحجوزات العاجلة، اتصل بنا.",
    send: "تأكيد الحجز",
    sending: "جاري التأكيد...",
    sendingAnimation: "جاري معالجة حجزك...",
    successMessage: "✅ تم تأكيد حجزك بنجاح!",
    successDetails: "سنرسل لك تأكيداً بالبريد الإلكتروني.",
    errorMessage: "حدث خطأ أثناء تأكيد الحجز. يرجى المحاولة مرة أخرى.",
    validationError: "يرجى ملء جميع الحقول المطلوبة.",
    phoneValidationError:
      "رقم الهاتف غير صحيح. يجب أن يكون +212 متبوعاً بـ 9 أرقام.",
    reservationSent: "🎉 تم الحجز!",
    confirmationNumber: "رقم التأكيد:",
    contactSoon: "سنتصل بك لتأكيد التفاصيل.",
    sendAnother: "حجز آخر",
    backToHome: "العودة إلى الصفحة الرئيسية",
    backToContact: "← العودة إلى نموذج الاتصال",
    whatHappensNext: "ماذا يحدث بعد الآن؟",
    nextStep1: "سنراجع حجزك خلال 24 ساعة",
    nextStep2: "سنتصل بك لتأكيد التفاصيل",
    nextStep3: "سنرسل تأكيداً كاملاً إلى بريدك الإلكتروني",
    pricingInfo: "معلومات مهمة",
    tourPrice: "جولة المزرعة: مجانية",
    workshopPrice: "الورشة: مجانية",
    familyDiscount: "جميع الأنشطة مجانية للعائلات",
    schoolDiscount: "الزيارات المدرسية: مجانية",
  },
  fr: {
    pageTitle: "Réservation de visite",
    pageSubtitle:
      "Réservez votre visite à la Ferme Heureuse. Choisissez date, heure et activités.",
    contactInfo: "Informations de réservation",
    personalInfo: "Informations personnelles",
    fullName: "Nom complet *",
    email: "Email *",
    phone: "Téléphone *",
    phoneNote: "9 chiffres",
    reservationDetails: "Détails de la réservation",
    visitDate: "Date de visite *",
    visitTime: "Heure de visite *",
    numPeople: "Nombre de personnes *",
    activityType: "Type d'activité *",
    specialRequirements: "Besoins spéciaux ou remarques",
    activities: [
      { value: "tour", label: "Visite de la ferme" },
      { value: "workshop", label: "Atelier agricole" },
      { value: "family", label: "Visite familiale" },
      { value: "school", label: "Visite scolaire" },
      { value: "corporate", label: "Événement d'entreprise" },
      { value: "private", label: "Visite privée" },
    ],
    timeSlots: ["09:00", "10:30", "12:00", "14:00", "15:30", "17:00"],
    peopleOptions: [
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "Plus de 10",
    ],
    message: "Remarques supplémentaires",
    placeholderName: "Entrez votre nom complet",
    placeholderEmail: "exemple@email.com",
    placeholderPhone: "+212 612345678",
    placeholderMessage: "Toute exigence spéciale, allergies, ou questions...",
    note: "Votre réservation sera confirmée dans les 24 heures. Pour les réservations urgentes, appelez-nous.",
    send: "Confirmer la réservation",
    sending: "Confirmation en cours...",
    sendingAnimation: "Traitement de votre réservation...",
    successMessage: "✅ Votre réservation a été confirmée avec succès!",
    successDetails: "Nous vous enverrons une confirmation par email.",
    errorMessage:
      "Une erreur s'est produite lors de la confirmation. Veuillez réessayer.",
    validationError: "Veuillez remplir tous les champs obligatoires.",
    phoneValidationError:
      "Numéro de teléphone invalide. Doit être +212 suivi de 9 chiffres.",
    reservationSent: "🎉 Réservation effectuée!",
    confirmationNumber: "Numéro de confirmation:",
    contactSoon: "Nous vous contacterons pour confirmer les détails.",
    sendAnother: "Nouvelle réservation",
    backToHome: "Retour à l'accueil",
    backToContact: "Retour au formulaire de contact",
    whatHappensNext: "Que se passe-t-il ensuite?",
    nextStep1: "Nous examinerons votre réservation sous 24 heures",
    nextStep2: "Nous vous appellerons pour confirmer les détails",
    nextStep3: "Nous enverrons une confirmation complète à votre email",
    pricingInfo: "Informations importantes",
    tourPrice: "Visite de ferme: Gratuite",
    workshopPrice: "Atelier: Gratuit",
    familyDiscount: "Toutes les activités gratuites pour les familles",
    schoolDiscount: "Visites scolaires: Gratuites",
  },
};

export default function ReservationPage() {
  const { language } = useLanguage();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const t = textos[language];

  // Calcular fechas mínima y máxima
  const today = new Date();
  const minDate = today.toISOString().split("T")[0];
  const maxDate = new Date(today.setMonth(today.getMonth() + 3))
    .toISOString()
    .split("T")[0];

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "+212 ",
    visitDate: minDate,
    visitTime: t.timeSlots[0],
    numPeople: "2",
    activityType: "tour",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({
    type: "",
    message: "",
    details: "",
    confirmationId: "",
  });

  const validatePhone = (phone) => {
    const phoneRegex = /^\+212\s?\d{9}$/;
    return phoneRegex.test(phone.replace(/\s/g, ""));
  };

  const handlePhoneChange = (e) => {
    let value = e.target.value;

    if (!value.startsWith("+212")) {
      value = "+212 " + value.replace(/^\+212\s?/, "");
    }

    const digits = value.replace(/[^\d]/g, "");
    if (digits.length <= 12) {
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

    if (submitStatus.type === "error") {
      setSubmitStatus({
        type: "",
        message: "",
        details: "",
        confirmationId: "",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar campos requeridos
    if (
      !formData.name ||
      !formData.email ||
      !formData.phone ||
      !formData.visitDate ||
      !formData.visitTime ||
      !formData.numPeople ||
      !formData.activityType
    ) {
      setSubmitStatus({
        type: "error",
        message: t.validationError,
        details: "",
        confirmationId: "",
      });
      return;
    }

    // Validar teléfono
    if (!validatePhone(formData.phone)) {
      setSubmitStatus({
        type: "error",
        message: t.phoneValidationError,
        details: t.phoneNote,
        confirmationId: "",
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus({
      type: "loading",
      message: t.sendingAnimation,
      details: "",
      confirmationId: "",
    });

    try {
      const response = await fetch("/api/reservation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.replace(/\s/g, ""),
          visitDate: formData.visitDate,
          visitTime: formData.visitTime,
          numPeople: parseInt(formData.numPeople),
          activityType: formData.activityType,
          message: formData.message.trim(),
          source: "reservation_form",
          language: language,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.message || data.error || t.errorMessage;
        throw new Error(errorMessage);
      }

      // Éxito - Usar bookingCode del API
      setSubmitStatus({
        type: "success",
        message: t.successMessage,
        details: t.successDetails,
        confirmationId: data.data?.bookingCode || `RES-${Date.now()}`,
      });
    } catch (error) {
      console.error("Error sending reservation:", error);
      setSubmitStatus({
        type: "error",
        message: t.errorMessage,
        details: error.message || t.errorMessage,
        confirmationId: "",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubmitStatus({ type: "", message: "", details: "", confirmationId: "" });
    setFormData({
      name: "",
      email: "",
      phone: "+212 ",
      visitDate: minDate,
      visitTime: t.timeSlots[0],
      numPeople: "2",
      activityType: "tour",
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
            {isClient ? t.reservationSent : ""}
          </h1>

          <p className="text-2xl text-emerald-600 font-semibold mb-6">
            {isClient ? t.successMessage : ""}
          </p>

          <div className="bg-gradient-to-r from-green-50 to-emerald-100 rounded-2xl p-6 mb-8">
            <div className="bg-white rounded-xl p-4 border border-emerald-200 mb-4">
              <p className="text-gray-600 font-medium">
                {isClient ? t.confirmationNumber : ""}
              </p>
              <p className="text-2xl font-bold text-emerald-700 font-mono mt-2">
                {submitStatus.confirmationId}
              </p>
            </div>
            <p className="text-gray-700 text-lg mb-2">
              {isClient ? t.contactSoon : ""}
            </p>
            <p className="text-gray-600">{isClient ? t.successDetails : ""}</p>
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
      {/* Enlace de vuelta */}
      <div className="mb-8">
        <Link
          href="/contacto"
          className="inline-flex items-center text-green-600 hover:text-green-800 font-semibold"
        >
          <FaArrowLeft className="mr-2" />
          {isClient ? t.backToContact : ""}
        </Link>
      </div>

      <div className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
          {isClient ? t.pageTitle : ""}
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          {isClient ? t.pageSubtitle : ""}
        </p>
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

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Información de precios ELIMINADA - Reemplazada por información gratuita */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <FaCalendarAlt className="mr-3 text-green-600" />
              {isClient ? t.pricingInfo : ""}
            </h2>
            <div className="space-y-4">
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="font-bold text-gray-800">
                  {isClient ? t.tourPrice : ""}
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="font-bold text-gray-800">
                  {isClient ? t.workshopPrice : ""}
                </p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <p className="font-bold text-gray-800">
                  {isClient ? t.familyDiscount : ""}
                </p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <p className="font-bold text-gray-800">
                  {isClient ? t.schoolDiscount : ""}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-2xl shadow-md">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {isClient ? t.contactInfo : ""}
            </h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <FaPhone className="text-green-600 mt-1 mr-3" />
                <div>
                  <p className="font-bold text-gray-700">+212 661 105 373</p>
                  <p className="text-gray-600 text-sm">Lun-Ven: 9h-18h</p>
                </div>
              </div>
              <div className="flex items-start">
                <FaEnvelope className="text-green-600 mt-1 mr-3" />
                <div>
                  <p className="font-bold text-gray-700">
                    n_bachiri@hotmail.com
                  </p>
                  <p className="text-gray-600 text-sm">Réponse sous 24h</p>
                </div>
              </div>
              <div className="flex items-start">
                <FaUsers className="text-green-600 mt-1 mr-3" />
                <div>
                  <p className="font-bold text-gray-700">Groupes</p>
                  <p className="text-gray-600 text-sm">
                    Jusqu&apos;à 50 personnes
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Formulario de reserva */}
        <div className="lg:col-span-2">
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                {isClient ? t.reservationDetails : ""}
              </h2>
              <p className="text-gray-600">{isClient ? t.personalInfo : ""}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
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

              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-gray-700 mb-2 font-semibold">
                    {isClient ? t.visitDate : ""}
                  </label>
                  <input
                    type="date"
                    name="visitDate"
                    value={formData.visitDate}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
                    min={minDate}
                    max={maxDate}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2 font-semibold">
                    {isClient ? t.visitTime : ""}
                  </label>
                  <select
                    name="visitTime"
                    value={formData.visitTime}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
                  >
                    {t.timeSlots.map((time) => (
                      <option key={time} value={time}>
                        {isClient ? time : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 mb-2 font-semibold">
                    {isClient ? t.numPeople : ""}
                  </label>
                  <select
                    name="numPeople"
                    value={formData.numPeople}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
                  >
                    {t.peopleOptions.map((num) => (
                      <option key={num} value={num}>
                        {isClient ? num : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-2 font-semibold">
                  {isClient ? t.activityType : ""}
                </label>
                <select
                  name="activityType"
                  value={formData.activityType}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
                >
                  {t.activities.map((activity) => (
                    <option key={activity.value} value={activity.value}>
                      {isClient ? activity.label : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 mb-2 font-semibold">
                  {isClient ? t.specialRequirements : ""}
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="4"
                  disabled={isSubmitting}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed resize-none"
                  placeholder={isClient ? t.placeholderMessage : ""}
                />
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <p className="text-yellow-800 text-sm">
                  <span className="font-bold">ℹ️ {isClient ? t.note : ""}</span>
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
    </div>
  );
}
