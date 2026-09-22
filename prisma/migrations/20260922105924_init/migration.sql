-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Wedding" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "brideName" TEXT NOT NULL,
    "groomName" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "weddingDate" DATETIME NOT NULL,
    "guestCount" INTEGER NOT NULL,
    "budgetTotal" INTEGER NOT NULL,
    "budgetSpent" INTEGER NOT NULL DEFAULT 0,
    "stage" TEXT NOT NULL DEFAULT 'PLANNING',
    "religion" TEXT,
    "traditions" TEXT,
    "style" TEXT,
    "colorTheme" TEXT,
    "cuisinePrefs" TEXT,
    "photographyStyle" TEXT,
    "decorStyle" TEXT,
    "makeupPrefs" TEXT,
    "entertainmentPrefs" TEXT,
    "outstationGuestPct" INTEGER DEFAULT 0,
    "needsAccommodation" BOOLEAN NOT NULL DEFAULT false,
    "needsTransportation" BOOLEAN NOT NULL DEFAULT false,
    "multiCity" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "ownerId" TEXT NOT NULL,
    CONSTRAINT "Wedding_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WeddingMember" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "weddingId" TEXT NOT NULL,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WeddingMember_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "Wedding" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "WeddingMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WeddingFunction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "weddingId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "venueName" TEXT,
    "guestCount" INTEGER,
    "notes" TEXT,
    CONSTRAINT "WeddingFunction_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "Wedding" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WeddingTask" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "weddingId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "phase" TEXT NOT NULL,
    "dueDate" DATETIME NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "owner" TEXT NOT NULL DEFAULT 'You',
    "status" TEXT NOT NULL DEFAULT 'NOT_STARTED',
    "functionId" TEXT,
    "relatedBookingId" TEXT,
    "relatedPaymentId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WeddingTask_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "Wedding" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "WeddingTask_functionId_fkey" FOREIGN KEY ("functionId") REFERENCES "WeddingFunction" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "WeddingTask_relatedBookingId_fkey" FOREIGN KEY ("relatedBookingId") REFERENCES "VendorBooking" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "WeddingTask_relatedPaymentId_fkey" FOREIGN KEY ("relatedPaymentId") REFERENCES "Payment" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TaskDependency" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "taskId" TEXT NOT NULL,
    "dependsOnId" TEXT NOT NULL,
    CONSTRAINT "TaskDependency_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "WeddingTask" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TaskDependency_dependsOnId_fkey" FOREIGN KEY ("dependsOnId") REFERENCES "WeddingTask" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Vendor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "priceMin" INTEGER NOT NULL,
    "priceMax" INTEGER NOT NULL,
    "rating" REAL NOT NULL,
    "reviewCount" INTEGER NOT NULL,
    "capacityMin" INTEGER,
    "capacityMax" INTEGER,
    "styleTags" TEXT NOT NULL,
    "services" TEXT NOT NULL,
    "reliabilityScore" INTEGER NOT NULL,
    "avgResponseHours" INTEGER NOT NULL,
    "pastBookings" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "imageEmoji" TEXT NOT NULL DEFAULT '✨',
    "contactName" TEXT NOT NULL,
    "contactPhone" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "isDemo" BOOLEAN NOT NULL DEFAULT true,
    "isPanIndia" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "VendorAvailability" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "vendorId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "VendorAvailability_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VendorBooking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "weddingId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'REQUIREMENT_CONFIRMED',
    "quotedAmount" INTEGER,
    "finalAmount" INTEGER,
    "matchScore" INTEGER,
    "matchBreakdown" TEXT,
    "matchReason" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "VendorBooking_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "Wedding" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "VendorBooking_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VendorMilestone" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bookingId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "expectedDate" DATETIME NOT NULL,
    "actualDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "amount" INTEGER,
    CONSTRAINT "VendorMilestone_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "VendorBooking" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "weddingId" TEXT NOT NULL,
    "bookingId" TEXT,
    "milestoneLabel" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "dueDate" DATETIME NOT NULL,
    "paidDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Payment_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "Wedding" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Payment_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "VendorBooking" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LogisticsItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "weddingId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "originLabel" TEXT NOT NULL,
    "destinationLabel" TEXT NOT NULL,
    "responsible" TEXT NOT NULL,
    "expectedDate" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PLANNED',
    "notes" TEXT,
    "guestId" TEXT,
    CONSTRAINT "LogisticsItem_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "Wedding" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LogisticsItem_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Guest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "weddingId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "city" TEXT,
    "side" TEXT NOT NULL DEFAULT 'BOTH',
    "isOutstation" BOOLEAN NOT NULL DEFAULT false,
    "accommodationNeeded" BOOLEAN NOT NULL DEFAULT false,
    "transportNeeded" BOOLEAN NOT NULL DEFAULT false,
    "rsvpStatus" TEXT NOT NULL DEFAULT 'PENDING',
    CONSTRAINT "Guest_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "Wedding" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "weddingId" TEXT NOT NULL,
    "bookingId" TEXT,
    "direction" TEXT NOT NULL,
    "channel" TEXT NOT NULL DEFAULT 'SIMULATED',
    "body" TEXT NOT NULL,
    "aiGenerated" BOOLEAN NOT NULL DEFAULT false,
    "sentAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Message_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "Wedding" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Message_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "VendorBooking" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FollowUp" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "weddingId" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "milestoneId" TEXT,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "dueDate" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" DATETIME,
    CONSTRAINT "FollowUp_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "Wedding" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FollowUp_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "VendorBooking" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FollowUp_milestoneId_fkey" FOREIGN KEY ("milestoneId") REFERENCES "VendorMilestone" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SOSCase" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "weddingId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "neededByDate" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" DATETIME,
    CONSTRAINT "SOSCase_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "Wedding" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SOSOption" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sosCaseId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "isSelected" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "SOSOption_sosCaseId_fkey" FOREIGN KEY ("sosCaseId") REFERENCES "SOSCase" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SOSOption_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AIRecommendation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "weddingId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "payload" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AIRecommendation_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "Wedding" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "weddingId" TEXT NOT NULL,
    "userId" TEXT,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'INFO',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "Wedding" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "weddingId" TEXT,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "Wedding" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Wedding_slug_key" ON "Wedding"("slug");

-- CreateIndex
CREATE INDEX "Wedding_ownerId_idx" ON "Wedding"("ownerId");

-- CreateIndex
CREATE INDEX "WeddingMember_weddingId_idx" ON "WeddingMember"("weddingId");

-- CreateIndex
CREATE INDEX "WeddingFunction_weddingId_idx" ON "WeddingFunction"("weddingId");

-- CreateIndex
CREATE INDEX "WeddingTask_weddingId_idx" ON "WeddingTask"("weddingId");

-- CreateIndex
CREATE INDEX "WeddingTask_weddingId_status_idx" ON "WeddingTask"("weddingId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "TaskDependency_taskId_dependsOnId_key" ON "TaskDependency"("taskId", "dependsOnId");

-- CreateIndex
CREATE INDEX "Vendor_category_idx" ON "Vendor"("category");

-- CreateIndex
CREATE INDEX "Vendor_city_idx" ON "Vendor"("city");

-- CreateIndex
CREATE INDEX "VendorAvailability_vendorId_idx" ON "VendorAvailability"("vendorId");

-- CreateIndex
CREATE UNIQUE INDEX "VendorAvailability_vendorId_date_key" ON "VendorAvailability"("vendorId", "date");

-- CreateIndex
CREATE INDEX "VendorBooking_weddingId_idx" ON "VendorBooking"("weddingId");

-- CreateIndex
CREATE INDEX "VendorBooking_vendorId_idx" ON "VendorBooking"("vendorId");

-- CreateIndex
CREATE INDEX "VendorMilestone_bookingId_idx" ON "VendorMilestone"("bookingId");

-- CreateIndex
CREATE INDEX "Payment_weddingId_idx" ON "Payment"("weddingId");

-- CreateIndex
CREATE INDEX "Payment_bookingId_idx" ON "Payment"("bookingId");

-- CreateIndex
CREATE INDEX "LogisticsItem_weddingId_idx" ON "LogisticsItem"("weddingId");

-- CreateIndex
CREATE INDEX "Guest_weddingId_idx" ON "Guest"("weddingId");

-- CreateIndex
CREATE INDEX "Message_weddingId_idx" ON "Message"("weddingId");

-- CreateIndex
CREATE INDEX "Message_bookingId_idx" ON "Message"("bookingId");

-- CreateIndex
CREATE INDEX "FollowUp_weddingId_idx" ON "FollowUp"("weddingId");

-- CreateIndex
CREATE INDEX "FollowUp_bookingId_idx" ON "FollowUp"("bookingId");

-- CreateIndex
CREATE INDEX "SOSCase_weddingId_idx" ON "SOSCase"("weddingId");

-- CreateIndex
CREATE INDEX "SOSOption_sosCaseId_idx" ON "SOSOption"("sosCaseId");

-- CreateIndex
CREATE INDEX "AIRecommendation_weddingId_idx" ON "AIRecommendation"("weddingId");

-- CreateIndex
CREATE INDEX "Notification_weddingId_idx" ON "Notification"("weddingId");

-- CreateIndex
CREATE INDEX "AuditLog_weddingId_idx" ON "AuditLog"("weddingId");
