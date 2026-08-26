import { API_BASE_URL } from "@/config/api";

export type Service = {
  id: string;
  name: string;
  duration_minutes: number;
  price: number | null;
  active: number;
};

export type Business = {
  id: string;
  name: string;
  phone: string;
  address: string;
  booking_mode: "auto" | "approval";
  timezone: string;
  slot_step_minutes: number;
  logo_base64: string | null;
};

export type Appointment = {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
  customer_name: string;
  customer_phone: string;
  service_name: string;
};

export async function fetchBusiness(): Promise<{
  business: Business;
  services: Service[];
}> {
  const url = `${API_BASE_URL}/appointments/business`;
  const res = await fetch(url);
  const text = await res.text();
  if (!res.ok) throw new Error(`Status ${res.status}: ${text}`);
  return JSON.parse(text);
}

export async function listAppointments(date: string): Promise<Appointment[]> {
  const res = await fetch(`${API_BASE_URL}/appointments?date=${date}`);
  if (!res.ok) throw new Error("No se pudo cargar la agenda");
  return res.json();
}

export async function getAvailableSlots(
  date: string,
  serviceId: string,
): Promise<{ slots: string[]; duration_minutes: number }> {
  const res = await fetch(
    `${API_BASE_URL}/appointments/available-slots?date=${date}&service_id=${serviceId}`,
  );
  if (!res.ok)
    throw new Error("No se pudieron cargar los horarios disponibles");
  return res.json();
}

export async function createAppointment(data: {
  customer_id: string;
  service_id: string;
  date: string;
  start_time: string;
}): Promise<Appointment> {
  const res = await fetch(`${API_BASE_URL}/appointments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...data, created_via: "manual" }),
  });
  if (res.status === 409) {
    const body = await res.json();
    throw new Error(body.error || "Ese horario ya no está disponible");
  }
  if (!res.ok) throw new Error("No se pudo crear la reserva");
  return res.json();
}

export async function cancelAppointment(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/appointments/${id}/cancel`, {
    method: "PATCH",
  });
  if (!res.ok) throw new Error("No se pudo cancelar la reserva");
}

export async function updateBusinessSettings(data: {
  slot_step_minutes?: number;
  booking_mode?: "auto" | "approval";
}): Promise<Business> {
  const res = await fetch(`${API_BASE_URL}/appointments/business/settings`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("No se pudo actualizar la configuración");
  return res.json();
}

export async function updateBusiness(data: {
  name?: string;
  phone?: string;
  address?: string;
  logo_base64?: string;
}): Promise<Business> {
  const res = await fetch(`${API_BASE_URL}/appointments/business`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("No se pudo actualizar el negocio");
  return res.json();
}

export async function respondAppointment(
  id: string,
  decision: "accept" | "reject",
) {
  const res = await fetch(`${API_BASE_URL}/appointments/${id}/respond`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ decision }),
  });
  if (!res.ok) throw new Error("No se pudo responder la reserva");
  return res.json();
}
