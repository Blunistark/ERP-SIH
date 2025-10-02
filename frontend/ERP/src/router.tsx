import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoginPage from './pages/auth/LoginPage';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import TeacherDashboard from './pages/dashboard/TeacherDashboard';
import StudentDashboard from './pages/dashboard/StudentDashboard';
import ParentDashboard from './pages/dashboard/ParentDashboard';
import StudentsPage from './pages/users/StudentsPage';
import TeachersPage from './pages/users/TeachersPage';
import ParentsPage from './pages/users/ParentsPage';
import StudentDetailPage from './pages/users/StudentDetailPage';
import TeacherDetailPage from './pages/users/TeacherDetailPage';
import ParentDetailPage from './pages/users/ParentDetailPage';
import AddStudentPage from './pages/users/AddStudentPage';
import ClassesPage from './pages/academic/ClassesPage';
import ClassDetailPage from './pages/academic/ClassDetailPage';
import EditClassPage from './pages/academic/EditClassPage';
import AddClassPage from './pages/academic/AddClassPage';
import AcademicYearsPage from './pages/academic/AcademicYearsPage';
import AddAcademicYearPage from './pages/academic/AddAcademicYearPage';
import EditAcademicYearPage from './pages/academic/EditAcademicYearPage';
import ViewAcademicYearPage from './pages/academic/ViewAcademicYearPage';
import TimetablePage from './pages/academic/TimetablePage';
import CreateTimetablePage from './pages/academic/CreateTimetablePage';
import EditTimetablePage from './pages/academic/EditTimetablePage';
import ExaminationsPage from './pages/examinations/ExaminationsPage';
import SubjectsPage from './pages/academic/SubjectsPage';
import AddSubjectPage from './pages/academic/AddSubjectPage';
import EditSubjectPage from './pages/academic/EditSubjectPage';
import NoticesPage from './pages/communication/NoticesPage';
import CreateNoticePage from './pages/communication/CreateNoticePage';
import AttendancePage from './pages/attendance/AttendancePage';
import MarkAttendancePage from './pages/attendance/MarkAttendancePage';
import AttendanceReportPage from './pages/attendance/AttendanceReportPage';
import AIAnalyticsPage from './pages/ai/AIAnalyticsPage';
import { useAuthStore } from './stores/authStore';

const DashboardRouter: React.FC = () => {
  const { user } = useAuthStore();

  if (!user) return <Navigate to="/login" replace />;

  switch (user.role) {
    case 'ADMIN':
      return <AdminDashboard />;
    case 'TEACHER':
      return <TeacherDashboard />;
    case 'STUDENT':
      return <StudentDashboard />;
    case 'PARENT':
      return <ParentDashboard />;
    default:
      return <Navigate to="/login" replace />;
  }
};

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <DashboardRouter />,
      },
      {
        path: 'ai/analytics',
        element: (
          <ProtectedRoute allowedRoles={['ADMIN', 'TEACHER']}>
            <AIAnalyticsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'users',
        children: [
          {
            path: 'students',
            element: (
              <ProtectedRoute allowedRoles={['ADMIN', 'TEACHER']}>
                <StudentsPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'students/add',
            element: (
              <ProtectedRoute allowedRoles={['ADMIN', 'TEACHER']}>
                <AddStudentPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'students/:id',
            element: (
              <ProtectedRoute allowedRoles={['ADMIN', 'TEACHER']}>
                <StudentDetailPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'teachers',
            element: (
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <TeachersPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'teachers/:id',
            element: (
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <TeacherDetailPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'parents',
            element: (
              <ProtectedRoute allowedRoles={['ADMIN', 'TEACHER']}>
                <ParentsPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'parents/:id',
            element: (
              <ProtectedRoute allowedRoles={['ADMIN', 'TEACHER']}>
                <ParentDetailPage />
              </ProtectedRoute>
            ),
          },
        ],
      },
      {
        path: 'academic',
        children: [
          {
            path: 'classes',
            element: (
              <ProtectedRoute allowedRoles={['ADMIN', 'TEACHER']}>
                <ClassesPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'classes/add',
            element: (
              <ProtectedRoute allowedRoles={['ADMIN', 'TEACHER']}>
                <AddClassPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'classes/:id',
            element: (
              <ProtectedRoute allowedRoles={['ADMIN', 'TEACHER']}>
                <ClassDetailPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'classes/:id/edit',
            element: (
              <ProtectedRoute allowedRoles={['ADMIN', 'TEACHER']}>
                <EditClassPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'years',
            element: (
              <ProtectedRoute allowedRoles={['ADMIN', 'TEACHER']}>
                <AcademicYearsPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'years/add',
            element: (
              <ProtectedRoute allowedRoles={['ADMIN', 'TEACHER']}>
                <AddAcademicYearPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'years/:id',
            element: (
              <ProtectedRoute allowedRoles={['ADMIN', 'TEACHER']}>
                <ViewAcademicYearPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'years/:id/edit',
            element: (
              <ProtectedRoute allowedRoles={['ADMIN', 'TEACHER']}>
                <EditAcademicYearPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'timetable',
            element: (
              <ProtectedRoute allowedRoles={['ADMIN', 'TEACHER']}>
                <TimetablePage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'timetable/create',
            element: (
              <ProtectedRoute allowedRoles={['ADMIN', 'TEACHER']}>
                <CreateTimetablePage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'timetable/:id/edit',
            element: (
              <ProtectedRoute allowedRoles={['ADMIN', 'TEACHER']}>
                <EditTimetablePage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'subjects',
            element: (
              <ProtectedRoute allowedRoles={['ADMIN', 'TEACHER']}>
                <SubjectsPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'subjects/add',
            element: (
              <ProtectedRoute allowedRoles={['ADMIN', 'TEACHER']}>
                <AddSubjectPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'subjects/:id/edit',
            element: (
              <ProtectedRoute allowedRoles={['ADMIN', 'TEACHER']}>
                <EditSubjectPage />
              </ProtectedRoute>
            ),
          },
        ],
      },
      {
        path: 'attendance',
        children: [
          {
            index: true,
            element: (
              <ProtectedRoute allowedRoles={['ADMIN', 'TEACHER', 'PARENT']}>
                <AttendancePage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'mark',
            element: (
              <ProtectedRoute allowedRoles={['ADMIN', 'TEACHER']}>
                <MarkAttendancePage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'reports',
            element: (
              <ProtectedRoute allowedRoles={['ADMIN', 'TEACHER']}>
                <AttendanceReportPage />
              </ProtectedRoute>
            ),
          },
        ],
      },
      {
        path: 'examinations',
        element: (
          <ProtectedRoute allowedRoles={['ADMIN', 'TEACHER']}>
            <ExaminationsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'communication',
        children: [
          {
            path: 'notices',
            element: (
              <ProtectedRoute allowedRoles={['ADMIN', 'TEACHER']}>
                <NoticesPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'notices/create',
            element: (
              <ProtectedRoute allowedRoles={['ADMIN', 'TEACHER']}>
                <CreateNoticePage />
              </ProtectedRoute>
            ),
          },
        ],
      },
      {
        path: 'ai',
        children: [
          {
            path: 'predictions',
            element: <div>AI Predictions - Coming Soon</div>,
          },
          {
            path: 'content',
            element: <div>AI Content Generator - Coming Soon</div>,
          },
          {
            path: 'assistant',
            element: <div>AI Assistant - Coming Soon</div>,
          },
          {
            path: 'automation',
            element: <div>AI Automation - Coming Soon</div>,
          },
        ],
      },
    ],
  },
  {
    path: '/unauthorized',
    element: (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Unauthorized</h1>
          <p className="text-gray-600 mt-2">You don't have permission to access this page.</p>
        </div>
      </div>
    ),
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);