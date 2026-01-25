// components/Calendario.jsx - ACTUALIZADO CON HORARIOS
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/components/LanguageContext";

const textos = {
  ar: {
    diasSemana: ["أح", "إث", "ث", "أر", "خ", "ج", "س"],
    nombresMeses: [
      "يناير",
      "فبراير",
      "مارس",
      "أبريل",
      "مايو",
      "يونيو",
      "يوليو",
      "أغسطس",
      "سبتمبر",
      "أكتوبر",
      "نوفمبر",
      "ديسمبر",
    ],
    anterior: "السابق",
    siguiente: "التالي",
    hoy: "اليوم",
    finSemana: "عطلة نهاية الأسبوع",
    sinActividades: "لا توجد أنشطة",
    leyenda: "الوسم:",
    cosecha: "حصاد",
    taller: "ورشة عمل",
    visita: "زيارة",
    degustacion: "تذوق",
    educacion: "تعليمي",
    familiar: "عائلي",
    completo: "مكتمل",
    seleccionaFecha: "اختر تاريخًا متاحًا واحجز نشاطك",
    verTodasActividades: "عرض جميع الأنشطة المتاحة",
    fechaSeleccionada: "التاريخ المحدد:",
    sinSeleccion: "لم يتم تحديد تاريخ",
    limpiarSeleccion: "مسح التحديد",
    cargando: "جاري تحميل بيانات التقويم...",
    errorCargando: "خطأ في تحميل التقويم",
    horario: "الوقت",
  },
  fr: {
    diasSemana: ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"],
    nombresMeses: [
      "Janvier",
      "Février",
      "Mars",
      "Avril",
      "Mai",
      "Juin",
      "Juillet",
      "Août",
      "Septembre",
      "Octobre",
      "Novembre",
      "Décembre",
    ],
    anterior: "Précédent",
    siguiente: "Suivant",
    hoy: "Aujourd'hui",
    finSemana: "Week-end",
    sinActividades: "Pas d'activités",
    leyenda: "Légende:",
    cosecha: "Récolte",
    taller: "Atelier",
    visita: "Visite",
    degustacion: "Dégustation",
    educacion: "Éducation",
    familiar: "Familial",
    completo: "Complet",
    seleccionaFecha:
      "Sélectionnez une date disponible et réservez votre activité",
    verTodasActividades: "Voir toutes les activités disponibles",
    fechaSeleccionada: "Date sélectionnée:",
    sinSeleccion: "Aucune date sélectionnée",
    limpiarSeleccion: "Effacer la sélection",
    cargando: "Chargement des données du calendrier...",
    errorCargando: "Erreur de chargement du calendrier",
    horario: "Horaire",
  },
};

export default function Calendario() {
  const { language } = useLanguage();
  const t = textos[language];

  // Estado inicial: mes actual
  const [mesActual, setMesActual] = useState(new Date().getMonth() + 1);
  const [anioActual, setAnioActual] = useState(new Date().getFullYear());
  const [fechaSeleccionada, setFechaSeleccionada] = useState(null);
  const [actividadesCalendario, setActividadesCalendario] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  // Fetch actividades del calendario cuando cambia el mes/año
  useEffect(() => {
    const fetchActividadesCalendario = async () => {
      try {
        setCargando(true);
        setError(null);

        const response = await fetch(
          `/api/calendar?month=${mesActual}&year=${anioActual}`,
        );

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.success && data.activitiesByDate) {
          // Transformar datos de la API al formato esperado por el componente
          const actividadesTransformadas = [];

          Object.keys(data.activitiesByDate).forEach((fecha) => {
            data.activitiesByDate[fecha].forEach((item) => {
              actividadesTransformadas.push({
                fecha: fecha, // YYYY-MM-DD
                titulo: item.titulo,
                tipo: item.tipo,
                lleno: item.lleno || false,
                enlace: item.enlace || `/activities?date=${fecha}`,
                color: item.color || "#3b82f6",
                ubicacion: item.ubicacion,
                cuposDisponibles: item.cuposDisponibles,
                // NUEVOS CAMPOS PARA HORARIOS
                horario: item.horario || "", // Formato: "HH:MM - HH:MM"
                horaInicio: item.horaInicio || "09:00",
                horaFin: item.horaFin || "12:00",
              });
            });
          });

          setActividadesCalendario(actividadesTransformadas);
        } else {
          setActividadesCalendario([]);
        }
      } catch (err) {
        console.error("Error fetching calendar data:", err);
        setError(err.message);
        setActividadesCalendario([]);
      } finally {
        setCargando(false);
      }
    };

    fetchActividadesCalendario();
  }, [mesActual, anioActual]);

  const getDiasMes = (mes, anio) => {
    const primerDia = new Date(anio, mes - 1, 1);
    const ultimoDia = new Date(anio, mes, 0);
    const diasEnMes = ultimoDia.getDate();

    const dias = [];
    const primerDiaSemana = (primerDia.getDay() + 6) % 7; // Ajuste para que lunes sea 0

    // Días vacíos al inicio
    for (let i = 0; i < primerDiaSemana; i++) {
      dias.push(null);
    }

    // Días del mes
    for (let i = 1; i <= diasEnMes; i++) {
      dias.push(new Date(anio, mes - 1, i));
    }

    return dias;
  };

  const dias = getDiasMes(mesActual, anioActual);

  const getActividadesDia = (fecha) => {
    if (!fecha) return [];
    const fechaStr = fecha.toISOString().split("T")[0];
    return actividadesCalendario.filter((act) => act.fecha === fechaStr);
  };

  const getColorTipo = (tipo) => {
    switch (tipo) {
      case "cosecha":
        return "#10b981"; // green
      case "taller":
        return "#f59e0b"; // yellow
      case "visita":
        return "#3b82f6"; // blue
      case "degustacion":
        return "#8b5cf6"; // purple
      case "educacion":
        return "#ec4899"; // pink
      case "familiar":
        return "#f97316"; // orange
      default:
        return "#6b7280"; // gray
    }
  };

  const cambiarMes = (incremento) => {
    let nuevoMes = mesActual + incremento;
    let nuevoAnio = anioActual;

    if (nuevoMes > 12) {
      nuevoMes = 1;
      nuevoAnio += 1;
    } else if (nuevoMes < 1) {
      nuevoMes = 12;
      nuevoAnio -= 1;
    }

    setMesActual(nuevoMes);
    setAnioActual(nuevoAnio);
    setFechaSeleccionada(null); // Limpiar selección al cambiar mes
  };

  const getText = (obj) => {
    if (typeof obj === "object" && obj !== null) {
      return obj[language] || obj.ar || obj.fr || "";
    }
    return obj;
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "";
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return fecha.toLocaleDateString(
      language === "ar" ? "ar-EG" : "fr-FR",
      options,
    );
  };

  // Función para formatear hora en formato más legible
  const formatearHora = (hora) => {
    if (!hora) return "";
    // Si ya está en formato HH:MM, devolverlo tal cual
    if (hora.includes(":")) {
      return hora;
    }
    return hora;
  };

  // Función para obtener horario formateado
  const getHorarioFormateado = (actividad) => {
    if (actividad.horario) {
      return actividad.horario;
    }
    if (actividad.horaInicio && actividad.horaFin) {
      return `${formatearHora(actividad.horaInicio)} - ${formatearHora(
        actividad.horaFin,
      )}`;
    }
    return "";
  };

  const manejarClickDia = (fecha) => {
    if (!fecha) return;

    // Si ya está seleccionada, la deseleccionamos
    if (fechaSeleccionada && fechaSeleccionada.getTime() === fecha.getTime()) {
      setFechaSeleccionada(null);
    } else {
      setFechaSeleccionada(fecha);
    }
  };

  const limpiarSeleccion = () => {
    setFechaSeleccionada(null);
  };

  return (
    <div
      className="bg-white rounded-2xl shadow-lg p-6"
      dir={language === "ar" ? "rtl" : "ltr"}
    >
      {/* Estado de carga/error */}
      {cargando && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-blue-700">{t.cargando}</p>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
          <p className="text-red-700 font-semibold">{t.errorCargando}</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Controles del calendario */}
      <div className="flex justify-between items-center mb-8">
        <button
          onClick={() => cambiarMes(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg flex items-center gap-2"
          disabled={cargando}
        >
          {language === "ar" ? "→" : "←"} <span>{t.anterior}</span>
        </button>

        <h3 className="text-2xl font-bold text-gray-800">
          {t.nombresMeses[mesActual - 1]} {anioActual}
        </h3>

        <button
          onClick={() => cambiarMes(1)}
          className="p-2 hover:bg-gray-100 rounded-lg flex items-center gap-2"
          disabled={cargando}
        >
          <span>{t.siguiente}</span> {language === "ar" ? "←" : "→"}
        </button>
      </div>

      {/* Indicador de fecha seleccionada */}
      {fechaSeleccionada && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium text-blue-800 mb-1">
                {t.fechaSeleccionada}
              </p>
              <p className="text-lg font-bold text-blue-900">
                {formatearFecha(fechaSeleccionada)}
              </p>
              {/* Mostrar actividades para la fecha seleccionada */}
              {getActividadesDia(fechaSeleccionada).length > 0 && (
                <div className="mt-3 space-y-3">
                  <p className="text-sm font-medium text-blue-700">
                    {getActividadesDia(fechaSeleccionada).length}{" "}
                    {language === "ar"
                      ? "أنشطة متاحة"
                      : "activités disponibles"}
                  </p>
                  {getActividadesDia(fechaSeleccionada)
                    .slice(0, 3)
                    .map((act, idx) => {
                      const horario = getHorarioFormateado(act);
                      return (
                        <div
                          key={idx}
                          className="text-sm p-3 bg-white rounded-lg border border-gray-200"
                        >
                          <div className="flex items-center mb-2">
                            <div
                              className="w-3 h-3 rounded-full mr-2 flex-shrink-0"
                              style={{ backgroundColor: act.color }}
                            ></div>
                            <span className="font-medium truncate">
                              {getText(act.titulo)}
                            </span>
                          </div>
                          {/* Mostrar horario si está disponible */}
                          {horario && (
                            <div className="flex items-center text-xs text-gray-600 mt-1">
                              <span className="text-gray-500 mr-1">🕐</span>
                              <span>{horario}</span>
                            </div>
                          )}
                          {/* Mostrar ubicación si está disponible */}
                          {act.ubicacion && (
                            <div className="flex items-center text-xs text-gray-600 mt-1">
                              <span className="text-gray-500 mr-1">📍</span>
                              <span className="truncate">{act.ubicacion}</span>
                            </div>
                          )}
                          {/* Mostrar disponibilidad */}
                          <div className="flex items-center text-xs mt-2">
                            <span
                              className={`px-2 py-1 rounded ${
                                act.lleno
                                  ? "bg-red-100 text-red-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {act.lleno
                                ? t.completo
                                : `${act.cuposDisponibles || 0} ${
                                    language === "ar" ? "مقاعد متاحة" : "places"
                                  }`}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
            <button
              onClick={limpiarSeleccion}
              className="px-4 py-2 text-sm bg-white border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 flex-shrink-0 ml-4"
            >
              {t.limpiarSeleccion}
            </button>
          </div>
        </div>
      )}

      {/* Días de la semana */}
      <div className="grid grid-cols-7 gap-2 mb-4">
        {t.diasSemana.map((dia) => (
          <div key={dia} className="text-center font-bold text-gray-600 py-2">
            {dia}
          </div>
        ))}
      </div>

      {/* Días del mes */}
      <div className="grid grid-cols-7 gap-2">
        {dias.map((fecha, index) => {
          const actividades = fecha ? getActividadesDia(fecha) : [];
          const hoy = new Date();
          const esHoy =
            fecha &&
            fecha.getDate() === hoy.getDate() &&
            fecha.getMonth() === hoy.getMonth() &&
            fecha.getFullYear() === hoy.getFullYear();

          const esSeleccionada =
            fecha &&
            fechaSeleccionada &&
            fecha.getTime() === fechaSeleccionada.getTime();

          return (
            <button
              key={index}
              onClick={() => manejarClickDia(fecha)}
              disabled={!fecha || cargando}
              className={`min-h-36 border rounded-lg p-2 text-left transition-all flex flex-col ${
                fecha
                  ? esSeleccionada
                    ? "bg-blue-100 border-blue-500 hover:bg-blue-200"
                    : "bg-white hover:bg-gray-50"
                  : "bg-gray-50"
              } ${esHoy ? "border-2 border-green-600" : "border-gray-200"} ${
                !fecha || cargando ? "cursor-default" : "cursor-pointer"
              }`}
            >
              {fecha && (
                <>
                  <div
                    className={`text-right font-bold mb-2 ${
                      esHoy
                        ? "text-green-600"
                        : esSeleccionada
                          ? "text-blue-600"
                          : "text-gray-700"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span>{fecha.getDate()}</span>
                      {esHoy && (
                        <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">
                          {t.hoy}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actividades del día */}
                  <div className="space-y-1 flex-grow">
                    {actividades.slice(0, 3).map((act, idx) => {
                      const titulo = getText(act.titulo);
                      const horario = getHorarioFormateado(act);

                      return (
                        <div
                          key={idx}
                          className={`text-xs p-1 rounded ${
                            act.lleno
                              ? "bg-gray-200 text-gray-600"
                              : "bg-green-50 text-green-800"
                          }`}
                          title={`${titulo}${horario ? ` (${horario})` : ""}`}
                        >
                          <div className="flex items-center">
                            <div
                              className="w-2 h-2 rounded-full mr-1 flex-shrink-0"
                              style={{ backgroundColor: act.color }}
                            ></div>
                            <div className="flex-grow min-w-0">
                              <div className="truncate font-medium">
                                {titulo.split(" ")[0]}
                              </div>
                              {/* Mostrar horario en pequeñito */}
                              {horario && (
                                <div className="text-[10px] text-gray-600 truncate mt-0.5">
                                  🕐 {horario}
                                </div>
                              )}
                            </div>
                            {act.lleno && (
                              <span className="text-xs text-red-600 flex-shrink-0 ml-1">
                                ✗
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {actividades.length === 0 && (
                      <div className="text-xs text-gray-400 text-center py-4">
                        {t.sinActividades}
                      </div>
                    )}

                    {actividades.length > 3 && (
                      <div className="text-xs text-blue-600 text-center py-1">
                        +{actividades.length - 3}{" "}
                        {language === "ar" ? "المزيد" : "plus"}
                      </div>
                    )}

                    {(fecha.getDay() === 0 || fecha.getDay() === 6) && (
                      <div className="text-xs text-blue-600 text-center py-2 mt-1">
                        {t.finSemana}
                      </div>
                    )}
                  </div>
                </>
              )}
            </button>
          );
        })}
      </div>

      {/* Leyenda */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <h4 className="font-bold text-gray-700 mb-4">{t.leyenda}</h4>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span className="text-sm">{t.cosecha}</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
            <span className="text-sm">{t.taller}</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
            <span className="text-sm">{t.visita}</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
            <span className="text-sm">{t.degustacion}</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-pink-500 rounded-full mr-2"></div>
            <span className="text-sm">{t.educacion}</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
            <span className="text-sm">{t.familiar}</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-gray-300 rounded-full mr-2"></div>
            <span className="text-sm">{t.completo}</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-100 border-2 border-blue-500 rounded-full mr-2"></div>
            <span className="text-sm">
              {language === "ar" ? "محدد" : "Sélectionné"}
            </span>
          </div>
          {/* Nueva leyenda para horario */}
          <div className="flex items-center">
            <div className="w-3 h-3 flex items-center justify-center mr-2">
              <span className="text-xs">🕐</span>
            </div>
            <span className="text-sm">{t.horario}</span>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-8 text-center">
        <p className="text-gray-600 mb-4">
          {fechaSeleccionada
            ? `${t.seleccionaFecha} (${formatearFecha(fechaSeleccionada)})`
            : t.seleccionaFecha}
        </p>
        <Link
          href="/activities"
          className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-800 transition"
        >
          {t.verTodasActividades}
        </Link>
      </div>
    </div>
  );
}
