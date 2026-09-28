import React from 'react';
import { Home, Utensils, Heart, ShieldCheck, HelpCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface MobileBottomNavProps {
  activeTab: string;
  onTabSelect: (tab: string) => void;
  onOpenVerification?: () => void;
  onOpenHelp?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onTabSelect,
  onOpenVerification,
  onOpenHelp
}) => {
  const { user } = useAuth();
  const isDonor = user?.role === 'donor';

  return (
    <nav 
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-harbor-900/95 backdrop-blur-md border-t border-harbor-200 dark:border-harbor-700 shadow-xl pb-[env(safe-area-inset-bottom)] transition-colors"
    >
      <div className="grid grid-cols-4 h-16">
        
        {/* Tab 1: Home */}
        <button
          type="button"
          onClick={() => onTabSelect('home')}
          className={`flex flex-col items-center justify-center space-y-1 min-h-[48px] transition-colors ${
            activeTab === 'home'
              ? 'text-teal-600 dark:text-teal-400 font-bold'
              : 'text-harbor-500 dark:text-slate-400 hover:text-harbor-800 dark:hover:text-slate-200'
          }`}
        >
          <Home className="w-5 h-5 stroke-[2.2]" />
          <span className="text-[10px] leading-none">Home</span>
        </button>

        {/* Tab 2: Donate / Browse */}
        <button
          type="button"
          onClick={() => onTabSelect(isDonor ? 'donor' : 'recipient')}
          className={`flex flex-col items-center justify-center space-y-1 min-h-[48px] transition-colors ${
            activeTab === 'donor' || activeTab === 'recipient'
              ? 'text-teal-600 dark:text-teal-400 font-bold'
              : 'text-harbor-500 dark:text-slate-400 hover:text-harbor-800 dark:hover:text-slate-200'
          }`}
        >
          {isDonor ? (
            <>
              <Utensils className="w-5 h-5 stroke-[2.2]" />
              <span className="text-[10px] leading-none">Donate</span>
            </>
          ) : (
            <>
              <Heart className="w-5 h-5 stroke-[2.2]" />
              <span className="text-[10px] leading-none">Browse</span>
            </>
          )}
        </button>

        {/* Tab 3: Verify */}
        <button
          type="button"
          onClick={() => {
            if (onOpenVerification) onOpenVerification();
            onTabSelect('verify');
          }}
          className={`flex flex-col items-center justify-center space-y-1 min-h-[48px] transition-colors ${
            activeTab === 'verify'
              ? 'text-teal-600 dark:text-teal-400 font-bold'
              : 'text-harbor-500 dark:text-slate-400 hover:text-harbor-800 dark:hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
          <span className="text-[10px] leading-none">Verify</span>
        </button>

        {/* Tab 4: Help */}
        <button
          type="button"
          onClick={() => {
            if (onOpenHelp) onOpenHelp();
            onTabSelect('help');
          }}
          className={`flex flex-col items-center justify-center space-y-1 min-h-[48px] transition-colors ${
            activeTab === 'help'
              ? 'text-teal-600 dark:text-teal-400 font-bold'
              : 'text-harbor-500 dark:text-slate-400 hover:text-harbor-800 dark:hover:text-slate-200'
          }`}
        >
          <HelpCircle className="w-5 h-5 stroke-[2.2]" />
          <span className="text-[10px] leading-none">Help</span>
        </button>

      </div>
    </nav>
  );
};
