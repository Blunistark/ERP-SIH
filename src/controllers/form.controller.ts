import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'number' | 'date' | 'select' | 'textarea' | 'checkbox' | 'radio' | 'file';
  required: boolean;
  placeholder?: string;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

interface CreateFormRequest {
  title: string;
  description: string;
  fields: FormField[];
  tableName: string;
}

class FormController {
  /**
   * Create a new form
   * POST /api/forms/create
   * Protected: Requires authentication (ADMIN/TEACHER)
   */
  public createForm = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { title, description, fields, tableName }: CreateFormRequest = req.body;
      const userId = req.user!.id;

      // Validate required fields
      if (!title || !description || !fields || !tableName) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: title, description, fields, tableName'
        });
        return;
      }

      // Validate tableName format (snake_case, alphanumeric + underscore)
      if (!/^[a-z][a-z0-9_]*$/.test(tableName)) {
        res.status(400).json({
          success: false,
          error: 'Invalid tableName. Use snake_case format (lowercase, numbers, underscores)'
        });
        return;
      }

      // Check if tableName already exists
      const existingForm = await prisma.form.findUnique({
        where: { tableName }
      });

      if (existingForm) {
        res.status(409).json({
          success: false,
          error: 'A form with this table name already exists'
        });
        return;
      }

      // Create dynamic table in database for storing form responses
      try {
        await this.createDynamicTable(tableName, fields);
      } catch (tableError) {
        logger.error('Failed to create dynamic table:', tableError);
        res.status(500).json({
          success: false,
          error: 'Failed to create database table for form',
          details: tableError instanceof Error ? tableError.message : 'Unknown error'
        });
        return;
      }

      // Save form definition
      const form = await prisma.form.create({
        data: {
          title,
          description,
          fields: fields as any,
          tableName,
          createdBy: userId
        }
      });

      // Generate shareable link
      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const shareableLink = `${baseUrl}/form/${form.id}`;

      logger.info(`Form created: ${form.id} by user ${userId}`);

      res.status(201).json({
        success: true,
        data: {
          ...form,
          shareableLink
        }
      });

    } catch (error) {
      logger.error('Create form error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create form',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * List all forms created by the authenticated user
   * GET /api/forms/list
   * Protected: Requires authentication (ADMIN/TEACHER)
   */
  public listForms = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;

      // Fetch all forms created by this user
      const forms = await prisma.form.findMany({
        where: { createdBy: userId },
        include: {
          _count: {
            select: { responses: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      // Transform to include response count
      const formsWithCount = forms.map(form => ({
        id: form.id,
        title: form.title,
        description: form.description,
        fields: form.fields,
        tableName: form.tableName,
        createdAt: form.createdAt,
        updatedAt: form.updatedAt,
        responseCount: form._count.responses
      }));

      res.json({
        success: true,
        data: formsWithCount
      });

    } catch (error) {
      logger.error('List forms error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch forms',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Get a specific form by ID
   * GET /api/forms/:formId
   * Public: No authentication required (for form submission page)
   */
  public getForm = async (req: Request, res: Response): Promise<void> => {
    try {
      const { formId } = req.params;

      if (!formId) {
        res.status(400).json({
          success: false,
          error: 'Form ID is required'
        });
        return;
      }

      const form = await prisma.form.findUnique({
        where: { id: formId },
        select: {
          id: true,
          title: true,
          description: true,
          fields: true,
          tableName: true,
          createdAt: true
        }
      });

      if (!form) {
        res.status(404).json({
          success: false,
          error: 'Form not found'
        });
        return;
      }

      res.json({
        success: true,
        data: form
      });

    } catch (error) {
      logger.error('Get form error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch form',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Submit a form response
   * POST /api/forms/submit
   * Public: No authentication required
   */
  public submitForm = async (req: Request, res: Response): Promise<void> => {
    try {
      const { formId, data } = req.body;

      if (!formId || !data) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: formId, data'
        });
        return;
      }

      // Fetch form to validate
      const form = await prisma.form.findUnique({
        where: { id: formId }
      });

      if (!form) {
        res.status(404).json({
          success: false,
          error: 'Form not found'
        });
        return;
      }

      // Validate submitted data against form fields
      const fields = form.fields as unknown as FormField[];
      const validationErrors: string[] = [];

      for (const field of fields) {
        if (field.required && !data[field.name]) {
          validationErrors.push(`${field.label} is required`);
        }

        // Type-specific validation
        if (data[field.name]) {
          const value = data[field.name];

          switch (field.type) {
            case 'email':
              if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                validationErrors.push(`${field.label} must be a valid email`);
              }
              break;
            case 'number':
              if (isNaN(Number(value))) {
                validationErrors.push(`${field.label} must be a number`);
              }
              if (field.validation?.min !== undefined && Number(value) < field.validation.min) {
                validationErrors.push(`${field.label} must be at least ${field.validation.min}`);
              }
              if (field.validation?.max !== undefined && Number(value) > field.validation.max) {
                validationErrors.push(`${field.label} must be at most ${field.validation.max}`);
              }
              break;
            case 'text':
            case 'textarea':
              if (field.validation?.min !== undefined && value.length < field.validation.min) {
                validationErrors.push(`${field.label} must be at least ${field.validation.min} characters`);
              }
              if (field.validation?.max !== undefined && value.length > field.validation.max) {
                validationErrors.push(`${field.label} must be at most ${field.validation.max} characters`);
              }
              if (field.validation?.pattern) {
                const regex = new RegExp(field.validation.pattern);
                if (!regex.test(value)) {
                  validationErrors.push(field.validation.message || `${field.label} format is invalid`);
                }
              }
              break;
          }
        }
      }

      if (validationErrors.length > 0) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: validationErrors
        });
        return;
      }

      // Save response to FormResponse table
      const response = await prisma.formResponse.create({
        data: {
          formId,
          data: data as any
        }
      });

      // Also insert into dynamic table for easier querying
      try {
        await this.insertIntoDynamicTable(form.tableName, data);
      } catch (insertError) {
        logger.warn('Failed to insert into dynamic table (non-critical):', insertError);
        // Continue even if dynamic table insert fails
      }

      logger.info(`Form response submitted: ${response.id} for form ${formId}`);

      res.status(201).json({
        success: true,
        data: {
          id: response.id,
          formId: response.formId,
          submittedAt: response.submittedAt
        }
      });

    } catch (error) {
      logger.error('Submit form error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to submit form',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Get all responses for a specific form
   * GET /api/forms/responses/:formId
   * Protected: Requires authentication (ADMIN/TEACHER)
   */
  public getResponses = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { formId } = req.params;
      const userId = req.user!.id;

      if (!formId) {
        res.status(400).json({
          success: false,
          error: 'Form ID is required'
        });
        return;
      }

      // Verify the form belongs to the user
      const form = await prisma.form.findFirst({
        where: {
          id: formId,
          createdBy: userId
        }
      });

      if (!form) {
        res.status(404).json({
          success: false,
          error: 'Form not found or access denied'
        });
        return;
      }

      // Fetch all responses
      const responses = await prisma.formResponse.findMany({
        where: { formId },
        orderBy: { submittedAt: 'desc' }
      });

      res.json({
        success: true,
        data: responses
      });

    } catch (error) {
      logger.error('Get responses error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch responses',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Delete a form and all its responses
   * DELETE /api/forms/delete/:formId
   * Protected: Requires authentication (ADMIN/TEACHER)
   */
  public deleteForm = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { formId } = req.params;
      const userId = req.user!.id;

      if (!formId) {
        res.status(400).json({
          success: false,
          error: 'Form ID is required'
        });
        return;
      }

      // Verify the form belongs to the user
      const form = await prisma.form.findFirst({
        where: {
          id: formId,
          createdBy: userId
        }
      });

      if (!form) {
        res.status(404).json({
          success: false,
          error: 'Form not found or access denied'
        });
        return;
      }

      // Delete the form (responses will be cascade deleted)
      await prisma.form.delete({
        where: { id: formId }
      });

      // Drop the dynamic table
      try {
        await this.dropDynamicTable(form.tableName);
      } catch (dropError) {
        logger.warn('Failed to drop dynamic table (non-critical):', dropError);
        // Continue even if table drop fails
      }

      logger.info(`Form deleted: ${formId} by user ${userId}`);

      res.json({
        success: true,
        message: 'Form deleted successfully'
      });

    } catch (error) {
      logger.error('Delete form error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete form',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Helper: Create dynamic table in database
   */
  private async createDynamicTable(tableName: string, fields: FormField[]): Promise<void> {
    const columns = fields.map(field => {
      let columnType: string;

      switch (field.type) {
        case 'email':
        case 'text':
        case 'select':
        case 'radio':
        case 'file':
          columnType = 'VARCHAR(255)';
          break;
        case 'textarea':
          columnType = 'TEXT';
          break;
        case 'number':
          columnType = 'NUMERIC';
          break;
        case 'date':
          columnType = 'DATE';
          break;
        case 'checkbox':
          columnType = 'BOOLEAN';
          break;
        default:
          columnType = 'TEXT';
      }

      const nullable = field.required ? 'NOT NULL' : 'NULL';
      return `"${field.name}" ${columnType} ${nullable}`;
    });

    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS "${tableName}" (
        "id" VARCHAR(30) PRIMARY KEY DEFAULT gen_random_uuid()::text,
        ${columns.join(',\n        ')},
        "submitted_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await prisma.$executeRawUnsafe(createTableSQL);
    logger.info(`Dynamic table created: ${tableName}`);
  }

  /**
   * Helper: Insert data into dynamic table
   */
  private async insertIntoDynamicTable(tableName: string, data: Record<string, any>): Promise<void> {
    const columns = Object.keys(data);
    const values = Object.values(data);
    
    const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');
    const columnNames = columns.map(col => `"${col}"`).join(', ');

    const insertSQL = `
      INSERT INTO "${tableName}" (${columnNames})
      VALUES (${placeholders})
    `;

    await prisma.$executeRawUnsafe(insertSQL, ...values);
  }

  /**
   * Helper: Drop dynamic table
   */
  private async dropDynamicTable(tableName: string): Promise<void> {
    const dropTableSQL = `DROP TABLE IF EXISTS "${tableName}" CASCADE;`;
    await prisma.$executeRawUnsafe(dropTableSQL);
    logger.info(`Dynamic table dropped: ${tableName}`);
  }
}

export default FormController;
