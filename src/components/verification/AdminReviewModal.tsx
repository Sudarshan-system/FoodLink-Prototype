import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useVerification } from '../../context/VerificationContext';
import type { VerificationDocument } from '../../types';
import { 
  X, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  Building2, 
  Calendar, 
  AlertCircle, 
  Clock, 
  UserCheck, 
  ExternalLink, 
  ShieldAlert 
} from 'lucide-react';

interface AdminReviewModalProps {
  document: VerificationDocument | null;
  isOpen: boolean;
  onClose: () => void;
  onDecided?: () => void;
}

export const AdminReviewModal: React.FC<AdminReviewModalProps> = ({
  document: docItem,
  isOpen,
  onClose,
  onDecided
}) => {
  const { user: adminUser } = useAuth();
  const { approveDocument, rejectDocument } = useVerification();

  const [mode, setMode] = useState<'view' | 'rejecting'>('view');
  const [rejectionReason, setRejectionReason] = useState('');
  const [expiryDays, setExpiryDays] = useState(180);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen || !docItem || !adminUser) return null;

  const handleApprove = async () => {
    setErrorMessage(null);
    setIsProcessing(true);
    try {
      const calculatedExpiry = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000).toISOString();
      await approveDocument(docItem.id, calculatedExpiry);
      if (onDecided) onDecided();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Approval action could not be completed.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmReject = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Requirement 3: Rejection MUST require a reason (free text field)
    if (!rejectionReason.trim()) {
      setErrorMessage('Rejection reason cannot be blank. Please explain what the partner must fix.');
      return;
    }

    setIsProcessing(true);
    try {
      await rejectDocument(docItem.id, rejectionReason.trim());
      if (onDecided) onDecided();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Rejection action could not be completed.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-harbor-950/75 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-white dark:bg-harbor-800 rounded-3xl border border-harbor-200 dark:border-harbor-700 shadow-2xl overflow-hidden transition-all max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-harbor-100 dark:border-harbor-700 bg-harbor-50/50 dark:bg-harbor-850">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-harbor-900 dark:text-white">
                Admin Verification Review
              </h2>
              <p className="text-xs text-harbor-500 dark:text-slate-400">
                Audited Decision Console • Reviewing: {docItem.organizationName}
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

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Partner Summary Card */}
          <div className="p-4 rounded-2xl bg-harbor-50 dark:bg-harbor-850 border border-harbor-200 dark:border-harbor-700 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-harbor-400">Partner Details</div>
                <div className="text-base font-bold text-harbor-900 dark:text-white mt-0.5 flex items-center space-x-2">
                  <Building2 className="w-4 h-4 text-harbor-400" />
                  <span>{docItem.organizationName}</span>
                </div>
                <div className="text-xs text-harbor-600 dark:text-slate-300 mt-0.5">
                  Contact: {docItem.userDisplayName} • Role: {docItem.userRole.toUpperCase()} ({docItem.userSubRole || 'Standard'})
                </div>
              </div>

              <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                docItem.status === 'verified'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300'
                  : docItem.status === 'rejected'
                  ? 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border-red-300'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300'
              }`}>
                {docItem.status.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Document Verification Inspection Card */}
          <div className="p-4 rounded-2xl border border-harbor-200 dark:border-harbor-700 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-harbor-400">Attached Document</div>
            
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm text-harbor-900 dark:text-white">
                    {docItem.name}
                  </div>
                  <div className="text-xs font-mono text-teal-600 dark:text-teal-400 font-semibold mt-0.5">
                    Ref #: {docItem.documentNumber}
                  </div>
                  <div className="text-[11px] text-harbor-400 dark:text-slate-500 mt-0.5">
                    File: {docItem.fileName} ({docItem.fileSize || '1.5 MB'}) • Submitted: {new Date(docItem.submittedAt).toLocaleString()}
                  </div>
                </div>
              </div>

              <a
                href={docItem.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg border border-harbor-200 dark:border-harbor-700 text-xs font-semibold text-harbor-700 dark:text-slate-300 hover:border-teal-500 flex items-center space-x-1"
              >
                <span>View Scan</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Audit Trail Information */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-harbor-900/60 border border-slate-200 dark:border-harbor-700 text-xs text-harbor-600 dark:text-slate-300 space-y-1.5">
            <div className="font-bold text-harbor-800 dark:text-slate-200 flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5 text-purple-600" />
              <span>Audit Trail & Compliance Log</span>
            </div>
            <div>
              Reviewing Officer: <span className="font-semibold text-harbor-900 dark:text-white">{adminUser.displayName}</span> (UID: <span className="font-mono text-[11px]">{adminUser.uid}</span>)
            </div>
            {docItem.reviewedAt && (
              <div>
                Prior Decision: <span className="font-semibold">{docItem.status.toUpperCase()}</span> by {docItem.reviewedByAdminName} on {new Date(docItem.reviewedAt).toLocaleString()}
              </div>
            )}
            {docItem.rejectionReason && (
              <div className="text-red-600 dark:text-red-400">
                Prior Rejection Note: "{docItem.rejectionReason}"
              </div>
            )}
          </div>

          {/* Form Actions: View vs Rejecting */}
          {mode === 'rejecting' ? (
            <form onSubmit={handleConfirmReject} className="space-y-4 pt-2">
              <div className="p-4 rounded-2xl bg-red-50/70 dark:bg-red-950/30 border border-red-200 dark:border-red-800/60 space-y-2">
                <label className="block text-xs font-bold text-red-900 dark:text-red-200 uppercase tracking-wider flex items-center space-x-1.5">
                  <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
                  <span>Mandatory Rejection Rationale *</span>
                </label>
                <p className="text-xs text-red-700 dark:text-red-300">
                  State clearly what is missing or invalid so the partner can resolve the discrepancy and re-upload.
                </p>
                <textarea
                  required
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. FSSAI certificate expired on June 2025. Please upload active renewal certificate."
                  className="w-full p-3 rounded-xl border border-red-300 dark:border-red-700 bg-white dark:bg-harbor-850 text-sm text-harbor-900 dark:text-white placeholder-harbor-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setMode('view')}
                  className="min-h-touch px-4 py-2 rounded-xl border border-harbor-200 dark:border-harbor-700 text-xs font-semibold text-harbor-700 dark:text-slate-300"
                >
                  Back to Review
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="min-h-touch px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-1.5 disabled:opacity-60"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Confirm Rejection</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4 pt-2">
              {/* Expiry Selector for Approval */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-harbor-50 dark:bg-harbor-850 border border-harbor-200 dark:border-harbor-700 gap-3">
                <div className="flex items-center space-x-2 text-xs text-harbor-700 dark:text-slate-300">
                  <Calendar className="w-4 h-4 text-teal-600" />
                  <span>Verification Validity Period:</span>
                </div>
                <select
                  value={expiryDays}
                  onChange={(e) => setExpiryDays(Number(e.target.value))}
                  className="px-3 py-1.5 rounded-lg border border-harbor-200 dark:border-harbor-700 bg-white dark:bg-harbor-800 text-xs font-semibold text-harbor-900 dark:text-white"
                >
                  <option value={180}>180 Days (Standard 6-Month Cycle)</option>
                  <option value={90}>90 Days (Quarterly Probation)</option>
                  <option value={365}>365 Days (Annual Verification)</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setMode('rejecting')}
                  disabled={isProcessing}
                  className="min-h-touch px-5 py-2.5 rounded-xl border border-red-300 dark:border-red-800/80 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 hover:bg-red-100 font-bold text-xs transition-colors flex items-center space-x-1.5 disabled:opacity-60"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject with Reason</span>
                </button>

                <button
                  type="button"
                  onClick={handleApprove}
                  disabled={isProcessing}
                  className="min-h-touch px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-1.5 disabled:opacity-60"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve & Grant Verified Status</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
