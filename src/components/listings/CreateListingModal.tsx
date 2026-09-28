import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useListings, type CreateListingInput } from '../../context/ListingContext';
import { 
  X, 
  ShieldCheck, 
  Clock, 
  MapPin, 
  AlertTriangle, 
  CheckCircle2, 
  Utensils, 
  PartyPopper,
  Lock,
  HeartHandshake
} from 'lucide-react';

interface CreateListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenVerificationModal?: () => void;
  onListingCreated?: () => void;
}

export const CreateListingModal: React.FC<CreateListingModalProps> = ({
  isOpen,
  onClose,
  onOpenVerificationModal,
  onListingCreated
}) => {
  const { user } = useAuth();
  const { createListing } = useListings();

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [foodCategory, setFoodCategory] = useState('cooked_meals');
  const [totalQuantity, setTotalQuantity] = useState<number>(30);
  const [unit, setUnit] = useState<'boxes' | 'kg' | 'plates'>('boxes');
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>(['dairy']);
  // Real date-time picker helpers and state (Firestore Timestamps)
  const toDateTimeLocal = (d: Date) => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const [pickupStart, setPickupStart] = useState(() => toDateTimeLocal(new Date()));
  const [pickupEnd, setPickupEnd] = useState(() => toDateTimeLocal(new Date(Date.now() + 3 * 3600 * 1000)));
  const [expiresAt, setExpiresAt] = useState(() => toDateTimeLocal(new Date(Date.now() + 4 * 3600 * 1000)));

  // Coarse & Private Location
  const [locality, setLocality] = useState(user?.city === 'Bengaluru' ? 'Indiranagar' : 'Central Market');
  const [city, setCity] = useState(user?.city || 'Bengaluru');
  const [exactAddress, setExactAddress] = useState(user?.address || '');
  const [contactPhone, setContactPhone] = useState(user?.phone || '+91 98765 43210');
  const [instructions, setInstructions] = useState('Collect from kitchen dispatch counter / security gate.');

  // Individual / Event Donor Fields
  const isEventDonor = user?.subRole === 'individual_event';
  const [eventName, setEventName] = useState(isEventDonor ? 'Wedding Reception Dinner' : '');
  const [estimatedGuests, setEstimatedGuests] = useState<number>(isEventDonor ? 150 : 0);

  // 4 Mandatory Safety Declarations
  const [tempSafe, setTempSafe] = useState(false);
  const [hygienicSafe, setHygienicSafe] = useState(false);
  const [allergensSafe, setAllergensSafe] = useState(false);
  const [freshSafe, setFreshSafe] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const isVerified = user?.verificationStatus === 'verified';
  const allSafetyPledged = tempSafe && hygienicSafe && allergensSafe && freshSafe;

  // Toggle allergen
  const toggleAllergen = (item: string) => {
    if (selectedAllergens.includes(item)) {
      setSelectedAllergens(selectedAllergens.filter(a => a !== item));
    } else {
      setSelectedAllergens([...selectedAllergens, item]);
    }
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!isVerified) {
      setErrorMessage('Unverified Donor: You must complete verification before publishing surplus listings.');
      return;
    }

    if (!allSafetyPledged) {
      setErrorMessage('Food Safety Requirement: All 4 mandatory safety declarations must be checked.');
      return;
    }

    if (!title.trim() || !exactAddress.trim()) {
      setErrorMessage('Please provide a listing title and exact pickup address.');
      return;
    }

    if (totalQuantity <= 0) {
      setErrorMessage('Total quantity must be a positive number.');
      return;
    }

    setIsSubmitting(true);

    try {
      const input: CreateListingInput = {
        title: title.trim(),
        description: description.trim() || 'Freshly prepared nutritious meals packaged safely for shelter delivery.',
        foodCategory,
        allergens: selectedAllergens,
        totalQuantity,
        unit,
        preparedAt: new Date(pickupStart).toISOString(),
        expiresAt: new Date(expiresAt).toISOString(),
        pickupWindowStart: new Date(pickupStart).toISOString(),
        pickupWindowEnd: new Date(pickupEnd).toISOString(),
        coarseLocation: {
          locality: locality.trim(),
          city: city.trim(),
          lat: 12.978,
          lng: 77.640
        },
        exactAddress: exactAddress.trim(),
        contactPhone: contactPhone.trim(),
        instructions: instructions.trim(),
        safetyDeclaration: {
          temperatureSafe: tempSafe,
          hygienicallyPrepared: hygienicSafe,
          allergensDisclosed: allergensSafe,
          freshAtListing: freshSafe
        },
        eventName: isEventDonor ? eventName : undefined,
        estimatedGuests: isEventDonor ? estimatedGuests : undefined
      };

      await createListing(input);
      setSuccessMessage('Surplus Food Listing successfully published! Verified shelters in your vicinity have been notified.');
      setTimeout(() => {
        if (onListingCreated) onListingCreated();
        onClose();
      }, 1400);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to publish listing.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-harbor-950/75 backdrop-blur-sm animate-fade-in overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-white dark:bg-harbor-800 rounded-3xl border border-harbor-200 dark:border-harbor-700 shadow-2xl overflow-hidden my-6 transition-all max-h-[94vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-harbor-100 dark:border-harbor-700 bg-harbor-50/50 dark:bg-harbor-850 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              {isEventDonor ? <PartyPopper className="w-5 h-5" /> : <Utensils className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-harbor-900 dark:text-white">
                {isEventDonor ? 'Donate Event Surplus Food' : 'List Surplus Food Meals'}
              </h2>
              <p className="text-xs text-harbor-500 dark:text-slate-400">
                Broadcast safe surplus meals directly to verified shelters & orphanages
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="min-h-touch min-w-touch p-2 rounded-xl text-harbor-400 hover:text-harbor-700 dark:hover:text-slate-200 hover:bg-harbor-100 dark:hover:bg-harbor-700 transition-colors flex items-center justify-center"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="overflow-y-auto p-6 space-y-6">

          {/* UNVERIFIED BLOCKER BANNER */}
          {!isVerified && (
            <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/80 text-amber-900 dark:text-amber-200">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-sm text-amber-950 dark:text-amber-100">
                    Verification Clearance Required Before Listing
                  </h3>
                  <p className="text-xs text-amber-800 dark:text-amber-300 mt-1 leading-relaxed">
                    To safeguard vulnerable senior citizens, orphanages, and shelter residents, FoodLink strictly restricts surplus food listing to verified partners holding valid FSSAI food safety licenses or government registration.
                  </p>
                  <div className="mt-3 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        if (onOpenVerificationModal) onOpenVerificationModal();
                      }}
                      className="min-h-[44px] px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-teal-glow transition-all flex items-center space-x-1.5"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Submit Verification Document Now</span>
                    </button>
                    <span className="text-[11px] text-amber-700 dark:text-amber-400">
                      Typical admin review turnaround: &lt; 2 hours
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300 flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* EVENT SPECIFIC FIELDS */}
            {isEventDonor && (
              <div className="p-4 rounded-2xl bg-teal-50/60 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800/60 space-y-4">
                <div className="text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300 flex items-center space-x-1.5">
                  <PartyPopper className="w-4 h-4" />
                  <span>Function / Event Details</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-harbor-700 dark:text-slate-300 mb-1">
                      Event / Wedding Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={eventName}
                      onChange={(e) => setEventName(e.target.value)}
                      placeholder="e.g. Sharma Family Wedding Reception"
                      className="w-full min-h-touch px-3 rounded-xl border border-harbor-200 dark:border-harbor-700 bg-white dark:bg-harbor-850 text-sm text-harbor-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-harbor-700 dark:text-slate-300 mb-1">
                      Estimated Guests Catered *
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={estimatedGuests}
                      onChange={(e) => setEstimatedGuests(parseInt(e.target.value) || 0)}
                      placeholder="e.g. 200"
                      className="w-full min-h-touch px-3 rounded-xl border border-harbor-200 dark:border-harbor-700 bg-white dark:bg-harbor-850 text-sm text-harbor-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* BASIC DETAILS */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-harbor-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Surplus Meal Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Fresh Vegetable Pulao & Dal Makhani (Dinner Surplus)"
                  className="w-full min-h-touch px-3 rounded-xl border border-harbor-200 dark:border-harbor-700 bg-white dark:bg-harbor-850 text-sm text-harbor-900 dark:text-white placeholder-harbor-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-harbor-700 dark:text-slate-300 mb-1">
                    Food Category *
                  </label>
                  <select
                    value={foodCategory}
                    onChange={(e) => setFoodCategory(e.target.value)}
                    className="w-full min-h-touch px-3 rounded-xl border border-harbor-200 dark:border-harbor-700 bg-white dark:bg-harbor-850 text-sm text-harbor-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="cooked_meals">Cooked Prepared Meals</option>
                    <option value="packaged_grocery">Packaged Groceries</option>
                    <option value="fresh_produce">Fresh Produce</option>
                    <option value="bakery">Bakery & Breads</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-harbor-700 dark:text-slate-300 mb-1">
                    Total Quantity *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={totalQuantity}
                    onChange={(e) => setTotalQuantity(parseInt(e.target.value) || 1)}
                    className="w-full min-h-touch px-3 rounded-xl border border-harbor-200 dark:border-harbor-700 bg-white dark:bg-harbor-850 text-sm text-harbor-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-harbor-700 dark:text-slate-300 mb-1">
                    Unit Type *
                  </label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as any)}
                    className="w-full min-h-touch px-3 rounded-xl border border-harbor-200 dark:border-harbor-700 bg-white dark:bg-harbor-850 text-sm text-harbor-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="boxes">Meal Boxes</option>
                    <option value="plates">Plates / Portions</option>
                    <option value="kg">Kilograms (kg)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-harbor-700 dark:text-slate-300 mb-1">
                  Preparation Notes & Packaging Details
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Packed in clean 500ml food-grade containers. Mild spices suitable for elder care residents."
                  className="w-full p-3 rounded-xl border border-harbor-200 dark:border-harbor-700 bg-white dark:bg-harbor-850 text-sm text-harbor-900 dark:text-white placeholder-harbor-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* ALLERGENS DISCLOSURE */}
              <div>
                <label className="block text-xs font-semibold text-harbor-700 dark:text-slate-300 mb-1.5">
                  Disclose Common Allergens (Protects seniors & children)
                </label>
                <div className="flex flex-wrap gap-2">
                  {['dairy', 'nuts', 'gluten', 'soy', 'eggs', 'none'].map((alg) => {
                    const active = selectedAllergens.includes(alg);
                    return (
                      <button
                        type="button"
                        key={alg}
                        onClick={() => toggleAllergen(alg)}
                        className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize border transition-all ${
                          active 
                            ? 'bg-teal-500 text-white border-teal-600 shadow-sm' 
                            : 'bg-white dark:bg-harbor-850 text-harbor-700 dark:text-slate-300 border-harbor-200 dark:border-harbor-700 hover:border-teal-500'
                        }`}
                      >
                        {active && <CheckCircle2 className="w-3.5 h-3.5 inline mr-1" />}
                        {alg}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* TIME WINDOW & REAL DATE-TIME PICKERS (STORED AS FIRESTORE TIMESTAMPS) */}
            <div className="p-4 rounded-2xl bg-harbor-50/80 dark:bg-harbor-850/80 border border-harbor-200 dark:border-harbor-700 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-harbor-700 dark:text-slate-300 flex items-center space-x-1.5">
                  <Clock className="w-4 h-4 text-teal-600" />
                  <span>Pickup Window & Safe Expiry (Exact Date-Time)</span>
                </span>
                <span className="text-[11px] font-semibold text-harbor-500 dark:text-slate-400">
                  FSSAI Safe Holding Rule (Max 6h for Cooked Food)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-harbor-700 dark:text-slate-300 mb-1">
                    Pickup Window Start *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={pickupStart}
                    onChange={(e) => setPickupStart(e.target.value)}
                    className="w-full min-h-touch px-3 rounded-xl border border-harbor-200 dark:border-harbor-700 bg-white dark:bg-harbor-800 text-xs text-harbor-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-harbor-700 dark:text-slate-300 mb-1">
                    Pickup Window End *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={pickupEnd}
                    onChange={(e) => setPickupEnd(e.target.value)}
                    className="w-full min-h-touch px-3 rounded-xl border border-harbor-200 dark:border-harbor-700 bg-white dark:bg-harbor-800 text-xs text-harbor-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-harbor-700 dark:text-slate-300 mb-1">
                    Safe Expiry Deadline *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="w-full min-h-touch px-3 rounded-xl border border-harbor-200 dark:border-harbor-700 bg-white dark:bg-harbor-800 text-xs text-harbor-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-harbor-800 border border-harbor-200 dark:border-harbor-700 flex items-center justify-between text-xs">
                <span className="text-harbor-600 dark:text-slate-300 font-medium">
                  Stored as precise Firestore Timestamp coordinates for automated expiry sweeps.
                </span>
                <span className="text-[11px] font-bold text-teal-600 dark:text-teal-400">
                  Real Date-Time Format
                </span>
              </div>
            </div>

            {/* LOCATION DETAILS (COARSE PUBLIC VS EXACT PRIVATE) */}
            <div className="p-4 rounded-2xl bg-blue-50/40 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/40 space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold uppercase tracking-wider text-blue-900 dark:text-blue-200 flex items-center space-x-1.5">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span>Location & Privacy Settings</span>
                </div>
                <div className="text-[11px] text-blue-700 dark:text-blue-300 font-medium flex items-center space-x-1">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Address Privacy Protected</span>
                </div>
              </div>

              {/* Coarse Public Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-harbor-700 dark:text-slate-300 mb-1">
                    Locality / Sector (Publicly visible on map) *
                  </label>
                  <input
                    type="text"
                    required
                    value={locality}
                    onChange={(e) => setLocality(e.target.value)}
                    placeholder="e.g. Indiranagar / Koramangala"
                    className="w-full min-h-touch px-3 rounded-xl border border-harbor-200 dark:border-harbor-700 bg-white dark:bg-harbor-850 text-sm text-harbor-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-harbor-700 dark:text-slate-300 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full min-h-touch px-3 rounded-xl border border-harbor-200 dark:border-harbor-700 bg-white dark:bg-harbor-850 text-sm text-harbor-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Confidential Exact Pickup Details */}
              <div className="p-3.5 rounded-xl bg-white dark:bg-harbor-850 border border-blue-100 dark:border-blue-900/60 space-y-3">
                <div className="text-xs font-semibold text-harbor-800 dark:text-slate-200 flex items-center space-x-1.5">
                  <Lock className="w-3.5 h-3.5 text-blue-600" />
                  <span>Confidential Exact Address (Only shared with confirmed recipient shelter)</span>
                </div>

                <div>
                  <input
                    type="text"
                    required
                    value={exactAddress}
                    onChange={(e) => setExactAddress(e.target.value)}
                    placeholder="Full street address, building/venue name, floor, landmark"
                    className="w-full min-h-touch px-3 rounded-xl border border-harbor-200 dark:border-harbor-700 bg-harbor-50/50 dark:bg-harbor-800 text-sm text-harbor-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-harbor-600 dark:text-slate-400 mb-1">
                      Dispatch Contact Phone *
                    </label>
                    <input
                      type="text"
                      required
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="+91 98000 00000"
                      className="w-full min-h-[42px] px-3 rounded-xl border border-harbor-200 dark:border-harbor-700 bg-harbor-50/50 dark:bg-harbor-800 text-xs text-harbor-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-harbor-600 dark:text-slate-400 mb-1">
                      Gate / Entry Instructions
                    </label>
                    <input
                      type="text"
                      value={instructions}
                      onChange={(e) => setInstructions(e.target.value)}
                      placeholder="e.g. Ask for Chef Arjun at loading bay"
                      className="w-full min-h-[42px] px-3 rounded-xl border border-harbor-200 dark:border-harbor-700 bg-harbor-50/50 dark:bg-harbor-800 text-xs text-harbor-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* MANDATORY 4-POINT SAFETY DECLARATION - LABELLED "DECLARED BY DONOR" */}
            <div className="p-5 rounded-2xl bg-teal-50/80 dark:bg-teal-950/40 border-2 border-teal-500/30 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-900 dark:text-teal-200 flex items-center space-x-1.5">
                  <ShieldCheck className="w-5 h-5 text-teal-600" />
                  <span>Declared by donor (Mandatory Self-Declaration)</span>
                </span>
                <span className="text-[11px] font-bold text-teal-700 dark:text-teal-300">
                  {allSafetyPledged ? '4 of 4 Declared' : 'Incomplete'}
                </span>
              </div>
              <p className="text-[11px] text-teal-800/80 dark:text-teal-300/80">
                Self-declaration by food donor prior to listing publication. All criteria start unticked and must be certified.
              </p>

              <div className="space-y-3">
                {/* Check 1 */}
                <label className="flex items-start space-x-3 p-3 rounded-xl bg-white dark:bg-harbor-800 border border-teal-100 dark:border-teal-900/60 hover:border-teal-400 transition-colors cursor-pointer min-h-touch">
                  <input
                    type="checkbox"
                    checked={tempSafe}
                    onChange={(e) => setTempSafe(e.target.checked)}
                    className="w-5 h-5 mt-0.5 rounded text-teal-600 focus:ring-teal-500 border-harbor-300 shrink-0"
                  />
                  <div className="text-xs text-harbor-800 dark:text-slate-200">
                    <span className="font-bold text-harbor-900 dark:text-white block">1. Hot food held above 60°C or cold below 5°C *</span>
                    Food has been continuously maintained within safe holding temperature limits since cooking.
                  </div>
                </label>

                {/* Check 2 */}
                <label className="flex items-start space-x-3 p-3 rounded-xl bg-white dark:bg-harbor-800 border border-teal-100 dark:border-teal-900/60 hover:border-teal-400 transition-colors cursor-pointer min-h-touch">
                  <input
                    type="checkbox"
                    checked={hygienicSafe}
                    onChange={(e) => setHygienicSafe(e.target.checked)}
                    className="w-5 h-5 mt-0.5 rounded text-teal-600 focus:ring-teal-500 border-harbor-300 shrink-0"
                  />
                  <div className="text-xs text-harbor-800 dark:text-slate-200">
                    <span className="font-bold text-harbor-900 dark:text-white block">2. Prepared within the last 4 hours *</span>
                    Food was freshly prepared for today's service within the last 4 hours.
                  </div>
                </label>

                {/* Check 3 */}
                <label className="flex items-start space-x-3 p-3 rounded-xl bg-white dark:bg-harbor-800 border border-teal-100 dark:border-teal-900/60 hover:border-teal-400 transition-colors cursor-pointer min-h-touch">
                  <input
                    type="checkbox"
                    checked={freshSafe}
                    onChange={(e) => setFreshSafe(e.target.checked)}
                    className="w-5 h-5 mt-0.5 rounded text-teal-600 focus:ring-teal-500 border-harbor-300 shrink-0"
                  />
                  <div className="text-xs text-harbor-800 dark:text-slate-200">
                    <span className="font-bold text-harbor-900 dark:text-white block">3. Sealed food-grade packaging *</span>
                    Portions packed in clean, food-grade sealed containers or hygienic thermal boxes.
                  </div>
                </label>

                {/* Check 4 */}
                <label className="flex items-start space-x-3 p-3 rounded-xl bg-white dark:bg-harbor-800 border border-teal-100 dark:border-teal-900/60 hover:border-teal-400 transition-colors cursor-pointer min-h-touch">
                  <input
                    type="checkbox"
                    checked={allergensSafe}
                    onChange={(e) => setAllergensSafe(e.target.checked)}
                    className="w-5 h-5 mt-0.5 rounded text-teal-600 focus:ring-teal-500 border-harbor-300 shrink-0"
                  />
                  <div className="text-xs text-harbor-800 dark:text-slate-200">
                    <span className="font-bold text-harbor-900 dark:text-white block">4. Allergens disclosed *</span>
                    All known ingredients and potential allergens have been transparently identified and checked.
                  </div>
                </label>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="pt-2 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="min-h-touch px-5 py-2.5 rounded-xl border border-harbor-200 dark:border-harbor-700 text-sm font-semibold text-harbor-700 dark:text-slate-300 hover:bg-harbor-100 dark:hover:bg-harbor-700 transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={!isVerified || !allSafetyPledged || isSubmitting}
                className={`min-h-touch px-6 py-3 rounded-xl font-bold text-sm shadow-md transition-all flex items-center space-x-2 ${
                  !isVerified || !allSafetyPledged || isSubmitting
                    ? 'bg-harbor-300 dark:bg-harbor-700 text-harbor-500 dark:text-slate-400 cursor-not-allowed shadow-none'
                    : 'bg-[#2563EB] hover:bg-blue-700 active:bg-blue-800 text-white shadow-blue-500/20'
                }`}
              >
                {isSubmitting ? (
                  <span>Publishing Listing...</span>
                ) : (
                  <>
                    <HeartHandshake className="w-5 h-5" />
                    <span>Publish Surplus Food Listing</span>
                  </>
                )}
              </button>
            </div>

          </form>

        </div>
      </div>
    </div>
  );
};
