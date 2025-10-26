import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { Chat, LiveSession, LiveServerMessage } from '@google/genai';
import { createChatSession, startLiveSession } from './services/geminiService';
import { Author, type Message, type MessageImage } from './types';
import ChatHistory from './components/ChatHistory';
import ChatInput from './components/ChatInput';
import SearchToggle from './components/SearchToggle';
import NewChatIcon from './components/icons/NewChatIcon';
import ThinkingToggle from './components/icons/ThinkingToggle';
import VoiceTranscriptOverlay from './components/VoiceTranscriptOverlay';
import { decode, decodeAudioData, createBlob } from './utils/AudioUtils';
import WelcomeScreen from './components/WelcomeScreen';
import GeminiLogo from './components/icons/GeminiLogo';


const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = error => reject(error);
  });

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearchEnabled, setIsSearchEnabled] = useState(false);
  const [isThinkingModeEnabled, setIsThinkingModeEnabled] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const chatRef = useRef<Chat | null>(null);
  const stopGenerationRef = useRef(false);

  // Voice session state
  const [isVoiceModeActive, setIsVoiceModeActive] = useState(false);
  const [currentUserTranscript, setCurrentUserTranscript] = useState('');
  const [currentBotTranscript, setCurrentBotTranscript] = useState('');
  const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const fullTranscriptHistoryRef = useRef<string[]>([]);

  useEffect(() => {
    try {
      chatRef.current = createChatSession(isSearchEnabled, isThinkingModeEnabled, messages);
    } catch (e: any) {
      setMessages(prev => [...prev, { author: Author.BOT, text: `خطا در مقداردهی اولیه: ${e.message}`, isError: true }]);
    }
  }, [isSearchEnabled, isThinkingModeEnabled, messages]);

  const handleToggleSearch = useCallback(() => {
    setIsSearchEnabled(prev => !prev);
  }, []);

  const handleToggleThinkingMode = useCallback(() => {
    setIsThinkingModeEnabled(prev => !prev);
  }, []);

  const handleNewChat = useCallback(() => {
    setMessages([]);
    setImageFile(null);
  }, []);
  
  const handleStopGeneration = useCallback(() => {
    stopGenerationRef.current = true;
  }, []);

  const handleSendMessage = useCallback(async (text: string) => {
    if (!chatRef.current) {
        setMessages(prev => [...prev, { author: Author.BOT, text: "جلسه چت مقداردهی اولیه نشده است.", isError: true }]);
        return;
    }

    setIsLoading(true);
    stopGenerationRef.current = false;
    
    const userMessage: Message = { author: Author.USER, text };
    const parts: any[] = [{ text }];

    if (imageFile) {
      try {
        const base64data = await fileToBase64(imageFile);
        const imageUrl = URL.createObjectURL(imageFile);
        
        const imageForMessage: MessageImage = {
          url: imageUrl,
          base64: base64data,
          mimeType: imageFile.type,
        };
        userMessage.image = imageForMessage;
  
        parts.push({
          inlineData: { data: base64data, mimeType: imageFile.type },
        });

      } catch (e: any) {
          setMessages(prev => [...prev, { author: Author.BOT, text: `خطا در پردازش تصویر: ${e.message}`, isError: true }]);
          setIsLoading(false);
          return;
      }
    }

    setMessages(prev => [...prev, userMessage]);
    setImageFile(null);

    try {
      const stream = await chatRef.current.sendMessageStream({ message: parts });
      
      let botMessage: Message = { author: Author.BOT, text: "", sources: [] };
      setMessages(prev => [...prev, botMessage]);

      for await (const chunk of stream) {
          if (stopGenerationRef.current) {
            botMessage.text += '\n\n(توسط کاربر متوقف شد)';
            setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = { ...botMessage };
                return newMessages;
            });
            break;
          }
          botMessage.text += chunk.text;

          if (isSearchEnabled) {
            const groundingMetadata = chunk.candidates?.[0]?.groundingMetadata;
            if (groundingMetadata?.groundingChunks) {
                const allSources = new Map<string, { uri: string; title: string }>();
                groundingMetadata.groundingChunks.forEach(source => {
                  if (source.web && source.web.uri) {
                     allSources.set(source.web.uri, {
                         uri: source.web.uri,
                         title: source.web.title || source.web.uri,
                     });
                  }
                });
                botMessage.sources = Array.from(allSources.values());
            }
          }

          setMessages(prev => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1] = { ...botMessage };
            return newMessages;
          });
      }
    } catch (e: any) {
      const errorMessage = `خطایی رخ داد: ${e.message}`;
      setMessages(prev => {
          const lastMessage = prev[prev.length - 1];
          // Replace the empty bot message with the error message
          if(lastMessage.author === Author.BOT && lastMessage.text === "") {
              const messagesWithoutLast = prev.slice(0, -1);
              return [...messagesWithoutLast, {author: Author.BOT, text: errorMessage, isError: true}];
          }
          return [...prev, { author: Author.BOT, text: errorMessage, isError: true }];
      });
    } finally {
      setIsLoading(false);
      stopGenerationRef.current = false;
    }
  }, [isSearchEnabled, imageFile, chatRef]);

  // Voice Session Logic
  const handleVoiceMessage = useCallback(async (message: LiveServerMessage) => {
    if (message.serverContent?.inputTranscription) {
      setCurrentUserTranscript(prev => prev + message.serverContent.inputTranscription.text);
    }
    if (message.serverContent?.outputTranscription) {
      setCurrentBotTranscript(prev => prev + message.serverContent.outputTranscription.text);
    }
    
    if (message.serverContent?.turnComplete) {
      const finalUserTranscript = currentUserTranscript + (message.serverContent?.inputTranscription?.text || '');
      const finalBotTranscript = currentBotTranscript + (message.serverContent?.outputTranscription?.text || '');

      if (finalUserTranscript.trim()) {
        fullTranscriptHistoryRef.current.push(`**شما:** ${finalUserTranscript}`);
      }
      if (finalBotTranscript.trim()) {
        fullTranscriptHistoryRef.current.push(`**ربات:** ${finalBotTranscript}`);
      }
      setCurrentUserTranscript('');
      setCurrentBotTranscript('');
    }

    const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
    if (base64Audio && outputAudioContextRef.current) {
        const outputCtx = outputAudioContextRef.current;
        nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
        const audioBuffer = await decodeAudioData(decode(base64Audio), outputCtx, 24000, 1);
        const source = outputCtx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(outputCtx.destination);
        source.addEventListener('ended', () => {
            audioSourcesRef.current.delete(source);
        });
        source.start(nextStartTimeRef.current);
        nextStartTimeRef.current += audioBuffer.duration;
        audioSourcesRef.current.add(source);
    }
  }, [currentUserTranscript, currentBotTranscript]);

  const stopVoiceSession = useCallback(() => {
    if (!isVoiceModeActive) return;

    sessionPromiseRef.current?.then(session => session.close());
    sessionPromiseRef.current = null;

    mediaStreamRef.current?.getTracks().forEach(track => track.stop());
    mediaStreamRef.current = null;
    
    scriptProcessorRef.current?.disconnect();
    scriptProcessorRef.current = null;
    inputAudioContextRef.current?.close();
    inputAudioContextRef.current = null;
    
    audioSourcesRef.current.forEach(source => source.stop());
    audioSourcesRef.current.clear();
    outputAudioContextRef.current?.close();
    outputAudioContextRef.current = null;

    setIsVoiceModeActive(false);

    if (fullTranscriptHistoryRef.current.length > 0) {
      const finalTranscript = fullTranscriptHistoryRef.current.join('\n\n');
      const transcriptMessage: Message = {
        author: Author.BOT,
        text: `### خلاصه مکالمه صوتی\n\n${finalTranscript}`
      };
      setMessages(prev => [...prev, transcriptMessage]);
    }
    
    setCurrentUserTranscript('');
    setCurrentBotTranscript('');
  }, [isVoiceModeActive]);

  const startVoiceSession = useCallback(async () => {
    setIsVoiceModeActive(true);
    fullTranscriptHistoryRef.current = [];

    outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    nextStartTimeRef.current = 0;
    audioSourcesRef.current.clear();
    
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;
        
        inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        const source = inputAudioContextRef.current.createMediaStreamSource(stream);
        scriptProcessorRef.current = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
        
        scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
            const pcmBlob = createBlob(inputData);
            sessionPromiseRef.current?.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
            });
        };
        
        source.connect(scriptProcessorRef.current);
        scriptProcessorRef.current.connect(inputAudioContextRef.current.destination);

        sessionPromiseRef.current = startLiveSession({
            onMessage: handleVoiceMessage,
            onError: (e) => {
                console.error('Live session error:', e);
                setMessages(prev => [...prev, { author: Author.BOT, text: 'خطا در مکالمه صوتی.', isError: true }]);
                stopVoiceSession();
            },
            onClose: () => {
                console.log('Live session closed.');
                stopVoiceSession();
            }
        });

    } catch (err) {
        console.error("Error starting voice session:", err);
        setMessages(prev => [...prev, { author: Author.BOT, text: "دسترسی به میکروفون امکان‌پذیر نیست.", isError: true }]);
        setIsVoiceModeActive(false);
    }
  }, [handleVoiceMessage, stopVoiceSession]);


  const handleToggleVoiceMode = useCallback(() => {
    if (isVoiceModeActive) {
      stopVoiceSession();
    } else {
      startVoiceSession();
    }
  }, [isVoiceModeActive, startVoiceSession, stopVoiceSession]);


  return (
    <div className="bg-gray-900 text-white h-screen flex flex-col font-sans">
      <header className="bg-gray-800 p-4 flex items-center justify-between shadow-lg flex-shrink-0 border-b border-gray-700">
        <div className="flex items-center gap-3">
            <GeminiLogo />
            <h1 className="text-xl font-bold">چت بات هوشمند Gemini</h1>
        </div>
        <div className="flex items-center gap-4">
          <ThinkingToggle isEnabled={isThinkingModeEnabled} onToggle={handleToggleThinkingMode} />
          <SearchToggle isEnabled={isSearchEnabled} onToggle={handleToggleSearch} />
          <button onClick={handleNewChat} title="گفتگوی جدید" className="text-gray-400 hover:text-white transition-colors">
            <NewChatIcon />
          </button>
        </div>
      </header>
      
      {isVoiceModeActive && (
          <VoiceTranscriptOverlay
            userTranscript={currentUserTranscript}
            botTranscript={currentBotTranscript}
            onStop={stopVoiceSession}
          />
      )}

      <main className="flex-grow overflow-y-auto flex flex-col">
        {messages.length === 0 ? (
          <WelcomeScreen onSuggestionClick={handleSendMessage} />
        ) : (
          <ChatHistory messages={messages} isLoading={isLoading} isThinking={isThinkingModeEnabled && isLoading} />
        )}
      </main>

      <ChatInput 
        onSendMessage={handleSendMessage} 
        isLoading={isLoading || isVoiceModeActive} 
        onStopGeneration={handleStopGeneration}
        image={imageFile} 
        onImageChange={setImageFile}
        isVoiceModeActive={isVoiceModeActive}
        onToggleVoiceMode={handleToggleVoiceMode}
      />
    </div>
  );
};

export default App;