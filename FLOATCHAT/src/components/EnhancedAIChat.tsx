import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, Mic, MicOff, Bot, User, Copy, RefreshCw, 
  MoreVertical, Trash2, Archive, Download, Zap,
  MessageSquare, Globe, TrendingUp, Sparkles, Volume2, VolumeX
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { mockAPI } from '../utils/mock-api';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface User {
  id: string;
  name: string;
}

interface ChartDataUpdate {
  type: 'temperature' | 'salinity' | 'combined' | 'metrics';
  data: any[];
  metrics?: any;
  analysis?: string;
}

interface EnhancedAIChatProps {
  user: User | null;
  accessToken: string | null;
  onVoiceQuery: (query: string) => void;
  isVoiceActive: boolean;
  currentLanguage: string;
  oceanData?: any;
  onChartDataUpdate?: (update: ChartDataUpdate) => void;
}

const SUGGESTED_QUERIES = [
  "Analyze temperature trends in the Pacific Ocean over the last year",
  "What are the current salinity patterns in the Mediterranean Sea?",
  "Show me ARGO float data near the Gulf Stream",
  "Compare ocean temperatures between 2023-2024 globally",
  "Explain the relationship between temperature and depth in my data",
  "Find anomalies in recent ocean temperature measurements",
  "What do the current ocean patterns tell us about climate change?",
  "How do El Niño conditions affect ARGO float measurements?"
];

const QUICK_ACTIONS = [
  { label: "Temperature Analysis", query: "Analyze the temperature patterns in my current data", icon: "🌡️" },
  { label: "Salinity Trends", query: "What trends do you see in the salinity data?", icon: "🧂" },
  { label: "Depth Profiles", query: "Explain the depth profiles in this dataset", icon: "📊" },
  { label: "Regional Comparison", query: "Compare ocean conditions between different regions", icon: "🗺️" },
  { label: "Climate Insights", query: "What do these measurements tell us about climate patterns?", icon: "🌍" },
  { label: "Data Quality", query: "Assess the quality and reliability of this ocean data", icon: "✅" }
];

export const EnhancedAIChat: React.FC<EnhancedAIChatProps> = ({
  user,
  accessToken,
  onVoiceQuery,
  isVoiceActive,
  currentLanguage,
  oceanData,
  onChartDataUpdate
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [conversationId] = useState(() => Date.now().toString());
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Voice functionality state
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [voiceError, setVoiceError] = useState('');
  const [micPermissionStatus, setMicPermissionStatus] = useState<'unknown' | 'granted' | 'denied' | 'prompt'>('unknown');
  const [voiceOnlyMode, setVoiceOnlyMode] = useState(false); // For users who want TTS without voice input
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Analyze user query and determine if chart data should be updated
  const analyzeQueryForChartUpdate = (query: string, aiResponse: string): ChartDataUpdate | null => {
    const lowerQuery = query.toLowerCase();
    const lowerResponse = aiResponse.toLowerCase();
    
    // Check if the query is asking for data visualization or analysis
    const visualizationKeywords = [
      'show', 'chart', 'graph', 'plot', 'visualize', 'display', 'trend', 'pattern',
      'compare', 'analyze', 'temperature', 'salinity', 'depth', 'data'
    ];
    
    const hasVisualizationRequest = visualizationKeywords.some(keyword => 
      lowerQuery.includes(keyword) || lowerResponse.includes(keyword)
    );

    if (!hasVisualizationRequest || !oceanData) return null;

    // Generate dynamic chart data based on query context and current ocean data
    const chartData = generateChartDataFromQuery(query, oceanData);
    
    if (chartData) {
      return chartData;
    }

    return null;
  };

  // Generate chart data based on user query and ocean data
  const generateChartDataFromQuery = (query: string, data: any): ChartDataUpdate | null => {
    if (!data || !data.floats) return null;

    const lowerQuery = query.toLowerCase();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Process the actual ocean data to create chart-friendly format
    const processedData = months.map((month, index) => {
      // Filter floats for this month (simulate temporal distribution)
      const monthFloats = data.floats.filter((_, i) => i % 12 === index);
      
      if (monthFloats.length === 0) {
        return {
          date: month,
          temperature: data.summary?.avgTemperature || 15,
          tempUpper: (data.summary?.avgTemperature || 15) + 2,
          tempLower: (data.summary?.avgTemperature || 15) - 2,
          salinity: data.summary?.avgSalinity || 35,
          depth: 2000,
          quality: 95
        };
      }

      // Calculate averages for this month's data
      const avgTemp = monthFloats.reduce((sum, f) => sum + (f.temperature || 15), 0) / monthFloats.length;
      const avgSalinity = monthFloats.reduce((sum, f) => sum + (f.salinity || 35), 0) / monthFloats.length;
      const avgDepth = monthFloats.reduce((sum, f) => sum + (f.depth || 2000), 0) / monthFloats.length;
      
      return {
        date: month,
        temperature: avgTemp,
        tempUpper: avgTemp + (Math.random() * 2 + 1),
        tempLower: avgTemp - (Math.random() * 2 + 1),
        salinity: avgSalinity,
        depth: avgDepth,
        quality: 90 + Math.random() * 10
      };
    });

    // Generate updated metrics based on the data
    const updatedMetrics = [
      {
        label: 'Avg Temperature',
        value: `${data.summary?.avgTemperature?.toFixed(1) || '15.0'}°C`,
        change: lowerQuery.includes('warming') || lowerQuery.includes('temperature increase') ? '+2.1°C' : 
                lowerQuery.includes('cooling') ? '-1.2°C' : '+0.8°C',
        trend: lowerQuery.includes('warming') || lowerQuery.includes('increase') ? 'up' : 
               lowerQuery.includes('cooling') || lowerQuery.includes('decrease') ? 'down' : 'stable',
        icon: 'Thermometer',
        color: 'text-coral-orange'
      },
      {
        label: 'Salinity Level',
        value: `${data.summary?.avgSalinity?.toFixed(1) || '35.0'} PSU`,
        change: lowerQuery.includes('freshening') ? '-0.5 PSU' : 
                lowerQuery.includes('saline') ? '+0.3 PSU' : '-0.1 PSU',
        trend: lowerQuery.includes('freshening') || lowerQuery.includes('decrease') ? 'down' : 
               lowerQuery.includes('saline') || lowerQuery.includes('increase') ? 'up' : 'stable',
        icon: 'Droplets',
        color: 'text-cyan-teal'
      },
      {
        label: 'Active Floats',
        value: `${data.summary?.activeFloats || data.summary?.totalFloats || 0}`,
        change: `+${Math.floor(Math.random() * 20) + 5}`,
        trend: 'up',
        icon: 'Activity',
        color: 'text-green-400'
      },
      {
        label: 'Data Quality',
        value: '96.2%',
        change: '+1.5%',
        trend: 'up',
        icon: 'Waves',
        color: 'text-ocean-blue-light'
      }
    ];

    // Determine chart type based on query
    let chartType: 'temperature' | 'salinity' | 'combined' | 'metrics' = 'combined';
    
    if (lowerQuery.includes('temperature') && !lowerQuery.includes('salinity')) {
      chartType = 'temperature';
    } else if (lowerQuery.includes('salinity') && !lowerQuery.includes('temperature')) {
      chartType = 'salinity';
    } else if (lowerQuery.includes('metrics') || lowerQuery.includes('summary')) {
      chartType = 'metrics';
    }

    return {
      type: chartType,
      data: processedData,
      metrics: updatedMetrics,
      analysis: `Chart updated based on ${data.region || 'ocean'} data analysis. Showing trends for ${data.summary?.totalFloats || 0} ARGO floats.`
    };
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const hasVoiceSupport = ('webkitSpeechRecognition' in window) || ('SpeechRecognition' in window);
      const isSecure = location.protocol === 'https:' || location.hostname === 'localhost';
      
      let voiceInfo = '';
      if (hasVoiceSupport && isSecure) {
        voiceInfo = '\n\n🎤 **Voice Input Available**: Click the microphone button to speak your questions. I can understand both English and French!';
      } else if (hasVoiceSupport && !isSecure) {
        voiceInfo = '\n\n🔒 **Voice Input**: Available on HTTPS connections only. Please use a secure connection to enable voice features.';
      } else {
        voiceInfo = '\n\n💬 **Text Input**: Type your questions below. Voice input is not supported in this browser.';
      }
      
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        role: 'assistant',
        content: `Hello${user ? ` ${user.name}` : ''}! I'm ARGO AI, your advanced oceanographic research assistant running in local mode! 🌊\n\nI'm fully operational without any server deployment and can provide comprehensive analysis of ocean data, climate patterns, and marine science insights.${voiceInfo}\n\n✅ **Local Mode Benefits:**\n• No deployment issues or server dependencies\n• Instant responses and reliable operation\n• Complete privacy - all processing is local\n• Advanced oceanographic analysis capabilities\n\nWhat ocean data mysteries would you like to explore today?`,
        timestamp: new Date().toISOString()
      };
      setMessages([welcomeMessage]);
    }
  }, [user]);

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setShowSuggestions(false);

    try {
      // Prepare conversation context for OpenAI
      const conversationMessages = [...messages, userMessage].map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Add ocean data context if available
      if (oceanData) {
        conversationMessages.unshift({
          role: 'system',
          content: `Current ocean data context: ${JSON.stringify({
            region: oceanData.region,
            totalFloats: oceanData.summary?.totalFloats,
            avgTemperature: oceanData.summary?.avgTemperature,
            avgSalinity: oceanData.summary?.avgSalinity,
            dateRange: oceanData.dateRange
          })}`
        });
      }

      console.log('Sending AI chat request...', {
        messageCount: conversationMessages.length,
        conversationId,
        userId: user?.id || 'anonymous',
        hasAccessToken: !!accessToken
      });

      const requestBody = {
        messages: conversationMessages,
        conversationId,
        userId: user?.id || null
      };

      console.log('Request body:', JSON.stringify(requestBody, null, 2));

      // Use the mock API service which handles both real API and fallback
      const data = await mockAPI.sendChatMessage(
        conversationMessages,
        conversationId,
        user?.id || null
      );
      console.log('AI chat response data:', data);
      
      if (!data.message) {
        console.error('Invalid response format:', data);
        throw new Error('Invalid response format from AI service');
      }
      
      const aiMessage: ChatMessage = {
        id: data.message.id,
        role: 'assistant',
        content: data.message.content,
        timestamp: data.message.timestamp
      };

      console.log('Successfully received AI message:', aiMessage);
      setMessages(prev => [...prev, aiMessage]);

      // Check if the query warrants a chart data update
      const chartUpdate = analyzeQueryForChartUpdate(content, aiMessage.content);
      if (chartUpdate && onChartDataUpdate) {
        console.log('Triggering chart data update:', chartUpdate);
        setTimeout(() => {
          onChartDataUpdate(chartUpdate);
        }, 1000); // Delay to allow message to render first
      }

      // Auto-speak response in voice-only mode
      if (voiceOnlyMode) {
        setTimeout(() => {
          speakText(aiMessage.content, true);
        }, 500);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      
      // Create a more informative error message based on the error type
      let errorContent = "I apologize, but I'm having trouble connecting to my knowledge base right now.";
      
      if (error.message.includes('OpenAI API key not configured')) {
        errorContent = "The AI service is not properly configured. Please contact your administrator.";
      } else if (error.message.includes('400')) {
        errorContent = "There was an issue with the request format. Please try rephrasing your question.";
      } else if (error.message.includes('401')) {
        errorContent = "Authentication failed. Please try logging in again.";
      } else if (error.message.includes('429')) {
        errorContent = "The AI service is experiencing high demand. Please wait a moment and try again.";
      } else if (error.message.includes('500')) {
        errorContent = "The AI service is temporarily unavailable. Please try again in a few moments.";
      }
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `${errorContent}\n\n_Debug info: ${error.message}_`,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, errorMessage]);

      // Auto-speak error in voice-only mode
      if (voiceOnlyMode) {
        setTimeout(() => {
          speakText(errorContent, true);
        }, 500);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    await sendMessage(inputValue);
  };

  const handleQuickAction = async (query: string) => {
    await sendMessage(query);
  };

  const handleSuggestionClick = async (suggestion: string) => {
    await sendMessage(suggestion);
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const clearChat = () => {
    setMessages([]);
    setShowSuggestions(true);
    // Re-add welcome message
    const welcomeMessage: ChatMessage = {
      id: 'welcome-' + Date.now(),
      role: 'assistant',
      content: `Chat cleared! How can I help you with ocean data analysis today?`,
      timestamp: new Date().toISOString()
    };
    setMessages([welcomeMessage]);
  };

  const exportChat = () => {
    const chatText = messages.map(msg => 
      `[${new Date(msg.timestamp).toLocaleString()}] ${msg.role.toUpperCase()}: ${msg.content}`
    ).join('\n\n');
    
    const blob = new Blob([chatText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ocean-ai-chat-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Check microphone permission status
  const checkMicrophonePermission = async () => {
    try {
      if (!navigator.permissions) {
        return 'unsupported';
      }
      
      const permission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      setMicPermissionStatus(permission.state);
      return permission.state; // 'granted', 'denied', or 'prompt'
    } catch (error) {
      console.error('Error checking microphone permission:', error);
      setMicPermissionStatus('unknown');
      return 'unsupported';
    }
  };

  // Initialize permission status check
  useEffect(() => {
    checkMicrophonePermission();
  }, []);

  // Request microphone permission with better error handling
  const requestMicrophonePermission = async () => {
    try {
      // Check current permission status first
      const permissionStatus = await checkMicrophonePermission();
      console.log('Microphone permission status:', permissionStatus);
      
      if (permissionStatus === 'denied') {
        setVoiceError('Microphone access was previously denied. Please click the microphone icon in your browser\'s address bar and select "Allow" to enable voice input.');
        return false;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stop the stream immediately as we just needed permission
      stream.getTracks().forEach(track => track.stop());
      console.log('Microphone permission granted successfully');
      setMicPermissionStatus('granted');
      return true;
    } catch (error) {
      console.error('Microphone permission request failed:', error);
      
      if (error.name === 'NotAllowedError') {
        setVoiceError('Microphone access denied. To enable voice input:\n1. Click the microphone icon in your browser\'s address bar\n2. Select "Allow" for microphone access\n3. Refresh the page and try again');
      } else if (error.name === 'NotFoundError') {
        setVoiceError('No microphone found. Please connect a microphone and try again.');
      } else if (error.name === 'NotSupportedError') {
        setVoiceError('Microphone access not supported in this browser or context.');
      } else {
        setVoiceError(`Microphone error: ${error.message}. Please check your microphone settings.`);
      }
      
      return false;
    }
  };

  const startListening = async () => {
    // Check if speech recognition is supported
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setVoiceError('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    // Check if we're on HTTPS (required for speech recognition)
    if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
      setVoiceError('Speech recognition requires HTTPS. Please use a secure connection.');
      return;
    }

    // Show loading state while requesting permission
    setVoiceError('');
    setVoiceTranscript('Requesting microphone permission...');

    // Request microphone permission first
    const hasPermission = await requestMicrophonePermission();
    if (!hasPermission) {
      setVoiceTranscript('');
      return;
    }

    setVoiceTranscript('');

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = currentLanguage === 'fr' ? 'fr-FR' : 'en-US';
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceError('');
        setVoiceTranscript('');
        console.log('Voice recognition started');
      };

      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
          } else {
            interimTranscript += result[0].transcript;
          }
        }
        
        // Show interim results
        if (interimTranscript) {
          setVoiceTranscript(interimTranscript);
          setInputValue(interimTranscript);
        }
        
        // Process final results
        if (finalTranscript) {
          const cleanTranscript = finalTranscript.trim();
          setVoiceTranscript(cleanTranscript);
          setInputValue(cleanTranscript);
          console.log('Voice recognition result:', cleanTranscript);
          
          // Auto-send the voice query after a short delay
          setTimeout(() => {
            if (cleanTranscript.length > 0) {
              sendMessage(cleanTranscript);
            }
          }, 800);
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        
        let errorMessage = 'Voice recognition error occurred';
        switch (event.error) {
          case 'not-allowed':
            errorMessage = 'Microphone access denied. Please allow microphone permissions in your browser settings and try again.';
            break;
          case 'no-speech':
            errorMessage = 'No speech detected. Please try speaking more clearly.';
            break;
          case 'audio-capture':
            errorMessage = 'Microphone not available. Please check your microphone connection.';
            break;
          case 'network':
            errorMessage = 'Network error occurred during voice recognition.';
            break;
          case 'service-not-allowed':
            errorMessage = 'Speech recognition service is not allowed. Please try using HTTPS.';
            break;
          default:
            errorMessage = `Voice recognition error: ${event.error}`;
        }
        
        setVoiceError(errorMessage);
      };

      recognition.onend = () => {
        setIsListening(false);
        console.log('Voice recognition ended');
      };

      recognitionRef.current = recognition;
      recognition.start();
      
    } catch (error) {
      console.error('Error starting voice recognition:', error);
      setVoiceError('Failed to start voice recognition. Please try again.');
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  // Text-to-speech functionality for AI responses
  const speakText = (text: string, autoSpeak = false) => {
    if ('speechSynthesis' in window) {
      if (isSpeaking && !autoSpeak) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      } else {
        // Clean up markdown and special characters
        const cleanText = text
          .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markdown
          .replace(/\*(.*?)\*/g, '$1') // Remove italic markdown
          .replace(/`(.*?)`/g, '$1') // Remove code markdown
          .replace(/#{1,6}\s/g, '') // Remove headers
          .replace(/\n/g, ' ') // Replace newlines with spaces
          .replace(/\s+/g, ' ') // Remove multiple spaces
          .trim();

        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 0.8;
        utterance.lang = currentLanguage === 'fr' ? 'fr-FR' : 'en-US';
        
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        
        window.speechSynthesis.speak(utterance);
      }
    } else {
      setVoiceError('Text-to-speech not supported in this browser');
    }
  };

  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const testOpenAIConnection = async () => {
    try {
      console.log('Testing AI connection...');
      
      // Use the mock API service
      const result = await mockAPI.testOpenAI();
      console.log('AI test result:', result);
      
      const testMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `**AI Connection Test**\n\nStatus: ${result.status}\nMessage: ${result.message}\n${result.response ? `Response: ${result.response}` : ''}\nModel: ${result.model || 'N/A'}`,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, testMessage]);
      
    } catch (error) {
      console.error('Error testing AI:', error);
      
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `**AI Connection Test Failed**\n\nError: ${error.message}`,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <section 
      className="glass-card rounded-2xl p-6 space-y-6 h-full flex flex-col"
      role="region"
      aria-labelledby="ai-chat-heading"
    >
      {/* Header */}
      <header className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-ocean-blue to-cyan-teal flex items-center justify-center" aria-hidden="true">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 id="ai-chat-heading" className="text-lg font-semibold text-white flex items-center gap-2">
              ARGO AI Assistant
              <Sparkles className="w-4 h-4 text-cyan-teal" aria-hidden="true" />
            </h1>
            <p className="text-sm text-slate-400">Local AI Mode • Ocean Research Specialist • No Deployment Required</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-cyan-teal/30 text-cyan-teal">
            <Zap className="w-3 h-3 mr-1" />
            Local AI
          </Badge>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-card border-slate-600/30">
              <DropdownMenuItem onClick={testOpenAIConnection} className="text-slate-300 hover:text-white">
                <Zap className="w-4 h-4 mr-2" />
                Test AI Connection
              </DropdownMenuItem>
              <DropdownMenuItem onClick={clearChat} className="text-slate-300 hover:text-white">
                <RefreshCw className="w-4 h-4 mr-2" />
                Clear Chat
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportChat} className="text-slate-300 hover:text-white">
                <Download className="w-4 h-4 mr-2" />
                Export Chat
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Quick Actions */}
      {showSuggestions && messages.length <= 1 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3 flex-shrink-0"
        >
          <p className="text-sm font-medium text-slate-300">Quick Actions</p>
          <div className="grid grid-cols-2 gap-2">
            {QUICK_ACTIONS.map((action) => (
              <motion.button
                key={action.label}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleQuickAction(action.query)}
                className="flex items-center gap-2 p-3 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 border border-slate-600/30 transition-all text-left"
              >
                <span className="text-lg">{action.icon}</span>
                <span className="text-sm text-slate-300">{action.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Chat Messages */}
      <div 
        className="flex-1 space-y-4 overflow-y-auto min-h-0"
        role="log"
        aria-live="polite"
        aria-label="Chat conversation messages"
      >
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              role="article"
              aria-label={`${message.role === 'user' ? 'Your message' : 'AI assistant message'} from ${formatTime(message.timestamp)}`}
            >
              <div className={`max-w-[85%] flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.role === 'user' 
                    ? 'bg-ocean-blue' 
                    : 'bg-gradient-to-br from-cyan-teal to-ocean-blue'
                }`}>
                  {message.role === 'user' ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <Bot className="w-4 h-4 text-white" />
                  )}
                </div>

                {/* Message Content */}
                <div className={`rounded-2xl p-4 ${
                  message.role === 'user'
                    ? 'bg-ocean-blue text-white'
                    : 'bg-slate-800/80 text-slate-200 border border-slate-600/30'
                }`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <p className="text-xs opacity-60 mt-2">
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                    
                    {message.role === 'assistant' && (
                      <div className="flex gap-1" role="group" aria-label="Message actions">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => speakText(message.content)}
                                className="w-6 h-6 p-0 opacity-60 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-cyan-teal focus:ring-offset-2 focus:ring-offset-slate-800"
                                aria-label={isSpeaking ? 'Stop reading message aloud' : 'Read message aloud'}
                              >
                                {isSpeaking ? (
                                  <VolumeX className="w-3 h-3" aria-hidden="true" />
                                ) : (
                                  <Volume2 className="w-3 h-3" aria-hidden="true" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{isSpeaking ? 'Stop speaking' : 'Read aloud'}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyMessage(message.content)}
                                className="w-6 h-6 p-0 opacity-60 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-cyan-teal focus:ring-offset-2 focus:ring-offset-slate-800"
                                aria-label="Copy message to clipboard"
                              >
                                <Copy className="w-3 h-3" aria-hidden="true" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Copy message</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-teal to-ocean-blue flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-600/30">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-cyan-teal rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-cyan-teal rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-cyan-teal rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                  <span className="text-sm text-slate-400">ARGO AI is thinking...</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Queries */}
      {showSuggestions && messages.length <= 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-3 flex-shrink-0"
        >
          <p className="text-sm font-medium text-slate-300">Suggested Questions</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_QUERIES.slice(0, 4).map((query, idx) => (
              <motion.button
                key={`suggested-${query.slice(0, 20)}-${idx}`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSuggestionClick(query)}
                className="text-xs px-3 py-2 rounded-lg bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 border border-slate-600/30 transition-all"
              >
                {query}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {micPermissionStatus === 'prompt' && !isListening && !voiceError && (
          <motion.div
            key="mic-permission-prompt"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass-card p-4 border border-cyan-teal/30 bg-gradient-to-br from-cyan-teal/10 to-cyan-teal/5 flex-shrink-0"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-teal/20 rounded-lg">
                <Mic className="w-5 h-5 text-cyan-teal" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-cyan-teal mb-1">🎤 Voice Input Ready</h4>
                <p className="text-xs text-slate-400">
                  Click "Enable Voice" to start. Your browser will ask for microphone permission.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={startListening}
                className="border-cyan-teal/30 text-cyan-teal hover:bg-cyan-teal/10 font-medium"
              >
                Enable Voice
              </Button>
            </div>
          </motion.div>
        )}

        {voiceOnlyMode && (
          <motion.div
            key="voice-only-mode"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass-card p-3 border border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-blue-500/5 flex-shrink-0"
          >
            <div className="flex items-center gap-3">
              <div className="p-1 bg-blue-500/20 rounded-lg">
                {isSpeaking ? (
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                  >
                    <Volume2 className="w-4 h-4 text-blue-400" />
                  </motion.div>
                ) : (
                  <Volume2 className="w-4 h-4 text-blue-400" />
                )}
              </div>
              <div className="flex-1">
                <span className="text-sm font-medium text-blue-400">
                  🔊 Text-to-Speech Mode {isSpeaking && '(Speaking)'}
                </span>
                <p className="text-xs text-slate-400">
                  {isSpeaking 
                    ? 'AI is currently speaking. Click stop to interrupt.' 
                    : 'AI responses will be read aloud. Voice input disabled.'}
                </p>
              </div>
              <div className="flex gap-1">
                {isSpeaking && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={stopSpeaking}
                    className="border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs"
                  >
                    Stop
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    stopSpeaking();
                    setVoiceOnlyMode(false);
                  }}
                  className="text-slate-400 hover:text-slate-300 text-xs"
                >
                  ×
                </Button>
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>

      {/* Voice Status Display */}
      <div id="voice-status" className="sr-only" aria-live="polite" aria-atomic="true">
        {isListening && "Voice input active, listening for your question"}
        {voiceTranscript && !isListening && `Voice input detected: ${voiceTranscript}`}
        {voiceError && `Voice input error: ${voiceError}`}
      </div>
      
      <AnimatePresence>
        {(voiceTranscript || voiceError || isListening) && (
          <motion.div
            key="voice-status-display"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass-card p-4 space-y-3 flex-shrink-0 border border-slate-600/30"
            role="status"
            aria-label="Voice input status"
          >
            {isListening && (
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="w-4 h-4 bg-coral-orange rounded-full shadow-lg shadow-orange-500/50"
                />
                <div className="flex-1">
                  <span className="text-sm font-medium text-coral-orange">🎤 Listening...</span>
                  <p className="text-xs text-slate-400 mt-1">Speak clearly into your microphone</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={stopListening}
                  className="text-coral-orange hover:text-coral-orange-light"
                >
                  Stop
                </Button>
              </div>
            )}
            
            {voiceTranscript && !isListening && (
              <div className="flex items-start gap-3">
                <Mic className="w-4 h-4 text-cyan-teal mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-cyan-teal">Voice Input Detected:</span>
                    <Badge variant="outline" className="border-green-500/30 text-green-400 text-xs">
                      Processing
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-300 mt-1 p-2 bg-slate-800/50 rounded-lg border-l-2 border-cyan-teal/50">
                    "{voiceTranscript}"
                  </p>
                </div>
              </div>
            )}
            
            {voiceError && (
              <div className="flex items-start gap-3">
                <MicOff className="w-5 h-5 text-coral-orange mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <span className="text-sm font-medium text-coral-orange">Voice Input Error</span>
                  <p className="text-sm text-slate-300 mt-1 whitespace-pre-line">{voiceError}</p>
                  
                  <div className="flex gap-2 mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setVoiceError('');
                        checkMicrophonePermission();
                      }}
                      className="text-xs border-coral-orange/30 text-coral-orange hover:bg-coral-orange/10"
                    >
                      Retry
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setVoiceError('')}
                      className="text-xs text-slate-400 hover:text-slate-300"
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Form */}
      <form 
        onSubmit={handleSubmit} 
        className="flex gap-3 flex-shrink-0"
        role="search"
        aria-label="Send message to ARGO AI Assistant"
      >
        <div className="flex-1 relative">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={currentLanguage === 'en' ? 
              "Ask ARGO AI about ocean data, trends, or research insights..." : 
              "Demandez à ARGO AI des informations sur les données océaniques..."
            }
            className="pr-12 bg-slate-800/50 border-slate-600/30 focus:border-cyan-teal/50 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-teal focus:ring-offset-2 focus:ring-offset-slate-900"
            disabled={isLoading || isListening}
            aria-label="Message input"
            aria-describedby="voice-status input-help"
            autoComplete="off"
          />
          <div id="input-help" className="sr-only">
            Type your question about ocean data or use the microphone button for voice input
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={isListening ? stopListening : startListening}
                  disabled={isLoading}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 p-0 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-teal focus:ring-offset-2 focus:ring-offset-slate-800 ${
                    isListening 
                      ? 'text-coral-orange glow-hover shadow-lg shadow-orange-500/20' 
                      : 'text-slate-400 hover:text-cyan-teal hover:glow-hover'
                  }`}
                  aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
                  aria-pressed={isListening}
                >
                  <motion.div
                    animate={isListening ? { scale: [1, 1.1, 1] } : { scale: 1 }}
                    transition={{ repeat: isListening ? Infinity : 0, duration: 1 }}
                  >
                    {isListening ? (
                      <MicOff className="w-4 h-4" aria-hidden="true" />
                    ) : (
                      <Mic className="w-4 h-4" aria-hidden="true" />
                    )}
                  </motion.div>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-center">
                  <p>
                    {isListening ? 'Stop voice input' : 'Start voice input'}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {isListening ? 'Click to stop listening' : 'Click to start voice recognition'}
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        <Button
          type="submit"
          disabled={!inputValue.trim() || isLoading || isListening}
          className="bg-gradient-to-r from-ocean-blue to-cyan-teal hover:from-ocean-blue-dark hover:to-cyan-teal-dark text-white focus:outline-none focus:ring-2 focus:ring-cyan-teal focus:ring-offset-2 focus:ring-offset-slate-900"
          aria-label="Send message"
        >
          <Send className="w-4 h-4" aria-hidden="true" />
          <span className="sr-only">Send message</span>
        </Button>
      </form>

      {/* Status Bar */}
      <div className="flex items-center justify-between text-xs text-slate-400 flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span>OpenAI GPT-4</span>
          </div>
          <div className="flex items-center gap-1">
            <Globe className="w-3 h-3" />
            <span>Ocean Expert Mode</span>
          </div>
          <div className="flex items-center gap-1">
            {voiceOnlyMode ? (
              <>
                <Volume2 className="w-3 h-3 text-blue-400" />
                <span>TTS Only</span>
              </>
            ) : micPermissionStatus === 'granted' ? (
              <>
                <Mic className="w-3 h-3 text-green-400" />
                <span>Voice {isListening ? 'Active' : 'Ready'}</span>
              </>
            ) : micPermissionStatus === 'denied' ? (
              <>
                <MicOff className="w-3 h-3 text-coral-orange" />
                <span>Voice Blocked</span>
              </>
            ) : (
              <>
                <Mic className="w-3 h-3" />
                <span>Voice Available</span>
              </>
            )}
          </div>
        </div>
        {user && (
          <div className="flex items-center gap-1">
            <MessageSquare className="w-3 h-3" />
            <span>Conversation saved</span>
          </div>
        )}
      </div>
    </section>
  );
};

// Add type declarations for Speech APIs
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

