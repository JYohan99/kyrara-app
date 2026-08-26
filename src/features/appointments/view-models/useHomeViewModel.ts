import {
  formatFullDateLabel,
  getTodayDateString,
  getTimeRemainingText,
} from "@/core/utils/date";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { completeAppointment, fetchBusiness, listAppointments } from "../api";
import { Appointment, Business, getDisplayStatus, Service } from "../models";

export function useHomeViewModel() {
  const [business, setBusiness] = useState<Business | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [activeAppointment, setActiveAppointment] = useState<Appointment | null>(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  const todayStr = getTodayDateString();
  const todayDateLabel = formatFullDateLabel(todayStr);

  const load = useCallback(() => {
    const today = getTodayDateString();
    Promise.all([
      fetchBusiness(),
      listAppointments(today).catch(() => [] as Appointment[]),
    ])
      .then(([businessData, appointments]) => {
        setBusiness(businessData.business);
        setServices(businessData.services);
        setTodayAppointments(appointments);

        // Filtrar citas pendientes / en curso (no canceladas, no no_show, no completadas)
        const pendingAppointments = appointments.filter(
          (a) =>
            a.status !== "CANCELLED" &&
            a.status !== "NO_SHOW" &&
            a.status !== "COMPLETED",
        );

        const now = new Date();
        // 1. Buscar cita en curso
        const current = pendingAppointments.find((a) => {
          const start = new Date(`${a.date}T${a.start_time}:00`);
          const end = new Date(`${a.date}T${a.end_time}:00`);
          return now >= start && now < end;
        });

        if (current) {
          setActiveAppointment(current);
          setUpcomingAppointments(
            pendingAppointments.filter(
              (a) => a.id !== current.id && a.start_time >= current.start_time,
            ),
          );
        } else {
          // 2. Si no hay cita en curso en este momento, tomar la próxima más cercana
          const nextUpcoming =
            pendingAppointments.find((a) => {
              const end = new Date(`${a.date}T${a.end_time}:00`);
              return now < end;
            }) || pendingAppointments[0];

          if (nextUpcoming) {
            setActiveAppointment(nextUpcoming);
            setUpcomingAppointments(
              pendingAppointments.filter(
                (a) => a.id !== nextUpcoming.id && a.start_time >= nextUpcoming.start_time,
              ),
            );
          } else {
            setActiveAppointment(null);
            setUpcomingAppointments([]);
          }
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleCompleteAppointment = useCallback(
    async (appointment: Appointment) => {
      Alert.alert(
        "Finalizar Servicio",
        `¿Deseas marcar como completado el servicio de ${appointment.customer_name || "este cliente"}?`,
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Finalizar",
            style: "default",
            onPress: async () => {
              try {
                setCompleting(true);
                await completeAppointment(appointment.id);
                // Actualizar inmediatamente estado local para avanzar a la próxima cita
                setTodayAppointments((prev) =>
                  prev.map((a) =>
                    a.id === appointment.id ? { ...a, status: "COMPLETED" } : a,
                  ),
                );
                load();
              } catch (e: any) {
                Alert.alert("Error", e.message || "No se pudo finalizar el servicio");
              } finally {
                setCompleting(false);
              }
            },
          },
        ],
      );
    },
    [load],
  );

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return {
    business,
    services,
    todayAppointments,
    activeAppointment,
    upcomingAppointments,
    todayDateLabel,
    todayCount: todayAppointments.filter((a) => a.status !== "CANCELLED").length,
    error,
    loading,
    completing,
    refresh: load,
    handleCompleteAppointment,
    getDisplayStatus,
    getTimeRemainingText,
  };
}
