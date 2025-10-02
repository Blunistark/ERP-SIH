export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  rollNumber: string;
  class: string;
  section: string;
  dateOfBirth: string;
  phone?: string;
  address?: string;
  parentId?: string;
  isActive: boolean;
}

export interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  employeeId: string;
  department: string;
  subjects: string[];
  phone?: string;
  isActive: boolean;
}

export interface AIAnalytics {
  studentData?: any[];
  type: string;
  subject?: string;
  gradeLevel?: string;
  insights: string;
  recommendations: string[];
  charts: {
    performanceTrend?: any[];
    gradeDistribution?: any[];
    attendancePattern?: any[];
  };
}

export interface AIService {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'maintenance';
  lastUsed?: string;
  usageCount: number;
}