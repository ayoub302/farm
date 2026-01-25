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
} from "lucide-react";

// ================= SIMPLE ADMIN GUARD =================
const SimpleAdminGuard = ({ children }) => {
  const { isLoaded, userId } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const hasCheckedRef = useRef(false);

  useEffect(() => {
    if (!isLoaded || hasCheckedRef.current) return;

    hasCheckedRef.current = true;

    const checkAdmin = async () => {
      if (!userId) {
        router.push("/sign-in");
        return;
      }

      try {
        // Verificación simple - si está en desarrollo, permitir acceso
        if (process.env.NODE_ENV === "development") {
          console.log("[DEV MODE] Bypassing admin check");
          setIsAdmin(true);
          setLoading(false);
          return;
        }

        const res = await fetch("/api/admin/verify");
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setIsAdmin(true);
          } else {
            router.push("/");
          }
        } else {
          router.push("/");
        }
      } catch {
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, [isLoaded, userId, router]);

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2d5a27] mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking admin permissions...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-4">
            You don&apos;t have permission to access this page.
          </p>
          <Link
            href="/"
            className="bg-[#2d5a27] text-white px-6 py-3 rounded-lg hover:bg-green-800 transition inline-block"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default function AdminDashboard() {
  const { isLoaded, userId } = useAuth();
  const router = useRouter();

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
  });

  const [recentMessages, setRecentMessages] = useState([]);
  const [recentReservations, setRecentReservations] = useState([]);
  const [recentHarvests, setRecentHarvests] = useState([]);
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
      const [messagesRes, reservationsRes, harvestsRes] = await Promise.all([
        fetch("/api/admin/messages/recent").then((r) => (r.ok ? r.json() : [])),
        fetch("/api/admin/reservations/recent").then((r) =>
          r.ok ? r.json() : [],
        ),
        fetch("/api/admin/harvests/recent").then((r) => (r.ok ? r.json() : [])),
      ]);

      const messages = Array.isArray(messagesRes) ? messagesRes : [];
      const reservations = Array.isArray(reservationsRes)
        ? reservationsRes
        : [];
      const harvests = Array.isArray(harvestsRes) ? harvestsRes : [];

      setRecentMessages(messages.slice(0, 5));
      setRecentReservations(reservations.slice(0, 5));
      setRecentHarvests(harvests.slice(0, 5));

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
        (m) => m.status?.toLowerCase() === "unread",
      ).length;

      const pendingReservations = reservations.filter(
        (r) => r.status?.toLowerCase() === "pending",
      ).length;

      const activeHarvests = harvests.filter((h) => h.isActive === true).length;

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
      });

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

      setNotifications(newNotifications);
      setLastRefreshTime(new Date());
    } catch (err) {
      console.error("[DASHBOARD] Fetch error:", err);
    } finally {
      isFetchingRef.current = false;
      setLoadingStats(false);
    }
  }, [userId]);

  // ================= INIT DASHBOARD =================
  useEffect(() => {
    if (!isLoaded || !userId || hasFetchedRef.current) return;

    hasFetchedRef.current = true;
    setLoading(true);

    const init = async () => {
      try {
        // BYPASS TEMPORAL PARA DESARROLLO
        console.log("[DASHBOARD] Initializing in development mode");
        setAdminData({
          email: "admin@almanssouri.com",
          adminBy: "ADMIN",
          role: "ADMIN",
        });
        setLoading(false);

        // Pequeño delay antes de cargar datos
        setTimeout(() => {
          fetchDashboardData();
        }, 100);
      } catch (err) {
        console.error("[DASHBOARD] Init error:", err);
        setAuthError(true);
        setLoading(false);
      }
    };

    init();
  }, [isLoaded, userId, fetchDashboardData]);

  // Loading y error states
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2d5a27] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading authentication...</p>
        </div>
      </div>
    );
  }

  if (authError || !userId) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Authentication Error
            </h2>
            <p className="text-gray-600 mb-4">
              {!userId
                ? "You are not signed in."
                : "Unable to verify admin access."}
            </p>
            <div className="space-y-3">
              {!userId ? (
                <>
                  <Link
                    href="/sign-in"
                    className="block w-full bg-[#2d5a27] text-white px-6 py-3 rounded-lg hover:bg-green-800 transition text-center"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/"
                    className="block w-full border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition text-center"
                  >
                    Return to Home
                  </Link>
                </>
              ) : (
                <>
                  <p className="text-sm text-gray-500">
                    You are signed in as: {userId?.substring(0, 8)}...
                  </p>
                  <button
                    onClick={() => window.location.reload()}
                    className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2d5a27] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Helper functions
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
      await fetch("/api/admin/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "logout",
          userId: userId,
        }),
      });
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Main render - SIN AdminGuard wrapper
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modal de Notificaciones */}
      {showNotifications && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="notifications-modal bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden animate-fade-in">
            <div className="p-6 border-b bg-gradient-to-r from-[#2d5a27] to-green-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Bell className="w-8 h-8 text-white mr-4" />
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      Notifications
                    </h2>
                    <p className="text-green-100 text-sm mt-1">
                      Stay updated with your farm activities
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-white hover:text-green-200 px-4 py-2 rounded-lg hover:bg-green-700 transition"
                  >
                    Mark all read
                  </button>
                  <button
                    onClick={toggleNotifications}
                    className="text-white hover:text-green-200 p-2 rounded-full hover:bg-green-700 transition"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-y-auto max-h-[calc(80vh-140px)]">
              {notifications.length > 0 ? (
                <div className="p-4">
                  <div className="mb-4 px-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        {notifications.length} notification
                        {notifications.length !== 1 ? "s" : ""}
                      </span>
                      <span className="text-xs text-gray-500">
                        Updated {formatTime(lastRefreshTime)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {notifications.map((notification) => (
                      <Link
                        key={notification.id}
                        href={notification.link}
                        onClick={() => setShowNotifications(false)}
                        className="block"
                      >
                        <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all hover:border-[#2d5a27]/20 hover:translate-x-1">
                          <div className="flex items-start">
                            <div
                              className={`p-3 rounded-xl mr-4 ${
                                notification.type === "warning"
                                  ? "bg-yellow-50 border border-yellow-100"
                                  : notification.type === "info"
                                    ? "bg-blue-50 border border-blue-100"
                                    : "bg-green-50 border border-green-100"
                              }`}
                            >
                              <div
                                className={`p-2 rounded-lg ${
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
                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-semibold text-gray-800">
                                    {notification.title}
                                  </h3>
                                  <p className="text-gray-600 text-sm mt-1">
                                    {notification.message}
                                  </p>
                                </div>
                                <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                                  {notification.time}
                                </span>
                              </div>
                              <div className="mt-4 flex items-center justify-between">
                                <span
                                  className={`text-xs font-medium px-3 py-1.5 rounded-full ${
                                    notification.type === "warning"
                                      ? "bg-yellow-100 text-yellow-700 border border-yellow-200"
                                      : notification.type === "info"
                                        ? "bg-blue-100 text-blue-700 border border-blue-200"
                                        : "bg-green-100 text-green-700 border border-green-200"
                                  }`}
                                >
                                  {notification.action}
                                </span>
                                <span className="text-xs text-gray-400 flex items-center">
                                  Click to view
                                  <span className="ml-1 text-[#2d5a27]">→</span>
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
                <div className="p-12 text-center">
                  <div className="bg-gray-50 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                    <Bell className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    All caught up!
                  </h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    You have no notifications at the moment. Check back later
                    for updates.
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 border-t bg-gray-50">
              <div className="flex justify-between items-center">
                <button
                  onClick={handleRefresh}
                  disabled={loadingStats}
                  className="flex items-center text-sm font-medium text-[#2d5a27] hover:text-green-800 px-4 py-2 rounded-lg hover:bg-green-50 transition disabled:opacity-50"
                >
                  <RefreshCw
                    className={`w-4 h-4 mr-2 ${loadingStats ? "animate-spin" : ""}`}
                  />
                  Refresh notifications
                </button>
                <button
                  onClick={toggleNotifications}
                  className="text-sm text-gray-600 hover:text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-100 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link
                href="/"
                className="mr-4 text-gray-600 hover:text-gray-900 transition"
                title="Go to public website"
              >
                <Home className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Admin Dashboard
                </h1>
                <p className="text-gray-600 mt-1">
                  Al Manssouri Farm - Control Panel
                </p>
                {adminData && (
                  <p className="text-sm text-gray-500 mt-1">
                    Logged in as: {adminData.email} ({adminData.adminBy})
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleRefresh}
                disabled={loadingStats}
                className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition disabled:opacity-50"
                title="Refresh dashboard data"
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${loadingStats ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
              <div className="relative">
                <button
                  onClick={toggleNotifications}
                  className="bell-icon p-2 hover:bg-gray-100 rounded-lg transition relative group"
                  title="View notifications"
                >
                  <Bell className="w-6 h-6 text-gray-500 group-hover:text-gray-700 transition" />
                  {notifications.length > 0 && (
                    <>
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                        {notifications.length}
                      </span>
                      <span className="absolute -top-8 right-0 bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {notifications.length} notification
                        {notifications.length !== 1 ? "s" : ""}
                      </span>
                    </>
                  )}
                </button>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
                title="Sign out from admin panel"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-[#2d5a27] to-green-700 rounded-xl shadow-lg p-6 text-white">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold mb-2">Quick Actions</h2>
                <p className="text-green-100">
                  Manage your farm activities and harvests efficiently
                </p>
              </div>
              <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
                <Link
                  href="/admin/harvests/new"
                  className="flex items-center gap-2 bg-white text-[#2d5a27] px-6 py-3 rounded-lg font-semibold hover:bg-green-50 hover:shadow-lg transition"
                >
                  <Sprout className="w-5 h-5" />
                  Create New Harvest
                </Link>
                <Link
                  href="/admin/activities/new"
                  className="flex items-center gap-2 bg-white text-[#2d5a27] px-6 py-3 rounded-lg font-semibold hover:bg-green-50 hover:shadow-lg transition"
                >
                  <PlusCircle className="w-5 h-5" />
                  Create New Activity
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link href="/admin/reservations" className="block">
            <div className="bg-white rounded-xl shadow p-6 hover:shadow-md transition cursor-pointer">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Calendar className="w-8 h-8 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Total Reservations</p>
                  <p className="text-2xl font-bold">
                    {stats.totalReservations}
                  </p>
                </div>
              </div>
              <div className="mt-4 text-sm">
                <span className="text-gray-600">
                  Today: {stats.todayReservations}
                </span>
              </div>
            </div>
          </Link>

          <Link href="/admin/reservations?status=pending" className="block">
            <div className="bg-white rounded-xl shadow p-6 hover:shadow-md transition cursor-pointer">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Clock className="w-8 h-8 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Pending Reservations</p>
                  <p className="text-2xl font-bold">
                    {stats.pendingReservations}
                  </p>
                </div>
              </div>
              <div className="mt-4 text-sm">
                <span className="text-gray-600">
                  {stats.pendingReservations > 0
                    ? "Need attention"
                    : "All processed"}
                </span>
              </div>
            </div>
          </Link>

          <Link href="/admin/messages" className="block">
            <div className="bg-white rounded-xl shadow p-6 hover:shadow-md transition cursor-pointer">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <MessageSquare className="w-8 h-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Unread Messages</p>
                  <p className="text-2xl font-bold">{stats.unreadMessages}</p>
                </div>
              </div>
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{
                      width: `${Math.min((stats.unreadMessages / (stats.totalMessages || 1)) * 100, 100)}%`,
                    }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Total: {stats.totalMessages || 0} messages
                </p>
              </div>
            </div>
          </Link>

          <Link href="/admin/harvests" className="block">
            <div className="bg-white rounded-xl shadow p-6 hover:shadow-md transition cursor-pointer">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Sprout className="w-8 h-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Active Harvests</p>
                  <p className="text-2xl font-bold">{stats.activeHarvests}</p>
                </div>
              </div>
              <div className="mt-4 text-sm">
                <span className="text-gray-600">
                  Total: {stats.totalHarvests}
                </span>
                {stats.activeHarvests > 0 && (
                  <p className="text-xs text-green-600 mt-1">
                    {stats.activeHarvests} available for booking
                  </p>
                )}
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Data Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Messages */}
          <div className="bg-white rounded-xl shadow">
            <div className="px-6 py-4 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800">
                  Recent Messages
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    ({recentMessages.length} total)
                  </span>
                </h2>
                <Link
                  href="/admin/messages"
                  className="text-sm text-[#2d5a27] hover:underline"
                >
                  View all
                </Link>
              </div>
            </div>
            <div className="p-6 max-h-[600px] overflow-y-auto">
              {recentMessages.length > 0 ? (
                <div className="space-y-4">
                  {recentMessages.map((message, index) => (
                    <Link
                      key={message.id || `msg-${index}`}
                      href="/admin/messages"
                      className="block"
                    >
                      <div
                        className={`p-3 rounded-lg hover:bg-gray-50 transition ${message.status === "unread" ? "bg-blue-50 border-l-4 border-blue-500" : ""}`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center">
                              <h3 className="font-medium text-gray-800">
                                {message.name || "No name"}
                              </h3>
                              {message.status === "unread" && (
                                <span className="ml-2 bg-blue-500 text-white text-xs rounded-full px-2 py-1">
                                  New
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1 truncate">
                              {message.subject || "No subject"}
                            </p>
                            <div className="flex items-center text-xs text-gray-500 mt-2">
                              <Mail className="w-3 h-3 mr-1" />
                              <span className="truncate mr-3">
                                {message.email || "No email"}
                              </span>
                              {message.phone && (
                                <>
                                  <Phone className="w-3 h-3 mr-1 ml-2" />
                                  <span>{message.phone}</span>
                                </>
                              )}
                            </div>
                            <p className="text-xs text-gray-400 mt-1">
                              {formatDateTime(message.createdAt)}
                            </p>
                          </div>
                          <span
                            className={`ml-2 px-2 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(message.status)}`}
                          >
                            {message.status || "unknown"}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No messages yet</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Messages from contact form will appear here
                  </p>
                  <div className="mt-4">
                    <Link
                      href="/contact"
                      target="_blank"
                      className="text-sm text-[#2d5a27] hover:underline"
                    >
                      Test contact form →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Recent Reservations */}
          <div className="bg-white rounded-xl shadow">
            <div className="px-6 py-4 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800">
                  Recent Reservations
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    ({recentReservations.length} total)
                  </span>
                </h2>
                <Link
                  href="/admin/reservations"
                  className="text-sm text-[#2d5a27] hover:underline"
                >
                  View all
                </Link>
              </div>
            </div>
            <div className="p-6 max-h-[600px] overflow-y-auto">
              {recentReservations.length > 0 ? (
                <div className="space-y-4">
                  {recentReservations.map((reservation, index) => (
                    <Link
                      key={reservation.id || `res-${index}`}
                      href="/admin/reservations"
                      className="block"
                    >
                      <div className="p-3 hover:bg-gray-50 rounded-lg transition">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-gray-800">
                              {reservation.clientName ||
                                reservation.name ||
                                "No name"}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              {reservation.numPeople || 0} people •{" "}
                              {reservation.activity?.titleFr ||
                                reservation.activityType ||
                                "Reservation"}
                            </p>
                            <div className="flex items-center text-xs text-gray-500 mt-2">
                              <Calendar className="w-3 h-3 mr-1" />
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
                            className={`px-3 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(reservation.status)}`}
                          >
                            {getStatusIcon(reservation.status)}
                            {reservation.status || "pending"}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No reservations yet</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Reservations will appear here when users book activities
                  </p>
                  <div className="mt-4">
                    <Link
                      href="/reservation"
                      target="_blank"
                      className="text-sm text-[#2d5a27] hover:underline"
                    >
                      Test reservation form →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Recent Harvests */}
          <div className="bg-white rounded-xl shadow">
            <div className="px-6 py-4 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800">
                  Recent Harvests
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    ({recentHarvests.length} total)
                  </span>
                </h2>
                <Link
                  href="/admin/harvests"
                  className="text-sm text-[#2d5a27] hover:underline"
                >
                  View all
                </Link>
              </div>
            </div>
            <div className="p-6 max-h-[600px] overflow-y-auto">
              {recentHarvests.length > 0 ? (
                <div className="space-y-4">
                  {recentHarvests.map((harvest, index) => (
                    <Link
                      key={harvest.id || `har-${index}`}
                      href="/admin/harvests"
                      className="block"
                    >
                      <div className="p-3 hover:bg-gray-50 rounded-lg transition">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-gray-800">
                              {harvest.productFr || "No product name"}
                            </h3>
                            <div className="flex items-center text-xs text-gray-500 mt-2">
                              <Calendar className="w-3 h-3 mr-1" />
                              <span>
                                Next harvest:{" "}
                                {harvest.nextHarvest
                                  ? formatDate(harvest.nextHarvest)
                                  : "Not scheduled"}
                              </span>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">
                              Created: {formatDate(harvest.createdAt)}
                            </p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(harvest.isActive ? "active" : "inactive")}`}
                          >
                            {getStatusIcon(
                              harvest.isActive ? "active" : "inactive",
                            )}
                            {harvest.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Sprout className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No harvests yet</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Harvests will appear here when you create them
                  </p>
                  <div className="mt-4">
                    <Link
                      href="/admin/harvests/new"
                      className="text-sm text-[#2d5a27] hover:underline"
                    >
                      Create your first harvest →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Empty State */}
        {stats.totalReservations === 0 &&
          stats.totalMessages === 0 &&
          stats.totalHarvests === 0 && (
            <div className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Welcome to your Dashboard! 🎉
              </h2>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Get started by creating harvests or testing the reservation
                form. Your dashboard will show real-time statistics as users
                interact with your farm.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/admin/harvests/new"
                  className="bg-[#2d5a27] text-white px-6 py-3 rounded-lg hover:bg-green-800 transition font-medium"
                >
                  Create Your First Harvest
                </Link>
                <Link
                  href="/reservation"
                  target="_blank"
                  className="bg-white text-[#2d5a27] border border-[#2d5a27] px-6 py-3 rounded-lg hover:bg-green-50 transition font-medium"
                >
                  Test Reservation Form
                </Link>
                <Link
                  href="/contact"
                  target="_blank"
                  className="bg-white text-[#2d5a27] border border-[#2d5a27] px-6 py-3 rounded-lg hover:bg-green-50 transition font-medium"
                >
                  Test Contact Form
                </Link>
              </div>
            </div>
          )}
      </div>

      {/* Footer */}
      <footer className="bg-white border-t mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <p className="text-gray-600 text-sm">
                © {new Date().getFullYear()} Al Manssouri Farm Admin Panel
              </p>
              {adminData && (
                <p className="text-xs text-gray-500 mt-1">
                  User: {adminData.email} • Role: {adminData.adminBy}
                </p>
              )}
            </div>
            <div className="flex items-center space-x-4 mt-2 md:mt-0">
              <span className="text-sm text-gray-500">
                Last refresh: {formatTime(lastRefreshTime)}
              </span>
              <div className="flex items-center space-x-2">
                <span
                  className={`text-xs px-2 py-1 rounded-full ${stats.unreadMessages > 0 ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}
                >
                  {stats.unreadMessages > 0
                    ? `${stats.unreadMessages} unread message${stats.unreadMessages !== 1 ? "s" : ""}`
                    : "All messages read"}
                </span>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${stats.pendingReservations > 0 ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"}`}
                >
                  {stats.pendingReservations > 0
                    ? `${stats.pendingReservations} pending reservation${stats.pendingReservations !== 1 ? "s" : ""}`
                    : "All reservations confirmed"}
                </span>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${stats.activeHarvests > 0 ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
                >
                  {stats.activeHarvests > 0
                    ? `${stats.activeHarvests} active harvest${stats.activeHarvests !== 1 ? "s" : ""}`
                    : "No active harvests"}
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
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
