export type DisplayStatus = {
  label: string;
  color: string;
};

export function getDisplayStatus(
  date: string,
  startTime: string,
  endTime: string,
  status: string,
): DisplayStatus {
  if (status === "CANCELLED") return { label: "Cancelada", color: "#DC2626" };
  if (status === "PENDING_APPROVAL")
    return { label: "Pendiente", color: "#F59E0B" };
  if (status === "NO_SHOW") return { label: "No asistió", color: "#6B7280" };

  // A partir de acá, la reserva está CONFIRMED (o ya marcada COMPLETED):
  // calculamos si ya empezó, ya terminó, o todavía no.
  const now = new Date();
  const start = new Date(`${date}T${startTime}:00`);
  const end = new Date(`${date}T${endTime}:00`);

  if (status === "COMPLETED" || now >= end) {
    return { label: "Completada", color: "#059669" };
  }
  if (now >= start && now < end) {
    return { label: "En proceso", color: "#7C3AED" };
  }
  return { label: "Confirmada", color: "#2563EB" };
}
