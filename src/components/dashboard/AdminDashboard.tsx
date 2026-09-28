import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useVerification } from '../../context/VerificationContext';
import { AdminReviewModal } from '../verification/AdminReviewModal';
import type { VerificationDocument } from '../../types';
import { 
  ShieldCheck, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Building2, 
  Search, 
  Eye 
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { verifications } = useVerification();

  const [activeFilter, setActiveFilter] = useState<'pending' | 'verified' | 'rejected' | 'all'>('pending');
  const [selectedDoc, setSelectedDoc] = useState<VerificationDocument | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  if (!user || user.role !== 'admin') return null;

  const filteredVerifications = verifications.filter((doc) => {
    const matchesFilter = activeFilter === 'all' || doc.status === activeFilter;
    const matchesSearch = searchQuery === '' || 
      doc.organizationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.documentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.userDisplayName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const pendingCount = verifications.filter(v => v.status === 'pending').length;
  const verifiedCount = verifications.filter(v => v.status === 'verified').length;
  const rejectedCount = verifications.filter(v => v.status === 'rejected').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Admin Panel Header */}
      <div className="bg-white dark:bg-harbor-800 rounded-3xl border border-harbor-200 dark:border-harbor-700 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold text-harbor-900 dark:text-white">
                  Verification & Safety Review Console
                </h1>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300">
                  Super Admin
                </span>
              </div>
              <p className="text-sm text-harbor-500 dark:text-slate-400 mt-1">
                Audited document screening for food donors, elder shelters, orphanages, and recipient NGOs.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <span className="inline-flex items-center text-xs font-semibold px-3 py-1.5 rounded-xl bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-200 border border-amber-300 dark:border-amber-800">
              <Clock className="w-4 h-4 mr-1.5 text-amber-600" />
              <span>{pendingCount} Awaiting Review</span>
            </span>
          </div>
        </div>
      </div>

      {/* Admin Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div 
          onClick={() => setActiveFilter('pending')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            activeFilter === 'pending'
              ? 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-400 dark:border-amber-700 shadow-sm'
              : 'bg-white dark:bg-harbor-800 border-harbor-200 dark:border-harbor-700 hover:border-amber-300'
          }`}
        >
          <div className="text-xs font-semibold text-harbor-500 dark:text-slate-400 uppercase tracking-wider">Pending Review</div>
          <div className="text-3xl font-bold text-amber-600 mt-1">{pendingCount}</div>
          <div className="text-[11px] text-harbor-500 dark:text-slate-400 font-medium mt-1">
            Requires admin action
          </div>
        </div>

        <div 
          onClick={() => setActiveFilter('verified')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            activeFilter === 'verified'
              ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-400 dark:border-emerald-700 shadow-sm'
              : 'bg-white dark:bg-harbor-800 border-harbor-200 dark:border-harbor-700 hover:border-emerald-300'
          }`}
        >
          <div className="text-xs font-semibold text-harbor-500 dark:text-slate-400 uppercase tracking-wider">Approved Partners</div>
          <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{verifiedCount}</div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1 flex items-center">
            <CheckCircle2 className="w-3 h-3 mr-1" /> 180-day verified cycle
          </div>
        </div>

        <div 
          onClick={() => setActiveFilter('rejected')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            activeFilter === 'rejected'
              ? 'bg-red-50/60 dark:bg-red-950/30 border-red-400 dark:border-red-700 shadow-sm'
              : 'bg-white dark:bg-harbor-800 border-harbor-200 dark:border-harbor-700 hover:border-red-300'
          }`}
        >
          <div className="text-xs font-semibold text-harbor-500 dark:text-slate-400 uppercase tracking-wider">Rejections with Reason</div>
          <div className="text-3xl font-bold text-red-600 mt-1">{rejectedCount}</div>
          <div className="text-[11px] text-red-600 dark:text-red-400 font-medium mt-1">
            Audit reasons stored
          </div>
        </div>

        <div 
          onClick={() => setActiveFilter('all')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            activeFilter === 'all'
              ? 'bg-teal-50/60 dark:bg-teal-950/30 border-teal-400 dark:border-teal-700 shadow-sm'
              : 'bg-white dark:bg-harbor-800 border-harbor-200 dark:border-harbor-700 hover:border-teal-300'
          }`}
        >
          <div className="text-xs font-semibold text-harbor-500 dark:text-slate-400 uppercase tracking-wider">Total Submissions</div>
          <div className="text-3xl font-bold text-harbor-900 dark:text-white mt-1">{verifications.length}</div>
          <div className="text-[11px] text-teal-600 dark:text-teal-400 font-medium mt-1">
            Complete audit trail
          </div>
        </div>
      </div>

      {/* Verification Queue Table */}
      <div className="bg-white dark:bg-harbor-800 rounded-3xl border border-harbor-200 dark:border-harbor-700 p-6 sm:p-8 shadow-sm">
        
        {/* Table Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-harbor-900 dark:text-white">
              Document Verification Queue
            </h2>
            <p className="text-xs text-harbor-500 dark:text-slate-400 mt-0.5">
              Review licenses and registrations. Rejections require mandatory explanation; approvals set 180-day expiry.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-harbor-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search org or ref #..."
                className="min-h-[38px] pl-9 pr-3 rounded-xl border border-harbor-200 dark:border-harbor-700 bg-harbor-50 dark:bg-harbor-850 text-xs text-harbor-900 dark:text-white placeholder-harbor-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center p-1 bg-harbor-100 dark:bg-harbor-850 rounded-xl border border-harbor-200 dark:border-harbor-700">
              <button
                onClick={() => setActiveFilter('pending')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeFilter === 'pending'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'text-harbor-700 dark:text-slate-300'
                }`}
              >
                Pending ({pendingCount})
              </button>
              <button
                onClick={() => setActiveFilter('verified')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeFilter === 'verified'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-harbor-700 dark:text-slate-300'
                }`}
              >
                Verified ({verifiedCount})
              </button>
              <button
                onClick={() => setActiveFilter('rejected')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeFilter === 'rejected'
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'text-harbor-700 dark:text-slate-300'
                }`}
              >
                Rejected ({rejectedCount})
              </button>
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeFilter === 'all'
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-harbor-700 dark:text-slate-300'
                }`}
              >
                All
              </button>
            </div>
          </div>
        </div>

        {/* Table Body */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-harbor-200 dark:border-harbor-700 text-harbor-400 uppercase tracking-wider">
                <th className="py-3 px-4">Organization / Partner</th>
                <th className="py-3 px-4">Role / Sector</th>
                <th className="py-3 px-4">Document Details</th>
                <th className="py-3 px-4">Status & Audit Info</th>
                <th className="py-3 px-4 text-right">Review Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-harbor-100 dark:divide-harbor-700">
              {filteredVerifications.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs text-harbor-500 dark:text-slate-400">
                    No documents found for current filter.
                  </td>
                </tr>
              ) : (
                filteredVerifications.map((doc) => (
                  <tr key={doc.id} className="hover:bg-harbor-50 dark:hover:bg-harbor-850 transition-colors">
                    
                    {/* Organization / Partner */}
                    <td className="py-4 px-4">
                      <div className="font-bold text-harbor-900 dark:text-white flex items-center space-x-2">
                        <Building2 className="w-4 h-4 text-harbor-400 shrink-0" />
                        <span>{doc.organizationName}</span>
                      </div>
                      <div className="text-[11px] text-harbor-500 dark:text-slate-400 mt-0.5">
                        {doc.userDisplayName}
                      </div>
                    </td>

                    {/* Role / Sector */}
                    <td className="py-4 px-4">
                      <span className="font-semibold text-harbor-700 dark:text-slate-300">
                        {doc.userRole === 'donor' ? 'Food Donor' : 'Recipient Org'}
                      </span>
                      <div className="text-[11px] text-teal-600 dark:text-teal-400">
                        {doc.userSubRole || 'Standard'}
                      </div>
                    </td>

                    {/* Document Details */}
                    <td className="py-4 px-4">
                      <div className="font-semibold text-harbor-800 dark:text-slate-200 flex items-center space-x-1">
                        <FileText className="w-3.5 h-3.5 text-teal-600 mr-1" />
                        <span>{doc.name}</span>
                      </div>
                      <div className="font-mono text-[11px] text-teal-600 dark:text-teal-400 font-semibold mt-0.5">
                        {doc.documentNumber}
                      </div>
                      <div className="text-[10px] text-harbor-400 dark:text-slate-500">
                        File: {doc.fileName} ({doc.fileSize || '1.5 MB'})
                      </div>
                    </td>

                    {/* Status & Audit Info */}
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${
                          doc.status === 'verified'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300'
                            : doc.status === 'rejected'
                            ? 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border-red-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300'
                        }`}>
                          {doc.status === 'verified' && <CheckCircle2 className="w-3 h-3 mr-1 text-[#16A34A]" />}
                          {doc.status === 'rejected' && <XCircle className="w-3 h-3 mr-1 text-red-600" />}
                          {doc.status === 'pending' && <Clock className="w-3 h-3 mr-1 text-amber-600" />}
                          {doc.status.toUpperCase()}
                        </span>
                      </div>

                      {/* Audit Details */}
                      {doc.reviewedAt && (
                        <div className="text-[10px] text-harbor-500 dark:text-slate-400 mt-1">
                          Audited: {new Date(doc.reviewedAt).toLocaleDateString()} by {doc.reviewedByAdminName}
                        </div>
                      )}
                      {doc.status === 'rejected' && doc.rejectionReason && (
                        <div className="text-[11px] text-red-600 dark:text-red-400 mt-1 font-medium italic max-w-xs truncate" title={doc.rejectionReason}>
                          Reason: "{doc.rejectionReason}"
                        </div>
                      )}
                      {doc.status === 'verified' && doc.expiryDate && (
                        <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">
                          Expires: {new Date(doc.expiryDate).toLocaleDateString()}
                        </div>
                      )}
                    </td>

                    {/* Review Action */}
                    <td className="py-4 px-4 text-right">
                      <button 
                        onClick={() => setSelectedDoc(doc)}
                        className={`min-h-[34px] px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center space-x-1.5 ml-auto transition-colors shadow-sm ${
                          doc.status === 'pending'
                            ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-glow'
                            : 'border border-harbor-200 dark:border-harbor-700 hover:border-teal-500 text-harbor-700 dark:text-slate-300'
                        }`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{doc.status === 'pending' ? 'Review & Decide' : 'Inspect Audit Log'}</span>
                      </button>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* Admin Review Decision Modal */}
      <AdminReviewModal
        document={selectedDoc}
        isOpen={!!selectedDoc}
        onClose={() => setSelectedDoc(null)}
        onDecided={() => setSelectedDoc(null)}
      />

    </div>
  );
};
