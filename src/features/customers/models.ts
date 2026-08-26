export type Customer = {
  id: string;
  name: string | null;
  phone: string;
  notes: string | null;
};

export type CustomerAppointmentHistory = {
  id: string;
  date: string;
  start_time: string;
  status: string;
  service_name: string;
};

export type CustomerWithHistory = Customer & {
  appointments: CustomerAppointmentHistory[];
};
