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
  }, [currentPage, searchTerm, filterStatus]); // ✅ itemsPerPage removido

  // ✅ USE EFFECT SEGURO
  useEffect(() => {
    // Limpiar timeout anterior
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }

    // Debounce para evitar muchos requests rápidos
    fetchTimeoutRef.current = setTimeout(() => {
      fetchHarvests();
    }, 300); // 300ms debounce

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
    setCurrentPage(1); // Resetear a página 1 al buscar
  };

  const handleFilterChange = (e) => {
    const value = e.target.value;
    setFilterStatus(value);
    setCurrentPage(1); // Resetear a página 1 al filtrar
  };

  const handleRefresh = () => {
    if (!loading) {
      fetchHarvests();
    }
  };

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Harvests Management
                </h1>
                <p className="text-gray-600 mt-1">
                  Manage your farm&apos;s harvests and products
                </p>
              </div>
              <div className="mt-4 md:mt-0">
                <Link
                  href="/admin/harvests/new"
                  className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
                >
                  <PlusCircle className="w-5 h-5" />
                  Create New Harvest
                </Link>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-xl shadow p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Sprout className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-500">Total Harvests</p>
                    <p className="text-2xl font-bold">{harvests.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-500">Upcoming</p>
                    <p className="text-2xl font-bold">
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

          {/* Filters and Search */}
          <div className="bg-white rounded-xl shadow p-4 mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search harvests..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <Filter className="w-5 h-5 text-gray-400 mr-2" />
                  <select
                    value={filterStatus}
                    onChange={handleFilterChange}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <button
                  onClick={handleRefresh}
                  disabled={loading}
                  className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition disabled:opacity-50"
                >
                  <RefreshCw
                    className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
                  />
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Harvests Table */}
          <div className="bg-white rounded-xl shadow overflow-hidden">
            {loading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading harvests...</p>
              </div>
            ) : harvests.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Product
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Season & Year
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Next Harvest
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <span className="text-2xl mr-3">
                                {harvest.icon}
                              </span>
                              <div>
                                <div className="font-medium text-gray-900">
                                  {harvest.productFr}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {harvest.productAr}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              {harvest.season}
                            </div>
                            <div className="text-sm text-gray-500">
                              {harvest.year}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {formatDate(harvest.nextHarvest)}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                harvest.isActive
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {harvest.isActive ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
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

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="px-6 py-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-700">
                        Showing page {currentPage} of {totalPages}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() =>
                            setCurrentPage((prev) => Math.max(prev - 1, 1))
                          }
                          disabled={currentPage === 1}
                          className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() =>
                            setCurrentPage((prev) =>
                              Math.min(prev + 1, totalPages),
                            )
                          }
                          disabled={currentPage === totalPages}
                          className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="p-12 text-center">
                <Sprout className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  No harvests found
                </h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm || filterStatus !== "all"
                    ? "No harvests match your search criteria"
                    : "You haven't created any harvests yet"}
                </p>
                <Link
                  href="/admin/harvests/new"
                  className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
                >
                  <PlusCircle className="w-5 h-5" />
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
