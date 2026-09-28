import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Utensils, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  PlusCircle, 
  ShieldCheck, 
  MapPin, 
  Calendar,
  Sparkles,
  PartyPopper,
  Info
} from 'lucide-react';

import { useState } from 'react';
import { useVerification } from '../../context/VerificationContext';
import { useListings } from '../../context/ListingContext';
import { DocumentSubmissionModal } from '../verification/DocumentSubmissionModal';
import { CreateListingModal } from '../listings/CreateListingModal';
import { ConfirmationModal } from '../common/ConfirmationModal';
import { ListingCardSkeleton } from '../common/LoadingSkeleton';
import { 
  XCircle,
  FileCheck,
  Ban
} from 'lucide-react';

interface DonorDashboardProps {
  onOpenCreateListing?: () => void;
}

export const DonorDashboard: React.FC<DonorDashboardProps> = ({ onOpenCreateListing }) => {
  const { user } = useAuth();
  const { getUserDocument } = useVerification();
  const { listings, cancelListing, isLoading } = useListings();
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [listingToCancel, setListingToCancel] = useState<string | null>(null);

  if (!user) return null;

  const isRestaurant = user.subRole === 'restaurant';
  const userDoc = getUserDocument(user.uid);
  const currentStatus = userDoc ? userDoc.status : user.verificationStatus;
  const isVerified = currentStatus === 'verified';
  const isRejected = currentStatus === 'rejected';
  const activeRejectionReason = userDoc?.rejectionReason || user.rejectionReason;

  const myListings = listings.filter(l => l.donorUid === user.uid);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Top Welcome & Profile Card */}
      <div className="bg-white dark:bg-harbor-800 rounded-3xl border border-harbor-200 dark:border-harbor-700 p-6 sm:p-8 shadow-sm transition-all">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
              {isRestaurant ? (
                <Utensils className="w-8 h-8" />
              ) : (
                <PartyPopper className="w-8 h-8" />
              )}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-harbor-900 dark:text-white">
                  {user.organizationName || user.displayName}
                </h1>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300">
                  {isRestaurant ? 'Commercial Restaurant Donor' : 'Wedding / Event Host'}
                </span>
                
                {isVerified ? (
                  <span className="inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-[#16A34A]" /> Verified Food Donor
                  </span>
                ) : isRejected ? (
                  <span className="inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border border-red-300 dark:border-red-800">
                    <XCircle className="w-3.5 h-3.5 mr-1 text-red-600" /> Verification Rejected
                  </span>
                ) : (
                  <span className="inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                    <AlertCircle className="w-3.5 h-3.5 mr-1 text-amber-600" /> Document Review Pending
                  </span>
                )}
              </div>
              <p className="text-sm text-harbor-500 dark:text-slate-400 flex items-center gap-2">
                <span>Contact: {user.displayName}</span>
                <span>•</span>
                <span className="flex items-center"><MapPin className="w-3.5 h-3.5 mr-0.5" /> {user.city || 'Bengaluru'}</span>
                {user.phone && (
                  <>
                    <span>•</span>
                    <span>{user.phone}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsDocModalOpen(true)}
              className="min-h-touch px-4 py-2.5 rounded-2xl border border-harbor-200 dark:border-harbor-700 bg-white dark:bg-harbor-850 hover:border-teal-500 text-xs font-bold text-harbor-800 dark:text-slate-200 transition-all flex items-center space-x-1.5 shadow-sm"
            >
              <FileCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>{isRejected ? 'Resubmit Verification Document' : isVerified ? 'View Verification Details' : 'Submit Document'}</span>
            </button>

            <button
              onClick={onOpenCreateListing || (() => setIsCreateModalOpen(true))}
              className="min-h-touch px-6 py-3 rounded-2xl bg-[#2563EB] hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm shadow-md transition-all flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <PlusCircle className="w-5 h-5" />
              <span>List Food Surplus</span>
            </button>
          </div>
        </div>

        {/* Verification Status Banner: REJECTED */}
        {isRejected && (
          <div className="mt-6 p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-red-900 dark:text-red-200">
            <div className="flex items-start space-x-3">
              <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-red-800 dark:text-red-100">Verification Document Rejected: </span>
                <span className="italic font-medium">"{activeRejectionReason || 'Document could not be verified by Safety Admin.'}"</span>
                <p className="mt-1 text-red-700 dark:text-red-300">
                  Please update and resubmit your valid FSSAI or kitchen documentation to enable verified shelter claims.
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsDocModalOpen(true)}
              className="min-h-[38px] px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shrink-0 transition-colors shadow-sm"
            >
              Resubmit Verification
            </button>
          </div>
        )}

        {/* Verification Status Banner: PENDING */}
        {!isVerified && !isRejected && (
          <div className="mt-6 p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-amber-900 dark:text-amber-200">
            <div className="flex items-start space-x-3">
              <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Verification In Progress: </span>
                {userDoc ? (
                  <span>
                    Your {userDoc.name} (Ref: <span className="font-mono font-bold">{userDoc.documentNumber}</span>) is awaiting safety review.
                  </span>
                ) : (
                  <span>
                    Your profile is pending document review. You can list food surplus; verified shelter matching unlocks upon safety clearance.
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => setIsDocModalOpen(true)}
              className="min-h-[36px] px-3.5 py-1.5 rounded-xl border border-amber-300 dark:border-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-amber-900 dark:text-amber-100 font-semibold text-xs shrink-0 transition-colors"
            >
              {userDoc ? 'Update Document' : 'Submit FSSAI Document'}
            </button>
          </div>
        )}

        {/* Verification Status Banner: VERIFIED */}
        {isVerified && user.verificationExpiryDate && (
          <div className="mt-6 p-3.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between text-xs text-emerald-900 dark:text-emerald-200">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
              <span>
                <strong>Verified Partner:</strong> Valid until {new Date(user.verificationExpiryDate).toLocaleDateString()} (180-Day Safety Clearance Active).
              </span>
            </div>
            <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
              Auto-Renew Enabled
            </span>
          </div>
        )}
      </div>

      <DocumentSubmissionModal
        isOpen={isDocModalOpen}
        onClose={() => setIsDocModalOpen(false)}
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-harbor-800 border border-harbor-200 dark:border-harbor-700 shadow-sm">
          <div className="text-xs font-semibold text-harbor-500 dark:text-slate-400 uppercase tracking-wider">Active Listings</div>
          <div className="text-3xl font-bold text-harbor-900 dark:text-white mt-1">1</div>
          <div className="text-[11px] text-teal-600 dark:text-teal-400 font-medium mt-1 flex items-center">
            <Sparkles className="w-3 h-3 mr-1" /> Ready for pickup handshake
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-harbor-800 border border-harbor-200 dark:border-harbor-700 shadow-sm">
          <div className="text-xs font-semibold text-harbor-500 dark:text-slate-400 uppercase tracking-wider">Meals Rescued</div>
          <div className="text-3xl font-bold text-harbor-900 dark:text-white mt-1">120+</div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1 flex items-center">
            <CheckCircle2 className="w-3 h-3 mr-1" /> Reached verified shelters
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-harbor-800 border border-harbor-200 dark:border-harbor-700 shadow-sm">
          <div className="text-xs font-semibold text-harbor-500 dark:text-slate-400 uppercase tracking-wider">Safety Pledges</div>
          <div className="text-3xl font-bold text-harbor-900 dark:text-white mt-1">100%</div>
          <div className="text-[11px] text-teal-600 dark:text-teal-400 font-medium mt-1 flex items-center">
            <ShieldCheck className="w-3 h-3 mr-1" /> All listings safety-declared
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-harbor-800 border border-harbor-200 dark:border-harbor-700 shadow-sm">
          <div className="text-xs font-semibold text-harbor-500 dark:text-slate-400 uppercase tracking-wider">Avg Pickup Time</div>
          <div className="text-3xl font-bold text-harbor-900 dark:text-white mt-1">38 min</div>
          <div className="text-[11px] text-harbor-500 dark:text-slate-400 font-medium mt-1 flex items-center">
            <Clock className="w-3 h-3 mr-1" /> From list to OTP verification
          </div>
        </div>
      </div>

      {/* Active Surplus Listings Section */}
      <div className="bg-white dark:bg-harbor-800 rounded-3xl border border-harbor-200 dark:border-harbor-700 p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-harbor-900 dark:text-white flex items-center space-x-2">
              <span>Your Surplus Food Listings (My Listings)</span>
            </h2>
            <p className="text-xs text-harbor-500 dark:text-slate-400 mt-0.5">
              Broadcast to verified elder care homes, orphanages, and shelters in your sector.
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800">
            {myListings.length} {myListings.length === 1 ? 'Batch' : 'Batches'}
          </span>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <ListingCardSkeleton />
            <ListingCardSkeleton />
          </div>
        ) : myListings.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border-2 border-dashed border-harbor-200 dark:border-harbor-700 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 mx-auto flex items-center justify-center">
              <Utensils className="w-6 h-6" />
            </div>
            <div className="text-sm font-bold text-harbor-900 dark:text-white">
              No Surplus Food Batches Listed Yet
            </div>
            <p className="text-xs text-harbor-500 dark:text-slate-400 max-w-md mx-auto">
              When you have extra portions or event surplus, click "List Food Surplus" above to declare food safety and connect directly with verified shelters.
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="min-h-[44px] px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-teal-glow transition-all"
            >
              Create Your First Surplus Listing
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {myListings.map((item) => (
              <div 
                key={item.id}
                className="p-5 rounded-2xl border border-harbor-200 dark:border-harbor-700 bg-harbor-50/50 dark:bg-harbor-850 hover:border-teal-400 dark:hover:border-teal-600 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2 max-w-xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-base text-harbor-900 dark:text-white">
                      {item.title}
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200">
                      {item.remainingQuantity} / {item.totalQuantity} {item.unit}
                    </span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-md border flex items-center ${
                      item.status === 'active' 
                        ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800' 
                        : 'bg-harbor-100 text-harbor-600 dark:bg-harbor-700 dark:text-slate-400 border-harbor-300'
                    }`}>
                      <Clock className="w-3 h-3 mr-1" /> {item.status.toUpperCase()}
                    </span>
                  </div>

                  {item.eventName && (
                    <p className="text-xs text-teal-700 dark:text-teal-300 font-medium">
                      Event: {item.eventName} ({item.estimatedGuests || 0} guests catered)
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-3 text-xs text-harbor-500 dark:text-slate-400">
                    <span className="flex items-center text-teal-700 dark:text-teal-300 font-medium">
                      <ShieldCheck className="w-3.5 h-3.5 text-teal-600 mr-1" /> 4-Point Safety Verified
                    </span>
                    <span>•</span>
                    <span className="flex items-center">
                      <MapPin className="w-3.5 h-3.5 text-harbor-400 mr-1" /> {item.coarseLocation?.locality || 'Locality'}, {item.coarseLocation?.city || 'Bengaluru'}
                    </span>
                    <span>•</span>
                    <span>Allergens: {(item.allergens || []).join(', ') || 'None'}</span>
                  </div>
                </div>

                {/* Actions & Status */}
                <div className="flex items-center gap-3 shrink-0">
                  {item.status === 'active' ? (
                    <button
                      onClick={() => setListingToCancel(item.id)}
                      className="min-h-[40px] px-4 py-2 rounded-xl border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 text-xs font-bold transition-colors flex items-center space-x-1.5"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span>Cancel Listing</span>
                    </button>
                  ) : (
                    <span className="text-xs text-harbor-400 italic">
                      Listing Cancelled
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Routine Recommendations */}
      <div className="p-6 rounded-2xl bg-teal-50/60 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start space-x-3">
          <Calendar className="w-6 h-6 text-teal-600 dark:text-teal-400 shrink-0 mt-1" />
          <div>
            <div className="font-bold text-sm text-harbor-900 dark:text-white">
              {isRestaurant ? 'Set Up Daily Closing Surplus Schedule' : 'Schedule Large Event Surplus in Advance'}
            </div>
            <div className="text-xs text-harbor-600 dark:text-slate-300 mt-0.5">
              {isRestaurant
                ? 'Automate notifications to elder shelters each night at 10:30 PM for predictable pickup.'
                : 'Enter your function date and expected guest count so nearby shelters can reserve transport ahead of time.'}
            </div>
          </div>
        </div>
        <button className="min-h-[40px] px-4 py-2 rounded-xl border border-teal-600 dark:border-teal-500 text-teal-700 dark:text-teal-300 font-semibold text-xs hover:bg-teal-100 dark:hover:bg-teal-900/40 transition-colors shrink-0">
          Configure Schedule
        </button>
      </div>

      {/* Create Listing Modal */}
      <CreateListingModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onOpenVerificationModal={() => setIsDocModalOpen(true)}
      />

      {/* Cancel Listing Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(listingToCancel)}
        title="Cancel Surplus Food Listing?"
        message="Are you sure you want to cancel this listing? Care shelters and orphanages will no longer be able to claim portions from this batch."
        confirmLabel="Yes, Cancel Listing"
        cancelLabel="Keep Listing Active"
        isDestructive={true}
        onConfirm={async () => {
          if (listingToCancel) {
            await cancelListing(listingToCancel);
            setListingToCancel(null);
          }
        }}
        onCancel={() => setListingToCancel(null)}
      />

    </div>
  );
};
