import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

interface CreateClassRequest {
  name: string;
  section: string;
  academicYearId: string;
  capacity?: number;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     Class:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         section:
 *           type: string
 *         capacity:
 *           type: integer
 *         academicYear:
 *           $ref: '#/components/schemas/AcademicYear'
 *         students:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Student'
 *         teachers:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Teacher'
 *     AcademicYear:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         year:
 *           type: string
 *         startDate:
 *           type: string
 *           format: date
 *         endDate:
 *           type: string
 *           format: date
 *         isCurrent:
 *           type: boolean
 */

export const createClass = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, section, academicYearId, capacity = 50 }: CreateClassRequest = req.body;

    // Check if academic year exists
    const academicYear = await prisma.academicYear.findUnique({
      where: { id: academicYearId },
    });

    if (!academicYear) {
      const error: AppError = new Error('Academic year not found');
      error.statusCode = 404;
      return next(error);
    }

    // Check if class with same name and section already exists for this academic year
    const existingClass = await prisma.class.findFirst({
      where: {
        name,
        section,
        academicYearId,
      },
    });

    if (existingClass) {
      const error: AppError = new Error(`Class ${name} Section ${section} already exists for this academic year`);
      error.statusCode = 400;
      return next(error);
    }

    // Create class
    const newClass = await prisma.class.create({
      data: {
        name,
        section,
        academicYearId,
        capacity,
      },
      include: {
        academicYear: true,
        students: {
          include: {
            user: {
              include: {
                profile: true,
              },
            },
          },
        },
        teachers: {
          include: {
            user: {
              include: {
                profile: true,
              },
            },
          },
        },
      },
    });

    logger.info(`Class created: ${name} Section ${section}`);

    res.status(201).json({
      success: true,
      message: 'Class created successfully',
      data: newClass,
    });
  } catch (error) {
    next(error);
  }
};

export const getClasses = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { academicYearId, name, section, page = 1, limit = 10 } = req.query;
    
    const skip = (Number(page) - 1) * Number(limit);
    
    const where: any = {};
    
    if (academicYearId) {
      where.academicYearId = academicYearId as string;
    }
    
    if (name) {
      where.name = {
        contains: name as string,
        mode: 'insensitive',
      };
    }
    
    if (section) {
      where.section = {
        contains: section as string,
        mode: 'insensitive',
      };
    }

    const [classes, total] = await Promise.all([
      prisma.class.findMany({
        where,
        include: {
          academicYear: true,
          students: {
            include: {
              user: {
                include: {
                  profile: true,
                },
              },
            },
          },
          teachers: {
            include: {
              user: {
                include: {
                  profile: true,
                },
              },
            },
          },
          _count: {
            select: {
              students: true,
              teachers: true,
            },
          },
        },
        skip,
        take: Number(limit),
        orderBy: [
          { name: 'asc' },
          { section: 'asc' },
        ],
      }),
      prisma.class.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        classes,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getClassById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const classData = await prisma.class.findUnique({
      where: { id },
      include: {
        academicYear: true,
        students: {
          include: {
            user: {
              include: {
                profile: true,
              },
            },
            parent: {
              include: {
                user: {
                  include: {
                    profile: true,
                  },
                },
              },
            },
          },
        },
        teachers: {
          include: {
            user: {
              include: {
                profile: true,
              },
            },
            subjects: true,
          },
        },
        subjects: true,
      },
    });

    if (!classData) {
      const error: AppError = new Error('Class not found');
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({
      success: true,
      data: classData,
    });
  } catch (error) {
    next(error);
  }
};

export const updateClass = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, section, capacity } = req.body;

    // Check if class exists
    const existingClass = await prisma.class.findUnique({
      where: { id },
    });

    if (!existingClass) {
      const error: AppError = new Error('Class not found');
      error.statusCode = 404;
      return next(error);
    }

    // Check for duplicate if name or section is being changed
    if (name || section) {
      const duplicateClass = await prisma.class.findFirst({
        where: {
          name: name || existingClass.name,
          section: section || existingClass.section,
          academicYearId: existingClass.academicYearId,
          id: { not: id },
        },
      });

      if (duplicateClass) {
        const error: AppError = new Error(
          `Class ${name || existingClass.name} Section ${section || existingClass.section} already exists for this academic year`
        );
        error.statusCode = 400;
        return next(error);
      }
    }

    // Update class
    const updateData: any = {};
    if (name) updateData.name = name;
    if (section) updateData.section = section;
    if (capacity) updateData.capacity = capacity;

    const updatedClass = await prisma.class.update({
      where: { id },
      data: updateData,
      include: {
        academicYear: true,
        students: {
          include: {
            user: {
              include: {
                profile: true,
              },
            },
          },
        },
        teachers: {
          include: {
            user: {
              include: {
                profile: true,
              },
            },
          },
        },
      },
    });

    logger.info(`Class updated: ${updatedClass.name} Section ${updatedClass.section}`);

    res.status(200).json({
      success: true,
      message: 'Class updated successfully',
      data: updatedClass,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteClass = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if class exists
    const existingClass = await prisma.class.findUnique({
      where: { id },
      include: {
        students: true,
        _count: {
          select: {
            students: true,
          },
        },
      },
    });

    if (!existingClass) {
      const error: AppError = new Error('Class not found');
      error.statusCode = 404;
      return next(error);
    }

    // Check if class has students
    if (existingClass._count.students > 0) {
      const error: AppError = new Error('Cannot delete class with enrolled students');
      error.statusCode = 400;
      return next(error);
    }

    // Delete class
    await prisma.class.delete({
      where: { id },
    });

    logger.info(`Class deleted: ${existingClass.name} Section ${existingClass.section}`);

    res.status(200).json({
      success: true,
      message: 'Class deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const assignTeacher = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { teacherId } = req.body;

    // Check if class exists
    const classExists = await prisma.class.findUnique({
      where: { id },
    });

    if (!classExists) {
      const error: AppError = new Error('Class not found');
      error.statusCode = 404;
      return next(error);
    }

    // Check if teacher exists
    const teacher = await prisma.teacher.findUnique({
      where: { id: teacherId },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
      },
    });

    if (!teacher) {
      const error: AppError = new Error('Teacher not found');
      error.statusCode = 404;
      return next(error);
    }

    // Assign teacher to class
    await prisma.class.update({
      where: { id },
      data: {
        teachers: {
          connect: { id: teacherId },
        },
      },
    });

    logger.info(`Teacher ${teacher.user.profile?.firstName} ${teacher.user.profile?.lastName} assigned to class ${classExists.name} Section ${classExists.section}`);

    res.status(200).json({
      success: true,
      message: 'Teacher assigned to class successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const removeTeacher = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id, teacherId } = req.params;

    // Check if class exists
    const classExists = await prisma.class.findUnique({
      where: { id },
    });

    if (!classExists) {
      const error: AppError = new Error('Class not found');
      error.statusCode = 404;
      return next(error);
    }

    // Remove teacher from class
    await prisma.class.update({
      where: { id },
      data: {
        teachers: {
          disconnect: { id: teacherId },
        },
      },
    });

    logger.info(`Teacher removed from class ${classExists.name} Section ${classExists.section}`);

    res.status(200).json({
      success: true,
      message: 'Teacher removed from class successfully',
    });
  } catch (error) {
    next(error);
  }
};
