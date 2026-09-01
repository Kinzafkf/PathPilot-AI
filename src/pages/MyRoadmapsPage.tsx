import React, { useEffect, useState } from 'react';
import {
  Compass,
  Search,
  Trash2,
  Calendar,
  ChevronRight,
  Loader2,
  Plus,
  BookmarkCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { dbService } from '../services/dbService';
import { SavedRoadmap } from '../types';
import { ConfirmModal } from '../components/ConfirmModal';

interface MyRoadmapsPageProps {
  onSelectRoadmap: (roadmap: any, input: any, id: string) => void;
  onCreateNew: () => void;
}

export const MyRoadmapsPage: React.FC<MyRoadmapsPageProps> = ({
  onSelectRoadmap,
  onCreateNew,
}) => {
  const { user } = useAuth();
  const [roadmaps, setRoadmaps] = useState<SavedRoadmap[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  useEffect(() => {
    loadRoadmaps();
  }, [user]);

  const loadRoadmaps = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await dbService.getRoadmaps(user.id);
      setRoadmaps(data);
    } catch (err) {
      console.error('Error fetching roadmaps:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await dbService.deleteRoadmap(deleteTargetId);
      setRoadmaps((prev) => prev.filter((r) => r.id !== deleteTargetId));
      setDeleteTargetId(null);
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const filteredRoadmaps = roadmaps.filter(
    (r) =>
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.career_goal.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div id="my-roadmaps-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            My Saved Roadmaps
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Access your personalized learning curves, weekly plans, and project milestones.
          </p>
        </div>

        <button
          id="create-new-roadmap-btn"
          onClick={onCreateNew}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white text-xs font-bold shadow-md transition flex items-center space-x-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Roadmap</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          id="search-roadmaps-input"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search saved roadmaps by title or career goal..."
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* List */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="text-xs text-slate-400">Loading saved roadmaps...</p>
        </div>
      ) : filteredRoadmaps.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRoadmaps.map((r) => (
            <div
              key={r.id}
              className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-[11px] font-bold">
                    {r.career_goal}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteTargetId(r.id);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition cursor-pointer"
                    title="Delete Roadmap"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  {r.title}
                </h3>

                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                  {r.roadmap_data?.summary || 'Comprehensive personalized learning plan.'}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                <span className="flex items-center text-slate-400 text-[11px]">
                  <Calendar className="w-3.5 h-3.5 mr-1" />
                  {new Date(r.created_at).toLocaleDateString()}
                </span>

                <button
                  id={`open-roadmap-${r.id}`}
                  onClick={() => onSelectRoadmap(r.roadmap_data, r.input_data, r.id)}
                  className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-semibold text-xs hover:bg-indigo-100 transition flex items-center space-x-1 cursor-pointer"
                >
                  <span>Open Details</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
          <Compass className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            {searchQuery ? 'No matching roadmaps found' : 'No saved roadmaps yet'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            {searchQuery
              ? 'Try adjusting your search keywords.'
              : 'Generate your first AI-tailored career roadmap for the Pakistani tech market.'}
          </p>
          {!searchQuery && (
            <button
              onClick={onCreateNew}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition cursor-pointer"
            >
              Create First Roadmap
            </button>
          )}
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTargetId)}
        title="Delete Saved Roadmap?"
        message="Are you sure you want to delete this career roadmap? This action cannot be undone."
        confirmText="Yes, Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
};
