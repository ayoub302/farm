"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AdminGuard from "@/components/AdminGuard";
import {
  ArrowLeft,
  Save,
  X,
  Calendar,
  Info,
  CheckCircle,
  ChevronLeft,
} from "lucide-react";

export default function CreateHarvestPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    productAr: "",
    productFr: "",
    icon: "🌱",
    statusAr: "متوفر",
    statusFr: "Disponible",
    availabilityAr: "متاح للحصاد",
    availabilityFr: "Disponible pour récolte",
    nextHarvest: "",
    season: "Spring",
    year: new Date().getFullYear(),
    isActive: true,
    descriptionAr: "",
    descriptionFr: "",
  });

  const seasonOptions = [
    { value: "Spring", labelAr: "الربيع", labelFr: "Printemps" },
    { value: "Summer", labelAr: "الصيف", labelFr: "Été" },
    { value: "Autumn", labelAr: "الخريف", labelFr: "Automne" },
    { value: "Winter", labelAr: "الشتاء", labelFr: "Hiver" },
    { value: "All Year", labelAr: "طوال العام", labelFr: "Toute l'année" },
  ];

  const iconOptions = [
    { value: "🌱", label: "Seedling" },
    { value: "🍎", label: "Apple" },
    { value: "🍇", label: "Grapes" },
    { value: "🍊", label: "Orange" },
    { value: "🍋", label: "Lemon" },
    { value: "🥕", label: "Carrot" },
    { value: "🥬", label: "Lettuce" },
    { value: "🥒", label: "Cucumber" },
    { value: "🍅", label: "Tomato" },
    { value: "🫐", label: "Blueberries" },
    { value: "🌽", label: "Corn" },
    { value: "🧅", label: "Onion" },
    { value: "🥔", label: "Potato" },
    { value: "🍓", label: "Strawberry" },
    { value: "🍒", label: "Cherries" },
    { value: "🥭", label: "Mango" },
    { value: "🍍", label: "Pineapple" },
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setError("");
    setSuccess("");
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value === "" ? "" : Number(value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Validación básica
      if (!formData.productAr || !formData.productFr) {
        throw new Error("Product name in both Arabic and French is required");
      }

      if (!formData.nextHarvest) {
        throw new Error("Next harvest date is required");
      }

      // Validar que la fecha no sea en el pasado
      const selectedDate = new Date(formData.nextHarvest);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        throw new Error("Next harvest date cannot be in the past");
      }

      const response = await fetch("/api/admin/harvests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create harvest");
      }

      setSuccess("Harvest created successfully!");

      // Redirigir después de 2 segundos
      setTimeout(() => {
        router.push("/admin/harvests");
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Formatear fecha para el input date
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const year = tomorrow.getFullYear();
    const month = String(tomorrow.getMonth() + 1).padStart(2, "0");
    const day = String(tomorrow.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50 py-4 sm:py-6 lg:py-8">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8">
          {/* Header optimizado para móvil */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-start sm:items-center justify-between mb-4 sm:mb-6">
              <div className="flex items-center">
                <Link
                  href="/admin/harvests"
                  className="flex items-center text-gray-600 hover:text-gray-900 mr-3 sm:mr-4 p-1.5 -ml-1.5 sm:p-0 sm:ml-0"
                  aria-label="Back to Harvests"
                >
                  <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                  <span className="hidden sm:inline ml-2">
                    Back to Harvests
                  </span>
                </Link>
                <div className="min-w-0">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">
                    Create New Harvest
                  </h1>
                  <p className="text-gray-600 mt-1 text-sm sm:text-base truncate">
                    Add a new harvest product to your farm
                  </p>
                </div>
              </div>
            </div>

            {/* Info Card optimizado para móvil */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
              <div className="flex items-start">
                <Info className="w-5 h-5 text-blue-600 mt-0.5 mr-2 sm:mr-3 flex-shrink-0" />
                <div className="min-w-0">
                  <h3 className="font-medium text-blue-900 mb-1 text-sm sm:text-base">
                    Harvest Information
                  </h3>
                  <p className="text-xs sm:text-sm text-blue-700">
                    Harvests will appear on the public calendar and can be
                    linked to activities. Make sure to provide information in
                    both Arabic and French.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-4 sm:space-y-6 lg:space-y-8"
          >
            {/* Error and Success Messages */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg">
                <div className="flex items-center">
                  <X className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2 flex-shrink-0" />
                  <span className="text-sm sm:text-base">{error}</span>
                </div>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2 flex-shrink-0" />
                  <span className="text-sm sm:text-base">{success}</span>
                </div>
              </div>
            )}

            {/* Basic Information Card */}
            <div className="bg-white rounded-xl shadow p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6 flex items-center">
                <span className="text-green-600 mr-2">🌱</span>
                Basic Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {/* Product Name - Arabic */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name (Arabic) *
                  </label>
                  <input
                    type="text"
                    name="productAr"
                    value={formData.productAr}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="اسم المنتج بالعربية"
                    required
                    dir="rtl"
                  />
                </div>

                {/* Product Name - French */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name (French) *
                  </label>
                  <input
                    type="text"
                    name="productFr"
                    value={formData.productFr}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Nom du produit en français"
                    required
                  />
                </div>

                {/* Icon Selector */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Icon
                  </label>
                  <div className="grid grid-cols-5 sm:grid-cols-6 gap-1.5 sm:gap-2">
                    {iconOptions.map((icon) => (
                      <button
                        key={icon.value}
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, icon: icon.value }))
                        }
                        className={`p-1.5 sm:p-2 text-xl sm:text-2xl rounded-lg border flex items-center justify-center ${
                          formData.icon === icon.value
                            ? "border-green-500 bg-green-50"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                        title={icon.label}
                        aria-label={`Select ${icon.label} icon`}
                      >
                        {icon.value}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    name="icon"
                    value={formData.icon}
                    onChange={handleChange}
                    className="mt-2 w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Emoji icon"
                  />
                </div>

                {/* Season and Year */}
                <div className="sm:col-span-2 grid grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Season *
                    </label>
                    <select
                      name="season"
                      value={formData.season}
                      onChange={handleChange}
                      className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      {seasonOptions.map((season) => (
                        <option key={season.value} value={season.value}>
                          {season.labelFr}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Year *
                    </label>
                    <input
                      type="number"
                      name="year"
                      value={formData.year}
                      onChange={handleNumberChange}
                      min="2024"
                      max="2030"
                      className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                {/* Next Harvest Date */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Next Harvest Date *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                    <input
                      type="date"
                      name="nextHarvest"
                      value={formData.nextHarvest}
                      onChange={handleChange}
                      min={getMinDate()}
                      className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    Select a future date for the next harvest
                  </p>
                </div>
              </div>
            </div>

            {/* Status and Availability Card */}
            <div className="bg-white rounded-xl shadow p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6 flex items-center">
                <Info className="w-5 h-5 text-blue-600 mr-2" />
                Status & Availability
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {/* Status - Arabic */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status (Arabic)
                  </label>
                  <input
                    type="text"
                    name="statusAr"
                    value={formData.statusAr}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="الحالة بالعربية"
                    dir="rtl"
                  />
                </div>

                {/* Status - French */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status (French)
                  </label>
                  <input
                    type="text"
                    name="statusFr"
                    value={formData.statusFr}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Statut en français"
                  />
                </div>

                {/* Availability - Arabic */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Availability (Arabic)
                  </label>
                  <input
                    type="text"
                    name="availabilityAr"
                    value={formData.availabilityAr}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="التوفر بالعربية"
                    dir="rtl"
                  />
                </div>

                {/* Availability - French */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Availability (French)
                  </label>
                  <input
                    type="text"
                    name="availabilityFr"
                    value={formData.availabilityFr}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Disponibilité en français"
                  />
                </div>

                {/* Active Status */}
                <div className="sm:col-span-2 mt-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleChange}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      This harvest is active and will be visible to the public
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Description Card */}
            <div className="bg-white rounded-xl shadow p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6">
                Description
              </h2>

              <div className="space-y-4 sm:space-y-6">
                {/* Description - Arabic */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (Arabic)
                  </label>
                  <textarea
                    name="descriptionAr"
                    value={formData.descriptionAr}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="وصف المنتج بالعربية"
                    dir="rtl"
                  />
                </div>

                {/* Description - French */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (French)
                  </label>
                  <textarea
                    name="descriptionFr"
                    value={formData.descriptionFr}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Description du produit en français"
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="bg-white rounded-xl shadow p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                <div className="text-xs sm:text-sm text-gray-500">
                  All fields marked with * are required
                </div>
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
                  <Link
                    href="/admin/harvests"
                    className="px-4 sm:px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-center text-sm sm:text-base"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 sm:px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm sm:text-base"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-3.5 w-3.5 sm:h-4 sm:w-4 border-b-2 border-white mr-1.5 sm:mr-2"></div>
                        <span>Creating...</span>
                      </>
                    ) : (
                      <>
                        <span className="mr-1.5 sm:mr-2">✓</span>
                        <span>Create Harvest</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>

          {/* Preview Card - Movido arriba en móvil, más compacto */}
          <div className="mt-6 sm:mt-8 bg-gradient-to-r from-green-50 to-emerald-100 rounded-xl shadow p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">
              Preview
            </h2>
            <div className="bg-white rounded-lg p-3 sm:p-4 border">
              <div className="flex items-center mb-3 sm:mb-4">
                <span className="text-2xl sm:text-3xl mr-2 sm:mr-3">
                  {formData.icon}
                </span>
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-800 text-sm sm:text-base truncate">
                    {formData.productFr || "Product Name"}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 truncate">
                    {formData.productAr || "اسم المنتج"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 text-xs sm:text-sm">
                <div>
                  <span className="text-gray-500 block">Status:</span>
                  <span className="font-medium truncate block">
                    {formData.statusFr || "Disponible"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block">Season:</span>
                  <span className="font-medium truncate block">
                    {formData.season} {formData.year}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block">Next Harvest:</span>
                  <span className="font-medium truncate block">
                    {formData.nextHarvest
                      ? new Date(formData.nextHarvest).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                          },
                        )
                      : "Not set"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block">Availability:</span>
                  <span className="font-medium truncate block">
                    {formData.availabilityFr || "Disponible"}
                  </span>
                </div>
              </div>

              {(formData.descriptionFr || formData.descriptionAr) && (
                <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
                  <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Description:
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">
                    {formData.descriptionFr ||
                      formData.descriptionAr ||
                      "No description"}
                  </p>
                </div>
              )}

              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
                <div className="flex items-center">
                  <div
                    className={`h-2 w-2 rounded-full mr-2 ${formData.isActive ? "bg-green-500" : "bg-red-500"}`}
                  ></div>
                  <span
                    className={`text-xs sm:text-sm font-medium ${formData.isActive ? "text-green-600" : "text-red-600"}`}
                  >
                    {formData.isActive
                      ? "Active • Visible to public"
                      : "Inactive • Hidden"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Botón flotante para móviles */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-3 sm:hidden z-10">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <Link
              href="/admin/harvests"
              className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm"
            >
              Cancel
            </Link>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={loading}
              className="px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white mr-1.5"></div>
                  Creating...
                </>
              ) : (
                <>
                  <span className="mr-1.5">✓</span>
                  Create Harvest
                </>
              )}
            </button>
          </div>
        </div>

        {/* Añadir padding bottom para evitar que el botón flotante tape el contenido */}
        <style jsx global>{`
          @media (max-width: 640px) {
            .min-h-screen {
              padding-bottom: 80px;
            }
          }
        `}</style>
      </div>
    </AdminGuard>
  );
}
