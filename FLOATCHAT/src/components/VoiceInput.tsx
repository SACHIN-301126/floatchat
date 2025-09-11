import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface VoiceInputProps {
  onVoiceQuery: (query: string) => void;
  onTextToSpeech: (text: string) => void;
  className?: string;
}

export function VoiceInput({ onVoiceQuery, onTextToSpeech, className = '' }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Speech recognition not supported in this browser');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setError('');
      setTranscript('');
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          setTranscript(result[0].transcript);
        }
      }
      
      if (finalTranscript) {
        setTranscript(finalTranscript);
        onVoiceQuery(finalTranscript);
      }
    };

    recognition.onerror = (event) => {
      setError(`Speech recognition error: ${event.error}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const handleTextToSpeech = () => {
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      } else {
        const utterance = new SpeechSynthesisUtterance(transcript || 'No text to speak');
        utterance.rate = 0.8;
        utterance.pitch = 1;
        utterance.volume = 0.8;
        
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        
        window.speechSynthesis.speak(utterance);
        onTextToSpeech(transcript || 'No text to speak');
      }
    } else {
      setError('Text-to-speech not supported in this browser');
    }
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Voice Input Button */}
      <Button
        onClick={isListening ? stopListening : startListening}
        variant={isListening ? 'destructive' : 'secondary'}
        size="sm"
        className={`glow-hover transition-all duration-300 ${
          isListening 
            ? 'bg-coral-orange hover:bg-coral-orange-dark shadow-lg shadow-orange-500/20' 
            : 'glass-card border-cyan-500/30 hover:border-cyan-500/50'
        }`}
        aria-label={isListening ? 'Stop listening' : 'Start voice input'}
      >
        <motion.div
          animate={isListening ? { scale: [1, 1.2, 1] } : { scale: 1 }}
          transition={{ repeat: isListening ? Infinity : 0, duration: 1 }}
        >
          {isListening ? (
            <MicOff className="w-4 h-4" />
          ) : (
            <Mic className="w-4 h-4" />
          )}
        </motion.div>
        <span className="ml-2 text-sm">
          {isListening ? 'Listening...' : 'Voice'}
        </span>
      </Button>

      {/* Text-to-Speech Button */}
      <Button
        onClick={handleTextToSpeech}
        variant="outline"
        size="sm"
        className="glass-card border-cyan-500/30 hover:border-cyan-500/50 glow-hover"
        disabled={!transcript}
        aria-label={isSpeaking ? 'Stop speaking' : 'Read aloud'}
      >
        <motion.div
          animate={isSpeaking ? { rotate: [0, 10, -10, 0] } : { rotate: 0 }}
          transition={{ repeat: isSpeaking ? Infinity : 0, duration: 0.5 }}
        >
          {isSpeaking ? (
            <VolumeX className="w-4 h-4" />
          ) : (
            <Volume2 className="w-4 h-4" />
          )}
        </motion.div>
      </Button>

      {/* Status Display */}
      <AnimatePresence>
        {(transcript || error || isListening) && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="flex items-center gap-2"
          >
            {isListening && (
              <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 animate-pulse">
                Listening...
              </Badge>
            )}
            
            {transcript && (
              <Badge className="bg-green-500/20 text-green-300 border-green-500/30 max-w-xs truncate">
                "{transcript}"
              </Badge>
            )}
            
            {error && (
              <Badge className="bg-red-500/20 text-red-300 border-red-500/30">
                {error}
              </Badge>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Add type declarations for Speech APIs
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}