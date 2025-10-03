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

  // Speak text using Murf.ai TTS API
  const speak = useCallback(async (text: string) => {
    if (!text) return;

    // Cancel any ongoing speech
    stopSpeaking();

    try {
      setIsSpeaking(true);

      // Detect language from text content
      const detectedLang = detectLanguage(text);
      const voiceId = getVoiceForLanguage(detectedLang);

      // Call Murf.ai API
      const response = await fetch("https://api.murf.ai/v1/speech/stream", {
        method: "POST",
        headers: {
          "api-key": "ap2_bfe529e5-233d-4f7a-a239-82c0a2193718",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          text: text,
          voiceId: voiceId
        }),
      });

      if (!response.ok) {
        throw new Error(`Murf.ai API error: ${response.status}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      audio.onplay = () => setIsSpeaking(true);
      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };
      audio.onerror = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
        console.error('Audio playback error');
      };

      await audio.play();
    } catch (error) {
      console.error('TTS Error:', error);
      setIsSpeaking(false);
      
      // Fallback to browser TTS if Murf.ai fails
      fallbackToWebSpeech(text);
    }
  }, []);

  // Fallback to Web Speech API if Murf.ai fails
  const fallbackToWebSpeech = useCallback((text: string) => {
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const detectedLang = detectLanguage(text);
    utterance.lang = detectedLang;

    const voices = window.speechSynthesis.getVoices();
    const matchingVoice = voices.find(voice => 
      voice.lang.startsWith(detectedLang.split('-')[0])
    );
    
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, []);

  // Stop speaking
  const stopSpeaking = useCallback(() => {
    window.speechSynthesis.cancel();
    // Stop any playing audio elements
    const audioElements = document.querySelectorAll('audio');
    audioElements.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
    setIsSpeaking(false);
  }, []);

  // Toggle auto-speak
  const toggleAutoSpeak = useCallback(() => {
    setAutoSpeak((prev: boolean) => !prev);
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
  return 'en-US';
}

// Map language codes to Murf.ai voice IDs
function getVoiceForLanguage(langCode: string): string {
  const voiceMap: Record<string, string> = {
    'en-US': 'en-US-natalie',
    'en-IN': 'en-IN-priya',
    'hi-IN': 'hi-IN-priya',
    'bn-IN': 'en-IN-priya', // Fallback to English Indian voice
    'ta-IN': 'en-IN-priya', // Fallback to English Indian voice
    'te-IN': 'en-IN-priya', // Fallback to English Indian voice
    'kn-IN': 'en-IN-priya', // Fallback to English Indian voice
    'ml-IN': 'en-IN-priya', // Fallback to English Indian voice
    'gu-IN': 'en-IN-priya', // Fallback to English Indian voice
    'pa-IN': 'en-IN-priya', // Fallback to English Indian voice
    'mr-IN': 'en-IN-priya', // Fallback to English Indian voice
  };
  
  return voiceMap[langCode] || 'en-US-natalie';
}
