export interface Property {
  id: string;
  title: string;
  type: string;
  category: string;
  location: string;
  area_buildup?: string;
  area_carpet?: string;
  floor?: string;
  total_floors?: string;
  construction_age?: string;
  price: string;
  price_negotiable?: boolean;
  description?: string;
  features?: string;
  contact_name?: string;
  contact_phone?: string;
  office_phone?: string;
  photos?: string[];
  is_featured?: boolean;
  status?: string;
  created_at?: string;
  agency?: "kushal" | "bhoomi";
}

export interface AgencyInfo {
  label: string;
  whatsapp: string;
}

export const AGENCIES: Record<"kushal" | "bhoomi", AgencyInfo> = {
  kushal: { label: "Kushal Enterprises", whatsapp: "919326313320" },
  bhoomi: { label: "Bhoomi Realty", whatsapp: "918424872525" },
};

/** Every property has an agency; anything missing/unrecognized falls back to Kushal Enterprises. */
export function getAgency(agency: string | null | undefined): AgencyInfo {
  return AGENCIES[agency as "kushal" | "bhoomi"] ?? AGENCIES.kushal;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  phone?: string;
  photo_url?: string;
  display_order?: number;
}

export const WHATSAPP_NUMBER = "919029847968";
export const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}`;

export const CONTACT = {
  name: "Anil Chandrakant Patil",
  phones: ["9029847968", "9326313320", "8424872525"],
  emails: ["kushalenterprises@gmail.com", "anilpatil_30@yahoo.com"],
  address:
    "Shop No. 5, Thakursingh Smruti Dham, Behind Domino's, Vithal Mandir Road, Kharigaon Kalwa, Thane - 400605",
  rera: "A51700014818",
  hoursMorning: "9:00 AM – 3:00 PM",
  hoursEvening: "2:00 PM – 9:00 PM",
};

export const SAMPLE_PROPERTIES: Property[] = [
  {
    id: "sample-1",
    title: "2 BHK Flat For Sale in Dhokali, Balkum Naka, Thane",
    type: "Residential",
    category: "Sale",
    location: "Nr Highland Park, Dhokali, Thane",
    area_buildup: "1000 sqft",
    area_carpet: "652 sqft",
    floor: "22nd",
    total_floors: "30",
    construction_age: "3 years old",
    price: "₹1.45 Crore",
    price_negotiable: true,
    description:
      "Spacious 2 BHK flat available for sale in the prime location of Dhokali near Highland Park. This well-maintained flat on the 22nd floor offers stunning views and premium amenities. Perfect for families looking for a comfortable home in Thane.",
    features:
      "Prime Location, Fully Furnished, 24hrs Water Supply, Complex with Security, Lift with Backup, Gym, Club House, Swimming Pool, Clear Title",
    contact_name: "Anil",
    contact_phone: "9029847968",
    office_phone: "9326313320",
    photos: [],
    is_featured: true,
    status: "Active",
    agency: "kushal",
  },
  {
    id: "sample-2",
    title: "Commercial Shop For Rent, Kharigaon Kalwa",
    type: "Commercial",
    category: "Rent",
    location: "Kharigaon, Kalwa, Thane",
    area_buildup: "450 sqft",
    area_carpet: "400 sqft",
    floor: "Ground",
    total_floors: "7",
    construction_age: "5 years old",
    price: "₹35,000 / month",
    price_negotiable: true,
    description:
      "Well-located ground floor commercial shop ideal for retail or office use in a busy market area of Kharigaon, Kalwa.",
    features: "Prime Location, Main Road Facing, High Footfall, Clear Title",
    contact_name: "Anil",
    contact_phone: "9029847968",
    office_phone: "9326313320",
    photos: [],
    is_featured: true,
    status: "Active",
    agency: "kushal",
  },
  {
    id: "sample-3",
    title: "Open Plot For Sale, Thane Outskirts",
    type: "Plot",
    category: "Sale",
    location: "Thane",
    area_buildup: "2000 sqft",
    area_carpet: "2000 sqft",
    price: "₹85 Lakh",
    price_negotiable: false,
    description:
      "Clear-title investment plot with high future returns located on the outskirts of Thane.",
    features: "Clear Title, Investment Opportunity, Good Connectivity",
    contact_name: "Anil",
    contact_phone: "9029847968",
    office_phone: "9326313320",
    photos: [],
    is_featured: true,
    status: "Active",
    agency: "kushal",
  },
];

export const SAMPLE_TEAM: TeamMember[] = [
  { id: "t1", name: "Anil Chandrakant Patil", role: "Founder & Consultant", phone: "9029847968", display_order: 0 },
  { id: "t2", name: "Ganesh Rathod", role: "Junior Executive", phone: "8424872525", display_order: 1 },
  { id: "t3", name: "Vaibhav Patil", role: "Senior Executive", phone: "9970548582", display_order: 2 },
  { id: "t4", name: "Akshata Ghanekar", role: "Senior Executive", phone: "9326313320", display_order: 3 },
  { id: "t5", name: "Kushal More", role: "Junior Executive", phone: "9137201473", display_order: 4 },
  { id: "t6", name: "Rohit Gadve", role: "Junior Executive", phone: "7021162127", display_order: 5 },
];

export const SERVICES = [
  { icon: "🏠", title: "Residential Sales", desc: "Affordable and premium flats, apartments, and villas tailored to your family's needs." },
  { icon: "🏢", title: "Commercial Spaces", desc: "Ideally located shops, offices, and spaces to grow your business." },
  { icon: "🌿", title: "Open Plots & Land", desc: "Clear-title investment plots with high future returns." },
  { icon: "📋", title: "Legal Documentation", desc: "Comprehensive support for legal documentation and property verification." },
  { icon: "🏦", title: "Home Loan Assistance", desc: "Tie-ups with SBI, HDFC, ICICI, LIC for hassle-free home loans." },
  { icon: "📝", title: "Online Rent Agreement", desc: "Quick and legal online rent agreements done within a day." },
];

export const WHY_CHOOSE = [
  { icon: "✅", title: "100% Verified Properties", desc: "We only deal in legally clear and RERA-approved properties." },
  { icon: "🎯", title: "Customer-Centric Approach", desc: "Your budget and preferences are our top priorities." },
  { icon: "💡", title: "Expert Guidance", desc: "Honest advice based on deep market analysis to maximize your investment value." },
];

export const TESTIMONIALS = [
  { text: "Kushal Enterprises helped us find our dream flat in Kalwa. Honest pricing, smooth paperwork and complete support throughout.", name: "Suresh Kulkarni" },
  { text: "Anil sir made selling our old home stress-free. We got the right buyer in just three weeks. Highly recommended.", name: "Priya Deshmukh" },
  { text: "I took a home loan through their tie-up with SBI. The whole process was transparent and quick.", name: "Ramesh Joshi" },
  { text: "Found a great 1BHK on rent near my office. Online rent agreement was done within a day. Very professional team.", name: "Neha Sharma" },
  { text: "Bought a shop in Kharigaon. The team explained every clause clearly. Felt like family rather than a broker.", name: "Mahesh Pawar" },
  { text: "We compared many consultants — only Kushal Enterprises gave us the right valuation for our resale flat.", name: "Anjali Naik" },
];