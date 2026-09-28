import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useTextSize } from '../../context/TextSizeContext';
import { 
  Sun, 
  Moon, 
  AlertCircle, 
  LogOut, 
  ChevronDown, 
  Utensils, 
  HeartHandshake,
  CheckCircle2,
  Menu,
  X,
  HelpCircle,
  Home,
  ShieldCheck
} from 'lucide-react';

interface NavbarProps {
  activeTab?: string;
  setActiveTab?: (tab: any) => void;
  onOpenHelp?: () => void;
  onOpenVerification?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  activeTab = 'home', 
  setActiveTab,
  onOpenHelp,
  onOpenVerification
}) => {
  const { user, openAuthModal, logout, switchPersonaDemo } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { textSize, increaseTextSize, decreaseTextSize } = useTextSize();
  const [isPersonaMenuOpen, setIsPersonaMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getSubRoleLabel = () => {
    if (!user) return '';
    switch (user.subRole) {
      case 'restaurant': return 'Restaurant Donor';
      case 'individual_event': return 'Wedding / Event Donor';
      case 'elder_shelter': return 'Elder Shelter Caretaker';
      case 'old_age_home': return 'Old Age Home';
      case 'orphanage': return 'Children’s Shelter';
      case 'ngo': return 'Verified NGO Lead';
      case 'individual_recipient': return 'Individual Recipient';
      default: return user.role === 'admin' ? 'Safety Admin' : user.role;
    }
  };

  return (
    <>
      {/* Skip to Main Content Link (Accessibility) */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2.5 focus:bg-teal-600 focus:text-white focus:rounded-xl focus:shadow-xl focus:outline-none focus:ring-2 focus:ring-white text-xs font-bold"
      >
        Skip to main content
      </a>

      <header className="sticky top-0 z-40 bg-harbor-50/90 dark:bg-harbor-900/90 backdrop-blur-md border-b border-harbor-200 dark:border-harbor-700 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => setActiveTab && setActiveTab(user ? 'home' : 'landing')}
                className="flex items-center space-x-3 group focus:outline-none focus:ring-2 focus:ring-teal-500 rounded-lg p-1 text-left"
              >
                <div className="w-11 h-11 rounded-xl bg-teal-500 flex items-center justify-center text-white shadow-teal-glow group-hover:scale-105 transition-transform">
                  <Utensils className="w-6 h-6 stroke-[2.5]" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center space-x-1.5">
                    <span className="font-bold text-2xl tracking-tight text-harbor-900 dark:text-white">
                      Food<span className="text-teal-500">Link</span>
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300">
                      Web
                    </span>
                  </div>
                  <span className="text-xs text-harbor-500 dark:text-slate-400 font-medium">Surplus Food Rescue Network</span>
                </div>
              </button>
            </div>

            {/* Center Navigation Links (Desktop) */}
            <nav className="hidden md:flex items-center space-x-6 text-sm font-semibold text-harbor-600 dark:text-slate-300">
              {user ? (
                <div className="flex items-center p-1 bg-harbor-100 dark:bg-harbor-800 rounded-xl border border-harbor-200 dark:border-harbor-700">
                  <button
                    onClick={() => setActiveTab && setActiveTab('home')}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      activeTab === 'home'
                        ? 'bg-teal-600 text-white shadow-sm'
                        : 'text-harbor-700 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400'
                    }`}
                  >
                    Home Hub
                  </button>
                  <button
                    onClick={() => setActiveTab && setActiveTab('dashboard')}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      activeTab === 'dashboard'
                        ? 'bg-teal-600 text-white shadow-sm'
                        : 'text-harbor-700 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400'
                    }`}
                  >
                    My Workspace
                  </button>
                  <button
                    onClick={() => setActiveTab && setActiveTab('landing')}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      activeTab === 'landing'
                        ? 'bg-teal-600 text-white shadow-sm'
                        : 'text-harbor-700 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400'
                    }`}
                  >
                    Public Overview
                  </button>
                </div>
              ) : (
                <>
                  <a href="#how-it-works" className="hover:text-teal-500 transition-colors">How It Works</a>
                  <a href="#for-donors" className="hover:text-teal-500 transition-colors">For Donors</a>
                  <a href="#for-shelters" className="hover:text-teal-500 transition-colors">For Shelters & NGOs</a>
                  <a href="#safety-pledge" className="hover:text-teal-500 transition-colors">Food Safety</a>
                  <a href="#impact-calculator" className="hover:text-teal-500 transition-colors">Impact</a>
                </>
              )}
            </nav>

            {/* Right Action Bar */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              
              {/* Text Size Control for Elderly Caretakers */}
              <div 
                className="flex items-center rounded-xl border border-harbor-200 dark:border-harbor-700 bg-white dark:bg-harbor-800 p-0.5 shadow-sm"
                title="Adjust text size for elderly caretakers (A- / A+)"
              >
                <button
                  type="button"
                  onClick={decreaseTextSize}
                  disabled={textSize === 'normal'}
                  aria-label="Decrease text size"
                  className={`px-2 py-1.5 text-xs font-bold rounded-lg transition-colors min-h-[38px] min-w-[34px] flex items-center justify-center ${
                    textSize === 'normal' 
                      ? 'text-harbor-300 dark:text-harbor-600 cursor-not-allowed' 
                      : 'text-harbor-700 dark:text-slate-200 hover:text-teal-600 dark:hover:text-teal-400 active:scale-95'
                  }`}
                >
                  A-
                </button>
                <span className="text-[10px] font-bold px-1 text-teal-600 dark:text-teal-400 select-none">
                  {textSize === 'normal' ? '1x' : textSize === 'large' ? '1.1x' : '1.3x'}
                </span>
                <button
                  type="button"
                  onClick={increaseTextSize}
                  disabled={textSize === 'xlarge'}
                  aria-label="Increase text size"
                  className={`px-2 py-1.5 text-xs font-bold rounded-lg transition-colors min-h-[38px] min-w-[34px] flex items-center justify-center ${
                    textSize === 'xlarge' 
                      ? 'text-harbor-300 dark:text-harbor-600 cursor-not-allowed' 
                      : 'text-harbor-700 dark:text-slate-200 hover:text-teal-600 dark:hover:text-teal-400 active:scale-95'
                  }`}
                >
                  A+
                </button>
              </div>

              {/* Help & FAQ Trigger */}
              {onOpenHelp && (
                <button
                  type="button"
                  onClick={onOpenHelp}
                  aria-label="Open help and FAQ"
                  className="min-h-touch min-w-touch p-2.5 rounded-xl border border-harbor-200 dark:border-harbor-700 bg-white dark:bg-harbor-800 text-harbor-700 dark:text-slate-200 hover:border-teal-500 hover:text-teal-500 transition-all flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-teal-500"
                  title="Care coordinator help & FAQ"
                >
                  <HelpCircle className="w-5 h-5" />
                </button>
              )}

              {/* Harbor & Teal Light/Dark Theme Switcher */}
              <button
                onClick={toggleTheme}
                aria-label="Toggle light and dark mode"
                className="min-h-touch min-w-touch p-2.5 rounded-xl border border-harbor-200 dark:border-harbor-700 bg-white dark:bg-harbor-800 text-harbor-700 dark:text-slate-200 hover:border-teal-500 hover:text-teal-500 transition-all flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-teal-500"
                title={`Switch to ${theme === 'light' ? 'Dark Harbor' : 'Light'} Mode`}
              >
                {theme === 'light' ? (
                  <Moon className="w-5 h-5" />
                ) : (
                  <Sun className="w-5 h-5 text-teal-400" />
                )}
              </button>

              {/* User State */}
              {user ? (
                <div className="relative">
                  <div className="flex items-center space-x-2">
                    <div className="bg-white dark:bg-harbor-800 border border-harbor-200 dark:border-harbor-700 rounded-xl px-3 py-1.5 flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-sm">
                        {user.displayName.charAt(0).toUpperCase()}
                      </div>
                      <div className="text-left hidden lg:block">
                        <div className="text-xs font-bold text-harbor-900 dark:text-white leading-tight truncate max-w-[130px]">
                          {user.displayName}
                        </div>
                        <div className="text-[11px] text-teal-600 dark:text-teal-400 font-medium">
                          {getSubRoleLabel()}
                        </div>
                      </div>

                      {/* Verification Status Badge - distinct green #16A34A */}
                      {user.verificationStatus === 'verified' ? (
                        <span className="hidden xl:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                          <CheckCircle2 className="w-3 h-3 mr-1 text-[#16A34A]" /> Verified
                        </span>
                      ) : (
                        <span className="hidden xl:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                          <AlertCircle className="w-3 h-3 mr-1" /> Pending
                        </span>
                      )}

                      {/* Switch Persona Dropdown Trigger - DEV ONLY */}
                      {import.meta.env.DEV && (
                        <button
                          onClick={() => setIsPersonaMenuOpen(!isPersonaMenuOpen)}
                          className="p-1 rounded-md text-harbor-500 hover:text-harbor-900 dark:hover:text-white"
                          title="Switch demo role (Dev Only)"
                          aria-label="Switch persona"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <button
                      onClick={() => logout()}
                      className="min-h-touch px-3 py-2 rounded-xl text-xs font-semibold border border-harbor-200 dark:border-harbor-700 bg-white dark:bg-harbor-800 text-harbor-700 dark:text-slate-200 hover:border-red-500 hover:text-red-600 transition-colors flex items-center space-x-1"
                      title="Sign Out"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="hidden sm:inline">Sign Out</span>
                    </button>
                  </div>

                  {/* Persona Switch Menu - DEV ONLY */}
                  {import.meta.env.DEV && isPersonaMenuOpen && (
                    <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-harbor-800 border border-harbor-200 dark:border-harbor-700 rounded-xl shadow-harbor-lg p-2 z-50 text-left">
                      <div className="px-3 py-2 border-b border-harbor-100 dark:border-harbor-700 text-xs font-bold text-harbor-400 uppercase tracking-wider flex items-center justify-between">
                        <span>Switch Role for Testing</span>
                        <span className="text-[10px] text-teal-600 font-normal">Dev Only</span>
                      </div>
                      <div className="space-y-1 mt-1 text-xs">
                        <button
                          onClick={() => { switchPersonaDemo('restaurant'); setIsPersonaMenuOpen(false); }}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-teal-50 dark:hover:bg-harbor-700 flex items-center justify-between"
                        >
                          <span className="font-semibold text-harbor-800 dark:text-slate-200">🍽️ Restaurant Donor</span>
                          <span className="text-[10px] text-teal-600 font-medium">Donor</span>
                        </button>
                        <button
                          onClick={() => { switchPersonaDemo('event_donor'); setIsPersonaMenuOpen(false); }}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-teal-50 dark:hover:bg-harbor-700 flex items-center justify-between"
                        >
                          <span className="font-semibold text-harbor-800 dark:text-slate-200">🎉 Wedding/Event Donor</span>
                          <span className="text-[10px] text-teal-600 font-medium">Donor</span>
                        </button>
                        <button
                          onClick={() => { switchPersonaDemo('elder_shelter'); setIsPersonaMenuOpen(false); }}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-teal-50 dark:hover:bg-harbor-700 flex items-center justify-between"
                        >
                          <span className="font-semibold text-harbor-800 dark:text-slate-200">👵 Elder Shelter Caretaker</span>
                          <span className="text-[10px] text-[#16A34A] font-medium">Shelter</span>
                        </button>
                        <button
                          onClick={() => { switchPersonaDemo('old_age_home'); setIsPersonaMenuOpen(false); }}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-teal-50 dark:hover:bg-harbor-700 flex items-center justify-between"
                        >
                          <span className="font-semibold text-harbor-800 dark:text-slate-200">🏡 Old Age Home</span>
                          <span className="text-[10px] text-[#16A34A] font-medium">Recipient</span>
                        </button>
                        <button
                          onClick={() => { switchPersonaDemo('orphanage'); setIsPersonaMenuOpen(false); }}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-teal-50 dark:hover:bg-harbor-700 flex items-center justify-between"
                        >
                          <span className="font-semibold text-harbor-800 dark:text-slate-200">🧸 Children’s Orphanage</span>
                          <span className="text-[10px] text-[#16A34A] font-medium">Recipient</span>
                        </button>
                        <button
                          onClick={() => { switchPersonaDemo('ngo'); setIsPersonaMenuOpen(false); }}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-teal-50 dark:hover:bg-harbor-700 flex items-center justify-between"
                        >
                          <span className="font-semibold text-harbor-800 dark:text-slate-200">🤝 Registered NGO</span>
                          <span className="text-[10px] text-[#16A34A] font-medium">Recipient</span>
                        </button>
                        <button
                          onClick={() => { switchPersonaDemo('individual_recipient'); setIsPersonaMenuOpen(false); }}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-teal-50 dark:hover:bg-harbor-700 flex items-center justify-between"
                        >
                          <span className="font-semibold text-harbor-800 dark:text-slate-200">👤 Individual Recipient</span>
                          <span className="text-[10px] text-[#16A34A] font-medium">Direct</span>
                        </button>
                        <button
                          onClick={() => { switchPersonaDemo('admin'); setIsPersonaMenuOpen(false); }}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-teal-50 dark:hover:bg-harbor-700 flex items-center justify-between border-t border-harbor-100 dark:border-harbor-700"
                        >
                          <span className="font-semibold text-harbor-800 dark:text-slate-200">🛡️ Safety Admin Reviewer</span>
                          <span className="text-[10px] text-purple-600 font-medium">Admin</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => openAuthModal('signin')}
                    className="min-h-touch px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-harbor-700 dark:text-slate-200 hover:text-teal-600 dark:hover:text-teal-400 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => openAuthModal('signup')}
                    className="min-h-touch px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-teal-600 hover:bg-teal-700 text-white shadow-teal-glow transition-all focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 flex items-center space-x-1.5"
                  >
                    <HeartHandshake className="w-4 h-4" />
                    <span>Join FoodLink</span>
                  </button>
                </div>
              )}

              {/* Mobile Menu Hamburger */}
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle navigation menu"
                className="md:hidden min-h-touch min-w-touch p-2 rounded-xl border border-harbor-200 dark:border-harbor-700 bg-white dark:bg-harbor-800 text-harbor-700 dark:text-slate-200 flex items-center justify-center"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

            </div>

          </div>
        </div>

        {/* Mobile Slide-down Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-harbor-200 dark:border-harbor-700 bg-white dark:bg-harbor-850 p-4 space-y-3 shadow-xl animate-fade-in">
            {user ? (
              <div className="space-y-2">
                <button
                  onClick={() => { setActiveTab && setActiveTab('home'); setIsMobileMenuOpen(false); }}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-harbor-100 dark:hover:bg-harbor-800 text-xs font-bold text-harbor-900 dark:text-white flex items-center space-x-2"
                >
                  <Home className="w-4 h-4 text-teal-600" />
                  <span>Home Hub</span>
                </button>
                <button
                  onClick={() => { setActiveTab && setActiveTab('dashboard'); setIsMobileMenuOpen(false); }}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-harbor-100 dark:hover:bg-harbor-800 text-xs font-bold text-harbor-900 dark:text-white flex items-center space-x-2"
                >
                  <Utensils className="w-4 h-4 text-teal-600" />
                  <span>My Workspace Dashboard</span>
                </button>
                <button
                  onClick={() => { setActiveTab && setActiveTab('landing'); setIsMobileMenuOpen(false); }}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-harbor-100 dark:hover:bg-harbor-800 text-xs font-bold text-harbor-900 dark:text-white flex items-center space-x-2"
                >
                  <span>Public Site Overview</span>
                </button>
                {onOpenVerification && (
                  <button
                    onClick={() => { onOpenVerification(); setIsMobileMenuOpen(false); }}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-harbor-100 dark:hover:bg-harbor-800 text-xs font-bold text-harbor-900 dark:text-white flex items-center space-x-2"
                  >
                    <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
                    <span>Verification Status & Upload</span>
                  </button>
                )}
                {onOpenHelp && (
                  <button
                    onClick={() => { onOpenHelp(); setIsMobileMenuOpen(false); }}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-harbor-100 dark:hover:bg-harbor-800 text-xs font-bold text-harbor-900 dark:text-white flex items-center space-x-2"
                  >
                    <HelpCircle className="w-4 h-4 text-teal-600" />
                    <span>Caretaker Help & FAQ</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-2 text-xs font-semibold text-harbor-700 dark:text-slate-300">
                <a href="#how-it-works" onClick={() => setIsMobileMenuOpen(false)} className="block p-2 hover:bg-harbor-100 dark:hover:bg-harbor-800 rounded-lg">How It Works</a>
                <a href="#for-donors" onClick={() => setIsMobileMenuOpen(false)} className="block p-2 hover:bg-harbor-100 dark:hover:bg-harbor-800 rounded-lg">For Donors</a>
                <a href="#for-shelters" onClick={() => setIsMobileMenuOpen(false)} className="block p-2 hover:bg-harbor-100 dark:hover:bg-harbor-800 rounded-lg">For Shelters & NGOs</a>
                <a href="#safety-pledge" onClick={() => setIsMobileMenuOpen(false)} className="block p-2 hover:bg-harbor-100 dark:hover:bg-harbor-800 rounded-lg">Food Safety Guidelines</a>
                {onOpenHelp && (
                  <button
                    onClick={() => { onOpenHelp(); setIsMobileMenuOpen(false); }}
                    className="w-full text-left p-2 hover:bg-harbor-100 dark:hover:bg-harbor-800 rounded-lg text-teal-600 dark:text-teal-400 font-bold"
                  >
                    Caretaker Help & FAQ
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </header>
    </>
  );
};
