// components/Calendario.jsx - COMPLETAMENTE RESPONSIVE
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
    finSemana: "عطلة",
    sinActividades: "لا توجد",
    leyenda: "الأنشطة:",
    cosecha: "حصاد",
    taller: "ورشة",
    visita: "زيارة",
    degustacion: "تذوق",
    educacion: "تعليمي",
    familiar: "عائلي",
    completo: "مكتمل",
    seleccionaFecha: "اختر تاريخًا واحجز",
    verTodasActividades: "عرض الأنشطة",
    fechaSeleccionada: "التاريخ:",
    sinSeleccion: "لم يتم تحديد",
    limpiarSeleccion: "مسح",
    cargando: "جاري التحميل...",
    errorCargando: "خطأ",
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
    anterior: "Préc.",
    siguiente: "Suiv.",
    hoy: "Auj.",
    finSemana: "Week-end",
    sinActividades: "Aucune",
    leyenda: "Activités:",
    cosecha: "Récolte",
    taller: "Atelier",
    visita: "Visite",
    degustacion: "Dégust.",
    educacion: "Éduc.",
    familiar: "Famille",
    completo: "Complet",
    seleccionaFecha: "Choisissez une date",
    verTodasActividades: "Voir activités",
    fechaSeleccionada: "Date:",
    sinSeleccion: "Aucune date",
    limpiarSeleccion: "Effacer",
    cargando: "Chargement...",
    errorCargando: "Erreur",
    horario: "Horaire",
  },
};

export default function Calendario() {
  const { language } = useLanguage();
  const t = textos[language];

  const [mesActual, setMesActual] = useState(new Date().getMonth() + 1);
  const [anioActual, setAnioActual] = useState(new Date().getFullYear());
  const [fechaSeleccionada, setFechaSeleccionada] = useState(null);
  const [actividadesCalendario, setActividadesCalendario] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

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
          const actividadesTransformadas = [];

          Object.keys(data.activitiesByDate).forEach((fecha) => {
            data.activitiesByDate[fecha].forEach((item) => {
              actividadesTransformadas.push({
                fecha: fecha,
                titulo: item.titulo,
                tipo: item.tipo,
                lleno: item.lleno || false,
                enlace: item.enlace || `/activities?date=${fecha}`,
                color: item.color || "#3b82f6",
                ubicacion: item.ubicacion,
                cuposDisponibles: item.cuposDisponibles,
                horario: item.horario || "",
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
    const primerDiaSemana = (primerDia.getDay() + 6) % 7;

    for (let i = 0; i < primerDiaSemana; i++) {
      dias.push(null);
    }

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
        return "#10b981";
      case "taller":
        return "#f59e0b";
      case "visita":
        return "#3b82f6";
      case "degustacion":
        return "#8b5cf6";
      case "educacion":
        return "#ec4899";
      case "familiar":
        return "#f97316";
      default:
        return "#6b7280";
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
    setFechaSeleccionada(null);
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
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    return fecha.toLocaleDateString(
      language === "ar" ? "ar-EG" : "fr-FR",
      options,
    );
  };

  const formatearHora = (hora) => {
    if (!hora) return "";
    if (hora.includes(":")) return hora;
    return hora;
  };

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
      className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6"
      dir={language === "ar" ? "rtl" : "ltr"}
    >
      {/* Estado de carga/error */}
      {cargando && (
        <div className="mb-4 md:mb-6 p-3 md:p-4 bg-blue-50 rounded-lg text-center">
          <div className="animate-spin rounded-full h-6 md:h-8 w-6 md:w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm md:text-base text-blue-700">
            {t.cargando}
          </p>
        </div>
      )}

      {error && (
        <div className="mb-4 md:mb-6 p-3 md:p-4 bg-red-50 rounded-lg border border-red-200">
          <p className="text-red-700 font-semibold text-sm md:text-base">
            {t.errorCargando}
          </p>
          <p className="text-red-600 text-xs md:text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Controles del calendario - RESPONSIVE */}
      <div className="flex justify-between items-center mb-6 md:mb-8">
        <button
          onClick={() => cambiarMes(-1)}
          className="p-1.5 md:p-2 hover:bg-gray-100 rounded-lg flex items-center gap-1 md:gap-2 text-sm md:text-base"
          disabled={cargando}
        >
          <span className="text-lg md:text-xl">
            {language === "ar" ? "→" : "←"}
          </span>
          <span className="hidden xs:inline">{t.anterior}</span>
        </button>

        <h3 className="text-base md:text-xl lg:text-2xl font-bold text-gray-800 text-center px-1 md:px-2">
          {t.nombresMeses[mesActual - 1]} {anioActual}
        </h3>

        <button
          onClick={() => cambiarMes(1)}
          className="p-1.5 md:p-2 hover:bg-gray-100 rounded-lg flex items-center gap-1 md:gap-2 text-sm md:text-base"
          disabled={cargando}
        >
          <span className="hidden xs:inline">{t.siguiente}</span>
          <span className="text-lg md:text-xl">
            {language === "ar" ? "←" : "→"}
          </span>
        </button>
      </div>

      {/* Panel de fecha seleccionada - RESPONSIVE */}
      {fechaSeleccionada && (
        <div className="mb-4 md:mb-6 p-3 md:p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex-grow">
              <div className="flex items-center mb-2">
                <h4 className="font-medium text-blue-800 text-sm md:text-base mr-2">
                  {t.fechaSeleccionada}
                </h4>
                <p className="text-base md:text-lg font-bold text-blue-900">
                  {formatearFecha(fechaSeleccionada)}
                </p>
              </div>

              {getActividadesDia(fechaSeleccionada).length > 0 && (
                <div className="space-y-2 mt-3">
                  {getActividadesDia(fechaSeleccionada).map((act, idx) => {
                    const horario = getHorarioFormateado(act);
                    return (
                      <Link
                        key={idx}
                        href={act.enlace}
                        className="block text-sm p-2 md:p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition"
                      >
                        <div className="flex items-start">
                          <div
                            className="w-2 h-2 md:w-3 md:h-3 rounded-full mt-1 mr-2 flex-shrink-0"
                            style={{ backgroundColor: act.color }}
                          ></div>
                          <div className="flex-grow min-w-0">
                            <div className="font-medium truncate">
                              {getText(act.titulo)}
                            </div>
                            {horario && (
                              <div className="flex items-center text-xs text-gray-600 mt-1">
                                <span className="text-gray-500 mr-1">🕐</span>
                                <span>{horario}</span>
                              </div>
                            )}
                            {act.ubicacion && (
                              <div className="flex items-center text-xs text-gray-600 mt-1">
                                <span className="text-gray-500 mr-1">📍</span>
                                <span className="truncate">
                                  {act.ubicacion}
                                </span>
                              </div>
                            )}
                            <div className="mt-2">
                              <span
                                className={`text-xs px-2 py-1 rounded ${
                                  act.lleno
                                    ? "bg-red-100 text-red-800"
                                    : "bg-green-100 text-green-800"
                                }`}
                              >
                                {act.lleno
                                  ? t.completo
                                  : `${act.cuposDisponibles || 0} ${
                                      language === "ar" ? "مقاعد" : "places"
                                    }`}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
            <button
              onClick={limpiarSeleccion}
              className="px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm bg-white border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 flex-shrink-0 self-end sm:self-center"
            >
              {t.limpiarSeleccion}
            </button>
          </div>
        </div>
      )}

      {/* Días de la semana - RESPONSIVE */}
      <div className="grid grid-cols-7 gap-1 md:gap-2 mb-3 md:mb-4">
        {t.diasSemana.map((dia) => (
          <div
            key={dia}
            className="text-center font-bold text-gray-600 py-1 md:py-2 text-xs md:text-sm"
          >
            {dia}
          </div>
        ))}
      </div>

      {/* Grid de días del mes - RESPONSIVE */}
      <div className="grid grid-cols-7 gap-1 md:gap-2">
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
              className={`
                min-h-[60px] sm:min-h-[80px] md:min-h-24 lg:min-h-28 xl:min-h-32
                border rounded-lg p-1 md:p-1.5 lg:p-2
                text-left transition-all flex flex-col
                ${
                  fecha
                    ? esSeleccionada
                      ? "bg-blue-50 border-blue-400 hover:bg-blue-100"
                      : "bg-white border-gray-200 hover:bg-gray-50"
                    : "bg-gray-50"
                }
                ${esHoy ? "border-2 border-green-500" : ""}
                ${!fecha || cargando ? "cursor-default" : "cursor-pointer"}
              `}
            >
              {fecha && (
                <>
                  <div
                    className={`flex justify-between items-start mb-1 ${
                      esHoy
                        ? "text-green-600"
                        : esSeleccionada
                          ? "text-blue-600"
                          : "text-gray-700"
                    }`}
                  >
                    <span className="font-bold text-sm md:text-base">
                      {fecha.getDate()}
                    </span>
                    {esHoy && (
                      <span className="text-[10px] xs:text-xs bg-green-500 text-white px-1 py-0.5 rounded">
                        {t.hoy}
                      </span>
                    )}
                  </div>

                  {/* Actividades - VISIÓN MÓVIL */}
                  <div className="flex-grow md:hidden flex flex-col justify-center">
                    <div className="flex flex-wrap justify-center gap-0.5 mt-1">
                      {actividades.slice(0, 3).map((act, idx) => (
                        <div
                          key={idx}
                          className="w-1.5 h-1.5 rounded-full"
                          style={{
                            backgroundColor: act.lleno ? "#9ca3af" : act.color,
                          }}
                          title={getText(act.titulo)}
                        ></div>
                      ))}
                      {actividades.length > 3 && (
                        <div className="text-[8px] text-blue-600">
                          +{actividades.length - 3}
                        </div>
                      )}
                      {actividades.length === 0 && (
                        <div className="text-[8px] text-gray-400 mt-2">
                          {t.sinActividades}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actividades - VISIÓN DESKTOP */}
                  <div className="hidden md:block space-y-1 flex-grow">
                    {actividades.slice(0, 2).map((act, idx) => {
                      const titulo = getText(act.titulo);
                      const horario = getHorarioFormateado(act);
                      return (
                        <div
                          key={idx}
                          className={`text-[10px] lg:text-xs p-1 rounded truncate ${
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
                              {horario && (
                                <div className="text-[8px] lg:text-[9px] text-gray-600 truncate mt-0.5">
                                  🕐 {horario}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {actividades.length === 0 && (
                      <div className="text-[10px] text-gray-400 text-center py-3 lg:py-4">
                        {t.sinActividades}
                      </div>
                    )}

                    {actividades.length > 2 && (
                      <div className="text-[10px] text-blue-600 text-center py-1">
                        +{actividades.length - 2}{" "}
                        {language === "ar" ? "المزيد" : "plus"}
                      </div>
                    )}

                    {(fecha.getDay() === 0 || fecha.getDay() === 6) && (
                      <div className="text-[10px] text-blue-600 text-center py-1 mt-1">
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

      {/* Leyenda - RESPONSIVE */}
      <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-gray-200">
        <h4 className="font-bold text-gray-700 mb-3 text-sm md:text-base">
          {t.leyenda}
        </h4>
        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:flex md:flex-wrap gap-2 md:gap-3">
          {[
            { key: "cosecha", color: "#10b981" },
            { key: "taller", color: "#f59e0b" },
            { key: "visita", color: "#3b82f6" },
            { key: "degustacion", color: "#8b5cf6" },
            { key: "educacion", color: "#ec4899" },
            { key: "familiar", color: "#f97316" },
            { key: "completo", color: "#9ca3af" },
          ].map((item) => (
            <div
              key={item.key}
              className="flex items-center"
              title={t[item.key]}
            >
              <div
                className="w-3 h-3 rounded-full mr-2 flex-shrink-0"
                style={{ backgroundColor: item.color }}
              ></div>
              <span className="text-xs md:text-sm truncate">{t[item.key]}</span>
            </div>
          ))}
          <div className="flex items-center" title={t.horario}>
            <div className="w-3 h-3 flex items-center justify-center mr-2">
              <span className="text-xs">🕐</span>
            </div>
            <span className="text-xs md:text-sm truncate">{t.horario}</span>
          </div>
        </div>
      </div>

      {/* CTA - RESPONSIVE */}
      <div className="mt-6 md:mt-8 text-center">
        <p className="text-gray-600 mb-4 text-sm md:text-base px-2">
          {t.seleccionaFecha}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/activities"
            className="inline-block bg-green-600 text-white px-5 py-2.5 md:px-7 md:py-3 rounded-lg font-semibold hover:bg-green-800 transition text-sm md:text-base text-center"
          >
            {t.verTodasActividades}
          </Link>
          {fechaSeleccionada && (
            <Link
              href={`/reservation?date=${fechaSeleccionada.toISOString().split("T")[0]}`}
              className="inline-block bg-blue-600 text-white px-5 py-2.5 md:px-7 md:py-3 rounded-lg font-semibold hover:bg-blue-800 transition text-sm md:text-base text-center"
            >
              {language === "ar" ? "احجز الآن" : "Réserver"}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
