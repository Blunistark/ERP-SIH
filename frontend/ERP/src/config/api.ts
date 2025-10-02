export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';


export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    PROFILE: '/auth/profile',
    REFRESH: '/auth/refresh',
  },
  
  // Admin
  ADMIN: {
    STATS: '/admin/stats',
  },
  
  // Users
  USERS: '/users',
  STUDENTS: '/students',
  TEACHERS: '/teachers',
  PARENTS: '/parents',
  
  // Academic
  CLASSES: '/classes',
  SUBJECTS: '/subjects',
  ACADEMIC_YEARS: '/academic-years',
  TIMETABLES: '/timetables',
  ATTENDANCE: '/attendance',
  EXAMS: '/exams',
  GRADES: '/grades',
  
  // AI Services
  AI: {
    PROCESS: '/ai/process',
    SERVICES: '/ai/services',
    ANALYTICS: '/ai/analytics',
    PREDICTIONS: '/ai/predictions',
    AUTOMATION: '/ai/automation',
    CONTENT: '/ai/content',
    EMERGENCY: '/ai/emergency',
    BEHAVIOR: '/ai/behavior',
    RESOURCES: '/ai/resources',
  },
} as const;

export const getAuthHeaders = (token?: string) => {
  const authToken = token || localStorage.getItem('authToken');
  return authToken ? { Authorization: `Bearer ${authToken}` } : {};
};