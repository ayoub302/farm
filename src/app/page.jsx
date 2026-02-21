"use client";

import { useState, useEffect, useRef } from "react";
import ActividadCard from "@/components/ActividadCard";
import CosechaCard from "@/components/CosechaCard";
import Calendario from "@/components/Calendario";
import Link from "next/link";
import { useLanguage } from "@/components/LanguageContext";
import Image from "next/image";
import {
  Video,
  Image as ImageIcon,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  SkipBack,
  SkipForward,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const textos = {
  ar: {
    title: "مزرعة المنصوري",
    subtitle: "تتواصل مع الطبيعة وتشارك في حصادنا وأنشطتنا الزراعية",
    seeActivities: "عرض الأنشطة المتاحة",
    contactNow: "اتصل الآن",
    upcomingActivities: "الأنشطة القادمة في المزرعة",
    seeAllActivities: "عرض جميع الأنشطة →",
    harvestStatus: "حالة المحاصيل الحالية",
    calendarTitle: "تقويم الأنشطة",
    howItWorks: "كيف تعمل؟",
    step1: "استشارة التقويم",
    step1Desc: "تحقق من مواعيد الحصاد والأنشطة المجدولة للأسبوع",
    step2: "التسجيل عبر الإنترنت",
    step2Desc: "سجل بسهولة للمشاركة في الأنشطة التي تهمك",
    step3: "تعال إلى المزرعة",
    step3Desc: "شارك وتعلم الزراعة المستدامة وخذ المنتجات الطازجة معك",
    ctaText: "أكثر من 500 عائلة شاركت في أنشطتنا هذا العام!",
    wantToParticipate: "أريد المشاركة",
    farmLocation: "موقع المزرعة",
    openingHours: "ساعات العمل",
    contactInformation: "معلومات الاتصال",
    loadingActivities: "جاري تحميل الأنشطة...",
    noFeaturedActivities: "لا توجد أنشطة حالياً",
    loadingHarvests: "جاري تحميل المحاصيل...",
    noHarvests: "لا توجد محاصيل حالياً",
    viewAllHarvests: "عرض جميع المحاصيل →",
    galleryTitle: "معرض المزرعة",
    gallerySubtitle:
      "تصفح أجمل اللحظات من مزرعتنا، من الحصاد إلى الأنشطة العائلية",
    videoTitle: "شاهد فيديوهات المزرعة",
    videoSubtitle: "مقاطع فيديو حصرية من مزرعتنا تظهر أنشطتنا اليومية والحصاد",
    playVideo: "تشغيل الفيديو",
    pauseVideo: "إيقاف الفيديو",
    nextVideo: "الفيديو التالي",
    previousVideo: "الفيديو السابق",
    galleryVideo: "فيديوهات المزرعة",
    galleryVideoDesc: "مقاطع فيديو توثيقية لأنشطتنا الزراعية",
    farmLife: "حياة المزرعة",
    farmLifeDesc: "لحظات جميلة من الحياة اليومية في مزرعتنا",
    harvestMoments: "لحظات الحصاد",
    harvestMomentsDesc: "فرحة جني الثمار والمنتجات الطازجة",
    familyActivities: "أنشطة عائلية",
    familyActivitiesDesc: "عائلات تستمتع بتجربة الطبيعة والتعلم",
    sustainability: "الاستدامة الزراعية",
    sustainabilityDesc: "ممارساتنا الزراعية المستدامة والصديقة للبيئة",
    products: "منتجاتنا الطازجة",
    productsDesc: "ثمار جهودنا من الأرض إلى المائدة",
    watchVideo: "شاهد الفيديو",
    viewGallery: "عرض المعرض الكامل",
    loadingGallery: "جاري تحميل المحتوى...",
    videoFarmTour: "جولة في المزرعة",
    videoFarmTourDesc: "تعرف على أقسام المزرعة ومرافقها",
    videoHarvestProcess: "عملية الحصاد",
    videoHarvestProcessDesc: "شاهد كيفية حصاد المنتجات الطازجة",
    videoActivities: "الأنشطة العائلية",
    videoActivitiesDesc: "لحظات سعيدة من الأنشطة التفاعلية",
    videoSustainable: "الزراعة المستدامة",
    videoSustainableDesc: "تقنياتنا الزراعية الصديقة للبيئة",
    videoCurrentTime: "الوقت الحالي",
    videoDuration: "المدة الكلية",
    volume: "الصوت",
    mute: "كتم",
    unmute: "تشغيل الصوت",
    fullscreen: "ملء الشاشة",
    exitFullscreen: "خروج من ملء الشاشة",
    speed: "السرعة",
    skipForward: "تقدم 10 ثواني",
    skipBackward: "رجوع 10 ثواني",
    playbackSpeed: "سرعة التشغيل",
    normalSpeed: "السرعة العادية",
    slower: "أبطأ",
    faster: "أسرع",
    loadingVideo: "جاري تحميل الفيديو...",
    noVideos: "لا توجد فيديوهات حالياً",
    noImages: "لا توجد صور حالياً",
    errorLoadingVideo: "خطأ في تحميل الفيديو",
    retry: "إعادة المحاولة",
  },
  fr: {
    title: "Ferme Al Manssouri",
    subtitle:
      "Connectez-vous avec la nature et participez à nos récoltes et activités agricoles",
    seeActivities: "Voir les activités disponibles",
    contactNow: "Contactez maintenant",
    upcomingActivities: "Activités à venir à la ferme",
    seeAllActivities: "Voir toutes les activités →",
    harvestStatus: "État actuel des récoltes",
    calendarTitle: "Calendrier des activités",
    howItWorks: "Comment ça fonctionne ?",
    step1: "Consultez le calendrier",
    step1Desc:
      "Vérifiez les dates de récolte et les activités planifiées pour la semaine",
    step2: "Inscrivez-vous en ligne",
    step2Desc:
      "Inscrivez-vous facilement pour participer aux activités qui vous intéressent",
    step3: "Venez à la ferme",
    step3Desc:
      "Participez, apprenez l'agriculture durable et emportez des produits frais",
    ctaText: "Plus de 500 familles ont participé à nos activités cette année!",
    wantToParticipate: "Je veux participer",
    farmLocation: "Emplacement de la ferme",
    openingHours: "Horaires d'ouverture",
    contactInformation: "Informations de contact",
    loadingActivities: "Chargement des activités...",
    noFeaturedActivities: "Aucune activité pour le moment",
    loadingHarvests: "Chargement des récoltes...",
    noHarvests: "Aucune récolte pour le moment",
    viewAllHarvests: "Voir toutes les récoltes →",
    galleryTitle: "Galerie de la Ferme",
    gallerySubtitle:
      "Découvrez les plus beaux moments de notre ferme, des récoltes aux actividades familiales",
    videoTitle: "Découvrez Nos Vidéos",
    videoSubtitle:
      "Vidéos exclusives de notre ferme montrant nos activités quotidiennes et récoltes",
    playVideo: "Lire la vidéo",
    pauseVideo: "Pause",
    nextVideo: "Vidéo suivante",
    previousVideo: "Vidéo précédente",
    galleryVideo: "Vidéos de la Ferme",
    galleryVideoDesc: "Vidéos documentaires de nos activités agricoles",
    farmLife: "Vie à la Ferme",
    farmLifeDesc: "Beaux moments de la vie quotidienne dans notre ferme",
    harvestMoments: "Moments de Récolte",
    harvestMomentsDesc: "Joie de cueillir des fruits et produits frais",
    familyActivities: "Activités Familiales",
    familyActivitiesDesc:
      "Familles profitant de l'expérience nature et d'apprentissage",
    sustainability: "Agriculture Durable",
    sustainabilityDesc: "Nos pratiques agricoles durables et écologiques",
    products: "Nos Produits Frais",
    productsDesc: "Les fruits de nos efforts, de la terre à la table",
    watchVideo: "Regarder la Vidéo",
    viewGallery: "Voir la Galerie Complète",
    loadingGallery: "Chargement du contenu...",
    videoFarmTour: "Visite de la Ferme",
    videoFarmTourDesc:
      "Découvrez les différentes sections et installations de la ferme",
    videoHarvestProcess: "Processus de Récolte",
    videoHarvestProcessDesc: "Voyez comment nos produits frais sont récoltés",
    videoActivities: "Activités Familiales",
    videoActivitiesDesc: "Moments joyeux des activités interactives",
    videoSustainable: "Agriculture Durable",
    videoSustainableDesc:
      "Nos techniques agricoles respectueuses de l'environnement",
    videoCurrentTime: "Temps actuel",
    videoDuration: "Durée totale",
    volume: "Volume",
    mute: "Muet",
    unmute: "Activer le son",
    fullscreen: "Plein écran",
    exitFullscreen: "Quitter le plein écran",
    speed: "Vitesse",
    skipForward: "Avancer 10 secondes",
    skipBackward: "Reculer 10 secondes",
    playbackSpeed: "Vitesse de lecture",
    normalSpeed: "Vitesse normale",
    slower: "Plus lent",
    faster: "Plus rapide",
    loadingVideo: "Chargement de la vidéo...",
    noVideos: "Aucune vidéo pour le moment",
    noImages: "Aucune image pour le moment",
    errorLoadingVideo: "Erreur de chargement de la vidéo",
    retry: "Réessayer",
  },
};

export default function HomePage() {
  const { language } = useLanguage();

  const [actividadesProximas, setActividadesProximas] = useState([]);
  const [cosechasActuales, setCosechasActuales] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [loadingHarvests, setLoadingHarvests] = useState(true);
  const [galleryImages, setGalleryImages] = useState([]);
  const [galleryVideos, setGalleryVideos] = useState([]);
  const [loadingGallery, setLoadingGallery] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  // Estados para videos
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [videoLoading, setVideoLoading] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  const videoRef = useRef(null);
  const videoContainerRef = useRef(null);
  const progressBarRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  const t = textos[language] || textos.fr;

  // Fetch actividades
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoadingActivities(true);
        const response = await fetch("/api/activities?limit=4");
        if (response.ok) {
          const data = await response.json();
          setActividadesProximas(data.actividades || []);
        }
      } catch (error) {
        console.error("Error fetching activities:", error);
      } finally {
        setLoadingActivities(false);
      }
    };
    fetchActivities();
  }, []);

  // Fetch cosechas
  useEffect(() => {
    const fetchHarvests = async () => {
      try {
        setLoadingHarvests(true);
        const response = await fetch("/api/harvests");
        if (response.ok) {
          const data = await response.json();
          setCosechasActuales((data.harvests || []).slice(0, 6));
        }
      } catch (error) {
        console.error("Error fetching harvests:", error);
      } finally {
        setLoadingHarvests(false);
      }
    };
    fetchHarvests();
  }, []);

  // Cargar galería
  useEffect(() => {
    const fetchGallery = async () => {
      try {
        setLoadingGallery(true);
        const imagesResponse = await fetch(
          "/api/gallery?type=image&status=published",
        );
        if (imagesResponse.ok) {
          const imagesData = await imagesResponse.json();
          if (imagesData.success && Array.isArray(imagesData.items)) {
            setGalleryImages(imagesData.items);
          } else if (Array.isArray(imagesData)) {
            setGalleryImages(imagesData);
          }
        }
        const videosResponse = await fetch(
          "/api/gallery?type=video&status=published",
        );
        if (videosResponse.ok) {
          const videosData = await videosResponse.json();
          if (videosData.success && Array.isArray(videosData.items)) {
            setGalleryVideos(videosData.items);
            if (videosData.items.length > 0) {
              setCurrentVideoIndex(0);
            }
          } else if (Array.isArray(videosData)) {
            setGalleryVideos(videosData);
          }
        }
      } catch (error) {
        console.error("Error fetching gallery:", error);
      } finally {
        setLoadingGallery(false);
      }
    };
    fetchGallery();
  }, []);

  const currentVideo = galleryVideos[currentVideoIndex];

  // Formatear tiempo
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Ocultar controles después de inactividad
  const hideControls = () => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying && !isDragging) {
        setShowControls(false);
      }
    }, 3000);
  };

  const handleMouseMove = () => {
    setShowControls(true);
    hideControls();
  };

  // Función para reintentar carga de video
  const handleRetry = () => {
    setVideoError(false);
    setVideoLoading(true);
    if (videoRef.current) {
      videoRef.current.load();
    }
  };

  // Efecto para manejar eventos del video
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      if (!isDragging) {
        setCurrentTime(video.currentTime);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setVideoLoading(false);
      setVideoError(false);
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleWaiting = () => setVideoLoading(true);
    const handleCanPlay = () => {
      setVideoLoading(false);
      setVideoError(false);
    };
    const handleError = (e) => {
      console.error("Error de video:", e);
      setVideoError(true);
      setVideoLoading(false);
      setIsPlaying(false);
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("ended", handleEnded);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("waiting", handleWaiting);
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("error", handleError);

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("waiting", handleWaiting);
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("error", handleError);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [isDragging]);

  // Efecto para actualizar el video cuando cambia el índice - SOLO UNA VEZ
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !currentVideo) return;

    setVideoLoading(true);
    setVideoError(false);
    setCurrentTime(0);
    setDuration(0);

    // Forzar recarga del video SOLO cuando cambia el índice
    video.load();
  }, [currentVideoIndex, currentVideo]); // SIN isPlaying

  // Controladores de video
  const handlePlayPause = (e) => {
    e?.stopPropagation();
    if (!videoRef.current || videoError) return;

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.error("Error al reproducir:", error);
          setIsPlaying(false);
          setVideoError(true);
        });
      }
    }
    setShowControls(true);
    hideControls();
  };

  const handleNextVideo = (e) => {
    e?.stopPropagation();
    if (galleryVideos.length === 0) return;

    const nextIndex = (currentVideoIndex + 1) % galleryVideos.length;
    setCurrentVideoIndex(nextIndex);
    setIsPlaying(true);
    setShowSpeedMenu(false);
    setShowControls(true);
    hideControls();
  };

  const handlePrevVideo = (e) => {
    e?.stopPropagation();
    if (galleryVideos.length === 0) return;

    const prevIndex =
      (currentVideoIndex - 1 + galleryVideos.length) % galleryVideos.length;
    setCurrentVideoIndex(prevIndex);
    setIsPlaying(true);
    setShowSpeedMenu(false);
    setShowControls(true);
    hideControls();
  };

  const handleVolumeChange = (e) => {
    e.stopPropagation();
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setIsMuted(newVolume === 0);
    }
  };

  const handleMuteToggle = (e) => {
    e?.stopPropagation();
    if (!videoRef.current) return;

    if (isMuted) {
      videoRef.current.volume = volume || 0.5;
      setIsMuted(false);
    } else {
      videoRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const handleProgressClick = (e) => {
    e.stopPropagation();
    if (!videoRef.current || !progressBarRef.current || !duration || videoError)
      return;

    const rect = progressBarRef.current.getBoundingClientRect();
    const clickPosition = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickPosition / rect.width));
    const newTime = percentage * duration;

    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleProgressMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!videoRef.current || !duration || videoError) return;

    setIsDragging(true);
    setShowControls(true);

    const handleMouseMove = (e) => {
      if (!progressBarRef.current || !videoRef.current) return;

      const rect = progressBarRef.current.getBoundingClientRect();
      let x = e.clientX - rect.left;
      x = Math.max(0, Math.min(x, rect.width));
      const percentage = x / rect.width;
      const visualTime = percentage * duration;
      setCurrentTime(visualTime);
    };

    const handleMouseUp = (e) => {
      if (!videoRef.current || !progressBarRef.current || !duration) return;

      const rect = progressBarRef.current.getBoundingClientRect();
      let x = e.clientX - rect.left;
      x = Math.max(0, Math.min(x, rect.width));
      const percentage = x / rect.width;
      const newTime = percentage * duration;

      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
      setIsDragging(false);

      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleFullscreen = (e) => {
    e?.stopPropagation();
    const container = videoContainerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      if (container.requestFullscreen) {
        container.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const handleSpeedChange = (speed, e) => {
    e?.stopPropagation();
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      setPlaybackRate(speed);
    }
    setShowSpeedMenu(false);
  };

  const handleSkipForward = (e) => {
    e?.stopPropagation();
    if (videoRef.current && duration && !videoError) {
      videoRef.current.currentTime = Math.min(
        videoRef.current.currentTime + 10,
        duration,
      );
    }
  };

  const handleSkipBackward = (e) => {
    e?.stopPropagation();
    if (videoRef.current && !videoError) {
      videoRef.current.currentTime = Math.max(
        videoRef.current.currentTime - 10,
        0,
      );
    }
  };

  const speedOptions = [
    { value: 0.5, label: "0.5x" },
    { value: 0.75, label: "0.75x" },
    { value: 1, label: "1x" },
    { value: 1.25, label: "1.25x" },
    { value: 1.5, label: "1.5x" },
    { value: 2, label: "2x" },
  ];

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative h-[600px] bg-gradient-to-r from-[#2d5a27] to-emerald-800 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-white text-center px-4">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            {t.title} <span className="text-yellow-400">🌱</span>
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mb-8">{t.subtitle}</p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/activities"
              className="bg-[#2d5a27] text-white px-8 py-4 rounded-lg font-semibold hover:bg-green-800 transition text-lg"
            >
              {t.seeActivities}
            </Link>
            <Link
              href="/contacto"
              className="bg-yellow-500 text-white px-8 py-4 rounded-lg font-semibold hover:bg-orange-500 transition text-lg"
            >
              {t.contactNow}
            </Link>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#e8f5e9] to-transparent"></div>
      </section>

      {/* Próximas Actividades */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
            {t.upcomingActivities}
          </h2>
        </div>
        {loadingActivities ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2d5a27] mx-auto"></div>
            <p className="mt-4 text-gray-600">{t.loadingActivities}</p>
          </div>
        ) : actividadesProximas.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-500">{t.noFeaturedActivities}</p>
            <Link
              href="/activities"
              className="mt-4 inline-block text-[#2d5a27] font-semibold hover:underline"
            >
              {t.seeAllActivities}
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-8">
              {actividadesProximas.map((actividad) => (
                <ActividadCard key={actividad.id} actividad={actividad} />
              ))}
            </div>
            <div className="text-center mt-12">
              <Link
                href="/activities"
                className="inline-block bg-[#2d5a27] text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-800 transition text-lg"
              >
                {language === "ar"
                  ? "عرض المزيد من الأنشطة"
                  : "Voir plus d'activités"}{" "}
                →
              </Link>
            </div>
          </>
        )}
      </section>

      {/* Estado de Cosechas */}
      <section className="py-16 px-4 bg-emerald-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
              {t.harvestStatus}
            </h2>
            <Link
              href="/cosechas"
              className="text-[#2d5a27] font-semibold hover:underline"
            >
              {t.viewAllHarvests}
            </Link>
          </div>
          {loadingHarvests ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2d5a27] mx-auto"></div>
              <p className="mt-4 text-gray-600">{t.loadingHarvests}</p>
            </div>
          ) : cosechasActuales.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl text-gray-500">{t.noHarvests}</p>
              <Link
                href="/cosechas"
                className="mt-4 inline-block text-[#2d5a27] font-semibold hover:underline"
              >
                {t.viewAllHarvests}
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
              {cosechasActuales.map((cosecha) => (
                <CosechaCard key={cosecha.id} cosecha={cosecha} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Calendario */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-12">
          {t.calendarTitle}
        </h2>
        <Calendario />
      </section>

      {/* SECCIÓN DE VIDEOS - VERSIÓN CON LOGS COMPLETOS */}
      <section className="py-16 px-4 bg-gradient-to-r from-emerald-50 to-green-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              {t.videoTitle}
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              {t.videoSubtitle}
            </p>
          </div>

          {loadingGallery ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2d5a27] mx-auto"></div>
              <p className="mt-4 text-gray-600">{t.loadingGallery}</p>
            </div>
          ) : galleryVideos.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Video className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {t.noVideos}
              </h3>
              <p className="text-gray-600">
                {language === "ar"
                  ? "سيتم عرض الفيديوهات هنا بعد رفعها من لوحة التحكم"
                  : "Les vidéos apparaîtront ici après avoir été téléchargées depuis le panneau d'administration"}
              </p>
            </div>
          ) : (
            <>
              {/* Video Player Principal */}
              <div
                ref={videoContainerRef}
                className="relative rounded-2xl overflow-hidden shadow-2xl mb-8 bg-black"
              >
                <div className="aspect-video relative bg-black">
                  {/* Video element con logs en cada evento */}
                  <video
                    ref={videoRef}
                    controls
                    className="w-full h-full"
                    preload="auto"
                    onLoadStart={() => {
                      console.log(
                        "🎬 [EVENT] loadstart - Iniciando carga del video",
                      );
                      console.log(
                        "URL que se está cargando:",
                        currentVideo?.src || currentVideo?.url,
                      );
                      setVideoLoading(true);
                      setVideoError(false);
                    }}
                    onLoadedData={() => {
                      console.log(
                        "✅ [EVENT] loadeddata - Video cargado parcialmente",
                      );
                      console.log("Duración:", videoRef.current?.duration);
                      setVideoLoading(false);
                    }}
                    onLoadedMetadata={() => {
                      console.log(
                        "✅ [EVENT] loadedmetadata - Metadatos cargados",
                      );
                      console.log(
                        "Duración total:",
                        videoRef.current?.duration,
                      );
                      console.log("Ancho:", videoRef.current?.videoWidth);
                      console.log("Alto:", videoRef.current?.videoHeight);
                      setDuration(videoRef.current?.duration || 0);
                      setVideoLoading(false);
                    }}
                    onCanPlay={() => {
                      console.log(
                        "✅ [EVENT] canplay - Video listo para reproducir",
                      );
                      setVideoLoading(false);
                      setVideoError(false);
                    }}
                    onCanPlayThrough={() => {
                      console.log(
                        "✅ [EVENT] canplaythrough - Video completamente cargado",
                      );
                      setVideoLoading(false);
                    }}
                    onWaiting={() => {
                      console.log(
                        "⏳ [EVENT] waiting - Video esperando por buffer",
                      );
                      setVideoLoading(true);
                    }}
                    onPlaying={() => {
                      console.log("▶️ [EVENT] playing - Video reproduciendo");
                      setVideoLoading(false);
                    }}
                    onPause={() => {
                      console.log("⏸️ [EVENT] pause - Video pausado");
                    }}
                    onEnded={() => {
                      console.log("🏁 [EVENT] ended - Video terminado");
                      setIsPlaying(false);
                    }}
                    onError={(e) => {
                      console.error("❌ [EVENT] error - Error en el video");
                      const video = videoRef.current;
                      if (video?.error) {
                        console.error("Código de error:", video.error.code);
                        console.error("Mensaje de error:", video.error.message);

                        // Códigos de error comunes:
                        // 1 = MEDIA_ERR_ABORTED
                        // 2 = MEDIA_ERR_NETWORK
                        // 3 = MEDIA_ERR_DECODE
                        // 4 = MEDIA_ERR_SRC_NOT_SUPPORTED

                        switch (video.error.code) {
                          case 1:
                            console.error(
                              "Error 1: Reproducción abortada por el usuario",
                            );
                            break;
                          case 2:
                            console.error(
                              "Error 2: Error de red - La URL puede ser incorrecta o el servidor no responde",
                            );
                            break;
                          case 3:
                            console.error(
                              "Error 3: Error de decodificación - El formato del video no es compatible",
                            );
                            break;
                          case 4:
                            console.error(
                              "Error 4: Formato no soportado - El navegador no puede reproducir este tipo de video",
                            );
                            break;
                          default:
                            console.error("Error desconocido");
                        }
                      }
                      console.log(
                        "URL que causó el error:",
                        currentVideo?.src || currentVideo?.url,
                      );
                      setVideoError(true);
                      setVideoLoading(false);
                    }}
                    onProgress={() => {
                      const video = videoRef.current;
                      if (video && video.buffered.length > 0) {
                        console.log(
                          "📊 [EVENT] progress - Buffer:",
                          video.buffered.start(0),
                          "a",
                          video.buffered.end(0),
                          "segundos",
                        );
                      }
                    }}
                    onSuspend={() => {
                      console.log("💤 [EVENT] suspend - Carga suspendida");
                    }}
                    onStalled={() => {
                      console.log("🐌 [EVENT] stalled - Descarga estancada");
                      setVideoLoading(true);
                    }}
                    onAbort={() => {
                      console.log("🛑 [EVENT] abort - Carga abortada");
                    }}
                    onEmptied={() => {
                      console.log("📭 [EVENT] emptied - Video vaciado");
                    }}
                  >
                    {/* Intentamos con el mimeType correcto */}
                    <source
                      src={currentVideo?.src || currentVideo?.url}
                      type={currentVideo?.mimeType || "video/mp4"}
                    />
                    {/* Fallback sin type para que el navegador intente detectarlo */}
                    <source src={currentVideo?.src || currentVideo?.url} />
                    {t.errorLoadingVideo}
                  </video>

                  {/* Loading overlay */}
                  {videoLoading && !videoError && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-20">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                        <p className="text-white">{t.loadingVideo}</p>
                        <p className="text-white text-sm mt-2 opacity-70">
                          Cargando: {currentVideo?.src || currentVideo?.url}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Error overlay */}
                  {videoError && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-20">
                      <div className="text-center max-w-lg p-4">
                        <div className="text-red-500 text-5xl mb-4">⚠️</div>
                        <p className="text-white mb-2 text-lg">
                          {t.errorLoadingVideo}
                        </p>
                        <p className="text-white text-sm mb-4 bg-red-900/50 p-2 rounded">
                          URL: {currentVideo?.src || currentVideo?.url}
                        </p>
                        <p className="text-white text-sm mb-4">
                          Código de error:{" "}
                          {videoRef.current?.error?.code || "desconocido"}
                        </p>
                        <p className="text-white text-sm mb-4">
                          {videoRef.current?.error?.code === 2 &&
                            "Error de red - Verifica que la URL sea accesible"}
                          {videoRef.current?.error?.code === 4 &&
                            "Formato no soportado - Verifica que el video sea MP4 H.264"}
                        </p>
                        <button
                          onClick={() => {
                            console.log("🔄 Reintentando carga...");
                            setVideoError(false);
                            setVideoLoading(true);
                            if (videoRef.current) {
                              videoRef.current.load();
                            }
                          }}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg transition"
                        >
                          {t.retry}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Miniaturas de Videos */}
              {galleryVideos.length > 1 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {galleryVideos.map((video, index) => (
                    <button
                      key={video.id}
                      onClick={() => {
                        console.log("🔄 Cambiando a video índice:", index);
                        console.log("Nuevo video:", video);
                        if (videoRef.current) {
                          videoRef.current.pause();
                        }
                        setCurrentVideoIndex(index);
                        setIsPlaying(true);
                        setVideoLoading(true);
                        setVideoError(false);
                      }}
                      className={`group relative overflow-hidden rounded-lg aspect-video ${
                        currentVideoIndex === index
                          ? "ring-4 ring-emerald-500 ring-offset-2"
                          : "hover:ring-2 hover:ring-emerald-300"
                      } transition-all`}
                    >
                      {video.thumbnail ? (
                        <Image
                          src={video.thumbnail}
                          alt={video.title || "Video thumbnail"}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                          <Video className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div
                          className={`text-3xl ${currentVideoIndex === index ? "text-emerald-400" : "text-white"}`}
                        >
                          ▶️
                        </div>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                        <p className="text-white text-sm font-semibold truncate">
                          {language === "ar"
                            ? video.titleAr || video.title
                            : video.titleFr || video.title}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* GALERÍA DE IMÁGENES */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              {t.galleryTitle}
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              {t.gallerySubtitle}
            </p>
          </div>

          {loadingGallery ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2d5a27] mx-auto"></div>
              <p className="mt-4 text-gray-600">{t.loadingGallery}</p>
            </div>
          ) : galleryImages.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ImageIcon className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {t.noImages}
              </h3>
              <p className="text-gray-600">
                {language === "ar"
                  ? "سيتم عرض الصور هنا بعد رفعها من لوحة التحكم"
                  : "Les images apparaîtront ici après avoir été téléchargées depuis le panneau d'administration"}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {galleryImages.slice(0, 8).map((item) => (
                  <div
                    key={item.id}
                    className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer"
                    onClick={() => setSelectedImage(item)}
                  >
                    <div className="aspect-square overflow-hidden bg-gray-100">
                      <div className="relative w-full h-full">
                        <Image
                          src={item.src || item.url}
                          alt={
                            language === "ar"
                              ? item.titleAr || item.title
                              : item.titleFr || item.title
                          }
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        />
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                      <div className="p-4 text-white">
                        <h3 className="font-bold text-lg mb-1">
                          {language === "ar"
                            ? item.titleAr || item.title
                            : item.titleFr || item.title}
                        </h3>
                        <p className="text-sm text-gray-200 line-clamp-2">
                          {language === "ar"
                            ? item.descriptionAr || item.description
                            : item.descriptionFr || item.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {selectedImage && (
                <div
                  className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
                  onClick={() => setSelectedImage(null)}
                >
                  <div className="relative max-w-5xl max-h-[90vh] w-full">
                    <button
                      className="absolute -top-12 right-0 text-white text-4xl hover:text-emerald-400 transition"
                      onClick={() => setSelectedImage(null)}
                    >
                      ×
                    </button>
                    <div className="bg-white rounded-lg overflow-hidden">
                      <div
                        className="relative w-full"
                        style={{ height: "70vh" }}
                      >
                        <Image
                          src={selectedImage.src || selectedImage.url}
                          alt={
                            language === "ar"
                              ? selectedImage.titleAr || selectedImage.title
                              : selectedImage.titleFr || selectedImage.title
                          }
                          fill
                          className="object-contain"
                          sizes="90vw"
                          priority
                        />
                      </div>
                      <div className="p-6">
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">
                          {language === "ar"
                            ? selectedImage.titleAr || selectedImage.title
                            : selectedImage.titleFr || selectedImage.title}
                        </h3>
                        <p className="text-gray-600">
                          {language === "ar"
                            ? selectedImage.descriptionAr ||
                              selectedImage.description
                            : selectedImage.descriptionFr ||
                              selectedImage.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-emerald-50 rounded-2xl p-8 mb-12">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                  {language === "ar"
                    ? "تصنيفات المعرض"
                    : "Catégories de la Galerie"}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    <div className="text-3xl mb-2">🌾</div>
                    <h4 className="font-bold text-gray-800 mb-1">
                      {t.farmLife}
                    </h4>
                    <p className="text-sm text-gray-600">{t.farmLifeDesc}</p>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    <div className="text-3xl mb-2">🍅</div>
                    <h4 className="font-bold text-gray-800 mb-1">
                      {t.harvestMoments}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {t.harvestMomentsDesc}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    <div className="text-3xl mb-2">👨‍👩‍👧‍👦</div>
                    <h4 className="font-bold text-gray-800 mb-1">
                      {t.familyActivities}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {t.familyActivitiesDesc}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    <div className="text-3xl mb-2">🌍</div>
                    <h4 className="font-bold text-gray-800 mb-1">
                      {t.sustainability}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {t.sustainabilityDesc}
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <Link
                  href="/galeria"
                  className="inline-flex items-center gap-2 bg-[#2d5a27] text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-800 transition text-lg"
                >
                  {t.viewGallery} <span>→</span>
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Comment ça fonctionne ? */}
      <section className="bg-[#2d5a27] text-white">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            {t.howItWorks}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="text-5xl mb-4">📅</div>
              <h3 className="text-xl font-bold mb-4">1. {t.step1}</h3>
              <p className="text-gray-200">{t.step1Desc}</p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">📝</div>
              <h3 className="text-xl font-bold mb-4">2. {t.step2}</h3>
              <p className="text-gray-200">{t.step2Desc}</p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">👨‍🌾</div>
              <h3 className="text-xl font-bold mb-4">3. {t.step3}</h3>
              <p className="text-gray-200">{t.step3Desc}</p>
            </div>
          </div>
          <div className="text-center mb-8">
            <p className="text-xl mb-6">{t.ctaText}</p>
            <Link
              href="/reservation"
              className="inline-block bg-white text-[#2d5a27] px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition"
            >
              {t.wantToParticipate}
            </Link>
          </div>

          <div className="border-t border-green-600 pt-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-xl font-bold mb-4">{t.farmLocation}</h3>
                <p className="text-gray-200">
                  Ferme Caïd Mansouri, Douar Alhamri
                </p>
                <p className="text-gray-200">
                  Commune de Boughriba, Province de Berkane
                </p>
                <p className="text-gray-200">Code Postal: 60000</p>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-4">{t.openingHours}</h3>
                <p className="text-gray-200">Lundi - Vendredi: 9h - 18h</p>
                <p className="text-gray-200">Samedi: 10h - 14h</p>
                <p className="text-gray-200">Dimanche: Fermé</p>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-4">
                  {t.contactInformation}
                </h3>
                <p className="text-gray-200">📞 +212 661 105 373</p>
                <p className="text-gray-200">✉️ n_bachiri@hotmail.com</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
