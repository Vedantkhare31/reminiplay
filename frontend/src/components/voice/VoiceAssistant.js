import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Mic, MicOff, X, Volume2, VolumeX, 
  MessageCircle, Send, Bot, Sparkles,
  ChevronUp, ChevronDown, History, Trash2,
  Play, Pause, Keyboard
} from 'lucide-react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import AIResponseService from '../../services/aiResponseService';
import aiAgent from '../../services/AIAgentService';

// User Icon Component
const User = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const VoiceAssistant = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [showChat, setShowChat] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [language, setLanguage] = useState('en');
  const [isBotSpeaking, setIsBotSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speechQueue, setSpeechQueue] = useState([]);
  const [inputMode, setInputMode] = useState('voice'); // 'voice' or 'text'
  const [textInput, setTextInput] = useState('');
  const messagesEndRef = useRef(null);
  const synthRef = useRef(null);
  const utteranceRef = useRef(null);
  const textInputRef = useRef(null);
  // Silence timer for auto-stop
  const silenceTimerRef = useRef(null);
  const lastSpeechTimeRef = useRef(Date.now());

  const {
    transcript: speechTranscript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  // Initialize speech synthesis
  useEffect(() => {
    synthRef.current = window.speechSynthesis;
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  // Update transcript when speech recognition updates + silence detection
  useEffect(() => {
    if (speechTranscript && speechTranscript.trim()) {
      setTranscript(speechTranscript);
      lastSpeechTimeRef.current = Date.now();

      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

      // Auto-stop after 3 seconds of silence
      if (isListening) {
        silenceTimerRef.current = setTimeout(() => {
          if (isListening) {
            stopListeningAndProcess();
          }
        }, 3000);
      }
    }
  }, [speechTranscript, isListening]);

  // Auto-scroll chat
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory]);

  // Update language when i18n changes
  useEffect(() => {
    setLanguage(i18n.language || 'en');
  }, [i18n.language]);

  // Focus text input when switching to text mode
  useEffect(() => {
    if (inputMode === 'text' && textInputRef.current) {
      textInputRef.current.focus();
    }
  }, [inputMode]);

  // ============================================================
  // SPEAK — FIXED: Cancel old speech, no queue leak
  // ============================================================
  const speak = useCallback((text, lang = 'en') => {
    if (!synthRef.current || !text) return;

    // ⭐ ALWAYS cancel any pending/old speech first
    synthRef.current.cancel();
    setIsPaused(false);
    setSpeechQueue([]);

    // Small delay to ensure cancel completes
    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      utteranceRef.current = utterance;

      const voices = synthRef.current.getVoices();
      const voice = voices.find(v => v.lang.startsWith(lang.split('-')[0]));
      if (voice) {
        utterance.voice = voice;
      }

      setIsBotSpeaking(true);

      utterance.onend = () => {
        setIsBotSpeaking(false);
        setIsPaused(false);
        utteranceRef.current = null;
      };

      utterance.onerror = (e) => {
        console.log('Speech error:', e);
        setIsBotSpeaking(false);
        setIsPaused(false);
        utteranceRef.current = null;
      };

      synthRef.current.speak(utterance);
    }, 100);
  }, []);

  // Toggle Pause/Resume
  const togglePause = useCallback(() => {
    if (!synthRef.current) return;

    if (isPaused) {
      synthRef.current.resume();
      setIsPaused(false);
    } else {
      if (synthRef.current.speaking) {
        synthRef.current.pause();
        setIsPaused(true);
      }
    }
  }, [isPaused]);

  // Stop speaking
  const stopSpeaking = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setTimeout(() => {
        if (synthRef.current && synthRef.current.speaking) {
          synthRef.current.pause();
          synthRef.current.cancel();
        }
      }, 50);
    }
    setIsBotSpeaking(false);
    setIsPaused(false);
    utteranceRef.current = null;
    setSpeechQueue([]);
  }, []);

  // ============================================================
  // STOP LISTENING with cleanup
  // ============================================================
  const stopListening = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    SpeechRecognition.stopListening();
    setIsListening(false);
  }, []);

  // Stop listening AND process what was captured
  const stopListeningAndProcess = useCallback(() => {
    stopListening();
    const captured = transcript.trim();
    if (captured) {
      setTranscript('');
      resetTranscript();
      // Defer processCommand to next tick so state settles
      setTimeout(() => {
        processCommand(captured);
      }, 50);
    }
  }, [transcript, stopListening, resetTranscript]);

  // ============================================================
  // PROCESS COMMAND — uses new aiAgent.ask() API
  // ============================================================
  const processCommand = useCallback(async (command) => {
    if (!command || command.trim().length < 2) {
      setResponse("I didn't hear anything. Please try again.");
      return;
    }

    // Stop listening immediately
    stopListening();

    // Stop any ongoing speech BEFORE processing new command
    stopSpeaking();

    setIsProcessing(true);
    const cmd = command.toLowerCase().trim();
    const currentLang = language;

    // Add user message
    setChatHistory(prev => [...prev, { type: 'user', text: command, timestamp: new Date() }]);
    setResponse('');

    // ===== NAVIGATION COMMANDS =====
    const navCommands = {
      'games': ['games', 'game', 'play games', 'open games', 'go to games', 'खेल', 'गेम', 'খেল'],
      'dashboard': ['dashboard', 'home', 'main page', 'go home', 'डैशबोर्ड', 'হোম'],
      'doctor': ['doctor', 'doctor dashboard', 'medical', 'डॉक्टर'],
      'patients': ['patients', 'patient list', 'all patients', 'मरीज', 'রোগী'],
      'reminders': ['reminders', 'reminder', 'alerts', 'notifications', 'अनुस्मारक'],
      'analytics': ['analytics', 'stats', 'statistics', 'performance', 'विश्लेषण'],
      'profile': ['profile', 'my profile', 'account', 'प्रोफ़ाइल'],
      'settings': ['settings', 'preferences', 'options', 'सेटिंग्स']
    };

    // ===== GAME COMMANDS =====
    const gameCommands = {
      'memory': ['memory lane', 'memories', 'मेमोरी लेन'],
      'routine': ['routine builder', 'daily routine', 'रूटीन बिल्डर'],
      'pattern': ['pattern quest', 'patterns', 'पैटर्न क्वेस्ट'],
      'story': ['story weaver', 'stories', 'स्टोरी वीवर'],
      'face': ['face and place', 'place match', 'फेस एंड प्लेस'],
      'card': ['card flip', 'card game', 'कार्ड फ्लिप'],
      'mindful': ['mindful moments', 'meditation', 'माइंडफुल'],
      'gesture': ['gesture drawing', 'hand drawing', 'जेस्चर ड्रॉइंग']
    };

    // NAVIGATION
    for (const [key, triggers] of Object.entries(navCommands)) {
      if (triggers.some(t => cmd.includes(t))) {
        const responseText = AIResponseService.getResponse(`navigation.${key}`, currentLang);
        setResponse(responseText);
        setChatHistory(prev => [...prev, { type: 'bot', text: responseText, timestamp: new Date() }]);
        speak(responseText, currentLang);

        setTimeout(() => {
          const path = key === 'home' ? '' : key;
          navigate(`/${path}`);
          setIsProcessing(false);
        }, 500);
        return;
      }
    }

    // GAMES
    for (const [key, triggers] of Object.entries(gameCommands)) {
      if (triggers.some(t => cmd.includes(t))) {
        const responseText = AIResponseService.getResponse(`games.${key}`, currentLang);
        setResponse(responseText);
        setChatHistory(prev => [...prev, { type: 'bot', text: responseText, timestamp: new Date() }]);
        speak(responseText, currentLang);

        const gamePaths = {
          memory: '/game/1', routine: '/game/2', pattern: '/game/3',
          story: '/game/4', face: '/game/5', card: '/game/6',
          mindful: '/game/7', gesture: '/game/gesture-drawing'
        };
        setTimeout(() => {
          navigate(gamePaths[key] || '/games');
          setIsProcessing(false);
        }, 500);
        return;
      }
    }

    // HELP
    if (cmd.includes('help') || cmd.includes('मदद') || cmd.includes('সহায়')) {
      const responseText = AIResponseService.getResponse('actions.help', currentLang);
      setResponse(responseText);
      setChatHistory(prev => [...prev, { type: 'bot', text: responseText, timestamp: new Date() }]);
      speak(responseText, currentLang);
      setIsProcessing(false);
      return;
    }

    // REMINDERS - ADD
    if (cmd.includes('add reminder') || cmd.includes('new reminder') || cmd.includes('अनुस्मारक जोड़ें')) {
      const responseText = AIResponseService.getResponse('reminders.add', currentLang);
      setResponse(responseText);
      setChatHistory(prev => [...prev, { type: 'bot', text: responseText, timestamp: new Date() }]);
      speak(responseText, currentLang);
      setTimeout(() => {
        navigate('/reminders');
        setIsProcessing(false);
      }, 1000);
      return;
    }

    // REMINDERS - CHECK
    if (cmd.includes('check reminder') || cmd.includes('show reminder') || cmd.includes('अनुस्मारक देखें')) {
      const responseText = AIResponseService.getResponse('reminders.check', currentLang);
      setResponse(responseText);
      setChatHistory(prev => [...prev, { type: 'bot', text: responseText, timestamp: new Date() }]);
      speak(responseText, currentLang);
      setTimeout(() => {
        navigate('/reminders');
        setIsProcessing(false);
      }, 800);
      return;
    }

    // ============================================================
    // AI AGENT — New .ask() API (race-safe, language-aware)
    // ============================================================
    try {
      setResponse('🔍 Let me think...');

      // ⭐ NEW: single-call API — auto-detects language, handles races
      const result = await aiAgent.ask(command, currentLang);

      // ⭐ Skip if user asked a newer question while this one was processing
      if (result.stale) {
        console.log('⏭️ Discarding stale response');
        setIsProcessing(false);
        return;
      }

      const aiResponse = result.text;
      const responseLang = result.lang || currentLang;

      setResponse(aiResponse);
      setChatHistory(prev => [...prev, { type: 'bot', text: aiResponse, timestamp: new Date() }]);

      // Speak in the language Gemini actually responded in
      setTimeout(() => speak(aiResponse, responseLang), 100);

    } catch (error) {
      console.error('AI Agent error:', error);
      const fallback = "I'm having trouble finding that information right now. Please try asking something else.";
      setResponse(fallback);
      setChatHistory(prev => [...prev, { type: 'bot', text: fallback, timestamp: new Date() }]);
      speak(fallback, currentLang);
    }
    setIsProcessing(false);
  }, [navigate, language, speak, stopListening, stopSpeaking]);

  // ============================================================
  // HANDLE LISTENING TOGGLE
  // ============================================================
  const toggleListening = () => {
    if (isListening) {
      stopListeningAndProcess();
    } else {
      resetTranscript();
      setTranscript('');
      setResponse('');
      setIsListening(true);
      lastSpeechTimeRef.current = Date.now();

      const langMap = {
        'en': 'en-US', 'hi': 'hi-IN', 'as': 'as-IN', 'bn': 'bn-IN',
        'mr': 'mr-IN', 'gu': 'gu-IN', 'pa': 'pa-IN', 'or': 'or-IN',
        'te': 'te-IN', 'ta': 'ta-IN', 'kn': 'kn-IN'
      };

      // Continuous: true — we handle auto-stop via our 3s silence timer
      SpeechRecognition.startListening({ 
        continuous: true,
        interimResults: true,
        language: langMap[language] || 'en-US'
      });
    }
  };

  // ============================================================
  // TEXT INPUT SUBMIT
  // ============================================================
  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (textInput.trim()) {
      const command = textInput.trim();
      setTextInput('');
      processCommand(command);
    }
  };

  // Clear chat
  const clearChat = () => {
    setChatHistory([]);
    stopSpeaking();
  };

  // Toggle minimize
  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  // Switch input mode
  const switchMode = (mode) => {
    setInputMode(mode);
    if (mode === 'text' && isListening) {
      stopListening();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (synthRef.current) synthRef.current.cancel();
    };
  }, []);

  // Browser support check
  if (!browserSupportsSpeechRecognition) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-4 rounded-full bg-gray-500 text-white shadow-lg"
        >
          <MicOff className="w-6 h-6" />
        </button>
        {isOpen && (
          <div className="absolute bottom-16 right-0 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-4 border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500">Your browser doesn't support speech recognition. Please use Chrome, Edge, or Safari.</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-gradient-to-r from-primary-500 to-indigo-500 hover:shadow-xl text-white shadow-lg transition-all duration-200 hover:scale-110 group"
        aria-label="AI Assistant"
      >
        {isBotSpeaking ? (
          <div className="relative">
            <div className="absolute inset-0 rounded-full animate-ping bg-primary-400 opacity-75"></div>
            <Volume2 className="w-6 h-6 relative" />
          </div>
        ) : isListening ? (
          <div className="relative">
            <div className="absolute inset-0 rounded-full animate-pulse bg-green-400 opacity-75"></div>
            <Mic className="w-6 h-6 relative" />
          </div>
        ) : (
          <MessageCircle className="w-6 h-6 group-hover:rotate-12 transition-transform" />
        )}
        {isListening && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
        )}
      </button>

      {/* Assistant Modal */}
      {isOpen && (
        <div className={`fixed bottom-24 right-6 z-50 w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 transition-all duration-300 ${
          isMinimized ? 'h-16' : 'h-[560px] max-h-[85vh]'
        }`}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary-500 to-indigo-500 flex items-center justify-center text-white">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  AI Assistant
                  {isBotSpeaking && !isPaused && (
                    <span className="text-xs text-primary-500 animate-pulse">🔊</span>
                  )}
                  {isListening && (
                    <span className="text-xs text-green-500 animate-pulse">🎤</span>
                  )}
                  {isProcessing && (
                    <span className="text-xs text-yellow-500 animate-pulse">⏳</span>
                  )}
                  {isPaused && (
                    <span className="text-xs text-amber-500 animate-pulse">⏸️</span>
                  )}
                </h3>
                <p className="text-xs text-gray-500">
                  {inputMode === 'voice' 
                    ? (isListening ? 'Listening... (auto-stops on 3s silence)' : 'Click mic to speak')
                    : 'Type your question below'
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={toggleMinimize}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {isMinimized ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Language + Mode Indicator */}
              <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700/50 flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  🌐 {
                    { en: 'English', hi: 'हिन्दी', as: 'অসমীয়া', bn: 'বাংলা', mr: 'मराठी', gu: 'ગુજરાતી', pa: 'ਪੰਜਾਬੀ', or: 'ଓଡ଼ିଆ', te: 'తెలుగు', ta: 'தமிழ்', kn: 'ಕನ್ನಡ' }[language] || 'English'
                  }
                </span>

                <div className="flex items-center gap-1 bg-white dark:bg-gray-800 rounded-full p-0.5 border border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => switchMode('voice')}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1 ${
                      inputMode === 'voice' 
                        ? 'bg-primary-500 text-white shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    <Mic className="w-3 h-3" /> Voice
                  </button>
                  <button
                    onClick={() => switchMode('text')}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1 ${
                      inputMode === 'text' 
                        ? 'bg-primary-500 text-white shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    <Keyboard className="w-3 h-3" /> Type
                  </button>
                </div>
              </div>

              {/* Transcript / Text Input */}
              {inputMode === 'voice' ? (
                <div className="p-4 bg-gray-50 dark:bg-gray-700/30 min-h-[60px] border-b border-gray-200 dark:border-gray-700">
                  <p className="text-gray-700 dark:text-gray-300 text-sm italic">
                    {transcript || (isListening ? '👂 Listening...' : '🎤 Click the mic and speak')}
                  </p>
                </div>
              ) : (
                <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                  <form onSubmit={handleTextSubmit} className="flex items-center gap-2">
                    <input
                      ref={textInputRef}
                      type="text"
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder="Type your question here..."
                      className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all"
                    />
                    <button
                      type="submit"
                      disabled={!textInput.trim() || isProcessing}
                      className="p-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              )}

              {/* Response Display */}
              {response && (
                <div className="p-4 bg-primary-50 dark:bg-primary-900/20 border-b border-gray-200 dark:border-gray-700 max-h-[80px] overflow-y-auto">
                  <div className="flex items-start space-x-2">
                    <Bot className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-700 dark:text-gray-300">{response}</p>
                  </div>
                </div>
              )}

              {/* Chat History */}
              {showChat && chatHistory.length > 0 && (
                <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[180px]">
                  {chatHistory.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex items-start space-x-2 ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {msg.type === 'bot' && <Bot className="w-4 h-4 text-primary-500 mt-1 flex-shrink-0" />}
                      <div className={`p-3 rounded-xl max-w-[85%] ${
                        msg.type === 'user'
                          ? 'bg-primary-500 text-white rounded-br-none'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-bl-none'
                      }`}>
                        <p className="text-sm">{msg.text}</p>
                        <p className="text-[10px] opacity-60 mt-1">
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                      {msg.type === 'user' && <User className="w-4 h-4 text-primary-500 mt-1 flex-shrink-0" />}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}

              {/* Quick Actions */}
              <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex flex-wrap gap-2">
                  {['Open Games', 'Dashboard', 'Check Reminders', 'Help'].map((action) => (
                    <button
                      key={action}
                      onClick={() => {
                        if (inputMode === 'voice') setTranscript(action);
                        processCommand(action);
                      }}
                      className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors text-gray-700 dark:text-gray-300"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between p-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2">
                  {inputMode === 'voice' && (
                    <button
                      onClick={toggleListening}
                      className={`p-3 rounded-full transition-all ${
                        isListening 
                          ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
                          : 'bg-primary-500 hover:bg-primary-600 text-white hover:shadow-lg'
                      }`}
                      disabled={isProcessing}
                    >
                      {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </button>
                  )}

                  {isBotSpeaking && (
                    <button
                      onClick={togglePause}
                      className="p-3 rounded-full bg-amber-500 hover:bg-amber-600 text-white transition-colors"
                      title={isPaused ? 'Resume speaking' : 'Pause speaking'}
                    >
                      {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                    </button>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowChat(!showChat)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    title={showChat ? 'Hide chat history' : 'Show chat history'}
                  >
                    <History className="w-4 h-4 text-gray-500" />
                  </button>
                  {chatHistory.length > 0 && (
                    <button
                      onClick={clearChat}
                      className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                      title="Clear chat history"
                    >
                      <Trash2 className="w-4 h-4 text-gray-500 hover:text-red-500" />
                    </button>
                  )}
                </div>
              </div>

              {/* Status Bar */}
              <div className="px-4 py-1 bg-gray-50 dark:bg-gray-700/50 text-center text-[10px] text-gray-400 border-t border-gray-200 dark:border-gray-700">
                {isListening ? '🎤 Listening... (auto-stops after 3s of silence)' : 
                 isProcessing ? '⏳ Processing...' :
                 isBotSpeaking ? (isPaused ? '⏸️ Paused' : '🔊 Speaking...') :
                 inputMode === 'voice' ? '💡 Say "Help" or tap the mic' :
                 '⌨️ Type your question and press Enter'}
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default VoiceAssistant;