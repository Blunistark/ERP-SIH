import { useState, useEffect, useCallback, useRef } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

export interface Language {
  code: string;
  name: string;
  flag: string;
  speechCode: string; // For speech recognition
  ttsCode: string;    // For text-to-speech
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', flag: '🇬🇧', speechCode: 'en-IN', ttsCode: 'en-IN' },
  { code: 'hi', name: 'हिंदी (Hindi)', flag: '🇮🇳', speechCode: 'hi-IN', ttsCode: 'hi-IN' },
  { code: 'ta', name: 'தமிழ் (Tamil)', flag: '🇮🇳', speechCode: 'ta-IN', ttsCode: 'ta-IN' },
  { code: 'te', name: 'తెలుగు (Telugu)', flag: '🇮🇳', speechCode: 'te-IN', ttsCode: 'te-IN' },
  { code: 'bn', name: 'বাংলা (Bengali)', flag: '🇮🇳', speechCode: 'bn-IN', ttsCode: 'bn-IN' },
  { code: 'mr', name: 'मराठी (Marathi)', flag: '🇮🇳', speechCode: 'mr-IN', ttsCode: 'mr-IN' },
  { code: 'gu', name: 'ગુજરાતી (Gujarati)', flag: '🇮🇳', speechCode: 'gu-IN', ttsCode: 'gu-IN' },
  { code: 'kn', name: 'ಕನ್ನಡ (Kannada)', flag: '🇮🇳', speechCode: 'kn-IN', ttsCode: 'kn-IN' },
  { code: 'ml', name: 'മലയാളം (Malayalam)', flag: '🇮🇳', speechCode: 'ml-IN', ttsCode: 'ml-IN' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ (Punjabi)', flag: '🇮🇳', speechCode: 'pa-IN', ttsCode: 'pa-IN' },
];

export const useVoiceAndSpeech = () => {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('aiLanguage');
    return saved ? JSON.parse(saved) : SUPPORTED_LANGUAGES[0]; // Default to English
  });
  
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isTTSSupported, setIsTTSSupported] = useState(false);
  const speechSynthesisRef = useRef<SpeechSynthesis | null>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  // Initialize speech synthesis
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      speechSynthesisRef.current = window.speechSynthesis;
      setIsTTSSupported(true);
    }
  }, []);

  // Save language preference
  useEffect(() => {
    localStorage.setItem('aiLanguage', JSON.stringify(selectedLanguage));
  }, [selectedLanguage]);

  // Start voice recognition
  const startListening = useCallback(() => {
    resetTranscript();
    SpeechRecognition.startListening({
      language: selectedLanguage.speechCode,
      continuous: false,
    });
  }, [selectedLanguage, resetTranscript]);

  // Stop voice recognition
  const stopListening = useCallback(() => {
    SpeechRecognition.stopListening();
  }, []);

  // Stop any ongoing speech
  const stopSpeaking = useCallback(() => {
    if (speechSynthesisRef.current) {
      speechSynthesisRef.current.cancel();
      setIsSpeaking(false);
      currentUtteranceRef.current = null;
    }
  }, []);

  // Text-to-Speech function
  const speak = useCallback((text: string, language?: Language) => {
    if (!speechSynthesisRef.current || !text) return;

    // Stop any ongoing speech
    stopSpeaking();

    const lang = language || selectedLanguage;
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set language
    utterance.lang = lang.ttsCode;
    
    // Voice settings
    utterance.rate = 0.9; // Slightly slower for clarity
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Try to find a voice for the selected language
    const voices = speechSynthesisRef.current.getVoices();
    const languageVoice = voices.find(voice => 
      voice.lang.startsWith(lang.code) || voice.lang === lang.ttsCode
    );
    
    if (languageVoice) {
      utterance.voice = languageVoice;
    }

    // Event handlers
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      currentUtteranceRef.current = null;
    };
    utterance.onerror = (error) => {
      console.error('Speech synthesis error:', error);
      setIsSpeaking(false);
      currentUtteranceRef.current = null;
    };

    currentUtteranceRef.current = utterance;
    speechSynthesisRef.current.speak(utterance);
  }, [selectedLanguage, stopSpeaking]);

  // Auto-speak AI responses (optional)
  const autoSpeak = useCallback((text: string) => {
    // Remove emojis and special characters for better TTS
    const cleanText = text.replace(/[🎯📝✅❌⚠️💡🔍📊🧭✨👋]/g, '');
    speak(cleanText);
  }, [speak]);

  // Change language
  const changeLanguage = useCallback((language: Language) => {
    setSelectedLanguage(language);
    // Stop any ongoing operations
    stopListening();
    stopSpeaking();
  }, [stopListening, stopSpeaking]);

  return {
    // Speech Recognition
    transcript,
    isListening: listening,
    startListening,
    stopListening,
    resetTranscript,
    browserSupportsSpeechRecognition,
    
    // Text-to-Speech
    speak,
    autoSpeak,
    stopSpeaking,
    isSpeaking,
    isTTSSupported,
    
    // Language Management
    selectedLanguage,
    changeLanguage,
    supportedLanguages: SUPPORTED_LANGUAGES,
  };
};
