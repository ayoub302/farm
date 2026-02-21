"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  MessageSquare,
  LogOut,
  Bell,
  RefreshCw,
  Home,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  Clock,
  X,
  PlusCircle,
  Sprout,
  Menu,
  ChevronRight,
  Image as ImageIcon,
  Users,
  BarChart3,
  Settings,
  FileText,
  Globe,
  Upload,
  Eye,
  Download,
  Video,
  Tag,
} from "lucide-react";

// ================= SIMPLE ADMIN GUARD CORREGIDO =================
const SimpleAdminGuard = ({ children }) => {
  const { isLoaded, userId, getToken } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const hasCheckedRef = useRef(false);

  useEffect(() => {
    if (!isLoaded || hasCheckedRef.current) return;

    hasCheckedRef.current = true;

    const checkAdmin = async () => {
      // Si no hay usuario, redirigir a sign-in de Clerk
      if (!userId) {
        console.log("[ADMIN GUARD] No user found, redirecting to sign-in");
        router.push("/sign-in");
        return;
      }

      try {
        console.log("[ADMIN GUARD] Verifying admin for user:", userId);

        // En desarrollo, podemos permitir acceso directo para pruebas
        if (
          process.env.NODE_ENV === "development" &&
          process.env.NEXT_PUBLIC_SKIP_ADMIN_CHECK === "true"
        ) {
          console.log("[ADMIN GUARD] Development mode - granting access");
          setIsAdmin(true);
          setLoading(false);
          return;
        }

        // Obtener token para autenticación
        const token = await getToken();

        // Verificar con el endpoint de admin
        const res = await fetch("/api/admin/verify", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();

        if (data.success) {
          console.log("[ADMIN GUARD] Access granted - user is admin");
          setIsAdmin(true);
        } else {
          console.log("[ADMIN GUARD] Access denied - not admin");
          setError(
            "You don't have admin privileges. Redirecting to home page...",
          );
          setTimeout(() => router.push("/"), 3000);
        }
      } catch (error) {
        console.error("[ADMIN GUARD] Error:", error);
        setError("Error verifying admin status. Redirecting to home page...");
        setTimeout(() => router.push("/"), 3000);
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, [isLoaded, userId, router, getToken]);

  // Mostrar loading mientras carga
  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2d5a27] mx-auto"></div>
          <p className="mt-4 text-gray-600 text-sm sm:text-base">
            Verifying admin access...
          </p>
        </div>
      </div>
    );
  }

  // Mostrar error si no es admin
  if (error || !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md w-full">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-6 text-sm sm:text-base">
            {error || "You don't have permission to access this page."}
          </p>
          <Link
            href="/"
            className="bg-[#2d5a27] text-white px-6 py-3 rounded-lg hover:bg-green-800 transition inline-block w-full sm:w-auto"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  // Si es admin, mostrar el contenido
  return <>{children}</>;
};

export default function AdminDashboard() {
  const { isLoaded, userId, getToken, signOut } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const hasFetchedRef = useRef(false);
  const isFetchingRef = useRef(false);

  const [loading, setLoading] = useState(true);
  const [adminData, setAdminData] = useState(null);
  const [authError, setAuthError] = useState(false);

  const [stats, setStats] = useState({
    totalReservations: 0,
    pendingReservations: 0,
    confirmedReservations: 0,
    cancelledReservations: 0,
    todayReservations: 0,
    totalMessages: 0,
    unreadMessages: 0,
    totalActivities: 0,
    upcomingActivities: 0,
    totalHarvests: 0,
    activeHarvests: 0,
    totalGalleryItems: 0,
    galleryViews: 0,
    galleryDownloads: 0,
  });

  const [recentMessages, setRecentMessages] = useState([]);
  const [recentReservations, setRecentReservations] = useState([]);
  const [recentHarvests, setRecentHarvests] = useState([]);
  const [recentGallery, setRecentGallery] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState(new Date());
  const [loadingStats, setLoadingStats] = useState(false);

  // ================= FETCH DASHBOARD DATA =================
  const fetchDashboardData = useCallback(async () => {
    if (!userId || isFetchingRef.current) {
      return;
    }

    isFetchingRef.current = true;
    setLoadingStats(true);

    try {
      // Obtener token para autenticación
      const token = await getToken();

      // Configurar headers comunes
      const headers = {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      };

      // Llamadas a APIs en paralelo con manejo de errores individual
      const [messagesRes, reservationsRes, harvestsRes, galleryRes] =
        await Promise.allSettled([
          fetch("/api/admin/messages/recent", {
            headers,
            credentials: "include",
          }).then(async (r) => {
            if (!r.ok) {
              console.warn("Messages API error:", r.status);
              return [];
            }
            return r.json();
          }),
          fetch("/api/admin/reservations/recent", {
            headers,
            credentials: "include",
          }).then(async (r) => {
            if (!r.ok) {
              console.warn("Reservations API error:", r.status);
              return [];
            }
            return r.json();
          }),
          fetch("/api/admin/harvests/recent", {
            headers,
            credentials: "include",
          }).then(async (r) => {
            if (!r.ok) {
              console.warn("Harvests API error:", r.status);
              return [];
            }
            return r.json();
          }),
          fetch("/api/admin/gallery", { headers, credentials: "include" }).then(
            async (r) => {
              if (!r.ok) {
                console.warn("Gallery API error:", r.status);
                return [];
              }
              return r.json();
            },
          ),
        ]);

      // Procesar resultados
      const messages =
        messagesRes.status === "fulfilled" && Array.isArray(messagesRes.value)
          ? messagesRes.value
          : [];
      const reservations =
        reservationsRes.status === "fulfilled" &&
        Array.isArray(reservationsRes.value)
          ? reservationsRes.value
          : [];
      const harvests =
        harvestsRes.status === "fulfilled" && Array.isArray(harvestsRes.value)
          ? harvestsRes.value
          : [];
      const galleryItems =
        galleryRes.status === "fulfilled" && Array.isArray(galleryRes.value)
          ? galleryRes.value
          : [];

      console.log("[DASHBOARD] Data loaded:", {
        messages: messages.length,
        reservations: reservations.length,
        harvests: harvests.length,
        galleryItems: galleryItems.length,
      });

      setRecentMessages(messages.slice(0, 5));
      setRecentReservations(reservations.slice(0, 5));
      setRecentHarvests(harvests.slice(0, 5));
      setRecentGallery(galleryItems.slice(0, 5));

      // Calcular estadísticas
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayReservations = reservations.filter((r) => {
        if (!r.createdAt) return false;
        try {
          const reservationDate = new Date(r.createdAt);
          reservationDate.setHours(0, 0, 0, 0);
          return reservationDate.getTime() === today.getTime();
        } catch {
          return false;
        }
      }).length;

      const unreadMessages = messages.filter(
        (m) =>
          m.status?.toLowerCase() === "unread" ||
          m.status?.toLowerCase() === "new",
      ).length;

      const pendingReservations = reservations.filter(
        (r) => r.status?.toLowerCase() === "pending",
      ).length;

      const activeHarvests = harvests.filter((h) => h.isActive === true).length;

      const galleryViews = galleryItems.reduce(
        (sum, item) => sum + (item.views || 0),
        0,
      );
      const galleryDownloads = galleryItems.reduce(
        (sum, item) => sum + (item.downloads || 0),
        0,
      );

      setStats({
        totalReservations: reservations.length,
        pendingReservations,
        confirmedReservations: reservations.filter(
          (r) => r.status?.toLowerCase() === "confirmed",
        ).length,
        cancelledReservations: reservations.filter(
          (r) => r.status?.toLowerCase() === "cancelled",
        ).length,
        todayReservations,
        totalMessages: messages.length,
        unreadMessages,
        totalActivities: 0,
        upcomingActivities: 0,
        totalHarvests: harvests.length,
        activeHarvests,
        totalGalleryItems: galleryItems.length,
        galleryViews,
        galleryDownloads,
      });

      // Crear notificaciones
      const newNotifications = [];
      if (unreadMessages > 0) {
        newNotifications.push({
          id: 1,
          type: "info",
          icon: <MessageSquare className="w-5 h-5" />,
          title: "Unread Messages",
          message: `You have ${unreadMessages} unread message${unreadMessages !== 1 ? "s" : ""}`,
          time: "Just now",
          link: "/admin/messages",
          action: "View Messages",
        });
      }

      if (pendingReservations > 0) {
        newNotifications.push({
          id: 2,
          type: "warning",
          icon: <Clock className="w-5 h-5" />,
          title: "Pending Reservations",
          message: `${pendingReservations} reservation${pendingReservations !== 1 ? "s" : ""} pending confirmation`,
          time: "Just now",
          link: "/admin/reservations?status=pending",
          action: "Review Reservations",
        });
      }

      if (activeHarvests > 0) {
        newNotifications.push({
          id: 3,
          type: "success",
          icon: <Sprout className="w-5 h-5" />,
          title: "Active Harvests",
          message: `${activeHarvests} active harvest${activeHarvests !== 1 ? "s" : ""}`,
          time: "Just now",
          link: "/admin/harvests",
          action: "Manage Harvests",
        });
      }

      if (galleryItems.length > 0) {
        newNotifications.push({
          id: 4,
          type: "info",
          icon: <ImageIcon className="w-5 h-5" />,
          title: "Gallery Items",
          message: `${galleryItems.length} media item${galleryItems.length !== 1 ? "s" : ""} in gallery`,
          time: "Just now",
          link: "/admin/gallery",
          action: "View Gallery",
        });
      }

      setNotifications(newNotifications);
      setLastRefreshTime(new Date());
    } catch (err) {
      console.error("[DASHBOARD] Fetch error:", err);
    } finally {
      isFetchingRef.current = false;
      setLoadingStats(false);
    }
  }, [userId, getToken]);

  // ================= INIT DASHBOARD =================
  useEffect(() => {
    if (!isLoaded || !userId || hasFetchedRef.current) return;

    hasFetchedRef.current = true;
    setLoading(true);

    const init = async () => {
      try {
        // Inicializar datos de administrador
        console.log("[DASHBOARD] Initializing dashboard for user:", userId);

        // Cargar datos del dashboard
        await fetchDashboardData();

        // ✅ IMPORTANTE: Quitar el loading después de cargar los datos
        setLoading(false);
      } catch (err) {
        console.error("[DASHBOARD] Init error:", err);
        setAuthError(true);
        setLoading(false);
      }
    };

    init();
  }, [isLoaded, userId, fetchDashboardData, getToken]);

  // ================= HELPER FUNCTIONS =================
  const getStatusColor = (status) => {
    if (!status) return "bg-gray-100 text-gray-800";
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case "confirmed":
      case "completed":
      case "responded":
      case "active":
        return "bg-green-100 text-green-800";
      case "upcoming":
      case "pending":
      case "read":
        return "bg-blue-100 text-blue-800";
      case "unread":
      case "new":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
      case "archived":
      case "inactive":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    if (!status) return null;
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case "confirmed":
      case "completed":
      case "responded":
      case "active":
        return <CheckCircle className="w-4 h-4 mr-1" />;
      case "pending":
      case "unread":
      case "new":
        return <Clock className="w-4 h-4 mr-1" />;
      case "cancelled":
      case "inactive":
        return <XCircle className="w-4 h-4 mr-1" />;
      default:
        return null;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
      });
    } catch {
      return "Invalid date";
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
      return "Invalid date/time";
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const markAllAsRead = () => {
    setShowNotifications(false);
  };

  const handleRefresh = () => {
    if (!loadingStats) {
      fetchDashboardData();
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
      router.push("/");
    }
  };

  // ================= LOADING AND ERROR STATES =================
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2d5a27] mx-auto"></div>
          <p className="mt-4 text-gray-600 text-sm sm:text-base">
            Loading authentication...
          </p>
        </div>
      </div>
    );
  }

  if (authError || !userId) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 sm:p-8">
        <div className="text-center max-w-md w-full">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Authentication Error
            </h2>
            <p className="text-gray-600 mb-4 text-sm sm:text-base">
              {!userId
                ? "You are not signed in."
                : "Unable to verify admin access."}
            </p>
            <div className="space-y-3">
              {!userId ? (
                <>
                  <Link
                    href="/sign-in"
                    className="block w-full bg-[#2d5a27] text-white px-6 py-3 rounded-lg hover:bg-green-800 transition text-center text-sm sm:text-base"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/"
                    className="block w-full border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition text-center text-sm sm:text-base"
                  >
                    Return to Home
                  </Link>
                </>
              ) : (
                <>
                  <p className="text-sm text-gray-500">
                    User ID: {userId?.substring(0, 8)}...
                  </p>
                  <button
                    onClick={() => window.location.reload()}
                    className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition text-sm sm:text-base"
                  >
                    Retry Loading
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2d5a27] mx-auto"></div>
          <p className="mt-4 text-gray-600 text-sm sm:text-base">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  // ================= MAIN RENDER =================
  return (
    <SimpleAdminGuard>
      <div className="min-h-screen bg-gray-50">
        {/* Modal de Notificaciones */}
        {showNotifications && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center p-2 sm:p-4">
            <div className="notifications-modal bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-fade-in mt-4 sm:mt-0">
              <div className="p-4 sm:p-6 border-b bg-gradient-to-r from-[#2d5a27] to-green-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Bell className="w-6 h-6 sm:w-8 sm:h-8 text-white mr-3 sm:mr-4" />
                    <div>
                      <h2 className="text-lg sm:text-2xl font-bold text-white">
                        Notifications
                      </h2>
                      <p className="text-green-100 text-xs sm:text-sm mt-1">
                        Stay updated with your farm activities
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <button
                      onClick={markAllAsRead}
                      className="text-xs sm:text-sm text-white hover:text-green-200 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg hover:bg-green-700 transition"
                    >
                      Mark all read
                    </button>
                    <button
                      onClick={toggleNotifications}
                      className="text-white hover:text-green-200 p-1.5 sm:p-2 rounded-full hover:bg-green-700 transition"
                    >
                      <X className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
                {notifications.length > 0 ? (
                  <div className="p-2 sm:p-4">
                    <div className="mb-3 sm:mb-4 px-1 sm:px-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm font-medium text-gray-700">
                          {notifications.length} notification
                          {notifications.length !== 1 ? "s" : ""}
                        </span>
                        <span className="text-xs text-gray-500">
                          Updated {formatTime(lastRefreshTime)}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 sm:space-y-3">
                      {notifications.map((notification) => (
                        <Link
                          key={notification.id}
                          href={notification.link}
                          onClick={() => setShowNotifications(false)}
                          className="block"
                        >
                          <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 hover:shadow-md transition-all hover:border-[#2d5a27]/20 hover:translate-x-0.5 sm:hover:translate-x-1">
                            <div className="flex items-start">
                              <div
                                className={`p-2 sm:p-3 rounded-xl mr-3 sm:mr-4 flex-shrink-0 ${
                                  notification.type === "warning"
                                    ? "bg-yellow-50 border border-yellow-100"
                                    : notification.type === "info"
                                      ? "bg-blue-50 border border-blue-100"
                                      : "bg-green-50 border border-green-100"
                                }`}
                              >
                                <div
                                  className={`p-1.5 sm:p-2 rounded-lg ${
                                    notification.type === "warning"
                                      ? "bg-yellow-100 text-yellow-600"
                                      : notification.type === "info"
                                        ? "bg-blue-100 text-blue-600"
                                        : "bg-green-100 text-green-600"
                                  }`}
                                >
                                  {notification.icon}
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                  <div className="min-w-0">
                                    <h3 className="font-semibold text-gray-800 text-sm sm:text-base truncate">
                                      {notification.title}
                                    </h3>
                                    <p className="text-gray-600 text-xs sm:text-sm mt-1 line-clamp-2">
                                      {notification.message}
                                    </p>
                                  </div>
                                  <span className="text-xs font-medium px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full bg-gray-100 text-gray-600 ml-2 flex-shrink-0">
                                    {notification.time}
                                  </span>
                                </div>
                                <div className="mt-3 sm:mt-4 flex items-center justify-between">
                                  <span
                                    className={`text-xs font-medium px-2 py-1 sm:px-3 sm:py-1.5 rounded-full ${
                                      notification.type === "warning"
                                        ? "bg-yellow-100 text-yellow-700 border border-yellow-200"
                                        : notification.type === "info"
                                          ? "bg-blue-100 text-blue-700 border border-blue-200"
                                          : "bg-green-100 text-green-700 border border-green-200"
                                    }`}
                                  >
                                    {notification.action}
                                  </span>
                                  <span className="text-xs text-gray-400 flex items-center flex-shrink-0 ml-2">
                                    Click to view
                                    <ChevronRight className="w-3 h-3 ml-0.5 text-[#2d5a27]" />
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-6 sm:p-12 text-center">
                    <div className="bg-gray-50 rounded-full w-16 h-16 sm:w-24 sm:h-24 flex items-center justify-center mx-auto mb-4 sm:mb-6">
                      <Bell className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
                      All caught up!
                    </h3>
                    <p className="text-gray-500 text-sm sm:text-base max-w-md mx-auto">
                      You have no notifications at the moment. Check back later
                      for updates.
                    </p>
                  </div>
                )}
              </div>

              <div className="p-3 sm:p-4 border-t bg-gray-50">
                <div className="flex justify-between items-center">
                  <button
                    onClick={handleRefresh}
                    disabled={loadingStats}
                    className="flex items-center text-xs sm:text-sm font-medium text-[#2d5a27] hover:text-green-800 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg hover:bg-green-50 transition disabled:opacity-50"
                  >
                    <RefreshCw
                      className={`w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 ${loadingStats ? "animate-spin" : ""}`}
                    />
                    Refresh
                  </button>
                  <button
                    onClick={toggleNotifications}
                    className="text-xs sm:text-sm text-gray-600 hover:text-gray-800 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg hover:bg-gray-100 transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="mr-2 text-gray-600 hover:text-gray-900 p-1.5 sm:hidden"
                  title="Menu"
                >
                  <Menu className="w-6 h-6" />
                </button>
                <Link
                  href="/"
                  className="mr-2 sm:mr-4 text-gray-600 hover:text-gray-900 transition p-1.5"
                  title="Go to public website"
                >
                  <Home className="w-5 h-5 sm:w-6 sm:h-6" />
                </Link>
                <div className="min-w-0">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">
                    Admin Dashboard
                  </h1>
                  <p className="text-gray-600 text-xs sm:text-sm mt-0.5 truncate">
                    Al Manssouri Farm - Control Panel
                  </p>
                  {adminData && (
                    <p className="text-xs text-gray-500 mt-0.5 truncate hidden sm:block">
                      Logged in as: {adminData.email}
                    </p>
                  )}
                </div>
              </div>

              {/* Mobile menu overlay */}
              {mobileMenuOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-40 sm:hidden">
                  <div className="absolute top-0 left-0 w-64 h-full bg-white shadow-xl animate-slide-in">
                    <div className="p-4 border-b">
                      <div className="flex items-center justify-between">
                        <h2 className="font-semibold text-gray-800">Menu</h2>
                        <button
                          onClick={() => setMobileMenuOpen(false)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    <div className="p-4 space-y-3">
                      <Link
                        href="/admin/dashboard"
                        className="flex items-center px-4 py-3 rounded-lg bg-gray-50 text-gray-700"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Home className="w-5 h-5 mr-3" />
                        Dashboard
                      </Link>
                      <Link
                        href="/admin/messages"
                        className="flex items-center px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <MessageSquare className="w-5 h-5 mr-3" />
                        Messages
                      </Link>
                      <Link
                        href="/admin/reservations"
                        className="flex items-center px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Calendar className="w-5 h-5 mr-3" />
                        Reservations
                      </Link>
                      <Link
                        href="/admin/harvests"
                        className="flex items-center px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Sprout className="w-5 h-5 mr-3" />
                        Harvests
                      </Link>
                      <Link
                        href="/admin/gallery"
                        className="flex items-center px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <ImageIcon className="w-5 h-5 mr-3" />
                        Gallery
                      </Link>
                      <div className="pt-4 border-t">
                        <button
                          onClick={handleSignOut}
                          className="flex items-center w-full px-4 py-3 rounded-lg bg-red-50 text-red-700 hover:bg-red-100"
                        >
                          <LogOut className="w-5 h-5 mr-3" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-1.5 sm:space-x-3">
                <button
                  onClick={handleRefresh}
                  disabled={loadingStats}
                  className="flex items-center px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition disabled:opacity-50 text-xs sm:text-sm"
                  title="Refresh dashboard data"
                >
                  <RefreshCw
                    className={`w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 ${loadingStats ? "animate-spin" : ""}`}
                  />
                  <span className="hidden sm:inline">Refresh</span>
                </button>
                <div className="relative">
                  <button
                    onClick={toggleNotifications}
                    className="bell-icon p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition relative group"
                    title="View notifications"
                  >
                    <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500 group-hover:text-gray-700 transition" />
                    {notifications.length > 0 && (
                      <>
                        <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-[10px] sm:text-xs animate-pulse">
                          {notifications.length}
                        </span>
                        <span className="absolute -top-8 right-0 bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap hidden sm:block">
                          {notifications.length} notification
                          {notifications.length !== 1 ? "s" : ""}
                        </span>
                      </>
                    )}
                  </button>
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex items-center px-3 py-1.5 sm:px-4 sm:py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition text-xs sm:text-sm"
                  title="Sign out from admin panel"
                >
                  <LogOut className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
          {/* Quick Actions */}
          <div className="mb-6 sm:mb-8">
            <div className="bg-gradient-to-r from-[#2d5a27] to-green-700 rounded-xl shadow-lg p-4 sm:p-6 text-white">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div className="mb-4 md:mb-0">
                  <h2 className="text-xl sm:text-2xl font-bold mb-2">
                    Quick Actions
                  </h2>
                  <p className="text-green-100 text-sm sm:text-base">
                    Manage your farm activities, harvests, and media gallery
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                  <Link
                    href="/admin/harvests/new"
                    className="flex items-center justify-center gap-2 bg-white text-[#2d5a27] px-4 py-3 sm:px-6 sm:py-3 rounded-lg font-semibold hover:bg-green-50 hover:shadow-lg transition text-sm sm:text-base"
                  >
                    <Sprout className="w-4 h-4 sm:w-5 sm:h-5" />
                    New Harvest
                  </Link>
                  <Link
                    href="/admin/activities/new"
                    className="flex items-center justify-center gap-2 bg-white text-[#2d5a27] px-4 py-3 sm:px-6 sm:py-3 rounded-lg font-semibold hover:bg-green-50 hover:shadow-lg transition text-sm sm:text-base"
                  >
                    <PlusCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                    New Activity
                  </Link>
                  <Link
                    href="/admin/gallery"
                    className="flex items-center justify-center gap-2 bg-white text-[#2d5a27] px-4 py-3 sm:px-6 sm:py-3 rounded-lg font-semibold hover:bg-green-50 hover:shadow-lg transition text-sm sm:text-base"
                  >
                    <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
                    Upload Media
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <Link href="/admin/reservations" className="block">
              <div className="bg-white rounded-xl shadow p-4 hover:shadow-md transition cursor-pointer h-full">
                <div className="flex items-center">
                  <div className="p-2 sm:p-3 bg-purple-100 rounded-lg">
                    <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-xs sm:text-sm text-gray-500">
                      Total Reservations
                    </p>
                    <p className="text-xl sm:text-2xl font-bold">
                      {stats.totalReservations}
                    </p>
                  </div>
                </div>
                <div className="mt-3 text-xs">
                  <span className="text-gray-600">
                    Today: {stats.todayReservations}
                  </span>
                </div>
              </div>
            </Link>

            <Link href="/admin/reservations?status=pending" className="block">
              <div className="bg-white rounded-xl shadow p-4 hover:shadow-md transition cursor-pointer h-full">
                <div className="flex items-center">
                  <div className="p-2 sm:p-3 bg-yellow-100 rounded-lg">
                    <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-xs sm:text-sm text-gray-500">Pending</p>
                    <p className="text-xl sm:text-2xl font-bold">
                      {stats.pendingReservations}
                    </p>
                  </div>
                </div>
                <div className="mt-3 text-xs">
                  <span className="text-gray-600">
                    {stats.pendingReservations > 0
                      ? "Needs attention"
                      : "All processed"}
                  </span>
                </div>
              </div>
            </Link>

            <Link href="/admin/messages" className="block">
              <div className="bg-white rounded-xl shadow p-4 hover:shadow-md transition cursor-pointer h-full">
                <div className="flex items-center">
                  <div className="p-2 sm:p-3 bg-blue-100 rounded-lg">
                    <MessageSquare className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-xs sm:text-sm text-gray-500">
                      Unread Messages
                    </p>
                    <p className="text-xl sm:text-2xl font-bold">
                      {stats.unreadMessages}
                    </p>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                    <div
                      className="bg-blue-500 h-1.5 sm:h-2 rounded-full"
                      style={{
                        width: `${Math.min((stats.unreadMessages / (stats.totalMessages || 1)) * 100, 100)}%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Total: {stats.totalMessages || 0}
                  </p>
                </div>
              </div>
            </Link>

            <Link href="/admin/gallery" className="block">
              <div className="bg-white rounded-xl shadow p-4 hover:shadow-md transition cursor-pointer h-full">
                <div className="flex items-center">
                  <div className="p-2 sm:p-3 bg-indigo-100 rounded-lg">
                    <ImageIcon className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-xs sm:text-sm text-gray-500">
                      Gallery Items
                    </p>
                    <p className="text-xl sm:text-2xl font-bold">
                      {stats.totalGalleryItems}
                    </p>
                  </div>
                </div>
                <div className="mt-3 text-xs">
                  <span className="text-gray-600">
                    {stats.galleryViews} views • {stats.galleryDownloads}{" "}
                    downloads
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* Harvest Stats adicionales */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <Link href="/admin/harvests" className="block">
              <div className="bg-white rounded-xl shadow p-4 hover:shadow-md transition cursor-pointer h-full">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-2 sm:p-3 bg-green-100 rounded-lg">
                      <Sprout className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-xs sm:text-sm text-gray-500">
                        Active Harvests
                      </p>
                      <p className="text-xl sm:text-2xl font-bold">
                        {stats.activeHarvests}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Total Harvests</p>
                    <p className="text-lg font-semibold">
                      {stats.totalHarvests}
                    </p>
                  </div>
                </div>
                {stats.activeHarvests > 0 && (
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{
                          width: `${(stats.activeHarvests / (stats.totalHarvests || 1)) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <p className="text-xs text-green-600 mt-2">
                      {Math.round(
                        (stats.activeHarvests / (stats.totalHarvests || 1)) *
                          100,
                      )}
                      % of harvests are active
                    </p>
                  </div>
                )}
              </div>
            </Link>

            <Link href="/admin/gallery" className="block">
              <div className="bg-white rounded-xl shadow p-4 hover:shadow-md transition cursor-pointer h-full">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-2 sm:p-3 bg-orange-100 rounded-lg">
                      <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-xs sm:text-sm text-gray-500">
                        Gallery Engagement
                      </p>
                      <p className="text-xl sm:text-2xl font-bold">
                        {stats.galleryViews + stats.galleryDownloads}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Total Interactions</p>
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{stats.galleryViews}</span>
                      <Download className="w-4 h-4 text-gray-400 ml-2" />
                      <span className="text-sm">{stats.galleryDownloads}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Views</span>
                    <span>Downloads</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-orange-500 h-2 rounded-full"
                      style={{
                        width: `${(stats.galleryViews / (stats.galleryViews + stats.galleryDownloads || 1)) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Recent Data Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {/* Recent Messages */}
            <div className="bg-white rounded-xl shadow overflow-hidden">
              <div className="px-4 py-3 sm:px-6 sm:py-4 border-b">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                    Recent Messages
                    <span className="ml-2 text-xs sm:text-sm font-normal text-gray-500">
                      ({recentMessages.length})
                    </span>
                  </h2>
                  <Link
                    href="/admin/messages"
                    className="text-xs sm:text-sm text-[#2d5a27] hover:underline"
                  >
                    View all
                  </Link>
                </div>
              </div>
              <div className="p-3 sm:p-6 max-h-[400px] sm:max-h-[500px] overflow-y-auto">
                {recentMessages.length > 0 ? (
                  <div className="space-y-3 sm:space-y-4">
                    {recentMessages.map((message, index) => (
                      <Link
                        key={message.id || `msg-${index}`}
                        href="/admin/messages"
                        className="block"
                      >
                        <div
                          className={`p-3 rounded-lg hover:bg-gray-50 transition ${message.status === "unread" || message.status === "new" ? "bg-blue-50 border-l-2 sm:border-l-4 border-blue-500" : ""}`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center">
                                <h3 className="font-medium text-gray-800 text-sm sm:text-base truncate">
                                  {message.name || "No name"}
                                </h3>
                                {(message.status === "unread" ||
                                  message.status === "new") && (
                                  <span className="ml-2 bg-blue-500 text-white text-xs rounded-full px-1.5 py-0.5 sm:px-2 sm:py-1 text-[10px] sm:text-xs">
                                    New
                                  </span>
                                )}
                              </div>
                              <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">
                                {message.subject || "No subject"}
                              </p>
                              <div className="flex items-center text-xs text-gray-500 mt-2">
                                <Mail className="w-3 h-3 mr-1 flex-shrink-0" />
                                <span className="truncate mr-2">
                                  {message.email || "No email"}
                                </span>
                                {message.phone && (
                                  <>
                                    <Phone className="w-3 h-3 mr-1 ml-2 flex-shrink-0" />
                                    <span className="truncate">
                                      {message.phone}
                                    </span>
                                  </>
                                )}
                              </div>
                              <p className="text-xs text-gray-400 mt-1">
                                {formatDateTime(message.createdAt)}
                              </p>
                            </div>
                            <span
                              className={`ml-2 px-2 py-1 rounded-full text-xs font-medium flex items-center flex-shrink-0 ${getStatusColor(message.status)}`}
                            >
                              {getStatusIcon(message.status)}
                              <span className="hidden sm:inline ml-1">
                                {message.status || "unknown"}
                              </span>
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 sm:py-8">
                    <MessageSquare className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm sm:text-base">
                      No messages yet
                    </p>
                    <p className="text-xs sm:text-sm text-gray-400 mt-2">
                      Messages from contact form will appear here
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Reservations */}
            <div className="bg-white rounded-xl shadow overflow-hidden">
              <div className="px-4 py-3 sm:px-6 sm:py-4 border-b">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                    Recent Reservations
                    <span className="ml-2 text-xs sm:text-sm font-normal text-gray-500">
                      ({recentReservations.length})
                    </span>
                  </h2>
                  <Link
                    href="/admin/reservations"
                    className="text-xs sm:text-sm text-[#2d5a27] hover:underline"
                  >
                    View all
                  </Link>
                </div>
              </div>
              <div className="p-3 sm:p-6 max-h-[400px] sm:max-h-[500px] overflow-y-auto">
                {recentReservations.length > 0 ? (
                  <div className="space-y-3 sm:space-y-4">
                    {recentReservations.map((reservation, index) => (
                      <Link
                        key={reservation.id || `res-${index}`}
                        href="/admin/reservations"
                        className="block"
                      >
                        <div className="p-3 hover:bg-gray-50 rounded-lg transition">
                          <div className="flex justify-between items-start">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-gray-800 text-sm sm:text-base truncate">
                                {reservation.clientName ||
                                  reservation.name ||
                                  "No name"}
                              </h3>
                              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                                {reservation.numPeople || 0} people •{" "}
                                <span className="truncate">
                                  {reservation.activity?.titleFr ||
                                    reservation.activityType ||
                                    "Reservation"}
                                </span>
                              </p>
                              <div className="flex items-center text-xs text-gray-500 mt-2">
                                <Calendar className="w-3 h-3 mr-1 flex-shrink-0" />
                                <span>
                                  {formatDate(
                                    reservation.bookingDate ||
                                      reservation.activityDate ||
                                      reservation.createdAt,
                                  )}
                                </span>
                              </div>
                              <p className="text-xs text-gray-400 mt-1">
                                {formatDateTime(reservation.createdAt)}
                              </p>
                            </div>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ml-2 flex-shrink-0 ${getStatusColor(reservation.status)}`}
                            >
                              {getStatusIcon(reservation.status)}
                              <span className="hidden sm:inline ml-1">
                                {reservation.status || "pending"}
                              </span>
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 sm:py-8">
                    <Calendar className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm sm:text-base">
                      No reservations yet
                    </p>
                    <p className="text-xs sm:text-sm text-gray-400 mt-2">
                      Reservations will appear here when users book activities
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Gallery Items */}
            <div className="bg-white rounded-xl shadow overflow-hidden">
              <div className="px-4 py-3 sm:px-6 sm:py-4 border-b">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                    Recent Gallery Items
                    <span className="ml-2 text-xs sm:text-sm font-normal text-gray-500">
                      ({recentGallery.length})
                    </span>
                  </h2>
                  <Link
                    href="/admin/gallery"
                    className="text-xs sm:text-sm text-[#2d5a27] hover:underline"
                  >
                    View all
                  </Link>
                </div>
              </div>
              <div className="p-3 sm:p-6 max-h-[400px] sm:max-h-[500px] overflow-y-auto">
                {recentGallery.length > 0 ? (
                  <div className="space-y-3 sm:space-y-4">
                    {recentGallery.map((item, index) => (
                      <Link
                        key={item.id || `gallery-${index}`}
                        href="/admin/gallery"
                        className="block"
                      >
                        <div className="p-3 hover:bg-gray-50 rounded-lg transition">
                          <div className="flex justify-between items-start">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center">
                                {item.type === "image" ||
                                item.type === "image/jpeg" ||
                                item.type === "image/png" ? (
                                  <ImageIcon className="w-4 h-4 text-blue-500 mr-2 flex-shrink-0" />
                                ) : (
                                  <Video className="w-4 h-4 text-purple-500 mr-2 flex-shrink-0" />
                                )}
                                <h3 className="font-medium text-gray-800 text-sm sm:text-base truncate">
                                  {item.titleFr || item.title || "No title"}
                                </h3>
                              </div>
                              <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">
                                {item.descriptionFr ||
                                  item.description ||
                                  "No description"}
                              </p>
                              <div className="flex items-center text-xs text-gray-500 mt-2">
                                <Tag className="w-3 h-3 mr-1 flex-shrink-0" />
                                <span className="truncate">
                                  {item.category || "Uncategorized"}
                                </span>
                              </div>
                              <div className="flex items-center text-xs text-gray-400 mt-1">
                                <span>{item.views || 0} views</span>
                                <span className="mx-2">•</span>
                                <span>{item.downloads || 0} downloads</span>
                              </div>
                            </div>
                            <span
                              className={`ml-2 px-2 py-1 rounded-full text-xs font-medium flex items-center flex-shrink-0 ${item.type === "image" || item.type === "image/jpeg" || item.type === "image/png" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"}`}
                            >
                              {item.type === "image" ||
                              item.type === "image/jpeg" ||
                              item.type === "image/png"
                                ? "Image"
                                : "Video"}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 sm:py-8">
                    <ImageIcon className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm sm:text-base">
                      No gallery items yet
                    </p>
                    <p className="text-xs sm:text-sm text-gray-400 mt-2">
                      Upload images and videos to showcase your farm
                    </p>
                    <div className="mt-4">
                      <Link
                        href="/admin/gallery"
                        className="text-xs sm:text-sm text-[#2d5a27] hover:underline"
                      >
                        Upload first media →
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Links Section */}
          <div className="mt-8 bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">
              Quick Links
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link
                href="/admin/messages"
                className="flex flex-col items-center p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition group"
              >
                <div className="p-3 bg-blue-100 rounded-lg mb-3 group-hover:scale-110 transition">
                  <MessageSquare className="w-8 h-8 text-blue-600" />
                </div>
                <span className="font-medium text-gray-800">Messages</span>
                <span className="text-xs text-gray-500 mt-1">
                  {stats.totalMessages} total
                </span>
              </Link>

              <Link
                href="/admin/reservations"
                className="flex flex-col items-center p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition group"
              >
                <div className="p-3 bg-purple-100 rounded-lg mb-3 group-hover:scale-110 transition">
                  <Calendar className="w-8 h-8 text-purple-600" />
                </div>
                <span className="font-medium text-gray-800">Reservations</span>
                <span className="text-xs text-gray-500 mt-1">
                  {stats.totalReservations} total
                </span>
              </Link>

              <Link
                href="/admin/harvests"
                className="flex flex-col items-center p-4 bg-green-50 rounded-xl hover:bg-green-100 transition group"
              >
                <div className="p-3 bg-green-100 rounded-lg mb-3 group-hover:scale-110 transition">
                  <Sprout className="w-8 h-8 text-green-600" />
                </div>
                <span className="font-medium text-gray-800">Harvests</span>
                <span className="text-xs text-gray-500 mt-1">
                  {stats.totalHarvests} total
                </span>
              </Link>

              <Link
                href="/admin/gallery"
                className="flex flex-col items-center p-4 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition group"
              >
                <div className="p-3 bg-indigo-100 rounded-lg mb-3 group-hover:scale-110 transition">
                  <ImageIcon className="w-8 h-8 text-indigo-600" />
                </div>
                <span className="font-medium text-gray-800">Gallery</span>
                <span className="text-xs text-gray-500 mt-1">
                  {stats.totalGalleryItems} items
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-white border-t mt-6 sm:mt-8">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div className="mb-3 md:mb-0">
                <p className="text-gray-600 text-xs sm:text-sm">
                  © {new Date().getFullYear()} Al Manssouri Farm Admin Panel
                </p>
                {adminData && (
                  <p className="text-xs text-gray-500 mt-1 truncate max-w-xs">
                    User: {adminData.email}
                  </p>
                )}
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                <span className="text-xs text-gray-500">
                  Last refresh: {formatTime(lastRefreshTime)}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full ${stats.unreadMessages > 0 ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}
                  >
                    {stats.unreadMessages > 0
                      ? `${stats.unreadMessages} unread`
                      : "All read"}
                  </span>
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full ${stats.pendingReservations > 0 ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"}`}
                  >
                    {stats.pendingReservations > 0
                      ? `${stats.pendingReservations} pending`
                      : "All confirmed"}
                  </span>
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full ${stats.activeHarvests > 0 ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
                  >
                    {stats.activeHarvests > 0
                      ? `${stats.activeHarvests} active`
                      : "No harvests"}
                  </span>
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full ${stats.totalGalleryItems > 0 ? "bg-indigo-100 text-indigo-800" : "bg-gray-100 text-gray-800"}`}
                  >
                    {stats.totalGalleryItems > 0
                      ? `${stats.totalGalleryItems} media`
                      : "No media"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </footer>

        {/* Animations */}
        <style jsx global>{`
          @keyframes fade-in {
            from {
              opacity: 0;
              transform: scale(0.95);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }

          @keyframes slide-in {
            from {
              transform: translateX(-100%);
            }
            to {
              transform: translateX(0);
            }
          }

          .animate-fade-in {
            animation: fade-in 0.2s ease-out;
          }

          .animate-slide-in {
            animation: slide-in 0.3s ease-out;
          }

          .line-clamp-2 {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
        `}</style>
      </div>
    </SimpleAdminGuard>
  );
}
