// Site-wide settings that can be edited from admin panel

export interface SiteSettings {
  // Contact Information
  phone: string;
  phoneDisplay: string;
  email: string;
  whatsappNumber: string;
  
  // Address
  address: string;
  city: string;
  state: string;
  country: string;
  
  // Operating Hours
  weekdayHours: string;
  weekendHours: string;
  operatingDays: string;
  
  // Social Links
  facebookUrl: string;
  instagramUrl: string;
  twitterUrl: string;
  whatsappUrl: string;
  
  // Business Info
  businessName: string;
  tagline: string;
}

export const defaultSettings: SiteSettings = {
  // Contact Information
  phone: "+918080808080",
  phoneDisplay: "080-8080-8080",
  email: "hello@drdhobi.in",
  whatsappNumber: "+918080808080",
  
  // Address
  address: "Koramangala",
  city: "Bangalore",
  state: "Karnataka",
  country: "India",
  
  // Operating Hours
  weekdayHours: "8:00 AM - 8:00 PM",
  weekendHours: "10:00 AM - 4:00 PM",
  operatingDays: "Mon - Sat",
  
  // Social Links
  facebookUrl: "https://facebook.com/drdhobi",
  instagramUrl: "https://instagram.com/drdhobi",
  twitterUrl: "https://x.com/drdhobi",
  whatsappUrl: "https://wa.me/918080808080",
  
  // Business Info
  businessName: "Dr Dhobi",
  tagline: "Premium Doorstep Laundry Service",
};
