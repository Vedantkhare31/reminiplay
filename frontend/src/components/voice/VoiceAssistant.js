import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Mic, MicOff, X, Volume2, VolumeX, 
  MessageCircle, Send, Bot, Sparkles,
  ChevronUp, ChevronDown, History, Trash2,
  Play, Pause
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
  const messagesEndRef = useRef(null);
  const synthRef = useRef(null);
  const utteranceRef = useRef(null);

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

  // Update transcript when speech recognition updates
  useEffect(() => {
    if (speechTranscript) {
      setTranscript(speechTranscript);
    }
  }, [speechTranscript]);

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

  // Speak text using Web Speech API with Pause/Resume support
  const speak = useCallback((text, lang = 'en') => {
    if (!synthRef.current || !text) return;
    
    // If already speaking and not paused, queue the text
    if (synthRef.current.speaking && !isPaused) {
      setSpeechQueue(prev => [...prev, { text, lang }]);
      return;
    }
    
    // If paused, queue it
    if (isPaused) {
      setSpeechQueue(prev => [...prev, { text, lang }]);
      return;
    }
    
    // Cancel any ongoing speech
    synthRef.current.cancel();
    
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
      // Check queue for next item
      if (speechQueue.length > 0) {
        const next = speechQueue[0];
        setSpeechQueue(prev => prev.slice(1));
        speak(next.text, next.lang);
      }
    };
    
    utterance.onerror = (e) => {
      console.log('Speech error:', e);
      setIsBotSpeaking(false);
      setIsPaused(false);
      utteranceRef.current = null;
    };
    
    synthRef.current.speak(utterance);
  }, [isPaused, speechQueue]);

  // Toggle Pause/Resume
  const togglePause = useCallback(() => {
    if (!synthRef.current) return;
    
    if (isPaused) {
      // Resume
      synthRef.current.resume();
      setIsPaused(false);
      // If there are queued items, start speaking them
      if (speechQueue.length > 0 && !synthRef.current.speaking) {
        const next = speechQueue[0];
        setSpeechQueue(prev => prev.slice(1));
        speak(next.text, next.lang);
      }
    } else {
      // Pause
      if (synthRef.current.speaking) {
        synthRef.current.pause();
        setIsPaused(true);
      }
    }
  }, [isPaused, speechQueue, speak]);

  // Stop speaking
  const stopSpeaking = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsBotSpeaking(false);
      setIsPaused(false);
      utteranceRef.current = null;
      setSpeechQueue([]);
    }
  }, []);

  // Process voice command
  const processCommand = useCallback(async (command) => {
    if (!command || command.trim().length < 2) {
      setResponse('I didn\'t hear anything. Please try again.');
      return;
    }

    // Stop any ongoing speech
    stopSpeaking();

    setIsProcessing(true);
    const cmd = command.toLowerCase().trim();
    const currentLang = language;

    // Add user message to chat
    setChatHistory(prev => [...prev, { type: 'user', text: command, timestamp: new Date() }]);

    // Navigation Commands - EXACT matches only
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

    // Game Commands - EXACT matches only
    const gameCommands = {
      'memory': ['memory lane', 'memories', 'मेमोरी लेन'],
      'routine': ['routine builder', 'daily routine', 'रूटीन बिल्डर'],
      'pattern': ['pattern quest', 'patterns', 'पैटर्न क्वेस्ट'],
      'story': ['story weaver', 'stories', 'स्टोरी वीवर'],
      'face': ['face and place', 'place match', 'फेस एंड प्लेस'],
      'mindful': ['mindful moments', 'meditation', 'माइंडफुल'],
      'gesture': ['gesture drawing', 'hand drawing', 'जेस्चर ड्रॉइंग']
    };

    // Navigation - check if command matches any navigation intent
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

    // Games - check if command matches any game
    for (const [key, triggers] of Object.entries(gameCommands)) {
      if (triggers.some(t => cmd.includes(t))) {
        const responseText = AIResponseService.getResponse(`games.${key}`, currentLang);
        setResponse(responseText);
        setChatHistory(prev => [...prev, { type: 'bot', text: responseText, timestamp: new Date() }]);
        speak(responseText, currentLang);
        
        const gamePaths = {
          memory: '/game/1',
          routine: '/game/2',
          pattern: '/game/3',
          story: '/game/4',
          face: '/game/5',
          mindful: '/game/6',
          gesture: '/game/gesture-drawing'
        };
        setTimeout(() => {
          navigate(gamePaths[key] || '/games');
          setIsProcessing(false);
        }, 500);
        return;
      }
    }

    // Help command
    if (cmd.includes('help') || cmd.includes('मदद') || cmd.includes('সহায়')) {
      const responseText = AIResponseService.getResponse('actions.help', currentLang);
      setResponse(responseText);
      setChatHistory(prev => [...prev, { type: 'bot', text: responseText, timestamp: new Date() }]);
      speak(responseText, currentLang);
      setIsProcessing(false);
      return;
    }

    // Reminder commands
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
    // SMART AI AGENT - Uses context-aware knowledge base
    // ============================================================
    try {
      // First try local knowledge base with smart categorization
      const quickAnswer = aiAgent.quickAnswer(command);
      if (quickAnswer) {
        const responseText = quickAnswer.answer;
        setResponse(responseText);
        setChatHistory(prev => [...prev, { type: 'bot', text: responseText, timestamp: new Date() }]);
        speak(responseText, currentLang);
        setIsProcessing(false);
        return;
      }
      
      // If not found locally, search Wikipedia with smart context
      setResponse('🔍 Let me search for that...');
      const aiResponse = await aiAgent.answerQuestion(command, currentLang);
      setResponse(aiResponse);
      setChatHistory(prev => [...prev, { type: 'bot', text: aiResponse, timestamp: new Date() }]);
      speak(aiResponse, currentLang);
    } catch (error) {
      console.error('AI Agent error:', error);
      const fallback = "I'm having trouble finding that information right now. Please try asking something else or check your internet connection.";
      setResponse(fallback);
      setChatHistory(prev => [...prev, { type: 'bot', text: fallback, timestamp: new Date() }]);
      speak(fallback, currentLang);
    }
    setIsProcessing(false);
  }, [navigate, language, speak, stopSpeaking]);

  // Handle listening toggle
  const toggleListening = () => {
    if (isListening) {
      SpeechRecognition.stopListening();
      setIsListening(false);
      if (transcript.trim()) {
        processCommand(transcript);
      }
    } else {
      resetTranscript();
      setTranscript('');
      setResponse('');
      setIsListening(true);
      
      const langMap = {
        'en': 'en-US',
        'hi': 'hi-IN',
        'as': 'as-IN',
        'bn': 'bn-IN',
        'mr': 'mr-IN',
        'gu': 'gu-IN',
        'pa': 'pa-IN',
        'or': 'or-IN',
        'te': 'te-IN',
        'ta': 'ta-IN',
        'kn': 'kn-IN'
      };
      
      SpeechRecognition.startListening({ 
        continuous: true,
        language: langMap[language] || 'en-US'
      });
    }
  };

  // Clear chat history
  const clearChat = () => {
    setChatHistory([]);
    stopSpeaking();
  };

  // Toggle minimize
  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  // If browser doesn't support speech recognition
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
        aria-label="Voice Assistant"
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

      {/* Voice Assistant Modal */}
      {isOpen && (
        <div className={`fixed bottom-24 right-6 z-50 w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 transition-all duration-300 ${
          isMinimized ? 'h-16' : 'h-[500px] max-h-[80vh]'
        }`}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary-500 to-indigo-500 flex items-center justify-center text-white">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  AI Assistant
                  {isBotSpeaking && (
                    <span className="ml-2 text-xs text-primary-500 animate-pulse">🔊 Speaking...</span>
                  )}
                  {isListening && (
                    <span className="ml-2 text-xs text-green-500 animate-pulse">🎤 Listening...</span>
                  )}
                  {isProcessing && (
                    <span className="ml-2 text-xs text-yellow-500 animate-pulse">⏳ Thinking...</span>
                  )}
                  {isPaused && (
                    <span className="ml-2 text-xs text-amber-500 animate-pulse">⏸️ Paused</span>
                  )}
                </h3>
                <p className="text-xs text-gray-500">
                  {isListening ? 'Listening... Speak now!' : 'Click mic to speak'}
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
              {/* Language Indicator */}
              <div className="px-4 py-1 bg-gray-50 dark:bg-gray-700/50 text-center">
                <span className="text-xs text-gray-500">
                  🌐 Language: {
                    { en: 'English', hi: 'हिन्दी', as: 'অসমীয়া', bn: 'বাংলা', mr: 'मराठी', gu: 'ગુજરાતી', pa: 'ਪੰਜਾਬੀ', or: 'ଓଡ଼ିଆ', te: 'తెలుగు', ta: 'தமிழ்', kn: 'ಕನ್ನಡ' }[language] || 'English'
                  }
                </span>
              </div>

              {/* Transcript Display */}
              <div className="p-4 bg-gray-50 dark:bg-gray-700/30 min-h-[50px] border-b border-gray-200 dark:border-gray-700">
                <p className="text-gray-700 dark:text-gray-300 text-sm italic">
                  {transcript || (isListening ? '👂 Listening...' : '🎤 Click the mic and speak')}
                </p>
              </div>

              {/* Response Display */}
              {response && (
                <div className="p-4 bg-primary-50 dark:bg-primary-900/20 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-start space-x-2">
                    <Bot className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-700 dark:text-gray-300">{response}</p>
                  </div>
                </div>
              )}

              {/* Chat History */}
              {showChat && chatHistory.length > 0 && (
                <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[200px]">
                  {chatHistory.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex items-start space-x-2 ${
                        msg.type === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {msg.type === 'bot' && <Bot className="w-4 h-4 text-primary-500 mt-1 flex-shrink-0" />}
                      <div
                        className={`p-3 rounded-xl max-w-[85%] ${
                          msg.type === 'user'
                            ? 'bg-primary-500 text-white rounded-br-none'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-bl-none'
                        }`}
                      >
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

              {/* Quick Action Buttons */}
              <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex flex-wrap gap-2">
                  {['Open Games', 'Dashboard', 'Check Reminders', 'Help'].map((action) => (
                    <button
                      key={action}
                      onClick={() => {
                        setTranscript(action);
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
                  <button
                    onClick={() => {
                      if (transcript.trim()) {
                        processCommand(transcript);
                      }
                    }}
                    className="p-3 rounded-full bg-green-500 hover:bg-green-600 text-white transition-colors"
                    disabled={!transcript.trim() || isProcessing}
                  >
                    <Send className="w-5 h-5" />
                  </button>
                  
                  {/* Pause/Resume Button */}
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
                {isListening ? '🎤 Listening... Say something' : 
                 isProcessing ? '⏳ Processing...' :
                 isBotSpeaking ? isPaused ? '⏸️ Paused' : '🔊 Speaking...' :
                 '💡 Say "Help" for commands or ask me anything!'}
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default VoiceAssistant;