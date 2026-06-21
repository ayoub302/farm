"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Search,
  Mail,
  Phone,
  Calendar,
  Eye,
  RefreshCw,
  User,
  Clock,
  Trash2,
  Archive,
  Reply,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
  Send,
  ExternalLink,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// API endpoints to try in order
const API_ENDPOINTS = [
  "/api/admin/messages/recent",
  "/api/contact?admin=true",
  "/api/messages",
  "/api/admin/contact",
];

// Status options for filtering
const STATUS_OPTIONS = [
  { value: "all", label: "All Messages", color: "gray" },
  { value: "unread", label: "Unread", color: "yellow" },
  { value: "read", label: "Read", color: "blue" },
  { value: "archived", label: "Archived", color: "gray" },
];

export default function MessagesPage() {
  const { isLoaded, userId, sessionId } = useAuth();
  const router = useRouter();

  // State management
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [deletingIds, setDeletingIds] = useState(new Set());
  const [updatingIds, setUpdatingIds] = useState(new Set());
  const [apiEndpoint, setApiEndpoint] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [error, setError] = useState(null);
  const [showDebugInfo, setShowDebugInfo] = useState(false);

  // Sample data for development
  const sampleData = useMemo(
    () => [
      {
        id: "1",
        name: "John Doe",
        email: "john@example.com",
        phone: "+212 612345678",
        subject: "Sample Message 1",
        message: "This is a sample message for testing purposes.",
        status: "unread",
        source: "contact_form",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "2",
        name: "Jane Smith",
        email: "jane@example.com",
        phone: "+212 698765432",
        subject: "Sample Message 2",
        message: "Another sample message for testing the admin panel.",
        status: "read",
        source: "contact_form",
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: "3",
        name: "Robert Johnson",
        email: "robert@example.com",
        phone: "+212 633344455",
        subject: "Question about activities",
        message: "I would like to know more about your farm activities.",
        source: "contact_form",
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: "4",
        name: "Maria Garcia",
        email: "maria@example.com",
        phone: "+212 655566677",
        subject: "Booking inquiry",
        message: "I'm interested in booking a farm visit next week.",
        status: "unread",
        source: "contact_form",
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        updatedAt: new Date(Date.now() - 3600000).toISOString(),
      },
    ],
    []
  );

  // Load messages from API - DEFINIR PRIMERO
  const loadMessages = useCallback(
    async (forceEndpoint = null) => {
      try {
        setLoading(true);
        setError(null);
        console.log("[MESSAGES] Loading messages...");

        const endpoints = forceEndpoint ? [forceEndpoint] : API_ENDPOINTS;
        let success = false;
        let loadedEndpoint = "";
        let loadedData = [];

        for (const endpoint of endpoints) {
          try {
            console.log("[MESSAGES] Trying endpoint:", endpoint);
            const response = await fetch(endpoint);
            console.log("[MESSAGES] Response status:", response.status);

            if (response.ok) {
              const data = await response.json();
              console.log("[MESSAGES] Data received:", data);

              // Handle different response formats
              if (Array.isArray(data)) {
                loadedData = data;
              } else if (data.messages && Array.isArray(data.messages)) {
                loadedData = data.messages;
              } else if (data.data && Array.isArray(data.data)) {
                loadedData = data.data;
              } else {
                console.warn("[MESSAGES] Unexpected data format:", data);
                continue;
              }

              loadedEndpoint = endpoint;
              success = true;
              break;
            }
          } catch (err) {
            console.warn("[MESSAGES] Failed with endpoint:", endpoint, err);
            continue;
          }
        }

        if (success) {
          setMessages(loadedData);
          setApiEndpoint(loadedEndpoint);
          console.log(
            "[MESSAGES] Success! Loaded",
            loadedData.length,
            "messages from",
            loadedEndpoint
          );
        } else {
          // Use sample data in development
          if (process.env.NODE_ENV === "development") {
            console.log("[MESSAGES] Using sample data for development");
            setMessages(sampleData);
            setApiEndpoint("sample_data");
          } else {
            setError(
              "Unable to load messages. Please check API endpoints and try again."
            );
          }
        }
      } catch (error) {
        console.error("[MESSAGES] Load error:", error);
        setError("An error occurred while loading messages.");
      } finally {
        setLoading(false);
      }
    },
    [sampleData]
  );

  // Verify admin status and load messages - LUEGO EL useEffect
  useEffect(() => {
    const verifyAdminAndLoadMessages = async () => {
      if (!isLoaded) {
        setLoading(false);
        return;
      }

      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        // Verify admin status
        const verifyResponse = await fetch("/api/admin/verify");
        if (!verifyResponse.ok) {
          router.push("/admin/dashboard");
          return;
        }

        await loadMessages();
      } catch (error) {
        console.error("[MESSAGES PAGE ERROR]", error);
        setError("Failed to load messages. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    verifyAdminAndLoadMessages();
  }, [isLoaded, userId, router, loadMessages]); // Ahora loadMessages está definido antes

  // Filter messages based on search and status
  useEffect(() => {
    if (!Array.isArray(messages) || messages.length === 0) {
      setFilteredMessages([]);
      return;
    }

    let filtered = [...messages];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (msg) =>
          (msg.name && msg.name.toLowerCase().includes(term)) ||
          (msg.email && msg.email.toLowerCase().includes(term)) ||
          (msg.subject && msg.subject.toLowerCase().includes(term)) ||
          (msg.message && msg.message.toLowerCase().includes(term)) ||
          (msg.phone && msg.phone.includes(term))
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((msg) => msg.status === statusFilter);
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt || a.updatedAt || 0);
      const dateB = new Date(b.createdAt || b.updatedAt || 0);
      return dateB - dateA;
    });

    setFilteredMessages(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchTerm, statusFilter, messages]);

  // Update message status
  const updateMessageStatus = useCallback(
    async (messageId, newStatus) => {
      if (updatingIds.has(messageId)) return;

      setUpdatingIds((prev) => new Set([...prev, messageId]));

      try {
        // Try different endpoints for updating
        const endpoints = [
          `/api/contact/${messageId}`,
          `/api/messages/${messageId}`,
          `/api/admin/messages/${messageId}`,
        ];

        let success = false;
        for (const endpoint of endpoints) {
          try {
            const response = await fetch(endpoint, {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ status: newStatus }),
            });

            if (response.ok) {
              success = true;
              const data = await response.json();
              console.log("[MESSAGES] Status updated:", data);
              break;
            }
          } catch (err) {
            console.warn("[MESSAGES] Update failed with endpoint:", endpoint);
            continue;
          }
        }

        if (success) {
          // Update local state
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === messageId
                ? {
                    ...msg,
                    status: newStatus,
                    updatedAt: new Date().toISOString(),
                  }
                : msg
            )
          );

          if (selectedMessage?.id === messageId) {
            setSelectedMessage((prev) => ({
              ...prev,
              status: newStatus,
              updatedAt: new Date().toISOString(),
            }));
          }

          // Show success message
          const event = new CustomEvent("show-toast", {
            detail: {
              message: "Status updated successfully",
              type: "success",
            },
          });
          window.dispatchEvent(event);
        } else {
          // Update locally if API fails
          console.warn("[MESSAGES] Updating status locally");
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === messageId
                ? {
                    ...msg,
                    status: newStatus,
                    updatedAt: new Date().toISOString(),
                  }
                : msg
            )
          );

          if (selectedMessage?.id === messageId) {
            setSelectedMessage((prev) => ({
              ...prev,
              status: newStatus,
              updatedAt: new Date().toISOString(),
            }));
          }

          const event = new CustomEvent("show-toast", {
            detail: {
              message: "Status updated locally (API unavailable)",
              type: "warning",
            },
          });
          window.dispatchEvent(event);
        }
      } catch (error) {
        console.error("[MESSAGES] Update error:", error);
        const event = new CustomEvent("show-toast", {
          detail: {
            message: "Failed to update status",
            type: "error",
          },
        });
        window.dispatchEvent(event);
      } finally {
        setUpdatingIds((prev) => {
          const next = new Set(prev);
          next.delete(messageId);
          return next;
        });
      }
    },
    [selectedMessage, updatingIds]
  );

  // Delete message
  const deleteMessage = useCallback(
    async (messageId) => {
      if (deletingIds.has(messageId)) return;

      if (
        !window.confirm(
          "Are you sure you want to delete this message? This action cannot be undone."
        )
      ) {
        return;
      }

      setDeletingIds((prev) => new Set([...prev, messageId]));

      try {
        // Try different endpoints for deletion
        const endpoints = [
          `/api/contact/${messageId}`,
          `/api/messages/${messageId}`,
          `/api/admin/messages/${messageId}`,
        ];

        let success = false;
        for (const endpoint of endpoints) {
          try {
            const response = await fetch(endpoint, {
              method: "DELETE",
            });

            if (response.ok) {
              success = true;
              break;
            }
          } catch (err) {
            console.warn("[MESSAGES] Delete failed with endpoint:", endpoint);
            continue;
          }
        }

        if (success) {
          // Remove from local state
          setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
          if (selectedMessage?.id === messageId) {
            setSelectedMessage(null);
          }

          const event = new CustomEvent("show-toast", {
            detail: {
              message: "Message deleted successfully",
              type: "success",
            },
          });
          window.dispatchEvent(event);
        } else {
          // Delete locally if API fails
          console.warn("[MESSAGES] Deleting locally");
          setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
          if (selectedMessage?.id === messageId) {
            setSelectedMessage(null);
          }

          const event = new CustomEvent("show-toast", {
            detail: {
              message: "Message deleted locally (API unavailable)",
              type: "warning",
            },
          });
          window.dispatchEvent(event);
        }
      } catch (error) {
        console.error("[MESSAGES] Delete error:", error);
        const event = new CustomEvent("show-toast", {
          detail: {
            message: "Failed to delete message",
            type: "error",
          },
        });
        window.dispatchEvent(event);
      } finally {
        setDeletingIds((prev) => {
          const next = new Set(prev);
          next.delete(messageId);
          return next;
        });
      }
    },
    [selectedMessage, deletingIds]
  );

  // Send test message
  const sendTestMessage = useCallback(async () => {
    if (
      !window.confirm(
        "Send a test message to verify the contact form API is working?"
      )
    ) {
      return;
    }

    try {
      const testMessage = {
        name: "Test Admin User",
        email: "admin@test.com",
        phone: "+212 612345678",
        subject: "Test Message from Admin Panel",
        message: `This is a test message sent from the admin panel to verify the API is working.
        
Timestamp: ${new Date().toISOString()}
Session: ${sessionId || "N/A"}
User: ${userId || "N/A"}`,
        source: "admin_test",
      };

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testMessage),
      });

      const data = await response.json();

      if (response.ok) {
        const event = new CustomEvent("show-toast", {
          detail: {
            message: "Test message sent successfully!",
            type: "success",
          },
        });
        window.dispatchEvent(event);

        // Reload messages after a short delay
        setTimeout(() => {
          loadMessages();
        }, 1000);
      } else {
        throw new Error(data.error || `HTTP ${response.status}`);
      }
    } catch (error) {
      console.error("[MESSAGES] Test send error:", error);
      const event = new CustomEvent("show-toast", {
        detail: {
          message: `Failed to send test: ${error.message}`,
          type: "error",
        },
      });
      window.dispatchEvent(event);
    }
  }, [loadMessages, userId, sessionId]);

  // Calculate pagination
  const paginatedMessages = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredMessages.slice(startIndex, endIndex);
  }, [filteredMessages, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredMessages.length / itemsPerPage);

  // Statistics
  const stats = useMemo(() => {
    if (!Array.isArray(messages)) {
      return {
        total: 0,
        unread: 0,
        read: 0,
        archived: 0,
      };
    }

    return {
      total: messages.length,
      unread: messages.filter((m) => m.status === "unread").length,
      read: messages.filter((m) => m.status === "read").length,
      archived: messages.filter((m) => m.status === "archived").length,
    };
  }, [messages]);

  // Utility functions
  const formatDate = useCallback((dateString) => {
    if (!dateString) return "Unknown date";
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;

      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Invalid date";
    }
  }, []);

  const getStatusConfig = useCallback((status) => {
    switch (status) {
      case "unread":
        return {
          color: "yellow",
          bgColor: "bg-yellow-50",
          textColor: "text-yellow-800",
          borderColor: "border-yellow-200",
          icon: AlertCircle,
        };
      case "read":
        return {
          color: "blue",
          bgColor: "bg-blue-50",
          textColor: "text-blue-800",
          borderColor: "border-blue-200",
          icon: Eye,
        };
      case "archived":
        return {
          color: "gray",
          bgColor: "bg-gray-50",
          textColor: "text-gray-800",
          borderColor: "border-gray-200",
          icon: Archive,
        };
      default:
        return {
          color: "gray",
          bgColor: "bg-gray-50",
          textColor: "text-gray-800",
          borderColor: "border-gray-200",
          icon: MessageSquare,
        };
    }
  }, []);

  // Loading state
  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#2d5a27] border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading messages...</p>
          <p className="text-sm text-gray-500 mt-2">
            Fetching from {apiEndpoint || "API"}
          </p>
        </div>
      </div>
    );
  }

  // Auth check
  if (!userId) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-2xl mb-6 shadow-sm">
            <XCircle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Authentication Required
            </h2>
            <p className="text-gray-600">
              Please sign in to access the message management.
            </p>
          </div>
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center gap-2 bg-[#2d5a27] text-white px-6 py-3 rounded-lg hover:bg-green-800 transition shadow hover:shadow-md"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-6 gap-4">
            <div className="flex items-center">
              <Link
                href="/admin/dashboard"
                className="mr-4 text-gray-500 hover:text-gray-700 transition p-2 hover:bg-gray-100 rounded-lg"
                title="Back to Dashboard"
              >
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Contact Messages
                </h1>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => loadMessages()}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats and Filters */}
        <div className="bg-white rounded-2xl shadow-sm border p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Messages
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name, email, phone, or content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#2d5a27] focus:border-transparent transition"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Status
              </label>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#2d5a27] focus:border-transparent appearance-none bg-white"
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Items per page */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Items per page
              </label>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#2d5a27] focus:border-transparent bg-white"
              >
                <option value="5">5 per page</option>
                <option value="10">10 per page</option>
                <option value="20">20 per page</option>
                <option value="50">50 per page</option>
              </select>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {STATUS_OPTIONS.map((option) => {
              const count =
                option.value === "all" ? stats.total : stats[option.value] || 0;
              const config = getStatusConfig(option.value);

              return (
                <div
                  key={option.value}
                  className={`p-4 rounded-xl border ${config.bgColor} ${config.borderColor}`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-medium ${config.textColor}`}>
                      {option.label}
                    </span>
                    <config.icon className={`w-5 h-5 ${config.textColor}`} />
                  </div>
                  <div
                    className={`text-2xl font-bold mt-2 ${config.textColor}`}
                  >
                    {count}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <div>
              <p className="text-red-800 font-medium">{error}</p>
              <p className="text-red-600 text-sm mt-1">
                Check your API endpoints or use the Test API button to verify.
              </p>
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              ×
            </button>
          </div>
        )}

        {/* Messages Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Messages List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
              <div className="px-6 py-4 border-b bg-gray-50">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Messages List
                  </h2>
                  <span className="text-sm text-gray-500">
                    {filteredMessages.length} messages found
                  </span>
                </div>
              </div>

              <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                {paginatedMessages.length > 0 ? (
                  <>
                    {paginatedMessages.map((message) => {
                      const config = getStatusConfig(message.status);
                      const Icon = config.icon;
                      const isSelected = selectedMessage?.id === message.id;

                      return (
                        <div
                          key={message.id}
                          className={`p-4 hover:bg-gray-50 cursor-pointer transition border-l-4 ${
                            isSelected
                              ? "bg-blue-50 border-blue-500"
                              : message.status === "unread"
                              ? "border-yellow-500"
                              : "border-transparent"
                          }`}
                          onClick={() => setSelectedMessage(message)}
                        >
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center mb-2">
                                <div className="flex items-center gap-2">
                                  <User className="w-5 h-5 text-gray-500 flex-shrink-0" />
                                  <h3 className="font-semibold text-gray-800 truncate">
                                    {message.name || "No name"}
                                  </h3>
                                </div>
                                {message.status === "unread" && (
                                  <span className="ml-2 bg-yellow-500 text-white text-xs rounded-full px-2 py-1">
                                    NEW
                                  </span>
                                )}
                              </div>

                              <p className="text-gray-600 text-sm mb-2 line-clamp-1">
                                {message.subject || "No subject"}
                              </p>

                              <div className="flex items-center text-xs text-gray-500 gap-4">
                                <div className="flex items-center gap-1">
                                  <Mail className="w-3 h-3" />
                                  <span className="truncate">
                                    {message.email || "No email"}
                                  </span>
                                </div>

                                {message.phone && (
                                  <div className="flex items-center gap-1">
                                    <Phone className="w-3 h-3" />
                                    <span>{message.phone}</span>
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center text-xs text-gray-400 mt-2">
                                <Clock className="w-3 h-3 mr-1" />
                                <span>{formatDate(message.createdAt)}</span>
                              </div>
                            </div>

                            <div className="flex flex-col items-end gap-2">
                              <div
                                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${config.bgColor} ${config.borderColor} ${config.textColor}`}
                              >
                                <Icon className="w-3 h-3" />
                                <span className="capitalize">
                                  {message.status}
                                </span>
                              </div>

                              {deletingIds.has(message.id) && (
                                <div className="text-xs text-red-600">
                                  Deleting...
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="p-4 border-t flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                          Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                          {Math.min(
                            currentPage * itemsPerPage,
                            filteredMessages.length
                          )}{" "}
                          of {filteredMessages.length} messages
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              setCurrentPage((p) => Math.max(1, p - 1))
                            }
                            disabled={currentPage === 1}
                            className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>

                          <div className="flex items-center gap-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                              .filter(
                                (page) =>
                                  page === 1 ||
                                  page === totalPages ||
                                  Math.abs(page - currentPage) <= 1
                              )
                              .map((page, index, array) => {
                                const showEllipsis =
                                  index < array.length - 1 &&
                                  array[index + 1] - page > 1;

                                return (
                                  <div key={page} className="flex items-center">
                                    <button
                                      onClick={() => setCurrentPage(page)}
                                      className={`w-10 h-10 rounded-lg ${
                                        currentPage === page
                                          ? "bg-[#2d5a27] text-white"
                                          : "border border-gray-300 hover:bg-gray-50"
                                      }`}
                                    >
                                      {page}
                                    </button>
                                    {showEllipsis && (
                                      <span className="px-2">...</span>
                                    )}
                                  </div>
                                );
                              })}
                          </div>

                          <button
                            onClick={() =>
                              setCurrentPage((p) => Math.min(totalPages, p + 1))
                            }
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="p-8 text-center">
                    <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-700 mb-2">
                      No messages found
                    </h3>
                    <p className="text-gray-500 mb-6">
                      {messages.length === 0
                        ? "No messages in the system yet."
                        : "No messages match your filters."}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <button
                        onClick={() => loadMessages()}
                        className="px-4 py-2 bg-[#2d5a27] text-white rounded-lg hover:bg-green-800 transition"
                      >
                        <RefreshCw className="w-4 h-4 inline mr-2" />
                        Retry Loading
                      </button>
                      <button
                        onClick={sendTestMessage}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                      >
                        <Send className="w-4 h-4 inline mr-2" />
                        Send Test Message
                      </button>
                      <button
                        onClick={() => {
                          setSearchTerm("");
                          setStatusFilter("all");
                        }}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                      >
                        Clear Filters
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Debug Info (optional) */}
            {showDebugInfo && (
              <div className="mt-4 p-4 bg-gray-900 text-gray-100 rounded-xl text-sm font-mono">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-400">Debug Info</span>
                  <button
                    onClick={() => setShowDebugInfo(false)}
                    className="text-gray-400 hover:text-gray-200"
                  >
                    ×
                  </button>
                </div>
                <div className="space-y-1">
                  <div>User ID: {userId}</div>
                  <div>Session ID: {sessionId}</div>
                  <div>API Endpoint: {apiEndpoint}</div>
                  <div>Messages loaded: {messages.length}</div>
                  <div>Filtered: {filteredMessages.length}</div>
                  <div>Current page: {currentPage}</div>
                </div>
              </div>
            )}
          </div>

          {/* Message Detail Panel */}
          <div>
            {selectedMessage ? (
              <div className="bg-white rounded-2xl shadow-sm border sticky top-8">
                <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Message Details
                  </h2>
                  <button
                    onClick={() => setShowDebugInfo(!showDebugInfo)}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Debug
                  </button>
                </div>

                <div className="p-6 space-y-6">
                  {/* Status Badge - CORREGIDO */}
                  <div className="flex justify-between items-center">
                    <div>
                      {(() => {
                        const statusConfig = getStatusConfig(
                          selectedMessage.status
                        );
                        const StatusIcon = statusConfig.icon;
                        return (
                          <span
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border ${statusConfig.bgColor} ${statusConfig.borderColor} ${statusConfig.textColor}`}
                          >
                            <StatusIcon className="w-4 h-4" />
                            {selectedMessage.status.toUpperCase()}
                          </span>
                        );
                      })()}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDate(selectedMessage.updatedAt)}
                    </div>
                  </div>

                  {/* Sender Info */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">
                      Sender Information
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <User className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-gray-800">
                            {selectedMessage.name || "No name provided"}
                          </p>
                          <p className="text-sm text-gray-500">Full Name</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Mail className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-gray-600 break-all">
                            {selectedMessage.email || "No email provided"}
                          </p>
                          <p className="text-sm text-gray-500">Email Address</p>
                        </div>
                      </div>

                      {selectedMessage.phone && (
                        <div className="flex items-start gap-3">
                          <Phone className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                          <div>
                            <p className="text-gray-600">
                              {selectedMessage.phone}
                            </p>
                            <p className="text-sm text-gray-500">
                              Phone Number
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-start gap-3">
                        <Calendar className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-gray-600">
                            {formatDate(selectedMessage.createdAt)}
                          </p>
                          <p className="text-sm text-gray-500">Sent</p>
                        </div>
                      </div>

                      {selectedMessage.source && (
                        <div className="text-sm">
                          <span className="text-gray-500">Source: </span>
                          <span className="text-gray-700">
                            {selectedMessage.source}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                      Subject
                    </h3>
                    <p className="text-gray-800 font-medium p-3 bg-gray-50 rounded-lg border">
                      {selectedMessage.subject || "No subject"}
                    </p>
                  </div>

                  {/* Message Content */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                      Message Content
                    </h3>
                    <div className="p-4 bg-gray-50 rounded-lg border min-h-[200px]">
                      <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {selectedMessage.message || "No message content"}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">
                      Quick Actions
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {selectedMessage.status !== "read" && (
                        <button
                          onClick={() =>
                            updateMessageStatus(selectedMessage.id, "read")
                          }
                          disabled={updatingIds.has(selectedMessage.id)}
                          className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Eye className="w-4 h-4" />
                          {updatingIds.has(selectedMessage.id)
                            ? "..."
                            : "Mark Read"}
                        </button>
                      )}

                      {selectedMessage.status !== "archived" && (
                        <button
                          onClick={() =>
                            updateMessageStatus(selectedMessage.id, "archived")
                          }
                          disabled={updatingIds.has(selectedMessage.id)}
                          className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Archive className="w-4 h-4" />
                          {updatingIds.has(selectedMessage.id)
                            ? "..."
                            : "Archive"}
                        </button>
                      )}

                      <button
                        onClick={() => deleteMessage(selectedMessage.id)}
                        disabled={deletingIds.has(selectedMessage.id)}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="w-4 h-4" />
                        {deletingIds.has(selectedMessage.id) ? "..." : "Delete"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border p-8 text-center">
                <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  Select a Message
                </h3>
                <p className="text-gray-500 text-sm mb-6">
                  Click on a message from the list to view its details and take
                  actions
                </p>
                {messages.length > 0 ? (
                  <div className="text-sm text-gray-400">
                    {filteredMessages.length} messages available
                  </div>
                ) : (
                  <button
                    onClick={sendTestMessage}
                    className="w-full py-3 bg-green-100 text-green-700 rounded-xl border border-green-200 hover:bg-green-200 transition"
                  >
                    Send a test message to get started
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
