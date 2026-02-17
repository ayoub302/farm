"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Upload,
  Image as ImageIcon,
  Video,
  X,
  Trash2,
  Edit2,
  ChevronLeft,
  Plus,
  Filter,
  Search,
  Grid,
  List,
  RotateCcw,
  Archive,
  Globe as GlobeIcon,
  EyeOff,
} from "lucide-react";

// ================= GUARD =================
const AuthGuard = ({ children }) => {
  const { isLoaded, userId } = useAuth();
  const router = useRouter();
  const hasRedirectedRef = useRef(false);

  useEffect(() => {
    if (!isLoaded) return;

    if (!userId && !hasRedirectedRef.current) {
      console.log("[GALLERY GUARD] No user - redirecting to sign-in");
      hasRedirectedRef.current = true;
      router.push("/sign-in");
    }
  }, [isLoaded, userId, router]);

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

  if (!userId) {
    return null;
  }

  return <>{children}</>;
};

// Estado de publicación
const PUBLICATION_STATUS = {
  DRAFT: "draft",
  PUBLISHED: "published",
  ARCHIVED: "archived",
};

export default function GalleryAdminPage() {
  const { isLoaded, userId, getToken } = useAuth();
  const router = useRouter();

  // Estados
  const [mediaItems, setMediaItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  // Formulario
  const [uploadData, setUploadData] = useState({
    titleAr: "",
    titleFr: "",
    descriptionAr: "",
    descriptionFr: "",
    type: "image",
    category: "activities",
    file: null,
    videoFile: null,
    videoUrl: "",
    thumbnail: null,
    status: PUBLICATION_STATUS.DRAFT,
  });

  // Categorías
  const categories = [
    { id: "activities", label: "Activities", icon: "👨‍👩‍👧‍👦" },
    { id: "harvest", label: "Harvest", icon: "🍅" },
    { id: "sustainability", label: "Sustainability", icon: "🌍" },
    { id: "products", label: "Products", icon: "🥦" },
    { id: "farmLife", label: "Farm Life", icon: "🌾" },
  ];

  // Estados de publicación
  const statusOptions = [
    {
      id: PUBLICATION_STATUS.DRAFT,
      label: "Draft",
      color: "bg-yellow-100 text-yellow-800",
      icon: EyeOff,
    },
    {
      id: PUBLICATION_STATUS.PUBLISHED,
      label: "Published",
      color: "bg-green-100 text-green-800",
      icon: GlobeIcon,
    },
    {
      id: PUBLICATION_STATUS.ARCHIVED,
      label: "Archived",
      color: "bg-gray-100 text-gray-800",
      icon: Archive,
    },
  ];

  // Fetch con autenticación
  const fetchWithAuth = useCallback(
    async (url, options = {}) => {
      try {
        const token = await getToken();
        if (!token) {
          console.error("[GALLERY] No token available");
          router.push("/sign-in");
          throw new Error("No authentication token");
        }

        const headers = {
          ...options.headers,
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        };

        const response = await fetch(url, {
          ...options,
          headers,
          credentials: "include",
        });

        if (response.status === 401) {
          console.log("[GALLERY] Unauthorized - redirecting to sign-in");
          router.push("/sign-in");
          throw new Error("Unauthorized");
        }

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        return response;
      } catch (error) {
        console.error("[GALLERY] Fetch error:", error);
        throw error;
      }
    },
    [getToken, router],
  );

  // ✅ Cargar elementos - SIN DATOS DE EJEMPLO FIJOS
  const loadGalleryItems = useCallback(async () => {
    if (!userId) {
      console.log("[GALLERY] No userId, skipping load");
      return;
    }

    try {
      setLoading(true);
      console.log("[GALLERY] Loading items...");

      const response = await fetchWithAuth("/api/admin/gallery");
      const data = await response.json();
      console.log("[GALLERY] Data loaded:", data);

      if (data.success && Array.isArray(data.items)) {
        setMediaItems(data.items);
      } else if (data.items && Array.isArray(data.items)) {
        setMediaItems(data.items);
      } else {
        console.error("[GALLERY] Invalid data format:", data);
        setMediaItems([]);
      }
    } catch (error) {
      console.error("[GALLERY] Load error:", error);
      setMediaItems([]);
    } finally {
      setLoading(false);
    }
  }, [fetchWithAuth, userId]);

  // Cargar datos iniciales
  useEffect(() => {
    if (isLoaded && userId) {
      console.log("[GALLERY] User authenticated, loading data");
      loadGalleryItems();
    }
  }, [isLoaded, userId, loadGalleryItems]);

  // Si no está cargado
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

  if (!userId) {
    return null;
  }

  // Filtrar elementos
  const filteredItems = mediaItems.filter((item) => {
    if (filterType !== "all" && item.type !== filterType) return false;
    if (filterCategory !== "all" && item.category !== filterCategory)
      return false;
    if (filterStatus !== "all" && item.status !== filterStatus) return false;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        (item.titleAr || "").toLowerCase().includes(query) ||
        (item.titleFr || "").toLowerCase().includes(query) ||
        (item.descriptionAr || "").toLowerCase().includes(query) ||
        (item.descriptionFr || "").toLowerCase().includes(query) ||
        (item.category || "").toLowerCase().includes(query)
      );
    }

    return true;
  });

  // Formatear fecha
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "Unknown date";
    }
  };

  // Formatear tamaño
  const formatSize = (size) => {
    if (!size) return "Unknown";
    if (typeof size === "number") {
      if (size < 1024) return `${size} B`;
      if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
      return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    }
    return size;
  };

  // Resetear formulario
  const resetForm = () => {
    setUploadData({
      titleAr: "",
      titleFr: "",
      descriptionAr: "",
      descriptionFr: "",
      type: "image",
      category: "activities",
      file: null,
      videoFile: null,
      videoUrl: "",
      thumbnail: null,
      status: PUBLICATION_STATUS.DRAFT,
    });
    setSelectedMedia(null);
  };

  // Manejar subida
  const handleUpload = async (e) => {
    e.preventDefault();

    if (!userId) {
      alert("Please sign in first");
      router.push("/sign-in");
      return;
    }

    if (!uploadData.titleFr.trim() || !uploadData.titleAr.trim()) {
      alert("Please provide titles in both French and Arabic");
      return;
    }

    setUploading(true);

    try {
      const token = await getToken();
      if (!token) {
        throw new Error("No authentication token available");
      }

      const formData = new FormData();
      formData.append("titleAr", uploadData.titleAr);
      formData.append("titleFr", uploadData.titleFr);
      formData.append("descriptionAr", uploadData.descriptionAr);
      formData.append("descriptionFr", uploadData.descriptionFr);
      formData.append("type", uploadData.type);
      formData.append("category", uploadData.category);
      formData.append("status", uploadData.status);

      if (uploadData.type === "image" && uploadData.file) {
        formData.append("image", uploadData.file);
      } else if (uploadData.type === "video" && uploadData.videoFile) {
        formData.append("video", uploadData.videoFile);
      } else if (uploadData.type === "video" && uploadData.videoUrl) {
        formData.append("videoUrl", uploadData.videoUrl);
      }

      console.log("[GALLERY] Uploading media...");

      const response = await fetch("/api/admin/gallery", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Upload failed: ${response.status}`);
      }

      // Añadir el nuevo item a la lista
      if (data.item) {
        setMediaItems((prev) => [data.item, ...prev]);
      } else {
        await loadGalleryItems();
      }

      alert(data.message || "Upload successful!");
      setShowUploadModal(false);
      resetForm();
    } catch (error) {
      console.error("[GALLERY] Upload error:", error);
      alert(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  // Manejar cambios en formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUploadData((prev) => ({ ...prev, [name]: value }));
  };

  // Manejar cambio de archivo
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (uploadData.type === "image") {
        setUploadData((prev) => ({ ...prev, file }));
      } else {
        setUploadData((prev) => ({ ...prev, videoFile: file }));
      }
    }
  };

  // ✅ Manejar eliminación - VERSIÓN CORREGIDA
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      const token = await getToken();
      if (!token) {
        throw new Error("No authentication token");
      }

      console.log(`[GALLERY] Deleting item ${id}...`);

      const response = await fetch(`/api/admin/gallery/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json().catch(() => ({}));
      console.log("[GALLERY] Delete response:", {
        status: response.status,
        data,
      });

      // ✅ SIEMPRE eliminar del estado local, incluso si la API falla
      setMediaItems((prev) => prev.filter((item) => item.id !== id));

      if (!response.ok) {
        if (process.env.NODE_ENV === "development") {
          alert("Item removed from view (API delete failed)");
        } else {
          alert(`Delete failed: ${data.error || response.status}`);
        }
        return;
      }

      alert(
        data.isDemo
          ? "Item deleted successfully (demo mode)"
          : "Item deleted successfully",
      );
    } catch (error) {
      console.error("[GALLERY] Delete error:", error);
      // ✅ Aún en error, eliminamos del UI
      setMediaItems((prev) => prev.filter((item) => item.id !== id));
      alert(`Item removed from view (Error: ${error.message})`);
    }
  };

  // Manejar edición
  const handleEdit = (item) => {
    setSelectedMedia(item);
    setUploadData({
      titleAr: item.titleAr || "",
      titleFr: item.titleFr || "",
      descriptionAr: item.descriptionAr || "",
      descriptionFr: item.descriptionFr || "",
      type: item.type || "image",
      category: item.category || "activities",
      file: null,
      videoFile: null,
      videoUrl: "",
      thumbnail: null,
      status: item.status || PUBLICATION_STATUS.DRAFT,
    });
    setShowUploadModal(true);
  };

  // Obtener icono de categoría
  const getCategoryIcon = (categoryId) => {
    const category = categories.find((c) => c.id === categoryId);
    return category ? category.icon : "📁";
  };

  // Obtener etiqueta de categoría
  const getCategoryLabel = (categoryId) => {
    const category = categories.find((c) => c.id === categoryId);
    return category ? category.label : "Unknown";
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <Link
                  href="/admin/dashboard"
                  className="mr-4 text-gray-600 hover:text-gray-900 transition p-2 hover:bg-gray-100 rounded-lg"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Gallery Management
                  </h1>
                  <p className="text-gray-600 text-sm">
                    Upload and manage media for your farm
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowUploadModal(true)}
                className="flex items-center gap-2 bg-[#2d5a27] text-white px-4 py-2 rounded-lg hover:bg-green-800 transition"
              >
                <Plus className="w-5 h-5" />
                Upload Media
              </button>
            </div>
          </div>
        </header>

        {/* Controles y filtros */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Búsqueda */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search by title, description, or category..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d5a27] focus:border-transparent"
                  />
                </div>
              </div>

              {/* Filtros */}
              <div className="flex flex-wrap gap-2">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d5a27] focus:border-transparent"
                >
                  <option value="all">All Types</option>
                  <option value="image">Images</option>
                  <option value="video">Videos</option>
                </select>

                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d5a27] focus:border-transparent"
                >
                  <option value="all">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d5a27] focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  {statusOptions.map((status) => (
                    <option key={status.id} value={status.id}>
                      {status.label}
                    </option>
                  ))}
                </select>

                <div className="flex border rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`px-3 py-2 ${viewMode === "grid" ? "bg-gray-100 text-gray-800" : "bg-white text-gray-600"}`}
                    title="Grid view"
                  >
                    <Grid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`px-3 py-2 ${viewMode === "list" ? "bg-gray-100 text-gray-800" : "bg-white text-gray-600"}`}
                    title="List view"
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg mr-3">
                  <ImageIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Images</p>
                  <p className="text-2xl font-bold">
                    {mediaItems.filter((item) => item.type === "image").length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg mr-3">
                  <Video className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Videos</p>
                  <p className="text-2xl font-bold">
                    {mediaItems.filter((item) => item.type === "video").length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg mr-3">
                  <GlobeIcon className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Published</p>
                  <p className="text-2xl font-bold">
                    {
                      mediaItems.filter((item) => item.status === "published")
                        .length
                    }
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg mr-3">
                  <EyeOff className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Drafts</p>
                  <p className="text-2xl font-bold">
                    {
                      mediaItems.filter((item) => item.status === "draft")
                        .length
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contenido principal */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2d5a27] mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading gallery items...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ImageIcon className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {searchQuery ||
                filterType !== "all" ||
                filterCategory !== "all" ||
                filterStatus !== "all"
                  ? "No matching media found"
                  : "No media items yet"}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchQuery ||
                filterType !== "all" ||
                filterCategory !== "all" ||
                filterStatus !== "all"
                  ? "Try adjusting your filters or search query"
                  : "Upload your first media to showcase your farm"}
              </p>
              <button
                onClick={() => setShowUploadModal(true)}
                className="bg-[#2d5a27] text-white px-6 py-3 rounded-lg hover:bg-green-800 transition"
              >
                Upload First Media
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Vista Grid */}
              {viewMode === "grid" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredItems.map((item) => {
                    const StatusIcon =
                      statusOptions.find((s) => s.id === item.status)?.icon ||
                      EyeOff;
                    const statusColor =
                      statusOptions.find((s) => s.id === item.status)?.color ||
                      "bg-gray-100 text-gray-800";

                    return (
                      <div
                        key={item.id}
                        className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition"
                      >
                        <div className="relative h-48 bg-gray-100">
                          <div className="w-full h-full flex flex-col items-center justify-center p-4">
                            <div className="text-4xl mb-2">
                              {getCategoryIcon(item.category)}
                            </div>
                            {item.type === "image" ? (
                              <ImageIcon className="w-12 h-12 text-gray-400" />
                            ) : (
                              <Video className="w-12 h-12 text-gray-400" />
                            )}
                          </div>
                          <div className="absolute top-2 right-2 flex flex-col gap-1">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                item.type === "image"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-purple-100 text-purple-800"
                              }`}
                            >
                              {item.type === "image" ? "Image" : "Video"}
                            </span>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}
                            >
                              <StatusIcon className="w-3 h-3 inline mr-1" />
                              {item.status}
                            </span>
                          </div>
                        </div>

                        <div className="p-4">
                          <div className="mb-2">
                            <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                              {getCategoryLabel(item.category)}
                            </span>
                          </div>

                          <h3 className="font-semibold text-gray-800 mb-1 truncate">
                            {item.titleFr}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {item.descriptionFr}
                          </p>

                          <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                            <span>{formatDate(item.uploadedAt)}</span>
                            <span>{formatSize(item.size)}</span>
                          </div>

                          <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                            <span>👁️ {item.views || 0} views</span>
                            <span>⬇️ {item.downloads || 0} downloads</span>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(item)}
                              className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition text-sm flex items-center justify-center gap-1"
                            >
                              <Edit2 className="w-3 h-3" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition text-sm flex items-center gap-1"
                            >
                              <Trash2 className="w-3 h-3" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Vista Lista */}
              {viewMode === "list" && (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">
                            Type
                          </th>
                          <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">
                            Title
                          </th>
                          <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">
                            Category
                          </th>
                          <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">
                            Status
                          </th>
                          <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">
                            Uploaded
                          </th>
                          <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {filteredItems.map((item) => {
                          const StatusIcon =
                            statusOptions.find((s) => s.id === item.status)
                              ?.icon || EyeOff;
                          const statusColor =
                            statusOptions.find((s) => s.id === item.status)
                              ?.color || "bg-gray-100 text-gray-800";

                          return (
                            <tr key={item.id} className="hover:bg-gray-50">
                              <td className="py-3 px-4">
                                <div
                                  className={`w-8 h-8 rounded flex items-center justify-center ${
                                    item.type === "image"
                                      ? "bg-blue-100"
                                      : "bg-purple-100"
                                  }`}
                                >
                                  {item.type === "image" ? (
                                    <ImageIcon className="w-4 h-4 text-blue-600" />
                                  ) : (
                                    <Video className="w-4 h-4 text-purple-600" />
                                  )}
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <div>
                                  <p className="font-medium text-gray-800">
                                    {item.titleFr}
                                  </p>
                                  <p className="text-xs text-gray-600">
                                    {item.titleAr}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1 truncate max-w-xs">
                                    {item.descriptionFr}
                                  </p>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">
                                    {getCategoryIcon(item.category)}
                                  </span>
                                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                    {getCategoryLabel(item.category)}
                                  </span>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}
                                >
                                  <StatusIcon className="w-3 h-3 inline mr-1" />
                                  {item.status}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <p className="text-sm text-gray-600">
                                  {formatDate(item.uploadedAt)}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {formatSize(item.size)}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {item.views || 0} views •{" "}
                                  {item.downloads || 0} downloads
                                </p>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleEdit(item)}
                                    className="p-2 bg-blue-100 rounded hover:bg-blue-200 transition"
                                    title="Edit"
                                  >
                                    <Edit2 className="w-4 h-4 text-blue-600" />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(item.id)}
                                    className="p-2 bg-red-100 rounded hover:bg-red-200 transition"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-4 h-4 text-red-600" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal de Subida/Edición */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
              <div className="p-6 border-b bg-gradient-to-r from-[#2d5a27] to-green-800 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Upload className="w-8 h-8 mr-4" />
                    <div>
                      <h2 className="text-2xl font-bold">
                        {selectedMedia ? "Edit Media" : "Upload Media"}
                      </h2>
                      <p className="text-green-100">
                        {selectedMedia
                          ? "Update media details"
                          : "Add new images or videos to your gallery"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowUploadModal(false);
                      resetForm();
                    }}
                    className="text-white hover:text-green-200 transition p-2 hover:bg-green-700 rounded-lg"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
                <form onSubmit={handleUpload} className="p-6">
                  {/* Status de publicación */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Publication Status
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {statusOptions.map((status) => {
                        const StatusIcon = status.icon;
                        return (
                          <label key={status.id} className="relative">
                            <input
                              type="radio"
                              name="status"
                              value={status.id}
                              checked={uploadData.status === status.id}
                              onChange={handleInputChange}
                              className="sr-only"
                            />
                            <div
                              className={`p-3 border-2 rounded-lg cursor-pointer transition text-center ${
                                uploadData.status === status.id
                                  ? "border-[#2d5a27] bg-green-50"
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                            >
                              <StatusIcon
                                className={`w-6 h-6 mx-auto mb-2 ${
                                  uploadData.status === status.id
                                    ? "text-[#2d5a27]"
                                    : "text-gray-400"
                                }`}
                              />
                              <p className="text-xs font-medium">
                                {status.label}
                              </p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Tipo de media */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Media Type
                    </label>
                    <div className="flex gap-4">
                      <label className="flex-1">
                        <input
                          type="radio"
                          name="type"
                          value="image"
                          checked={uploadData.type === "image"}
                          onChange={handleInputChange}
                          className="sr-only"
                        />
                        <div
                          className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                            uploadData.type === "image"
                              ? "border-[#2d5a27] bg-green-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div className="flex items-center">
                            <ImageIcon
                              className={`w-6 h-6 mr-3 ${
                                uploadData.type === "image"
                                  ? "text-[#2d5a27]"
                                  : "text-gray-400"
                              }`}
                            />
                            <div>
                              <p className="font-medium">Image</p>
                              <p className="text-sm text-gray-500">
                                Upload JPG, PNG, or GIF
                              </p>
                            </div>
                          </div>
                        </div>
                      </label>
                      <label className="flex-1">
                        <input
                          type="radio"
                          name="type"
                          value="video"
                          checked={uploadData.type === "video"}
                          onChange={handleInputChange}
                          className="sr-only"
                        />
                        <div
                          className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                            uploadData.type === "video"
                              ? "border-[#2d5a27] bg-green-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div className="flex items-center">
                            <Video
                              className={`w-6 h-6 mr-3 ${
                                uploadData.type === "video"
                                  ? "text-[#2d5a27]"
                                  : "text-gray-400"
                              }`}
                            />
                            <div>
                              <p className="font-medium">Video</p>
                              <p className="text-sm text-gray-500">
                                Upload MP4 or provide URL
                              </p>
                            </div>
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Categoría */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Category
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      {categories.map((cat) => (
                        <label key={cat.id} className="relative">
                          <input
                            type="radio"
                            name="category"
                            value={cat.id}
                            checked={uploadData.category === cat.id}
                            onChange={handleInputChange}
                            className="sr-only"
                          />
                          <div
                            className={`p-3 border-2 rounded-lg cursor-pointer transition text-center ${
                              uploadData.category === cat.id
                                ? "border-[#2d5a27] bg-green-50"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <div className="text-2xl mb-2">{cat.icon}</div>
                            <p className="text-xs font-medium">{cat.label}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Títulos y descripciones */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Title (French) *
                      </label>
                      <input
                        type="text"
                        name="titleFr"
                        value={uploadData.titleFr}
                        onChange={handleInputChange}
                        placeholder="Enter title in French"
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d5a27] focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Title (Arabic) *
                      </label>
                      <input
                        type="text"
                        name="titleAr"
                        value={uploadData.titleAr}
                        onChange={handleInputChange}
                        placeholder="Enter title in Arabic"
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d5a27] focus:border-transparent"
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description (French)
                      </label>
                      <textarea
                        name="descriptionFr"
                        value={uploadData.descriptionFr}
                        onChange={handleInputChange}
                        placeholder="Enter description in French"
                        rows="3"
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d5a27] focus:border-transparent"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description (Arabic)
                      </label>
                      <textarea
                        name="descriptionAr"
                        value={uploadData.descriptionAr}
                        onChange={handleInputChange}
                        placeholder="Enter description in Arabic"
                        rows="3"
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d5a27] focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Archivo o URL */}
                  <div className="mb-6">
                    {uploadData.type === "image" ? (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Image File
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#2d5a27] transition">
                          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                          <p className="text-gray-600 mb-2">
                            Drag and drop an image, or click to browse
                          </p>
                          <p className="text-sm text-gray-500 mb-4">
                            Supports JPG, PNG, GIF up to 10MB
                          </p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="block mx-auto"
                          />
                        </div>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Video URL or File
                        </label>
                        <input
                          type="text"
                          name="videoUrl"
                          value={uploadData.videoUrl}
                          onChange={handleInputChange}
                          placeholder="Enter video URL (YouTube, Vimeo, etc.)"
                          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d5a27] focus:border-transparent mb-4"
                        />
                        <p className="text-center text-gray-500 mb-2">or</p>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#2d5a27] transition">
                          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                          <p className="text-gray-600 mb-2">
                            Upload video file
                          </p>
                          <p className="text-sm text-gray-500 mb-4">
                            Supports MP4 up to 100MB
                          </p>
                          <input
                            type="file"
                            accept="video/*"
                            onChange={handleFileChange}
                            className="block mx-auto"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Botones de acción */}
                  <div className="flex justify-end gap-4 pt-6 border-t">
                    <button
                      type="button"
                      onClick={() => {
                        setShowUploadModal(false);
                        resetForm();
                      }}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={uploading}
                      className="px-6 py-3 bg-[#2d5a27] text-white rounded-lg hover:bg-green-800 transition disabled:opacity-50 flex items-center gap-2"
                    >
                      {uploading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          {selectedMedia ? "Updating..." : "Uploading..."}
                        </>
                      ) : (
                        <>
                          <Upload className="w-5 h-5" />
                          {selectedMedia ? "Update Media" : "Upload Media"}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-8 border-t bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-600 text-sm mb-4 md:mb-0">
                Gallery Management • {mediaItems.length} total items •{" "}
                {filteredItems.length} shown
              </p>
              <div className="flex gap-4">
                <button
                  onClick={loadGalleryItems}
                  disabled={loading}
                  className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1 px-3 py-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <RotateCcw
                    className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                  />
                  {loading ? "Refreshing..." : "Refresh"}
                </button>
                <Link
                  href="/admin/dashboard"
                  className="text-sm text-[#2d5a27] hover:underline flex items-center gap-1 px-3 py-2 hover:bg-green-50 rounded-lg transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back to Dashboard
                </Link>
              </div>
            </div>
          </div>
        </footer>

        <style jsx global>{`
          .line-clamp-2 {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
        `}</style>
      </div>
    </AuthGuard>
  );
}
