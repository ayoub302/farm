// app/admin/harvests/[id]/edit/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Loader2,
  AlertCircle,
  ChevronLeft,
} from "lucide-react";
import AdminGuard from "@/components/AdminGuard";

export default function EditHarvestPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [harvest, setHarvest] = useState(null);

  const [formData, setFormData] = useState({
    productAr: "",
    productFr: "",
    icon: "🌱",
    season: "Spring",
    year: new Date().getFullYear(),
    nextHarvest: "",
    isActive: true,
    statusAr: "متوفر",
    statusFr: "Disponible",
    availabilityAr: "متاح للحصاد",
    availabilityFr: "Disponible pour récolte",
    descriptionAr: "",
    descriptionFr: "",
  });

  useEffect(() => {
    const fetchHarvest = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/admin/harvests/${params.id}`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success === false || !data.harvest) {
          throw new Error(data.error || "Harvest not found");
        }

        setHarvest(data.harvest);

        // Formatear fecha para el input
        const nextHarvest = new Date(data.harvest.nextHarvest);
        const formattedDate = nextHarvest.toISOString().split("T")[0];

        setFormData({
          productAr: data.harvest.productAr || "",
          productFr: data.harvest.productFr || "",
          icon: data.harvest.icon || "🌱",
          season: data.harvest.season || "Spring",
          year: data.harvest.year || new Date().getFullYear(),
          nextHarvest: formattedDate,
          isActive: data.harvest.isActive !== false,
          statusAr: data.harvest.statusAr || "متوفر",
          statusFr: data.harvest.statusFr || "Disponible",
          availabilityAr: data.harvest.availabilityAr || "متاح للحصاد",
          availabilityFr:
            data.harvest.availabilityFr || "Disponible pour récolte",
          descriptionAr: data.harvest.descriptionAr || "",
          descriptionFr: data.harvest.descriptionFr || "",
        });
      } catch (err) {
        console.error("Error fetching harvest:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchHarvest();
  }, [params.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      // Validaciones básicas
      if (!formData.productAr.trim() || !formData.productFr.trim()) {
        throw new Error("Product name in both languages is required");
      }

      if (!formData.nextHarvest) {
        throw new Error("Next harvest date is required");
      }

      const response = await fetch(`/api/admin/harvests/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(data.error || "Failed to update harvest");
      }

      alert("✅ Harvest updated successfully!");
      router.push(`/admin/harvests/${params.id}`);
    } catch (err) {
      console.error("Error updating harvest:", err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value === "" ? "" : parseInt(value),
    }));
  };

  // Iconos disponibles
  const icons = [
    "🌱",
    "🌾",
    "🍎",
    "🍇",
    "🍓",
    "🥕",
    "🌽",
    "🥬",
    "🍅",
    "🥒",
    "🌶️",
    "🍆",
    "🧅",
    "🧄",
    "🥔",
  ];

  // Temporadas
  const seasons = ["Spring", "Summer", "Autumn", "Winter", "All Year"];

  if (loading) {
    return (
      <AdminGuard>
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-green-600 mx-auto" />
            <p className="mt-4 text-gray-600 text-sm sm:text-base">
              Loading harvest...
            </p>
          </div>
        </div>
      </AdminGuard>
    );
  }

  if (error && !harvest) {
    return (
      <AdminGuard>
        <div className="min-h-screen bg-gray-50 py-4 sm:py-6 lg:py-8">
          <div className="max-w-4xl mx-auto px-3 sm:px-4">
            <button
              onClick={() => router.push("/admin/harvests")}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-6 p-1.5 -ml-1.5"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="ml-1 hidden sm:inline">Back to Harvests</span>
            </button>

            <div className="bg-white rounded-xl shadow p-4 sm:p-6 lg:p-8 text-center">
              <AlertCircle className="w-12 h-12 sm:w-16 sm:h-16 text-red-500 mx-auto mb-3 sm:mb-4" />
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                {error || "Harvest Not Found"}
              </h2>
              <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
                Cannot edit this harvest because it doesn&apos;t exist or has
                been deleted.
              </p>
              <button
                onClick={() => router.push("/admin/harvests")}
                className="bg-green-600 text-white px-4 py-3 sm:px-6 sm:py-3 rounded-lg font-semibold hover:bg-green-700 transition text-sm sm:text-base w-full sm:w-auto"
              >
                Return to Harvests List
              </button>
            </div>
          </div>
        </div>
      </AdminGuard>
    );
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50 py-4 sm:py-6 lg:py-8">
        <div className="max-w-4xl mx-auto px-3 sm:px-4">
          {/* Header optimizado para móvil */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center mb-4 sm:mb-6">
              <button
                onClick={() => router.push(`/admin/harvests/${params.id}`)}
                className="flex items-center text-gray-600 hover:text-gray-900 mr-3 p-1.5 -ml-1.5 sm:p-0 sm:ml-0"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="ml-1 hidden sm:inline text-sm sm:text-base">
                  Back to Details
                </span>
              </button>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">
                  Edit Harvest
                </h1>
                <p className="text-gray-600 mt-1 text-xs sm:text-sm truncate">
                  Update harvest information • ID: {params.id?.slice(0, 8)}...
                </p>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg mb-4 sm:mb-6">
                <div className="flex items-center">
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2 flex-shrink-0" />
                  <span className="text-sm sm:text-base">{error}</span>
                </div>
              </div>
            )}
          </div>

          {/* Formulario optimizado para móvil */}
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-xl shadow p-3 sm:p-4 lg:p-6"
          >
            <div className="space-y-4 sm:space-y-6">
              {/* Icon Selection optimizado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Icon
                </label>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {icons.map((icon) => (
                    <button
                      type="button"
                      key={icon}
                      onClick={() => setFormData((prev) => ({ ...prev, icon }))}
                      className={`text-xl sm:text-2xl p-1.5 sm:p-2 rounded-lg border transition ${
                        formData.icon === icon
                          ? "border-green-500 bg-green-50 scale-105"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      aria-label={`Select ${icon} icon`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  name="icon"
                  value={formData.icon}
                  onChange={handleChange}
                  className="mt-2 w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Custom icon emoji"
                />
              </div>

              {/* Product Names optimizado */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name (French) *
                  </label>
                  <input
                    type="text"
                    name="productFr"
                    value={formData.productFr}
                    onChange={handleChange}
                    required
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., Pommes"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name (Arabic) *
                  </label>
                  <input
                    type="text"
                    name="productAr"
                    value={formData.productAr}
                    onChange={handleChange}
                    required
                    dir="rtl"
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., تفاح"
                  />
                </div>
              </div>

              {/* Season and Year optimizado */}
              <div className="grid grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Season *
                  </label>
                  <select
                    name="season"
                    value={formData.season}
                    onChange={handleChange}
                    required
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    {seasons.map((season) => (
                      <option key={season} value={season}>
                        {season}
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
                    min="2020"
                    max="2030"
                    required
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Next Harvest Date optimizado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Next Harvest Date *
                </label>
                <input
                  type="date"
                  name="nextHarvest"
                  value={formData.nextHarvest}
                  onChange={handleChange}
                  required
                  className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {/* Status optimizado */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
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
                    placeholder="e.g., Disponible"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status (Arabic)
                  </label>
                  <input
                    type="text"
                    name="statusAr"
                    value={formData.statusAr}
                    onChange={handleChange}
                    dir="rtl"
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., متوفر"
                  />
                </div>
              </div>

              {/* Availability optimizado */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
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
                    placeholder="e.g., Disponible pour récolte"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Availability (Arabic)
                  </label>
                  <input
                    type="text"
                    name="availabilityAr"
                    value={formData.availabilityAr}
                    onChange={handleChange}
                    dir="rtl"
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., متاح للحصاد"
                  />
                </div>
              </div>

              {/* Descriptions optimizado */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
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
                    placeholder="Describe the harvest in French..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (Arabic)
                  </label>
                  <textarea
                    name="descriptionAr"
                    value={formData.descriptionAr}
                    onChange={handleChange}
                    rows="3"
                    dir="rtl"
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Describe the harvest in Arabic..."
                  />
                </div>
              </div>

              {/* Active Status optimizado */}
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="h-5 w-5 text-green-600 rounded focus:ring-green-500"
                />
                <label
                  htmlFor="isActive"
                  className="ml-3 text-sm text-gray-700"
                >
                  This harvest is currently active and visible to users
                </label>
              </div>
            </div>

            {/* Submit Buttons optimizado */}
            <div className="mt-6 sm:mt-8 flex flex-col-reverse sm:flex-row gap-3 sm:gap-4">
              <button
                type="button"
                onClick={() => router.push(`/admin/harvests/${params.id}`)}
                className="px-4 sm:px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition text-sm sm:text-base order-2 sm:order-1"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 sm:px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base order-1 sm:order-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Botón flotante para móviles */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-3 sm:hidden z-10">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <button
              type="button"
              onClick={() => router.push(`/admin/harvests/${params.id}`)}
              className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={saving}
              className="px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm"
            >
              {saving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5 mr-1.5" />
                  Save
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
