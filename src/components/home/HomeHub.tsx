import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Utensils, 
  Heart, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle
} from 'lucide-react';

interface HomeHubProps {
  onNavigateToDonor: () => void;
  onNavigateToRecipient: () => void;
  onOpenCreateListing?: () => void;
  onOpenVerification?: () => void;
}

export const HomeHub: React.FC<HomeHubProps> = ({
  onNavigateToDonor,
  onNavigateToRecipient,
  onOpenCreateListing,
  onOpenVerification
}) => {
  const { user } = useAuth();

  if (!user) return null;

  const isDonor = user.role === 'donor';
  const isRecipient = user.role === 'recipient';
  const isVerified = user.verificationStatus === 'verified';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-br from-harbor-900 to-harbor-800 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-harbor-700/60 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold border border-teal-500/30">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
              <span>FoodLink Caretaker Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user.displayName}
            </h1>
            <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
              Every surplus meal listed on FoodLink reaches verified care homes within safe temperature windows. Choose your primary mission below:
            </p>
          </div>

          {/* Verification Badge */}
          <div className="shrink-0 bg-white/10 dark:bg-harbor-950/60 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-left sm:text-right min-w-[200px]">
            <div className="text-[11px] uppercase font-bold tracking-wider text-slate-300">
              Verification Status
            </div>
            <div className="mt-1 flex items-center sm:justify-end space-x-2">
              {isVerified ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-bold text-sm text-emerald-300">Verified Partner</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="font-bold text-sm text-amber-300">Verification Pending</span>
                </>
              )}
            </div>
            {!isVerified && onOpenVerification && (
              <button
                onClick={onOpenVerification}
                className="mt-2 text-xs text-teal-300 hover:text-teal-200 font-semibold underline underline-offset-2 flex items-center sm:justify-end w-full space-x-1"
              >
                <span>Upload FSSAI / Reg Document</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* TWO BIG ACTION CARDS ("I'm donating food" & "I need food") */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        
        {/* Card 1: I'm donating food */}
        <div 
          onClick={onNavigateToDonor}
          className={`group cursor-pointer rounded-3xl p-6 sm:p-8 border-2 transition-all flex flex-col justify-between relative overflow-hidden bg-white dark:bg-harbor-800 ${
            isDonor 
              ? 'border-teal-500 shadow-teal-glow ring-2 ring-teal-500/20' 
              : 'border-harbor-200 dark:border-harbor-700 hover:border-teal-400 hover:shadow-lg'
          }`}
        >
          {isDonor && (
            <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-200 font-bold text-[11px] uppercase tracking-wider">
              Your Primary Role
            </div>
          )}

          <div className="space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-teal-500 text-white flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <Utensils className="w-8 h-8 stroke-[2.2]" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-harbor-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                I'm donating food
              </h2>
              <p className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
                Restaurants • Catering • Wedding & Function Leftovers
              </p>
              <p className="text-sm text-harbor-600 dark:text-slate-300 leading-relaxed">
                Have freshly prepared surplus food? List your portions with safe holding declarations so registered elder shelters and NGOs can collect immediately.
              </p>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-harbor-100 dark:border-harbor-700 space-y-3">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (isDonor && onOpenCreateListing) {
                  onOpenCreateListing();
                } else {
                  onNavigateToDonor();
                }
              }}
              className="w-full min-h-[52px] px-6 py-3 rounded-2xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center space-x-2"
            >
              <span>{isDonor ? 'List Food Surplus Now' : 'Open Donor Workspace'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <div className="text-[11px] text-center text-harbor-500 dark:text-slate-400">
              Compliant with FSSAI 6-Hour Cooked Food Holding Standards
            </div>
          </div>
        </div>

        {/* Card 2: I need food */}
        <div 
          onClick={onNavigateToRecipient}
          className={`group cursor-pointer rounded-3xl p-6 sm:p-8 border-2 transition-all flex flex-col justify-between relative overflow-hidden bg-white dark:bg-harbor-800 ${
            isRecipient 
              ? 'border-emerald-500 shadow-emerald-glow ring-2 ring-emerald-500/20' 
              : 'border-harbor-200 dark:border-harbor-700 hover:border-emerald-400 hover:shadow-lg'
          }`}
        >
          {isRecipient && (
            <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200 font-bold text-[11px] uppercase tracking-wider">
              Your Primary Role
            </div>
          )}

          <div className="space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <Heart className="w-8 h-8 stroke-[2.2]" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-harbor-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                I need food
              </h2>
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Elder Care Shelters • Orphanages • Community Ashrams
              </p>
              <p className="text-sm text-harbor-600 dark:text-slate-300 leading-relaxed">
                Looking for nutritious meal portions for your residents? Browse active surplus listings, claim batches, and complete verified offline pickups.
              </p>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-harbor-100 dark:border-harbor-700 space-y-3">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onNavigateToRecipient();
              }}
              className="w-full min-h-[52px] px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center space-x-2"
            >
              <span>Browse Available Surplus Meals</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <div className="text-[11px] text-center text-harbor-500 dark:text-slate-400">
              Reserved strictly for verified organizations and direct care beneficiaries
            </div>
          </div>
        </div>

      </div>

      {/* Safety Declaration Transparency Pill */}
      <div className="p-6 rounded-2xl bg-harbor-100 dark:bg-harbor-800/80 border border-harbor-200 dark:border-harbor-700 space-y-3">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          <h3 className="text-sm font-bold text-harbor-900 dark:text-white">
            FoodLink 4-Point Safety Standard (Declared by Donor)
          </h3>
        </div>
        <p className="text-xs text-harbor-600 dark:text-slate-300 leading-relaxed">
          Every surplus listing created on this platform requires a mandatory donor self-declaration before publication:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 text-xs">
          <div className="p-3 bg-white dark:bg-harbor-850 rounded-xl border border-harbor-200 dark:border-harbor-700">
            <div className="font-bold text-harbor-900 dark:text-white mb-0.5">1. Temperature Controlled</div>
            <div className="text-harbor-500 dark:text-slate-400 text-[11px]">Hot food held above 60°C or cold below 5°C</div>
          </div>
          <div className="p-3 bg-white dark:bg-harbor-850 rounded-xl border border-harbor-200 dark:border-harbor-700">
            <div className="font-bold text-harbor-900 dark:text-white mb-0.5">2. Freshly Prepared</div>
            <div className="text-harbor-500 dark:text-slate-400 text-[11px]">Prepared within the last 4 hours</div>
          </div>
          <div className="p-3 bg-white dark:bg-harbor-850 rounded-xl border border-harbor-200 dark:border-harbor-700">
            <div className="font-bold text-harbor-900 dark:text-white mb-0.5">3. Sealed Packaging</div>
            <div className="text-harbor-500 dark:text-slate-400 text-[11px]">Sealed food-grade containers</div>
          </div>
          <div className="p-3 bg-white dark:bg-harbor-850 rounded-xl border border-harbor-200 dark:border-harbor-700">
            <div className="font-bold text-harbor-900 dark:text-white mb-0.5">4. Allergen Transparency</div>
            <div className="text-harbor-500 dark:text-slate-400 text-[11px]">Allergens disclosed clearly on listing</div>
          </div>
        </div>
      </div>

    </div>
  );
};
