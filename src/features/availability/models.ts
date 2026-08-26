export type AvailabilityBlock = {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  active: number;
};

export type AvailabilityException = {
  id: string;
  date: string;
  closed_all_day: number;
  start_time: string | null;
  end_time: string | null;
  reason: string | null;
};
