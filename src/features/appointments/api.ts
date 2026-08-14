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
};

export async function fetchBusiness(): Promise<{
  business: Business;
  services: Service[];
}> {
  const url = `${API_BASE_URL}/appointments/business`;
  console.log("Llamando a:", url);

  const res = await fetch(url);
  const text = await res.text();
  console.log("Status:", res.status, "Body:", text);

  if (!res.ok) {
    throw new Error(`Status ${res.status}: ${text}`);
  }

  return JSON.parse(text);
}
