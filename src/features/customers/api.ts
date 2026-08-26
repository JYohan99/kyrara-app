import { API_BASE_URL } from "@/config/api";

export type Customer = {
  id: string;
  name: string | null;
  phone: string;
  notes: string | null;
};

export type CustomerWithHistory = Customer & {
  appointments: {
    id: string;
    date: string;
    start_time: string;
    status: string;
    service_name: string;
  }[];
};

export async function listCustomers(search?: string): Promise<Customer[]> {
  const url = search
    ? `${API_BASE_URL}/customers?search=${encodeURIComponent(search)}`
    : `${API_BASE_URL}/customers`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("No se pudieron cargar los clientes");
  return res.json();
}

export async function getCustomer(id: string): Promise<CustomerWithHistory> {
  const res = await fetch(`${API_BASE_URL}/customers/${id}`);
  if (!res.ok) throw new Error("No se pudo cargar el cliente");
  return res.json();
}

export async function createCustomer(data: {
  name?: string;
  phone: string;
  notes?: string;
}): Promise<Customer> {
  const res = await fetch(`${API_BASE_URL}/customers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (res.status === 409)
    throw new Error("Ya existe un cliente con ese teléfono");
  if (!res.ok) throw new Error("No se pudo crear el cliente");
  return res.json();
}

export async function updateCustomer(
  id: string,
  data: { name?: string; phone?: string; notes?: string },
): Promise<Customer> {
  const res = await fetch(`${API_BASE_URL}/customers/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("No se pudo editar el cliente");
  return res.json();
}

export async function deleteCustomer(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/customers/${id}`, {
    method: "DELETE",
  });
  if (!res.ok && res.status !== 204)
    throw new Error("No se pudo eliminar el cliente");
}
