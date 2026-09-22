import type { VendorCategory } from "@prisma/client";

export interface VendorSeed {
  name: string;
  category: VendorCategory;
  city: string;
  priceMin: number;
  priceMax: number;
  rating: number;
  reviewCount: number;
  capacityMin?: number;
  capacityMax?: number;
  styleTags: string[];
  services: { name: string; price: number }[];
  reliabilityScore: number;
  avgResponseHours: number;
  pastBookings: number;
  description: string;
  imageEmoji: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  /** Travels to any city nationwide rather than operating from a fixed home base. */
  isPanIndia?: boolean;
}

// All names below are fictional demo vendors created for this MVP — every
// row is also flagged isDemo: true at insert time and surfaced with a
// "Demo Vendor" badge in the UI. None of this represents a real business.
export const vendorSeeds: VendorSeed[] = [
  // ---- Venue ----------------------------------------------------------
  {
    name: "The Ivory Courtyard", category: "VENUE", city: "Mumbai",
    priceMin: 1200000, priceMax: 2200000, rating: 4.7, reviewCount: 186,
    capacityMin: 200, capacityMax: 600,
    styleTags: ["elegant", "modern", "indoor"],
    services: [{ name: "Full-day venue hire", price: 1600000 }, { name: "In-house catering add-on", price: 400000 }],
    reliabilityScore: 91, avgResponseHours: 6, pastBookings: 142,
    description: "A restored colonial courtyard with indoor and lawn options, popular for 300+ guest weddings.",
    imageEmoji: "🏛️", contactName: "Rohan Mehta", contactPhone: "+91 98200 11122", contactEmail: "events@ivorycourtyard.demo",
  },
  {
    name: "Lakeside Heritage Resort", category: "VENUE", city: "Udaipur",
    priceMin: 1800000, priceMax: 3500000, rating: 4.9, reviewCount: 94,
    capacityMin: 150, capacityMax: 450,
    styleTags: ["luxury", "destination", "outdoor"],
    services: [{ name: "3-day destination package", price: 2800000 }],
    reliabilityScore: 95, avgResponseHours: 10, pastBookings: 61,
    description: "Lakefront heritage property for destination weddings, with palace-view banquet lawns.",
    imageEmoji: "🏰", contactName: "Aditi Rathore", contactPhone: "+91 99280 33441", contactEmail: "bookings@lakesideheritage.demo",
  },
  {
    name: "Grand Palace Banquets", category: "VENUE", city: "Jaipur",
    priceMin: 900000, priceMax: 1700000, rating: 4.4, reviewCount: 210,
    capacityMin: 250, capacityMax: 800,
    styleTags: ["traditional", "grand", "indoor"],
    services: [{ name: "Banquet hall hire", price: 1100000 }],
    reliabilityScore: 84, avgResponseHours: 14, pastBookings: 233,
    description: "High-capacity banquet venue for large, traditional multi-function weddings.",
    imageEmoji: "🕌", contactName: "Vikram Singh", contactPhone: "+91 98290 55667", contactEmail: "sales@grandpalacebanquets.demo",
  },
  {
    name: "Skyline Terrace Venue", category: "VENUE", city: "Bengaluru",
    priceMin: 700000, priceMax: 1300000, rating: 4.3, reviewCount: 77,
    capacityMin: 100, capacityMax: 300,
    styleTags: ["modern", "rooftop", "intimate"],
    services: [{ name: "Rooftop evening slot", price: 850000 }],
    reliabilityScore: 80, avgResponseHours: 12, pastBookings: 58,
    description: "City-view rooftop venue suited to smaller, design-forward weddings and receptions.",
    imageEmoji: "🌆", contactName: "Kavya Reddy", contactPhone: "+91 90080 12233", contactEmail: "hello@skylineterrace.demo",
  },

  // ---- Photographer ----------------------------------------------------
  {
    name: "Golden Hour Photography", category: "PHOTOGRAPHER", city: "Mumbai",
    priceMin: 180000, priceMax: 350000, rating: 4.8, reviewCount: 152,
    styleTags: ["candid", "cinematic", "modern"],
    services: [{ name: "2-day wedding coverage", price: 250000 }, { name: "Pre-wedding shoot", price: 60000 }],
    reliabilityScore: 92, avgResponseHours: 5, pastBookings: 118,
    description: "Candid-first wedding photography studio known for cinematic light and unposed moments.",
    imageEmoji: "📸", contactName: "Rahul Verma", contactPhone: "+91 98213 44556", contactEmail: "studio@goldenhour.demo",
  },
  {
    name: "Frame & Forever Studios", category: "PHOTOGRAPHER", city: "Jaipur",
    priceMin: 120000, priceMax: 220000, rating: 4.5, reviewCount: 203,
    styleTags: ["traditional", "candid"],
    services: [{ name: "Full wedding package", price: 180000 }],
    reliabilityScore: 87, avgResponseHours: 8, pastBookings: 176,
    description: "Established studio blending traditional portraiture with candid documentary coverage.",
    imageEmoji: "📷", contactName: "Sanjay Kapoor", contactPhone: "+91 98290 77889", contactEmail: "bookings@frameforever.demo",
  },
  {
    name: "Candid Tales", category: "PHOTOGRAPHER", city: "Bengaluru",
    priceMin: 90000, priceMax: 160000, rating: 4.2, reviewCount: 64,
    styleTags: ["candid", "minimal", "budget-friendly"],
    services: [{ name: "1-day coverage", price: 110000 }],
    reliabilityScore: 76, avgResponseHours: 18, pastBookings: 41,
    description: "Small independent team offering candid coverage at accessible price points.",
    imageEmoji: "📷", contactName: "Meera Nair", contactPhone: "+91 90350 22114", contactEmail: "hi@candidtales.demo",
  },
  {
    name: "Luxe Lens Collective", category: "PHOTOGRAPHER", city: "Udaipur",
    priceMin: 250000, priceMax: 450000, rating: 4.9, reviewCount: 88,
    styleTags: ["luxury", "cinematic", "destination"],
    services: [{ name: "Destination wedding package", price: 380000 }],
    reliabilityScore: 94, avgResponseHours: 4, pastBookings: 52,
    description: "Premium destination-wedding photography team with an editorial, magazine-style finish.",
    imageEmoji: "📸", contactName: "Arjun Malhotra", contactPhone: "+91 99870 66112", contactEmail: "team@luxelens.demo",
  },

  // ---- Videographer -----------------------------------------------------
  {
    name: "Cinematic Vows", category: "VIDEOGRAPHER", city: "Mumbai",
    priceMin: 150000, priceMax: 300000, rating: 4.6, reviewCount: 97,
    styleTags: ["cinematic", "modern"],
    services: [{ name: "Highlight film + full edit", price: 220000 }],
    reliabilityScore: 88, avgResponseHours: 7, pastBookings: 74,
    description: "Wedding films shot and edited in a cinematic trailer style with drone coverage.",
    imageEmoji: "🎥", contactName: "Nikhil Shah", contactPhone: "+91 98673 44100", contactEmail: "films@cinematicvows.demo",
  },
  {
    name: "ReelStory Films", category: "VIDEOGRAPHER", city: "Jaipur",
    priceMin: 90000, priceMax: 180000, rating: 4.3, reviewCount: 112,
    styleTags: ["traditional", "candid"],
    services: [{ name: "Same-day edit + highlight reel", price: 130000 }],
    reliabilityScore: 82, avgResponseHours: 10, pastBookings: 89,
    description: "Full-function video coverage with a fast same-day highlight reel turnaround.",
    imageEmoji: "🎬", contactName: "Divya Agarwal", contactPhone: "+91 98290 90011", contactEmail: "team@reelstory.demo",
  },

  // ---- Decorator ---------------------------------------------------------
  {
    name: "Bloom & Drape Decor", category: "DECORATOR", city: "Mumbai",
    priceMin: 400000, priceMax: 900000, rating: 4.6, reviewCount: 133,
    styleTags: ["floral", "elegant", "modern"],
    services: [{ name: "Mandap + stage decor", price: 650000 }, { name: "Entrance & pathway", price: 150000 }],
    reliabilityScore: 85, avgResponseHours: 9, pastBookings: 96,
    description: "Floral-forward decor studio known for pastel palettes and layered mandap design.",
    imageEmoji: "💐", contactName: "Sneha Joshi", contactPhone: "+91 90040 33221", contactEmail: "studio@bloomdrape.demo",
  },
  {
    name: "Regal Setups", category: "DECORATOR", city: "Jaipur",
    priceMin: 300000, priceMax: 700000, rating: 4.4, reviewCount: 168,
    styleTags: ["traditional", "grand"],
    services: [{ name: "Full venue decor", price: 500000 }],
    reliabilityScore: 79, avgResponseHours: 16, pastBookings: 141,
    description: "Traditional Rajasthani-style decor with heavy drape work and statement lighting.",
    imageEmoji: "🎊", contactName: "Manish Bhatt", contactPhone: "+91 98290 44778", contactEmail: "sales@regalsetups.demo",
  },
  {
    name: "Marigold & Marble", category: "DECORATOR", city: "Bengaluru",
    priceMin: 250000, priceMax: 550000, rating: 4.1, reviewCount: 59,
    styleTags: ["minimal", "modern", "budget-friendly"],
    services: [{ name: "Minimal stage + florals", price: 350000 }],
    reliabilityScore: 74, avgResponseHours: 20, pastBookings: 37,
    description: "Contemporary minimal decor studio for couples who want a lighter, editorial look.",
    imageEmoji: "🌼", contactName: "Priyanka Rao", contactPhone: "+91 90360 11009", contactEmail: "hello@marigoldmarble.demo",
  },

  // ---- Caterer ------------------------------------------------------------
  {
    name: "Spice Route Catering", category: "CATERER", city: "Mumbai",
    priceMin: 900, priceMax: 1800, rating: 4.5, reviewCount: 220,
    capacityMin: 100, capacityMax: 800,
    styleTags: ["multi-cuisine", "live-counters"],
    services: [{ name: "Per-plate multi-cuisine menu", price: 1400 }],
    reliabilityScore: 88, avgResponseHours: 6, pastBookings: 201,
    description: "Large-scale catering with live counters, known for consistent quality at big weddings.",
    imageEmoji: "🍽️", contactName: "Farhan Sheikh", contactPhone: "+91 98200 88112", contactEmail: "events@spiceroute.demo",
  },
  {
    name: "Royal Thali Caterers", category: "CATERER", city: "Jaipur",
    priceMin: 600, priceMax: 1200, rating: 4.3, reviewCount: 189,
    capacityMin: 150, capacityMax: 1000,
    styleTags: ["traditional", "regional"],
    services: [{ name: "Rajasthani thali package", price: 900 }],
    reliabilityScore: 81, avgResponseHours: 11, pastBookings: 176,
    description: "Regional Rajasthani specialists, strong at high-volume traditional wedding feasts.",
    imageEmoji: "🍛", contactName: "Om Prakash", contactPhone: "+91 98290 22110", contactEmail: "banquets@royalthali.demo",
  },
  {
    name: "The Banquet Table", category: "CATERER", city: "Bengaluru",
    priceMin: 1000, priceMax: 2200, rating: 4.6, reviewCount: 98,
    capacityMin: 80, capacityMax: 400,
    styleTags: ["multi-cuisine", "premium"],
    services: [{ name: "Premium plated service", price: 1800 }],
    reliabilityScore: 89, avgResponseHours: 5, pastBookings: 64,
    description: "Premium plated and buffet service with an emphasis on presentation and dietary options.",
    imageEmoji: "🍽️", contactName: "Lakshmi Iyer", contactPhone: "+91 90080 55221", contactEmail: "hello@banquettable.demo",
  },

  // ---- Makeup -------------------------------------------------------------
  {
    name: "Glow Bridal Studio", category: "MAKEUP", city: "Mumbai",
    priceMin: 35000, priceMax: 90000, rating: 4.7, reviewCount: 174,
    styleTags: ["hd-makeup", "modern"],
    services: [{ name: "Bridal + 2 function looks", price: 65000 }],
    reliabilityScore: 90, avgResponseHours: 4, pastBookings: 132,
    description: "HD bridal makeup studio with a team for multi-function coverage in one day.",
    imageEmoji: "💄", contactName: "Ananya Kapoor", contactPhone: "+91 98213 66554", contactEmail: "studio@glowbridal.demo",
  },
  {
    name: "Radiance Makeovers", category: "MAKEUP", city: "Jaipur",
    priceMin: 20000, priceMax: 55000, rating: 4.3, reviewCount: 141,
    styleTags: ["traditional", "airbrush"],
    services: [{ name: "Bridal airbrush package", price: 40000 }],
    reliabilityScore: 78, avgResponseHours: 9, pastBookings: 109,
    description: "Airbrush specialists with strong repeat bookings for multi-day traditional functions.",
    imageEmoji: "💄", contactName: "Ritu Sharma", contactPhone: "+91 98290 11445", contactEmail: "bookings@radiancemakeovers.demo",
  },

  // ---- Mehendi --------------------------------------------------------------
  {
    name: "Henna Traditions", category: "MEHENDI", city: "Mumbai",
    priceMin: 15000, priceMax: 40000, rating: 4.6, reviewCount: 121,
    styleTags: ["traditional", "arabic-fusion"],
    services: [{ name: "Bridal mehendi (both hands & feet)", price: 28000 }],
    reliabilityScore: 86, avgResponseHours: 6, pastBookings: 98,
    description: "Fine-line bridal mehendi artists with a team for large guest-side sittings.",
    imageEmoji: "🌿", contactName: "Zoya Khan", contactPhone: "+91 90040 77661", contactEmail: "art@hennatraditions.demo",
  },
  {
    name: "Mehendi by Meera", category: "MEHENDI", city: "Jaipur",
    priceMin: 10000, priceMax: 25000, rating: 4.4, reviewCount: 96,
    styleTags: ["traditional"],
    services: [{ name: "Bridal + family mehendi", price: 18000 }],
    reliabilityScore: 80, avgResponseHours: 8, pastBookings: 87,
    description: "Independent artist specialising in traditional Rajasthani mehendi patterns.",
    imageEmoji: "🌿", contactName: "Meera Gupta", contactPhone: "+91 98290 33887", contactEmail: "meera@mehendibymeera.demo",
  },

  // ---- Jewellery --------------------------------------------------------------
  {
    name: "Heritage Jewels", category: "JEWELLERY", city: "Mumbai",
    priceMin: 200000, priceMax: 1500000, rating: 4.7, reviewCount: 65,
    styleTags: ["traditional", "kundan", "luxury"],
    services: [{ name: "Bridal jewellery set rental/purchase", price: 600000 }],
    reliabilityScore: 91, avgResponseHours: 12, pastBookings: 44,
    description: "Heritage kundan and polki jewellery house offering both purchase and rental sets.",
    imageEmoji: "💍", contactName: "Karan Choksi", contactPhone: "+91 98213 99001", contactEmail: "concierge@heritagejewels.demo",
  },
  {
    name: "Kundan & Co", category: "JEWELLERY", city: "Jaipur",
    priceMin: 80000, priceMax: 500000, rating: 4.4, reviewCount: 132,
    styleTags: ["traditional", "kundan"],
    services: [{ name: "Bridal set rental", price: 150000 }],
    reliabilityScore: 84, avgResponseHours: 14, pastBookings: 103,
    description: "Jaipur-based kundan specialists with flexible rental packages for bridal sets.",
    imageEmoji: "💍", contactName: "Deepak Soni", contactPhone: "+91 98290 66123", contactEmail: "store@kundanco.demo",
  },

  // ---- Invitations --------------------------------------------------------------
  {
    name: "Ink & Ivory Invites", category: "INVITATIONS", city: "Mumbai",
    priceMin: 40000, priceMax: 150000, rating: 4.5, reviewCount: 88,
    styleTags: ["modern", "minimal"],
    services: [{ name: "Design + print (250 sets)", price: 90000 }],
    reliabilityScore: 87, avgResponseHours: 5, pastBookings: 76,
    description: "Boutique invitation design studio with modern letterpress and digital options.",
    imageEmoji: "✉️", contactName: "Tanya Malhotra", contactPhone: "+91 90040 22887", contactEmail: "studio@inkivory.demo",
  },
  {
    name: "Paperie Weds", category: "INVITATIONS", city: "Jaipur",
    priceMin: 20000, priceMax: 80000, rating: 4.2, reviewCount: 104,
    styleTags: ["traditional", "budget-friendly"],
    services: [{ name: "Design + print (300 sets)", price: 55000 }],
    reliabilityScore: 77, avgResponseHours: 9, pastBookings: 91,
    description: "Value-friendly traditional invitation printer with fast turnaround.",
    imageEmoji: "✉️", contactName: "Suresh Mathur", contactPhone: "+91 98290 55009", contactEmail: "orders@paperieweds.demo",
  },

  // ---- Transportation --------------------------------------------------------------
  {
    name: "Royal Fleet Rentals", category: "TRANSPORTATION", city: "Mumbai",
    priceMin: 15000, priceMax: 120000, rating: 4.3, reviewCount: 71,
    styleTags: ["luxury", "fleet"],
    services: [{ name: "Baraat car + guest shuttle fleet", price: 60000 }],
    reliabilityScore: 83, avgResponseHours: 8, pastBookings: 63,
    description: "Vintage baraat cars and guest shuttle fleets for multi-day functions.",
    imageEmoji: "🚗", contactName: "Imran Ali", contactPhone: "+91 98213 44900", contactEmail: "fleet@royalfleet.demo",
  },
  {
    name: "Baraat Wheels", category: "TRANSPORTATION", city: "Jaipur",
    priceMin: 10000, priceMax: 80000, rating: 4.0, reviewCount: 54,
    styleTags: ["budget-friendly", "fleet"],
    services: [{ name: "Guest transport package", price: 35000 }],
    reliabilityScore: 72, avgResponseHours: 15, pastBookings: 48,
    description: "Straightforward guest transport fleet for outstation-heavy weddings.",
    imageEmoji: "🚌", contactName: "Vinod Yadav", contactPhone: "+91 98290 11667", contactEmail: "bookings@baraatwheels.demo",
  },

  // ---- Accommodation --------------------------------------------------------------
  {
    name: "Guestline Stays", category: "ACCOMMODATION", city: "Mumbai",
    priceMin: 4000, priceMax: 15000, rating: 4.4, reviewCount: 66,
    capacityMin: 20, capacityMax: 200,
    styleTags: ["comfort", "group-blocks"],
    services: [{ name: "Group room block (per room/night)", price: 7000 }],
    reliabilityScore: 85, avgResponseHours: 10, pastBookings: 52,
    description: "Wedding-group specialist offering blocked room rates across partner hotels.",
    imageEmoji: "🏨", contactName: "Neha Kulkarni", contactPhone: "+91 90040 99112", contactEmail: "groups@guestlinestays.demo",
  },

  // ---- Entertainment --------------------------------------------------------------
  {
    name: "Rhythm & Beats DJ", category: "ENTERTAINMENT", city: "Mumbai",
    priceMin: 60000, priceMax: 180000, rating: 4.5, reviewCount: 143,
    styleTags: ["modern", "party"],
    services: [{ name: "Sangeet + reception DJ set", price: 120000 }],
    reliabilityScore: 86, avgResponseHours: 6, pastBookings: 118,
    description: "High-energy DJ and lighting crew for sangeet and reception nights.",
    imageEmoji: "🎧", contactName: "Yash Oberoi", contactPhone: "+91 98213 22009", contactEmail: "bookings@rhythmbeats.demo",
  },
  {
    name: "The Sangeet Collective", category: "ENTERTAINMENT", city: "Jaipur",
    priceMin: 40000, priceMax: 130000, rating: 4.2, reviewCount: 79,
    styleTags: ["traditional", "live-band"],
    services: [{ name: "Live band + folk performers", price: 90000 }],
    reliabilityScore: 79, avgResponseHours: 11, pastBookings: 67,
    description: "Live band and folk performance troupe for sangeet nights and baraat entries.",
    imageEmoji: "🎶", contactName: "Kabir Rathi", contactPhone: "+91 98290 88771", contactEmail: "shows@sangeetcollective.demo",
  },

  // ---- Priest --------------------------------------------------------------
  {
    name: "Vedic Rites", category: "PRIEST", city: "Mumbai",
    priceMin: 15000, priceMax: 45000, rating: 4.8, reviewCount: 58,
    styleTags: ["traditional", "hindu"],
    services: [{ name: "Full ceremony rites package", price: 30000 }],
    reliabilityScore: 93, avgResponseHours: 5, pastBookings: 71,
    description: "Experienced priest collective for full Hindu wedding ceremony rites.",
    imageEmoji: "🕉️", contactName: "Pandit Ramesh Trivedi", contactPhone: "+91 98213 11009", contactEmail: "seva@vedicrites.demo",
  },
  {
    name: "Panditji Services", category: "PRIEST", city: "Jaipur",
    priceMin: 10000, priceMax: 30000, rating: 4.6, reviewCount: 84,
    styleTags: ["traditional", "hindu"],
    services: [{ name: "Havan + phere ceremony", price: 20000 }],
    reliabilityScore: 88, avgResponseHours: 7, pastBookings: 96,
    description: "Well-reviewed priest services covering havan, phere and regional rituals.",
    imageEmoji: "🕉️", contactName: "Pandit Girish Joshi", contactPhone: "+91 98290 44112", contactEmail: "contact@panditjiservices.demo",
  },

  // ---- Florist --------------------------------------------------------------
  {
    name: "Petal Studio", category: "FLORIST", city: "Mumbai",
    priceMin: 60000, priceMax: 250000, rating: 4.5, reviewCount: 62,
    styleTags: ["floral", "elegant"],
    services: [{ name: "Bouquet + centrepieces package", price: 140000 }],
    reliabilityScore: 84, avgResponseHours: 9, pastBookings: 49,
    description: "Fresh-flower studio specialising in centrepieces and bridal bouquets.",
    imageEmoji: "🌸", contactName: "Isha Bhalla", contactPhone: "+91 90040 66223", contactEmail: "orders@petalstudio.demo",
  },
  {
    name: "Bloom Bar", category: "FLORIST", city: "Bengaluru",
    priceMin: 40000, priceMax: 160000, rating: 4.1, reviewCount: 39,
    styleTags: ["minimal", "modern"],
    services: [{ name: "Minimal floral styling", price: 90000 }],
    reliabilityScore: 75, avgResponseHours: 13, pastBookings: 28,
    description: "Modern floral styling studio for minimal, editorial-leaning weddings.",
    imageEmoji: "🌷", contactName: "Pooja Menon", contactPhone: "+91 90080 33667", contactEmail: "hello@bloombar.demo",
  },

  // ---- Additional venues for large-outdoor & destination-beach personas -----
  {
    name: "Meadow & Marquee Estates", category: "VENUE", city: "Alibaug",
    priceMin: 2200000, priceMax: 4500000, rating: 4.6, reviewCount: 51,
    capacityMin: 400, capacityMax: 900,
    styleTags: ["outdoor", "destination", "grand"],
    services: [{ name: "Full-estate 2-day outdoor hire", price: 3400000 }],
    reliabilityScore: 87, avgResponseHours: 11, pastBookings: 33,
    description: "Sprawling outdoor lawn-and-marquee estate built for large open-air weddings.",
    imageEmoji: "🌳", contactName: "Rustom Batliwala", contactPhone: "+91 98200 77341", contactEmail: "events@meadowmarquee.demo",
  },
  {
    name: "Sunset Sands Resort", category: "VENUE", city: "Goa",
    priceMin: 1400000, priceMax: 2900000, rating: 4.7, reviewCount: 68,
    capacityMin: 80, capacityMax: 350,
    styleTags: ["destination", "outdoor", "beach"],
    services: [{ name: "3-day beachfront destination package", price: 2200000 }],
    reliabilityScore: 89, avgResponseHours: 9, pastBookings: 40,
    description: "Beachfront resort for destination weddings, with sunset mandap decks over the sand.",
    imageEmoji: "🏖️", contactName: "Clive D'Souza", contactPhone: "+91 98220 55190", contactEmail: "weddings@sunsetsands.demo",
  },

  // ---- Theme decorator --------------------------------------------------------
  {
    name: "Storyline Theme Decor", category: "DECORATOR", city: "Mumbai",
    priceMin: 700000, priceMax: 1600000, rating: 4.5, reviewCount: 44,
    styleTags: ["theme", "grand", "modern"],
    services: [{ name: "Full themed-set design & build", price: 1100000 }],
    reliabilityScore: 83, avgResponseHours: 10, pastBookings: 36,
    description: "Immersive theme-build specialists — vintage Bollywood, royal courts, fairytale sets and more.",
    imageEmoji: "🎭", contactName: "Farah Engineer", contactPhone: "+91 98670 22318", contactEmail: "design@storylinetheme.demo",
  },

  // ---- Pan-India vendors — no fixed home base, travel to any city -----------
  // For weddings in a city with a thin local catalogue (destination or a
  // smaller town), these show up as a "travels nationwide" option instead of
  // a plain distance figure.
  {
    name: "Wanderframe Wedding Films", category: "PHOTOGRAPHER", city: "Mumbai",
    priceMin: 220000, priceMax: 450000, rating: 4.7, reviewCount: 211,
    styleTags: ["candid", "cinematic", "destination", "modern"],
    services: [{ name: "Nationwide destination coverage (travel included)", price: 320000 }],
    reliabilityScore: 90, avgResponseHours: 6, pastBookings: 264,
    description: "A touring team that flies to any city or destination venue — no local-vendor scramble for out-of-town weddings.",
    imageEmoji: "🧳", contactName: "Devika Nair", contactPhone: "+91 98200 44110", contactEmail: "book@wanderframe.demo",
    isPanIndia: true,
  },
  {
    name: "Grand Trunk Catering Co.", category: "CATERER", city: "Delhi",
    priceMin: 1100, priceMax: 2000, rating: 4.4, reviewCount: 178,
    capacityMin: 100, capacityMax: 1200,
    styleTags: ["multi-cuisine", "live-counters", "destination"],
    services: [{ name: "Touring kitchen team + logistics (travel included)", price: 1500 }],
    reliabilityScore: 85, avgResponseHours: 8, pastBookings: 152,
    description: "Sets up a full touring kitchen at destination and outstation venues nationwide, crew and equipment included.",
    imageEmoji: "🚚", contactName: "Harpreet Bakshi", contactPhone: "+91 98110 55223", contactEmail: "events@grandtrunkcatering.demo",
    isPanIndia: true,
  },
  {
    name: "Nomad Wedding Design", category: "DECORATOR", city: "Bengaluru",
    priceMin: 500000, priceMax: 1300000, rating: 4.6, reviewCount: 96,
    styleTags: ["destination", "modern", "grand", "minimal"],
    services: [{ name: "Full destination decor build (travel & shipping included)", price: 850000 }],
    reliabilityScore: 86, avgResponseHours: 9, pastBookings: 88,
    description: "A production team built for destination weddings — decor is shipped and built on-site anywhere in India.",
    imageEmoji: "✈️", contactName: "Rohan Seth", contactPhone: "+91 98450 33217", contactEmail: "studio@nomadweddingdesign.demo",
    isPanIndia: true,
  },
  {
    name: "Circuit Sound & Light", category: "ENTERTAINMENT", city: "Delhi",
    priceMin: 90000, priceMax: 250000, rating: 4.5, reviewCount: 134,
    styleTags: ["party", "modern", "destination"],
    services: [{ name: "Touring DJ + sound & light rig", price: 160000 }],
    reliabilityScore: 84, avgResponseHours: 7, pastBookings: 121,
    description: "Touring DJ and production crew that carries its own rig to venues nationwide, including remote destination sites.",
    imageEmoji: "🎚️", contactName: "Aman Kohli", contactPhone: "+91 98730 66145", contactEmail: "gigs@circuitsoundlight.demo",
    isPanIndia: true,
  },
  {
    name: "Enroute Bridal Studio", category: "MAKEUP", city: "Mumbai",
    priceMin: 45000, priceMax: 110000, rating: 4.6, reviewCount: 143,
    styleTags: ["hd-makeup", "airbrush", "destination"],
    services: [{ name: "Bridal team travel package (2 artists)", price: 80000 }],
    reliabilityScore: 88, avgResponseHours: 5, pastBookings: 109,
    description: "A bridal makeup team that flies out with the couple — same artists for every function, wherever the venue is.",
    imageEmoji: "🛫", contactName: "Simran Oberoi", contactPhone: "+91 98200 88976", contactEmail: "studio@enroutebridal.demo",
    isPanIndia: true,
  },
];
