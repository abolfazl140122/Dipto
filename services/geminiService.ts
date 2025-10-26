import { GoogleGenAI, Chat, Content, Part, Modality, LiveSession, LiveServerMessage } from "@google/genai";
import { Author, type Message } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const messagesToHistory = (messages: Message[]): Content[] => {
  const history: Content[] = [];
  for (const msg of messages) {
    const parts: Part[] = [{ text: msg.text }];
    if (msg.image && msg.author === Author.USER) {
      parts.push({
        inlineData: {
          data: msg.image.base64,
          mimeType: msg.image.mimeType,
        }
      });
    }
    history.push({
      role: msg.author === Author.USER ? 'user' : 'model',
      parts: parts
    });
  }
  return history;
};


export function createChatSession(
  useGoogleSearch: boolean, 
  useThinkingMode: boolean,
  history: Message[] = []
): Chat {
  const modelName = useThinkingMode ? 'gemini-2.5-pro' : 'gemini-2.5-flash';

  const config: any = {
    systemInstruction: 'You are a friendly and helpful assistant. All your responses must be in Persian.',
  };

  if (useThinkingMode) {
    config.systemInstruction = 'You are an expert assistant capable of handling complex queries. Think step-by-step to provide the most accurate and detailed answer. All your responses must be in Persian.';
    config.thinkingConfig = { thinkingBudget: 32768 };
  }

  if (useGoogleSearch) {
    config.systemInstruction = useThinkingMode 
      ? 'You are an expert assistant capable of handling complex queries. Use your search tool to find the most up-to-date information. Think step-by-step. All your responses must be in Persian.'
      : 'You are a friendly and helpful assistant. Use your search tool to find the most up-to-date information when needed. All your responses must be in Persian.';
    config.tools = [{ googleSearch: {} }];
  }
  
  const chatHistory = messagesToHistory(history);

  return ai.chats.create({
    model: modelName,
    config,
    history: chatHistory,
  });
}

interface LiveSessionCallbacks {
    onMessage: (message: LiveServerMessage) => void;
    onError: (error: ErrorEvent) => void;
    onClose: (event: CloseEvent) => void;
}

export function startLiveSession(callbacks: LiveSessionCallbacks): Promise<LiveSession> {
    return ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
            onopen: () => console.log('Live session opened.'),
            onmessage: callbacks.onMessage,
            onerror: callbacks.onError,
            onclose: callbacks.onClose,
        },
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
            },
            inputAudioTranscription: {},
            outputAudioTranscription: {},
            systemInstruction: 'You are a highly advanced, articulate AI assistant named Gemini. Your goal is to provide an exceptionally natural and fluid conversational experience. Listen carefully, be thoughtful in your responses, and maintain a friendly, professional, and engaging tone. Speak clearly and eloquently in Persian. Avoid being overly robotic; aim for a human-like interaction.',
        },
    });
}