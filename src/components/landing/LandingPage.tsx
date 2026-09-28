import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db, isFirebaseConfigured, collection, getDocs, query, where } from '../../lib/firebase';
import { 
  HeartHandshake, 
  Utensils, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  MapPin, 
  Sparkles, 
  ArrowRight, 
  Leaf, 
  Droplets, 
  Home, 
  Users,
  QrCode,
  Building,
  KeyRound
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { openAuthModal } = useAuth();
  const [calculatorMeals, setCalculatorMeals] = useState<number>(60);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Honest Real-time Stats State (starts honestly at zero)
  const [realShelterCount, setRealShelterCount] = useState<number>(0);
  const [realMealsRescued, setRealMealsRescued] = useState<number>(0);

  useEffect(() => {
    if (isFirebaseConfigured && db) {
      try {
        // Query verified shelter count from Firestore
        getDocs(query(collection(db, 'users'), where('role', '==', 'recipient'), where('verificationStatus', '==', 'verified')))
          .then((snap) => {
            setRealShelterCount(snap.size);
          })
          .catch(() => {});

        // Query completed claims to calculate real rescued meals
        getDocs(query(collection(db, 'claims'), where('status', '==', 'completed')))
          .then((snap) => {
            let total = 0;
            snap.forEach((doc) => {
              const data = doc.data();
              if (data.quantityClaimed) total += Number(data.quantityClaimed);
            });
            setRealMealsRescued(total);
          })
          .catch(() => {});
      } catch (err) {
        console.warn('Real metrics fetch error:', err);
      }
    }
  }, []);

  // Calculated metrics for simulator
  const eldersFed = calculatorMeals;
  const co2PreventedKg = (calculatorMeals * 2.5).toFixed(0);
  const waterConservedLiters = (calculatorMeals * 350).toLocaleString();
  const shelterDaysCovered = (calculatorMeals / 30).toFixed(1);

  const faqs = [
    {
      q: "How does FoodLink guarantee food safety for vulnerable elder shelters?",
      a: "Every donor must complete a mandatory Food Safety Self-Declaration Checklist before a listing can go live. This certifies that the food was prepared within safe time limits, maintained at safe temperatures (>60°C for hot food or <5°C for refrigerated items), and packed in clean containers with allergen disclosure. In addition, only verified organizations can receive food."
    },
    {
      q: "Can a shelter claim only the portion they need rather than the whole batch?",
      a: "Yes! FoodLink features partial quantity claiming. If a wedding donor posts 150 meals, a 30-bed elder home can claim 30 meals, leaving the remaining 120 meals available for other nearby orphanages or shelters."
    },
    {
      q: "What if there is no internet reception at the pickup site?",
      a: "FoodLink has a built-in Offline Pickup Verification handshake. When a shelter claims meals, a secure 6-digit OTP and QR token are generated. At the pickup gate, the caretaker shares this code with the donor to authorize release without requiring an active internet connection."
    },
    {
      q: "What documents are required for organizational verification?",
      a: "Donors submit business registration / FSSAI food licenses or valid IDs. Shelters and NGOs submit registration certificates, trust deeds, or municipal shelter licenses. Verifications are valid for 180 days and require periodic renewal to maintain high trust."
    }
  ];

  return (
    <div className="space-y-24 py-6">

      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-6 pb-8 sm:pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-4xl mx-auto space-y-6">
            
            {/* Mission Badge - Teal */}
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300 text-xs sm:text-sm font-semibold shadow-sm">
              <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>Zero Perishable Food Waste to Landfills</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl font-extrabold text-harbor-900 dark:text-white tracking-tight leading-[1.15]">
              No good food should go to waste.{' '}
              <span className="text-teal-600 dark:text-teal-400">No shelter should go hungry.</span>
            </h1>

            {/* Subheading */}
            <p className="text-lg sm:text-xl text-harbor-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
              FoodLink connects restaurants and event hosts with verified shelters, orphanages, and elder care homes — so surplus food reaches people who need it, safely and quickly.
            </p>

            {/* Accessible CTA Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              {/* Primary Action Button: Trust Blue #2563EB */}
              <button
                onClick={() => openAuthModal('signup', 'donor')}
                className="w-full sm:w-auto min-h-[54px] px-8 py-4 rounded-2xl bg-trust-500 hover:bg-trust-600 active:bg-trust-700 text-white font-bold text-base shadow-blue-glow transition-all flex items-center justify-center space-x-2.5 focus:outline-none focus:ring-4 focus:ring-trust-500/30"
              >
                <Utensils className="w-5 h-5 stroke-[2.5]" />
                <span>Donate Food Surplus</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>

              {/* Secondary CTA Button */}
              <button
                onClick={() => openAuthModal('signup', 'recipient')}
                className="w-full sm:w-auto min-h-[54px] px-8 py-4 rounded-2xl border-2 border-harbor-800 dark:border-slate-300 bg-transparent hover:bg-harbor-800 hover:text-white dark:hover:bg-white dark:hover:text-harbor-900 text-harbor-900 dark:text-white font-bold text-base transition-all flex items-center justify-center space-x-2.5 focus:outline-none focus:ring-4 focus:ring-harbor-500/20"
              >
                <HeartHandshake className="w-5 h-5 stroke-[2.5] text-teal-600 dark:text-teal-400" />
                <span>Register Shelter / NGO</span>
              </button>
            </div>

            {/* Trust Badges Row near CTA */}
            <div className="pt-3 flex flex-wrap items-center justify-center gap-2.5 text-xs text-harbor-600 dark:text-slate-300">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-harbor-800 border border-harbor-200 dark:border-harbor-700 shadow-sm">
                <ShieldCheck className="w-4 h-4 text-trust-500" />
                <span className="font-semibold text-harbor-800 dark:text-slate-100">Firebase Secured</span>
              </div>

              <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-harbor-800 border border-harbor-200 dark:border-harbor-700 shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                <span className="font-semibold text-harbor-800 dark:text-slate-100">Food Safety Compliant</span>
              </div>

              <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-harbor-800 border border-harbor-200 dark:border-harbor-700 shadow-sm">
                <Building className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span className="font-semibold text-harbor-800 dark:text-slate-100">Partner & NGO Network: Onboarding Launch Partners</span>
              </div>
            </div>

            <div className="text-xs text-harbor-500 dark:text-slate-400 pt-1">
              Free for non-profits & shelters • Mandatory donor verification before pickup
            </div>

          </div>

          {/* Honest Launch Status & Stats Banner (Zero Fabricated Numbers) */}
          <div className="mt-12 p-6 sm:p-8 rounded-3xl bg-white dark:bg-harbor-800 border border-harbor-200 dark:border-harbor-700 shadow-harbor-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 mb-5 border-b border-harbor-100 dark:border-harbor-700">
              <div className="flex items-center space-x-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-500"></span>
                </span>
                <span className="font-bold text-xs uppercase tracking-wider text-teal-600 dark:text-teal-400">
                  Live Pilot Status: Bengaluru Rollout
                </span>
              </div>
              <div className="text-xs text-harbor-500 dark:text-slate-400 font-medium">
                Authentic real-time metrics • Zero fabricated statistics
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3">
                <div className="text-3xl sm:text-4xl font-extrabold text-harbor-900 dark:text-white">
                  {realMealsRescued > 0 ? realMealsRescued.toLocaleString() : '0'}
                </div>
                <div className="text-xs font-semibold text-harbor-700 dark:text-slate-300 mt-1">Meals Rescued</div>
                <div className="text-[11px] text-teal-600 dark:text-teal-400 mt-0.5 font-medium">
                  {realMealsRescued > 0 ? 'Verified pickups' : 'Be our launch donor'}
                </div>
              </div>

              <div className="text-center p-3 border-l border-harbor-100 dark:border-harbor-700">
                <div className="text-3xl sm:text-4xl font-extrabold text-teal-600 dark:text-teal-400">
                  {realShelterCount > 0 ? realShelterCount : '0'}
                </div>
                <div className="text-xs font-semibold text-harbor-700 dark:text-slate-300 mt-1">Verified Shelters</div>
                <div className="text-[11px] text-teal-600 dark:text-teal-400 mt-0.5 font-medium">
                  {realShelterCount > 0 ? 'Active partners' : 'Founding slots open'}
                </div>
              </div>

              <div className="text-center p-3 border-t md:border-t-0 md:border-l border-harbor-100 dark:border-harbor-700">
                <div className="text-3xl sm:text-4xl font-extrabold text-[#16A34A]">100%</div>
                <div className="text-xs font-semibold text-harbor-700 dark:text-slate-300 mt-1">Safety Declaration</div>
                <div className="text-[11px] text-[#16A34A] mt-0.5 font-medium">Mandatory on every post</div>
              </div>

              <div className="text-center p-3 border-t md:border-t-0 border-l border-harbor-100 dark:border-harbor-700">
                <div className="text-3xl sm:text-4xl font-extrabold text-trust-500 dark:text-trust-400">&lt; 60 min</div>
                <div className="text-xs font-semibold text-harbor-700 dark:text-slate-300 mt-1">Target Match Time</div>
                <div className="text-[11px] text-trust-600 dark:text-trust-400 mt-0.5 font-medium">Direct local handoff</div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. HOW IT WORKS (SHORT 3-STEP SECTION DIRECTLY BELOW HERO) */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <div className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
            Simple 3-Step Flow
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-harbor-900 dark:text-white">
            How FoodLink Works
          </h2>
          <p className="text-harbor-600 dark:text-slate-300 text-sm sm:text-base">
            Engineered specifically for busy chefs, event coordinators, and shelter caretakers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Step 1 */}
          <div className="p-7 rounded-3xl bg-white dark:bg-harbor-800 border border-harbor-200 dark:border-harbor-700 shadow-harbor-sm flex flex-col justify-between hover:border-teal-500/70 transition-all">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-300 flex items-center justify-center font-black text-xl border border-teal-200 dark:border-teal-800">
                  1
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-harbor-100 dark:bg-harbor-700 text-harbor-700 dark:text-slate-200">
                  Donor
                </span>
              </div>
              <div className="flex items-center space-x-2 text-teal-600 dark:text-teal-400">
                <Utensils className="w-5 h-5" />
                <h3 className="text-lg font-bold text-harbor-900 dark:text-white">
                  Step 1: Donor Lists Surplus Food
                </h3>
              </div>
              <p className="text-sm text-harbor-600 dark:text-slate-300 leading-relaxed">
                A restaurant or wedding host specifies portion quantities, prep time, and completes the mandatory 4-point Food Safety Self-Declaration.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-harbor-100 dark:border-harbor-700 text-xs font-semibold text-teal-600 dark:text-teal-400 flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Includes temperature & allergen disclosure</span>
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-7 rounded-3xl bg-white dark:bg-harbor-800 border border-harbor-200 dark:border-harbor-700 shadow-harbor-sm flex flex-col justify-between hover:border-teal-500/70 transition-all">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-300 flex items-center justify-center font-black text-xl border border-teal-200 dark:border-teal-800">
                  2
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-harbor-100 dark:bg-harbor-700 text-harbor-700 dark:text-slate-200">
                  Shelter / NGO
                </span>
              </div>
              <div className="flex items-center space-x-2 text-teal-600 dark:text-teal-400">
                <HeartHandshake className="w-5 h-5" />
                <h3 className="text-lg font-bold text-harbor-900 dark:text-white">
                  Step 2: Verified Recipient Claims
                </h3>
              </div>
              <p className="text-sm text-harbor-600 dark:text-slate-300 leading-relaxed">
                Verified elder care homes, orphanages, or NGOs claim full or partial quantities (e.g. 30 of 100 meal boxes) based on their exact capacity.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-harbor-100 dark:border-harbor-700 text-xs font-semibold text-teal-600 dark:text-teal-400 flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Partial quantity claiming supported</span>
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-7 rounded-3xl bg-white dark:bg-harbor-800 border border-harbor-200 dark:border-harbor-700 shadow-harbor-sm flex flex-col justify-between hover:border-teal-500/70 transition-all">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-300 flex items-center justify-center font-black text-xl border border-teal-200 dark:border-teal-800">
                  3
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-harbor-100 dark:bg-harbor-700 text-harbor-700 dark:text-slate-200">
                  Handoff
                </span>
              </div>
              <div className="flex items-center space-x-2 text-teal-600 dark:text-teal-400">
                <QrCode className="w-5 h-5" />
                <h3 className="text-lg font-bold text-harbor-900 dark:text-white">
                  Step 3: Offline Pickup with OTP/QR
                </h3>
              </div>
              <p className="text-sm text-harbor-600 dark:text-slate-300 leading-relaxed">
                At pickup, the recipient presents a 6-digit verification code or QR token. Handover is verified securely even without internet at the gate.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-harbor-100 dark:border-harbor-700 text-xs font-semibold text-teal-600 dark:text-teal-400 flex items-center space-x-1">
              <KeyRound className="w-3.5 h-3.5" />
              <span>Works without cellular data reception</span>
            </div>
          </div>

        </div>
      </section>

      {/* 3. THE CRITICAL PROBLEM & WHY FOODLINK MATTERS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <div className="space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-lg bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 text-xs font-bold uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span>The Perishable Emergency</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold text-harbor-900 dark:text-white leading-tight">
              Good food is wasted at midnight while elder shelters struggle by morning.
            </h2>

            <p className="text-harbor-600 dark:text-slate-300 leading-relaxed text-base">
              Every single evening, commercial restaurants and wedding banquet halls generate dozens of kilograms of wholesome, freshly prepared food. Yet after closing, food is discarded because coordinators lack an immediate, verified logistics bridge to shelters.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start space-x-3 p-3.5 rounded-xl bg-harbor-100/60 dark:bg-harbor-850 border border-harbor-200 dark:border-harbor-700">
                <CheckCircle2 className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <strong className="text-harbor-900 dark:text-white">Elder-focused prioritization:</strong> Elder abandonment shelters and old age homes often have fixed, minimal budgets and require soft, nutritious, hygienic food.
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3.5 rounded-xl bg-harbor-100/60 dark:bg-harbor-850 border border-harbor-200 dark:border-harbor-700">
                <CheckCircle2 className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <strong className="text-harbor-900 dark:text-white">Strict safety protocol:</strong> No mysterious food. Donors explicitly verify temperature thresholds, prep times, and allergen lists.
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3.5 rounded-xl bg-harbor-100/60 dark:bg-harbor-850 border border-harbor-200 dark:border-harbor-700">
                <CheckCircle2 className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <strong className="text-harbor-900 dark:text-white">Partial claims prevent hoarding:</strong> Multiple small shelters can share large hotel surplus evenly according to their actual resident counts.
                </div>
              </div>
            </div>
          </div>

          {/* Visual Showcase Card */}
          <div className="relative">
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-harbor-800 border border-harbor-200 dark:border-harbor-700 shadow-harbor-lg space-y-6">
              
              <div className="flex items-center justify-between border-b border-harbor-100 dark:border-harbor-700 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/15 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
                    🍽️
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-harbor-900 dark:text-white">Spice Garden Restaurant</h3>
                    <p className="text-xs text-harbor-400">Pilot Partner • Central District</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 dark:bg-red-950/70 dark:text-red-300 animate-pulse flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Expires in 1h 45m</span>
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-harbor-700 dark:text-slate-200">Fresh Cooked Meal Boxes (Dal, Roti, Rice, Veg Curry)</span>
                  <span className="text-sm font-bold text-teal-600 dark:text-teal-400">80 Servings</span>
                </div>
                
                {/* Progress bar showing partial claims */}
                <div>
                  <div className="flex justify-between text-xs text-harbor-500 dark:text-slate-400 mb-1">
                    <span>Claimed: 35 / 80 meals</span>
                    <span className="font-semibold text-[#16A34A]">45 Remaining</span>
                  </div>
                  <div className="w-full bg-harbor-100 dark:bg-harbor-700 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-teal-500 h-2.5 rounded-full" style={{ width: '43%' }}></div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-harbor-50 dark:bg-harbor-850 border border-harbor-200 dark:border-harbor-700 text-xs space-y-1">
                  <div className="font-semibold text-harbor-800 dark:text-slate-200">Simulated Claim Allocation:</div>
                  <div className="text-harbor-600 dark:text-slate-400 flex items-center justify-between">
                    <span>• Ananda Old Age Shelter: 35 meals</span>
                    <span className="text-[#16A34A] font-semibold">OTP: 849-210</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs font-medium text-harbor-500 dark:text-slate-400 border-t border-harbor-100 dark:border-harbor-700">
                <span className="flex items-center space-x-1 text-[#16A34A]">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Safety Self-Declared</span>
                </span>
                <span className="flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>2.3 km away from Ananda Shelter</span>
                </span>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* 4. TARGET PERSONAS GRID */}
      <section id="for-donors" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
          <div className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
            Tailored Experiences
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-harbor-900 dark:text-white">
            Built for specific donor & recipient personas.
          </h2>
          <p className="text-harbor-600 dark:text-slate-300 text-base">
            Every user group has dedicated requirements, verification tracks, and pickup expectations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Donor Column */}
          <div className="p-8 rounded-3xl bg-white dark:bg-harbor-800 border border-harbor-200 dark:border-harbor-700 space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-500 text-white flex items-center justify-center">
                <Utensils className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-harbor-900 dark:text-white">Food Donors</h3>
                <p className="text-xs text-harbor-500 dark:text-slate-400">Commercial & Event Food Providers</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-harbor-50 dark:bg-harbor-850 border border-harbor-200 dark:border-harbor-700">
                <h4 className="font-bold text-sm text-harbor-900 dark:text-white mb-1">🍽️ Restaurant & Kitchen Donors</h4>
                <p className="text-xs text-harbor-600 dark:text-slate-300 leading-relaxed">
                  Set recurring daily surplus pickups, manage end-of-service surplus batches, and receive tax/CSR contribution summaries.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-harbor-50 dark:bg-harbor-850 border border-harbor-200 dark:border-harbor-700">
                <h4 className="font-bold text-sm text-harbor-900 dark:text-white mb-1">🎉 Wedding & Banquet Hosts</h4>
                <p className="text-xs text-harbor-600 dark:text-slate-300 leading-relaxed">
                  One-time high-capacity surplus dispatch. Immediate notification to nearby shelters to dispatch volunteers right away.
                </p>
              </div>
            </div>

            <button
              onClick={() => openAuthModal('signup', 'donor')}
              className="w-full min-h-touch py-3 rounded-xl bg-trust-500 hover:bg-trust-600 text-white font-bold text-sm transition-colors flex items-center justify-center space-x-2 shadow-sm"
            >
              <span>Register as a Food Donor</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Recipient Column */}
          <div id="for-shelters" className="p-8 rounded-3xl bg-white dark:bg-harbor-800 border border-harbor-200 dark:border-harbor-700 space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-harbor-900 dark:text-white">Recipient Shelters & NGOs</h3>
                <p className="text-xs text-harbor-500 dark:text-slate-400">Verified Welfare & Care Organizations</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-harbor-50 dark:bg-harbor-850 border border-harbor-200 dark:border-harbor-700">
                <h4 className="font-bold text-sm text-harbor-900 dark:text-white mb-1">👵 Elder Abandonment & Old Age Homes</h4>
                <p className="text-xs text-harbor-600 dark:text-slate-300 leading-relaxed">
                  Clear allergen and spice indicators; easy claim buttons designed for non-technical caretakers; direct phone coordinate support.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-harbor-50 dark:bg-harbor-850 border border-harbor-200 dark:border-harbor-700">
                <h4 className="font-bold text-sm text-harbor-900 dark:text-white mb-1">🧸 Orphanages & Community NGOs</h4>
                <p className="text-xs text-harbor-600 dark:text-slate-300 leading-relaxed">
                  Bulk claim permissions for large volunteer networks distributing across community clusters and children’s shelters.
                </p>
              </div>
            </div>

            <button
              onClick={() => openAuthModal('signup', 'recipient')}
              className="w-full min-h-touch py-3 rounded-xl bg-harbor-800 hover:bg-harbor-950 dark:bg-harbor-700 dark:hover:bg-harbor-600 text-white font-bold text-sm transition-colors flex items-center justify-center space-x-2"
            >
              <span>Register as a Recipient Shelter</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </section>

      {/* 5. FOOD SAFETY PLEDGE & VERIFICATION TRUST */}
      <section id="safety-pledge" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-harbor-900 text-white border border-harbor-700 relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-3xl space-y-6">
            
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
              <span>Mandatory Safety Standard</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Our 4-Point Food Safety Self-Declaration
            </h2>

            <p className="text-slate-300 text-base leading-relaxed">
              No food listing can be published on FoodLink without completing our mandatory safety checklist. Every listing binds the donor to legal and humanitarian standards of hygiene.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="flex items-start space-x-3 p-3.5 rounded-xl bg-harbor-800/80 border border-harbor-700">
                <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <div className="font-bold text-white mb-0.5">Temperature Maintenance</div>
                  <div className="text-slate-300">Hot food held &gt;60°C or chilled &lt;5°C prior to pickup.</div>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3.5 rounded-xl bg-harbor-800/80 border border-harbor-700">
                <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <div className="font-bold text-white mb-0.5">Hygienic Packaging</div>
                  <div className="text-slate-300">Stored in food-grade, covered, sanitized containers.</div>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3.5 rounded-xl bg-harbor-800/80 border border-harbor-700">
                <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <div className="font-bold text-white mb-0.5">Allergen Transparency</div>
                  <div className="text-slate-300">Explicit disclosure of dairy, nuts, gluten, or spices.</div>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3.5 rounded-xl bg-harbor-800/80 border border-harbor-700">
                <CheckCircle2 className="w-5 h-5 text-[#16A34A] shrink-0 mt-0.5" />
                <div className="text-xs">
                  <div className="font-bold text-white mb-0.5">180-Day Re-Verification</div>
                  <div className="text-slate-300">Periodic document checks to ensure continuous trust.</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 6. INTERACTIVE SURPLUS IMPACT CALCULATOR */}
      <section id="impact-calculator" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-harbor-800 border border-harbor-200 dark:border-harbor-700 shadow-harbor-md space-y-8">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
              Interactive Impact Calculator
            </div>
            <h2 className="text-3xl font-bold text-harbor-900 dark:text-white">
              See the direct impact of your surplus meals.
            </h2>
            <p className="text-sm text-harbor-600 dark:text-slate-300">
              Slide to simulate your restaurant or event surplus volume:
            </p>
          </div>

          {/* Slider with Teal Accent */}
          <div className="max-w-xl mx-auto space-y-4">
            <div className="flex justify-between items-center text-sm font-bold text-harbor-800 dark:text-slate-200">
              <span>Portion Volume:</span>
              <span className="text-2xl font-black text-teal-600 dark:text-teal-400">{calculatorMeals} Prepared Meals</span>
            </div>
            <input
              type="range"
              min="10"
              max="500"
              step="10"
              value={calculatorMeals}
              onChange={(e) => setCalculatorMeals(Number(e.target.value))}
              className="w-full h-3 bg-harbor-200 dark:bg-harbor-700 rounded-lg appearance-none cursor-pointer accent-teal-500"
              aria-label="Number of surplus meals"
            />
            <div className="flex justify-between text-xs text-harbor-400">
              <span>Small Gathering (10 meals)</span>
              <span>Large Banquet (500 meals)</span>
            </div>
          </div>

          {/* Metric Outputs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="p-5 rounded-2xl bg-harbor-50 dark:bg-harbor-850 border border-harbor-200 dark:border-harbor-700 text-center">
              <Users className="w-6 h-6 text-teal-600 dark:text-teal-400 mx-auto mb-2" />
              <div className="text-2xl font-extrabold text-harbor-900 dark:text-white">{eldersFed}</div>
              <div className="text-xs font-semibold text-harbor-500 dark:text-slate-400 mt-1">Shelter Residents Fed</div>
            </div>

            <div className="p-5 rounded-2xl bg-harbor-50 dark:bg-harbor-850 border border-harbor-200 dark:border-harbor-700 text-center">
              <Home className="w-6 h-6 text-[#16A34A] mx-auto mb-2" />
              <div className="text-2xl font-extrabold text-harbor-900 dark:text-white">{shelterDaysCovered}</div>
              <div className="text-xs font-semibold text-harbor-500 dark:text-slate-400 mt-1">Days of Shelter Relief</div>
            </div>

            <div className="p-5 rounded-2xl bg-harbor-50 dark:bg-harbor-850 border border-harbor-200 dark:border-harbor-700 text-center">
              <Leaf className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-extrabold text-harbor-900 dark:text-white">{co2PreventedKg} kg</div>
              <div className="text-xs font-semibold text-harbor-500 dark:text-slate-400 mt-1">CO₂ Averted from Landfill</div>
            </div>

            <div className="p-5 rounded-2xl bg-harbor-50 dark:bg-harbor-850 border border-harbor-200 dark:border-harbor-700 text-center">
              <Droplets className="w-6 h-6 text-trust-500 mx-auto mb-2" />
              <div className="text-2xl font-extrabold text-harbor-900 dark:text-white">{waterConservedLiters} L</div>
              <div className="text-xs font-semibold text-harbor-500 dark:text-slate-400 mt-1">Embodied Water Saved</div>
            </div>
          </div>

        </div>
      </section>

      {/* 7. FREQUENTLY ASKED QUESTIONS */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-10">
          <div className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
            Got Questions?
          </div>
          <h2 className="text-3xl font-bold text-harbor-900 dark:text-white">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div 
              key={idx}
              className="rounded-2xl border border-harbor-200 dark:border-harbor-700 bg-white dark:bg-harbor-800 overflow-hidden"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-5 text-left font-bold text-sm sm:text-base text-harbor-900 dark:text-white flex items-center justify-between hover:text-teal-600 transition-colors"
              >
                <span>{faq.q}</span>
                <span className="text-xl font-bold text-teal-600 dark:text-teal-400 shrink-0 ml-4">
                  {openFaq === idx ? '−' : '+'}
                </span>
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-5 text-sm text-harbor-600 dark:text-slate-300 leading-relaxed border-t border-harbor-100 dark:border-harbor-700 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 8. BOTTOM CALL TO ACTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-10 sm:p-14 rounded-3xl bg-gradient-to-br from-harbor-900 via-harbor-850 to-teal-800 text-white text-center space-y-6 shadow-harbor-lg border border-harbor-700">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Ready to make tonight’s surplus count?
          </h2>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto">
            Join hundreds of kitchen managers, wedding hosts, and shelter caretakers working together to nourish those who need it most.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => openAuthModal('signup', 'donor')}
              className="w-full sm:w-auto min-h-touch px-8 py-3.5 rounded-2xl bg-trust-500 hover:bg-trust-600 text-white font-bold text-sm shadow-md transition-all"
            >
              Donate Food as a Kitchen or Host
            </button>
            <button
              onClick={() => openAuthModal('signup', 'recipient')}
              className="w-full sm:w-auto min-h-touch px-8 py-3.5 rounded-2xl bg-harbor-800 hover:bg-harbor-700 text-white font-bold text-sm border border-harbor-600 transition-all"
            >
              Register an Elder Home or Shelter
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
