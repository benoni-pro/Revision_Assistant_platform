// User types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: 'student' | 'teacher' | 'manager' | 'admin';
  avatar?: string;
  isVerified: boolean;
  academicLevel?: 'high_school' | 'undergraduate' | 'graduate' | 'professional' | 'other';
  institution?: {
    name: string;
    type: 'school' | 'university' | 'college' | 'training_center' | 'other';
  };
  learningStyle?: {
    visual: number;
    auditory: number;
    kinesthetic: number;
    readingWriting: number;
  };
  statistics?: {
    totalStudyTime: number;
    studyStreak: {
      current: number;
      longest: number;
    };
    completedQuizzes: number;
    averageQuizScore: number;
  };
}

// Auth types
export interface AuthResponse {
  success: boolean;
  data: {
    accessToken: string;
    refreshToken: string;
    expiresIn: string;
    user: User;
  };
  message: string;
}

export interface LoginData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role?: string;
  academicLevel?: string;
  institution?: {
    name: string;
    type: string;
  };
}

// Study Group types
export interface StudyGroup {
  id: string;
  name: string;
  subject: string;
  description?: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  privacy: 'public' | 'private' | 'invite_only';
  maxMembers: number;
  memberCount: number;
  creator: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  members: StudyGroupMember[];
  tags: string[];
  categories: string[];
  isActive: boolean;
  createdAt: string;
  avatar?: string;
}

export interface StudyGroupMember {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  role: 'member' | 'moderator' | 'admin';
  joinedAt: string;
  isActive: boolean;
}

// Quiz types
export interface Quiz {
  id: string;
  title: string;
  description?: string;
  subject: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // in minutes
  totalQuestions: number;
  passingScore: number;
  isPublic: boolean;
  creator: {
    id: string;
    firstName: string;
    lastName: string;
  };
  questions: QuizQuestion[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface QuizQuestion {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay';
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface QuizAttempt {
  id: string;
  quiz: Quiz;
  user: User;
  answers: { [questionId: string]: string | string[] };
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number; // in minutes
  attemptNumber: number;
  passed: boolean;
  startedAt: string;
  completedAt?: string;
}

// Progress types
export interface StudySession {
  id: string;
  startTime: string;
  endTime?: string;
  duration: number; // in minutes
  subject: string;
  topic?: string;
  activityType: 'reading' | 'quiz' | 'video' | 'practice' | 'discussion' | 'review' | 'research';
  notes?: string;
  mood?: 'very_poor' | 'poor' | 'neutral' | 'good' | 'excellent';
  focusLevel?: number; // 1-10
  productivity?: number; // 1-10
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  type: 'daily' | 'weekly' | 'monthly' | 'custom';
  category: 'study_time' | 'quiz_score' | 'skill_mastery' | 'streak' | 'completion';
  target: {
    value: number;
    unit: 'minutes' | 'hours' | 'percentage' | 'count' | 'days';
  };
  currentProgress: number;
  deadline?: string;
  subject?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'active' | 'completed' | 'paused' | 'failed';
  completedAt?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'study_time' | 'consistency' | 'improvement' | 'collaboration' | 'mastery';
  earnedAt: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message: string;
  errors?: string[] | { field: string; message: string }[];
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    docs: T[];
    totalDocs: number;
    limit: number;
    totalPages: number;
    page: number;
    pagingCounter: number;
    hasPrevPage: boolean;
    hasNextPage: boolean;
    prevPage?: number;
    nextPage?: number;
  };
  message: string;
}

// UI Component types
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export interface NotificationProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

// Chart data types
export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }[];
}

// Theme types
export interface Theme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
  };
}

// Navigation types
export interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
  current?: boolean;
  badge?: number | string;
  children?: NavItem[];
}

// Form types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'select' | 'textarea' | 'checkbox' | 'radio' | 'file';
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  validation?: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: any) => string | undefined;
  };
}

// Notification types
export interface AppNotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message?: string;
  timestamp: string;
  read: boolean;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

// Search types
export interface SearchResult {
  id: string;
  type: 'user' | 'studyGroup' | 'quiz' | 'resource';
  title: string;
  description?: string;
  url: string;
  relevance: number;
}

// Analytics types
export interface StudyAnalytics {
  totalStudyTime: number;
  weeklyStudyTime: number[];
  monthlyStudyTime: number[];
  subjectBreakdown: { subject: string; time: number }[];
  productivityTrends: { date: string; productivity: number }[];
  streakData: {
    current: number;
    longest: number;
    history: { date: string; studied: boolean }[];
  };
}

// Socket types
export interface SocketMessage {
  id: string;
  type: 'message' | 'notification' | 'activity';
  from: {
    id: string;
    name: string;
    avatar?: string;
  };
  content: string;
  timestamp: string;
  room?: string;
}

// File types
export interface FileUpload {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  progress?: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
}
