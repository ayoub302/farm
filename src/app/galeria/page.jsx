"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useLanguage } from "@/components/LanguageContext";
import Image from "next/image";
import Link from "next/link";

const textos = {
  ar: {
    title: "معرض المزرعة",
    subtitle: "استكشف أجمل اللحظات والذكريات من مزرعتنا",
    filterAll: "الكل",
    filterActivities: "الأنشطة",
    filterHarvest: "الحصاد",
    filterSustainability: "الاستدامة",
    filterProducts: "المنتجات",
    filterFarmLife: "حياة المزرعة",
    searchPlaceholder: "ابحث في الصور...",
    noResults: "لا توجد نتائج تطابق بحثك",
    loading: "جاري تحميل الصور...",
    backToHome: "العودة إلى الصفحة الرئيسية",
    viewDetails: "عرض التفاصيل",
    close: "إغلاق",
    previous: "السابق",
    next: "التالي",
    imageCount: "الصورة {current} من {total}",
    category: "الفئة",
    dateAdded: "تاريخ الإضافة",
    share: "مشاركة",
    download: "تحميل",
    noImages: "لا توجد صور حالياً",
  },
  fr: {
    title: "Galerie de la Ferme",
    subtitle: "Explorez les plus beaux moments et souvenirs de notre ferme",
    filterAll: "Tout",
    filterActivities: "Activités",
    filterHarvest: "Récolte",
    filterSustainability: "Durabilité",
    filterProducts: "Produits",
    filterFarmLife: "Vie à la Ferme",
    searchPlaceholder: "Rechercher des photos...",
    noResults: "Aucun résultat ne correspond à votre recherche",
    loading: "Chargement des images...",
    backToHome: "Retour à l'accueil",
    viewDetails: "Voir les détails",
    close: "Fermer",
    previous: "Précédent",
    next: "Suivant",
    imageCount: "Image {current} sur {total}",
    category: "Catégorie",
    dateAdded: "Date d'ajout",
    share: "Partager",
    download: "Télécharger",
    noImages: "Aucune image pour le moment",
  },
};

export default function GaleriaPage() {
  const { language } = useLanguage();
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState(null);

  const t = textos[language] || textos.fr;

  // Cargar imágenes desde la API
  useEffect(() => {
    const fetchImages = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          "/api/gallery?type=image&status=published",
        );

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.success && Array.isArray(data.items)) {
          // Transformar los datos al formato que necesita la galería
          const formattedImages = data.items.map((item) => ({
            id: item.id,
            src: item.src || item.url,
            title:
              language === "ar"
                ? item.titleAr || item.title
                : item.titleFr || item.title,
            description:
              language === "ar"
                ? item.descriptionAr || item.description
                : item.descriptionFr || item.description,
            category: item.category || "farmLife",
            date: item.createdAt
              ? new Date(item.createdAt).toLocaleDateString()
              : new Date().toLocaleDateString(),
            tags: item.tags || [],
          }));

          setImages(formattedImages);
        } else if (Array.isArray(data)) {
          // Si la API devuelve directamente un array
          const formattedImages = data.map((item) => ({
            id: item.id,
            src: item.src || item.url,
            title:
              language === "ar"
                ? item.titleAr || item.title
                : item.titleFr || item.title,
            description:
              language === "ar"
                ? item.descriptionAr || item.description
                : item.descriptionFr || item.description,
            category: item.category || "farmLife",
            date: item.createdAt
              ? new Date(item.createdAt).toLocaleDateString()
              : new Date().toLocaleDateString(),
            tags: item.tags || [],
          }));

          setImages(formattedImages);
        } else {
          setImages([]);
        }
      } catch (error) {
        console.error("Error fetching gallery:", error);
        setError(error.message);
        setImages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, [language]); // Recargar cuando cambie el idioma

  // Usar useMemo para calcular imágenes filtradas
  const filteredImages = useMemo(() => {
    let results = images;

    // Aplicar filtro
    if (activeFilter !== "all") {
      results = results.filter((image) => image.category === activeFilter);
    }

    // Aplicar búsqueda
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(
        (image) =>
          (image.title?.toLowerCase() || "").includes(query) ||
          (image.description?.toLowerCase() || "").includes(query) ||
          image.tags?.some((tag) => tag.toLowerCase().includes(query)) ||
          false,
      );
    }

    return results;
  }, [activeFilter, searchQuery, images]);

  // Efecto para manejar el scroll del body cuando se abre/cierra el modal
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isModalOpen]);

  const filters = [
    { id: "all", label: t.filterAll },
    { id: "activities", label: t.filterActivities },
    { id: "harvest", label: t.filterHarvest },
    { id: "sustainability", label: t.filterSustainability },
    { id: "products", label: t.filterProducts },
    { id: "farmLife", label: t.filterFarmLife },
  ];

  const handleImageClick = useCallback((image) => {
    setSelectedImage(image);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setTimeout(() => {
      setSelectedImage(null);
    }, 300);
  }, []);

  const handlePreviousImage = useCallback(() => {
    if (!selectedImage) return;
    const currentIndex = filteredImages.findIndex(
      (img) => img.id === selectedImage.id,
    );
    const previousIndex =
      (currentIndex - 1 + filteredImages.length) % filteredImages.length;
    setSelectedImage(filteredImages[previousIndex]);
  }, [selectedImage, filteredImages]);

  const handleNextImage = useCallback(() => {
    if (!selectedImage) return;
    const currentIndex = filteredImages.findIndex(
      (img) => img.id === selectedImage.id,
    );
    const nextIndex = (currentIndex + 1) % filteredImages.length;
    setSelectedImage(filteredImages[nextIndex]);
  }, [selectedImage, filteredImages]);

  // Manejar teclas para navegación
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isModalOpen) return;

      switch (e.key) {
        case "Escape":
          handleCloseModal();
          break;
        case "ArrowLeft":
          handlePreviousImage();
          break;
        case "ArrowRight":
          handleNextImage();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isModalOpen, handleCloseModal, handlePreviousImage, handleNextImage]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#2d5a27] to-emerald-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t.title}</h1>
          <p className="text-xl text-emerald-100 max-w-3xl mx-auto">
            {t.subtitle}
          </p>
        </div>
      </header>

      {/* Filtros y Búsqueda */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Barra de búsqueda */}
            <div className="w-full md:w-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder={t.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full md:w-80 px-4 py-2 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                <svg
                  className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            {/* Filtros */}
            <div className="flex flex-wrap gap-2">
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                    activeFilter === filter.id
                      ? "bg-emerald-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Contenido Principal */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">{t.loading}</p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {language === "ar"
                ? "خطأ في تحميل الصور"
                : "Erreur de chargement"}
            </h3>
            <p className="text-gray-500 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
            >
              {language === "ar" ? "إعادة المحاولة" : "Réessayer"}
            </button>
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📷</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {t.noImages || "لا توجد صور حالياً"}
            </h3>
            <p className="text-gray-500 mb-6">
              {language === "ar"
                ? "سيتم عرض الصور هنا بعد رفعها من لوحة التحكم"
                : "Les images apparaîtront ici après avoir été téléchargées depuis le panneau d'administration"}
            </p>
          </div>
        ) : filteredImages.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {t.noResults}
            </h3>
            <p className="text-gray-500 mb-6">
              {language === "ar"
                ? "حاول استخدام مصطلحات بحث أخرى أو اختر فئة مختلفة"
                : "Essayez d'autres termes de recherche ou choisissez une catégorie différente"}
            </p>
            <button
              onClick={() => {
                setActiveFilter("all");
                setSearchQuery("");
              }}
              className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
            >
              {t.filterAll}
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6 flex justify-between items-center">
              <p className="text-gray-600">
                {language === "ar"
                  ? `عرض ${filteredImages.length} صورة`
                  : `Affichage de ${filteredImages.length} images`}
              </p>
            </div>

            {/* Galería Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredImages.map((image) => (
                <div
                  key={image.id}
                  className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer bg-white"
                  onClick={() => handleImageClick(image)}
                >
                  <div className="aspect-square overflow-hidden bg-gray-100">
                    <div className="relative w-full h-full">
                      <Image
                        src={image.src}
                        alt={image.title || "Gallery image"}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                    </div>
                    <div className="absolute top-2 right-2">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-white/90 backdrop-blur-sm">
                        {language === "ar"
                          ? image.category === "activities"
                            ? "أنشطة"
                            : image.category === "harvest"
                              ? "حصاد"
                              : image.category === "sustainability"
                                ? "استدامة"
                                : image.category === "products"
                                  ? "منتجات"
                                  : "حياة المزرعة"
                          : image.category === "activities"
                            ? "Activités"
                            : image.category === "harvest"
                              ? "Récolte"
                              : image.category === "sustainability"
                                ? "Durabilité"
                                : image.category === "products"
                                  ? "Produits"
                                  : "Vie à la Ferme"}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-800 mb-1 line-clamp-1">
                      {image.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                      {image.description}
                    </p>
                    {image.tags && image.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {image.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 text-xs bg-emerald-100 text-emerald-800 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <button className="w-full py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition">
                      {t.viewDetails}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      {/* Modal de Imagen Ampliada */}
      {isModalOpen && selectedImage && (
        <div
          className={`fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${isModalOpen ? "opacity-100" : "opacity-0"}`}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCloseModal();
            }
          }}
        >
          <div className="relative max-w-6xl w-full max-h-[90vh]">
            {/* Botones de navegación */}
            {filteredImages.length > 1 && (
              <>
                <button
                  onClick={handlePreviousImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-black/50 p-3 rounded-full hover:bg-black/70 transition z-10"
                  title={t.previous}
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                  </svg>
                </button>

                <button
                  onClick={handleNextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-black/50 p-3 rounded-full hover:bg-black/70 transition z-10"
                  title={t.next}
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
                  </svg>
                </button>
              </>
            )}

            {/* Contenedor principal */}
            <div className="bg-white rounded-xl overflow-hidden h-full flex flex-col animate-scaleIn">
              {/* Header del modal */}
              <div className="flex items-center justify-between p-4 border-b bg-white">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    {selectedImage.title}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {t.imageCount
                      .replace(
                        "{current}",
                        (
                          filteredImages.findIndex(
                            (img) => img.id === selectedImage.id,
                          ) + 1
                        ).toString(),
                      )
                      .replace("{total}", filteredImages.length.toString())}
                  </p>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-500 hover:text-gray-700 p-2"
                  title={t.close}
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                  </svg>
                </button>
              </div>

              {/* Imagen */}
              <div className="flex-1 relative min-h-[400px] bg-black">
                <Image
                  src={selectedImage.src}
                  alt={selectedImage.title || "Gallery image"}
                  fill
                  className="object-contain"
                  sizes="90vw"
                  priority
                />
              </div>

              {/* Información de la imagen */}
              <div className="p-6 border-t">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">
                      {t.category}
                    </h3>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm">
                      {language === "ar"
                        ? selectedImage.category === "activities"
                          ? "أنشطة"
                          : selectedImage.category === "harvest"
                            ? "حصاد"
                            : selectedImage.category === "sustainability"
                              ? "استدامة"
                              : selectedImage.category === "products"
                                ? "منتجات"
                                : "حياة المزرعة"
                        : selectedImage.category === "activities"
                          ? "Activités"
                          : selectedImage.category === "harvest"
                            ? "Récolte"
                            : selectedImage.category === "sustainability"
                              ? "Durabilité"
                              : selectedImage.category === "products"
                                ? "Produits"
                                : "Vie à la Ferme"}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">
                      {t.dateAdded}
                    </h3>
                    <p className="text-gray-600">{selectedImage.date}</p>
                  </div>

                  {selectedImage.tags && selectedImage.tags.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-700 mb-2">
                        {language === "ar" ? "الكلمات المفتاحية" : "Mots-clés"}
                      </h3>
                      <div className="flex flex-wrap gap-1">
                        {selectedImage.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6">
                  <h3 className="font-semibold text-gray-700 mb-2">
                    {language === "ar" ? "الوصف" : "Description"}
                  </h3>
                  <p className="text-gray-600">{selectedImage.description}</p>
                </div>

                {/* Acciones */}
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                  <button
                    onClick={() => {
                      const imageUrl =
                        window.location.origin + selectedImage.src;
                      if (navigator.share) {
                        navigator.share({
                          title: selectedImage.title,
                          text: selectedImage.description,
                          url: imageUrl,
                        });
                      } else {
                        navigator.clipboard.writeText(imageUrl);
                        alert(
                          language === "ar" ? "تم نسخ الرابط" : "Lien copié",
                        );
                      }
                    }}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center gap-2"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z" />
                    </svg>
                    {t.share}
                  </button>
                  <a
                    href={selectedImage.src}
                    download
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition flex items-center gap-2"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
                    </svg>
                    {t.download}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer de la página */}
      <footer className="bg-gradient-to-r from-[#2d5a27] to-emerald-800 text-white py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xl mb-6">
            {language === "ar"
              ? "استمر في استكشاف تجاربنا الزراعية الفريدة"
              : "Continuez à explorer nos expériences agricoles uniques"}
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-white text-emerald-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
            {t.backToHome}
          </Link>
        </div>
      </footer>

      {/* Estilos para animaciones */}
      <style jsx global>{`
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
