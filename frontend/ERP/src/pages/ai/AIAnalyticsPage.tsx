import React, { useState } from 'react';
import { Brain, TrendingUp, Users, BookOpen, AlertTriangle } from 'lucide-react';
import Card from '../../components/ui/Card';
import AnalyticsChart from '../../components/charts/AnalyticsChart';
import Button from '../../components/ui/Button';
import { useApiMutation } from '../../hooks/useApi';
import { API_ENDPOINTS } from '../../config/api';

const AIAnalyticsPage: React.FC = () => {
  const [selectedAnalysis, setSelectedAnalysis] = useState<string>('performance');
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const analyticsMutation = useApiMutation(
    async (analysisType: string) => {
      const response = await fetch(`${API_ENDPOINTS.AI.ANALYTICS}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({
          type: analysisType,
          context: {
            gradeLevel: '10th',
            subject: 'Mathematics',
          },
        }),
      });
      return response.json();
    }
  );

  const performanceData = [
    { name: 'Grade 9', value: 78 },
    { name: 'Grade 10', value: 82 },
    { name: 'Grade 11', value: 85 },
    { name: 'Grade 12', value: 88 },
  ];

  const attendancePattern = [
    { name: 'Monday', value: 95 },
    { name: 'Tuesday', value: 92 },
    { name: 'Wednesday', value: 88 },
    { name: 'Thursday', value: 90 },
    { name: 'Friday', value: 85 },
  ];

  const riskAssessment = [
    { name: 'Low Risk', value: 70 },
    { name: 'Medium Risk', value: 25 },
    { name: 'High Risk', value: 5 },
  ];

  const handleAnalyze = async () => {
    try {
      const result = await analyticsMutation.mutateAsync(selectedAnalysis);
      setAnalysisResult(result);
    } catch (error) {
      console.error('Analysis failed:', error);
    }
  };

  const analysisTypes = [
    { id: 'performance', name: 'Student Performance', icon: TrendingUp },
    { id: 'attendance', name: 'Attendance Patterns', icon: Users },
    { id: 'subjects', name: 'Subject Analysis', icon: BookOpen },
    { id: 'risk', name: 'Risk Assessment', icon: AlertTriangle },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Analytics</h1>
          <p className="text-gray-600">Advanced insights powered by artificial intelligence</p>
        </div>
        <div className="flex items-center space-x-2">
          <Brain className="w-6 h-6 text-blue-600" />
          <span className="text-sm text-blue-600 font-medium">AI Powered</span>
        </div>
      </div>

      {/* Analysis Controls */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Generate AI Analysis</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {analysisTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedAnalysis(type.id)}
              className={`p-4 text-center border rounded-lg transition-colors ${
                selectedAnalysis === type.id
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <type.icon className="w-8 h-8 mx-auto mb-2" />
              <span className="text-sm font-medium">{type.name}</span>
            </button>
          ))}
        </div>
        <Button
          onClick={handleAnalyze}
          isLoading={analyticsMutation.isPending}
          icon={Brain}
        >
          Generate Analysis
        </Button>
      </Card>

      {/* Analytics Results */}
      {analysisResult && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Analysis Results</h3>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-blue-900">{analysisResult.data?.result?.insights || 'Analysis completed successfully!'}</p>
            {analysisResult.data?.result?.recommendations && (
              <div className="mt-3">
                <h4 className="font-medium text-blue-900 mb-2">Recommendations:</h4>
                <ul className="list-disc list-inside space-y-1 text-blue-800">
                  {analysisResult.data.result.recommendations.map((rec: string, index: number) => (
                    <li key={index} className="text-sm">{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnalyticsChart
          title="Student Performance by Grade"
          data={performanceData}
          type="bar"
          height={300}
        />

        <AnalyticsChart
          title="Weekly Attendance Patterns"
          data={attendancePattern}
          type="line"
          height={300}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnalyticsChart
          title="Risk Assessment Distribution"
          data={riskAssessment}
          type="pie"
          height={300}
        />

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Insights Summary</h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">Performance Trend</p>
                <p className="text-xs text-gray-600">Overall student performance has improved by 12% this semester</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">Attendance Alert</p>
                <p className="text-xs text-gray-600">Wednesday shows consistently lower attendance rates</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">Subject Analysis</p>
                <p className="text-xs text-gray-600">Mathematics shows the highest engagement rates among students</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">Risk Identification</p>
                <p className="text-xs text-gray-600">5% of students identified as high-risk for academic failure</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Predictive Analytics */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Predictive Analytics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <h4 className="text-lg font-semibold text-green-800">Expected Pass Rate</h4>
            <p className="text-3xl font-bold text-green-600 mt-2">92%</p>
            <p className="text-sm text-green-700 mt-1">↑ 3% from last term</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <h4 className="text-lg font-semibold text-blue-800">Predicted GPA</h4>
            <p className="text-3xl font-bold text-blue-600 mt-2">3.65</p>
            <p className="text-sm text-blue-700 mt-1">↑ 0.15 improvement</p>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <h4 className="text-lg font-semibold text-yellow-800">At-Risk Students</h4>
            <p className="text-3xl font-bold text-yellow-600 mt-2">23</p>
            <p className="text-sm text-yellow-700 mt-1">Requires intervention</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AIAnalyticsPage;