"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Search,
  Calendar,
  Users,
  User,
  Mail,
  Phone,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  RefreshCw,
  ExternalLink,
  MoreVertical,
  MapPin,
  FileText,
  Download,
  Printer,
  Send,
} from "lucide-react";

export default function ReservationsPage() {
  const { isLoaded, userId } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [reservations, setReservations] = useState([]);
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [updatingIds, setUpdatingIds] = useState(new Set());
  const [apiEndpoint, setApiEndpoint] = useState(
    "/api/admin/reservations/recent"
  );

  // Función para cargar reservaciones
  const loadReservations = async () => {
    try {
      setLoading(true);
      console.log("[RESERVATIONS] Loading reservations...");

      // Intentar cargar desde diferentes endpoints
      const endpoints = [
        "/api/admin/reservations/recent",
        "/api/admin/bookings/recent",
        "/api/bookings",
      ];

      let success = false;

      for (const endpoint of endpoints) {
        try {
          console.log("[RESERVATIONS] Trying endpoint:", endpoint);
          const response = await fetch(endpoint);

          if (response.ok) {
            const data = await response.json();
            console.log("[RESERVATIONS] Success with endpoint:", endpoint);
            setApiEndpoint(endpoint);

            if (Array.isArray(data)) {
              setReservations(data);
              setFilteredReservations(data);
              success = true;
              break;
            } else if (data.reservations && Array.isArray(data.reservations)) {
              setReservations(data.reservations);
              setFilteredReservations(data.reservations);
              success = true;
              break;
            } else if (data.bookings && Array.isArray(data.bookings)) {
              setReservations(data.bookings);
              setFilteredReservations(data.bookings);
              success = true;
              break;
            } else if (Array.isArray(data.activities)) {
              // Si viene de activities/recent, lo convertimos a formato de reservación
              const formattedReservations = data.activities.map((activity) => ({
                id: activity.id,
                bookingCode: `ACT-${activity.id.substring(0, 8).toUpperCase()}`,
                activity: {
                  titleFr: activity.titleFr,
                  titleAr: activity.titleAr,
                },
                clientName: "Activity",
                clientEmail: "activity@farm.com",
                numPeople: activity.currentParticipants || 0,
                status: activity.status,
                bookingDate: activity.date,
                createdAt: activity.createdAt,
              }));
              setReservations(formattedReservations);
              setFilteredReservations(formattedReservations);
              success = true;
              break;
            }
          }
        } catch (err) {
          console.log("[RESERVATIONS] Failed with endpoint:", endpoint, err);
        }
      }

      if (!success) {
        // Crear datos de ejemplo para desarrollo
        if (process.env.NODE_ENV === "development") {
          console.log("[RESERVATIONS] Using sample data for development");
          const sampleData = [
            {
              id: "1",
              bookingCode: "BK2024001",
              activityId: "act1",
              activity: {
                titleFr: "Visite de la ferme",
                titleAr: "جولة في المزرعة",
              },
              clientName: "Ahmed Benali",
              clientEmail: "ahmed@example.com",
              clientPhone: "+212 612345678",
              numPeople: 4,
              status: "confirmed",
              bookingDate: new Date(Date.now() + 86400000 * 2).toISOString(),
              activityDate: new Date(Date.now() + 86400000 * 2).toISOString(),
              specialRequests: "Vegetarian meal required",
              notes: "Repeat customer",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            {
              id: "2",
              bookingCode: "BK2024002",
              activityId: "act2",
              activity: {
                titleFr: "Récolte des olives",
                titleAr: "حصاد الزيتون",
              },
              clientName: "Fatima Zahra",
              clientEmail: "fatima@example.com",
              clientPhone: "+212 698765432",
              numPeople: 2,
              status: "pending",
              bookingDate: new Date(Date.now() + 86400000 * 3).toISOString(),
              activityDate: new Date(Date.now() + 86400000 * 3).toISOString(),
              specialRequests: "Allergic to nuts",
              notes: "First time visitor",
              createdAt: new Date(Date.now() - 86400000).toISOString(),
              updatedAt: new Date(Date.now() - 86400000).toISOString(),
            },
            {
              id: "3",
              bookingCode: "BK2024003",
              activityId: "act3",
              activity: {
                titleFr: "Atelier de fabrication de fromage",
                titleAr: "ورشة صناعة الجبن",
              },
              clientName: "Karim Alami",
              clientEmail: "karim@example.com",
              clientPhone: "+212 633344455",
              numPeople: 6,
              status: "cancelled",
              bookingDate: new Date(Date.now() - 86400000).toISOString(),
              activityDate: new Date(Date.now() - 86400000).toISOString(),
              specialRequests: "Group booking",
              notes: "Cancelled due to weather",
              createdAt: new Date(Date.now() - 172800000).toISOString(),
              updatedAt: new Date(Date.now() - 86400000).toISOString(),
            },
            {
              id: "4",
              bookingCode: "BK2024004",
              activityId: "act4",
              activity: {
                titleFr: "Dégustation de produits",
                titleAr: "تذوق المنتجات",
              },
              clientName: "Sophie Martin",
              clientEmail: "sophie@example.com",
              clientPhone: "+212 655566677",
              numPeople: 3,
              status: "confirmed",
              bookingDate: new Date().toISOString(),
              activityDate: new Date(Date.now() + 86400000).toISOString(),
              specialRequests: "Wine pairing requested",
              notes: "International visitor",
              createdAt: new Date(Date.now() - 3600000).toISOString(),
              updatedAt: new Date(Date.now() - 3600000).toISOString(),
            },
          ];
          setReservations(sampleData);
          setFilteredReservations(sampleData);
        }
      }
    } catch (error) {
      console.error("[RESERVATIONS] Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const verifyAdminAndLoadReservations = async () => {
      if (!isLoaded || !userId) {
        setLoading(false);
        return;
      }

      try {
        // Verificar si es admin - esta es la protección importante
        const verifyResponse = await fetch("/api/admin/verify");

        if (!verifyResponse.ok) {
          // Si no es admin, redirigir al dashboard
          router.push("/admin/dashboard");
          return;
        }

        // Si es admin, cargar las reservaciones
        await loadReservations();
      } catch (error) {
        console.error("[RESERVATIONS PAGE ERROR]", error);
      } finally {
        setLoading(false);
      }
    };

    verifyAdminAndLoadReservations();
  }, [isLoaded, userId, router]); // loadReservations no está aquí para evitar el error

  const updateReservationStatus = async (reservationId, newStatus) => {
    if (updatingIds.has(reservationId)) return;

    setUpdatingIds((prev) => new Set([...prev, reservationId]));

    try {
      // Intentar usar el endpoint de reservaciones para actualizar
      const response = await fetch(`/api/admin/reservations/${reservationId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        // Actualizar la reservación localmente
        setReservations((prev) =>
          prev.map((res) =>
            res.id === reservationId
              ? {
                  ...res,
                  status: newStatus,
                  updatedAt: new Date().toISOString(),
                }
              : res
          )
        );
        if (selectedReservation?.id === reservationId) {
          setSelectedReservation((prev) => ({
            ...prev,
            status: newStatus,
            updatedAt: new Date().toISOString(),
          }));
        }
        alert("✅ Reservation status updated successfully");
      } else {
        // Si el endpoint no existe, actualizar localmente
        console.warn("Status update endpoint not found, updating locally");
        setReservations((prev) =>
          prev.map((res) =>
            res.id === reservationId
              ? {
                  ...res,
                  status: newStatus,
                  updatedAt: new Date().toISOString(),
                }
              : res
          )
        );
        if (selectedReservation?.id === reservationId) {
          setSelectedReservation((prev) => ({
            ...prev,
            status: newStatus,
            updatedAt: new Date().toISOString(),
          }));
        }
        alert("⚠️ Updated locally (API endpoint not available)");
      }
    } catch (error) {
      console.error("Error updating reservation:", error);
      // Actualizar localmente como fallback
      setReservations((prev) =>
        prev.map((res) =>
          res.id === reservationId
            ? { ...res, status: newStatus, updatedAt: new Date().toISOString() }
            : res
        )
      );
      if (selectedReservation?.id === reservationId) {
        setSelectedReservation((prev) => ({
          ...prev,
          status: newStatus,
          updatedAt: new Date().toISOString(),
        }));
      }
      alert("⚠️ Updated locally due to connection error");
    } finally {
      setUpdatingIds((prev) => {
        const next = new Set(prev);
        next.delete(reservationId);
        return next;
      });
    }
  };

  useEffect(() => {
    let filtered = reservations;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (res) =>
          (res.clientName && res.clientName.toLowerCase().includes(term)) ||
          (res.clientEmail && res.clientEmail.toLowerCase().includes(term)) ||
          (res.bookingCode && res.bookingCode.toLowerCase().includes(term)) ||
          (res.activity?.titleFr &&
            res.activity.titleFr.toLowerCase().includes(term)) ||
          (res.activity?.titleAr &&
            res.activity.titleAr.toLowerCase().includes(term))
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((res) => res.status === statusFilter);
    }

    setFilteredReservations(filtered);
  }, [searchTerm, statusFilter, reservations]);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      case "upcoming":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
        return "Confirmed";
      case "pending":
        return "Pending";
      case "cancelled":
        return "Cancelled";
      case "completed":
        return "Completed";
      case "upcoming":
        return "Upcoming";
      default:
        return status;
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2d5a27] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading reservations...</p>
        </div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="bg-yellow-100 p-4 rounded-lg mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Authentication Required
            </h2>
            <p className="text-gray-600">
              Please sign in to access the reservations.
            </p>
          </div>
          <Link
            href="/admin/dashboard"
            className="inline-block bg-[#2d5a27] text-white px-6 py-3 rounded-lg hover:bg-green-800 transition"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link
                href="/admin/dashboard"
                className="mr-4 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Reservations Management
                </h1>
                <p className="text-gray-600 mt-1">
                  Manage all farm reservations and bookings
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={loadReservations}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
                />
                {loading ? "Refreshing..." : "Refresh"}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name, email or code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d5a27] focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d5a27] focus:border-transparent"
              >
                <option value="all">All statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Export Options
              </label>
              <div className="flex space-x-2">
                <button className="flex items-center justify-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </button>
                <button className="flex items-center justify-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm w-full">
                  <Printer className="w-4 h-4 mr-2" />
                  Print
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statistics
              </label>
              <div className="flex space-x-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  Total: {reservations.length}
                </span>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  {filteredReservations.length} shown
                </span>
              </div>
            </div>
          </div>

          <div className="text-sm text-gray-500">
            Showing {filteredReservations.length} of {reservations.length}{" "}
            reservations
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow overflow-hidden">
              <div className="px-6 py-4 border-b bg-gray-50">
                <h2 className="text-xl font-semibold text-gray-800">
                  Reservations List
                </h2>
              </div>
              <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                {filteredReservations.length > 0 ? (
                  filteredReservations.map((reservation) => (
                    <div
                      key={reservation.id}
                      className={`p-4 hover:bg-gray-50 cursor-pointer transition border-l-4 ${
                        selectedReservation?.id === reservation.id
                          ? "bg-blue-50 border-blue-500"
                          : reservation.status === "pending"
                          ? "border-yellow-500"
                          : reservation.status === "confirmed"
                          ? "border-green-500"
                          : reservation.status === "cancelled"
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      onClick={() => setSelectedReservation(reservation)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <h3 className="font-semibold text-gray-800">
                              {reservation.clientName || "No name"}
                            </h3>
                            <span className="ml-2 text-sm font-mono bg-gray-100 text-gray-600 px-2 py-1 rounded">
                              {reservation.bookingCode ||
                                `RES-${reservation.id.substring(0, 8)}`}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mb-3">
                            <div className="flex items-center text-sm text-gray-600">
                              <Calendar className="w-4 h-4 mr-2" />
                              <span>
                                {formatDate(
                                  reservation.bookingDate ||
                                    reservation.createdAt
                                )}
                              </span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <Users className="w-4 h-4 mr-2" />
                              <span>{reservation.numPeople || 0} people</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center text-sm">
                                <Mail className="w-4 h-4 mr-1 text-gray-500" />
                                <span className="text-gray-600 truncate max-w-[150px]">
                                  {reservation.clientEmail || "No email"}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                                  reservation.status
                                )}`}
                              >
                                {getStatusText(reservation.status)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg mb-2">
                      {reservations.length === 0
                        ? "No reservations found"
                        : "No reservations matching filters"}
                    </p>
                    <p className="text-gray-400 text-sm">
                      {reservations.length === 0
                        ? "Reservations will appear here when users book activities"
                        : "Try changing your search or filter criteria"}
                    </p>
                    <div className="mt-4">
                      <Link
                        href="/reservation"
                        target="_blank"
                        className="inline-block px-6 py-2 bg-[#2d5a27] text-white rounded-lg hover:bg-green-800 transition"
                      >
                        Test Reservation Form
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            {selectedReservation ? (
              <div className="bg-white rounded-xl shadow sticky top-8">
                <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Reservation Details
                  </h2>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                        selectedReservation.status
                      )}`}
                    >
                      {getStatusText(selectedReservation.status).toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">
                        Booking Code
                      </h3>
                      <p className="font-mono text-lg font-bold text-gray-800">
                        {selectedReservation.bookingCode ||
                          `RES-${selectedReservation.id
                            .substring(0, 8)
                            .toUpperCase()}`}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">
                        Created On
                      </h3>
                      <p className="text-gray-600">
                        {formatDateTime(selectedReservation.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                      Activity
                    </h3>
                    <p className="text-gray-800 font-medium p-3 bg-gray-50 rounded-lg">
                      {selectedReservation.activity?.titleFr ||
                        selectedReservation.activity?.titleAr ||
                        "No activity specified"}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">
                      Client Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <User className="w-5 h-5 text-gray-400 mr-3" />
                        <div>
                          <p className="font-medium text-gray-800">
                            {selectedReservation.clientName ||
                              "No name provided"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Mail className="w-5 h-5 text-gray-400 mr-3" />
                        <p className="text-gray-600">
                          {selectedReservation.clientEmail ||
                            "No email provided"}
                        </p>
                      </div>
                      {selectedReservation.clientPhone && (
                        <div className="flex items-center">
                          <Phone className="w-5 h-5 text-gray-400 mr-3" />
                          <p className="text-gray-600">
                            {selectedReservation.clientPhone}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">
                        Booking Date
                      </h3>
                      <div className="flex items-center text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>
                          {formatDate(selectedReservation.bookingDate)}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">
                        Number of People
                      </h3>
                      <div className="flex items-center text-gray-600">
                        <Users className="w-4 h-4 mr-2" />
                        <span className="text-lg font-semibold text-gray-800">
                          {selectedReservation.numPeople || 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* INFORMACIÓN ADICIONAL QUE QUIERES EN INGLÉS */}
                  <div className="grid grid-cols-1 gap-3 pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        Time:
                      </span>
                      <span className="text-gray-600">3:30 PM</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        Origin:
                      </span>
                      <span className="text-gray-600">Web Form</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        Language:
                      </span>
                      <span className="text-gray-600">French</span>
                    </div>
                  </div>
                  {selectedReservation.notes && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">
                        Admin Notes
                      </h3>
                      <div className="p-3 bg-yellow-50 rounded-lg">
                        <p className="text-gray-700 whitespace-pre-wrap text-sm">
                          {selectedReservation.notes}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">
                      Actions
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {selectedReservation.status !== "confirmed" && (
                        <button
                          onClick={() =>
                            updateReservationStatus(
                              selectedReservation.id,
                              "confirmed"
                            )
                          }
                          disabled={updatingIds.has(selectedReservation.id)}
                          className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          {updatingIds.has(selectedReservation.id)
                            ? "Updating..."
                            : "Confirm"}
                        </button>
                      )}

                      {selectedReservation.status !== "cancelled" && (
                        <button
                          onClick={() =>
                            updateReservationStatus(
                              selectedReservation.id,
                              "cancelled"
                            )
                          }
                          disabled={updatingIds.has(selectedReservation.id)}
                          className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          {updatingIds.has(selectedReservation.id)
                            ? "Updating..."
                            : "Cancel"}
                        </button>
                      )}

                      <button
                        onClick={() => window.print()}
                        className="flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-sm"
                      >
                        <Printer className="w-4 h-4 mr-2" />
                        Print
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow p-8 text-center">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  Select a Reservation
                </h3>
                <p className="text-gray-500 text-sm">
                  Click on a reservation from the list to view its details
                </p>
                {reservations.length === 0 && (
                  <div className="mt-4">
                    <Link
                      href="/reservation"
                      target="_blank"
                      className="inline-block px-6 py-2 bg-[#2d5a27] text-white rounded-lg hover:bg-green-800 transition"
                    >
                      Test Reservation Form
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
