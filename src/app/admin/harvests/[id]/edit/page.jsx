// app/admin/harvests/[id]/edit/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Loader2, AlertCircle } from "lucide-react";
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
  const seasons = ["Spring", "Summer", "Autumn", "Winter"];

  if (loading) {
    return (
      <AdminGuard>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        </div>
      </AdminGuard>
    );
  }

  if (error && !harvest) {
    return (
      <AdminGuard>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-4xl mx-auto px-4">
            <button
              onClick={() => router.push("/admin/harvests")}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-8"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Harvests
            </button>

            <div className="bg-white rounded-xl shadow p-8 text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {error || "Harvest Not Found"}
              </h2>
              <p className="text-gray-600 mb-6">
                Cannot edit this harvest because it doesn&apos;t exist or has
                been deleted.
              </p>
              <button
                onClick={() => router.push("/admin/harvests")}
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
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
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.push(`/admin/harvests/${params.id}`)}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Harvest Details
            </button>

            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Edit Harvest</h1>
              <p className="text-gray-600 mt-1">Update harvest information</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  <span>{error}</span>
                </div>
              </div>
            )}
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-xl shadow p-6"
          >
            <div className="space-y-6">
              {/* Icon Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Icon
                </label>
                <div className="flex flex-wrap gap-3">
                  {icons.map((icon) => (
                    <button
                      type="button"
                      key={icon}
                      onClick={() => setFormData((prev) => ({ ...prev, icon }))}
                      className={`text-2xl p-3 rounded-lg border-2 transition ${
                        formData.icon === icon
                          ? "border-green-500 bg-green-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Product Names */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name (French) *
                  </label>
                  <input
                    type="text"
                    name="productFr"
                    value={formData.productFr}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., Pommes"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name (Arabic) *
                  </label>
                  <input
                    type="text"
                    name="productAr"
                    value={formData.productAr}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-right"
                    placeholder="e.g., تفاح"
                  />
                </div>
              </div>

              {/* Season and Year */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Season *
                  </label>
                  <select
                    name="season"
                    value={formData.season}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Next Harvest Date */}
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {/* Status (Available) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status (French)
                  </label>
                  <input
                    type="text"
                    name="statusFr"
                    value={formData.statusFr}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-right"
                    placeholder="e.g., متوفر"
                  />
                </div>
              </div>

              {/* Availability */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Availability (French)
                  </label>
                  <input
                    type="text"
                    name="availabilityFr"
                    value={formData.availabilityFr}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-right"
                    placeholder="e.g., متاح للحصاد"
                  />
                </div>
              </div>

              {/* Descriptions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (French)
                  </label>
                  <textarea
                    name="descriptionFr"
                    value={formData.descriptionFr}
                    onChange={handleChange}
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-right"
                    placeholder="Describe the harvest in Arabic..."
                  />
                </div>
              </div>

              {/* Active Status */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="h-4 w-4 text-green-600 rounded focus:ring-green-500"
                />
                <label
                  htmlFor="isActive"
                  className="ml-2 text-sm text-gray-700"
                >
                  This harvest is currently active and visible to users
                </label>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-end">
              <button
                type="button"
                onClick={() => router.push(`/admin/harvests/${params.id}`)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px]"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminGuard>
  );
}
