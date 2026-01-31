"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import AdminGuard from "@/components/AdminGuard";
import {
  ArrowLeft,
  Save,
  Calendar,
  Image as ImageIcon,
  MapPin,
  Users,
  Clock,
  DollarSign,
  FileText,
  AlertCircle,
  Globe,
  Tag,
  Star,
  CheckCircle,
} from "lucide-react";

export default function NewActivityPage() {
  const { isLoaded, userId } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  // Imágenes reales por categoría - SOLO LAS QUE TIENES EN PUBLIC/
  const categoryImages = {
    visit: "/visita.png",
    workshop: "/martillo.png",
    harvest: "/cosecha.png", // Cambiado a cosecha.png
    educational: "/educacion.png",
    family: "/familia.png",
  };

  // Form state
  const [formData, setFormData] = useState({
    // Basic Information
    titleFr: "",
    titleAr: "",
    descriptionFr: "",
    descriptionAr: "",
    category: "visit",

    // Schedule
    date: "",
    endDate: "",
    duration: 2,

    // Location & Capacity
    location: "",
    maxCapacity: 20,

    // Additional Info
    requirements: "",
    whatToBring: "",
    imageUrl: "/visita.png", // Imagen inicial
    featured: false,

    // Recurring options
    isRecurring: false,
    recurrenceType: "none",
    recurrenceEndDate: "",
    recurrenceDays: [],
  });

  // Days of week for recurrence
  const daysOfWeek = [
    { id: "monday", label: "Monday", value: 1 },
    { id: "tuesday", label: "Tuesday", value: 2 },
    { id: "wednesday", label: "Wednesday", value: 3 },
    { id: "thursday", label: "Thursday", value: 4 },
    { id: "friday", label: "Friday", value: 5 },
    { id: "saturday", label: "Saturday", value: 6 },
    { id: "sunday", label: "Sunday", value: 0 },
  ];

  // Activity categories SOLO CON IMÁGENES REALES
  const categories = [
    {
      value: "visit",
      label: "Farm Visit",
      description: "Guided tours and farm exploration",
      color: "bg-blue-100 text-blue-800",
      borderColor: "border-blue-200",
      image: "/visita.png",
    },
    {
      value: "workshop",
      label: "Workshop",
      description: "Practical learning sessions",
      color: "bg-yellow-100 text-yellow-800",
      borderColor: "border-yellow-200",
      image: "/martillo.png",
    },
    {
      value: "harvest",
      label: "Harvest",
      description: "Fruit and vegetable picking",
      color: "bg-green-100 text-green-800",
      borderColor: "border-green-200",
      image: "/cosecha.png", // Cambiado a cosecha.png
    },
    {
      value: "educational",
      label: "Educational",
      description: "Learning about agriculture",
      color: "bg-purple-100 text-purple-800",
      borderColor: "border-purple-200",
      image: "/educacion.png",
    },
    {
      value: "family",
      label: "Family Activity",
      description: "Activities for all ages",
      color: "bg-indigo-100 text-indigo-800",
      borderColor: "border-indigo-200",
      image: "/familia.png",
    },
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleCategoryChange = (category) => {
    setFormData((prev) => ({
      ...prev,
      category: category.value,
      imageUrl: category.image,
    }));
  };

  const handleRecurrenceDayToggle = (dayValue) => {
    setFormData((prev) => {
      const newDays = prev.recurrenceDays.includes(dayValue)
        ? prev.recurrenceDays.filter((d) => d !== dayValue)
        : [...prev.recurrenceDays, dayValue];

      return { ...prev, recurrenceDays: newDays };
    });
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.titleFr.trim())
      newErrors.titleFr = "French title is required";
    if (!formData.titleAr.trim())
      newErrors.titleAr = "Arabic title is required";
    if (!formData.descriptionFr.trim())
      newErrors.descriptionFr = "French description is required";
    if (!formData.descriptionAr.trim())
      newErrors.descriptionAr = "Arabic description is required";
    if (!formData.date) newErrors.date = "Start date is required";
    if (!formData.location.trim()) newErrors.location = "Location is required";
    if (!formData.maxCapacity || formData.maxCapacity < 1)
      newErrors.maxCapacity = "Valid capacity is required";

    // Date validation
    if (
      formData.endDate &&
      new Date(formData.endDate) <= new Date(formData.date)
    ) {
      newErrors.endDate = "End date must be after start date";
    }

    // Recurrence validation
    if (
      formData.isRecurring &&
      formData.recurrenceType !== "none" &&
      !formData.recurrenceEndDate
    ) {
      newErrors.recurrenceEndDate = "Recurrence end date is required";
    }

    // Weekly recurrence requires at least one day
    if (
      formData.isRecurring &&
      formData.recurrenceType === "weekly" &&
      formData.recurrenceDays.length === 0
    ) {
      newErrors.recurrenceDays =
        "Select at least one day for weekly recurrence";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      // Prepare data for API
      const activityData = {
        ...formData,
        maxCapacity: parseInt(formData.maxCapacity),
        duration: parseInt(formData.duration),
        date: new Date(formData.date).toISOString(),
        endDate: formData.endDate
          ? new Date(formData.endDate).toISOString()
          : null,
        recurrenceEndDate: formData.recurrenceEndDate
          ? new Date(formData.recurrenceEndDate).toISOString()
          : null,
        status: "upcoming",
        currentParticipants: 0,
      };

      // Send to API
      const response = await fetch("/api/admin/activities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(activityData),
      });

      if (response.ok) {
        const result = await response.json();
        setSuccess(true);

        // Reset form
        setFormData({
          titleFr: "",
          titleAr: "",
          descriptionFr: "",
          descriptionAr: "",
          category: "visit",
          date: "",
          endDate: "",
          duration: 2,
          location: "",
          maxCapacity: 20,
          requirements: "",
          whatToBring: "",
          imageUrl: "/visita.png",
          featured: false,
          isRecurring: false,
          recurrenceType: "none",
          recurrenceEndDate: "",
          recurrenceDays: [],
        });

        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccess(false);
        }, 3000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create activity");
      }
    } catch (error) {
      console.error("Error creating activity:", error);
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2d5a27] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-md w-full">
          <div className="bg-yellow-100 p-6 rounded-xl mb-6">
            <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Authentication Required
            </h2>
            <p className="text-gray-600">
              Please sign in to create activities.
            </p>
          </div>
          <Link
            href="/admin/dashboard"
            className="inline-block w-full bg-[#2d5a27] text-white px-6 py-4 rounded-lg hover:bg-green-800 transition font-medium"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <Link
                  href="/admin/dashboard"
                  className="mr-3 text-gray-600 hover:text-gray-900 p-2 -ml-2"
                >
                  <ArrowLeft className="w-6 h-6" />
                </Link>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    Publish Activity
                  </h1>
                  <p className="text-gray-600 mt-1 text-sm sm:text-base">
                    Create and publish new farm activities
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-8 py-6">
          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 sm:p-6">
              <div className="flex items-start">
                <div className="p-2 bg-green-100 rounded-lg mr-3 sm:mr-4 flex-shrink-0">
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-green-800 text-sm sm:text-base">
                    Activity Published Successfully!
                  </h3>
                  <p className="text-green-600 text-xs sm:text-sm mt-1">
                    Your activity has been published and is now visible on the
                    farm calendar.
                  </p>
                </div>
              </div>
            </div>
          )}

          {errors.submit && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 sm:p-6">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-red-800 text-sm sm:text-base">
                    Error
                  </h3>
                  <p className="text-red-600 text-xs sm:text-sm mt-1">
                    {errors.submit}
                  </p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
              <div className="lg:col-span-2 space-y-6">
                {/* Activity Information */}
                <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6 pb-3 border-b flex items-center">
                    <Globe className="w-5 h-5 mr-2 flex-shrink-0" />
                    Activity Information
                  </h2>

                  <div className="space-y-4 sm:space-y-6">
                    <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Title (French) *
                        </label>
                        <input
                          type="text"
                          name="titleFr"
                          value={formData.titleFr}
                          onChange={handleChange}
                          className={`w-full px-4 py-3 text-base sm:text-sm border rounded-lg focus:ring-2 focus:ring-[#2d5a27] focus:border-transparent ${
                            errors.titleFr
                              ? "border-red-300"
                              : "border-gray-300"
                          }`}
                          placeholder="e.g., Farm Discovery Tour"
                        />
                        {errors.titleFr && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.titleFr}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Title (Arabic) *
                        </label>
                        <input
                          type="text"
                          name="titleAr"
                          value={formData.titleAr}
                          onChange={handleChange}
                          dir="rtl"
                          className={`w-full px-4 py-3 text-base sm:text-sm border rounded-lg focus:ring-2 focus:ring-[#2d5a27] focus:border-transparent ${
                            errors.titleAr
                              ? "border-red-300"
                              : "border-gray-300"
                          }`}
                          placeholder="جولة اكتشاف المزرعة"
                        />
                        {errors.titleAr && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.titleAr}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description (French) *
                        </label>
                        <textarea
                          name="descriptionFr"
                          value={formData.descriptionFr}
                          onChange={handleChange}
                          rows={4}
                          className={`w-full px-4 py-3 text-base sm:text-sm border rounded-lg focus:ring-2 focus:ring-[#2d5a27] focus:border-transparent ${
                            errors.descriptionFr
                              ? "border-red-300"
                              : "border-gray-300"
                          }`}
                          placeholder="Describe the activity in French..."
                        />
                        {errors.descriptionFr && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.descriptionFr}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description (Arabic) *
                        </label>
                        <textarea
                          name="descriptionAr"
                          value={formData.descriptionAr}
                          onChange={handleChange}
                          rows={4}
                          dir="rtl"
                          className={`w-full px-4 py-3 text-base sm:text-sm border rounded-lg focus:ring-2 focus:ring-[#2d5a27] focus:border-transparent ${
                            errors.descriptionAr
                              ? "border-red-300"
                              : "border-gray-300"
                          }`}
                          placeholder="صف النشاط بالعربية..."
                        />
                        {errors.descriptionAr && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.descriptionAr}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        <Tag className="w-4 h-4 inline mr-2" />
                        Category (Select to change image)
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                        {categories.map((cat) => (
                          <button
                            key={cat.value}
                            type="button"
                            onClick={() => handleCategoryChange(cat)}
                            className={`p-3 rounded-lg border text-center transition flex flex-col items-center min-h-[100px] sm:min-h-0 ${
                              formData.category === cat.value
                                ? `${cat.color} ${cat.borderColor} ring-2 ring-offset-2 ring-[#2d5a27]`
                                : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                            }`}
                          >
                            <div className="relative w-8 h-8 sm:w-10 sm:h-10 mb-2">
                              <Image
                                src={cat.image}
                                alt={cat.label}
                                fill
                                className="object-contain"
                                sizes="(max-width: 640px) 32px, 40px"
                              />
                            </div>
                            <span className="font-medium text-xs sm:text-sm">
                              {cat.label}
                            </span>
                            <span className="text-xs text-gray-500 mt-1 hidden sm:block">
                              {cat.description}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Schedule & Location */}
                <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6 pb-3 border-b flex items-center">
                    <Calendar className="w-5 h-5 mr-2 flex-shrink-0" />
                    Schedule & Location
                  </h2>

                  <div className="space-y-4 sm:space-y-6">
                    <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Calendar className="w-4 h-4 inline mr-2" />
                          Start Date & Time *
                        </label>
                        <input
                          type="datetime-local"
                          name="date"
                          value={formData.date}
                          onChange={handleChange}
                          className={`w-full px-4 py-3 text-base sm:text-sm border rounded-lg focus:ring-2 focus:ring-[#2d5a27] focus:border-transparent ${
                            errors.date ? "border-red-300" : "border-gray-300"
                          }`}
                        />
                        {errors.date && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.date}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Clock className="w-4 h-4 inline mr-2" />
                          End Date & Time
                        </label>
                        <input
                          type="datetime-local"
                          name="endDate"
                          value={formData.endDate}
                          onChange={handleChange}
                          className={`w-full px-4 py-3 text-base sm:text-sm border rounded-lg focus:ring-2 focus:ring-[#2d5a27] focus:border-transparent ${
                            errors.endDate
                              ? "border-red-300"
                              : "border-gray-300"
                          }`}
                        />
                        {errors.endDate && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.endDate}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Clock className="w-4 h-4 inline mr-2" />
                          Duration (hours)
                        </label>
                        <input
                          type="number"
                          name="duration"
                          value={formData.duration}
                          onChange={handleChange}
                          min="1"
                          max="24"
                          className="w-full px-4 py-3 text-base sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d5a27] focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <MapPin className="w-4 h-4 inline mr-2" />
                          Location *
                        </label>
                        <input
                          type="text"
                          name="location"
                          value={formData.location}
                          onChange={handleChange}
                          className={`w-full px-4 py-3 text-base sm:text-sm border rounded-lg focus:ring-2 focus:ring-[#2d5a27] focus:border-transparent ${
                            errors.location
                              ? "border-red-300"
                              : "border-gray-300"
                          }`}
                          placeholder="e.g., Main Farm, Greenhouse, Olive Grove"
                        />
                        {errors.location && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.location}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6 pb-3 border-b">
                    Additional Information
                  </h2>

                  <div className="space-y-4 sm:space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FileText className="w-4 h-4 inline mr-2" />
                        Requirements
                      </label>
                      <textarea
                        name="requirements"
                        value={formData.requirements}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-4 py-3 text-base sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d5a27] focus:border-transparent"
                        placeholder="e.g., Age restrictions, physical requirements, previous experience..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        What to Bring
                      </label>
                      <textarea
                        name="whatToBring"
                        value={formData.whatToBring}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-4 py-3 text-base sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d5a27] focus:border-transparent"
                        placeholder="e.g., Comfortable shoes, hat, water bottle, sunscreen..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Image Preview */}
                <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6 pb-3 border-b flex items-center">
                    <ImageIcon className="w-5 h-5 mr-2 flex-shrink-0" />
                    Activity Image
                  </h2>

                  <div className="space-y-4">
                    <div className="relative">
                      <div className="w-full aspect-video sm:h-48 relative bg-gradient-to-br from-green-50 to-emerald-100 rounded-lg overflow-hidden">
                        <Image
                          src={formData.imageUrl}
                          alt={formData.category}
                          fill
                          className="object-contain p-4"
                          sizes="(max-width: 768px) 100vw, 33vw"
                          priority
                        />
                      </div>

                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <div className="relative w-10 h-10 mr-3 flex-shrink-0">
                            <Image
                              src={formData.imageUrl}
                              alt={formData.category}
                              fill
                              className="object-contain"
                              sizes="40px"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-800 truncate">
                              {categories.find(
                                (c) => c.value === formData.category,
                              )?.label || "Farm Visit"}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                              {formData.imageUrl.replace("/", "")}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Capacity & Pricing */}
                <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6 pb-3 border-b flex items-center">
                    <Users className="w-5 h-5 mr-2 flex-shrink-0" />
                    Capacity & Participation
                  </h2>

                  <div className="space-y-4 sm:space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Users className="w-4 h-4 inline mr-2" />
                        Maximum Capacity *
                      </label>
                      <input
                        type="number"
                        name="maxCapacity"
                        value={formData.maxCapacity}
                        onChange={handleChange}
                        min="1"
                        max="100"
                        className={`w-full px-4 py-3 text-base sm:text-sm border rounded-lg focus:ring-2 focus:ring-[#2d5a27] focus:border-transparent ${
                          errors.maxCapacity
                            ? "border-red-300"
                            : "border-gray-300"
                        }`}
                      />
                      {errors.maxCapacity && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.maxCapacity}
                        </p>
                      )}
                      <p className="mt-1 text-xs sm:text-sm text-gray-500">
                        Maximum number of participants
                      </p>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-start">
                        <div className="p-1 bg-green-100 rounded mr-3 flex-shrink-0">
                          <DollarSign className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-green-800 text-sm sm:text-base">
                            All activities are free
                          </p>
                          <p className="text-xs sm:text-sm text-green-600 mt-1">
                            Farm activities are offered at no cost to visitors.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recurrence Settings */}
                <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6 pb-3 border-b">
                    Recurrence Settings
                  </h2>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 font-medium text-sm sm:text-base">
                        Recurring Activity
                      </span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="isRecurring"
                          checked={formData.isRecurring}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              isRecurring: e.target.checked,
                              recurrenceType: e.target.checked
                                ? "weekly"
                                : "none",
                            }))
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2d5a27]"></div>
                      </label>
                    </div>

                    {formData.isRecurring && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Recurrence Type
                          </label>
                          <select
                            name="recurrenceType"
                            value={formData.recurrenceType}
                            onChange={handleChange}
                            className="w-full px-4 py-3 text-base sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d5a27] focus:border-transparent"
                          >
                            <option value="none">No recurrence</option>
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Recurrence End Date *
                          </label>
                          <input
                            type="date"
                            name="recurrenceEndDate"
                            value={formData.recurrenceEndDate}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 text-base sm:text-sm border rounded-lg focus:ring-2 focus:ring-[#2d5a27] focus:border-transparent ${
                              errors.recurrenceEndDate
                                ? "border-red-300"
                                : "border-gray-300"
                            }`}
                          />
                          {errors.recurrenceEndDate && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors.recurrenceEndDate}
                            </p>
                          )}
                        </div>

                        {formData.recurrenceType === "weekly" && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Repeat on days *
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                              {daysOfWeek.map((day) => (
                                <button
                                  key={day.id}
                                  type="button"
                                  onClick={() =>
                                    handleRecurrenceDayToggle(day.value)
                                  }
                                  className={`p-2 rounded-lg text-xs sm:text-sm text-center transition min-h-[44px] ${
                                    formData.recurrenceDays.includes(day.value)
                                      ? "bg-[#2d5a27] text-white"
                                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                  }`}
                                >
                                  {day.label}
                                </button>
                              ))}
                            </div>
                            {errors.recurrenceDays && (
                              <p className="mt-1 text-sm text-red-600">
                                {errors.recurrenceDays}
                              </p>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Featured & Submit */}
                <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Star className="w-5 h-5 text-yellow-500 mr-3 flex-shrink-0" />
                      <div>
                        <span className="font-medium text-gray-800 text-sm sm:text-base">
                          Feature this activity
                        </span>
                        <p className="text-xs sm:text-sm text-gray-500">
                          Show on homepage
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="featured"
                        checked={formData.featured}
                        onChange={handleChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center px-6 py-4 bg-[#2d5a27] text-white rounded-lg hover:bg-green-800 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-base sm:text-lg shadow-md min-h-[56px]"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                        Publishing...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5 mr-3" />
                        Publish Activity
                      </>
                    )}
                  </button>

                  <p className="text-xs text-gray-500 text-center">
                    The activity will be published immediately.
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </AdminGuard>
  );
}
