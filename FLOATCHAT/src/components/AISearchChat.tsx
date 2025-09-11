import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Mic, MicOff, Search, Globe, MapPin, TrendingUp, Zap } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  data?: any;
}

interface AISearchChatProps {
  onSearch: (query: string) => void;
  onVoiceQuery: (query: string) => void;
  isVoiceActive: boolean;
  currentLanguage: string;
}

const SUGGESTED_QUERIES = [
  "Show me temperature trends in the Pacific Ocean",
  "Find ARGO floats near the Mediterranean Sea",
  "What's the salinity data for the Arctic region?",
  "Compare ocean temperatures between 2023-2024",
  "Show me all active floats in the Atlantic",
  "Find anomalies in deep ocean temperatures",
  "What are the current ocean currents patterns?",
  "Show me seasonal temperature variations"
];

const QUICK_ACCESS_REGIONS = [
  { name: "Pacific Ocean", query: "pacific ocean data", icon: "🌊" },
  { name: "Atlantic Ocean", query: "atlantic ocean analysis", icon: "🌊" },
  { name: "Indian Ocean", query: "indian ocean temperature", icon: "🌊" },
  { name: "Arctic Ocean", query: "arctic ice and temperature", icon: "❄️" },
  { name: "Mediterranean", query: "mediterranean sea salinity", icon: "🏛️" },
  { name: "Gulf Stream", query: "gulf stream current data", icon: "🌀" }
];

export const AISearchChat: React.FC<AISearchChatProps> = ({
  onSearch,
  onVoiceQuery,
  isVoiceActive,
  currentLanguage
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setShowSuggestions(false);

    // Call the search function
    onSearch(userMessage.content);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `I'm analyzing ocean data for "${userMessage.content}". Here's what I found...`,
        timestamp: new Date(),
        suggestions: [
          "Show more details",
          "Compare with last year",
          "Export this data",
          "Set up alerts"
        ]
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleVoiceToggle = () => {
    if (isVoiceActive) {
      // Stop voice input
      onVoiceQuery('');
    } else {
      // Start voice input
      onVoiceQuery('start');
    }
  };

  const handleQuickQuery = (query: string) => {
    setInputValue(query);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleSuggestionClick = (suggestion: string) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: suggestion,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    onSearch(suggestion);
  };

  return (
    <div className="glass-card rounded-2xl p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-ocean-blue to-cyan-teal flex items-center justify-center">
            <Search className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">AI Ocean Assistant</h3>
            <p className="text-sm text-slate-400">Ask about ocean data trends, comparisons & insights</p>
          </div>
        </div>
        <Badge variant="outline" className="border-cyan-teal/30 text-cyan-teal">
          <Zap className="w-3 h-3 mr-1" />
          Live Data
        </Badge>
      </div>

      {/* Quick Access Regions */}
      {showSuggestions && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <p className="text-sm font-medium text-slate-300">Quick Access Regions</p>
          <div className="grid grid-cols-2 gap-2">
            {QUICK_ACCESS_REGIONS.map((region) => (
              <motion.button
                key={region.name}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleQuickQuery(region.query)}
                className="flex items-center gap-2 p-3 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 border border-slate-600/30 transition-all"
              >
                <span className="text-lg">{region.icon}</span>
                <span className="text-sm text-slate-300">{region.name}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Chat Messages */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-4 ${
                  message.type === 'user'
                    ? 'bg-ocean-blue text-white'
                    : 'bg-slate-800/80 text-slate-200 border border-slate-600/30'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className="text-xs opacity-60 mt-2">
                  {message.timestamp.toLocaleTimeString()}
                </p>
                
                {/* AI Suggestions */}
                {message.suggestions && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {message.suggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="text-xs px-2 py-1 rounded-lg bg-cyan-teal/20 text-cyan-teal hover:bg-cyan-teal/30 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
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
            <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-600/30">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-cyan-teal rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-cyan-teal rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-cyan-teal rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                <span className="text-sm text-slate-400">Analyzing ocean data...</span>
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Queries */}
      {showSuggestions && messages.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-3"
        >
          <p className="text-sm font-medium text-slate-300">Suggested Queries</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_QUERIES.slice(0, 4).map((query, idx) => (
              <motion.button
                key={idx}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleQuickQuery(query)}
                className="text-xs px-3 py-2 rounded-lg bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 border border-slate-600/30 transition-all"
              >
                {query}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex gap-3">
        <div className="flex-1 relative">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={currentLanguage === 'en' ? "Ask about ocean data trends, comparisons & insights..." : "Demandez des tendances, comparaisons et informations sur les données océaniques..."}
            className="pr-12 bg-slate-800/50 border-slate-600/30 focus:border-cyan-teal/50 text-white placeholder:text-slate-400"
            disabled={isLoading}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleVoiceToggle}
            className={`absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 p-0 ${
              isVoiceActive ? 'text-coral-orange' : 'text-slate-400 hover:text-white'
            }`}
          >
            {isVoiceActive ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </Button>
        </div>
        
        <Button
          type="submit"
          disabled={!inputValue.trim() || isLoading}
          className="bg-gradient-to-r from-ocean-blue to-cyan-teal hover:from-ocean-blue-dark hover:to-cyan-teal-dark text-white"
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>

      {/* Status Bar */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span>Connected to ARGO Network</span>
          </div>
          <div className="flex items-center gap-1">
            <Globe className="w-3 h-3" />
            <span>Global Coverage</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <TrendingUp className="w-3 h-3" />
          <span>Real-time Analysis</span>
        </div>
      </div>
    </div>
  );
};