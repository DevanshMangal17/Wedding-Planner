import { PrismaClient, type TaskStatus, type VendorCategory } from "@prisma/client";
import bcrypt from "bcryptjs";
import { addDays, subDays, differenceInCalendarDays } from "date-fns";
import { vendorSeeds } from "./seedData/vendors";
import { generateTaskBlueprints, resolveDueDate } from "../src/ai/taskGenerator";
import { getMilestoneTemplates, getPaymentTemplates } from "../src/lib/bookingTemplates";

const db = new PrismaClient();

// Deterministic PRNG (mulberry32) so re-running seed produces the same demo data.
function makeRng(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

async function clearDatabase() {
  await db.auditLog.deleteMany();
  await db.notification.deleteMany();
  await db.aIRecommendation.deleteMany();
  await db.sOSOption.deleteMany();
  await db.sOSCase.deleteMany();
  await db.followUp.deleteMany();
  await db.message.deleteMany();
  await db.logisticsItem.deleteMany();
  await db.guest.deleteMany();
  await db.payment.deleteMany();
  await db.vendorMilestone.deleteMany();
  await db.vendorBooking.deleteMany();
  await db.taskDependency.deleteMany();
  await db.weddingTask.deleteMany();
  await db.weddingFunction.deleteMany();
  await db.weddingMember.deleteMany();
  await db.vendorAvailability.deleteMany();
  await db.vendor.deleteMany();
  await db.wedding.deleteMany();
  await db.user.deleteMany();
}

async function seedVendors() {
  const vendors = [];
  for (const seed of vendorSeeds) {
    const vendor = await db.vendor.create({
      data: {
        name: seed.name,
        category: seed.category,
        city: seed.city,
        priceMin: seed.priceMin,
        priceMax: seed.priceMax,
        rating: seed.rating,
        reviewCount: seed.reviewCount,
        capacityMin: seed.capacityMin,
        capacityMax: seed.capacityMax,
        styleTags: JSON.stringify(seed.styleTags),
        services: JSON.stringify(seed.services),
        reliabilityScore: seed.reliabilityScore,
        avgResponseHours: seed.avgResponseHours,
        pastBookings: seed.pastBookings,
        description: seed.description,
        imageEmoji: seed.imageEmoji,
        contactName: seed.contactName,
        contactPhone: seed.contactPhone,
        contactEmail: seed.contactEmail,
        isDemo: true,
        isPanIndia: seed.isPanIndia ?? false,
      },
    });
    vendors.push(vendor);
  }
  return vendors;
}

interface FunctionConfig {
  name: string;
  dayOffset: number; // relative to weddingDate
  guestCount?: number;
}

interface BookingConfig {
  category: VendorCategory;
  vendorName: string;
  status:
    | "REQUIREMENT_CONFIRMED"
    | "QUOTATION_REQUESTED"
    | "QUOTATION_RECEIVED"
    | "NEGOTIATION"
    | "FINAL_QUOTE"
    | "CONTRACT"
    | "ADVANCE_PAID"
    | "CONFIRMED";
  quotedAmount: number;
  finalAmount?: number;
  /** overrides for specific milestones by title: expectedDate offset (days) from today, status */
  milestoneOverrides?: Record<string, { offsetFromToday: number; status?: "PENDING" | "ON_TRACK" | "OVERDUE" | "RECEIVED" | "COMPLETED" }>;
  paymentOverrides?: Record<string, { offsetFromToday: number; status?: "PENDING" | "DUE" | "PAID" | "OVERDUE" }>;
}

interface WeddingConfig {
  ownerName: string;
  ownerEmail: string;
  brideName: string;
  groomName: string;
  city: string;
  weddingDateOffsetDays: number; // relative to today
  guestCount: number;
  budgetTotal: number;
  stage: "PLANNING" | "EXECUTION" | "POST_WEDDING";
  religion: string;
  style: string;
  colorTheme: string;
  cuisinePrefs: string[];
  photographyStyle: string;
  decorStyle: string;
  makeupPrefs: string;
  entertainmentPrefs: string;
  outstationGuestPct: number;
  needsAccommodation: boolean;
  needsTransportation: boolean;
  functions: FunctionConfig[];
  bookings: BookingConfig[];
  sos?: { category: VendorCategory; title: string; description: string; neededByOffsetDays: number };
}

const TODAY = new Date();
TODAY.setHours(9, 0, 0, 0);

const weddingConfigs: WeddingConfig[] = [
  {
    ownerName: "Priya Sharma",
    ownerEmail: "demo1@weddingops.app",
    brideName: "Priya",
    groomName: "Dev",
    city: "Mumbai",
    weddingDateOffsetDays: 130,
    guestCount: 450,
    budgetTotal: 4000000,
    stage: "PLANNING",
    religion: "Hindu",
    style: "Modern traditional",
    colorTheme: "Ivory & Gold",
    cuisinePrefs: ["North Indian", "Live counters"],
    photographyStyle: "Candid & cinematic",
    decorStyle: "Floral, elegant",
    makeupPrefs: "HD, natural finish",
    entertainmentPrefs: "DJ + live band",
    outstationGuestPct: 35,
    needsAccommodation: true,
    needsTransportation: true,
    functions: [
      { name: "Mehendi", dayOffset: -3, guestCount: 200 },
      { name: "Haldi", dayOffset: -2, guestCount: 150 },
      { name: "Wedding", dayOffset: 0, guestCount: 450 },
      { name: "Reception", dayOffset: 1, guestCount: 450 },
    ],
    bookings: [
      { category: "VENUE", vendorName: "The Ivory Courtyard", status: "CONFIRMED", quotedAmount: 1800000, finalAmount: 1800000 },
      { category: "CATERER", vendorName: "Spice Route Catering", status: "CONTRACT", quotedAmount: 620000,
        milestoneOverrides: { "Final menu confirmed": { offsetFromToday: 7, status: "ON_TRACK" } } },
      { category: "PHOTOGRAPHER", vendorName: "Golden Hour Photography", status: "FINAL_QUOTE", quotedAmount: 250000,
        milestoneOverrides: { "Final confirmation": { offsetFromToday: 1, status: "ON_TRACK" }, "Shot list shared": { offsetFromToday: -1, status: "OVERDUE" } } },
      { category: "DECORATOR", vendorName: "Bloom & Drape Decor", status: "QUOTATION_REQUESTED", quotedAmount: 650000,
        milestoneOverrides: { "Quotation": { offsetFromToday: -2, status: "OVERDUE" } } },
      { category: "MAKEUP", vendorName: "Glow Bridal Studio", status: "CONTRACT", quotedAmount: 65000,
        milestoneOverrides: { "Trial run": { offsetFromToday: 5, status: "ON_TRACK" } } },
      { category: "MEHENDI", vendorName: "Henna Traditions", status: "CONFIRMED", quotedAmount: 28000, finalAmount: 28000 },
      { category: "PRIEST", vendorName: "Vedic Rites", status: "ADVANCE_PAID", quotedAmount: 30000 },
    ],
  },
  {
    ownerName: "Ananya Rathore",
    ownerEmail: "demo2@weddingops.app",
    brideName: "Ananya",
    groomName: "Karan",
    city: "Jaipur",
    weddingDateOffsetDays: 18,
    guestCount: 250,
    budgetTotal: 2500000,
    stage: "EXECUTION",
    religion: "Hindu",
    style: "Traditional Rajasthani",
    colorTheme: "Maroon & Gold",
    cuisinePrefs: ["Rajasthani", "North Indian"],
    photographyStyle: "Traditional & candid",
    decorStyle: "Grand, traditional",
    makeupPrefs: "Airbrush",
    entertainmentPrefs: "Live band, folk performers",
    outstationGuestPct: 50,
    needsAccommodation: true,
    needsTransportation: true,
    functions: [
      { name: "Mehendi", dayOffset: -2, guestCount: 120 },
      { name: "Haldi", dayOffset: -1, guestCount: 100 },
      { name: "Wedding", dayOffset: 0, guestCount: 250 },
      { name: "Reception", dayOffset: 1, guestCount: 250 },
    ],
    bookings: [
      { category: "VENUE", vendorName: "Grand Palace Banquets", status: "CONFIRMED", quotedAmount: 1100000, finalAmount: 1100000 },
      { category: "CATERER", vendorName: "Royal Thali Caterers", status: "CONFIRMED", quotedAmount: 320000, finalAmount: 320000 },
      { category: "PHOTOGRAPHER", vendorName: "Frame & Forever Studios", status: "ADVANCE_PAID", quotedAmount: 180000 },
      { category: "DECORATOR", vendorName: "Regal Setups", status: "CONTRACT", quotedAmount: 500000 },
      { category: "MEHENDI", vendorName: "Mehendi by Meera", status: "CONFIRMED", quotedAmount: 18000, finalAmount: 18000 },
      { category: "PRIEST", vendorName: "Panditji Services", status: "CONFIRMED", quotedAmount: 20000, finalAmount: 20000 },
    ],
    sos: {
      category: "MAKEUP",
      title: "Makeup artist cancelled for Mehendi function",
      description: "My makeup artist just cancelled for the Mehendi function — I need a replacement urgently.",
      neededByOffsetDays: 2,
    },
  },
  {
    ownerName: "Meera Iyer",
    ownerEmail: "demo3@weddingops.app",
    brideName: "Meera",
    groomName: "Arjun",
    city: "Bengaluru",
    weddingDateOffsetDays: -25,
    guestCount: 150,
    budgetTotal: 1800000,
    stage: "POST_WEDDING",
    religion: "Hindu",
    style: "Contemporary minimal",
    colorTheme: "Sage & Cream",
    cuisinePrefs: ["Multi-cuisine"],
    photographyStyle: "Candid, minimal",
    decorStyle: "Minimal, modern",
    makeupPrefs: "Natural, HD",
    entertainmentPrefs: "DJ",
    outstationGuestPct: 20,
    needsAccommodation: false,
    needsTransportation: false,
    functions: [
      { name: "Wedding", dayOffset: 0, guestCount: 150 },
      { name: "Reception", dayOffset: 1, guestCount: 150 },
    ],
    bookings: [
      { category: "VENUE", vendorName: "Skyline Terrace Venue", status: "CONFIRMED", quotedAmount: 850000, finalAmount: 850000 },
      { category: "CATERER", vendorName: "The Banquet Table", status: "CONFIRMED", quotedAmount: 280000, finalAmount: 280000 },
      { category: "PHOTOGRAPHER", vendorName: "Candid Tales", status: "CONFIRMED", quotedAmount: 110000, finalAmount: 110000 },
      { category: "DECORATOR", vendorName: "Marigold & Marble", status: "CONFIRMED", quotedAmount: 350000, finalAmount: 350000 },
      { category: "FLORIST", vendorName: "Bloom Bar", status: "CONFIRMED", quotedAmount: 90000, finalAmount: 90000 },
    ],
  },

  // ---- Persona: destination wedding -----------------------------------------
  {
    ownerName: "Kavya Menon",
    ownerEmail: "demo4@weddingops.app",
    brideName: "Kavya",
    groomName: "Rohan",
    city: "Udaipur",
    weddingDateOffsetDays: 150,
    guestCount: 180,
    budgetTotal: 6500000,
    stage: "PLANNING",
    religion: "Hindu",
    style: "Royal destination, heritage luxury",
    colorTheme: "Jewel tones — emerald & gold",
    cuisinePrefs: ["Multi-cuisine", "Live counters"],
    photographyStyle: "Cinematic, destination editorial",
    decorStyle: "Grand, luxury",
    makeupPrefs: "HD, natural finish",
    entertainmentPrefs: "Live band",
    outstationGuestPct: 85,
    needsAccommodation: true,
    needsTransportation: true,
    functions: [
      { name: "Engagement", dayOffset: -3, guestCount: 60 },
      { name: "Mehendi", dayOffset: -2, guestCount: 100 },
      { name: "Sangeet", dayOffset: -1, guestCount: 150 },
      { name: "Wedding", dayOffset: 0, guestCount: 180 },
    ],
    bookings: [
      { category: "VENUE", vendorName: "Lakeside Heritage Resort", status: "CONFIRMED", quotedAmount: 2800000, finalAmount: 2800000 },
      { category: "PHOTOGRAPHER", vendorName: "Luxe Lens Collective", status: "CONTRACT", quotedAmount: 380000 },
      { category: "CATERER", vendorName: "Spice Route Catering", status: "ADVANCE_PAID", quotedAmount: 620000 },
      { category: "MAKEUP", vendorName: "Glow Bridal Studio", status: "ADVANCE_PAID", quotedAmount: 65000 },
      { category: "DECORATOR", vendorName: "Bloom & Drape Decor", status: "QUOTATION_REQUESTED", quotedAmount: 650000,
        milestoneOverrides: { "Quotation": { offsetFromToday: -3, status: "OVERDUE" } } },
    ],
  },

  // ---- Persona: small intimate indoor wedding --------------------------------
  {
    ownerName: "Naina Fernandes",
    ownerEmail: "demo5@weddingops.app",
    brideName: "Naina",
    groomName: "Aditya",
    city: "Bengaluru",
    weddingDateOffsetDays: 25,
    guestCount: 60,
    budgetTotal: 1200000,
    stage: "EXECUTION",
    religion: "Christian",
    style: "Minimal, intimate",
    colorTheme: "Cream & sage",
    cuisinePrefs: ["Multi-cuisine"],
    photographyStyle: "Candid, minimal",
    decorStyle: "Minimal, modern",
    makeupPrefs: "Natural, HD",
    entertainmentPrefs: "Acoustic duo",
    outstationGuestPct: 10,
    needsAccommodation: false,
    needsTransportation: false,
    functions: [
      { name: "Wedding", dayOffset: 0, guestCount: 60 },
      { name: "Reception", dayOffset: 1, guestCount: 60 },
    ],
    bookings: [
      { category: "VENUE", vendorName: "Skyline Terrace Venue", status: "CONFIRMED", quotedAmount: 850000, finalAmount: 850000 },
      { category: "CATERER", vendorName: "The Banquet Table", status: "CONFIRMED", quotedAmount: 130000, finalAmount: 130000 },
      { category: "PHOTOGRAPHER", vendorName: "Candid Tales", status: "CONTRACT", quotedAmount: 110000 },
      { category: "DECORATOR", vendorName: "Marigold & Marble", status: "ADVANCE_PAID", quotedAmount: 280000 },
    ],
  },

  // ---- Persona: large outdoor wedding ----------------------------------------
  {
    ownerName: "Simran Kaur",
    ownerEmail: "demo6@weddingops.app",
    brideName: "Simran",
    groomName: "Yuvraj",
    city: "Alibaug",
    weddingDateOffsetDays: 200,
    guestCount: 700,
    budgetTotal: 12000000,
    stage: "PLANNING",
    religion: "Sikh",
    style: "Grand, outdoor celebration",
    colorTheme: "Marigold & royal blue",
    cuisinePrefs: ["North Indian", "Live counters", "Chinese"],
    photographyStyle: "Cinematic, candid",
    decorStyle: "Grand, floral",
    makeupPrefs: "HD, airbrush",
    entertainmentPrefs: "DJ + live band",
    outstationGuestPct: 45,
    needsAccommodation: true,
    needsTransportation: true,
    functions: [
      { name: "Mehendi", dayOffset: -3, guestCount: 250 },
      { name: "Haldi", dayOffset: -2, guestCount: 200 },
      { name: "Sangeet", dayOffset: -1, guestCount: 400 },
      { name: "Wedding", dayOffset: 0, guestCount: 700 },
      { name: "Reception", dayOffset: 1, guestCount: 700 },
    ],
    bookings: [
      { category: "VENUE", vendorName: "Meadow & Marquee Estates", status: "CONFIRMED", quotedAmount: 3400000, finalAmount: 3400000 },
      { category: "CATERER", vendorName: "Spice Route Catering", status: "CONTRACT", quotedAmount: 980000 },
      { category: "PHOTOGRAPHER", vendorName: "Golden Hour Photography", status: "ADVANCE_PAID", quotedAmount: 250000 },
      { category: "DECORATOR", vendorName: "Bloom & Drape Decor", status: "QUOTATION_REQUESTED", quotedAmount: 900000,
        milestoneOverrides: { "Quotation": { offsetFromToday: -2, status: "OVERDUE" } } },
      { category: "ENTERTAINMENT", vendorName: "Rhythm & Beats DJ", status: "CONFIRMED", quotedAmount: 120000, finalAmount: 120000 },
    ],
    sos: {
      category: "CATERER",
      title: "Caterer backed out weeks before the wedding",
      description: "Our caterer just informed us they can no longer take on an event of our size — we need a large-scale replacement fast.",
      neededByOffsetDays: 14,
    },
  },

  // ---- Persona: theme wedding -------------------------------------------------
  {
    ownerName: "Ritika Chopra",
    ownerEmail: "demo7@weddingops.app",
    brideName: "Ritika",
    groomName: "Kabir",
    city: "Mumbai",
    weddingDateOffsetDays: 110,
    guestCount: 300,
    budgetTotal: 4500000,
    stage: "PLANNING",
    religion: "Hindu",
    style: "Vintage Bollywood theme",
    colorTheme: "Red, gold & black — retro cinema glamour",
    cuisinePrefs: ["North Indian", "Live counters"],
    photographyStyle: "Cinematic, editorial",
    decorStyle: "Theme, grand",
    makeupPrefs: "HD, glam",
    entertainmentPrefs: "DJ + dance performances",
    outstationGuestPct: 25,
    needsAccommodation: true,
    needsTransportation: false,
    functions: [
      { name: "Sangeet", dayOffset: -1, guestCount: 250 },
      { name: "Wedding", dayOffset: 0, guestCount: 300 },
      { name: "Reception", dayOffset: 1, guestCount: 300 },
    ],
    bookings: [
      { category: "VENUE", vendorName: "The Ivory Courtyard", status: "CONFIRMED", quotedAmount: 1800000, finalAmount: 1800000 },
      { category: "DECORATOR", vendorName: "Storyline Theme Decor", status: "CONTRACT", quotedAmount: 1100000 },
      { category: "CATERER", vendorName: "Spice Route Catering", status: "ADVANCE_PAID", quotedAmount: 550000 },
      { category: "PHOTOGRAPHER", vendorName: "Golden Hour Photography", status: "CONFIRMED", quotedAmount: 250000, finalAmount: 250000 },
      { category: "ENTERTAINMENT", vendorName: "Rhythm & Beats DJ", status: "CONFIRMED", quotedAmount: 120000, finalAmount: 120000 },
    ],
  },
];

function deriveTaskStatus(dueDate: Date, now: Date, rand: () => number): TaskStatus {
  const daysUntil = differenceInCalendarDays(dueDate, now);
  if (daysUntil < -3) return rand() < 0.85 ? "COMPLETED" : rand() < 0.5 ? "DELAYED" : "AT_RISK";
  if (daysUntil <= 0) return rand() < 0.55 ? "COMPLETED" : "IN_PROGRESS";
  if (daysUntil <= 14) return rand() < 0.3 ? "WAITING_VENDOR" : rand() < 0.55 ? "IN_PROGRESS" : "AT_RISK";
  if (daysUntil <= 30) return rand() < 0.2 ? "IN_PROGRESS" : "NOT_STARTED";
  return "NOT_STARTED";
}

async function seedWedding(config: WeddingConfig, allVendors: { id: string; name: string; category: VendorCategory }[], seedIndex: number) {
  const rand = makeRng(1000 + seedIndex * 97);
  const passwordHash = await bcrypt.hash("demo1234", 10);
  const owner = await db.user.create({
    data: { name: config.ownerName, email: config.ownerEmail, passwordHash },
  });

  const weddingDate = addDays(TODAY, config.weddingDateOffsetDays);
  const slug = `${config.brideName}-${config.groomName}-${seedIndex}`.toLowerCase();

  const wedding = await db.wedding.create({
    data: {
      slug,
      brideName: config.brideName,
      groomName: config.groomName,
      city: config.city,
      weddingDate,
      guestCount: config.guestCount,
      budgetTotal: config.budgetTotal,
      stage: config.stage,
      religion: config.religion,
      style: config.style,
      colorTheme: config.colorTheme,
      cuisinePrefs: JSON.stringify(config.cuisinePrefs),
      photographyStyle: config.photographyStyle,
      decorStyle: config.decorStyle,
      makeupPrefs: config.makeupPrefs,
      entertainmentPrefs: config.entertainmentPrefs,
      outstationGuestPct: config.outstationGuestPct,
      needsAccommodation: config.needsAccommodation,
      needsTransportation: config.needsTransportation,
      ownerId: owner.id,
    },
  });

  await db.weddingMember.createMany({
    data: [
      { weddingId: wedding.id, userId: owner.id, name: `${config.brideName} ${config.ownerName.split(" ")[1] ?? ""}`.trim(), role: "BRIDE", email: config.ownerEmail },
      { weddingId: wedding.id, name: config.groomName, role: "GROOM" },
      { weddingId: wedding.id, name: `${config.brideName}'s mother`, role: "PARENT" },
    ],
  });

  const functionRecords = [];
  for (const fn of config.functions) {
    const record = await db.weddingFunction.create({
      data: {
        weddingId: wedding.id,
        name: fn.name,
        date: addDays(weddingDate, fn.dayOffset),
        guestCount: fn.guestCount,
      },
    });
    functionRecords.push(record);
  }

  // Guests
  const guestSides = ["BRIDE", "GROOM", "BOTH"] as const;
  const guestNames = [
    "Rakesh Kumar", "Sunita Verma", "Arjun Mehta", "Kavita Rao", "Vikas Gupta",
    "Neha Singh", "Rajesh Nair", "Pooja Desai", "Amit Joshi", "Divya Menon",
    "Sanjay Bose", "Rina Kapoor",
  ];
  for (let i = 0; i < guestNames.length; i++) {
    const isOutstation = rand() < (config.outstationGuestPct / 100);
    await db.guest.create({
      data: {
        weddingId: wedding.id,
        name: guestNames[i],
        side: guestSides[i % 3],
        isOutstation,
        city: isOutstation ? "Delhi" : config.city,
        accommodationNeeded: isOutstation && config.needsAccommodation,
        transportNeeded: isOutstation && config.needsTransportation,
        rsvpStatus: rand() < 0.7 ? "CONFIRMED" : "PENDING",
      },
    });
  }

  // Tasks
  const existingVendorCategories = config.bookings.map((b) => b.category);
  const blueprints = generateTaskBlueprints({
    weddingDate,
    guestCount: config.guestCount,
    functionNames: config.functions.map((f) => f.name),
    religion: config.religion,
    outstationGuestPct: config.outstationGuestPct,
    needsAccommodation: config.needsAccommodation,
    needsTransportation: config.needsTransportation,
    existingVendorCategories,
  });

  for (const bp of blueprints) {
    const dueDate = resolveDueDate(weddingDate, bp.phase);
    const relatedFunction = functionRecords.find((f) => f.name === bp.functionName);
    let status = deriveTaskStatus(dueDate, TODAY, rand);
    if (config.stage === "POST_WEDDING" && bp.phase !== "POST_WEDDING") status = "COMPLETED";
    await db.weddingTask.create({
      data: {
        weddingId: wedding.id,
        title: bp.title,
        category: bp.category,
        description: bp.description,
        phase: bp.phase,
        dueDate,
        priority: bp.priority,
        status,
        functionId: relatedFunction?.id,
      },
    });
  }

  // Vendor bookings, milestones, payments
  let budgetSpent = 0;
  for (const bookingCfg of config.bookings) {
    const vendor = allVendors.find((v) => v.name === bookingCfg.vendorName);
    if (!vendor) continue;

    const booking = await db.vendorBooking.create({
      data: {
        weddingId: wedding.id,
        vendorId: vendor.id,
        category: bookingCfg.category,
        status: bookingCfg.status,
        quotedAmount: bookingCfg.quotedAmount,
        finalAmount: bookingCfg.finalAmount,
      },
    });

    const isPostWedding = config.stage === "POST_WEDDING";
    const milestoneTemplates = getMilestoneTemplates(bookingCfg.category);
    const createdMilestones: { id: string; title: string }[] = [];
    for (const mt of milestoneTemplates) {
      const override = bookingCfg.milestoneOverrides?.[mt.title];
      const expectedDate = override
        ? addDays(TODAY, override.offsetFromToday)
        : isPostWedding
          ? subDays(weddingDate, 30 - mt.offsetDays)
          : subDays(TODAY, 30 - mt.offsetDays);
      const status = override?.status ?? (isPostWedding ? "COMPLETED" : expectedDate < TODAY ? "COMPLETED" : "ON_TRACK");
      const m = await db.vendorMilestone.create({
        data: { bookingId: booking.id, title: mt.title, expectedDate, status },
      });
      createdMilestones.push({ id: m.id, title: m.title });
    }

    const paymentTemplates = getPaymentTemplates(bookingCfg.category);
    const baseAmount = bookingCfg.finalAmount ?? bookingCfg.quotedAmount;
    for (const pt of paymentTemplates) {
      const override = bookingCfg.paymentOverrides?.[pt.label];
      const dueDate = override
        ? addDays(TODAY, override.offsetFromToday)
        : isPostWedding
          ? subDays(weddingDate, 40 - pt.offsetDays)
          : subDays(TODAY, 40 - pt.offsetDays);
      const amount = Math.round(baseAmount * pt.pct);
      let status: "PENDING" | "DUE" | "PAID" | "OVERDUE" = override?.status ?? "PENDING";
      if (!override) {
        if (isPostWedding) status = rand() < 0.85 ? "PAID" : "OVERDUE";
        else if (dueDate < TODAY) status = rand() < 0.75 ? "PAID" : "OVERDUE";
        else if (differenceInCalendarDays(dueDate, TODAY) <= 7) status = "DUE";
        else status = "PENDING";
      }
      if (status === "PAID") budgetSpent += amount;
      await db.payment.create({
        data: {
          weddingId: wedding.id,
          bookingId: booking.id,
          milestoneLabel: pt.label,
          amount,
          dueDate,
          paidDate: status === "PAID" ? subDays(dueDate, 1) : null,
          status,
        },
      });
    }

    // A couple of simulated message exchanges per booking for realism
    await db.message.create({
      data: {
        weddingId: wedding.id,
        bookingId: booking.id,
        direction: "OUTBOUND",
        body: `Hi ${vendor.name.split(" ")[0]}, confirming details for ${config.brideName} & ${config.groomName}'s wedding on ${weddingDate.toLocaleDateString("en-IN", { day: "numeric", month: "long" })}.`,
        aiGenerated: false,
      },
    });

    // Follow-up for any overdue milestone
    for (const m of createdMilestones) {
      const full = await db.vendorMilestone.findUnique({ where: { id: m.id } });
      if (full && full.status === "OVERDUE") {
        await db.followUp.create({
          data: {
            weddingId: wedding.id,
            bookingId: booking.id,
            milestoneId: full.id,
            reason: `${full.title} overdue`,
            status: "PENDING",
            dueDate: TODAY,
          },
        });
      }
    }
  }

  await db.wedding.update({ where: { id: wedding.id }, data: { budgetSpent } });

  // Logistics items
  await db.logisticsItem.createMany({
    data: [
      {
        weddingId: wedding.id,
        type: "MATERIAL",
        label: "Wedding invitation cards",
        originLabel: "Printer — " + config.city,
        destinationLabel: "Family residence",
        responsible: "Ink & Ivory Invites",
        expectedDate: subDays(weddingDate, 25),
        status: config.stage === "POST_WEDDING" ? "DELIVERED" : "PLANNED",
      },
      {
        weddingId: wedding.id,
        type: "MATERIAL",
        label: "Return gifts",
        originLabel: "Vendor warehouse",
        destinationLabel: "Venue",
        responsible: "Wedding planning team",
        expectedDate: subDays(weddingDate, 3),
        status: config.stage === "POST_WEDDING" ? "DELIVERED" : "PLANNED",
      },
      {
        weddingId: wedding.id,
        type: "PEOPLE",
        label: "Outstation guest pickup",
        originLabel: `${config.city} Airport`,
        destinationLabel: "Guest hotel",
        responsible: "Royal Fleet Rentals",
        expectedDate: subDays(weddingDate, 1),
        status: config.stage === "POST_WEDDING" ? "DELIVERED" : "PLANNED",
      },
    ],
  });

  // Notifications
  await db.notification.createMany({
    data: [
      {
        weddingId: wedding.id,
        userId: owner.id,
        title: "Welcome to your wedding control tower",
        body: `We've set up ${config.brideName} & ${config.groomName}'s wedding with a personalised checklist.`,
        severity: "INFO",
      },
    ],
  });

  // SOS case for wedding #2 — left OPEN with no options: the sosAgent
  // generates candidate replacements on demand when the case is opened,
  // it never pre-computes them at seed time.
  if (config.sos) {
    await db.sOSCase.create({
      data: {
        weddingId: wedding.id,
        title: config.sos.title,
        description: config.sos.description,
        category: config.sos.category,
        neededByDate: addDays(TODAY, config.sos.neededByOffsetDays),
        status: "OPEN",
      },
    });
  }

  return wedding;
}

async function main() {
  console.log("Clearing existing data...");
  await clearDatabase();

  console.log("Seeding vendor catalogue...");
  const vendors = await seedVendors();

  console.log("Seeding demo weddings...");
  for (let i = 0; i < weddingConfigs.length; i++) {
    const wedding = await seedWedding(weddingConfigs[i], vendors, i);
    console.log(`  Created wedding: ${wedding.brideName} & ${wedding.groomName} (${wedding.stage})`);
  }

  const taskCount = await db.weddingTask.count();
  const vendorCount = await db.vendor.count();
  console.log(`Done. ${vendorCount} vendors, ${taskCount} tasks across ${weddingConfigs.length} weddings.`);
  console.log("Demo logins (password: demo1234):");
  for (const c of weddingConfigs) console.log(`  ${c.ownerEmail}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
