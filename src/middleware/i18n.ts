import i18next from 'i18next';
import middleware from 'i18next-express-middleware';

// Initialize i18next
i18next.init({
  lng: process.env.DEFAULT_LANGUAGE || 'en',
  fallbackLng: 'en',
  debug: process.env.NODE_ENV === 'development',
  resources: {
    en: {
      translation: {
        // Common messages
        'common.success': 'Success',
        'common.error': 'Error',
        'common.notFound': 'Not found',
        'common.unauthorized': 'Unauthorized',
        'common.forbidden': 'Forbidden',
        'common.validation': 'Validation error',
        'common.serverError': 'Internal server error',
        
        // Authentication messages
        'auth.loginSuccess': 'Login successful',
        'auth.logoutSuccess': 'Logout successful',
        'auth.invalidCredentials': 'Invalid email or password',
        'auth.tokenRequired': 'Access token is required',
        'auth.tokenInvalid': 'Invalid access token',
        'auth.tokenExpired': 'Access token has expired',
        'auth.passwordChanged': 'Password changed successfully',
        
        // User management
        'user.created': 'User created successfully',
        'user.updated': 'User updated successfully',
        'user.deleted': 'User deleted successfully',
        'user.notFound': 'User not found',
        'user.emailExists': 'Email already exists',
        
        // Student management
        'student.enrolled': 'Student enrolled successfully',
        'student.notFound': 'Student not found',
        'student.rollNumberExists': 'Roll number already exists',
        
        // Teacher management
        'teacher.assigned': 'Teacher assigned successfully',
        'teacher.notFound': 'Teacher not found',
        'teacher.employeeIdExists': 'Employee ID already exists',
        
        // Class management
        'class.created': 'Class created successfully',
        'class.updated': 'Class updated successfully',
        'class.deleted': 'Class deleted successfully',
        'class.notFound': 'Class not found',
        
        // Attendance
        'attendance.marked': 'Attendance marked successfully',
        'attendance.updated': 'Attendance updated successfully',
        'attendance.notFound': 'Attendance record not found',
        
        // Exam management
        'exam.created': 'Exam created successfully',
        'exam.updated': 'Exam updated successfully',
        'exam.deleted': 'Exam deleted successfully',
        'exam.notFound': 'Exam not found',
        'exam.resultPublished': 'Exam result published successfully',
        
        // Notice management
        'notice.created': 'Notice created successfully',
        'notice.updated': 'Notice updated successfully',
        'notice.deleted': 'Notice deleted successfully',
        'notice.notFound': 'Notice not found',
      }
    },
    hi: {
      translation: {
        // Hindi translations (placeholder for South Indian regional content)
        'common.success': 'सफलता',
        'common.error': 'त्रुटि',
        'common.notFound': 'नहीं मिला',
        'common.unauthorized': 'अनधिकृत',
        'common.forbidden': 'निषिद्ध',
        'auth.loginSuccess': 'लॉगिन सफल',
        'auth.invalidCredentials': 'गलत ईमेल या पासवर्ड',
        'user.created': 'उपयोगकर्ता सफलतापूर्वक बनाया गया',
        'student.enrolled': 'छात्र सफलतापूर्वक नामांकित',
        'teacher.assigned': 'शिक्षक सफलतापूर्वक असाइन किया गया',
        'class.created': 'कक्षा सफलतापूर्वक बनाई गई',
        'attendance.marked': 'उपस्थिति सफलतापूर्वक अंकित',
        'exam.created': 'परीक्षा सफलतापूर्वक बनाई गई',
        'notice.created': 'सूचना सफलतापूर्वक बनाई गई',
      }
    },
    kn: {
      translation: {
        // Kannada translations (placeholder for Bangalore/Karnataka)
        'common.success': 'ಯಶಸ್ಸು',
        'common.error': 'ದೋಷ',
        'common.notFound': 'ಸಿಗಲಿಲ್ಲ',
        'auth.loginSuccess': 'ಲಾಗಿನ್ ಯಶಸ್ವಿಯಾಯಿತು',
        'user.created': 'ಬಳಕೆದಾರ ಯಶಸ್ವಿಯಾಗಿ ರಚಿಸಲಾಗಿದೆ',
        'student.enrolled': 'ವಿದ್ಯಾರ್ಥಿ ಯಶಸ್ವಿಯಾಗಿ ದಾಖಲಾಗಿದ್ದಾರೆ',
        'teacher.assigned': 'ಶಿಕ್ಷಕ ಯಶಸ್ವಿಯಾಗಿ ನಿಯೋಜಿಸಲಾಗಿದೆ',
        'class.created': 'ತರಗತಿ ಯಶಸ್ವಿಯಾಗಿ ರಚಿಸಲಾಗಿದೆ',
        'attendance.marked': 'ಹಾಜರಾತಿ ಯಶಸ್ವಿಯಾಗಿ ಗುರುತಿಸಲಾಗಿದೆ',
        'exam.created': 'ಪರೀಕ್ಷೆ ಯಶಸ್ವಿಯಾಗಿ ರಚಿಸಲಾಗಿದೆ',
        'notice.created': 'ಸೂಚನೆ ಯಶಸ್ವಿಯಾಗಿ ರಚಿಸಲಾಗಿದೆ',
      }
    },
    ta: {
      translation: {
        // Tamil translations (placeholder for Tamil Nadu)
        'common.success': 'வெற்றி',
        'common.error': 'பிழை',
        'common.notFound': 'கிடைக்கவில்லை',
        'auth.loginSuccess': 'உள்நுழைவு வெற்றிகரமாக',
        'user.created': 'பயனர் வெற்றிகரமாக உருவாக்கப்பட்டது',
        'student.enrolled': 'மாணவர் வெற்றிகரமாக சேர்க்கப்பட்டார்',
        'teacher.assigned': 'ஆசிரியர் வெற்றிகரமாக நியமிக்கப்பட்டார்',
        'class.created': 'வகுப்பு வெற்றிகரமாக உருவாக்கப்பட்டது',
        'attendance.marked': 'வருகை வெற்றிகரமாக குறிக்கப்பட்டது',
        'exam.created': 'தேர்வு வெற்றிகரமாக உருவாக்கப்பட்டது',
        'notice.created': 'அறிவிப்பு வெற்றிகரமாக உருவாக்கப்பட்டது',
      }
    },
    te: {
      translation: {
        // Telugu translations (placeholder for Andhra Pradesh/Telangana)
        'common.success': 'విజయం',
        'common.error': 'లోపం',
        'common.notFound': 'దొరకలేదు',
        'auth.loginSuccess': 'లాగిన్ విజయవంతమైంది',
        'user.created': 'వినియోగదారుడు విజయవంతంగా సృష్టించబడ్డాడు',
        'student.enrolled': 'విద్యార్థి విజయవంతంగా చేర్చబడ్డాడు',
        'teacher.assigned': 'ఉపాధ్యాయుడు విజయవంతంగా కేటాయించబడ్డాడు',
        'class.created': 'తరగతి విజయవంతంగా సృష్టించబడింది',
        'attendance.marked': 'హాజరు విజయవంతంగా గుర్తించబడింది',
        'exam.created': 'పరీక్ష విజయవంతంగా సృష్టించబడింది',
        'notice.created': 'నోటీసు విజయవంతంగా సృష్టించబడింది',
      }
    },
    ml: {
      translation: {
        // Malayalam translations (placeholder for Kerala)
        'common.success': 'വിജയം',
        'common.error': 'പിഴവ്',
        'common.notFound': 'കണ്ടെത്താനായില്ല',
        'auth.loginSuccess': 'ലോഗിൻ വിജയകരമായി',
        'user.created': 'ഉപയോക്താവ് വിജയകരമായി സൃഷ്ടിച്ചു',
        'student.enrolled': 'വിദ്യാർത്ഥി വിജയകരമായി എൻറോൾ ചെയ്തു',
        'teacher.assigned': 'അധ്യാപകൻ വിജയകരമായി നിയോഗിച്ചു',
        'class.created': 'ക്ലാസ് വിജയകരമായി സൃഷ്ടിച്ചു',
        'attendance.marked': 'ഹാജർ വിജയകരമായി അടയാളപ്പെടുത്തി',
        'exam.created': 'പരീക്ഷ വിജയകരമായി സൃഷ്ടിച്ചു',
        'notice.created': 'അറിയിപ്പ് വിജയകരമായി സൃഷ്ടിച്ചു',
      }
    }
  }
});

// Export the middleware
export const i18nMiddleware = middleware.handle(i18next);

// Helper function to get translated text
export const t = (key: string, options?: any) => {
  return i18next.t(key, options);
};
