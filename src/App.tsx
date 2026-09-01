import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { SupabaseSetupBanner } from './components/SupabaseSetupBanner';
import { AuthModal } from './components/AuthModal';

import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { RoadmapGeneratorPage } from './pages/RoadmapGeneratorPage';
import { RoadmapDetailPage } from './pages/RoadmapDetailPage';
import { ResumeAnalyzerPage } from './pages/ResumeAnalyzerPage';
import { ResumeReportPage } from './pages/ResumeReportPage';
import { MyRoadmapsPage } from './pages/MyRoadmapsPage';
import { MyResumeReportsPage } from './pages/MyResumeReportsPage';
import { ProfilePage } from './pages/ProfilePage';

import { RoadmapOutputData, RoadmapInputData, ResumeAnalysisData } from './types';

function AppContent() {
  const { user, loading } = useAuth();

  // Navigation state
  const [activeTab, setActiveTab] = useState<string>('landing');

  // Auth modal state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'signin' | 'signup' | 'forgot'>('signin');

  // Active viewing data
  const [selectedRoadmap, setSelectedRoadmap] = useState<{
    roadmap: RoadmapOutputData;
    input?: RoadmapInputData;
    id?: string;
  } | null>(null);

  const [selectedResumeReport, setSelectedResumeReport] = useState<{
    analysis: ResumeAnalysisData;
    id?: string;
  } | null>(null);

  const handleOpenAuth = (tab: 'signin' | 'signup' = 'signin') => {
    setAuthModalTab(tab);
    setAuthModalOpen(true);
  };

  const handleNavigate = (tab: string, extraData?: any) => {
    if (tab === 'roadmap-detail' && extraData) {
      setSelectedRoadmap({
        roadmap: extraData.roadmap,
        input: extraData.input,
        id: extraData.id,
      });
      setActiveTab('roadmap-detail');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (tab === 'resume-report-view' && extraData) {
      setSelectedResumeReport({
        analysis: extraData.analysis,
        id: extraData.id,
      });
      setActiveTab('resume-report-view');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handlers for generation completions
  const handleRoadmapGenerated = (data: RoadmapOutputData, input: RoadmapInputData, savedId?: string) => {
    setSelectedRoadmap({
      roadmap: data,
      input,
      id: savedId,
    });
    setActiveTab('roadmap-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResumeAnalysisCompleted = (data: ResumeAnalysisData, savedId?: string) => {
    setSelectedResumeReport({
      analysis: data,
      id: savedId,
    });
    setActiveTab('resume-report-view');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* 1. Supabase Status Banner */}
      <SupabaseSetupBanner />

      {/* 2. Main Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={(tab) => handleNavigate(tab)}
        onOpenAuth={handleOpenAuth}
      />

      {/* 3. Main Views */}
      <main className="flex-1">
        {/* Landing Page */}
        {activeTab === 'landing' && (
          <LandingPage
            onNavigate={(tab) => handleNavigate(tab)}
            onOpenAuth={handleOpenAuth}
          />
        )}

        {/* Dashboard Page */}
        {activeTab === 'dashboard' && (
          <DashboardPage
            onNavigate={(tab, data) => handleNavigate(tab, data)}
          />
        )}

        {/* Roadmap Generator Page */}
        {activeTab === 'roadmap-gen' && (
          <RoadmapGeneratorPage
            onRoadmapGenerated={handleRoadmapGenerated}
            onOpenAuth={handleOpenAuth}
          />
        )}

        {/* Roadmap Detail View */}
        {activeTab === 'roadmap-detail' && selectedRoadmap && (
          <RoadmapDetailPage
            roadmap={selectedRoadmap.roadmap}
            inputData={selectedRoadmap.input}
            savedId={selectedRoadmap.id}
            onBack={() => handleNavigate(user ? 'dashboard' : 'roadmap-gen')}
            onOpenAuth={handleOpenAuth}
          />
        )}

        {/* Resume Analyzer Page */}
        {activeTab === 'resume-analyzer' && (
          <ResumeAnalyzerPage
            onAnalysisCompleted={handleResumeAnalysisCompleted}
            onOpenAuth={handleOpenAuth}
          />
        )}

        {/* Resume Report View */}
        {activeTab === 'resume-report-view' && selectedResumeReport && (
          <ResumeReportPage
            analysis={selectedResumeReport.analysis}
            savedId={selectedResumeReport.id}
            onBack={() => handleNavigate(user ? 'dashboard' : 'resume-analyzer')}
            onOpenAuth={handleOpenAuth}
          />
        )}

        {/* My Roadmaps List */}
        {activeTab === 'my-roadmaps' && (
          <MyRoadmapsPage
            onSelectRoadmap={(roadmap, input, id) =>
              handleNavigate('roadmap-detail', { roadmap, input, id })
            }
            onCreateNew={() => handleNavigate('roadmap-gen')}
          />
        )}

        {/* My Resume Reports List */}
        {activeTab === 'resume-reports' && (
          <MyResumeReportsPage
            onSelectReport={(analysis, id) =>
              handleNavigate('resume-report-view', { analysis, id })
            }
            onCreateNew={() => handleNavigate('resume-analyzer')}
          />
        )}

        {/* Profile Settings */}
        {activeTab === 'profile' && <ProfilePage />}
      </main>

      {/* 4. Footer */}
      <Footer onSelectTab={(tab) => handleNavigate(tab)} />

      {/* 5. Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        initialTab={authModalTab}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => {
          if (activeTab === 'landing') {
            setActiveTab('dashboard');
          }
        }}
      />
    </div>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
