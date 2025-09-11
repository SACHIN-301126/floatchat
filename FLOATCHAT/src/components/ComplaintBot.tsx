import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Send, Mic, MicOff, Bot, User } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { mockAPI } from '../utils/mock-api';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

interface ComplaintBotProps {
  user?: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export function ComplaintBot({ user }: ComplaintBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: 'Hello! I\'m your Ocean Analytics Support Assistant. How can I help you today? I can assist with technical issues, feature requests, or any concerns about the platform.',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Use mock API for complaint handling
      const response = await mockAPI.handleComplaint({
        message: userMessage.content,
        userId: user?.id || 'anonymous',
        userEmail: user?.email || 'anonymous',
        platform: 'Ocean Analytics Platform',
        timestamp: new Date().toISOString()
      });

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: response.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending complaint:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: 'I apologize, but I\'m having trouble processing your request right now. Please try again in a moment, or contact our support team directly at support@oceananalytics.com',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const quickResponses = [
    "I'm having trouble with data loading",
    "Feature request: Need export functionality",
    "Bug report: Charts not updating",
    "Login/authentication issues"
  ];

  const handleQuickResponse = (response: string) => {
    setInputValue(response);
  };

  return (
    <>
      {/* Floating Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 left-6 glass-card p-4 hover:bg-coral-orange/20 transition-all duration-200 glow-hover group z-50 shadow-2xl"
            title="Need help? Chat with our AI support"
          >
            <MessageCircle className="w-6 h-6 text-coral-orange group-hover:text-coral-orange-light transition-colors" />
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -top-1 -right-1 w-3 h-3 bg-coral-orange rounded-full"
            />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="fixed bottom-6 left-6 w-96 h-[500px] glass-card shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-600/30">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-coral-orange/20 rounded-full">
                  <Bot className="w-5 h-5 text-coral-orange" />
                </div>
                <div>
                  <h3 className="font-medium text-white">Support Assistant</h3>
                  <p className="text-xs text-slate-400">AI-powered help</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="hover:bg-red-600/20 text-slate-400 hover:text-red-400"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start gap-2 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`p-2 rounded-full flex-shrink-0 ${
                      message.type === 'user' 
                        ? 'bg-ocean-blue/20' 
                        : 'bg-coral-orange/20'
                    }`}>
                      {message.type === 'user' ? (
                        <User className="w-3 h-3 text-ocean-blue" />
                      ) : (
                        <Bot className="w-3 h-3 text-coral-orange" />
                      )}
                    </div>
                    <div className={`p-3 rounded-xl ${
                      message.type === 'user'
                        ? 'bg-ocean-blue/30 text-white'
                        : 'bg-slate-800/50 text-slate-200'
                    }`}>
                      <p className="text-sm leading-relaxed">{message.content}</p>
                      <p className="text-xs opacity-60 mt-1">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="flex items-start gap-2">
                    <div className="p-2 bg-coral-orange/20 rounded-full">
                      <Bot className="w-3 h-3 text-coral-orange" />
                    </div>
                    <div className="bg-slate-800/50 p-3 rounded-xl">
                      <div className="flex gap-1">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                            className="w-2 h-2 bg-coral-orange rounded-full"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Responses */}
            {messages.length === 1 && (
              <div className="px-4 pb-2">
                <p className="text-xs text-slate-400 mb-2">Quick issues:</p>
                <div className="grid grid-cols-1 gap-1">
                  {quickResponses.map((response, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickResponse(response)}
                      className="text-left text-xs p-2 bg-slate-700/30 hover:bg-slate-600/30 rounded-lg transition-colors text-slate-300 hover:text-white"
                    >
                      {response}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-slate-600/30">
              <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Describe your issue or concern..."
                    className="pr-10 bg-input-background/80 border-slate-600/30 text-white placeholder:text-slate-400"
                    disabled={isLoading}
                  />
                  <button
                    onClick={toggleVoiceInput}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded transition-colors ${
                      isListening 
                        ? 'text-coral-orange bg-coral-orange/20' 
                        : 'text-slate-400 hover:text-coral-orange'
                    }`}
                    title={isListening ? 'Stop listening' : 'Voice input'}
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>
                </div>
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  className="bg-coral-orange hover:bg-coral-orange-dark text-white px-3"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                {user ? `Logged in as ${user.name}` : 'Chatting as anonymous user'}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}