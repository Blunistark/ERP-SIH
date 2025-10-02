import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader, Sparkles } from 'lucide-react';
import { API_ENDPOINTS } from '../../config/api';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card from '../ui/Card';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  autoFillForm,
  detectPageType,
  FORM_DESCRIPTIONS,
  generateSampleData,
  highlightFilledFields,
  formatFormDataForDisplay,
} from '../../utils/formHelpers';

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

// Route aliases for flexible navigation
const ROUTE_ALIASES: Record<string, string> = {
  'home': '/',
  'dashboard': '/',
  'main': '/',
  'students': '/users/students',
  'student list': '/users/students',
  'add student': '/users/students/add',
  'teachers': '/users/teachers',
  'teacher list': '/users/teachers',
  'staff': '/users/teachers',
  'parents': '/users/parents',
  'parent list': '/users/parents',
  'guardians': '/users/parents',
  'classes': '/academic/classes',
  'class list': '/academic/classes',
  'add class': '/academic/classes/add',
  'years': '/academic/years',
  'academic years': '/academic/years',
  'add year': '/academic/years/add',
  'subjects': '/academic/subjects',
  'subject list': '/academic/subjects',
  'add subject': '/academic/subjects/add',
  'timetable': '/academic/timetable',
  'schedule': '/academic/timetable',
  'create timetable': '/academic/timetable/create',
  'attendance': '/attendance',
  'mark attendance': '/attendance/mark',
  'attendance reports': '/attendance/reports',
  'examinations': '/examinations',
  'exams': '/examinations',
  'communications': '/communications',
  'notices': '/communication/notices',
  'create notice': '/communication/notices/create',
  'ai analytics': '/ai/analytics',
  'analytics': '/ai/analytics',
  'ai predictions': '/ai/predictions',
  'predictions': '/ai/predictions',
  'ai content': '/ai/content',
  'content generator': '/ai/content',
  'ai assistant': '/ai/assistant',
  'ai automation': '/ai/automation',
  'automation': '/ai/automation',
  'reports': '/reports',
  'settings': '/settings',
};

const AIChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'ai',
      content: 'Hello! I\'m your AI assistant. I can help you navigate, fill forms, and answer questions. How can I help you today?',
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isPending, setIsPending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Detect current page type for form assistance
  const currentPageType = detectPageType();

  // Generate or reuse a sessionId stored in localStorage
  const getSessionId = () => {
    let sid = localStorage.getItem('ai_chat_session_id');
    if (!sid) {
      // simple UUID v4 substitute
      sid = 'sess-' + Math.random().toString(36).substring(2, 10) + '-' + Date.now().toString(36);
      localStorage.setItem('ai_chat_session_id', sid);
    }
    return sid;
  };

  async function sendToN8n(message: string): Promise<{ data: { result: string } }>{ 
    const sessionId = getSessionId();

    // Payload with current page context for intelligent assistance
    const payload = {
      sessionId,
      action: 'sendMessage',
      chatInput: message,
      currentPage: location.pathname, // Add current page context
      timestamp: new Date().toISOString(),
    };

    // Use configured n8n webhook endpoint (Vite env or API_ENDPOINTS)
    const url = (import.meta.env.VITE_N8N_CHAT_URL as string) || API_ENDPOINTS.AI.PROCESS;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const token = (import.meta.env.VITE_N8N_CHAT_TOKEN as string) || localStorage.getItem('authToken');
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      const text = await res.text();

      if (!res.ok) {
        console.error('n8n webhook returned non-OK:', res.status, text);
        let parsed: any = undefined;
        try { parsed = JSON.parse(text); } catch { parsed = undefined; }
        const errMsg = parsed?.message || parsed?.error || text || `HTTP ${res.status}`;
        throw new Error(errMsg);
      }

      let responsePayload: any;
      try { responsePayload = JSON.parse(text); } catch { responsePayload = text; }

      console.debug('n8n webhook payload:', responsePayload);

      let reply: string;

      // If payload is an object and contains common text fields, extract them
      const extractFromObject = (obj: any): string | undefined => {
        if (!obj || typeof obj !== 'object') return undefined;
        if (typeof obj.output === 'string') return obj.output;
        if (typeof obj.message === 'string') return obj.message;
        if (typeof obj.text === 'string') return obj.text;
        if (obj?.data && typeof obj.data === 'string') return obj.data;
        if (obj?.data?.result && typeof obj.data.result === 'string') return obj.data.result;
        if (obj?.result && typeof obj.result === 'string') return obj.result;
        if (obj?.json?.text && typeof obj.json.text === 'string') return obj.json.text;
        if (obj?.json?.output && typeof obj.json.output === 'string') return obj.json.output;
        return undefined;
      };

      // Try top-level object
      if (typeof responsePayload === 'string') reply = responsePayload;
      else if (extractFromObject(responsePayload)) reply = extractFromObject(responsePayload) as string;
      else if (Array.isArray(responsePayload) && responsePayload.length > 0) {
        const first = responsePayload[0];
        const extracted = extractFromObject(first);
        if (extracted) reply = extracted;
        else if (first?.json) {
          if (typeof first.json.result === 'string') reply = first.json.result;
          else if (typeof first.json.text === 'string') reply = first.json.text;
          else reply = JSON.stringify(first.json);
        } else if (first?.result) reply = first.result;
        else reply = JSON.stringify(first);
      } else {
        // fallback to stringifying whatever we received
        reply = JSON.stringify(responsePayload);
      }

      return { data: { result: reply } };
    } catch (err) {
      console.error('Failed to call n8n webhook', err);
      throw err instanceof Error ? err : new Error(String(err));
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Helper to resolve route aliases
  const resolveRoute = (input: string): string | null => {
    const normalized = input.toLowerCase().trim();
    return ROUTE_ALIASES[normalized] || null;
  };

  // Helper to extract and clean response
  const extractResponse = (responseData: any): string => {
    if (!responseData) return '';
    
    // If it's already a string, return it
    if (typeof responseData === 'string') return responseData.trim();
    
    // If it's an object, try common response fields
    if (typeof responseData === 'object') {
      return responseData.result || responseData.message || responseData.text || 
             responseData.output || JSON.stringify(responseData);
    }
    
    return String(responseData);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const originalMessage = inputMessage;
    setInputMessage('');

    // Check for special form commands
    const lowerInput = originalMessage.toLowerCase().trim();
    
    // Auto-fill form command
    if ((lowerInput.includes('fill') || lowerInput.includes('auto fill') || lowerInput.includes('autofill')) && 
        (lowerInput.includes('form') || lowerInput.includes('this page'))) {
      
      if (currentPageType) {
        const sampleData = generateSampleData(currentPageType);
        autoFillForm(sampleData);
        highlightFilledFields(Object.keys(sampleData));
        
        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: `✨ I've filled the form with sample data! Please review and modify as needed. The filled fields are highlighted briefly.`,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiMessage]);
        return;
      } else {
        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: `I don't detect a form on this page. I can help with forms on: Student Registration, Teacher Registration, Class Creation, and more. Would you like me to navigate to one of these pages?`,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiMessage]);
        return;
      }
    }

    // Form help command
    if ((lowerInput.includes('help') || lowerInput.includes('guide') || lowerInput.includes('how')) && 
        (lowerInput.includes('fill') || lowerInput.includes('form') || lowerInput.includes('page'))) {
      
      if (currentPageType && FORM_DESCRIPTIONS[currentPageType]) {
        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: `📋 ${FORM_DESCRIPTIONS[currentPageType]}\n\n💡 **Tips:**\n- Fields marked with * are required\n- I can auto-fill sample data for you! Just say "fill this form" or "auto fill"\n- I can verify your data before submission by saying "verify form" or "check data"`,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiMessage]);
        return;
      }
    }

    try {
      setIsPending(true);
      
      // Add form context to message if on a form page
      let contextualMessage = originalMessage;
      
      // For validation requests, include current form data
      if ((lowerInput.includes('verify') || lowerInput.includes('check') || lowerInput.includes('validate')) && 
          (lowerInput.includes('form') || lowerInput.includes('data') || lowerInput.includes('fields'))) {
        
        const formDataDisplay = formatFormDataForDisplay();
        contextualMessage = `${originalMessage}\n\n${formDataDisplay}`;
      } else if (currentPageType) {
        // For other messages on form pages, just add page context
        contextualMessage = `[Current Page: ${currentPageType} form] ${originalMessage}`;
      }
      
      const response = await sendToN8n(contextualMessage);

      // Extract clean response text
      const responseText = extractResponse(response.data?.result);
      
      // Check if the response is a navigation command (JSON format)
      if (responseText) {
        try {
          // Clean up the response text - remove markdown code blocks if present
          let cleanedText = responseText.trim();
          if (cleanedText.startsWith('```json')) {
            cleanedText = cleanedText.replace(/```json\s*/g, '').replace(/```\s*/g, '');
          } else if (cleanedText.startsWith('```')) {
            cleanedText = cleanedText.replace(/```\s*/g, '');
          }
          
          // Try to parse as JSON first
          const parsed = JSON.parse(cleanedText);
          
          console.log('📋 Parsed AI command:', parsed);
          
          if (parsed.action === 'navigate' && parsed.url) {
            // Handle navigation
            const aiMessage: ChatMessage = {
              id: (Date.now() + 1).toString(),
              type: 'ai',
              content: `🧭 Navigating to ${parsed.url}...`,
              timestamp: new Date(),
            };
            setMessages(prev => [...prev, aiMessage]);
            
            // Navigate after a brief delay
            setTimeout(() => {
              navigate(parsed.url);
            }, 500);
            return;
          }
          
          // Handle form fill command from AI
          if (parsed.action === 'fillForm' && parsed.data) {
            console.log('✨ Filling form with data:', parsed.data);
            
            // Small delay to ensure form is rendered
            setTimeout(() => {
              autoFillForm(parsed.data);
              highlightFilledFields(Object.keys(parsed.data));
            }, 100);
            
            const aiMessage: ChatMessage = {
              id: (Date.now() + 1).toString(),
              type: 'ai',
              content: parsed.message || `✨ Form filled successfully! Please review the data.`,
              timestamp: new Date(),
            };
            setMessages(prev => [...prev, aiMessage]);
            
            // Show additional message if there are fields needing attention
            if (parsed.fieldsNeedingAttention && parsed.fieldsNeedingAttention.length > 0) {
              setTimeout(() => {
                const attentionMessage: ChatMessage = {
                  id: (Date.now() + 2).toString(),
                  type: 'ai',
                  content: `⚠️ Please also fill: ${parsed.fieldsNeedingAttention.join(', ')}`,
                  timestamp: new Date(),
                };
                setMessages(prev => [...prev, attentionMessage]);
              }, 1000);
            }
            return;
          }
        } catch (parseError) {
          console.log('⚠️ Not a JSON command, treating as regular message:', parseError);
          // Not JSON command
          // Check if it's a simple text navigation hint
          const route = resolveRoute(responseText);
          if (route) {
            const aiMessage: ChatMessage = {
              id: (Date.now() + 1).toString(),
              type: 'ai',
              content: `🧭 Taking you to ${route}...`,
              timestamp: new Date(),
            };
            setMessages(prev => [...prev, aiMessage]);
            
            setTimeout(() => {
              navigate(route);
            }, 500);
            return;
          }
        }
      }

      // Regular message response
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: responseText || 'I apologize, but I couldn\'t process your request.',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: `Error: ${errMsg}`,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsPending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className="h-96 flex flex-col">
      <div className="flex items-center space-x-2 mb-4 pb-4 border-b border-gray-200">
        <Bot className="w-6 h-6 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">AI Assistant</h3>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.type === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <div className="flex items-start space-x-2">
                {message.type === 'ai' && <Bot className="w-4 h-4 mt-0.5" />}
                {message.type === 'user' && <User className="w-4 h-4 mt-0.5" />}
                <div>
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs opacity-75 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
        {isPending && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
              <div className="flex items-center space-x-2">
                <Loader className="w-4 h-4 animate-spin" />
                <span className="text-sm">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex space-x-2">
        <Input
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          className="flex-1"
        />
        <Button
          onClick={handleSendMessage}
          disabled={!inputMessage.trim() || isPending}
          icon={Send}
        >
          Send
        </Button>
      </div>
    </Card>
  );
};

export default AIChat;