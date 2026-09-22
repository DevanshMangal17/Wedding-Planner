export interface CityInfo {
  name: string;
  state: string;
  lat: number;
  lng: number;
}

// Approximate city-centre coordinates — good enough for "how far is this
// vendor" estimates, not survey-grade. Covers every city referenced by the
// seeded vendor catalogue plus enough breadth for a real national picker.
export const INDIAN_CITIES: CityInfo[] = [
  { name: "Mumbai", state: "Maharashtra", lat: 19.076, lng: 72.8777 },
  { name: "Pune", state: "Maharashtra", lat: 18.5204, lng: 73.8567 },
  { name: "Nagpur", state: "Maharashtra", lat: 21.1458, lng: 79.0882 },
  { name: "Nashik", state: "Maharashtra", lat: 19.9975, lng: 73.7898 },
  { name: "Chhatrapati Sambhajinagar", state: "Maharashtra", lat: 19.8762, lng: 75.3433 },
  { name: "Alibaug", state: "Maharashtra", lat: 18.6414, lng: 72.8722 },
  { name: "Lonavala", state: "Maharashtra", lat: 18.7546, lng: 73.4062 },
  { name: "Jaipur", state: "Rajasthan", lat: 26.9124, lng: 75.7873 },
  { name: "Udaipur", state: "Rajasthan", lat: 24.5854, lng: 73.7125 },
  { name: "Jodhpur", state: "Rajasthan", lat: 26.2389, lng: 73.0243 },
  { name: "Jaisalmer", state: "Rajasthan", lat: 26.9157, lng: 70.9083 },
  { name: "Ajmer", state: "Rajasthan", lat: 26.4499, lng: 74.6399 },
  { name: "Mount Abu", state: "Rajasthan", lat: 24.5926, lng: 72.7156 },
  { name: "Pushkar", state: "Rajasthan", lat: 26.4897, lng: 74.5511 },
  { name: "Bikaner", state: "Rajasthan", lat: 28.0229, lng: 73.3119 },
  { name: "Bengaluru", state: "Karnataka", lat: 12.9716, lng: 77.5946 },
  { name: "Mysuru", state: "Karnataka", lat: 12.2958, lng: 76.6394 },
  { name: "Mangaluru", state: "Karnataka", lat: 12.9141, lng: 74.856 },
  { name: "Hubballi", state: "Karnataka", lat: 15.3647, lng: 75.124 },
  { name: "Goa", state: "Goa", lat: 15.2993, lng: 74.124 },
  { name: "New Delhi", state: "Delhi", lat: 28.6139, lng: 77.209 },
  { name: "Gurugram", state: "Haryana", lat: 28.4595, lng: 77.0266 },
  { name: "Noida", state: "Uttar Pradesh", lat: 28.5355, lng: 77.391 },
  { name: "Faridabad", state: "Haryana", lat: 28.4089, lng: 77.3178 },
  { name: "Lucknow", state: "Uttar Pradesh", lat: 26.8467, lng: 80.9462 },
  { name: "Agra", state: "Uttar Pradesh", lat: 27.1767, lng: 78.0081 },
  { name: "Varanasi", state: "Uttar Pradesh", lat: 25.3176, lng: 82.9739 },
  { name: "Kanpur", state: "Uttar Pradesh", lat: 26.4499, lng: 80.3319 },
  { name: "Prayagraj", state: "Uttar Pradesh", lat: 25.4358, lng: 81.8463 },
  { name: "Mathura", state: "Uttar Pradesh", lat: 27.4924, lng: 77.6737 },
  { name: "Ahmedabad", state: "Gujarat", lat: 23.0225, lng: 72.5714 },
  { name: "Surat", state: "Gujarat", lat: 21.1702, lng: 72.8311 },
  { name: "Vadodara", state: "Gujarat", lat: 22.3072, lng: 73.1812 },
  { name: "Rajkot", state: "Gujarat", lat: 22.3039, lng: 70.8022 },
  { name: "Gandhinagar", state: "Gujarat", lat: 23.2156, lng: 72.6369 },
  { name: "Chennai", state: "Tamil Nadu", lat: 13.0827, lng: 80.2707 },
  { name: "Coimbatore", state: "Tamil Nadu", lat: 11.0168, lng: 76.9558 },
  { name: "Madurai", state: "Tamil Nadu", lat: 9.9252, lng: 78.1198 },
  { name: "Ooty", state: "Tamil Nadu", lat: 11.4102, lng: 76.695 },
  { name: "Hyderabad", state: "Telangana", lat: 17.385, lng: 78.4867 },
  { name: "Warangal", state: "Telangana", lat: 17.9689, lng: 79.5941 },
  { name: "Visakhapatnam", state: "Andhra Pradesh", lat: 17.6868, lng: 83.2185 },
  { name: "Vijayawada", state: "Andhra Pradesh", lat: 16.5062, lng: 80.648 },
  { name: "Tirupati", state: "Andhra Pradesh", lat: 13.6288, lng: 79.4192 },
  { name: "Kolkata", state: "West Bengal", lat: 22.5726, lng: 88.3639 },
  { name: "Darjeeling", state: "West Bengal", lat: 27.041, lng: 88.2663 },
  { name: "Siliguri", state: "West Bengal", lat: 26.7271, lng: 88.3953 },
  { name: "Chandigarh", state: "Chandigarh", lat: 30.7333, lng: 76.7794 },
  { name: "Amritsar", state: "Punjab", lat: 31.634, lng: 74.8723 },
  { name: "Ludhiana", state: "Punjab", lat: 30.901, lng: 75.8573 },
  { name: "Jalandhar", state: "Punjab", lat: 31.326, lng: 75.5762 },
  { name: "Panipat", state: "Haryana", lat: 29.3909, lng: 76.9635 },
  { name: "Kochi", state: "Kerala", lat: 9.9312, lng: 76.2673 },
  { name: "Thiruvananthapuram", state: "Kerala", lat: 8.5241, lng: 76.9366 },
  { name: "Kozhikode", state: "Kerala", lat: 11.2588, lng: 75.7804 },
  { name: "Munnar", state: "Kerala", lat: 10.0889, lng: 77.0595 },
  { name: "Bhopal", state: "Madhya Pradesh", lat: 23.2599, lng: 77.4126 },
  { name: "Indore", state: "Madhya Pradesh", lat: 22.7196, lng: 75.8577 },
  { name: "Gwalior", state: "Madhya Pradesh", lat: 26.2183, lng: 78.1828 },
  { name: "Jabalpur", state: "Madhya Pradesh", lat: 23.1815, lng: 79.9864 },
  { name: "Khajuraho", state: "Madhya Pradesh", lat: 24.8318, lng: 79.9199 },
  { name: "Patna", state: "Bihar", lat: 25.5941, lng: 85.1376 },
  { name: "Bodh Gaya", state: "Bihar", lat: 24.6959, lng: 84.9917 },
  { name: "Ranchi", state: "Jharkhand", lat: 23.3441, lng: 85.3096 },
  { name: "Jamshedpur", state: "Jharkhand", lat: 22.8046, lng: 86.2029 },
  { name: "Bhubaneswar", state: "Odisha", lat: 20.2961, lng: 85.8245 },
  { name: "Puri", state: "Odisha", lat: 19.8135, lng: 85.8312 },
  { name: "Guwahati", state: "Assam", lat: 26.1445, lng: 91.7362 },
  { name: "Dehradun", state: "Uttarakhand", lat: 30.3165, lng: 78.0322 },
  { name: "Rishikesh", state: "Uttarakhand", lat: 30.0869, lng: 78.2676 },
  { name: "Haridwar", state: "Uttarakhand", lat: 29.9457, lng: 78.1642 },
  { name: "Nainital", state: "Uttarakhand", lat: 29.3919, lng: 79.4542 },
  { name: "Mussoorie", state: "Uttarakhand", lat: 30.4598, lng: 78.0664 },
  { name: "Shimla", state: "Himachal Pradesh", lat: 31.1048, lng: 77.1734 },
  { name: "Manali", state: "Himachal Pradesh", lat: 32.2432, lng: 77.1892 },
  { name: "Dharamshala", state: "Himachal Pradesh", lat: 32.219, lng: 76.3234 },
  { name: "Srinagar", state: "Jammu & Kashmir", lat: 34.0837, lng: 74.7973 },
  { name: "Jammu", state: "Jammu & Kashmir", lat: 32.7266, lng: 74.857 },
  { name: "Raipur", state: "Chhattisgarh", lat: 21.2514, lng: 81.6296 },
  { name: "Shillong", state: "Meghalaya", lat: 25.5788, lng: 91.8933 },
  { name: "Gangtok", state: "Sikkim", lat: 27.3389, lng: 88.6065 },
];

const CITY_INDEX = new Map(INDIAN_CITIES.map((c) => [c.name.toLowerCase(), c]));

export function findCity(name: string): CityInfo | undefined {
  return CITY_INDEX.get(name.trim().toLowerCase());
}

export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

/** Returns null when either city isn't in our lookup table — distance genuinely unknown, not zero. */
export function distanceBetweenCitiesKm(cityA: string, cityB: string): number | null {
  const a = findCity(cityA);
  const b = findCity(cityB);
  if (!a || !b) return null;
  if (a.name === b.name) return 0;
  return haversineKm(a.lat, a.lng, b.lat, b.lng);
}

export const INDIAN_STATES = Array.from(new Set(INDIAN_CITIES.map((c) => c.state))).sort();
