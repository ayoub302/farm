"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AdminGuard from "@/components/AdminGuard";
import {
  ArrowLeft,
  Save,
  X,
  Upload,
  Calendar,
  Package,
  DollarSign,
  Sprout,
  Info,
  CheckCircle,
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
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

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
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Link
                  href="/admin/harvests"
                  className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back to Harvests
                </Link>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Create New Harvest
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Add a new harvest product to your farm
                  </p>
                </div>
              </div>
            </div>

            {/* Info Card */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <div className="flex items-start">
                <Info className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-blue-900 mb-1">
                    Harvest Information
                  </h3>
                  <p className="text-sm text-blue-700">
                    Harvests will appear on the public calendar and can be
                    linked to activities. Make sure to provide information in
                    both Arabic and French.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Error and Success Messages */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                <div className="flex items-center">
                  <X className="w-5 h-5 mr-2" />
                  {error}
                </div>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  {success}
                </div>
              </div>
            )}

            {/* Basic Information Card */}
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                <Sprout className="w-5 h-5 mr-2 text-green-600" />
                Basic Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Product Name - Arabic */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name (Arabic) *
                  </label>
                  <input
                    type="text"
                    name="productAr"
                    value={formData.productAr}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="اسم المنتج بالعربية"
                    required
                  />
                </div>

                {/* Product Name - French */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name (French) *
                  </label>
                  <input
                    type="text"
                    name="productFr"
                    value={formData.productFr}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Nom du produit en français"
                    required
                  />
                </div>

                {/* Icon */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Icon
                  </label>
                  <div className="grid grid-cols-6 gap-2">
                    {iconOptions.map((icon) => (
                      <button
                        key={icon.value}
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, icon: icon.value }))
                        }
                        className={`p-2 text-2xl rounded-lg border ${
                          formData.icon === icon.value
                            ? "border-green-500 bg-green-50"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                        title={icon.label}
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
                    className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Emoji icon"
                  />
                </div>

                {/* Season */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Season *
                  </label>
                  <select
                    name="season"
                    value={formData.season}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    {seasonOptions.map((season) => (
                      <option key={season.value} value={season.value}>
                        {season.labelFr} / {season.labelAr}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Year */}
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Next Harvest Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Next Harvest Date *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="date"
                      name="nextHarvest"
                      value={formData.nextHarvest}
                      onChange={handleChange}
                      min={getMinDate()}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Select a future date for the next harvest
                  </p>
                </div>
              </div>
            </div>

            {/* Status and Availability Card */}
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                <Info className="w-5 h-5 mr-2 text-blue-600" />
                Status & Availability
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="الحالة بالعربية"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="التوفر بالعربية"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Disponibilité en français"
                  />
                </div>

                {/* Active Status */}
                <div className="md:col-span-2">
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
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">
                Description
              </h2>

              <div className="space-y-6">
                {/* Description - Arabic */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (Arabic)
                  </label>
                  <textarea
                    name="descriptionAr"
                    value={formData.descriptionAr}
                    onChange={handleChange}
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Description du produit en français"
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                <div className="text-sm text-gray-500">
                  All fields marked with * are required
                </div>
                <div className="flex space-x-4">
                  <Link
                    href="/admin/harvests"
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Create Harvest
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>

          {/* Preview Card */}
          <div className="mt-8 bg-gradient-to-r from-green-50 to-emerald-100 rounded-xl shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Preview
            </h2>
            <div className="bg-white rounded-lg p-4 border">
              <div className="flex items-center mb-4">
                <span className="text-2xl mr-3">{formData.icon}</span>
                <div>
                  <h3 className="font-semibold text-gray-800">
                    {formData.productFr}
                  </h3>
                  <p className="text-sm text-gray-600">{formData.productAr}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Status:</span>
                  <span className="ml-2 font-medium">{formData.statusFr}</span>
                </div>
                <div>
                  <span className="text-gray-500">Season:</span>
                  <span className="ml-2 font-medium">
                    {formData.season} {formData.year}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Next Harvest:</span>
                  <span className="ml-2 font-medium">
                    {formData.nextHarvest
                      ? new Date(formData.nextHarvest).toLocaleDateString()
                      : "Not set"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Availability:</span>
                  <span className="ml-2 font-medium">
                    {formData.availabilityFr}
                  </span>
                </div>
              </div>
              {formData.descriptionFr && (
                <div className="mt-4 pt-4 border-t">
                  <h4 className="text-sm font-medium text-gray-700 mb-1">
                    Description:
                  </h4>
                  <p className="text-sm text-gray-600">
                    {formData.descriptionFr}
                  </p>
                </div>
              )}
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center">
                  <div
                    className={`h-2 w-2 rounded-full mr-2 ${formData.isActive ? "bg-green-500" : "bg-red-500"}`}
                  ></div>
                  <span
                    className={`text-sm font-medium ${formData.isActive ? "text-green-600" : "text-red-600"}`}
                  >
                    {formData.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
