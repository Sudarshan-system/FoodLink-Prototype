import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useListings, type SurplusListing, type Claim } from '../../context/ListingContext';
import { useVerification } from '../../context/VerificationContext';
import { DocumentSubmissionModal } from '../verification/DocumentSubmissionModal';
import { ConfirmationModal } from '../common/ConfirmationModal';
import { 
  Heart, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ShieldCheck, 
  Truck, 
  Check, 
  ChevronRight, 
  Filter, 
  Sparkles,
  XCircle, 
  FileCheck,
  Phone,
  AlertTriangle,
  Minus,
  Plus,
  Package,
  CalendarCheck,
  Building2,
  X
} from 'lucide-react';

export const RecipientDashboard: React.FC = () => {
  const { user } = useAuth();
  const { getUserDocument } = useVerification();
  const { listings, claims, claimListing, cancelClaim } = useListings();

  // State
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [selectedListingForClaim, setSelectedListingForClaim] = useState<SurplusListing | null>(null);
  const [claimQuantity, setClaimQuantity] = useState<number>(1);
  const [isSubmittingClaim, setIsSubmittingClaim] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);
  const [justClaimedInfo, setJustClaimedInfo] = useState<{ claim: Claim; exactAddress?: string; contactPhone?: string } | null>(null);

  // Cancellation state
  const [listingIdToCancel, setListingIdToCancel] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // Filtering state
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filterFitsToday, setFilterFitsToday] = useState<boolean>(false);

  // Live timer tick for urgent countdowns (every 30 seconds)
  const [, setTimerTick] = useState(Date.now());
  useEffect(() => {
    const interval = setInterval(() => setTimerTick(Date.now()), 30000);
    return () => clearInterval(interval);
  }, []);

  if (!user) return null;

  const userDoc = getUserDocument(user.uid);
  const currentStatus = userDoc ? userDoc.status : user.verificationStatus;
  const isVerified = currentStatus === 'verified';
  const isRejected = currentStatus === 'rejected';
  const subRole = user.subRole || 'elder_shelter';
  const activeRejectionReason = userDoc?.rejectionReason || user.rejectionReason;

  const getSubRoleDescription = () => {
    switch (subRole) {
      case 'elder_shelter':
        return {
          title: 'Elder Abandonment Shelter',
          badge: 'Elder Care Facility',
          focus: 'Priority match for soft-cooked, low-spice, and easily digestible nutritious meals.',
          color: 'emerald'
        };
      case 'old_age_home':
        return {
          title: 'Registered Old Age Home',
          badge: 'Senior Living Haven',
          focus: 'Dietary alerts enabled for low-sodium, diabetic-friendly, and freshly prepared hot meals.',
          color: 'emerald'
        };
      case 'orphanage':
        return {
          title: 'Children’s Shelter & Orphanage',
          badge: 'Youth & Child Care',
          focus: 'Priority access to balanced wholesome meals, fresh milk/dairy, and healthy fruits.',
          color: 'blue'
        };
      case 'ngo':
        return {
          title: 'Community NGO & Food Bank',
          badge: 'Bulk Distribution Lead',
          focus: 'Authorized for high-volume surplus collection (>50-200 portions) with transport capacity.',
          color: 'purple'
        };
      case 'individual_recipient':
        return {
          title: 'Individual Direct Recipient',
          badge: 'Family Food Support',
          focus: 'Eligible for direct fresh meal pickup allocations (up to 10 portions per claim).',
          color: 'teal'
        };
      default:
        return {
          title: 'Verified Recipient',
          badge: 'Community Recipient',
          focus: 'Matching surplus food from verified commercial kitchens and wedding donors.',
          color: 'emerald'
        };
    }
  };

  const roleMeta = getSubRoleDescription();

  // Helper: Live Countdown
  const getRemainingTimeMeta = (expiresAt: string) => {
    const now = Date.now();
    const expiry = new Date(expiresAt).getTime();
    const diffMs = expiry - now;

    if (diffMs <= 0) {
      return {
        text: 'Expired',
        isCritical: true,
        hours: 0,
        minutes: 0,
        isExpired: true
      };
    }

    const totalMinutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const isCritical = totalMinutes < 120; // Critical state under 2 hours

    return {
      text: `${hours > 0 ? `${hours}h ` : ''}${minutes}m remaining`,
      isCritical,
      hours,
      minutes,
      isExpired: false
    };
  };

  // Helper: Format pickup window
  const formatPickupWindow = (start: string, end: string) => {
    try {
      const s = new Date(start);
      const e = new Date(end);
      const isToday = s.toDateString() === new Date().toDateString();
      const dayPrefix = isToday ? 'Today' : s.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
      const startTime = s.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
      const endTime = e.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
      return `${dayPrefix}, ${startTime} – ${endTime}`;
    } catch {
      return 'Today, pickup window open';
    }
  };

  // Helper: Format food category label
  const formatCategory = (cat: string) => {
    switch (cat) {
      case 'cooked_meals': return 'Cooked Meals';
      case 'bakery': return 'Bakery & Bread';
      case 'produce': return 'Produce & Fruit';
      case 'packaged': return 'Packaged / Dry';
      default: return cat.replace('_', ' ');
    }
  };

  // Filter & Sort: expiring soonest first
  const activeListings = useMemo(() => {
    return listings
      .filter((item) => {
        // Active status
        if (item.status !== 'active') return false;

        // Food category filter
        if (selectedCategory !== 'all' && item.foodCategory !== selectedCategory) return false;

        // Fits today filter
        if (filterFitsToday) {
          const endDate = new Date(item.pickupWindowEnd);
          const today = new Date();
          const isToday = endDate.getFullYear() === today.getFullYear() &&
                          endDate.getMonth() === today.getMonth() &&
                          endDate.getDate() === today.getDate();
          if (!isToday) return false;
        }

        return true;
      })
      .sort((a, b) => new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime());
  }, [listings, selectedCategory, filterFitsToday]);

  // Recipient's active confirmed claims
  const activeUserClaims = useMemo(() => {
    return claims.filter((c) => c.recipientUid === user.uid && c.status === 'confirmed');
  }, [claims, user.uid]);

  // Handle open claim modal
  const handleOpenClaimModal = (listing: SurplusListing) => {
    setSelectedListingForClaim(listing);
    setClaimQuantity(listing.remainingQuantity); // Default to full remaining
    setClaimError(null);
  };

  // Handle submit claim
  const handleConfirmClaim = async () => {
    if (!selectedListingForClaim) return;
    setIsSubmittingClaim(true);
    setClaimError(null);

    try {
      const res = await claimListing(selectedListingForClaim.id, claimQuantity);
      setJustClaimedInfo({
        claim: res.claim,
        exactAddress: res.privateDetails?.exactAddress,
        contactPhone: res.privateDetails?.contactPhone
      });
      setSelectedListingForClaim(null);
    } catch (err: any) {
      setClaimError(err.message || 'Failed to claim portions. Please try again.');
    } finally {
      setIsSubmittingClaim(false);
    }
  };

  // Handle claim cancellation
  const handleConfirmCancelClaim = async () => {
    if (!listingIdToCancel) return;
    setIsCancelling(true);
    try {
      await cancelClaim(listingIdToCancel);
      setListingIdToCancel(null);
      if (justClaimedInfo?.claim.listingId === listingIdToCancel) {
        setJustClaimedInfo(null);
      }
    } catch (err: any) {
      alert(`Could not cancel claim: ${err.message || err}`);
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Top Welcome & Recipient Identity Header */}
      <div className="bg-white dark:bg-harbor-800 rounded-3xl border border-harbor-200 dark:border-harbor-700 p-6 sm:p-8 shadow-sm transition-all">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Heart className="w-8 h-8" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-harbor-900 dark:text-white">
                  {user.organizationName || user.displayName}
                </h1>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                  {roleMeta.badge}
                </span>
                {isVerified ? (
                  <span className="inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-[#16A34A]" /> Verified Recipient Partner
                  </span>
                ) : isRejected ? (
                  <span className="inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border border-red-300 dark:border-red-800">
                    <XCircle className="w-3.5 h-3.5 mr-1 text-red-600" /> Verification Rejected
                  </span>
                ) : (
                  <span className="inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                    <AlertCircle className="w-3.5 h-3.5 mr-1 text-amber-600" /> Pending Document Verification
                  </span>
                )}
              </div>
              
              <p className="text-sm text-harbor-500 dark:text-slate-400 flex flex-wrap items-center gap-2">
                <span>Caretaker: {user.displayName}</span>
                <span>•</span>
                <span className="flex items-center"><MapPin className="w-3.5 h-3.5 mr-0.5" /> {user.city || 'Bengaluru'}</span>
                {user.address && (
                  <>
                    <span>•</span>
                    <span>{user.address}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
            <button
              onClick={() => setIsDocModalOpen(true)}
              className="min-h-touch px-4 py-2.5 rounded-2xl border border-harbor-200 dark:border-harbor-700 bg-white dark:bg-harbor-850 hover:border-teal-500 text-xs font-bold text-harbor-800 dark:text-slate-200 transition-all flex items-center space-x-1.5 shadow-sm"
            >
              <FileCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>{isRejected ? 'Resubmit Verification Document' : isVerified ? 'View Verification Details' : 'Submit Care License'}</span>
            </button>

            <div className="p-4 rounded-2xl bg-harbor-50 dark:bg-harbor-850 border border-harbor-200 dark:border-harbor-700 text-right sm:min-w-[170px]">
              <div className="text-xs uppercase font-bold text-harbor-500 dark:text-slate-400">Active Claims</div>
              <div className="text-2xl font-bold text-harbor-900 dark:text-white mt-0.5">
                {activeUserClaims.reduce((acc, c) => acc + c.quantity, 0)} Portions
              </div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                {activeUserClaims.length} active pickup reservation{activeUserClaims.length === 1 ? '' : 's'}
              </div>
            </div>
          </div>
        </div>

        {/* Verification Status Banner: REJECTED */}
        {isRejected && (
          <div className="mt-6 p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-red-900 dark:text-red-200">
            <div className="flex items-start space-x-3">
              <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-red-800 dark:text-red-100">Verification Document Rejected: </span>
                <span className="italic font-medium">"{activeRejectionReason || 'Care facility registration could not be verified by Admin.'}"</span>
                <p className="mt-1 text-red-700 dark:text-red-300">
                  Please address the reason above and resubmit your active trust registration or license.
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsDocModalOpen(true)}
              className="min-h-touch px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shrink-0 transition-colors shadow-sm"
            >
              Resubmit Document
            </button>
          </div>
        )}

        {/* Verification Status Banner: PENDING */}
        {!isVerified && !isRejected && (
          <div className="mt-6 p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-amber-900 dark:text-amber-200">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Verification Pending: </span>
                {userDoc ? (
                  <span>
                    Your {userDoc.name} (Ref: <span className="font-mono font-bold">{userDoc.documentNumber}</span>) is being audited by Safety Admin.
                  </span>
                ) : (
                  <span>
                    Please submit your organization registration or shelter license to enable fast-track meal claiming.
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => setIsDocModalOpen(true)}
              className="min-h-touch px-3.5 py-1.5 rounded-xl border border-amber-300 dark:border-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-amber-900 dark:text-amber-100 font-semibold text-xs shrink-0 transition-colors"
            >
              {userDoc ? 'Update Document' : 'Submit Care License'}
            </button>
          </div>
        )}

        {/* Persona Care Focus Alert */}
        <div className="mt-6 p-4 rounded-2xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800/60 flex items-start space-x-3 text-xs text-teal-950 dark:text-teal-200">
          <Sparkles className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">{roleMeta.title} Match Protocol: </span>
            {roleMeta.focus}
          </div>
        </div>
      </div>

      {/* Just Claimed Success Banner & Private Address Card */}
      {justClaimedInfo && (
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-3xl p-6 sm:p-8 space-y-4 animate-scale-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-[#16A34A] flex items-center justify-center shrink-0">
                <Check className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-emerald-950 dark:text-emerald-100">
                  Portions Successfully Reserved!
                </h3>
                <p className="text-xs text-emerald-800 dark:text-emerald-300">
                  {justClaimedInfo.claim.quantity} {justClaimedInfo.claim.listingUnit || 'portions'} confirmed for "{justClaimedInfo.claim.listingTitle}". Exact pickup address unlocked below.
                </p>
              </div>
            </div>
            <button
              onClick={() => setJustClaimedInfo(null)}
              className="p-2 rounded-xl text-emerald-700 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
              aria-label="Dismiss banner"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="bg-white dark:bg-harbor-800 rounded-2xl p-5 border border-emerald-200 dark:border-emerald-900/60 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-harbor-100 dark:border-harbor-700 pb-3">
              <div className="text-xs font-bold text-harbor-500 dark:text-slate-400 uppercase tracking-wider">
                Confidential Pickup Address (Unlocked For You)
              </div>
              <div className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200">
                Window: {justClaimedInfo.claim.pickupWindowStart && justClaimedInfo.claim.pickupWindowEnd 
                  ? formatPickupWindow(justClaimedInfo.claim.pickupWindowStart, justClaimedInfo.claim.pickupWindowEnd) 
                  : 'Pickup Window Active'}
              </div>
            </div>

            <div className="text-sm font-semibold text-harbor-900 dark:text-white flex items-start space-x-2">
              <MapPin className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
              <span>{justClaimedInfo.exactAddress || 'Address will be provided upon physical arrival.'}</span>
            </div>

            {justClaimedInfo.contactPhone && (
              <div className="text-xs text-harbor-600 dark:text-slate-300 flex items-center space-x-2">
                <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Kitchen Contact Phone: <strong className="text-harbor-900 dark:text-white">{justClaimedInfo.contactPhone}</strong></span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirmed Claims Section (If any) */}
      {activeUserClaims.length > 0 && (
        <div className="bg-white dark:bg-harbor-800 rounded-3xl border border-teal-200 dark:border-teal-800/80 p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <Package className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              <h2 className="text-lg font-bold text-harbor-900 dark:text-white">
                Your Active Confirmed Claims
              </h2>
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300">
              {activeUserClaims.length} Active Reservation{activeUserClaims.length === 1 ? '' : 's'}
            </span>
          </div>

          <div className="space-y-4">
            {activeUserClaims.map((claim) => (
              <div 
                key={claim.id} 
                className="p-5 rounded-2xl border border-teal-200 dark:border-teal-800 bg-teal-50/20 dark:bg-teal-950/10 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      Confirmed
                    </span>
                    <h3 className="font-bold text-base text-harbor-900 dark:text-white">
                      {claim.listingTitle || 'Surplus Meal Portion'}
                    </h3>
                  </div>
                  <div className="text-xs text-harbor-600 dark:text-slate-300 flex flex-wrap items-center gap-2">
                    <span>Reserved: <strong className="text-harbor-900 dark:text-white">{claim.quantity} {claim.listingUnit || 'portions'}</strong></span>
                    <span>•</span>
                    <span>Donor: {claim.donorName || 'Verified Donor'}</span>
                    {claim.exactAddress && (
                      <>
                        <span>•</span>
                        <span className="flex items-center text-teal-700 dark:text-teal-300">
                          <MapPin className="w-3.5 h-3.5 mr-0.5" /> {claim.exactAddress}
                        </span>
                      </>
                    )}
                  </div>
                  {claim.contactPhone && (
                    <div className="text-xs text-harbor-500 dark:text-slate-400">
                      Contact: {claim.contactPhone}
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  <button
                    onClick={() => setListingIdToCancel(claim.listingId)}
                    className="min-h-touch px-4 py-2 rounded-xl border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 text-xs font-bold transition-all focus:outline-none focus:ring-2 focus:ring-red-400"
                  >
                    Cancel Claim
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Surplus Feed Section (BROWSE) */}
      <div className="bg-white dark:bg-harbor-800 rounded-3xl border border-harbor-200 dark:border-harbor-700 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-harbor-900 dark:text-white flex items-center space-x-2">
              <span>Available Fresh Surplus Meals</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-harbor-100 dark:bg-harbor-700 text-harbor-700 dark:text-slate-300">
                Sorted by Expiring Soonest
              </span>
            </h2>
            <p className="text-xs text-harbor-500 dark:text-slate-400 mt-0.5">
              Strict 4-point safety declaration verified before listing. Coarse locality shown for security.
            </p>
          </div>

          {/* Filters: Category & Today Toggle */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="min-h-touch px-3 py-2 rounded-xl border border-harbor-200 dark:border-harbor-700 bg-white dark:bg-harbor-850 text-xs font-semibold text-harbor-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                aria-label="Filter by food category"
              >
                <option value="all">All Food Types</option>
                <option value="cooked_meals">Cooked Meals</option>
                <option value="bakery">Bakery & Bread</option>
                <option value="produce">Produce & Fruit</option>
                <option value="packaged">Packaged / Dry</option>
              </select>
            </div>

            <button
              onClick={() => setFilterFitsToday(!filterFitsToday)}
              className={`min-h-touch px-4 py-2 rounded-xl border text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                filterFitsToday
                  ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-200'
                  : 'border-harbor-200 dark:border-harbor-700 bg-white dark:bg-harbor-850 text-harbor-700 dark:text-slate-300 hover:border-teal-400'
              }`}
            >
              <CalendarCheck className="w-3.5 h-3.5 text-teal-600" />
              <span>Pickup Window Fits Today</span>
            </button>
          </div>
        </div>

        {/* Listings Cards Feed */}
        {activeListings.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-harbor-200 dark:border-harbor-700 rounded-3xl p-8 space-y-3">
            <Package className="w-12 h-12 text-harbor-400 mx-auto" />
            <h3 className="font-bold text-base text-harbor-800 dark:text-slate-200">
              No Surplus Food Available Matching Current Filter
            </h3>
            <p className="text-xs text-harbor-500 dark:text-slate-400 max-w-md mx-auto">
              Check back shortly or reset your filters. New surplus portions are uploaded after commercial meal services.
            </p>
            {(selectedCategory !== 'all' || filterFitsToday) && (
              <button
                onClick={() => { setSelectedCategory('all'); setFilterFitsToday(false); }}
                className="mt-2 min-h-touch px-4 py-2 rounded-xl bg-teal-600 text-white font-bold text-xs shadow-sm hover:bg-teal-700 transition-colors"
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {activeListings.map((item) => {
              const remainingTime = getRemainingTimeMeta(item.expiresAt);
              const isFullyClaimed = item.remainingQuantity <= 0;
              const hasUserClaimed = activeUserClaims.some(c => c.listingId === item.id);

              return (
                <div 
                  key={item.id}
                  className={`p-6 rounded-3xl border transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6 ${
                    isFullyClaimed
                      ? 'border-harbor-200 dark:border-harbor-700 bg-harbor-50/50 dark:bg-harbor-850/40 opacity-75'
                      : 'border-harbor-200 dark:border-harbor-700 bg-white dark:bg-harbor-850 hover:border-teal-400 dark:hover:border-teal-600 shadow-sm'
                  }`}
                >
                  <div className="space-y-3 max-w-3xl">
                    {/* Top Row: Tags and Live Urgency Countdown Badge */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300">
                        {formatCategory(item.foodCategory)}
                      </span>

                      {/* Live Urgency Countdown Badge */}
                      {remainingTime.isCritical ? (
                        <span className="inline-flex items-center text-xs font-bold px-2.5 py-0.5 rounded-md bg-red-100 text-red-800 dark:bg-red-950/70 dark:text-red-300 border border-red-300 dark:border-red-800 animate-pulse">
                          <AlertTriangle className="w-3.5 h-3.5 mr-1 text-red-600 dark:text-red-400" />
                          CRITICAL: {remainingTime.text}
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                          <Clock className="w-3.5 h-3.5 mr-1 text-amber-600 dark:text-amber-400" />
                          {remainingTime.text}
                        </span>
                      )}

                      {isFullyClaimed && (
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-harbor-200 text-harbor-800 dark:bg-harbor-700 dark:text-slate-300">
                          Fully Claimed
                        </span>
                      )}

                      {hasUserClaimed && (
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          You have a claim on this
                        </span>
                      )}
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h3 className="font-bold text-lg text-harbor-900 dark:text-white leading-snug">
                        {item.title}
                      </h3>
                      <p className="text-xs text-harbor-600 dark:text-slate-300 mt-1 line-clamp-2">
                        {item.description}
                      </p>
                    </div>

                    {/* Donor & Coarse Location (NEVER exact address) */}
                    <div className="text-xs text-harbor-600 dark:text-slate-400 flex flex-wrap items-center gap-2">
                      <span className="font-bold text-harbor-900 dark:text-white flex items-center">
                        <Building2 className="w-3.5 h-3.5 mr-1 text-teal-600" />
                        {item.donorName || 'Verified Donor'}
                      </span>
                      <span>•</span>
                      <span className="flex items-center text-harbor-700 dark:text-slate-300 font-medium">
                        <MapPin className="w-3.5 h-3.5 mr-0.5 text-harbor-400" />
                        {item.coarseLocation.locality}, {item.coarseLocation.city}
                      </span>
                      <span className="text-[11px] text-harbor-400 dark:text-slate-500 italic">
                        (Exact address provided upon confirmed claim)
                      </span>
                    </div>

                    {/* Quantity & Safety Badges */}
                    <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                      <div className="font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/50 px-3 py-1 rounded-xl border border-teal-200 dark:border-teal-800">
                        {isFullyClaimed ? (
                          <span>0 remaining of {item.totalQuantity} {item.unit}</span>
                        ) : (
                          <span>Remaining: {item.remainingQuantity} of {item.totalQuantity} {item.unit}</span>
                        )}
                      </div>

                      <span className="flex items-center text-emerald-700 dark:text-emerald-400 font-medium">
                        <ShieldCheck className="w-3.5 h-3.5 mr-1 text-[#16A34A]" /> 4-Point Safety Declared
                      </span>

                      <span className="text-harbor-500 dark:text-slate-400 font-medium">
                        Pickup: {formatPickupWindow(item.pickupWindowStart, item.pickupWindowEnd)}
                      </span>
                    </div>
                  </div>

                  {/* Claim Action Button (48px+ touch target) */}
                  <div className="flex flex-col items-start lg:items-end justify-center gap-2 shrink-0">
                    <button
                      onClick={() => handleOpenClaimModal(item)}
                      disabled={isFullyClaimed || !isVerified}
                      className={`min-h-touch px-6 py-3 rounded-2xl font-bold text-sm transition-all flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                        isFullyClaimed
                          ? 'bg-harbor-200 dark:bg-harbor-700 text-harbor-400 dark:text-slate-500 cursor-not-allowed'
                          : !isVerified
                          ? 'bg-harbor-100 dark:bg-harbor-800 text-harbor-400 dark:text-slate-500 border border-harbor-300 dark:border-harbor-700 cursor-not-allowed'
                          : 'bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white shadow-teal-glow'
                      }`}
                    >
                      <span>{isFullyClaimed ? 'Fully Claimed' : 'Claim Portions'}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    {!isVerified && !isFullyClaimed && (
                      <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                        Verification required to claim
                      </span>
                    )}
                    {isVerified && !isFullyClaimed && (
                      <span className="text-[11px] text-harbor-400 dark:text-slate-400">
                        Partial quantity permitted
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Offline Handshake Explainer */}
      <div className="p-6 rounded-2xl bg-white dark:bg-harbor-800 border border-harbor-200 dark:border-harbor-700 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start space-x-3">
          <Truck className="w-6 h-6 text-teal-600 dark:text-teal-400 shrink-0 mt-1" />
          <div>
            <div className="font-bold text-sm text-harbor-900 dark:text-white">
              Zero-Perishable Food Waste Protocol
            </div>
            <div className="text-xs text-harbor-600 dark:text-slate-300 mt-0.5">
              Claims decrement portion counters in real time. Please arrive during the designated window with clean food-grade transport containers.
            </div>
          </div>
        </div>
      </div>

      {/* CLAIM PORTIONS MODAL (STEPPER & CONFIRMATION) */}
      {selectedListingForClaim && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-harbor-800 border border-harbor-200 dark:border-harbor-700 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 animate-scale-in">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-harbor-100 dark:border-harbor-700 pb-4">
              <div>
                <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
                  Reserve Surplus Food
                </span>
                <h3 className="text-xl font-bold text-harbor-900 dark:text-white mt-0.5">
                  {selectedListingForClaim.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedListingForClaim(null)}
                className="p-2 text-harbor-400 hover:text-harbor-700 dark:hover:text-white rounded-xl hover:bg-harbor-100 dark:hover:bg-harbor-700 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error banner */}
            {claimError && (
              <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-xs text-red-900 dark:text-red-200 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{claimError}</span>
              </div>
            )}

            {/* Stepper: "How many portions do you need?" */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-harbor-900 dark:text-white">
                  How many portions do you need?
                </label>
                <span className="text-xs font-semibold text-harbor-500 dark:text-slate-400">
                  {selectedListingForClaim.remainingQuantity} {selectedListingForClaim.unit} available
                </span>
              </div>

              {/* Stepper with 48px+ touch targets */}
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setClaimQuantity(prev => Math.max(1, prev - 1))}
                  disabled={claimQuantity <= 1}
                  className="w-14 h-14 rounded-2xl border border-harbor-300 dark:border-harbor-600 bg-harbor-50 dark:bg-harbor-850 hover:bg-harbor-100 dark:hover:bg-harbor-700 text-harbor-800 dark:text-white flex items-center justify-center font-bold text-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all focus:outline-none focus:ring-2 focus:ring-teal-500"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-5 h-5" />
                </button>

                <div className="flex-1">
                  <input
                    type="number"
                    min={1}
                    max={selectedListingForClaim.remainingQuantity}
                    value={claimQuantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (isNaN(val)) setClaimQuantity(1);
                      else setClaimQuantity(Math.max(1, Math.min(selectedListingForClaim.remainingQuantity, val)));
                    }}
                    className="w-full h-14 text-center font-bold text-2xl rounded-2xl border border-harbor-300 dark:border-harbor-600 bg-white dark:bg-harbor-850 text-harbor-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <div className="text-center text-[11px] text-harbor-500 dark:text-slate-400 mt-1 uppercase font-semibold">
                    {selectedListingForClaim.unit}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setClaimQuantity(prev => Math.min(selectedListingForClaim.remainingQuantity, prev + 1))}
                  disabled={claimQuantity >= selectedListingForClaim.remainingQuantity}
                  className="w-14 h-14 rounded-2xl border border-harbor-300 dark:border-harbor-600 bg-harbor-50 dark:bg-harbor-850 hover:bg-harbor-100 dark:hover:bg-harbor-700 text-harbor-800 dark:text-white flex items-center justify-center font-bold text-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all focus:outline-none focus:ring-2 focus:ring-teal-500"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex items-center space-x-2 pt-1">
                <button
                  type="button"
                  onClick={() => setClaimQuantity(selectedListingForClaim.remainingQuantity)}
                  className="px-3 py-1.5 rounded-xl border border-harbor-200 dark:border-harbor-700 bg-harbor-50 dark:bg-harbor-850 hover:border-teal-500 text-xs font-semibold text-harbor-700 dark:text-slate-300 transition-colors"
                >
                  Take All ({selectedListingForClaim.remainingQuantity} {selectedListingForClaim.unit})
                </button>
                {selectedListingForClaim.remainingQuantity >= 4 && (
                  <button
                    type="button"
                    onClick={() => setClaimQuantity(Math.floor(selectedListingForClaim.remainingQuantity / 2))}
                    className="px-3 py-1.5 rounded-xl border border-harbor-200 dark:border-harbor-700 bg-harbor-50 dark:bg-harbor-850 hover:border-teal-500 text-xs font-semibold text-harbor-700 dark:text-slate-300 transition-colors"
                  >
                    Take Half ({Math.floor(selectedListingForClaim.remainingQuantity / 2)} {selectedListingForClaim.unit})
                  </button>
                )}
              </div>
            </div>

            {/* Confirmation Summary Card */}
            <div className="bg-harbor-50 dark:bg-harbor-850 rounded-2xl p-4 border border-harbor-200 dark:border-harbor-700 text-xs space-y-2">
              <div className="font-bold text-harbor-900 dark:text-white text-xs uppercase tracking-wider">
                Claim Summary
              </div>
              <div className="flex justify-between text-harbor-600 dark:text-slate-300">
                <span>Portions to Claim:</span>
                <strong className="text-harbor-900 dark:text-white">{claimQuantity} {selectedListingForClaim.unit}</strong>
              </div>
              <div className="flex justify-between text-harbor-600 dark:text-slate-300">
                <span>Remaining on FoodLink:</span>
                <span className="text-harbor-700 dark:text-slate-200">{selectedListingForClaim.remainingQuantity - claimQuantity} {selectedListingForClaim.unit}</span>
              </div>
              <div className="flex justify-between text-harbor-600 dark:text-slate-300">
                <span>Pickup Window:</span>
                <span className="text-harbor-900 dark:text-white font-medium">
                  {formatPickupWindow(selectedListingForClaim.pickupWindowStart, selectedListingForClaim.pickupWindowEnd)}
                </span>
              </div>
              <div className="flex justify-between text-harbor-600 dark:text-slate-300">
                <span>Donor Kitchen:</span>
                <span className="text-harbor-900 dark:text-white font-medium">{selectedListingForClaim.donorName}</span>
              </div>
              <div className="text-[11px] text-teal-700 dark:text-teal-300 pt-1 border-t border-harbor-200 dark:border-harbor-700">
                Exact kitchen address and phone contact will be revealed immediately upon confirmation.
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedListingForClaim(null)}
                className="min-h-touch flex-1 py-3 rounded-2xl border border-harbor-300 dark:border-harbor-600 hover:bg-harbor-50 dark:hover:bg-harbor-700 text-harbor-700 dark:text-slate-300 font-bold text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmClaim}
                disabled={isSubmittingClaim || claimQuantity <= 0}
                className="min-h-touch flex-1 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold text-xs shadow-teal-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isSubmittingClaim ? (
                  <span>Reserving Portions...</span>
                ) : (
                  <span>Confirm Claim ({claimQuantity} {selectedListingForClaim.unit})</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL: CANCEL CLAIM */}
      <ConfirmationModal
        isOpen={Boolean(listingIdToCancel)}
        title="Cancel Food Reservation?"
        message="Are you sure you want to cancel your confirmed claim? The portions you reserved will be immediately returned to the surplus food pool for other shelters and elder care homes to rescue."
        confirmLabel={isCancelling ? 'Restoring portions...' : 'Yes, Cancel Reservation'}
        cancelLabel="Keep Reservation"
        isDestructive={true}
        isLoading={isCancelling}
        onConfirm={handleConfirmCancelClaim}
        onCancel={() => setListingIdToCancel(null)}
      />

      {/* Document Submission Modal for Verification */}
      <DocumentSubmissionModal
        isOpen={isDocModalOpen}
        onClose={() => setIsDocModalOpen(false)}
      />
    </div>
  );
};
