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
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function ReservationsPage() {
  const { isLoaded, userId } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileView, setMobileView] = useState("list"); // 'list' or 'detail'

  const [loading, setLoading] = useState(true);
  const [reservations, setReservations] = useState([]);
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [updatingIds, setUpdatingIds] = useState(new Set());
  const [apiEndpoint, setApiEndpoint] = useState(
    "/api/admin/reservations/recent",
  );
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Función para cargar reservaciones
  const loadReservations = async () => {
    try {
      setLoading(true);
      console.log("[RESERVATIONS] Loading reservations...");

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
        if (process.env.NODE_ENV === "development") {
          console.log("[RESERVATIONS] Using sample data for development");
          const sampleData = [
            {
              id: "1",
              bookingCode: "BK2024001",
              activityId: "act1",
              activity: {
                titleFr: "Farm Visit",
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
                titleFr: "Olive Harvest",
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
                titleFr: "Cheese Making Workshop",
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
                titleFr: "Product Tasting",
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
        const verifyResponse = await fetch("/api/admin/verify");

        if (!verifyResponse.ok) {
          router.push("/admin/dashboard");
          return;
        }

        await loadReservations();
      } catch (error) {
        console.error("[RESERVATIONS PAGE ERROR]", error);
      } finally {
        setLoading(false);
      }
    };

    verifyAdminAndLoadReservations();
  }, [isLoaded, userId, router]);

  const updateReservationStatus = async (reservationId, newStatus) => {
    if (updatingIds.has(reservationId)) return;

    setUpdatingIds((prev) => new Set([...prev, reservationId]));

    try {
      const response = await fetch(`/api/admin/reservations/${reservationId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setReservations((prev) =>
          prev.map((res) =>
            res.id === reservationId
              ? {
                  ...res,
                  status: newStatus,
                  updatedAt: new Date().toISOString(),
                }
              : res,
          ),
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
        console.warn("Status update endpoint not found, updating locally");
        setReservations((prev) =>
          prev.map((res) =>
            res.id === reservationId
              ? {
                  ...res,
                  status: newStatus,
                  updatedAt: new Date().toISOString(),
                }
              : res,
          ),
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
      setReservations((prev) =>
        prev.map((res) =>
          res.id === reservationId
            ? { ...res, status: newStatus, updatedAt: new Date().toISOString() }
            : res,
        ),
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
            res.activity.titleAr.toLowerCase().includes(term)),
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((res) => res.status === statusFilter);
    }

    setFilteredReservations(filtered);
  }, [searchTerm, statusFilter, reservations]);

  // Pagination
  const paginatedReservations = filteredReservations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );
  const totalPages = Math.ceil(filteredReservations.length / itemsPerPage);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        day: "numeric",
        month: "short",
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

  // Mobile message selection
  const handleMobileReservationSelect = (reservation) => {
    setSelectedReservation(reservation);
    setMobileView("detail");
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2d5a27] mx-auto"></div>
          <p className="mt-4 text-gray-600 text-sm sm:text-base">
            Loading reservations...
          </p>
        </div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 sm:p-8">
        <div className="text-center max-w-md w-full">
          <div className="bg-yellow-100 p-4 sm:p-6 rounded-lg mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Authentication Required
            </h2>
            <p className="text-gray-600 text-sm sm:text-base">
              Please sign in to access the reservations.
            </p>
          </div>
          <Link
            href="/admin/dashboard"
            className="inline-block bg-[#2d5a27] text-white px-4 sm:px-6 py-3 rounded-lg hover:bg-green-800 transition text-sm sm:text-base w-full sm:w-auto"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header optimizado para móvil */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center py-3 sm:py-4 lg:py-6">
            <div className="flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="mr-2 text-gray-600 hover:text-gray-900 p-1.5 sm:hidden"
                title="Menu"
              >
                <Menu className="w-5 h-5" />
              </button>
              <Link
                href="/admin/dashboard"
                className="mr-2 sm:mr-4 text-gray-600 hover:text-gray-900 p-1.5 sm:p-0"
              >
                <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </Link>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl lg:text-3xl font-bold text-gray-900 truncate">
                  Reservations
                </h1>
                <p className="text-gray-600 text-xs sm:text-sm mt-0.5 truncate">
                  Manage all farm bookings
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={loadReservations}
                disabled={loading}
                className="flex items-center p-1.5 sm:px-3 sm:py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                title="Refresh"
              >
                <RefreshCw
                  className={`w-4 h-4 sm:w-5 sm:h-5 ${loading ? "animate-spin" : ""}`}
                />
                <span className="hidden sm:inline ml-1">Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-30 sm:hidden">
          <div className="absolute top-0 left-0 w-64 h-full bg-white shadow-xl animate-slide-in">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-gray-800">Quick Actions</h2>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-gray-500 hover:text-gray-700 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-4 space-y-2">
              <button
                onClick={() => {
                  loadReservations();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center w-full px-4 py-3 rounded-lg bg-gray-50 text-gray-700"
              >
                <RefreshCw className="w-5 h-5 mr-3" />
                Refresh Reservations
              </button>
              <Link
                href="/reservation"
                target="_blank"
                className="flex items-center w-full px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                <ExternalLink className="w-5 h-5 mr-3" />
                Test Booking Form
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Main Content optimizado para móvil */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Mobile view toggle */}
        <div className="sm:hidden mb-4 flex justify-between items-center">
          {mobileView === "detail" && (
            <button
              onClick={() => {
                setMobileView("list");
                setSelectedReservation(null);
              }}
              className="flex items-center text-gray-600 hover:text-gray-900 p-2"
            >
              <ChevronLeft className="w-5 h-5 mr-2" />
              Back to List
            </button>
          )}
          <div className="text-sm text-gray-500">
            {mobileView === "list"
              ? "Reservations List"
              : "Reservation Details"}
          </div>
        </div>

        {/* Mobile Stats */}
        <div className="sm:hidden mb-4">
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white rounded-xl shadow p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500">Total</span>
                <Calendar className="w-4 h-4 text-gray-400" />
              </div>
              <div className="text-xl font-bold mt-1">
                {reservations.length}
              </div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-yellow-700">
                  Pending
                </span>
                <Clock className="w-4 h-4 text-yellow-600" />
              </div>
              <div className="text-xl font-bold mt-1 text-yellow-700">
                {reservations.filter((r) => r.status === "pending").length}
              </div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-xl p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-green-700">
                  Confirmed
                </span>
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <div className="text-xl font-bold mt-1 text-green-700">
                {reservations.filter((r) => r.status === "confirmed").length}
              </div>
            </div>
          </div>
        </div>

        {/* Filters Card - Solo en vista lista en móvil */}
        {(mobileView === "list" || window.innerWidth >= 640) && (
          <div className="bg-white rounded-xl sm:rounded-2xl shadow p-3 sm:p-4 lg:p-6 mb-4 sm:mb-6 lg:mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                  <input
                    type="text"
                    placeholder="Search by name, email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d5a27] focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d5a27] focus:border-transparent"
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
                  Results
                </label>
                <div className="flex space-x-2">
                  <span className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-xs sm:text-sm w-full text-center">
                    Total: {reservations.length}
                  </span>
                  <span className="px-3 py-1.5 bg-green-100 text-green-800 rounded-full text-xs sm:text-sm w-full text-center">
                    {filteredReservations.length} shown
                  </span>
                </div>
              </div>
            </div>

            <div className="text-xs sm:text-sm text-gray-500">
              Showing {filteredReservations.length} of {reservations.length}{" "}
              reservations
            </div>
          </div>
        )}

        {/* Mobile View - Lista */}
        {mobileView === "list" && (
          <div className="sm:hidden">
            <div className="bg-white rounded-xl shadow overflow-hidden">
              <div className="px-4 py-3 border-b bg-gray-50">
                <h2 className="text-base font-semibold text-gray-800">
                  Reservations
                </h2>
              </div>
              <div className="divide-y divide-gray-100">
                {paginatedReservations.length > 0 ? (
                  <>
                    {paginatedReservations.map((reservation) => (
                      <div
                        key={reservation.id}
                        className="p-3 hover:bg-gray-50 cursor-pointer transition"
                        onClick={() =>
                          handleMobileReservationSelect(reservation)
                        }
                      >
                        <div className="flex justify-between items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center mb-2">
                              <User className="w-4 h-4 text-gray-500 mr-2 flex-shrink-0" />
                              <h3 className="font-semibold text-gray-800 truncate text-sm">
                                {reservation.clientName || "No name"}
                              </h3>
                              {reservation.status === "pending" && (
                                <span className="bg-yellow-500 text-white text-xs rounded-full px-1.5 py-0.5 ml-2 flex-shrink-0">
                                  PENDING
                                </span>
                              )}
                            </div>

                            <div className="flex items-center text-xs text-gray-600 mb-2">
                              <Calendar className="w-3 h-3 mr-1 flex-shrink-0" />
                              <span>
                                {formatDate(
                                  reservation.bookingDate ||
                                    reservation.createdAt,
                                )}
                              </span>
                            </div>

                            <div className="flex items-center text-xs text-gray-500">
                              <Users className="w-3 h-3 mr-1 flex-shrink-0" />
                              <span>{reservation.numPeople || 0} people</span>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-2">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                                reservation.status,
                              )}`}
                            >
                              {getStatusText(reservation.status)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Mobile Pagination */}
                    {totalPages > 1 && (
                      <div className="p-3 border-t flex items-center justify-between">
                        <button
                          onClick={() =>
                            setCurrentPage((p) => Math.max(1, p - 1))
                          }
                          disabled={currentPage === 1}
                          className="p-1.5 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                          aria-label="Previous page"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>

                        <div className="text-xs text-gray-500">
                          Page {currentPage} of {totalPages}
                        </div>

                        <button
                          onClick={() =>
                            setCurrentPage((p) => Math.min(totalPages, p + 1))
                          }
                          disabled={currentPage === totalPages}
                          className="p-1.5 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                          aria-label="Next page"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="p-6 text-center">
                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-base mb-2">
                      {reservations.length === 0
                        ? "No reservations found"
                        : "No reservations matching filters"}
                    </p>
                    <p className="text-gray-400 text-sm">
                      {reservations.length === 0
                        ? "Reservations will appear here when users book activities"
                        : "Try changing your search or filter criteria"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Mobile View - Detalle */}
        {mobileView === "detail" && selectedReservation && (
          <div className="sm:hidden">
            <div className="bg-white rounded-xl shadow">
              <div className="p-4 space-y-4">
                {/* Header */}
                <div className="flex justify-between items-center pb-3 border-b">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-semibold text-gray-800">
                        Reservation Details
                      </h2>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                          selectedReservation.status,
                        )}`}
                      >
                        {getStatusText(
                          selectedReservation.status,
                        ).toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Code:{" "}
                      {selectedReservation.bookingCode ||
                        `RES-${selectedReservation.id.substring(0, 8).toUpperCase()}`}
                    </p>
                  </div>
                </div>

                {/* Activity */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Activity
                  </h3>
                  <p className="text-gray-800 font-medium p-3 bg-gray-50 rounded-lg text-sm">
                    {selectedReservation.activity?.titleFr ||
                      selectedReservation.activity?.titleAr ||
                      "No activity specified"}
                  </p>
                </div>

                {/* Client Information */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Client Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-500">Name</label>
                      <p className="font-medium text-gray-800">
                        {selectedReservation.clientName || "No name provided"}
                      </p>
                    </div>

                    <div>
                      <label className="text-xs text-gray-500">Email</label>
                      <p className="text-gray-600">
                        {selectedReservation.clientEmail || "No email provided"}
                      </p>
                    </div>

                    {selectedReservation.clientPhone && (
                      <div>
                        <label className="text-xs text-gray-500">Phone</label>
                        <p className="text-gray-600">
                          {selectedReservation.clientPhone}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Booking Details */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                      Booking Date
                    </h3>
                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span className="text-sm">
                        {formatDate(selectedReservation.bookingDate)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                      People
                    </h3>
                    <div className="flex items-center text-gray-600">
                      <Users className="w-4 h-4 mr-2" />
                      <span className="text-sm font-semibold text-gray-800">
                        {selectedReservation.numPeople || 0}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="pt-3 border-t">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-700">
                        Time:
                      </span>
                      <span className="text-gray-600 text-sm">3:30 PM</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-700">
                        Origin:
                      </span>
                      <span className="text-gray-600 text-sm">Web Form</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-700">
                        Language:
                      </span>
                      <span className="text-gray-600 text-sm">French</span>
                    </div>
                  </div>
                </div>

                {selectedReservation.notes && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                      Admin Notes
                    </h3>
                    <div className="p-3 bg-yellow-50 rounded-lg">
                      <p className="text-gray-700 whitespace-pre-wrap text-xs">
                        {selectedReservation.notes}
                      </p>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="pt-4 border-t">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    Actions
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedReservation.status !== "confirmed" && (
                      <button
                        onClick={() =>
                          updateReservationStatus(
                            selectedReservation.id,
                            "confirmed",
                          )
                        }
                        disabled={updatingIds.has(selectedReservation.id)}
                        className="flex items-center justify-center px-3 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                        {updatingIds.has(selectedReservation.id)
                          ? "..."
                          : "Confirm"}
                      </button>
                    )}

                    {selectedReservation.status !== "cancelled" && (
                      <button
                        onClick={() =>
                          updateReservationStatus(
                            selectedReservation.id,
                            "cancelled",
                          )
                        }
                        disabled={updatingIds.has(selectedReservation.id)}
                        className="flex items-center justify-center px-3 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <XCircle className="w-3.5 h-3.5 mr-1.5" />
                        {updatingIds.has(selectedReservation.id)
                          ? "..."
                          : "Cancel"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Desktop View */}
        <div className="hidden sm:grid sm:grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow overflow-hidden">
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-b bg-gray-50">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                  Reservations List
                </h2>
              </div>
              <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                {filteredReservations.length > 0 ? (
                  filteredReservations.map((reservation) => (
                    <div
                      key={reservation.id}
                      className={`p-3 sm:p-4 hover:bg-gray-50 cursor-pointer transition border-l-4 ${
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
                      <div className="flex justify-between items-start gap-3 sm:gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center mb-2">
                            <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 mr-2 flex-shrink-0" />
                            <h3 className="font-semibold text-gray-800 truncate text-sm sm:text-base">
                              {reservation.clientName || "No name"}
                            </h3>
                            <span className="ml-2 text-xs sm:text-sm font-mono bg-gray-100 text-gray-600 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
                              {reservation.bookingCode ||
                                `RES-${reservation.id.substring(0, 8)}`}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 mb-2 sm:mb-3">
                            <div className="flex items-center text-xs sm:text-sm text-gray-600">
                              <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                              <span>
                                {formatDate(
                                  reservation.bookingDate ||
                                    reservation.createdAt,
                                )}
                              </span>
                            </div>
                            <div className="flex items-center text-xs sm:text-sm text-gray-600">
                              <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                              <span>{reservation.numPeople || 0} people</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2 sm:space-x-4">
                              <div className="flex items-center text-xs sm:text-sm">
                                <Mail className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-gray-500" />
                                <span className="text-gray-600 truncate max-w-[120px] sm:max-w-[150px]">
                                  {reservation.clientEmail || "No email"}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              <span
                                className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                                  reservation.status,
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
                  <div className="p-6 sm:p-8 text-center">
                    <Calendar className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
                    <p className="text-gray-500 text-base sm:text-lg mb-2">
                      {reservations.length === 0
                        ? "No reservations found"
                        : "No reservations matching filters"}
                    </p>
                    <p className="text-gray-400 text-sm sm:text-base">
                      {reservations.length === 0
                        ? "Reservations will appear here when users book activities"
                        : "Try changing your search or filter criteria"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Desktop Detail Panel */}
          <div className="hidden lg:block">
            {selectedReservation ? (
              <div className="bg-white rounded-xl shadow sticky top-8">
                <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Reservation Details
                  </h2>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                        selectedReservation.status,
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
                              "confirmed",
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
                              "cancelled",
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
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow p-6 sm:p-8 text-center">
                <Calendar className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  Select a Reservation
                </h3>
                <p className="text-gray-500 text-sm">
                  Click on a reservation from the list to view its details
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
