import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { TextSizeProvider } from './context/TextSizeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { VerificationProvider } from './context/VerificationContext';
import { ListingProvider } from './context/ListingContext';

import { Navbar } from './components/layout/Navbar';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { LandingPage } from './components/landing/LandingPage';
import { AuthModal } from './components/auth/AuthModal';
import { Footer } from './components/layout/Footer';
import { HomeHub } from './components/home/HomeHub';
import { DonorDashboard } from './components/dashboard/DonorDashboard';
import { RecipientDashboard } from './components/dashboard/RecipientDashboard';
import { AdminDashboard } from './components/dashboard/AdminDashboard';
import { DocumentSubmissionModal } from './components/verification/DocumentSubmissionModal';
import { CreateListingModal } from './components/listings/CreateListingModal';
import { HelpModal } from './components/help/HelpModal';

export type AppTab = 'home' | 'dashboard' | 'donor' | 'recipient' | 'landing';

const MainAppContent: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<AppTab>('home');
  const [isVerificationOpen, setIsVerificationOpen] = useState(false);
  const [isCreateListingOpen, setIsCreateListingOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // When user signs in, default to the Home Hub
  useEffect(() => {
    if (user) {
      setActiveTab('home');
    } else {
      setActiveTab('landing');
    }
  }, [user?.uid]);

  const renderContent = () => {
    if (!user || activeTab === 'landing') {
      return <LandingPage />;
    }

    if (activeTab === 'home') {
      return (
        <HomeHub
          onNavigateToDonor={() => setActiveTab('donor')}
          onNavigateToRecipient={() => setActiveTab('recipient')}
          onOpenCreateListing={() => setIsCreateListingOpen(true)}
          onOpenVerification={() => setIsVerificationOpen(true)}
        />
      );
    }

    if (activeTab === 'donor') {
      return <DonorDashboard onOpenCreateListing={() => setIsCreateListingOpen(true)} />;
    }

    if (activeTab === 'recipient') {
      return <RecipientDashboard />;
    }

    if (activeTab === 'dashboard') {
      if (user.role === 'admin') return <AdminDashboard />;
      if (user.role === 'donor') return <DonorDashboard onOpenCreateListing={() => setIsCreateListingOpen(true)} />;
      if (user.role === 'recipient') return <RecipientDashboard />;
    }

    return <LandingPage />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-harbor-50 dark:bg-harbor-900 text-harbor-900 dark:text-slate-100 transition-colors pb-16 md:pb-0">
      
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onOpenHelp={() => setIsHelpOpen(true)}
        onOpenVerification={() => setIsVerificationOpen(true)}
      />

      {/* Main Page Body with accessibility anchor */}
      <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
        {renderContent()}
      </main>

      <Footer />

      {/* Mobile Bottom Tab Bar (phones only, no duplicate dark-mode toggle) */}
      <MobileBottomNav
        activeTab={activeTab}
        onTabSelect={(tab) => {
          if (tab === 'verify') {
            setIsVerificationOpen(true);
          } else if (tab === 'help') {
            setIsHelpOpen(true);
          } else {
            setActiveTab(tab as AppTab);
          }
        }}
        onOpenVerification={() => setIsVerificationOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      {/* Global Modals */}
      <AuthModal />

      <DocumentSubmissionModal
        isOpen={isVerificationOpen}
        onClose={() => setIsVerificationOpen(false)}
      />

      <CreateListingModal
        isOpen={isCreateListingOpen}
        onClose={() => setIsCreateListingOpen(false)}
        onOpenVerificationModal={() => {
          setIsCreateListingOpen(false);
          setIsVerificationOpen(true);
        }}
      />

      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />

    </div>
  );
};

export function App() {
  return (
    <ThemeProvider>
      <TextSizeProvider>
        <AuthProvider>
          <VerificationProvider>
            <ListingProvider>
              <MainAppContent />
            </ListingProvider>
          </VerificationProvider>
        </AuthProvider>
      </TextSizeProvider>
    </ThemeProvider>
  );
}

export default App;
