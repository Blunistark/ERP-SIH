import { Request, Response } from 'express';
import AIOrchestrator, { AIServiceType } from '../services/ai/orchestrator';
import { AuthenticatedRequest } from '../middleware/auth';

class AIController {
  private orchestrator: AIOrchestrator;

  constructor() {
    this.orchestrator = new AIOrchestrator();
  }

  // General AI service endpoint
  public processAIRequest = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { serviceType, context, parameters } = req.body;
      const userId = req.user!.id;

      // Validate service type
      if (!Object.values(AIServiceType).includes(serviceType)) {
        res.status(400).json({
          success: false,
          error: 'Invalid AI service type',
          availableServices: Object.values(AIServiceType)
        });
        return;
      }

      // Orchestrate AI processing
      const result = await this.orchestrator.orchestrate(
        serviceType as AIServiceType,
        { ...context, ...parameters },
        userId
      );

      res.json({
        success: true,
        data: result,
        serviceType,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('AI processing error:', error);
      res.status(500).json({
        success: false,
        error: 'AI processing failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // Analytics specific endpoint
  public getAnalytics = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { dataType, filters, timeRange } = req.body;
      const userId = req.user!.id;

      const context = {
        dataType,
        filters,
        timeRange,
        userId,
        requestType: 'analytics'
      };

      const result = await this.orchestrator.orchestrate(
        AIServiceType.ANALYTICS,
        context,
        userId
      );

      res.json({
        success: true,
        analytics: result,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Analytics error:', error);
      res.status(500).json({
        success: false,
        error: 'Analytics processing failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // Prediction specific endpoint
  public getPredictions = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { predictionType, data, timeframe } = req.body;
      const userId = req.user!.id;

      const context = {
        predictionType,
        data,
        timeframe,
        userId,
        requestType: 'prediction'
      };

      const result = await this.orchestrator.orchestrate(
        AIServiceType.PREDICTION,
        context,
        userId
      );

      res.json({
        success: true,
        predictions: result,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Prediction error:', error);
      res.status(500).json({
        success: false,
        error: 'Prediction processing failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // Automation specific endpoint
  public createAutomation = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { automationType, rules, schedule } = req.body;
      const userId = req.user!.id;

      const context = {
        automationType,
        rules,
        schedule,
        userId,
        requestType: 'automation'
      };

      const result = await this.orchestrator.orchestrate(
        AIServiceType.AUTOMATION,
        context,
        userId
      );

      res.json({
        success: true,
        automation: result,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Automation error:', error);
      res.status(500).json({
        success: false,
        error: 'Automation creation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // Content generation specific endpoint
  public generateContent = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { contentType, subject, grade, parameters } = req.body;
      const userId = req.user!.id;

      const context = {
        contentType,
        subject,
        grade,
        parameters,
        userId,
        requestType: 'content_generation'
      };

      const result = await this.orchestrator.orchestrate(
        AIServiceType.CONTENT_GENERATION,
        context,
        userId
      );

      res.json({
        success: true,
        content: result,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Content generation error:', error);
      res.status(500).json({
        success: false,
        error: 'Content generation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // Emergency response specific endpoint
  public handleEmergency = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { emergencyType, severity, location, description } = req.body;
      const userId = req.user!.id;

      const context = {
        emergencyType,
        severity,
        location,
        description,
        userId,
        timestamp: new Date().toISOString(),
        requestType: 'emergency_response'
      };

      const result = await this.orchestrator.orchestrate(
        AIServiceType.EMERGENCY_RESPONSE,
        context,
        userId
      );

      res.json({
        success: true,
        emergency: result,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Emergency response error:', error);
      res.status(500).json({
        success: false,
        error: 'Emergency response failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // Behavioral analysis specific endpoint
  public analyzeBehavior = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { studentId, timeRange, metrics, analysisType } = req.body;
      const userId = req.user!.id;

      const context = {
        studentId,
        timeRange,
        metrics,
        analysisType,
        userId,
        requestType: 'behavioral_analysis'
      };

      const result = await this.orchestrator.orchestrate(
        AIServiceType.BEHAVIORAL_ANALYSIS,
        context,
        userId
      );

      res.json({
        success: true,
        analysis: result,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Behavioral analysis error:', error);
      res.status(500).json({
        success: false,
        error: 'Behavioral analysis failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // Resource optimization specific endpoint
  public optimizeResources = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { resourceType, constraints, objectives, timeframe } = req.body;
      const userId = req.user!.id;

      const context = {
        resourceType,
        constraints,
        objectives,
        timeframe,
        userId,
        requestType: 'resource_optimization'
      };

      const result = await this.orchestrator.orchestrate(
        AIServiceType.RESOURCE_OPTIMIZATION,
        context,
        userId
      );

      res.json({
        success: true,
        optimization: result,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Resource optimization error:', error);
      res.status(500).json({
        success: false,
        error: 'Resource optimization failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // Get available AI services
  public getServices = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const services = {
        analytics: {
          name: 'Analytics',
          description: 'Data analysis and insights generation',
          capabilities: ['performance_analysis', 'trend_identification', 'kpi_calculation']
        },
        prediction: {
          name: 'Prediction',
          description: 'Forecasting and predictive analytics',
          capabilities: ['student_performance', 'attendance_trends', 'risk_assessment']
        },
        automation: {
          name: 'Automation',
          description: 'Process automation and workflow management',
          capabilities: ['task_automation', 'notification_systems', 'report_generation']
        },
        content_generation: {
          name: 'Content Generation',
          description: 'Educational content creation',
          capabilities: ['lesson_plans', 'assessments', 'reports', 'communications']
        },
        emergency_response: {
          name: 'Emergency Response',
          description: 'Crisis management and emergency protocols',
          capabilities: ['threat_assessment', 'response_planning', 'communication_coordination']
        },
        behavioral_analysis: {
          name: 'Behavioral Analysis',
          description: 'Student and staff behavior pattern analysis',
          capabilities: ['learning_patterns', 'engagement_analysis', 'intervention_recommendations']
        },
        resource_optimization: {
          name: 'Resource Optimization',
          description: 'Resource allocation and optimization',
          capabilities: ['scheduling_optimization', 'budget_allocation', 'space_management']
        }
      };

      res.json({
        success: true,
        services,
        totalServices: Object.keys(services).length,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Services listing error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve AI services',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
}

export default AIController;
