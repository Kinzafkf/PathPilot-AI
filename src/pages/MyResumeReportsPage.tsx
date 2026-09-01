import React, { useEffect, useState } from 'react';
import {
  FileText,
  Search,
  Trash2,
  Calendar,
  ChevronRight,
  Loader2,
  Plus,
  Download,
  History,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { dbService } from '../services/dbService';
import { SavedResumeAnalysis } from '../types';
import { ScoreGauge } from '../components/ScoreGauge';
import { ConfirmModal } from '../components/ConfirmModal';
import { exportResumeAnalysisToPDF } from '../utils/pdfExport';

interface MyResumeReportsPageProps {
  onSelectReport: (analysis: any, id: string) => void;
  onCreateNew: () => void;
}

export const MyResumeReportsPage: React.FC<MyResumeReportsPageProps> = ({
  onSelectReport,
  onCreateNew,
}) => {
  const { user } = useAuth();
  const [resumes, setResumes] = useState<SavedResumeAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  useEffect(() => {
    loadResumes();
  }, [user]);

  const loadResumes = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await dbService.getResumeAnalyses(user.id);
      setResumes(data);
    } catch (err) {
      console.error('Error fetching resume analyses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await dbService.deleteResumeAnalysis(deleteTargetId);
      setResumes((prev) => prev.filter((r) => r.id !== deleteTargetId));
      setDeleteTargetId(null);
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleExportPDF = (analysisData: any) => {
    try {
      exportResumeAnalysisToPDF(analysisData);
    } catch (err) {
      console.error('Export error:', err);
    }
  };

  const filteredResumes = resumes.filter(
    (r) =>
      r.file_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.target_role && r.target_role.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div id="my-resume-reports-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            My Resume Reports
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Historical ATS evaluations, bullet point rewrites, and PDF audit records.
          </p>
        </div>

        <button
          id="analyze-new-resume-btn"
          onClick={onCreateNew}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-xs font-bold shadow-md transition flex items-center space-x-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Analyze New Resume</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          id="search-resumes-input"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search reports by filename or target role..."
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* List */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
          <p className="text-xs text-slate-400">Loading your resume reports...</p>
        </div>
      ) : filteredResumes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredResumes.map((r) => (
            <div
              key={r.id}
              className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <ScoreGauge score={r.ats_score} size="sm" />
                  <div className="space-y-1">
                    <h3 className="font-bold text-base text-slate-900 dark:text-white truncate max-w-[200px]">
                      {r.file_name}
                    </h3>
                    <span className="text-xs text-slate-500 dark:text-slate-400 block">
                      Target: {r.target_role || 'Software Engineer'}
                    </span>
                    <span className="text-[11px] text-slate-400 flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {new Date(r.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteTargetId(r.id);
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition cursor-pointer"
                  title="Delete Report"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                <button
                  onClick={() => handleExportPDF(r.analysis_data)}
                  className="px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-xs transition flex items-center space-x-1"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-500" />
                  <span>PDF</span>
                </button>

                <button
                  id={`open-report-${r.id}`}
                  onClick={() => onSelectReport(r.analysis_data, r.id)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold text-xs hover:bg-emerald-100 transition flex items-center space-x-1 cursor-pointer"
                >
                  <span>View Analysis</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
          <FileText className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            {searchQuery ? 'No matching reports found' : 'No resume reports yet'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            {searchQuery
              ? 'Try modifying your search query.'
              : 'Upload your PDF resume to receive a comprehensive ATS critique and recommendations.'}
          </p>
          {!searchQuery && (
            <button
              onClick={onCreateNew}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition cursor-pointer"
            >
              Analyze My Resume Now
            </button>
          )}
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTargetId)}
        title="Delete Resume Report?"
        message="Are you sure you want to delete this resume evaluation report? This action cannot be undone."
        confirmText="Yes, Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
};
