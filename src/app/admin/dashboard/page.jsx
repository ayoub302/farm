"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  MessageSquare,
  LogOut,
  CalendarDays,
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

export default function AdminDashboard() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
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
    reservationConfirmationRate: 0,
    messageResponseRate: 0,
  });

  const [recentMessages, setRecentMessages] = useState([]);
  const [recentReservations, setRecentReservations] = useState([]);
  const [recentHarvests, setRecentHarvests] = useState([]);
  const [loadingStats, setLoadingStats] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const calculateStatsFromData = useCallback(
    (messages = [], reservations = [], activities = [], harvests = []) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const totalReservations = reservations.length;
      const pendingReservations = reservations.filter(
        (r) => r.status?.toLowerCase() === "pending",
      ).length;
      const confirmedReservations = reservations.filter(
        (r) => r.status?.toLowerCase() === "confirmed",
      ).length;
      const cancelledReservations = reservations.filter(
        (r) => r.status?.toLowerCase() === "cancelled",
      ).length;
      const todayReservations = reservations.filter((r) => {
        if (!r.createdAt) return false;
        return new Date(r.createdAt) >= today;
      }).length;

      const totalMessages = messages.length;
      const unreadMessages = messages.filter(
        (m) => m.status?.toLowerCase() === "unread",
      ).length;

      const totalActivities = activities.length;
      const upcomingActivities = activities.filter((a) => {
        if (!a.date) return false;
        return new Date(a.date) >= today;
      }).length;

      const totalHarvests = harvests.length;
      const activeHarvests = harvests.filter((h) => h.isActive === true).length;

      const reservationConfirmationRate =
        totalReservations > 0
          ? Math.round((confirmedReservations / totalReservations) * 100)
          : 0;
      const messageResponseRate =
        totalMessages > 0
          ? Math.round(((totalMessages - unreadMessages) / totalMessages) * 100)
          : 0;

      return {
        totalReservations,
        pendingReservations,
        confirmedReservations,
        cancelledReservations,
        todayReservations,
        totalMessages,
        unreadMessages,
        totalActivities,
        upcomingActivities,
        totalHarvests,
        activeHarvests,
        reservationConfirmationRate,
        messageResponseRate,
      };
    },
    [],
  );

  const fetchDashboardData = useCallback(async () => {
    setLoadingStats(true);
    try {
      const fetchSafe = async (url) => {
        try {
          const res = await fetch(url);
          if (!res.ok) return [];
          return await res.json();
        } catch {
          return [];
        }
      };

      const [messagesRes, reservationsRes, activitiesRes, harvestsRes] =
        await Promise.all([
          fetchSafe("/api/admin/messages/recent"),
          fetchSafe("/api/admin/reservations/recent"),
          fetchSafe("/api/admin/activities/recent"),
          fetchSafe("/api/admin/harvests/recent"),
        ]);

      const toArray = (res, keys) => {
        if (Array.isArray(res)) return res;
        for (const k of keys) if (Array.isArray(res?.[k])) return res[k];
        return [];
      };

      const formattedMessages = toArray(messagesRes, ["messages"]);
      const formattedReservations = toArray(reservationsRes, [
        "reservations",
        "bookings",
      ]);
      const formattedActivities = toArray(activitiesRes, ["activities"]);
      const formattedHarvests = toArray(harvestsRes, ["harvests"]);

      setRecentMessages(formattedMessages);
      setRecentReservations(formattedReservations);
      setRecentHarvests(formattedHarvests);

      const calculatedStats = calculateStatsFromData(
        formattedMessages,
        formattedReservations,
        formattedActivities,
        formattedHarvests,
      );
      setStats(calculatedStats);

      // Notificaciones dinámicas
      const notifs = [];
      if (calculatedStats.unreadMessages > 0)
        notifs.push({
          id: 1,
          type: "info",
          icon: <MessageSquare className="w-5 h-5" />,
          title: "Unread Messages",
          message: `You have ${calculatedStats.unreadMessages} unread messages`,
          time: "Just now",
          link: "/admin/messages",
          action: "View Messages",
        });
      if (calculatedStats.pendingReservations > 0)
        notifs.push({
          id: 2,
          type: "warning",
          icon: <Clock className="w-5 h-5" />,
          title: "Pending Reservations",
          message: `${calculatedStats.pendingReservations} reservations pending confirmation`,
          time: "Just now",
          link: "/admin/reservations?status=pending",
          action: "Review Reservations",
        });
      if (calculatedStats.todayReservations > 0)
        notifs.push({
          id: 3,
          type: "info",
          icon: <Calendar className="w-5 h-5" />,
          title: "Today's Reservations",
          message: `${calculatedStats.todayReservations} reservations for today`,
          time: "Just now",
          link: "/admin/reservations",
          action: "View Schedule",
        });
      if (calculatedStats.activeHarvests > 0)
        notifs.push({
          id: 5,
          type: "success",
          icon: <Sprout className="w-5 h-5" />,
          title: "Active Harvests",
          message: `${calculatedStats.activeHarvests} harvests available`,
          time: "Just now",
          link: "/admin/harvests",
          action: "Manage Harvests",
        });
      if (formattedMessages.length === 0 && formattedReservations.length === 0)
        notifs.push({
          id: 4,
          type: "warning",
          icon: <Bell className="w-5 h-5" />,
          title: "Welcome!",
          message: "No data in the system. Start by adding content.",
          time: "Just now",
          link: "/reservation",
          action: "Get Started",
        });

      setNotifications(notifs);
    } catch (error) {
      console.error("[DASHBOARD] Error:", error);
    } finally {
      setLoadingStats(false);
    }
  }, [calculateStatsFromData]);

  // Verificar sesión con cookie (sin Clerk)
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch("/api/admin/check-session");
        if (!res.ok) {
          router.push("/");
          return;
        }
        await fetchDashboardData();
      } catch {
        router.push("/");
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, [fetchDashboardData, router]);

  // Cerrar notificaciones al clicar fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        showNotifications &&
        !e.target.closest(".notifications-modal") &&
        !e.target.closest(".bell-icon")
      ) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [showNotifications]);

  const handleSignOut = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/");
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
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
    switch (status?.toLowerCase()) {
      case "confirmed":
      case "completed":
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

  const formatDate = (d) => {
    if (!d) return "";
    return new Date(d).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
    });
  };

  const formatDateTime = (d) => {
    if (!d) return "";
    return new Date(d).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modal Notificaciones */}
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
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-white hover:text-green-200 p-2 rounded-full hover:bg-green-700 transition"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto max-h-[calc(80vh-140px)] p-4">
              {notifications.length > 0 ? (
                <div className="space-y-3">
                  {notifications.map((n) => (
                    <Link
                      key={n.id}
                      href={n.link}
                      onClick={() => setShowNotifications(false)}
                      className="block"
                    >
                      <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition hover:border-[#2d5a27]/20 hover:translate-x-1">
                        <div className="flex items-start">
                          <div
                            className={`p-3 rounded-xl mr-4 ${n.type === "warning" ? "bg-yellow-50 border border-yellow-100" : n.type === "info" ? "bg-blue-50 border border-blue-100" : "bg-green-50 border border-green-100"}`}
                          >
                            <div
                              className={`p-2 rounded-lg ${n.type === "warning" ? "bg-yellow-100 text-yellow-600" : n.type === "info" ? "bg-blue-100 text-blue-600" : "bg-green-100 text-green-600"}`}
                            >
                              {n.icon}
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-semibold text-gray-800">
                                  {n.title}
                                </h3>
                                <p className="text-gray-600 text-sm mt-1">
                                  {n.message}
                                </p>
                              </div>
                              <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                                {n.time}
                              </span>
                            </div>
                            <div className="mt-4 flex items-center justify-between">
                              <span
                                className={`text-xs font-medium px-3 py-1.5 rounded-full ${n.type === "warning" ? "bg-yellow-100 text-yellow-700 border border-yellow-200" : n.type === "info" ? "bg-blue-100 text-blue-700 border border-blue-200" : "bg-green-100 text-green-700 border border-green-200"}`}
                              >
                                {n.action}
                              </span>
                              <span className="text-xs text-gray-400">
                                Click to view{" "}
                                <span className="text-[#2d5a27]">→</span>
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    All caught up!
                  </h3>
                  <p className="text-gray-500">
                    No notifications at the moment.
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 border-t bg-gray-50 flex justify-between">
              <button
                onClick={fetchDashboardData}
                className="flex items-center text-sm font-medium text-[#2d5a27] hover:text-green-800 px-4 py-2 rounded-lg hover:bg-green-50 transition"
              >
                <RefreshCw className="w-4 h-4 mr-2" /> Refresh
              </button>
              <button
                onClick={() => setShowNotifications(false)}
                className="text-sm text-gray-600 hover:text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-100 transition"
              >
                Close
              </button>
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
                className="mr-4 text-gray-600 hover:text-gray-900"
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
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={fetchDashboardData}
                disabled={loadingStats}
                className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${loadingStats ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="bell-icon p-2 hover:bg-gray-100 rounded-lg transition relative group"
                >
                  <Bell className="w-6 h-6 text-gray-500" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                      {notifications.length}
                    </span>
                  )}
                </button>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
              >
                <LogOut className="w-4 h-4 mr-2" /> Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

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
                  <Sprout className="w-5 h-5" /> Create New Harvest
                </Link>
                <Link
                  href="/admin/activities/new"
                  className="flex items-center gap-2 bg-white text-[#2d5a27] px-6 py-3 rounded-lg font-semibold hover:bg-green-50 hover:shadow-lg transition"
                >
                  <PlusCircle className="w-5 h-5" /> Create New Activity
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link href="/admin/reservations" className="block">
            <div className="bg-white rounded-xl shadow p-6 hover:shadow-md transition">
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
                {stats.reservationConfirmationRate > 0 && (
                  <p className="text-xs text-green-600 mt-1">
                    {stats.reservationConfirmationRate}% confirmation rate
                  </p>
                )}
              </div>
            </div>
          </Link>

          <Link href="/admin/reservations?status=pending" className="block">
            <div className="bg-white rounded-xl shadow p-6 hover:shadow-md transition">
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
            <div className="bg-white rounded-xl shadow p-6 hover:shadow-md transition">
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
                      width: `${Math.min(stats.unreadMessages * 10, 100)}%`,
                    }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Total: {stats.totalMessages} messages
                  {stats.messageResponseRate > 0 && (
                    <span className="ml-2 text-green-600">
                      • {stats.messageResponseRate}% response rate
                    </span>
                  )}
                </p>
              </div>
            </div>
          </Link>

          <Link href="/admin/harvests" className="block">
            <div className="bg-white rounded-xl shadow p-6 hover:shadow-md transition">
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

        {/* Recent Data */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Messages */}
          <div className="bg-white rounded-xl shadow">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-semibold text-gray-800">
                Recent Messages{" "}
                <span className="text-sm font-normal text-gray-500">
                  ({recentMessages.length})
                </span>
              </h2>
            </div>
            <div className="p-6 max-h-[600px] overflow-y-auto">
              {recentMessages.length > 0 ? (
                <div className="space-y-4">
                  {recentMessages.map((message) => (
                    <Link
                      key={message.id}
                      href={`/admin/messages#message-${message.id}`}
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
                                {message.email}
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
                            className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(message.status)}`}
                          >
                            {message.status}
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
                </div>
              )}
              <div className="mt-6">
                <Link
                  href="/admin/messages"
                  className="text-[#2d5a27] hover:underline font-medium"
                >
                  View all messages →
                </Link>
              </div>
            </div>
          </div>

          {/* Recent Reservations */}
          <div className="bg-white rounded-xl shadow">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-semibold text-gray-800">
                Recent Reservations{" "}
                <span className="text-sm font-normal text-gray-500">
                  ({recentReservations.length})
                </span>
              </h2>
            </div>
            <div className="p-6 max-h-[600px] overflow-y-auto">
              {recentReservations.length > 0 ? (
                <div className="space-y-4">
                  {recentReservations.map((r) => (
                    <Link
                      key={r.id}
                      href={`/admin/reservations#reservation-${r.id}`}
                      className="block"
                    >
                      <div className="p-3 hover:bg-gray-50 rounded-lg transition">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-gray-800">
                              {r.clientName || r.name || "No name"}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              {r.numPeople || 0} people •{" "}
                              {r.activity?.titleFr ||
                                r.activityType ||
                                "Reservation"}
                            </p>
                            <div className="flex items-center text-xs text-gray-500 mt-2">
                              <CalendarDays className="w-3 h-3 mr-1" />
                              <span>
                                {formatDate(
                                  r.bookingDate ||
                                    r.activityDate ||
                                    r.createdAt,
                                )}
                              </span>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">
                              {formatDateTime(r.createdAt)}
                            </p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(r.status)}`}
                          >
                            {getStatusIcon(r.status)}
                            {r.status || "pending"}
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
                </div>
              )}
              <div className="mt-6">
                <Link
                  href="/admin/reservations"
                  className="text-[#2d5a27] hover:underline font-medium"
                >
                  View all reservations →
                </Link>
              </div>
            </div>
          </div>

          {/* Recent Harvests */}
          <div className="bg-white rounded-xl shadow">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-semibold text-gray-800">
                Recent Harvests{" "}
                <span className="text-sm font-normal text-gray-500">
                  ({recentHarvests.length})
                </span>
              </h2>
            </div>
            <div className="p-6 max-h-[600px] overflow-y-auto">
              {recentHarvests.length > 0 ? (
                <div className="space-y-4">
                  {recentHarvests.map((h) => (
                    <Link
                      key={h.id}
                      href={`/admin/harvests#harvest-${h.id}`}
                      className="block"
                    >
                      <div className="p-3 hover:bg-gray-50 rounded-lg transition">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-gray-800">
                              {h.productFr || "No product name"}
                            </h3>
                            <div className="flex items-center text-xs text-gray-500 mt-2">
                              <CalendarDays className="w-3 h-3 mr-1" />
                              <span>
                                Next:{" "}
                                {h.nextHarvest
                                  ? formatDate(h.nextHarvest)
                                  : "Not scheduled"}
                              </span>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">
                              Created: {formatDate(h.createdAt)}
                            </p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(h.isActive ? "active" : "inactive")}`}
                          >
                            {getStatusIcon(h.isActive ? "active" : "inactive")}
                            {h.isActive ? "Active" : "Inactive"}
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
                  <Link
                    href="/admin/harvests/new"
                    className="text-sm text-[#2d5a27] hover:underline mt-2 inline-block"
                  >
                    Create your first harvest →
                  </Link>
                </div>
              )}
              <div className="mt-6">
                <Link
                  href="/admin/harvests"
                  className="text-[#2d5a27] hover:underline font-medium"
                >
                  View all harvests →
                </Link>
              </div>
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
                form.
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
              </div>
            </div>
          )}
      </div>

      {/* Footer */}
      <footer className="bg-white border-t mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 text-sm">
              © {new Date().getFullYear()} Al Manssouri Farm Admin Panel
            </p>
            <div className="flex items-center space-x-2 mt-2 md:mt-0">
              <span
                className={`text-xs px-2 py-1 rounded-full ${stats.unreadMessages > 0 ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}
              >
                {stats.unreadMessages > 0
                  ? `${stats.unreadMessages} unread`
                  : "All read"}
              </span>
              <span
                className={`text-xs px-2 py-1 rounded-full ${stats.pendingReservations > 0 ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"}`}
              >
                {stats.pendingReservations > 0
                  ? `${stats.pendingReservations} pending`
                  : "All confirmed"}
              </span>
              <span
                className={`text-xs px-2 py-1 rounded-full ${stats.activeHarvests > 0 ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
              >
                {stats.activeHarvests > 0
                  ? `${stats.activeHarvests} active harvests`
                  : "No active harvests"}
              </span>
            </div>
          </div>
        </div>
      </footer>

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
