import React from 'react';
import { Utensils, Shield, Mail } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-harbor-200 dark:border-harbor-700 bg-white dark:bg-harbor-850 mt-20 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-teal-500 text-white flex items-center justify-center font-bold">
                <Utensils className="w-4 h-4" />
              </div>
              <span className="font-bold text-xl text-harbor-900 dark:text-white">
                Food<span className="text-teal-500">Link</span>
              </span>
            </div>
            <p className="text-xs text-harbor-500 dark:text-slate-400 leading-relaxed">
              Bridging surplus commercial & event catering food to verified elder abandonment shelters, orphanages, and community food banks.
            </p>
          </div>

          {/* Persona Links */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-harbor-900 dark:text-white uppercase tracking-wider">
              For Donors
            </h4>
            <ul className="text-xs text-harbor-500 dark:text-slate-400 space-y-1.5">
              <li><a href="#for-donors" className="hover:text-teal-500 transition-colors">Restaurant Surplus Program</a></li>
              <li><a href="#for-donors" className="hover:text-teal-500 transition-colors">Wedding & Event Leftovers</a></li>
              <li><a href="#safety-pledge" className="hover:text-teal-500 transition-colors">Food Safety Guidelines</a></li>
              <li><a href="#safety-pledge" className="hover:text-teal-500 transition-colors">CSR & Tax Receipts</a></li>
            </ul>
          </div>

          {/* Shelter Links */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-harbor-900 dark:text-white uppercase tracking-wider">
              For Shelters & Care
            </h4>
            <ul className="text-xs text-harbor-500 dark:text-slate-400 space-y-1.5">
              <li><a href="#for-shelters" className="hover:text-teal-500 transition-colors">Elder Abandonment Shelters</a></li>
              <li><a href="#for-shelters" className="hover:text-teal-500 transition-colors">Old Age Homes Enrollment</a></li>
              <li><a href="#for-shelters" className="hover:text-teal-500 transition-colors">Orphanages & Child Welfare</a></li>
              <li><a href="#how-it-works" className="hover:text-teal-500 transition-colors">Offline OTP Verification Guide</a></li>
            </ul>
          </div>

          {/* Caretaker & Partner Support */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-harbor-900 dark:text-white uppercase tracking-wider">
              Caretaker & Partner Support
            </h4>
            <p className="text-xs text-harbor-500 dark:text-slate-400">
              Need assistance coordinating verified surplus food claims or pickups?
            </p>
            <div className="p-3 rounded-xl bg-harbor-50 dark:bg-harbor-800 border border-harbor-200 dark:border-harbor-700 space-y-1">
              <div className="flex items-center space-x-2 text-xs font-bold text-teal-600 dark:text-teal-400">
                <Mail className="w-3.5 h-3.5 shrink-0" />
                <span>help@foodlink.org</span>
              </div>
              <div className="text-[11px] text-harbor-400">
                Official contact email (monitored daily)
              </div>
            </div>
          </div>

        </div>

        {/* Bottom credits */}
        <div className="pt-8 border-t border-harbor-100 dark:border-harbor-800 flex flex-col sm:flex-row items-center justify-between text-xs text-harbor-400 space-y-2 sm:space-y-0">
          <div>
            © {new Date().getFullYear()} FoodLink Foundation. Standalone Web Build. All rights reserved.
          </div>
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1">
              <Shield className="w-3.5 h-3.5 text-[#16A34A]" />
              <span>FSSAI Compliant Safety Protocols</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
