import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { AppError } from './errorHandler';

export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const validationError: AppError = new Error(
        error.details.map(detail => detail.message).join(', ')
      );
      validationError.statusCode = 400;
      return next(validationError);
    }
    
    next();
  };
};

// Common validation schemas
export const userValidationSchemas = {
  create: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    role: Joi.string().valid('ADMIN', 'TEACHER', 'STUDENT', 'PARENT').required(),
    profile: Joi.object({
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      middleName: Joi.string().optional(),
      dateOfBirth: Joi.date().optional(),
      gender: Joi.string().valid('Male', 'Female', 'Other').optional(),
      phone: Joi.string().optional(),
      address: Joi.string().optional(),
      city: Joi.string().optional(),
      state: Joi.string().optional(),
      pincode: Joi.string().optional(),
      bloodGroup: Joi.string().optional(),
    }).required(),
  }),
  
  update: Joi.object({
    email: Joi.string().email().optional(),
    isActive: Joi.boolean().optional(),
    profile: Joi.object({
      firstName: Joi.string().optional(),
      lastName: Joi.string().optional(),
      middleName: Joi.string().optional(),
      dateOfBirth: Joi.date().optional(),
      gender: Joi.string().valid('Male', 'Female', 'Other').optional(),
      phone: Joi.string().optional(),
      address: Joi.string().optional(),
      city: Joi.string().optional(),
      state: Joi.string().optional(),
      pincode: Joi.string().optional(),
      bloodGroup: Joi.string().optional(),
    }).optional(),
  }),
  
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
  
  changePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(8).required(),
  }),
};

export const studentValidationSchemas = {
  create: Joi.object({
    rollNumber: Joi.string().required(),
    admissionDate: Joi.date().required(),
    parentId: Joi.string().optional(),
    classId: Joi.string().optional(),
  }),
  
  update: Joi.object({
    rollNumber: Joi.string().optional(),
    parentId: Joi.string().optional(),
    classId: Joi.string().optional(),
  }),
};

export const teacherValidationSchemas = {
  create: Joi.object({
    employeeId: Joi.string().required(),
    joiningDate: Joi.date().required(),
    qualification: Joi.string().optional(),
    experience: Joi.number().min(0).optional(),
    salary: Joi.number().min(0).optional(),
  }),
  
  update: Joi.object({
    employeeId: Joi.string().optional(),
    qualification: Joi.string().optional(),
    experience: Joi.number().min(0).optional(),
    salary: Joi.number().min(0).optional(),
  }),
};

export const classValidationSchemas = {
  create: Joi.object({
    name: Joi.string().required(),
    section: Joi.string().required(),
    academicYearId: Joi.string().required(),
    capacity: Joi.number().min(1).max(100).default(50),
  }),
  
  update: Joi.object({
    name: Joi.string().optional(),
    section: Joi.string().optional(),
    capacity: Joi.number().min(1).max(100).optional(),
  }),
};

export const attendanceValidationSchemas = {
  create: Joi.object({
    studentId: Joi.string().required(),
    classId: Joi.string().required(),
    date: Joi.date().required(),
    status: Joi.string().valid('PRESENT', 'ABSENT', 'LATE', 'EXCUSED').required(),
    remarks: Joi.string().optional(),
  }),
  
  update: Joi.object({
    status: Joi.string().valid('PRESENT', 'ABSENT', 'LATE', 'EXCUSED').optional(),
    remarks: Joi.string().optional(),
  }),
  
  bulkCreate: Joi.object({
    classId: Joi.string().required(),
    date: Joi.date().required(),
    attendanceRecords: Joi.array().items(
      Joi.object({
        studentId: Joi.string().required(),
        status: Joi.string().valid('PRESENT', 'ABSENT', 'LATE', 'EXCUSED').required(),
        remarks: Joi.string().optional(),
      })
    ).required(),
  }),
};

export const examValidationSchemas = {
  create: Joi.object({
    name: Joi.string().required(),
    type: Joi.string().valid('UNIT_TEST', 'MIDTERM', 'FINAL', 'ASSIGNMENT', 'PROJECT').required(),
    termId: Joi.string().required(),
    subjectId: Joi.string().required(),
    date: Joi.date().required(),
    duration: Joi.number().min(30).required(), // in minutes
    totalMarks: Joi.number().min(1).required(),
    passingMarks: Joi.number().min(0).required(),
  }),
  
  update: Joi.object({
    name: Joi.string().optional(),
    type: Joi.string().valid('UNIT_TEST', 'MIDTERM', 'FINAL', 'ASSIGNMENT', 'PROJECT').optional(),
    date: Joi.date().optional(),
    duration: Joi.number().min(30).optional(),
    totalMarks: Joi.number().min(1).optional(),
    passingMarks: Joi.number().min(0).optional(),
  }),
  
  result: Joi.object({
    examId: Joi.string().required(),
    studentId: Joi.string().required(),
    marksObtained: Joi.number().min(0).required(),
    grade: Joi.string().valid('A_PLUS', 'A', 'B_PLUS', 'B', 'C_PLUS', 'C', 'D', 'F').required(),
    remarks: Joi.string().optional(),
  }),
};

export const noticeValidationSchemas = {
  create: Joi.object({
    title: Joi.string().required(),
    content: Joi.string().required(),
    priority: Joi.string().valid('HIGH', 'NORMAL', 'LOW').default('NORMAL'),
    targetRoles: Joi.array().items(
      Joi.string().valid('ADMIN', 'TEACHER', 'STUDENT', 'PARENT')
    ).required(),
    publishDate: Joi.date().default(() => new Date()),
    expiryDate: Joi.date().optional(),
  }),
  
  update: Joi.object({
    title: Joi.string().optional(),
    content: Joi.string().optional(),
    priority: Joi.string().valid('HIGH', 'NORMAL', 'LOW').optional(),
    targetRoles: Joi.array().items(
      Joi.string().valid('ADMIN', 'TEACHER', 'STUDENT', 'PARENT')
    ).optional(),
    expiryDate: Joi.date().optional(),
    isActive: Joi.boolean().optional(),
  }),
};
