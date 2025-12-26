export interface Booking {
  id?: string;
  userId?: string;
  name: string;
  phone: string;
  email?: string;
  service: string;
  date: string;
  slot: string;
  address: string;
  notes?: string;
  status: "pending" | "confirmed" | "in-progress" | "completed" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

export interface BookingFormData {
  name: string;
  phone: string;
  email?: string;
  service: string;
  date: string;
  slot: string;
  address: string;
  notes?: string;
}
