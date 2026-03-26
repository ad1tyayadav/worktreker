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

export type Invoice = {
  id: string;
  client_id: string;
  user_id: string;
  invoice_number: string;
  title: string;
  from_name: string | null;
  from_email: string | null;
  from_address: string | null;
  to_name: string | null;
  to_email: string | null;
  to_address: string | null;
  issue_date: string;
  due_date: string | null;
  entry_ids: string[];
  notes: string | null;
  payment_info: string | null;
  tax_rate: number;
  discount: number;
  currency: string;
  status: "draft" | "sent" | "paid";
  created_at: string;
};
