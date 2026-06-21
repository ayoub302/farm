"use client";

export default function CosechaCard({ cosecha, language }) {
  // Si no hay cosecha, mostrar un placeholder
  if (!cosecha) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow h-full flex flex-col">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Función para determinar el color del estado
  const getEstadoColor = () => {
    // Usar estado según el idioma
    const estadoText =
      language === "ar" ? cosecha.statusAr || "" : cosecha.statusFr || "";

    // Verificar si estadoText es una string válida
    if (!estadoText || typeof estadoText !== "string") {
      return "bg-gray-100 text-gray-800";
    }

    const estadoLower = estadoText.toLowerCase();

    if (
      estadoLower.includes("جاهز") ||
      estadoLower.includes("جاهزة") ||
      estadoLower.includes("prêt") ||
      estadoLower.includes("prête") ||
      estadoLower.includes("prêtes") ||
      estadoLower.includes("disponible") ||
      estadoLower.includes("متوفر")
    ) {
      return "bg-green-100 text-green-800";
    }

    if (
      estadoLower.includes("قيد التقدم") ||
      estadoLower.includes("en cours") ||
      estadoLower.includes("en croissance") ||
      estadoLower.includes("ينمو")
    ) {
      return "bg-blue-100 text-blue-800";
    }

    if (
      estadoLower.includes("قريب") ||
      estadoLower.includes("قريباً") ||
      estadoLower.includes("bientôt") ||
      estadoLower.includes("prochainement") ||
      estadoLower.includes("قريبا")
    ) {
      return "bg-yellow-100 text-yellow-800";
    }

    return "bg-gray-100 text-gray-800";
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return language === "ar" ? "غير محدد" : "Non spécifié";

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(language === "ar" ? "ar-MA" : "fr-FR", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      try {
        // Fallback: intentar parsear de otra manera
        return new Date(dateString).toLocaleDateString();
      } catch {
        return dateString;
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow h-full flex flex-col">
      {/* Icono y título */}
      <div className="flex items-start mb-4">
        <div className="text-4xl mr-4 flex-shrink-0">
          {cosecha.icon || "🌱"}
        </div>
        <div className="flex-grow">
          <h3 className="text-xl font-bold text-gray-800">
            {language === "ar" ? cosecha.productAr : cosecha.productFr}
          </h3>
          {(cosecha.descriptionAr || cosecha.descriptionFr) && (
            <p className="text-sm text-gray-600 mt-2 line-clamp-2">
              {language === "ar"
                ? cosecha.descriptionAr
                : cosecha.descriptionFr}
            </p>
          )}
        </div>
      </div>

      {/* Estado */}
      <div className="mb-4">
        <span
          className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getEstadoColor()}`}
        >
          {language === "ar"
            ? cosecha.statusAr || "غير محدد"
            : cosecha.statusFr || "Non spécifié"}
        </span>
      </div>

      {/* Detalles */}
      <div className="space-y-3 mb-6 flex-grow">
        <div className="flex justify-between items-center">
          <span className="text-gray-600 text-sm">
            {language === "ar" ? "الموسم" : "Saison"}
          </span>
          <span className="font-medium">{cosecha.season || "N/A"}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600 text-sm">
            {language === "ar" ? "الحصاد القادم" : "Prochaine récolte"}
          </span>
          <span className="font-medium">{formatDate(cosecha.nextHarvest)}</span>
        </div>
      </div>

      {/* Disponibilidad */}
      <div className="pt-4 border-t border-gray-100">
        <p className="text-sm text-gray-700">
          <span className="font-medium">
            {language === "ar" ? "التوفر:" : "Disponibilité:"}
          </span>{" "}
          {language === "ar"
            ? cosecha.availabilityAr || "غير محدد"
            : cosecha.availabilityFr || "Non spécifiée"}
        </p>
      </div>
    </div>
  );
}
