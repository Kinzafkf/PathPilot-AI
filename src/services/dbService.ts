import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { UserProfile, SavedRoadmap, SavedResumeAnalysis, RoadmapInput, RoadmapData, ResumeAnalysisData } from '../types';

const LOCAL_STORAGE_PROFILES_KEY = 'pathpilot_local_profiles';
const LOCAL_STORAGE_ROADMAPS_KEY = 'pathpilot_local_roadmaps';
const LOCAL_STORAGE_RESUMES_KEY = 'pathpilot_local_resumes';

// Helper for local storage
const getLocalData = <T>(key: string): T[] => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const setLocalData = <T>(key: string, data: T[]): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to write to localStorage:', err);
  }
};

export const dbService = {
  // ---------------- PROFILES ----------------
  async getProfile(userId: string): Promise<UserProfile | null> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Supabase profile fetch error:', error);
        }
        if (data) return data as UserProfile;
      } catch (err) {
        console.error('Error fetching Supabase profile:', err);
      }
    }

    // LocalStorage Fallback
    const profiles = getLocalData<UserProfile>(LOCAL_STORAGE_PROFILES_KEY);
    return profiles.find((p) => p.id === userId) || null;
  },

  async upsertProfile(profile: Partial<UserProfile> & { id: string; email: string }): Promise<UserProfile> {
    const now = new Date().toISOString();
    const updatedProfile: UserProfile = {
      id: profile.id,
      email: profile.email,
      full_name: profile.full_name || '',
      university: profile.university || '',
      degree: profile.degree || '',
      graduation_year: profile.graduation_year || '',
      current_status: profile.current_status || '',
      career_goal: profile.career_goal || '',
      bio: profile.bio || '',
      updated_at: now,
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .upsert(updatedProfile)
          .select()
          .single();

        if (error) {
          console.error('Supabase profile upsert error:', error);
          throw error;
        }
        if (data) return data as UserProfile;
      } catch (err) {
        console.warn('Falling back to local profile update:', err);
      }
    }

    // Local storage fallback
    const profiles = getLocalData<UserProfile>(LOCAL_STORAGE_PROFILES_KEY);
    const index = profiles.findIndex((p) => p.id === profile.id);
    if (index >= 0) {
      profiles[index] = { ...profiles[index], ...updatedProfile };
    } else {
      profiles.push({ ...updatedProfile, created_at: now });
    }
    setLocalData(LOCAL_STORAGE_PROFILES_KEY, profiles);
    return updatedProfile;
  },

  // ---------------- ROADMAPS ----------------
  async getRoadmaps(userId: string): Promise<SavedRoadmap[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('roadmaps')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Supabase roadmaps fetch error:', error);
          throw error;
        }
        return (data || []) as SavedRoadmap[];
      } catch (err) {
        console.warn('Falling back to local roadmaps fetch:', err);
      }
    }

    const roadmaps = getLocalData<SavedRoadmap>(LOCAL_STORAGE_ROADMAPS_KEY);
    return roadmaps.filter((r) => r.user_id === userId);
  },

  async getRoadmapById(roadmapId: string, userId: string): Promise<SavedRoadmap | null> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('roadmaps')
          .select('*')
          .eq('id', roadmapId)
          .eq('user_id', userId)
          .single();

        if (!error && data) return data as SavedRoadmap;
      } catch (err) {
        console.warn('Error finding roadmap by ID in Supabase:', err);
      }
    }

    const roadmaps = getLocalData<SavedRoadmap>(LOCAL_STORAGE_ROADMAPS_KEY);
    return roadmaps.find((r) => r.id === roadmapId && r.user_id === userId) || null;
  },

  async saveRoadmap(
    paramOrUserId: string | { user_id: string; title?: string; career_goal?: string; input_data: any; roadmap_data: any },
    paramInputData?: RoadmapInput,
    paramRoadmapData?: RoadmapData
  ): Promise<SavedRoadmap> {
    let userId: string;
    let inputData: RoadmapInput;
    let roadmapData: RoadmapData;
    let customTitle: string | undefined;
    let customGoal: string | undefined;

    if (typeof paramOrUserId === 'object') {
      userId = paramOrUserId.user_id;
      inputData = paramOrUserId.input_data;
      roadmapData = paramOrUserId.roadmap_data;
      customTitle = paramOrUserId.title;
      customGoal = paramOrUserId.career_goal;
    } else {
      userId = paramOrUserId;
      inputData = paramInputData!;
      roadmapData = paramRoadmapData!;
    }

    const newRoadmap: SavedRoadmap = {
      id: crypto.randomUUID ? crypto.randomUUID() : `rdm_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      user_id: userId,
      title: customTitle || `${roadmapData.targetJobRole || roadmapData.careerGoal} Career Roadmap`,
      career_goal: customGoal || roadmapData.targetJobRole || roadmapData.careerGoal,
      input_data: inputData,
      roadmap_data: roadmapData,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('roadmaps')
          .insert({
            user_id: userId,
            title: newRoadmap.title,
            career_goal: newRoadmap.career_goal,
            input_data: inputData,
            roadmap_data: roadmapData,
          })
          .select()
          .single();

        if (error) {
          console.error('Supabase roadmap insert error:', error);
          throw error;
        }
        if (data) return data as SavedRoadmap;
      } catch (err) {
        console.warn('Falling back to local storage for roadmap save:', err);
      }
    }

    const roadmaps = getLocalData<SavedRoadmap>(LOCAL_STORAGE_ROADMAPS_KEY);
    roadmaps.unshift(newRoadmap);
    setLocalData(LOCAL_STORAGE_ROADMAPS_KEY, roadmaps);
    return newRoadmap;
  },

  async deleteRoadmap(roadmapId: string, userId?: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase.from('roadmaps').delete().eq('id', roadmapId);
        if (userId) {
          query = query.eq('user_id', userId);
        }
        const { error } = await query;
        if (error) throw error;
      } catch (err) {
        console.warn('Falling back to local roadmap delete:', err);
      }
    }

    const roadmaps = getLocalData<SavedRoadmap>(LOCAL_STORAGE_ROADMAPS_KEY);
    const updated = roadmaps.filter((r) => !(r.id === roadmapId && (!userId || r.user_id === userId)));
    setLocalData(LOCAL_STORAGE_ROADMAPS_KEY, updated);
    return true;
  },

  // ---------------- RESUME ANALYSES ----------------
  async getResumeAnalyses(userId: string): Promise<SavedResumeAnalysis[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('resume_analyses')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Supabase resumes fetch error:', error);
          throw error;
        }
        return (data || []) as SavedResumeAnalysis[];
      } catch (err) {
        console.warn('Falling back to local resumes fetch:', err);
      }
    }

    const resumes = getLocalData<SavedResumeAnalysis>(LOCAL_STORAGE_RESUMES_KEY);
    return resumes.filter((r) => r.user_id === userId);
  },

  async getResumeAnalysisById(analysisId: string, userId: string): Promise<SavedResumeAnalysis | null> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('resume_analyses')
          .select('*')
          .eq('id', analysisId)
          .eq('user_id', userId)
          .single();

        if (!error && data) return data as SavedResumeAnalysis;
      } catch (err) {
        console.warn('Error finding resume analysis in Supabase:', err);
      }
    }

    const resumes = getLocalData<SavedResumeAnalysis>(LOCAL_STORAGE_RESUMES_KEY);
    return resumes.find((r) => r.id === analysisId && r.user_id === userId) || null;
  },

  async saveResumeAnalysis(
    paramOrUserId: string | { user_id: string; file_name: string; ats_score: number; analysis_data: ResumeAnalysisData; target_role?: string },
    paramFileName?: string,
    paramAtsScore?: number,
    paramAnalysisData?: ResumeAnalysisData,
    paramTargetRole?: string
  ): Promise<SavedResumeAnalysis> {
    let userId: string;
    let fileName: string;
    let atsScore: number;
    let analysisData: ResumeAnalysisData;
    let targetRole: string;

    if (typeof paramOrUserId === 'object') {
      userId = paramOrUserId.user_id;
      fileName = paramOrUserId.file_name;
      atsScore = paramOrUserId.ats_score;
      analysisData = paramOrUserId.analysis_data;
      targetRole = paramOrUserId.target_role || '';
    } else {
      userId = paramOrUserId;
      fileName = paramFileName!;
      atsScore = paramAtsScore!;
      analysisData = paramAnalysisData!;
      targetRole = paramTargetRole || '';
    }

    const newAnalysis: SavedResumeAnalysis = {
      id: crypto.randomUUID ? crypto.randomUUID() : `res_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      user_id: userId,
      file_name: fileName,
      ats_score: atsScore,
      target_role: targetRole || '',
      analysis_data: analysisData,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('resume_analyses')
          .insert({
            user_id: userId,
            file_name: fileName,
            ats_score: atsScore,
            target_role: targetRole || '',
            analysis_data: analysisData,
          })
          .select()
          .single();

        if (error) {
          console.error('Supabase resume analysis insert error:', error);
          throw error;
        }
        if (data) return data as SavedResumeAnalysis;
      } catch (err) {
        console.warn('Falling back to local storage for resume analysis save:', err);
      }
    }

    const resumes = getLocalData<SavedResumeAnalysis>(LOCAL_STORAGE_RESUMES_KEY);
    resumes.unshift(newAnalysis);
    setLocalData(LOCAL_STORAGE_RESUMES_KEY, resumes);
    return newAnalysis;
  },

  async deleteResumeAnalysis(analysisId: string, userId?: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase.from('resume_analyses').delete().eq('id', analysisId);
        if (userId) {
          query = query.eq('user_id', userId);
        }
        const { error } = await query;
        if (error) throw error;
      } catch (err) {
        console.warn('Falling back to local resume delete:', err);
      }
    }

    const resumes = getLocalData<SavedResumeAnalysis>(LOCAL_STORAGE_RESUMES_KEY);
    const updated = resumes.filter((r) => !(r.id === analysisId && (!userId || r.user_id === userId)));
    setLocalData(LOCAL_STORAGE_RESUMES_KEY, updated);
    return true;
  },
};
