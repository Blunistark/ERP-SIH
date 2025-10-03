import { useState, useEffect, useCallback } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

interface UseVoiceAndTTSReturn {
  // Speech Recognition
  transcript: string;
  isListening: boolean;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  browserSupportsSpeechRecognition: boolean;
  
  // Text-to-Speech
  isSpeaking: boolean;
  speak: (text: string) => void;
  stopSpeaking: () => void;
  autoSpeak: boolean;
  toggleAutoSpeak: () => void;
}

export const useVoiceAndTTS = (): UseVoiceAndTTSReturn => {
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(() => {
    const saved = localStorage.getItem('aiAutoSpeak');
    return saved ? JSON.parse(saved) : false;
  });

  // Save auto-speak preference
  useEffect(() => {
    localStorage.setItem('aiAutoSpeak', JSON.stringify(autoSpeak));
  }, [autoSpeak]);

  // Start listening with automatic language detection
  const startListening = useCallback(() => {
    // Start with continuous listening and automatic language detection
    SpeechRecognition.startListening({
      continuous: false, // Stop after user finishes speaking
      language: 'auto', // Browser will auto-detect language
    });
  }, []);

  // Stop listening
  const stopListening = useCallback(() => {
    SpeechRecognition.stopListening();
  }, []);

  // Speak text using Web Speech API with automatic language detection
  const speak = useCallback((text: string) => {
    if (!text) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Detect language from text content
    const detectedLang = detectLanguage(text);
    utterance.lang = detectedLang;

    // Get available voices
    const voices = window.speechSynthesis.getVoices();
    
    // Find a voice that matches the detected language
    const matchingVoice = voices.find(voice => 
      voice.lang.startsWith(detectedLang.split('-')[0])
    );
    
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    // Speech settings
    utterance.rate = 1.0; // Normal speed
    utterance.pitch = 1.0; // Normal pitch
    utterance.volume = 1.0; // Full volume

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, []);

  // Stop speaking
  const stopSpeaking = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  // Toggle auto-speak
  const toggleAutoSpeak = useCallback(() => {
    setAutoSpeak(prev => !prev);
  }, []);

  // Load voices when they become available
  useEffect(() => {
    const loadVoices = () => {
      window.speechSynthesis.getVoices();
    };

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
      SpeechRecognition.stopListening();
    };
  }, []);

  return {
    transcript,
    isListening: listening,
    startListening,
    stopListening,
    resetTranscript,
    browserSupportsSpeechRecognition,
    isSpeaking,
    speak,
    stopSpeaking,
    autoSpeak,
    toggleAutoSpeak,
  };
};

// Detect language from text content
function detectLanguage(text: string): string {
  // Remove emojis and special characters
  const cleanText = text.replace(/[^\p{L}\s]/gu, '');
  
  // Hindi (Devanagari script)
  if (/[\u0900-\u097F]/.test(cleanText)) return 'hi-IN';
  
  // Bengali
  if (/[\u0980-\u09FF]/.test(cleanText)) return 'bn-IN';
  
  // Tamil
  if (/[\u0B80-\u0BFF]/.test(cleanText)) return 'ta-IN';
  
  // Telugu
  if (/[\u0C00-\u0C7F]/.test(cleanText)) return 'te-IN';
  
  // Kannada
  if (/[\u0C80-\u0CFF]/.test(cleanText)) return 'kn-IN';
  
  // Malayalam
  if (/[\u0D00-\u0D7F]/.test(cleanText)) return 'ml-IN';
  
  // Gujarati
  if (/[\u0A80-\u0AFF]/.test(cleanText)) return 'gu-IN';
  
  // Punjabi
  if (/[\u0A00-\u0A7F]/.test(cleanText)) return 'pa-IN';
  
  // Marathi (uses Devanagari, but check for specific patterns)
  if (/[\u0900-\u097F]/.test(cleanText)) return 'mr-IN';
  
  // Default to English
  return 'en-IN';
}
