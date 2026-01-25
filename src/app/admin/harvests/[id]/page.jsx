// app/admin/harvests/[id]/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Sprout,
  Calendar,
  Package,
  CheckCircle,
  XCircle,
  Edit,
  Activity,
  Users,
  MapPin,
  Clock,
} from "lucide-react";
import AdminGuard from "@/components/AdminGuard";
import Link from "next/link";

export default function ViewHarvestPage() {
  const router = useRouter();
  const params = useParams();
  const [harvest, setHarvest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      } catch (err) {
        console.error("Error fetching harvest:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHarvest();
  }, [params.id]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <AdminGuard>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </AdminGuard>
    );
  }

  if (error || !harvest) {
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
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {error || "Harvest Not Found"}
              </h2>
              <p className="text-gray-600 mb-6">
                The harvest you&apos;re looking for doesn&apos;t exist or has
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
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.push("/admin/harvests")}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Harvests
            </button>

            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <div className="flex items-center mb-2">
                  <span className="text-3xl mr-3">{harvest.icon}</span>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {harvest.productFr}
                  </h1>
                </div>
                <p className="text-xl text-gray-600">{harvest.productAr}</p>
              </div>

              <div className="mt-4 md:mt-0">
                <Link
                  href={`/admin/harvests/${harvest.id}/edit`}
                  className="flex items-center gap-2 bg-yellow-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-yellow-700 transition"
                >
                  <Edit className="w-5 h-5" />
                  Edit Harvest
                </Link>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Harvest Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Overview Card */}
              <div className="bg-white rounded-xl shadow p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Harvest Details
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Season
                    </label>
                    <p className="text-lg font-semibold text-gray-900">
                      {harvest.season} {harvest.year}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Next Harvest Date
                    </label>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-green-600 mr-2" />
                      <p className="text-lg font-semibold text-gray-900">
                        {formatDate(harvest.nextHarvest)}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Status
                    </label>
                    <div className="flex items-center">
                      {harvest.isActive ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                            Active
                          </span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 text-red-600 mr-2" />
                          <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                            Inactive
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Availability
                    </label>
                    <p className="text-lg font-semibold text-gray-900">
                      {harvest.availabilityFr} / {harvest.availabilityAr}
                    </p>
                  </div>
                </div>

                {/* Description */}
                {harvest.descriptionFr && (
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-500 mb-2">
                      Description
                    </label>
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-gray-700">{harvest.descriptionFr}</p>
                      </div>
                      {harvest.descriptionAr && (
                        <div className="p-4 bg-gray-50 rounded-lg text-right">
                          <p className="text-gray-700">
                            {harvest.descriptionAr}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Activities Section */}
              {harvest._count.activities > 0 && (
                <div className="bg-white rounded-xl shadow p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center">
                      <Activity className="w-5 h-5 mr-2 text-green-600" />
                      Related Activities ({harvest._count.activities})
                    </h2>
                    <Link
                      href={`/admin/activities?harvest=${harvest.id}`}
                      className="text-green-600 hover:text-green-700 font-medium"
                    >
                      View All
                    </Link>
                  </div>

                  {harvest.activities && harvest.activities.length > 0 ? (
                    <div className="space-y-4">
                      {harvest.activities.slice(0, 3).map((activity) => (
                        <div
                          key={activity.id}
                          className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium text-gray-900">
                                {activity.titleFr}
                              </h3>
                              <p className="text-sm text-gray-500">
                                {activity.titleAr}
                              </p>
                            </div>
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                activity.status === "completed"
                                  ? "bg-green-100 text-green-800"
                                  : activity.status === "upcoming"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {activity.status}
                            </span>
                          </div>
                          <div className="mt-2 flex items-center text-sm text-gray-600">
                            <Calendar className="w-4 h-4 mr-1" />
                            <span>{formatDate(activity.date)}</span>
                            <MapPin className="w-4 h-4 ml-4 mr-1" />
                            <span>{activity.location}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">
                      No activities found for this harvest.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Right Column - Statistics */}
            <div className="space-y-6">
              {/* Stats Card */}
              <div className="bg-white rounded-xl shadow p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Statistics
                </h2>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center">
                      <Sprout className="w-5 h-5 text-green-600 mr-3" />
                      <div>
                        <p className="text-sm text-gray-600">
                          Total Activities
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {harvest._count.activities}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center">
                      <Users className="w-5 h-5 text-blue-600 mr-3" />
                      <div>
                        <p className="text-sm text-gray-600">Total Bookings</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {harvest._count.bookings}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center">
                      <Package className="w-5 h-5 text-purple-600 mr-3" />
                      <div>
                        <p className="text-sm text-gray-600">Products</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {harvest._count.products}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 text-orange-600 mr-3" />
                      <div>
                        <p className="text-sm text-gray-600">Calendar Events</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {harvest._count.calendarEvents}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline Card */}
              <div className="bg-white rounded-xl shadow p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Timeline
                </h2>

                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="w-3 h-3 bg-green-500 rounded-full mt-1 mr-3"></div>
                    <div>
                      <p className="font-medium text-gray-900">
                        Harvest Created
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDate(harvest.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mt-1 mr-3"></div>
                    <div>
                      <p className="font-medium text-gray-900">Last Updated</p>
                      <p className="text-sm text-gray-500">
                        {formatDate(harvest.updatedAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full mt-1 mr-3"></div>
                    <div>
                      <p className="font-medium text-gray-900">Next Harvest</p>
                      <p className="text-sm text-gray-500">
                        {formatDate(harvest.nextHarvest)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Quick Actions
                </h2>

                <div className="space-y-3">
                  <Link
                    href={`/admin/harvests/${harvest.id}/edit`}
                    className="flex items-center justify-center w-full bg-yellow-50 text-yellow-700 px-4 py-3 rounded-lg font-medium hover:bg-yellow-100 transition"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Harvest
                  </Link>

                  <Link
                    href={`/admin/activities/new?harvest=${harvest.id}`}
                    className="flex items-center justify-center w-full bg-green-50 text-green-700 px-4 py-3 rounded-lg font-medium hover:bg-green-100 transition"
                  >
                    <Activity className="w-4 h-4 mr-2" />
                    Add Activity
                  </Link>

                  <Link
                    href={`/admin/products/new?harvest=${harvest.id}`}
                    className="flex items-center justify-center w-full bg-blue-50 text-blue-700 px-4 py-3 rounded-lg font-medium hover:bg-blue-100 transition"
                  >
                    <Package className="w-4 h-4 mr-2" />
                    Add Product
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
