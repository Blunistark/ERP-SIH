import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { useVoiceAndTTS } from '../../hooks/useVoiceAndTTS';
import { API_ENDPOINTS } from '../../config/api';
import { useNavigate, useLocation } from 'react-router-dom';
// import GradualBlur from '../ui/GradualBlur';
import {
  autoFillForm,
  detectPageType,
  generateSampleData,
  highlightFilledFields,
  formatFormDataForDisplay,
} from '../../utils/formHelpers';

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  options?: string[];
}

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
  'ai visualizations': '/ai/visualizations',
  'custom charts': '/ai/visualizations',
  'data visualization': '/ai/visualizations',
  'create graphs': '/ai/visualizations',
  'reports': '/reports',
  'settings': '/settings',
};

interface FloatingAIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

const FloatingAIAssistant: React.FC<FloatingAIAssistantProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Voice and TTS Hook with automatic language detection
  const {
    transcript,
    isListening,
    startListening,
    stopListening,
    resetTranscript,
    browserSupportsSpeechRecognition,
    speak,
    autoSpeak,
    toggleAutoSpeak,
    stopSpeaking,
    isSpeaking,
  } = useVoiceAndTTS();

  const currentPageType = detectPageType();

  // Handle voice transcript
  useEffect(() => {
    if (transcript && !isListening) {
      setInputMessage(transcript);
      resetTranscript();
    }
  }, [transcript, isListening, resetTranscript]);

  // Auto-speak AI responses
  useEffect(() => {
    if (autoSpeak && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.type === 'ai' && lastMessage.content) {
        const cleanText = lastMessage.content
          .replace(/[🧭📋✅❌]/g, '')
          .replace(/```json/g, '')
          .replace(/```/g, '')
          .trim();
        
        if (cleanText) {
          speak(cleanText);
        }
      }
    }
  }, [messages, autoSpeak, speak]);

  const getSessionId = () => {
    let sid = localStorage.getItem('ai_chat_session_id');
    if (!sid) {
      sid = 'sess-' + Math.random().toString(36).substring(2, 10) + '-' + Date.now().toString(36);
      localStorage.setItem('ai_chat_session_id', sid);
    }
    return sid;
  };

  async function sendToN8n(message: string): Promise<{ data: { result: string } }> {
    const sessionId = getSessionId();

    const payload = {
      sessionId,
      action: 'sendMessage',
      chatInput: message,
      currentPage: location.pathname,
      timestamp: new Date().toISOString(),
    };

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
        try {
          parsed = JSON.parse(text);
        } catch {
          parsed = undefined;
        }
        const errMsg = parsed?.message || parsed?.error || text || `HTTP ${res.status}`;
        throw new Error(errMsg);
      }

      let responsePayload: any;
      try {
        responsePayload = JSON.parse(text);
      } catch {
        responsePayload = text;
      }

      console.debug('n8n webhook payload:', responsePayload);

      let reply: string;

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

  const resolveRoute = (input: string): string | null => {
    const normalized = input.toLowerCase().trim();
    return ROUTE_ALIASES[normalized] || null;
  };

  const extractResponse = (responseData: any): string => {
    if (!responseData) return '';
    if (typeof responseData === 'string') return responseData.trim();
    if (typeof responseData === 'object') {
      return responseData.result || responseData.message || responseData.text ||
        responseData.output || JSON.stringify(responseData);
    }
    return String(responseData);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && showWelcome) {
      const timer = setTimeout(() => {
        setShowWelcome(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, showWelcome]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    setShowWelcome(false);

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const originalMessage = inputMessage;
    setInputMessage('');

    const lowerInput = originalMessage.toLowerCase().trim();

    if ((lowerInput.includes('fill') || lowerInput.includes('auto fill') || lowerInput.includes('autofill')) &&
      (lowerInput.includes('form') || lowerInput.includes('this page'))) {

      if (currentPageType) {
        const sampleData = generateSampleData(currentPageType);
        autoFillForm(sampleData);
        highlightFilledFields(Object.keys(sampleData));

        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: `✨ I've filled the form with sample data! Please review and modify as needed.`,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiMessage]);
        return;
      } else {
        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: `I don't detect a form on this page. Would you like me to navigate to a form page?`,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiMessage]);
        return;
      }
    }

    try {
      setIsPending(true);

      let contextualMessage = originalMessage;

      if ((lowerInput.includes('verify') || lowerInput.includes('check') || lowerInput.includes('validate')) &&
        (lowerInput.includes('form') || lowerInput.includes('data') || lowerInput.includes('fields'))) {

        const formDataDisplay = formatFormDataForDisplay();
        contextualMessage = `${originalMessage}\n\n${formDataDisplay}`;
      } else if (currentPageType) {
        contextualMessage = `[Current Page: ${currentPageType} form] ${originalMessage}`;
      }

      const response = await sendToN8n(contextualMessage);

      const responseText = extractResponse(response.data?.result);

      if (responseText) {
        try {
          // Try to extract JSON from anywhere in the response
          let cleanedText = responseText.trim();
          
          // Check if response contains ```json code blocks
          const jsonBlockMatch = cleanedText.match(/```json\s*([\s\S]*?)\s*```/);
          if (jsonBlockMatch) {
            cleanedText = jsonBlockMatch[1].trim();
          } else if (cleanedText.startsWith('```')) {
            // Handle plain code blocks
            cleanedText = cleanedText.replace(/```\s*/g, '').trim();
          } else {
            // Try to extract JSON object from the text (handles cases where text comes before JSON)
            const jsonMatch = cleanedText.match(/\{[\s\S]*"action"[\s\S]*\}/);
            if (jsonMatch) {
              cleanedText = jsonMatch[0];
            }
          }

          const parsed = JSON.parse(cleanedText);

          console.log('📋 Parsed AI command:', parsed);

          if (parsed.action === 'navigate' && parsed.url) {
            const aiMessage: ChatMessage = {
              id: (Date.now() + 1).toString(),
              type: 'ai',
              content: `🧭 Navigating to ${parsed.url}...`,
              timestamp: new Date(),
            };
            setMessages(prev => [...prev, aiMessage]);

            setTimeout(() => {
              navigate(parsed.url);
            }, 1000);
            return;
          }

          if (parsed.action === 'presentOptions' && parsed.options && Array.isArray(parsed.options)) {
            const aiMessage: ChatMessage = {
              id: (Date.now() + 1).toString(),
              type: 'ai',
              content: parsed.message || 'Please choose an option:',
              timestamp: new Date(),
              options: parsed.options,
            };
            setMessages(prev => [...prev, aiMessage]);
            return;
          }

          if (parsed.action === 'visualize') {
            const aiMessage: ChatMessage = {
              id: (Date.now() + 1).toString(),
              type: 'ai',
              content: `📊 I can help you create that visualization! Let me take you to the visualization page.`,
              timestamp: new Date(),
            };
            setMessages(prev => [...prev, aiMessage]);

            setTimeout(() => {
              navigate('/ai/visualizations');
              sessionStorage.setItem('pendingVisualizationQuery', originalMessage);
              onClose();
            }, 1000);
            return;
          }

          if (parsed.action === 'fillForm' && parsed.data) {
            console.log('✨ Filling form with data:', parsed.data);

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
            }, 1000);
            return;
          }
        }
      }

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

  const handleOptionClick = (option: string) => {
    setMessages(prev => prev.map(msg => ({ ...msg, options: undefined })));

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: option,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);

    (async () => {
      try {
        setIsPending(true);
        const response = await sendToN8n(option);
        const responseText = extractResponse(response.data?.result);

        if (responseText) {
          try {
            // Try to extract JSON from anywhere in the response
            let cleanedText = responseText.trim();
            
            // Check if response contains ```json code blocks
            const jsonBlockMatch = cleanedText.match(/```json\s*([\s\S]*?)\s*```/);
            if (jsonBlockMatch) {
              cleanedText = jsonBlockMatch[1].trim();
            } else if (cleanedText.startsWith('```')) {
              // Handle plain code blocks
              cleanedText = cleanedText.replace(/```\s*/g, '').trim();
            } else {
              // Try to extract JSON object from the text (handles cases where text comes before JSON)
              const jsonMatch = cleanedText.match(/\{[\s\S]*"action"[\s\S]*\}/);
              if (jsonMatch) {
                cleanedText = jsonMatch[0];
              }
            }

            const parsed = JSON.parse(cleanedText);

            if (parsed.action === 'navigate' && parsed.url) {
              const aiMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                type: 'ai',
                content: `🧭 Navigating to ${parsed.url}...`,
                timestamp: new Date(),
              };
              setMessages(prev => [...prev, aiMessage]);
              setTimeout(() => {
                navigate(parsed.url);
              }, 1000);
              return;
            }

            if (parsed.action === 'presentOptions' && parsed.options) {
              const aiMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                type: 'ai',
                content: parsed.message || 'Please choose an option:',
                timestamp: new Date(),
                options: parsed.options,
              };
              setMessages(prev => [...prev, aiMessage]);
              return;
            }
          } catch (e) {
            // Not JSON
          }
        }

        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: responseText || 'I apologize, but I could not process your request.',
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
    })();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 h-30vh z-50 flex items-end justify-center pointer-events-none overflow-hidden">
      {/* Beautiful gradient fade overlay with blur - 30% screen height */}
      <div 
        className="absolute inset-0 gradient-fade-overlay bg-gradient-to-t from-blue-900/90 via-blue-600/50 to-transparent pointer-events-auto"
        onClick={onClose}
        style={{ cursor: 'pointer' }}
      >
        {/* Gradual Blur Effect at Top Edge */}
        {/* <GradualBlur
          target="parent"
          position="top"
          height="8rem"
          strength={3}
          divCount={8}
          curve="bezier"
          exponential={true}
          opacity={1}
        /> */}
      </div>

      {/* Main content container - centered with bottom spacing */}
      <div className="relative z-10 w-full flex flex-col items-center justify-end h-full pointer-events-none pb-6">

        <div className="w-full max-w-6xl px-8 flex items-center justify-center gap-8 pointer-events-none">
          {/* Center: Messages and Status */}
          <div className="flex-1 min-w-0 flex justify-center">
            {showWelcome && messages.length === 0 ? (
              <div className="text-center animate-fade-in pointer-events-none">
                <p className="text-base md:text-lg font-bold text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]">
                  Hello! 👋 I'm Aariv, your intelligent School ERP assistant. How can I help you today?
                </p>
              </div>
            ) : isPending ? (
              <div className="text-center pointer-events-none">
                <p className="text-sm md:text-base text-white font-bold animate-pulse drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]">Aariv is thinking...</p>
              </div>
            ) : messages.length > 0 ? (
              <div className="space-y-2 w-full max-w-2xl pointer-events-auto">
                {messages.slice(-1).map((message) => (
                  <div key={message.id} className="animate-fade-in">
                    {message.type === 'ai' && (
                      <div className="space-y-2">
                        <div className="bg-white/25 backdrop-blur-xl text-white px-4 py-2.5 rounded-xl shadow-2xl border border-white/40">
                          <p className="text-xs md:text-sm leading-relaxed font-semibold drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]">{message.content}</p>
                        </div>

                        {/* Quick Options - Better organized */}
                        {message.options && message.options.length > 0 && (
                          <div className="flex flex-wrap justify-center gap-2 mt-2">
                            {message.options.map((option, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleOptionClick(option)}
                                className="px-3 py-1.5 text-xs bg-gradient-to-r from-blue-500/40 to-cyan-500/40 hover:from-blue-500/60 hover:to-cyan-500/60 backdrop-blur-xl text-white rounded-lg border border-blue-300/40 hover:border-blue-300/70 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:scale-105 font-semibold"
                                disabled={isPending}
                              >
                                {option}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          {/* Right: Input Box with Voice Controls */}
          <div className="flex-shrink-0 w-80 pointer-events-auto">
            <div className="bg-white/25 backdrop-blur-xl rounded-xl border border-blue-300/40 shadow-2xl overflow-hidden hover:border-blue-300/60 transition-all duration-300">
              <div className="flex items-center px-4 py-2 gap-2">
                {/* Voice Input Button */}
                {browserSupportsSpeechRecognition && (
                  <button
                    onClick={isListening ? stopListening : startListening}
                    className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 ${
                      isListening 
                        ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                        : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600'
                    }`}
                    aria-label={isListening ? "Stop Listening" : "Start Voice Input"}
                  >
                    {isListening ? (
                      <MicOff className="w-4 h-4 text-white" />
                    ) : (
                      <Mic className="w-4 h-4 text-white" />
                    )}
                  </button>
                )}
                
                {/* Text Input */}
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={isListening ? "Listening..." : "Type your message..."}
                  className="flex-1 bg-transparent text-white placeholder-white/80 outline-none text-xs md:text-sm font-semibold"
                  disabled={isPending || isListening}
                />
                
                {/* TTS Toggle Button */}
                <button
                  onClick={toggleAutoSpeak}
                  className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 ${
                    autoSpeak 
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600' 
                      : 'bg-gray-500/50 hover:bg-gray-600/50'
                  }`}
                  aria-label={autoSpeak ? "Disable Auto-Speak" : "Enable Auto-Speak"}
                  title={autoSpeak ? "Auto-speak is ON" : "Auto-speak is OFF"}
                >
                  {isSpeaking ? (
                    <Volume2 className="w-4 h-4 text-white animate-pulse" />
                  ) : autoSpeak ? (
                    <Volume2 className="w-4 h-4 text-white" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-white" />
                  )}
                </button>
                
                {/* Send Button */}
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isPending}
                  className="w-9 h-9 flex items-center justify-center bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:scale-105"
                  aria-label="Send Message"
                >
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default FloatingAIAssistant;
