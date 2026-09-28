import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import type { UserRole, DonorSubRole, RecipientSubRole } from '../../types';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  Building2, 
  MapPin, 
  Eye, 
  EyeOff, 
  AlertCircle,
  Utensils,
  PartyPopper,
  Heart,
  Home,
  Users
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { 
    isAuthModalOpen, 
    authModalMode, 
    authModalRoleHint,
    closeAuthModal, 
    loginWithEmail, 
    registerWithEmail, 
    loginWithGoogle,
    switchPersonaDemo,
    isFirebaseLive
  } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>(authModalMode);
  const [selectedRole, setSelectedRole] = useState<UserRole>(authModalRoleHint || 'donor');
  const [selectedSubRole, setSelectedSubRole] = useState<DonorSubRole | RecipientSubRole>('restaurant');
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [orgName, setOrgName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Bengaluru');
  const [address, setAddress] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Google sign-in helper state for simulation & account choosing
  const [showGooglePicker, setShowGooglePicker] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [dynamicGoogleAccounts, setDynamicGoogleAccounts] = useState<Array<{ email: string; displayName: string }>>([]);

  useEffect(() => {
    setMode(authModalMode);
    setEmail('');
    setPassword('');
    setErrorMessage(null);
    setShowGooglePicker(false);
    setCustomGoogleEmail('');
    if (authModalRoleHint) {
      setSelectedRole(authModalRoleHint);
      setSelectedSubRole(authModalRoleHint === 'donor' ? 'restaurant' : 'elder_shelter');
    }

    // Refresh dynamic accounts registered during session
    try {
      const raw = localStorage.getItem('foodlink_registered_users_db');
      if (raw) {
        const dbUsers = JSON.parse(raw);
        const list = Object.values(dbUsers).map((u: any) => ({
          email: u.email,
          displayName: u.displayName || u.organizationName || u.email
        })).filter((u: any) => 
          u.email.toLowerCase() !== 'priya.sharma@gmail.com' && 
          u.email.toLowerCase() !== 'manjunath.b@gmail.com'
        );
        setDynamicGoogleAccounts(list);
      }
    } catch (e) {
      console.error(e);
    }
  }, [authModalMode, authModalRoleHint, isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    if (role === 'donor') {
      setSelectedSubRole('restaurant');
    } else {
      setSelectedSubRole('elder_shelter');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      if (mode === 'signin') {
        if (!email || !password) {
          throw new Error('Please enter both email and password.');
        }
        await loginWithEmail(email, password);
      } else {
        if (!email || !password || !displayName) {
          throw new Error('Please fill in your name, email, and password.');
        }
        if (password.length < 6) {
          throw new Error('Password should be at least 6 characters long.');
        }
        await registerWithEmail(email, password, {
          displayName,
          phone,
          role: selectedRole,
          subRole: selectedSubRole,
          organizationName: orgName || displayName,
          address,
          city
        });
      }
    } catch (err: any) {
      console.error('Auth action failed:', err);
      setErrorMessage(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async (emailOverride?: string) => {
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      await loginWithGoogle(emailOverride);
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      setErrorMessage(err.message || 'Google sign-in could not be completed.');
      if (err.message && err.message.includes('email and password')) {
        if (emailOverride) setEmail(emailOverride);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-harbor-950/75 backdrop-blur-sm animate-fade-in"
      onClick={closeAuthModal}
    >
      <div 
        className="w-full max-w-xl bg-white dark:bg-harbor-800 rounded-3xl border border-harbor-200 dark:border-harbor-700 shadow-2xl overflow-hidden transition-all max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-harbor-100 dark:border-harbor-700 bg-harbor-50/50 dark:bg-harbor-850">
          <div>
            <h2 className="text-xl font-bold text-harbor-900 dark:text-white flex items-center space-x-2">
              <span>{mode === 'signin' ? 'Welcome Back' : 'Create FoodLink Account'}</span>
            </h2>
            <p className="text-xs text-harbor-500 dark:text-slate-400 mt-0.5">
              {mode === 'signin' 
                ? 'Sign in to your account. Google sign-in is available for returning users with an existing account.'
                : 'New accounts require complete persona, organization, and verification details below.'}
            </p>
          </div>
          <button
            onClick={closeAuthModal}
            className="min-h-touch min-w-touch p-2 rounded-xl text-harbor-400 hover:text-harbor-700 dark:hover:text-slate-200 hover:bg-harbor-100 dark:hover:bg-harbor-700 transition-colors flex items-center justify-center"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-2 bg-harbor-100 dark:bg-harbor-900/60 m-6 mb-2 rounded-2xl">
          <button
            type="button"
            data-testid="tab-signin"
            onClick={() => { setMode('signin'); setErrorMessage(null); }}
            className={`min-h-[44px] py-2.5 rounded-xl font-semibold text-sm transition-all ${
              mode === 'signin'
                ? 'bg-white dark:bg-harbor-800 text-teal-600 dark:text-teal-400 shadow-sm'
                : 'text-harbor-600 dark:text-slate-400 hover:text-harbor-900 dark:hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            data-testid="tab-signup"
            onClick={() => { setMode('signup'); setErrorMessage(null); }}
            className={`min-h-[44px] py-2.5 rounded-xl font-semibold text-sm transition-all ${
              mode === 'signup'
                ? 'bg-white dark:bg-harbor-800 text-teal-600 dark:text-teal-400 shadow-sm'
                : 'text-harbor-600 dark:text-slate-400 hover:text-harbor-900 dark:hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="overflow-y-auto px-6 py-4 space-y-5">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Social Google Provider Button (Sign In tab only) */}
          {mode === 'signin' && (
            <div className="space-y-3">
              <div className="p-3 bg-teal-50/60 dark:bg-teal-950/30 border border-teal-200/80 dark:border-teal-800/60 rounded-2xl text-center">
                <p className="text-xs font-semibold text-teal-950 dark:text-teal-200">
                  Returning FoodLink Member?
                </p>
                <p className="text-[11px] text-teal-700 dark:text-teal-300 mt-0.5">
                  Quick sign-in with your linked Google account:
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!isFirebaseLive) {
                    setShowGooglePicker(prev => !prev);
                  } else {
                    handleGoogleSignIn();
                  }
                }}
                disabled={isSubmitting}
                data-testid="google-signin-btn"
                className="w-full min-h-touch py-3 px-4 rounded-2xl border border-harbor-200 dark:border-harbor-700 bg-white dark:bg-harbor-850 hover:bg-harbor-50 dark:hover:bg-harbor-700 font-semibold text-sm text-harbor-800 dark:text-slate-100 flex items-center justify-center space-x-3 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.14z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
                <span>Continue with Google</span>
              </button>
              <p className="text-[11px] text-center text-harbor-500 dark:text-slate-400">
                Google sign-in is for returning registered accounts only.
              </p>

              {/* Google Account Picker (Simulation when in preview / offline mode) */}
              {showGooglePicker && !isFirebaseLive && (
                <div className="p-3.5 rounded-2xl border border-harbor-200 dark:border-harbor-700 bg-harbor-50 dark:bg-harbor-850 shadow-inner space-y-2.5 animate-fade-in" data-testid="google-account-picker">
                  <div className="flex items-center justify-between pb-1 border-b border-harbor-200 dark:border-harbor-700">
                    <span className="text-xs font-bold text-harbor-800 dark:text-slate-200">
                      Select Google Account to Sign In:
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowGooglePicker(false)}
                      className="text-harbor-400 hover:text-harbor-600 text-xs font-bold"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                    {/* Option 1: Priya Sharma (Registered Event Donor) */}
                    <button
                      type="button"
                      onClick={() => { setShowGooglePicker(false); handleGoogleSignIn('priya.sharma@gmail.com'); }}
                      className="w-full text-left p-2 rounded-xl border border-harbor-200 dark:border-harbor-700 bg-white dark:bg-harbor-800 hover:border-teal-500 flex items-center justify-between transition-colors"
                      data-testid="google-picker-priya"
                    >
                      <div>
                        <div className="text-xs font-bold text-harbor-900 dark:text-white">Priya Sharma</div>
                        <div className="text-[10px] text-harbor-500 dark:text-slate-400">priya.sharma@gmail.com</div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-200 font-semibold">
                        Registered Donor
                      </span>
                    </button>

                    {/* Option 2: Manjunath B. (Registered Recipient) */}
                    <button
                      type="button"
                      onClick={() => { setShowGooglePicker(false); handleGoogleSignIn('manjunath.b@gmail.com'); }}
                      className="w-full text-left p-2 rounded-xl border border-harbor-200 dark:border-harbor-700 bg-white dark:bg-harbor-800 hover:border-emerald-500 flex items-center justify-between transition-colors"
                      data-testid="google-picker-manjunath"
                    >
                      <div>
                        <div className="text-xs font-bold text-harbor-900 dark:text-white">Manjunath B.</div>
                        <div className="text-[10px] text-harbor-500 dark:text-slate-400">manjunath.b@gmail.com</div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 font-semibold">
                        Registered Recipient
                      </span>
                    </button>

                    {/* Option 3: Any custom accounts previously registered via form */}
                    {dynamicGoogleAccounts.map((acc) => (
                      <button
                        key={acc.email}
                        type="button"
                        onClick={() => { setShowGooglePicker(false); handleGoogleSignIn(acc.email); }}
                        className="w-full text-left p-2 rounded-xl border border-harbor-200 dark:border-harbor-700 bg-white dark:bg-harbor-800 hover:border-blue-500 flex items-center justify-between transition-colors"
                        data-testid={`google-picker-${acc.email}`}
                      >
                        <div>
                          <div className="text-xs font-bold text-harbor-900 dark:text-white">{acc.displayName}</div>
                          <div className="text-[10px] text-harbor-500 dark:text-slate-400">{acc.email}</div>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 font-semibold">
                          Linked Account
                        </span>
                      </button>
                    ))}

                    {/* Option 4: Unregistered Account (Tests Block Flow) */}
                    <button
                      type="button"
                      onClick={() => { setShowGooglePicker(false); handleGoogleSignIn('unregistered.visitor@gmail.com'); }}
                      className="w-full text-left p-2 rounded-xl border border-dashed border-red-300 dark:border-red-800 bg-white dark:bg-harbor-800 hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center justify-between transition-colors"
                      data-testid="google-picker-unregistered"
                    >
                      <div>
                        <div className="text-xs font-bold text-red-700 dark:text-red-300">Unregistered Google Account</div>
                        <div className="text-[10px] text-red-500 dark:text-red-400">unregistered.visitor@gmail.com</div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/60 text-red-800 dark:text-red-200 font-semibold">
                        Test Block
                      </span>
                    </button>
                  </div>

                  {/* Option 5: Custom email input */}
                  <div className="flex items-center space-x-2 pt-1 border-t border-harbor-200 dark:border-harbor-700">
                    <input
                      type="email"
                      placeholder="Or type Google email..."
                      value={customGoogleEmail}
                      onChange={(e) => setCustomGoogleEmail(e.target.value)}
                      className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-harbor-200 dark:border-harbor-700 bg-white dark:bg-harbor-800 text-harbor-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                      data-testid="custom-google-email-input"
                    />
                    <button
                      type="button"
                      disabled={!customGoogleEmail}
                      onClick={() => {
                        if (customGoogleEmail) {
                          setShowGooglePicker(false);
                          handleGoogleSignIn(customGoogleEmail);
                        }
                      }}
                      data-testid="custom-google-email-submit"
                      className="px-2.5 py-1.5 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-lg disabled:opacity-50 transition-colors"
                    >
                      Sign In
                    </button>
                  </div>
                </div>
              )}

              <div className="relative flex items-center justify-center pt-1 pb-1">
                <div className="border-t border-harbor-200 dark:border-harbor-700 w-full"></div>
                <span className="bg-white dark:bg-harbor-800 px-3 text-xs uppercase tracking-wider text-harbor-400 font-semibold absolute">
                  or sign in with email
                </span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Sign Up: Role & Persona Selection */}
            {mode === 'signup' && (
              <div className="space-y-4 p-4 rounded-2xl bg-harbor-50/70 dark:bg-harbor-850/80 border border-harbor-200 dark:border-harbor-700">
                <div>
                  <label className="block text-xs font-bold text-harbor-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Step 1: Choose Your Primary Role
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleRoleChange('donor')}
                      className={`min-h-[56px] p-3 rounded-xl border text-left flex items-center space-x-3 transition-all ${
                        selectedRole === 'donor'
                          ? 'border-teal-500 bg-teal-50/80 dark:bg-teal-950/40 text-teal-950 dark:text-teal-200 ring-2 ring-teal-500/20'
                          : 'border-harbor-200 dark:border-harbor-700 bg-white dark:bg-harbor-800 text-harbor-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="w-9 h-9 rounded-lg bg-teal-500 text-white flex items-center justify-center shrink-0">
                        <Utensils className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-sm leading-tight">Food Donor</div>
                        <div className="text-[11px] opacity-75">I have food surplus to donate</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRoleChange('recipient')}
                      className={`min-h-[56px] p-3 rounded-xl border text-left flex items-center space-x-3 transition-all ${
                        selectedRole === 'recipient'
                          ? 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 ring-2 ring-emerald-500/20'
                          : 'border-harbor-200 dark:border-harbor-700 bg-white dark:bg-harbor-800 text-harbor-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                        <Heart className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-sm leading-tight">Recipient Org / Shelter</div>
                        <div className="text-[11px] opacity-75">We need meals for care</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Sub-role Granular Personas */}
                <div>
                  <label className="block text-xs font-bold text-harbor-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Step 2: Specific Persona
                  </label>
                  {selectedRole === 'donor' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setSelectedSubRole('restaurant')}
                        className={`p-3 rounded-xl border text-left flex items-center space-x-2.5 transition-all ${
                          selectedSubRole === 'restaurant'
                            ? 'border-teal-500 bg-white dark:bg-harbor-800 shadow-sm'
                            : 'border-harbor-200 dark:border-harbor-700 opacity-70'
                        }`}
                      >
                        <Utensils className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                        <div>
                          <div className="font-bold text-xs text-harbor-900 dark:text-white">Restaurant / Commercial Kitchen</div>
                          <div className="text-[10px] text-harbor-500 dark:text-slate-400">Regular daily surplus from kitchens</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedSubRole('individual_event')}
                        className={`p-3 rounded-xl border text-left flex items-center space-x-2.5 transition-all ${
                          selectedSubRole === 'individual_event'
                            ? 'border-teal-500 bg-white dark:bg-harbor-800 shadow-sm'
                            : 'border-harbor-200 dark:border-harbor-700 opacity-70'
                        }`}
                      >
                        <PartyPopper className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                        <div>
                          <div className="font-bold text-xs text-harbor-900 dark:text-white">Wedding & Event Donor</div>
                          <div className="text-[10px] text-harbor-500 dark:text-slate-400">Occasional large function surplus</div>
                        </div>
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedSubRole('elder_shelter')}
                        className={`p-2.5 rounded-xl border text-left flex items-center space-x-2 transition-all ${
                          selectedSubRole === 'elder_shelter'
                            ? 'border-emerald-500 bg-white dark:bg-harbor-800 shadow-sm'
                            : 'border-harbor-200 dark:border-harbor-700 opacity-70'
                        }`}
                      >
                        <Home className="w-4 h-4 text-emerald-600 shrink-0" />
                        <div>
                          <div className="font-bold text-xs text-harbor-900 dark:text-white">Elder Abandonment Shelter</div>
                          <div className="text-[10px] text-harbor-500 dark:text-slate-400">Caretaker for elderly residents</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedSubRole('old_age_home')}
                        className={`p-2.5 rounded-xl border text-left flex items-center space-x-2 transition-all ${
                          selectedSubRole === 'old_age_home'
                            ? 'border-emerald-500 bg-white dark:bg-harbor-800 shadow-sm'
                            : 'border-harbor-200 dark:border-harbor-700 opacity-70'
                        }`}
                      >
                        <Home className="w-4 h-4 text-emerald-600 shrink-0" />
                        <div>
                          <div className="font-bold text-xs text-harbor-900 dark:text-white">Old Age Home</div>
                          <div className="text-[10px] text-harbor-500 dark:text-slate-400">Registered senior living facility</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedSubRole('orphanage')}
                        className={`p-2.5 rounded-xl border text-left flex items-center space-x-2 transition-all ${
                          selectedSubRole === 'orphanage'
                            ? 'border-emerald-500 bg-white dark:bg-harbor-800 shadow-sm'
                            : 'border-harbor-200 dark:border-harbor-700 opacity-70'
                        }`}
                      >
                        <Users className="w-4 h-4 text-emerald-600 shrink-0" />
                        <div>
                          <div className="font-bold text-xs text-harbor-900 dark:text-white">Orphanage / Children's Home</div>
                          <div className="text-[10px] text-harbor-500 dark:text-slate-400">Care for orphaned youth</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedSubRole('ngo')}
                        className={`p-2.5 rounded-xl border text-left flex items-center space-x-2 transition-all ${
                          selectedSubRole === 'ngo'
                            ? 'border-emerald-500 bg-white dark:bg-harbor-800 shadow-sm'
                            : 'border-harbor-200 dark:border-harbor-700 opacity-70'
                        }`}
                      >
                        <Users className="w-4 h-4 text-emerald-600 shrink-0" />
                        <div>
                          <div className="font-bold text-xs text-harbor-900 dark:text-white">Community NGO / Food Bank</div>
                          <div className="text-[10px] text-harbor-500 dark:text-slate-400">Distribution to slum clusters</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedSubRole('individual_recipient')}
                        className={`p-2.5 rounded-xl border text-left flex items-center space-x-2 transition-all sm:col-span-2 ${
                          selectedSubRole === 'individual_recipient'
                            ? 'border-emerald-500 bg-white dark:bg-harbor-800 shadow-sm'
                            : 'border-harbor-200 dark:border-harbor-700 opacity-70'
                        }`}
                      >
                        <User className="w-4 h-4 text-emerald-600 shrink-0" />
                        <div>
                          <div className="font-bold text-xs text-harbor-900 dark:text-white">Individual Recipient</div>
                          <div className="text-[10px] text-harbor-500 dark:text-slate-400">Direct personal or family food support</div>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Common Inputs */}
            {mode === 'signup' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-harbor-700 dark:text-slate-300 mb-1">
                      Contact Person Name *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-harbor-400 absolute left-3 top-3.5" />
                      <input
                        type="text"
                        required
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="e.g. Ramesh K. or Chef Anita"
                        className="w-full min-h-[46px] pl-9 pr-3 rounded-xl border border-harbor-200 dark:border-harbor-700 bg-white dark:bg-harbor-850 text-sm text-harbor-900 dark:text-white placeholder-harbor-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-harbor-700 dark:text-slate-300 mb-1">
                      Organization / Shelter Name *
                    </label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 text-harbor-400 absolute left-3 top-3.5" />
                      <input
                        type="text"
                        required
                        value={orgName}
                        onChange={(e) => setOrgName(e.target.value)}
                        placeholder="e.g. Ananda Old Age Shelter"
                        className="w-full min-h-[46px] pl-9 pr-3 rounded-xl border border-harbor-200 dark:border-harbor-700 bg-white dark:bg-harbor-850 text-sm text-harbor-900 dark:text-white placeholder-harbor-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-harbor-700 dark:text-slate-300 mb-1">
                      Phone Number (For Pickup Handshake) *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-harbor-400 absolute left-3 top-3.5" />
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full min-h-[46px] pl-9 pr-3 rounded-xl border border-harbor-200 dark:border-harbor-700 bg-white dark:bg-harbor-850 text-sm text-harbor-900 dark:text-white placeholder-harbor-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-harbor-700 dark:text-slate-300 mb-1">
                      City / Area *
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-harbor-400 absolute left-3 top-3.5" />
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="e.g. Bengaluru, Indiranagar"
                        className="w-full min-h-[46px] pl-9 pr-3 rounded-xl border border-harbor-200 dark:border-harbor-700 bg-white dark:bg-harbor-850 text-sm text-harbor-900 dark:text-white placeholder-harbor-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-harbor-700 dark:text-slate-300 mb-1">
                    Street Address (For Physical Pickup Verification)
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. 15 Shanti Lane, Green Valley"
                    className="w-full min-h-[46px] px-3 rounded-xl border border-harbor-200 dark:border-harbor-700 bg-white dark:bg-harbor-850 text-sm text-harbor-900 dark:text-white placeholder-harbor-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-harbor-700 dark:text-slate-300 mb-1">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-harbor-400 absolute left-3 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@organization.org"
                  className="w-full min-h-[46px] pl-9 pr-3 rounded-xl border border-harbor-200 dark:border-harbor-700 bg-white dark:bg-harbor-850 text-sm text-harbor-900 dark:text-white placeholder-harbor-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-harbor-700 dark:text-slate-300 mb-1">
                Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-harbor-400 absolute left-3 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full min-h-[46px] pl-9 pr-10 rounded-xl border border-harbor-200 dark:border-harbor-700 bg-white dark:bg-harbor-850 text-sm text-harbor-900 dark:text-white placeholder-harbor-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-harbor-400 hover:text-harbor-600 dark:hover:text-slate-200 p-1"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full min-h-touch py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold text-sm shadow-teal-glow transition-all flex items-center justify-center space-x-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-60"
            >
              {isSubmitting ? (
                <span>Processing...</span>
              ) : mode === 'signin' ? (
                <span>Sign In to FoodLink</span>
              ) : (
                <span>Complete Registration</span>
              )}
            </button>
          </form>

          {/* Quick Persona Tester Bar for instant evaluation - DEV ONLY */}
          {import.meta.env.DEV && (
            <div className="pt-4 border-t border-harbor-100 dark:border-harbor-700">
              <div className="text-[11px] font-bold uppercase tracking-wider text-harbor-400 mb-2 flex items-center justify-between">
                <span>Instant Test Logins (Dev Helper)</span>
                <span className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold">Dev Only</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => { switchPersonaDemo('restaurant'); closeAuthModal(); }}
                  className="p-2 rounded-lg text-left border border-harbor-200 dark:border-harbor-700 bg-harbor-50 dark:bg-harbor-850 hover:border-teal-500 transition-colors"
                >
                  <div className="text-xs font-bold text-harbor-900 dark:text-white">🍽️ Restaurant</div>
                  <div className="text-[10px] text-harbor-500 dark:text-slate-400">Spice Garden</div>
                </button>

                <button
                  type="button"
                  onClick={() => { switchPersonaDemo('elder_shelter'); closeAuthModal(); }}
                  className="p-2 rounded-lg text-left border border-harbor-200 dark:border-harbor-700 bg-harbor-50 dark:bg-harbor-850 hover:border-emerald-500 transition-colors"
                >
                  <div className="text-xs font-bold text-harbor-900 dark:text-white">👵 Elder Care</div>
                  <div className="text-[10px] text-harbor-500 dark:text-slate-400">Ananda Haven</div>
                </button>

                <button
                  type="button"
                  onClick={() => { switchPersonaDemo('event_donor'); closeAuthModal(); }}
                  className="p-2 rounded-lg text-left border border-harbor-200 dark:border-harbor-700 bg-harbor-50 dark:bg-harbor-850 hover:border-teal-500 transition-colors"
                >
                  <div className="text-xs font-bold text-harbor-900 dark:text-white">🎉 Wedding Host</div>
                  <div className="text-[10px] text-harbor-500 dark:text-slate-400">Sharma Banquet</div>
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
