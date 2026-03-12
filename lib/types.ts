export type Client = {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  created_at: string;
};

export type Section = {
  id: string;
  client_id: string;
  user_id: string;
  title: string;
  created_at: string;
};

export type Entry = {
  id: string;
  section_id: string;
  user_id: string;
  title: string;
  unit_type: string;
  unit_count: number;
  billable_units: number;
  rate_per_unit: number | null;
  currency: string | null;
  notes: string | null;
  reference_url: string | null;
  status: "pending" | "paid";
  created_at: string;
};

export type ShareLink = {
  id: string;
  client_id: string;
  user_id: string;
  token: string;
  is_active: boolean;
  show_notes: boolean;
  show_references: boolean;
  show_rates: boolean;
  show_status: boolean;
  created_at: string;
};
