import React, { useState } from 'react';
import { X, ChevronDown, HelpCircle, Mail } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (!isOpen) return null;

  const faqs = [
    {
      question: "How does verification work on FoodLink?",
      answer: "FoodLink mandates verification for all participating donors and recipients before any food can be listed or claimed. Restaurants and event caterers submit their FSSAI food safety registration or business ID. Recipient NGOs, orphanages, and elder care homes submit their trust registration, Darpan ID, or municipal care licenses. Safety administrators inspect and approve documents with a recorded audit trail, typically within 2 hours."
    },
    {
      question: "What is the 4-point food safety self-declaration?",
      answer: "Before any surplus batch is published, the food donor must explicitly declare four FSSAI-compliant criteria: (1) Hot food maintained above 60°C or cold below 5°C, (2) Prepared freshly within the last 4 hours, (3) Packed in clean, sealed food-grade containers, and (4) All known allergens accurately disclosed. This ensures shelters receive only safe, consumable surplus."
    },
    {
      question: "How is pickup address privacy protected?",
      answer: "Exact pickup locations, contact telephone numbers, and kitchen dispatch instructions are confidential. They are stored in an encrypted subdocument readable only by the donor and the verified recipient who has a confirmed claim. The public directory and maps display only coarse locality information (e.g. 'Indiranagar, Bengaluru')."
    },
    {
      question: "How do verified offline pickups work?",
      answer: "When a shelter claims a surplus food listing, a unique 6-digit offline pickup handshake verification code (OTP) is generated. When the shelter volunteer arrives at the donor's kitchen, the donor verifies the OTP to confirm handover. This prevents errors, fraud, and misallocation."
    },
    {
      question: "Who can register as a food recipient?",
      answer: "Registered non-governmental organizations (NGOs), children's orphanages, elderly abandonment shelters, licensed old age homes, and verified community feeding volunteers are eligible to claim surplus food."
    }
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-harbor-950/75 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-white dark:bg-harbor-800 rounded-3xl border border-harbor-200 dark:border-harbor-700 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-harbor-100 dark:border-harbor-700 bg-harbor-50/50 dark:bg-harbor-850">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <HelpCircle className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-harbor-900 dark:text-white">
                FoodLink Caretaker Help & FAQ
              </h2>
              <p className="text-xs text-harbor-500 dark:text-slate-400">
                Protocols, safety rules, and coordinator guidance
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

        {/* FAQ List */}
        <div className="overflow-y-auto p-6 space-y-4">
          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div 
                  key={idx}
                  className="rounded-2xl border border-harbor-200 dark:border-harbor-700 bg-harbor-50/60 dark:bg-harbor-850 overflow-hidden transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                    className="w-full text-left p-4 flex items-center justify-between space-x-3 hover:bg-harbor-100/60 dark:hover:bg-harbor-800 transition-colors"
                  >
                    <span className="text-sm font-bold text-harbor-900 dark:text-white">
                      {faq.question}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-harbor-400 transition-transform ${isOpen ? 'rotate-180 text-teal-600' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 text-xs text-harbor-600 dark:text-slate-300 leading-relaxed border-t border-harbor-100 dark:border-harbor-800 pt-3">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Support Email Card */}
          <div className="mt-6 p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500 text-white flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-teal-950 dark:text-teal-200">Need personal assistance?</div>
                <div className="text-[11px] text-teal-700 dark:text-teal-300">Contact our volunteer coordinator team</div>
              </div>
            </div>
            <a
              href="mailto:help@foodlink.org"
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-colors"
            >
              help@foodlink.org
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};
