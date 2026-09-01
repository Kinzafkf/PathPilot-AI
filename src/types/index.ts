export type RoadmapInputData = RoadmapInput;
export type RoadmapOutputData = RoadmapData;

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  university?: string;
  degree?: string;
  graduation_year?: string;
  current_status?: string;
  career_goal?: string;
  bio?: string;
  created_at?: string;
  updated_at?: string;
}

export interface RoadmapInput {
  fullName: string;
  university: string;
  degree: string;
  graduationStatus: string;
  currentSkills: string[];
  experienceLevel: 'Beginner' | 'Student' | 'Fresh Graduate' | 'Junior' | 'Intermediate';
  careerGoal: string;
  preferredField: string;
  weeklyHours: number;
  skillLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  targetJobRole: string;
}

export interface SkillAssessmentItem {
  skill: string;
  level: string;
  commentary: string;
}

export interface SkillGapItem {
  skill: string;
  importance: 'High' | 'Medium' | 'Low';
  reason: string;
  estimatedTimeToLearn: string;
}

export interface RecommendedTechCategory {
  category: string;
  tools: string[];
}

export interface LearningPhase {
  phaseNumber: number;
  title: string;
  duration: string;
  topics: string[];
  tasks: string[];
  expectedOutcome: string;
}

export interface WeeklyPlanItem {
  week: number;
  focus: string;
  tasks: string[];
  milestone: string;
}

export interface RecommendedCertification {
  name: string;
  provider: string;
  costType: 'Free' | 'Paid' | 'Financial Aid Available' | 'Govt Funded (DigiSkills/NAVTTC)';
  whyUseful: string;
  urlHint?: string;
}

export interface PortfolioProject {
  title: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  technologies: string[];
  features: string[];
  learningOutcome: string;
}

export interface InterviewPreparation {
  technicalTopics: string[];
  commonQuestions: string[];
  codingPrepTips: string[];
  softSkills: string[];
}

export interface JobPlatformInfo {
  name: string;
  url: string;
  description: string;
}

export interface LearningResourceInfo {
  name: string;
  description: string;
}

export interface JobSearchStrategy {
  pakistaniJobPlatforms: JobPlatformInfo[];
  localLearningResources: LearningResourceInfo[];
  resumeTips: string[];
  applicationStrategy: string[];
}

export interface SalaryExpectationsPKR {
  entryLevel: string;
  junior: string;
  midLevel: string;
  disclaimer: string;
}

export interface CareerChecklistItem {
  id: string;
  item: string;
  category: string;
  completed?: boolean;
}

export interface RoadmapData {
  careerGoal: string;
  targetJobRole: string;
  summary: string;
  currentSkillAssessment: SkillAssessmentItem[];
  skillGaps: SkillGapItem[];
  recommendedTechnologies: RecommendedTechCategory[];
  learningPhases: LearningPhase[];
  weeklyPlan: WeeklyPlanItem[];
  recommendedCertifications: RecommendedCertification[];
  portfolioProjects: PortfolioProject[];
  interviewPreparation: InterviewPreparation;
  jobSearchStrategy: JobSearchStrategy;
  salaryExpectationsPKR: SalaryExpectationsPKR;
  careerChecklist: CareerChecklistItem[];
}

export interface SavedRoadmap {
  id: string;
  user_id: string;
  title: string;
  career_goal: string;
  input_data: RoadmapInput;
  roadmap_data: RoadmapData;
  created_at: string;
}

export interface CategoryScores {
  atsCompatibility: number;
  skills: number;
  experience: number;
  education: number;
  keywords: number;
  formatting: number;
  grammar: number;
  professionalImpact: number;
}

export interface WeakBulletPoint {
  original: string;
  issue: string;
  improved: string;
}

export interface WeakActionVerb {
  weak: string;
  strongerAlternatives: string[];
}

export interface ActionableIssue {
  problem: string;
  whyItMatters: string;
  recommendedFix: string;
  category: string;
}

export interface ResumeAnalysisData {
  fileName: string;
  targetRole?: string;
  atsScore: number;
  categoryScores: CategoryScores;
  strengths: string[];
  weaknesses: string[];
  missingKeywords: string[];
  missingSkills: string[];
  highlightSkills: string[];
  weakBulletPoints: WeakBulletPoint[];
  weakActionVerbs: WeakActionVerb[];
  repeatedWords: string[];
  formattingIssues: string[];
  grammarIssues: string[];
  contactIssues: string[];
  educationIssues: string[];
  projectWeaknesses: string[];
  careerGapsCommentary: string;
  actionableIssues: ActionableIssue[];
  improvedProfessionalSummary: string;
  improvedBulletExamples: string[];
  recommendedKeywords: string[];
  recommendedSkills: string[];
  improvementChecklist: string[];
}

export interface SavedResumeAnalysis {
  id: string;
  user_id: string;
  file_name: string;
  ats_score: number;
  target_role?: string;
  analysis_data: ResumeAnalysisData;
  created_at: string;
}
