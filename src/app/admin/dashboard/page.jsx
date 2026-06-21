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
  Menu,
} from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

      const notifs = [];
      if (calculatedStats.unreadMessages > 0)
        notifs.push({
          id: 1,
          type: "info",
          icon: <MessageSquare className="w-5 h-5" />,
          title: "Messages non lus",
          message: `Vous avez ${calculatedStats.unreadMessages} messages non lus`,
          time: "À l'instant",
          link: "/admin/messages",
          action: "Voir les messages",
        });
      if (calculatedStats.pendingReservations > 0)
        notifs.push({
          id: 2,
          type: "warning",
          icon: <Clock className="w-5 h-5" />,
          title: "Réservations en attente",
          message: `${calculatedStats.pendingReservations} réservations en attente de confirmation`,
          time: "À l'instant",
          link: "/admin/reservations?status=pending",
          action: "Vérifier les réservations",
        });
      if (calculatedStats.todayReservations > 0)
        notifs.push({
          id: 3,
          type: "info",
          icon: <Calendar className="w-5 h-5" />,
          title: "Réservations du jour",
          message: `${calculatedStats.todayReservations} réservations aujourd'hui`,
          time: "À l'instant",
          link: "/admin/reservations",
          action: "Voir le planning",
        });
      if (calculatedStats.activeHarvests > 0)
        notifs.push({
          id: 5,
          type: "success",
          icon: <Sprout className="w-5 h-5" />,
          title: "Récoltes actives",
          message: `${calculatedStats.activeHarvests} récoltes disponibles`,
          time: "À l'instant",
          link: "/admin/harvests",
          action: "Gérer les récoltes",
        });
      if (formattedMessages.length === 0 && formattedReservations.length === 0)
        notifs.push({
          id: 4,
          type: "warning",
          icon: <Bell className="w-5 h-5" />,
          title: "Bienvenue !",
          message:
            "Aucune donnée dans le système. Commencez par ajouter du contenu.",
          time: "À l'instant",
          link: "/reservation",
          action: "Commencer",
        });

      setNotifications(notifs);
    } catch (error) {
      console.error("[DASHBOARD] Error:", error);
    } finally {
      setLoadingStats(false);
    }
  }, [calculateStatsFromData]);

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
    return new Date(d).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
    });
  };

  const formatDateTime = (d) => {
    if (!d) return "";
    return new Date(d).toLocaleDateString("fr-FR", {
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
          <p className="mt-4 text-gray-600">Chargement du tableau de bord...</p>
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
            <div className="p-4 sm:p-6 border-b bg-gradient-to-r from-[#2d5a27] to-green-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Bell className="w-6 h-6 sm:w-8 sm:h-8 text-white mr-3 sm:mr-4" />
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white">
                      Notifications
                    </h2>
                    <p className="text-green-100 text-xs sm:text-sm mt-1">
                      Restez informé des activités de votre ferme
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-white hover:text-green-200 p-2 rounded-full hover:bg-green-700 transition"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
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
                      <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 hover:shadow-md transition hover:border-[#2d5a27]/20 hover:translate-x-1">
                        <div className="flex items-start">
                          <div
                            className={`p-2 sm:p-3 rounded-xl mr-3 sm:mr-4 ${n.type === "warning" ? "bg-yellow-50 border border-yellow-100" : n.type === "info" ? "bg-blue-50 border border-blue-100" : "bg-green-50 border border-green-100"}`}
                          >
                            <div
                              className={`p-1.5 sm:p-2 rounded-lg ${n.type === "warning" ? "bg-yellow-100 text-yellow-600" : n.type === "info" ? "bg-blue-100 text-blue-600" : "bg-green-100 text-green-600"}`}
                            >
                              {n.icon}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row justify-between items-start">
                              <div className="w-full">
                                <h3 className="font-semibold text-gray-800 text-sm sm:text-base">
                                  {n.title}
                                </h3>
                                <p className="text-gray-600 text-xs sm:text-sm mt-1 break-words">
                                  {n.message}
                                </p>
                              </div>
                              <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-600 mt-1 sm:mt-0 whitespace-nowrap">
                                {n.time}
                              </span>
                            </div>
                            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                              <span
                                className={`text-xs font-medium px-2 sm:px-3 py-1.5 rounded-full ${n.type === "warning" ? "bg-yellow-100 text-yellow-700 border border-yellow-200" : n.type === "info" ? "bg-blue-100 text-blue-700 border border-blue-200" : "bg-green-100 text-green-700 border border-green-200"}`}
                              >
                                {n.action}
                              </span>
                              <span className="text-xs text-gray-400">
                                Cliquez pour voir{" "}
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
                <div className="p-8 sm:p-12 text-center">
                  <Bell className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
                    Tout est à jour !
                  </h3>
                  <p className="text-gray-500 text-sm sm:text-base">
                    Aucune notification pour le moment.
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 border-t bg-gray-50 flex flex-col sm:flex-row justify-between gap-2">
              <button
                onClick={fetchDashboardData}
                className="flex items-center justify-center text-sm font-medium text-[#2d5a27] hover:text-green-800 px-4 py-2 rounded-lg hover:bg-green-50 transition"
              >
                <RefreshCw className="w-4 h-4 mr-2" /> Actualiser
              </button>
              <button
                onClick={() => setShowNotifications(false)}
                className="text-sm text-gray-600 hover:text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-100 transition"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex flex-wrap items-center justify-between py-4 sm:py-6 gap-3">
            <div className="flex items-center min-w-0">
              <Link
                href="/"
                className="mr-2 sm:mr-4 text-gray-600 hover:text-gray-900 flex-shrink-0"
                title="Voir le site public"
              >
                <Home className="w-5 h-5 sm:w-6 sm:h-6" />
              </Link>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">
                  Admin Dashboard
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 truncate hidden sm:block">
                  Al Manssouri Farm - Panneau de contrôle
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-3 ml-auto">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <Menu className="w-5 h-5 text-gray-500" />
              </button>

              {/* Desktop Actions */}
              <div className="hidden lg:flex items-center space-x-3">
                <button
                  onClick={fetchDashboardData}
                  disabled={loadingStats}
                  className="flex items-center px-3 sm:px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition disabled:opacity-50 text-sm"
                >
                  <RefreshCw
                    className={`w-4 h-4 mr-2 ${loadingStats ? "animate-spin" : ""}`}
                  />
                  <span className="hidden sm:inline">Actualiser</span>
                </button>
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="bell-icon p-2 hover:bg-gray-100 rounded-lg transition relative group"
                  >
                    <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" />
                    {notifications.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                        {notifications.length}
                      </span>
                    )}
                  </button>
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex items-center px-3 sm:px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition text-sm"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Déconnexion</span>
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden py-4 border-t border-gray-200">
              <div className="flex flex-col space-y-3">
                <button
                  onClick={() => {
                    fetchDashboardData();
                    setMobileMenuOpen(false);
                  }}
                  disabled={loadingStats}
                  className="flex items-center w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition disabled:opacity-50 text-sm"
                >
                  <RefreshCw
                    className={`w-4 h-4 mr-3 ${loadingStats ? "animate-spin" : ""}`}
                  />
                  Actualiser
                </button>
                <button
                  onClick={() => {
                    setShowNotifications(true);
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center w-full px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition text-sm relative"
                >
                  <Bell className="w-4 h-4 mr-3" />
                  Notifications
                  {notifications.length > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {notifications.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => {
                    handleSignOut();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center w-full px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition text-sm"
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  Déconnexion
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        {/* Quick Actions */}
        <div className="mb-6 sm:mb-8">
          <div className="bg-gradient-to-r from-[#2d5a27] to-green-700 rounded-xl shadow-lg p-4 sm:p-6 text-white">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">
                  Actions rapides
                </h2>
                <p className="text-green-100 text-sm sm:text-base">
                  Gérez vos activités agricoles et vos récoltes efficacement
                </p>
              </div>
              <div className="flex flex-wrap gap-2 sm:gap-3 w-full lg:w-auto">
                <Link
                  href="/admin/harvests/new"
                  className="flex items-center gap-2 bg-white text-[#2d5a27] px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:bg-green-50 hover:shadow-lg transition text-sm sm:text-base flex-1 lg:flex-none justify-center"
                >
                  <Sprout className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="truncate">Nouvelle récolte</span>
                </Link>
                <Link
                  href="/admin/activities/new"
                  className="flex items-center gap-2 bg-white text-[#2d5a27] px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:bg-green-50 hover:shadow-lg transition text-sm sm:text-base flex-1 lg:flex-none justify-center"
                >
                  <PlusCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="truncate">Nouvelle activité</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Stats - Mobile optimized grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          <Link href="/admin/reservations" className="block">
            <div className="bg-white rounded-xl shadow p-4 sm:p-6 hover:shadow-md transition">
              <div className="flex items-center">
                <div className="p-2 sm:p-3 bg-purple-100 rounded-lg flex-shrink-0">
                  <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
                </div>
                <div className="ml-3 sm:ml-4 min-w-0">
                  <p className="text-xs sm:text-sm text-gray-500 truncate">
                    Réservations totales
                  </p>
                  <p className="text-xl sm:text-2xl font-bold">
                    {stats.totalReservations}
                  </p>
                </div>
              </div>
              <div className="mt-3 sm:mt-4 text-xs sm:text-sm">
                <span className="text-gray-600">
                  Aujourd&apos;hui: {stats.todayReservations}
                </span>
                {stats.reservationConfirmationRate > 0 && (
                  <p className="text-xs text-green-600 mt-1">
                    {stats.reservationConfirmationRate}% taux de confirmation
                  </p>
                )}
              </div>
            </div>
          </Link>

          <Link href="/admin/reservations?status=pending" className="block">
            <div className="bg-white rounded-xl shadow p-4 sm:p-6 hover:shadow-md transition">
              <div className="flex items-center">
                <div className="p-2 sm:p-3 bg-yellow-100 rounded-lg flex-shrink-0">
                  <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600" />
                </div>
                <div className="ml-3 sm:ml-4 min-w-0">
                  <p className="text-xs sm:text-sm text-gray-500 truncate">
                    En attente
                  </p>
                  <p className="text-xl sm:text-2xl font-bold">
                    {stats.pendingReservations}
                  </p>
                </div>
              </div>
              <div className="mt-3 sm:mt-4 text-xs sm:text-sm">
                <span className="text-gray-600">
                  {stats.pendingReservations > 0
                    ? "À traiter"
                    : "Tout est traité"}
                </span>
              </div>
            </div>
          </Link>

          <Link href="/admin/messages" className="block">
            <div className="bg-white rounded-xl shadow p-4 sm:p-6 hover:shadow-md transition">
              <div className="flex items-center">
                <div className="p-2 sm:p-3 bg-blue-100 rounded-lg flex-shrink-0">
                  <MessageSquare className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                </div>
                <div className="ml-3 sm:ml-4 min-w-0">
                  <p className="text-xs sm:text-sm text-gray-500 truncate">
                    Messages non lus
                  </p>
                  <p className="text-xl sm:text-2xl font-bold">
                    {stats.unreadMessages}
                  </p>
                </div>
              </div>
              <div className="mt-3 sm:mt-4">
                <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                  <div
                    className="bg-blue-500 h-1.5 sm:h-2 rounded-full"
                    style={{
                      width: `${Math.min(stats.unreadMessages * 10, 100)}%`,
                    }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Total: {stats.totalMessages} messages
                  {stats.messageResponseRate > 0 && (
                    <span className="ml-1 sm:ml-2 text-green-600 block sm:inline">
                      • {stats.messageResponseRate}% répondu
                    </span>
                  )}
                </p>
              </div>
            </div>
          </Link>

          <Link href="/admin/harvests" className="block">
            <div className="bg-white rounded-xl shadow p-4 sm:p-6 hover:shadow-md transition">
              <div className="flex items-center">
                <div className="p-2 sm:p-3 bg-green-100 rounded-lg flex-shrink-0">
                  <Sprout className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                </div>
                <div className="ml-3 sm:ml-4 min-w-0">
                  <p className="text-xs sm:text-sm text-gray-500 truncate">
                    Récoltes actives
                  </p>
                  <p className="text-xl sm:text-2xl font-bold">
                    {stats.activeHarvests}
                  </p>
                </div>
              </div>
              <div className="mt-3 sm:mt-4 text-xs sm:text-sm">
                <span className="text-gray-600">
                  Total: {stats.totalHarvests}
                </span>
                {stats.activeHarvests > 0 && (
                  <p className="text-xs text-green-600 mt-1">
                    {stats.activeHarvests} disponibles
                  </p>
                )}
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Data - Mobile optimized */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Recent Messages */}
          <div className="bg-white rounded-xl shadow">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b">
              <h2 className="text-base sm:text-xl font-semibold text-gray-800">
                Messages récents{" "}
                <span className="text-sm font-normal text-gray-500">
                  ({recentMessages.length})
                </span>
              </h2>
            </div>
            <div className="p-3 sm:p-6 max-h-[400px] sm:max-h-[600px] overflow-y-auto">
              {recentMessages.length > 0 ? (
                <div className="space-y-3 sm:space-y-4">
                  {recentMessages.map((message) => (
                    <Link
                      key={message.id}
                      href={`/admin/messages#message-${message.id}`}
                      className="block"
                    >
                      <div
                        className={`p-2 sm:p-3 rounded-lg hover:bg-gray-50 transition ${message.status === "unread" ? "bg-blue-50 border-l-4 border-blue-500" : ""}`}
                      >
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                          <div className="flex-1 min-w-0 w-full">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-medium text-gray-800 text-sm sm:text-base truncate">
                                {message.name || "Sans nom"}
                              </h3>
                              {message.status === "unread" && (
                                <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1 flex-shrink-0">
                                  Nouveau
                                </span>
                              )}
                            </div>
                            <p className="text-xs sm:text-sm text-gray-600 mt-1 truncate">
                              {message.subject || "Sans objet"}
                            </p>
                            <div className="flex flex-wrap items-center text-xs text-gray-500 mt-1 sm:mt-2 gap-2">
                              <span className="flex items-center">
                                <Mail className="w-3 h-3 mr-1 flex-shrink-0" />
                                <span className="truncate max-w-[120px] sm:max-w-[200px]">
                                  {message.email}
                                </span>
                              </span>
                              {message.phone && (
                                <span className="flex items-center">
                                  <Phone className="w-3 h-3 mr-1 flex-shrink-0" />
                                  <span>{message.phone}</span>
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-400 mt-1">
                              {formatDateTime(message.createdAt)}
                            </p>
                          </div>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(message.status)}`}
                          >
                            {message.status}
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
                    Aucun message
                  </p>
                </div>
              )}
              <div className="mt-4 sm:mt-6">
                <Link
                  href="/admin/messages"
                  className="text-[#2d5a27] hover:underline font-medium text-sm sm:text-base"
                >
                  Voir tous les messages →
                </Link>
              </div>
            </div>
          </div>

          {/* Recent Reservations */}
          <div className="bg-white rounded-xl shadow">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b">
              <h2 className="text-base sm:text-xl font-semibold text-gray-800">
                Réservations récentes{" "}
                <span className="text-sm font-normal text-gray-500">
                  ({recentReservations.length})
                </span>
              </h2>
            </div>
            <div className="p-3 sm:p-6 max-h-[400px] sm:max-h-[600px] overflow-y-auto">
              {recentReservations.length > 0 ? (
                <div className="space-y-3 sm:space-y-4">
                  {recentReservations.map((r) => (
                    <Link
                      key={r.id}
                      href={`/admin/reservations#reservation-${r.id}`}
                      className="block"
                    >
                      <div className="p-2 sm:p-3 hover:bg-gray-50 rounded-lg transition">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                          <div className="flex-1 min-w-0 w-full">
                            <h3 className="font-medium text-gray-800 text-sm sm:text-base truncate">
                              {r.clientName || r.name || "Sans nom"}
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-600 mt-1">
                              {r.numPeople || 0} personnes •{" "}
                              {r.activity?.titleFr ||
                                r.activityType ||
                                "Réservation"}
                            </p>
                            <div className="flex items-center text-xs text-gray-500 mt-1 sm:mt-2">
                              <CalendarDays className="w-3 h-3 mr-1 flex-shrink-0" />
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
                            className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium flex items-center whitespace-nowrap ${getStatusColor(r.status)}`}
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
                <div className="text-center py-6 sm:py-8">
                  <Calendar className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm sm:text-base">
                    Aucune réservation
                  </p>
                </div>
              )}
              <div className="mt-4 sm:mt-6">
                <Link
                  href="/admin/reservations"
                  className="text-[#2d5a27] hover:underline font-medium text-sm sm:text-base"
                >
                  Voir toutes les réservations →
                </Link>
              </div>
            </div>
          </div>

          {/* Recent Harvests */}
          <div className="bg-white rounded-xl shadow">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b">
              <h2 className="text-base sm:text-xl font-semibold text-gray-800">
                Récoltes récentes{" "}
                <span className="text-sm font-normal text-gray-500">
                  ({recentHarvests.length})
                </span>
              </h2>
            </div>
            <div className="p-3 sm:p-6 max-h-[400px] sm:max-h-[600px] overflow-y-auto">
              {recentHarvests.length > 0 ? (
                <div className="space-y-3 sm:space-y-4">
                  {recentHarvests.map((h) => (
                    <Link
                      key={h.id}
                      href={`/admin/harvests#harvest-${h.id}`}
                      className="block"
                    >
                      <div className="p-2 sm:p-3 hover:bg-gray-50 rounded-lg transition">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                          <div className="flex-1 min-w-0 w-full">
                            <h3 className="font-medium text-gray-800 text-sm sm:text-base truncate">
                              {h.productFr || "Sans nom de produit"}
                            </h3>
                            <div className="flex items-center text-xs text-gray-500 mt-1 sm:mt-2">
                              <CalendarDays className="w-3 h-3 mr-1 flex-shrink-0" />
                              <span>
                                Prochaine:{" "}
                                {h.nextHarvest
                                  ? formatDate(h.nextHarvest)
                                  : "Non planifiée"}
                              </span>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">
                              Créée: {formatDate(h.createdAt)}
                            </p>
                          </div>
                          <span
                            className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium flex items-center whitespace-nowrap ${getStatusColor(h.isActive ? "active" : "inactive")}`}
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
                <div className="text-center py-6 sm:py-8">
                  <Sprout className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm sm:text-base">
                    Aucune récolte
                  </p>
                  <Link
                    href="/admin/harvests/new"
                    className="text-xs sm:text-sm text-[#2d5a27] hover:underline mt-2 inline-block"
                  >
                    Créer votre première récolte →
                  </Link>
                </div>
              )}
              <div className="mt-4 sm:mt-6">
                <Link
                  href="/admin/harvests"
                  className="text-[#2d5a27] hover:underline font-medium text-sm sm:text-base"
                >
                  Voir toutes les récoltes →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t mt-6 sm:mt-8">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-gray-600 text-xs sm:text-sm text-center sm:text-left">
              © {new Date().getFullYear()} Al Manssouri Farm - Panneau
              d&apos;administration
            </p>
            <div className="flex flex-wrap justify-center items-center gap-2">
              <span
                className={`text-xs px-2 py-1 rounded-full ${stats.unreadMessages > 0 ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}
              >
                {stats.unreadMessages > 0
                  ? `${stats.unreadMessages} non lus`
                  : "Tout lu"}
              </span>
              <span
                className={`text-xs px-2 py-1 rounded-full ${stats.pendingReservations > 0 ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"}`}
              >
                {stats.pendingReservations > 0
                  ? `${stats.pendingReservations} en attente`
                  : "Tout confirmé"}
              </span>
              <span
                className={`text-xs px-2 py-1 rounded-full ${stats.activeHarvests > 0 ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
              >
                {stats.activeHarvests > 0
                  ? `${stats.activeHarvests} récoltes actives`
                  : "Aucune récolte active"}
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
