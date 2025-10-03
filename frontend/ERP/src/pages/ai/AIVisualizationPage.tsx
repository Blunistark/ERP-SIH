import React, { useState } from 'react';
import {
  Sparkles,
  BarChart3,
  Table as TableIcon,
  TrendingUp,
  Users,
  BookOpen,
  Calendar,
  Award,
  Clock,
  RefreshCw,
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import DynamicChart from '../../components/charts/DynamicChart';
import DynamicTable from '../../components/charts/DynamicTable';
import StatCard from '../../components/charts/StatCard';
import { API_ENDPOINTS } from '../../config/api';

interface VisualizationData {
  type: 'stats' | 'chart' | 'table';
  visualType?: 'bar' | 'line' | 'pie' | 'area';
  data: any[];
  config?: {
    title?: string;
    xKey?: string;
    yKey?: string;
    columns?: string[];
    stats?: Array<{
      title: string;
      value: string | number;
      icon?: string;
      trend?: { value: number; direction: 'up' | 'down' };
      subtitle?: string;
      color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'pink';
    }>;
  };
  query?: string;
  timestamp?: Date;
}

const iconMap: { [key: string]: any } = {
  users: Users,
  bookopen: BookOpen,
  calendar: Calendar,
  award: Award,
  clock: Clock,
  trendingup: TrendingUp,
};

const AIVisualizationPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [visualizations, setVisualizations] = useState<VisualizationData[]>([]);
  const [selectedType, setSelectedType] = useState<'auto' | 'stats' | 'chart' | 'table'>('auto');
  const [shouldAutoGenerate, setShouldAutoGenerate] = useState(false);

  // Check for pending query from navigation
  React.useEffect(() => {
    const pendingQuery = sessionStorage.getItem('pendingVisualizationQuery');
    if (pendingQuery) {
      setQuery(pendingQuery);
      sessionStorage.removeItem('pendingVisualizationQuery');
      setShouldAutoGenerate(true);
    }
  }, []);

  const exampleQueries = [
    'Show student attendance trends for the last 30 days',
    'Total students by grade level',
    'Teacher workload distribution',
    'Top 10 performing students this semester',
    'Class-wise average marks comparison',
    'Monthly admission statistics for 2025',
    'Subject-wise teacher allocation',
    'Attendance rate by class section',
  ];

  const generateVisualization = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    setShouldAutoGenerate(false); // Reset flag
    try {
      // Get session ID
      let sessionId = localStorage.getItem('ai_chat_session_id');
      if (!sessionId) {
        sessionId = 'sess-' + Math.random().toString(36).substring(2, 10) + '-' + Date.now().toString(36);
        localStorage.getItem('ai_chat_session_id');
      }

      const payload = {
        sessionId,
        action: 'visualize',
        chatInput: query,
        query,
        visualizationType: selectedType,
        currentPage: '/ai/visualizations',
        timestamp: new Date().toISOString(),
      };

      const url = (import.meta.env.VITE_N8N_CHAT_URL as string) || API_ENDPOINTS.AI.PROCESS;
      const token = (import.meta.env.VITE_N8N_CHAT_TOKEN as string) || localStorage.getItem('authToken');

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Failed to generate visualization: ${res.statusText}`);
      }

      const responseData = await res.json();
      console.log('AI Visualization Response:', responseData);

      // Parse the response
      let visualization: VisualizationData | null = null;

      // Try to extract visualization data from various response formats
      const extractVisualization = (data: any): VisualizationData | null => {
        if (!data) return null;

        // Extract from markdown code blocks (```json ... ```)
        if (typeof data === 'string' || data.output) {
          const textContent = typeof data === 'string' ? data : data.output;
          
          // Try to extract JSON from markdown code blocks
          const jsonBlockRegex = /```json\s*\n?([\s\S]*?)\n?```/g;
          const matches = [...textContent.matchAll(jsonBlockRegex)];
          
          if (matches.length > 0) {
            // Try each JSON block until we find a valid visualization
            for (const match of matches) {
              try {
                const parsed = JSON.parse(match[1].trim());
                if (parsed.action === 'visualize') {
                  return {
                    type: parsed.type || 'chart',
                    visualType: parsed.visualType,
                    data: parsed.data || [],
                    config: parsed.config || {},
                    query,
                    timestamp: new Date(),
                  };
                }
              } catch (e) {
                console.warn('Failed to parse JSON block:', e);
                continue;
              }
            }
          }
          
          // Try to parse entire string as JSON
          try {
            const parsed = JSON.parse(textContent);
            return extractVisualization(parsed);
          } catch {
            // Not valid JSON - try to extract structured data from text
            console.warn('Response is plain text, attempting to parse...');
            
            // Check if it's a numbered list (top N items)
            const numberedListRegex = /\d+\.\s+\*?\*?([^:*]+)\*?\*?:\s*([0-9.]+%?)/g;
            const listMatches = [...textContent.matchAll(numberedListRegex)];
            
            if (listMatches.length > 0) {
              // Extract data from numbered list
              const tableData = listMatches.map((match, index) => ({
                rank: index + 1,
                name: match[1].trim(),
                value: match[2].trim()
              }));
              
              return {
                type: 'table',
                data: tableData,
                config: {
                  title: 'Top Performers',
                  columns: ['rank', 'name', 'value']
                },
                query,
                timestamp: new Date(),
              };
            }
          }
        }

        // Direct visualization object
        if (data.action === 'visualize' && data.data !== undefined) {
          return {
            type: data.type || 'chart',
            visualType: data.visualType,
            data: data.data,
            config: data.config,
            query,
            timestamp: new Date(),
          };
        }

        // Nested in result
        if (data.result) {
          try {
            const parsed = typeof data.result === 'string' ? JSON.parse(data.result) : data.result;
            return extractVisualization(parsed);
          } catch {
            return null;
          }
        }

        // Nested in data
        if (data.data) {
          return extractVisualization(data.data);
        }

        return null;
      };

      visualization = extractVisualization(responseData);

      if (visualization) {
        setVisualizations(prev => [visualization!, ...prev]);
        setQuery('');
      } else {
        // Fallback: create a sample visualization
        console.warn('Could not parse visualization, creating sample');
        const sampleViz: VisualizationData = {
          type: 'stats',
          data: [],
          config: {
            stats: [
              {
                title: 'Query Processed',
                value: 'Success',
                subtitle: query,
                color: 'green',
              },
            ],
          },
          query,
          timestamp: new Date(),
        };
        setVisualizations(prev => [sampleViz, ...prev]);
      }
    } catch (error) {
      console.error('Error generating visualization:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const clearVisualizations = () => {
    setVisualizations([]);
  };

  // Auto-generate visualization when flagged
  React.useEffect(() => {
    if (shouldAutoGenerate && query.trim()) {
      const timer = setTimeout(() => {
        generateVisualization();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [shouldAutoGenerate, query]);

  const renderVisualization = (viz: VisualizationData) => {
    switch (viz.type) {
      case 'stats':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {viz.config?.stats?.map((stat, idx) => (
              <StatCard
                key={idx}
                title={stat.title}
                value={stat.value}
                icon={stat.icon ? iconMap[stat.icon.toLowerCase()] : undefined}
                trend={stat.trend}
                subtitle={stat.subtitle}
                color={stat.color}
              />
            ))}
          </div>
        );

      case 'chart':
        return (
          <Card className="p-6">
            <DynamicChart
              data={viz.data}
              type={viz.visualType || 'bar'}
              xKey={viz.config?.xKey}
              yKey={viz.config?.yKey}
              title={viz.config?.title}
            />
          </Card>
        );

      case 'table':
        return (
          <Card className="p-6">
            <DynamicTable
              data={viz.data}
              columns={viz.config?.columns}
              title={viz.config?.title}
            />
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">AI Data Visualization</h1>
        <p className="mt-2 text-gray-600">
          Create custom statistics, tables, and graphs using natural language queries
        </p>
      </div>

      {/* Query Input */}
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Describe what you want to visualize
            </label>
            <div className="flex space-x-2">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    generateVisualization();
                  }
                }}
                placeholder="e.g., Show student attendance trends for the last 30 days..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button
                onClick={generateVisualization}
                disabled={!query.trim() || isLoading}
                icon={isLoading ? RefreshCw : Sparkles}
                className={isLoading ? 'animate-spin' : ''}
              >
                {isLoading ? 'Generating...' : 'Generate'}
              </Button>
            </div>
          </div>

          {/* Visualization Type Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Visualization Type
            </label>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedType === 'auto' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setSelectedType('auto')}
                icon={Sparkles}
              >
                Auto-detect
              </Button>
              <Button
                variant={selectedType === 'stats' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setSelectedType('stats')}
                icon={TrendingUp}
              >
                Statistics
              </Button>
              <Button
                variant={selectedType === 'chart' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setSelectedType('chart')}
                icon={BarChart3}
              >
                Charts
              </Button>
              <Button
                variant={selectedType === 'table' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setSelectedType('table')}
                icon={TableIcon}
              >
                Tables
              </Button>
            </div>
          </div>

          {/* Example Queries */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Example queries:</p>
            <div className="flex flex-wrap gap-2">
              {exampleQueries.slice(0, 4).map((example, idx) => (
                <button
                  key={idx}
                  onClick={() => setQuery(example)}
                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                  disabled={isLoading}
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Visualizations */}
      {visualizations.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Generated Visualizations ({visualizations.length})
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={clearVisualizations}
            >
              Clear All
            </Button>
          </div>

          <div className="space-y-6">
            {visualizations.map((viz, index) => (
              <div key={index} className="space-y-2">
                {viz.query && (
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span className="font-medium">Query: {viz.query}</span>
                    {viz.timestamp && (
                      <span className="text-gray-400">
                        {new Date(viz.timestamp).toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                )}
                {renderVisualization(viz)}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Empty State */}
      {visualizations.length === 0 && !isLoading && (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="p-4 bg-blue-100 rounded-full">
              <BarChart3 className="w-12 h-12 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Start Creating Visualizations
              </h3>
              <p className="text-gray-600 max-w-md">
                Enter a natural language query above to generate custom statistics,
                charts, and tables based on your school data.
              </p>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Try these examples:</p>
              <div className="flex flex-col space-y-1">
                {exampleQueries.slice(0, 3).map((example, idx) => (
                  <button
                    key={idx}
                    onClick={() => setQuery(example)}
                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    • {example}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default AIVisualizationPage;
