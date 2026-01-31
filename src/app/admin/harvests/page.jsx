"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  PlusCircle,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  Sprout,
  Calendar,
  Package,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
} from "lucide-react";
import AdminGuard from "@/components/AdminGuard";

export default function HarvestsPage() {
  const router = useRouter();
  const [harvests, setHarvests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showMobileActions, setShowMobileActions] = useState(null);
  const itemsPerPage = 10;

  // 🔒 REF para controlar loops
  const isFetchingRef = useRef(false);
  const fetchTimeoutRef = useRef(null);

  // ✅ FETCH con controles
  const fetchHarvests = useCallback(async () => {
    // Evitar múltiples fetch simultáneos
    if (isFetchingRef.current) return;

    isFetchingRef.current = true;
    setLoading(true);

    try {
      const response = await fetch(
        `/api/admin/harvests/list?page=${currentPage}&limit=${itemsPerPage}&search=${searchTerm}&status=${filterStatus}`,
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success !== false) {
        setHarvests(data.harvests || []);
        setTotalPages(data.totalPages || 1);
      }
    } catch (error) {
      console.error("Error fetching harvests:", error);
      setHarvests([]);
      setTotalPages(1);
    } finally {
      isFetchingRef.current = false;
      setLoading(false);
    }
  }, [currentPage, searchTerm, filterStatus]);

  // ✅ USE EFFECT SEGURO
  useEffect(() => {
    // Limpiar timeout anterior
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }

    // Debounce para evitar muchos requests rápidos
    fetchTimeoutRef.current = setTimeout(() => {
      fetchHarvests();
    }, 300);

    // Cleanup
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, [currentPage, searchTerm, filterStatus, fetchHarvests]);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this harvest?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/harvests/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchHarvests();
        setShowMobileActions(null);
      }
    } catch (error) {
      console.error("Error deleting harvest:", error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  // ✅ MANEJADORES SEGUROS
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (e) => {
    const value = e.target.value;
    setFilterStatus(value);
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    if (!loading) {
      fetchHarvests();
    }
  };

  const toggleMobileActions = (id) => {
    setShowMobileActions(showMobileActions === id ? null : id);
  };

  // Cerrar acciones móviles al hacer click fuera
  useEffect(() => {
    const handleClickOutside = () => {
      setShowMobileActions(null);
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50 py-4 sm:py-6 lg:py-8">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          {/* Header optimizado para móvil */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 sm:mb-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Harvests Management
                </h1>
                <p className="text-gray-600 mt-1 text-sm sm:text-base">
                  Manage your farm&apos;s harvests and products
                </p>
              </div>
              <div className="mt-4 md:mt-0">
                <Link
                  href="/admin/harvests/new"
                  className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-3 sm:px-6 sm:py-3 rounded-lg font-semibold hover:bg-green-700 transition text-sm sm:text-base w-full md:w-auto"
                >
                  <PlusCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">Create New Harvest</span>
                  <span className="sm:hidden">New Harvest</span>
                </Link>
              </div>
            </div>

            {/* Stats optimizadas para móvil */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="bg-white rounded-xl shadow p-3 sm:p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Sprout className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-xs sm:text-sm text-gray-500">
                      Total Harvests
                    </p>
                    <p className="text-xl sm:text-2xl font-bold">
                      {harvests.length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow p-3 sm:p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-xs sm:text-sm text-gray-500">Upcoming</p>
                    <p className="text-xl sm:text-2xl font-bold">
                      {
                        harvests.filter(
                          (h) => new Date(h.nextHarvest) > new Date(),
                        ).length
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Search optimizados para móvil */}
          <div className="bg-white rounded-xl shadow p-3 sm:p-4 mb-4 sm:mb-6">
            <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center justify-between">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                <input
                  type="text"
                  placeholder="Search harvests..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full pl-9 sm:pl-10 pr-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center justify-between sm:justify-end space-x-2 sm:space-x-4">
                <div className="flex items-center">
                  <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mr-2" />
                  <select
                    value={filterStatus}
                    onChange={handleFilterChange}
                    className="border border-gray-300 rounded-lg px-2 sm:px-3 py-2 text-sm sm:text-base focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="all">All</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <button
                  onClick={handleRefresh}
                  disabled={loading}
                  className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition disabled:opacity-50 text-sm sm:text-base"
                >
                  <RefreshCw
                    className={`w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 ${loading ? "animate-spin" : ""}`}
                  />
                  <span className="hidden sm:inline">Refresh</span>
                </button>
              </div>
            </div>
          </div>

          {/* Harvests Table optimizada para móvil */}
          <div className="bg-white rounded-xl shadow overflow-hidden">
            {loading ? (
              <div className="p-8 sm:p-12 text-center">
                <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-green-600 mx-auto"></div>
                <p className="mt-4 text-gray-600 text-sm sm:text-base">
                  Loading harvests...
                </p>
              </div>
            ) : harvests.length > 0 ? (
              <>
                {/* Vista de escritorio (hidden en móvil) */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Product
                        </th>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Season & Year
                        </th>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Next Harvest
                        </th>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {harvests.map((harvest) => (
                        <tr
                          key={harvest.id}
                          className="hover:bg-gray-50 transition"
                        >
                          <td className="px-4 lg:px-6 py-4">
                            <div className="flex items-center">
                              <span className="text-2xl mr-3">
                                {harvest.icon}
                              </span>
                              <div className="min-w-0">
                                <div className="font-medium text-gray-900 truncate">
                                  {harvest.productFr}
                                </div>
                                <div className="text-sm text-gray-500 truncate">
                                  {harvest.productAr}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 lg:px-6 py-4">
                            <div className="text-sm text-gray-900">
                              {harvest.season}
                            </div>
                            <div className="text-sm text-gray-500">
                              {harvest.year}
                            </div>
                          </td>
                          <td className="px-4 lg:px-6 py-4 text-sm text-gray-900">
                            {formatDate(harvest.nextHarvest)}
                          </td>
                          <td className="px-4 lg:px-6 py-4">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                harvest.isActive
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {harvest.isActive ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-4 lg:px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <Link
                                href={`/admin/harvests/${harvest.id}`}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                title="View"
                              >
                                <Eye className="w-4 h-4" />
                              </Link>
                              <Link
                                href={`/admin/harvests/${harvest.id}/edit`}
                                className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </Link>
                              <button
                                onClick={() => handleDelete(harvest.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Vista móvil (card layout) */}
                <div className="sm:hidden space-y-3 p-3">
                  {harvests.map((harvest) => (
                    <div
                      key={harvest.id}
                      className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center flex-1 min-w-0">
                          <span className="text-2xl mr-3">{harvest.icon}</span>
                          <div className="min-w-0">
                            <h3 className="font-medium text-gray-900 truncate text-sm">
                              {harvest.productFr}
                            </h3>
                            <p className="text-xs text-gray-500 truncate">
                              {harvest.productAr}
                            </p>
                          </div>
                        </div>
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleMobileActions(harvest.id);
                            }}
                            className="p-1.5 text-gray-400 hover:text-gray-600"
                          >
                            <MoreVertical className="w-5 h-5" />
                          </button>
                          {showMobileActions === harvest.id && (
                            <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
                              <Link
                                href={`/admin/harvests/${harvest.id}`}
                                className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                onClick={() => setShowMobileActions(null)}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View
                              </Link>
                              <Link
                                href={`/admin/harvests/${harvest.id}/edit`}
                                className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                onClick={() => setShowMobileActions(null)}
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </Link>
                              <button
                                onClick={() => handleDelete(harvest.id)}
                                className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-gray-500">Season:</span>
                          <span className="ml-1 font-medium">
                            {harvest.season}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Year:</span>
                          <span className="ml-1 font-medium">
                            {harvest.year}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Next:</span>
                          <span className="ml-1 font-medium">
                            {formatDate(harvest.nextHarvest)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Status:</span>
                          <span
                            className={`ml-1 font-medium ${
                              harvest.isActive
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {harvest.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination optimizada para móvil */}
                {totalPages > 1 && (
                  <div className="px-3 sm:px-6 py-4 border-t border-gray-200">
                    <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0">
                      <div className="text-sm text-gray-700">
                        Page {currentPage} of {totalPages}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() =>
                            setCurrentPage((prev) => Math.max(prev - 1, 1))
                          }
                          disabled={currentPage === 1}
                          className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                          aria-label="Previous page"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <div className="flex items-center space-x-1">
                          {Array.from(
                            { length: Math.min(totalPages, 5) },
                            (_, i) => {
                              let pageNum;
                              if (totalPages <= 5) {
                                pageNum = i + 1;
                              } else if (currentPage <= 3) {
                                pageNum = i + 1;
                              } else if (currentPage >= totalPages - 2) {
                                pageNum = totalPages - 4 + i;
                              } else {
                                pageNum = currentPage - 2 + i;
                              }

                              return (
                                <button
                                  key={pageNum}
                                  onClick={() => setCurrentPage(pageNum)}
                                  className={`px-3 py-1.5 text-sm rounded-lg ${
                                    currentPage === pageNum
                                      ? "bg-green-600 text-white"
                                      : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                                  }`}
                                >
                                  {pageNum}
                                </button>
                              );
                            },
                          )}
                          {totalPages > 5 && currentPage < totalPages - 2 && (
                            <>
                              <span className="px-1">...</span>
                              <button
                                onClick={() => setCurrentPage(totalPages)}
                                className={`px-3 py-1.5 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50`}
                              >
                                {totalPages}
                              </button>
                            </>
                          )}
                        </div>
                        <button
                          onClick={() =>
                            setCurrentPage((prev) =>
                              Math.min(prev + 1, totalPages),
                            )
                          }
                          disabled={currentPage === totalPages}
                          className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                          aria-label="Next page"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="p-8 sm:p-12 text-center">
                <Sprout className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  No harvests found
                </h3>
                <p className="text-gray-500 mb-6 text-sm sm:text-base">
                  {searchTerm || filterStatus !== "all"
                    ? "No harvests match your search criteria"
                    : "You haven't created any harvests yet"}
                </p>
                <Link
                  href="/admin/harvests/new"
                  className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-3 sm:px-6 sm:py-3 rounded-lg font-semibold hover:bg-green-700 transition text-sm sm:text-base"
                >
                  <PlusCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                  Create Your First Harvest
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
