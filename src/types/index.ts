export type UserRole = 'donor' | 'recipient' | 'admin';

export type DonorSubRole = 'restaurant' | 'individual_event';

export type RecipientSubRole = 
  | 'ngo' 
  | 'orphanage' 
  | 'elder_shelter' 
  | 'old_age_home' 
  | 'individual_recipient';

export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected' | 'expired';

export interface VerificationDocument {
  id: string;
  userId: string;
  userDisplayName: string;
  organizationName: string;
  userRole: UserRole;
  userSubRole?: DonorSubRole | RecipientSubRole;
  documentType: 'fssai_cert' | 'ngo_registration' | 'shelter_license' | 'government_id';
  documentNumber: string;
  name: string;
  fileUrl: string;
  fileName: string;
  fileSize?: string;
  submittedAt: string;
  status: 'pending' | 'verified' | 'rejected';
  rejectionReason?: string;
  reviewedByAdminUid?: string;
  reviewedByAdminName?: string;
  reviewedAt?: string;
  expiryDate?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  phone: string;
  role: UserRole;
  subRole?: DonorSubRole | RecipientSubRole;
  organizationName?: string;
  address: string;
  city: string;
  location?: {
    lat: number;
    lng: number;
  };
  verificationStatus: VerificationStatus;
  verificationExpiryDate?: string; // ISO date
  rejectionReason?: string;
  reviewedByAdminUid?: string;
  reviewedByAdminName?: string;
  reviewedAt?: string;
  documents?: VerificationDocument[];
  createdAt: string;
  updatedAt: string;
}

export type FoodCategory = 
  | 'cooked_meals' 
  | 'packaged_grocery' 
  | 'fresh_produce' 
  | 'bakery' 
  | 'beverages';

export type DietaryFlag = 'veg' | 'non-veg' | 'vegan' | 'halal' | 'jain';

export type UrgencyLevel = 'normal' | 'high' | 'critical';

export interface FoodSafetyDeclaration {
  tempMaintained: boolean;      // Kept at >60°C or refrigerated <5°C
  hygieneStandardMet: boolean;  // Handled with gloves and clean containers
  allergensDisclosed: boolean;  // Allergens identified
  freshnessVerified: boolean;   // Prepared within safe consumption window
  declarantName: string;
  agreedAt: string;
}

export interface FoodListing {
  id: string;
  donorId: string;
  donorName: string;
  donorSubRole: DonorSubRole;
  title: string;
  description: string;
  category: FoodCategory;
  totalQuantity: number;
  remainingQuantity: number;
  unit: 'meals' | 'boxes' | 'kg' | 'packets';
  dietaryFlags: DietaryFlag[];
  cookedOrPreparedAt: string;
  expiresAt: string;
  urgencyLevel: UrgencyLevel;
  safetyDeclaration: FoodSafetyDeclaration;
  isRecurring: boolean;
  recurringSchedule?: 'daily' | 'weekdays' | 'weekly' | null;
  pickupAddress: string;
  pickupCoordinates: {
    lat: number;
    lng: number;
  };
  pickupWindow: {
    start: string;
    end: string;
  };
  pickupInstructions: string;
  offlineVerificationSecret: string; // 6-digit OTP code
  status: 'available' | 'partially_claimed' | 'fully_claimed' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface FoodClaim {
  id: string;
  listingId: string;
  listingTitle: string;
  donorId: string;
  donorName: string;
  recipientId: string;
  recipientName: string;
  recipientSubRole: RecipientSubRole;
  quantityClaimed: number;
  unit: string;
  status: 'reserved' | 'completed' | 'cancelled';
  pickupOtp: string;
  offlineVerifiedAt?: string;
  createdAt: string;
}
