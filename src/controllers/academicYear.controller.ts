import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Create a new academic year
 */
export const createAcademicYear = async (req: Request, res: Response): Promise<void> => {
  try {
    const { year, startDate, endDate, isActive } = req.body;

    // If this academic year is set as active, deactivate all others
    if (isActive) {
      await prisma.academicYear.updateMany({
        where: { isCurrent: true },
        data: { isCurrent: false }
      });
    }

    const academicYear = await prisma.academicYear.create({
      data: {
        year,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isCurrent: isActive || false
      }
    });

    res.status(201).json({
      success: true,
      data: academicYear,
      message: 'Academic year created successfully'
    });
  } catch (error: any) {
    console.error('Error creating academic year:', error);
    
    if (error.code === 'P2002') {
      res.status(400).json({
        success: false,
        message: 'Academic year already exists'
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create academic year'
    });
  }
};

/**
 * Get all academic years with pagination and search
 */
export const getAcademicYears = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string || '';

    const skip = (page - 1) * limit;

    const where = search
      ? {
          year: {
            contains: search,
            mode: 'insensitive' as const
          }
        }
      : {};

    const [academicYears, total] = await Promise.all([
      prisma.academicYear.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          startDate: 'desc'
        }
      }),
      prisma.academicYear.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: academicYears,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching academic years:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch academic years'
    });
  }
};

/**
 * Get academic year by ID
 */
export const getAcademicYearById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const academicYear = await prisma.academicYear.findUnique({
      where: { id },
      include: {
        classes: {
          select: {
            id: true,
            name: true,
            section: true,
            _count: {
              select: {
                students: true
              }
            }
          }
        },
        _count: {
          select: {
            classes: true,
            terms: true
          }
        }
      }
    });

    if (!academicYear) {
      res.status(404).json({
        success: false,
        message: 'Academic year not found'
      });
      return;
    }

    res.json({
      success: true,
      data: academicYear
    });
  } catch (error) {
    console.error('Error fetching academic year:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch academic year'
    });
  }
};

/**
 * Update academic year
 */
export const updateAcademicYear = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { year, startDate, endDate, isActive } = req.body;

    // Check if academic year exists
    const existingAcademicYear = await prisma.academicYear.findUnique({
      where: { id }
    });

    if (!existingAcademicYear) {
      res.status(404).json({
        success: false,
        message: 'Academic year not found'
      });
      return;
    }

    // If this academic year is set as active, deactivate all others
    if (isActive && !existingAcademicYear.isCurrent) {
      await prisma.academicYear.updateMany({
        where: { 
          isCurrent: true,
          id: { not: id }
        },
        data: { isCurrent: false }
      });
    }

    const updatedAcademicYear = await prisma.academicYear.update({
      where: { id },
      data: {
        year,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isCurrent: isActive
      }
    });

    res.json({
      success: true,
      data: updatedAcademicYear,
      message: 'Academic year updated successfully'
    });
  } catch (error: any) {
    console.error('Error updating academic year:', error);
    
    if (error.code === 'P2002') {
      res.status(400).json({
        success: false,
        message: 'Academic year already exists'
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update academic year'
    });
  }
};

/**
 * Delete academic year
 */
export const deleteAcademicYear = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if academic year exists
    const academicYear = await prisma.academicYear.findUnique({
      where: { id },
      include: {
        classes: true,
        terms: true
      }
    });

    if (!academicYear) {
      res.status(404).json({
        success: false,
        message: 'Academic year not found'
      });
      return;
    }

    // Check if academic year has associated data
    if (academicYear.classes.length > 0 || academicYear.terms.length > 0) {
      res.status(400).json({
        success: false,
        message: 'Cannot delete academic year with associated classes or terms'
      });
      return;
    }

    await prisma.academicYear.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Academic year deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting academic year:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete academic year'
    });
  }
};

/**
 * Toggle academic year status (active/inactive)
 */
export const toggleAcademicYearStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const academicYear = await prisma.academicYear.findUnique({
      where: { id }
    });

    if (!academicYear) {
      res.status(404).json({
        success: false,
        message: 'Academic year not found'
      });
      return;
    }

    const newStatus = !academicYear.isCurrent;

    // If setting as active, deactivate all others
    if (newStatus) {
      await prisma.academicYear.updateMany({
        where: { 
          isCurrent: true,
          id: { not: id }
        },
        data: { isCurrent: false }
      });
    }

    const updatedAcademicYear = await prisma.academicYear.update({
      where: { id },
      data: { isCurrent: newStatus }
    });

    res.json({
      success: true,
      data: updatedAcademicYear,
      message: `Academic year ${newStatus ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    console.error('Error toggling academic year status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle academic year status'
    });
  }
};

/**
 * Get current active academic year
 */
export const getCurrentAcademicYear = async (req: Request, res: Response): Promise<void> => {
  try {
    const currentAcademicYear = await prisma.academicYear.findFirst({
      where: { isCurrent: true },
      include: {
        _count: {
          select: {
            classes: true,
            terms: true
          }
        }
      }
    });

    if (!currentAcademicYear) {
      res.status(404).json({
        success: false,
        message: 'No active academic year found'
      });
      return;
    }

    res.json({
      success: true,
      data: currentAcademicYear
    });
  } catch (error) {
    console.error('Error fetching current academic year:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch current academic year'
    });
  }
};
